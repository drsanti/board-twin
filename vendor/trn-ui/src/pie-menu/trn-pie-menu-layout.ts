/*******************************************************************************
 * File Name : trn-pie-menu-layout.ts
 *
 * Description : Pure geometry for TRNPieMenu — 8 slots clockwise from 12
 *               o'clock (Blender pie numbering).
 *
 *******************************************************************************/

export const TRN_PIE_SLOT_COUNT = 8;

/** Partial overrides — merged by `resolveTrnPieMenuLayout`. */
export type TRNPieMenuLayoutConfig = {
  /** Vertical gap between adjacent rows (clockwise walk). Default 58. */
  rowStepPx?: number;
  /** Horizontal attach for 3 / 9 o'clock (E/W distribute radius). Default 84. */
  distributeRadiusPx?: number;
  /** Horizontal attach for NE/SE/NW/SW diagonals. Default 68. */
  diagonalRadiusPx?: number;
  /** Pointer dead zone around the hub (no slice armed). Default 32. */
  deadZonePx?: number;
  /** Hub SVG circle size. Default 36. */
  hubSizePx?: number;
  /** Hub ring stroke radius. Default 13. */
  hubRingRadiusPx?: number;
  /** Invisible hover / click disc diameter. Default derived from row + distribute. */
  hoverDiscPx?: number;
  /** Edge padding when clamping the hub to the viewport. Default 10. */
  viewportPadPx?: number;
  /** Uniform scale applied after other fields (default 1). */
  scale?: number;
};

/** Resolved layout used by render + hit testing. */
export type TRNPieMenuLayout = {
  rowStepPx: number;
  distributeRadiusPx: number;
  diagonalRadiusPx: number;
  deadZonePx: number;
  hubSizePx: number;
  hubRingRadiusPx: number;
  hoverDiscPx: number;
  viewportPadPx: number;
};

const TRN_PIE_LAYOUT_DEFAULTS = {
  rowStepPx: 58,
  distributeRadiusPx: 84,
  diagonalRadiusPx: 68,
  deadZonePx: 32,
  hubSizePx: 36,
  hubRingRadiusPx: 13,
  viewportPadPx: 10,
} as const;

function trnPieDefaultHoverDiscPx(
  rowStepPx: number,
  distributeRadiusPx: number,
): number {
  return Math.ceil(Math.max(rowStepPx * 4, distributeRadiusPx * 2) + 48);
}

export function resolveTrnPieMenuLayout(
  config?: TRNPieMenuLayoutConfig,
): TRNPieMenuLayout {
  const scale = config?.scale ?? 1;
  const rowStepPx = (config?.rowStepPx ?? TRN_PIE_LAYOUT_DEFAULTS.rowStepPx) * scale;
  const distributeRadiusPx =
    (config?.distributeRadiusPx ?? TRN_PIE_LAYOUT_DEFAULTS.distributeRadiusPx) * scale;
  const diagonalRadiusPx =
    (config?.diagonalRadiusPx ?? TRN_PIE_LAYOUT_DEFAULTS.diagonalRadiusPx) * scale;
  const deadZonePx = (config?.deadZonePx ?? TRN_PIE_LAYOUT_DEFAULTS.deadZonePx) * scale;
  const hubSizePx = (config?.hubSizePx ?? TRN_PIE_LAYOUT_DEFAULTS.hubSizePx) * scale;
  const hubRingRadiusPx =
    (config?.hubRingRadiusPx ?? TRN_PIE_LAYOUT_DEFAULTS.hubRingRadiusPx) * scale;
  const viewportPadPx =
    (config?.viewportPadPx ?? TRN_PIE_LAYOUT_DEFAULTS.viewportPadPx) * scale;
  const hoverDiscPx =
    config?.hoverDiscPx ??
    trnPieDefaultHoverDiscPx(rowStepPx, distributeRadiusPx);
  return {
    rowStepPx,
    distributeRadiusPx,
    diagonalRadiusPx,
    deadZonePx,
    hubSizePx,
    hubRingRadiusPx,
    hoverDiscPx,
    viewportPadPx,
  };
}

export const TRN_PIE_DEFAULT_LAYOUT = resolveTrnPieMenuLayout();

