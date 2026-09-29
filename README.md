# board-twin

Virtual embedded board + live data broker for the FreeRTOS-PC simulator.

> **For full setup instructions**, see the project root **[README.md](../../README.md)** —
> includes prerequisites, first-time setup, and how to run board-twin together with freertos-pc.

## Architecture

```
board-twin/
├── broker/          Rust lib + headless binary
│                    :7391 simlink TCP server (simulator connects here)
│                    :7392 HTTP (fallback UI) + WS/JSON pub/sub API
├── src/             React + TypeScript UI
│                    Tailwind v4, lucide-react, GSAP, dnd-kit, chroma
│                    (3D later: three.js / @react-three/fiber)
└── src-tauri/       Tauri 2 shell — embeds broker, native window
```

## Run

**Headless broker** (CI, SSH, minimal):
```bash
cargo run -p boardtwin-broker        # serves UI at http://127.0.0.1:7392
```

**Frontend only** (UI dev loop, hot reload — needs broker running):
```bash
npm run dev                          # http://localhost:7393
```

**Desktop app** (native window, broker embedded):
```bash
npm run tauri dev                    # dev mode
npm run tauri build                  # produces installer
```

Then run a sim: `cd freertos-pc && ./run 90` — LEDs blink on the board,
pressing **B0** fires a button event into the simulator.

## Web API (WS/JSON on :7392)

Client → broker:

```json
{"kind":"set","dev":"led","id":3,"value":1}
{"kind":"evt","dev":"btn","id":0,"name":"press"}
{"kind":"rst"}
```

Broker → client:

```json
{"kind":"hello","version":"1","board":{...},"state":{...}}   (on connect)
{"kind":"board","board":{...}}                              (sim announced layout)
{"kind":"set","dev":"led","id":0,"value":1}
{"kind":"evt","dev":"btn","id":0,"name":"press"}
{"kind":"uart","text":"..."}
{"kind":"rst"}
```

Shared namespace, last-write-wins, broadcast to all peers. The React UI
(`src/lib/board.ts`) uses exactly this API — same as external web apps.

Sim-side protocol spec: `../simlink/PROTOCOL.md`.

## Roadmap

- Tauri installer packaging (icons, bundle targets)
- 3D board rendering via R3F, driven by the BOARD descriptor
- `board-twin-client` TypeScript SDK published for the web-app tier
