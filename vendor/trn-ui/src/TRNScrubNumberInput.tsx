import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { twMerge } from "tailwind-merge";

/** Clamp to optional bounds — slider thumb mapping only, not typed/scrub/wheel commit. */
export function clampTrnNumberToRange(n: number, min?: number, max?: number): number {
  let x = n;
  if (typeof min === "number" && Number.isFinite(min)) {
    x = Math.max(min, x);
  }
  if (typeof max === "number" && Number.isFinite(max)) {
    x = Math.min(max, x);
  }
  return x;
}

export function isTrnNumberOutOfRange(n: number, min?: number, max?: number): boolean {
  if (!Number.isFinite(n)) {
    return false;
  }
  if (typeof min === "number" && Number.isFinite(min) && n < min) {
    return true;
  }
  if (typeof max === "number" && Number.isFinite(max) && n > max) {
    return true;
  }
  return false;
}

function coerceNumber(input: string, fallback: number): number {
  const v = Number(input);
  return Number.isFinite(v) ? v : fallback;
}

/**
 * Parse typed scrub text (Enter / blur). Does **not** clamp to min/max —
 * out-of-range values stay and the field paints the number amber.
 * `min` / `max` are unused (kept for call-site compatibility).
 */
export function commitTrnScrubDraftText(
  raw: string,
  fallback: number,
  _min?: number,
  _max?: number,
): number {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return fallback;
  }
  return coerceNumber(trimmed, fallback);
}

/**
 * Pointer movement (px) before a press becomes a scrub (vs click-to-type).
 * Keep low so drag feels immediate; 0 would make every click start scrubbing.
 */
export const TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX = 1;

/**
 * Horizontal drag distance (px) that applies **one step unit** (see scrub delta below).
 * Lower = more sensitive. Legacy name kept for storage / API compatibility.
 */
export const TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT = 12;

/**
 * Vertical drag distance (px) that applies **one step unit** (up increases).
 * Lower = more sensitive. Legacy name kept for storage / API compatibility.
 */
export const TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT = 6;

/** Pixel-mode wheel: accumulate |deltaY| before emitting one ±1%-of-range step. */
export const TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD = 80;

/**
 * Dispatched on `window` when a pointer scrub ends (after live `onChange` frames).
 * Hosts can flush deferred Rapier/physics work without coupling to each field.
 */
export const TRN_SCRUB_INTERACTION_END_EVENT = "trn-scrub-interaction-end";

export function notifyTrnScrubInteractionEnd(onChangeEnd?: () => void): void {
  try {
    onChangeEnd?.();
  } catch {
    // Host flush must not break scrub teardown.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TRN_SCRUB_INTERACTION_END_EVENT));
  }
}

/**
 * Optional drag / wheel tuning (constants live alongside below).
 * **Lower px** → same motion applies larger value deltas (“more sensitive”).
 */
export type TRNScrubInteractionConfig = {
  /**
   * Horizontal px per scrub step unit (legacy key `horizontalPxPerTenthPercent`).
   * Lower = faster. Default {@link TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT}.
   */
  horizontalPxPerTenthPercent?: number;
  /**
   * Vertical px per scrub step unit (legacy key `verticalPxPerPercent`).
   * Lower = faster. Default {@link TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT}.
   */
  verticalPxPerPercent?: number;
  /** Pointer movement threshold (px) before scrubbing starts. */
  scrubActivationThresholdPx?: number;
  /** Pixel-mode wheel: accumulate |deltaY| before one ±1%-of-range step; lower = faster. */
  wheelPixelAccumThreshold?: number;
};

export type TRNScrubNumberInputProps = TRNScrubInteractionConfig & {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  locked?: boolean;
  /**
   * When true, horizontal pointer drag and wheel adjust the value (legacy scrub UX).
   * Default **false** — type digits or use Arrow Up/Down only.
   */
  pointerScrubEnabled?: boolean;
  /**
   * When false, wheel does not change the value (pointer scrub may still work).
   * Default **true** when omitted so legacy callers that only set `pointerScrubEnabled` keep wheel.
   */
  wheelEnabled?: boolean;
  /** When true, wheel only adjusts the value while Alt is held (plain scroll can bubble). */
  wheelRequiresAlt?: boolean;
  /** Minimum magnitude used as scrub reference when `|value|` is tiny. */
  scrubEpsilon?: number;
  /** Fixed fractional digits (overrides span/step heuristic). */
  fractionDigits?: number;
  id?: string;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
  /**
   * Fires when the field enters/leaves text-edit focus (Blender: hide in-field fill while editing).
   */
  onEditingChange?: (editing: boolean) => void;
  /**
   * Fires after a pointer scrub ends (or is cancelled). Use to commit deferred
   * side effects (physics rebuilds) while keeping `onChange` live for UI.
   */
  onChangeEnd?: () => void;
};

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