/** @deprecated use TRN_PIE_DEFAULT_LAYOUT.deadZonePx */
export const TRN_PIE_DEAD_ZONE_PX = TRN_PIE_DEFAULT_LAYOUT.deadZonePx;
/** @deprecated use TRN_PIE_DEFAULT_LAYOUT.rowStepPx */
export const TRN_PIE_ROW_STEP_PX = TRN_PIE_DEFAULT_LAYOUT.rowStepPx;
/** @deprecated use TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx */
export const TRN_PIE_SIDE_X_MAX_PX = TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx;
/** @deprecated use TRN_PIE_DEFAULT_LAYOUT.diagonalRadiusPx */
export const TRN_PIE_SIDE_X_PX = TRN_PIE_DEFAULT_LAYOUT.diagonalRadiusPx;
/** @deprecated use 2 × rowStepPx */
export const TRN_PIE_ELLIPSE_RY_PX = TRN_PIE_DEFAULT_LAYOUT.rowStepPx * 2;
/** @deprecated use distributeRadiusPx */
export const TRN_PIE_ELLIPSE_RX_PX = TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx;
/** @deprecated use distributeRadiusPx */
export const TRN_PIE_INNER_RADIUS_PX = TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx;
/** @deprecated diagonal attach scalar */
export const TRN_PIE_DIAGONAL_RADIUS_PX = Math.round(
  Math.hypot(
    TRN_PIE_DEFAULT_LAYOUT.diagonalRadiusPx,
    TRN_PIE_DEFAULT_LAYOUT.rowStepPx,
  ),
);
/** @deprecated use distributeRadiusPx */
export const TRN_PIE_RADIUS_PX = TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx;
export const TRN_PIE_SLICE_WIDTH_PX = 220;
export const TRN_PIE_SLICE_HEIGHT_PX = 32;
/** Title sits above the hub (`TRNPieMenu` title wrap offset). */
export const TRN_PIE_TITLE_ABOVE_HUB_PX = 22;
export const TRN_PIE_TITLE_HEIGHT_PX = 14;

/** Viewport client rect used to keep the full pie cluster on-screen. */
export type TRNPieMenuClampBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
/** @deprecated use TRN_PIE_DEFAULT_LAYOUT.viewportPadPx */
export const TRN_PIE_VIEWPORT_PAD_PX = TRN_PIE_DEFAULT_LAYOUT.viewportPadPx;
/** @deprecated use TRN_PIE_DEFAULT_LAYOUT.hubSizePx */
export const TRN_PIE_HUB_SIZE_PX = TRN_PIE_DEFAULT_LAYOUT.hubSizePx;
/** @deprecated use TRN_PIE_DEFAULT_LAYOUT.hoverDiscPx */
export const TRN_PIE_HOVER_DISC_PX = TRN_PIE_DEFAULT_LAYOUT.hoverDiscPx;
/** @deprecated use TRN_PIE_DEFAULT_LAYOUT.hubRingRadiusPx */
export const TRN_PIE_HUB_RING_RADIUS_PX = TRN_PIE_DEFAULT_LAYOUT.hubRingRadiusPx;

/**
 * Blender Snap-pie digit → slot (clockwise from 12 o'clock).
 * 8, 9, 6, 3, 2, 1, 4, 7
 */
export const TRN_PIE_DIGIT_TO_SLOT: Readonly<Record<string, number>> = {
  "8": 0,
  "9": 1,
  "6": 2,
  "3": 3,
  "2": 4,
  "1": 5,
  "4": 6,
  "7": 7,
};

export const TRN_PIE_SLOT_TO_DIGIT: readonly string[] = [
  "8",
  "9",
  "6",
  "3",
  "2",
  "1",
  "4",
  "7",
];

/** Slot index 0…7 clockwise from 12 o'clock, or null inside the hub dead zone. */
export function trnPieSlotFromPointer(
  dx: number,
  dy: number,
  deadZonePx: number = TRN_PIE_DEFAULT_LAYOUT.deadZonePx,
): number | null {
  const dist = Math.hypot(dx, dy);
  if (!(dist >= deadZonePx)) {
    return null;
  }
  let angle = Math.atan2(dx, -dy);
  if (angle < 0) {
    angle += Math.PI * 2;
  }
  const slot = Math.round(angle / (Math.PI / 4)) % TRN_PIE_SLOT_COUNT;
  return slot < 0 ? slot + TRN_PIE_SLOT_COUNT : slot;
}

