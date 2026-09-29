import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  MoveHorizontal,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Unlock,
  X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import {
  TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX,
  TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
  TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
  TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD,
  TRNScrubNumberInput,
  clampTrnNumberToRange,
  coerceTrnScrubActivationThresholdPx,
  coerceTrnScrubDragPxPerStep,
  isTrnNumberOutOfRange,
  type TRNScrubInteractionConfig,
} from "./TRNScrubNumberInput.js";
import { TRNMenuItemButton, TRNMenuPanel, TRNMenuSectionTitle } from "./TRNMenu.js";
import { TRNToggleSwitch } from "./TRNToggleSwitch.js";
import { TRNContextDialog } from "./TRNContextDialog.js";
import { TRNTooltip } from "./TRNTooltip.js";
import { TRN_FIELD_CONTROL_LABEL_CLASS } from "./trnFieldControlClasses.js";
import { TRNScrubSliderRail } from "./TRNScrubSliderRail.js";
import { computeFixedCursorMenuPlacement } from "./hooks/useFixedMenuAnchor.js";
import {
  loadTrnScrubNumberFieldGlobalSettings,
  loadTrnScrubNumberFieldLocalSettings,
  saveTrnScrubNumberFieldGlobalSettings,
  saveTrnScrubNumberFieldLocalSettings,
  TRN_SCRUB_GLOBAL_SETTINGS_EVENT,
  type TrnScrubNumberFieldGlobalSettingsV1,
  type TrnScrubNumberFieldLocalSettingsV1,
} from "./trnScrubNumberFieldStorage.js";
import { TRNScrubNumberFieldSettingsPanel } from "./TRNScrubNumberFieldSettingsPanel.js";

export type TRNScrubNumberFieldIconVisibility = "hidden" | "always" | "hover";

export type TRNScrubNumberFieldControlStyle = "scrub" | "slider";

export type {
  TRNScrubNumberFieldFillStyle,
  TrnScrubInFieldFillGradientV1,
  TrnScrubInFieldFillStopV1,
} from "./trnScrubInFieldFill.js";
import {
  clampTrnScrubInFieldFillGradient,
  TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT,
  trnScrubInFieldFillPaint,
  type TRNScrubNumberFieldFillStyle,
  type TrnScrubInFieldFillGradientV1,
} from "./trnScrubInFieldFill.js";

export {
  TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT,
  TRN_SCRUB_IN_FIELD_FILL_PRESETS,
  TRN_SCRUB_IN_FIELD_FILL_STOP_MAX,
  TRN_SCRUB_IN_FIELD_FILL_STOP_MIN,
  clampTrnScrubInFieldFillGradient,
  clampTrnScrubInFieldFillStop,
  cloneTrnScrubInFieldFillPreset,
  trnScrubInFieldFillPaint,
  trnScrubInFieldFillPreviewStyle,
} from "./trnScrubInFieldFill.js";

export type TRNScrubNumberFieldAppearance = {
  variant?: "minimal" | "full";
  controlStyle?: TRNScrubNumberFieldControlStyle;
  /** When false, style is fixed (no Slider/Scrub menu). Compact XYZ badges set this. */
  controlStyleSwitchEnabled?: boolean;
  /**
   * When true and min/max form a finite span, paint Blender-style fill inside the scrub shell
   * and hide step chevrons (unlabeled scrub box / labeled scrub value box).
   */
  inFieldFillWhenBounded?: boolean;
  /** Fill paint style when {@link inFieldFillWhenBounded} is active. */
  inFieldFillStyle?: TRNScrubNumberFieldFillStyle;
  /** Editable gradient (used when style is `custom`, also seeded from presets). */
  inFieldFillGradient?: TrnScrubInFieldFillGradientV1;
  stepButtonsVisibility?: TRNScrubNumberFieldIconVisibility;
  lockIconVisibility?: TRNScrubNumberFieldIconVisibility;
  resetIconVisibility?: TRNScrubNumberFieldIconVisibility;
  clearIconVisibility?: TRNScrubNumberFieldIconVisibility;
};

/** Factory look: Scrub chrome by default (operators can switch to Slider via context menu). */
export const TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE: Required<TRNScrubNumberFieldAppearance> = {
  variant: "full",
  controlStyle: "scrub",
  controlStyleSwitchEnabled: true,
  inFieldFillWhenBounded: false,
  inFieldFillStyle: "soft-gradient",
  inFieldFillGradient: TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT,
  stepButtonsVisibility: "hover",
  lockIconVisibility: "always",
  resetIconVisibility: "always",
  clearIconVisibility: "hidden",
};

export type TRNScrubNumberFieldWheelBoundedMode = "step" | "span-percent";

