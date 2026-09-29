import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { TRN_HINT_HOVER_DELAY_MS, TRN_HINT_POPOVER_PANEL_CLASS } from "./TRNHintText.js";
import { resolveTrnLabeledHintContent } from "./TRNTitleDescriptionHint.js";
import { TRNTooltip, type TRNTooltipPlacement } from "./TRNTooltip.js";

export type TRNIconButtonVariant = "default" | "ghost";

type TRNIconButtonProps = {
  icon: ReactNode;
  label: string;
  className?: string;
  variant?: TRNIconButtonVariant;
  /** When false, omit native `title` (use with {@link TRNTooltip} / `hint`). Default true. */
  nativeTitle?: boolean;
  /**
   * Rich hover hint (no native `title`).
   * String hints auto-compose as bold `label` + description via {@link resolveTrnLabeledHintContent}.
   */
  hint?: ReactNode;
  /** Bold first line (overrides auto title from `label`). */
  hintTitle?: ReactNode;
  /** Muted body under the title. */
  hintDescription?: ReactNode;
  hintPlacement?: TRNTooltipPlacement;
  hintDelayMs?: number;
  /** Extra classes for the {@link TRNTooltip} trigger wrapper (e.g. `p-0` to remove hint padding). */
  hintTriggerClassName?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const TRN_ICON_BUTTON_BASE =
  "inline-flex h-7 w-7 items-center justify-center rounded-md p-0 transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const TRN_ICON_BUTTON_VARIANT_CLASS: Record<TRNIconButtonVariant, string> = {
  default:
    "border border-zinc-700/80 bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800/70",
  ghost:
    "border-0 bg-transparent text-zinc-400 shadow-none hover:bg-zinc-800/45 hover:text-zinc-100",
};

export function TRNIconButton({
  icon,
  label,
  className = "",
  variant = "default",
  nativeTitle = true,
  hint,
  hintTitle,
  hintDescription,
  hintPlacement = "bottom",
  hintDelayMs = TRN_HINT_HOVER_DELAY_MS,
  hintTriggerClassName,
  disabled,
  ...props
}: TRNIconButtonProps) {
  const resolvedHint = resolveTrnLabeledHintContent({
    label,
    hintTitle,
    hintDescription,
    hint,
  });
  const useNativeTitle = nativeTitle && resolvedHint == null;

  const button = (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      {...(useNativeTitle ? { title: label } : {})}
      className={twMerge(TRN_ICON_BUTTON_BASE, TRN_ICON_BUTTON_VARIANT_CLASS[variant], className)}
      {...props}
    >
      {icon}
    </button>
  );

  if (resolvedHint == null) {
    return button;
  }

  return (
    <TRNTooltip
      className="pointer-events-auto inline-flex shrink-0"
      placement={hintPlacement}
      openDelayMs={hintDelayMs}
      disableHoverFx
      triggerWrapper="span"
      triggerClassName={twMerge("inline-flex", hintTriggerClassName)}
      triggerAriaLabel={label}
      content={resolvedHint}
      panelClassName={TRN_HINT_POPOVER_PANEL_CLASS}
      trigger={button}
    />
  );
}