export function trnPieSlotFromDigitKey(
  code: string,
  key: string,
): number | null {
  let digit = "";
  if (code.startsWith("Digit") && code.length === 6) {
    digit = code.slice(5);
  } else if (code.startsWith("Numpad") && code.length === 7) {
    digit = code.slice(6);
  } else if (key.length === 1 && key >= "1" && key <= "9") {
    digit = key;
  }
  if (digit.length === 0) {
    return null;
  }
  const slot = TRN_PIE_DIGIT_TO_SLOT[digit];
  return typeof slot === "number" ? slot : null;
}

/** Attach points on five equal vertical bands (stadium / tall ellipse). */
export function trnPieBuildSlotLayout(
  layout: TRNPieMenuLayout = TRN_PIE_DEFAULT_LAYOUT,
): ReadonlyArray<{ x: number; y: number }> {
  const { rowStepPx, distributeRadiusPx, diagonalRadiusPx } = layout;
  return [
    { x: 0, y: -rowStepPx * 2 }, // 0 · 12 o'clock
    { x: diagonalRadiusPx, y: -rowStepPx }, // 1
    { x: distributeRadiusPx, y: 0 }, // 2 · 3 o'clock
    { x: diagonalRadiusPx, y: rowStepPx }, // 3
    { x: 0, y: rowStepPx * 2 }, // 4 · 6 o'clock
    { x: -diagonalRadiusPx, y: rowStepPx }, // 5
    { x: -distributeRadiusPx, y: 0 }, // 6 · 9 o'clock
    { x: -diagonalRadiusPx, y: -rowStepPx }, // 7
  ];
}

export function trnPieSliceOffset(
  slot: number,
  layout: TRNPieMenuLayout = TRN_PIE_DEFAULT_LAYOUT,
): { x: number; y: number } {
  return trnPieBuildSlotLayout(layout)[slot] ?? { x: 0, y: 0 };
}

/** Polar distance from hub to slice attach point. */
export function trnPieSlotAttachRadius(
  slot: number,
  layout: TRNPieMenuLayout = TRN_PIE_DEFAULT_LAYOUT,
): number {
  const { x, y } = trnPieSliceOffset(slot, layout);
  return Math.hypot(x, y);
}

/**
 * Blender-style: labels grow *outward* from the inner ring so short and long
 * rows share the same hub distance.
 *
 * origin  -1 | 0 | 1  → CSS translate -100% | -50% | 0 on that axis.
 */
export function trnPieSlotBoxAlign(slot: number): {
  originX: -1 | 0 | 1;
  originY: -1 | 0 | 1;
  translate: string;
} {
  const angle = (slot * Math.PI) / 4;
  const ox = Math.sin(angle);
  const oy = -Math.cos(angle);
  const originX: -1 | 0 | 1 = ox > 0.38 ? 1 : ox < -0.38 ? -1 : 0;
  const originY: -1 | 0 | 1 = oy > 0.38 ? 1 : oy < -0.38 ? -1 : 0;
  const tx = originX === 1 ? "0" : originX === -1 ? "-100%" : "-50%";
  const ty = originY === 1 ? "0" : originY === -1 ? "-100%" : "-50%";
  return { originX, originY, translate: `translate(${tx}, ${ty})` };
}

/** SVG arc on the hub ring aimed at `slot` (0 = 12 o'clock). */
export function trnPieHubHoverArcD(args: {
  slot: number;
  cx: number;
  cy: number;
  radius: number;
  sweepDeg?: number;
}): string {
  const sweep = args.sweepDeg ?? 42;
  const midDeg = args.slot * 45 - 90;
  const startRad = ((midDeg - sweep / 2) * Math.PI) / 180;
  const endRad = ((midDeg + sweep / 2) * Math.PI) / 180;
  const x1 = args.cx + args.radius * Math.cos(startRad);
  const y1 = args.cy + args.radius * Math.sin(startRad);
  const x2 = args.cx + args.radius * Math.cos(endRad);
  const y2 = args.cy + args.radius * Math.sin(endRad);
  return `M ${x1} ${y1} A ${args.radius} ${args.radius} 0 0 1 ${x2} ${y2}`;
}

