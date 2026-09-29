import { useEffect, useRef } from "react";
import gsap from "gsap";

export interface UartDisplayProps {
  /** last UART line received from the sim, or null when silent */
  text: string | null;
}

/** Tiny OLED-style serial display soldered on the board. */
export function UartDisplay({ text }: UartDisplayProps) {
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (text != null && line.current) {
      gsap.fromTo(line.current, { opacity: 0.15 }, { opacity: 1, duration: 0.25 });
    }
  }, [text]);

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="bt-oled w-52 rounded-[4px] border border-white/10 bg-[#030805] px-2.5 py-2
                   shadow-[inset_0_0_14px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.04)]"
      >
        <div
          ref={line}
          className="truncate font-silk text-[11px] leading-4 text-emerald-300/90
                     [text-shadow:0_0_7px_rgba(52,211,153,0.55)]"
        >
          {text ?? <span className="text-emerald-300/25">— idle —</span>}
        </div>
      </div>
      <span className="bt-silk text-[9px]">UART0 · 115200 8N1</span>
    </div>
  );
}
