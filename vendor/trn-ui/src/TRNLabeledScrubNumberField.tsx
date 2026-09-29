import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { TRNHintTooltip } from "./TRNHintTooltip.js";
import {
  TRNScrubNumberField,
  type TRNScrubNumberFieldAppearance,
  type TRNScrubNumberFieldInteraction,
  type TRNScrubNumberFieldProps,
  type TRNScrubNumberFieldSize,
} from "./TRNScrubNumberField.js";
import { TRN_FIELD_CONTROL_LABEL_CLASS } from "./trnFieldControlClasses.js";

/** Blender-like number button: scrub shell, optional in-field fill, no Scrub/Slider menu. */
export const TRN_LABELED_SCRUB_NUMBER_FIELD_APPEARANCE: TRNScrubNumberFieldAppearance = {
  variant: "full",
  controlStyle: "scrub",
  controlStyleSwitchEnabled: false,
  inFieldFillWhenBounded: true,
  inFieldFillStyle: "soft-gradient",
  stepButtonsVisibility: "hover",
  lockIconVisibility: "always",
  resetIconVisibility: "always",
  clearIconVisibility: "hidden",
};

export const TRN_LABELED_SCRUB_NUMBER_FIELD_INTERACTION: TRNScrubNumberFieldInteraction = {
  pointerScrubEnabled: true,
  wheelEnabled: true,
  wheelRequiresAlt: true,
  wheelBoundedMode: "span-percent",
};

export type TRNLabeledScrubNumberFieldProps = Omit<
  TRNScrubNumberFieldProps,
  "label" | "size" | "appearance" | "interaction" | "embedded"
> & {
  label: string;
  /** Hover hint on the label (via {@link TRNHintTooltip}). */
  hint?: string;
  /** Fixed label column width class (default `w-28`). */
  labelColumnClassName?: string;
  size?: TRNScrubNumberFieldSize;
  appearance?: TRNScrubNumberFieldAppearance;
  interaction?: TRNScrubNumberFieldInteraction;
  /** Optional leading node before the label text (e.g. kind icon). */
  labelLeading?: ReactNode;
  /** Optional trailing node after the label text (rare). */
  labelTrailing?: ReactNode;
};

function fractionDigitsFromStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) {
    return 2;
  }
  if (step >= 1) {
    return 0;
  }
  if (step >= 0.1) {
    return 1;
  }
  if (step >= 0.01) {
    return 2;
  }
  if (step >= 0.001) {
    return 3;
  }
  return 4;
}

/**
 * Label | number-button row (Blender-style).
 * - Finite min+max → in-field fill, no step chevrons.
 * - Otherwise → chevron scrub shell.
 * - Wheel only while Alt is held (plain scroll does not change the value).
 */
export function TRNLabeledScrubNumberField(props: TRNLabeledScrubNumberFieldProps) {
  const {
    label,
    hint,
    labelColumnClassName,
    labelLeading,
    labelTrailing,
    ariaLabel,
    className,
    size = "field",
    appearance,
    interaction,
    step,
    fractionDigits,
    ...rest
  } = props;

  const resolvedFractionDigits =
    fractionDigits ?? (typeof step === "number" ? fractionDigitsFromStep(step) : undefined);

  const labelText = (
    <span className={twMerge(TRN_FIELD_CONTROL_LABEL_CLASS, "min-w-0 truncate")}>{label}</span>
  );

  const labelNode =
    hint != null && hint.length > 0 ? (
      <TRNHintTooltip
        trigger={<span className="cursor-help truncate">{labelText}</span>}
        content={hint}
        triggerAriaLabel={`About ${label}`}
        placement="left"
        triggerWrapper="span"
        triggerClassName="!justify-start !p-0"
        wide={hint.length > 120}
      />
    ) : (
      labelText
    );

  return (
    <div className={twMerge("flex w-full min-w-0 select-none items-center gap-3", className)}>
      <div
        className={twMerge(
          "flex shrink-0 items-center gap-1 truncate",
          labelColumnClassName ?? "w-28",
        )}
      >
        {labelLeading}
        {labelNode}
        {labelTrailing}
      </div>
      <div className="min-w-0 flex-1">
        <TRNScrubNumberField
          {...rest}
          step={step}
          fractionDigits={resolvedFractionDigits}
          ariaLabel={ariaLabel ?? label}
          size={size}
          className="w-full"
          appearance={{ ...TRN_LABELED_SCRUB_NUMBER_FIELD_APPEARANCE, ...appearance }}
          interaction={{ ...TRN_LABELED_SCRUB_NUMBER_FIELD_INTERACTION, ...interaction }}
        />
      </div>
    </div>
  );
}
