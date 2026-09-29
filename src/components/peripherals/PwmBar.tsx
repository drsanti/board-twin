/*
 * PwmBar — PWM duty indicator (0..1000 permille = 0..100%).
 * A horizontal brightness bar with 10% ticks — reads like a
 * bench meter, not a slider (it's an output, not an input).
 */

export interface PwmBarProps {
  id: number;
  duty: number;            // 0..1000
  label?: string;
}

export function PwmBar({ id, duty, label }: PwmBarProps) {
  const pct = Math.max(0, Math.min(100, duty / 10));
  return (
    <div className="flex w-full min-w-[160px] flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="bt-silk text-[9px]">{label ?? `PWM${id}`}</span>
        <span className="font-silk w-14 text-right text-[10px] text-bt-warn">
          {pct.toFixed(0)}%
        </span>
      </div>
      <div
        className="relative h-3.5 overflow-hidden rounded-sm border
                   border-bt-line bg-bt-canvas/70"
      >
        {/* 10% tick marks */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-full flex-1 border-r border-bt-line/60 last:border-r-0"
            />
          ))}
        </div>
        {/* duty fill */}
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-100"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, #7c2d12, #f59e0b 60%, #fbbf24)",
            boxShadow: pct > 0 ? "0 0 8px rgba(251,191,36,0.5)" : undefined,
          }}
        />
      </div>
    </div>
  );
}
