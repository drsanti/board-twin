import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { board, type BoardDescriptor, type SerialLine, type SimStats } from "../lib/board";
import { Led } from "./peripherals/Led";
import { PushButton } from "./peripherals/PushButton";
import { AdcKnob } from "./peripherals/AdcKnob";
import { SlideSwitch } from "./peripherals/SlideSwitch";
import { SerialTerm } from "./peripherals/SerialTerm";
import { MicMeter } from "./peripherals/MicMeter";
import { Speaker } from "./peripherals/Speaker";
import { Seg7 } from "./peripherals/Seg7";
import { PwmBar } from "./peripherals/PwmBar";
import { GenericDeviceTile } from "./peripherals/GenericDeviceTile";
import { SimPanel } from "./SimPanel";

/** device prefixes that get a dedicated peripheral — anything else lands in EXT */
const KNOWN_KEY = /^(led|btn|adc|sw|mic|spk|seg7|pwm|rgb)\/\d+$/;

/** persisted card order */
const LAYOUT_KEY = "boardtwin:layout";

/**
 * The standard virtual board — rendered even before a simulator attaches
 * (dimmed + disabled), so the bench never looks empty. A sim's BOARD
 * descriptor may override it.
 */
const DEFAULT_BOARD: BoardDescriptor = {
  leds: [0, 1, 2, 3],
  buttons: [0, 1, 2, 3],
  adcs: [0, 1, 2, 3],
  mic: [0],
  speaker: [0],
  seg7: [0, 1, 2, 3],
  pwm: [0, 1, 2, 3],
  rgb: [0, 1, 2, 3],
  uart: true,
};

const num = (v: number | string | undefined): number => Number(v ?? 0);

export interface BoardViewProps {
  descriptor: BoardDescriptor | null;
  state: Record<string, number | string>;
  connected: boolean;
  serial: SerialLine[];
  stats: SimStats | null;
}

/** merge a stored order with the ids actually present: keep known, append new */
function reconcile(saved: string[], ids: string[]): string[] {
  const keep = saved.filter((id) => ids.includes(id));
  const extra = ids.filter((id) => !keep.includes(id));
  return [...keep, ...extra];
}

function loadOrder(): string[] {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    }
  } catch {
    /* ignore */
  }
  return [];
}

declare global {
  interface Window {
    btLayout?: { reset: () => void };
  }
}

interface DragCtx {
  id: string;
  /** grab point inside the card (card-local coords) */
  gx: number;
  gy: number;
  /** last pointer position (client coords) */
  px: number;
  py: number;
}

/**
 * The 2D instrument dashboard. Peripherals are pure controlled components
 * and the descriptor drives which panels mount — this component is the seam
 * where a future 3D board view can be swapped in.
 *
 * Cards are reorderable: drag by the panel header; siblings FLIP-animate to
 * make room; the order persists in localStorage (console: btLayout.reset()).
 */