/**
 * Legacy activation default was 4px (felt like a dead zone). Map that to the
 * snappier factory default; keep intentional custom values (≥0, ≠4).
 */
export function coerceTrnScrubActivationThresholdPx(
  raw: number | undefined,
): number {
  if (raw == null || !Number.isFinite(raw) || raw < 0) {
    return TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX;
  }
  if (raw === 4) {
    return TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX;
  }
  return raw;
}

/**
 * Legacy drag settings used ~60–140 as “px per % of |value|”.
 * New model uses ~6–24 as px-per-step — scale old values down when loading.
 */
export function coerceTrnScrubDragPxPerStep(
  raw: number | undefined,
  fallback: number,
): number {
  if (raw == null || !Number.isFinite(raw) || raw <= 0) {
    return fallback;
  }
  if (raw >= 40) {
    return Math.max(1, raw / 8);
  }
  return raw;
}

/**
 * Value change per “step unit” while pointer-scrubbing (~12px horizontal at normal).
 *
 * UI `step` is for typing / chevrons — often tiny (0.005). Using it alone makes drag
 * glacial. Map ~**6% of [min,max] span** per unit so a short drag covers the range
 * (≈ 200px for a full sweep at normal sensitivity). Never less than explicit `step`.
 */
export function resolveTrnScrubDragStepUnit(
  step: number | undefined,
  min: number | undefined,
  max: number | undefined,
  valueAtPointerDown: number,
  scrubEpsilon: number,
): number {
  const explicit =
    typeof step === "number" && Number.isFinite(step) && step > 0 ? step : null;
  const span = finiteSpan(min, max);
  if (span != null) {
    // ~16–17 units × 12px ≈ 200px to cover the full range at normal sensitivity.
    const fromSpan = span * 0.06;
    return Math.max(explicit ?? 0, fromSpan, scrubEpsilon);
  }
  if (explicit != null) {
    const fromValue = Math.max(Math.abs(valueAtPointerDown) * 0.06, scrubEpsilon);
    return Math.max(explicit, fromValue);
  }
  return Math.max(Math.abs(valueAtPointerDown) * 0.06, scrubEpsilon);
}

/** Infer decimal places from numeric `step` (e.g. 0.01 → 2, 0.5 → 1). */
export function trnFractionDigitsFromStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) {
    return 2;
  }
  const tol = 1e-10;
  for (let d = 0; d <= 10; d++) {
    const rounded = Math.round(step * 10 ** d) / 10 ** d;
    if (Math.abs(rounded - step) <= tol) {
      return d;
    }
  }
  return 4;
}

/**
 * Readable display decimals: span-based `ceil(4 - log10(S))` when `min`/`max` imply positive span,
 * else `max(2, digits inferred from step)`.
 */
export function computeTrnScrubDisplayDecimals(
  min?: number,
  max?: number,
  step: number = 0.01,
  fractionDigitsOverride?: number,
): number {
  if (
    fractionDigitsOverride != null &&
    Number.isFinite(fractionDigitsOverride) &&
    fractionDigitsOverride >= 0
  ) {
    return Math.max(0, Math.min(8, Math.round(fractionDigitsOverride)));
  }
  const span = finiteSpan(min, max);
  if (span != null) {
    const d = Math.ceil(4 - Math.log10(span));
    return Math.max(2, Math.min(6, d));
  }
  const fd = trnFractionDigitsFromStep(step);
  return Math.max(2, Math.min(6, Math.max(fd, 2)));
}

export function formatTrnScrubDisplayValue(
  value: number,
  decimals: number,
  nearZeroEps: number,
): string {
  if (!Number.isFinite(value)) {
    return (0).toFixed(decimals);
  }
  if (Math.abs(value) < nearZeroEps) {
    return (0).toFixed(decimals);
  }
  return value.toFixed(decimals);
}

function wheelModifier(e: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }): number {
  let mod = 1;
  if (e.shiftKey) {
    mod *= 0.1;
  }
  if (e.ctrlKey || e.metaKey) {
    mod *= 10;
  }
  return mod;
}

type ScrubSession = {
  pointerId: number;
  startX: number;
  startY: number;
  v0: number;
  scrubbing: boolean;
  target: HTMLInputElement;
  cursorHidden: boolean;
};

const TRN_SCRUB_CURSOR_NONE_CLASS = "trn-scrub-pointer-hidden";

