export const TRN_SCRUB_NUMBER_FIELD_STORAGE_PREFIX = "trn-scrub-number-field:";

/** Shared localStorage key for studio-wide scrub appearance / interaction. */
export const TRN_SCRUB_NUMBER_FIELD_GLOBAL_STORAGE_KEY = `${TRN_SCRUB_NUMBER_FIELD_STORAGE_PREFIX}__global__`;

/** Dispatched on `window` after global scrub settings are saved. */
export const TRN_SCRUB_GLOBAL_SETTINGS_EVENT = "trn-scrub-global-settings";

/**
 * Per-field settings (local). Bound to `settingsKey`.
 * Min / max / step belong here — not in global.
 */
export type TrnScrubNumberFieldLocalSettingsV1 = {
  version: 1;
  valueRules?: {
    min?: number;
    max?: number;
    step?: number;
    stepAuto?: boolean;
  };
  /** Optional per-field Scrub vs Slider when the field allows style switching. */
  controlStyle?: "scrub" | "slider";
};

/**
 * Studio-wide scrub chrome + interaction (global).
 * Fill style, drag/wheel prefs, icon visibility — shared across fields.
 */
export type TrnScrubNumberFieldGlobalSettingsV1 = {
  version: 1;
  appearance?: {
    variant?: "minimal" | "full";
    inFieldFillWhenBounded?: boolean;
    inFieldFillStyle?: "solid" | "soft-gradient" | "edge-fade" | "custom";
    inFieldFillGradient?: {
      angleDeg: number;
      stops: Array<{ at: number; colorHex: string; alpha: number }>;
    };
    stepButtonsVisibility?: "hidden" | "always" | "hover";
    lockIconVisibility?: "hidden" | "always" | "hover";
    resetIconVisibility?: "hidden" | "always" | "hover";
    clearIconVisibility?: "hidden" | "always" | "hover";
  };
  interaction?: {
    pointerScrubEnabled?: boolean;
    dragSensitivityPreset?: "slow" | "normal" | "fast" | "custom";
    wheelEnabled?: boolean;
    wheelUnboundedStep?: number;
    wheelBoundedMode?: "step" | "span-percent";
    shiftMultiplier?: number;
    ctrlOrCmdMultiplier?: number;
    horizontalPxPerTenthPercent?: number;
    verticalPxPerPercent?: number;
    scrubActivationThresholdPx?: number;
    wheelPixelAccumThreshold?: number;
    wheelRequiresAlt?: boolean;
  };
};

/**
 * @deprecated Prefer {@link TrnScrubNumberFieldLocalSettingsV1} + {@link TrnScrubNumberFieldGlobalSettingsV1}.
 * Legacy combined blob still readable for migration.
 */
export type TrnScrubNumberFieldStoredSettingsV1 = {
  version: 1;
  valueRules?: TrnScrubNumberFieldLocalSettingsV1["valueRules"];
  appearance?: TrnScrubNumberFieldGlobalSettingsV1["appearance"] & {
    controlStyle?: "scrub" | "slider";
    controlStyleSwitchEnabled?: boolean;
  };
  interaction?: TrnScrubNumberFieldGlobalSettingsV1["interaction"];
};

export function getTrnScrubNumberFieldStorageKey(key: string): string {
  return `${TRN_SCRUB_NUMBER_FIELD_STORAGE_PREFIX}${key}`;
}

function parseJsonObject(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadTrnScrubNumberFieldLocalSettings(
  key: string,
): TrnScrubNumberFieldLocalSettingsV1 | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const parsed = parseJsonObject(
      localStorage.getItem(getTrnScrubNumberFieldStorageKey(key)),
    );
    if (!parsed || parsed.version !== 1) {
      return null;
    }
    const valueRules =
      parsed.valueRules && typeof parsed.valueRules === "object"
        ? (parsed.valueRules as TrnScrubNumberFieldLocalSettingsV1["valueRules"])
        : undefined;
    const appearance = parsed.appearance as
      | { controlStyle?: "scrub" | "slider" }
      | undefined;
    const controlStyle =
      typeof parsed.controlStyle === "string"
        ? (parsed.controlStyle as "scrub" | "slider")
        : appearance?.controlStyle;
    return {
      version: 1,
      valueRules,
      controlStyle:
        controlStyle === "scrub" || controlStyle === "slider" ? controlStyle : undefined,
    };
  } catch (error) {
    console.warn("Failed to load TRN scrub number field local settings:", error);
    return null;
  }
}

export function saveTrnScrubNumberFieldLocalSettings(
  key: string,
  settings: TrnScrubNumberFieldLocalSettingsV1,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      getTrnScrubNumberFieldStorageKey(key),
      JSON.stringify({
        version: 1,
        valueRules: settings.valueRules,
        controlStyle: settings.controlStyle,
      } satisfies TrnScrubNumberFieldLocalSettingsV1),
    );
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, cannot save scrub local settings");
    } else {
      console.warn("Failed to save TRN scrub number field local settings:", error);
    }
  }
}

