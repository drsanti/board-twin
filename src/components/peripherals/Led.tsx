import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Lens palette — cycles by index like a real multi-colour LED bar. */
const PALETTE = ["#3ddc84", "#ffb020", "#4da3ff", "#ff5f56", "#c792ea", "#38e0d0"];

export interface LedProps {
  id: number;
  on: boolean;
  /** override lens colour (hex) — defaults to palette by index */
  color?: string;
  /** silkscreen label — defaults to `LED{id}` */
  label?: string;
  /** "round" (mono LED) or "rect" (ws2812-style square package) */
  shape?: "round" | "rect";
}

/** Board-mount LED: metal bezel + lens + emitted-light halo (gsap driven). */
export function Led({ id, on, color, label, shape = "round" }: LedProps) {
  const round = shape === "round";
  const c = color ?? PALETTE[Math.abs(id) % PALETTE.length];
  const halo = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (halo.current) {
      gsap.to(halo.current, {
        opacity: on ? 1 : 0,
        scale: on ? 1 : 0.5,
        duration: on ? 0.3 : 0.18,
        ease: on ? "back.out(2.2)" : "power2.out",
      });
    }
    if (lens.current) {
      gsap.to(lens.current, {
        scale: on ? 1.06 : 1,
        duration: 0.16,
        ease: "power1.out",
      });
    }
  }, [on]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-10 w-10">
        {/* emitted-light halo */}
        <div
          ref={halo}
          className={`pointer-events-none absolute -inset-4 ${round ? "rounded-full" : "rounded-xl"}`}
          style={{
            opacity: on ? 1 : 0,
            background: `radial-gradient(circle, ${c}b3 0%, ${c}40 45%, transparent 70%)`,
          }}
        />
        {/* metal bezel */}
        <div
          className={`absolute inset-0 ${round ? "rounded-full" : "rounded-lg"} bg-gradient-to-b from-[#39424e] via-[#1c222b] to-[#0d1116]
                     shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_1px_3px_rgba(0,0,0,0.7)]`}
        />
        {/* lens */}
        <div
          ref={lens}
          className={`absolute inset-[6px] ${round ? "rounded-full" : "rounded-[4px]"}`}
          style={
            on
              ? {
                  background: `radial-gradient(circle at ${round ? "34% 28%" : "50% 50%"}, #ffffff 0%, ${c} 42%, ${c} 100%)`,
                  boxShadow: `0 0 12px ${c}e6, inset 0 -2px 4px rgba(0,0,0,0.35)`,
                }
              : {
                  background:
                    `radial-gradient(circle at ${round ? "34% 28%" : "50% 50%"}, #2b333e 0%, #12161c 72%)`,
                  boxShadow:
                    "inset 0 2px 4px rgba(0,0,0,0.85), inset 0 -1px 1px rgba(255,255,255,0.05)",
                }
          }
        />
      </div>
      <span className="bt-silk text-[9px] mt-2">{label ?? `LED${id}`}</span>
    </div>
  );
}
