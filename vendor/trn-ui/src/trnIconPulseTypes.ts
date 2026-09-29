/**
 * Portable icon pulse types for TRNParameter, TrnLiveDataPulseIcon, and GSAP presets.
 * Bitstream Sensor Telemetry re-exports these from `sensorTelemetryUiConfig.ts`.
 */

export const TRN_ICON_PULSE_INTENSITY_PRESETS = [
  "subtle",
  "normal",
  "strong",
] as const;

export type TrnIconPulseIntensityPreset =
  (typeof TRN_ICON_PULSE_INTENSITY_PRESETS)[number];

/** GSAP ease families for the three-segment icon pulse (peak / mid / return). */
export const TRN_ICON_PULSE_ANIMATION_PRESETS = [
  "smooth",
  "elastic",
  "back",
  "snappy",
] as const;

export type TrnIconPulseAnimationPreset =
  (typeof TRN_ICON_PULSE_ANIMATION_PRESETS)[number];

export const DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX = "#4ade80";

export function normalizeTrnIconPulseAnimationPreset(
  value: unknown,
): TrnIconPulseAnimationPreset {
  if (
    value === "smooth" ||
    value === "elastic" ||
    value === "back" ||
    value === "snappy"
  ) {
    return value;
  }
  return "smooth";
}

export function normalizeTrnIconPulseIntensityPreset(
  value: unknown,
  fallback: TrnIconPulseIntensityPreset = "normal",
): TrnIconPulseIntensityPreset {
  if (value === "subtle" || value === "normal" || value === "strong") {
    return value;
  }
  return fallback;
}

/** @deprecated Use {@link TrnIconPulseAnimationPreset}. */
export type SensorTelemetryIconPulseAnimationPreset = TrnIconPulseAnimationPreset;

/** @deprecated Use {@link normalizeTrnIconPulseAnimationPreset}. */
export const normalizeSensorTelemetryIconPulseAnimationPreset =
  normalizeTrnIconPulseAnimationPreset;

/** @deprecated Use {@link DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX}. */
export const DEFAULT_SENSOR_TELEMETRY_ICON_PULSE_PEAK_COLOR_HEX =
  DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX;
