import type { CSSProperties } from "react";
import { normalizeTrnColorHex } from "./trn-color-utils.js";

/** In-shell range fill look when min/max form a finite span (global preference). */
export type TRNScrubNumberFieldFillStyle =
  | "solid"
  | "soft-gradient"
  | "edge-fade"
  | "custom";

export type TrnScrubInFieldFillStopV1 = {
  /** Position along the fill bar (0–100). */
  at: number;
  /** `#RRGGBB` (alpha is separate). */
  colorHex: string;
  /** Opacity 0–1. */
  alpha: number;
};

export type TrnScrubInFieldFillGradientV1 = {
  /** CSS linear-gradient angle in degrees (90 = left → right). */
  angleDeg: number;
  stops: TrnScrubInFieldFillStopV1[];
};

const CYAN = "#22d3ee";

export const TRN_SCRUB_IN_FIELD_FILL_STOP_MIN = 2;
export const TRN_SCRUB_IN_FIELD_FILL_STOP_MAX = 4;

export const TRN_SCRUB_IN_FIELD_FILL_PRESETS: Record<
  Exclude<TRNScrubNumberFieldFillStyle, "custom">,
  TrnScrubInFieldFillGradientV1
> = {
  solid: {
    angleDeg: 90,
    stops: [
      { at: 0, colorHex: CYAN, alpha: 0.14 },
      { at: 100, colorHex: CYAN, alpha: 0.14 },
    ],
  },
  "soft-gradient": {
    angleDeg: 90,
    stops: [
      { at: 0, colorHex: CYAN, alpha: 0.26 },
      { at: 52, colorHex: CYAN, alpha: 0.12 },
      { at: 100, colorHex: CYAN, alpha: 0.05 },
    ],
  },
  "edge-fade": {
    angleDeg: 90,
    stops: [
      { at: 0, colorHex: CYAN, alpha: 0.18 },
      { at: 58, colorHex: CYAN, alpha: 0.14 },
      { at: 100, colorHex: CYAN, alpha: 0 },
    ],
  },
};

export const TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT: TrnScrubInFieldFillGradientV1 =
  TRN_SCRUB_IN_FIELD_FILL_PRESETS["soft-gradient"];

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function clampAngle(n: number): number {
  if (!Number.isFinite(n)) return 90;
  const wrapped = ((n % 360) + 360) % 360;
  return wrapped;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = normalizeTrnColorHex(hex, CYAN);
  const raw = n.slice(1);
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
}

export function clampTrnScrubInFieldFillStop(
  stop: Partial<TrnScrubInFieldFillStopV1> | null | undefined,
  fallback: TrnScrubInFieldFillStopV1,
): TrnScrubInFieldFillStopV1 {
  return {
    at: clampPct(typeof stop?.at === "number" ? stop.at : fallback.at),
    colorHex: normalizeTrnColorHex(stop?.colorHex ?? fallback.colorHex, fallback.colorHex),
    alpha: clamp01(typeof stop?.alpha === "number" ? stop.alpha : fallback.alpha),
  };
}

export function clampTrnScrubInFieldFillGradient(
  value: TrnScrubInFieldFillGradientV1 | null | undefined,
): TrnScrubInFieldFillGradientV1 {
  const base = TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT;
  const rawStops = Array.isArray(value?.stops) ? value!.stops : base.stops;
  const fallbackStops = base.stops;
  const clamped = rawStops
    .slice(0, TRN_SCRUB_IN_FIELD_FILL_STOP_MAX)
    .map((s, i) =>
      clampTrnScrubInFieldFillStop(s, fallbackStops[Math.min(i, fallbackStops.length - 1)]!),
    )
    .sort((a, b) => a.at - b.at);

  while (clamped.length < TRN_SCRUB_IN_FIELD_FILL_STOP_MIN) {
    const last = clamped[clamped.length - 1] ?? fallbackStops[0]!;
    clamped.push({
      at: 100,
      colorHex: last.colorHex,
      alpha: last.alpha,
    });
  }

  return {
    angleDeg: clampAngle(value?.angleDeg ?? base.angleDeg),
    stops: clamped,
  };
}

export function cloneTrnScrubInFieldFillPreset(
  style: Exclude<TRNScrubNumberFieldFillStyle, "custom">,
): TrnScrubInFieldFillGradientV1 {
  const preset = TRN_SCRUB_IN_FIELD_FILL_PRESETS[style];
  return clampTrnScrubInFieldFillGradient({
    angleDeg: preset.angleDeg,
    stops: preset.stops.map((s) => ({ ...s })),
  });
}

function stopToRgba(stop: TrnScrubInFieldFillStopV1): string {
  const { r, g, b } = hexToRgb(stop.colorHex);
  const a = Math.round(stop.alpha * 1000) / 1000;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * CSS paint for the in-field progress layer.
 * Stops are mapped across the **full track** (0–100% of the field). Callers
 * must clip/mask by value percent so mid values do not show max-stop colors.
 */
export function trnScrubInFieldFillPaint(
  _style: TRNScrubNumberFieldFillStyle,
  custom?: TrnScrubInFieldFillGradientV1 | null,
): CSSProperties {
  const gradient = clampTrnScrubInFieldFillGradient(custom);
  const stops = gradient.stops;
  const uniform =
    stops.length >= 2 &&
    stops.every(
      (s) =>
        s.colorHex.toLowerCase() === stops[0]!.colorHex.toLowerCase() &&
        Math.abs(s.alpha - stops[0]!.alpha) < 1e-6,
    );

  if (uniform) {
    return { backgroundColor: stopToRgba(stops[0]!) };
  }

  const parts = stops.map((s) => `${stopToRgba(s)} ${s.at}%`).join(", ");
  return {
    backgroundImage: `linear-gradient(${gradient.angleDeg}deg, ${parts})`,
  };
}

/** Full-width preview strip for the settings panel. */
export function trnScrubInFieldFillPreviewStyle(
  gradient: TrnScrubInFieldFillGradientV1,
): CSSProperties {
  const g = clampTrnScrubInFieldFillGradient(gradient);
  const parts = g.stops.map((s) => `${stopToRgba(s)} ${s.at}%`).join(", ");
  return {
    backgroundImage: `linear-gradient(${g.angleDeg}deg, ${parts})`,
  };
}
