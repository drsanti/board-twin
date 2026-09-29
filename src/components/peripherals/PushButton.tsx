import { useState } from "react";

export interface PushButtonProps {
  id: number;
  /** cap legend — defaults to `B{id}` */
  label?: string;
  disabled?: boolean;
  onPress: () => void;
  onRelease: () => void;
}

/**
 * Momentary tactile push-button. Like real hardware it never toggles:
 * pointer down = press, pointer up / leave / cancel = release.
 */
export function PushButton({ id, label, disabled, onPress, onRelease }: PushButtonProps) {
  const [pressed, setPressed] = useState(false);

  const press = () => {
    if (disabled || pressed) return;
    setPressed(true);
    onPress();
  };
  const release = () => {
    if (!pressed) return;
    setPressed(false);
    onRelease();
  };

  return (
    <div className="flex select-none flex-col items-center gap-1.5">
      <button
        type="button"
        disabled={disabled}
        aria-pressed={pressed}
        onPointerDown={(e) => {
          e.preventDefault(); // don't grab focus on click — hardware has none
          press();
        }}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") press();
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") release();
        }}
        onBlur={release}
        className="group relative h-14 w-14 rounded-md outline-none
                   focus-visible:ring-2 focus-visible:ring-bt-accent/70
                   disabled:cursor-default disabled:opacity-40"
      >
        {/* soldered housing */}
        <div
          className="absolute inset-0 rounded-md border border-white/5 bg-[#0c0f13]
                     shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.05)]"
        />
        {/* cap */}
        <div
          className={`absolute inset-[6px] rounded-[4px] transition-all duration-75 ease-out ${
            pressed
              ? "translate-y-[2px] bg-gradient-to-b from-[#2a2416] to-[#191510] " +
                "shadow-[inset_0_2px_5px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,176,32,0.45)]"
              : "translate-y-0 bg-gradient-to-b from-[#333c48] via-[#232a34] to-[#151a21] " +
                "shadow-[0_3px_0_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.16)] " +
                "group-hover:from-[#3a4452] group-active:translate-y-[1px]"
          }`}
        >
          <span
            className={`grid h-full w-full place-items-center font-silk text-[10px] tracking-widest transition-colors ${
              pressed ? "text-bt-warn" : "text-bt-muted"
            }`}
          >
            {label ?? `B${id}`}
          </span>
        </div>
      </button>
      <span className="bt-silk text-[9px]">BTN{id}</span>
    </div>
  );
}
