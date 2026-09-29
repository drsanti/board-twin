import { useMemo, useState, useRef, useCallback, useEffect, useLayoutEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { gsap } from 'gsap';
export { gsap as trnPieMenuGsap } from 'gsap';

// src/pie-menu/TRNPieMenu.tsx
var TRN_HINT_POPOVER_PANEL_CLASS = "rounded-md border border-zinc-700/80 bg-zinc-900/96 px-2.5 py-2 text-xs leading-relaxed text-zinc-100 shadow-lg ring-1 ring-black/35";
var TRN_TOOLTIP_PANEL_Z_CLASS = "z-[1100]";
function computeCandidatePosition(placement, triggerRect, tooltipWidth, tooltipHeight, offsetPx) {
  if (placement === "top") {
    return {
      x: triggerRect.left + (triggerRect.width - tooltipWidth) / 2,
      y: triggerRect.top - tooltipHeight - offsetPx
    };
  }
  if (placement === "top-start") {
    return {
      x: triggerRect.left,
      y: triggerRect.top - tooltipHeight - offsetPx
    };
  }
  if (placement === "top-end") {
    return {
      x: triggerRect.right - tooltipWidth,
      y: triggerRect.top - tooltipHeight - offsetPx
    };
  }
  if (placement === "bottom") {
    return {
      x: triggerRect.left + (triggerRect.width - tooltipWidth) / 2,
      y: triggerRect.bottom + offsetPx
    };
  }
  if (placement === "bottom-start") {
    return {
      x: triggerRect.left,
      y: triggerRect.bottom + offsetPx
    };
  }
  if (placement === "bottom-end") {
    return {
      x: triggerRect.right - tooltipWidth,
      y: triggerRect.bottom + offsetPx
    };
  }
  if (placement === "right") {
    return {
      x: triggerRect.right + offsetPx,
      y: triggerRect.top + (triggerRect.height - tooltipHeight) / 2
    };
  }
  return {
    x: triggerRect.left - tooltipWidth - offsetPx,
    y: triggerRect.top + (triggerRect.height - tooltipHeight) / 2
  };
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function tooltipPositionEquals(left, right) {
  if (left == null || right == null) {
    return left === right;
  }
  return left.x === right.x && left.y === right.y && left.placement === right.placement;
}
function pickBestTooltipPosition(options) {
  const {
    preferredPlacement,
    triggerRect,
    tooltipWidth,
    tooltipHeight,
    viewportWidth,
    viewportHeight,
    collisionPadding,
    offsetPx
  } = options;
  const fallbackOrder = [
    preferredPlacement,
    "bottom",
    "bottom-start",
    "bottom-end",
    "top",
    "top-start",
    "top-end",
    "right",
    "left"
  ].filter((value, index, all) => all.indexOf(value) === index);
  let best = null;
  let bestVisibleArea = -1;
  for (const candidatePlacement of fallbackOrder) {
    const candidate = computeCandidatePosition(
      candidatePlacement,
      triggerRect,
      tooltipWidth,
      tooltipHeight,
      offsetPx
    );
    const visibleLeft = Math.max(candidate.x, collisionPadding);
    const visibleTop = Math.max(candidate.y, collisionPadding);
    const visibleRight = Math.min(
      candidate.x + tooltipWidth,
      viewportWidth - collisionPadding
    );
    const visibleBottom = Math.min(
      candidate.y + tooltipHeight,
      viewportHeight - collisionPadding
    );
    const visibleWidth = Math.max(0, visibleRight - visibleLeft);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibleArea = visibleWidth * visibleHeight;
    const fullyVisible = visibleWidth >= tooltipWidth && visibleHeight >= tooltipHeight;
    if (fullyVisible) {
      return {
        x: clamp(
          candidate.x,
          collisionPadding,
          viewportWidth - collisionPadding - tooltipWidth
        ),
        y: clamp(
          candidate.y,
          collisionPadding,
          viewportHeight - collisionPadding - tooltipHeight
        ),
        placement: candidatePlacement
      };
    }
    if (visibleArea > bestVisibleArea) {
      bestVisibleArea = visibleArea;
      best = {
        x: clamp(
          candidate.x,
          collisionPadding,
          viewportWidth - collisionPadding - tooltipWidth
        ),
        y: clamp(
          candidate.y,
          collisionPadding,
          viewportHeight - collisionPadding - tooltipHeight
        ),
        placement: candidatePlacement
      };
    }
  }
  return best ?? {
    x: collisionPadding,
    y: collisionPadding,
    placement: preferredPlacement
  };
}
function TRNTooltip({
  content,
  trigger,
  className = "",
  panelClassName = "",
  placement = "top-end",
  collisionPadding = 8,
  offsetPx = 8,
  showTriggerOnParentHover = false,
  triggerClassName = "",
  triggerAriaLabel,
  triggerWrapper = "button",
  disableHoverFx = false,
  openDelayMs = 0,
  forceClosed = false
}) {
  const tooltipId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const openDelayTimeoutRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const panelStyle = useMemo(() => {
    if (!position) {
      return {
        left: -9999,
        top: -9999,
        visibility: "hidden"
      };
    }
    return {
      left: position.x,
      top: position.y,
      visibility: "visible"
    };
  }, [position]);
  useEffect(() => {
    return () => {
      if (openDelayTimeoutRef.current != null) {
        window.clearTimeout(openDelayTimeoutRef.current);
        openDelayTimeoutRef.current = null;
      }
    };
  }, []);
  const openWithDelay = () => {
    if (forceClosed) {
      return;
    }
    if (openDelayTimeoutRef.current != null) {
      window.clearTimeout(openDelayTimeoutRef.current);
      openDelayTimeoutRef.current = null;
    }
    if (openDelayMs <= 0) {
      setOpen(true);
      return;
    }
    openDelayTimeoutRef.current = window.setTimeout(() => {
      setOpen(true);
      openDelayTimeoutRef.current = null;
    }, openDelayMs);
  };
  const closeImmediately = () => {
    if (openDelayTimeoutRef.current != null) {
      window.clearTimeout(openDelayTimeoutRef.current);
      openDelayTimeoutRef.current = null;
    }
    setOpen(false);
  };
  useEffect(() => {
    if (!forceClosed) {
      return;
    }
    closeImmediately();
  }, [forceClosed]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event) => {
      const target = event.target;
      const root = rootRef.current;
      const panel = panelRef.current;
      if (root?.contains(target) || panel?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  useEffect(() => {
    if (!open) {
      setPosition((previous) => previous == null ? previous : null);
      return;
    }
    const updatePosition = () => {
      const triggerNode = triggerRef.current;
      const panelNode = panelRef.current;
      if (!triggerNode || !panelNode) {
        return;
      }
      const triggerRect = triggerNode.getBoundingClientRect();
      const panelRect = panelNode.getBoundingClientRect();
      const best = pickBestTooltipPosition({
        preferredPlacement: placement,
        triggerRect,
        tooltipWidth: panelRect.width,
        tooltipHeight: panelRect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        collisionPadding,
        offsetPx
      });
      setPosition((previous) => tooltipPositionEquals(previous, best) ? previous : best);
    };
    const schedulePosition = () => {
      updatePosition();
      requestAnimationFrame(() => {
        updatePosition();
      });
    };
    schedulePosition();
    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);
    return () => {
      window.removeEventListener("resize", schedulePosition);
      window.removeEventListener("scroll", schedulePosition, true);
    };
  }, [collisionPadding, offsetPx, open, placement]);
  const hoverFxClassName = disableHoverFx ? "" : showTriggerOnParentHover ? "text-transparent opacity-0 group-hover:text-zinc-400 group-hover:opacity-100 group-focus-within:text-zinc-400 group-focus-within:opacity-100 hover:scale-105 hover:text-amber-300" : "text-zinc-400 hover:scale-105 hover:text-amber-300 group-hover:text-amber-300";
  const focusRingClassName = disableHoverFx ? "focus-visible:ring-1 focus-visible:ring-white/20" : "focus-visible:ring-1 focus-visible:ring-amber-300/60";
  const handleTriggerMouseOver = () => {
    openWithDelay();
  };
  const handleTriggerMouseOut = (event) => {
    const next = event.relatedTarget;
    const root = rootRef.current;
    const panel = panelRef.current;
    if (next instanceof Node && (root?.contains(next) || panel?.contains(next))) {
      return;
    }
    closeImmediately();
  };
  const handleRootPointerEnter = () => {
    openWithDelay();
  };
  const handleRootPointerLeave = (event) => {
    handleTriggerMouseOut(event);
  };
  const triggerCommonProps = {
    ref: triggerRef,
    "aria-label": triggerAriaLabel ?? "Show hint",
    "aria-expanded": open,
    "aria-controls": tooltipId,
    className: twMerge(
      "inline-flex items-center justify-center rounded-sm p-0.5 transition-all duration-150 focus:outline-none",
      focusRingClassName,
      hoverFxClassName,
      triggerClassName
    ),
    ...triggerWrapper === "button" ? { onClick: () => setOpen((previous) => !previous) } : {},
    onFocus: openWithDelay,
    onBlur: closeImmediately,
    onMouseOver: handleTriggerMouseOver,
    onMouseOut: handleTriggerMouseOut,
    onPointerEnter: handleTriggerMouseOver,
    onPointerLeave: handleTriggerMouseOut
  };
  const tooltipPanel = open && typeof document !== "undefined" ? /* @__PURE__ */ jsx(
    "div",
    {
      ref: panelRef,
      id: tooltipId,
      role: "tooltip",
      className: twMerge(
        "pointer-events-none fixed w-max max-w-[min(320px,calc(100vw-32px))] text-left",
        TRN_TOOLTIP_PANEL_Z_CLASS,
        TRN_HINT_POPOVER_PANEL_CLASS,
        panelClassName
      ),
      style: panelStyle,
      children: content
    }
  ) : null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: rootRef,
      className: twMerge("relative", className),
      onPointerEnter: handleRootPointerEnter,
      onPointerLeave: handleRootPointerLeave,
      ...showTriggerOnParentHover ? { onMouseEnter: openWithDelay, onMouseLeave: closeImmediately } : {},
      children: [
        triggerWrapper === "button" ? /* @__PURE__ */ jsx(
          "button",
          {
            ...triggerCommonProps,
            type: "button",
            children: trigger
          }
        ) : /* @__PURE__ */ jsx(
          "span",
          {
            ...triggerCommonProps,
            role: "presentation",
            tabIndex: -1,
            children: trigger
          }
        ),
        tooltipPanel != null ? createPortal(tooltipPanel, document.body) : null
      ]
    }
  );
}

// src/pie-menu/trn-pie-menu-layout.ts
var TRN_PIE_SLOT_COUNT = 8;
var TRN_PIE_LAYOUT_DEFAULTS = {
  rowStepPx: 58,
  distributeRadiusPx: 84,
  diagonalRadiusPx: 68,
  deadZonePx: 32,
  hubSizePx: 36,
  hubRingRadiusPx: 13,
  viewportPadPx: 10
};
function trnPieDefaultHoverDiscPx(rowStepPx, distributeRadiusPx) {
  return Math.ceil(Math.max(rowStepPx * 4, distributeRadiusPx * 2) + 48);
}
function resolveTrnPieMenuLayout(config) {
  const scale = config?.scale ?? 1;
  const rowStepPx = (config?.rowStepPx ?? TRN_PIE_LAYOUT_DEFAULTS.rowStepPx) * scale;
  const distributeRadiusPx = (config?.distributeRadiusPx ?? TRN_PIE_LAYOUT_DEFAULTS.distributeRadiusPx) * scale;
  const diagonalRadiusPx = (config?.diagonalRadiusPx ?? TRN_PIE_LAYOUT_DEFAULTS.diagonalRadiusPx) * scale;
  const deadZonePx = (config?.deadZonePx ?? TRN_PIE_LAYOUT_DEFAULTS.deadZonePx) * scale;
  const hubSizePx = (config?.hubSizePx ?? TRN_PIE_LAYOUT_DEFAULTS.hubSizePx) * scale;
  const hubRingRadiusPx = (config?.hubRingRadiusPx ?? TRN_PIE_LAYOUT_DEFAULTS.hubRingRadiusPx) * scale;
  const viewportPadPx = (config?.viewportPadPx ?? TRN_PIE_LAYOUT_DEFAULTS.viewportPadPx) * scale;
  const hoverDiscPx = config?.hoverDiscPx ?? trnPieDefaultHoverDiscPx(rowStepPx, distributeRadiusPx);
  return {
    rowStepPx,
    distributeRadiusPx,
    diagonalRadiusPx,
    deadZonePx,
    hubSizePx,
    hubRingRadiusPx,
    hoverDiscPx,
    viewportPadPx
  };
}
var TRN_PIE_DEFAULT_LAYOUT = resolveTrnPieMenuLayout();
var TRN_PIE_DEAD_ZONE_PX = TRN_PIE_DEFAULT_LAYOUT.deadZonePx;
var TRN_PIE_ROW_STEP_PX = TRN_PIE_DEFAULT_LAYOUT.rowStepPx;
var TRN_PIE_SIDE_X_MAX_PX = TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx;
var TRN_PIE_SIDE_X_PX = TRN_PIE_DEFAULT_LAYOUT.diagonalRadiusPx;
var TRN_PIE_ELLIPSE_RY_PX = TRN_PIE_DEFAULT_LAYOUT.rowStepPx * 2;
var TRN_PIE_ELLIPSE_RX_PX = TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx;
var TRN_PIE_INNER_RADIUS_PX = TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx;
var TRN_PIE_DIAGONAL_RADIUS_PX = Math.round(
  Math.hypot(
    TRN_PIE_DEFAULT_LAYOUT.diagonalRadiusPx,
    TRN_PIE_DEFAULT_LAYOUT.rowStepPx
  )
);
var TRN_PIE_RADIUS_PX = TRN_PIE_DEFAULT_LAYOUT.distributeRadiusPx;
var TRN_PIE_SLICE_WIDTH_PX = 220;
var TRN_PIE_SLICE_HEIGHT_PX = 32;
var TRN_PIE_VIEWPORT_PAD_PX = TRN_PIE_DEFAULT_LAYOUT.viewportPadPx;
var TRN_PIE_HUB_SIZE_PX = TRN_PIE_DEFAULT_LAYOUT.hubSizePx;
var TRN_PIE_HOVER_DISC_PX = TRN_PIE_DEFAULT_LAYOUT.hoverDiscPx;
var TRN_PIE_HUB_RING_RADIUS_PX = TRN_PIE_DEFAULT_LAYOUT.hubRingRadiusPx;
var TRN_PIE_DIGIT_TO_SLOT = {
  "8": 0,
  "9": 1,
  "6": 2,
  "3": 3,
  "2": 4,
  "1": 5,
  "4": 6,
  "7": 7
};
var TRN_PIE_SLOT_TO_DIGIT = [
  "8",
  "9",
  "6",
  "3",
  "2",
  "1",
  "4",
  "7"
];
function trnPieSlotFromPointer(dx, dy, deadZonePx = TRN_PIE_DEFAULT_LAYOUT.deadZonePx) {
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
function trnPieSlotFromDigitKey(code, key) {
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
function trnPieBuildSlotLayout(layout = TRN_PIE_DEFAULT_LAYOUT) {
  const { rowStepPx, distributeRadiusPx, diagonalRadiusPx } = layout;
  return [
    { x: 0, y: -rowStepPx * 2 },
    // 0 · 12 o'clock
    { x: diagonalRadiusPx, y: -rowStepPx },
    // 1
    { x: distributeRadiusPx, y: 0 },
    // 2 · 3 o'clock
    { x: diagonalRadiusPx, y: rowStepPx },
    // 3
    { x: 0, y: rowStepPx * 2 },
    // 4 · 6 o'clock
    { x: -diagonalRadiusPx, y: rowStepPx },
    // 5
    { x: -distributeRadiusPx, y: 0 },
    // 6 · 9 o'clock
    { x: -diagonalRadiusPx, y: -rowStepPx }
    // 7
  ];
}
function trnPieSliceOffset(slot, layout = TRN_PIE_DEFAULT_LAYOUT) {
  return trnPieBuildSlotLayout(layout)[slot] ?? { x: 0, y: 0 };
}
function trnPieSlotAttachRadius(slot, layout = TRN_PIE_DEFAULT_LAYOUT) {
  const { x, y } = trnPieSliceOffset(slot, layout);
  return Math.hypot(x, y);
}
function trnPieSlotBoxAlign(slot) {
  const angle = slot * Math.PI / 4;
  const ox = Math.sin(angle);
  const oy = -Math.cos(angle);
  const originX = ox > 0.38 ? 1 : ox < -0.38 ? -1 : 0;
  const originY = oy > 0.38 ? 1 : oy < -0.38 ? -1 : 0;
  const tx = originX === 1 ? "0" : originX === -1 ? "-100%" : "-50%";
  const ty = originY === 1 ? "0" : originY === -1 ? "-100%" : "-50%";
  return { originX, originY, translate: `translate(${tx}, ${ty})` };
}
function trnPieHubHoverArcD(args) {
  const sweep = args.sweepDeg ?? 42;
  const midDeg = args.slot * 45 - 90;
  const startRad = (midDeg - sweep / 2) * Math.PI / 180;
  const endRad = (midDeg + sweep / 2) * Math.PI / 180;
  const x1 = args.cx + args.radius * Math.cos(startRad);
  const y1 = args.cy + args.radius * Math.sin(startRad);
  const x2 = args.cx + args.radius * Math.cos(endRad);
  const y2 = args.cy + args.radius * Math.sin(endRad);
  return `M ${x1} ${y1} A ${args.radius} ${args.radius} 0 0 1 ${x2} ${y2}`;
}
function trnPieMenuClusterExtents(layout = TRN_PIE_DEFAULT_LAYOUT, sliceWidthPx = TRN_PIE_SLICE_WIDTH_PX, sliceHeightPx = TRN_PIE_SLICE_HEIGHT_PX) {
  let minX = -layout.hubSizePx * 0.5;
  let maxX = layout.hubSizePx * 0.5;
  let minY = -36;
  let maxY = layout.hubSizePx * 0.5;
  for (let slot = 0; slot < TRN_PIE_SLOT_COUNT; slot += 1) {
    const { x, y } = trnPieSliceOffset(slot, layout);
    const align = trnPieSlotBoxAlign(slot);
    let left;
    let right;
    let top;
    let bottom;
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
function clampTrnPieCenter(args) {
  const layout = resolveTrnPieMenuLayout(args.layout);
  const pad = args.viewportPadPx ?? layout.viewportPadPx;
  const { minX, maxX, minY, maxY } = trnPieMenuClusterExtents(layout);
  let boundsLeft = 0;
  let boundsTop = 0;
  let boundsRight = args.viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : 0);
  let boundsBottom = args.viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 0);
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
    y: Math.min(Math.max(args.anchorY, minCenterY), Math.max(minCenterY, maxCenterY))
  };
}
function resolveTrnPieOpenCenter(args) {
  const anchorX = args.pointerSeen ? args.pointerX : args.fallbackX;
  const anchorY = args.pointerSeen ? args.pointerY : args.fallbackY;
  return clampTrnPieCenter({
    anchorX,
    anchorY,
    layout: args.layout,
    clampBounds: args.clampBounds,
    viewportWidth: args.viewportWidth,
    viewportHeight: args.viewportHeight
  });
}

// src/pie-menu/trn-pie-menu-config.ts
var DEFAULT_BEHAVIOR = {
  mode: "tap",
  hoverMode: "angular",
  confirmClick: "anywhere",
  disabledItems: "show",
  confirmOn: ["click", "digit", "mnemonic"],
  cancelOn: ["escape", "backdrop", "rmb"]};
var DEFAULT_ANIMATION = {
  engine: "css",
  preset: "fade-scale",
  durationSec: 0.18,
  staggerSec: 0.025,
  reduceMotion: "respect"};
function resolveTrnPieMenuBehavior(config) {
  const cancelOn = config?.cancelOn ?? DEFAULT_BEHAVIOR.cancelOn;
  const repeatCancelChord = cancelOn.includes("repeatChord") && config?.repeatCancelChord != null ? config.repeatCancelChord : null;
  return {
    mode: config?.mode === "hold-flick" ? "hold-flick" : DEFAULT_BEHAVIOR.mode,
    hoverMode: config?.hoverMode ?? DEFAULT_BEHAVIOR.hoverMode,
    confirmClick: config?.confirmClick ?? DEFAULT_BEHAVIOR.confirmClick,
    disabledItems: config?.disabledItems ?? DEFAULT_BEHAVIOR.disabledItems,
    confirmOn: config?.confirmOn ?? DEFAULT_BEHAVIOR.confirmOn,
    cancelOn,
    repeatCancelChord
  };
}
function trnPieSlotArmable(slot, slots) {
  if (slot == null) {
    return null;
  }
  const item = slots[slot];
  if (item == null || item.disabled === true) {
    return null;
  }
  return slot;
}
function trnPieNextArmableSlot(from, slots, direction) {
  const start = from ?? (direction === 1 ? -1 : 8);
  for (let step = 1; step <= 8; step += 1) {
    const next = ((start + direction * step) % 8 + 8) % 8;
    if (trnPieSlotArmable(next, slots) != null) {
      return next;
    }
  }
  return null;
}
function resolveTrnPieMenuAnimation(config) {
  const engine = config?.engine ?? DEFAULT_ANIMATION.engine;
  const reduceMotion = config?.reduceMotion ?? DEFAULT_ANIMATION.reduceMotion;
  let preset = config?.preset ?? DEFAULT_ANIMATION.preset;
  if (reduceMotion === "respect" && typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
    onCloseComplete: config?.onCloseComplete ?? null
  };
}
function trnPieMenuShouldReduceMotion(animation) {
  if (animation.reduceMotion !== "respect") {
    return false;
  }
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function trnPieMenuEffectiveAnimationPreset(animation) {
  if (trnPieMenuShouldReduceMotion(animation)) {
    return "none";
  }
  return animation.preset;
}
var GLASS_THEME_TOKENS = {
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
  sliceActiveText: "rgb(250 250 250)"
};
var BLENDER_THEME_TOKENS = {
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
  sliceActiveText: "rgb(250 250 255)"
};
var SOLID_THEME_TOKENS = {
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
  sliceActiveText: "#ffffff"
};
var SLATE_THEME_TOKENS = {
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
  sliceActiveText: "#ffffff"
};
function resolveTrnPieMenuThemeTokens(theme = "glass", overrides) {
  const base = theme === "solid" ? SOLID_THEME_TOKENS : theme === "slate" ? SLATE_THEME_TOKENS : theme === "blender" ? BLENDER_THEME_TOKENS : GLASS_THEME_TOKENS;
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
    sliceActiveText: overrides?.sliceActiveText ?? base.sliceActiveText
  };
}
function trnPieMenuCssVars(args) {
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
    "--pie-anim-stagger": `${anim.staggerSec}s`
  };
}
function trnPieMenuMatchesRepeatCancelChord(event, chord) {
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
function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
function useTrnPieMenuController(args) {
  const {
    open,
    items,
    layout: layoutConfig,
    behavior: behaviorConfig,
    hubCenter,
    openPointer,
    onConfirm,
    onCancel
  } = args;
  const layout = useMemo(
    () => resolveTrnPieMenuLayout(layoutConfig),
    [layoutConfig]
  );
  const behavior = useMemo(
    () => resolveTrnPieMenuBehavior(behaviorConfig),
    [behaviorConfig]
  );
  const [hoverSlot, setHoverSlot] = useState(null);
  const hubCenterRef = useRef(hubCenter);
  hubCenterRef.current = hubCenter;
  const openPointerRef = useRef(openPointer);
  openPointerRef.current = openPointer;
  const slotsRef = useRef([]);
  const openSeededRef = useRef(false);
  const slots = useMemo(() => {
    const next = [];
    for (let i = 0; i < 8; i += 1) {
      next.push(items[i] ?? null);
    }
    return next;
  }, [items]);
  slotsRef.current = slots;
  const slotFromPointer = useCallback(
    (clientX, clientY) => {
      const hub = hubCenterRef.current;
      if (hub == null) {
        return null;
      }
      const dx = clientX - hub.x;
      const dy = clientY - hub.y;
      return trnPieSlotFromPointer(dx, dy, layout.deadZonePx);
    },
    [layout.deadZonePx]
  );
  const resolveHoverFromPointer = useCallback(
    (clientX, clientY) => {
      if (behavior.hoverMode !== "angular") {
        return null;
      }
      return trnPieSlotArmable(slotFromPointer(clientX, clientY), slotsRef.current);
    },
    [behavior.hoverMode, slotFromPointer]
  );
  const confirmSlot = useCallback(
    (slot, via = "click") => {
      if (!open || slot == null || !behavior.confirmOn.includes(via)) {
        return;
      }
      const item = slots[slot];
      if (item == null || item.disabled === true) {
        return;
      }
      setHoverSlot(slot);
      onConfirm(item.id);
    },
    [behavior.confirmOn, onConfirm, open, slots]
  );
  const updateHoverFromPointer = useCallback(
    (clientX, clientY) => {
      if (!open || behavior.hoverMode !== "angular") {
        return;
      }
      setHoverSlot((prev) => {
        const next = resolveHoverFromPointer(clientX, clientY);
        return prev === next ? prev : next;
      });
    },
    [behavior.hoverMode, open, resolveHoverFromPointer]
  );
  const confirmFromPointer = useCallback(
    (clientX, clientY) => {
      const slot = resolveHoverFromPointer(clientX, clientY);
      if (slot != null) {
        confirmSlot(slot, "click");
        return true;
      }
      return false;
    },
    [confirmSlot, resolveHoverFromPointer]
  );
  useEffect(() => {
    if (!open) {
      openSeededRef.current = false;
      return;
    }
    if (behavior.hoverMode !== "angular" || openSeededRef.current) {
      return;
    }
    openSeededRef.current = true;
    const hub = hubCenterRef.current;
    const pointer = openPointerRef.current;
    const px = pointer?.x ?? hub?.x;
    const py = pointer?.y ?? hub?.y;
    if (px == null || py == null) {
      return;
    }
    setHoverSlot(resolveHoverFromPointer(px, py));
  }, [behavior.hoverMode, open, resolveHoverFromPointer]);
  useEffect(() => {
    if (!open || behavior.hoverMode !== "angular") {
      return;
    }
    const onPointerMove = (event) => {
      updateHoverFromPointer(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", onPointerMove, true);
    return () => {
      window.removeEventListener("pointermove", onPointerMove, true);
    };
  }, [behavior.hoverMode, open, updateHoverFromPointer]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      if (behavior.cancelOn.includes("escape") && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
        return;
      }
      if (behavior.cancelOn.includes("repeatChord") && behavior.repeatCancelChord != null && trnPieMenuMatchesRepeatCancelChord(event, behavior.repeatCancelChord)) {
        if (behavior.mode === "hold-flick") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        onCancel();
        return;
      }
      if (behavior.confirmOn.includes("digit")) {
        const digitSlot = trnPieSlotFromDigitKey(event.code, event.key);
        if (digitSlot != null) {
          event.preventDefault();
          event.stopPropagation();
          confirmSlot(trnPieSlotArmable(digitSlot, slots), "digit");
          return;
        }
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
        const next = trnPieNextArmableSlot(
          hoverSlot,
          slots,
          forward ? 1 : -1
        );
        if (next != null) {
          setHoverSlot(next);
        }
        return;
      }
      if (event.key === "Enter" && behavior.confirmOn.includes("click")) {
        const armed = trnPieSlotArmable(hoverSlot, slots);
        if (armed != null) {
          event.preventDefault();
          event.stopPropagation();
          confirmSlot(armed, "click");
        }
        return;
      }
      if (!behavior.confirmOn.includes("mnemonic")) {
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }
      const letter = event.key.length === 1 ? event.key.toLowerCase() : "";
      if (letter.length === 0) {
        return;
      }
      const mnemonicHits = slots.map((item, index) => ({ item, index })).filter(
        ({ item }) => item != null && item.disabled !== true && item.mnemonic != null && item.mnemonic.toLowerCase() === letter
      );
      if (mnemonicHits.length === 1) {
        event.preventDefault();
        event.stopPropagation();
        confirmSlot(mnemonicHits[0].index, "mnemonic");
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [behavior, confirmSlot, hoverSlot, onCancel, open, slots]);
  useEffect(() => {
    if (!open || behavior.mode !== "hold-flick" || behavior.repeatCancelChord == null) {
      return;
    }
    const onKeyUp = (event) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      if (!trnPieMenuMatchesRepeatCancelChord(event, behavior.repeatCancelChord)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const armed = trnPieSlotArmable(hoverSlot, slots);
      if (armed != null) {
        confirmSlot(armed, "click");
        return;
      }
      onCancel();
    };
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [behavior, confirmSlot, hoverSlot, onCancel, open, slots]);
  const setSliceHover = useCallback(
    (slot) => {
      if (behavior.hoverMode !== "slice-hit") {
        return;
      }
      setHoverSlot(trnPieSlotArmable(slot, slots));
    },
    [behavior.hoverMode, slots]
  );
  return {
    layout,
    behavior,
    hoverSlot,
    setSliceHover,
    slots,
    confirmSlot,
    updateHoverFromPointer,
    confirmFromPointer,
    slotFromPointer
  };
}
function useTrnPieMenuPointerAnchor() {
  const ref = useMemo(
    () => ({ x: 0, y: 0, seen: false }),
    []
  );
  const note = useCallback((clientX, clientY) => {
    ref.x = clientX;
    ref.y = clientY;
    ref.seen = true;
  }, [ref]);
  const snapshot = useCallback(() => ({ x: ref.x, y: ref.y, seen: ref.seen }), [ref]);
  return { note, snapshot };
}
function trnPieMenuCssAnimationClass(animation) {
  if (animation.engine !== "css" || animation.preset === "none") {
    return null;
  }
  if (animation.preset === "spring") {
    return null;
  }
  if (animation.preset === "fade-scale") {
    return "trn-pie-menu--anim-fade-scale";
  }
  if (animation.preset === "blender") {
    return "trn-pie-menu--anim-blender";
  }
  return null;
}
function motionSliceElements(refs) {
  return refs.slices.filter((el) => el != null);
}
function presetGsapConfig(preset, animation) {
  const duration = animation.durationSec;
  const stagger = animation.staggerSec;
  if (preset === "spring") {
    return {
      ease: "back.out(1.35)",
      hubFrom: { opacity: 0, scale: 0.55 },
      hubTo: { opacity: 1, scale: 1, duration, ease: "elastic.out(1, 0.55)" },
      sliceFrom: { opacity: 0, scale: 0.72 },
      sliceTo: { opacity: 1, scale: 1, duration, ease: "back.out(1.35)" },
      titleFrom: { opacity: 0 },
      titleTo: { opacity: 1, duration: duration * 0.9, ease: "power2.out" },
      stagger: { each: stagger, from: "center" }
    };
  }
  if (preset === "blender") {
    return {
      ease: "power3.out",
      hubFrom: { opacity: 0, scale: 0.82 },
      hubTo: { opacity: 1, scale: 1, duration: duration * 0.85 },
      sliceFrom: { opacity: 0 },
      sliceTo: { opacity: 1, duration: duration * 0.65 },
      titleFrom: { opacity: 0 },
      titleTo: { opacity: 1, duration: duration * 0.5 },
      stagger: stagger * 0.35
    };
  }
  return {
    ease: "power2.out",
    hubFrom: { opacity: 0, scale: 0.6 },
    hubTo: { opacity: 1, scale: 1, duration },
    sliceFrom: { opacity: 0, scale: 0.88 },
    sliceTo: { opacity: 1, scale: 1, duration },
    titleFrom: { opacity: 0 },
    titleTo: { opacity: 1, duration: duration * 0.85 },
    stagger
  };
}
function mergeGsapConfig(animation) {
  const base = presetGsapConfig(animation.preset, animation);
  const override = animation.gsap ?? {};
  return {
    ...base,
    ...override,
    hubFrom: { ...base.hubFrom, ...override.hubFrom },
    hubTo: { ...base.hubTo, ...override.hubTo },
    sliceFrom: { ...base.sliceFrom, ...override.sliceFrom },
    sliceTo: { ...base.sliceTo, ...override.sliceTo },
    titleFrom: { ...base.titleFrom, ...override.titleFrom },
    titleTo: { ...base.titleTo, ...override.titleTo }
  };
}
function buildTrnPieMenuGsapOpenTimeline(ctx) {
  if (ctx.animation.buildOpenTimeline) {
    const custom = ctx.animation.buildOpenTimeline(ctx);
    if (custom != null) {
      return custom;
    }
  }
  const cfg = mergeGsapConfig(ctx.animation);
  const tl = ctx.gsap.timeline({ defaults: { ease: cfg.ease ?? "power2.out" } });
  const cluster = ctx.refs.cluster;
  const hub = ctx.refs.hub;
  const title = ctx.refs.title;
  const slices = motionSliceElements(ctx.refs);
  if (cluster != null) {
    ctx.gsap.set(cluster, { opacity: 1 });
  }
  if (hub != null) {
    ctx.gsap.set(hub, cfg.hubFrom ?? { opacity: 0, scale: 0.6 });
    tl.to(hub, { ...cfg.hubTo ?? { opacity: 1, scale: 1 }, overwrite: "auto" }, 0);
  }
  if (title != null) {
    ctx.gsap.set(title, cfg.titleFrom ?? { opacity: 0 });
    tl.to(
      title,
      { ...cfg.titleTo ?? { opacity: 1 }, overwrite: "auto" },
      0
    );
  }
  if (slices.length > 0) {
    ctx.gsap.set(slices, cfg.sliceFrom ?? { opacity: 0, scale: 0.88 });
    tl.to(
      slices,
      {
        ...cfg.sliceTo ?? { opacity: 1, scale: 1 },
        stagger: cfg.stagger ?? ctx.animation.staggerSec,
        overwrite: "auto"
      },
      0
    );
  }
  return tl;
}
function buildTrnPieMenuGsapCloseTimeline(ctx) {
  if (ctx.animation.buildCloseTimeline) {
    const custom = ctx.animation.buildCloseTimeline(ctx);
    if (custom != null) {
      return custom;
    }
  }
  const duration = Math.max(0.1, ctx.animation.durationSec * 0.55);
  const tl = ctx.gsap.timeline({ defaults: { ease: "power2.out" } });
  const cluster = ctx.refs.cluster;
  const hub = ctx.refs.hub;
  const title = ctx.refs.title;
  const slices = motionSliceElements(ctx.refs);
  if (cluster != null) {
    tl.to(cluster, { opacity: 0, duration, overwrite: "auto" }, 0);
  } else {
    if (slices.length > 0) {
      tl.to(slices, { opacity: 0, duration, overwrite: "auto" }, 0);
    }
    if (title != null) {
      tl.to(title, { opacity: 0, duration, overwrite: "auto" }, 0);
    }
    if (hub != null) {
      tl.to(hub, { opacity: 0, duration, overwrite: "auto" }, 0);
    }
  }
  return tl;
}
function resetTrnPieMenuGsapTargets(ctx) {
  const targets = [
    ctx.refs.cluster,
    ctx.refs.hub,
    ctx.refs.title,
    ...motionSliceElements(ctx.refs)
  ].filter((el) => el != null);
  if (targets.length === 0) {
    return;
  }
  ctx.gsap.set(targets, { clearProps: "opacity,transform,scale" });
}

// src/pie-menu/useTrnPieMenuMotion.ts
function useTrnPieMenuMotion(args) {
  const animation = useMemo(
    () => resolveTrnPieMenuAnimation(args.animationConfig),
    [args.animationConfig]
  );
  const cssAnimClass = trnPieMenuCssAnimationClass(animation);
  const useGsap = animation.engine === "gsap" && animation.preset !== "none" && !trnPieMenuShouldReduceMotion(animation);
  const clusterRef = useRef(null);
  const hubAnimRef = useRef(null);
  const titleRef = useRef(null);
  const sliceRefs = useRef([]);
  const [mounted, setMounted] = useState(args.open);
  const timelineRef = useRef(
    null
  );
  const setSliceRef = useCallback((slot, el) => {
    sliceRefs.current[slot] = el;
  }, []);
  const motionContext = useCallback(() => {
    const refs = {
      cluster: clusterRef.current,
      hub: hubAnimRef.current,
      title: titleRef.current,
      slices: sliceRefs.current
    };
    return {
      refs,
      layout: args.layout,
      animation,
      gsap,
      slots: args.slots
    };
  }, [animation, args.layout, args.slots]);
  const motionContextRef = useRef(motionContext);
  motionContextRef.current = motionContext;
  useLayoutEffect(() => {
    if (args.open) {
      setMounted(true);
    }
  }, [args.open]);
  useLayoutEffect(() => {
    if (!mounted) {
      return;
    }
    timelineRef.current?.kill();
    timelineRef.current = null;
    if (!useGsap) {
      if (!args.open) {
        setMounted(false);
      }
      return;
    }
    const ctx = motionContextRef.current();
    if (args.open) {
      resetTrnPieMenuGsapTargets(ctx);
      let raf = 0;
      let tl2 = null;
      const runOpen = () => {
        const nextCtx = motionContextRef.current();
        const hasTargets = nextCtx.refs.hub != null || nextCtx.refs.title != null || nextCtx.refs.slices.some((el) => el != null);
        if (!hasTargets) {
          raf = requestAnimationFrame(runOpen);
          return;
        }
        tl2 = buildTrnPieMenuGsapOpenTimeline(nextCtx);
        timelineRef.current = tl2;
        if (animation.onOpenComplete) {
          tl2.eventCallback("onComplete", animation.onOpenComplete);
        }
      };
      runOpen();
      return () => {
        if (raf !== 0) {
          cancelAnimationFrame(raf);
        }
        tl2?.kill();
      };
    }
    if (!animation.animateClose) {
      setMounted(false);
      return;
    }
    const tl = buildTrnPieMenuGsapCloseTimeline(ctx);
    timelineRef.current = tl;
    tl.eventCallback("onComplete", () => {
      animation.onCloseComplete?.();
      setMounted(false);
    });
    return () => {
      tl.kill();
    };
  }, [animation, args.open, mounted, useGsap]);
  useLayoutEffect(() => {
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);
  return {
    mounted,
    useGsap,
    cssAnimClass,
    clusterRef,
    hubAnimRef,
    titleRef,
    setSliceRef
  };
}
var TRN_PIE_SLICE_ACTIVE_CLASSNAME = "trn-pie-menu__slice--active";
var TRN_PIE_SLICE_LAYOUT_CLASS = "flex h-8 w-max max-w-[240px] shrink-0 items-center justify-start gap-2 border px-2.5 py-1 text-left text-[11px] font-medium leading-tight shadow-none";
function pieLabelWithMnemonic(label, mnemonic) {
  if (mnemonic == null || mnemonic.length === 0) {
    return label;
  }
  const needle = mnemonic[0] ?? "";
  const idx = label.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) {
    return label;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    label.slice(0, idx),
    /* @__PURE__ */ jsx("span", { className: "underline underline-offset-2", children: label.slice(idx, idx + 1) }),
    label.slice(idx + 1)
  ] });
}
function pieCenterFromAnchor(anchor, layoutConfig, clampBounds) {
  if (typeof window === "undefined") {
    return anchor;
  }
  return clampTrnPieCenter({
    anchorX: anchor.x,
    anchorY: anchor.y,
    layout: layoutConfig,
    clampBounds,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  });
}
function TRNPieMenu(props) {
  const {
    open,
    title = "Snap",
    items,
    anchor,
    layout: layoutConfig,
    behavior: behaviorConfig,
    animation: animationConfig,
    theme = "glass",
    tokens,
    classNames,
    clampBounds,
    onConfirm,
    onCancel
  } = props;
  const animation = resolveTrnPieMenuAnimation(animationConfig);
  const center = pieCenterFromAnchor(anchor, layoutConfig, clampBounds);
  const hubCenter = open ? center : null;
  const openPointer = open ? anchor : null;
  const {
    layout,
    behavior,
    hoverSlot,
    setSliceHover,
    slots,
    confirmSlot,
    updateHoverFromPointer,
    confirmFromPointer
  } = useTrnPieMenuController({
    open,
    items,
    layout: layoutConfig,
    behavior: behaviorConfig,
    hubCenter,
    openPointer,
    onConfirm,
    onCancel
  });
  const angularHover = behavior.hoverMode === "angular";
  const confirmAnywhere = behavior.confirmClick === "anywhere" && behavior.confirmOn.includes("click");
  const motionSlots = useMemo(
    () => slots.map(
      (item) => item != null ? { id: item.id, disabled: item.disabled } : null
    ),
    [slots]
  );
  const {
    mounted,
    useGsap,
    cssAnimClass,
    clusterRef,
    hubAnimRef,
    titleRef,
    setSliceRef
  } = useTrnPieMenuMotion({
    open,
    animationConfig,
    layout,
    slots: motionSlots
  });
  if (!mounted || typeof document === "undefined") {
    return null;
  }
  const themeTokens = resolveTrnPieMenuThemeTokens(theme, tokens);
  const cssVars = trnPieMenuCssVars({ layout, tokens, theme, animation });
  const onOverlayPointerMove = (event) => {
    if (!open) {
      return;
    }
    updateHoverFromPointer(event.clientX, event.clientY);
  };
  const onOverlayPointerDown = (event) => {
    if (!open) {
      return;
    }
    if (event.button === 2 && behavior.cancelOn.includes("rmb")) {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.button !== 0 || !behavior.confirmOn.includes("click")) {
      return;
    }
    if (!confirmAnywhere) {
      if (behavior.cancelOn.includes("backdrop")) {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (!confirmFromPointer(event.clientX, event.clientY)) {
      if (behavior.cancelOn.includes("backdrop")) {
        onCancel();
      }
    }
  };
  const slicePointerEvents = angularHover && confirmAnywhere ? "pointer-events-none" : "pointer-events-auto";
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: twMerge("trn-pie-menu fixed inset-0 z-[2600]", classNames?.overlay),
        "data-trn-pie-menu": true,
        "data-trn-pie-theme": theme,
        style: cssVars,
        role: "presentation",
        onPointerMove: onOverlayPointerMove,
        onPointerDown: onOverlayPointerDown,
        onContextMenu: (event) => {
          if (!behavior.cancelOn.includes("rmb")) {
            return;
          }
          event.preventDefault();
          onCancel();
        },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: twMerge("absolute inset-0 cursor-default", classNames?.backdrop),
              "aria-hidden": true
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              ref: clusterRef,
              className: twMerge(
                "trn-pie-menu pointer-events-none fixed z-[2601]",
                useGsap ? "trn-pie-menu--engine-gsap" : null,
                cssAnimClass,
                classNames?.cluster
              ),
              "data-trn-pie-engine": animation.engine,
              "data-trn-pie-theme": theme,
              style: { left: center.x, top: center.y, ...cssVars },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: twMerge(
                      "pointer-events-none absolute z-0 rounded-full",
                      classNames?.hoverDisc
                    ),
                    style: {
                      width: layout.hoverDiscPx,
                      height: layout.hoverDiscPx,
                      left: -layout.hoverDiscPx / 2,
                      top: -layout.hoverDiscPx / 2
                    },
                    "aria-hidden": true
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: twMerge(
                      "trn-pie-menu__title-wrap pointer-events-none absolute z-10",
                      classNames?.titleWrap
                    ),
                    style: {
                      left: 0,
                      top: 0,
                      transform: "translate(-50%, calc(-50% - 22px))"
                    },
                    children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        ref: titleRef,
                        className: twMerge(
                          "trn-pie-menu__title whitespace-nowrap text-[10px] font-medium tracking-wide",
                          classNames?.title
                        ),
                        children: title
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "pointer-events-none absolute z-10",
                    style: {
                      left: -layout.hubSizePx / 2,
                      top: -layout.hubSizePx / 2,
                      width: layout.hubSizePx,
                      height: layout.hubSizePx
                    },
                    children: /* @__PURE__ */ jsxs(
                      "svg",
                      {
                        className: twMerge(
                          "trn-pie-menu__hub-svg pointer-events-none h-full w-full overflow-visible",
                          classNames?.hubSvg
                        ),
                        width: layout.hubSizePx,
                        height: layout.hubSizePx,
                        viewBox: `0 0 ${layout.hubSizePx} ${layout.hubSizePx}`,
                        "aria-hidden": true,
                        children: [
                          /* @__PURE__ */ jsx("g", { ref: hubAnimRef, children: /* @__PURE__ */ jsx(
                            "circle",
                            {
                              className: twMerge("trn-pie-menu__hub-ring", classNames?.hubRing),
                              cx: layout.hubSizePx / 2,
                              cy: layout.hubSizePx / 2,
                              r: layout.hubRingRadiusPx,
                              strokeWidth: "1.5"
                            }
                          ) }),
                          /* @__PURE__ */ jsx(
                            "path",
                            {
                              className: twMerge("trn-pie-menu__hub-hover-arc", classNames?.hubHoverArc),
                              d: trnPieHubHoverArcD({
                                slot: hoverSlot ?? 0,
                                cx: layout.hubSizePx / 2,
                                cy: layout.hubSizePx / 2,
                                radius: layout.hubRingRadiusPx
                              }),
                              fill: "none",
                              stroke: "var(--pie-hub-hover-arc-stroke, #60a5fa)",
                              strokeWidth: "3",
                              strokeLinecap: "round",
                              opacity: hoverSlot == null ? 0 : 1
                            }
                          )
                        ]
                      }
                    )
                  }
                ),
                slots.map((item, slot) => {
                  if (item == null) {
                    return null;
                  }
                  if (item.disabled === true && behavior.disabledItems === "hide") {
                    return null;
                  }
                  const offset = trnPieSliceOffset(slot, layout);
                  const align = trnPieSlotBoxAlign(slot);
                  const sliceTransformOrigin = `${align.originX === 1 ? "0%" : align.originX === -1 ? "100%" : "50%"} ${align.originY === -1 ? "100%" : align.originY === 1 ? "0%" : "50%"}`;
                  const active = hoverSlot === slot;
                  const digit = TRN_PIE_SLOT_TO_DIGIT[slot] ?? "";
                  const hint = item.disabled === true ? item.disabledHint ?? item.hint : item.hint;
                  const opaqueChrome = theme !== "glass";
                  const button = /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      disabled: item.disabled === true,
                      "data-trn-pie-slice-active": active ? "true" : void 0,
                      style: {
                        backgroundColor: active ? themeTokens.sliceActiveFill : themeTokens.sliceFill,
                        borderColor: active ? themeTokens.sliceActiveBorder : themeTokens.sliceBorder,
                        color: active ? themeTokens.sliceActiveText : themeTokens.sliceText,
                        backdropFilter: opaqueChrome ? "none" : void 0,
                        WebkitBackdropFilter: opaqueChrome ? "none" : void 0
                      },
                      className: twMerge(
                        TRN_PIE_SLICE_LAYOUT_CLASS,
                        opaqueChrome ? "rounded-full" : "rounded-md",
                        classNames?.slice,
                        active ? TRN_PIE_SLICE_ACTIVE_CLASSNAME : null,
                        active ? classNames?.sliceActive : null,
                        item.disabled === true ? "opacity-45" : null,
                        item.disabled === true ? classNames?.sliceDisabled : null
                      ),
                      onPointerDown: confirmAnywhere ? void 0 : (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (event.button === 2 && behavior.cancelOn.includes("rmb")) {
                          onCancel();
                          return;
                        }
                        if (event.button === 0 && behavior.confirmOn.includes("click")) {
                          confirmSlot(slot, "click");
                        }
                      },
                      children: [
                        item.icon ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center", children: item.icon }) : null,
                        /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: pieLabelWithMnemonic(item.label, item.mnemonic) }),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: twMerge(
                              "trn-pie-menu__slice-digit min-w-3 pl-1 text-right text-[10px]",
                              classNames?.sliceDigit
                            ),
                            children: digit
                          }
                        )
                      ]
                    }
                  );
                  return /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: twMerge(
                        "trn-pie-menu__slice-wrap pointer-events-none absolute z-20",
                        classNames?.sliceWrap
                      ),
                      style: {
                        left: offset.x,
                        top: offset.y,
                        transform: align.translate,
                        ["--pie-slice-index"]: String(slot)
                      },
                      children: /* @__PURE__ */ jsx(
                        "div",
                        {
                          ref: (el) => setSliceRef(slot, el),
                          className: twMerge(
                            "trn-pie-menu__slice-inner",
                            slicePointerEvents,
                            classNames?.sliceInner
                          ),
                          style: { transformOrigin: sliceTransformOrigin },
                          onPointerEnter: behavior.hoverMode === "slice-hit" ? () => setSliceHover(slot) : void 0,
                          children: hint != null && hint.length > 0 ? /* @__PURE__ */ jsx(
                            TRNTooltip,
                            {
                              content: hint,
                              trigger: button,
                              triggerWrapper: "span",
                              placement: "top",
                              openDelayMs: 400
                            }
                          ) : button
                        }
                      )
                    },
                    `${item.id}-${slot}`
                  );
                })
              ]
            }
          )
        ]
      }
    ),
    document.body
  );
}

