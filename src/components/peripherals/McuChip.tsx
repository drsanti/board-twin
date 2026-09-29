export interface McuChipProps {
  /** broker link up */
  connected: boolean;
  /** simulator attached and streaming */
  running: boolean;
}

const PINS = Array.from({ length: 9 }, (_, i) => i);

/** Decorative QFP-style MCU package — the visual heart of the board. */
export function McuChip({ connected, running }: McuChipProps) {
  const status = !connected ? "OFFLINE" : running ? "RUNNING" : "STANDBY";
  const dot = !connected
    ? "bg-bt-danger"
    : running
      ? "bg-bt-accent bt-link-blink"
      : "bg-bt-warning";

  const pinCls =
    "bg-gradient-to-b from-[#525e6c] to-[#232a33] shadow-[0_1px_1px_rgba(0,0,0,0.6)]";

  return (
    <div className="relative h-[136px] w-[136px] shrink-0">
      {/* pin stubs — all four sides */}
      <div className="absolute -top-[6px] left-[18px] right-[18px] flex justify-between">
        {PINS.map((i) => (
          <div key={i} className={`h-[8px] w-[7px] rounded-[1px] ${pinCls}`} />
        ))}
      </div>
      <div className="absolute -bottom-[6px] left-[18px] right-[18px] flex justify-between">
        {PINS.map((i) => (
          <div key={i} className={`h-[8px] w-[7px] rounded-[1px] ${pinCls}`} />
        ))}
      </div>
      <div className="absolute -left-[6px] top-[18px] bottom-[18px] flex flex-col justify-between">
        {PINS.map((i) => (
          <div key={i} className={`h-[7px] w-[8px] rounded-[1px] ${pinCls}`} />
        ))}
      </div>
      <div className="absolute -right-[6px] top-[18px] bottom-[18px] flex flex-col justify-between">
        {PINS.map((i) => (
          <div key={i} className={`h-[7px] w-[8px] rounded-[1px] ${pinCls}`} />
        ))}
      </div>

      {/* package body */}
      <div
        className="absolute inset-[10px] rounded-[8px] border border-white/10
                   bg-gradient-to-br from-[#272f3a] via-[#161c24] to-[#0d1117]
                   shadow-[0_4px_12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)]"
      >
        {/* pin-1 marker */}
        <div className="absolute left-2 top-2 h-[6px] w-[6px] rounded-full bg-white/15" />
        <div className="flex h-full flex-col items-center justify-center gap-0.5">
          <span className="font-silk text-[15px] font-bold tracking-[0.25em] text-white/75">
            ND69
          </span>
          <span className="font-silk text-[8px] tracking-[0.2em] text-white/35">
            EDGE-AI · VMCU
          </span>
          <span className="mt-1.5 flex items-center gap-1.5 font-silk text-[8px] tracking-[0.18em] text-white/40">
            <span className={`h-[5px] w-[5px] rounded-full ${dot}`} />
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
