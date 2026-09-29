//! board-twin — virtual board & live data broker.
//!
//!   TCP  :7391  simlink server — the FreeRTOS-PC simulator connects here
//!   HTTP :7392  serves the board UI (static/index.html)
//!   WS   :7392  JSON pub/sub API for web apps (same port, Upgrade header)
//!
//! Model: shared device namespace ("led/0" → 1), last-write-wins; every
//! write broadcasts to all peers. EVT lines are edge events (button
//! press/release) — forwarded to sims, echoed to web clients, not stored.

use serde_json::{json, Value};
use std::collections::BTreeMap;
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tungstenite::{accept, Message, WebSocket};
use tungstenite::protocol::Role;

const SIM_PORT: u16 = 7391; // simlink (PROTOCOL.md)
const WEB_PORT: u16 = 7392; // HTTP UI + WS/JSON API

const INDEX_HTML: &str = include_str!("../static/index.html");

/// Default ports; callers may override (Tauri shell passes its own config).
pub const DEFAULT_SIM_PORT: u16 = 7391;
pub const DEFAULT_WEB_PORT: u16 = 7392;

#[derive(Default)]
struct Broker {
    board: Option<Value>,            // last BOARD descriptor from the sim
    state: BTreeMap<String, Value>,  // "led/0" -> 1, "adc/1" -> 2048
    sims: Vec<Sender<String>>,       // outbound simlink lines
    webs: Vec<Sender<String>>,       // outbound ws json text
}

impl Broker {
    fn to_sims(&mut self, line: &str) {
        self.sims.retain(|tx| tx.send(line.to_string()).is_ok());
    }
    fn to_webs(&mut self, msg: &Value) {
        let s = msg.to_string();
        self.webs.retain(|tx| tx.send(s.clone()).is_ok());
    }
}

/// Blocking entry point: starts the simlink server (:7391) and the
/// HTTP+WS tier (:7392), then serves connections forever.
pub fn run() {
    let broker = Arc::new(Mutex::new(Broker::default()));

    {
        let broker = broker.clone();
        thread::spawn(move || {
            let listener = TcpListener::bind(("0.0.0.0", SIM_PORT)).unwrap();
            eprintln!("[simlink] listening on :{SIM_PORT}");
            for s in listener.incoming().flatten() {
                let b = broker.clone();
                thread::spawn(move || handle_sim(s, b));
            }
        });
    }

    let listener = TcpListener::bind(("0.0.0.0", WEB_PORT)).unwrap();
    eprintln!("[web] board UI + ws api on http://127.0.0.1:{WEB_PORT}");
    for s in listener.incoming().flatten() {
        let b = broker.clone();
        thread::spawn(move || handle_web(s, b));
    }
}

/* ================= simlink side ===================================== */

fn handle_sim(stream: TcpStream, broker: Arc<Mutex<Broker>>) {
    let peer = stream.peer_addr().map(|a| a.to_string()).unwrap_or_default();
    eprintln!("[simlink] sim connected: {peer}");

    let (tx, rx) = channel::<String>();
    broker.lock().unwrap().sims.push(tx);
    if let Ok(mut w) = stream.try_clone() {
        thread::spawn(move || {
            for line in rx {
                if w.write_all(line.as_bytes()).is_err()
                    || w.write_all(b"\n").is_err()
                {
                    break;
                }
            }
        });
    }

    let mut rd = BufReader::new(stream);
    let mut line = String::new();
    loop {
        line.clear();
        match rd.read_line(&mut line) {
            Ok(0) | Err(_) => break,
            Ok(_) => {}
        }
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        eprintln!("[sim->] {line}");

        if let Some(js) = line.strip_prefix("BOARD ") {
            if let Ok(v) = serde_json::from_str::<Value>(js) {
                let mut b = broker.lock().unwrap();
                b.board = Some(v.clone());
                b.to_webs(&json!({"kind": "board", "board": v}));
            }
        } else if let Some(rest) = line.strip_prefix("SET ") {
            let p: Vec<&str> = rest.split_whitespace().collect();
            if p.len() >= 3 {
                let (dev, id, val) = (p[0], p[1], p[2]);
                let v: Value = val.parse::<i64>().map(Value::from)
                                    .unwrap_or_else(|_| json!(val));
                let mut b = broker.lock().unwrap();
                b.state.insert(format!("{dev}/{id}"), v.clone());
                b.to_webs(&json!({"kind": "set", "dev": dev,
                                  "id": id.parse::<u32>().unwrap_or(0),
                                  "value": v}));
            }
        } else if let Some(rest) = line.strip_prefix("UART ") {
            let text = rest.splitn(2, ' ').nth(1).unwrap_or("");
            broker.lock().unwrap().to_webs(&json!({"kind": "uart", "dir": "rx", "text": text}));
        } else if let Some(js) = line.strip_prefix("STATS ") {
            if let Ok(v) = serde_json::from_str::<Value>(js) {
                broker.lock().unwrap().to_webs(&json!({"kind": "stats", "stats": v}));
            }
        }
        // HELLO and unknown verbs: logged above, no action.
    }
    {
        // tell webs the sim is gone so the UI returns to standby
        let mut b = broker.lock().unwrap();
        b.board = None;
        b.state.clear();
        b.to_webs(&json!({"kind": "stats", "stats": null}));
        b.to_webs(&json!({"kind": "board", "board": null}));
    }
    eprintln!("[simlink] sim disconnected: {peer}");
}