export type TRNScrubNumberFieldInteraction = TRNScrubInteractionConfig & {
  pointerScrubEnabled?: boolean;
  dragSensitivityPreset?: "slow" | "normal" | "fast" | "custom";
  wheelEnabled?: boolean;
  /** When true, wheel only adjusts while Alt is held. */
  wheelRequiresAlt?: boolean;
  wheelUnboundedStep?: number;
  wheelBoundedMode?: TRNScrubNumberFieldWheelBoundedMode;
  shiftMultiplier?: number;
  ctrlOrCmdMultiplier?: number;
};

export type TRNScrubNumberFieldProps = {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  fractionDigits?: number;
  disabled?: boolean;
  locked?: boolean;
  onLockedChange?: (locked: boolean) => void;
  defaultValue?: number;
  ariaLabel?: string;
  /** When set, the field owns label layout (wide vs stacked) for scrub and slider. */
  label?: ReactNode;
  className?: string;
  inputClassName?: string;
  /** `field` — 13px value text + `py-1` shell; matches {@link TRNSelect} `variant="field"` triggers. */
  size?: TRNScrubNumberFieldSize;
  appearance?: TRNScrubNumberFieldAppearance;
  interaction?: TRNScrubNumberFieldInteraction;
  /** Optional persistence key for saving settings. */
  settingsKey?: string;
  /** When set, renders a clear control inside the shell (optional bounds). */
  onClear?: () => void;
  clearAriaLabel?: string;
  /** Override built-in reset-to-`defaultValue` behavior. */
  onReset?: () => void;
  resetAriaLabel?: string;
  /** Strip outer shell chrome — parent provides border (e.g. {@link TRNBadgedScrubNumberField}). */
  embedded?: boolean;
  /**
   * After pointer scrub ends — commit deferred work (physics) while `onChange` stays live for UI.
   */
  onChangeEnd?: () => void;
};

const FIELD_SHELL_BASE =
  "group/trnScrubField flex min-w-0 w-full items-center gap-1 rounded border border-zinc-700/80 bg-zinc-950/45 px-1 py-1";

/** Label + chrome row — same 24px height in scrub and slider so lock/reset align. */
const LABELED_HEADER_ROW_CLASS =
  "grid min-h-6 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1";

const LABELED_HEADER_CHROME_CLASS =
  "flex min-w-0 items-center justify-end gap-0.5 justify-self-end";

const ICON_BTN_BASE_MD =
  "nodrag inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-transparent p-0 text-zinc-400 outline-none transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-50";

const ICON_BTN_BASE_SM =
  "nodrag inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-transparent p-0 text-zinc-400 outline-none transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-50";

export type TRNScrubNumberFieldSize = "sm" | "md" | "field";

function scrubIconBtnClass(size: TRNScrubNumberFieldSize): string {
  return size === "sm" ? ICON_BTN_BASE_SM : ICON_BTN_BASE_MD;
}

function scrubFieldLayout(size: TRNScrubNumberFieldSize): {
  shellClass: string;
  inputSizeClass: string;
  iconSizeClass: string;
} {
  if (size === "field") {
    return {
      shellClass: "px-1 py-1",
      inputSizeClass: "text-[13px] font-normal leading-tight",
      iconSizeClass: "h-3 w-3",
    };
  }
  if (size === "sm") {
    return {
      shellClass: "px-1 py-[3px]",
      inputSizeClass: "text-[10px]",
      iconSizeClass: "h-2.5 w-2.5",
    };
  }
  return {
    shellClass: "px-1 py-1",
    inputSizeClass: "text-[11px]",
    iconSizeClass: "h-3 w-3",
  };
}

/** Lock toggle — unlocked = editable (green tint), locked = blocked (red tint). */
const LOCK_BTN_UNLOCKED_TONE =
  "bg-emerald-500/15 text-emerald-300/95 hover:bg-emerald-500/25 hover:text-emerald-100";
const LOCK_BTN_LOCKED_TONE =
  "bg-red-500/15 text-red-300/95 hover:bg-red-500/25 hover:text-red-100";

const STEP_BTN_TONE =
  "border border-zinc-700/70 bg-zinc-900/55 hover:border-zinc-600/80 hover:bg-zinc-800/70";

const MENU_Z_INDEX = 2200;
/** `w-64` menu panel — used to clamp before the first layout measure. */
const SCRUB_CONTEXT_MENU_EST_WIDTH_PX = 256;
const SCRUB_CONTEXT_MENU_EST_HEIGHT_PX = 240;

const DRAG_SENSITIVITY_PRESETS: Record<
  "slow" | "normal" | "fast" | "custom",
  { h: number; v: number; thr: number }
> = {
  /** More px per step → slower. */
  slow: { h: 24, v: 12, thr: 2 },
  normal: {
    h: TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
    v: TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
    thr: TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX,
  },
  /** Fewer px per step → faster. */
  fast: { h: 6, v: 3, thr: 1 },
  custom: {
    h: TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
    v: TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
    thr: TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX,
  },
};

