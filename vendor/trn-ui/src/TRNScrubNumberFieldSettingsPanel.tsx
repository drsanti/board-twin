import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { TRNColorRingPicker } from "./TRNColorRingPicker.js";
import { TRNInlineToggleRow } from "./TRNInlineToggleRow.js";
import {
  TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX,
  TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
  TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
  TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD,
  TRNScrubNumberInput,
} from "./TRNScrubNumberInput.js";
import type { TRNScrubNumberFieldIconVisibility } from "./TRNScrubNumberField.js";
import {
  clampTrnScrubInFieldFillGradient,
  cloneTrnScrubInFieldFillPreset,
  TRN_SCRUB_IN_FIELD_FILL_STOP_MAX,
  TRN_SCRUB_IN_FIELD_FILL_STOP_MIN,
  trnScrubInFieldFillPreviewStyle,
  type TRNScrubNumberFieldFillStyle,
  type TrnScrubInFieldFillGradientV1,
  type TrnScrubInFieldFillStopV1,
} from "./trnScrubInFieldFill.js";
import type {
  TrnScrubNumberFieldGlobalSettingsV1,
  TrnScrubNumberFieldLocalSettingsV1,
} from "./trnScrubNumberFieldStorage.js";

const SECTION_TITLE =
  "m-0 text-[10px] font-semibold uppercase tracking-wide text-zinc-500";

const SCOPE_BANNER =
  "m-0 rounded-md border border-zinc-700/60 bg-zinc-950/50 px-2 py-1.5 text-[10px] leading-snug text-zinc-400";

const ROW = "flex min-w-0 items-center justify-between gap-3";
const LABEL = "min-w-0 shrink text-[11px] leading-tight text-zinc-300";
const CHOICE_WRAP = "inline-flex max-w-[min(100%,18rem)] flex-wrap justify-end gap-1";
const CHOICE_BTN =
  "inline-flex h-6 min-w-10 items-center justify-center rounded-sm border px-2 text-xs font-medium " +
  "text-zinc-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50";

const FILL_DIRECTION_PRESETS: ReadonlyArray<{
  angleDeg: number;
  label: string;
  icon: ReactNode;
}> = [
  {
    angleDeg: 0,
    label: "Bottom to top",
    icon: <ArrowUp className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />,
  },
  {
    angleDeg: 45,
    label: "Diagonal up-right",
    icon: <ArrowUpRight className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />,
  },
  {
    angleDeg: 90,
    label: "Left to right",
    icon: <ArrowRight className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />,
  },
  {
    angleDeg: 135,
    label: "Diagonal down-right",
    icon: <ArrowDownRight className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />,
  },
  {
    angleDeg: 180,
    label: "Top to bottom",
    icon: <ArrowDown className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />,
  },
  {
    angleDeg: 225,
    label: "Diagonal down-left",
    icon: <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />,
  },
  {
    angleDeg: 270,
    label: "Right to left",
    icon: <ArrowLeft className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />,
  },
  {
    angleDeg: 315,
    label: "Diagonal up-left",
    icon: <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden strokeWidth={2.25} />,
  },
];

const VISIBILITY_OPTIONS: ReadonlyArray<{
  id: TRNScrubNumberFieldIconVisibility;
  label: string;
}> = [
  { id: "hidden", label: "Off" },
  { id: "always", label: "Always" },
  { id: "hover", label: "Hover" },
];

function nearestFillDirectionAngle(angleDeg: number): number | null {
  const wrapped = ((angleDeg % 360) + 360) % 360;
  for (const preset of FILL_DIRECTION_PRESETS) {
    const delta = Math.abs(wrapped - preset.angleDeg);
    if (Math.min(delta, 360 - delta) <= 0.5) {
      return preset.angleDeg;
    }
  }
  return null;
}