// src/pie-menu/trn-hotkey-region.ts
var TRN_HOTKEY_REGION_ATTR = "data-trn-hotkey-region";
var lastClientX = 0;
var lastClientY = 0;
var pointerSeen = false;
function noteTrnHotkeyPointer(clientX, clientY) {
  lastClientX = clientX;
  lastClientY = clientY;
  pointerSeen = true;
}
function resetTrnHotkeyPointerForTests() {
  lastClientX = 0;
  lastClientY = 0;
  pointerSeen = false;
}
function getTrnHotkeyPointer() {
  return { x: lastClientX, y: lastClientY, seen: pointerSeen };
}
function resolveTrnHotkeyRegionFromNode(node) {
  if (node == null || typeof node.closest !== "function") {
    return null;
  }
  const el = node.closest(`[${TRN_HOTKEY_REGION_ATTR}]`);
  if (el == null) {
    return null;
  }
  const value = el.getAttribute(TRN_HOTKEY_REGION_ATTR)?.trim() ?? "";
  return value.length > 0 ? value : null;
}
function resolveTrnHotkeyRegion(clientX, clientY, doc) {
  const root = doc ?? (typeof document !== "undefined" ? document : void 0);
  if (root == null || typeof root.elementFromPoint !== "function") {
    return null;
  }
  return resolveTrnHotkeyRegionFromNode(root.elementFromPoint(clientX, clientY));
}
function resolveTrnHotkeyRegionAtLastPointer(doc) {
  if (!pointerSeen) {
    return null;
  }
  return resolveTrnHotkeyRegion(lastClientX, lastClientY, doc);
}
function useTrnHotkeyPointerTracking(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }
    const onMove = (event) => {
      noteTrnHotkeyPointer(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", onMove, { capture: true });
    return () => {
      window.removeEventListener("pointermove", onMove, { capture: true });
    };
  }, [enabled]);
}

