export interface GenericDeviceTileProps {
  /** device key, e.g. "pwm/0" */
  name: string;
  value: number | string;
}

/** Read-only fallback tile for state keys with no dedicated peripheral. */
export function GenericDeviceTile({ name, value }: GenericDeviceTileProps) {
  return (
    <div className="flex min-w-[64px] flex-col items-center gap-0.5 rounded border border-white/10 bg-black/30 px-2.5 py-1.5">
      <span className="font-silk text-[12px] leading-4 text-bt-live">
        {String(value)}
      </span>
      <span className="bt-silk text-[8px]">{name}</span>
    </div>
  );
}
