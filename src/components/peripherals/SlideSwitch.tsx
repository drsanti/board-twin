export interface SlideSwitchProps {
  id: number;
  on: boolean;
  disabled?: boolean;
  onToggle: (on: boolean) => void;
}

/** Latching horizontal slide switch (e.g. a config/mode switch). */
export function SlideSwitch({ id, on, disabled, onToggle }: SlideSwitchProps) {
  return (
    <div className="flex select-none flex-col items-center gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`SW${id}`}
        disabled={disabled}
        onClick={() => onToggle(!on)}
        className="relative h-8 w-16 rounded-[4px] border border-white/10 bg-[#0a0e12]
                   shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)] outline-none
                   focus-visible:ring-2 focus-visible:ring-bt-accent/70
                   disabled:cursor-default disabled:opacity-40"
      >
        {/* track end markings: ● OFF · ON */}
        <span className="absolute left-[6px] top-1/2 h-[3px] w-[3px] -translate-y-1/2 rounded-full bg-white/25" />
        <span className="absolute right-[6px] top-1/2 h-[3px] w-[3px] -translate-y-1/2 rounded-full bg-bt-accent-soft/70" />
        {/* knurled thumb */}
        <span
          className={`absolute top-[3px] bottom-[3px] w-[27px] rounded-[3px] transition-all duration-150 ease-out
            ${on ? "left-[calc(100%_-_30px)]" : "left-[3px]"}
            bg-gradient-to-b from-[#4a5462] via-[#2b333e] to-[#1a2027]
            shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]`}
        >
          <span className="flex h-full items-center justify-center gap-[2.5px]">
            <span className="h-[10px] w-[2px] rounded-full bg-black/50" />
            <span className="h-[10px] w-[2px] rounded-full bg-black/50" />
            <span className="h-[10px] w-[2px] rounded-full bg-black/50" />
          </span>
        </span>
      </button>
      <span className="bt-silk text-[9px]">SW{id}</span>
    </div>
  );
}
