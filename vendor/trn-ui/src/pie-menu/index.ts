/*******************************************************************************
 * File Name : index.ts
 *
 * Description : Isolated pie-menu + hover-region hotkey helpers for TRN.
 *
 *******************************************************************************/

export { TRNPieMenu } from "./TRNPieMenu.js";
export type { TRNPieMenuItem, TRNPieMenuProps, TRNPieMenuLayoutConfig } from "./TRNPieMenu.js";
export type {
  TRNPieMenuAnimationConfig,
  TRNPieMenuAnimationEngine,
  TRNPieMenuAnimationPreset,
  TRNPieMenuBehaviorConfig,
  TRNPieMenuBuildTimelineContext,
  TRNPieMenuBuildTimelineFn,
  TRNPieMenuClassNames,
  TRNPieMenuConfirmClick,
  TRNPieMenuDisabledItems,
  TRNPieMenuGsapConfig,
  TRNPieMenuHoverMode,
  TRNPieMenuMotionSlot,
  TRNPieMenuMotionTargetRefs,
  TRNPieMenuRepeatCancelChord,
  TRNPieMenuThemeId,
  TRNPieMenuTokensConfig,
} from "./trn-pie-menu-config.js";
export {
  clampTrnPieCenter,
  TRN_PIE_DEAD_ZONE_PX,
  TRN_PIE_DEFAULT_LAYOUT,
  TRN_PIE_DIGIT_TO_SLOT,
  TRN_PIE_DIAGONAL_RADIUS_PX,
  TRN_PIE_ELLIPSE_RX_PX,
  TRN_PIE_ELLIPSE_RY_PX,
  TRN_PIE_HUB_RING_RADIUS_PX,
  TRN_PIE_HUB_SIZE_PX,
  TRN_PIE_HOVER_DISC_PX,
  TRN_PIE_INNER_RADIUS_PX,
  TRN_PIE_RADIUS_PX,
  TRN_PIE_ROW_STEP_PX,
  TRN_PIE_SIDE_X_MAX_PX,
  TRN_PIE_SIDE_X_PX,
  TRN_PIE_SLICE_HEIGHT_PX,
  TRN_PIE_SLICE_WIDTH_PX,
  TRN_PIE_SLOT_COUNT,
  TRN_PIE_SLOT_TO_DIGIT,
  TRN_PIE_VIEWPORT_PAD_PX,
  resolveTrnPieMenuLayout,
  resolveTrnPieOpenCenter,
  trnPieBuildSlotLayout,
  trnPieHubHoverArcD,
  trnPieMenuClusterExtents,
  trnPieSliceOffset,
  trnPieSlotAttachRadius,
  trnPieSlotBoxAlign,
  trnPieSlotFromDigitKey,
  trnPieSlotFromPointer,
} from "./trn-pie-menu-layout.js";
export type { TRNPieMenuClampBounds, TRNPieMenuLayout } from "./trn-pie-menu-layout.js";
export {
  resolveTrnPieMenuAnimation,
  resolveTrnPieMenuBehavior,
  resolveTrnPieMenuThemeTokens,
  trnPieMenuCssVars,
  trnPieMenuEffectiveAnimationPreset,
  trnPieMenuMatchesRepeatCancelChord,
  trnPieMenuShouldReduceMotion,
  trnPieNextArmableSlot,
  trnPieSlotArmable,
} from "./trn-pie-menu-config.js";
export {
  buildTrnPieMenuGsapCloseTimeline,
  buildTrnPieMenuGsapOpenTimeline,
  resetTrnPieMenuGsapTargets,
  trnPieMenuCssAnimationClass,
  trnPieMenuGsap,
} from "./trn-pie-menu-motion.js";
export type { TRNPieMenuMotionContext } from "./trn-pie-menu-motion.js";
export {
  useTrnPieMenuController,
  useTrnPieMenuPointerAnchor,
} from "./useTrnPieMenuController.js";
export { useTrnPieMenuMotion } from "./useTrnPieMenuMotion.js";
export {
  getTrnHotkeyPointer,
  noteTrnHotkeyPointer,
  resetTrnHotkeyPointerForTests,
  resolveTrnHotkeyRegion,
  resolveTrnHotkeyRegionAtLastPointer,
  resolveTrnHotkeyRegionFromNode,
  TRN_HOTKEY_REGION_ATTR,
} from "./trn-hotkey-region.js";
export { useTrnHotkeyPointerTracking } from "./useTrnHotkeyPointerTracking.js";