export { TRNPieMenu, TRN_HOTKEY_REGION_ATTR, TRN_PIE_DEAD_ZONE_PX, TRN_PIE_DEFAULT_LAYOUT, TRN_PIE_DIAGONAL_RADIUS_PX, TRN_PIE_DIGIT_TO_SLOT, TRN_PIE_ELLIPSE_RX_PX, TRN_PIE_ELLIPSE_RY_PX, TRN_PIE_HOVER_DISC_PX, TRN_PIE_HUB_RING_RADIUS_PX, TRN_PIE_HUB_SIZE_PX, TRN_PIE_INNER_RADIUS_PX, TRN_PIE_RADIUS_PX, TRN_PIE_ROW_STEP_PX, TRN_PIE_SIDE_X_MAX_PX, TRN_PIE_SIDE_X_PX, TRN_PIE_SLICE_HEIGHT_PX, TRN_PIE_SLICE_WIDTH_PX, TRN_PIE_SLOT_COUNT, TRN_PIE_SLOT_TO_DIGIT, TRN_PIE_VIEWPORT_PAD_PX, buildTrnPieMenuGsapCloseTimeline, buildTrnPieMenuGsapOpenTimeline, clampTrnPieCenter, getTrnHotkeyPointer, noteTrnHotkeyPointer, resetTrnHotkeyPointerForTests, resetTrnPieMenuGsapTargets, resolveTrnHotkeyRegion, resolveTrnHotkeyRegionAtLastPointer, resolveTrnHotkeyRegionFromNode, resolveTrnPieMenuAnimation, resolveTrnPieMenuBehavior, resolveTrnPieMenuLayout, resolveTrnPieMenuThemeTokens, resolveTrnPieOpenCenter, trnPieBuildSlotLayout, trnPieHubHoverArcD, trnPieMenuClusterExtents, trnPieMenuCssAnimationClass, trnPieMenuCssVars, trnPieMenuEffectiveAnimationPreset, trnPieMenuMatchesRepeatCancelChord, trnPieMenuShouldReduceMotion, trnPieNextArmableSlot, trnPieSliceOffset, trnPieSlotArmable, trnPieSlotAttachRadius, trnPieSlotBoxAlign, trnPieSlotFromDigitKey, trnPieSlotFromPointer, useTrnHotkeyPointerTracking, useTrnPieMenuController, useTrnPieMenuMotion, useTrnPieMenuPointerAnchor };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map