export function loadTrnScrubNumberFieldGlobalSettings(): TrnScrubNumberFieldGlobalSettingsV1 | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const parsed = parseJsonObject(
      localStorage.getItem(TRN_SCRUB_NUMBER_FIELD_GLOBAL_STORAGE_KEY),
    );
    if (parsed && parsed.version === 1) {
      return parsed as unknown as TrnScrubNumberFieldGlobalSettingsV1;
    }

    // One-time migrate: lift appearance/interaction from any legacy per-field blob.
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k == null ||
        !k.startsWith(TRN_SCRUB_NUMBER_FIELD_STORAGE_PREFIX) ||
        k === TRN_SCRUB_NUMBER_FIELD_GLOBAL_STORAGE_KEY
      ) {
        continue;
      }
      const legacy = parseJsonObject(localStorage.getItem(k));
      if (!legacy || legacy.version !== 1) continue;
      const appearance = legacy.appearance;
      const interaction = legacy.interaction;
      if (appearance == null && interaction == null) continue;
      const migrated: TrnScrubNumberFieldGlobalSettingsV1 = {
        version: 1,
        appearance:
          appearance && typeof appearance === "object"
            ? {
                variant: (appearance as any).variant,
                inFieldFillWhenBounded: (appearance as any).inFieldFillWhenBounded,
                inFieldFillStyle: (appearance as any).inFieldFillStyle,
                inFieldFillGradient: (appearance as any).inFieldFillGradient,
                stepButtonsVisibility: (appearance as any).stepButtonsVisibility,
                lockIconVisibility: (appearance as any).lockIconVisibility,
                resetIconVisibility: (appearance as any).resetIconVisibility,
                clearIconVisibility: (appearance as any).clearIconVisibility,
              }
            : undefined,
        interaction:
          interaction && typeof interaction === "object"
            ? (interaction as TrnScrubNumberFieldGlobalSettingsV1["interaction"])
            : undefined,
      };
      saveTrnScrubNumberFieldGlobalSettings(migrated);
      return migrated;
    }
    return null;
  } catch (error) {
    console.warn("Failed to load TRN scrub number field global settings:", error);
    return null;
  }
}

export function saveTrnScrubNumberFieldGlobalSettings(
  settings: TrnScrubNumberFieldGlobalSettingsV1,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      TRN_SCRUB_NUMBER_FIELD_GLOBAL_STORAGE_KEY,
      JSON.stringify(settings),
    );
    window.dispatchEvent(
      new CustomEvent(TRN_SCRUB_GLOBAL_SETTINGS_EVENT, { detail: settings }),
    );
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, cannot save scrub global settings");
    } else {
      console.warn("Failed to save TRN scrub number field global settings:", error);
    }
  }
}

/** @deprecated Use {@link loadTrnScrubNumberFieldLocalSettings}. */
export function loadTrnScrubNumberFieldSettings(
  key: string,
): TrnScrubNumberFieldStoredSettingsV1 | null {
  const local = loadTrnScrubNumberFieldLocalSettings(key);
  const global = loadTrnScrubNumberFieldGlobalSettings();
  if (local == null && global == null) return null;
  return {
    version: 1,
    valueRules: local?.valueRules,
    appearance: {
      ...global?.appearance,
      controlStyle: local?.controlStyle,
    },
    interaction: global?.interaction,
  };
}

/** @deprecated Use {@link saveTrnScrubNumberFieldLocalSettings}. */
export function saveTrnScrubNumberFieldSettings(
  key: string,
  settings: TrnScrubNumberFieldStoredSettingsV1,
): void {
  saveTrnScrubNumberFieldLocalSettings(key, {
    version: 1,
    valueRules: settings.valueRules,
    controlStyle: settings.appearance?.controlStyle,
  });
  if (settings.appearance != null || settings.interaction != null) {
    const prev = loadTrnScrubNumberFieldGlobalSettings();
    saveTrnScrubNumberFieldGlobalSettings({
      version: 1,
      appearance: {
        ...prev?.appearance,
        variant: settings.appearance?.variant ?? prev?.appearance?.variant,
        inFieldFillWhenBounded:
          settings.appearance?.inFieldFillWhenBounded ??
          prev?.appearance?.inFieldFillWhenBounded,
        inFieldFillStyle:
          settings.appearance?.inFieldFillStyle ??
          prev?.appearance?.inFieldFillStyle,
        inFieldFillGradient:
          settings.appearance?.inFieldFillGradient ??
          prev?.appearance?.inFieldFillGradient,
        stepButtonsVisibility:
          settings.appearance?.stepButtonsVisibility ??
          prev?.appearance?.stepButtonsVisibility,
        lockIconVisibility:
          settings.appearance?.lockIconVisibility ??
          prev?.appearance?.lockIconVisibility,
        resetIconVisibility:
          settings.appearance?.resetIconVisibility ??
          prev?.appearance?.resetIconVisibility,
        clearIconVisibility:
          settings.appearance?.clearIconVisibility ??
          prev?.appearance?.clearIconVisibility,
      },
      interaction: {
        ...prev?.interaction,
        ...settings.interaction,
      },
    });
  }
}