/* ================= web side ========================================= */

fn handle_web(stream: TcpStream, broker: Arc<Mutex<Broker>>) {
    // Peek (non-consuming) at the request headers: WS upgrade or GET?
    let _ = stream.set_read_timeout(Some(Duration::from_secs(5)));
    let mut head = Vec::new();
    let mut buf = [0u8; 2048];
    for _ in 0..40 {
        match stream.peek(&mut buf) {
            Ok(0) => return,
            Ok(n) => {
                head.extend_from_slice(&buf[..n]);
                if head.windows(4).any(|w| w == b"\r\n\r\n") || head.len() > 4096 {
                    break;
                }
            }
            Err(_) => break,
        }
    }
    let is_ws = String::from_utf8_lossy(&head).to_lowercase()
        .contains("upgrade: websocket");

    if is_ws {
        ws_session(stream, broker);
    } else {
        serve_http(stream);
    }
}

fn serve_http(mut stream: TcpStream) {
    // drain request (headers at least)
    let mut rd = BufReader::new(match stream.try_clone() { Ok(s) => s, Err(_) => return });
    let mut line = String::new();
    loop {
        line.clear();
        match rd.read_line(&mut line) {
            Ok(0) | Err(_) => return,
            Ok(_) if line == "\r\n" || line == "\n" => break,
            Ok(_) => {}
        }
        if line.capacity() > 8192 { return; }
    }
    let body = INDEX_HTML.as_bytes();
    let _ = write!(stream, "HTTP/1.1 200 OK\r\nContent-Type: text/html; \
                           charset=utf-8\r\nContent-Length: {}\r\n\
                           Connection: close\r\n\r\n", body.len());
    let _ = stream.write_all(body);
}

fn ws_session(stream: TcpStream, broker: Arc<Mutex<Broker>>) {
    let _ = stream.set_read_timeout(None);
    let mut ws = match accept(stream) {
        Ok(w) => w,
        Err(e) => { eprintln!("[ws] handshake failed: {e}"); return; }
    };
    eprintln!("[ws] client connected");

    // snapshot: hello + board + full state
    let hello = {
        let b = broker.lock().unwrap();
        json!({"kind": "hello", "version": "1",
               "board": b.board, "state": b.state})
    };
    // send() = write + flush — a bare write() can leave the frame buffered.
    if ws.send(Message::Text(hello.to_string().into())).is_err() { return; }

    // outbound channel -> cloned socket wrapped as a ws writer
    let (tx, rx) = channel::<String>();
    broker.lock().unwrap().webs.push(tx);
    if let Ok(sock2) = ws.get_ref().try_clone() {
        thread::spawn(move || {
            let mut w: WebSocket<TcpStream> =
                WebSocket::from_raw_socket(sock2, Role::Server, None);
            for msg in rx {
                if w.write(Message::Text(msg.into())).is_err()
                    || w.flush().is_err()
                {
                    break;
                }
            }
        });
    }

    // inbound json from web clients
    loop {
        match ws.read() {
            Ok(Message::Text(t)) => handle_ws_msg(t.as_str(), &broker),
            Ok(Message::Close(_)) | Err(_) => break,
            _ => {}
        }
    }
    eprintln!("[ws] client disconnected");
}

fn handle_ws_msg(text: &str, broker: &Arc<Mutex<Broker>>) {
    let m: Value = match serde_json::from_str(text) { Ok(v) => v, Err(_) => return };
    let kind = m["kind"].as_str().unwrap_or("");

    match kind {
        "set" => {
            let dev = m["dev"].as_str().unwrap_or("");
            let id = m["id"].as_u64().unwrap_or(0);
            let val = m["value"].clone();
            let mut b = broker.lock().unwrap();
            b.state.insert(format!("{dev}/{id}"), val.clone());
            b.to_sims(&format!("SET {dev} {id} {val}"));
            b.to_webs(&json!({"kind": "set", "dev": dev, "id": id, "value": val}));
        }
        "evt" => {
            let dev = m["dev"].as_str().unwrap_or("");
            let id = m["id"].as_u64().unwrap_or(0);
            let name = m["name"].as_str().unwrap_or("");
            let mut b = broker.lock().unwrap();
            b.to_sims(&format!("EVT {dev} {id} {name}"));
            b.to_webs(&json!({"kind": "evt", "dev": dev, "id": id, "name": name}));
        }
        "rst" => {
            let mut b = broker.lock().unwrap();
            b.to_sims("RST");
            b.to_webs(&json!({"kind": "rst"}));
        }
        "uart" => {    // panel → sim serial text
            let text = m["text"].as_str().unwrap_or("");
            let port = m["port"].as_u64().unwrap_or(0);
            let mut b = broker.lock().unwrap();
            b.to_sims(&format!("UART {port} {text}"));
            b.to_webs(&json!({"kind": "uart", "dir": "tx", "port": port, "text": text}));
        }
        _ => {}
    }
}