/** Hub-relative axis-aligned bounds of the full pie cluster (all eight slices + title). */
export function trnPieMenuClusterExtents(
  layout: TRNPieMenuLayout = TRN_PIE_DEFAULT_LAYOUT,
  sliceWidthPx: number = TRN_PIE_SLICE_WIDTH_PX,
  sliceHeightPx: number = TRN_PIE_SLICE_HEIGHT_PX,
): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = -layout.hubSizePx * 0.5;
  let maxX = layout.hubSizePx * 0.5;
  let minY = -(TRN_PIE_TITLE_ABOVE_HUB_PX + TRN_PIE_TITLE_HEIGHT_PX);
  let maxY = layout.hubSizePx * 0.5;

  for (let slot = 0; slot < TRN_PIE_SLOT_COUNT; slot += 1) {
    const { x, y } = trnPieSliceOffset(slot, layout);
    const align = trnPieSlotBoxAlign(slot);
    let left: number;
    let right: number;
    let top: number;
    let bottom: number;
    if (align.originX === 1) {
      left = x;
      right = x + sliceWidthPx;
    } else if (align.originX === -1) {
      left = x - sliceWidthPx;
      right = x;
    } else {
      left = x - sliceWidthPx / 2;
      right = x + sliceWidthPx / 2;
    }
    if (align.originY === 1) {
      top = y;
      bottom = y + sliceHeightPx;
    } else if (align.originY === -1) {
      top = y - sliceHeightPx;
      bottom = y;
    } else {
      top = y - sliceHeightPx / 2;
      bottom = y + sliceHeightPx / 2;
    }
    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, top);
    maxY = Math.max(maxY, bottom);
  }
  return { minX, maxX, minY, maxY };
}

export function clampTrnPieCenter(args: {
  anchorX: number;
  anchorY: number;
  layout?: TRNPieMenuLayoutConfig;
  /** Client rect — when set, the whole pie cluster stays inside (e.g. Scene canvas). */
  clampBounds?: TRNPieMenuClampBounds | null;
  viewportWidth?: number;
  viewportHeight?: number;
  /** @deprecated — cluster extents replace hub-only clamp. */
  hubSizePx?: number;
  viewportPadPx?: number;
}): { x: number; y: number } {
  const layout = resolveTrnPieMenuLayout(args.layout);
  const pad = args.viewportPadPx ?? layout.viewportPadPx;
  const { minX, maxX, minY, maxY } = trnPieMenuClusterExtents(layout);

  let boundsLeft = 0;
  let boundsTop = 0;
  let boundsRight =
    args.viewportWidth ??
    (typeof window !== "undefined" ? window.innerWidth : 0);
  let boundsBottom =
    args.viewportHeight ??
    (typeof window !== "undefined" ? window.innerHeight : 0);
  if (args.clampBounds != null) {
    boundsLeft = args.clampBounds.left;
    boundsTop = args.clampBounds.top;
    boundsRight = args.clampBounds.right;
    boundsBottom = args.clampBounds.bottom;
  }

  const minCenterX = boundsLeft + pad - minX;
  const maxCenterX = boundsRight - pad - maxX;
  const minCenterY = boundsTop + pad - minY;
  const maxCenterY = boundsBottom - pad - maxY;
  return {
    x: Math.min(Math.max(args.anchorX, minCenterX), Math.max(minCenterX, maxCenterX)),
    y: Math.min(Math.max(args.anchorY, minCenterY), Math.max(minCenterY, maxCenterY)),
  };
}

/**
 * Compute the pie hub before the first paint: last pointer if seen, else a
 * host fallback, then clamp so the full cluster fits the bounds rect.
 */
export function resolveTrnPieOpenCenter(args: {
  pointerX: number;
  pointerY: number;
  pointerSeen: boolean;
  fallbackX: number;
  fallbackY: number;
  viewportWidth: number;
  viewportHeight: number;
  layout?: TRNPieMenuLayoutConfig;
  clampBounds?: TRNPieMenuClampBounds | null;
}): { x: number; y: number } {
  const anchorX = args.pointerSeen ? args.pointerX : args.fallbackX;
  const anchorY = args.pointerSeen ? args.pointerY : args.fallbackY;
  return clampTrnPieCenter({
    anchorX,
    anchorY,
    layout: args.layout,
    clampBounds: args.clampBounds,
    viewportWidth: args.viewportWidth,
    viewportHeight: args.viewportHeight,
  });
}