let trnScrubCursorStyleInstalled = false;

function ensureTrnScrubCursorStyle(): void {
  if (trnScrubCursorStyleInstalled || typeof document === "undefined") {
    return;
  }
  trnScrubCursorStyleInstalled = true;
  const style = document.createElement("style");
  style.setAttribute("data-trn-scrub-cursor", "1");
  // Blender-style: hide the OS cursor for the whole document while scrubbing.
  style.textContent =
    `html.${TRN_SCRUB_CURSOR_NONE_CLASS},html.${TRN_SCRUB_CURSOR_NONE_CLASS} *{cursor:none!important;}`;
  document.head.appendChild(style);
}

function setTrnScrubCursorHidden(hidden: boolean): void {
  if (typeof document === "undefined") {
    return;
  }
  if (hidden) {
    ensureTrnScrubCursorStyle();
  }
  document.documentElement.classList.toggle(TRN_SCRUB_CURSOR_NONE_CLASS, hidden);
}

export function TRNScrubNumberInput(props: TRNScrubNumberInputProps) {
  const {
    value,
    onChange,
    step,
    min,
    max,
    disabled = false,
    locked = false,
    pointerScrubEnabled = false,
    wheelEnabled = true,
    wheelRequiresAlt = false,
    scrubEpsilon = 1e-9,
    fractionDigits,
    horizontalPxPerTenthPercent = TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
    verticalPxPerPercent = TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
    scrubActivationThresholdPx = TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX,
    wheelPixelAccumThreshold = TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD,
    id,
    className = "",
    inputClassName = "",
    "aria-label": ariaLabel,
    onEditingChange,
    onChangeEnd,
  } = props;

  const effectiveStep = useMemo(() => {
    if (typeof step === "number" && Number.isFinite(step) && step > 0) {
      return step;
    }
    const span = finiteSpan(min, max);
    if (span != null) {
      return Math.max(1e-6, span / 256);
    }
    return 1;
  }, [max, min, step]);

  const displayDecimals = useMemo(
    () => computeTrnScrubDisplayDecimals(min, max, effectiveStep, fractionDigits),
    [effectiveStep, fractionDigits, max, min],
  );

  const nearZeroEps = useMemo(
    () => 10 ** -(displayDecimals + 1),
    [displayDecimals],
  );

  const formattedBlurred = useMemo(() => {
    const v = Number.isFinite(value) ? value : 0;
    return formatTrnScrubDisplayValue(v, displayDecimals, nearZeroEps);
  }, [displayDecimals, nearZeroEps, value]);

  const fullPrecisionTitle = useMemo(() => {
    const v = Number.isFinite(value) ? value : 0;
    return String(v);
  }, [value]);

  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(formattedBlurred);
  const draftRef = useRef(draft);

  const sessionRef = useRef<ScrubSession | null>(null);
  const moveCleanupRef = useRef<(() => void) | null>(null);
  const wheelPixelAccumRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  /** After flushing draft on pointer down, skip duplicate parse on the scrub-induced blur. */
  const suppressBlurCommitRef = useRef(false);
  const detachWindowListeners = useCallback(() => {
    moveCleanupRef.current?.();
    moveCleanupRef.current = null;
  }, []);

  const applyScrubDelta = useCallback(
    (e: PointerEvent, s: ScrubSession) => {
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      let mod = 1;
      if (e.shiftKey) {
        mod *= 0.1;
      }
      if (e.ctrlKey || e.metaKey) {
        mod *= 10;
      }
      // Step-based scrub (not % of |value|): ~12px horizontal ≈ 1× step at normal sensitivity.
      const stepUnit = resolveTrnScrubDragStepUnit(
        step,
        min,
        max,
        s.v0,
        scrubEpsilon,
      );
      const hPx = Math.max(
        coerceTrnScrubDragPxPerStep(
          horizontalPxPerTenthPercent,
          TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
        ),
        1e-6,
      );
      const vPx = Math.max(
        coerceTrnScrubDragPxPerStep(
          verticalPxPerPercent,
          TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
        ),
        1e-6,
      );
      const delta = mod * stepUnit * (dx / hPx + (-dy) / vPx);
      onChange(s.v0 + delta);
    },
    [
      horizontalPxPerTenthPercent,
      max,
      min,
      onChange,
      scrubEpsilon,
      step,
      verticalPxPerPercent,
    ],
  );

  const setDraftFromNumber = useCallback(
    (n: number) => {
      const v = Number.isFinite(n) ? n : 0;
      const next = formatTrnScrubDisplayValue(v, displayDecimals, nearZeroEps);
      draftRef.current = next;
      setDraft(next);
    },
    [displayDecimals, nearZeroEps],
  );

  const commitDraftText = useCallback(
    (raw: string) => {
      onChange(commitTrnScrubDraftText(raw, Number.isFinite(value) ? value : 0));
    },
    [onChange, value],
  );

  // When blurred, the input renders `formattedBlurred` directly, so there is no need to
  // sync `draft` (which can create update loops during high-frequency external updates).

  useEffect(() => {
    return () => {
      const s = sessionRef.current;
      if (s != null && s.scrubbing && s.target.hasPointerCapture(s.pointerId)) {
        s.target.releasePointerCapture(s.pointerId);
      }
      if (s?.cursorHidden) {
        setTrnScrubCursorHidden(false);
      }
      sessionRef.current = null;
      detachWindowListeners();
    };
  }, [detachWindowListeners]);

  const onPointerDown = (e: ReactPointerEvent<HTMLInputElement>) => {
    // Right-click opens the field menu — do not select the value text.
    if (e.button === 2) {
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
      return;
    }
    if (!pointerScrubEnabled || e.button !== 0 || disabled || locked) {
      return;
    }
    const target = e.currentTarget;
    suppressBlurCommitRef.current = false;

    // Blender-style: do not focus / select on press — wait for click (mouseup) or drag-scrub.
    e.preventDefault();

    let v0 = Number.isFinite(value) ? value : 0;
    if (focused && !locked && !disabled) {
      const parsed = coerceNumber(draftRef.current, v0);
      v0 = parsed;
      onChange(v0);
      setDraftFromNumber(v0);
    }

    sessionRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      v0,
      scrubbing: false,
      target,
      cursorHidden: false,
    };

    const endScrubCursor = (s: ScrubSession) => {
      if (s.cursorHidden) {
        setTrnScrubCursorHidden(false);
        s.cursorHidden = false;
      }
    };

    const onMove = (evt: PointerEvent) => {
      const s = sessionRef.current;
      if (s == null || evt.pointerId !== s.pointerId) {
        return;
      }
      const dx = evt.clientX - s.startX;
      const dy = evt.clientY - s.startY;
      if (!s.scrubbing) {
        const thr = Math.max(0, scrubActivationThresholdPx);
        if (dx * dx + dy * dy < thr * thr) {
          return;
        }
        s.scrubbing = true;
        try {
          s.target.setPointerCapture(s.pointerId);
        } catch {
          // Some hosts reject capture; window listeners still drive the scrub.
        }
        evt.preventDefault();
        suppressBlurCommitRef.current = true;
        if (document.activeElement === s.target) {
          s.target.blur();
        }
        // Blender-style: hide cursor for the drag (reappears on release).
        setTrnScrubCursorHidden(true);
        s.cursorHidden = true;
        // Apply immediately on the activation frame (include threshold travel)
        // so the value does not wait for an extra move after the dead-zone.
        applyScrubDelta(evt, s);
        return;
      }
      evt.preventDefault();
      applyScrubDelta(evt, s);
    };

    const onUpOrCancel = (evt: PointerEvent) => {
      const s = sessionRef.current;
      if (s == null || evt.pointerId !== s.pointerId) {
        return;
      }
      const didScrub = s.scrubbing;
      if (didScrub && s.target.hasPointerCapture(s.pointerId)) {
        s.target.releasePointerCapture(s.pointerId);
      }
      endScrubCursor(s);
      sessionRef.current = null;
      detachWindowListeners();

      if (didScrub) {
        notifyTrnScrubInteractionEnd(onChangeEnd);
      }

      // Click (no scrub): focus + select-all for keyboard entry.
      if (!didScrub && !disabled && !locked && evt.type === "pointerup") {
        const el = s.target;
        el.focus();
        requestAnimationFrame(() => {
          if (document.activeElement === el) {
            el.select();
          }
        });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUpOrCancel);
    window.addEventListener("pointercancel", onUpOrCancel);
    moveCleanupRef.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUpOrCancel);
      window.removeEventListener("pointercancel", onUpOrCancel);
    };
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || locked) {
      return;
    }
    const mult = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = (Number.isFinite(value) ? value : 0) + effectiveStep * mult;
      onChange(next);
      setDraftFromNumber(next);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (Number.isFinite(value) ? value : 0) - effectiveStep * mult;
      onChange(next);
      setDraftFromNumber(next);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      // Explicit Enter always commits — do not gate on suppressBlurCommitRef (scrub blur).
      commitDraftText(focused ? draftRef.current : e.currentTarget.value);
      suppressBlurCommitRef.current = true;
      e.currentTarget.blur();
    }
  };

  const onWheelNative = useCallback(
    (e: WheelEvent) => {
      if (!pointerScrubEnabled || !wheelEnabled || disabled || locked) {
        return;
      }
      if (e.deltaY === 0) {
        return;
      }
      if (wheelRequiresAlt && !e.altKey) {
        // Let the inspector / page scroll; do not steal the wheel.
        return;
      }

      // React's synthetic onWheel is passive in some builds; use a native listener (passive: false).
      e.preventDefault();
      e.stopPropagation();

      const mod = wheelModifier(e);
      const span = finiteSpan(min, max);
      const stepAbs = (span != null ? span * 0.01 : 1) * mod;

      let signedLineSteps = 0;
      if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        const lines = Math.max(1, Math.round(Math.abs(e.deltaY)));
        signedLineSteps = Math.sign(-e.deltaY) * lines;
      } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        signedLineSteps = Math.sign(-e.deltaY);
      } else {
        if (span == null) {
          const dir = Math.sign(-e.deltaY);
          const next = (Number.isFinite(value) ? value : 0) + dir * stepAbs;
          if (next !== value) {
            onChange(next);
            setDraftFromNumber(next);
          }
          return;
        }
        wheelPixelAccumRef.current += e.deltaY;
        const thr = Math.max(1, wheelPixelAccumThreshold);
        let v = Number.isFinite(value) ? value : 0;
        let changed = false;
        while (Math.abs(wheelPixelAccumRef.current) >= thr) {
          let dir: number;
          if (wheelPixelAccumRef.current > 0) {
            wheelPixelAccumRef.current -= thr;
            dir = -1;
          } else {
            wheelPixelAccumRef.current += thr;
            dir = 1;
          }
          const next = v + dir * stepAbs;
          if (next !== v) {
            changed = true;
          }
          v = next;
        }
        if (changed) {
          onChange(v);
          setDraftFromNumber(v);
        }
        return;
      }

      const delta = signedLineSteps * stepAbs;
      const next = (Number.isFinite(value) ? value : 0) + delta;
      onChange(next);
      setDraftFromNumber(next);
    },
    [
      disabled,
      locked,
      max,
      min,
      onChange,
      pointerScrubEnabled,
      setDraftFromNumber,
      value,
      wheelEnabled,
      wheelPixelAccumThreshold,
      wheelRequiresAlt,
    ],
  );

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelNative as any);
    };
  }, [onWheelNative]);

  const readOnly = locked;
  const displayStr = focused ? draft : formattedBlurred;

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      size={1}
      inputMode="decimal"
      aria-label={ariaLabel}
      aria-readonly={locked ? true : undefined}
      data-trn-scrub-input="1"
      className={twMerge(
        "nodrag nopan nowheel [-moz-appearance:textfield] min-w-0 w-full appearance-none bg-transparent text-right text-[11px] text-zinc-100 outline-none",
        "[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none",
        "[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
        focused ? "select-text" : "select-none",
        locked
          ? "cursor-not-allowed text-zinc-400"
          : pointerScrubEnabled
            ? "cursor-ew-resize"
            : "cursor-text",
        inputClassName,
        className.length > 0 ? className : false,
      )}
      value={displayStr}
      disabled={disabled}
      readOnly={readOnly}
      autoComplete="off"
      spellCheck={false}
      onFocus={(e) => {
        if (locked || disabled) {
          return;
        }
        suppressBlurCommitRef.current = false;
        setFocused(true);
        onEditingChange?.(true);
        draftRef.current = formattedBlurred;
        setDraft(formattedBlurred);
        // Replace-on-type: without select-all, appending digits to a formatted value like
        // "100.00" + "50" commits as 100.005 (rounds back to 100).
        const el = e.currentTarget;
        requestAnimationFrame(() => {
          if (document.activeElement === el) {
            el.select();
          }
        });
      }}
      onBlur={(e) => {
        wheelPixelAccumRef.current = 0;
        if (!locked && !disabled && !suppressBlurCommitRef.current) {
          commitDraftText(focused ? draftRef.current : e.currentTarget.value);
        }
        suppressBlurCommitRef.current = false;
        setFocused(false);
        onEditingChange?.(false);
      }}
      onPointerDown={onPointerDown}
      onChange={(ev) => {
        if (locked) {
          return;
        }
        const raw = ev.currentTarget.value;
        draftRef.current = raw;
        setDraft(raw);
      }}
      onKeyDown={onKeyDown}
    />
  );
}
