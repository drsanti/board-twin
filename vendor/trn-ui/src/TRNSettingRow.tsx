import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  TRNHintText,
  TRN_HINT_HOVER_DELAY_MS,
  TRN_HINT_POPOVER_PANEL_CLASS,
} from "./TRNHintText.js";

export type TRNSettingRowProps = {
  label: string;
  /** Optional icon before the label (inspector semantic prefix). */
  labelIcon?: ReactNode;
  valueText?: string;
  /** Shown in a tooltip after hovering the label for {@link TRN_HINT_HOVER_DELAY_MS} ms. */
  hint?: string;
  /** `stacked` — control below label (default). `inline` — label and control on one row.
   *  Inline chrome: keep in sync with ternion-graph-engine `INSPECTOR_INLINE_SETTING_ROW`. */
  layout?: "stacked" | "inline";
  className?: string;
  children?: ReactNode;
};

/** @deprecated Use {@link TRN_HINT_HOVER_DELAY_MS} from `TRNHintText`. Kept for backward compatibility. */
export const TRN_SETTING_ROW_HINT_HOVER_MS = TRN_HINT_HOVER_DELAY_MS;

export function TRNSettingRow({
  label,
  labelIcon,
  valueText,
  hint,
  layout = "stacked",
  className = "",
  children,
}: TRNSettingRowProps) {
  const hintTooltipId = useId();
  const [hintVisible, setHintVisible] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current != null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => () => clearHoverTimer(), []);

  const onLabelPointerEnter = () => {
    if (hint == null || hint.length === 0) {
      return;
    }
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null;
      setHintVisible(true);
    }, TRN_HINT_HOVER_DELAY_MS);
  };

  const onLabelPointerLeave = () => {
    clearHoverTimer();
    setHintVisible(false);
  };

  const hasHint = hint != null && hint.length > 0;
  const inline = layout === "inline";

  const labelBlock = (
    <div className="min-w-0 flex-1">
      <div
        className={twMerge(
          "inline-flex max-w-full items-center gap-1.5 text-sm font-semibold tracking-wide text-zinc-100",
          hasHint &&
            "cursor-help underline decoration-dotted decoration-zinc-600/55 underline-offset-[3px]",
        )}
        aria-describedby={hintVisible && hasHint ? hintTooltipId : undefined}
        onPointerEnter={onLabelPointerEnter}
        onPointerLeave={onLabelPointerLeave}
      >
        {labelIcon}
        <span className="min-w-0 truncate">{label}</span>
      </div>
      {hintVisible && hasHint ? (
        <div
          id={hintTooltipId}
          role="tooltip"
          className={twMerge(
            "pointer-events-none absolute left-0 top-full z-200 mt-1 w-max max-w-[min(320px,calc(100vw-48px))]",
            TRN_HINT_POPOVER_PANEL_CLASS,
          )}
        >
          <TRNHintText className="text-[11px] leading-snug text-zinc-100">{hint}</TRNHintText>
        </div>
      ) : null}
    </div>
  );

  const valueBlock =
    valueText != null ? (
      <div className="shrink-0 font-mono text-sm font-semibold text-zinc-100">{valueText}</div>
    ) : null;

  return (
    <div
      className={twMerge(
        inline
          ? "flex h-[28px] items-center border-0 bg-zinc-950/45 px-1 py-0"
          : "rounded-xl border border-zinc-700/80 bg-zinc-950/75 p-4 backdrop-blur-sm",
        className,
      )}
    >
      {inline ? (
        <div className="relative flex h-full w-full min-w-0 items-center justify-between gap-3">
          {labelBlock}
          <div className="flex shrink-0 items-center gap-2">
            {valueBlock}
            {children}
          </div>
        </div>
      ) : (
        <>
          <div className="relative mb-2 flex items-start justify-between gap-2">
            {labelBlock}
            {valueBlock}
          </div>
          {children}
        </>
      )}
    </div>
  );
}
