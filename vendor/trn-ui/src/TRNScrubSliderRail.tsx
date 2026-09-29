import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { twMerge } from "tailwind-merge";
import { clampTrnNumberToRange, notifyTrnScrubInteractionEnd } from "./TRNScrubNumberInput.js";

/** Thumb diameter — travel is inset by half this so min/max handles are not clipped. */
const THUMB_PX = 12;

export type TRNScrubSliderRailProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  locked?: boolean;
  onChange: (next: number) => void;
  onChangeEnd?: () => void;
  className?: string;
  ariaLabel?: string;
};

function snapToStepInRange(raw: number, min: number, max: number, step?: number): number {
  const clamped = clampTrnNumberToRange(raw, min, max);
  if (typeof step !== "number" || !Number.isFinite(step) || step <= 0) {
    return clamped;
  }
  const snapped = min + Math.round((clamped - min) / step) * step;
  return clampTrnNumberToRange(snapped, min, max);
}

function valueToThumbPercent(value: number, min: number, max: number): number {
  const span = max - min;
  if (!(span > 0) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, ((value - min) / span) * 100));
}

function thumbCenterStyle(percent: number): string {
  const t = Math.min(100, Math.max(0, percent)) / 100;
  return `calc(${THUMB_PX / 2}px + ${t} * (100% - ${THUMB_PX}px))`;
}

/**
 * Horizontal slider track + thumb. Drag/click writes values inside [min, max] only.
 * Out-of-range `value` parks the thumb at the matching end.
 * Thumb travel is inset by half the handle so min/max are fully visible inside overflow-hidden cards.
 */
export function TRNScrubSliderRail(props: TRNScrubSliderRailProps) {
  const {
    value,
    min,
    max,
    step,
    disabled = false,
    locked = false,
    onChange,
    onChangeEnd,
    className,
    ariaLabel,
  } = props;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const inert = disabled || locked;
  const thumbPct = valueToThumbPercent(value, min, max);
  const center = thumbCenterStyle(thumbPct);

  const applyFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (el == null) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const usable = rect.width - THUMB_PX;
      if (usable <= 0) {
        return;
      }
      const t = Math.min(1, Math.max(0, (clientX - rect.left - THUMB_PX / 2) / usable));
      const raw = min + t * (max - min);
      onChange(snapToStepInRange(raw, min, max, step));
    },
    [max, min, onChange, step],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (inert || e.button !== 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    applyFromClientX(e.clientX);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (inert || !e.currentTarget.hasPointerCapture(e.pointerId)) {
      return;
    }
    e.preventDefault();
    applyFromClientX(e.clientX);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (draggingRef.current) {
      draggingRef.current = false;
      notifyTrnScrubInteractionEnd(onChangeEnd);
    }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Number.isFinite(value) ? clampTrnNumberToRange(value, min, max) : min}
      aria-disabled={inert || undefined}
      className={twMerge(
        "relative h-3.5 w-full min-w-0 cursor-pointer touch-none select-none overflow-visible",
        inert && "cursor-not-allowed opacity-45",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zinc-800/85"
        style={{ left: THUMB_PX / 2, right: THUMB_PX / 2 }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-emerald-500/55"
        style={{ left: THUMB_PX / 2, width: `calc(${thumbPct / 100} * (100% - ${THUMB_PX}px))` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/50 bg-[rgba(16,185,129,0.72)] shadow-[0_0_0_2px_rgba(8,12,20,0.95)]"
        style={{ left: center }}
      />
    </div>
  );
}