export type TrnScrubDragSensitivityPreset = NonNullable<
  NonNullable<TrnScrubNumberFieldGlobalSettingsV1["interaction"]>["dragSensitivityPreset"]
>;

export type TrnScrubDragSensitivityPresetMap = Record<
  TrnScrubDragSensitivityPreset,
  { h: number; v: number; thr: number }
>;

function ChoiceGroup<T extends string>(props: {
  ariaLabel: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (id: T) => void;
}) {
  return (
    <div className={CHOICE_WRAP} role="radiogroup" aria-label={props.ariaLabel}>
      {props.options.map((o) => {
        const active = props.value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={twMerge(
              CHOICE_BTN,
              active
                ? "border-cyan-500/45 bg-cyan-500/18 text-cyan-100"
                : "border-zinc-700/80 bg-zinc-900/75 text-zinc-100 hover:bg-zinc-800/75",
            )}
            onClick={() => props.onChange(o.id)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SettingsSection(props: {
  title: string;
  scope: "local" | "global";
  defaultExpanded?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(props.defaultExpanded ?? true);
  const scopeLabel = props.scope === "local" ? "This field" : "All fields";

  return (
    <section className="rounded-md border border-zinc-700/55 bg-zinc-950/35 px-2.5 py-1.5">
      <button
        type="button"
        className="flex w-full min-w-0 items-center gap-1.5 py-0.5 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <ChevronDown
          className={twMerge(
            "h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-200 ease-out",
            expanded ? "rotate-0" : "-rotate-90",
          )}
          strokeWidth={3}
          aria-hidden
        />
        <h3 className={twMerge(SECTION_TITLE, "min-w-0 flex-1")}>{props.title}</h3>
        <span
          className={twMerge(
            "shrink-0 text-[9px] font-semibold uppercase tracking-wide",
            props.scope === "local" ? "text-amber-400/90" : "text-cyan-400/90",
          )}
        >
          {scopeLabel}
        </span>
      </button>
      {expanded ? <div className="mt-1.5 space-y-2 pb-0.5">{props.children}</div> : null}
    </section>
  );
}

function SettingsRow(props: { label: string; children: ReactNode }) {
  return (
    <div className={ROW}>
      <div className={LABEL}>{props.label}</div>
      <div className="min-w-0 shrink-0">{props.children}</div>
    </div>
  );
}

function SettingsNumber(props: {
  ariaLabel: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  fractionDigits?: number;
}) {
  return (
    <div className="w-[7.5rem]">
      <TRNScrubNumberInput
        aria-label={props.ariaLabel}
        value={props.value}
        onChange={props.onChange}
        min={props.min}
        max={props.max}
        step={props.step}
        fractionDigits={props.fractionDigits}
        pointerScrubEnabled={false}
        className="w-full"
        inputClassName="text-[11px] font-sans proportional-nums text-right"
      />
    </div>
  );
}

function FillGradientEditor(props: {
  gradient: TrnScrubInFieldFillGradientV1;
  onChange: (next: TrnScrubInFieldFillGradientV1) => void;
}) {
  const gradient = clampTrnScrubInFieldFillGradient(props.gradient);

  const commit = (next: TrnScrubInFieldFillGradientV1) => {
    props.onChange(clampTrnScrubInFieldFillGradient(next));
  };

  const patchStop = (index: number, patch: Partial<TrnScrubInFieldFillStopV1>) => {
    commit({
      ...gradient,
      stops: gradient.stops.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });
  };

  const addStop = () => {
    if (gradient.stops.length >= TRN_SCRUB_IN_FIELD_FILL_STOP_MAX) return;
    const last = gradient.stops[gradient.stops.length - 1]!;
    const prev = gradient.stops[gradient.stops.length - 2] ?? last;
    commit({
      ...gradient,
      stops: [
        ...gradient.stops.slice(0, -1),
        {
          at: Math.min(99, Math.round((prev.at + last.at) / 2)),
          colorHex: prev.colorHex,
          alpha: (prev.alpha + last.alpha) / 2,
        },
        last,
      ],
    });
  };

  const removeStop = (index: number) => {
    if (gradient.stops.length <= TRN_SCRUB_IN_FIELD_FILL_STOP_MIN) return;
    commit({
      ...gradient,
      stops: gradient.stops.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-2 rounded-md border border-zinc-700/50 bg-zinc-950/40 px-2 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          Gradient
        </div>
        <button
          type="button"
          className={twMerge(
            CHOICE_BTN,
            "border-zinc-700/80 bg-zinc-900/75 text-zinc-100 hover:bg-zinc-800/75",
            gradient.stops.length >= TRN_SCRUB_IN_FIELD_FILL_STOP_MAX
              ? "cursor-not-allowed opacity-50"
              : "",
          )}
          disabled={gradient.stops.length >= TRN_SCRUB_IN_FIELD_FILL_STOP_MAX}
          onClick={addStop}
        >
          <Plus className="mr-1 h-3 w-3" aria-hidden strokeWidth={2.25} />
          Stop
        </button>
      </div>
      <div
        aria-hidden
        className="h-3 w-full rounded-sm border border-zinc-700/60"
        style={trnScrubInFieldFillPreviewStyle(gradient)}
      />
      <SettingsRow label="Direction">
        <div
          className="inline-grid max-w-[11.5rem] grid-cols-4 gap-1"
          role="radiogroup"
          aria-label="Gradient direction"
        >
          {FILL_DIRECTION_PRESETS.map((preset) => {
            const active = nearestFillDirectionAngle(gradient.angleDeg) === preset.angleDeg;
            return (
              <button
                key={preset.angleDeg}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={preset.label}
                className={twMerge(
                  CHOICE_BTN,
                  "min-w-7 px-1.5",
                  active
                    ? "border-cyan-500/45 bg-cyan-500/18 text-cyan-100"
                    : "border-zinc-700/80 bg-zinc-900/75 text-zinc-100 hover:bg-zinc-800/75",
                )}
                onClick={() => commit({ ...gradient, angleDeg: preset.angleDeg })}
              >
                {preset.icon}
              </button>
            );
          })}
        </div>
      </SettingsRow>
      <SettingsRow label="Angle">
        <SettingsNumber
          ariaLabel="Gradient angle degrees"
          value={gradient.angleDeg}
          min={0}
          max={360}
          step={1}
          fractionDigits={0}
          onChange={(n) => commit({ ...gradient, angleDeg: n })}
        />
      </SettingsRow>
      {gradient.stops.map((stop, index) => (
        <div
          key={`stop-${index}`}
          className="space-y-1.5 rounded-sm border border-zinc-800/80 bg-zinc-900/35 px-2 py-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-medium text-zinc-400">Stop {index + 1}</div>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800/80 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Remove stop ${index + 1}`}
              disabled={gradient.stops.length <= TRN_SCRUB_IN_FIELD_FILL_STOP_MIN}
              onClick={() => removeStop(index)}
            >
              <Trash2 className="h-3 w-3" aria-hidden strokeWidth={2.25} />
            </button>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <TRNColorRingPicker
              ariaLabel={`Stop ${index + 1} color`}
              valueHex={stop.colorHex}
              onValueHexChange={(hex) => patchStop(index, { colorHex: hex })}
              triggerVariant="swatch"
              size="sm"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <SettingsRow label="At %">
                <SettingsNumber
                  ariaLabel={`Stop ${index + 1} position`}
                  value={stop.at}
                  min={0}
                  max={100}
                  step={1}
                  fractionDigits={0}
                  onChange={(n) => patchStop(index, { at: n })}
                />
              </SettingsRow>
              <SettingsRow label="Opacity">
                <SettingsNumber
                  ariaLabel={`Stop ${index + 1} opacity`}
                  value={stop.alpha}
                  min={0}
                  max={1}
                  step={0.01}
                  fractionDigits={2}
                  onChange={(n) => patchStop(index, { alpha: n })}
                />
              </SettingsRow>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export type TRNScrubNumberFieldSettingsPanelProps = {
  local: TrnScrubNumberFieldLocalSettingsV1;
  global: TrnScrubNumberFieldGlobalSettingsV1;
  onLocalChange: (next: TrnScrubNumberFieldLocalSettingsV1) => void;
  onGlobalChange: (next: TrnScrubNumberFieldGlobalSettingsV1) => void;
  /** Resolved chrome / interaction (props + global). */
  resolvedAppearance: {
    variant: "minimal" | "full";
    controlStyle: "scrub" | "slider";
    inFieldFillWhenBounded: boolean;
    inFieldFillStyle: TRNScrubNumberFieldFillStyle;
    inFieldFillGradient: TrnScrubInFieldFillGradientV1;
    stepButtonsVisibility: TRNScrubNumberFieldIconVisibility;
    lockIconVisibility: TRNScrubNumberFieldIconVisibility;
    resetIconVisibility: TRNScrubNumberFieldIconVisibility;
    clearIconVisibility: TRNScrubNumberFieldIconVisibility;
  };
  resolvedInteraction: {
    pointerScrubEnabled: boolean;
    dragSensitivityPreset: TrnScrubDragSensitivityPreset;
    wheelEnabled: boolean;
    wheelRequiresAlt: boolean;
    wheelUnboundedStep: number;
    wheelBoundedMode: "step" | "span-percent";
    shiftMultiplier: number;
    ctrlOrCmdMultiplier: number;
    horizontalPxPerTenthPercent: number;
    verticalPxPerPercent: number;
    scrubActivationThresholdPx: number;
    wheelPixelAccumThreshold: number;
  };
  dragPresets: TrnScrubDragSensitivityPresetMap;
  effectiveStep: number;
  controlStyleSwitchEnabled: boolean;
  /** Live props already set min/max on this field. */
  liveMin?: number;
  liveMax?: number;
  hasSettingsKey: boolean;
};

/**
 * Scrub settings body: **Local** (this field’s min/max/step) vs **Global** (fill, chrome, drag/wheel).
 */
export function TRNScrubNumberFieldSettingsPanel(
  props: TRNScrubNumberFieldSettingsPanelProps,
) {
  const {
    local,
    global,
    onLocalChange,
    onGlobalChange,
    resolvedAppearance,
    resolvedInteraction,
    dragPresets,
    effectiveStep,
    controlStyleSwitchEnabled,
    liveMin,
    liveMax,
    hasSettingsKey,
  } = props;

  const dragPreset = resolvedInteraction.dragSensitivityPreset;
  const stepAuto = local.valueRules?.stepAuto !== false;
  const liveBounds =
    typeof liveMin === "number" &&
    Number.isFinite(liveMin) &&
    typeof liveMax === "number" &&
    Number.isFinite(liveMax);

  const patchLocal = (patch: Partial<TrnScrubNumberFieldLocalSettingsV1>) => {
    onLocalChange({ ...local, version: 1, ...patch });
  };

  const patchLocalRules = (
    patch: NonNullable<TrnScrubNumberFieldLocalSettingsV1["valueRules"]>,
  ) => {
    patchLocal({ valueRules: { ...local.valueRules, ...patch } });
  };

  const patchGlobalAppearance = (
    patch: NonNullable<TrnScrubNumberFieldGlobalSettingsV1["appearance"]>,
  ) => {
    onGlobalChange({
      ...global,
      version: 1,
      appearance: { ...global.appearance, ...patch },
    });
  };

  const patchGlobalInteraction = (
    patch: NonNullable<TrnScrubNumberFieldGlobalSettingsV1["interaction"]>,
  ) => {
    onGlobalChange({
      ...global,
      version: 1,
      interaction: { ...global.interaction, ...patch },
    });
  };

  return (
    <div className="space-y-2.5">
      <p className={SCOPE_BANNER}>
        <span className="font-semibold text-amber-400/90">This field</span> — min / max / step.{" "}
        <span className="font-semibold text-cyan-400/90">All fields</span> — fill, chrome, drag &amp;
        wheel.
      </p>

      <SettingsSection title="Value bounds" scope="local" defaultExpanded>
        {!hasSettingsKey ? (
          <p className="m-0 text-[10px] leading-snug text-amber-400/90">
            No settings key on this field — local bounds are not persisted.
          </p>
        ) : null}
        {liveBounds ? (
          <p className="m-0 text-[10px] leading-snug text-zinc-500">
            Live props already set min={liveMin} / max={liveMax}. Stored defaults apply only when
            props omit bounds.
          </p>
        ) : null}
        <SettingsRow label="Min">
          <SettingsNumber
            ariaLabel="Local min"
            value={local.valueRules?.min ?? liveMin ?? 0}
            onChange={(n) => patchLocalRules({ min: n })}
          />
        </SettingsRow>
        <SettingsRow label="Max">
          <SettingsNumber
            ariaLabel="Local max"
            value={local.valueRules?.max ?? liveMax ?? 0}
            onChange={(n) => patchLocalRules({ max: n })}
          />
        </SettingsRow>
        <TRNInlineToggleRow
          label="Auto step"
          hint="Derive step from min/max span when no explicit step is stored."
          checked={stepAuto}
          onCheckedChange={(next) => patchLocalRules({ stepAuto: next })}
          variant="plain"
          size="sm"
        />
        <SettingsRow label="Step">
          <SettingsNumber
            ariaLabel="Local step"
            value={local.valueRules?.step ?? effectiveStep}
            min={1e-6}
            step={0.001}
            onChange={(n) =>
              patchLocalRules({ step: Math.max(1e-6, n), stepAuto: false })
            }
          />
        </SettingsRow>
        {controlStyleSwitchEnabled ? (
          <SettingsRow label="Control">
            <ChoiceGroup
              ariaLabel="Local control style"
              value={local.controlStyle ?? resolvedAppearance.controlStyle}
              options={[
                { id: "scrub", label: "Scrub" },
                { id: "slider", label: "Slider" },
              ]}
              onChange={(id) => patchLocal({ controlStyle: id })}
            />
          </SettingsRow>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Look & fill" scope="global" defaultExpanded>
        <SettingsRow label="Chrome">
          <ChoiceGroup
            ariaLabel="Variant"
            value={resolvedAppearance.variant}
            options={[
              { id: "minimal", label: "Minimal" },
              { id: "full", label: "Full" },
            ]}
            onChange={(id) => patchGlobalAppearance({ variant: id })}
          />
        </SettingsRow>
        <TRNInlineToggleRow
          label="Range fill"
          hint="Soft fill inside the scrub shell when min and max exist. Hidden while typing. Applies to every scrub field."
          checked={resolvedAppearance.inFieldFillWhenBounded}
          onCheckedChange={(next) =>
            patchGlobalAppearance({ inFieldFillWhenBounded: next })
          }
          variant="plain"
          size="sm"
        />
        {resolvedAppearance.inFieldFillWhenBounded ? (
          <>
            <SettingsRow label="Fill style">
              <ChoiceGroup
                ariaLabel="Range fill style"
                value={resolvedAppearance.inFieldFillStyle}
                options={[
                  { id: "solid" as const, label: "Solid" },
                  { id: "soft-gradient" as const, label: "Gradient" },
                  { id: "edge-fade" as const, label: "Fade" },
                  { id: "custom" as const, label: "Custom" },
                ]}
                onChange={(id) => {
                  if (id === "custom") {
                    patchGlobalAppearance({
                      inFieldFillStyle: "custom",
                      inFieldFillGradient: clampTrnScrubInFieldFillGradient(
                        resolvedAppearance.inFieldFillGradient,
                      ),
                    });
                    return;
                  }
                  patchGlobalAppearance({
                    inFieldFillStyle: id,
                    inFieldFillGradient: cloneTrnScrubInFieldFillPreset(id),
                  });
                }}
              />
            </SettingsRow>
            <FillGradientEditor
              gradient={resolvedAppearance.inFieldFillGradient}
              onChange={(next) =>
                patchGlobalAppearance({
                  inFieldFillStyle: "custom",
                  inFieldFillGradient: next,
                })
              }
            />
          </>
        ) : null}
        <SettingsRow label="Step ‹ ›">
          <ChoiceGroup
            ariaLabel="Step buttons visibility"
            value={resolvedAppearance.stepButtonsVisibility}
            options={VISIBILITY_OPTIONS}
            onChange={(id) => patchGlobalAppearance({ stepButtonsVisibility: id })}
          />
        </SettingsRow>
        <SettingsRow label="Lock">
          <ChoiceGroup
            ariaLabel="Lock icon visibility"
            value={resolvedAppearance.lockIconVisibility}
            options={VISIBILITY_OPTIONS}
            onChange={(id) => patchGlobalAppearance({ lockIconVisibility: id })}
          />
        </SettingsRow>
        <SettingsRow label="Reset">
          <ChoiceGroup
            ariaLabel="Reset icon visibility"
            value={resolvedAppearance.resetIconVisibility}
            options={VISIBILITY_OPTIONS}
            onChange={(id) => patchGlobalAppearance({ resetIconVisibility: id })}
          />
        </SettingsRow>
        <SettingsRow label="Clear">
          <ChoiceGroup
            ariaLabel="Clear icon visibility"
            value={resolvedAppearance.clearIconVisibility}
            options={VISIBILITY_OPTIONS}
            onChange={(id) => patchGlobalAppearance({ clearIconVisibility: id })}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Pointer scrub" scope="global" defaultExpanded={false}>
        <TRNInlineToggleRow
          label="Drag to scrub"
          hint="Press-drag changes value; click focuses for typing."
          checked={resolvedInteraction.pointerScrubEnabled}
          onCheckedChange={(next) =>
            patchGlobalInteraction({ pointerScrubEnabled: next })
          }
          variant="plain"
          size="sm"
        />
        <SettingsRow label="Sensitivity">
          <ChoiceGroup
            ariaLabel="Drag sensitivity"
            value={dragPreset}
            options={[
              { id: "slow", label: "Slow" },
              { id: "normal", label: "Normal" },
              { id: "fast", label: "Fast" },
              { id: "custom", label: "Custom" },
            ]}
            onChange={(preset) => {
              const base = dragPresets[preset];
              patchGlobalInteraction({
                dragSensitivityPreset: preset,
                horizontalPxPerTenthPercent:
                  preset === "custom"
                    ? global.interaction?.horizontalPxPerTenthPercent
                    : base.h,
                verticalPxPerPercent:
                  preset === "custom"
                    ? global.interaction?.verticalPxPerPercent
                    : base.v,
                scrubActivationThresholdPx:
                  preset === "custom"
                    ? global.interaction?.scrubActivationThresholdPx
                    : base.thr,
              });
            }}
          />
        </SettingsRow>
        {dragPreset === "custom" ? (
          <div className="space-y-2 border-t border-zinc-700/50 pt-2">
            <SettingsRow label="H px / step">
              <SettingsNumber
                ariaLabel="Horizontal pixels per scrub step"
                value={resolvedInteraction.horizontalPxPerTenthPercent}
                min={1}
                max={120}
                step={1}
                fractionDigits={0}
                onChange={(n) =>
                  patchGlobalInteraction({
                    horizontalPxPerTenthPercent: Math.max(1, n),
                  })
                }
              />
            </SettingsRow>
            <SettingsRow label="V px / step">
              <SettingsNumber
                ariaLabel="Vertical pixels per scrub step"
                value={resolvedInteraction.verticalPxPerPercent}
                min={1}
                max={120}
                step={1}
                fractionDigits={0}
                onChange={(n) =>
                  patchGlobalInteraction({ verticalPxPerPercent: Math.max(1, n) })
                }
              />
            </SettingsRow>
            <SettingsRow label="Start threshold">
              <SettingsNumber
                ariaLabel="Activation threshold px"
                value={resolvedInteraction.scrubActivationThresholdPx}
                min={0}
                max={40}
                step={1}
                fractionDigits={0}
                onChange={(n) =>
                  patchGlobalInteraction({
                    scrubActivationThresholdPx: Math.max(0, n),
                  })
                }
              />
            </SettingsRow>
            <p className="m-0 text-[10px] leading-snug text-zinc-500">
              Defaults H {TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT} / V{" "}
              {TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT} px per step; threshold{" "}
              {TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX}px.
            </p>
          </div>
        ) : null}
        <SettingsRow label="Shift ×">
          <SettingsNumber
            ariaLabel="Shift multiplier"
            value={resolvedInteraction.shiftMultiplier}
            min={0.01}
            max={1}
            step={0.01}
            onChange={(n) =>
              patchGlobalInteraction({
                shiftMultiplier: Math.max(0.01, Math.min(1, n)),
              })
            }
          />
        </SettingsRow>
        <SettingsRow label="Ctrl/Cmd ×">
          <SettingsNumber
            ariaLabel="Ctrl or Cmd multiplier"
            value={resolvedInteraction.ctrlOrCmdMultiplier}
            min={1}
            max={100}
            step={1}
            fractionDigits={0}
            onChange={(n) =>
              patchGlobalInteraction({
                ctrlOrCmdMultiplier: Math.max(1, Math.min(100, n)),
              })
            }
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Mouse wheel" scope="global" defaultExpanded={false}>
        <TRNInlineToggleRow
          label="Enable wheel"
          hint="Mouse wheel can change the value over the field."
          checked={resolvedInteraction.wheelEnabled}
          onCheckedChange={(next) => patchGlobalInteraction({ wheelEnabled: next })}
          variant="plain"
          size="sm"
        />
        <TRNInlineToggleRow
          label="Require Alt"
          hint="Only Alt + wheel adjusts values so normal scrolling is safe."
          checked={resolvedInteraction.wheelRequiresAlt}
          onCheckedChange={(next) =>
            patchGlobalInteraction({ wheelRequiresAlt: next })
          }
          variant="plain"
          size="sm"
        />
        <SettingsRow label="Bounded mode">
          <ChoiceGroup
            ariaLabel="Bounded wheel mode"
            value={resolvedInteraction.wheelBoundedMode}
            options={[
              { id: "span-percent", label: "1% span" },
              { id: "step", label: "Step" },
            ]}
            onChange={(id) => patchGlobalInteraction({ wheelBoundedMode: id })}
          />
        </SettingsRow>
        <SettingsRow label="Pixel threshold">
          <SettingsNumber
            ariaLabel="Wheel pixel accumulator threshold"
            value={resolvedInteraction.wheelPixelAccumThreshold}
            min={1}
            max={400}
            step={1}
            fractionDigits={0}
            onChange={(n) =>
              patchGlobalInteraction({
                wheelPixelAccumThreshold: Math.max(
                  1,
                  n || TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD,
                ),
              })
            }
          />
        </SettingsRow>
        <SettingsRow label="Free step">
          <SettingsNumber
            ariaLabel="Unbounded wheel step"
            value={resolvedInteraction.wheelUnboundedStep}
            min={1e-6}
            step={0.01}
            onChange={(n) =>
              patchGlobalInteraction({ wheelUnboundedStep: Math.max(1e-6, n) })
            }
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
