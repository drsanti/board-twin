/*******************************************************************************
 * File Name : trn-pie-menu-config.ts
 *
 * Description : Behavior, animation, styling tokens, and className slots for
 *               TRNPieMenu — library v1 surface.
 *
 *******************************************************************************/

import type { CSSProperties } from "react";
import type { gsap } from "gsap";
import type { TRNPieMenuLayout, TRNPieMenuLayoutConfig } from "./trn-pie-menu-layout.js";
import { resolveTrnPieMenuLayout } from "./trn-pie-menu-layout.js";

/** Chord that closes the pie when pressed again (host-defined). */
export type TRNPieMenuRepeatCancelChord = {
  key: string;
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  meta?: boolean;
};

export type TRNPieMenuHoverMode = "angular" | "slice-hit";

/** LMB confirm target when `confirmOn` includes `click`. */
export type TRNPieMenuConfirmClick = "anywhere" | "slice-only";

/** Render and arm disabled slots, or omit them from the ring. */
export type TRNPieMenuDisabledItems = "show" | "hide";

export type TRNPieMenuBehaviorConfig = {
  /** `tap` = existing open/confirm flow. `hold-flick` = release chord confirms armed wedge. */
  mode?: "tap" | "hold-flick";
  /** Default `angular` — wedge from hub→cursor (Blender). `slice-hit` = button hover only. */
  hoverMode?: TRNPieMenuHoverMode;
  /** Default `anywhere` — LMB confirms the armed wedge on the full overlay. */
  confirmClick?: TRNPieMenuConfirmClick;
  /** Default `show`. `hide` skips rendering disabled slices (wedge stays inert). */
  disabledItems?: TRNPieMenuDisabledItems;
  confirmOn?: ReadonlyArray<"click" | "digit" | "mnemonic">;
  cancelOn?: ReadonlyArray<"escape" | "backdrop" | "rmb" | "repeatChord">;
  /** When set and cancelOn includes repeatChord, this chord closes the pie. */
  repeatCancelChord?: TRNPieMenuRepeatCancelChord;
};

export type TRNPieMenuAnimationEngine = "css" | "gsap";

export type TRNPieMenuAnimationPreset =
  | "none"
  | "fade-scale"
  | "blender"
  | "spring";

export type TRNPieMenuGsapConfig = {
  ease?: string;
  hubFrom?: gsap.TweenVars;
  hubTo?: gsap.TweenVars;
  sliceFrom?: gsap.TweenVars;
  sliceTo?: gsap.TweenVars;
  titleFrom?: gsap.TweenVars;
  titleTo?: gsap.TweenVars;
  stagger?: number | gsap.StaggerVars;
};

export type TRNPieMenuMotionTargetRefs = {
  cluster: HTMLElement | null;
  hub: SVGElement | null;
  title: HTMLElement | null;
  slices: ReadonlyArray<HTMLElement | null>;
};

/** Minimal slot shape for custom timeline builders (avoids circular imports). */
export type TRNPieMenuMotionSlot = {
  id: string;
  disabled?: boolean;
};

export type TRNPieMenuBuildTimelineContext = {
  refs: TRNPieMenuMotionTargetRefs;
  layout: TRNPieMenuLayout;
  animation: TRNPieMenuResolvedAnimation;
  gsap: typeof gsap;
  slots: ReadonlyArray<TRNPieMenuMotionSlot | null>;
};

export type TRNPieMenuBuildTimelineFn = (
  ctx: TRNPieMenuBuildTimelineContext,
) => gsap.core.Timeline | void;

export type TRNPieMenuAnimationConfig = {
  /** Motion backend. Default `css`. Use `gsap` for timelines + close animation. */
  engine?: TRNPieMenuAnimationEngine;
  preset?: TRNPieMenuAnimationPreset;
  /** Open / close duration (seconds). Default 0.18. */
  durationSec?: number;
  /** Per-slice stagger (seconds). Default 0.025. */
  staggerSec?: number;
  /** When "respect", prefers-reduced-motion disables motion. Default "respect". */
  reduceMotion?: "respect" | "ignore";
  /** GSAP tween overrides merged onto the active preset. */
  gsap?: TRNPieMenuGsapConfig;
  /** Replace the built-in open timeline (GSAP engine only). */
  buildOpenTimeline?: TRNPieMenuBuildTimelineFn;
  /** Replace the built-in close timeline (GSAP engine only). */
  buildCloseTimeline?: TRNPieMenuBuildTimelineFn;
  /** Run GSAP close before unmount. Default true when engine is gsap. */
  animateClose?: boolean;
  onOpenComplete?: () => void;
  onCloseComplete?: () => void;
};

