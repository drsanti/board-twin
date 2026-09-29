import { useEffect, useRef, useState } from "react";
import { Palette, RotateCcw, X } from "lucide-react";
import { TRNColorRingPicker } from "@ternion/trn-ui";
import {
  THEME_GROUPS,
  getThemeOverrides,
  getThemeValue,
  setThemeToken,
  resetThemeToken,
  resetAllTheme,
  subscribeTheme,
} from "../lib/theme";

function useOverrides(): Record<string, string> {
  const [, force] = useState(0);
  useEffect(() => subscribeTheme(() => force((n) => n + 1)), []);
  return getThemeOverrides();
}

function TokenRow({ token, label, defaultHex, role }: {
  token: string; label: string; defaultHex: string; role: string;
}) {
  const overrides = useOverrides();
  const overridden = token in overrides;
  const value = getThemeValue(token, defaultHex);

  return (
    <div className="flex items-center gap-2 py-1">
      <TRNColorRingPicker
        triggerVariant="swatch"
        size="sm"
        ariaLabel={`pick ${label}`}
        valueHex={/^#[0-9a-fA-F]{6}$/.test(value) ? value : defaultHex}
        onValueHexChange={(hex) => setThemeToken(token, hex)}
        className="shrink-0"
      />
      <span className="w-24 truncate font-silk text-[10px] text-bt-text">{label}</span>
      <span className="flex-1 truncate font-silk text-[9px] text-bt-faint">{role}</span>
      <code className="w-16 text-right font-silk text-[9px] text-bt-muted">{value}</code>
      <button
        type="button"
        aria-label={`reset ${label}`}
        onClick={() => resetThemeToken(token)}
        disabled={!overridden}
        className="text-bt-faint transition-colors hover:text-bt-text disabled:opacity-30"
      >
        <RotateCcw size={10} />
      </button>
    </div>
  );
}

/** Ctrl+Shift+F1 — live token configurator (ByteFlow catalog pattern). */
export function ThemeOverlay({ onClose }: { onClose: () => void }) {
  const overrides = useOverrides();
  /* null = docked top-right; after first drag it's absolute x/y */
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const secRef = useRef<HTMLElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button,input,label")) return;
    const r = secRef.current?.getBoundingClientRect();
    if (!r) return;
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const x = Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - 120);
    const y = Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 60);
    setPos({ x, y });
  };
  const onPointerUp = () => (drag.current = null);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Theme tokens">
      <div className="absolute inset-0" onClick={onClose} />
      <section
        ref={secRef}
        style={pos ? { left: pos.x, top: pos.y } : undefined}
        className={`bt-scroll absolute max-h-[85vh] w-[340px] overflow-y-auto rounded-lg border border-bt-line bg-bt-panel p-3 shadow-2xl ${pos ? "" : "right-4 top-4"}`}
      >
        <header
          className="mb-2 flex cursor-grab touch-none items-center justify-between active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="flex items-center gap-2">
            <Palette size={13} className="text-bt-muted" />
            <span className="bt-silk text-[10px] text-bt-muted">theme tokens</span>
            {Object.keys(overrides).length > 0 && (
              <span className="rounded border border-bt-line bg-bt-field px-1.5 py-px font-silk text-[9px] text-bt-muted">
                {Object.keys(overrides).length} overridden
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetAllTheme}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 font-silk text-[9px] text-bt-faint hover:bg-bt-hover hover:text-bt-text"
            >
              <RotateCcw size={10} /> reset all
            </button>
            <button
              type="button"
              aria-label="close theme editor"
              onClick={onClose}
              className="rounded p-1 text-bt-faint hover:bg-bt-hover hover:text-bt-text"
            >
              <X size={12} />
            </button>
          </div>
        </header>

        {Object.values(THEME_GROUPS).map((g) => (
          <div key={g.title} className="mb-3">
            <div className="mb-1">
              <div className="bt-silk text-[8px] text-bt-faint">{g.title}</div>
              <div className="font-silk text-[8px] text-bt-faint/60">{g.rule}</div>
            </div>
            <div className="divide-y divide-white/5 rounded border border-white/5 bg-bt-field px-2">
              {g.tokens.map((t) => (
                <TokenRow key={t.token} {...t} />
              ))}
            </div>
          </div>
        ))}

        <footer className="flex items-center justify-between font-silk text-[8px] leading-4 text-bt-faint">
          <span>persist: localStorage · console: btTheme.* / btLayout.reset()</span>
          <button
            type="button"
            onClick={() => window.btLayout?.reset()}
            className="rounded px-1.5 py-0.5 text-bt-faint hover:bg-bt-hover hover:text-bt-text"
          >
            reset layout
          </button>
        </footer>
      </section>
    </div>
  );
}
