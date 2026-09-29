import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import {
  TRN_SCRUB_FIELD_BADGE_TONE_CLASS,
  type TRNScrubFieldBadgeTone,
} from "./trn-scrub-field-badge-tones.js";

export type TRNScrubFieldBadgeSpec =
  | {
      kind: "text";
      text: string;
      tone?: TRNScrubFieldBadgeTone;
      /** Used when `tone` is `custom`. */
      className?: string;
    }
  | {
      kind: "icon";
      icon: ReactNode;
      tone?: TRNScrubFieldBadgeTone;
      className?: string;
      ariaLabel: string;
    }
  | { kind: "node"; node: ReactNode };

export type TRNScrubFieldBadgeProps = {
  badge: TRNScrubFieldBadgeSpec;
  className?: string;
};

function resolveToneClass(
  tone: TRNScrubFieldBadgeTone | undefined,
  className?: string,
): string {
  if (tone === "custom" || className != null) {
    return className ?? TRN_SCRUB_FIELD_BADGE_TONE_CLASS.neutral;
  }
  return TRN_SCRUB_FIELD_BADGE_TONE_CLASS[tone ?? "neutral"];
}

/**
 * Leading text/icon chip inside {@link TRNBadgedScrubNumberField}.
 * Default: full-height flush rail (`self-stretch`), soft tone fill, no border.
 */
export function TRNScrubFieldBadge(props: TRNScrubFieldBadgeProps) {
  const { badge, className } = props;

  if (badge.kind === "node") {
    return <span className={twMerge("shrink-0", className)}>{badge.node}</span>;
  }

  const toneClass = resolveToneClass(badge.tone, badge.kind === "text" ? badge.className : badge.className);

  if (badge.kind === "icon") {
    return (
      <span
        className={twMerge(
          "inline-flex w-5 shrink-0 items-center justify-center self-stretch p-0",
          toneClass,
          className,
        )}
        aria-label={badge.ariaLabel}
      >
        {badge.icon}
      </span>
    );
  }

  return (
    <span
      className={twMerge(
        "inline-flex w-5 shrink-0 items-center justify-center self-stretch p-0 text-[10px] font-semibold",
        toneClass,
        className,
      )}
      aria-hidden
    >
      {badge.text}
    </span>
  );
}