/** CSS custom properties + optional overrides for hub / slices. */
export type TRNPieMenuTokensConfig = {
  hubFill?: string;
  hubRingStroke?: string;
  hubHoverArcStroke?: string;
  titleColor?: string;
  sliceDigitColor?: string;
  /** Idle slice fill (Blender dark ≈ `#181818`). */
  sliceFill?: string;
  sliceBorder?: string;
  sliceText?: string;
  sliceIconColor?: string;
  sliceActiveFill?: string;
  sliceActiveBorder?: string;
  sliceActiveText?: string;
};

/** Built-in visual presets. Hosts may still override via `tokens` / `classNames`. */
export type TRNPieMenuThemeId = "glass" | "blender" | "solid" | "slate";

export type TRNPieMenuClassNames = {
  overlay?: string;
  backdrop?: string;
  cluster?: string;
  hoverDisc?: string;
  titleWrap?: string;
  title?: string;
  hubSvg?: string;
  hubRing?: string;
  hubHoverArc?: string;
  sliceWrap?: string;
  sliceInner?: string;
  slice?: string;
  sliceActive?: string;
  sliceDisabled?: string;
  sliceDigit?: string;
};

export type TRNPieMenuResolvedBehavior = {
  mode: "tap" | "hold-flick";
  hoverMode: TRNPieMenuHoverMode;
  confirmClick: TRNPieMenuConfirmClick;
  disabledItems: TRNPieMenuDisabledItems;
  confirmOn: ReadonlyArray<"click" | "digit" | "mnemonic">;
  cancelOn: ReadonlyArray<"escape" | "backdrop" | "rmb" | "repeatChord">;
  repeatCancelChord: TRNPieMenuRepeatCancelChord | null;
};

export type TRNPieMenuResolvedAnimation = {
  engine: TRNPieMenuAnimationEngine;
  preset: TRNPieMenuAnimationPreset;
  durationSec: number;
  staggerSec: number;
  reduceMotion: "respect" | "ignore";
  gsap: TRNPieMenuGsapConfig | null;
  buildOpenTimeline: TRNPieMenuBuildTimelineFn | null;
  buildCloseTimeline: TRNPieMenuBuildTimelineFn | null;
  animateClose: boolean;
  onOpenComplete: (() => void) | null;
  onCloseComplete: (() => void) | null;
};

const DEFAULT_BEHAVIOR: TRNPieMenuResolvedBehavior = {
  mode: "tap",
  hoverMode: "angular",
  confirmClick: "anywhere",
  disabledItems: "show",
  confirmOn: ["click", "digit", "mnemonic"],
  cancelOn: ["escape", "backdrop", "rmb"],
  repeatCancelChord: null,
};

const DEFAULT_ANIMATION: TRNPieMenuResolvedAnimation = {
  engine: "css",
  preset: "fade-scale",
  durationSec: 0.18,
  staggerSec: 0.025,
  reduceMotion: "respect",
  gsap: null,
  buildOpenTimeline: null,
  buildCloseTimeline: null,
  animateClose: false,
  onOpenComplete: null,
  onCloseComplete: null,
};

export function resolveTrnPieMenuBehavior(
  config?: TRNPieMenuBehaviorConfig,
): TRNPieMenuResolvedBehavior {
  const cancelOn = config?.cancelOn ?? DEFAULT_BEHAVIOR.cancelOn;
  const repeatCancelChord =
    cancelOn.includes("repeatChord") && config?.repeatCancelChord != null
      ? config.repeatCancelChord
      : null;
  return {
    mode: config?.mode === "hold-flick" ? "hold-flick" : DEFAULT_BEHAVIOR.mode,
    hoverMode: config?.hoverMode ?? DEFAULT_BEHAVIOR.hoverMode,
    confirmClick: config?.confirmClick ?? DEFAULT_BEHAVIOR.confirmClick,
    disabledItems: config?.disabledItems ?? DEFAULT_BEHAVIOR.disabledItems,
    confirmOn: config?.confirmOn ?? DEFAULT_BEHAVIOR.confirmOn,
    cancelOn,
    repeatCancelChord,
  };
}

/** Whether a slot can be armed (hub arc + slice highlight). Disabled slots never arm. */
export function trnPieSlotArmable(
  slot: number | null,
  slots: ReadonlyArray<{ disabled?: boolean } | null>,
): number | null {
  if (slot == null) {
    return null;
  }
  const item = slots[slot];
  if (item == null || item.disabled === true) {
    return null;
  }
  return slot;
}

/** Walk clockwise (`1`) or counter-clockwise (`-1`) to the next armable pie slot. */
export function trnPieNextArmableSlot(
  from: number | null,
  slots: ReadonlyArray<{ disabled?: boolean } | null>,
  direction: 1 | -1,
): number | null {
  const start = from ?? (direction === 1 ? -1 : 8);
  for (let step = 1; step <= 8; step += 1) {
    const next = (((start + direction * step) % 8) + 8) % 8;
    if (trnPieSlotArmable(next, slots) != null) {
      return next;
    }
  }
  return null;
}

