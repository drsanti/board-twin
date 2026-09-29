import { useEffect, useRef } from "react";
import gsap from "gsap";

export interface AdcKnobProps {
  id: number;
  /** current value in millivolts (or whatever unit `max` implies) */
  value: number;
  min?: number;
  max?: number;
  /** wheel / arrow-key increment */
  step?: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}

const TICKS = 11; // dial tick marks
const SWEEP = 270; // degrees of rotation
const DRAG_RANGE_PX = 140; // vertical drag pixels for full scale

/**
 * Rotary trimmer / potentiometer for analog inputs.
 * Drag vertically, scroll the wheel, or use arrow keys / Home / End.
 */
export function AdcKnob({
  id,
  value,
  min = 0,
  max = 3300,
  step = 50,
  disabled,
  onChange,
}: AdcKnobProps) {
  const frac = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const angle = -SWEEP / 2 + frac * SWEEP;

  const rotor = useRef<HTMLDivElement>(null);
  const spin = useRef<((v: number) => void) | null>(null);
  const drag = useRef<{ y: number; v: number } | null>(null);
  const pad = useRef<HTMLDivElement>(null);

  // stable refs so the non-passive wheel listener never re-binds
  const latest = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    latest.current = value;
    onChangeRef.current = onChange;
  });

  // gsap.quickTo gives smooth, interruptible rotation for both drags
  // and remote `set` echoes coming back over the socket.
  useEffect(() => {
    if (rotor.current) {
      spin.current = gsap.quickTo(rotor.current, "rotation", {
        duration: 0.18,
        ease: "power2.out",
      });
    }
    return () => {
      spin.current = null;
    };
  }, []);

  useEffect(() => {
    spin.current?.(angle);
  }, [angle]);

  const set = (v: number) =>
    onChange(Math.round(Math.min(max, Math.max(min, v))));

  const setRef = useRef(set);
  useEffect(() => {
    setRef.current = set;
  });

  // non-passive wheel listener so scrolling the knob doesn't scroll the page
  useEffect(() => {
    const el = pad.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (disabled) return;
      e.preventDefault();
      setRef.current(latest.current + (e.deltaY < 0 ? step : -step));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [disabled, step]);

  return (
    <div className="flex select-none flex-col items-center gap-1.5">
      <div className="relative h-20 w-20">
        {/* dial ticks — light up as the value sweeps */}
        {Array.from({ length: TICKS }, (_, i) => {
          const a = -SWEEP / 2 + (i / (TICKS - 1)) * SWEEP;
          const lit = i / (TICKS - 1) <= frac + 1e-9;
          return (
            <div
              key={i}
              className={`absolute left-1/2 top-1/2 h-[4px] w-[2px] rounded-full transition-colors duration-150 ${
                lit ? "bg-bt-accent-soft/80" : "bg-white/20"
              }`}
              style={{
                transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-34px)`,
              }}
            />
          );
        })}

        {/* interactive pad */}
        <div
          ref={pad}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={`ADC${id}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={Math.round(value)}
          aria-disabled={disabled}
          className={`absolute inset-[13px] rounded-full outline-none touch-none
                      focus-visible:ring-2 focus-visible:ring-bt-accent/70
                      ${disabled ? "cursor-default" : "cursor-ns-resize"}`}
          onPointerDown={(e) => {
            if (disabled) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { y: e.clientY, v: value };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const dv =
              ((drag.current.y - e.clientY) / DRAG_RANGE_PX) * (max - min);
            set(drag.current.v + dv);
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "ArrowUp" || e.key === "ArrowRight") set(value + step);
            else if (e.key === "ArrowDown" || e.key === "ArrowLeft")
              set(value - step);
            else if (e.key === "Home") set(min);
            else if (e.key === "End") set(max);
          }}
        >
          {/* knurled rim */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "repeating-conic-gradient(#39424e 0deg 5deg, #181d24 5deg 10deg)",
              boxShadow:
                "0 3px 8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.12)",
            }}
          />
          {/* rotating face + pointer mark */}
          <div
            ref={rotor}
            className="absolute inset-[4px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 36% 30%, #48525f 0%, #252c36 55%, #141920 100%)",
              boxShadow:
                "inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.5)",
            }}
          >
            <div className="absolute left-1/2 top-[3px] h-[10px] w-[3px] -translate-x-1/2 rounded-full bg-bt-accent-soft shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
          </div>
        </div>
      </div>

      {/* numeric readout — 7-seg-adjacent mono with glow */}
      <div
        className="flex w-[72px] items-baseline justify-end rounded-[3px] border border-white/10 bg-black/45 px-2 py-0.5
                   font-silk text-[11px] leading-4 text-bt-live
                   [text-shadow:0_0_8px_rgba(96,165,250,0.45)]"
      >
        {Math.round(value)}
        <span className="ml-1 text-bt-live/50">mV</span>
      </div>
      <span className="bt-silk text-[9px]">ADC{id}</span>
    </div>
  );
}