function scrubFieldIconHoverClass(visibility: TRNScrubNumberFieldIconVisibility): string {
  return visibility === "hover"
    ? "opacity-0 group-hover/trnScrubField:opacity-100 group-focus-within/trnScrubField:opacity-100"
    : "";
}

function scrubValuesEqual(a: number, b: number, fractionDigits?: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return false;
  }
  if (fractionDigits != null && fractionDigits >= 0) {
    const quantum = Math.pow(10, -fractionDigits) / 2;
    return Math.abs(a - b) <= quantum;
  }
  return a === b;
}

function finiteSpan(min?: number, max?: number): number | null {
  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return null;
  }
  const span = max - min;
  return span > 0 ? span : null;
}

/** Product default is always Scrub; min/max no longer auto-select Slider. */
export function defaultTrnScrubNumberFieldControlStyle(
  _min?: number,
  _max?: number,
): TRNScrubNumberFieldControlStyle {
  return "scrub";
}

export function TRNScrubNumberField(props: TRNScrubNumberFieldProps) {
  const {
    value,
    onChange,
    step,
    min,
    max,
    fractionDigits,
    disabled = false,
    locked: lockedProp,
    onLockedChange,
    defaultValue,
    ariaLabel,
    label,
    className,
    inputClassName,
    size = "md",
    appearance,
    interaction,
    settingsKey,
    onClear,
    clearAriaLabel,
    onReset,
    resetAriaLabel,
    embedded = false,
    onChangeEnd,
  } = props;

  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<{ x: number; y: number } | null>(null);

  const [localLocked, setLocalLocked] = useState(false);
  const locked = lockedProp ?? localLocked;
  /** True while the value is focused for typing — Blender hides the range fill. */
  const [valueEditing, setValueEditing] = useState(false);

  const storedLocal = useMemo(
    () => (settingsKey ? loadTrnScrubNumberFieldLocalSettings(settingsKey) : null),
    [settingsKey],
  );

  const [localSettings, setLocalSettings] = useState<TrnScrubNumberFieldLocalSettingsV1>(
    () => ({
      version: 1,
      valueRules: {
        min: storedLocal?.valueRules?.min,
        max: storedLocal?.valueRules?.max,
        step: storedLocal?.valueRules?.step,
        stepAuto: storedLocal?.valueRules?.stepAuto ?? true,
      },
      controlStyle: storedLocal?.controlStyle,
    }),
  );

  const [globalSettings, setGlobalSettings] = useState<TrnScrubNumberFieldGlobalSettingsV1>(
    () => loadTrnScrubNumberFieldGlobalSettings() ?? { version: 1 },
  );

  useEffect(() => {
    setLocalSettings({
      version: 1,
      valueRules: {
        min: storedLocal?.valueRules?.min,
        max: storedLocal?.valueRules?.max,
        step: storedLocal?.valueRules?.step,
        stepAuto: storedLocal?.valueRules?.stepAuto ?? true,
      },
      controlStyle: storedLocal?.controlStyle,
    });
  }, [storedLocal]);

  useEffect(() => {
    const onGlobal = (ev: Event) => {
      const detail = (ev as CustomEvent<TrnScrubNumberFieldGlobalSettingsV1>).detail;
      if (detail?.version === 1) {
        setGlobalSettings(detail);
      } else {
        const next = loadTrnScrubNumberFieldGlobalSettings();
        if (next) setGlobalSettings(next);
      }
    };
    window.addEventListener(TRN_SCRUB_GLOBAL_SETTINGS_EVENT, onGlobal);
    return () => window.removeEventListener(TRN_SCRUB_GLOBAL_SETTINGS_EVENT, onGlobal);
  }, []);

  const commitLocal = (next: TrnScrubNumberFieldLocalSettingsV1) => {
    setLocalSettings(next);
    if (settingsKey) saveTrnScrubNumberFieldLocalSettings(settingsKey, next);
  };

  const commitGlobal = (next: TrnScrubNumberFieldGlobalSettingsV1) => {
    setGlobalSettings(next);
    saveTrnScrubNumberFieldGlobalSettings(next);
  };

  const controlStyleSwitchEnabled =
    appearance?.controlStyleSwitchEnabled ??
    TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.controlStyleSwitchEnabled;

  const mergedAppearance: Required<TRNScrubNumberFieldAppearance> = {
    variant:
      globalSettings.appearance?.variant ??
      appearance?.variant ??
      TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.variant,
    controlStyle: !controlStyleSwitchEnabled
      ? (appearance?.controlStyle ?? "scrub")
      : (localSettings.controlStyle ??
        appearance?.controlStyle ??
        defaultTrnScrubNumberFieldControlStyle(min, max)),
    controlStyleSwitchEnabled,
    inFieldFillWhenBounded:
      globalSettings.appearance?.inFieldFillWhenBounded ??
      appearance?.inFieldFillWhenBounded ??
      TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.inFieldFillWhenBounded,
    inFieldFillStyle:
      globalSettings.appearance?.inFieldFillStyle ??
      appearance?.inFieldFillStyle ??
      TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.inFieldFillStyle,
    inFieldFillGradient: clampTrnScrubInFieldFillGradient(
      globalSettings.appearance?.inFieldFillGradient ??
        appearance?.inFieldFillGradient ??
        TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.inFieldFillGradient,
    ),
    stepButtonsVisibility:
      globalSettings.appearance?.stepButtonsVisibility ??
      appearance?.stepButtonsVisibility ??
      TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.stepButtonsVisibility,
    lockIconVisibility:
      globalSettings.appearance?.lockIconVisibility ??
      appearance?.lockIconVisibility ??
      TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.lockIconVisibility,
    resetIconVisibility:
      globalSettings.appearance?.resetIconVisibility ??
      appearance?.resetIconVisibility ??
      TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.resetIconVisibility,
    clearIconVisibility:
      globalSettings.appearance?.clearIconVisibility ??
      appearance?.clearIconVisibility ??
      TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.clearIconVisibility,
  };

  const mergedInteraction: Required<TRNScrubNumberFieldInteraction> = {
    pointerScrubEnabled:
      globalSettings.interaction?.pointerScrubEnabled ??
      interaction?.pointerScrubEnabled ??
      true,
    wheelEnabled:
      globalSettings.interaction?.wheelEnabled ?? interaction?.wheelEnabled ?? true,
    wheelRequiresAlt:
      globalSettings.interaction?.wheelRequiresAlt ??
      interaction?.wheelRequiresAlt ??
      false,
    wheelUnboundedStep:
      globalSettings.interaction?.wheelUnboundedStep ??
      interaction?.wheelUnboundedStep ??
      1,
    wheelBoundedMode:
      globalSettings.interaction?.wheelBoundedMode ??
      interaction?.wheelBoundedMode ??
      "span-percent",
    shiftMultiplier:
      globalSettings.interaction?.shiftMultiplier ?? interaction?.shiftMultiplier ?? 0.1,
    ctrlOrCmdMultiplier:
      globalSettings.interaction?.ctrlOrCmdMultiplier ??
      interaction?.ctrlOrCmdMultiplier ??
      10,
    horizontalPxPerTenthPercent: coerceTrnScrubDragPxPerStep(
      globalSettings.interaction?.horizontalPxPerTenthPercent ??
        interaction?.horizontalPxPerTenthPercent,
      TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
    ),
    verticalPxPerPercent: coerceTrnScrubDragPxPerStep(
      globalSettings.interaction?.verticalPxPerPercent ??
        interaction?.verticalPxPerPercent,
      TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
    ),
    scrubActivationThresholdPx: coerceTrnScrubActivationThresholdPx(
      globalSettings.interaction?.scrubActivationThresholdPx ??
        interaction?.scrubActivationThresholdPx,
    ),
    wheelPixelAccumThreshold:
      globalSettings.interaction?.wheelPixelAccumThreshold ??
      interaction?.wheelPixelAccumThreshold ??
      TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD,
    dragSensitivityPreset:
      globalSettings.interaction?.dragSensitivityPreset ?? "normal",
  };

  const dragPreset = mergedInteraction.dragSensitivityPreset;
  const effectiveDragH =
    dragPreset === "custom"
      ? mergedInteraction.horizontalPxPerTenthPercent
      : DRAG_SENSITIVITY_PRESETS[dragPreset].h;
  const effectiveDragV =
    dragPreset === "custom"
      ? mergedInteraction.verticalPxPerPercent
      : DRAG_SENSITIVITY_PRESETS[dragPreset].v;
  const effectiveDragThr =
    dragPreset === "custom"
      ? mergedInteraction.scrubActivationThresholdPx
      : DRAG_SENSITIVITY_PRESETS[dragPreset].thr;

  const effectiveMin =
    typeof min === "number" ? min : localSettings.valueRules?.min;
  const effectiveMax =
    typeof max === "number" ? max : localSettings.valueRules?.max;
  const effectiveStepProp =
    typeof step === "number"
      ? step
      : localSettings.valueRules?.stepAuto === false
        ? localSettings.valueRules?.step
        : undefined;

  const { shellClass, inputSizeClass, iconSizeClass } = scrubFieldLayout(size);
  const iconBtnClass = scrubIconBtnClass(size);

  const stepButtonsVisibleClass = scrubFieldIconHoverClass(mergedAppearance.stepButtonsVisibility);
  const lockVisibleClass = scrubFieldIconHoverClass(mergedAppearance.lockIconVisibility);
  const resetVisibleClass = scrubFieldIconHoverClass(mergedAppearance.resetIconVisibility);
  const clearVisibleClass = scrubFieldIconHoverClass(mergedAppearance.clearIconVisibility);

  useEffect(() => {
    if (menuAnchor == null) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuAnchor(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAnchor(null);
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuAnchor]);

  useLayoutEffect(() => {
    if (menuAnchor == null) {
      setMenuPos(null);
      return;
    }
    const place = () => {
      const panel = menuRef.current;
      const width = panel != null && panel.offsetWidth > 0
        ? panel.offsetWidth
        : SCRUB_CONTEXT_MENU_EST_WIDTH_PX;
      const height = panel != null && panel.offsetHeight > 0
        ? panel.offsetHeight
        : SCRUB_CONTEXT_MENU_EST_HEIGHT_PX;
      setMenuPos(
        computeFixedCursorMenuPlacement(menuAnchor.x, menuAnchor.y, width, height),
      );
    };
    place();
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("resize", place);
    };
  }, [menuAnchor]);

  const setLocked = (next: boolean) => {
    if (onLockedChange) {
      onLockedChange(next);
    } else {
      setLocalLocked(next);
    }
  };

  const effectiveStep = useMemo(() => {
    if (typeof effectiveStepProp === "number" && Number.isFinite(effectiveStepProp) && effectiveStepProp > 0) {
      return effectiveStepProp;
    }
    const span = finiteSpan(effectiveMin, effectiveMax);
    if (span != null) {
      return Math.max(1e-6, span / 256);
    }
    return 1;
  }, [effectiveMax, effectiveMin, effectiveStepProp]);

  const stepMultiplierForEvent = (e: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) => {
    let mult = 1;
    if (e.shiftKey) mult *= mergedInteraction.shiftMultiplier;
    if (e.ctrlKey || e.metaKey) mult *= mergedInteraction.ctrlOrCmdMultiplier;
    return mult;
  };

  const onWheelCapture = (e: React.WheelEvent) => {
    if (!mergedInteraction.wheelEnabled || disabled || locked) return;
    if (mergedInteraction.wheelRequiresAlt && !e.altKey) return;
    // Let TRNScrubNumberInput handle its own wheel if desired. We intercept only to
    // support bounded-mode selection.
    const span = finiteSpan(effectiveMin, effectiveMax);
    if (span != null && mergedInteraction.wheelBoundedMode === "step") {
      e.preventDefault();
      e.stopPropagation();
      const dir = Math.sign(-e.deltaY);
      if (dir === 0) return;
      const mult = stepMultiplierForEvent(e);
      onChange(Number.isFinite(value) ? value + effectiveStep * dir * mult : 0);
    }
  };

  const showFull = mergedAppearance.variant === "full";
  const sliderSpanEarly = finiteSpan(effectiveMin, effectiveMax);
  const showInFieldFill =
    mergedAppearance.inFieldFillWhenBounded &&
    mergedAppearance.controlStyle === "scrub" &&
    sliderSpanEarly != null;
  const showStepButtons =
    showFull &&
    mergedAppearance.stepButtonsVisibility !== "hidden" &&
    !showInFieldFill;
  const showLockToggle = showFull && mergedAppearance.lockIconVisibility !== "hidden";
  const resetTarget =
    defaultValue != null && Number.isFinite(defaultValue) ? defaultValue : null;
  const canReset = onReset != null || resetTarget != null;
  const showResetIcon = canReset && mergedAppearance.resetIconVisibility !== "hidden";
  const showClearIcon =
    onClear != null && mergedAppearance.clearIconVisibility !== "hidden";
  const resetAlreadyAtDefault =
    resetTarget != null &&
    onReset == null &&
    scrubValuesEqual(value, resetTarget, fractionDigits);

  const runReset = () => {
    if (disabled || locked) {
      return;
    }
    if (onReset != null) {
      onReset();
      return;
    }
    if (resetTarget != null) {
      onChange(resetTarget);
    }
  };

  const onFieldContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.getSelection()?.removeAllRanges();
    const active = document.activeElement;
    if (
      active instanceof HTMLInputElement &&
      active.dataset.trnScrubInput === "1" &&
      typeof active.selectionStart === "number"
    ) {
      const caret = active.selectionStart;
      active.setSelectionRange(caret, caret);
    }
    const cursor = { x: e.clientX, y: e.clientY };
    setMenuAnchor(cursor);
    setMenuPos(
      computeFixedCursorMenuPlacement(
        cursor.x,
        cursor.y,
        SCRUB_CONTEXT_MENU_EST_WIDTH_PX,
        SCRUB_CONTEXT_MENU_EST_HEIGHT_PX,
      ),
    );
  };

  const sliderSpan = sliderSpanEarly;
  const outOfRange = isTrnNumberOutOfRange(value, effectiveMin, effectiveMax);
  const valueToneClass = outOfRange ? "text-amber-400" : "";
  const oorHint =
    outOfRange && sliderSpan != null
      ? `Outside range (${effectiveMin} … ${effectiveMax})`
      : outOfRange
        ? "Outside range"
        : null;

  const scrubShellClass = twMerge(
    embedded
      ? "group/trnScrubField relative flex h-full min-h-0 min-w-0 w-full flex-1 items-center gap-0.5 overflow-hidden"
      : twMerge(FIELD_SHELL_BASE, "relative"),
    embedded ? "" : shellClass,
  );

  const inFieldFillPercent =
    showInFieldFill &&
    !valueEditing &&
    sliderSpan != null &&
    typeof effectiveMin === "number"
      ? Math.min(
          100,
          Math.max(
            0,
            ((clampTrnNumberToRange(
              Number.isFinite(value) ? value : effectiveMin,
              effectiveMin,
              effectiveMax as number,
            ) -
              effectiveMin) /
              sliderSpan) *
              100,
          ),
        )
      : null;

  const inFieldFillLayer =
    inFieldFillPercent != null ? (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[2px] overflow-hidden rounded-[2px]"
      >
        {/*
          Paint the gradient across the full track (stop at% = value%). Mask
          reveals only 0→value so mid fills never stretch max-stop colors into
          the short fill width (which looked like a hard step to red-orange).
        */}
        <div
          className="h-full w-full rounded-[inherit]"
          style={{
            ...trnScrubInFieldFillPaint(
              mergedAppearance.inFieldFillStyle,
              mergedAppearance.inFieldFillGradient,
            ),
            WebkitMaskImage: `linear-gradient(90deg, #000 0%, #000 ${inFieldFillPercent}%, transparent ${inFieldFillPercent}%)`,
            maskImage: `linear-gradient(90deg, #000 0%, #000 ${inFieldFillPercent}%, transparent ${inFieldFillPercent}%)`,
          }}
        />
      </div>
    ) : null;

  const stepDown = () => {
    if (disabled || locked) return;
    onChange((Number.isFinite(value) ? value : 0) - effectiveStep);
  };

  const stepUp = () => {
    if (disabled || locked) return;
    onChange((Number.isFinite(value) ? value : 0) + effectiveStep);
  };

  const menu = portalTarget && menuAnchor ? (
    createPortal(
      <div
        ref={menuRef}
        className="pointer-events-auto fixed z-2200 flex animate-in fade-in zoom-in-95 duration-100"
        style={
          {
            top: menuPos?.top ?? menuAnchor.y,
            left: menuPos?.left ?? menuAnchor.x,
          } as CSSProperties
        }
        onClick={(e) => e.stopPropagation()}
      >
        <TRNMenuPanel tone="glass-dropdown" className="w-64 p-1.5">
          {mergedAppearance.controlStyleSwitchEnabled ? (
            <>
              <TRNMenuSectionTitle spacing="labelOnly">Style</TRNMenuSectionTitle>
              <div className="mt-1 space-y-1">
                {([
                  {
                    id: "scrub" as const,
                    label: "Scrub",
                    icon: <MoveHorizontal className="h-4 w-4 text-zinc-300" aria-hidden strokeWidth={2.25} />,
                  },
                  {
                    id: "slider" as const,
                    label: "Slider",
                    icon: (
                      <SlidersHorizontal className="h-4 w-4 text-zinc-300" aria-hidden strokeWidth={2.25} />
                    ),
                  },
                ]).map((o) => {
                  const active = mergedAppearance.controlStyle === o.id;
                  return (
                    <TRNMenuItemButton
                      key={o.id}
                      tone="glass-dropdown"
                      label={o.label}
                      icon={o.icon}
                      rightSlot={
                        active ? (
                          <Check className="h-3.5 w-3.5 text-cyan-300" aria-hidden strokeWidth={2.25} />
                        ) : null
                      }
                      onClick={() => {
                        commitLocal({ ...localSettings, controlStyle: o.id });
                        setMenuAnchor(null);
                        if (o.id === "slider" && finiteSpan(effectiveMin, effectiveMax) == null) {
                          requestAnimationFrame(() => {
                            setSettingsAnchor(menuAnchor);
                            setSettingsOpen(true);
                          });
                        }
                      }}
                    />
                  );
                })}
              </div>
            </>
          ) : null}
          <TRNMenuSectionTitle
            spacing={mergedAppearance.controlStyleSwitchEnabled ? "menuNext" : "labelOnly"}
          >
            Scrub field
          </TRNMenuSectionTitle>
          <div className="mt-1 space-y-1">
            <TRNMenuItemButton
              tone="glass-dropdown"
              label={locked ? "Unlock" : "Lock"}
              icon={
                locked ? (
                  <Lock className="h-4 w-4 text-zinc-300" aria-hidden strokeWidth={2.25} />
                ) : (
                  <Unlock className="h-4 w-4 text-zinc-300" aria-hidden strokeWidth={2.25} />
                )
              }
              onClick={() => {
                setLocked(!locked);
                setMenuAnchor(null);
              }}
            />
            <TRNMenuItemButton
              tone="glass-dropdown"
              label="Reset to default"
              icon={<RotateCcw className="h-4 w-4 text-zinc-300" aria-hidden strokeWidth={2.25} />}
              disabled={defaultValue == null || disabled || locked}
              onClick={() => {
                if (defaultValue == null) return;
                onChange(defaultValue);
                setMenuAnchor(null);
              }}
            />
            <TRNMenuItemButton
              tone="glass-dropdown"
              label="Settings…"
              icon={<Settings2 className="h-4 w-4 text-zinc-300" aria-hidden strokeWidth={2.25} />}
              onClick={() => {
                setMenuAnchor(null);
                requestAnimationFrame(() => {
                  setSettingsAnchor(menuAnchor);
                  setSettingsOpen(true);
                });
              }}
            />
          </div>
        </TRNMenuPanel>
      </div>,
      portalTarget,
    )
  ) : null;

  const settingsDialog = (
    <TRNContextDialog
      open={settingsOpen}
      onOpenChange={(open) => {
        setSettingsOpen(open);
        if (!open) {
          setSettingsAnchor(null);
        }
      }}
      title="Scrub settings"
      anchor={settingsAnchor}
      widthPx={460}
      zIndex={MENU_Z_INDEX + 6}
    >
      <TRNScrubNumberFieldSettingsPanel
        local={localSettings}
        global={globalSettings}
        onLocalChange={commitLocal}
        onGlobalChange={commitGlobal}
        resolvedAppearance={mergedAppearance}
        resolvedInteraction={mergedInteraction}
        dragPresets={DRAG_SENSITIVITY_PRESETS}
        effectiveStep={effectiveStep}
        controlStyleSwitchEnabled={controlStyleSwitchEnabled}
        liveMin={typeof min === "number" ? min : undefined}
        liveMax={typeof max === "number" ? max : undefined}
        hasSettingsKey={Boolean(settingsKey)}
      />
    </TRNContextDialog>
  );

  const chromeLeading = (
    <>
      {showStepButtons ? (
        <button
          type="button"
          className={twMerge(
            iconBtnClass,
            STEP_BTN_TONE,
            mergedAppearance.stepButtonsVisibility === "always" ? "" : stepButtonsVisibleClass,
          )}
          aria-label="Step down"
          tabIndex={-1}
          disabled={disabled || locked}
          onClick={(e) => {
            e.preventDefault();
            stepDown();
          }}
        >
          <ChevronLeft className={iconSizeClass} aria-hidden strokeWidth={2.25} />
        </button>
      ) : null}
    </>
  );

  const chromeTrailing = (
    <>
      {showStepButtons ? (
        <button
          type="button"
          className={twMerge(
            iconBtnClass,
            STEP_BTN_TONE,
            mergedAppearance.stepButtonsVisibility === "always" ? "" : stepButtonsVisibleClass,
          )}
          aria-label="Step up"
          tabIndex={-1}
          disabled={disabled || locked}
          onClick={(e) => {
            e.preventDefault();
            stepUp();
          }}
        >
          <ChevronRight className={iconSizeClass} aria-hidden strokeWidth={2.25} />
        </button>
      ) : null}
      {showLockToggle ? (
        <button
          type="button"
          className={twMerge(
            iconBtnClass,
            locked ? LOCK_BTN_LOCKED_TONE : LOCK_BTN_UNLOCKED_TONE,
            mergedAppearance.lockIconVisibility === "always" ? "" : lockVisibleClass,
          )}
          aria-label={locked ? "Unlock value" : "Lock value"}
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            setLocked(!locked);
          }}
        >
          {locked ? (
            <Lock className={iconSizeClass} aria-hidden strokeWidth={2.25} />
          ) : (
            <Unlock className={iconSizeClass} aria-hidden strokeWidth={2.25} />
          )}
        </button>
      ) : null}
      {showResetIcon ? (
        <button
          type="button"
          className={twMerge(
            iconBtnClass,
            mergedAppearance.resetIconVisibility === "always" ? "" : resetVisibleClass,
          )}
          aria-label={resetAriaLabel ?? "Reset to default value"}
          tabIndex={-1}
          disabled={disabled || locked || resetAlreadyAtDefault}
          onClick={(e) => {
            e.preventDefault();
            runReset();
          }}
        >
          <RotateCcw className={iconSizeClass} aria-hidden strokeWidth={2.25} />
        </button>
      ) : null}
      {showClearIcon ? (
        <button
          type="button"
          className={twMerge(
            iconBtnClass,
            mergedAppearance.clearIconVisibility === "always" ? "" : clearVisibleClass,
          )}
          aria-label={clearAriaLabel ?? "Clear value"}
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            onClear?.();
          }}
        >
          <X className={iconSizeClass} aria-hidden strokeWidth={2.25} />
        </button>
      ) : null}
    </>
  );

  const numberInput = (align: "center" | "right", fill: boolean) => {
    const input = (
      <TRNScrubNumberInput
        value={value}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
        step={effectiveStepProp}
        min={effectiveMin}
        max={effectiveMax}
        fractionDigits={fractionDigits}
        disabled={disabled}
        locked={locked}
        pointerScrubEnabled={mergedInteraction.pointerScrubEnabled}
        wheelEnabled={mergedInteraction.wheelEnabled}
        wheelRequiresAlt={mergedInteraction.wheelRequiresAlt}
        horizontalPxPerTenthPercent={effectiveDragH}
        verticalPxPerPercent={effectiveDragV}
        scrubActivationThresholdPx={effectiveDragThr}
        wheelPixelAccumThreshold={mergedInteraction.wheelPixelAccumThreshold}
        className={fill ? "min-w-0 w-full flex-1" : "min-w-0 w-14 flex-none"}
        inputClassName={twMerge(
          inputSizeClass,
          "font-sans proportional-nums",
          align === "center" ? "text-center" : "text-right",
          valueToneClass,
          inputClassName,
        )}
        aria-label={ariaLabel}
        onEditingChange={setValueEditing}
      />
    );
    if (oorHint == null) {
      return input;
    }
    // TRNTooltip adds an outer `relative` div + padded `inline-flex` trigger. Put growth on
    // the root and neutralize trigger chrome so out-of-range wrap matches the bare input layout.
    const fillLayout = fill
      ? "min-w-0 w-full flex-1"
      : "min-w-0 w-14 flex-none";
    return (
      <TRNTooltip
        content={oorHint}
        trigger={input}
        triggerWrapper="span"
        disableHoverFx
        className={twMerge("flex items-center", fillLayout)}
        triggerClassName={twMerge(
          "!flex !rounded-none !p-0 min-w-0 w-full flex-1 items-stretch justify-stretch",
        )}
        placement="top"
        triggerAriaLabel={oorHint}
      />
    );
  };

  const labelNode =
    label != null ? (
      <span className={twMerge(TRN_FIELD_CONTROL_LABEL_CLASS, "min-w-0 shrink-0")}>{label}</span>
    ) : null;

  const isSlider = mergedAppearance.controlStyle === "slider";

  const scrubBox = (
    <div className={scrubShellClass} onWheelCapture={onWheelCapture}>
      {inFieldFillLayer}
      <div className="relative z-1 flex min-w-0 w-full flex-1 items-center gap-0.5">
        {chromeLeading}
        {numberInput("center", true)}
        {chromeTrailing}
      </div>
    </div>
  );

  const scrubValueBox = (
    <div className={scrubShellClass} onWheelCapture={onWheelCapture}>
      {inFieldFillLayer}
      <div className="relative z-1 flex min-w-0 w-full flex-1 items-center gap-0.5">
        {numberInput("center", true)}
      </div>
    </div>
  );

  const sliderBlock = (
    <div className="flex w-full min-w-0 flex-col gap-0.5 overflow-visible" onWheelCapture={onWheelCapture}>
      <div className={LABELED_HEADER_ROW_CLASS}>
        <div className="min-w-0 justify-self-start">{labelNode}</div>
        <div className="flex shrink-0 items-center justify-center">
          {numberInput("center", false)}
        </div>
        <div className={LABELED_HEADER_CHROME_CLASS}>
          {chromeLeading}
          {chromeTrailing}
        </div>
      </div>
      {sliderSpan != null ? (
        <TRNScrubSliderRail
          className="w-full"
          value={value}
          min={effectiveMin as number}
          max={effectiveMax as number}
          step={effectiveStep}
          disabled={disabled}
          locked={locked}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
          ariaLabel={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        />
      ) : (
        <div className="h-1.5 w-full rounded-full bg-zinc-800/40" />
      )}
    </div>
  );

  const scrubWithLabel = (
    <div className="flex w-full min-w-0 flex-col gap-0.5 overflow-visible">
      <div className={LABELED_HEADER_ROW_CLASS}>
        <div className="min-w-0 justify-self-start">{labelNode}</div>
        <div />
        <div className={LABELED_HEADER_CHROME_CLASS}>
          {chromeLeading}
          {chromeTrailing}
        </div>
      </div>
      {scrubValueBox}
    </div>
  );

  return (
    <>
      <div
        className={twMerge(
          "@container/trnScrub min-w-0 w-full overflow-hidden select-none",
          embedded ? "flex h-full min-h-0 items-center" : undefined,
          className,
        )}
        onContextMenu={onFieldContextMenu}
      >
        {isSlider ? sliderBlock : label != null ? scrubWithLabel : scrubBox}
      </div>
      {menu}
      {settingsDialog}
    </>
  );
}