export function resolveTrnPieMenuAnimation(
  config?: TRNPieMenuAnimationConfig,
): TRNPieMenuResolvedAnimation {
  const engine = config?.engine ?? DEFAULT_ANIMATION.engine;
  const reduceMotion = config?.reduceMotion ?? DEFAULT_ANIMATION.reduceMotion;
  let preset = config?.preset ?? DEFAULT_ANIMATION.preset;
  if (
    reduceMotion === "respect" &&
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    preset = "none";
  }
  return {
    engine,
    preset,
    durationSec: config?.durationSec ?? DEFAULT_ANIMATION.durationSec,
    staggerSec: config?.staggerSec ?? DEFAULT_ANIMATION.staggerSec,
    reduceMotion,
    gsap: config?.gsap ?? null,
    buildOpenTimeline: config?.buildOpenTimeline ?? null,
    buildCloseTimeline: config?.buildCloseTimeline ?? null,
    animateClose: config?.animateClose ?? engine === "gsap",
    onOpenComplete: config?.onOpenComplete ?? null,
    onCloseComplete: config?.onCloseComplete ?? null,
  };
}

export function trnPieMenuShouldReduceMotion(
  animation: TRNPieMenuResolvedAnimation,
): boolean {
  if (animation.reduceMotion !== "respect") {
    return false;
  }
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function trnPieMenuEffectiveAnimationPreset(
  animation: TRNPieMenuResolvedAnimation,
): TRNPieMenuAnimationPreset {
  if (trnPieMenuShouldReduceMotion(animation)) {
    return "none";
  }
  return animation.preset;
}

const GLASS_THEME_TOKENS: Required<TRNPieMenuTokensConfig> = {
  hubFill: "rgba(0, 0, 0, 0.55)",
  hubRingStroke: "rgba(255, 255, 255, 0.22)",
  hubHoverArcStroke: "#60a5fa",
  titleColor: "rgb(161 161 170)",
  sliceDigitColor: "rgb(113 113 122)",
  sliceFill: "rgba(255, 255, 255, 0.05)",
  sliceBorder: "rgba(255, 255, 255, 0.10)",
  sliceText: "rgb(244 244 245)",
  sliceIconColor: "rgb(212 212 216)",
  sliceActiveFill: "rgba(255, 255, 255, 0.16)",
  sliceActiveBorder: "rgba(255, 255, 255, 0.28)",
  sliceActiveText: "rgb(250 250 250)",
};

/** Soft dark pills (readable, slightly muted). */
const BLENDER_THEME_TOKENS: Required<TRNPieMenuTokensConfig> = {
  hubFill: "rgba(16, 16, 16, 0.98)",
  hubRingStroke: "rgba(255, 255, 255, 0.26)",
  hubHoverArcStroke: "#60a5fa",
  titleColor: "rgb(232 232 240)",
  sliceDigitColor: "rgb(220 220 230)",
  sliceFill: "#1f1f1f",
  sliceBorder: "rgba(255, 255, 255, 0.14)",
  sliceText: "rgb(235 235 245)",
  sliceIconColor: "rgb(198 198 210)",
  sliceActiveFill: "#2e2e2e",
  sliceActiveBorder: "rgba(255, 255, 255, 0.22)",
  sliceActiveText: "rgb(250 250 255)",
};

/**
 * Opaque charcoal pills — Blender Snap chrome when operators pick “Solid”.
 * Note: Twin default is Slate (blue). Solid stays available in Pie look.
 */
const SOLID_THEME_TOKENS: Required<TRNPieMenuTokensConfig> = {
  hubFill: "#111111",
  hubRingStroke: "rgba(255, 255, 255, 0.32)",
  hubHoverArcStroke: "#60a5fa",
  titleColor: "rgb(228 228 236)",
  sliceDigitColor: "rgb(160 160 170)",
  sliceFill: "#111111",
  sliceBorder: "rgba(255, 255, 255, 0.18)",
  sliceText: "#ffffff",
  sliceIconColor: "#f4f4f5",
  sliceActiveFill: "#3a3a3a",
  sliceActiveBorder: "rgba(255, 255, 255, 0.28)",
  sliceActiveText: "#ffffff",
};

/**
 * Cool blue-slate pills — separates from charcoal Inspector / Scene chrome
 * while staying in Twin cyan-blue HUD language (prefer over green).
 * Keep saturation high enough to read as blue, not charcoal-gray.
 */
const SLATE_THEME_TOKENS: Required<TRNPieMenuTokensConfig> = {
  hubFill: "#0f2744",
  hubRingStroke: "rgba(125, 211, 252, 0.55)",
  hubHoverArcStroke: "#38bdf8",
  titleColor: "rgb(226 232 240)",
  sliceDigitColor: "rgb(147 197 253)",
  sliceFill: "#1d4a7a",
  sliceBorder: "rgba(56, 189, 248, 0.55)",
  sliceText: "#f8fafc",
  sliceIconColor: "#e0f2fe",
  sliceActiveFill: "#2563a8",
  sliceActiveBorder: "rgba(125, 211, 252, 0.85)",
  sliceActiveText: "#ffffff",
};

export function resolveTrnPieMenuThemeTokens(
  theme: TRNPieMenuThemeId = "glass",
  overrides?: TRNPieMenuTokensConfig,
): Required<TRNPieMenuTokensConfig> {
  const base =
    theme === "solid"
      ? SOLID_THEME_TOKENS
      : theme === "slate"
        ? SLATE_THEME_TOKENS
        : theme === "blender"
          ? BLENDER_THEME_TOKENS
          : GLASS_THEME_TOKENS;
  return {
    hubFill: overrides?.hubFill ?? base.hubFill,
    hubRingStroke: overrides?.hubRingStroke ?? base.hubRingStroke,
    hubHoverArcStroke: overrides?.hubHoverArcStroke ?? base.hubHoverArcStroke,
    titleColor: overrides?.titleColor ?? base.titleColor,
    sliceDigitColor: overrides?.sliceDigitColor ?? base.sliceDigitColor,
    sliceFill: overrides?.sliceFill ?? base.sliceFill,
    sliceBorder: overrides?.sliceBorder ?? base.sliceBorder,
    sliceText: overrides?.sliceText ?? base.sliceText,
    sliceIconColor: overrides?.sliceIconColor ?? base.sliceIconColor,
    sliceActiveFill: overrides?.sliceActiveFill ?? base.sliceActiveFill,
    sliceActiveBorder: overrides?.sliceActiveBorder ?? base.sliceActiveBorder,
    sliceActiveText: overrides?.sliceActiveText ?? base.sliceActiveText,
  };
}

export function trnPieMenuCssVars(args: {
  layout: TRNPieMenuLayout;
  layoutConfig?: TRNPieMenuLayoutConfig;
  tokens?: TRNPieMenuTokensConfig;
  theme?: TRNPieMenuThemeId;
  animation?: TRNPieMenuResolvedAnimation;
}): CSSProperties {
  const { layout, animation } = args;
  const anim = animation ?? DEFAULT_ANIMATION;
  const tokens = resolveTrnPieMenuThemeTokens(args.theme ?? "glass", args.tokens);
  return {
    "--pie-row-step": `${layout.rowStepPx}px`,
    "--pie-distribute-radius": `${layout.distributeRadiusPx}px`,
    "--pie-diagonal-radius": `${layout.diagonalRadiusPx}px`,
    "--pie-dead-zone": `${layout.deadZonePx}px`,
    "--pie-hub-size": `${layout.hubSizePx}px`,
    "--pie-hub-ring-radius": `${layout.hubRingRadiusPx}px`,
    "--pie-hover-disc": `${layout.hoverDiscPx}px`,
    "--pie-viewport-pad": `${layout.viewportPadPx}px`,
    "--pie-hub-fill": tokens.hubFill,
    "--pie-hub-ring-stroke": tokens.hubRingStroke,
    "--pie-hub-hover-arc-stroke": tokens.hubHoverArcStroke,
    "--pie-title-color": tokens.titleColor,
    "--pie-slice-digit-color": tokens.sliceDigitColor,
    "--pie-slice-fill": tokens.sliceFill,
    "--pie-slice-border": tokens.sliceBorder,
    "--pie-slice-text": tokens.sliceText,
    "--pie-slice-icon": tokens.sliceIconColor,
    "--pie-slice-active-fill": tokens.sliceActiveFill,
    "--pie-slice-active-border": tokens.sliceActiveBorder,
    "--pie-slice-active-text": tokens.sliceActiveText,
    "--pie-anim-duration": `${anim.durationSec}s`,
    "--pie-anim-stagger": `${anim.staggerSec}s`,
  } as CSSProperties;
}

export function trnPieMenuMatchesRepeatCancelChord(
  event: KeyboardEvent,
  chord: TRNPieMenuRepeatCancelChord,
): boolean {
  if (event.key.toLowerCase() !== chord.key.toLowerCase()) {
    return false;
  }
  if (Boolean(chord.shift) !== event.shiftKey) {
    return false;
  }
  if (Boolean(chord.ctrl) !== event.ctrlKey) {
    return false;
  }
  if (Boolean(chord.alt) !== event.altKey) {
    return false;
  }
  if (Boolean(chord.meta) !== event.metaKey) {
    return false;
  }
  return true;
}