export function BoardView({ descriptor, state, connected, serial, stats }: BoardViewProps) {
  const powered = connected && descriptor != null;
  const rootEl = useRef<HTMLDivElement>(null);
  const cardEls = useRef(new Map<string, HTMLElement>());
  const drag = useRef<DragCtx | null>(null);
  const flipFrom = useRef<Map<string, { x: number; y: number }> | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>(() => loadOrder());

  // panel stagger when a simulator attaches
  useEffect(() => {
    const el = rootEl.current;
    if (!powered || !el) return;
    const panels = el.querySelectorAll("[data-panel]");
    const tl = gsap.timeline();
    tl.fromTo(
      panels,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" },
    );
    return () => {
      tl.kill();
      gsap.set(panels, { clearProps: "opacity,transform" });
    };
  }, [powered]);

  const effective = descriptor ?? DEFAULT_BOARD;
  const leds = effective.leds ?? [];
  const buttons = effective.buttons ?? [];
  const switches = effective.switches ?? [];
  const adcs = effective.adcs ?? [];
  const mics = effective.mic ?? [];
  const speakers = effective.speaker ?? [];
  const seg7s = effective.seg7 ?? [];
  const pwms = effective.pwm ?? [];
  const rgbs = effective.rgb ?? [];
  const showUart = effective.uart === true;
  const extras = Object.keys(state).filter((k) => !KNOWN_KEY.test(k)).sort();

  /* ---- card registry ---------------------------------------------------- */

  const cards: { id: string; node: ReactNode }[] = [];

  if (leds.length > 0)
    cards.push({
      id: "leds",
      node: (
        <div className="flex flex-1 flex-wrap content-center justify-evenly gap-6">
          {leds.map((id) => (
            <Led key={id} id={id} on={num(state[`led/${id}`]) !== 0} />
          ))}
        </div>
      ),
    });

  if (rgbs.length > 0)
    cards.push({
      id: "rgb",
      node: (
        <div className="flex flex-1 flex-wrap content-center justify-evenly gap-6">
          {rgbs.map((id) => {
            const rgb = num(state[`rgb/${id}`]);
            const hex = `#${rgb.toString(16).padStart(6, "0")}`;
            return (
              <Led key={`rgb${id}`} id={100 + id} on={rgb !== 0} color={hex} label={`RGB${id}`} shape="rect" />
            );
          })}
        </div>
      ),
    });

  if (buttons.length > 0 || switches.length > 0)
    cards.push({
      id: "input",
      node: (
        <div className="flex flex-wrap items-start justify-evenly gap-5">
          {buttons.map((id) => (
            <PushButton
              key={id}
              id={id}
              disabled={!powered}
              onPress={() => board.evt("btn", id, "press")}
              onRelease={() => board.evt("btn", id, "release")}
            />
          ))}
          {switches.map((id) => (
            <SlideSwitch
              key={id}
              id={id}
              disabled={!powered}
              on={num(state[`sw/${id}`]) !== 0}
              onToggle={(v) => board.set("sw", id, v ? 1 : 0)}
            />
          ))}
        </div>
      ),
    });

  if (adcs.length > 0)
    cards.push({
      id: "adc",
      node: (
        <div className="flex flex-wrap justify-evenly gap-5 px-2">
          {adcs.map((id) => (
            <AdcKnob
              key={id}
              id={id}
              disabled={!powered}
              value={num(state[`adc/${id}`])}
              onChange={(v) => board.set("adc", id, v)}
            />
          ))}
        </div>
      ),
    });

  if (seg7s.length > 0)
    cards.push({
      id: "seg7",
      node: (
        <div className="flex flex-wrap justify-evenly gap-3">
          {seg7s.map((id) => (
            <Seg7 key={id} id={id} value={num(state[`seg7/${id}`])} />
          ))}
        </div>
      ),
    });

  if (pwms.length > 0)
    cards.push({
      id: "pwm",
      node: (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {pwms.map((id) => (
            <PwmBar key={id} id={id} duty={num(state[`pwm/${id}`])} />
          ))}
        </div>
      ),
    });

  if (mics.length > 0)
    cards.push({
      id: "mic",
      node: mics.map((id) => <MicMeter key={id} id={id} />),
    });

  if (speakers.length > 0)
    cards.push({
      id: "spk",
      node: speakers.map((id) => (
        <Speaker key={id} id={id} freq={num(state[`spk/${id}`])} />
      )),
    });

  cards.push({
    id: "sim",
    node: <SimPanel connected={connected} powered={powered} stats={stats} />,
  });

  if (showUart)
    cards.push({
      id: "uart",
      node: <SerialTerm lines={serial} />,
    });

  if (powered && extras.length > 0)
    cards.push({
      id: "ext",
      node: (
        <div className="flex flex-wrap gap-2">
          {extras.map((k) => (
            <GenericDeviceTile key={k} name={k} value={state[k]} />
          ))}
        </div>
      ),
    });

  const LABELS: Record<string, [string, string | undefined]> = {
    leds: ["Digital Output", "GPIO"],
    rgb: ["RGB LED", "ws2812"],
    input: ["User Input", "momentary"],
    adc: ["Analog Input", "0–3300 mV"],
    seg7: ["Numeric Display", "7-seg"],
    pwm: ["PWM Output", "duty 0–100%"],
    mic: ["Microphone", "es8311 · adc"],
    spk: ["Speaker", "es8311 · dac"],
    sim: ["Simulator", powered ? "running" : "standby"],
    uart: ["Serial", "uart0 · 115200 8N1"],
    ext: ["External", `${extras.length}`],
  };

  /* reconcile persisted order with mounted cards */
  const ids = cards.map((c) => c.id);
  const idsKey = ids.join(",");
  useEffect(() => {
    setOrder((o) => reconcile(o, idsKey.split(",")));
  }, [idsKey]);
  const ordered = order.filter((id) => ids.includes(id));
  for (const id of ids) if (!ordered.includes(id)) ordered.push(id);

  /* ---- drag-to-reorder -------------------------------------------------- */

  const moveDragged = (px: number, py: number) => {
    const d = drag.current;
    if (!d) return;
    const el = cardEls.current.get(d.id);
    const root = rootEl.current;
    if (!el || !root) return;
    const r = root.getBoundingClientRect();
    el.style.transform = `translate(${px - r.left - d.gx - el.offsetLeft}px, ${
      py - r.top - d.gy - el.offsetTop
    }px)`;
  };

  const startDrag = (id: string) => (e: React.PointerEvent) => {
    const el = cardEls.current.get(id);
    if (!el || e.button !== 0) return;
    const r = el.getBoundingClientRect();
    drag.current = {
      id,
      gx: e.clientX - r.left,
      gy: e.clientY - r.top,
      px: e.clientX,
      py: e.clientY,
    };
    el.style.position = "relative";
    el.style.zIndex = "40";
    setDragId(id);
  };

  useEffect(() => {
    if (!dragId) return;

    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      d.px = e.clientX;
      d.py = e.clientY;
      moveDragged(e.clientX, e.clientY);

      /* insertion index — reading order by card midpoints */
      const others = order.filter((id) => id !== d.id);
      let target = others.length;
      for (let i = 0; i < others.length; i++) {
        const el = cardEls.current.get(others[i]);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const cx = r.left + r.width / 2;
        const above = e.clientY < cy - r.height * 0.25;
        const sameRowLeft =
          Math.abs(e.clientY - cy) <= r.height * 0.25 && e.clientX < cx;
        if (above || sameRowLeft) {
          target = i;
          break;
        }
      }
      const cur = order.indexOf(d.id);
      if (target !== cur) {
        /* snapshot for FLIP before mutating order */
        const pre = new Map<string, { x: number; y: number }>();
        for (const [id, el] of cardEls.current) {
          const r = el.getBoundingClientRect();
          pre.set(id, { x: r.left, y: r.top });
        }
        flipFrom.current = pre;
        const next = [...others];
        next.splice(target, 0, d.id);
        setOrder(next);
      }
    };

    const up = () => {
      const d = drag.current;
      drag.current = null;
      setDragId(null);
      if (d) {
        const el = cardEls.current.get(d.id);
        if (el) {
          el.style.transform = "";
          el.style.zIndex = "";
          el.style.position = "";
        }
      }
      try {
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(order));
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", up, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragId, order]);

  /* FLIP siblings after a reorder, and re-glue the dragged card */
  useLayoutEffect(() => {
    const pre = flipFrom.current;
    if (!dragId || !pre) return;
    flipFrom.current = null;
    for (const [id, el] of cardEls.current) {
      if (id === dragId) continue;
      const old = pre.get(id);
      if (!old) continue;
      const r = el.getBoundingClientRect();
      const dx = old.x - r.left;
      const dy = old.y - r.top;
      if (dx !== 0 || dy !== 0) {
        gsap.fromTo(
          el,
          { x: dx, y: dy },
          { x: 0, y: 0, duration: 0.22, ease: "power2.out", overwrite: "auto" },
        );
      }
    }
    /* dragged card's layout slot moved — re-glue it under the pointer now,
     * don't wait for the next pointermove (avoids a 1-frame jump) */
    const d = drag.current;
    if (d) moveDragged(d.px, d.py);
  }, [order, dragId]);

  /* console helper */
  useEffect(() => {
    window.btLayout = {
      reset: () => {
        localStorage.removeItem(LAYOUT_KEY);
        setOrder([]);
      },
    };
  }, []);

  const cardNodes = new Map(cards.map((c) => [c.id, c.node]));

  return (
    <div ref={rootEl} className="relative w-full max-w-4xl">
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          powered ? "" : "bt-idle"
        } ${dragId ? "select-none" : ""}`}
      >
        {ordered.map((id) => {
          const [label, hint] = LABELS[id] ?? [id, undefined];
          return (
            <Panel
              key={id}
              label={label}
              hint={hint}
              dragging={dragId === id}
              panelRef={(el) => {
                if (el) cardEls.current.set(id, el);
                else cardEls.current.delete(id);
              }}
              onHeaderPointerDown={startDrag(id)}
              className={
                id === "leds" || id === "rgb"
                  ? "flex min-h-[136px] flex-col"
                  : undefined
              }
            >
              {cardNodes.get(id)}
            </Panel>
          );
        })}
      </div>

      {/* status overlay */}
      {!powered && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-black/70 px-6 py-4 shadow-2xl backdrop-blur-sm">
            {connected ? (
              <>
                <span className="font-silk text-[10px] uppercase tracking-[0.2em] text-bt-warn">
                  waiting for simulator
                </span>
                <code className="font-silk text-[11px] text-bt-muted">
                  cd ../freertos-pc &amp;&amp; ./run 90
                </code>
              </>
            ) : (
              <>
                <span className="font-silk flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-bt-err">
                  <span className="bt-link-blink h-1.5 w-1.5 rounded-full bg-bt-danger" />
                  broker link down
                </span>
                <code className="font-silk text-[11px] text-bt-faint">
                  reconnecting ws://{location.hostname}:7392…
                </code>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- internals ------------------------------------------------------- */

/** Flat dashboard card holding related peripherals. Header drags the card. */
function Panel({
  label,
  hint,
  className,
  children,
  dragging,
  panelRef,
  onHeaderPointerDown,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
  dragging?: boolean;
  panelRef?: (el: HTMLElement | null) => void;
  onHeaderPointerDown?: (e: React.PointerEvent) => void;
}) {
  return (
    <section
      ref={panelRef}
      data-panel
      className={`rounded-xl border border-white/8 bg-bt-panel/75 px-4 py-3
                  shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-sm
                  ${dragging ? "opacity-95 shadow-2xl ring-1 ring-white/15" : ""}
                  ${className ?? ""}`}
    >
      <header
        className={`mb-3 flex items-baseline justify-between ${
          onHeaderPointerDown
            ? "cursor-grab touch-none active:cursor-grabbing"
            : ""
        }`}
        onPointerDown={onHeaderPointerDown}
      >
        <span className="font-silk text-[9px] uppercase tracking-[0.3em] text-bt-faint">
          {label}
        </span>
        {hint && (
          <span className="font-silk text-[9px] uppercase tracking-[0.15em] text-bt-faint">
            {hint}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
