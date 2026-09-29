import { createElement, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type TRNTitleDescriptionHintProps = {
  /** Bold first line — control / token name. */
  title: ReactNode;
  /** Optional muted body under the title. */
  description?: ReactNode;
  className?: string;
};

/**
 * Canonical hover-hint body: **bold title** on the first line, description on the next.
 * Use inside {@link TRNTooltip} / {@link TRNHintTooltip} / button `hint` props with
 * {@link TRN_HINT_POPOVER_PANEL_CLASS}.
 */
export function TRNTitleDescriptionHint(props: TRNTitleDescriptionHintProps) {
  const { title, description, className } = props;
  const hasDescription =
    description != null &&
    !(typeof description === "string" && description.trim().length === 0);

  return (
    <span
      className={twMerge(
        "block text-left text-[11px] leading-relaxed text-zinc-100",
        className,
      )}
    >
      <span className="font-semibold text-zinc-50">{title}</span>
      {hasDescription ? (
        <span className="mt-0.5 block whitespace-pre-wrap text-zinc-300">{description}</span>
      ) : null}
    </span>
  );
}

/**
 * Build a title + description hint node (or fall back to raw `content`).
 * Prefer this when composing `hint={...}` / tooltip `content={...}` props.
 */
export function resolveTrnHintContent(props: {
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
}): ReactNode | null {
  const { title, description, content } = props;
  if (title != null && !(typeof title === "string" && title.trim().length === 0)) {
    return createElement(TRNTitleDescriptionHint, { title, description });
  }
  return content ?? null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Drop a leading "Label — " / "Label: " so description does not repeat the title. */
export function stripTrnHintLeadingLabel(description: string, label: string): string {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) {
    return description.trim();
  }
  const escaped = escapeRegExp(trimmedLabel);
  const stripped = description
    .trim()
    .replace(new RegExp(`^${escaped}\\s*[—–\\-:]\\s*`, "i"), "")
    .trim();
  return stripped.length > 0 ? stripped : description.trim();
}

/**
 * Resolve hover body for labeled controls (`TRNIconButton` / `TRNButton`):
 * - explicit `hintTitle` / `hintDescription` win
 * - string `hint` + string `label` → bold label + description (deduped)
 * - identical label/hint → title only
 * - non-string `hint` → freeform content
 */
export function resolveTrnLabeledHintContent(props: {
  label?: ReactNode;
  hintTitle?: ReactNode;
  hintDescription?: ReactNode;
  hint?: ReactNode;
}): ReactNode | null {
  const { label, hintTitle, hintDescription, hint } = props;

  if (hintTitle != null || hintDescription != null) {
    const title =
      hintTitle ?? (typeof label === "string" && label.trim().length > 0 ? label : undefined);
    return resolveTrnHintContent({
      title,
      description: hintDescription,
      content: hintTitle == null && hintDescription == null ? hint : undefined,
    });
  }

  if (typeof hint === "string") {
    const trimmedHint = hint.trim();
    if (!trimmedHint) {
      return null;
    }
    const labelStr = typeof label === "string" ? label.trim() : "";
    if (labelStr && trimmedHint === labelStr) {
      return resolveTrnHintContent({ title: labelStr });
    }
    if (labelStr) {
      return resolveTrnHintContent({
        title: labelStr,
        description: stripTrnHintLeadingLabel(trimmedHint, labelStr),
      });
    }
    return resolveTrnHintContent({ title: trimmedHint });
  }

  return resolveTrnHintContent({ content: hint });
}
