import type { ReactNode } from "react";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { TRN_HINT_POPOVER_PANEL_CLASS } from "./TRNHintText.js";
import {
  resolveTrnHintContent,
  type TRNTitleDescriptionHintProps,
} from "./TRNTitleDescriptionHint.js";
import { TRNTooltip, type TRNTooltipPlacement } from "./TRNTooltip.js";

/** Faster delay for icon / swatch identity (vs docs-style {@link TRN_HINT_HOVER_DELAY_MS}). */
export const TRN_QUICK_HINT_HOVER_DELAY_MS = 280;

export type TRNQuickHintTooltipProps = {
  trigger: ReactNode;
  /** Bold first line. Prefer over raw `content` when naming a control. */
  title: TRNTitleDescriptionHintProps["title"];
  description?: TRNTitleDescriptionHintProps["description"];
  /** Escape hatch when title/description is not enough. Ignored when `title` is set. */
  content?: ReactNode;
  placement?: TRNTooltipPlacement;
  className?: string;
  panelClassName?: string;
  triggerClassName?: string;
  triggerAriaLabel?: string;
  wide?: boolean;
  triggerWrapper?: "button" | "span";
  openDelayMs?: number;
};

/**
 * Quick identity hover: shared hint panel + bold title / description body.
 * Use for swatches, icon-only tools, and dense chrome. Prefer {@link TRNHintTooltip}
 * (1s delay) for longer documentation copy.
 */
export function TRNQuickHintTooltip(props: TRNQuickHintTooltipProps) {
  const {
    trigger,
    title,
    description,
    content,
    placement = "top",
    className = "",
    panelClassName = "",
    triggerClassName = "",
    triggerAriaLabel,
    wide = false,
    triggerWrapper = "span",
    openDelayMs = TRN_QUICK_HINT_HOVER_DELAY_MS,
  } = props;

  const tooltipContent = useMemo(() => {
    const resolved = resolveTrnHintContent({ title, description, content });
    return resolved ?? content ?? null;
  }, [title, description, content]);

  if (tooltipContent == null) {
    return <>{trigger}</>;
  }

  return (
    <TRNTooltip
      className={className}
      triggerClassName={triggerClassName}
      triggerAriaLabel={
        triggerAriaLabel ?? (typeof title === "string" ? title : undefined)
      }
      triggerWrapper={triggerWrapper}
      placement={placement}
      openDelayMs={openDelayMs}
      disableHoverFx
      trigger={trigger}
      content={tooltipContent}
      panelClassName={twMerge(
        TRN_HINT_POPOVER_PANEL_CLASS,
        wide ? "max-w-[min(420px,calc(100vw-32px))]" : "max-w-[min(320px,calc(100vw-48px))]",
        panelClassName,
      )}
    />
  );
}
