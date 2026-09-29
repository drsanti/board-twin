import React, { forwardRef, useState, useRef, useEffect, useMemo, createContext, isValidElement, useCallback, useLayoutEffect, createElement, useId, useContext, Children, Fragment as Fragment$1 } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';
import { ChevronDown, EyeOff, Eye, Type, FoldHorizontal, StretchHorizontal, FoldVertical, StretchVertical, Minimize2, Maximize2, X, Pin, PinOff, ChevronUp, GripVertical, Search, ChevronRight, Check, Pencil, Loader2, CircleCheckBig, AlertCircle, ArrowUpDown, ArrowLeftRight, PanelRightOpen, PanelLeftOpen, ChevronsUp, ChevronsDown, Pipette, MoveHorizontal, SlidersHorizontal, Lock, Unlock, RotateCcw, Settings2, ChevronLeft, Box, Folder, PanelsTopLeft, CircleCheck, CircleAlert, AlertTriangle, Info, Lightbulb, Plus, Trash2, ArrowUp, ArrowUpRight, ArrowRight, ArrowDownRight, ArrowDown, ArrowDownLeft, ArrowLeft, ArrowUpLeft, List, Wifi, LayoutGrid, CheckSquare, AlignLeft, LayoutList, Image, ToggleLeft, Keyboard, Globe, Factory, LayoutTemplate, Monitor, Layers, Move3d, Cable, Link2, Clock, Hash, BarChart3, Activity, LineChart, Shapes, Pill, Bold, Palette } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useSensors, useSensor, PointerSensor, KeyboardSensor, DndContext, closestCenter } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy, rectSortingStrategy, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Prism } from 'react-syntax-highlighter';
import { oneDark, vs, oneLight, materialDark, nord, nightOwl, dracula, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { gsap } from 'gsap';
export { gsap as trnPieMenuGsap } from 'gsap';
import { clsx } from 'clsx';
import * as THREE from 'three';

// src/TRNContainer.tsx
var TRNContainer = forwardRef(function TRNContainer2(props, ref) {
  const {
    className,
    children,
    mode = "fill-parent",
    layout = "flex",
    direction = "column",
    cols = 2,
    gap = "2",
    scroll = "none",
    ...divProps
  } = props;
  const modeClass = mode === "fill-parent" ? "w-full h-full min-h-0 flex-1" : "w-fit h-fit";
  const gapClassMap = {
    "0": "gap-0",
    "1": "gap-1",
    "2": "gap-2",
    "3": "gap-3",
    "4": "gap-4",
    "6": "gap-6",
    "8": "gap-8"
  };
  const colsClassMap = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    6: "grid-cols-6",
    12: "grid-cols-12"
  };
  let layoutClass = "flex";
  if (layout === "grid") {
    layoutClass = `grid ${colsClassMap[cols]}`;
  } else if (layout === "wrap") {
    layoutClass = `flex ${direction === "row" ? "flex-row" : "flex-col"} flex-wrap`;
  } else if (layout === "stack") {
    layoutClass = "flex flex-col";
  } else {
    layoutClass = `flex ${direction === "row" ? "flex-row" : "flex-col"}`;
  }
  let scrollClass = "overflow-visible";
  if (scroll === "y") {
    scrollClass = "overflow-y-auto";
  } else if (scroll === "x") {
    scrollClass = "overflow-x-auto";
  } else if (scroll === "both") {
    scrollClass = "overflow-auto";
  }
  const mergedClassName = [modeClass, layoutClass, gapClassMap[gap], scrollClass, className ?? ""].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx("div", { ref, className: mergedClassName, ...divProps, children });
});
var TRN_WINDOW_HEADER_HEIGHT_REM = "1.5rem";
var TRN_WINDOW_PANEL_SHELL_CLASS = "rounded-md shadow-2xl";
var TRN_WINDOW_MENU_SHELL_CLASS = "rounded-lg ring-1 ring-white/10 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.9)]";
var TRN_WINDOW_PANEL_BORDER_RGB = "rgb(63 63 70)";
function getGlassProfile(preset) {
  const panel = {
    borderRgb: TRN_WINDOW_PANEL_BORDER_RGB,
    shellClass: TRN_WINDOW_PANEL_SHELL_CLASS,
    headerClass: "rounded-t-md",
    headerBorderColor: "rgb(82 82 91 / 0.72)"
  };
  if (preset === "soft") {
    return { blurPx: 8, opacity: 0.8, borderOpacity: 0.86, ...panel };
  }
  if (preset === "strong") {
    return { blurPx: 14, opacity: 0.66, borderOpacity: 0.72, ...panel };
  }
  if (preset === "toolbox") {
    return { blurPx: 6, opacity: 0.52, borderOpacity: 0.72, ...panel };
  }
  if (preset === "menu") {
    return {
      blurPx: 10,
      opacity: 0.62,
      borderOpacity: 0.15,
      borderRgb: "rgb(255 255 255)",
      shellClass: TRN_WINDOW_MENU_SHELL_CLASS,
      headerClass: "rounded-t-lg",
      headerBorderColor: "rgb(255 255 255 / 0.12)"
    };
  }
  return { blurPx: 12, opacity: 0.72, borderOpacity: 0.8, ...panel };
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function mergeRefs(...refs) {
  return (value) => {
    for (const ref of refs) {
      if (ref == null) {
        continue;
      }
      if (typeof ref === "function") {
        ref(value);
      } else {
        ref.current = value;
      }
    }
  };
}
function normalizeRect(rect, viewportWidth, viewportHeight, minWidth, minHeight) {
  const width = clamp(rect.width, minWidth, viewportWidth);
  const height = clamp(rect.height, minHeight, viewportHeight);
  const x = clamp(rect.x, 0, Math.max(0, viewportWidth - width));
  const y = clamp(rect.y, 0, Math.max(0, viewportHeight - height));
  return { x, y, width, height };
}
var TRN_WINDOW_EDGE_HIT_PX = 8;
var TRN_WINDOW_CORNER_HIT_PX = 12;
function resizeEdgeUsesEast(edge) {
  return edge === "e" || edge === "ne" || edge === "se";
}
function resizeEdgeUsesWest(edge) {
  return edge === "w" || edge === "nw" || edge === "sw";
}
function resizeEdgeUsesSouth(edge) {
  return edge === "s" || edge === "se" || edge === "sw";
}
function resizeEdgeUsesNorth(edge) {
  return edge === "n" || edge === "ne" || edge === "nw";
}
function computeResizedWindowRect(edge, base, dx, dy, viewportWidth, viewportHeight, minWidth, minHeight) {
  let x = base.x;
  let y = base.y;
  let width = base.width;
  let height = base.height;
  if (resizeEdgeUsesEast(edge)) {
    const maxWidth = Math.max(minWidth, base.width, viewportWidth - base.x);
    width = clamp(base.width + dx, minWidth, maxWidth);
  }
  if (resizeEdgeUsesWest(edge)) {
    const right = base.x + base.width;
    x = clamp(base.x + dx, 0, Math.max(0, right - minWidth));
    width = Math.max(minWidth, right - x);
  }
  if (resizeEdgeUsesSouth(edge)) {
    const maxHeight = Math.max(minHeight, base.height, viewportHeight - base.y);
    height = clamp(base.height + dy, minHeight, maxHeight);
  }
  if (resizeEdgeUsesNorth(edge)) {
    const bottom = base.y + base.height;
    y = clamp(base.y + dy, 0, Math.max(0, bottom - minHeight));
    height = Math.max(minHeight, bottom - y);
  }
  return { x, y, width, height };
}
function loadPersistedWindowGeometry(key) {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw.length === 0) {
      return null;
    }
    const o = JSON.parse(raw);
    const out = {};
    if (typeof o.x === "number" && Number.isFinite(o.x)) {
      out.x = o.x;
    }
    if (typeof o.y === "number" && Number.isFinite(o.y)) {
      out.y = o.y;
    }
    if (typeof o.width === "number" && Number.isFinite(o.width)) {
      out.width = o.width;
    }
    if (typeof o.height === "number" && Number.isFinite(o.height)) {
      out.height = o.height;
    }
    if (Object.keys(out).length === 0) {
      return null;
    }
    const autoHeightShellLocked = typeof o.autoHeightShellLocked === "boolean" ? o.autoHeightShellLocked : false;
    return { rect: out, autoHeightShellLocked };
  } catch {
    return null;
  }
}
function savePersistedWindowGeometry(key, rect, options) {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    const payload = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    };
    if (typeof options?.autoHeightShellLocked === "boolean") {
      payload.autoHeightShellLocked = options.autoHeightShellLocked;
    }
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
  }
}
var TRN_WINDOW_HEADER_ACTION_STROKE = 2.5;
var TRN_WINDOW_HEADER_DRAG_IGNORE_SELECTOR = "button, a, input, textarea, select, label, [role='button'], [data-trn-window-header-no-drag]";
function shouldIgnoreHeaderDrag(evt) {
  const target = evt.target;
  if (!(target instanceof Element)) {
    return false;
  }
  return target.closest(TRN_WINDOW_HEADER_DRAG_IGNORE_SELECTOR) != null;
}
function WindowActionButton(props) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      disabled: props.disabled,
      className: "box-border h-6 min-w-6 rounded border-0 bg-transparent px-1 text-xs transition-colors " + (props.disabled ? "cursor-not-allowed text-zinc-600 opacity-50" : "text-zinc-300 hover:bg-zinc-800/85 hover:text-zinc-100"),
      "data-trn-window-header-no-drag": true,
      onPointerDown: (evt) => evt.stopPropagation(),
      onClick: (evt) => {
        evt.stopPropagation();
        props.onClick();
      },
      "aria-label": props.label,
      title: props.title,
      children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center pt-0.5", children: props.icon })
    }
  );
}
function WindowResizeHandles(props) {
  const { mode, onResizeStart, onFitHeight } = props;
  const edgeInset = TRN_WINDOW_CORNER_HIT_PX;
  const verticalTitle = onFitHeight != null ? "Resize window (double-click to fit content height)" : "Resize window";
  if (mode === "se") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute right-0 bottom-0 z-20 h-4 w-4 cursor-se-resize",
        onPointerDown: (evt) => onResizeStart("se", evt),
        title: "Resize window",
        "aria-label": "Resize window",
        children: /* @__PURE__ */ jsx("div", { className: "absolute right-1 bottom-1 h-2.5 w-2.5 border-r-2 border-b-2 border-zinc-400/70" })
      }
    );
  }
  const edgeHit = `${TRN_WINDOW_EDGE_HIT_PX}px`;
  const cornerHit = `${TRN_WINDOW_CORNER_HIT_PX}px`;
  if (mode === "ew") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute z-20 cursor-w-resize",
          style: { top: 0, bottom: 0, left: 0, width: edgeHit },
          onPointerDown: (evt) => onResizeStart("w", evt),
          "aria-label": "Resize window from left edge",
          title: "Resize window width"
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute z-20 cursor-e-resize",
          style: { top: 0, bottom: 0, right: 0, width: edgeHit },
          onPointerDown: (evt) => onResizeStart("e", evt),
          "aria-label": "Resize window from right edge",
          title: "Resize window width"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute z-20 cursor-w-resize",
        style: { top: edgeInset, bottom: edgeInset, left: 0, width: edgeHit },
        onPointerDown: (evt) => onResizeStart("w", evt),
        "aria-label": "Resize window from left edge",
        title: "Resize window"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute z-20 cursor-e-resize",
        style: { top: edgeInset, bottom: edgeInset, right: 0, width: edgeHit },
        onPointerDown: (evt) => onResizeStart("e", evt),
        "aria-label": "Resize window from right edge",
        title: "Resize window"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute z-20 cursor-s-resize",
        style: { left: edgeInset, right: edgeInset, bottom: 0, height: edgeHit },
        onPointerDown: (evt) => onResizeStart("s", evt),
        onDoubleClick: onFitHeight,
        "aria-label": "Resize window from bottom edge",
        title: verticalTitle
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute left-0 top-0 z-20 cursor-nw-resize",
        style: { width: cornerHit, height: cornerHit },
        onPointerDown: (evt) => onResizeStart("nw", evt),
        "aria-label": "Resize window from top-left corner",
        title: "Resize window"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute right-0 top-0 z-20 cursor-ne-resize",
        style: { width: cornerHit, height: cornerHit },
        onPointerDown: (evt) => onResizeStart("ne", evt),
        "aria-label": "Resize window from top-right corner",
        title: "Resize window"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute bottom-0 left-0 z-20 cursor-sw-resize",
        style: { width: cornerHit, height: cornerHit },
        onPointerDown: (evt) => onResizeStart("sw", evt),
        onDoubleClick: onFitHeight,
        "aria-label": "Resize window from bottom-left corner",
        title: verticalTitle
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute bottom-0 right-0 z-20 cursor-se-resize",
        style: { width: cornerHit, height: cornerHit },
        onPointerDown: (evt) => onResizeStart("se", evt),
        onDoubleClick: onFitHeight,
        "aria-label": "Resize window from bottom-right corner",
        title: verticalTitle
      }
    )
  ] });
}
function WindowFooter(props) {
  const h = props.measuredShellHeightPx != null ? Math.round(props.measuredShellHeightPx) : Math.round(props.rect.height);
  const autoNote = props.heightMode === "auto" ? props.autoShellHeightLocked ? " (auto, height sized)" : " (auto)" : "";
  return /* @__PURE__ */ jsxs("div", { className: "flex h-7 shrink-0 items-center justify-left gap-4 border-t border-zinc-700/70 px-2 text-[11px] text-zinc-400", children: [
    /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Window metrics" }),
    /* @__PURE__ */ jsxs("span", { children: [
      "x: ",
      Math.round(props.rect.x),
      " | y: ",
      Math.round(props.rect.y),
      " | w:",
      " ",
      Math.round(props.rect.width),
      " | h: ",
      h,
      autoNote
    ] })
  ] });
}
function TRNWindow(props) {
  const {
    open = true,
    title = "Window",
    prefixIcon,
    onClose,
    initialRect,
    minWidth = 360,
    minHeight = 220,
    boundsRef,
    heightMode = "fixed",
    autoHeightMaxViewportFraction = 0.8,
    modal = true,
    modalBackdropCloses = true,
    zIndex = 60,
    bringToFrontOnPointerDown = true,
    draggable = true,
    resizable = true,
    resizeEdges = "all",
    reopenStrategy = "normalize",
    className,
    contentClassName,
    glass = false,
    glassPreset = "medium",
    glassBlurPx,
    glassOpacity,
    glassBorderOpacity,
    showFooter = true,
    showMaximize = true,
    showExpandFullWidth = false,
    showExpandFullHeight = false,
    headerActions,
    dragEdgeSnapPx,
    shellProps,
    shellRef: shellRefProp,
    persistRectStorageKey,
    showContent = true,
    shellStyle,
    contentStyle,
    headerStyle,
    headerClassName,
    children
  } = props;
  const managedZIndexRef = useRef(zIndex);
  const [managedZIndex, setManagedZIndex] = useState(zIndex);
  const isNonModal = modal !== true;
  const zMgr = globalThis.__TRN_WINDOW_Z_MGR__;
  if (!zMgr) {
    globalThis.__TRN_WINDOW_Z_MGR__ = { next: Math.max(200, zIndex) };
  }
  const zMgrLive = globalThis.__TRN_WINDOW_Z_MGR__;
  useEffect(() => {
    managedZIndexRef.current = zIndex;
    setManagedZIndex(zIndex);
  }, [zIndex, modal]);
  const bringToFront = useCallback(() => {
    if (!open || !isNonModal || !bringToFrontOnPointerDown) {
      return;
    }
    const next = Math.max(zMgrLive.next + 1, managedZIndexRef.current + 1, zIndex);
    zMgrLive.next = next;
    managedZIndexRef.current = next;
    setManagedZIndex(next);
  }, [bringToFrontOnPointerDown, isNonModal, open, zIndex, zMgrLive]);
  useEffect(() => {
    if (!open || !modal || !onClose) {
      return;
    }
    const onKey = (e) => {
      if (e.key !== "Escape") {
        return;
      }
      e.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [modal, onClose, open]);
  const effectivePrefixIcon = prefixIcon ?? /* @__PURE__ */ jsx(PanelsTopLeft, { className: "h-3.5 w-3.5" });
  const initial = useMemo(
    () => ({
      x: initialRect?.x ?? 120,
      y: initialRect?.y ?? 80,
      width: initialRect?.width ?? 760,
      height: initialRect?.height ?? 480
    }),
    [initialRect?.height, initialRect?.width, initialRect?.x, initialRect?.y]
  );
  const glassProfile = useMemo(
    () => getGlassProfile(glassPreset),
    [glassPreset]
  );
  const effectiveGlassBlurPx = glassBlurPx ?? glassProfile.blurPx;
  const effectiveGlassOpacity = glassOpacity ?? glassProfile.opacity;
  const effectiveGlassBorderOpacity = glassBorderOpacity ?? glassProfile.borderOpacity;
  const shellChromeClass = glass ? glassProfile.shellClass : TRN_WINDOW_PANEL_SHELL_CLASS;
  const overlayDimsRef = useRef({
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
    h: typeof window !== "undefined" ? window.innerHeight : 768
  });
  const [overlayPx, setOverlayPx] = useState(() => ({
    w: overlayDimsRef.current.w,
    h: overlayDimsRef.current.h
  }));
  const [rect, setRect] = useState(initial);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isExpandedFullWidth, setIsExpandedFullWidth] = useState(false);
  const [isExpandedFullHeight, setIsExpandedFullHeight] = useState(false);
  const restoreFullWidthAxisRef = useRef(null);
  const restoreFullHeightAxisRef = useRef(null);
  const [autoShellHeightLocked, setAutoShellHeightLocked] = useState(false);
  const verticalResizeAvailable = resizable && resizeEdges !== "ew";
  const [measuredShellHeightPx, setMeasuredShellHeightPx] = useState(null);
  const shellRef = useRef(null);
  const restoreRectRef = useRef(null);
  const prevOpenRef = useRef(open);
  const rectRef = useRef(rect);
  rectRef.current = rect;
  const persistHydratedRef = useRef(false);
  const hasAppliedInitialRectEffectRef = useRef(false);
  const dragState = useRef(null);
  const resizeState = useRef(null);
  const [portalHost, setPortalHost] = useState(null);
  useLayoutEffect(() => {
    if (!boundsRef) {
      setPortalHost(null);
      return;
    }
    const syncHost = () => {
      const el = boundsRef.current;
      setPortalHost(el);
    };
    syncHost();
    const raf = requestAnimationFrame(syncHost);
    return () => cancelAnimationFrame(raf);
  }, [boundsRef, open]);
  function readDims() {
    if (boundsRef?.current) {
      const el = boundsRef.current;
      return { w: el.clientWidth, h: el.clientHeight };
    }
    return { w: window.innerWidth, h: window.innerHeight };
  }
  useLayoutEffect(() => {
    const apply = () => {
      const d = readDims();
      overlayDimsRef.current = d;
      setOverlayPx(d);
    };
    apply();
    if (!boundsRef) {
      const onWin = () => {
        apply();
      };
      window.addEventListener("resize", onWin);
      return () => window.removeEventListener("resize", onWin);
    }
    const el = boundsRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(() => {
      apply();
      const { w: vw, h: vh } = overlayDimsRef.current;
      setRect((prev) => {
        if (isMaximized) {
          return { x: 0, y: 0, width: vw, height: vh };
        }
        if (isExpandedFullWidth || isExpandedFullHeight) {
          let next = { ...prev };
          if (isExpandedFullWidth) {
            next = { ...next, x: 0, width: vw };
          }
          if (isExpandedFullHeight) {
            next = { ...next, y: 0, height: vh };
          }
          return normalizeRect(next, vw, vh, minWidth, minHeight);
        }
        if (heightMode === "auto") {
          if (autoShellHeightLocked) {
            return normalizeRect(prev, vw, vh, minWidth, minHeight);
          }
          const next = normalizeRect(
            { ...prev, height: vh },
            vw,
            vh,
            minWidth,
            minHeight
          );
          return { ...prev, x: next.x, y: next.y, width: next.width };
        }
        return normalizeRect(prev, vw, vh, minWidth, minHeight);
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    boundsRef,
    open,
    portalHost,
    minWidth,
    minHeight,
    isMaximized,
    isExpandedFullWidth,
    isExpandedFullHeight,
    heightMode,
    autoShellHeightLocked
  ]);
  useLayoutEffect(() => {
    if (!persistRectStorageKey || persistHydratedRef.current) {
      return;
    }
    if (boundsRef != null && portalHost == null) {
      return;
    }
    const saved = loadPersistedWindowGeometry(persistRectStorageKey);
    if (saved == null) {
      persistHydratedRef.current = true;
      return;
    }
    const { w, h } = readDims();
    setAutoShellHeightLocked(
      heightMode === "auto" && !verticalResizeAvailable ? false : saved.autoHeightShellLocked
    );
    setRect(
      (prev) => normalizeRect({ ...prev, ...saved.rect }, w, h, minWidth, minHeight)
    );
    persistHydratedRef.current = true;
  }, [
    persistRectStorageKey,
    minWidth,
    minHeight,
    boundsRef,
    open,
    portalHost,
    heightMode,
    verticalResizeAvailable
  ]);
  useEffect(() => {
    setRect((prev) => ({ ...prev, ...initial }));
    setIsMaximized(false);
    restoreRectRef.current = null;
    setIsExpandedFullWidth(false);
    setIsExpandedFullHeight(false);
    restoreFullWidthAxisRef.current = null;
    restoreFullHeightAxisRef.current = null;
    if (hasAppliedInitialRectEffectRef.current) {
      setAutoShellHeightLocked(false);
    }
    hasAppliedInitialRectEffectRef.current = true;
  }, [initial]);
  useEffect(() => {
    persistHydratedRef.current = false;
  }, [persistRectStorageKey]);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (!open || wasOpen) {
      return;
    }
    let { w: vw, h: vh } = overlayDimsRef.current;
    if ((vw <= 0 || vh <= 0) && typeof window !== "undefined") {
      vw = window.innerWidth;
      vh = window.innerHeight;
    }
    if (reopenStrategy === "preserve") {
      return;
    }
    if (reopenStrategy === "reset") {
      const resetRect = normalizeRect(initial, vw, vh, minWidth, minHeight);
      setRect(resetRect);
      setIsMaximized(false);
      setAutoShellHeightLocked(false);
      restoreRectRef.current = null;
      setIsExpandedFullWidth(false);
      setIsExpandedFullHeight(false);
      restoreFullWidthAxisRef.current = null;
      restoreFullHeightAxisRef.current = null;
      return;
    }
    if (isMaximized) {
      setRect({
        x: 0,
        y: 0,
        width: vw,
        height: vh
      });
      return;
    }
    setRect((prev) => {
      if (heightMode === "auto") {
        const next = normalizeRect(
          { ...prev, height: vh },
          vw,
          vh,
          minWidth,
          minHeight
        );
        return { ...prev, x: next.x, y: next.y, width: next.width };
      }
      return normalizeRect(prev, vw, vh, minWidth, minHeight);
    });
  }, [
    open,
    reopenStrategy,
    initial,
    minWidth,
    minHeight,
    isMaximized,
    heightMode
  ]);
  useLayoutEffect(() => {
    if (!open || heightMode !== "auto" || isMaximized) {
      setMeasuredShellHeightPx((prev) => prev == null ? prev : null);
      return;
    }
    const el = shellRef.current;
    if (!el) {
      return;
    }
    const measure = () => {
      const h = el.getBoundingClientRect().height;
      setMeasuredShellHeightPx((prev) => {
        if (prev != null && Math.abs(prev - h) < 0.5) {
          return prev;
        }
        return h;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [
    open,
    heightMode,
    isMaximized,
    rect.width,
    rect.height,
    autoShellHeightLocked
  ]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onMove = (evt) => {
      let { w: vw, h: vh } = overlayDimsRef.current;
      if ((vw <= 0 || vh <= 0) && typeof window !== "undefined") {
        vw = window.innerWidth;
        vh = window.innerHeight;
      }
      if (dragState.current != null) {
        const layoutHeight = (() => {
          if (heightMode !== "auto") {
            return rectRef.current.height;
          }
          const el = shellRef.current;
          if (el == null) {
            return rectRef.current.height;
          }
          const h = el.getBoundingClientRect().height;
          return Number.isFinite(h) && h > 0 ? h : rectRef.current.height;
        })();
        const dx = evt.clientX - dragState.current.startX;
        const dy = evt.clientY - dragState.current.startY;
        let next = normalizeRect(
          {
            ...rectRef.current,
            height: layoutHeight,
            x: dragState.current.baseX + dx,
            y: dragState.current.baseY + dy
          },
          vw,
          vh,
          minWidth,
          minHeight
        );
        const snapPx = dragEdgeSnapPx ?? 0;
        if (snapPx > 0) {
          const leftGap = next.x;
          const rightGap = vw - (next.x + next.width);
          if (leftGap <= snapPx) {
            next = { ...next, x: 0 };
          } else if (rightGap <= snapPx) {
            next = { ...next, x: vw - next.width };
          }
          const bottomGap = vh - (next.y + layoutHeight);
          if (bottomGap <= snapPx) {
            next = { ...next, y: vh - layoutHeight };
          }
        }
        next = normalizeRect(
          {
            x: next.x,
            y: next.y,
            width: next.width,
            height: layoutHeight
          },
          vw,
          vh,
          minWidth,
          minHeight
        );
        setRect((prev) => ({ ...prev, x: next.x, y: next.y }));
      }
      if (resizeState.current != null) {
        const rs = resizeState.current;
        const dx = evt.clientX - rs.startX;
        const dy = evt.clientY - rs.startY;
        const next = computeResizedWindowRect(
          rs.edge,
          {
            x: rs.baseX,
            y: rs.baseY,
            width: rs.baseWidth,
            height: rs.baseHeight
          },
          dx,
          dy,
          vw,
          vh,
          minWidth,
          minHeight
        );
        setRect(next);
      }
    };
    const onUp = () => {
      const rs = resizeState.current;
      let becameHeightLocked = false;
      if (rs != null && heightMode === "auto") {
        const dh = Math.abs(rectRef.current.height - rs.baseHeight);
        if (dh >= 1) {
          becameHeightLocked = true;
        }
      }
      const revertHeightLock = rs?.autoHeightLockApplied === true && !becameHeightLocked;
      if (becameHeightLocked) {
        setAutoShellHeightLocked(true);
      } else if (revertHeightLock) {
        setAutoShellHeightLocked(false);
      }
      dragState.current = null;
      resizeState.current = null;
      if (persistRectStorageKey != null) {
        const locked = heightMode === "auto" && !revertHeightLock && (autoShellHeightLocked || becameHeightLocked);
        let r = rectRef.current;
        if (heightMode === "auto" && !locked) {
          const el = shellRef.current;
          const sh = el?.getBoundingClientRect().height;
          if (sh != null && Number.isFinite(sh) && sh > 0) {
            r = { ...rectRef.current, height: sh };
            setRect((p) => ({ ...p, height: sh }));
          }
        }
        savePersistedWindowGeometry(persistRectStorageKey, r, {
          autoHeightShellLocked: heightMode === "auto" ? locked : void 0
        });
      }
    };
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);
    return () => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
    };
  }, [
    open,
    minHeight,
    minWidth,
    heightMode,
    persistRectStorageKey,
    dragEdgeSnapPx,
    autoShellHeightLocked
  ]);
  const fitShellHeightToContent = useCallback(() => {
    if (heightMode !== "auto") {
      return;
    }
    setAutoShellHeightLocked(false);
    if (persistRectStorageKey == null) {
      return;
    }
    requestAnimationFrame(() => {
      const h = shellRef.current?.getBoundingClientRect().height;
      const r = h != null && Number.isFinite(h) && h > 0 ? { ...rectRef.current, height: h } : rectRef.current;
      savePersistedWindowGeometry(persistRectStorageKey, r, {
        autoHeightShellLocked: false
      });
    });
  }, [heightMode, persistRectStorageKey]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onResize = () => {
      const d = readDims();
      overlayDimsRef.current = d;
      setOverlayPx(d);
      const { w: vw, h: vh } = d;
      if (isMaximized) {
        setRect({
          x: 0,
          y: 0,
          width: vw,
          height: vh
        });
        return;
      }
      if (isExpandedFullWidth || isExpandedFullHeight) {
        setRect((prev) => {
          let next = { ...prev };
          if (isExpandedFullWidth) {
            next = { ...next, x: 0, width: vw };
          }
          if (isExpandedFullHeight) {
            next = { ...next, y: 0, height: vh };
          }
          return normalizeRect(next, vw, vh, minWidth, minHeight);
        });
        return;
      }
      setRect((prev) => {
        if (heightMode === "auto") {
          if (autoShellHeightLocked) {
            return normalizeRect(prev, vw, vh, minWidth, minHeight);
          }
          const next = normalizeRect(
            { ...prev, height: vh },
            vw,
            vh,
            minWidth,
            minHeight
          );
          return { ...prev, x: next.x, y: next.y, width: next.width };
        }
        return normalizeRect(prev, vw, vh, minWidth, minHeight);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [
    open,
    minHeight,
    minWidth,
    isMaximized,
    isExpandedFullWidth,
    isExpandedFullHeight,
    heightMode,
    boundsRef,
    autoShellHeightLocked
  ]);
  const footerRem = showFooter ? "1.75rem" : "0rem";
  const autoContentMaxHeight = useMemo(() => {
    if (heightMode !== "auto" || isMaximized) {
      return void 0;
    }
    if (autoShellHeightLocked) {
      return void 0;
    }
    const capPx = Math.round(autoHeightMaxViewportFraction * overlayPx.h);
    return `calc(${capPx}px - ${TRN_WINDOW_HEADER_HEIGHT_REM} - ${footerRem})`;
  }, [
    heightMode,
    isMaximized,
    autoShellHeightLocked,
    autoHeightMaxViewportFraction,
    overlayPx.h,
    footerRem
  ]);
  const contentAreaHeightClass = heightMode === "auto" && !autoShellHeightLocked ? "flex-none overflow-x-hidden overflow-y-auto p-2" : "min-h-0 flex-1 overflow-auto p-2";
  const {
    className: shellPropsClassName,
    style: shellPropsStyle,
    ...shellRest
  } = shellProps ?? {};
  const overlayInner = /* @__PURE__ */ jsxs(Fragment, { children: [
    modal ? /* @__PURE__ */ jsx(
      "div",
      {
        className: "pointer-events-auto absolute inset-0 bg-black/45",
        onClick: modalBackdropCloses ? onClose : void 0,
        "aria-hidden": "true"
      }
    ) : null,
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: mergeRefs(shellRef, shellRefProp),
        ...shellRest,
        className: twMerge(
          "pointer-events-auto absolute flex min-h-0 flex-col border",
          shellChromeClass,
          shellPropsClassName,
          className
        ),
        style: {
          ...shellPropsStyle,
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: (() => {
            if (isMaximized) {
              return rect.height;
            }
            if (heightMode === "fixed") {
              return rect.height;
            }
            if (!verticalResizeAvailable) {
              return "auto";
            }
            return autoShellHeightLocked ? rect.height : "auto";
          })(),
          maxHeight: !isMaximized && heightMode === "auto" ? `${Math.round(autoHeightMaxViewportFraction * 100)}%` : void 0,
          minHeight: !isMaximized && heightMode === "auto" ? minHeight : void 0,
          borderColor: glass ? `color-mix(in srgb, ${glassProfile.borderRgb} ${Math.round(
            effectiveGlassBorderOpacity * 100
          )}%, transparent)` : "rgb(63 63 70 / 0.75)",
          backgroundColor: glass ? `color-mix(in srgb, rgb(9 9 11) ${Math.round(
            effectiveGlassOpacity * 100
          )}%, transparent)` : "rgb(9 9 11 / 0.96)",
          backdropFilter: glass ? `blur(${effectiveGlassBlurPx}px) saturate(140%)` : void 0,
          WebkitBackdropFilter: glass ? `blur(${effectiveGlassBlurPx}px) saturate(140%)` : void 0,
          zIndex: 1,
          ...shellStyle
        },
        role: "dialog",
        "aria-modal": modal,
        "aria-label": title,
        onPointerDownCapture: () => {
          bringToFront();
        },
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: twMerge(
                "relative z-10 h-7 shrink-0 border-b px-2 py-0.5 flex items-center justify-between ",
                isMaximized ? null : glassProfile.headerClass,
                draggable && !isMaximized ? "cursor-move select-none" : "",
                headerClassName
              ),
              style: {
                borderBottomColor: glass ? glassProfile.headerBorderColor : "rgb(63 63 70 / 0.7)",
                backgroundColor: glass ? "rgb(24 24 27 / 0.5)" : void 0,
                ...headerStyle
              },
              onPointerDown: (evt) => {
                if (!draggable || isMaximized) {
                  return;
                }
                if (evt.button !== 0) {
                  return;
                }
                if (shouldIgnoreHeaderDrag(evt)) {
                  return;
                }
                evt.preventDefault();
                evt.stopPropagation();
                bringToFront();
                const header = evt.currentTarget;
                if (typeof header.setPointerCapture === "function") {
                  header.setPointerCapture(evt.pointerId);
                }
                dragState.current = {
                  startX: evt.clientX,
                  startY: evt.clientY,
                  baseX: rectRef.current.x,
                  baseY: rectRef.current.y
                };
              },
              onPointerUp: (evt) => {
                if (typeof evt.currentTarget.releasePointerCapture === "function") {
                  try {
                    evt.currentTarget.releasePointerCapture(evt.pointerId);
                  } catch {
                  }
                }
              },
              onPointerCancel: (evt) => {
                dragState.current = null;
                if (typeof evt.currentTarget.releasePointerCapture === "function") {
                  try {
                    evt.currentTarget.releasePointerCapture(evt.pointerId);
                  } catch {
                  }
                }
              },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-1.5 leading-none text-xs font-semibold text-zinc-100", children: [
                  /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center text-zinc-300", children: effectivePrefixIcon }),
                  /* @__PURE__ */ jsx("span", { children: title })
                ] }),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex translate-x-1.5 items-center gap-2",
                    "data-trn-window-header-no-drag": true,
                    children: [
                      headerActions,
                      showExpandFullWidth ? /* @__PURE__ */ jsx(
                        WindowActionButton,
                        {
                          label: isExpandedFullWidth ? "Restore width" : "Full width",
                          title: isExpandedFullWidth ? "Restore previous width" : "Expand to full overlay width",
                          disabled: isMaximized,
                          icon: isExpandedFullWidth ? /* @__PURE__ */ jsx(
                            FoldHorizontal,
                            {
                              className: "h-3.5 w-3.5",
                              strokeWidth: TRN_WINDOW_HEADER_ACTION_STROKE,
                              "aria-hidden": true
                            }
                          ) : /* @__PURE__ */ jsx(
                            StretchHorizontal,
                            {
                              className: "h-3.5 w-3.5",
                              strokeWidth: TRN_WINDOW_HEADER_ACTION_STROKE,
                              "aria-hidden": true
                            }
                          ),
                          onClick: () => {
                            if (isMaximized) {
                              return;
                            }
                            const { w: vw, h: vh } = overlayDimsRef.current;
                            const cur = rectRef.current;
                            if (!isExpandedFullWidth) {
                              restoreFullWidthAxisRef.current = { x: cur.x, width: cur.width };
                              const next2 = normalizeRect(
                                { ...cur, x: 0, width: vw },
                                vw,
                                vh,
                                minWidth,
                                minHeight
                              );
                              setRect(next2);
                              setIsExpandedFullWidth(true);
                              if (persistRectStorageKey != null) {
                                savePersistedWindowGeometry(persistRectStorageKey, next2, {
                                  autoHeightShellLocked: heightMode === "auto" ? autoShellHeightLocked : void 0
                                });
                              }
                              return;
                            }
                            const snap = restoreFullWidthAxisRef.current;
                            restoreFullWidthAxisRef.current = null;
                            setIsExpandedFullWidth(false);
                            const next = snap != null ? normalizeRect(
                              { ...rectRef.current, x: snap.x, width: snap.width },
                              vw,
                              vh,
                              minWidth,
                              minHeight
                            ) : normalizeRect(rectRef.current, vw, vh, minWidth, minHeight);
                            setRect(next);
                            if (persistRectStorageKey != null) {
                              savePersistedWindowGeometry(persistRectStorageKey, next, {
                                autoHeightShellLocked: heightMode === "auto" ? autoShellHeightLocked : void 0
                              });
                            }
                          }
                        }
                      ) : null,
                      showExpandFullHeight ? /* @__PURE__ */ jsx(
                        WindowActionButton,
                        {
                          label: isExpandedFullHeight ? "Restore height" : "Full height",
                          title: isExpandedFullHeight ? "Restore previous height" : "Expand to full overlay height",
                          disabled: isMaximized,
                          icon: isExpandedFullHeight ? /* @__PURE__ */ jsx(
                            FoldVertical,
                            {
                              className: "h-3.5 w-3.5",
                              strokeWidth: TRN_WINDOW_HEADER_ACTION_STROKE,
                              "aria-hidden": true
                            }
                          ) : /* @__PURE__ */ jsx(
                            StretchVertical,
                            {
                              className: "h-3.5 w-3.5",
                              strokeWidth: TRN_WINDOW_HEADER_ACTION_STROKE,
                              "aria-hidden": true
                            }
                          ),
                          onClick: () => {
                            if (isMaximized) {
                              return;
                            }
                            const { w: vw, h: vh } = overlayDimsRef.current;
                            const cur = rectRef.current;
                            if (!isExpandedFullHeight) {
                              restoreFullHeightAxisRef.current = { y: cur.y, height: cur.height };
                              const next2 = normalizeRect(
                                { ...cur, y: 0, height: vh },
                                vw,
                                vh,
                                minWidth,
                                minHeight
                              );
                              setRect(next2);
                              setIsExpandedFullHeight(true);
                              if (persistRectStorageKey != null) {
                                savePersistedWindowGeometry(persistRectStorageKey, next2, {
                                  autoHeightShellLocked: heightMode === "auto" ? autoShellHeightLocked : void 0
                                });
                              }
                              return;
                            }
                            const snap = restoreFullHeightAxisRef.current;
                            restoreFullHeightAxisRef.current = null;
                            setIsExpandedFullHeight(false);
                            const next = snap != null ? normalizeRect(
                              { ...rectRef.current, y: snap.y, height: snap.height },
                              vw,
                              vh,
                              minWidth,
                              minHeight
                            ) : normalizeRect(rectRef.current, vw, vh, minWidth, minHeight);
                            setRect(next);
                            if (persistRectStorageKey != null) {
                              savePersistedWindowGeometry(persistRectStorageKey, next, {
                                autoHeightShellLocked: heightMode === "auto" ? autoShellHeightLocked : void 0
                              });
                            }
                          }
                        }
                      ) : null,
                      showMaximize ? /* @__PURE__ */ jsx(
                        WindowActionButton,
                        {
                          label: isMaximized ? "Restore" : "Maximize",
                          title: isMaximized ? "Restore" : "Maximize",
                          icon: isMaximized ? /* @__PURE__ */ jsx(
                            Minimize2,
                            {
                              className: "h-3.5 w-3.5",
                              strokeWidth: TRN_WINDOW_HEADER_ACTION_STROKE,
                              "aria-hidden": true
                            }
                          ) : /* @__PURE__ */ jsx(
                            Maximize2,
                            {
                              className: "h-3.5 w-3.5",
                              strokeWidth: TRN_WINDOW_HEADER_ACTION_STROKE,
                              "aria-hidden": true
                            }
                          ),
                          onClick: () => {
                            const { w: vw, h: vh } = overlayDimsRef.current;
                            if (isMaximized) {
                              const restoreRect = restoreRectRef.current ?? initial;
                              const normalized = normalizeRect(
                                restoreRect,
                                vw,
                                vh,
                                minWidth,
                                minHeight
                              );
                              setRect(normalized);
                              setIsMaximized(false);
                              if (heightMode === "auto") {
                                setAutoShellHeightLocked(false);
                              }
                              if (persistRectStorageKey != null) {
                                savePersistedWindowGeometry(
                                  persistRectStorageKey,
                                  normalized,
                                  {
                                    autoHeightShellLocked: heightMode === "auto" ? false : void 0
                                  }
                                );
                              }
                              return;
                            }
                            restoreFullWidthAxisRef.current = null;
                            restoreFullHeightAxisRef.current = null;
                            setIsExpandedFullWidth(false);
                            setIsExpandedFullHeight(false);
                            restoreRectRef.current = { ...rectRef.current };
                            const maxed = {
                              x: 0,
                              y: 0,
                              width: vw,
                              height: vh
                            };
                            setRect(maxed);
                            setIsMaximized(true);
                            if (persistRectStorageKey != null) {
                              savePersistedWindowGeometry(persistRectStorageKey, maxed, {
                                autoHeightShellLocked: heightMode === "auto" ? false : void 0
                              });
                            }
                          }
                        }
                      ) : null,
                      onClose ? /* @__PURE__ */ jsx(
                        WindowActionButton,
                        {
                          label: "Close",
                          title: "Close",
                          icon: /* @__PURE__ */ jsx(
                            X,
                            {
                              className: "h-3.5 w-3.5",
                              strokeWidth: TRN_WINDOW_HEADER_ACTION_STROKE,
                              "aria-hidden": true
                            }
                          ),
                          onClick: onClose
                        }
                      ) : null
                    ]
                  }
                )
              ]
            }
          ),
          showContent ? /* @__PURE__ */ jsx(
            "div",
            {
              className: twMerge("relative z-0", contentAreaHeightClass, contentClassName),
              style: {
                backgroundColor: glass ? "rgb(9 9 11 / 0.26)" : "rgb(9 9 11 / 0.8)",
                ...autoContentMaxHeight != null ? { maxHeight: autoContentMaxHeight } : {},
                ...contentStyle
              },
              children
            }
          ) : null,
          showFooter ? /* @__PURE__ */ jsx(
            WindowFooter,
            {
              rect,
              measuredShellHeightPx: heightMode === "auto" && !isMaximized ? measuredShellHeightPx : null,
              heightMode,
              autoShellHeightLocked
            }
          ) : null,
          resizable && !isMaximized ? /* @__PURE__ */ jsx(
            WindowResizeHandles,
            {
              mode: resizeEdges,
              onResizeStart: (edge, evt) => {
                let baseW = rectRef.current.width;
                let baseH = rectRef.current.height;
                const autoHeightUnlocked = heightMode === "auto" && !autoShellHeightLocked;
                if (autoHeightUnlocked) {
                  const shellH = shellRef.current?.getBoundingClientRect().height;
                  if (shellH != null && Number.isFinite(shellH) && shellH > 0) {
                    baseH = shellH;
                    setRect((p) => ({ ...p, height: shellH }));
                  }
                }
                const verticalDrag = resizeEdgeUsesNorth(edge) || resizeEdgeUsesSouth(edge);
                const autoHeightLockApplied = autoHeightUnlocked && verticalDrag;
                if (autoHeightLockApplied) {
                  setAutoShellHeightLocked(true);
                }
                resizeState.current = {
                  edge,
                  startX: evt.clientX,
                  startY: evt.clientY,
                  baseWidth: baseW,
                  baseHeight: baseH,
                  baseX: rectRef.current.x,
                  baseY: rectRef.current.y,
                  autoHeightLockApplied
                };
                try {
                  evt.currentTarget.setPointerCapture?.(evt.pointerId);
                } catch {
                }
                evt.preventDefault();
                evt.stopPropagation();
              },
              onFitHeight: heightMode === "auto" && verticalResizeAvailable ? fitShellHeightToContent : void 0
            }
          ) : null
        ]
      }
    )
  ] });
  if (!open) {
    return null;
  }
  const overlayZIndex = isNonModal ? managedZIndex : zIndex;
  if (boundsRef) {
    if (portalHost == null) {
      return null;
    }
    return createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "pointer-events-none absolute inset-0 overflow-hidden",
          style: { zIndex: overlayZIndex },
          children: overlayInner
        }
      ),
      portalHost
    );
  }
  const viewportOverlay = /* @__PURE__ */ jsx("div", { className: "pointer-events-none fixed inset-0", style: { zIndex: overlayZIndex }, children: overlayInner });
  if (typeof document !== "undefined") {
    return createPortal(viewportOverlay, document.body);
  }
  return viewportOverlay;
}
var TRN_HINT_HOVER_DELAY_MS = 1e3;
var TRN_HINT_POPOVER_PANEL_CLASS = "rounded-md border border-zinc-700/80 bg-zinc-900/96 px-2.5 py-2 text-xs leading-relaxed text-zinc-100 shadow-lg ring-1 ring-black/35";
function TRNHintText(props) {
  const { children, className, tone = "muted" } = props;
  const base = tone === "warn" ? "text-amber-200/85" : tone === "info" ? "text-sky-200/85" : "text-zinc-400";
  return /* @__PURE__ */ jsx("p", { className: twMerge("text-[11px] leading-relaxed", base, className), children });
}
function TRNTitleDescriptionHint(props) {
  const { title, description, className } = props;
  const hasDescription = description != null && !(typeof description === "string" && description.trim().length === 0);
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: twMerge(
        "block text-left text-[11px] leading-relaxed text-zinc-100",
        className
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-zinc-50", children: title }),
        hasDescription ? /* @__PURE__ */ jsx("span", { className: "mt-0.5 block whitespace-pre-wrap text-zinc-300", children: description }) : null
      ]
    }
  );
}
function resolveTrnHintContent(props) {
  const { title, description, content } = props;
  if (title != null && !(typeof title === "string" && title.trim().length === 0)) {
    return createElement(TRNTitleDescriptionHint, { title, description });
  }
  return content ?? null;
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function stripTrnHintLeadingLabel(description, label) {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) {
    return description.trim();
  }
  const escaped = escapeRegExp(trimmedLabel);
  const stripped = description.trim().replace(new RegExp(`^${escaped}\\s*[\u2014\u2013\\-:]\\s*`, "i"), "").trim();
  return stripped.length > 0 ? stripped : description.trim();
}
function resolveTrnLabeledHintContent(props) {
  const { label, hintTitle, hintDescription, hint } = props;
  if (hintTitle != null || hintDescription != null) {
    const title = hintTitle ?? (typeof label === "string" && label.trim().length > 0 ? label : void 0);
    return resolveTrnHintContent({
      title,
      description: hintDescription,
      content: hintTitle == null && hintDescription == null ? hint : void 0
    });
  }
  if (typeof hint === "string") {
    const trimmedHint = hint.trim();
    if (!trimmedHint) {
      return null;
    }
    const labelStr = typeof label === "string" ? label.trim() : "";
    if (labelStr && trimmedHint === labelStr) {
      return resolveTrnHintContent({ title: labelStr });
    }
    if (labelStr) {
      return resolveTrnHintContent({
        title: labelStr,
        description: stripTrnHintLeadingLabel(trimmedHint, labelStr)
      });
    }
    return resolveTrnHintContent({ title: trimmedHint });
  }
  return resolveTrnHintContent({ content: hint });
}
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
function clamp2(value, min, max) {
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
        x: clamp2(
          candidate.x,
          collisionPadding,
          viewportWidth - collisionPadding - tooltipWidth
        ),
        y: clamp2(
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
        x: clamp2(
          candidate.x,
          collisionPadding,
          viewportWidth - collisionPadding - tooltipWidth
        ),
        y: clamp2(
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

// src/trnCompactChoiceButtonClasses.ts
var TRN_COMPACT_CHOICE_BUTTON_BASE = "inline-flex items-center justify-center rounded-sm border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50";
var TRN_COMPACT_CHOICE_BUTTON_SIZE = "h-6 min-w-10 px-2 text-xs font-medium";
function trnCompactChoiceButtonTone(selected, disabled) {
  if (disabled) {
    return "border-zinc-800/80 bg-zinc-950/60 text-zinc-600 opacity-60";
  }
  if (selected) {
    return "border-zinc-700/80 bg-cyan-500/20 text-cyan-100";
  }
  return "border-zinc-700/80 bg-zinc-900/75 text-zinc-100 hover:bg-zinc-800/75";
}
function TRNButton({
  children,
  selected = false,
  size = "default",
  className = "",
  disabled,
  prefixIcon,
  hint,
  hintTitle,
  hintDescription,
  hintPlacement = "top-start",
  title,
  ...props
}) {
  const resolvedHint = resolveTrnLabeledHintContent({
    label: typeof children === "string" ? children : void 0,
    hintTitle,
    hintDescription,
    hint
  });
  const hasHint = resolvedHint != null;
  const flexLayout = pickFlexLayoutClasses(className);
  const heightLayout = pickHeightLayoutClasses(className);
  const innerLayout = pickButtonInnerLayoutClasses(className);
  const fillHeight = heightLayout.includes("h-full") || heightLayout.includes("self-stretch");
  const hasFlexibleHeight = heightLayout.includes("h-auto") || /\bmin-h-\S+/.test(heightLayout);
  const isMultilineHintButton = hasHint && (hasFlexibleHeight || innerLayout.includes("flex-col"));
  const sizeClass = size === "compact" ? fillHeight || isMultilineHintButton ? twMerge(
    "min-h-0 min-w-10 px-2 text-xs font-medium",
    isMultilineHintButton && "h-full w-full"
  ) : TRN_COMPACT_CHOICE_BUTTON_SIZE : fillHeight || isMultilineHintButton ? twMerge(
    "min-h-0 min-w-12 px-3 text-sm font-semibold",
    isMultilineHintButton && "h-full w-full"
  ) : "h-8 min-w-12 px-3 text-sm font-semibold";
  const toneClass = trnCompactChoiceButtonTone(selected, disabled === true);
  const buttonClassName = twMerge(
    TRN_COMPACT_CHOICE_BUTTON_BASE,
    sizeClass,
    toneClass,
    hasHint ? "w-full" : "",
    hasHint ? stripOuterLayoutClasses(className) : className,
    hasHint ? innerLayout : ""
  );
  const button = /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      disabled,
      className: buttonClassName,
      title: hasHint ? void 0 : title,
      ...props,
      children: [
        prefixIcon ? /* @__PURE__ */ jsx("span", { className: "mr-1 inline-flex shrink-0 items-center", children: prefixIcon }) : null,
        children
      ]
    }
  );
  if (!hasHint) {
    return button;
  }
  return /* @__PURE__ */ jsx(
    TRNTooltip,
    {
      className: twMerge(
        "flex min-w-0 flex-1 self-stretch",
        flexLayout,
        heightLayout
      ),
      triggerWrapper: "span",
      trigger: button,
      triggerClassName: twMerge(
        "flex h-full w-full min-w-0 flex-1 self-stretch items-stretch p-0",
        flexLayout,
        heightLayout
      ),
      triggerAriaLabel: typeof children === "string" ? `${children} \u2014 show hint` : "Show hint",
      content: resolvedHint,
      panelClassName: twMerge(
        TRN_HINT_POPOVER_PANEL_CLASS,
        "max-w-[min(320px,calc(100vw-48px))]"
      ),
      placement: hintPlacement,
      openDelayMs: TRN_HINT_HOVER_DELAY_MS,
      disableHoverFx: true
    }
  );
}
var FLEX_LAYOUT_CLASS = /^(flex-1|flex-auto|flex-initial|flex-none|grow(?:-\d+)?|shrink(?:-\d+)?|min-w-\S+|max-w-\S+|w-full|basis-\S+)$/;
var HEIGHT_LAYOUT_CLASS = /^(h-full|h-auto|h-\S+|min-h-\S+|max-h-\S+|self-stretch|self-auto|items-stretch|items-center)$/;
var BUTTON_INNER_LAYOUT_CLASS = /^(flex-col|flex-row|items-start|items-end|justify-start|justify-center|justify-between|gap-\S+|text-left|text-center|text-right|py-\S+|leading-tight|leading-snug|font-normal|font-medium)$/;
function pickFlexLayoutClasses(className) {
  return className.split(/\s+/).filter((token) => FLEX_LAYOUT_CLASS.test(token)).join(" ");
}
function pickHeightLayoutClasses(className) {
  return className.split(/\s+/).filter((token) => HEIGHT_LAYOUT_CLASS.test(token)).join(" ");
}
function pickButtonInnerLayoutClasses(className) {
  return className.split(/\s+/).filter((token) => BUTTON_INNER_LAYOUT_CLASS.test(token)).join(" ");
}
function stripOuterLayoutClasses(className) {
  return className.split(/\s+/).filter(
    (token) => token.length > 0 && !FLEX_LAYOUT_CLASS.test(token) && !HEIGHT_LAYOUT_CLASS.test(token) && !BUTTON_INNER_LAYOUT_CLASS.test(token)
  ).join(" ");
}
function defaultVariantIcon(variant) {
  switch (variant) {
    case "info":
      return /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-sky-400", strokeWidth: 2.25, "aria-hidden": true });
    case "suggestion":
      return /* @__PURE__ */ jsx(
        Lightbulb,
        {
          className: "h-4 w-4 text-amber-400",
          strokeWidth: 2.25,
          "aria-hidden": true
        }
      );
    case "warning":
      return /* @__PURE__ */ jsx(
        AlertTriangle,
        {
          className: "h-4 w-4 text-amber-500",
          strokeWidth: 2.25,
          "aria-hidden": true
        }
      );
    case "error":
      return /* @__PURE__ */ jsx(
        CircleAlert,
        {
          className: "h-4 w-4 text-red-400",
          strokeWidth: 2.25,
          "aria-hidden": true
        }
      );
    default:
      return /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-zinc-400", strokeWidth: 2.25, "aria-hidden": true });
  }
}
var MESSAGE_DIALOG_SHELL_HEIGHT_PX = 380;
function computeCenteredRect() {
  if (typeof window === "undefined") {
    return {
      x: 120,
      y: 100,
      width: 420,
      height: MESSAGE_DIALOG_SHELL_HEIGHT_PX
    };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(440, Math.max(300, vw - 48));
  const h = Math.min(MESSAGE_DIALOG_SHELL_HEIGHT_PX, Math.max(200, vh - 48));
  const x = Math.max(16, (vw - width) / 2);
  const y = Math.max(16, (vh - h) / 2);
  return { x, y, width, height: h };
}
function TRNMessageDialog({
  open,
  onOpenChange,
  title,
  variant = "info",
  prefixIcon,
  children,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  primaryTone = "default",
  zIndex = 72
}) {
  const [initialRect, setInitialRect] = useState(
    computeCenteredRect
  );
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    setInitialRect(computeCenteredRect());
  }, [open]);
  const icon = prefixIcon ?? defaultVariantIcon(variant);
  const primaryClassName = primaryTone === "danger" ? "border-red-700/80 bg-red-950/50 text-red-100 hover:bg-red-900/55" : void 0;
  const runClose = () => {
    onOpenChange(false);
  };
  const wrapAction = (action, closeAfter) => {
    action.onClick();
    {
      runClose();
    }
  };
  return /* @__PURE__ */ jsx(
    TRNWindow,
    {
      open,
      title,
      prefixIcon: icon,
      onClose: runClose,
      initialRect,
      minWidth: 300,
      minHeight: 120,
      modal: true,
      modalBackdropCloses: false,
      draggable: false,
      resizable: false,
      showMaximize: false,
      showFooter: false,
      heightMode: "fixed",
      glass: true,
      glassPreset: "medium",
      zIndex,
      contentClassName: "min-h-0 overflow-y-auto",
      children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-col gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "wrap-break-word text-xs leading-relaxed text-zinc-300", children }),
        (tertiaryAction != null || secondaryAction != null || primaryAction != null) && /* @__PURE__ */ jsxs("div", { className: "flex flex-row flex-wrap justify-end gap-2 pt-1", children: [
          tertiaryAction != null ? /* @__PURE__ */ jsx(
            TRNButton,
            {
              size: "compact",
              onClick: () => wrapAction(tertiaryAction),
              children: tertiaryAction.label
            }
          ) : null,
          secondaryAction != null ? /* @__PURE__ */ jsx(
            TRNButton,
            {
              size: "compact",
              onClick: () => wrapAction(secondaryAction),
              children: secondaryAction.label
            }
          ) : null,
          primaryAction != null ? /* @__PURE__ */ jsx(
            TRNButton,
            {
              size: "compact",
              selected: primaryTone === "default",
              className: twMerge(primaryClassName),
              onClick: () => wrapAction(primaryAction),
              children: primaryAction.label
            }
          ) : null
        ] })
      ] })
    }
  );
}
function variantChrome(variant) {
  switch (variant) {
    case "info":
      return {
        border: "border-sky-400/25",
        panel: "bg-zinc-950/55",
        iconShell: "border-sky-400/40 bg-sky-500/15",
        icon: "text-sky-400",
        title: "text-sky-50",
        progress: "bg-sky-400/80",
        ringVar: "rgba(56, 189, 248, 0.35)"
      };
    case "warning":
      return {
        border: "border-amber-400/30",
        panel: "bg-zinc-950/55",
        iconShell: "border-amber-400/40 bg-amber-500/15",
        icon: "text-amber-400",
        title: "text-amber-50",
        progress: "bg-amber-400/80",
        ringVar: "rgba(251, 191, 36, 0.35)"
      };
    case "error":
      return {
        border: "border-rose-400/30",
        panel: "bg-zinc-950/55",
        iconShell: "border-rose-400/40 bg-rose-500/15",
        icon: "text-rose-400",
        title: "text-rose-50",
        progress: "bg-rose-400/80",
        ringVar: "rgba(251, 113, 133, 0.35)"
      };
    case "success":
    default:
      return {
        border: "border-emerald-400/25",
        panel: "bg-zinc-950/55",
        iconShell: "border-emerald-400/40 bg-emerald-500/15",
        icon: "text-emerald-400",
        title: "text-emerald-50",
        progress: "bg-emerald-400/80",
        ringVar: "rgba(52, 211, 153, 0.35)"
      };
  }
}
function defaultVariantIcon2(variant) {
  const iconClass = "h-9 w-9";
  switch (variant) {
    case "info":
      return /* @__PURE__ */ jsx(Info, { className: twMerge(iconClass, "text-sky-400"), strokeWidth: 2, "aria-hidden": true });
    case "warning":
      return /* @__PURE__ */ jsx(AlertTriangle, { className: twMerge(iconClass, "text-amber-400"), strokeWidth: 2, "aria-hidden": true });
    case "error":
      return /* @__PURE__ */ jsx(CircleAlert, { className: twMerge(iconClass, "text-rose-400"), strokeWidth: 2, "aria-hidden": true });
    case "success":
    default:
      return /* @__PURE__ */ jsx(CircleCheck, { className: twMerge(iconClass, "text-emerald-400"), strokeWidth: 2, "aria-hidden": true });
  }
}
var EXIT_ANIMATION_MS = 220;
function TRNFloatingNotice(props) {
  const {
    open,
    title,
    message,
    variant = "success",
    prefixIcon,
    autoDismissMs = 3200,
    showProgress = true,
    pauseDismissOnHover = false,
    showBackdrop = false,
    showClose = true,
    zIndex = 120,
    className,
    actions,
    onOpenChange
  } = props;
  const titleId = useId();
  const messageId = useId();
  const chrome = variantChrome(variant);
  const icon = prefixIcon ?? defaultVariantIcon2(variant);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [progressDurationMs, setProgressDurationMs] = useState(autoDismissMs);
  const [progressEpoch, setProgressEpoch] = useState(0);
  const dismissTimerRef = useRef(null);
  const exitTimerRef = useRef(null);
  const dismissAtRef = useRef(null);
  const remainingMsRef = useRef(autoDismissMs);
  const hoverPausedRef = useRef(false);
  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current != null) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);
  const clearTimers = useCallback(() => {
    clearDismissTimer();
    if (exitTimerRef.current != null) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, [clearDismissTimer]);
  const scheduleDismiss = useCallback(
    (delayMs) => {
      clearDismissTimer();
      const clamped = Math.max(0, delayMs);
      remainingMsRef.current = clamped;
      if (clamped <= 0) {
        requestCloseRef.current();
        return;
      }
      dismissAtRef.current = Date.now() + clamped;
      dismissTimerRef.current = setTimeout(() => {
        dismissTimerRef.current = null;
        requestCloseRef.current();
      }, clamped);
    },
    [clearDismissTimer]
  );
  const requestCloseRef = useRef(() => {
  });
  const requestClose = useCallback(() => {
    clearTimers();
    setHoverPaused(false);
    hoverPausedRef.current = false;
    setExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setVisible(false);
      setExiting(false);
      onOpenChange?.(false);
      exitTimerRef.current = null;
    }, EXIT_ANIMATION_MS);
  }, [clearTimers, onOpenChange]);
  requestCloseRef.current = requestClose;
  const handlePointerEnter = useCallback(() => {
    if (!pauseDismissOnHover || autoDismissMs <= 0) {
      return;
    }
    clearDismissTimer();
    const dismissAt = dismissAtRef.current;
    if (dismissAt != null) {
      remainingMsRef.current = Math.max(0, dismissAt - Date.now());
    }
    dismissAtRef.current = null;
    hoverPausedRef.current = true;
    setHoverPaused(true);
  }, [pauseDismissOnHover, autoDismissMs, clearDismissTimer]);
  const handlePointerLeave = useCallback(() => {
    if (!pauseDismissOnHover || autoDismissMs <= 0 || !hoverPausedRef.current) {
      return;
    }
    const remaining = remainingMsRef.current;
    hoverPausedRef.current = false;
    setHoverPaused(false);
    scheduleDismiss(remaining);
  }, [pauseDismissOnHover, autoDismissMs, scheduleDismiss]);
  useEffect(() => {
    if (!open) {
      clearTimers();
      setVisible(false);
      setExiting(false);
      setHoverPaused(false);
      hoverPausedRef.current = false;
      return;
    }
    setExiting(false);
    setVisible(true);
    setHoverPaused(false);
    hoverPausedRef.current = false;
    clearTimers();
    remainingMsRef.current = autoDismissMs;
    setProgressDurationMs(autoDismissMs);
    setProgressEpoch((epoch) => epoch + 1);
    if (autoDismissMs > 0) {
      scheduleDismiss(autoDismissMs);
    }
    return clearTimers;
  }, [open, autoDismissMs, clearTimers, scheduleDismiss]);
  useEffect(() => {
    if (!visible || !showClose) {
      return;
    }
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, showClose, requestClose]);
  useEffect(() => () => clearTimers(), [clearTimers]);
  if (!visible || typeof document === "undefined") {
    return null;
  }
  const panelStyle = {
    zIndex,
    ["--trn-floating-notice-ring"]: chrome.ringVar,
    ...autoDismissMs > 0 && showProgress ? { ["--trn-floating-notice-dismiss-ms"]: `${progressDurationMs}ms` } : {}
  };
  const showProgressBar = autoDismissMs > 0 && showProgress;
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: twMerge(
          "fixed inset-0 flex items-center justify-center p-4",
          showBackdrop ? "pointer-events-auto" : "pointer-events-none"
        ),
        style: panelStyle,
        role: "status",
        "aria-live": "polite",
        children: [
          showBackdrop ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px]",
              "aria-label": "Close notice",
              onClick: requestClose
            }
          ) : null,
          /* @__PURE__ */ jsxs(
            "div",
            {
              role: "dialog",
              "aria-modal": showBackdrop,
              "aria-labelledby": titleId,
              "aria-describedby": message != null && message.length > 0 ? messageId : void 0,
              className: twMerge(
                "trn-floating-notice-card pointer-events-auto relative w-full max-w-[300px] rounded-xl border px-5 pb-4 pt-5",
                "shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-xl",
                chrome.border,
                chrome.panel,
                exiting ? "trn-floating-notice-card--exit" : "trn-floating-notice-card--enter",
                className
              ),
              onClick: (e) => e.stopPropagation(),
              onPointerEnter: handlePointerEnter,
              onPointerLeave: handlePointerLeave,
              children: [
                showClose ? /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-600/60 bg-zinc-900/50 text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-100",
                    "aria-label": "Close",
                    onClick: requestClose,
                    children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5", strokeWidth: 2.25, "aria-hidden": true })
                  }
                ) : null,
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: twMerge(
                        "trn-floating-notice-icon-shell flex h-14 w-14 items-center justify-center rounded-full border",
                        chrome.iconShell
                      ),
                      "aria-hidden": true,
                      children: /* @__PURE__ */ jsx("div", { className: "trn-floating-notice-icon flex items-center justify-center", children: icon })
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 px-1", children: [
                    /* @__PURE__ */ jsx(
                      "h2",
                      {
                        id: titleId,
                        className: twMerge("text-sm font-semibold tracking-tight", chrome.title),
                        children: title
                      }
                    ),
                    message != null && message.length > 0 ? /* @__PURE__ */ jsx("p", { id: messageId, className: "text-[11px] leading-relaxed text-zinc-300/90", children: message }) : null
                  ] }),
                  actions != null ? /* @__PURE__ */ jsx("div", { className: "flex w-full flex-col gap-1.5 px-1", children: actions }) : null,
                  showProgressBar ? /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "h-0.5 w-full overflow-hidden rounded-full bg-zinc-800/80",
                      "aria-hidden": true,
                      children: /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: twMerge(
                            "trn-floating-notice-progress h-full rounded-full",
                            chrome.progress,
                            hoverPaused && "trn-floating-notice-progress--paused"
                          )
                        },
                        `trn-floating-notice-progress-${progressEpoch}`
                      )
                    }
                  ) : null
                ] })
              ]
            }
          )
        ]
      }
    ),
    document.body
  );
}
function defaultVariantIcon3(variant) {
  switch (variant) {
    case "info":
      return /* @__PURE__ */ jsx(Info, { className: "h-6 w-6 text-sky-400", strokeWidth: 2.25, "aria-hidden": true });
    case "warning":
      return /* @__PURE__ */ jsx(
        AlertTriangle,
        {
          className: "h-6 w-6 text-amber-400",
          strokeWidth: 2.25,
          "aria-hidden": true
        }
      );
    case "error":
    default:
      return /* @__PURE__ */ jsx(
        CircleAlert,
        {
          className: "h-6 w-6 text-rose-400",
          strokeWidth: 2.25,
          "aria-hidden": true
        }
      );
  }
}
function variantPanelClass(variant) {
  switch (variant) {
    case "info":
      return "border-sky-500/35 bg-zinc-950/92 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]";
    case "warning":
      return "border-amber-500/40 bg-zinc-950/92 shadow-[0_0_0_1px_rgba(245,158,11,0.12)]";
    case "error":
    default:
      return "border-rose-500/45 bg-zinc-950/94 shadow-[0_0_0_1px_rgba(244,63,94,0.14)]";
  }
}
function variantIconWrapClass(variant) {
  switch (variant) {
    case "info":
      return "bg-sky-500/15";
    case "warning":
      return "bg-amber-500/15";
    case "error":
    default:
      return "bg-rose-500/15";
  }
}
function TRNAlertOverlay(props) {
  const {
    open,
    variant = "error",
    prefixIcon,
    children,
    zIndex = 85,
    className,
    onRequestClose,
    ...rest
  } = props;
  useEffect(() => {
    if (!open || !onRequestClose) {
      return;
    }
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onRequestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onRequestClose]);
  if (!open) {
    return null;
  }
  const icon = prefixIcon ?? defaultVariantIcon3(variant);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "t3d-shell-overlay fixed inset-0 flex items-center justify-center p-4",
      style: { zIndex },
      children: [
        onRequestClose ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "absolute inset-0 cursor-default bg-black/65 backdrop-blur-[2px]",
            "aria-label": "Close alert",
            onClick: onRequestClose
          }
        ) : /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 bg-black/65 backdrop-blur-[2px]",
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            role: "alert",
            "aria-live": "assertive",
            className: twMerge(
              "relative max-h-[min(640px,calc(100vh-2rem))] w-full max-w-md overflow-y-auto rounded-xl border px-4 py-4 shadow-2xl",
              variantPanelClass(variant),
              className
            ),
            onClick: (e) => e.stopPropagation(),
            ...rest,
            children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: twMerge(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                    variantIconWrapClass(variant)
                  ),
                  children: icon
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1 text-left", children })
            ] })
          }
        )
      ]
    }
  );
}
var TOOLBOX_HEADER_ICON_STROKE = 2.5;
var TOOLBOX_HEADER_MIN_PX = 24;
var DEFAULT_DRAG_EDGE_SNAP_PX = 12;
var DEFAULT_EXPANDED_MIN_HEIGHT = 120;
var TRN_TOOLBOX_PIN_GLASS_OPACITY = 0.78;
var TRN_TOOLBOX_PIN_GLASS_BORDER_OPACITY = 0.86;
var TRN_TOOLBOX_PIN_GLASS_BLUR_PX = 10;
function readStoredCollapsed(persistKey) {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const v = localStorage.getItem(`${persistKey}:collapsed`);
    if (v === "true") {
      return true;
    }
    if (v === "false") {
      return false;
    }
  } catch {
  }
  return null;
}
function writeStoredCollapsed(persistKey, collapsed) {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      `${persistKey}:collapsed`,
      collapsed ? "true" : "false"
    );
  } catch {
  }
}
function readStoredPinOpaque(persistKey) {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const v = localStorage.getItem(`${persistKey}:pinOpaque`);
    if (v === "true") {
      return true;
    }
    if (v === "false") {
      return false;
    }
  } catch {
  }
  return null;
}
function writeStoredPinOpaque(persistKey, pinOpaque) {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      `${persistKey}:pinOpaque`,
      pinOpaque ? "true" : "false"
    );
  } catch {
  }
}
function assignRef(ref, value) {
  if (ref == null) {
    return;
  }
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}
function TRNToolboxPanel(props) {
  const {
    defaultCollapsed = false,
    collapsed: collapsedProp,
    onCollapsedChange,
    persistCollapsed = true,
    toolbarActions,
    pinControl = "toggle",
    collapseControl = "toggle",
    persistPinOpaque = true,
    collapseOnEscape = true,
    children,
    minHeight: minHeightProp,
    resizable: resizableProp,
    heightMode = "auto",
    modal = false,
    showFooter = false,
    glass = true,
    glassPreset = "toolbox",
    glassOpacity: glassOpacityProp,
    glassBorderOpacity: glassBorderOpacityProp,
    glassBlurPx: glassBlurPxProp,
    dragEdgeSnapPx = DEFAULT_DRAG_EDGE_SNAP_PX,
    persistRectStorageKey,
    shellProps: userShellProps,
    shellRef: userShellRef,
    className: userClassName,
    ...rest
  } = props;
  const shellRef = useRef(null);
  const setShellRef = useCallback(
    (node) => {
      shellRef.current = node;
      assignRef(userShellRef, node);
    },
    [userShellRef]
  );
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (defaultCollapsed) {
      return true;
    }
    if (persistRectStorageKey != null && persistCollapsed) {
      const fromStore = readStoredCollapsed(persistRectStorageKey);
      if (fromStore != null) {
        return fromStore;
      }
    }
    return false;
  });
  const [internalPinOpaque, setInternalPinOpaque] = useState(() => {
    if (persistRectStorageKey != null && persistPinOpaque && pinControl !== "off") {
      const fromStore = readStoredPinOpaque(persistRectStorageKey);
      if (fromStore != null) {
        return fromStore;
      }
    }
    return false;
  });
  const collapsible = collapseControl !== "off";
  const collapsed = collapsible ? collapsedProp ?? internalCollapsed : false;
  const pinOpaque = pinControl === "off" ? false : internalPinOpaque;
  const setCollapsed = useCallback(
    (next) => {
      if (onCollapsedChange) {
        onCollapsedChange(next);
      } else {
        setInternalCollapsed(next);
      }
    },
    [onCollapsedChange]
  );
  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);
  const togglePinOpaque = useCallback(() => {
    setInternalPinOpaque((p) => !p);
  }, []);
  useEffect(() => {
    if (!persistRectStorageKey || !persistCollapsed || !collapsible) {
      return;
    }
    writeStoredCollapsed(persistRectStorageKey, collapsed);
  }, [collapsed, collapsible, persistRectStorageKey, persistCollapsed]);
  useEffect(() => {
    if (!persistRectStorageKey || !persistPinOpaque || pinControl === "off") {
      return;
    }
    writeStoredPinOpaque(persistRectStorageKey, pinOpaque);
  }, [pinOpaque, persistPinOpaque, persistRectStorageKey, pinControl]);
  useEffect(() => {
    if (!collapseOnEscape || collapsed || !collapsible) {
      return;
    }
    const onKey = (evt) => {
      if (evt.key !== "Escape" || evt.defaultPrevented) {
        return;
      }
      const shell = shellRef.current;
      if (shell == null) {
        return;
      }
      const active = document.activeElement;
      if (active != null && !shell.contains(active)) {
        return;
      }
      evt.preventDefault();
      setCollapsed(true);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [collapseOnEscape, collapsed, collapsible, setCollapsed]);
  const minHeight = collapsed ? TOOLBOX_HEADER_MIN_PX : minHeightProp ?? DEFAULT_EXPANDED_MIN_HEIGHT;
  const resizable = collapsed ? false : resizableProp ?? true;
  const glassOpacityEffective = glass && pinOpaque ? TRN_TOOLBOX_PIN_GLASS_OPACITY : glassOpacityProp;
  const glassBorderOpacityEffective = glass && pinOpaque ? TRN_TOOLBOX_PIN_GLASS_BORDER_OPACITY : glassBorderOpacityProp;
  const glassBlurEffective = glass && pinOpaque ? TRN_TOOLBOX_PIN_GLASS_BLUR_PX : glassBlurPxProp;
  const mergedShellProps = useMemo(() => {
    const tabIndexForEsc = collapseOnEscape === true ? userShellProps?.tabIndex ?? -1 : userShellProps?.tabIndex;
    return {
      ...userShellProps,
      tabIndex: tabIndexForEsc,
      "data-trn-toolbox-panel": true
    };
  }, [collapseOnEscape, userShellProps]);
  const headerActions = /* @__PURE__ */ jsxs(Fragment, { children: [
    pinControl === "toggle" ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "h-6 min-w-6 rounded border-0 bg-transparent px-1 pt-[2px] text-xs text-zinc-100 hover:bg-white/10",
        onClick: togglePinOpaque,
        onPointerDown: (e) => {
          e.stopPropagation();
        },
        "aria-pressed": pinOpaque,
        title: pinOpaque ? "More transparent glass (see 3D scene)" : "More opaque glass (readability)",
        "aria-label": pinOpaque ? "Use more transparent glass" : "Use more opaque glass",
        children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center text-zinc-200", children: pinOpaque ? /* @__PURE__ */ jsx(Pin, { className: "h-3.5 w-3.5", strokeWidth: TOOLBOX_HEADER_ICON_STROKE, "aria-hidden": true }) : /* @__PURE__ */ jsx(
          PinOff,
          {
            className: "h-3.5 w-3.5 text-zinc-400",
            strokeWidth: TOOLBOX_HEADER_ICON_STROKE,
            "aria-hidden": true
          }
        ) })
      }
    ) : null,
    toolbarActions,
    collapsible ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: twMerge(
          "h-6 min-w-6 rounded border-0 bg-transparent px-1 text-xs text-zinc-100 hover:bg-white/10",
          collapsed ? "pt-0.5" : null
        ),
        onClick: toggleCollapsed,
        onPointerDown: (e) => {
          e.stopPropagation();
        },
        "aria-expanded": !collapsed,
        title: collapsed ? "Expand panel" : "Collapse panel",
        "aria-label": collapsed ? "Expand panel" : "Collapse panel",
        children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center text-zinc-200", children: collapsed ? /* @__PURE__ */ jsx(
          ChevronDown,
          {
            className: "h-3.5 w-3.5",
            strokeWidth: TOOLBOX_HEADER_ICON_STROKE,
            "aria-hidden": true
          }
        ) : /* @__PURE__ */ jsx(
          ChevronUp,
          {
            className: "h-3.5 w-3.5",
            strokeWidth: TOOLBOX_HEADER_ICON_STROKE,
            "aria-hidden": true
          }
        ) })
      }
    ) : null
  ] });
  return /* @__PURE__ */ jsx(
    TRNWindow,
    {
      ...rest,
      className: twMerge(
        userClassName,
        collapsed ? "overflow-hidden" : void 0
      ),
      minHeight,
      resizable,
      heightMode,
      modal,
      showFooter,
      glass,
      glassPreset,
      glassOpacity: glassOpacityEffective,
      glassBorderOpacity: glassBorderOpacityEffective,
      glassBlurPx: glassBlurEffective,
      dragEdgeSnapPx,
      persistRectStorageKey,
      showMaximize: false,
      headerActions,
      shellRef: setShellRef,
      shellProps: mergedShellProps,
      showContent: !collapsed,
      children: collapsed ? null : children
    }
  );
}
var TRNCard = forwardRef(
  function TRNCard2(props, ref) {
    const {
      title,
      icon,
      titleTrailing,
      iconWrapperClassName,
      children,
      mode = "simple",
      expanded,
      defaultExpanded = true,
      onExpandedChange,
      collapsible = true,
      disabled = false,
      durationMs = 220,
      easing = "cubic-bezier(0.22, 1, 0.36, 1)",
      animateOpacity = true,
      collapsedHeight = 0,
      rightSlot,
      className,
      headerClassName,
      contentClassName,
      titleClassName,
      toggleOnHeaderClick = true,
      glass = false,
      glassPreset = "medium",
      ...divProps
    } = props;
    const isControlled = expanded != null;
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
    const isExpanded = isControlled ? expanded : uncontrolledExpanded;
    const contentInnerRef = useRef(null);
    const [measuredHeight, setMeasuredHeight] = useState(0);
    useEffect(() => {
      if (contentInnerRef.current == null) {
        return;
      }
      const element = contentInnerRef.current;
      const updateHeight = () => {
        setMeasuredHeight(element.scrollHeight);
      };
      updateHeight();
      const observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(element);
      return () => observer.disconnect();
    }, [children, isExpanded]);
    const setExpanded = (next) => {
      if (!isControlled) {
        setUncontrolledExpanded(next);
      }
      onExpandedChange?.(next);
    };
    const canToggle = collapsible && !disabled;
    const showHeaderDivider = mode === "simple" ? isExpanded : isExpanded || collapsedHeight > 0;
    const contentStyle = useMemo(() => {
      if (mode !== "animated") {
        return void 0;
      }
      return {
        maxHeight: isExpanded ? Math.max(measuredHeight, collapsedHeight) : collapsedHeight,
        opacity: animateOpacity ? isExpanded ? 1 : 0 : 1,
        transitionProperty: "max-height, opacity",
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: easing
      };
    }, [
      animateOpacity,
      collapsedHeight,
      durationMs,
      easing,
      isExpanded,
      measuredHeight,
      mode
    ]);
    const shellGlassClass = glassPreset === "soft" ? "border-zinc-700/85 bg-zinc-900/70 backdrop-blur-sm" : glassPreset === "strong" ? "border-zinc-700/70 bg-zinc-900/32 backdrop-blur-lg" : "border-zinc-700/80 bg-zinc-900/55 backdrop-blur-md";
    const headerGlassClass = glassPreset === "soft" ? "from-zinc-900/70 to-zinc-800/55" : glassPreset === "strong" ? "from-zinc-900/40 to-zinc-800/28" : "from-zinc-900/60 to-zinc-800/45";
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: "relative overflow-hidden rounded-md border shadow-[0_8px_24px_rgba(0,0,0,0.35)] " + (glass ? shellGlassClass : "border-zinc-700/80 bg-zinc-950/85 ") + (className ?? ""),
        ...divProps,
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex min-w-0 flex-nowrap items-center gap-2 bg-linear-to-r px-3 py-0.5 " + (glass ? `${headerGlassClass} ` : "from-zinc-900/95 to-zinc-800/75 ") + (showHeaderDivider ? "border-b border-zinc-700/80 " : "") + (disabled ? "opacity-60" : "") + (headerClassName != null ? ` ${headerClassName}` : ""),
              children: [
                icon ? /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "inline-flex shrink-0 items-center justify-center " + (iconWrapperClassName ?? "text-zinc-400"),
                    children: icon
                  }
                ) : null,
                /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      className: (
                        // No flex-1: otherwise short titles leave a huge gap before titleTrailing (e.g. badge).
                        "min-w-0 shrink overflow-hidden text-left " + (canToggle && toggleOnHeaderClick ? "cursor-pointer" : "cursor-default")
                      ),
                      onClick: () => {
                        if (!canToggle || !toggleOnHeaderClick) {
                          return;
                        }
                        setExpanded(!isExpanded);
                      },
                      disabled,
                      "aria-expanded": isExpanded,
                      "aria-label": collapsible ? `${isExpanded ? "Collapse" : "Expand"} ${title}` : title,
                      children: /* @__PURE__ */ jsx("span", { className: "block min-w-0 truncate text-xs font-semibold " + (titleClassName ?? ""), children: title })
                    }
                  ),
                  titleTrailing != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center", children: titleTrailing }) : null
                ] }),
                rightSlot != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center gap-1", children: rightSlot }) : null,
                collapsible ? /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "inline-flex shrink-0 items-center justify-center p-1",
                    onClick: () => {
                      if (!canToggle) {
                        return;
                      }
                      setExpanded(!isExpanded);
                    },
                    disabled: !canToggle,
                    "aria-label": isExpanded ? "Collapse card" : "Expand card",
                    "aria-expanded": isExpanded,
                    children: /* @__PURE__ */ jsx(
                      ChevronDown,
                      {
                        className: "h-3.5 w-3.5 transition-transform duration-200 ease-out",
                        style: {
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                        }
                      }
                    )
                  }
                ) : null
              ]
            }
          ),
          mode === "simple" ? isExpanded ? /* @__PURE__ */ jsx("div", { className: "px-3 py-2 " + (contentClassName ?? ""), children }) : null : isExpanded ? /* @__PURE__ */ jsx(
            "div",
            {
              className: "overflow-hidden " + (contentClassName ?? ""),
              style: contentStyle,
              "aria-hidden": false,
              children: /* @__PURE__ */ jsx("div", { ref: contentInnerRef, className: "px-3 py-2", children })
            }
          ) : null
        ]
      }
    );
  }
);
function TRNCardHeader({
  title,
  leadingSlot,
  trailingSlot,
  className = "",
  titleClassName = ""
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-trn-card-header": true,
      className: twMerge(
        "mb-1 flex min-w-0 items-center justify-between gap-2",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
          leadingSlot != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center", children: leadingSlot }) : null,
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "inline-flex h-5 min-w-0 items-center truncate text-xs font-semibold leading-none normal-case tracking-normal text-zinc-100 " + titleClassName,
              children: title
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "inline-flex shrink-0 items-center gap-1.5", children: trailingSlot != null ? trailingSlot : null })
      ]
    }
  );
}
function TRNHintTooltip(props) {
  const {
    trigger,
    content,
    title,
    description,
    placement = "top-end",
    className = "",
    panelClassName = "",
    triggerClassName = "",
    triggerAriaLabel,
    wide = false,
    triggerWrapper = "button"
  } = props;
  const tooltipContent = useMemo(() => {
    const resolved = resolveTrnHintContent({ title, description, content });
    if (resolved == null) {
      return null;
    }
    if (title != null) {
      return resolved;
    }
    return /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap text-left text-[11px] leading-relaxed text-zinc-100", children: resolved });
  }, [title, description, content]);
  if (tooltipContent == null) {
    return /* @__PURE__ */ jsx(Fragment, { children: trigger });
  }
  return /* @__PURE__ */ jsx(
    TRNTooltip,
    {
      className,
      triggerClassName,
      triggerAriaLabel,
      triggerWrapper,
      placement,
      openDelayMs: TRN_HINT_HOVER_DELAY_MS,
      disableHoverFx: true,
      trigger,
      content: tooltipContent,
      panelClassName: twMerge(
        TRN_HINT_POPOVER_PANEL_CLASS,
        wide ? "max-w-[min(420px,calc(100vw-32px))]" : "max-w-[min(320px,calc(100vw-48px))]",
        panelClassName
      )
    }
  );
}

// src/trnInteractiveCardShell.ts
var SHELL_BASE = "relative flex min-h-0 flex-col overflow-hidden rounded-md border shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm";
var TRN_INTERACTIVE_CARD_SHELL_CLASS = {
  glass: `${SHELL_BASE} border-zinc-700/85 bg-zinc-900/70`,
  solid: `${SHELL_BASE} border-zinc-700/80 bg-black/40`,
  "solid-soft": `${SHELL_BASE} border-zinc-700/80 bg-black/30`,
  inset: `${SHELL_BASE} border-zinc-800/80 bg-zinc-950/55`,
  "accent-cyan": `${SHELL_BASE} border-cyan-800/45 bg-zinc-900/65 bg-linear-to-br from-cyan-950/25 to-transparent`,
  "accent-emerald": `${SHELL_BASE} border-emerald-800/40 bg-zinc-900/65 bg-linear-to-br from-emerald-950/20 to-transparent`,
  "accent-amber": `${SHELL_BASE} border-amber-800/40 bg-zinc-900/65 bg-linear-to-br from-amber-950/20 to-transparent`,
  "accent-rose": `${SHELL_BASE} border-rose-800/40 bg-zinc-900/65 bg-linear-to-br from-rose-950/20 to-transparent`,
  "accent-violet": `${SHELL_BASE} border-violet-800/40 bg-zinc-900/65 bg-linear-to-br from-violet-950/20 to-transparent`
};
function trnInteractiveCardPaddingClass(shell, collapsible, collapsed) {
  if (shell === "solid" || shell === "solid-soft") {
    return "p-2";
  }
  if (!collapsible) {
    return "p-2";
  }
  return collapsed ? "px-2 pt-1 pb-1" : "px-2 pt-1 pb-2";
}
function trnInteractiveCardShellClass(shell) {
  return TRN_INTERACTIVE_CARD_SHELL_CLASS[shell];
}
function measureIntrinsicContentHeight(element) {
  const wrapper = element.parentElement;
  if (!(wrapper instanceof HTMLElement)) {
    return element.scrollHeight;
  }
  const prevMaxHeight = wrapper.style.maxHeight;
  wrapper.style.maxHeight = "none";
  const next = element.scrollHeight;
  wrapper.style.maxHeight = prevMaxHeight;
  return next;
}
var COLLAPSIBLE_INTRINSIC_HEIGHT_BUFFER_PX = 8;
function InteractiveCardTitle(props) {
  const { title, hint, titleClassName } = props;
  const labelClass = twMerge(
    "block min-w-0 truncate text-xs font-semibold leading-none normal-case tracking-normal text-zinc-100",
    titleClassName,
    hint != null ? "cursor-help" : null
  );
  if (hint == null || typeof hint === "string" && hint.trim().length === 0) {
    return typeof title === "string" ? /* @__PURE__ */ jsx("span", { className: labelClass, children: title }) : title;
  }
  const hintLabel = typeof title === "string" ? title : "section";
  return /* @__PURE__ */ jsx(
    TRNHintTooltip,
    {
      trigger: /* @__PURE__ */ jsx("span", { className: labelClass, children: title }),
      content: hint,
      triggerAriaLabel: `About ${hintLabel}`,
      placement: "top-start",
      triggerClassName: "min-w-0 flex-1 text-left",
      triggerWrapper: "span",
      wide: typeof hint === "string" ? hint.length > 120 : true
    }
  );
}
function TRNInteractiveCard(props) {
  const {
    title,
    hint,
    titleLeadingSlot,
    titleTrailingSlot,
    children,
    shell = "glass",
    className = "",
    headerClassName = "",
    headerTitleClassName = "",
    contentClassName = "",
    collapsible = false,
    collapsed,
    defaultCollapsed: defaultCollapsedProp,
    defaultExpanded = true,
    onCollapsedChange,
    animationDurationMs = 220,
    animationEasing = "cubic-bezier(0.22, 1, 0.36, 1)",
    collapsibleMeasureIntrinsic = true
  } = props;
  const isCollapsedControlled = collapsed != null;
  const initialCollapsed = defaultCollapsedProp ?? !defaultExpanded;
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed);
  const effectiveCollapsed = isCollapsedControlled ? collapsed : internalCollapsed;
  const contentRef = useRef(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const measuredHeightRef = useRef(0);
  useEffect(() => {
    if (!collapsible || !collapsibleMeasureIntrinsic || contentRef.current == null) {
      return;
    }
    const element = contentRef.current;
    let measureRafId = 0;
    const updateHeight = () => {
      cancelAnimationFrame(measureRafId);
      measureRafId = requestAnimationFrame(() => {
        if (effectiveCollapsed) {
          return;
        }
        const next = measureIntrinsicContentHeight(element);
        if (next === measuredHeightRef.current) {
          return;
        }
        measuredHeightRef.current = next;
        setMeasuredHeight(next);
      });
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    for (const child of element.children) {
      if (child instanceof HTMLElement) {
        observer.observe(child);
      }
    }
    return () => {
      cancelAnimationFrame(measureRafId);
      observer.disconnect();
    };
  }, [children, collapsible, collapsibleMeasureIntrinsic, effectiveCollapsed]);
  const setCollapsed = (next) => {
    if (!isCollapsedControlled) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };
  const contentStyle = useMemo(() => {
    if (!collapsible) {
      return void 0;
    }
    if (!collapsibleMeasureIntrinsic) {
      return {
        maxHeight: effectiveCollapsed ? 0 : void 0,
        opacity: effectiveCollapsed ? 0 : 1,
        transitionProperty: "max-height, opacity",
        transitionDuration: `${animationDurationMs}ms`,
        transitionTimingFunction: animationEasing,
        flex: effectiveCollapsed ? void 0 : "1 1 0%",
        minHeight: 0
      };
    }
    return {
      maxHeight: effectiveCollapsed ? 0 : measuredHeight > 0 ? measuredHeight + COLLAPSIBLE_INTRINSIC_HEIGHT_BUFFER_PX : void 0,
      opacity: effectiveCollapsed ? 0 : 1,
      transitionProperty: "max-height, opacity",
      transitionDuration: `${animationDurationMs}ms`,
      transitionTimingFunction: animationEasing
    };
  }, [
    animationDurationMs,
    animationEasing,
    collapsible,
    collapsibleMeasureIntrinsic,
    effectiveCollapsed,
    measuredHeight
  ]);
  const collapseButton = collapsible ? /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: "inline-flex h-5 w-5 items-center justify-center rounded-sm bg-transparent text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200",
      "aria-label": effectiveCollapsed ? "Expand card" : "Collapse card",
      onClick: () => setCollapsed(!effectiveCollapsed),
      children: /* @__PURE__ */ jsx(
        ChevronDown,
        {
          className: "h-3.5 w-3.5 transition-transform duration-200 ease-out",
          strokeWidth: 3,
          style: {
            transform: effectiveCollapsed ? "rotate(-90deg)" : "rotate(0deg)"
          },
          "aria-hidden": true
        }
      )
    }
  ) : null;
  const isCollapsedState = collapsible && effectiveCollapsed;
  const sectionClassName = twMerge(
    trnInteractiveCardShellClass(shell),
    trnInteractiveCardPaddingClass(shell, collapsible, isCollapsedState),
    className
  );
  const headerCombinedClassName = twMerge(
    collapsible ? "py-0" : void 0,
    isCollapsedState ? "mb-0!" : void 0,
    headerClassName
  );
  return /* @__PURE__ */ jsxs("section", { className: sectionClassName, children: [
    /* @__PURE__ */ jsx(
      TRNCardHeader,
      {
        title: /* @__PURE__ */ jsx(InteractiveCardTitle, { title, hint }),
        leadingSlot: titleLeadingSlot,
        trailingSlot: /* @__PURE__ */ jsxs(Fragment, { children: [
          titleTrailingSlot != null ? titleTrailingSlot : null,
          collapseButton
        ] }),
        className: headerCombinedClassName,
        titleClassName: headerTitleClassName
      }
    ),
    collapsible ? /* @__PURE__ */ jsx(
      "div",
      {
        className: twMerge(
          "min-h-0 overflow-hidden",
          !collapsibleMeasureIntrinsic && !effectiveCollapsed ? "flex min-h-0 flex-1 flex-col" : null,
          effectiveCollapsed ? "pointer-events-none" : null
        ),
        style: contentStyle,
        "aria-hidden": effectiveCollapsed ? true : void 0,
        children: /* @__PURE__ */ jsx(
          "div",
          {
            ref: contentRef,
            className: twMerge(
              collapsibleMeasureIntrinsic || effectiveCollapsed ? void 0 : "flex h-full min-h-0 flex-1 flex-col",
              contentClassName
            ),
            children
          }
        )
      }
    ) : /* @__PURE__ */ jsx("div", { className: contentClassName, children })
  ] });
}
var AccordionContext = createContext(null);
var AccordionItemContext = createContext(null);
function toValueSet(type, value) {
  if (type === "single") {
    if (typeof value === "string" && value.length > 0) {
      return /* @__PURE__ */ new Set([value]);
    }
    return /* @__PURE__ */ new Set();
  }
  if (Array.isArray(value)) {
    return new Set(value.filter((v) => typeof v === "string" && v.length > 0));
  }
  return /* @__PURE__ */ new Set();
}
function setToExternalValue(type, valueSet) {
  if (type === "single") {
    const first = valueSet.values().next().value;
    return typeof first === "string" ? first : void 0;
  }
  return Array.from(valueSet);
}
function TRNAccordion(props) {
  const {
    type = "single",
    value,
    defaultValue,
    onValueChange,
    collapsible = true,
    animated = true,
    durationMs = 220,
    easing = "cubic-bezier(0.22, 1, 0.36, 1)",
    animateOpacity = true,
    className,
    children
  } = props;
  const isControlled = value != null;
  const [internalValueSet, setInternalValueSet] = useState(
    toValueSet(type, defaultValue)
  );
  const valueSet = isControlled ? toValueSet(type, value) : internalValueSet;
  const toggle = (itemValue) => {
    const next = new Set(valueSet);
    const exists = next.has(itemValue);
    if (type === "single") {
      if (exists) {
        if (collapsible) {
          next.clear();
        }
      } else {
        next.clear();
        next.add(itemValue);
      }
    } else {
      if (exists) {
        if (collapsible || next.size > 1) {
          next.delete(itemValue);
        }
      } else {
        next.add(itemValue);
      }
    }
    if (!isControlled) {
      setInternalValueSet(next);
    }
    onValueChange?.(setToExternalValue(type, next));
  };
  const contextValue = useMemo(
    () => ({
      type,
      collapsible,
      animated,
      durationMs,
      easing,
      animateOpacity,
      valueSet,
      toggle
    }),
    [
      type,
      collapsible,
      animated,
      durationMs,
      easing,
      animateOpacity,
      valueSet
    ]
  );
  return /* @__PURE__ */ jsx(AccordionContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(
    "div",
    {
      className: twMerge(
        "rounded-md border border-zinc-700/80 bg-zinc-950/90",
        className
      ),
      children
    }
  ) });
}
function TRNAccordionItem(props) {
  const { value, disabled = false, className, children } = props;
  const accordion = useContext(AccordionContext);
  if (accordion == null) {
    throw new Error("TRNAccordionItem must be used inside TRNAccordion.");
  }
  const isOpen = accordion.valueSet.has(value);
  return /* @__PURE__ */ jsx(AccordionItemContext.Provider, { value: { value, isOpen, disabled }, children: /* @__PURE__ */ jsx("div", { className: "border-b last:border-b-0 border-zinc-700/80 " + (className ?? ""), children }) });
}
function TRNAccordionTrigger(props) {
  const { className, children, trailingBeforeChevron } = props;
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);
  if (accordion == null || item == null) {
    throw new Error("TRNAccordionTrigger must be used inside TRNAccordionItem.");
  }
  const toggle = () => {
    accordion.toggle(item.value);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: twMerge(
        "flex w-full items-center gap-1 px-2 py-0 text-left text-sm font-semibold",
        item.disabled ? "cursor-not-allowed opacity-50" : "",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "min-w-0 flex-1 bg-transparent text-left inline-flex items-center gap-2 rounded-md py-0 pl-0 pr-0.5 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400/45 ",
            disabled: item.disabled,
            "aria-expanded": item.isOpen,
            onClick: toggle,
            children: /* @__PURE__ */ jsx("span", { className: "truncate", children })
          }
        ),
        trailingBeforeChevron != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center", children: trailingBeforeChevron }) : null,
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400/45 ",
            disabled: item.disabled,
            "aria-expanded": item.isOpen,
            "aria-label": item.isOpen ? "Collapse section" : "Expand section",
            onClick: toggle,
            children: /* @__PURE__ */ jsx(
              ChevronDown,
              {
                className: "h-3.5 w-3.5 transition-transform duration-200 ease-out",
                style: { transform: item.isOpen ? "rotate(180deg)" : "rotate(0deg)" }
              }
            )
          }
        )
      ]
    }
  );
}
function TRNAccordionContent(props) {
  const { className, innerClassName, children } = props;
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);
  if (accordion == null || item == null) {
    throw new Error("TRNAccordionContent must be used inside TRNAccordionItem.");
  }
  const contentRef = useRef(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  useEffect(() => {
    if (contentRef.current == null) {
      return;
    }
    const element = contentRef.current;
    const update = () => setMeasuredHeight(element.scrollHeight);
    update();
    const observer = new ResizeObserver(() => update());
    observer.observe(element);
    return () => observer.disconnect();
  }, [children, item.isOpen]);
  const style = accordion.animated ? {
    maxHeight: item.isOpen ? measuredHeight : 0,
    opacity: accordion.animateOpacity ? item.isOpen ? 1 : 0 : 1,
    transitionProperty: "max-height, opacity",
    transitionDuration: `${accordion.durationMs}ms`,
    transitionTimingFunction: accordion.easing
  } : {};
  if (!accordion.animated && !item.isOpen) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: twMerge(
        "min-h-0 overflow-hidden",
        !item.isOpen && "border-0 p-0"
      ),
      style,
      "aria-hidden": !item.isOpen,
      children: /* @__PURE__ */ jsx(
        "div",
        {
          ref: contentRef,
          className: twMerge(
            "px-3 pb-2 text-xs text-zinc-400",
            className,
            innerClassName,
            !item.isOpen && "pointer-events-none"
          ),
          children
        }
      )
    }
  );
}
var TabsContext = createContext(null);
function TRNTabs(props) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation,
    variant = "default",
    railSide = "right",
    lazyMount = false,
    className,
    children,
    activePreset = "default",
    activeTriggerClassName
  } = props;
  const isControlled = value != null;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const triggerRefs = useRef(/* @__PURE__ */ new Map());
  const orderedValuesRef = useRef([]);
  const currentValue = isControlled ? value ?? "" : internalValue;
  const resolvedOrientation = orientation ?? (variant === "rail" ? "vertical" : "horizontal");
  const setValue = (next) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  const registerTrigger = (tabValue, el) => {
    triggerRefs.current.set(tabValue, el);
    if (!orderedValuesRef.current.includes(tabValue)) {
      orderedValuesRef.current.push(tabValue);
    }
  };
  const contextValue = useMemo(
    () => ({
      value: currentValue,
      setValue,
      orientation: resolvedOrientation,
      lazyMount,
      activePreset,
      activeTriggerClassName,
      variant,
      railSide,
      triggerRefs: triggerRefs.current,
      registerTrigger,
      orderedValuesRef
    }),
    [
      activePreset,
      activeTriggerClassName,
      currentValue,
      lazyMount,
      railSide,
      resolvedOrientation,
      variant
    ]
  );
  const rootClassName = className != null && /\bflex\b/.test(className) ? "min-h-0 " + className : "space-y-2 " + (className ?? "");
  return /* @__PURE__ */ jsx(TabsContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx("div", { className: rootClassName, children }) });
}
function TRNTabsList(props) {
  const tabs = useContext(TabsContext);
  if (tabs == null) {
    throw new Error("TRNTabsList must be used inside TRNTabs.");
  }
  const isRail = tabs.variant === "rail";
  const isVertical = isRail ? true : tabs.orientation === "vertical";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: (isRail ? "inline-flex flex-col gap-2 p-0 bg-transparent border-0 max-h-full overflow-y-auto overscroll-contain" : "border border-zinc-700/80 rounded-md p-1 bg-black/40 ") + (isVertical ? " inline-flex flex-col" : " inline-flex") + (props.className != null ? ` ${props.className}` : ""),
      role: "tablist",
      "aria-orientation": isVertical ? "vertical" : "horizontal",
      children: props.children
    }
  );
}
function TRNTabsTrigger(props) {
  const tabs = useContext(TabsContext);
  if (tabs == null) {
    throw new Error("TRNTabsTrigger must be used inside TRNTabs.");
  }
  const isActive = tabs.value === props.value;
  const isRail = tabs.variant === "rail";
  const resolvedActiveClassName = tabs.activeTriggerClassName ?? (tabs.activePreset === "soft" ? "border-cyan-500/45 text-cyan-200 bg-cyan-500/18 shadow-sm" : "border-cyan-500/45 text-cyan-200 bg-cyan-500/18");
  const moveFocusToIndex = (index) => {
    const values = tabs.orderedValuesRef.current;
    if (values.length === 0) {
      return;
    }
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    const nextValue = values[clamped];
    const nextEl = tabs.triggerRefs.get(nextValue);
    if (nextEl != null) {
      nextEl.focus();
      tabs.setValue(nextValue);
    }
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      ref: (el) => tabs.registerTrigger(props.value, el),
      type: "button",
      role: "tab",
      id: `trn-tab-${props.value}`,
      "aria-selected": isActive,
      "aria-controls": `trn-panel-${props.value}`,
      tabIndex: isActive ? 0 : -1,
      disabled: props.disabled,
      className: (isRail ? "w-10 h-28 px-2 py-3 text-xs border border-zinc-700/80 transition-colors bg-zinc-950/35 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 " + (tabs.railSide === "right" ? "rounded-l-xl rounded-r-2xl" : "rounded-r-xl rounded-l-2xl") + " disabled:opacity-50 disabled:cursor-not-allowed " + (isActive ? "border-sky-400/55 text-sky-50 bg-sky-600/55 shadow-sm shadow-sky-500/20" : "text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800/55") : "px-2.5 py-1.5 text-xs rounded border border-zinc-700/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed " + (isActive ? resolvedActiveClassName : "text-zinc-300 bg-zinc-900/45 hover:text-zinc-100 hover:bg-zinc-800/70")) + (props.className != null ? ` ${props.className}` : ""),
      onClick: () => tabs.setValue(props.value),
      onKeyDown: (evt) => {
        const values = tabs.orderedValuesRef.current;
        const currentIndex = values.indexOf(props.value);
        if (currentIndex < 0) {
          return;
        }
        const isHorizontal = tabs.orientation === "horizontal";
        if (evt.key === "Home") {
          evt.preventDefault();
          moveFocusToIndex(0);
          return;
        }
        if (evt.key === "End") {
          evt.preventDefault();
          moveFocusToIndex(values.length - 1);
          return;
        }
        if (isHorizontal && evt.key === "ArrowRight" || !isHorizontal && evt.key === "ArrowDown") {
          evt.preventDefault();
          moveFocusToIndex((currentIndex + 1) % values.length);
          return;
        }
        if (isHorizontal && evt.key === "ArrowLeft" || !isHorizontal && evt.key === "ArrowUp") {
          evt.preventDefault();
          moveFocusToIndex((currentIndex - 1 + values.length) % values.length);
          return;
        }
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          tabs.setValue(props.value);
        }
      },
      children: isRail ? /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            letterSpacing: "0.06em"
          },
          className: "select-none",
          children: props.children
        }
      ) : props.children
    }
  );
}
function TRNTabsContent(props) {
  const tabs = useContext(TabsContext);
  if (tabs == null) {
    throw new Error("TRNTabsContent must be used inside TRNTabs.");
  }
  const {
    value,
    className,
    animated = true,
    durationMs = 180,
    easing = "cubic-bezier(0.22, 1, 0.36, 1)",
    animateOpacity = true,
    keepMounted,
    children
  } = props;
  const isActive = tabs.value === value;
  const shouldKeepMounted = keepMounted ?? !tabs.lazyMount;
  const [mounted, setMounted] = useState(isActive || shouldKeepMounted);
  useEffect(() => {
    if (isActive) {
      setMounted(true);
    }
  }, [isActive]);
  if (!mounted && !isActive) {
    return null;
  }
  if (!isActive && !shouldKeepMounted) {
    return null;
  }
  const style = animated && shouldKeepMounted ? {
    opacity: animateOpacity ? isActive ? 1 : 0 : 1,
    transform: isActive ? "translateY(0px)" : "translateY(4px)",
    transitionProperty: "opacity, transform",
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: easing,
    pointerEvents: isActive ? "auto" : "none"
  } : void 0;
  const consumerSetsDisplay = className != null && /\b(flex|grid|contents)\b/.test(className);
  const visibilityClass = !isActive && !shouldKeepMounted ? "hidden " : consumerSetsDisplay ? "" : isActive || shouldKeepMounted ? "block " : "hidden ";
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "tabpanel",
      id: `trn-panel-${value}`,
      "aria-labelledby": `trn-tab-${value}`,
      hidden: !isActive && !shouldKeepMounted,
      className: visibilityClass + (className ?? ""),
      style,
      children
    }
  );
}

// src/trn-inspector-tab-bar.ts
var TRN_INSPECTOR_TAB_BAR_WRAP_CLASS = "nodrag nopan nowheel min-w-0 w-full shrink-0 pt-0 pb-0";
var TRN_INSPECTOR_TAB_LIST_CLASS = "inline-flex min-w-0 w-full gap-0.5 border-0 bg-transparent p-0";
var TRN_INSPECTOR_TAB_TRIGGER_CLASS = "inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-t-md rounded-b-none border-b-0 px-2 py-1 text-[11px] font-medium tracking-wide";
var TRN_INSPECTOR_TAB_LABEL_CLASS = "min-w-0 truncate";
var TRN_INSPECTOR_TAB_ACTIVE_CLASS = "border-emerald-400/45 bg-emerald-950/35 text-emerald-100 shadow-sm";
function trnInspectorTabActiveClassName(activeTab, accentTabId) {
  return activeTab === accentTabId ? TRN_INSPECTOR_TAB_ACTIVE_CLASS : "border-zinc-500/45 text-zinc-100 bg-zinc-800/55 shadow-sm";
}

// src/trn-inspector-panel-shell.ts
var TRN_INSPECTOR_PANEL_SHELL_CLASS = "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-zinc-700/55 bg-zinc-950/45";
var TRN_INSPECTOR_PANEL_EMBEDDED_SHELL_CLASS = "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden";
function resolveInspectorPanelShellClass(embedded = false) {
  return embedded ? TRN_INSPECTOR_PANEL_EMBEDDED_SHELL_CLASS : TRN_INSPECTOR_PANEL_SHELL_CLASS;
}
var TRN_INSPECTOR_PANEL_BODY_COLUMN_CLASS = "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden";
var TRN_INSPECTOR_PANEL_INSET_X_CLASS = "px-1";
var TRN_INSPECTOR_PANEL_SCROLL_CLASS = `scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${TRN_INSPECTOR_PANEL_INSET_X_CLASS} pb-2 pt-1`;
var TRN_INSPECTOR_CONTEXT_BAR_WRAP_CLASS = `shrink-0 border-b border-zinc-800/70 ${TRN_INSPECTOR_PANEL_INSET_X_CLASS} py-1.5`;
var DEFAULT_ICON_SHELL_CLASS = "border-zinc-600/35 bg-zinc-900/45 text-zinc-300/95";
function TRNInspectorContextBar(props) {
  const {
    title,
    subtitle,
    icon: Icon,
    iconShellClass = DEFAULT_ICON_SHELL_CLASS,
    trailing,
    className
  } = props;
  return /* @__PURE__ */ jsx("div", { className: twMerge(TRN_INSPECTOR_CONTEXT_BAR_WRAP_CLASS, className), children: /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-2", children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: twMerge(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
          iconShellClass
        ),
        "aria-hidden": true,
        children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-baseline justify-between gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "truncate text-[11px] font-semibold tracking-wide text-zinc-100/95", children: title }),
        trailing
      ] }),
      subtitle != null && subtitle.length > 0 ? /* @__PURE__ */ jsx("p", { className: "truncate text-[10px] leading-snug text-zinc-500", children: subtitle }) : null
    ] })
  ] }) });
}
function TRNInspectorPanelShell(props) {
  const { tabs, contextBar, children, footer, className, scrollClassName } = props;
  return /* @__PURE__ */ jsxs("div", { className: twMerge(TRN_INSPECTOR_PANEL_SHELL_CLASS, className), children: [
    tabs,
    /* @__PURE__ */ jsxs("div", { className: TRN_INSPECTOR_PANEL_BODY_COLUMN_CLASS, children: [
      contextBar,
      /* @__PURE__ */ jsx("div", { className: twMerge(TRN_INSPECTOR_PANEL_SCROLL_CLASS, scrollClassName), children })
    ] }),
    footer
  ] });
}
function clamp3(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function toStoredSize(value) {
  if (Number.isFinite(value) && value > 1) {
    return { value, unit: "px" };
  }
  return { value: clamp3(value, 0.05, 0.95), unit: "ratio" };
}
function readPersistedSize(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed?.value === "number" && (parsed.unit === "px" || parsed.unit === "ratio")) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}
function TRNSplitPane(props) {
  const {
    direction = "horizontal",
    defaultSize = 0.5,
    size,
    onSizeChange,
    minPrimaryPx = 160,
    minSecondaryPx = 160,
    dividerSizePx = 8,
    persistKey,
    animated = true,
    animationDurationMs = 180,
    className,
    primaryClassName,
    secondaryClassName,
    primary,
    secondary
  } = props;
  const isControlled = size != null;
  const containerRef = useRef(null);
  const dragState = useRef(null);
  const [internalStoredSize, setInternalStoredSize] = useState(
    () => toStoredSize(defaultSize)
  );
  useEffect(() => {
    if (persistKey == null) {
      return;
    }
    const persisted = readPersistedSize(persistKey);
    if (persisted != null) {
      setInternalStoredSize(persisted);
    }
  }, [persistKey]);
  const effectiveStoredSize = useMemo(
    () => isControlled ? toStoredSize(size) : internalStoredSize,
    [internalStoredSize, isControlled, size]
  );
  const updateSize = (next) => {
    if (!isControlled) {
      const stored = toStoredSize(next);
      setInternalStoredSize(stored);
      if (persistKey != null) {
        window.localStorage.setItem(persistKey, JSON.stringify(stored));
      }
    }
    onSizeChange?.(next);
  };
  const computePrimaryPx = (containerPx2) => {
    if (effectiveStoredSize.unit === "px") {
      return effectiveStoredSize.value;
    }
    return containerPx2 * effectiveStoredSize.value;
  };
  const getContainerSizePx = () => {
    if (containerRef.current == null) {
      return 0;
    }
    const rect = containerRef.current.getBoundingClientRect();
    return direction === "horizontal" ? rect.width : rect.height;
  };
  useEffect(() => {
    const onPointerMove = (evt) => {
      if (dragState.current == null) {
        return;
      }
      const containerPx2 = getContainerSizePx();
      if (containerPx2 <= 0) {
        return;
      }
      const nextCoord = direction === "horizontal" ? evt.clientX : evt.clientY;
      const delta = nextCoord - dragState.current.startCoord;
      const maxPrimary = Math.max(
        minPrimaryPx,
        containerPx2 - dividerSizePx - minSecondaryPx
      );
      const nextPrimaryPx = clamp3(
        dragState.current.startPx + delta,
        minPrimaryPx,
        maxPrimary
      );
      const nextRatio = nextPrimaryPx / containerPx2;
      updateSize(nextRatio);
    };
    const onPointerUp = () => {
      dragState.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [direction, dividerSizePx, minPrimaryPx, minSecondaryPx]);
  const containerPx = getContainerSizePx();
  const rawPrimaryPx = containerPx > 0 ? computePrimaryPx(containerPx) : 0;
  const maxPrimaryPx = containerPx > 0 ? Math.max(minPrimaryPx, containerPx - dividerSizePx - minSecondaryPx) : minPrimaryPx;
  const primaryPx = clamp3(rawPrimaryPx, minPrimaryPx, maxPrimaryPx);
  const secondaryPx = Math.max(0, containerPx - primaryPx - dividerSizePx);
  const paneTransition = animated ? `${animationDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1)` : "0ms linear";
  const primaryStyle = direction === "horizontal" ? { width: primaryPx, transition: `width ${paneTransition}` } : { height: primaryPx, transition: `height ${paneTransition}` };
  const secondaryStyle = direction === "horizontal" ? { width: secondaryPx, transition: `width ${paneTransition}` } : { height: secondaryPx, transition: `height ${paneTransition}` };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: "w-full h-full min-h-0 min-w-0 flex " + (direction === "horizontal" ? "flex-row" : "flex-col") + (className != null ? ` ${className}` : ""),
      children: [
        /* @__PURE__ */ jsx(
          "section",
          {
            style: primaryStyle,
            className: "min-w-0 min-h-0 overflow-auto " + (primaryClassName ?? ""),
            children: primary
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            role: "separator",
            "aria-orientation": direction,
            tabIndex: 0,
            className: "relative shrink-0 select-none " + (direction === "horizontal" ? "cursor-col-resize" : "cursor-row-resize"),
            style: direction === "horizontal" ? { width: dividerSizePx } : { height: dividerSizePx },
            onDoubleClick: () => updateSize(defaultSize),
            onPointerDown: (evt) => {
              const containerSize = getContainerSizePx();
              const currentPrimary = containerSize > 0 ? computePrimaryPx(containerSize) : 0;
              dragState.current = {
                startCoord: direction === "horizontal" ? evt.clientX : evt.clientY,
                startPx: currentPrimary
              };
              evt.preventDefault();
            },
            onKeyDown: (evt) => {
              const containerSize = getContainerSizePx();
              if (containerSize <= 0) {
                return;
              }
              const currentPrimary = computePrimaryPx(containerSize);
              const step = evt.shiftKey ? 24 : 12;
              const maxPrimary = Math.max(
                minPrimaryPx,
                containerSize - dividerSizePx - minSecondaryPx
              );
              if (direction === "horizontal" && evt.key === "ArrowLeft" || direction === "vertical" && evt.key === "ArrowUp") {
                evt.preventDefault();
                updateSize(clamp3(currentPrimary - step, minPrimaryPx, maxPrimary) / containerSize);
              }
              if (direction === "horizontal" && evt.key === "ArrowRight" || direction === "vertical" && evt.key === "ArrowDown") {
                evt.preventDefault();
                updateSize(clamp3(currentPrimary + step, minPrimaryPx, maxPrimary) / containerSize);
              }
              if (evt.key === "Home") {
                evt.preventDefault();
                updateSize(minPrimaryPx / containerSize);
              }
              if (evt.key === "End") {
                evt.preventDefault();
                updateSize(maxPrimary / containerSize);
              }
            },
            children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-zinc-700/70 hover:bg-cyan-500/40 transition-colors" })
          }
        ),
        /* @__PURE__ */ jsx(
          "section",
          {
            style: secondaryStyle,
            className: "min-w-0 min-h-0 overflow-auto " + (secondaryClassName ?? ""),
            children: secondary
          }
        )
      ]
    }
  );
}
function TRNSortableContainer(props) {
  const {
    itemIds,
    onReorder,
    layout = "vertical",
    children,
    className,
    ...divProps
  } = props;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const strategy = layout === "horizontal" ? horizontalListSortingStrategy : layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy;
  return /* @__PURE__ */ jsx(
    DndContext,
    {
      sensors,
      collisionDetection: closestCenter,
      onDragEnd: (event) => {
        const { active, over } = event;
        if (over == null || active.id === over.id) {
          return;
        }
        const oldIndex = itemIds.findIndex((id) => id === active.id);
        const newIndex = itemIds.findIndex((id) => id === over.id);
        if (oldIndex < 0 || newIndex < 0) {
          return;
        }
        onReorder(arrayMove(itemIds, oldIndex, newIndex));
      },
      children: /* @__PURE__ */ jsx(SortableContext, { items: itemIds, strategy, children: /* @__PURE__ */ jsx("div", { className, ...divProps, children }) })
    }
  );
}
var DragHandleContext = createContext(null);
function TRNSortableItem(props) {
  const {
    id,
    children,
    className,
    disabled = false,
    dragFx = "tilt",
    dragFxOptions,
    style,
    ...divProps
  } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });
  const dragX = transform?.x ?? 0;
  const shouldNormalizeScale = dragFxOptions?.normalizeScale ?? true;
  const normalizedTransform = shouldNormalizeScale && transform ? {
    ...transform,
    scaleX: 1,
    scaleY: 1
  } : transform;
  const baseTransform = CSS.Transform.toString(normalizedTransform);
  let fxTransform = baseTransform;
  let fxShadow = "none";
  let fxOpacity = isDragging ? 0.95 : 1;
  if (dragFx !== "none" && isDragging) {
    const tiltMaxRotateDeg = dragFxOptions?.tiltMaxRotateDeg ?? 3.5;
    const playfulMaxRotateDeg = dragFxOptions?.playfulMaxRotateDeg ?? 5;
    const liftScale = dragFxOptions?.liftScale ?? 1.02;
    const tiltScale = dragFxOptions?.tiltScale ?? 1.03;
    const playfulScale = dragFxOptions?.playfulScale ?? 1;
    const rotateDeg = Math.max(-tiltMaxRotateDeg, Math.min(tiltMaxRotateDeg, dragX * 0.02));
    if (dragFx === "lift") {
      fxTransform = `${baseTransform} scale(${liftScale})`;
      fxShadow = "0 10px 24px rgba(0, 0, 0, 0.22)";
    } else if (dragFx === "tilt") {
      fxTransform = `${baseTransform} rotate(${rotateDeg}deg) scale(${tiltScale})`;
      fxShadow = "0 12px 28px rgba(0, 0, 0, 0.26)";
    } else if (dragFx === "playful") {
      const playfulRotate = Math.max(
        -playfulMaxRotateDeg,
        Math.min(playfulMaxRotateDeg, dragX * 0.03)
      );
      fxTransform = playfulScale === 1 ? `${baseTransform} rotate(${playfulRotate}deg)` : `${baseTransform} rotate(${playfulRotate}deg) scale(${playfulScale})`;
      fxShadow = "0 14px 34px rgba(0, 0, 0, 0.30)";
      fxOpacity = 0.97;
    }
  }
  const mergedStyle = {
    ...style ?? {},
    transform: fxTransform,
    transition: isDragging ? "transform 120ms ease-out, box-shadow 120ms ease-out, opacity 120ms ease-out" : transition,
    boxShadow: fxShadow,
    opacity: fxOpacity,
    zIndex: isDragging ? 2 : void 0,
    transformOrigin: "center center",
    willChange: isDragging ? "transform, box-shadow, opacity" : void 0
  };
  return /* @__PURE__ */ jsx(
    DragHandleContext.Provider,
    {
      value: {
        attributes,
        listeners,
        setActivatorNodeRef,
        disabled
      },
      children: /* @__PURE__ */ jsx(
        "div",
        {
          ref: setNodeRef,
          style: mergedStyle,
          className: className ?? "",
          ...divProps,
          children
        }
      )
    }
  );
}
function useTRNDragHandleContext() {
  const context = useContext(DragHandleContext);
  if (context == null) {
    throw new Error("TRNDragHandle must be used inside TRNSortableItem.");
  }
  return context;
}
function TRNDragHandle(props) {
  const { hideIcon = false, className, children, disabled, ...buttonProps } = props;
  const context = useTRNDragHandleContext();
  const isDisabled = disabled || context.disabled;
  return /* @__PURE__ */ jsx(
    "button",
    {
      ref: context.setActivatorNodeRef,
      type: "button",
      className: "inline-flex items-center justify-center rounded p-1 text-zinc-400 -ml-1 hover:bg-zinc-800/70 cursor-grab active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 " + (className ?? ""),
      disabled: isDisabled,
      "aria-label": "Drag item",
      title: "Drag item",
      ...context.attributes,
      ...context.listeners,
      ...buttonProps,
      children: children ?? (hideIcon ? null : /* @__PURE__ */ jsx(GripVertical, { className: "h-4 w-4" }))
    }
  );
}
function TRNSortableCard(props) {
  const {
    id,
    sortableClassName,
    dragFx = "tilt",
    sortableDisabled = false,
    handlePosition = "left",
    customRightSlot,
    icon,
    headerClassName,
    ...cardProps
  } = props;
  const mergedHeaderClassName = (handlePosition === "left" ? "pl-1" : "") + (headerClassName != null ? ` ${headerClassName}` : "");
  return /* @__PURE__ */ jsx(
    TRNSortableItem,
    {
      id,
      className: sortableClassName,
      dragFx,
      disabled: sortableDisabled,
      children: /* @__PURE__ */ jsx(
        TRNCard,
        {
          ...cardProps,
          headerClassName: mergedHeaderClassName,
          icon: /* @__PURE__ */ jsxs(Fragment, { children: [
            handlePosition === "left" ? /* @__PURE__ */ jsx(TRNDragHandle, {}) : null,
            icon
          ] }),
          rightSlot: /* @__PURE__ */ jsxs(Fragment, { children: [
            customRightSlot,
            handlePosition === "right" ? /* @__PURE__ */ jsx(TRNDragHandle, {}) : null
          ] })
        }
      )
    }
  );
}
function matchesQuery(item, needle) {
  if (item.disabled) {
    return false;
  }
  if (needle.length === 0) {
    return true;
  }
  const h = [item.label, item.group, item.keywords, item.id].filter(Boolean).join(" ").toLowerCase();
  const tokens = needle.trim().toLowerCase().split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t.length === 0) {
      continue;
    }
    if (!h.includes(t)) {
      return false;
    }
  }
  return true;
}
function TRNCommandPalette(props) {
  const {
    open,
    onClose,
    onSelect,
    items,
    title = "Command palette",
    placeholder = "Type a command or search...",
    emptyText = "No results.",
    className = "",
    zIndex = 70,
    inputRef: externalInputRef
  } = props;
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const localRef = useRef(null);
  const inputRef = externalInputRef ?? localRef;
  const flat = useMemo(
    () => items.filter((item) => item.disabled !== true),
    [items]
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return flat.filter((item) => matchesQuery(item, needle));
  }, [flat, query]);
  const grouped = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const item of filtered) {
      const g = item.group?.trim() || "Commands";
      const list = m.get(g) ?? [];
      list.push(item);
      m.set(g, list);
    }
    return Array.from(m.entries());
  }, [filtered]);
  const flatList = useMemo(
    () => grouped.flatMap(([, list]) => list),
    [grouped]
  );
  useEffect(() => {
    setHighlight(0);
  }, [query, open, filtered.length]);
  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery("");
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [inputRef, open]);
  const selectIndex = useCallback(
    (idx) => {
      if (idx < 0 || idx >= flatList.length) {
        return;
      }
      const id = flatList[idx].id;
      onSelect(id);
      onClose();
    },
    [flatList, onClose, onSelect]
  );
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (flatList.length === 0) {
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => h + 1 >= flatList.length ? 0 : h + 1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => h - 1 < 0 ? flatList.length - 1 : h - 1);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        selectIndex(highlight);
        return;
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [flatList.length, highlight, onClose, open, selectIndex]);
  if (!open) {
    return null;
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 flex items-start justify-center pt-24 px-2 pointer-events-auto " + className,
      style: { zIndex },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 bg-black/50",
            onClick: onClose,
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative w-full max-w-lg border border-zinc-700/80 rounded-lg bg-zinc-900/95 shadow-2xl overflow-hidden flex flex-col",
            role: "dialog",
            "aria-label": title,
            "aria-modal": "true",
            onKeyDown: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-zinc-700/80 px-2 py-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold pl-1", children: title }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "p-1 rounded border border-transparent hover:bg-zinc-800/70",
                    onClick: onClose,
                    "aria-label": "Close",
                    children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-zinc-700/80 px-2 py-1.5", children: [
                /* @__PURE__ */ jsx(Search, { className: "h-3.5 w-3.5 shrink-0 text-zinc-400" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    ref: inputRef,
                    className: "w-full bg-transparent text-xs outline-none placeholder:text-zinc-400",
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    placeholder,
                    autoComplete: "off",
                    spellCheck: false,
                    "aria-label": "Command search"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "max-h-72 min-h-16 overflow-y-auto p-1", children: flatList.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-center text-xs text-zinc-400", children: emptyText }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: grouped.map(([gName, list]) => /* @__PURE__ */ jsxs("div", { className: "pt-0.5", children: [
                /* @__PURE__ */ jsx("div", { className: "px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wide", children: gName }),
                list.map((item) => {
                  const gIdx = flatList.findIndex(
                    (e) => e.id === item.id
                  );
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => onSelect(item.id),
                      onMouseEnter: () => setHighlight(gIdx),
                      className: "w-full text-left flex items-center justify-between gap-2 rounded px-2 py-1.5 text-xs transition-colors " + (gIdx === highlight ? "bg-cyan-500/15 text-zinc-100" : "text-zinc-100 hover:bg-zinc-800/80"),
                      disabled: item.disabled,
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "truncate min-w-0", children: item.label }),
                        item.shortcut ? /* @__PURE__ */ jsx("kbd", { className: "shrink-0 text-[10px] px-1.5 py-0.5 rounded border border-zinc-700/80 text-zinc-400 font-mono", children: item.shortcut }) : null
                      ]
                    },
                    item.id
                  );
                })
              ] }, gName)) }) }),
              /* @__PURE__ */ jsx("div", { className: "border-t border-zinc-700/80 px-2 py-1 text-[10px] text-zinc-400", children: /* @__PURE__ */ jsx("span", { children: "\u2191/\u2193 to move \xB7 Enter to run \xB7 Esc to close" }) })
            ]
          }
        )
      ]
    }
  );
}
function TRNDataGrid(props) {
  const {
    columns,
    rows,
    getRowId,
    stickyHeader = true,
    resizableColumns = false,
    className = "",
    tableClassName = "",
    defaultSortColumnId,
    defaultSortDirection = null,
    onSortChange
  } = props;
  const [sortCol, setSortCol] = useState(
    defaultSortColumnId ?? null
  );
  const [sortDir, setSortDir] = useState(
    defaultSortDirection
  );
  const [colWidths, setColWidths] = useState(() => {
    const w = {};
    for (const c of columns) {
      if (c.width != null) {
        w[c.id] = c.width;
      }
    }
    return w;
  });
  const dragRef = useRef(null);
  const sortedRows = useMemo(() => {
    if (sortCol == null || sortDir == null) {
      return rows;
    }
    const col = columns.find((c) => c.id === sortCol);
    if (col == null || col.getValue == null) {
      return rows;
    }
    const copy = [...rows];
    const mult = sortDir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const va = col.getValue(a);
      const vb = col.getValue(b);
      if (va == null && vb == null) {
        return 0;
      }
      if (va == null) {
        return 1;
      }
      if (vb == null) {
        return -1;
      }
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * mult;
      }
      return String(va).localeCompare(String(vb), void 0, { numeric: true }) * mult;
    });
    return copy;
  }, [columns, rows, sortCol, sortDir]);
  const toggleSort = useCallback(
    (colId) => {
      const col = columns.find((c) => c.id === colId);
      if (col == null || col.sortable === false) {
        return;
      }
      if (col.getValue == null) {
        return;
      }
      let nextDir;
      if (sortCol !== colId) {
        nextDir = "asc";
      } else if (sortDir === "asc") {
        nextDir = "desc";
      } else {
        nextDir = "asc";
      }
      setSortCol(colId);
      setSortDir(nextDir);
      onSortChange?.(colId, nextDir);
    },
    [columns, onSortChange, sortCol, sortDir]
  );
  const onResizeStart = (colId, e) => {
    if (!resizableColumns) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const w = colWidths[colId] ?? columns.find((c) => c.id === colId)?.width ?? 80;
    dragRef.current = { colId, startX: e.clientX, startW: w };
    const onMove = (ev) => {
      if (dragRef.current == null) {
        return;
      }
      const d = ev.clientX - dragRef.current.startX;
      const next = Math.max(48, dragRef.current.startW + d);
      setColWidths((prev) => ({
        ...prev,
        [dragRef.current.colId]: next
      }));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "w-full min-h-0 border border-zinc-700/80 rounded-md overflow-x-auto " + className,
      children: /* @__PURE__ */ jsxs(
        "table",
        {
          className: "w-full border-collapse text-xs " + tableClassName,
          style: {
            minWidth: Math.max(
              200,
              columns.reduce(
                (acc, c) => acc + (colWidths[c.id] ?? c.width ?? 100),
                0
              )
            )
          },
          children: [
            /* @__PURE__ */ jsx(
              "thead",
              {
                className: twMerge(
                  "border-b border-zinc-600/55 bg-zinc-900/92 backdrop-blur-sm",
                  stickyHeader ? "sticky top-0 z-10" : ""
                ),
                children: /* @__PURE__ */ jsx("tr", { children: columns.map((col) => {
                  const w = colWidths[col.id] ?? col.width;
                  const isSorted = sortCol === col.id;
                  const align = col.align ?? "start";
                  const alignTh = align === "end" ? "text-end" : align === "center" ? "text-center" : "text-start";
                  const labelJustify = align === "end" ? "flex w-full min-w-0 justify-end" : align === "center" ? "flex w-full min-w-0 justify-center" : "inline-flex min-w-0 items-center justify-start";
                  return /* @__PURE__ */ jsxs(
                    "th",
                    {
                      className: twMerge(
                        "relative px-2 py-2 text-[11px] font-semibold tracking-wide text-zinc-200/95",
                        alignTh,
                        col.sortable !== false && col.getValue ? "cursor-pointer select-none" : "",
                        col.headerClassName
                      ),
                      style: w != null ? { width: w, minWidth: 48, maxWidth: 480 } : { minWidth: 48 },
                      onClick: () => {
                        if (col.sortable !== false && col.getValue) {
                          toggleSort(col.id);
                        }
                      },
                      children: [
                        /* @__PURE__ */ jsxs(
                          "span",
                          {
                            className: twMerge(
                              "items-center gap-1",
                              labelJustify,
                              col.className
                            ),
                            children: [
                              col.label,
                              isSorted && sortDir === "asc" ? " \u25B2" : null,
                              isSorted && sortDir === "desc" ? " \u25BC" : null
                            ]
                          }
                        ),
                        resizableColumns ? /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-cyan-500/30",
                            onPointerDown: (e) => onResizeStart(col.id, e),
                            "aria-hidden": "true"
                          }
                        ) : null
                      ]
                    },
                    col.id
                  );
                }) })
              }
            ),
            /* @__PURE__ */ jsx("tbody", { children: sortedRows.map((row, rIdx) => {
              const rid = getRowId(row, rIdx);
              return /* @__PURE__ */ jsx(
                "tr",
                {
                  className: "border-b border-zinc-800/55 odd:bg-zinc-950/35 even:bg-zinc-950/15 hover:bg-zinc-800/35",
                  children: columns.map((col) => {
                    const w = colWidths[col.id] ?? col.width;
                    const align = col.align ?? "start";
                    const alignTd = align === "end" ? "text-end" : align === "center" ? "text-center" : "text-start";
                    const node = col.cell != null ? col.cell(row) : (() => {
                      if (col.getValue == null) {
                        return "";
                      }
                      const v = col.getValue(row);
                      if (v == null) {
                        return "\u2014";
                      }
                      return String(v);
                    })();
                    return /* @__PURE__ */ jsx(
                      "td",
                      {
                        className: twMerge(
                          "px-2 py-1.5 text-[11px] text-zinc-100",
                          alignTd,
                          col.cellClassName
                        ),
                        style: w != null ? { width: w } : void 0,
                        children: node
                      },
                      col.id
                    );
                  })
                },
                rid
              );
            }) })
          ]
        }
      )
    }
  );
}
function TRNTree(props) {
  const {
    data,
    defaultExpanded = null,
    expanded: controlled,
    onExpandedChange,
    className = "",
    itemClassName = "",
    renderActions,
    renderLabel
  } = props;
  const isControlled = controlled != null;
  const [internal, setInternal] = useState(
    () => new Set(defaultExpanded ?? [])
  );
  const openSet = isControlled ? controlled : internal;
  const setOpen = useCallback(
    (next) => {
      if (!isControlled) {
        setInternal(new Set(next));
      }
      onExpandedChange?.(new Set(next));
    },
    [isControlled, onExpandedChange]
  );
  const toggle = useCallback(
    (id) => {
      const n = new Set(openSet);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      setOpen(n);
    },
    [openSet, setOpen]
  );
  return /* @__PURE__ */ jsx(
    "ul",
    {
      className: "list-none m-0 p-0 text-xs space-y-0.5 " + className,
      role: "tree",
      children: data.map((node) => /* @__PURE__ */ jsx(
        TreeBranch,
        {
          node,
          depth: 0,
          openSet,
          onToggle: toggle,
          itemClassName,
          renderActions,
          renderLabel
        },
        node.id
      ))
    }
  );
}
function TreeBranch(props) {
  const {
    node,
    depth,
    openSet,
    onToggle,
    itemClassName,
    renderActions,
    renderLabel
  } = props;
  const hasChild = (node.children?.length ?? 0) > 0;
  const isOpen = hasChild && openSet.has(node.id);
  return /* @__PURE__ */ jsxs("li", { role: "none", className: "select-none", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        role: "treeitem",
        "aria-expanded": hasChild ? isOpen : void 0,
        className: "flex items-center gap-1 py-0.5 rounded px-1 -mx-1 " + (node.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800/60"),
        style: { paddingLeft: depth * 10 },
        children: [
          hasChild ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "p-0.5 rounded border border-transparent hover:border-zinc-700/80 " + itemClassName,
              onClick: () => onToggle(node.id),
              disabled: node.disabled,
              "aria-label": isOpen ? "Collapse" : "Expand",
              children: /* @__PURE__ */ jsx(
                ChevronRight,
                {
                  className: "h-3.5 w-3.5 transition-transform text-zinc-400",
                  style: { transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }
                }
              )
            }
          ) : /* @__PURE__ */ jsx("span", { className: "inline-block w-5" }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "flex-1 min-w-0 text-zinc-100",
              onDoubleClick: () => {
                if (hasChild) {
                  onToggle(node.id);
                }
              },
              children: renderLabel != null ? renderLabel(node) : node.label
            }
          ),
          renderActions != null ? /* @__PURE__ */ jsx("span", { className: "shrink-0", children: renderActions(node) }) : null
        ]
      }
    ),
    hasChild && isOpen ? /* @__PURE__ */ jsx(
      "ul",
      {
        className: "list-none m-0 p-0 pl-1 border-l border-zinc-700/40 ml-2.5",
        role: "group",
        children: node.children.map((child) => /* @__PURE__ */ jsx(
          TreeBranch,
          {
            node: child,
            depth: depth + 1,
            openSet,
            onToggle,
            itemClassName,
            renderActions,
            renderLabel
          },
          child.id
        ))
      }
    ) : null
  ] });
}
function TRNFormSectionHeading(props) {
  const { title, description } = props;
  const heading = /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-zinc-100", children: title });
  if (description == null || description.length === 0) {
    return heading;
  }
  return /* @__PURE__ */ jsx(
    TRNHintTooltip,
    {
      trigger: /* @__PURE__ */ jsx("span", { className: "inline-flex w-fit", children: heading }),
      content: description,
      triggerAriaLabel: `About ${title}`,
      placement: "top-start",
      triggerWrapper: "span",
      triggerClassName: "w-fit",
      wide: description.length > 120
    }
  );
}
function TRNFormSection(props) {
  const { title, description, showHeading = true, className = "", children } = props;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "space-y-2 border border-zinc-700/80 rounded-md p-3 bg-zinc-950/50 " + className,
      children: [
        showHeading ? /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(TRNFormSectionHeading, { title, description }) }) : null,
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children })
      ]
    }
  );
}
function TRNFormFieldLabel(props) {
  const { label, hint, htmlFor, labelTrailing, required = false } = props;
  const labelBody = /* @__PURE__ */ jsxs(Fragment, { children: [
    label,
    required ? /* @__PURE__ */ jsx("span", { className: "text-rose-400", children: " *" }) : null
  ] });
  const labelClassName = "block w-fit text-[11px] font-medium text-zinc-100";
  const labelNode = hint != null && hint.length > 0 ? /* @__PURE__ */ jsx(
    TRNHintTooltip,
    {
      trigger: /* @__PURE__ */ jsx("label", { htmlFor, className: labelClassName, children: labelBody }),
      content: hint,
      triggerAriaLabel: `About ${label}`,
      placement: "top-start",
      triggerWrapper: "span",
      triggerClassName: "w-fit",
      wide: hint.length > 120
    }
  ) : /* @__PURE__ */ jsx("label", { htmlFor, className: labelClassName, children: labelBody });
  if (labelTrailing == null) {
    return labelNode;
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-1.5", children: [
    labelNode,
    labelTrailing
  ] });
}
function TRNFormField(props) {
  const {
    label,
    id,
    htmlFor,
    error,
    hint,
    labelTrailing,
    required = false,
    className = "",
    children
  } = props;
  const fieldId = id ?? htmlFor;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1 " + className, children: [
    /* @__PURE__ */ jsx(
      TRNFormFieldLabel,
      {
        label,
        hint: error ? void 0 : hint,
        htmlFor: fieldId,
        labelTrailing,
        required
      }
    ),
    children,
    error ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-rose-400", children: error }) : null
  ] });
}
function TRNInlineEdit(props) {
  const {
    value: controlled,
    defaultValue = "",
    onCommit,
    onCancel,
    disabled = false,
    placeholder = "\u2026",
    className = "",
    inputClassName = "",
    multiline = false,
    validate
  } = props;
  const isControlled = controlled != null;
  const [internal, setInternal] = useState(defaultValue);
  const text = isControlled ? controlled : internal;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!editing) {
      setDraft(text);
    }
  }, [editing, text]);
  const commit = useCallback(() => {
    if (validate) {
      const v = validate(draft);
      if (v !== true) {
        setErr(v);
        return;
      }
    }
    setErr(null);
    if (!isControlled) {
      setInternal(draft);
    }
    onCommit(draft);
    setEditing(false);
  }, [draft, isControlled, onCommit, validate]);
  const cancel = useCallback(() => {
    setErr(null);
    setDraft(text);
    setEditing(false);
    onCancel?.();
  }, [onCancel, text]);
  if (editing) {
    const inputProps = {
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          commit();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      },
      className: "w-full min-w-0 bg-zinc-900/70 border border-zinc-700/80 rounded px-2 py-1 text-xs text-zinc-100 " + inputClassName,
      disabled,
      placeholder
    };
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 w-full " + className, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1 w-full", children: [
        multiline ? /* @__PURE__ */ jsx(
          "textarea",
          {
            rows: 3,
            ...inputProps,
            className: inputProps.className
          }
        ) : /* @__PURE__ */ jsx("input", { type: "text", ...inputProps }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 shrink-0", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "p-1 rounded border border-zinc-700/80 hover:bg-zinc-800/70",
              onClick: commit,
              "aria-label": "Save",
              title: "Save (Enter)",
              children: /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-emerald-400" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "p-1 rounded border border-zinc-700/80 hover:bg-zinc-800/70",
              onClick: cancel,
              "aria-label": "Cancel",
              title: "Cancel (Esc)",
              children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      ] }),
      err != null && err.length > 0 ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-rose-400 w-full", children: err }) : null
    ] });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "inline-flex max-w-full items-center gap-1.5 text-xs " + className,
      children: [
        /* @__PURE__ */ jsx("span", { className: "truncate min-w-0 text-zinc-100", children: text || /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: placeholder }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "p-0.5 rounded border border-zinc-700/80 hover:bg-zinc-800/70 disabled:opacity-50",
            onClick: () => {
              if (!disabled) {
                setEditing(true);
                setDraft(text);
              }
            },
            disabled,
            "aria-label": "Edit",
            children: /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3 text-zinc-400" })
          }
        )
      ]
    }
  );
}

// src/trnInputClasses.ts
var TRN_INPUT_CONTROL_CLASS = "min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none outline-none ring-0 placeholder:text-zinc-500 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0";
function trnInputRowClass(variant, size, invalid, disabled) {
  const sizePad = size === "sm" ? "px-2 py-0" : "px-2.5 py-0.5";
  const ghostRow = "flex items-center gap-2 rounded-md transition-colors focus-within:bg-zinc-800/55";
  const outlinedRow = "flex items-center gap-2 rounded-md border border-zinc-700/80 bg-zinc-900/80 transition-colors focus-within:border-zinc-600/90 focus-within:bg-zinc-800/55";
  const fieldRow = "flex items-center gap-2 rounded-md border border-zinc-700/80 bg-zinc-950/45 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-colors hover:bg-zinc-950/55 focus-within:ring-1 focus-within:ring-white/20";
  const glassRow = "flex items-center gap-2 rounded-md border border-white/15 bg-black/70 ring-1 ring-white/10 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-colors hover:bg-black/80";
  const variantRow = variant === "outlined" ? outlinedRow : variant === "field" ? fieldRow : variant === "glass" ? glassRow : ghostRow;
  const ghostBg = variant === "ghost" ? "bg-zinc-900/45" : "";
  const invalidRow = invalid ? variant === "field" || variant === "glass" ? "border-rose-500/50 focus-within:ring-rose-400/50" : "border-rose-500/50 focus-within:border-rose-500/60" : "";
  const disabledRow = disabled ? "opacity-50" : "";
  return [variantRow, ghostBg, sizePad, invalidRow, disabledRow].filter(Boolean).join(" ");
}
function trnInputTextSizeClass(size, variant = "ghost") {
  const isFieldChrome = variant === "field" || variant === "glass";
  if (isFieldChrome) {
    return size === "sm" ? "font-sans text-[13px] font-normal leading-tight py-1" : "font-sans text-[13px] font-normal leading-tight py-1.5";
  }
  return size === "sm" ? "text-xs py-1.5" : "text-sm py-2";
}
var TRN_FIELD_TEXT_PREFIX_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-zinc-400";
var TRN_FIELD_TEXT_PREFIX_ICON = /* @__PURE__ */ jsx(Type, { className: TRN_FIELD_TEXT_PREFIX_ICON_CLASS, "aria-hidden": true });
var FIELD_PREFIX_EXCLUDED_INPUT_TYPES = /* @__PURE__ */ new Set([
  "number",
  "search",
  "password",
  "file",
  "hidden",
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]);
function renderTrnInputPrefixIcon(prefix) {
  if (isValidElement(prefix)) {
    return prefix;
  }
  const Icon = prefix;
  return /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0 text-zinc-500", "aria-hidden": true });
}
function resolveTrnFieldTextPrefixIcon(options) {
  const { variant, prefixIcon, showPrefixIcon, type } = options;
  if (variant !== "field") {
    return prefixIcon != null ? renderTrnInputPrefixIcon(prefixIcon) : void 0;
  }
  if (prefixIcon != null) {
    return renderTrnInputPrefixIcon(prefixIcon);
  }
  if (showPrefixIcon === false) {
    return void 0;
  }
  const normalizedType = type?.toLowerCase() ?? "text";
  if (FIELD_PREFIX_EXCLUDED_INPUT_TYPES.has(normalizedType)) {
    return void 0;
  }
  return TRN_FIELD_TEXT_PREFIX_ICON;
}
var TRNInput = forwardRef(function TRNInput2(props, ref) {
  const {
    prefixIcon,
    showPrefixIcon,
    suffix,
    showPasswordToggle,
    size = "sm",
    variant = "ghost",
    invalid = false,
    className,
    inputClassName,
    disabled,
    type: typeProp,
    ...inputRest
  } = props;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = typeProp === "password";
  const effectiveType = isPassword && showPasswordToggle !== false && passwordVisible ? "text" : typeProp;
  const useBuiltInToggle = isPassword && showPasswordToggle !== false && suffix == null && !disabled;
  const rowClass = twMerge(
    trnInputRowClass(variant, size, invalid, disabled === true),
    className
  );
  const controlClass = twMerge(
    TRN_INPUT_CONTROL_CLASS,
    trnInputTextSizeClass(size, variant),
    "text-zinc-100",
    inputClassName
  );
  const resolvedPrefixIcon = resolveTrnFieldTextPrefixIcon({
    variant,
    prefixIcon,
    showPrefixIcon,
    type: typeProp
  });
  return /* @__PURE__ */ jsxs("div", { className: rowClass, children: [
    resolvedPrefixIcon != null ? renderTrnInputPrefixIcon(resolvedPrefixIcon) : null,
    /* @__PURE__ */ jsx(
      "input",
      {
        ref,
        type: effectiveType,
        disabled,
        "aria-invalid": invalid || void 0,
        className: controlClass,
        ...inputRest
      }
    ),
    suffix != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center", children: suffix }) : null,
    useBuiltInToggle ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800/70 hover:text-zinc-300 disabled:pointer-events-none",
        "aria-label": passwordVisible ? "Hide password" : "Show password",
        onClick: () => setPasswordVisible((v) => !v),
        tabIndex: 0,
        children: passwordVisible ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3.5 w-3.5", "aria-hidden": true }) : /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5", "aria-hidden": true })
      }
    ) : null
  ] });
});
var TRN_FIELD_SELECT_LEADING_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-zinc-400";
var LEADING_ICON_BY_KIND = {
  palette: Palette,
  bold: Bold,
  pill: Pill,
  shapes: Shapes,
  "line-chart": LineChart,
  activity: Activity,
  "move-horizontal": MoveHorizontal,
  "bar-chart": BarChart3,
  hash: Hash,
  clock: Clock,
  link: Link2,
  cable: Cable,
  box: Box,
  "move-3d": Move3d,
  layers: Layers,
  monitor: Monitor,
  "layout-template": LayoutTemplate,
  factory: Factory,
  globe: Globe,
  keyboard: Keyboard,
  toggle: ToggleLeft,
  image: Image,
  "layout-list": LayoutList,
  "align-left": AlignLeft,
  "check-square": CheckSquare,
  sliders: SlidersHorizontal,
  "layout-grid": LayoutGrid,
  search: Search,
  wifi: Wifi,
  type: Type,
  list: List
};
var LEADING_ICON_RULES = [
  { matches: (label) => label.includes("theme preset") || label.includes("canvas theme"), kind: "palette" },
  { matches: (label) => label.includes("theme"), kind: "palette" },
  { matches: (label) => label.includes("font style") || label.includes("font weight"), kind: "bold" },
  { matches: (label) => label.includes("pill style"), kind: "pill" },
  { matches: (label) => label.includes("widget type") || label.includes("block type"), kind: "shapes" },
  { matches: (label) => label.includes("chart type"), kind: "line-chart" },
  { matches: (label) => label.includes("waveform"), kind: "activity" },
  { matches: (label) => label.includes("orientation") || label.includes("scale orientation"), kind: "move-horizontal" },
  { matches: (label) => label.includes("bar mode"), kind: "bar-chart" },
  { matches: (label) => label.includes("format") || label.includes("decimal"), kind: "hash" },
  { matches: (label) => label.includes("clock"), kind: "clock" },
  { matches: (label) => label.includes("connection"), kind: "link" },
  { matches: (label) => label.includes("binding") || label.includes("data source"), kind: "cable" },
  { matches: (label) => label.includes("material"), kind: "palette" },
  { matches: (label) => label.includes("collider") || label.includes("shape kind"), kind: "box" },
  { matches: (label) => label.includes("motion type"), kind: "move-3d" },
  { matches: (label) => label.includes("collision layer"), kind: "layers" },
  { matches: (label) => label.includes("display profile") || label.includes("tft"), kind: "monitor" },
  { matches: (label) => label.includes("template"), kind: "layout-template" },
  { matches: (label) => label.includes("factory"), kind: "factory" },
  { matches: (label) => label.includes("environment"), kind: "globe" },
  { matches: (label) => label.includes("keyboard"), kind: "keyboard" },
  { matches: (label) => label.includes("password"), kind: "toggle" },
  { matches: (label) => label.includes("image") || label.includes("scale percent"), kind: "image" },
  { matches: (label) => label.includes("tab index") || label.includes("menu index"), kind: "layout-list" },
  { matches: (label) => label.includes("align"), kind: "align-left" },
  { matches: (label) => label.includes("scroll"), kind: "layout-list" },
  { matches: (label) => label.includes("checked"), kind: "check-square" },
  { matches: (label) => label.includes("mode"), kind: "toggle" },
  { matches: (label) => label.includes("slider"), kind: "sliders" },
  { matches: (label) => label.includes("grid column") || label.includes("grid row"), kind: "layout-grid" },
  { matches: (label) => label.includes("filter"), kind: "search" },
  { matches: (label) => label.includes("model") || label.includes("mesh"), kind: "box" },
  { matches: (label) => label.includes("wifi") || label.includes("network"), kind: "wifi" },
  { matches: (label) => label.includes("unit"), kind: "type" },
  { matches: (label) => label.includes("inspector section"), kind: "list" },
  { matches: (label) => label.includes("transform space"), kind: "move-3d" },
  { matches: (label) => label.includes("button style"), kind: "toggle" }
];
function pickTrnFieldSelectLeadingIconKind(ariaLabel) {
  const normalized = (ariaLabel ?? "").trim().toLowerCase();
  if (normalized.length === 0) {
    return "list";
  }
  for (const rule of LEADING_ICON_RULES) {
    if (rule.matches(normalized)) {
      return rule.kind;
    }
  }
  return "list";
}
function fieldSelectLeadingIcon(Icon) {
  return /* @__PURE__ */ jsx(Icon, { className: TRN_FIELD_SELECT_LEADING_ICON_CLASS, "aria-hidden": true });
}
function resolveTrnFieldSelectLeadingIcon(options) {
  const { variant = "field", ariaLabel, showLeadingIcon } = options;
  if (variant !== "field" || showLeadingIcon === false) {
    return void 0;
  }
  const kind = pickTrnFieldSelectLeadingIconKind(ariaLabel);
  return fieldSelectLeadingIcon(LEADING_ICON_BY_KIND[kind]);
}
var TRNTextarea = forwardRef(
  function TRNTextarea2(props, ref) {
    const {
      prefixIcon,
      showPrefixIcon,
      size = "sm",
      variant = "outlined",
      invalid = false,
      className,
      textareaClassName,
      disabled,
      rows = 4,
      ...textareaRest
    } = props;
    const rowClass = twMerge(
      trnInputRowClass(variant, size, invalid, disabled === true),
      "items-stretch",
      className
    );
    const controlClass = twMerge(
      TRN_INPUT_CONTROL_CLASS,
      trnInputTextSizeClass(size, variant),
      "min-h-0 resize-y py-1.5 text-zinc-100",
      textareaClassName
    );
    const resolvedPrefixIcon = resolveTrnFieldTextPrefixIcon({
      variant,
      prefixIcon,
      showPrefixIcon,
      type: "text"
    });
    return /* @__PURE__ */ jsxs("div", { className: rowClass, children: [
      resolvedPrefixIcon != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 self-start pt-1.5", children: renderTrnInputPrefixIcon(resolvedPrefixIcon) }) : null,
      /* @__PURE__ */ jsx(
        "textarea",
        {
          ref,
          disabled,
          rows,
          "aria-invalid": invalid || void 0,
          className: controlClass,
          ...textareaRest
        }
      )
    ] });
  }
);
function TRNInputGroup(props) {
  const { children, className } = props;
  const items = Children.toArray(children).filter((child) => child != null);
  if (items.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: twMerge("overflow-hidden rounded-md bg-zinc-900/40", className), children: items.map((child, index) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
    index > 0 ? /* @__PURE__ */ jsx("div", { className: "mx-2 border-t border-zinc-800/70", role: "separator" }) : null,
    child
  ] }, index)) });
}
function TRNSettingsPanel({
  title,
  description,
  icon,
  rightSlot,
  children,
  className = "",
  collapsed = false,
  ...divProps
}) {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "rounded-2xl border border-zinc-700/80 bg-linear-to-br from-zinc-900/90 to-zinc-800/75 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-md " + className,
      ...divProps,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
            icon != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex h-5 w-5 items-center justify-center text-zinc-400", children: icon }) : null,
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h3", { className: "truncate text-lg font-semibold text-zinc-100", children: title }),
              description != null ? /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-sm text-zinc-400", children: description }) : null
            ] })
          ] }),
          rightSlot != null ? rightSlot : /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700/80 bg-zinc-900/80 text-zinc-400",
              "aria-label": collapsed ? "Expand panel" : "Collapse panel",
              children: /* @__PURE__ */ jsx(
                ChevronDown,
                {
                  className: "h-4 w-4 transition-transform",
                  style: {
                    transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)"
                  }
                }
              )
            }
          )
        ] }),
        collapsed ? null : children
      ]
    }
  );
}
var TRN_SETTING_ROW_HINT_HOVER_MS = TRN_HINT_HOVER_DELAY_MS;
function TRNSettingRow({
  label,
  labelIcon,
  valueText,
  hint,
  layout = "stacked",
  className = "",
  children
}) {
  const hintTooltipId = useId();
  const [hintVisible, setHintVisible] = useState(false);
  const hoverTimerRef = useRef(null);
  const clearHoverTimer = () => {
    if (hoverTimerRef.current != null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };
  useEffect(() => () => clearHoverTimer(), []);
  const onLabelPointerEnter = () => {
    if (hint == null || hint.length === 0) {
      return;
    }
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null;
      setHintVisible(true);
    }, TRN_HINT_HOVER_DELAY_MS);
  };
  const onLabelPointerLeave = () => {
    clearHoverTimer();
    setHintVisible(false);
  };
  const hasHint = hint != null && hint.length > 0;
  const inline = layout === "inline";
  const labelBlock = /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: twMerge(
          "inline-flex max-w-full items-center gap-1.5 text-sm font-semibold tracking-wide text-zinc-100",
          hasHint && "cursor-help underline decoration-dotted decoration-zinc-600/55 underline-offset-[3px]"
        ),
        "aria-describedby": hintVisible && hasHint ? hintTooltipId : void 0,
        onPointerEnter: onLabelPointerEnter,
        onPointerLeave: onLabelPointerLeave,
        children: [
          labelIcon,
          /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate", children: label })
        ]
      }
    ),
    hintVisible && hasHint ? /* @__PURE__ */ jsx(
      "div",
      {
        id: hintTooltipId,
        role: "tooltip",
        className: twMerge(
          "pointer-events-none absolute left-0 top-full z-200 mt-1 w-max max-w-[min(320px,calc(100vw-48px))]",
          TRN_HINT_POPOVER_PANEL_CLASS
        ),
        children: /* @__PURE__ */ jsx(TRNHintText, { className: "text-[11px] leading-snug text-zinc-100", children: hint })
      }
    ) : null
  ] });
  const valueBlock = valueText != null ? /* @__PURE__ */ jsx("div", { className: "shrink-0 font-mono text-sm font-semibold text-zinc-100", children: valueText }) : null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: twMerge(
        inline ? "flex h-[28px] items-center border-0 bg-zinc-950/45 px-1 py-0" : "rounded-xl border border-zinc-700/80 bg-zinc-950/75 p-4 backdrop-blur-sm",
        className
      ),
      children: inline ? /* @__PURE__ */ jsxs("div", { className: "relative flex h-full w-full min-w-0 items-center justify-between gap-3", children: [
        labelBlock,
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
          valueBlock,
          children
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "relative mb-2 flex items-start justify-between gap-2", children: [
          labelBlock,
          valueBlock
        ] }),
        children
      ] })
    }
  );
}

// src/trnFieldControlClasses.ts
var TRN_FIELD_CONTROL_DEFAULT_VARIANT = "field";
var TRN_FIELD_CONTROL_DEFAULT_SIZE = "md";
var TRN_FIELD_CONTROL_TRIGGER_BASE_CLASS = "font-sans text-[13px] font-normal leading-tight text-zinc-100 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50";
var TRN_FIELD_CONTROL_BORDER_BG_CLASS = "border border-zinc-700/80 bg-zinc-950/45";
var TRN_FIELD_CONTROL_FIELD_VARIANT_CLASS = `${TRN_FIELD_CONTROL_BORDER_BG_CLASS} hover:bg-zinc-950/55`;
var TRN_FIELD_CONTROL_GLASS_VARIANT_CLASS = "border border-white/15 bg-black/70 ring-1 ring-white/10 hover:bg-black/80";
var TRN_FIELD_CONTROL_SHADOW_BLUR_CLASS = "shadow-[0_16px_48px_-16px_rgba(0,0,0,0.35)] backdrop-blur-2xl";
var TRN_FIELD_CONTROL_PADDING_MD_CLASS = "rounded-md px-2.5 py-1.5";
var TRN_FIELD_CONTROL_LABEL_CLASS = "inline-flex items-center font-sans text-[13px] font-normal leading-tight text-zinc-100";
function fieldControlPaddingClass(size) {
  if (size === "sm") {
    return "rounded-md px-2.5 py-1";
  }
  if (size === "lg") {
    return "rounded-md px-2.5 py-2 text-sm";
  }
  return TRN_FIELD_CONTROL_PADDING_MD_CLASS;
}
function trnFieldControlRowShellClass(args) {
  const variant = args?.variant ?? TRN_FIELD_CONTROL_DEFAULT_VARIANT;
  const size = args?.size ?? TRN_FIELD_CONTROL_DEFAULT_SIZE;
  if (variant === "plain") {
    return "";
  }
  const padding = fieldControlPaddingClass(size);
  const variantClass = variant === "glass" ? TRN_FIELD_CONTROL_GLASS_VARIANT_CLASS : TRN_FIELD_CONTROL_BORDER_BG_CLASS;
  return `${padding} ${variantClass} ${TRN_FIELD_CONTROL_SHADOW_BLUR_CLASS}`;
}
var TRN_FIELD_CONTROL_ROW_SHELL_CLASS = trnFieldControlRowShellClass();
var TRACK_BASE_CLASS = "relative inline-block box-border shrink-0 overflow-hidden rounded-full border border-zinc-700/80 transition-colors disabled:opacity-50";
var TRACK_ON_CLASS = "bg-[color-mix(in_srgb,var(--color-accent-blue)_20%,transparent)]";
var TRACK_OFF_CLASS = "bg-zinc-900/85";
var THUMB_BASE_CLASS = "absolute box-border top-1/2 left-0.5 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[transform,background-color,border-color] duration-150 ease-out -translate-y-1/2";
var THUMB_ON_CLASS = "border-[color-mix(in_srgb,var(--color-accent-blue)_55%,white)] bg-[color-mix(in_srgb,var(--color-accent-blue)_85%,transparent)]";
var THUMB_OFF_CLASS = "border-zinc-600/55 bg-zinc-500/85";
var SIZE_CLASSES = {
  sm: {
    track: "h-3.5 w-7",
    thumb: "size-2.5",
    // Vertically centered via -translate-y-1/2; X slide keeps Y.
    onTranslate: "translate-x-[13px] -translate-y-1/2",
    offTranslate: "translate-x-0 -translate-y-1/2"
  },
  md: {
    // 16px track + 12px thumb → 2px inset top/bottom when centered.
    track: "h-4 w-8",
    thumb: "size-3",
    onTranslate: "translate-x-[14px] -translate-y-1/2",
    offTranslate: "translate-x-0 -translate-y-1/2"
  },
  lg: {
    track: "h-5 w-10",
    thumb: "size-4",
    onTranslate: "translate-x-5 -translate-y-1/2",
    offTranslate: "translate-x-0 -translate-y-1/2"
  }
};
function TRNToggleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel,
  size = "md"
}) {
  const s = SIZE_CLASSES[size];
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": checked,
      "aria-label": ariaLabel,
      disabled,
      onClick: () => {
        if (disabled) {
          return;
        }
        onCheckedChange(!checked);
      },
      className: twMerge(
        TRACK_BASE_CLASS,
        s.track,
        checked ? TRACK_ON_CLASS : TRACK_OFF_CLASS
      ),
      children: /* @__PURE__ */ jsx(
        "span",
        {
          className: twMerge(
            THUMB_BASE_CLASS,
            s.thumb,
            checked ? THUMB_ON_CLASS : THUMB_OFF_CLASS,
            checked ? s.onTranslate : s.offTranslate
          ),
          "aria-hidden": true
        }
      )
    }
  );
}
var TRN_INLINE_TOGGLE_ROW_DEFAULT_VARIANT = "field";
var TRN_INLINE_TOGGLE_ROW_DEFAULT_SIZE = "md";
function TRNInlineToggleRow(props) {
  const {
    label,
    hint,
    checked,
    onCheckedChange,
    disabled = false,
    ariaLabel,
    variant = TRN_INLINE_TOGGLE_ROW_DEFAULT_VARIANT,
    size = TRN_INLINE_TOGGLE_ROW_DEFAULT_SIZE,
    className,
    middleSlot
  } = props;
  const labelNode = /* @__PURE__ */ jsx("span", { className: TRN_FIELD_CONTROL_LABEL_CLASS, children: label });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: twMerge(
        "flex w-full items-center justify-between gap-3",
        trnFieldControlRowShellClass({ variant, size }),
        className
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex min-w-0 flex-1 items-center", children: hint != null && hint.length > 0 ? /* @__PURE__ */ jsx(
          TRNHintTooltip,
          {
            className: "inline-flex",
            trigger: /* @__PURE__ */ jsx("span", { className: "inline-flex w-fit cursor-help items-center", children: labelNode }),
            title: label,
            description: hint,
            triggerAriaLabel: `About ${label}`,
            placement: "top-start",
            triggerWrapper: "span",
            triggerClassName: "!p-0",
            wide: hint.length > 120
          }
        ) : labelNode }),
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
          middleSlot,
          /* @__PURE__ */ jsx(
            TRNToggleSwitch,
            {
              checked,
              disabled,
              ariaLabel: ariaLabel ?? label,
              onCheckedChange
            }
          )
        ] })
      ]
    }
  );
}
function TRNSectionContainer(props) {
  const {
    title,
    titleLeadingSlot,
    titleTrailingSlot,
    headerTitleClassName,
    children,
    className,
    glass = false,
    glassPreset = "medium"
  } = props;
  const shellGlassClass = glassPreset === "soft" ? "border-zinc-700/85 bg-zinc-900/72 backdrop-blur-sm" : glassPreset === "strong" ? "border-zinc-700/70 bg-zinc-900/32 backdrop-blur-lg" : "border-zinc-700/80 bg-zinc-900/55 backdrop-blur-md";
  const showToolbarHeader = titleLeadingSlot != null || titleTrailingSlot != null || headerTitleClassName != null;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: twMerge(
        "flex h-full min-h-0 flex-col rounded-md border p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        glass ? shellGlassClass : "border-zinc-700/80 bg-zinc-950/85",
        className
      ),
      children: [
        showToolbarHeader ? /* @__PURE__ */ jsxs("div", { className: "mb-1 flex min-w-0 items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
            titleLeadingSlot != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center", children: titleLeadingSlot }) : null,
            /* @__PURE__ */ jsx(
              "span",
              {
                className: twMerge(
                  "min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-zinc-400",
                  headerTitleClassName
                ),
                children: title
              }
            )
          ] }),
          titleTrailingSlot != null ? /* @__PURE__ */ jsx("div", { className: "inline-flex shrink-0 items-center", children: titleTrailingSlot }) : null
        ] }) : /* @__PURE__ */ jsx("div", { className: "mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400", children: title }),
        /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1", children })
      ]
    }
  );
}
var TRN_ICON_BUTTON_BASE = "inline-flex h-7 w-7 items-center justify-center rounded-md p-0 transition-colors disabled:cursor-not-allowed disabled:opacity-50";
var TRN_ICON_BUTTON_VARIANT_CLASS = {
  default: "border border-zinc-700/80 bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800/70",
  ghost: "border-0 bg-transparent text-zinc-400 shadow-none hover:bg-zinc-800/45 hover:text-zinc-100"
};
function TRNIconButton({
  icon,
  label,
  className = "",
  variant = "default",
  nativeTitle = true,
  hint,
  hintTitle,
  hintDescription,
  hintPlacement = "bottom",
  hintDelayMs = TRN_HINT_HOVER_DELAY_MS,
  hintTriggerClassName,
  disabled,
  ...props
}) {
  const resolvedHint = resolveTrnLabeledHintContent({
    label,
    hintTitle,
    hintDescription,
    hint
  });
  const useNativeTitle = nativeTitle && resolvedHint == null;
  const button = /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      disabled,
      "aria-label": label,
      ...useNativeTitle ? { title: label } : {},
      className: twMerge(TRN_ICON_BUTTON_BASE, TRN_ICON_BUTTON_VARIANT_CLASS[variant], className),
      ...props,
      children: icon
    }
  );
  if (resolvedHint == null) {
    return button;
  }
  return /* @__PURE__ */ jsx(
    TRNTooltip,
    {
      className: "pointer-events-auto inline-flex shrink-0",
      placement: hintPlacement,
      openDelayMs: hintDelayMs,
      disableHoverFx: true,
      triggerWrapper: "span",
      triggerClassName: twMerge("inline-flex", hintTriggerClassName),
      triggerAriaLabel: label,
      content: resolvedHint,
      panelClassName: TRN_HINT_POPOVER_PANEL_CLASS,
      trigger: button
    }
  );
}
var TRN_HOLD_MODE_ICON_BUTTON_DEFAULT_HOLD_MS = 800;
var TRN_HOLD_MODE_PROGRESS_ARM_MS = 200;
var CORNER_HIT_PX = 12;
function TRNHoldModeIconButton(props) {
  const {
    items,
    activeItemId,
    onActiveItemChange,
    onPrimaryAction,
    primaryActionEnabled = true,
    dimmed = false,
    pending = false,
    attention = false,
    emphasize = false,
    pressed,
    hint,
    menuAriaLabel = "Mode",
    holdMs = TRN_HOLD_MODE_ICON_BUTTON_DEFAULT_HOLD_MS,
    progressArmMs = TRN_HOLD_MODE_PROGRESS_ARM_MS,
    className,
    tooltipPlacement = "bottom",
    tooltipOpenDelayMs = 400
  } = props;
  const active = items.find((item) => item.id === activeItemId) ?? items[0] ?? null;
  const menuId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const holdTimerRef = useRef(null);
  const armTimerRef = useRef(null);
  const holdRafRef = useRef(null);
  const progressStartedAtRef = useRef(null);
  const openedByHoldRef = useRef(false);
  const holdArmedRef = useRef(false);
  const pointerIdRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [menuPos, setMenuPos] = useState(
    null
  );
  const armMs = Math.max(0, Math.min(progressArmMs, Math.max(0, holdMs - 1)));
  const progressFillMs = Math.max(1, holdMs - armMs);
  const clearHold = useCallback(() => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (armTimerRef.current != null) {
      window.clearTimeout(armTimerRef.current);
      armTimerRef.current = null;
    }
    if (holdRafRef.current != null) {
      window.cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    progressStartedAtRef.current = null;
    holdArmedRef.current = false;
    setHoldProgress(0);
  }, []);
  const updateMenuPos = useCallback(() => {
    const el = buttonRef.current;
    if (el == null) {
      return;
    }
    const r = el.getBoundingClientRect();
    const menuW = 196;
    const menuH = Math.max(72, 8 + items.length * 48);
    const gap = 6;
    let left = r.right - menuW;
    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
    let top = r.bottom + gap;
    if (top + menuH > window.innerHeight - 8) {
      top = r.top - gap - menuH;
    }
    top = Math.max(8, top);
    setMenuPos({ top, left });
  }, [items.length]);
  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuPos(null);
      return;
    }
    updateMenuPos();
    const onResize = () => updateMenuPos();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [menuOpen, updateMenuPos]);
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onDown = (event) => {
      if (rootRef.current != null && rootRef.current.contains(event.target)) {
        return;
      }
      const menuEl = document.getElementById(menuId);
      if (menuEl != null && menuEl.contains(event.target)) {
        return;
      }
      setMenuOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuId, menuOpen]);
  useEffect(() => () => clearHold(), [clearHold]);
  const openMenu = useCallback(() => {
    clearHold();
    setMenuOpen(true);
  }, [clearHold]);
  const isCornerHit = (event) => {
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    return event.clientX >= r.right - CORNER_HIT_PX && event.clientY >= r.bottom - CORNER_HIT_PX;
  };
  const tickHoldProgress = useCallback(() => {
    const started = progressStartedAtRef.current;
    if (started == null) {
      return;
    }
    const p = Math.min(1, (performance.now() - started) / progressFillMs);
    setHoldProgress(p);
    if (p < 1) {
      holdRafRef.current = window.requestAnimationFrame(tickHoldProgress);
    }
  }, [progressFillMs]);
  const onPointerDown = (event) => {
    if (event.button !== 0 || items.length === 0) {
      return;
    }
    if (event.shiftKey || isCornerHit(event)) {
      event.preventDefault();
      openedByHoldRef.current = true;
      holdArmedRef.current = true;
      openMenu();
      return;
    }
    openedByHoldRef.current = false;
    holdArmedRef.current = false;
    pointerIdRef.current = event.pointerId;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
    }
    setHoldProgress(0);
    armTimerRef.current = window.setTimeout(() => {
      holdArmedRef.current = true;
      progressStartedAtRef.current = performance.now();
      setHoldProgress(0);
      holdRafRef.current = window.requestAnimationFrame(tickHoldProgress);
    }, armMs);
    holdTimerRef.current = window.setTimeout(() => {
      openedByHoldRef.current = true;
      openMenu();
    }, holdMs);
  };
  const onPointerUp = (event) => {
    const wasHoldOpen = openedByHoldRef.current;
    const wasArmed = holdArmedRef.current;
    const pid = pointerIdRef.current;
    if (pid != null) {
      try {
        if (event.currentTarget.hasPointerCapture(pid)) {
          event.currentTarget.releasePointerCapture(pid);
        }
      } catch {
      }
      pointerIdRef.current = null;
    }
    clearHold();
    if (wasHoldOpen || wasArmed || menuOpen) {
      return;
    }
    if (!primaryActionEnabled || onPrimaryAction == null) {
      return;
    }
    onPrimaryAction();
  };
  const onPointerCancel = () => {
    clearHold();
    pointerIdRef.current = null;
  };
  const onPointerLeave = (event) => {
    const pid = pointerIdRef.current;
    if (pid != null && event.currentTarget.hasPointerCapture(pid)) {
      return;
    }
    clearHold();
  };
  if (active == null) {
    return null;
  }
  const faceLabel = active.ariaLabel ?? active.label;
  const tip = hint ?? /* @__PURE__ */ jsxs("span", { className: "text-[11px] leading-relaxed text-zinc-100", children: [
    active.label,
    ". Hold, Shift+click, or corner-click to switch mode."
  ] });
  const ringSize = 26;
  const stroke = 2;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - holdProgress);
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const suppressTooltip = menuOpen || holdProgress > 0.02;
  const button = /* @__PURE__ */ jsxs(
    "button",
    {
      ref: buttonRef,
      type: "button",
      "aria-label": faceLabel,
      "aria-haspopup": "menu",
      "aria-expanded": menuOpen,
      "aria-controls": menuOpen ? menuId : void 0,
      ...pressed !== void 0 ? { "aria-pressed": pressed } : {},
      className: twMerge(
        "relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 shadow-none transition-colors",
        "hover:bg-zinc-800/45",
        dimmed ? "cursor-default text-zinc-500 opacity-50" : emphasize ? "text-cyan-300 hover:text-cyan-200" : "text-zinc-400 hover:text-zinc-100",
        pending || attention ? "animate-pulse" : null,
        attention ? "ring-1 ring-inset ring-amber-400/55 shadow-[0_0_10px_-2px_rgba(251,191,36,0.45)]" : null,
        className
      ),
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
      onClick: (e) => {
        e.preventDefault();
      },
      children: [
        holdProgress > 0.01 ? /* @__PURE__ */ jsxs(
          "svg",
          {
            className: "pointer-events-none absolute inset-0 m-auto",
            width: ringSize,
            height: ringSize,
            viewBox: `0 0 ${ringSize} ${ringSize}`,
            "aria-hidden": true,
            children: [
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: ringSize / 2,
                  cy: ringSize / 2,
                  r: radius,
                  fill: "none",
                  stroke: "currentColor",
                  strokeOpacity: 0.2,
                  strokeWidth: stroke
                }
              ),
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: ringSize / 2,
                  cy: ringSize / 2,
                  r: radius,
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: stroke,
                  strokeLinecap: "round",
                  strokeDasharray: circumference,
                  strokeDashoffset: dashOffset,
                  transform: `rotate(-90 ${ringSize / 2} ${ringSize / 2})`
                }
              )
            ]
          }
        ) : null,
        /* @__PURE__ */ jsx("span", { className: "relative z-[1] inline-flex h-3.5 w-3.5 items-center justify-center", children: active.icon }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "pointer-events-none absolute bottom-0.5 right-0.5 h-0 w-0 border-b-[5px] border-l-[5px] border-b-zinc-300/90 border-l-transparent",
            "aria-hidden": true
          }
        )
      ]
    }
  );
  return /* @__PURE__ */ jsxs("div", { ref: rootRef, className: "relative inline-flex shrink-0", children: [
    /* @__PURE__ */ jsx(
      TRNTooltip,
      {
        placement: tooltipPlacement,
        openDelayMs: tooltipOpenDelayMs,
        disableHoverFx: true,
        forceClosed: suppressTooltip,
        triggerWrapper: "span",
        triggerClassName: "inline-flex",
        triggerAriaLabel: faceLabel,
        content: tip,
        panelClassName: TRN_HINT_POPOVER_PANEL_CLASS,
        trigger: button
      }
    ),
    menuOpen && menuPos != null && portalTarget != null ? createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          id: menuId,
          role: "menu",
          "aria-label": menuAriaLabel,
          className: "pointer-events-auto fixed z-[2400] inline-flex min-w-[11.5rem] flex-col items-stretch gap-0.5 rounded-xl border border-zinc-600/55 bg-zinc-950/90 p-1 shadow-md backdrop-blur-md",
          style: { top: menuPos.top, left: menuPos.left },
          children: items.map((item) => {
            const selected = item.id === activeItemId;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                role: "menuitemradio",
                "aria-checked": selected,
                className: twMerge(
                  "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                  selected ? "bg-sky-500/35 text-white" : "text-zinc-200 hover:bg-zinc-800/90"
                ),
                onClick: () => {
                  onActiveItemChange(item.id);
                  setMenuOpen(false);
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-zinc-300",
                      "aria-hidden": true,
                      children: item.icon
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "block text-[11px] font-medium leading-tight", children: item.label }),
                    item.subtitle != null && item.subtitle.length > 0 ? /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-[10px] leading-tight text-zinc-400", children: item.subtitle }) : null
                  ] })
                ]
              },
              item.id
            );
          })
        }
      ),
      portalTarget
    ) : null
  ] });
}
function colorClassForState(state) {
  if (state === "ok") {
    return "text-emerald-400";
  }
  if (state === "error") {
    return "text-rose-400";
  }
  if (state === "warn") {
    return "text-amber-400";
  }
  return "text-zinc-400";
}
function TRNStatusIcon({
  icon,
  state,
  label,
  title,
  className = ""
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "inline-flex items-center rounded-md bg-zinc-800/70 px-1 py-1 " + className,
      children: /* @__PURE__ */ jsx(
        "span",
        {
          className: "inline-flex items-center " + colorClassForState(state),
          "aria-label": label,
          title: title ?? label,
          children: icon
        }
      )
    }
  );
}
var TRN_QUICK_HINT_HOVER_DELAY_MS = 280;
function TRNQuickHintTooltip(props) {
  const {
    trigger,
    title,
    description,
    content,
    placement = "top",
    className = "",
    panelClassName = "",
    triggerClassName = "",
    triggerAriaLabel,
    wide = false,
    triggerWrapper = "span",
    openDelayMs = TRN_QUICK_HINT_HOVER_DELAY_MS
  } = props;
  const tooltipContent = useMemo(() => {
    const resolved = resolveTrnHintContent({ title, description, content });
    return resolved ?? content ?? null;
  }, [title, description, content]);
  if (tooltipContent == null) {
    return /* @__PURE__ */ jsx(Fragment, { children: trigger });
  }
  return /* @__PURE__ */ jsx(
    TRNTooltip,
    {
      className,
      triggerClassName,
      triggerAriaLabel: triggerAriaLabel ?? (typeof title === "string" ? title : void 0),
      triggerWrapper,
      placement,
      openDelayMs,
      disableHoverFx: true,
      trigger,
      content: tooltipContent,
      panelClassName: twMerge(
        TRN_HINT_POPOVER_PANEL_CLASS,
        wide ? "max-w-[min(420px,calc(100vw-32px))]" : "max-w-[min(320px,calc(100vw-48px))]",
        panelClassName
      )
    }
  );
}
var TRN_CODE_FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
function TRNHighlightedJsonTextarea(props) {
  const {
    value,
    onChange,
    onBlur,
    disabled = false,
    className,
    "aria-label": ariaLabel
  } = props;
  const backingRef = useRef(null);
  const syncScroll = useCallback((source) => {
    const backing = backingRef.current;
    if (backing == null) {
      return;
    }
    backing.scrollTop = source.scrollTop;
    backing.scrollLeft = source.scrollLeft;
  }, []);
  const highlightSource = value.length === 0 ? " " : value;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: twMerge(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-zinc-700/80 bg-zinc-900/60 focus-within:border-cyan-400/60",
        disabled ? "opacity-60" : "",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: backingRef,
            className: "scrollbar-hide pointer-events-none absolute inset-0 overflow-auto px-2 py-1",
            "aria-hidden": true,
            children: /* @__PURE__ */ jsx(
              Prism,
              {
                language: "json",
                style: oneDark,
                PreTag: "div",
                customStyle: {
                  margin: 0,
                  padding: 0,
                  background: "transparent"
                },
                codeTagProps: {
                  style: {
                    fontFamily: TRN_CODE_FONT_FAMILY,
                    fontSize: "11px",
                    lineHeight: "1.35",
                    whiteSpace: "pre",
                    overflowWrap: "normal"
                  }
                },
                children: highlightSource
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            "aria-label": ariaLabel,
            disabled,
            spellCheck: false,
            value,
            onChange: (event) => onChange(event.target.value),
            onBlur,
            onScroll: (event) => syncScroll(event.currentTarget),
            className: "relative z-10 min-h-0 w-full flex-1 resize-none overflow-auto bg-transparent px-2 py-1 font-mono text-[11px] leading-[1.35] whitespace-pre text-transparent caret-zinc-100 outline-none selection:bg-cyan-500/30 selection:text-transparent disabled:cursor-not-allowed",
            style: {
              fontFamily: TRN_CODE_FONT_FAMILY,
              tabSize: 2
            }
          }
        )
      ]
    }
  );
}
var TRN_HIGHLIGHTED_JSON_SYNTAX_THEME_OPTIONS = [
  { id: "oneDark", label: "One Dark" },
  { id: "vscDarkPlus", label: "VS Code Dark+" },
  { id: "dracula", label: "Dracula" },
  { id: "nightOwl", label: "Night Owl" },
  { id: "nord", label: "Nord" },
  { id: "materialDark", label: "Material Dark" },
  { id: "oneLight", label: "One Light" },
  { id: "vs", label: "VS (light)" }
];
var TRN_HIGHLIGHTED_JSON_PRISM_STYLES = {
  oneDark: oneDark,
  vscDarkPlus,
  dracula,
  nightOwl,
  nord,
  materialDark,
  oneLight,
  vs
};
var TRN_HIGHLIGHTED_JSON_DEFAULT_SYNTAX_THEME_ID = "oneDark";
function isTrnHighlightedJsonSyntaxThemeId(value) {
  return TRN_HIGHLIGHTED_JSON_SYNTAX_THEME_OPTIONS.some((o) => o.id === value);
}
var TRN_CODE_FONT_FAMILY2 = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
var TRN_CODE_FONT_SIZE_DEFAULT_PX = 11;
var TRN_CODE_FONT_SIZE_MIN_PX = 8;
var TRN_CODE_FONT_SIZE_MAX_PX = 24;
var TRN_CODE_CTRL_WHEEL_ZOOM_FACTOR = 1.12;
function clampTrnCodeFontSizePx(sizePx) {
  return Math.min(
    TRN_CODE_FONT_SIZE_MAX_PX,
    Math.max(TRN_CODE_FONT_SIZE_MIN_PX, sizePx)
  );
}
function TRNHighlightedCodeBlock({
  value,
  language = "c",
  className,
  emptyPlaceholder = " ",
  syntaxThemeId = TRN_HIGHLIGHTED_JSON_DEFAULT_SYNTAX_THEME_ID,
  semibold = false,
  ctrlWheelZoom = false
}) {
  const scrollRef = useRef(null);
  const [fontSizePx, setFontSizePx] = useState(TRN_CODE_FONT_SIZE_DEFAULT_PX);
  const source = value.length === 0 ? emptyPlaceholder : value;
  const prismStyle = TRN_HIGHLIGHTED_JSON_PRISM_STYLES[syntaxThemeId];
  const codeWeight = semibold ? 600 : void 0;
  const zoomPercent = Math.round(fontSizePx / TRN_CODE_FONT_SIZE_DEFAULT_PX * 100);
  const onWheelZoom = useCallback((event) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const factor = event.deltaY < 0 ? TRN_CODE_CTRL_WHEEL_ZOOM_FACTOR : 1 / TRN_CODE_CTRL_WHEEL_ZOOM_FACTOR;
    setFontSizePx((prev) => clampTrnCodeFontSizePx(prev * factor));
  }, []);
  useEffect(() => {
    if (!ctrlWheelZoom) {
      return void 0;
    }
    const element = scrollRef.current;
    if (element == null) {
      return void 0;
    }
    element.addEventListener("wheel", onWheelZoom, { passive: false });
    return () => element.removeEventListener("wheel", onWheelZoom);
  }, [ctrlWheelZoom, onWheelZoom]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: scrollRef,
      className: twMerge(
        "relative overflow-auto rounded border border-white/10 bg-black/40 px-2 py-1",
        semibold ? "[&_code]:!font-semibold [&_code_span]:!font-semibold" : "",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          Prism,
          {
            language,
            style: prismStyle,
            PreTag: "div",
            customStyle: {
              margin: 0,
              padding: 0,
              background: "transparent",
              fontWeight: codeWeight
            },
            codeTagProps: {
              style: {
                fontFamily: TRN_CODE_FONT_FAMILY2,
                fontSize: `${fontSizePx}px`,
                lineHeight: "1.35",
                fontWeight: codeWeight,
                whiteSpace: "pre",
                overflowWrap: "normal"
              }
            },
            children: source
          }
        ),
        ctrlWheelZoom && zoomPercent !== 100 ? /* @__PURE__ */ jsxs("span", { className: "pointer-events-none absolute bottom-1 right-2 rounded bg-zinc-950/80 px-1 py-0.5 text-[10px] font-medium text-zinc-500", children: [
          zoomPercent,
          "%"
        ] }) : null
      ]
    }
  );
}
var TRN_CODE_FONT_FAMILY3 = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
function TRNHighlightedJsonBlock(props) {
  const {
    value,
    className,
    emptyPlaceholder = " ",
    syntaxThemeId = TRN_HIGHLIGHTED_JSON_DEFAULT_SYNTAX_THEME_ID
  } = props;
  const source = value.length === 0 ? emptyPlaceholder : value;
  const prismStyle = TRN_HIGHLIGHTED_JSON_PRISM_STYLES[syntaxThemeId];
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: twMerge(
        "overflow-auto rounded border border-white/10 bg-black/40 px-2 py-1",
        className
      ),
      children: /* @__PURE__ */ jsx(
        Prism,
        {
          language: "json",
          style: prismStyle,
          PreTag: "div",
          customStyle: {
            margin: 0,
            padding: 0,
            background: "transparent"
          },
          codeTagProps: {
            style: {
              fontFamily: TRN_CODE_FONT_FAMILY3,
              fontSize: "11px",
              lineHeight: "1.35",
              whiteSpace: "pre",
              overflowWrap: "normal"
            }
          },
          children: source
        }
      )
    }
  );
}
var TONE_CLASSES = {
  emerald: {
    active: "border-emerald-400/45 bg-emerald-950/40 text-emerald-100 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.12)]",
    inactiveFocus: "focus-visible:ring-emerald-400/35",
    navBorder: "border-emerald-900/30"
  },
  zinc: {
    active: "border-zinc-400/45 bg-zinc-800/55 text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
    inactiveFocus: "focus-visible:ring-zinc-400/35",
    navBorder: "border-zinc-700/45"
  }
};
function TRNInspectorIconRail(props) {
  const {
    items,
    activeId,
    onActiveChange,
    ariaLabel,
    tone = "emerald",
    dockSide = "left",
    reactFlowSafe = true,
    itemClassName,
    activeItemClassName,
    inactiveItemClassName,
    itemsContainerClassName,
    className,
    ...rest
  } = props;
  const tc = TONE_CLASSES[tone];
  const isDockRight = dockSide === "right";
  return /* @__PURE__ */ jsx(
    "nav",
    {
      ...rest,
      "aria-label": ariaLabel,
      className: twMerge(
        "flex w-[42px] shrink-0 flex-col gap-0.5 mt-1 pb-1",
        isDockRight ? "pr-1 pl-0.5" : "pl-1 pr-0.5",
        reactFlowSafe ? "nodrag nopan nowheel" : null,
        isDockRight ? `border-l bg-zinc-950/90 ${tc.navBorder}` : `border-r bg-zinc-950/90 ${tc.navBorder}`,
        className
      ),
      children: /* @__PURE__ */ jsx("div", { className: twMerge("flex flex-col gap-0.5", itemsContainerClassName), children: items.map(({ id, label, Icon }) => {
        const active = activeId === id;
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            title: label,
            "aria-label": label,
            "aria-pressed": active,
            className: twMerge(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
              itemClassName,
              tc.inactiveFocus,
              active ? tc.active : "border-transparent bg-transparent text-zinc-400 hover:border-zinc-600/50 hover:bg-zinc-800/40 hover:text-zinc-100",
              active ? activeItemClassName : inactiveItemClassName
            ),
            onPointerDownCapture: reactFlowSafe ? (e) => {
              e.preventDefault();
              e.stopPropagation();
            } : void 0,
            onClick: reactFlowSafe ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onActiveChange(id);
            } : () => {
              onActiveChange(id);
            },
            children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4", strokeWidth: 1.75, "aria-hidden": true })
          },
          id
        );
      }) })
    }
  );
}
function toneClasses(tone, selected) {
  if (!selected) {
    return "border-zinc-700/80 bg-zinc-950/90 text-zinc-400 hover:bg-zinc-800/70";
  }
  if (tone === "success") {
    return "border-zinc-700/80 bg-emerald-500/10 text-emerald-300";
  }
  if (tone === "danger") {
    return "border-zinc-700/80 bg-rose-500/10 text-rose-300";
  }
  if (tone === "accent") {
    return "border-zinc-700/80 bg-cyan-500/20 text-zinc-100";
  }
  return "border-zinc-700/80 bg-cyan-500/15 text-zinc-100";
}
function toneFocusRingClass(tone) {
  if (tone === "success") {
    return "ring-1 ring-emerald-500/70";
  }
  if (tone === "danger") {
    return "ring-1 ring-rose-500/70";
  }
  if (tone === "accent") {
    return "ring-1 ring-cyan-400/90";
  }
  return "ring-1 ring-cyan-400/50";
}
function TRNSegmentedControl({
  value,
  onValueChange,
  options,
  name,
  ariaLabel,
  disabled = false,
  size = "md",
  variant = "default",
  fullWidth = false,
  orientation = "horizontal",
  className = "",
  itemClassName = "",
  tone = "accent",
  allowDeselect = false,
  onFocusChange,
  renderOption,
  stopPointerDownPropagation = false,
  showFocusRing = false
}) {
  const [focusedValue, setFocusedValue] = useState(null);
  const enabledOptions = useMemo(
    () => options.filter((option) => !option.disabled),
    [options]
  );
  const currentIndex = enabledOptions.findIndex(
    (option) => option.value === value
  );
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-1 text-xs";
  const containerVariantClass = variant === "surface" ? "rounded border border-zinc-700/80 bg-zinc-900/80 p-1" : variant === "outline" ? "rounded border border-zinc-700/80 p-1" : "";
  const isVertical = orientation === "vertical";
  const rootClass = (isVertical ? "flex flex-col" : "flex flex-wrap") + " gap-1 " + (fullWidth ? "w-full " : "") + containerVariantClass + (className.length > 0 ? ` ${className}` : "");
  const setFocusValue = (next) => {
    setFocusedValue(next);
    onFocusChange?.(next);
  };
  const handleKeyDown = (evt, option) => {
    if (disabled || option.disabled || enabledOptions.length === 0) {
      return;
    }
    const isPrevKey = isVertical ? evt.key === "ArrowUp" : evt.key === "ArrowLeft";
    const isNextKey = isVertical ? evt.key === "ArrowDown" : evt.key === "ArrowRight";
    if (!isPrevKey && !isNextKey) {
      return;
    }
    evt.preventDefault();
    const baseIndex = currentIndex >= 0 ? currentIndex : enabledOptions.findIndex((item) => item.value === option.value);
    if (baseIndex < 0) {
      return;
    }
    const delta = isPrevKey ? -1 : 1;
    const nextIndex = (baseIndex + delta + enabledOptions.length) % enabledOptions.length;
    const nextValue = enabledOptions[nextIndex]?.value ?? null;
    if (nextValue != null) {
      onValueChange(nextValue);
      setFocusValue(nextValue);
    }
  };
  return /* @__PURE__ */ jsx("div", { role: "radiogroup", "aria-label": ariaLabel, className: rootClass, children: options.map((option) => {
    const isSelected = option.value === value;
    const isOptionDisabled = disabled || option.disabled === true;
    const isFocused = focusedValue === option.value;
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        name,
        role: "radio",
        "aria-checked": isSelected,
        "aria-pressed": isSelected,
        disabled: isOptionDisabled,
        onPointerDown: (evt) => {
          if (stopPointerDownPropagation) {
            evt.stopPropagation();
          }
        },
        onClick: (evt) => {
          if (stopPointerDownPropagation) {
            evt.stopPropagation();
          }
          if (isOptionDisabled) {
            return;
          }
          if (allowDeselect && isSelected) {
            onValueChange(null);
            return;
          }
          onValueChange(option.value);
        },
        onFocus: () => {
          setFocusValue(option.value);
        },
        onBlur: () => {
          setFocusValue(null);
        },
        onKeyDown: (evt) => {
          handleKeyDown(evt, option);
        },
        className: "inline-flex items-center justify-center gap-1.5 rounded border transition-colors focus:outline-none focus-visible:outline-none focus:ring-0 " + sizeClass + " " + toneClasses(tone, isSelected) + (fullWidth ? " flex-1 " : " ") + (isFocused && showFocusRing ? `${toneFocusRingClass(tone)} ` : "") + "disabled:opacity-50 disabled:cursor-not-allowed " + itemClassName,
        children: renderOption != null ? renderOption(option, {
          selected: isSelected,
          focused: isFocused,
          disabled: isOptionDisabled
        }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          option.icon != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex", children: option.icon }) : null,
          /* @__PURE__ */ jsx("span", { children: option.label })
        ] })
      },
      option.value
    );
  }) });
}
function TRNBooleanSegment({
  value,
  onValueChange,
  trueLabel = "On",
  falseLabel = "Off",
  trueIcon,
  falseIcon,
  size = "sm",
  tone = "neutral",
  variant = "default",
  appearance = "default",
  fullWidth = false,
  orientation = "horizontal",
  disabled = false,
  className = "",
  itemClassName = "",
  ariaLabel,
  stopPointerDownPropagation = false,
  showFocusRing
}) {
  const resolvedTone = appearance === "green-glass" ? "neutral" : tone;
  const resolvedShowFocusRing = showFocusRing ?? (appearance === "green-glass" ? false : true);
  const appearanceItemClassName = appearance === "glass" ? "bg-zinc-900/70 hover:border-cyan-500/40 hover:bg-cyan-500/10" : appearance === "strong" ? "border-cyan-500/45 hover:border-cyan-400 hover:bg-cyan-500/15" : appearance === "green-glass" ? "bg-emerald-950/30 !border-emerald-900/80 hover:bg-emerald-500/12 aria-checked:bg-emerald-500/14" : "";
  return /* @__PURE__ */ jsx(
    TRNSegmentedControl,
    {
      value: value ? "true" : "false",
      onValueChange: (nextValue) => {
        if (nextValue === "true") {
          onValueChange(true);
          return;
        }
        if (nextValue === "false") {
          onValueChange(false);
        }
      },
      options: [
        { value: "false", label: falseLabel, icon: falseIcon },
        { value: "true", label: trueLabel, icon: trueIcon }
      ],
      ariaLabel,
      disabled,
      size,
      tone: resolvedTone,
      variant,
      fullWidth,
      orientation,
      className,
      itemClassName: appearanceItemClassName.length > 0 ? `${appearanceItemClassName} ${itemClassName}`.trim() : itemClassName,
      renderOption: appearance === "green-glass" ? (option, context) => /* @__PURE__ */ jsxs(Fragment, { children: [
        option.icon != null ? /* @__PURE__ */ jsx(
          "span",
          {
            className: "inline-flex " + (context.selected ? "text-emerald-200" : "text-slate-400"),
            children: option.icon
          }
        ) : null,
        /* @__PURE__ */ jsx("span", { className: context.selected ? "text-emerald-200" : "text-slate-400", children: option.label })
      ] }) : void 0,
      showFocusRing: resolvedShowFocusRing,
      stopPointerDownPropagation
    }
  );
}
var TRNRangeSlider = ({
  label,
  className,
  valueLabel,
  id,
  ...rest
}) => {
  const inputId = id ?? (label ? `slider-${label.replace(/\s/g, "-")}` : void 0);
  return /* @__PURE__ */ jsxs("div", { className: clsx("flex min-w-0 flex-col gap-0.5", className), children: [
    (label || valueLabel) && /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
      label && /* @__PURE__ */ jsx("label", { htmlFor: inputId, className: "truncate text-xs text-gray-400", children: label }),
      valueLabel != null && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-gray-400", children: valueLabel })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        id: inputId,
        type: "range",
        className: clsx(
          "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800/85 accent-cyan-500 transition-colors",
          "hover:bg-zinc-700/85 focus-visible:outline-none",
          "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-zinc-800/85",
          "[&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-emerald-300/50",
          "[&::-webkit-slider-thumb]:bg-[rgba(16,185,129,0.72)] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(8,12,20,0.95)] [&::-webkit-slider-thumb]:transition-transform",
          "hover:[&::-webkit-slider-thumb]:scale-110",
          "focus-visible:[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(8,12,20,0.95),0_0_0_4px_rgba(34,211,238,0.35)]",
          "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border-none [&::-moz-range-track]:bg-zinc-800/85",
          "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-emerald-300/50 [&::-moz-range-thumb]:bg-[rgba(16,185,129,0.72)]",
          "disabled:cursor-not-allowed disabled:opacity-45"
        ),
        ...rest
      }
    )
  ] });
};
var VALUE_SCRUB_THRESHOLD_PX = 5;
function snapScalarToStep(v, step, min, max) {
  const c = Math.min(max, Math.max(min, v));
  if (!Number.isFinite(step) || step <= 0) {
    return c;
  }
  const snapped = Math.round(c / step) * step;
  const s = String(step);
  const dot = s.indexOf(".");
  const decimals = dot < 0 ? 0 : Math.min(8, Math.max(0, s.length - dot - 1));
  return Number(snapped.toFixed(decimals));
}
var APPEARANCE_ROOT = {
  default: "flex flex-col gap-2 px-2 py-1 text-sm",
  divider: "flex flex-col gap-2 px-0 py-1.5 text-[11px] font-normal leading-snug"
};
var APPEARANCE_NAME = {
  default: "min-w-0 flex-1 wrap-break-word text-xs font-semibold leading-snug normal-case tracking-normal text-zinc-100",
  divider: "min-w-0 flex-1 wrap-break-word text-[11px] font-normal leading-snug normal-case tracking-normal text-zinc-400"
};
var APPEARANCE_ICON = {
  default: "text-zinc-400",
  divider: "text-zinc-500"
};
var APPEARANCE_VALUE = {
  default: "min-w-14 whitespace-nowrap text-right text-xs leading-none font-semibold text-zinc-100",
  divider: "min-w-14 whitespace-nowrap text-right font-semibold text-zinc-50"
};
var APPEARANCE_UNIT = {
  default: "whitespace-nowrap text-right text-zinc-300",
  divider: "whitespace-nowrap text-right text-zinc-400"
};
var APPEARANCE_SLIDER_PAD = {
  default: "pb-2",
  divider: "pb-1.5"
};
var TRNParameterSlider = ({
  name,
  nameTitle,
  nameTrailingSlot,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueFormatter,
  throttleMs = 500,
  animateExternalValueChange = true,
  animationDurationMs = 220,
  animationEase = "power2.out",
  unit,
  icon,
  className = "",
  sliderClassName = "",
  disabled = false,
  appearance = "default",
  valueScrubEnabled = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);
  const pendingValueRef = useRef(null);
  const lastEmitAtRef = useRef(0);
  const localValueRef = useRef(value);
  const valueTweenStateRef = useRef(null);
  const valueScrubRef = useRef(null);
  useEffect(() => {
    localValueRef.current = localValue;
  }, [localValue]);
  useEffect(() => {
    const current = localValueRef.current;
    if (Math.abs(value - current) <= Number.EPSILON) {
      return;
    }
    if (pendingValueRef.current != null) {
      return;
    }
    if (valueTweenStateRef.current != null) {
      gsap.killTweensOf(valueTweenStateRef.current);
      valueTweenStateRef.current = null;
    }
    if (!animateExternalValueChange || animationDurationMs <= 0) {
      setLocalValue(value);
      localValueRef.current = value;
      return;
    }
    const tweenState = { value: current };
    valueTweenStateRef.current = tweenState;
    gsap.to(tweenState, {
      value,
      duration: Math.max(0.05, animationDurationMs / 1e3),
      ease: animationEase,
      onUpdate: () => {
        localValueRef.current = tweenState.value;
        setLocalValue(tweenState.value);
      },
      onComplete: () => {
        localValueRef.current = value;
        setLocalValue(value);
        valueTweenStateRef.current = null;
      }
    });
  }, [animateExternalValueChange, animationDurationMs, animationEase, value]);
  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
      if (valueTweenStateRef.current != null) {
        gsap.killTweensOf(valueTweenStateRef.current);
        valueTweenStateRef.current = null;
      }
    };
  }, []);
  const emitNow = (nextValue) => {
    onChange(nextValue);
    lastEmitAtRef.current = Date.now();
  };
  const flushThrottle = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingValueRef.current != null) {
      const pending = pendingValueRef.current;
      pendingValueRef.current = null;
      emitNow(pending);
    }
  };
  const commitLocalAndScheduleEmit = (rawNext) => {
    const stepped = snapScalarToStep(rawNext, step, min, max);
    setLocalValue(stepped);
    localValueRef.current = stepped;
    if (throttleMs <= 0) {
      pendingValueRef.current = null;
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      emitNow(stepped);
      return;
    }
    const now = Date.now();
    const elapsed = now - lastEmitAtRef.current;
    if (lastEmitAtRef.current === 0 || elapsed >= throttleMs) {
      pendingValueRef.current = null;
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      emitNow(stepped);
      return;
    }
    pendingValueRef.current = stepped;
    if (timerRef.current == null) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (pendingValueRef.current == null) {
          return;
        }
        const pending = pendingValueRef.current;
        pendingValueRef.current = null;
        emitNow(pending);
      }, Math.max(0, throttleMs - elapsed));
    }
  };
  const onValueScrubPointerDown = (e) => {
    if (disabled || !valueScrubEnabled || e.button !== 0) {
      return;
    }
    flushThrottle();
    e.currentTarget.setPointerCapture(e.pointerId);
    valueScrubRef.current = {
      pointerId: e.pointerId,
      originY: e.clientY,
      originValue: localValueRef.current,
      active: false
    };
  };
  const onValueScrubPointerMove = (e) => {
    const s = valueScrubRef.current;
    if (s == null || e.pointerId !== s.pointerId) {
      return;
    }
    const dy = s.originY - e.clientY;
    if (!s.active) {
      if (Math.abs(dy) < VALUE_SCRUB_THRESHOLD_PX) {
        return;
      }
      s.active = true;
      e.preventDefault();
    }
    const range = max - min;
    const fine = e.shiftKey ? 1.35 : 1;
    const deltaVal = range > 0 ? dy / 140 * range / fine : 0;
    const raw = s.originValue + deltaVal;
    commitLocalAndScheduleEmit(raw);
  };
  const endValueScrub = (e) => {
    const s = valueScrubRef.current;
    if (s == null || e.pointerId !== s.pointerId) {
      return;
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
    }
    valueScrubRef.current = null;
    flushThrottle();
  };
  const displayValue = valueFormatter != null ? valueFormatter(localValue) : localValue > 0 ? `+${localValue}` : `${localValue}`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: twMerge(
        APPEARANCE_ROOT[appearance],
        disabled && "opacity-50",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "group flex flex-row items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-row items-start gap-2", children: [
            icon != null ? /* @__PURE__ */ jsx(
              "div",
              {
                className: twMerge(
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-start font-bold text-left",
                  APPEARANCE_ICON[appearance]
                ),
                children: icon
              }
            ) : null,
            /* @__PURE__ */ jsx("div", { className: twMerge(APPEARANCE_NAME[appearance]), title: nameTitle, children: name }),
            nameTrailingSlot != null ? /* @__PURE__ */ jsx("div", { className: "inline-flex shrink-0 items-center", children: nameTrailingSlot }) : null
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: twMerge(
                "flex shrink-0 flex-row items-center justify-end gap-2",
                valueScrubEnabled && !disabled && "cursor-ns-resize touch-none select-none"
              ),
              title: valueScrubEnabled && !disabled ? "Drag vertically to adjust; Shift for finer steps" : void 0,
              onPointerDown: valueScrubEnabled && !disabled ? onValueScrubPointerDown : void 0,
              onPointerMove: valueScrubEnabled && !disabled ? onValueScrubPointerMove : void 0,
              onPointerUp: valueScrubEnabled && !disabled ? endValueScrub : void 0,
              onPointerCancel: valueScrubEnabled && !disabled ? endValueScrub : void 0,
              children: [
                /* @__PURE__ */ jsx("span", { className: twMerge(APPEARANCE_VALUE[appearance]), children: displayValue }),
                unit != null ? /* @__PURE__ */ jsx("span", { className: twMerge(APPEARANCE_UNIT[appearance]), children: unit }) : null
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          TRNRangeSlider,
          {
            className: twMerge(
              "min-w-0 w-full [&_input:focus]:outline-none [&_input:focus-visible]:outline-none",
              APPEARANCE_SLIDER_PAD[appearance],
              sliderClassName
            ),
            min,
            max,
            step,
            value: localValue,
            disabled,
            onChange: (event) => {
              const nextValue = Number(event.currentTarget.value);
              commitLocalAndScheduleEmit(nextValue);
            }
          }
        )
      ]
    }
  );
};
function TRNPresetGroup({
  title,
  presets,
  value,
  onSelect,
  icon,
  className = "",
  titleClassName = "",
  listClassName = "",
  buttonClassName = "",
  presetGridSingleRow = false,
  presetGridColumns,
  appearance = "default",
  presetLabelFormatter
}) {
  const roundedValue = Number.isFinite(value) ? Math.round(value) : value;
  const fixedColumnCount = !presetGridSingleRow && presetGridColumns != null && Number.isFinite(presetGridColumns) && presetGridColumns > 0 ? Math.floor(presetGridColumns) : null;
  return /* @__PURE__ */ jsx("div", { className: `mt-2 pt-1 ${className}`, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsxs(
      "span",
      {
        className: twMerge(
          "inline-flex items-center gap-1.5 px-2 text-xs font-semibold normal-case tracking-normal text-zinc-100",
          appearance === "divider" && "px-0 text-[11px] font-normal text-zinc-400 [&_svg]:text-zinc-500",
          titleClassName
        ),
        children: [
          icon != null ? icon : null,
          /* @__PURE__ */ jsx("span", { children: title })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: twMerge(
          "grid min-w-0 gap-1.5 px-2 pb-2",
          appearance === "divider" && "px-0",
          listClassName
        ),
        style: {
          gridTemplateColumns: presetGridSingleRow ? `repeat(${Math.max(1, presets.length)}, minmax(0, 1fr))` : fixedColumnCount != null ? `repeat(${fixedColumnCount}, minmax(0, 1fr))` : "repeat(auto-fit, minmax(3rem, 1fr))"
        },
        children: presets.map((preset) => /* @__PURE__ */ jsx(
          TRNButton,
          {
            className: twMerge(
              "min-w-0 w-full max-w-full",
              buttonClassName
            ),
            size: "compact",
            selected: roundedValue === preset,
            onClick: () => onSelect(preset),
            children: presetLabelFormatter != null ? presetLabelFormatter(preset) : preset
          },
          preset
        ))
      }
    )
  ] }) });
}

// src/trnIconPulseTypes.ts
var TRN_ICON_PULSE_INTENSITY_PRESETS = [
  "subtle",
  "normal",
  "strong"
];
var TRN_ICON_PULSE_ANIMATION_PRESETS = [
  "smooth",
  "elastic",
  "back",
  "snappy"
];
var DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX = "#4ade80";
function normalizeTrnIconPulseAnimationPreset(value) {
  if (value === "smooth" || value === "elastic" || value === "back" || value === "snappy") {
    return value;
  }
  return "smooth";
}
function normalizeTrnIconPulseIntensityPreset(value, fallback = "normal") {
  if (value === "subtle" || value === "normal" || value === "strong") {
    return value;
  }
  return fallback;
}

// src/trnIconPulsePresets.ts
var INTENSITY = {
  subtle: {
    peakScale: 1.06,
    peakRotation: 4,
    midRotation: -3,
    d1: 0.14,
    d2: 0.07,
    d3: 0.14
  },
  normal: {
    peakScale: 1.12,
    peakRotation: 9,
    midRotation: -6,
    d1: 0.2,
    d2: 0.11,
    d3: 0.2
  },
  strong: {
    peakScale: 1.18,
    peakRotation: 13,
    midRotation: -9,
    d1: 0.26,
    d2: 0.14,
    d3: 0.26
  }
};
function clampHueDeg(h) {
  let x = h % 360;
  if (x < 0) {
    x += 360;
  }
  return x;
}
function parseHexToRgb(hexInput) {
  const s = hexInput.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) {
    const r = parseInt(s.slice(1, 3), 16) / 255;
    const g = parseInt(s.slice(3, 5), 16) / 255;
    const b = parseInt(s.slice(5, 7), 16) / 255;
    return { r, g, b };
  }
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const r = parseInt(s[1] + s[1], 16) / 255;
    const g = parseInt(s[2] + s[2], 16) / 255;
    const b = parseInt(s[3] + s[3], 16) / 255;
    return { r, g, b };
  }
  return null;
}
function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s, l };
}
function pulseHueFromPeakHex(peakColorHex) {
  const rgb = parseHexToRgb(peakColorHex);
  if (rgb == null) {
    return 142;
  }
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (s < 0.06) {
    return 210;
  }
  return clampHueDeg(h);
}
function normalizePeakHexForTimeline(peakColorHex) {
  const rgb = parseHexToRgb(peakColorHex);
  if (rgb == null) {
    return DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX;
  }
  const s = peakColorHex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) {
    return s.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const r = s[1] + s[1];
    const g = s[2] + s[2];
    const b = s[3] + s[3];
    return `#${r}${g}${b}`.toLowerCase();
  }
  return DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX;
}
var ANIMATION_EASE = {
  smooth: {
    peakEase: "power2.out",
    midEase: "sine.inOut",
    returnEase: "power2.inOut"
  },
  elastic: {
    peakEase: "elastic.out(1,0.35)",
    midEase: "sine.inOut",
    returnEase: "elastic.inOut(1,0.35)"
  },
  back: {
    peakEase: "back.out(1.4)",
    midEase: "sine.inOut",
    returnEase: "back.inOut(1.4)"
  },
  snappy: {
    peakEase: "power3.out",
    midEase: "sine.inOut",
    returnEase: "power3.inOut"
  }
};
function resolveTrnIconPulseTimeline(intensity, peakColorHex, animationPreset = "smooth") {
  const i = INTENSITY[intensity] ?? INTENSITY.normal;
  const normalizedHex = normalizePeakHexForTimeline(peakColorHex);
  const pulseHue = pulseHueFromPeakHex(normalizedHex);
  const ap = normalizeTrnIconPulseAnimationPreset(animationPreset);
  const e = ANIMATION_EASE[ap] ?? ANIMATION_EASE.smooth;
  return {
    pulseHue,
    peakColorCss: normalizedHex,
    peakScale: i.peakScale,
    peakRotation: i.peakRotation,
    midRotation: i.midRotation,
    d1: i.d1,
    d2: i.d2,
    d3: i.d3,
    peakEase: e.peakEase,
    midEase: e.midEase,
    returnEase: e.returnEase
  };
}
function cssColorToNeutralHslAtPulseHue(cssColor, pulseHue) {
  const Lpct = parseCssRgbLightnessPercent(cssColor);
  if (Lpct == null) {
    return `hsl(${pulseHue}, 0%, 65%)`;
  }
  return `hsl(${pulseHue}, 0%, ${Lpct}%)`;
}
function parseCssRgbLightnessPercent(cssColor) {
  const s = cssColor.trim();
  const m = s.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/
  );
  if (m == null) {
    return null;
  }
  const r = Math.min(255, Number(m[1])) / 255;
  const g = Math.min(255, Number(m[2])) / 255;
  const b = Math.min(255, Number(m[3])) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  return Math.round(l * 1e3) / 10;
}
function displayValueStableKey(displayValue) {
  if (typeof displayValue === "string" || typeof displayValue === "number") {
    return String(displayValue);
  }
  if (displayValue == null || displayValue === false) {
    return "";
  }
  return "\uE000";
}
function useGsapIconPulseOnValueChange(iconElRef, enabled, icon, pulseKeySource, iconRestColor, pulseStyle) {
  const key = displayValueStableKey(pulseKeySource);
  const iconPresent = icon != null;
  const prevRef = useRef(null);
  const lastPulseAtRef = useRef(0);
  const iconRestColorRef = useRef(iconRestColor);
  iconRestColorRef.current = iconRestColor;
  const applyIconColorRest = (node) => {
    const c = iconRestColorRef.current;
    if (c != null && c !== "") {
      node.style.color = c;
    } else {
      node.style.removeProperty("color");
    }
  };
  useLayoutEffect(() => {
    const stopIconTween = () => {
      const node = iconElRef.current;
      if (node != null) {
        gsap.killTweensOf(node);
        const svg = node.querySelector("svg");
        if (svg != null) {
          gsap.killTweensOf(svg);
          svg.style.removeProperty("color");
        }
        gsap.set(node, { scale: 1, rotation: 0 });
        applyIconColorRest(node);
      }
    };
    if (!enabled || !iconPresent) {
      stopIconTween();
    }
    return () => {
      stopIconTween();
    };
  }, [enabled, iconPresent, iconElRef]);
  useLayoutEffect(() => {
    if (!enabled || !iconPresent) {
      return;
    }
    const el = iconElRef.current;
    if (el == null) {
      return;
    }
    const svg = el.querySelector("svg");
    if (prevRef.current === null) {
      prevRef.current = key;
      return;
    }
    if (prevRef.current === key) {
      return;
    }
    if (gsap.isTweening(el) || svg != null && gsap.isTweening(svg)) {
      prevRef.current = key;
      return;
    }
    prevRef.current = key;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const now = Date.now();
    if (now - lastPulseAtRef.current < pulseStyle.throttleMs) {
      return;
    }
    lastPulseAtRef.current = now;
    runPulseTimeline(el, svg, pulseStyle, applyIconColorRest);
  }, [enabled, iconPresent, key, iconElRef, pulseStyle]);
}
function runPulseTimeline(el, svg, pulseStyle, applyIconColorRest) {
  const t = resolveTrnIconPulseTimeline(
    pulseStyle.intensityPreset,
    pulseStyle.peakColorHex,
    pulseStyle.animationPreset
  );
  const doColor = pulseStyle.colorAnimationEnabled;
  const colorTarget = svg ?? el;
  gsap.killTweensOf(el);
  if (doColor) {
    gsap.killTweensOf(colorTarget);
  }
  let neutralHsl = "";
  if (doColor) {
    const fromColor = getComputedStyle(colorTarget).color;
    neutralHsl = cssColorToNeutralHslAtPulseHue(fromColor, t.pulseHue);
    gsap.set(colorTarget, { color: neutralHsl });
  }
  gsap.set(el, { scale: 1, rotation: 0 });
  const restoreAfterPulse = () => {
    gsap.set(el, { scale: 1, rotation: 0 });
    if (doColor) {
      if (svg != null) {
        svg.style.removeProperty("color");
      } else {
        applyIconColorRest(el);
      }
    }
    applyIconColorRest(el);
  };
  const tl = gsap.timeline({ onComplete: restoreAfterPulse });
  if (svg != null) {
    tl.fromTo(
      el,
      { scale: 1, rotation: 0 },
      {
        scale: t.peakScale,
        rotation: t.peakRotation,
        duration: t.d1,
        ease: t.peakEase,
        overwrite: "auto"
      },
      0
    );
    if (doColor) {
      tl.fromTo(
        svg,
        { color: neutralHsl },
        {
          color: t.peakColorCss,
          duration: t.d1,
          ease: t.peakEase,
          overwrite: "auto"
        },
        0
      );
    }
    tl.to(el, {
      rotation: t.midRotation,
      duration: t.d2,
      ease: t.midEase
    }).to(el, {
      scale: 1,
      rotation: 0,
      duration: t.d3,
      ease: t.returnEase
    });
    if (doColor) {
      tl.to(
        svg,
        {
          color: neutralHsl,
          duration: t.d3,
          ease: t.returnEase
        },
        "<"
      );
    }
  } else if (doColor) {
    tl.fromTo(
      el,
      { scale: 1, rotation: 0, color: neutralHsl },
      {
        scale: t.peakScale,
        rotation: t.peakRotation,
        color: t.peakColorCss,
        duration: t.d1,
        ease: t.peakEase,
        overwrite: "auto"
      }
    ).to(el, {
      rotation: t.midRotation,
      duration: t.d2,
      ease: t.midEase
    }).to(el, {
      scale: 1,
      rotation: 0,
      color: neutralHsl,
      duration: t.d3,
      ease: t.returnEase
    });
  } else {
    tl.fromTo(
      el,
      { scale: 1, rotation: 0 },
      {
        scale: t.peakScale,
        rotation: t.peakRotation,
        duration: t.d1,
        ease: t.peakEase,
        overwrite: "auto"
      }
    ).to(el, {
      rotation: t.midRotation,
      duration: t.d2,
      ease: t.midEase
    }).to(el, {
      scale: 1,
      rotation: 0,
      duration: t.d3,
      ease: t.returnEase
    });
  }
}
var DEFAULT_ICON_PULSE_THROTTLE_MS = 280;
var APPEARANCE_ROW_CLASS = {
  card: "rounded border border-zinc-700/80 px-2 py-1 text-xs font-normal leading-none ",
  ghost: "rounded-none border-0 bg-transparent px-0 py-1 text-[11px] font-normal leading-snug ",
  divider: "rounded-none border-0 border-b border-zinc-800/75 bg-transparent px-0 py-1.5 text-[11px] font-normal leading-snug "
};
var APPEARANCE_VALUE_CLASS = {
  card: "text-zinc-100",
  ghost: "text-zinc-50",
  divider: "text-zinc-50"
};
var APPEARANCE_UNIT_CLASS = {
  card: "text-zinc-300",
  ghost: "text-zinc-500",
  divider: "text-zinc-400"
};
var APPEARANCE_ICON_CLASS = {
  card: "text-zinc-400",
  ghost: "text-zinc-500",
  divider: "text-zinc-500"
};
var APPEARANCE_LABEL_WRAP_CLASS = {
  card: "",
  ghost: "text-zinc-400",
  divider: "text-zinc-400"
};
var TRNParameter = ({
  name,
  value,
  gauge,
  unit,
  icon,
  className = "",
  appearance = "card",
  nameColumnLayout = "fixed",
  rowSpan = "full",
  hint,
  hintPanelClassName = "",
  iconSlotClassName,
  iconSlotStyle,
  valueColumnLayout = "fixed",
  valueTruncate = true,
  unitColumnClassName = "w-4",
  valueTextColumnClassName,
  positiveSignMode = "always",
  iconPulseOnValueChange = false,
  iconPulseThrottleMs = DEFAULT_ICON_PULSE_THROTTLE_MS,
  iconPulseIntensityPreset = "normal",
  iconPulsePeakColorHex = DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX,
  iconPulseAnimationPreset = "smooth",
  iconPulseColorAnimationEnabled = true,
  iconPulseTriggerKey
}) => {
  const iconWrapRef = useRef(null);
  const iconPulseStyle = useMemo(
    () => ({
      throttleMs: iconPulseThrottleMs,
      intensityPreset: iconPulseIntensityPreset,
      peakColorHex: iconPulsePeakColorHex,
      animationPreset: iconPulseAnimationPreset,
      colorAnimationEnabled: iconPulseColorAnimationEnabled
    }),
    [
      iconPulseAnimationPreset,
      iconPulseColorAnimationEnabled,
      iconPulsePeakColorHex,
      iconPulseIntensityPreset,
      iconPulseThrottleMs
    ]
  );
  const nameColumnClassName = nameColumnLayout === "auto" ? rowSpan === "hug" ? "flex w-fit shrink-0 flex-row items-center gap-2" : "flex w-fit max-w-[50%] shrink-0 flex-row items-center gap-2" : "flex w-[60px] shrink-0 flex-row items-center gap-2";
  const displayValue = useMemo(() => {
    const wantPlus = positiveSignMode === "always";
    if (typeof value === "number") {
      if (wantPlus) {
        return value > 0 ? `+${value}` : `${value}`;
      }
      return `${value}`;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      if (wantPlus && trimmed.length > 0 && Number.isFinite(numeric) && numeric > 0 && !trimmed.startsWith("+")) {
        return `+${trimmed}`;
      }
    }
    return value;
  }, [positiveSignMode, value]);
  const iconPulseKeySource = iconPulseTriggerKey !== void 0 ? iconPulseTriggerKey : displayValue;
  const iconRestColor = useMemo(() => {
    if (iconSlotStyle == null || typeof iconSlotStyle !== "object") {
      return void 0;
    }
    const c = iconSlotStyle.color;
    return typeof c === "string" && c.length > 0 ? c : void 0;
  }, [iconSlotStyle]);
  useGsapIconPulseOnValueChange(
    iconWrapRef,
    iconPulseOnValueChange,
    icon,
    iconPulseKeySource,
    iconRestColor,
    iconPulseStyle
  );
  const valueSlotTight = valueColumnLayout === "auto" && valueTextColumnClassName != null && valueTextColumnClassName.trim() !== "";
  const rowWidthClass = rowSpan === "hug" ? "w-fit max-w-full " : "w-full ";
  const rowLayoutClass = valueSlotTight && gauge != null ? `flex ${rowWidthClass}min-w-0 flex-row items-center gap-2 ` : `flex ${rowWidthClass}flex-row items-center gap-2 justify-between `;
  const valueBlockClassName = valueColumnLayout === "auto" ? valueSlotTight ? "flex shrink-0 flex-row items-center gap-2" : valueTruncate ? "flex min-w-0 flex-1 flex-row items-center gap-2" : "flex shrink-0 flex-row items-center gap-2" : valueTruncate ? "flex w-[100px] shrink-0 flex-row items-center gap-2" : "flex w-fit max-w-none shrink-0 flex-row items-center gap-2";
  const valueToneClass = APPEARANCE_VALUE_CLASS[appearance];
  const unitToneClass = APPEARANCE_UNIT_CLASS[appearance];
  const iconToneClass = APPEARANCE_ICON_CLASS[appearance];
  const labelWrapToneClass = APPEARANCE_LABEL_WRAP_CLASS[appearance];
  const valueSpanClassName = (valueTruncate ? "min-w-0 truncate " : "shrink-0 ") + `whitespace-nowrap text-right font-semibold ${valueToneClass} ` + (valueSlotTight ? `${(valueTextColumnClassName ?? "").trim()} shrink-0` : unit != null ? valueTruncate ? "flex-1" : "shrink-0" : "w-full");
  const rowChromeClass = APPEARANCE_ROW_CLASS[appearance];
  const row = /* @__PURE__ */ jsxs(
    "div",
    {
      className: rowLayoutClass + rowChromeClass + className + (hint != null ? " cursor-help" : ""),
      children: [
        /* @__PURE__ */ jsxs("div", { className: nameColumnClassName, children: [
          icon != null ? /* @__PURE__ */ jsx(
            "div",
            {
              ref: iconWrapRef,
              className: "inline-flex h-4 w-4 origin-center items-center justify-start font-bold text-left " + (iconSlotClassName != null && iconSlotClassName.trim().length > 0 ? iconSlotClassName : iconToneClass),
              style: iconSlotStyle,
              children: icon
            }
          ) : null,
          /* @__PURE__ */ jsx(
            "div",
            {
              className: (nameColumnLayout === "auto" ? "min-w-0 max-w-full w-fit " : "") + labelWrapToneClass,
              children: name
            }
          )
        ] }),
        gauge != null ? /* @__PURE__ */ jsx("div", { className: "flex min-w-0 flex-1 flex-row items-center gap-2", children: gauge }) : null,
        /* @__PURE__ */ jsxs("div", { className: valueBlockClassName, children: [
          /* @__PURE__ */ jsx("span", { className: valueSpanClassName, children: displayValue }),
          unit != null ? /* @__PURE__ */ jsx(
            "span",
            {
              className: `inline-flex shrink-0 items-center justify-end whitespace-nowrap text-right ${unitToneClass} ` + unitColumnClassName,
              children: typeof unit === "string" && unit.trim() === "" ? "\xA0" : unit
            }
          ) : null
        ] })
      ]
    }
  );
  if (hint != null) {
    const tooltipWidthClass = rowSpan === "hug" ? "w-fit max-w-full min-w-0" : "w-full min-w-0";
    const triggerWidthClass = rowSpan === "hug" ? "w-fit max-w-full" : "w-full";
    return /* @__PURE__ */ jsx(
      TRNTooltip,
      {
        className: tooltipWidthClass,
        triggerClassName: `!flex h-auto ${triggerWidthClass} min-w-0 cursor-help border-0 bg-transparent p-0 text-left font-[inherit] text-inherit`,
        trigger: row,
        content: /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap text-left leading-relaxed text-zinc-100", children: hint }),
        panelClassName: "!max-w-xl border-zinc-600/90 bg-zinc-950/98 px-3 py-2 text-[11px] leading-snug shadow-xl " + hintPanelClassName,
        placement: "top-start",
        openDelayMs: 180,
        disableHoverFx: true
      }
    );
  }
  return row;
};
var DEFAULT_THROTTLE_MS = 280;
function TrnLiveDataPulseIcon(props) {
  const {
    children,
    pulseTriggerKey = null,
    enabled = true,
    throttleMs = DEFAULT_THROTTLE_MS,
    intensityPreset = "normal",
    peakColorHex = DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX,
    animationPreset = "smooth",
    colorAnimationEnabled = true,
    className
  } = props;
  const wrapRef = useRef(null);
  const pulseActive = enabled && pulseTriggerKey != null && pulseTriggerKey !== "";
  const pulseStyle = useMemo(
    () => ({
      throttleMs,
      intensityPreset,
      peakColorHex,
      animationPreset,
      colorAnimationEnabled
    }),
    [animationPreset, colorAnimationEnabled, intensityPreset, peakColorHex, throttleMs]
  );
  useGsapIconPulseOnValueChange(
    wrapRef,
    pulseActive,
    children,
    pulseTriggerKey,
    void 0,
    pulseStyle
  );
  return /* @__PURE__ */ jsx("div", { ref: wrapRef, className, children });
}
function TRNTransientStatusBadge({
  state,
  message,
  pendingLabel = "Pending",
  okLabel = "OK",
  errorLabel = "Error",
  autoHideMs = 2e3,
  errorAutoHideMs = 12e3,
  className = ""
}) {
  const [uiState, setUiState] = useState(state);
  const uiStateRef = useRef(uiState);
  const badgeRef = useRef(null);
  const hideTimerRef = useRef(null);
  useEffect(() => {
    uiStateRef.current = uiState;
  }, [uiState]);
  useEffect(() => {
    const animateIn = () => {
      if (badgeRef.current == null) {
        return;
      }
      gsap.fromTo(
        badgeRef.current,
        { autoAlpha: 0, y: -4 },
        { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }
      );
    };
    const animateOut = (onComplete) => {
      if (badgeRef.current == null) {
        onComplete?.();
        return;
      }
      gsap.to(badgeRef.current, {
        autoAlpha: 0,
        y: -4,
        duration: 0.2,
        ease: "power2.in",
        onComplete
      });
    };
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    const next = state;
    const current = uiStateRef.current;
    const scheduleAutoHide = () => {
      if (next !== "ok" && next !== "error") {
        return;
      }
      const ms = next === "error" ? errorAutoHideMs : autoHideMs;
      hideTimerRef.current = setTimeout(() => {
        animateOut(() => {
          setUiState("idle");
        });
      }, ms);
    };
    if (next === "idle") {
      if (current !== "idle") {
        animateOut(() => {
          setUiState("idle");
        });
      }
      return () => {
        if (hideTimerRef.current != null) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
      };
    }
    if (current === "idle") {
      setUiState(next);
      requestAnimationFrame(() => {
        animateIn();
        scheduleAutoHide();
      });
    } else {
      animateOut(() => {
        setUiState(next);
        requestAnimationFrame(() => {
          animateIn();
          scheduleAutoHide();
        });
      });
    }
    return () => {
      if (badgeRef.current != null) {
        gsap.killTweensOf(badgeRef.current);
      }
      if (hideTimerRef.current != null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [autoHideMs, errorAutoHideMs, state]);
  if (uiState === "idle") {
    return null;
  }
  const showDetail = Boolean(message) && (uiState === "pending" || uiState === "error");
  return /* @__PURE__ */ jsxs(
    "span",
    {
      ref: badgeRef,
      className: `inline-flex items-center gap-1.5 pr-1 text-[11px] font-semibold ${uiState === "pending" ? "text-amber-300" : uiState === "ok" ? "text-emerald-300" : "text-rose-300"} ${className}`,
      title: uiState === "pending" || uiState === "error" ? message : void 0,
      children: [
        uiState === "pending" ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin", "aria-hidden": true, strokeWidth: 3 }) : uiState === "ok" ? /* @__PURE__ */ jsx(CircleCheckBig, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 3 }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5", "aria-hidden": true }),
        /* @__PURE__ */ jsx("span", { children: uiState === "pending" ? pendingLabel : uiState === "ok" ? okLabel : errorLabel }),
        showDetail ? /* @__PURE__ */ jsx("span", { className: "max-w-[280px] truncate font-normal text-zinc-100/80", children: message }) : null
      ]
    }
  );
}
var SCROLL_EDGE_EPS_PX = 2;
var SCROLL_STATE_IDLE = {
  canScrollUp: false,
  canScrollDown: false,
  canScrollLeft: false,
  canScrollRight: false
};
function scrollStateEqual(a, b) {
  return a.canScrollUp === b.canScrollUp && a.canScrollDown === b.canScrollDown && a.canScrollLeft === b.canScrollLeft && a.canScrollRight === b.canScrollRight;
}
function getScrollState(el) {
  if (!el) {
    return SCROLL_STATE_IDLE;
  }
  const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
  const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
  const canScrollUp = el.scrollTop > SCROLL_EDGE_EPS_PX;
  const canScrollDown = el.scrollTop < maxScrollTop - SCROLL_EDGE_EPS_PX;
  const canScrollLeft = el.scrollLeft > SCROLL_EDGE_EPS_PX;
  const canScrollRight = el.scrollLeft < maxScrollLeft - SCROLL_EDGE_EPS_PX;
  return { canScrollUp, canScrollDown, canScrollLeft, canScrollRight };
}
function TRNScrollableEdgeHints({
  children,
  hideScrollbar = true,
  edgeSizePx = 22,
  showHints = true,
  className,
  scrollClassName,
  ...rest
}) {
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef(SCROLL_STATE_IDLE);
  const [state, setState] = useState(SCROLL_STATE_IDLE);
  const edgeStyle = useMemo(
    () => ({
      ["--trn-edge-size"]: `${Math.max(8, Math.floor(edgeSizePx))}px`
    }),
    [edgeSizePx]
  );
  const update = React.useCallback(() => {
    const next = getScrollState(scrollRef.current);
    if (scrollStateEqual(stateRef.current, next)) {
      return;
    }
    stateRef.current = next;
    setState(next);
  }, []);
  const scheduleUpdate = React.useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      update();
    });
  }, [update]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    scheduleUpdate();
    const onScroll = () => scheduleUpdate();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => scheduleUpdate());
    ro.observe(el);
    const mo = new MutationObserver(() => scheduleUpdate());
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      mo.disconnect();
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scheduleUpdate]);
  const topHintVisible = showHints && state.canScrollUp;
  const bottomHintVisible = showHints && state.canScrollDown;
  const leftHintVisible = showHints && state.canScrollLeft;
  const rightHintVisible = showHints && state.canScrollRight;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: ["relative flex min-h-0 min-w-0 flex-col", className].filter(Boolean).join(" "),
      style: edgeStyle,
      ...rest,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: scrollRef,
            className: [
              "min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain outline-none",
              hideScrollbar ? "scrollbar-hide" : void 0,
              scrollClassName
            ].filter(Boolean).join(" "),
            children
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: [
              "pointer-events-none absolute inset-x-0 top-0 h-(--trn-edge-size)",
              "bg-linear-to-b from-black/55 to-transparent",
              topHintVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-150"
            ].join(" ")
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: [
              "pointer-events-none absolute inset-x-0 bottom-0 h-(--trn-edge-size)",
              "bg-linear-to-t from-black/55 to-transparent",
              bottomHintVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-150"
            ].join(" ")
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: [
              "pointer-events-none absolute inset-y-0 left-0 w-(--trn-edge-size)",
              "bg-linear-to-r from-black/55 to-transparent",
              leftHintVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-150"
            ].join(" ")
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: [
              "pointer-events-none absolute inset-y-0 right-0 w-(--trn-edge-size)",
              "bg-linear-to-l from-black/55 to-transparent",
              rightHintVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-150"
            ].join(" ")
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: [
              "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-center",
              topHintVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-150"
            ].join(" "),
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: [
                  "mt-0.5 flex h-(--trn-edge-size) items-center justify-center",
                  "rounded-full border border-white/12 bg-black/35 px-2",
                  "text-zinc-50/85 drop-shadow-[0_3px_16px_rgba(0,0,0,0.85)]",
                  "motion-safe:animate-[trnScrollHintUp_1.15s_ease-in-out_infinite]"
                ].join(" "),
                children: /* @__PURE__ */ jsx(ArrowUpDown, { size: 16 })
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: [
              "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center",
              bottomHintVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-150"
            ].join(" "),
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: [
                  "mb-0.5 flex h-(--trn-edge-size) items-center justify-center",
                  "rounded-full border border-white/12 bg-black/35 px-2",
                  "text-zinc-50/85 drop-shadow-[0_3px_16px_rgba(0,0,0,0.85)]",
                  "motion-safe:animate-[trnScrollHintDown_1.15s_ease-in-out_infinite]"
                ].join(" "),
                children: /* @__PURE__ */ jsx(ArrowUpDown, { size: 16 })
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: [
              "pointer-events-none absolute inset-y-0 left-0 flex items-center justify-start",
              leftHintVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-150"
            ].join(" "),
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: [
                  "ml-0.5 flex w-(--trn-edge-size) items-center justify-center",
                  "rounded-full border border-white/12 bg-black/35 py-2",
                  "text-zinc-50/85 drop-shadow-[0_3px_16px_rgba(0,0,0,0.85)]",
                  "motion-safe:animate-[trnScrollHintLeft_1.15s_ease-in-out_infinite]"
                ].join(" "),
                children: /* @__PURE__ */ jsx(ArrowLeftRight, { size: 16 })
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": "true",
            className: [
              "pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end",
              rightHintVisible ? "opacity-100" : "opacity-0",
              "transition-opacity duration-150"
            ].join(" "),
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: [
                  "mr-0.5 flex w-(--trn-edge-size) items-center justify-center",
                  "rounded-full border border-white/12 bg-black/35 py-2",
                  "text-zinc-50/85 drop-shadow-[0_3px_16px_rgba(0,0,0,0.85)]",
                  "motion-safe:animate-[trnScrollHintRight_1.15s_ease-in-out_infinite]"
                ].join(" "),
                children: /* @__PURE__ */ jsx(ArrowLeftRight, { size: 16 })
              }
            )
          }
        )
      ]
    }
  );
}
function TRNToolbar(props) {
  const {
    children,
    className = "",
    density = "md",
    tone = "subtle",
    sticky = false,
    stickyTop = 0,
    wrap = true,
    style,
    ...divProps
  } = props;
  const densityClass = density === "sm" ? "min-h-8 px-2 py-1" : "min-h-9 px-2.5 py-1.5";
  const toneClass = tone === "default" ? "border border-zinc-700/80 bg-zinc-950/95" : "border border-zinc-700/80 bg-zinc-900/80";
  const wrapClass = wrap ? "flex-wrap" : "flex-nowrap";
  const stickyClass = sticky ? "sticky z-10" : "";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "flex w-full items-center gap-2 rounded-md " + densityClass + " " + toneClass + " " + wrapClass + " " + stickyClass + (className.length > 0 ? ` ${className}` : ""),
      style: {
        top: sticky ? stickyTop : void 0,
        ...style
      },
      ...divProps,
      children
    }
  );
}
function TRNToolbarGroup(props) {
  const { children, align = "start", gap = "sm", className = "", ...divProps } = props;
  const gapClass = gap === "xs" ? "gap-1" : gap === "md" ? "gap-3" : "gap-2";
  const alignClass = align === "end" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "inline-flex min-w-0 items-center " + gapClass + " " + alignClass + (className.length > 0 ? ` ${className}` : ""),
      ...divProps,
      children
    }
  );
}
function TRNToolbarSpacer(props) {
  const { className = "", ...divProps } = props;
  return /* @__PURE__ */ jsx("div", { className: "min-w-2 flex-1 " + className, ...divProps });
}
function TRNToolbarDivider(props) {
  const { vertical = true, className = "", ...divProps } = props;
  return /* @__PURE__ */ jsx("div", { className: (vertical ? "h-5 w-px" : "h-px w-full") + " shrink-0 bg-zinc-700/80 " + className, ...divProps });
}
function useScrollbarEdgeReveal(enabled, options) {
  const edgePx = options?.edgePx ?? 14;
  const hideDelayMs = options?.hideDelayMs ?? 320;
  const ref = useRef(null);
  const hideTimerRef = useRef(null);
  const [active, setActive] = useState(false);
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);
  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setActive(false);
      hideTimerRef.current = null;
    }, hideDelayMs);
  }, [clearHideTimer, hideDelayMs]);
  const onMouseMove = useCallback(
    (event) => {
      if (!enabled) {
        return;
      }
      clearHideTimer();
      const el = ref.current;
      if (el == null) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const nearRight = rect.right - event.clientX <= edgePx;
      setActive(nearRight);
    },
    [enabled, edgePx, clearHideTimer]
  );
  const onMouseLeave = useCallback(() => {
    if (!enabled) {
      return;
    }
    scheduleHide();
  }, [enabled, scheduleHide]);
  const onMouseEnter = useCallback(() => {
    if (!enabled) {
      return;
    }
    clearHideTimer();
  }, [enabled, clearHideTimer]);
  useEffect(() => {
    if (!enabled) {
      setActive(false);
      clearHideTimer();
    }
  }, [enabled, clearHideTimer]);
  useEffect(() => () => clearHideTimer(), [clearHideTimer]);
  const revealClassName = enabled ? `scrollbar-edge-reveal ${active ? "scrollbar-edge-reveal--active" : ""}`.trim() : "";
  return {
    ref,
    revealClassName,
    onMouseMove,
    onMouseLeave,
    onMouseEnter
  };
}
var EPSILON_PX = 2;
function useScrollOverflowHint(enabled) {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const update = useCallback(() => {
    const el = scrollRef.current;
    if (el == null || !enabled) {
      setCanScrollDown(false);
      setCanScrollUp(false);
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - EPSILON_PX);
    setCanScrollUp(scrollTop > EPSILON_PX);
  }, [enabled]);
  useEffect(() => {
    if (!enabled) {
      setCanScrollDown(false);
      setCanScrollUp(false);
      return;
    }
    const el = scrollRef.current;
    const inner = contentRef.current;
    if (el == null) {
      return;
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(() => {
      update();
    });
    ro.observe(el);
    if (inner != null) {
      ro.observe(inner);
    }
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [enabled, update]);
  return {
    scrollRef,
    contentRef,
    canScrollDown,
    canScrollUp
  };
}
var FLOATING_EXPAND_ICON_PX = 16;
var INNER_EDGE_RESIZE_STRIP_PX = 4;
function clamp4(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
function parsePx(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.endsWith("px")) {
      const parsed = Number.parseFloat(trimmed.slice(0, -2));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}
function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") {
    return true;
  }
  return target.isContentEditable;
}
function matchHotkey(evt, hotkey) {
  const parts = hotkey.split("+").map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (parts.length === 0) {
    return false;
  }
  const key = parts[parts.length - 1];
  const needCtrl = parts.includes("ctrl");
  const needMeta = parts.includes("meta") || parts.includes("cmd");
  const needAlt = parts.includes("alt");
  const needShift = parts.includes("shift");
  if (evt.ctrlKey !== needCtrl) {
    return false;
  }
  if (evt.metaKey !== needMeta) {
    return false;
  }
  if (evt.altKey !== needAlt) {
    return false;
  }
  if (evt.shiftKey !== needShift) {
    return false;
  }
  return evt.key.toLowerCase() === key;
}
function readPersistedSidePanelState(persistKey, resolvedMinWidth, resolvedMaxWidth, resolvedDefaultWidth, defaultCollapsed) {
  const fallback = {
    width: resolvedDefaultWidth,
    collapsed: defaultCollapsed
  };
  if (persistKey == null || persistKey.trim().length === 0) {
    return fallback;
  }
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(persistKey);
    if (raw == null) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    const width = typeof parsed.width === "number" ? clamp4(parsed.width, resolvedMinWidth, resolvedMaxWidth) : resolvedDefaultWidth;
    const collapsed = typeof parsed.collapsed === "boolean" ? parsed.collapsed : defaultCollapsed;
    return { width, collapsed };
  } catch {
    return fallback;
  }
}
function getVariantPreset(variant, mode) {
  if (variant === "inspector") {
    return {
      defaultWidth: mode === "overlay" ? 360 : 340,
      minWidth: 260,
      maxWidth: 680,
      collapsedWidth: 48,
      backdrop: mode === "overlay" ? "blur" : "none",
      glass: mode === "overlay"
    };
  }
  if (variant === "settings") {
    return {
      defaultWidth: mode === "overlay" ? 320 : 300,
      minWidth: 220,
      maxWidth: 520,
      collapsedWidth: 44,
      backdrop: mode === "overlay" ? "dim" : "none",
      glass: false
    };
  }
  return {
    defaultWidth: 320,
    minWidth: 220,
    maxWidth: 560,
    collapsedWidth: 44,
    backdrop: "none",
    glass: false
  };
}
function TRNSidePanel(props) {
  const {
    children,
    side = "right",
    mode = "docked",
    variant = "default",
    title,
    subtitle,
    collapsedFloatingLabel,
    actions,
    footer,
    showDimensionsFooter = false,
    className = "",
    contentClassName = "",
    contentEdgeRevealScrollbar = false,
    contentScrollOverflowHint = true,
    contentScrollbarEdgePx,
    contentScrollbarHideDelayMs,
    headerClassName = "",
    footerClassName = "",
    width,
    defaultWidth,
    minWidth,
    maxWidth,
    onWidthChange,
    persistKey,
    resizable = true,
    collapsible = true,
    collapsed,
    defaultCollapsed = false,
    collapsedWidth,
    collapsedPresentation = "rail",
    collapsedFloatingAnchor,
    collapsedFloatingSize = FLOATING_EXPAND_ICON_PX,
    collapsedFloatingZIndex,
    showInnerEdgeCollapse = true,
    innerEdgeCollapseZonePx = 12,
    innerEdgeCollapseHideDelayMs = 220,
    onToggle,
    onCollapsedChange,
    animated = true,
    animationDurationMs = 440,
    animationEasing = "cubic-bezier(0.22, 1, 0.36, 1)",
    glass,
    glassOpacity = 0.72,
    glassBlurPx = 12,
    glassBorderOpacity = 0.35,
    overlayZIndex = 30,
    overlayOffset,
    backdrop,
    closeOnOutsideClick = false,
    closeOnEsc = true,
    toggleHotkey = null,
    toggleHotkeys,
    showCloseButton = false,
    onRequestClose
  } = props;
  const preset = getVariantPreset(variant, mode);
  const resolvedDefaultWidth = defaultWidth ?? preset.defaultWidth;
  const resolvedMinWidth = minWidth ?? preset.minWidth;
  const resolvedMaxWidth = maxWidth ?? preset.maxWidth;
  const resolvedCollapsedWidth = collapsedWidth ?? preset.collapsedWidth;
  const resolvedBackdrop = backdrop ?? preset.backdrop;
  const resolvedGlass = glass ?? preset.glass;
  const isWidthControlled = width != null;
  const isCollapsedControlled = collapsed != null;
  const [persistSlice, setPersistSlice] = useState(() => {
    const fromDisk = readPersistedSidePanelState(
      persistKey,
      resolvedMinWidth,
      resolvedMaxWidth,
      resolvedDefaultWidth,
      defaultCollapsed
    );
    return {
      width: isWidthControlled ? resolvedDefaultWidth : fromDisk.width,
      collapsed: isCollapsedControlled ? defaultCollapsed : fromDisk.collapsed
    };
  });
  const activeWidth = isWidthControlled ? width : persistSlice.width;
  const clampedWidth = clamp4(activeWidth, resolvedMinWidth, resolvedMaxWidth);
  const effectiveCollapsed = isCollapsedControlled ? collapsed : persistSlice.collapsed;
  const dragRef = useRef(null);
  const resizeSeparatorRef = useRef(null);
  const applyWidthRef = useRef(() => {
  });
  const panelRef = useRef(null);
  const useFloatingCollapsed = collapsedPresentation === "floating-only";
  const [floatingOnlyTriggerVisible, setFloatingOnlyTriggerVisible] = useState(
    useFloatingCollapsed && effectiveCollapsed && collapsible
  );
  const showFloatingOnlyTrigger = floatingOnlyTriggerVisible;
  const [floatingAnchorCorrection, setFloatingAnchorCorrection] = useState({
    top: 0,
    left: 0
  });
  const innerEdgeHideTimerRef = useRef(null);
  const innerEdgeCollapseButtonRef = useRef(null);
  const [innerEdgeAffordanceVisible, setInnerEdgeAffordanceVisible] = useState(false);
  const showInnerEdgeCollapseAffordance = showInnerEdgeCollapse && collapsible && !effectiveCollapsed && !showFloatingOnlyTrigger;
  const clearInnerEdgeHideTimer = () => {
    if (innerEdgeHideTimerRef.current != null) {
      clearTimeout(innerEdgeHideTimerRef.current);
      innerEdgeHideTimerRef.current = null;
    }
  };
  const scheduleInnerEdgeHide = () => {
    clearInnerEdgeHideTimer();
    innerEdgeHideTimerRef.current = window.setTimeout(() => {
      innerEdgeHideTimerRef.current = null;
      setInnerEdgeAffordanceVisible(false);
    }, innerEdgeCollapseHideDelayMs);
  };
  const updateInnerEdgeFromClientPoint = (clientX, clientY) => {
    if (!showInnerEdgeCollapseAffordance) {
      return;
    }
    const panelEl = panelRef.current;
    if (panelEl == null) {
      return;
    }
    const rect = panelEl.getBoundingClientRect();
    const seamX = side === "right" ? rect.left : rect.right;
    const horizontalDist = Math.abs(clientX - seamX);
    const bandPx = INNER_EDGE_RESIZE_STRIP_PX + innerEdgeCollapseZonePx;
    const verticallyAligned = clientY >= rect.top && clientY <= rect.bottom;
    const inRevealZone = horizontalDist <= bandPx && verticallyAligned;
    const btn = innerEdgeCollapseButtonRef.current;
    let overCollapseBtn = false;
    if (innerEdgeAffordanceVisible && btn) {
      const br = btn.getBoundingClientRect();
      overCollapseBtn = clientX >= br.left && clientX <= br.right && clientY >= br.top && clientY <= br.bottom;
    }
    if (inRevealZone || overCollapseBtn) {
      clearInnerEdgeHideTimer();
      setInnerEdgeAffordanceVisible(true);
    } else {
      scheduleInnerEdgeHide();
    }
  };
  const updateInnerEdgeFromPointerRef = useRef(updateInnerEdgeFromClientPoint);
  updateInnerEdgeFromPointerRef.current = updateInnerEdgeFromClientPoint;
  useEffect(() => {
    if (!showInnerEdgeCollapseAffordance) {
      return;
    }
    const onMove = (e) => {
      updateInnerEdgeFromPointerRef.current(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, [showInnerEdgeCollapseAffordance]);
  useEffect(() => {
    return () => {
      clearInnerEdgeHideTimer();
    };
  }, []);
  useEffect(() => {
    if (!showInnerEdgeCollapseAffordance) {
      setInnerEdgeAffordanceVisible(false);
      clearInnerEdgeHideTimer();
    }
  }, [showInnerEdgeCollapseAffordance]);
  useEffect(() => {
    if (effectiveCollapsed) {
      setInnerEdgeAffordanceVisible(false);
      clearInnerEdgeHideTimer();
    }
  }, [effectiveCollapsed]);
  const resolvedHotkeys = useMemo(() => {
    const keys = [];
    if (toggleHotkey != null && toggleHotkey.trim().length > 0) {
      keys.push(toggleHotkey.trim().toLowerCase());
    }
    if (toggleHotkeys != null) {
      for (const key of toggleHotkeys) {
        const normalized = key.trim().toLowerCase();
        if (normalized.length > 0) {
          keys.push(normalized);
        }
      }
    }
    const deduped = Array.from(new Set(keys));
    return deduped;
  }, [toggleHotkey, toggleHotkeys]);
  const setWidth = (next) => {
    const clamped = clamp4(next, resolvedMinWidth, resolvedMaxWidth);
    if (!isWidthControlled) {
      setPersistSlice((s) => ({ ...s, width: clamped }));
    }
    onWidthChange?.(clamped);
  };
  applyWidthRef.current = setWidth;
  const setCollapsed = (next, reason = "programmatic") => {
    if (!isCollapsedControlled) {
      setPersistSlice((s) => ({ ...s, collapsed: next }));
    }
    onToggle?.(next, reason);
    onCollapsedChange?.(next);
  };
  useEffect(() => {
    if (isWidthControlled) {
      return;
    }
    setPersistSlice((prev) => ({
      ...prev,
      width: clamp4(prev.width, resolvedMinWidth, resolvedMaxWidth)
    }));
  }, [isWidthControlled, resolvedMinWidth, resolvedMaxWidth]);
  useEffect(() => {
    if (persistKey == null || persistKey.trim().length === 0) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.localStorage.getItem(persistKey);
      if (raw == null) {
        return;
      }
      const parsed = JSON.parse(raw);
      setPersistSlice((prev) => {
        let nextWidth = prev.width;
        let nextCollapsed = prev.collapsed;
        if (!isWidthControlled && typeof parsed.width === "number") {
          nextWidth = clamp4(parsed.width, resolvedMinWidth, resolvedMaxWidth);
        }
        if (!isCollapsedControlled && typeof parsed.collapsed === "boolean") {
          nextCollapsed = parsed.collapsed;
        }
        return { width: nextWidth, collapsed: nextCollapsed };
      });
    } catch {
    }
  }, [
    persistKey,
    isWidthControlled,
    isCollapsedControlled,
    resolvedMinWidth,
    resolvedMaxWidth
  ]);
  useEffect(() => {
    if (persistKey == null || persistKey.trim().length === 0) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const state = {
      width: clampedWidth,
      collapsed: effectiveCollapsed
    };
    window.localStorage.setItem(persistKey, JSON.stringify(state));
  }, [persistKey, clampedWidth, effectiveCollapsed]);
  useEffect(() => {
    if (!closeOnEsc || onRequestClose == null || mode !== "overlay") {
      return;
    }
    const onKeyDown = (evt) => {
      if (evt.key !== "Escape") {
        return;
      }
      evt.preventDefault();
      onRequestClose();
      setCollapsed(true, "esc");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeOnEsc, mode, onRequestClose]);
  useEffect(() => {
    if (resolvedHotkeys.length === 0) {
      return;
    }
    const onKeyDown = (evt) => {
      if (isEditableTarget(evt.target)) {
        return;
      }
      const matched = resolvedHotkeys.some((hotkey) => matchHotkey(evt, hotkey));
      if (!matched) {
        return;
      }
      evt.preventDefault();
      if (mode === "overlay" && onRequestClose != null && !effectiveCollapsed) {
        onRequestClose();
        setCollapsed(true, "hotkey");
        return;
      }
      setCollapsed(!effectiveCollapsed, "hotkey");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resolvedHotkeys, mode, onRequestClose, effectiveCollapsed]);
  useEffect(() => {
    if (!closeOnOutsideClick || mode !== "overlay" || onRequestClose == null) {
      return;
    }
    const onPointerDown = (evt) => {
      const root = panelRef.current;
      if (root == null) {
        return;
      }
      const target = evt.target;
      if (target instanceof Node && !root.contains(target)) {
        onRequestClose();
        setCollapsed(true, "outside-click");
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [closeOnOutsideClick, mode, onRequestClose]);
  useEffect(() => {
    const onPointerMove = (evt) => {
      if (dragRef.current == null) {
        return;
      }
      const delta = evt.clientX - dragRef.current.startX;
      const next = side === "right" ? dragRef.current.startWidth - delta : dragRef.current.startWidth + delta;
      applyWidthRef.current(next);
    };
    const onPointerUp = (evt) => {
      const el = resizeSeparatorRef.current;
      if (el != null && el.hasPointerCapture(evt.pointerId)) {
        el.releasePointerCapture(evt.pointerId);
      }
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [side]);
  const panelWidth = effectiveCollapsed ? useFloatingCollapsed ? 0 : resolvedCollapsedWidth : clampedWidth;
  const transitionDuration = animated ? `${animationDurationMs}ms` : "0ms";
  const transitionTimingFunction = animationEasing;
  const panelStyle = useMemo(() => {
    const base = {
      width: panelWidth,
      transitionProperty: "width, transform, opacity, background-color, border-color",
      transitionDuration,
      transitionTimingFunction,
      backdropFilter: mode === "overlay" && resolvedGlass ? `blur(${glassBlurPx}px)` : void 0,
      WebkitBackdropFilter: mode === "overlay" && resolvedGlass ? `blur(${glassBlurPx}px)` : void 0
    };
    if (mode === "overlay") {
      base.position = "absolute";
      base.top = overlayOffset?.top ?? 0;
      base.bottom = overlayOffset?.bottom ?? 0;
      base.zIndex = overlayZIndex;
      if (side === "right") {
        base.right = overlayOffset?.right ?? 0;
      } else {
        base.left = overlayOffset?.left ?? 0;
      }
      if (effectiveCollapsed) {
        base.transform = side === "right" ? "translateX(0)" : "translateX(0)";
      }
    }
    return base;
  }, [
    panelWidth,
    transitionDuration,
    transitionTimingFunction,
    mode,
    resolvedGlass,
    glassBlurPx,
    overlayZIndex,
    overlayOffset,
    side,
    effectiveCollapsed
  ]);
  const surfaceStyle = mode === "overlay" && resolvedGlass ? {
    backgroundColor: `color-mix(in srgb, rgb(24 24 27) ${Math.round(
      glassOpacity * 100
    )}%, transparent)`,
    borderColor: `color-mix(in srgb, rgb(63 63 70) ${Math.round(
      glassBorderOpacity * 100
    )}%, transparent)`
  } : {};
  const contentFadeStyle = {
    opacity: effectiveCollapsed ? 0 : 1,
    transitionProperty: "opacity",
    transitionDuration,
    transitionTimingFunction
  };
  const collapseIcon = side === "right" ? effectiveCollapsed ? /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }) : effectiveCollapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" });
  const variantClassName = variant === "inspector" ? "border-cyan-500/35" : variant === "settings" ? "border-indigo-400/40" : "";
  const resizeGripAccentClass = variant === "inspector" ? "hover:bg-cyan-400/15 active:bg-cyan-400/25 focus-visible:bg-cyan-400/18 focus-visible:ring-cyan-400/40 " : variant === "settings" ? "hover:bg-indigo-400/15 active:bg-indigo-400/25 focus-visible:bg-indigo-400/18 focus-visible:ring-indigo-400/40 " : "hover:bg-zinc-400/15 active:bg-zinc-400/25 focus-visible:bg-zinc-400/20 focus-visible:ring-zinc-400/45 ";
  const floatingAnchorStyle = useMemo(() => {
    if (collapsedFloatingAnchor != null) {
      return collapsedFloatingAnchor;
    }
    if (side === "right") {
      return { right: 0, top: "50%", transform: "translateY(-50%)" };
    }
    return { left: 0, top: "50%", transform: "translateY(-50%)" };
  }, [collapsedFloatingAnchor, side]);
  useEffect(() => {
    if (!useFloatingCollapsed || !collapsible) {
      setFloatingOnlyTriggerVisible(false);
      return;
    }
    if (!effectiveCollapsed) {
      setFloatingOnlyTriggerVisible(false);
      return;
    }
    if (!animated || animationDurationMs <= 0) {
      setFloatingOnlyTriggerVisible(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setFloatingOnlyTriggerVisible(true);
    }, animationDurationMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [
    animated,
    animationDurationMs,
    collapsible,
    effectiveCollapsed,
    useFloatingCollapsed
  ]);
  useEffect(() => {
    if (!showFloatingOnlyTrigger) {
      setFloatingAnchorCorrection({ top: 0, left: 0 });
      return;
    }
    const recalculateAnchorCorrection = () => {
      const container = panelRef.current;
      if (container == null) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const iconSize = collapsedFloatingSize;
      const rawTop = parsePx(floatingAnchorStyle.top);
      const rawBottom = parsePx(floatingAnchorStyle.bottom);
      const rawLeft = parsePx(floatingAnchorStyle.left);
      const rawRight = parsePx(floatingAnchorStyle.right);
      let targetTop = null;
      if (rawTop != null) {
        targetTop = rawTop;
      } else if (rawBottom != null) {
        targetTop = containerRect.height - rawBottom - iconSize;
      }
      let targetLeft = null;
      if (rawLeft != null) {
        targetLeft = rawLeft;
      } else if (rawRight != null) {
        targetLeft = containerRect.width - rawRight - iconSize;
      }
      const margin = 0;
      const clampedTop = targetTop != null ? clamp4(targetTop, margin, Math.max(margin, containerRect.height - iconSize - margin)) : null;
      const clampedLeft = targetLeft != null ? clamp4(targetLeft, margin, Math.max(margin, containerRect.width - iconSize - margin)) : null;
      setFloatingAnchorCorrection({
        top: targetTop != null && clampedTop != null ? Math.round(clampedTop - targetTop) : 0,
        left: targetLeft != null && clampedLeft != null ? Math.round(clampedLeft - targetLeft) : 0
      });
    };
    recalculateAnchorCorrection();
    window.addEventListener("resize", recalculateAnchorCorrection);
    return () => window.removeEventListener("resize", recalculateAnchorCorrection);
  }, [showFloatingOnlyTrigger, collapsedFloatingSize, floatingAnchorStyle]);
  const panelHeaderClassName = "flex items-center gap-1 border-b px-2 py-1.5 " + (resolvedGlass ? "border-zinc-600/70 bg-zinc-900/50 " : "border-zinc-700/80 ");
  const panelTitleClassName = "text-xs font-semibold truncate min-w-0 " + (resolvedGlass ? "text-zinc-50" : "text-zinc-100");
  const panelActionButtonClassName = "inline-flex items-center justify-center rounded border " + (resolvedGlass ? "border-zinc-600/75 bg-zinc-900/55 text-zinc-100 hover:bg-zinc-800/70" : "border-zinc-700/80 hover:bg-zinc-800/70");
  const collapsedHeaderClassName = "border-b p-1 " + (resolvedGlass ? "border-zinc-600/70 bg-zinc-900/45" : "border-zinc-700/80");
  const panelFooterClassName = "border-t px-2 py-1.5 text-xs " + (resolvedGlass ? "border-zinc-600/70 bg-zinc-900/40 " : "border-zinc-700/80 ");
  const [panelDimensions, setPanelDimensions] = useState({ width: 0, height: 0 });
  const scrollEdgeReveal = useScrollbarEdgeReveal(
    contentEdgeRevealScrollbar && !contentScrollOverflowHint,
    {
      edgePx: contentScrollbarEdgePx,
      hideDelayMs: contentScrollbarHideDelayMs
    }
  );
  const overflowHintEnabled = contentScrollOverflowHint && !effectiveCollapsed;
  const overflowHint = useScrollOverflowHint(overflowHintEnabled);
  const hasExplicitContentPadding = /\bp-\d+/.test(contentClassName) || /\bpx-\d+/.test(contentClassName) || /\bpy-\d+/.test(contentClassName) || /\bpt-\d+/.test(contentClassName) || /\bpr-\d+/.test(contentClassName) || /\bpb-\d+/.test(contentClassName) || /\bpl-\d+/.test(contentClassName);
  const defaultContentPaddingClass = hasExplicitContentPadding ? "" : "p-2 ";
  useEffect(() => {
    if (!showDimensionsFooter) {
      return;
    }
    const element = panelRef.current;
    if (element == null) {
      return;
    }
    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setPanelDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [showDimensionsFooter]);
  const dimensionsFooter = showDimensionsFooter ? /* @__PURE__ */ jsxs(
    "div",
    {
      className: "text-[10px] leading-tight text-zinc-500",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-zinc-400", children: "Panel" }),
        " ",
        /* @__PURE__ */ jsxs("span", { className: "text-zinc-300", children: [
          panelDimensions.width,
          " \xD7 ",
          panelDimensions.height,
          " px"
        ] })
      ]
    }
  ) : null;
  const showFooterStrip = !effectiveCollapsed && (footer != null || showDimensionsFooter);
  const expandPanelLabel = collapsedFloatingLabel ?? (typeof title === "string" ? title : void 0);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    showFloatingOnlyTrigger ? /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "pointer-events-auto group absolute inline-flex items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-950/90 px-2 py-1.5 shadow-lg outline-none transition-colors duration-150 ease-out hover:border-zinc-600/80 hover:bg-zinc-900/95 focus-visible:ring-2 focus-visible:ring-zinc-500/60 focus-visible:ring-offset-0 " + (side === "right" ? "flex-row-reverse " : ""),
        style: {
          ...floatingAnchorStyle,
          marginTop: floatingAnchorCorrection.top,
          marginLeft: floatingAnchorCorrection.left,
          opacity: 1,
          zIndex: collapsedFloatingZIndex ?? (mode === "overlay" ? overlayZIndex + 1 : 10)
        },
        "aria-label": expandPanelLabel != null ? `Expand ${expandPanelLabel}` : "Expand panel",
        onClick: () => setCollapsed(false, "button"),
        children: [
          /* @__PURE__ */ jsx("span", { className: "trn-side-panel-expand-icon inline-flex shrink-0 text-zinc-400 transition-colors duration-150 group-hover:text-zinc-200", children: side === "right" ? /* @__PURE__ */ jsx(PanelRightOpen, { className: "h-4 w-4", "aria-hidden": true }) : /* @__PURE__ */ jsx(PanelLeftOpen, { className: "h-4 w-4", "aria-hidden": true }) }),
          expandPanelLabel != null && expandPanelLabel.length > 0 ? /* @__PURE__ */ jsx(
            "span",
            {
              className: "max-w-[7.5rem] truncate text-[10px] font-semibold leading-tight text-zinc-300 transition-colors duration-150 group-hover:text-zinc-100 " + (side === "right" ? "text-right" : "text-left"),
              children: expandPanelLabel
            }
          ) : null
        ]
      }
    ) : null,
    mode === "overlay" && resolvedBackdrop !== "none" ? /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": "true",
        className: "absolute inset-0",
        style: {
          zIndex: overlayZIndex - 1,
          top: overlayOffset?.top ?? 0,
          right: overlayOffset?.right ?? 0,
          bottom: overlayOffset?.bottom ?? 0,
          left: overlayOffset?.left ?? 0,
          backgroundColor: resolvedBackdrop === "dim" ? "color-mix(in srgb, black 30%, transparent)" : "color-mix(in srgb, black 16%, transparent)",
          backdropFilter: resolvedBackdrop === "blur" ? "blur(4px)" : void 0,
          WebkitBackdropFilter: resolvedBackdrop === "blur" ? "blur(4px)" : void 0
        },
        onClick: () => {
          if (closeOnOutsideClick) {
            onRequestClose?.();
            setCollapsed(true, "outside-click");
          }
        }
      }
    ) : null,
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: panelRef,
        style: panelStyle,
        className: "relative h-full min-h-0 shrink-0 overflow-visible",
        children: [
          /* @__PURE__ */ jsx(
            "aside",
            {
              className: "h-full min-h-0 w-full border border-zinc-700/80 bg-zinc-950/95 flex flex-col overflow-hidden " + variantClassName + " " + (mode === "overlay" ? "shadow-xl " : "") + (showFloatingOnlyTrigger ? "border-0 bg-transparent shadow-none pointer-events-none " : "") + className,
              children: !showFloatingOnlyTrigger ? /* @__PURE__ */ jsxs("div", { style: { ...surfaceStyle, ...contentFadeStyle }, className: "h-full min-h-0 flex flex-col", children: [
                !effectiveCollapsed ? /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: panelHeaderClassName + headerClassName,
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-col justify-center", children: [
                        /* @__PURE__ */ jsx("div", { className: panelTitleClassName, children: title ?? (side === "right" ? "Side Panel" : "Panel") }),
                        subtitle != null ? /* @__PURE__ */ jsx("div", { className: "truncate text-[10px] font-normal leading-tight text-zinc-400", children: subtitle }) : null
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-1", children: [
                        actions,
                        collapsible ? /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            className: "h-6 w-6 " + panelActionButtonClassName,
                            "aria-label": "Collapse panel",
                            onClick: () => setCollapsed(true, "button"),
                            children: collapseIcon
                          }
                        ) : null,
                        showCloseButton ? /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            className: "h-6 w-6 " + panelActionButtonClassName,
                            "aria-label": "Close panel",
                            onClick: () => onRequestClose?.(),
                            children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
                          }
                        ) : null
                      ] })
                    ]
                  }
                ) : !useFloatingCollapsed ? /* @__PURE__ */ jsx("div", { className: collapsedHeaderClassName, children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "h-8 w-full " + panelActionButtonClassName,
                    "aria-label": "Expand panel",
                    onClick: () => setCollapsed(false, "button"),
                    children: collapseIcon
                  }
                ) }) : null,
                !effectiveCollapsed ? contentScrollOverflowHint ? /* @__PURE__ */ jsxs("div", { className: "relative flex min-h-0 flex-1 flex-col overflow-hidden", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      ref: overflowHint.scrollRef,
                      tabIndex: 0,
                      className: "scrollbar-hide min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain outline-none focus-visible:ring-1 focus-visible:ring-amber-400/40 " + defaultContentPaddingClass + contentClassName,
                      children: /* @__PURE__ */ jsx(
                        "div",
                        {
                          ref: overflowHint.contentRef,
                          className: "flex h-full min-h-0 min-w-0 flex-col",
                          children
                        }
                      )
                    }
                  ),
                  overflowHint.canScrollUp ? /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "pointer-events-none absolute left-0 right-0 top-0 z-10 flex flex-col items-center bg-linear-to-b from-zinc-950 from-35% via-zinc-950/90 to-transparent pb-12 pt-2",
                      role: "img",
                      "aria-label": "More content above. Scroll up or use the mouse wheel to view.",
                      children: /* @__PURE__ */ jsx(
                        ChevronsUp,
                        {
                          className: "h-5 w-5 text-zinc-500 motion-safe:animate-bounce",
                          strokeWidth: 2,
                          "aria-hidden": true
                        }
                      )
                    }
                  ) : null,
                  overflowHint.canScrollDown ? /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center bg-linear-to-t from-zinc-950 from-35% via-zinc-950/90 to-transparent pb-2 pt-12",
                      role: "img",
                      "aria-label": "More content below. Scroll or use the mouse wheel to view.",
                      children: /* @__PURE__ */ jsx(
                        ChevronsDown,
                        {
                          className: "h-5 w-5 text-zinc-500 motion-safe:animate-bounce",
                          strokeWidth: 2,
                          "aria-hidden": true
                        }
                      )
                    }
                  ) : null
                ] }) : /* @__PURE__ */ jsx(
                  "div",
                  {
                    ref: scrollEdgeReveal.ref,
                    className: "min-h-0 flex-1 overflow-y-auto " + defaultContentPaddingClass + (contentEdgeRevealScrollbar ? scrollEdgeReveal.revealClassName + " " : "") + contentClassName,
                    onMouseMove: scrollEdgeReveal.onMouseMove,
                    onMouseEnter: scrollEdgeReveal.onMouseEnter,
                    onMouseLeave: scrollEdgeReveal.onMouseLeave,
                    children: /* @__PURE__ */ jsx("div", { className: "flex h-full min-h-0 min-w-0 flex-col", children })
                  }
                ) : !useFloatingCollapsed ? /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 flex items-center justify-center text-zinc-400", children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "group h-8 w-8 " + panelActionButtonClassName,
                    "aria-label": "Expand panel",
                    onClick: () => setCollapsed(false, "button"),
                    children: /* @__PURE__ */ jsx("span", { className: "trn-side-panel-expand-icon inline-flex text-zinc-400 transition-colors duration-150 group-hover:text-zinc-200", children: side === "right" ? /* @__PURE__ */ jsx(PanelRightOpen, { className: "h-4 w-4", "aria-hidden": true }) : /* @__PURE__ */ jsx(PanelLeftOpen, { className: "h-4 w-4", "aria-hidden": true }) })
                  }
                ) }) : null,
                showFooterStrip ? /* @__PURE__ */ jsx("div", { className: panelFooterClassName + footerClassName, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                  dimensionsFooter,
                  footer != null ? /* @__PURE__ */ jsx("div", { className: "text-zinc-400", children: footer }) : null
                ] }) }) : null
              ] }) : null
            }
          ),
          showInnerEdgeCollapseAffordance ? /* @__PURE__ */ jsx(
            "button",
            {
              ref: innerEdgeCollapseButtonRef,
              type: "button",
              tabIndex: -1,
              "aria-hidden": !innerEdgeAffordanceVisible,
              className: "group absolute top-1/2 z-40 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded border-0 bg-transparent p-0 shadow-none outline-none transition-opacity duration-200 motion-safe:transition-opacity motion-reduce:transition-none " + (side === "right" ? "left-0 -translate-x-1/2 " : "right-0 translate-x-1/2 ") + (innerEdgeAffordanceVisible ? "pointer-events-auto opacity-100 focus-visible:ring-2 focus-visible:ring-zinc-500/60 focus-visible:ring-offset-0" : "pointer-events-none opacity-0"),
              "aria-label": "Collapse panel",
              onClick: () => setCollapsed(true, "inner-edge"),
              children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-flex text-zinc-400 transition-colors duration-150 group-hover:text-zinc-200 " + (innerEdgeAffordanceVisible ? "trn-side-panel-expand-icon " : ""),
                  children: side === "right" ? /* @__PURE__ */ jsx(
                    PanelRightOpen,
                    {
                      className: "h-4 w-4 rotate-180",
                      "aria-hidden": true
                    }
                  ) : /* @__PURE__ */ jsx(
                    PanelLeftOpen,
                    {
                      className: "h-4 w-4 rotate-180",
                      "aria-hidden": true
                    }
                  )
                }
              )
            }
          ) : null,
          resizable && !(effectiveCollapsed && useFloatingCollapsed) ? /* @__PURE__ */ jsx(
            "div",
            {
              ref: resizeSeparatorRef,
              role: "separator",
              "aria-orientation": "vertical",
              "aria-label": "Resize panel width",
              "aria-valuenow": Math.round(clampedWidth),
              "aria-valuemin": resolvedMinWidth,
              "aria-valuemax": resolvedMaxWidth,
              tabIndex: 0,
              className: "pointer-events-auto nodrag nopan absolute top-0 bottom-0 z-50 w-3 cursor-col-resize touch-none transition-colors select-none bg-transparent focus-visible:outline-none focus-visible:ring-2 " + resizeGripAccentClass + (side === "right" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"),
              title: "Drag to resize panel \xB7 Double-click to reset width \xB7 Arrow keys when focused",
              onPointerDown: (evt) => {
                if (evt.button !== 0) {
                  return;
                }
                dragRef.current = { startX: evt.clientX, startWidth: clampedWidth };
                evt.preventDefault();
                evt.stopPropagation();
                evt.currentTarget.setPointerCapture(evt.pointerId);
              },
              onDoubleClick: () => setWidth(resolvedDefaultWidth),
              onKeyDown: (evt) => {
                const step = evt.shiftKey ? 24 : 12;
                const growRight = side === "right" ? "ArrowLeft" : "ArrowRight";
                const shrinkRight = side === "right" ? "ArrowRight" : "ArrowLeft";
                if (evt.key === growRight) {
                  evt.preventDefault();
                  setWidth(clampedWidth + step);
                  return;
                }
                if (evt.key === shrinkRight) {
                  evt.preventDefault();
                  setWidth(clampedWidth - step);
                  return;
                }
                if (evt.key === "Home") {
                  evt.preventDefault();
                  setWidth(resolvedMinWidth);
                  return;
                }
                if (evt.key === "End") {
                  evt.preventDefault();
                  setWidth(resolvedMaxWidth);
                }
              }
            }
          ) : null
        ]
      }
    )
  ] });
}
function TRNIconRailSplitPane(props) {
  const {
    iconSide = "right",
    header,
    children,
    className,
    contentShellClassName,
    contentClassName,
    railColumnClassName,
    useScrollHints = true,
    edgeHintSizePx = 22
  } = props;
  const customRail = "rail" in props && props.rail != null ? props.rail : null;
  const builtinRail = customRail == null ? props : null;
  const isRight = iconSide === "right";
  const shellPad = isRight ? "pl-0 pr-3" : "pl-3 pr-0";
  const railPad = isRight ? "pl-0.5 pr-1" : "pl-1 pr-0.5";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: twMerge("flex h-full min-h-0 w-full min-w-0 gap-0", className),
      style: { flexDirection: isRight ? "row-reverse" : "row" },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: twMerge(
              "flex h-full shrink-0 flex-col bg-transparent",
              railColumnClassName
            ),
            children: customRail != null ? customRail : builtinRail != null ? /* @__PURE__ */ jsx(
              TRNInspectorIconRail,
              {
                ariaLabel: builtinRail.railAriaLabel,
                items: builtinRail.railItems,
                activeId: builtinRail.railActiveId,
                onActiveChange: builtinRail.onRailActiveChange,
                tone: builtinRail.railTone ?? "emerald",
                dockSide: isRight ? "right" : "left",
                itemClassName: builtinRail.railItemClassName,
                itemsContainerClassName: builtinRail.railItemsContainerClassName,
                className: twMerge(
                  "rounded-lg border-0 bg-transparent",
                  railPad,
                  builtinRail.railClassName
                )
              }
            ) : null
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: twMerge(
              "flex h-full min-h-0 min-w-0 flex-1 flex-col bg-transparent",
              shellPad,
              contentShellClassName
            ),
            children: [
              header != null ? /* @__PURE__ */ jsx("div", { className: "shrink-0", children: header }) : null,
              useScrollHints ? /* @__PURE__ */ jsx(
                TRNScrollableEdgeHints,
                {
                  edgeSizePx: edgeHintSizePx,
                  className: twMerge("min-h-0 flex-1", contentClassName),
                  scrollClassName: twMerge("p-2", header != null ? "mt-0" : null),
                  children
                }
              ) : /* @__PURE__ */ jsx(
                "div",
                {
                  className: twMerge(
                    "scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain p-2",
                    contentClassName
                  ),
                  children
                }
              )
            ]
          }
        )
      ]
    }
  );
}
var EDGE_ZONE_PX = 36;
var MIN_SPEED_PX = 3;
var MAX_SPEED_PX = 14;
function useScrollContainerEdgeAutoScroll(containerRef, enabled) {
  useEffect(() => {
    const el = containerRef.current;
    if (el == null || !enabled) {
      return;
    }
    let direction = 0;
    let speedPx = MIN_SPEED_PX;
    let rafId = 0;
    const stop = () => {
      direction = 0;
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
    const tick = () => {
      rafId = 0;
      if (direction === 0) {
        return;
      }
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) {
        stop();
        return;
      }
      const next = el.scrollTop + direction * speedPx;
      el.scrollTop = Math.max(0, Math.min(maxScroll, next));
      const atEnd = direction > 0 && el.scrollTop >= maxScroll - 0.5;
      const atStart = direction < 0 && el.scrollTop <= 0.5;
      if (!atEnd && !atStart) {
        rafId = requestAnimationFrame(tick);
      } else {
        stop();
      }
    };
    const schedule = () => {
      if (direction !== 0 && rafId === 0) {
        rafId = requestAnimationFrame(tick);
      }
    };
    const onMouseMove = (event) => {
      if (el.scrollHeight <= el.clientHeight + 1) {
        stop();
        return;
      }
      const rect = el.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const height = rect.height;
      if (y >= height - EDGE_ZONE_PX) {
        const depth = Math.min(EDGE_ZONE_PX, y - (height - EDGE_ZONE_PX));
        direction = 1;
        speedPx = MIN_SPEED_PX + depth / EDGE_ZONE_PX * (MAX_SPEED_PX - MIN_SPEED_PX);
      } else if (y <= EDGE_ZONE_PX) {
        const depth = Math.min(EDGE_ZONE_PX, EDGE_ZONE_PX - y);
        direction = -1;
        speedPx = MIN_SPEED_PX + depth / EDGE_ZONE_PX * (MAX_SPEED_PX - MIN_SPEED_PX);
      } else {
        stop();
        return;
      }
      schedule();
    };
    const onMouseLeave = () => {
      stop();
    };
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      stop();
    };
  }, [containerRef, enabled]);
}
var PANEL_TONE_CLASS = {
  "glass-dropdown": "isolate w-full rounded-xl border border-white/15 bg-black/70 px-1.5 py-1.5 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.9)] backdrop-blur-2xl ring-1 ring-white/10 leading-normal",
  subtle: "isolate w-full rounded-lg border border-zinc-700/80 bg-zinc-950/95 p-1.5 shadow-lg leading-normal",
  card: "isolate w-full rounded-md border border-zinc-700/80 bg-black/40 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] leading-normal"
};
var ITEM_TONE_CLASS = {
  "glass-dropdown": "rounded-md border border-white/10 bg-white/5 text-zinc-100 hover:border-white/20 hover:bg-white/12",
  subtle: "rounded-md border border-zinc-700/70 bg-zinc-900/70 text-zinc-100 hover:border-zinc-600/80 hover:bg-zinc-800/70",
  card: "rounded-md border border-zinc-700/80 bg-black/30 text-zinc-100 hover:border-zinc-600/80 hover:bg-black/45"
};
var TRN_GLASS_LISTBOX_OPTION_SELECTED_CLASSNAME = "border-cyan-500/45 bg-cyan-500/18 text-cyan-200 hover:border-cyan-500/50 hover:bg-cyan-500/22";
var TRN_GLASS_LISTBOX_OPTION_ROW_COMPACT_CLASSNAME = "py-1 leading-tight";
function TRNMenuScrollRegion(props) {
  const { className, edgeAutoScroll = false, children, ...rest } = props;
  const scrollRef = useRef(null);
  useScrollContainerEdgeAutoScroll(scrollRef, edgeAutoScroll);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: scrollRef,
      className: twMerge("min-h-0 overflow-y-auto scrollbar-hide", className),
      ...rest,
      children
    }
  );
}
function TRNMenuPanel(props) {
  const { className, tone = "glass-dropdown", edgeAutoScroll = false, children, ...rest } = props;
  const scrollRef = useRef(null);
  useScrollContainerEdgeAutoScroll(scrollRef, edgeAutoScroll);
  return /* @__PURE__ */ jsx("div", { ref: scrollRef, className: twMerge(PANEL_TONE_CLASS[tone], className), ...rest, children });
}
function TRNMenuItemButton(props) {
  const {
    label,
    icon,
    rightSlot,
    className,
    tone = "glass-dropdown",
    type = "button",
    ...rest
  } = props;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type,
      className: twMerge(
        "flex h-auto w-full shrink-0 items-center justify-start gap-1.5 px-3.5 py-1.5 text-left text-sm font-normal leading-tight shadow-none transition-colors",
        ITEM_TONE_CLASS[tone],
        className
      ),
      ...rest,
      children: [
        icon ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center", children: icon }) : null,
        /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: label }),
        rightSlot ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center", children: rightSlot }) : null
      ]
    }
  );
}
var SECTION_TITLE_BASE = "text-[10px] font-semibold uppercase tracking-wide text-zinc-500";
var SECTION_TITLE_SPACING = {
  menuFirst: "shrink-0 px-2 pb-0.5 pt-1 leading-snug",
  menuNext: "shrink-0 px-2 pb-0.5 pt-2 leading-snug",
  settingsInset: "shrink-0 px-1 pb-0.5 pt-2 leading-snug",
  hud: "shrink-0 px-3 pb-1 pt-0.5 leading-snug",
  hudFollowUp: "shrink-0 mt-2 border-t border-white/8 px-3 pb-0.5 pt-2 leading-snug",
  labelOnly: "shrink-0 leading-snug"
};
function TRNMenuSectionTitle(props) {
  const { className, spacing = "menuFirst", children, ...rest } = props;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: twMerge(
        SECTION_TITLE_BASE,
        SECTION_TITLE_SPACING[spacing],
        className
      ),
      ...rest,
      children
    }
  );
}
var TRN_MENU_SEARCH_MIN_ITEMS = 6;
function shouldShowTrnMenuSearch(itemCount) {
  return itemCount > TRN_MENU_SEARCH_MIN_ITEMS - 1;
}
function matchesTrnMenuSearch(query, label, keywords = []) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const haystack = [label, ...keywords].join(" ").toLowerCase();
  return haystack.includes(q);
}
function getTrnMenuOptionSearchLabel(label, fallback = "") {
  if (typeof label === "string") {
    return label;
  }
  if (typeof label === "number") {
    return String(label);
  }
  return fallback;
}
var TRNMenuSearchContext = createContext(null);
function useOptionalTRNMenuSearchContext() {
  return useContext(TRNMenuSearchContext);
}
function TRNMenuSearchProvider(props) {
  const { menuOpen, children } = props;
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!menuOpen) {
      setQuery("");
    }
  }, [menuOpen]);
  const itemMatches = useCallback(
    (label, keywords = []) => matchesTrnMenuSearch(query, label, keywords),
    [query]
  );
  const sectionMatches = useCallback(
    (labels) => {
      if (!query.trim()) {
        return true;
      }
      return labels.some((label) => matchesTrnMenuSearch(query, label));
    },
    [query]
  );
  const value = useMemo(
    () => ({
      query,
      setQuery,
      itemMatches,
      sectionMatches,
      isSearching: query.trim().length > 0
    }),
    [query, itemMatches, sectionMatches]
  );
  return /* @__PURE__ */ jsx(TRNMenuSearchContext.Provider, { value, children });
}
function useTRNMenuItemMatches(label, keywords = []) {
  const optional = useOptionalTRNMenuSearchContext();
  if (optional == null) {
    return true;
  }
  return optional.itemMatches(label, keywords);
}
function TRNMenuSearchableRow(props) {
  const { searchLabel, searchKeywords, ...buttonProps } = props;
  const visible = useTRNMenuItemMatches(searchLabel, searchKeywords);
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ jsx(TRNMenuItemButton, { ...buttonProps });
}
function TRNMenuSearchField(props) {
  const {
    autoFocus = true,
    placeholder = "Search menu\u2026",
    value: controlledValue,
    onChange: controlledOnChange
  } = props;
  const ctx = useOptionalTRNMenuSearchContext();
  const query = controlledValue ?? ctx?.query ?? "";
  const setQuery = controlledOnChange ?? ctx?.setQuery;
  const inputRef = useRef(null);
  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [autoFocus]);
  if (setQuery == null) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "shrink-0 border-b border-white/10 px-2 py-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1", children: [
    /* @__PURE__ */ jsx(Search, { size: 12, className: "shrink-0 text-zinc-500", "aria-hidden": true }),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        type: "search",
        value: query,
        onChange: (event) => {
          setQuery(event.target.value);
        },
        placeholder,
        "aria-label": "Search menu",
        className: "min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500",
        onKeyDown: (event) => {
          event.stopPropagation();
        }
      }
    )
  ] }) });
}
function TRNMenuFilterableSection(props) {
  const { title, itemLabels, spacing = "menuNext", children } = props;
  const search = useOptionalTRNMenuSearchContext();
  const sectionMatches = search?.sectionMatches ?? (() => true);
  if (!sectionMatches(itemLabels)) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(TRNMenuSectionTitle, { spacing, children: title }),
    children
  ] });
}
function TRNMenuNoResults(props) {
  if (!props.visible) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "px-3 py-5 text-center text-sm text-zinc-500", role: "status", children: "No matching menu items" });
}
function TRNSearchableMenuShell(props) {
  const {
    menuOpen = true,
    itemCount,
    tone = "glass-dropdown",
    panelClassName,
    scrollClassName,
    maxHeightClassName = "max-h-[min(70vh,32rem)]",
    children
  } = props;
  const showSearch = shouldShowTrnMenuSearch(itemCount);
  return /* @__PURE__ */ jsx(TRNMenuSearchProvider, { menuOpen, children: /* @__PURE__ */ jsxs(
    TRNMenuPanel,
    {
      tone,
      className: twMerge(
        "flex flex-col overflow-hidden !p-0",
        showSearch ? maxHeightClassName : null,
        panelClassName
      ),
      children: [
        showSearch ? /* @__PURE__ */ jsx(TRNMenuSearchField, {}) : null,
        /* @__PURE__ */ jsx(
          TRNMenuScrollRegion,
          {
            edgeAutoScroll: showSearch,
            className: twMerge(
              showSearch ? "min-h-0 flex-1 px-1.5 py-1.5" : null,
              scrollClassName
            ),
            children
          }
        )
      ]
    }
  ) });
}

// src/trn-floating-menu-placement.ts
var TRN_FLOATING_MENU_VIEWPORT_PADDING_PX = 8;
var TRN_FLOATING_MENU_GAP_PX = 4;
var TRN_FLOATING_MENU_DEFAULT_MAX_HEIGHT_PX = 320;
var TRN_FLOATING_LAYER_ATTR = "data-trn-floating-layer";
function isEventInsideTrnFloatingLayer(target) {
  return target instanceof Element && target.closest(`[${TRN_FLOATING_LAYER_ATTR}]`) != null;
}
function resolveTrnFloatingMenuPlacement(args) {
  const maxMenuHeight = Math.min(
    args.maxHeightCapPx ?? TRN_FLOATING_MENU_DEFAULT_MAX_HEIGHT_PX,
    window.innerHeight * 0.5
  );
  const menuHeight = Math.min(maxMenuHeight, Math.max(48, args.menuHeightPx));
  const spaceBelow = window.innerHeight - TRN_FLOATING_MENU_VIEWPORT_PADDING_PX - (args.triggerRect.bottom + TRN_FLOATING_MENU_GAP_PX);
  const spaceAbove = args.triggerRect.top - TRN_FLOATING_MENU_GAP_PX - TRN_FLOATING_MENU_VIEWPORT_PADDING_PX;
  const openBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;
  if (openBelow) {
    return {
      top: args.triggerRect.bottom + TRN_FLOATING_MENU_GAP_PX,
      maxHeight: Math.max(48, Math.min(menuHeight, spaceBelow))
    };
  }
  const fitHeight = Math.max(48, Math.min(menuHeight, spaceAbove));
  let top = args.triggerRect.top - TRN_FLOATING_MENU_GAP_PX - fitHeight;
  if (top < TRN_FLOATING_MENU_VIEWPORT_PADDING_PX) {
    top = TRN_FLOATING_MENU_VIEWPORT_PADDING_PX;
  }
  const maxHeight = Math.max(
    48,
    Math.min(fitHeight, args.triggerRect.top - TRN_FLOATING_MENU_GAP_PX - top)
  );
  return { top, maxHeight };
}
function resolveTrnFloatingMenuHorizontal(args) {
  const panelWidth = Math.min(
    args.panelWidthPx,
    window.innerWidth - TRN_FLOATING_MENU_VIEWPORT_PADDING_PX * 2
  );
  let left = args.triggerRect.left;
  left = Math.max(
    TRN_FLOATING_MENU_VIEWPORT_PADDING_PX,
    Math.min(left, window.innerWidth - panelWidth - TRN_FLOATING_MENU_VIEWPORT_PADDING_PX)
  );
  return { left, width: panelWidth };
}
var TOOLBAR_HEADER_DROPDOWN_MENU_PANEL_CLASS = "min-w-48 max-h-80 overflow-y-auto scrollbar-hide rounded-md px-1 py-0.5";
var TRN_GLASS_DROPDOWN_TEXT_CLASS = "text-[13px] leading-tight";
var TOOLBAR_HEADER_DROPDOWN_MENU_ITEM_CLASS = `gap-1.5 rounded-sm px-2 py-1 ${TRN_GLASS_DROPDOWN_TEXT_CLASS}`;
function toolbarHeaderDropdownMenuIcon(Icon) {
  return /* @__PURE__ */ jsx(Icon, { className: "size-3.5 shrink-0 text-zinc-400", "aria-hidden": true });
}
var TRN_SELECT_TRIGGER_VARIANT_CLASS = {
  field: TRN_FIELD_CONTROL_FIELD_VARIANT_CLASS,
  glass: "border border-white/15 bg-black/70 ring-1 ring-white/10 hover:bg-black/80"
};
function estimateMenuHeightPx(optionCount) {
  const rowPx = 34;
  const chromePx = 12;
  return Math.min(TRN_FLOATING_MENU_DEFAULT_MAX_HEIGHT_PX, optionCount * rowPx + chromePx);
}
function TRNSelect(props) {
  const {
    value,
    options,
    onValueChange,
    ariaLabel,
    sectionTitle,
    trigger = "default",
    iconTrigger,
    iconButtonClassName,
    iconTriggerHint,
    leadingIcon,
    showLeadingIcon,
    variant = "field",
    showSelectedIconInTrigger = true,
    size = "md",
    disabled = false,
    className,
    buttonClassName,
    triggerClassName,
    panelClassName
  } = props;
  const mergedTriggerClassName = twMerge(buttonClassName, triggerClassName);
  const sectionHeadingId = useId();
  const [open, setOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const showMenuSearch = shouldShowTrnMenuSearch(options.length);
  useEffect(() => {
    if (!open) {
      setFilterQuery("");
    }
  }, [open]);
  const visibleOptions = useMemo(() => {
    if (!showMenuSearch) {
      return options;
    }
    return options.filter(
      (opt) => matchesTrnMenuSearch(
        filterQuery,
        getTrnMenuOptionSearchLabel(opt.label, opt.value)
      )
    );
  }, [filterQuery, options, showMenuSearch]);
  const [menuBox, setMenuBox] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );
  const resolvedLeadingIcon = leadingIcon ?? (showSelectedIconInTrigger ? selected?.icon : null) ?? resolveTrnFieldSelectLeadingIcon({ variant, ariaLabel, showLeadingIcon });
  useLayoutEffect(() => {
    if (!open) {
      setMenuBox(null);
      return;
    }
    const updateMenuBox = () => {
      const root = rootRef.current;
      if (root == null) {
        return;
      }
      const rect = root.getBoundingClientRect();
      const measuredHeight = menuRef.current?.offsetHeight ?? estimateMenuHeightPx(options.length);
      const placement = resolveTrnFloatingMenuPlacement({
        triggerRect: rect,
        menuHeightPx: measuredHeight
      });
      if (trigger === "icon") {
        const panelWidth = Math.min(window.innerWidth * 0.92, 288);
        let left = rect.left + rect.width / 2 - panelWidth / 2;
        left = Math.max(
          TRN_FLOATING_MENU_VIEWPORT_PADDING_PX,
          Math.min(left, window.innerWidth - panelWidth - TRN_FLOATING_MENU_VIEWPORT_PADDING_PX)
        );
        setMenuBox({
          left,
          width: panelWidth,
          top: placement.top,
          maxHeight: placement.maxHeight
        });
      } else {
        const horizontal = resolveTrnFloatingMenuHorizontal({
          triggerRect: rect,
          panelWidthPx: rect.width
        });
        setMenuBox({
          ...horizontal,
          top: placement.top,
          maxHeight: placement.maxHeight
        });
      }
    };
    updateMenuBox();
    const raf = window.requestAnimationFrame(updateMenuBox);
    window.addEventListener("resize", updateMenuBox);
    window.addEventListener("scroll", updateMenuBox, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateMenuBox);
      window.removeEventListener("scroll", updateMenuBox, true);
    };
  }, [open, options.length, trigger]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (evt) => {
      const root = rootRef.current;
      const menu = menuRef.current;
      if (root == null) {
        return;
      }
      const t = evt.target;
      if (t instanceof Node && !root.contains(t) && !(menu?.contains(t) ?? false)) {
        setOpen(false);
      }
    };
    const onKeyDown = (evt) => {
      if (evt.key === "Escape") {
        evt.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const optionList = /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
    sectionTitle != null ? /* @__PURE__ */ jsx(TRNMenuSectionTitle, { id: sectionHeadingId, spacing: "menuFirst", children: sectionTitle }) : null,
    /* @__PURE__ */ jsx(
      "div",
      {
        role: "listbox",
        "aria-label": sectionTitle != null ? void 0 : ariaLabel,
        "aria-labelledby": sectionTitle != null ? sectionHeadingId : void 0,
        className: "flex flex-col gap-0.5",
        children: visibleOptions.map((opt) => {
          const optDisabled = disabled || opt.disabled === true;
          const isSelected = opt.value === value;
          return /* @__PURE__ */ jsx(
            TRNMenuItemButton,
            {
              tone: "glass-dropdown",
              role: "option",
              disabled: optDisabled,
              "aria-disabled": optDisabled,
              "aria-selected": isSelected,
              label: opt.label,
              icon: opt.icon,
              className: twMerge(
                TOOLBAR_HEADER_DROPDOWN_MENU_ITEM_CLASS,
                size === "lg" ? "text-sm" : null,
                isSelected ? TRN_GLASS_LISTBOX_OPTION_SELECTED_CLASSNAME : null
              ),
              rightSlot: opt.rightSlot ?? null,
              onClick: () => {
                if (optDisabled) {
                  return;
                }
                onValueChange(opt.value);
                setOpen(false);
              }
            },
            opt.value
          );
        })
      }
    ),
    /* @__PURE__ */ jsx(
      TRNMenuNoResults,
      {
        visible: showMenuSearch && filterQuery.trim().length > 0 && visibleOptions.length === 0
      }
    )
  ] });
  const menuPanel = open && menuBox != null && portalTarget != null ? createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: menuRef,
        className: "fixed z-10000 outline-none",
        style: {
          top: menuBox.top,
          left: menuBox.left,
          width: menuBox.width
        },
        children: /* @__PURE__ */ jsx(
          TRNMenuPanel,
          {
            tone: "glass-dropdown",
            edgeAutoScroll: !showMenuSearch,
            className: twMerge(
              TOOLBAR_HEADER_DROPDOWN_MENU_PANEL_CLASS,
              showMenuSearch ? "flex flex-col overflow-hidden !p-0" : null,
              panelClassName
            ),
            style: { maxHeight: menuBox.maxHeight },
            children: showMenuSearch ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                TRNMenuSearchField,
                {
                  value: filterQuery,
                  onChange: setFilterQuery,
                  placeholder: "Search\u2026"
                }
              ),
              /* @__PURE__ */ jsx(
                TRNMenuScrollRegion,
                {
                  edgeAutoScroll: true,
                  className: "min-h-0 flex-1 px-1.5 py-0.5",
                  children: optionList
                }
              )
            ] }) : optionList
          }
        )
      }
    ),
    portalTarget
  ) : null;
  if (trigger === "icon") {
    const glyph = iconTrigger ?? leadingIcon ?? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-zinc-300", "aria-hidden": true });
    return /* @__PURE__ */ jsxs("div", { ref: rootRef, className: twMerge("relative inline-block", className), children: [
      /* @__PURE__ */ jsx(
        TRNIconButton,
        {
          label: ariaLabel,
          icon: glyph,
          disabled,
          hint: iconTriggerHint,
          hintPlacement: "top",
          "aria-haspopup": "listbox",
          "aria-expanded": open,
          className: twMerge(
            "pointer-events-auto border-zinc-700/80 bg-zinc-900/90 text-zinc-200 shadow-md backdrop-blur-sm hover:bg-zinc-800/95",
            iconButtonClassName
          ),
          onClick: () => {
            if (!disabled) {
              setOpen((v) => !v);
            }
          }
        }
      ),
      menuPanel
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { ref: rootRef, className: twMerge("relative w-full", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "aria-label": ariaLabel,
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        disabled,
        onClick: () => {
          if (!disabled) {
            setOpen((v) => !v);
          }
        },
        className: twMerge(
          "inline-flex w-full items-center gap-2 rounded-md px-2.5",
          TRN_FIELD_CONTROL_TRIGGER_BASE_CLASS,
          TRN_SELECT_TRIGGER_VARIANT_CLASS[variant],
          size === "sm" ? "py-1" : size === "lg" ? "py-2 text-sm" : "py-1.5",
          mergedTriggerClassName
        ),
        children: [
          resolvedLeadingIcon ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 items-center text-zinc-400 [&_svg]:shrink-0", "aria-hidden": true, children: resolvedLeadingIcon }) : null,
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-left", children: selected?.label ?? value }),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: "ml-auto h-3.5 w-3.5 shrink-0 text-zinc-400",
              style: { transform: open ? "rotate(180deg)" : "rotate(0deg)" },
              "aria-hidden": true
            }
          )
        ]
      }
    ),
    menuPanel
  ] });
}

// src/trn-eyedropper.ts
function readEyeDropperConstructor() {
  if (typeof window === "undefined") {
    return null;
  }
  const ctor = window.EyeDropper;
  return typeof ctor === "function" ? ctor : null;
}
function isEyeDropperSupported() {
  return readEyeDropperConstructor() != null;
}
async function sampleScreenColorHex() {
  const Ctor = readEyeDropperConstructor();
  if (Ctor == null) {
    return null;
  }
  try {
    const dropper = new Ctor();
    const result = await dropper.open();
    const hex = result?.sRGBHex;
    if (typeof hex === "string" && /^#[0-9a-fA-F]{6}$/.test(hex)) {
      return hex.toLowerCase();
    }
  } catch {
  }
  return null;
}

// src/trn-color-utils.ts
var TRN_COLOR_CHECKERBOARD_BG = "linear-gradient(45deg, #3f3f46 25%, transparent 25%), linear-gradient(-45deg, #3f3f46 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3f3f46 75%), linear-gradient(-45deg, transparent 75%, #3f3f46 75%)";
var TRN_COLOR_CHECKERBOARD_SIZE = "8px 8px";
function wrapHueDegrees(value) {
  const n = value % 360;
  return n < 0 ? n + 360 : n;
}
function clamp5(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function hslToHex(h, s, l, alphaPercent = 100) {
  const hue = wrapHueDegrees(h) / 360;
  const sat = clamp5(s, 0, 100) / 100;
  const light = clamp5(l, 0, 100) / 100;
  let r = 0;
  let g = 0;
  let b = 0;
  if (sat <= 0) {
    const gray = Math.round(light * 255);
    r = gray;
    g = gray;
    b = gray;
  } else {
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;
    const hue2rgb = (t) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    r = Math.round(hue2rgb(hue + 1 / 3) * 255);
    g = Math.round(hue2rgb(hue) * 255);
    b = Math.round(hue2rgb(hue - 1 / 3) * 255);
  }
  const rr = r.toString(16).padStart(2, "0");
  const gg = g.toString(16).padStart(2, "0");
  const bb = b.toString(16).padStart(2, "0");
  const alpha = clamp5(alphaPercent, 0, 100);
  if (alpha >= 100 - Number.EPSILON) {
    return `#${rr}${gg}${bb}`.toLowerCase();
  }
  const aa = Math.round(alpha / 100 * 255).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}${aa}`.toLowerCase();
}
function hexToHsla(hexColor, fallback) {
  if (typeof hexColor !== "string" || hexColor.length === 0) {
    return fallback;
  }
  const raw = hexColor.replace("#", "").trim();
  if (raw.length !== 6 && raw.length !== 8) {
    return fallback;
  }
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return fallback;
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = fallback.h;
  if (delta > Number.EPSILON) {
    if (max === r) {
      h = (g - b) / delta % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = wrapHueDegrees(h * 60);
  }
  const l = (max + min) / 2 * 100;
  let s = 0;
  if (delta > Number.EPSILON) {
    s = l > 50 ? delta / (2 - max - min) : delta / (max + min);
  }
  s *= 100;
  let a = 100;
  if (raw.length === 8) {
    const alphaByte = parseInt(raw.slice(6, 8), 16);
    if (Number.isFinite(alphaByte)) {
      a = alphaByte / 255 * 100;
    }
  }
  return {
    h,
    s: clamp5(s, 0, 100),
    l: clamp5(l, 0, 100),
    a: clamp5(a, 0, 100)
  };
}
function normalizeTrnColorHex(value, fallback, includeAlpha = false) {
  const trimmed = value.trim();
  const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return hex.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{8}$/.test(hex)) {
    const lower = hex.toLowerCase();
    if (includeAlpha) {
      return lower;
    }
    return lower.slice(0, 7);
  }
  return normalizeTrnColorHex(fallback, fallback, includeAlpha);
}
function formatTrnColorHex(hsla, includeAlpha) {
  return hslToHex(hsla.h, hsla.s, hsla.l, includeAlpha ? hsla.a : 100);
}
function trnColorCssBackground(hex) {
  return `${TRN_COLOR_CHECKERBOARD_BG}, ${TRN_COLOR_CHECKERBOARD_SIZE}, ${TRN_COLOR_CHECKERBOARD_SIZE}, ${hex}`;
}
var COLOR_PANEL_MIN_WIDTH_PX = 272;
var COLOR_PANEL_ESTIMATE_HEIGHT_PX = 320;
var DEFAULT_HSLA = { h: 188, s: 72, l: 56, a: 100 };
function ColorSlider({
  ariaLabel,
  valuePercent,
  onChange,
  style,
  thumbClassName
}) {
  const trackRef = useRef(null);
  const setFromClientX = (clientX) => {
    const track = trackRef.current;
    if (track == null) {
      return;
    }
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    const ratio = clamp5((clientX - rect.left) / rect.width, 0, 1);
    onChange(ratio * 100);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: trackRef,
      role: "slider",
      "aria-label": ariaLabel,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": Math.round(valuePercent),
      tabIndex: 0,
      className: "relative h-3 w-full cursor-pointer rounded-md border border-white/10",
      style,
      onPointerDown: (evt) => {
        evt.preventDefault();
        setFromClientX(evt.clientX);
        evt.currentTarget.setPointerCapture(evt.pointerId);
      },
      onPointerMove: (evt) => {
        if ((evt.buttons & 1) === 0) {
          return;
        }
        setFromClientX(evt.clientX);
      },
      onKeyDown: (evt) => {
        const step = evt.shiftKey ? 5 : 1;
        if (evt.key === "ArrowLeft" || evt.key === "ArrowDown") {
          evt.preventDefault();
          onChange(clamp5(valuePercent - step, 0, 100));
        } else if (evt.key === "ArrowRight" || evt.key === "ArrowUp") {
          evt.preventDefault();
          onChange(clamp5(valuePercent + step, 0, 100));
        }
      },
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: twMerge(
            "pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]",
            thumbClassName
          ),
          style: { left: `${valuePercent}%` },
          "aria-hidden": true
        }
      )
    }
  );
}
function TRNColorRingPicker(props) {
  const {
    valueHex,
    onValueHexChange,
    ariaLabel,
    disabled = false,
    enableAlpha = false,
    label,
    size = "sm",
    triggerVariant = "field",
    className
  } = props;
  const [open, setOpen] = useState(false);
  const [menuBox, setMenuBox] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const svRef = useRef(null);
  const [draftHsla, setDraftHsla] = useState(() => hexToHsla(valueHex, DEFAULT_HSLA));
  const [draftHex, setDraftHex] = useState(valueHex);
  const [eyedropperBusy, setEyedropperBusy] = useState(false);
  const eyedropperSupported = isEyeDropperSupported();
  const draftHslaRef = useRef(draftHsla);
  const normalizedHex = normalizeTrnColorHex(valueHex, "#22d3ee", enableAlpha);
  const previewHex = useMemo(
    () => formatTrnColorHex(draftHsla, enableAlpha),
    [draftHsla, enableAlpha]
  );
  useEffect(() => {
    draftHslaRef.current = draftHsla;
  }, [draftHsla]);
  const commitDraft = useCallback(
    (patch) => {
      const prev = draftHslaRef.current;
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      const formatted = formatTrnColorHex(next, enableAlpha);
      draftHslaRef.current = next;
      setDraftHsla(next);
      setDraftHex(formatted);
      onValueHexChange(formatted);
    },
    [enableAlpha, onValueHexChange]
  );
  useEffect(() => {
    if (!open) {
      return;
    }
    const parsed = hexToHsla(valueHex, DEFAULT_HSLA);
    draftHslaRef.current = parsed;
    setDraftHsla(parsed);
    setDraftHex(normalizeTrnColorHex(valueHex, normalizedHex, enableAlpha));
  }, [enableAlpha, normalizedHex, open, valueHex]);
  useLayoutEffect(() => {
    if (!open) {
      setMenuBox(null);
      return;
    }
    const updateMenuBox = () => {
      const root = rootRef.current;
      if (root == null) {
        return;
      }
      const rect = root.getBoundingClientRect();
      const measuredHeight = menuRef.current?.offsetHeight ?? COLOR_PANEL_ESTIMATE_HEIGHT_PX;
      const placement = resolveTrnFloatingMenuPlacement({
        triggerRect: rect,
        menuHeightPx: measuredHeight,
        maxHeightCapPx: Math.max(measuredHeight, window.innerHeight * 0.55)
      });
      const horizontal = resolveTrnFloatingMenuHorizontal({
        triggerRect: rect,
        panelWidthPx: Math.max(rect.width, COLOR_PANEL_MIN_WIDTH_PX)
      });
      setMenuBox({
        ...horizontal,
        top: placement.top,
        maxHeight: placement.maxHeight
      });
    };
    updateMenuBox();
    const raf = window.requestAnimationFrame(updateMenuBox);
    window.addEventListener("resize", updateMenuBox);
    window.addEventListener("scroll", updateMenuBox, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateMenuBox);
      window.removeEventListener("scroll", updateMenuBox, true);
    };
  }, [open, enableAlpha]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (evt) => {
      const root = rootRef.current;
      const menu = menuRef.current;
      if (root == null) {
        return;
      }
      const t = evt.target;
      if (t instanceof Node && !root.contains(t) && !(menu?.contains(t) ?? false)) {
        setOpen(false);
      }
    };
    const onKeyDown = (evt) => {
      if (evt.key === "Escape") {
        evt.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  const setSvFromPointer = (clientX, clientY) => {
    const el = svRef.current;
    if (el == null) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const s = clamp5((clientX - rect.left) / rect.width * 100, 0, 100);
    const l = clamp5(100 - (clientY - rect.top) / rect.height * 100, 0, 100);
    commitDraft({ s, l });
  };
  const handleEyedropperPick = useCallback(async () => {
    if (!eyedropperSupported || eyedropperBusy || disabled) {
      return;
    }
    setEyedropperBusy(true);
    setOpen(false);
    try {
      const sampled = await sampleScreenColorHex();
      if (sampled != null) {
        const parsed = hexToHsla(sampled, DEFAULT_HSLA);
        const next = enableAlpha ? parsed : { ...parsed, a: 100 };
        const formatted = formatTrnColorHex(next, enableAlpha);
        onValueHexChange(formatted);
        setDraftHsla(next);
        setDraftHex(formatted);
      }
    } finally {
      setEyedropperBusy(false);
    }
  }, [disabled, enableAlpha, eyedropperBusy, eyedropperSupported, onValueHexChange]);
  const applyHexDraft = () => {
    const nextHex = normalizeTrnColorHex(draftHex, normalizedHex, enableAlpha);
    const parsed = hexToHsla(nextHex, draftHsla);
    const nextHsla = enableAlpha ? parsed : { ...parsed, a: 100 };
    const formatted = formatTrnColorHex(nextHsla, enableAlpha);
    onValueHexChange(formatted);
    setDraftHsla(nextHsla);
    setDraftHex(formatted);
    setOpen(false);
  };
  const triggerPad = size === "sm" ? "py-1" : size === "lg" ? "py-2 text-sm" : "py-1.5";
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const hueStroke = hslToHex(draftHsla.h, 100, 50);
  const opaquePreview = hslToHex(draftHsla.h, draftHsla.s, draftHsla.l, 100);
  const menuPanel = open && menuBox != null && portalTarget != null ? /* @__PURE__ */ jsx(
    "div",
    {
      ref: menuRef,
      role: "dialog",
      "aria-label": `${ariaLabel} picker`,
      className: "fixed z-10000 outline-none",
      ...{ [TRN_FLOATING_LAYER_ATTR]: "" },
      style: {
        top: menuBox.top,
        left: menuBox.left,
        width: menuBox.width,
        maxHeight: menuBox.maxHeight
      },
      children: /* @__PURE__ */ jsx(TRNMenuPanel, { tone: "glass-dropdown", className: "max-h-full overflow-y-auto p-2.5 scrollbar-hide", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/12",
              style: { background: trnColorCssBackground(previewHex) },
              "aria-hidden": true
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400", children: "Hex" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: draftHex,
                onChange: (e) => setDraftHex(e.target.value),
                className: "w-full rounded border border-white/12 bg-black/55 px-2 py-1 text-xs text-zinc-100 outline-none focus-visible:ring-1 focus-visible:ring-white/20",
                placeholder: enableAlpha ? "#22c55e80" : "#22c55e",
                spellCheck: false
              }
            )
          ] }),
          enableAlpha ? /* @__PURE__ */ jsxs("div", { className: "w-14 shrink-0", children: [
            /* @__PURE__ */ jsx("label", { className: "mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-400", children: "Opacity" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                inputMode: "numeric",
                value: `${Math.round(draftHsla.a)}%`,
                onChange: (e) => {
                  const digits = e.target.value.replace(/[^\d.]/g, "");
                  if (digits.length === 0) {
                    return;
                  }
                  const nextAlpha = clamp5(Number(digits), 0, 100);
                  if (!Number.isFinite(nextAlpha)) {
                    return;
                  }
                  commitDraft({ a: nextAlpha });
                },
                className: "w-full rounded border border-white/12 bg-black/55 px-1.5 py-1 text-center text-xs text-zinc-100 outline-none focus-visible:ring-1 focus-visible:ring-white/20",
                "aria-label": "Opacity percent"
              }
            )
          ] }) : null
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: svRef,
            role: "application",
            "aria-label": "Saturation and brightness",
            className: "relative h-[120px] w-full cursor-crosshair overflow-hidden rounded-md border border-white/10",
            style: {
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueStroke})`
            },
            onPointerDown: (evt) => {
              evt.preventDefault();
              setSvFromPointer(evt.clientX, evt.clientY);
              evt.currentTarget.setPointerCapture(evt.pointerId);
            },
            onPointerMove: (evt) => {
              if ((evt.buttons & 1) === 0) {
                return;
              }
              setSvFromPointer(evt.clientX, evt.clientY);
            },
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]",
                style: {
                  left: `${draftHsla.s}%`,
                  top: `${100 - draftHsla.l}%`,
                  backgroundColor: opaquePreview
                },
                "aria-hidden": true
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-medium uppercase tracking-wide text-zinc-400", children: "Hue" }),
          /* @__PURE__ */ jsx(
            ColorSlider,
            {
              ariaLabel: "Hue",
              valuePercent: draftHsla.h / 360 * 100,
              style: {
                background: "linear-gradient(to right, #ff0033, #ff8a00, #ffe600, #21d07a, #22d3ee, #3b82f6, #d946ef, #ff0033)"
              },
              onChange: (percent) => {
                commitDraft({ h: percent / 100 * 360 });
              }
            }
          )
        ] }),
        enableAlpha ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-medium uppercase tracking-wide text-zinc-400", children: "Opacity" }),
          /* @__PURE__ */ jsx(
            ColorSlider,
            {
              ariaLabel: "Opacity",
              valuePercent: draftHsla.a,
              style: {
                background: `${trnColorCssBackground(opaquePreview)}`
              },
              onChange: (alpha) => {
                commitDraft({ a: alpha });
              }
            }
          )
        ] }) : null,
        eyedropperSupported ? /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "inline-flex w-full items-center justify-center gap-1.5 rounded border border-white/12 bg-white/6 px-2 py-1.5 text-[11px] text-zinc-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
            disabled: eyedropperBusy || disabled,
            "aria-label": "Pick color from screen",
            onClick: () => {
              void handleEyedropperPick();
            },
            children: [
              /* @__PURE__ */ jsx(Pipette, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true }),
              "Pick from screen"
            ]
          }
        ) : null,
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 border-t border-white/8 pt-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "inline-flex items-center justify-center gap-1 rounded border border-white/12 bg-white/6 px-2.5 py-1 text-[11px] text-zinc-100 hover:bg-white/10",
              onClick: () => setOpen(false),
              children: [
                /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                " Close"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "inline-flex items-center justify-center gap-1 rounded border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/15",
              onClick: applyHexDraft,
              children: [
                /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                " Apply"
              ]
            }
          )
        ] })
      ] }) })
    }
  ) : null;
  const triggerSwatchStyle = enableAlpha ? { background: trnColorCssBackground(normalizedHex) } : { backgroundColor: normalizedHex.slice(0, 7) };
  const swatchTrigger = triggerVariant === "swatch" ? /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      "aria-label": ariaLabel,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      disabled,
      onClick: () => {
        if (!disabled) setOpen((v) => !v);
      },
      className: twMerge(
        "nodrag inline-flex h-[22px] w-[22px] shrink-0 cursor-pointer overflow-hidden rounded-sm border border-zinc-600/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-50",
        open ? "ring-1 ring-white/20" : ""
      ),
      style: triggerSwatchStyle
    }
  ) : null;
  const fieldTrigger = triggerVariant === "field" ? /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      "aria-label": ariaLabel,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      disabled,
      onClick: () => {
        if (!disabled) setOpen((v) => !v);
      },
      className: twMerge(
        "inline-flex w-full items-center justify-between gap-2 rounded-md border border-white/15 bg-black/55 px-2.5 text-xs font-medium text-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:bg-black/65 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50",
        triggerPad
      ),
      children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex min-w-0 items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "inline-flex h-3.5 w-3.5 shrink-0 overflow-hidden rounded-sm border border-zinc-700/80",
              style: triggerSwatchStyle,
              "aria-hidden": true
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate", children: label ?? normalizedHex })
        ] }),
        /* @__PURE__ */ jsx(Pipette, { className: "h-3.5 w-3.5 shrink-0 text-zinc-400", strokeWidth: 2.25, "aria-hidden": true })
      ]
    }
  ) : null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: rootRef,
      className: twMerge(
        triggerVariant === "swatch" ? "relative inline-flex" : "relative w-full",
        className
      ),
      children: [
        swatchTrigger ?? fieldTrigger,
        menuPanel != null && portalTarget != null ? createPortal(menuPanel, portalTarget) : null
      ]
    }
  );
}
var glassBase = "inline-flex shrink-0 items-center justify-center rounded-md border shadow-sm backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
var colorClasses = {
  gray: "border-white/12 bg-white/[0.06] text-zinc-100 hover:bg-white/[0.10] active:bg-white/[0.13]",
  blue: "border-blue-400/22 bg-blue-500/[0.14] text-blue-100 hover:bg-blue-500/22 active:bg-blue-500/28",
  red: "border-red-400/25 bg-red-500/[0.14] text-red-100 hover:bg-red-500/22 active:bg-red-500/28",
  emerald: "border-emerald-400/22 bg-emerald-500/[0.14] text-emerald-100 hover:bg-emerald-500/22 active:bg-emerald-500/28",
  amber: "border-amber-400/25 bg-amber-500/[0.14] text-amber-100 hover:bg-amber-500/22 active:bg-amber-500/28",
  violet: "border-violet-400/22 bg-violet-500/[0.14] text-violet-100 hover:bg-violet-500/22 active:bg-violet-500/28"
};
var sizeClasses = {
  sm: "px-2 py-[3px] text-xs font-medium gap-1.5",
  md: "px-3 py-1.5 text-sm font-medium gap-2",
  control: "box-border min-h-9 h-9 px-3 py-0 text-sm font-medium gap-2 leading-normal"
};
var GlassButton = React.forwardRef(function GlassButton2({
  color = "gray",
  size = "sm",
  className,
  disabled,
  children,
  icon,
  type = "button",
  ...rest
}, ref) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref,
      type,
      disabled,
      className: twMerge(
        glassBase,
        sizeClasses[size],
        colorClasses[color],
        className
      ),
      ...rest,
      children: [
        icon,
        children
      ]
    }
  );
});
GlassButton.displayName = "GlassButton";
var toneToColorMap = {
  neutral: "gray",
  info: "blue",
  danger: "red",
  success: "emerald",
  warning: "amber",
  accent: "violet"
};
function resolveSize(size) {
  if (size === "compact") {
    return "sm";
  }
  if (size === "default") {
    return "md";
  }
  if (size === "control" || size === "sm" || size === "md") {
    return size;
  }
  return "sm";
}
function TRNGlassButton(props) {
  const { tone = "neutral", color, size, trnSize, ...rest } = props;
  return /* @__PURE__ */ jsx(
    GlassButton,
    {
      ...rest,
      color: color ?? toneToColorMap[tone],
      size: resolveSize(trnSize ?? size ?? "sm")
    }
  );
}
var VIEWPORT_PAD_PX = 12;
function clamp6(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}
function clampDialogRect(left, top, width, height) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxHeight = Math.max(160, vh - VIEWPORT_PAD_PX * 2);
  const usedHeight = Math.min(height, maxHeight);
  return {
    left: clamp6(left, VIEWPORT_PAD_PX, Math.max(VIEWPORT_PAD_PX, vw - width - VIEWPORT_PAD_PX)),
    top: clamp6(top, VIEWPORT_PAD_PX, Math.max(VIEWPORT_PAD_PX, vh - usedHeight - VIEWPORT_PAD_PX)),
    maxHeight
  };
}
function TRNContextDialog(props) {
  const {
    open,
    onOpenChange,
    title,
    anchor,
    widthPx = 420,
    zIndex = 2400,
    panelClassName,
    children
  } = props;
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const panelRef = useRef(null);
  const [rect, setRect] = useState(null);
  const rectRef = useRef(rect);
  rectRef.current = rect;
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const placedForAnchorRef = useRef(null);
  const dragCleanupRef = useRef(null);
  useLayoutEffect(() => {
    if (!open || anchor == null || typeof window === "undefined") {
      setRect(null);
      placedForAnchorRef.current = null;
      return;
    }
    const preferredFromAnchor = (height) => {
      const preferredTop = anchor.y + 8;
      const flippedTop = anchor.y - height - 8;
      const vh = window.innerHeight;
      if (preferredTop + height > vh - VIEWPORT_PAD_PX && flippedTop >= VIEWPORT_PAD_PX) {
        return flippedTop;
      }
      return preferredTop;
    };
    const update = (mode) => {
      if (dragRef.current != null) return;
      const panel2 = panelRef.current;
      const height = panel2?.offsetHeight && panel2.offsetHeight > 0 ? panel2.offsetHeight : 480;
      const current = rectRef.current;
      const sameAnchor2 = placedForAnchorRef.current != null && placedForAnchorRef.current.x === anchor.x && placedForAnchorRef.current.y === anchor.y;
      if (mode === "place" || current == null || !sameAnchor2) {
        placedForAnchorRef.current = { x: anchor.x, y: anchor.y };
        setRect(clampDialogRect(anchor.x, preferredFromAnchor(height), widthPx, height));
        return;
      }
      setRect(clampDialogRect(current.left, current.top, widthPx, height));
    };
    const sameAnchor = placedForAnchorRef.current != null && placedForAnchorRef.current.x === anchor.x && placedForAnchorRef.current.y === anchor.y;
    update(sameAnchor && rectRef.current != null ? "clamp" : "place");
    const panel = panelRef.current;
    const ro = panel != null && typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => update("clamp")) : null;
    if (panel != null && ro != null) {
      ro.observe(panel);
    }
    const onWinResize = () => update("clamp");
    window.addEventListener("resize", onWinResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onWinResize);
    };
  }, [anchor, open, widthPx]);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (dragRef.current != null) return;
      if (panelRef.current?.contains(e.target)) return;
      if (isEventInsideTrnFloatingLayer(e.target)) return;
      onOpenChange(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onOpenChange, open]);
  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
      dragCleanupRef.current = null;
    };
  }, []);
  const endDrag = () => {
    dragCleanupRef.current?.();
    dragCleanupRef.current = null;
    dragRef.current = null;
    setDragging(false);
  };
  const onHeaderPointerDown = (e) => {
    if (e.button !== 0) return;
    const current = rectRef.current ?? clampDialogRect(
      VIEWPORT_PAD_PX,
      VIEWPORT_PAD_PX,
      widthPx,
      panelRef.current?.offsetHeight ?? 480
    );
    e.preventDefault();
    e.stopPropagation();
    const pointerId = e.pointerId;
    dragRef.current = {
      pointerId,
      originX: e.clientX,
      originY: e.clientY,
      startLeft: current.left,
      startTop: current.top
    };
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(pointerId);
    } catch {
    }
    const onMove = (ev) => {
      const drag = dragRef.current;
      if (drag == null || ev.pointerId !== drag.pointerId) return;
      const panel = panelRef.current;
      const height = panel?.offsetHeight ?? 480;
      const next = clampDialogRect(
        drag.startLeft + (ev.clientX - drag.originX),
        drag.startTop + (ev.clientY - drag.originY),
        widthPx,
        height
      );
      rectRef.current = next;
      setRect(next);
    };
    const onUp = (ev) => {
      if (ev.pointerId !== pointerId) return;
      endDrag();
    };
    dragCleanupRef.current?.();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    dragCleanupRef.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      try {
        if (e.currentTarget.hasPointerCapture(pointerId)) {
          e.currentTarget.releasePointerCapture(pointerId);
        }
      } catch {
      }
    };
  };
  if (!open || anchor == null || portalTarget == null) {
    return null;
  }
  const style = {
    top: rect?.top ?? VIEWPORT_PAD_PX,
    left: rect?.left ?? VIEWPORT_PAD_PX,
    width: widthPx,
    maxHeight: rect?.maxHeight ?? `calc(100vh - ${VIEWPORT_PAD_PX * 2}px)`
  };
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "pointer-events-none fixed inset-0",
        style: { zIndex },
        "aria-hidden": false,
        children: /* @__PURE__ */ jsx(
          "div",
          {
            ref: panelRef,
            role: "dialog",
            "aria-label": title,
            "aria-modal": "false",
            className: "pointer-events-auto fixed flex flex-col",
            style,
            onClick: (e) => e.stopPropagation(),
            children: /* @__PURE__ */ jsxs(
              "div",
              {
                className: twMerge(
                  "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-zinc-700/85 bg-zinc-900/70 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm",
                  panelClassName
                ),
                children: [
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: twMerge(
                        "flex shrink-0 select-none items-center justify-between gap-2 border-b border-zinc-700/80 bg-linear-to-r from-zinc-900/70 to-zinc-800/55 py-1 pl-3 pr-1.5"
                      ),
                      children: [
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: twMerge(
                              "flex min-w-0 flex-1 touch-none items-center py-0.5",
                              dragging ? "cursor-grabbing" : "cursor-grab"
                            ),
                            onPointerDown: onHeaderPointerDown,
                            children: /* @__PURE__ */ jsx("div", { className: "min-w-0 truncate text-xs font-semibold text-zinc-100", children: title })
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            className: "inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border border-red-500/35 bg-red-500/20 text-red-200/90 transition-colors hover:border-red-500/50 hover:bg-red-500/30 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/35",
                            "aria-label": "Close dialog",
                            onPointerDown: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              endDrag();
                              onOpenChange(false);
                            },
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              endDrag();
                              onOpenChange(false);
                            },
                            children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4", "aria-hidden": true, strokeWidth: 2.25 })
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto px-3 py-2 scrollbar-hide", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children }) })
                ]
              }
            )
          }
        )
      }
    ),
    portalTarget
  );
}
function clampTrnNumberToRange(n, min, max) {
  let x = n;
  if (typeof min === "number" && Number.isFinite(min)) {
    x = Math.max(min, x);
  }
  if (typeof max === "number" && Number.isFinite(max)) {
    x = Math.min(max, x);
  }
  return x;
}
function isTrnNumberOutOfRange(n, min, max) {
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
function coerceNumber(input, fallback) {
  const v = Number(input);
  return Number.isFinite(v) ? v : fallback;
}
function commitTrnScrubDraftText(raw, fallback, _min, _max) {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return fallback;
  }
  return coerceNumber(trimmed, fallback);
}
var TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX = 1;
var TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT = 12;
var TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT = 6;
var TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD = 80;
var TRN_SCRUB_INTERACTION_END_EVENT = "trn-scrub-interaction-end";
function notifyTrnScrubInteractionEnd(onChangeEnd) {
  try {
    onChangeEnd?.();
  } catch {
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TRN_SCRUB_INTERACTION_END_EVENT));
  }
}
function finiteSpan(min, max) {
  if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }
  const span = max - min;
  return span > 0 ? span : null;
}
function coerceTrnScrubActivationThresholdPx(raw) {
  if (raw == null || !Number.isFinite(raw) || raw < 0) {
    return TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX;
  }
  if (raw === 4) {
    return TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX;
  }
  return raw;
}
function coerceTrnScrubDragPxPerStep(raw, fallback) {
  if (raw == null || !Number.isFinite(raw) || raw <= 0) {
    return fallback;
  }
  if (raw >= 40) {
    return Math.max(1, raw / 8);
  }
  return raw;
}
function resolveTrnScrubDragStepUnit(step, min, max, valueAtPointerDown, scrubEpsilon) {
  const explicit = typeof step === "number" && Number.isFinite(step) && step > 0 ? step : null;
  const span = finiteSpan(min, max);
  if (span != null) {
    const fromSpan = span * 0.06;
    return Math.max(explicit ?? 0, fromSpan, scrubEpsilon);
  }
  if (explicit != null) {
    const fromValue = Math.max(Math.abs(valueAtPointerDown) * 0.06, scrubEpsilon);
    return Math.max(explicit, fromValue);
  }
  return Math.max(Math.abs(valueAtPointerDown) * 0.06, scrubEpsilon);
}
function trnFractionDigitsFromStep(step) {
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
function computeTrnScrubDisplayDecimals(min, max, step = 0.01, fractionDigitsOverride) {
  if (fractionDigitsOverride != null && Number.isFinite(fractionDigitsOverride) && fractionDigitsOverride >= 0) {
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
function formatTrnScrubDisplayValue(value, decimals, nearZeroEps) {
  if (!Number.isFinite(value)) {
    return 0 .toFixed(decimals);
  }
  if (Math.abs(value) < nearZeroEps) {
    return 0 .toFixed(decimals);
  }
  return value.toFixed(decimals);
}
function wheelModifier(e) {
  let mod = 1;
  if (e.shiftKey) {
    mod *= 0.1;
  }
  if (e.ctrlKey || e.metaKey) {
    mod *= 10;
  }
  return mod;
}
var TRN_SCRUB_CURSOR_NONE_CLASS = "trn-scrub-pointer-hidden";
var trnScrubCursorStyleInstalled = false;
function ensureTrnScrubCursorStyle() {
  if (trnScrubCursorStyleInstalled || typeof document === "undefined") {
    return;
  }
  trnScrubCursorStyleInstalled = true;
  const style = document.createElement("style");
  style.setAttribute("data-trn-scrub-cursor", "1");
  style.textContent = `html.${TRN_SCRUB_CURSOR_NONE_CLASS},html.${TRN_SCRUB_CURSOR_NONE_CLASS} *{cursor:none!important;}`;
  document.head.appendChild(style);
}
function setTrnScrubCursorHidden(hidden) {
  if (typeof document === "undefined") {
    return;
  }
  if (hidden) {
    ensureTrnScrubCursorStyle();
  }
  document.documentElement.classList.toggle(TRN_SCRUB_CURSOR_NONE_CLASS, hidden);
}
function TRNScrubNumberInput(props) {
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
    onChangeEnd
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
    [effectiveStep, fractionDigits, max, min]
  );
  const nearZeroEps = useMemo(
    () => 10 ** -(displayDecimals + 1),
    [displayDecimals]
  );
  const formattedBlurred = useMemo(() => {
    const v = Number.isFinite(value) ? value : 0;
    return formatTrnScrubDisplayValue(v, displayDecimals, nearZeroEps);
  }, [displayDecimals, nearZeroEps, value]);
  useMemo(() => {
    const v = Number.isFinite(value) ? value : 0;
    return String(v);
  }, [value]);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(formattedBlurred);
  const draftRef = useRef(draft);
  const sessionRef = useRef(null);
  const moveCleanupRef = useRef(null);
  const wheelPixelAccumRef = useRef(0);
  const inputRef = useRef(null);
  const suppressBlurCommitRef = useRef(false);
  const detachWindowListeners = useCallback(() => {
    moveCleanupRef.current?.();
    moveCleanupRef.current = null;
  }, []);
  const applyScrubDelta = useCallback(
    (e, s) => {
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      let mod = 1;
      if (e.shiftKey) {
        mod *= 0.1;
      }
      if (e.ctrlKey || e.metaKey) {
        mod *= 10;
      }
      const stepUnit = resolveTrnScrubDragStepUnit(
        step,
        min,
        max,
        s.v0,
        scrubEpsilon
      );
      const hPx = Math.max(
        coerceTrnScrubDragPxPerStep(
          horizontalPxPerTenthPercent,
          TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT
        ),
        1e-6
      );
      const vPx = Math.max(
        coerceTrnScrubDragPxPerStep(
          verticalPxPerPercent,
          TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT
        ),
        1e-6
      );
      const delta = mod * stepUnit * (dx / hPx + -dy / vPx);
      onChange(s.v0 + delta);
    },
    [
      horizontalPxPerTenthPercent,
      max,
      min,
      onChange,
      scrubEpsilon,
      step,
      verticalPxPerPercent
    ]
  );
  const setDraftFromNumber = useCallback(
    (n) => {
      const v = Number.isFinite(n) ? n : 0;
      const next = formatTrnScrubDisplayValue(v, displayDecimals, nearZeroEps);
      draftRef.current = next;
      setDraft(next);
    },
    [displayDecimals, nearZeroEps]
  );
  const commitDraftText = useCallback(
    (raw) => {
      onChange(commitTrnScrubDraftText(raw, Number.isFinite(value) ? value : 0));
    },
    [onChange, value]
  );
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
  const onPointerDown = (e) => {
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
      cursorHidden: false
    };
    const endScrubCursor = (s) => {
      if (s.cursorHidden) {
        setTrnScrubCursorHidden(false);
        s.cursorHidden = false;
      }
    };
    const onMove = (evt) => {
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
        }
        evt.preventDefault();
        suppressBlurCommitRef.current = true;
        if (document.activeElement === s.target) {
          s.target.blur();
        }
        setTrnScrubCursorHidden(true);
        s.cursorHidden = true;
        applyScrubDelta(evt, s);
        return;
      }
      evt.preventDefault();
      applyScrubDelta(evt, s);
    };
    const onUpOrCancel = (evt) => {
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
  const onKeyDown = (e) => {
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
      commitDraftText(focused ? draftRef.current : e.currentTarget.value);
      suppressBlurCommitRef.current = true;
      e.currentTarget.blur();
    }
  };
  const onWheelNative = useCallback(
    (e) => {
      if (!pointerScrubEnabled || !wheelEnabled || disabled || locked) {
        return;
      }
      if (e.deltaY === 0) {
        return;
      }
      if (wheelRequiresAlt && !e.altKey) {
        return;
      }
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
          const next2 = (Number.isFinite(value) ? value : 0) + dir * stepAbs;
          if (next2 !== value) {
            onChange(next2);
            setDraftFromNumber(next2);
          }
          return;
        }
        wheelPixelAccumRef.current += e.deltaY;
        const thr = Math.max(1, wheelPixelAccumThreshold);
        let v = Number.isFinite(value) ? value : 0;
        let changed = false;
        while (Math.abs(wheelPixelAccumRef.current) >= thr) {
          let dir;
          if (wheelPixelAccumRef.current > 0) {
            wheelPixelAccumRef.current -= thr;
            dir = -1;
          } else {
            wheelPixelAccumRef.current += thr;
            dir = 1;
          }
          const next2 = v + dir * stepAbs;
          if (next2 !== v) {
            changed = true;
          }
          v = next2;
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
      wheelRequiresAlt
    ]
  );
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelNative);
    };
  }, [onWheelNative]);
  const readOnly = locked;
  const displayStr = focused ? draft : formattedBlurred;
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      id,
      type: "text",
      size: 1,
      inputMode: "decimal",
      "aria-label": ariaLabel,
      "aria-readonly": locked ? true : void 0,
      "data-trn-scrub-input": "1",
      className: twMerge(
        "nodrag nopan nowheel [-moz-appearance:textfield] min-w-0 w-full appearance-none bg-transparent text-right text-[11px] text-zinc-100 outline-none",
        "[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none",
        "[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
        focused ? "select-text" : "select-none",
        locked ? "cursor-not-allowed text-zinc-400" : pointerScrubEnabled ? "cursor-ew-resize" : "cursor-text",
        inputClassName,
        className.length > 0 ? className : false
      ),
      value: displayStr,
      disabled,
      readOnly,
      autoComplete: "off",
      spellCheck: false,
      onFocus: (e) => {
        if (locked || disabled) {
          return;
        }
        suppressBlurCommitRef.current = false;
        setFocused(true);
        onEditingChange?.(true);
        draftRef.current = formattedBlurred;
        setDraft(formattedBlurred);
        const el = e.currentTarget;
        requestAnimationFrame(() => {
          if (document.activeElement === el) {
            el.select();
          }
        });
      },
      onBlur: (e) => {
        wheelPixelAccumRef.current = 0;
        if (!locked && !disabled && !suppressBlurCommitRef.current) {
          commitDraftText(focused ? draftRef.current : e.currentTarget.value);
        }
        suppressBlurCommitRef.current = false;
        setFocused(false);
        onEditingChange?.(false);
      },
      onPointerDown,
      onChange: (ev) => {
        if (locked) {
          return;
        }
        const raw = ev.currentTarget.value;
        draftRef.current = raw;
        setDraft(raw);
      },
      onKeyDown
    }
  );
}
var THUMB_PX = 12;
function snapToStepInRange(raw, min, max, step) {
  const clamped = clampTrnNumberToRange(raw, min, max);
  if (typeof step !== "number" || !Number.isFinite(step) || step <= 0) {
    return clamped;
  }
  const snapped = min + Math.round((clamped - min) / step) * step;
  return clampTrnNumberToRange(snapped, min, max);
}
function valueToThumbPercent(value, min, max) {
  const span = max - min;
  if (!(span > 0) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, (value - min) / span * 100));
}
function thumbCenterStyle(percent) {
  const t = Math.min(100, Math.max(0, percent)) / 100;
  return `calc(${THUMB_PX / 2}px + ${t} * (100% - ${THUMB_PX}px))`;
}
function TRNScrubSliderRail(props) {
  const {
    value,
    min,
    max,
    step,
    disabled = false,
    locked = false,
    onChange,
    onChangeEnd,
    className,
    ariaLabel
  } = props;
  const trackRef = useRef(null);
  const draggingRef = useRef(false);
  const inert = disabled || locked;
  const thumbPct = valueToThumbPercent(value, min, max);
  const center = thumbCenterStyle(thumbPct);
  const applyFromClientX = useCallback(
    (clientX) => {
      const el = trackRef.current;
      if (el == null) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const usable = rect.width - THUMB_PX;
      if (usable <= 0) {
        return;
      }
      const t = Math.min(1, Math.max(0, (clientX - rect.left - THUMB_PX / 2) / usable));
      const raw = min + t * (max - min);
      onChange(snapToStepInRange(raw, min, max, step));
    },
    [max, min, onChange, step]
  );
  const onPointerDown = (e) => {
    if (inert || e.button !== 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    applyFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (inert || !e.currentTarget.hasPointerCapture(e.pointerId)) {
      return;
    }
    e.preventDefault();
    applyFromClientX(e.clientX);
  };
  const onPointerUp = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (draggingRef.current) {
      draggingRef.current = false;
      notifyTrnScrubInteractionEnd(onChangeEnd);
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: trackRef,
      role: "slider",
      "aria-label": ariaLabel,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": Number.isFinite(value) ? clampTrnNumberToRange(value, min, max) : min,
      "aria-disabled": inert || void 0,
      className: twMerge(
        "relative h-3.5 w-full min-w-0 cursor-pointer touch-none select-none overflow-visible",
        inert && "cursor-not-allowed opacity-45",
        className
      ),
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zinc-800/85",
            style: { left: THUMB_PX / 2, right: THUMB_PX / 2 }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-emerald-500/55",
            style: { left: THUMB_PX / 2, width: `calc(${thumbPct / 100} * (100% - ${THUMB_PX}px))` }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/50 bg-[rgba(16,185,129,0.72)] shadow-[0_0_0_2px_rgba(8,12,20,0.95)]",
            style: { left: center }
          }
        )
      ]
    }
  );
}
var VIEWPORT_PADDING_PX = 8;
var GAP_BELOW_TRIGGER_PX = 4;
function computeFixedMenuPlacement(anchorRect, panelWidth, panelHeight, preferAlign, padding = VIEWPORT_PADDING_PX) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxLeft = Math.max(padding, viewportWidth - padding - panelWidth);
  const spaceOnRight = viewportWidth - padding - anchorRect.left;
  const spaceOnLeft = anchorRect.right - padding;
  const alignRight = preferAlign === "right" || preferAlign === "left" && panelWidth > spaceOnRight && spaceOnLeft >= spaceOnRight;
  let left = alignRight ? anchorRect.right - panelWidth : anchorRect.left;
  left = Math.min(Math.max(left, padding), maxLeft);
  let top = anchorRect.bottom + GAP_BELOW_TRIGGER_PX;
  const maxTop = Math.max(padding, viewportHeight - padding - panelHeight);
  if (top + panelHeight > viewportHeight - padding) {
    const aboveTop = anchorRect.top - GAP_BELOW_TRIGGER_PX - panelHeight;
    if (aboveTop >= padding) {
      top = aboveTop;
    } else {
      top = Math.min(top, maxTop);
    }
  }
  top = Math.min(Math.max(top, padding), maxTop);
  return { top, left };
}
function computeFixedCursorMenuPlacement(cursorX, cursorY, panelWidth, panelHeight, padding = VIEWPORT_PADDING_PX) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.max(0, panelWidth);
  const height = Math.max(0, panelHeight);
  const maxLeft = Math.max(padding, viewportWidth - padding - width);
  const maxTop = Math.max(padding, viewportHeight - padding - height);
  let left = cursorX;
  if (left + width > viewportWidth - padding) {
    left = cursorX - width;
  }
  let top = cursorY;
  if (top + height > viewportHeight - padding) {
    top = cursorY - height;
  }
  left = Math.min(Math.max(left, padding), maxLeft);
  top = Math.min(Math.max(top, padding), maxTop);
  return { top, left };
}
function useFixedMenuAnchor(open, anchorRef, preferAlign) {
  const panelRef = useRef(null);
  const [placement, setPlacement] = useState(null);
  useLayoutEffect(() => {
    if (!open || anchorRef.current == null) {
      setPlacement(null);
      return;
    }
    let rafId = 0;
    let resizeObserver = null;
    const attachPanelObserver = () => {
      const panel = panelRef.current;
      if (panel == null || resizeObserver != null) {
        return;
      }
      resizeObserver = new ResizeObserver(() => {
        update();
      });
      resizeObserver.observe(panel);
    };
    const update = () => {
      const anchor = anchorRef.current;
      if (anchor == null) {
        setPlacement(null);
        return;
      }
      const anchorRect = anchor.getBoundingClientRect();
      const panel = panelRef.current;
      const panelWidth = panel?.offsetWidth ?? 0;
      const panelHeight = panel?.offsetHeight ?? 0;
      if (panelWidth <= 0 || panelHeight <= 0) {
        setPlacement({
          top: anchorRect.bottom + GAP_BELOW_TRIGGER_PX,
          left: preferAlign === "right" ? anchorRect.right : anchorRect.left,
          positioned: false
        });
        attachPanelObserver();
        rafId = window.requestAnimationFrame(update);
        return;
      }
      const { top, left } = computeFixedMenuPlacement(
        anchorRect,
        panelWidth,
        panelHeight,
        preferAlign
      );
      setPlacement({ top, left, positioned: true });
      attachPanelObserver();
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      resizeObserver = null;
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef, open, preferAlign]);
  return { placement, panelRef };
}

// src/trnScrubNumberFieldStorage.ts
var TRN_SCRUB_NUMBER_FIELD_STORAGE_PREFIX = "trn-scrub-number-field:";
var TRN_SCRUB_NUMBER_FIELD_GLOBAL_STORAGE_KEY = `${TRN_SCRUB_NUMBER_FIELD_STORAGE_PREFIX}__global__`;
var TRN_SCRUB_GLOBAL_SETTINGS_EVENT = "trn-scrub-global-settings";
function getTrnScrubNumberFieldStorageKey(key) {
  return `${TRN_SCRUB_NUMBER_FIELD_STORAGE_PREFIX}${key}`;
}
function parseJsonObject(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
function loadTrnScrubNumberFieldLocalSettings(key) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const parsed = parseJsonObject(
      localStorage.getItem(getTrnScrubNumberFieldStorageKey(key))
    );
    if (!parsed || parsed.version !== 1) {
      return null;
    }
    const valueRules = parsed.valueRules && typeof parsed.valueRules === "object" ? parsed.valueRules : void 0;
    const appearance = parsed.appearance;
    const controlStyle = typeof parsed.controlStyle === "string" ? parsed.controlStyle : appearance?.controlStyle;
    return {
      version: 1,
      valueRules,
      controlStyle: controlStyle === "scrub" || controlStyle === "slider" ? controlStyle : void 0
    };
  } catch (error) {
    console.warn("Failed to load TRN scrub number field local settings:", error);
    return null;
  }
}
function saveTrnScrubNumberFieldLocalSettings(key, settings) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      getTrnScrubNumberFieldStorageKey(key),
      JSON.stringify({
        version: 1,
        valueRules: settings.valueRules,
        controlStyle: settings.controlStyle
      })
    );
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, cannot save scrub local settings");
    } else {
      console.warn("Failed to save TRN scrub number field local settings:", error);
    }
  }
}
function loadTrnScrubNumberFieldGlobalSettings() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const parsed = parseJsonObject(
      localStorage.getItem(TRN_SCRUB_NUMBER_FIELD_GLOBAL_STORAGE_KEY)
    );
    if (parsed && parsed.version === 1) {
      return parsed;
    }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k == null || !k.startsWith(TRN_SCRUB_NUMBER_FIELD_STORAGE_PREFIX) || k === TRN_SCRUB_NUMBER_FIELD_GLOBAL_STORAGE_KEY) {
        continue;
      }
      const legacy = parseJsonObject(localStorage.getItem(k));
      if (!legacy || legacy.version !== 1) continue;
      const appearance = legacy.appearance;
      const interaction = legacy.interaction;
      if (appearance == null && interaction == null) continue;
      const migrated = {
        version: 1,
        appearance: appearance && typeof appearance === "object" ? {
          variant: appearance.variant,
          inFieldFillWhenBounded: appearance.inFieldFillWhenBounded,
          inFieldFillStyle: appearance.inFieldFillStyle,
          inFieldFillGradient: appearance.inFieldFillGradient,
          stepButtonsVisibility: appearance.stepButtonsVisibility,
          lockIconVisibility: appearance.lockIconVisibility,
          resetIconVisibility: appearance.resetIconVisibility,
          clearIconVisibility: appearance.clearIconVisibility
        } : void 0,
        interaction: interaction && typeof interaction === "object" ? interaction : void 0
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
function saveTrnScrubNumberFieldGlobalSettings(settings) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      TRN_SCRUB_NUMBER_FIELD_GLOBAL_STORAGE_KEY,
      JSON.stringify(settings)
    );
    window.dispatchEvent(
      new CustomEvent(TRN_SCRUB_GLOBAL_SETTINGS_EVENT, { detail: settings })
    );
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, cannot save scrub global settings");
    } else {
      console.warn("Failed to save TRN scrub number field global settings:", error);
    }
  }
}

// src/trnScrubInFieldFill.ts
var CYAN = "#22d3ee";
var TRN_SCRUB_IN_FIELD_FILL_STOP_MIN = 2;
var TRN_SCRUB_IN_FIELD_FILL_STOP_MAX = 4;
var TRN_SCRUB_IN_FIELD_FILL_PRESETS = {
  solid: {
    angleDeg: 90,
    stops: [
      { at: 0, colorHex: CYAN, alpha: 0.14 },
      { at: 100, colorHex: CYAN, alpha: 0.14 }
    ]
  },
  "soft-gradient": {
    angleDeg: 90,
    stops: [
      { at: 0, colorHex: CYAN, alpha: 0.26 },
      { at: 52, colorHex: CYAN, alpha: 0.12 },
      { at: 100, colorHex: CYAN, alpha: 0.05 }
    ]
  },
  "edge-fade": {
    angleDeg: 90,
    stops: [
      { at: 0, colorHex: CYAN, alpha: 0.18 },
      { at: 58, colorHex: CYAN, alpha: 0.14 },
      { at: 100, colorHex: CYAN, alpha: 0 }
    ]
  }
};
var TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT = TRN_SCRUB_IN_FIELD_FILL_PRESETS["soft-gradient"];
function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
function clampPct(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
function clampAngle(n) {
  if (!Number.isFinite(n)) return 90;
  const wrapped = (n % 360 + 360) % 360;
  return wrapped;
}
function hexToRgb(hex) {
  const n = normalizeTrnColorHex(hex, CYAN);
  const raw = n.slice(1);
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16)
  };
}
function clampTrnScrubInFieldFillStop(stop, fallback) {
  return {
    at: clampPct(typeof stop?.at === "number" ? stop.at : fallback.at),
    colorHex: normalizeTrnColorHex(stop?.colorHex ?? fallback.colorHex, fallback.colorHex),
    alpha: clamp01(typeof stop?.alpha === "number" ? stop.alpha : fallback.alpha)
  };
}
function clampTrnScrubInFieldFillGradient(value) {
  const base = TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT;
  const rawStops = Array.isArray(value?.stops) ? value.stops : base.stops;
  const fallbackStops = base.stops;
  const clamped = rawStops.slice(0, TRN_SCRUB_IN_FIELD_FILL_STOP_MAX).map(
    (s, i) => clampTrnScrubInFieldFillStop(s, fallbackStops[Math.min(i, fallbackStops.length - 1)])
  ).sort((a, b) => a.at - b.at);
  while (clamped.length < TRN_SCRUB_IN_FIELD_FILL_STOP_MIN) {
    const last = clamped[clamped.length - 1] ?? fallbackStops[0];
    clamped.push({
      at: 100,
      colorHex: last.colorHex,
      alpha: last.alpha
    });
  }
  return {
    angleDeg: clampAngle(value?.angleDeg ?? base.angleDeg),
    stops: clamped
  };
}
function cloneTrnScrubInFieldFillPreset(style) {
  const preset = TRN_SCRUB_IN_FIELD_FILL_PRESETS[style];
  return clampTrnScrubInFieldFillGradient({
    angleDeg: preset.angleDeg,
    stops: preset.stops.map((s) => ({ ...s }))
  });
}
function stopToRgba(stop) {
  const { r, g, b } = hexToRgb(stop.colorHex);
  const a = Math.round(stop.alpha * 1e3) / 1e3;
  return `rgba(${r},${g},${b},${a})`;
}
function trnScrubInFieldFillPaint(_style, custom) {
  const gradient = clampTrnScrubInFieldFillGradient(custom);
  const stops = gradient.stops;
  const uniform = stops.length >= 2 && stops.every(
    (s) => s.colorHex.toLowerCase() === stops[0].colorHex.toLowerCase() && Math.abs(s.alpha - stops[0].alpha) < 1e-6
  );
  if (uniform) {
    return { backgroundColor: stopToRgba(stops[0]) };
  }
  const parts = stops.map((s) => `${stopToRgba(s)} ${s.at}%`).join(", ");
  return {
    backgroundImage: `linear-gradient(${gradient.angleDeg}deg, ${parts})`
  };
}
function trnScrubInFieldFillPreviewStyle(gradient) {
  const g = clampTrnScrubInFieldFillGradient(gradient);
  const parts = g.stops.map((s) => `${stopToRgba(s)} ${s.at}%`).join(", ");
  return {
    backgroundImage: `linear-gradient(${g.angleDeg}deg, ${parts})`
  };
}
var SECTION_TITLE = "m-0 text-[10px] font-semibold uppercase tracking-wide text-zinc-500";
var SCOPE_BANNER = "m-0 rounded-md border border-zinc-700/60 bg-zinc-950/50 px-2 py-1.5 text-[10px] leading-snug text-zinc-400";
var ROW = "flex min-w-0 items-center justify-between gap-3";
var LABEL = "min-w-0 shrink text-[11px] leading-tight text-zinc-300";
var CHOICE_WRAP = "inline-flex max-w-[min(100%,18rem)] flex-wrap justify-end gap-1";
var CHOICE_BTN = "inline-flex h-6 min-w-10 items-center justify-center rounded-sm border px-2 text-xs font-medium text-zinc-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50";
var FILL_DIRECTION_PRESETS = [
  {
    angleDeg: 0,
    label: "Bottom to top",
    icon: /* @__PURE__ */ jsx(ArrowUp, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 2.25 })
  },
  {
    angleDeg: 45,
    label: "Diagonal up-right",
    icon: /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 2.25 })
  },
  {
    angleDeg: 90,
    label: "Left to right",
    icon: /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 2.25 })
  },
  {
    angleDeg: 135,
    label: "Diagonal down-right",
    icon: /* @__PURE__ */ jsx(ArrowDownRight, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 2.25 })
  },
  {
    angleDeg: 180,
    label: "Top to bottom",
    icon: /* @__PURE__ */ jsx(ArrowDown, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 2.25 })
  },
  {
    angleDeg: 225,
    label: "Diagonal down-left",
    icon: /* @__PURE__ */ jsx(ArrowDownLeft, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 2.25 })
  },
  {
    angleDeg: 270,
    label: "Right to left",
    icon: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 2.25 })
  },
  {
    angleDeg: 315,
    label: "Diagonal up-left",
    icon: /* @__PURE__ */ jsx(ArrowUpLeft, { className: "h-3.5 w-3.5", "aria-hidden": true, strokeWidth: 2.25 })
  }
];
var VISIBILITY_OPTIONS = [
  { id: "hidden", label: "Off" },
  { id: "always", label: "Always" },
  { id: "hover", label: "Hover" }
];
function nearestFillDirectionAngle(angleDeg) {
  const wrapped = (angleDeg % 360 + 360) % 360;
  for (const preset of FILL_DIRECTION_PRESETS) {
    const delta = Math.abs(wrapped - preset.angleDeg);
    if (Math.min(delta, 360 - delta) <= 0.5) {
      return preset.angleDeg;
    }
  }
  return null;
}
function ChoiceGroup(props) {
  return /* @__PURE__ */ jsx("div", { className: CHOICE_WRAP, role: "radiogroup", "aria-label": props.ariaLabel, children: props.options.map((o) => {
    const active = props.value === o.id;
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        role: "radio",
        "aria-checked": active,
        className: twMerge(
          CHOICE_BTN,
          active ? "border-cyan-500/45 bg-cyan-500/18 text-cyan-100" : "border-zinc-700/80 bg-zinc-900/75 text-zinc-100 hover:bg-zinc-800/75"
        ),
        onClick: () => props.onChange(o.id),
        children: o.label
      },
      o.id
    );
  }) });
}
function SettingsSection(props) {
  const [expanded, setExpanded] = useState(props.defaultExpanded ?? true);
  const scopeLabel = props.scope === "local" ? "This field" : "All fields";
  return /* @__PURE__ */ jsxs("section", { className: "rounded-md border border-zinc-700/55 bg-zinc-950/35 px-2.5 py-1.5", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "flex w-full min-w-0 items-center gap-1.5 py-0.5 text-left",
        "aria-expanded": expanded,
        onClick: () => setExpanded((v) => !v),
        children: [
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: twMerge(
                "h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-200 ease-out",
                expanded ? "rotate-0" : "-rotate-90"
              ),
              strokeWidth: 3,
              "aria-hidden": true
            }
          ),
          /* @__PURE__ */ jsx("h3", { className: twMerge(SECTION_TITLE, "min-w-0 flex-1"), children: props.title }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: twMerge(
                "shrink-0 text-[9px] font-semibold uppercase tracking-wide",
                props.scope === "local" ? "text-amber-400/90" : "text-cyan-400/90"
              ),
              children: scopeLabel
            }
          )
        ]
      }
    ),
    expanded ? /* @__PURE__ */ jsx("div", { className: "mt-1.5 space-y-2 pb-0.5", children: props.children }) : null
  ] });
}
function SettingsRow(props) {
  return /* @__PURE__ */ jsxs("div", { className: ROW, children: [
    /* @__PURE__ */ jsx("div", { className: LABEL, children: props.label }),
    /* @__PURE__ */ jsx("div", { className: "min-w-0 shrink-0", children: props.children })
  ] });
}
function SettingsNumber(props) {
  return /* @__PURE__ */ jsx("div", { className: "w-[7.5rem]", children: /* @__PURE__ */ jsx(
    TRNScrubNumberInput,
    {
      "aria-label": props.ariaLabel,
      value: props.value,
      onChange: props.onChange,
      min: props.min,
      max: props.max,
      step: props.step,
      fractionDigits: props.fractionDigits,
      pointerScrubEnabled: false,
      className: "w-full",
      inputClassName: "text-[11px] font-sans proportional-nums text-right"
    }
  ) });
}
function FillGradientEditor(props) {
  const gradient = clampTrnScrubInFieldFillGradient(props.gradient);
  const commit = (next) => {
    props.onChange(clampTrnScrubInFieldFillGradient(next));
  };
  const patchStop = (index, patch) => {
    commit({
      ...gradient,
      stops: gradient.stops.map((s, i) => i === index ? { ...s, ...patch } : s)
    });
  };
  const addStop = () => {
    if (gradient.stops.length >= TRN_SCRUB_IN_FIELD_FILL_STOP_MAX) return;
    const last = gradient.stops[gradient.stops.length - 1];
    const prev = gradient.stops[gradient.stops.length - 2] ?? last;
    commit({
      ...gradient,
      stops: [
        ...gradient.stops.slice(0, -1),
        {
          at: Math.min(99, Math.round((prev.at + last.at) / 2)),
          colorHex: prev.colorHex,
          alpha: (prev.alpha + last.alpha) / 2
        },
        last
      ]
    });
  };
  const removeStop = (index) => {
    if (gradient.stops.length <= TRN_SCRUB_IN_FIELD_FILL_STOP_MIN) return;
    commit({
      ...gradient,
      stops: gradient.stops.filter((_, i) => i !== index)
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 rounded-md border border-zinc-700/50 bg-zinc-950/40 px-2 py-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-zinc-500", children: "Gradient" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: twMerge(
            CHOICE_BTN,
            "border-zinc-700/80 bg-zinc-900/75 text-zinc-100 hover:bg-zinc-800/75",
            gradient.stops.length >= TRN_SCRUB_IN_FIELD_FILL_STOP_MAX ? "cursor-not-allowed opacity-50" : ""
          ),
          disabled: gradient.stops.length >= TRN_SCRUB_IN_FIELD_FILL_STOP_MAX,
          onClick: addStop,
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "mr-1 h-3 w-3", "aria-hidden": true, strokeWidth: 2.25 }),
            "Stop"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "h-3 w-full rounded-sm border border-zinc-700/60",
        style: trnScrubInFieldFillPreviewStyle(gradient)
      }
    ),
    /* @__PURE__ */ jsx(SettingsRow, { label: "Direction", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "inline-grid max-w-[11.5rem] grid-cols-4 gap-1",
        role: "radiogroup",
        "aria-label": "Gradient direction",
        children: FILL_DIRECTION_PRESETS.map((preset) => {
          const active = nearestFillDirectionAngle(gradient.angleDeg) === preset.angleDeg;
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              role: "radio",
              "aria-checked": active,
              "aria-label": preset.label,
              className: twMerge(
                CHOICE_BTN,
                "min-w-7 px-1.5",
                active ? "border-cyan-500/45 bg-cyan-500/18 text-cyan-100" : "border-zinc-700/80 bg-zinc-900/75 text-zinc-100 hover:bg-zinc-800/75"
              ),
              onClick: () => commit({ ...gradient, angleDeg: preset.angleDeg }),
              children: preset.icon
            },
            preset.angleDeg
          );
        })
      }
    ) }),
    /* @__PURE__ */ jsx(SettingsRow, { label: "Angle", children: /* @__PURE__ */ jsx(
      SettingsNumber,
      {
        ariaLabel: "Gradient angle degrees",
        value: gradient.angleDeg,
        min: 0,
        max: 360,
        step: 1,
        fractionDigits: 0,
        onChange: (n) => commit({ ...gradient, angleDeg: n })
      }
    ) }),
    gradient.stops.map((stop, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "space-y-1.5 rounded-sm border border-zinc-800/80 bg-zinc-900/35 px-2 py-1.5",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-medium text-zinc-400", children: [
              "Stop ",
              index + 1
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "inline-flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800/80 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40",
                "aria-label": `Remove stop ${index + 1}`,
                disabled: gradient.stops.length <= TRN_SCRUB_IN_FIELD_FILL_STOP_MIN,
                onClick: () => removeStop(index),
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3", "aria-hidden": true, strokeWidth: 2.25 })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              TRNColorRingPicker,
              {
                ariaLabel: `Stop ${index + 1} color`,
                valueHex: stop.colorHex,
                onValueHexChange: (hex) => patchStop(index, { colorHex: hex }),
                triggerVariant: "swatch",
                size: "sm"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
              /* @__PURE__ */ jsx(SettingsRow, { label: "At %", children: /* @__PURE__ */ jsx(
                SettingsNumber,
                {
                  ariaLabel: `Stop ${index + 1} position`,
                  value: stop.at,
                  min: 0,
                  max: 100,
                  step: 1,
                  fractionDigits: 0,
                  onChange: (n) => patchStop(index, { at: n })
                }
              ) }),
              /* @__PURE__ */ jsx(SettingsRow, { label: "Opacity", children: /* @__PURE__ */ jsx(
                SettingsNumber,
                {
                  ariaLabel: `Stop ${index + 1} opacity`,
                  value: stop.alpha,
                  min: 0,
                  max: 1,
                  step: 0.01,
                  fractionDigits: 2,
                  onChange: (n) => patchStop(index, { alpha: n })
                }
              ) })
            ] })
          ] })
        ]
      },
      `stop-${index}`
    ))
  ] });
}
function TRNScrubNumberFieldSettingsPanel(props) {
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
    hasSettingsKey
  } = props;
  const dragPreset = resolvedInteraction.dragSensitivityPreset;
  const stepAuto = local.valueRules?.stepAuto !== false;
  const liveBounds = typeof liveMin === "number" && Number.isFinite(liveMin) && typeof liveMax === "number" && Number.isFinite(liveMax);
  const patchLocal = (patch) => {
    onLocalChange({ ...local, version: 1, ...patch });
  };
  const patchLocalRules = (patch) => {
    patchLocal({ valueRules: { ...local.valueRules, ...patch } });
  };
  const patchGlobalAppearance = (patch) => {
    onGlobalChange({
      ...global,
      version: 1,
      appearance: { ...global.appearance, ...patch }
    });
  };
  const patchGlobalInteraction = (patch) => {
    onGlobalChange({
      ...global,
      version: 1,
      interaction: { ...global.interaction, ...patch }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
    /* @__PURE__ */ jsxs("p", { className: SCOPE_BANNER, children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-amber-400/90", children: "This field" }),
      " \u2014 min / max / step.",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-cyan-400/90", children: "All fields" }),
      " \u2014 fill, chrome, drag & wheel."
    ] }),
    /* @__PURE__ */ jsxs(SettingsSection, { title: "Value bounds", scope: "local", defaultExpanded: true, children: [
      !hasSettingsKey ? /* @__PURE__ */ jsx("p", { className: "m-0 text-[10px] leading-snug text-amber-400/90", children: "No settings key on this field \u2014 local bounds are not persisted." }) : null,
      liveBounds ? /* @__PURE__ */ jsxs("p", { className: "m-0 text-[10px] leading-snug text-zinc-500", children: [
        "Live props already set min=",
        liveMin,
        " / max=",
        liveMax,
        ". Stored defaults apply only when props omit bounds."
      ] }) : null,
      /* @__PURE__ */ jsx(SettingsRow, { label: "Min", children: /* @__PURE__ */ jsx(
        SettingsNumber,
        {
          ariaLabel: "Local min",
          value: local.valueRules?.min ?? liveMin ?? 0,
          onChange: (n) => patchLocalRules({ min: n })
        }
      ) }),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Max", children: /* @__PURE__ */ jsx(
        SettingsNumber,
        {
          ariaLabel: "Local max",
          value: local.valueRules?.max ?? liveMax ?? 0,
          onChange: (n) => patchLocalRules({ max: n })
        }
      ) }),
      /* @__PURE__ */ jsx(
        TRNInlineToggleRow,
        {
          label: "Auto step",
          hint: "Derive step from min/max span when no explicit step is stored.",
          checked: stepAuto,
          onCheckedChange: (next) => patchLocalRules({ stepAuto: next }),
          variant: "plain",
          size: "sm"
        }
      ),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Step", children: /* @__PURE__ */ jsx(
        SettingsNumber,
        {
          ariaLabel: "Local step",
          value: local.valueRules?.step ?? effectiveStep,
          min: 1e-6,
          step: 1e-3,
          onChange: (n) => patchLocalRules({ step: Math.max(1e-6, n), stepAuto: false })
        }
      ) }),
      controlStyleSwitchEnabled ? /* @__PURE__ */ jsx(SettingsRow, { label: "Control", children: /* @__PURE__ */ jsx(
        ChoiceGroup,
        {
          ariaLabel: "Local control style",
          value: local.controlStyle ?? resolvedAppearance.controlStyle,
          options: [
            { id: "scrub", label: "Scrub" },
            { id: "slider", label: "Slider" }
          ],
          onChange: (id) => patchLocal({ controlStyle: id })
        }
      ) }) : null
    ] }),
    /* @__PURE__ */ jsxs(SettingsSection, { title: "Look & fill", scope: "global", defaultExpanded: true, children: [
      /* @__PURE__ */ jsx(SettingsRow, { label: "Chrome", children: /* @__PURE__ */ jsx(
        ChoiceGroup,
        {
          ariaLabel: "Variant",
          value: resolvedAppearance.variant,
          options: [
            { id: "minimal", label: "Minimal" },
            { id: "full", label: "Full" }
          ],
          onChange: (id) => patchGlobalAppearance({ variant: id })
        }
      ) }),
      /* @__PURE__ */ jsx(
        TRNInlineToggleRow,
        {
          label: "Range fill",
          hint: "Soft fill inside the scrub shell when min and max exist. Hidden while typing. Applies to every scrub field.",
          checked: resolvedAppearance.inFieldFillWhenBounded,
          onCheckedChange: (next) => patchGlobalAppearance({ inFieldFillWhenBounded: next }),
          variant: "plain",
          size: "sm"
        }
      ),
      resolvedAppearance.inFieldFillWhenBounded ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SettingsRow, { label: "Fill style", children: /* @__PURE__ */ jsx(
          ChoiceGroup,
          {
            ariaLabel: "Range fill style",
            value: resolvedAppearance.inFieldFillStyle,
            options: [
              { id: "solid", label: "Solid" },
              { id: "soft-gradient", label: "Gradient" },
              { id: "edge-fade", label: "Fade" },
              { id: "custom", label: "Custom" }
            ],
            onChange: (id) => {
              if (id === "custom") {
                patchGlobalAppearance({
                  inFieldFillStyle: "custom",
                  inFieldFillGradient: clampTrnScrubInFieldFillGradient(
                    resolvedAppearance.inFieldFillGradient
                  )
                });
                return;
              }
              patchGlobalAppearance({
                inFieldFillStyle: id,
                inFieldFillGradient: cloneTrnScrubInFieldFillPreset(id)
              });
            }
          }
        ) }),
        /* @__PURE__ */ jsx(
          FillGradientEditor,
          {
            gradient: resolvedAppearance.inFieldFillGradient,
            onChange: (next) => patchGlobalAppearance({
              inFieldFillStyle: "custom",
              inFieldFillGradient: next
            })
          }
        )
      ] }) : null,
      /* @__PURE__ */ jsx(SettingsRow, { label: "Step \u2039 \u203A", children: /* @__PURE__ */ jsx(
        ChoiceGroup,
        {
          ariaLabel: "Step buttons visibility",
          value: resolvedAppearance.stepButtonsVisibility,
          options: VISIBILITY_OPTIONS,
          onChange: (id) => patchGlobalAppearance({ stepButtonsVisibility: id })
        }
      ) }),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Lock", children: /* @__PURE__ */ jsx(
        ChoiceGroup,
        {
          ariaLabel: "Lock icon visibility",
          value: resolvedAppearance.lockIconVisibility,
          options: VISIBILITY_OPTIONS,
          onChange: (id) => patchGlobalAppearance({ lockIconVisibility: id })
        }
      ) }),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Reset", children: /* @__PURE__ */ jsx(
        ChoiceGroup,
        {
          ariaLabel: "Reset icon visibility",
          value: resolvedAppearance.resetIconVisibility,
          options: VISIBILITY_OPTIONS,
          onChange: (id) => patchGlobalAppearance({ resetIconVisibility: id })
        }
      ) }),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Clear", children: /* @__PURE__ */ jsx(
        ChoiceGroup,
        {
          ariaLabel: "Clear icon visibility",
          value: resolvedAppearance.clearIconVisibility,
          options: VISIBILITY_OPTIONS,
          onChange: (id) => patchGlobalAppearance({ clearIconVisibility: id })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(SettingsSection, { title: "Pointer scrub", scope: "global", defaultExpanded: false, children: [
      /* @__PURE__ */ jsx(
        TRNInlineToggleRow,
        {
          label: "Drag to scrub",
          hint: "Press-drag changes value; click focuses for typing.",
          checked: resolvedInteraction.pointerScrubEnabled,
          onCheckedChange: (next) => patchGlobalInteraction({ pointerScrubEnabled: next }),
          variant: "plain",
          size: "sm"
        }
      ),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Sensitivity", children: /* @__PURE__ */ jsx(
        ChoiceGroup,
        {
          ariaLabel: "Drag sensitivity",
          value: dragPreset,
          options: [
            { id: "slow", label: "Slow" },
            { id: "normal", label: "Normal" },
            { id: "fast", label: "Fast" },
            { id: "custom", label: "Custom" }
          ],
          onChange: (preset) => {
            const base = dragPresets[preset];
            patchGlobalInteraction({
              dragSensitivityPreset: preset,
              horizontalPxPerTenthPercent: preset === "custom" ? global.interaction?.horizontalPxPerTenthPercent : base.h,
              verticalPxPerPercent: preset === "custom" ? global.interaction?.verticalPxPerPercent : base.v,
              scrubActivationThresholdPx: preset === "custom" ? global.interaction?.scrubActivationThresholdPx : base.thr
            });
          }
        }
      ) }),
      dragPreset === "custom" ? /* @__PURE__ */ jsxs("div", { className: "space-y-2 border-t border-zinc-700/50 pt-2", children: [
        /* @__PURE__ */ jsx(SettingsRow, { label: "H px / step", children: /* @__PURE__ */ jsx(
          SettingsNumber,
          {
            ariaLabel: "Horizontal pixels per scrub step",
            value: resolvedInteraction.horizontalPxPerTenthPercent,
            min: 1,
            max: 120,
            step: 1,
            fractionDigits: 0,
            onChange: (n) => patchGlobalInteraction({
              horizontalPxPerTenthPercent: Math.max(1, n)
            })
          }
        ) }),
        /* @__PURE__ */ jsx(SettingsRow, { label: "V px / step", children: /* @__PURE__ */ jsx(
          SettingsNumber,
          {
            ariaLabel: "Vertical pixels per scrub step",
            value: resolvedInteraction.verticalPxPerPercent,
            min: 1,
            max: 120,
            step: 1,
            fractionDigits: 0,
            onChange: (n) => patchGlobalInteraction({ verticalPxPerPercent: Math.max(1, n) })
          }
        ) }),
        /* @__PURE__ */ jsx(SettingsRow, { label: "Start threshold", children: /* @__PURE__ */ jsx(
          SettingsNumber,
          {
            ariaLabel: "Activation threshold px",
            value: resolvedInteraction.scrubActivationThresholdPx,
            min: 0,
            max: 40,
            step: 1,
            fractionDigits: 0,
            onChange: (n) => patchGlobalInteraction({
              scrubActivationThresholdPx: Math.max(0, n)
            })
          }
        ) }),
        /* @__PURE__ */ jsxs("p", { className: "m-0 text-[10px] leading-snug text-zinc-500", children: [
          "Defaults H ",
          TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
          " / V",
          " ",
          TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
          " px per step; threshold",
          " ",
          TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX,
          "px."
        ] })
      ] }) : null,
      /* @__PURE__ */ jsx(SettingsRow, { label: "Shift \xD7", children: /* @__PURE__ */ jsx(
        SettingsNumber,
        {
          ariaLabel: "Shift multiplier",
          value: resolvedInteraction.shiftMultiplier,
          min: 0.01,
          max: 1,
          step: 0.01,
          onChange: (n) => patchGlobalInteraction({
            shiftMultiplier: Math.max(0.01, Math.min(1, n))
          })
        }
      ) }),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Ctrl/Cmd \xD7", children: /* @__PURE__ */ jsx(
        SettingsNumber,
        {
          ariaLabel: "Ctrl or Cmd multiplier",
          value: resolvedInteraction.ctrlOrCmdMultiplier,
          min: 1,
          max: 100,
          step: 1,
          fractionDigits: 0,
          onChange: (n) => patchGlobalInteraction({
            ctrlOrCmdMultiplier: Math.max(1, Math.min(100, n))
          })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(SettingsSection, { title: "Mouse wheel", scope: "global", defaultExpanded: false, children: [
      /* @__PURE__ */ jsx(
        TRNInlineToggleRow,
        {
          label: "Enable wheel",
          hint: "Mouse wheel can change the value over the field.",
          checked: resolvedInteraction.wheelEnabled,
          onCheckedChange: (next) => patchGlobalInteraction({ wheelEnabled: next }),
          variant: "plain",
          size: "sm"
        }
      ),
      /* @__PURE__ */ jsx(
        TRNInlineToggleRow,
        {
          label: "Require Alt",
          hint: "Only Alt + wheel adjusts values so normal scrolling is safe.",
          checked: resolvedInteraction.wheelRequiresAlt,
          onCheckedChange: (next) => patchGlobalInteraction({ wheelRequiresAlt: next }),
          variant: "plain",
          size: "sm"
        }
      ),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Bounded mode", children: /* @__PURE__ */ jsx(
        ChoiceGroup,
        {
          ariaLabel: "Bounded wheel mode",
          value: resolvedInteraction.wheelBoundedMode,
          options: [
            { id: "span-percent", label: "1% span" },
            { id: "step", label: "Step" }
          ],
          onChange: (id) => patchGlobalInteraction({ wheelBoundedMode: id })
        }
      ) }),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Pixel threshold", children: /* @__PURE__ */ jsx(
        SettingsNumber,
        {
          ariaLabel: "Wheel pixel accumulator threshold",
          value: resolvedInteraction.wheelPixelAccumThreshold,
          min: 1,
          max: 400,
          step: 1,
          fractionDigits: 0,
          onChange: (n) => patchGlobalInteraction({
            wheelPixelAccumThreshold: Math.max(
              1,
              n || TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD
            )
          })
        }
      ) }),
      /* @__PURE__ */ jsx(SettingsRow, { label: "Free step", children: /* @__PURE__ */ jsx(
        SettingsNumber,
        {
          ariaLabel: "Unbounded wheel step",
          value: resolvedInteraction.wheelUnboundedStep,
          min: 1e-6,
          step: 0.01,
          onChange: (n) => patchGlobalInteraction({ wheelUnboundedStep: Math.max(1e-6, n) })
        }
      ) })
    ] })
  ] });
}
var TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE = {
  variant: "full",
  controlStyle: "scrub",
  controlStyleSwitchEnabled: true,
  inFieldFillWhenBounded: false,
  inFieldFillStyle: "soft-gradient",
  inFieldFillGradient: TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT,
  stepButtonsVisibility: "hover",
  lockIconVisibility: "always",
  resetIconVisibility: "always",
  clearIconVisibility: "hidden"
};
var FIELD_SHELL_BASE = "group/trnScrubField flex min-w-0 w-full items-center gap-1 rounded border border-zinc-700/80 bg-zinc-950/45 px-1 py-1";
var LABELED_HEADER_ROW_CLASS = "grid min-h-6 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1";
var LABELED_HEADER_CHROME_CLASS = "flex min-w-0 items-center justify-end gap-0.5 justify-self-end";
var ICON_BTN_BASE_MD = "nodrag inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-transparent p-0 text-zinc-400 outline-none transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-50";
var ICON_BTN_BASE_SM = "nodrag inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-transparent p-0 text-zinc-400 outline-none transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-cyan-400/45 disabled:opacity-50";
function scrubIconBtnClass(size) {
  return size === "sm" ? ICON_BTN_BASE_SM : ICON_BTN_BASE_MD;
}
function scrubFieldLayout(size) {
  if (size === "field") {
    return {
      shellClass: "px-1 py-1",
      inputSizeClass: "text-[13px] font-normal leading-tight",
      iconSizeClass: "h-3 w-3"
    };
  }
  if (size === "sm") {
    return {
      shellClass: "px-1 py-[3px]",
      inputSizeClass: "text-[10px]",
      iconSizeClass: "h-2.5 w-2.5"
    };
  }
  return {
    shellClass: "px-1 py-1",
    inputSizeClass: "text-[11px]",
    iconSizeClass: "h-3 w-3"
  };
}
var LOCK_BTN_UNLOCKED_TONE = "bg-emerald-500/15 text-emerald-300/95 hover:bg-emerald-500/25 hover:text-emerald-100";
var LOCK_BTN_LOCKED_TONE = "bg-red-500/15 text-red-300/95 hover:bg-red-500/25 hover:text-red-100";
var STEP_BTN_TONE = "border border-zinc-700/70 bg-zinc-900/55 hover:border-zinc-600/80 hover:bg-zinc-800/70";
var MENU_Z_INDEX = 2200;
var SCRUB_CONTEXT_MENU_EST_WIDTH_PX = 256;
var SCRUB_CONTEXT_MENU_EST_HEIGHT_PX = 240;
var DRAG_SENSITIVITY_PRESETS = {
  /** More px per step → slower. */
  slow: { h: 24, v: 12, thr: 2 },
  normal: {
    h: TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
    v: TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
    thr: TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX
  },
  /** Fewer px per step → faster. */
  fast: { h: 6, v: 3, thr: 1 },
  custom: {
    h: TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT,
    v: TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT,
    thr: TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX
  }
};
function scrubFieldIconHoverClass(visibility) {
  return visibility === "hover" ? "opacity-0 group-hover/trnScrubField:opacity-100 group-focus-within/trnScrubField:opacity-100" : "";
}
function scrubValuesEqual(a, b, fractionDigits) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return false;
  }
  if (fractionDigits != null && fractionDigits >= 0) {
    const quantum = Math.pow(10, -fractionDigits) / 2;
    return Math.abs(a - b) <= quantum;
  }
  return a === b;
}
function finiteSpan2(min, max) {
  if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }
  const span = max - min;
  return span > 0 ? span : null;
}
function defaultTrnScrubNumberFieldControlStyle(_min, _max) {
  return "scrub";
}
function TRNScrubNumberField(props) {
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
    onChangeEnd
  } = props;
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const menuRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [localLocked, setLocalLocked] = useState(false);
  const locked = lockedProp ?? localLocked;
  const [valueEditing, setValueEditing] = useState(false);
  const storedLocal = useMemo(
    () => settingsKey ? loadTrnScrubNumberFieldLocalSettings(settingsKey) : null,
    [settingsKey]
  );
  const [localSettings, setLocalSettings] = useState(
    () => ({
      version: 1,
      valueRules: {
        min: storedLocal?.valueRules?.min,
        max: storedLocal?.valueRules?.max,
        step: storedLocal?.valueRules?.step,
        stepAuto: storedLocal?.valueRules?.stepAuto ?? true
      },
      controlStyle: storedLocal?.controlStyle
    })
  );
  const [globalSettings, setGlobalSettings] = useState(
    () => loadTrnScrubNumberFieldGlobalSettings() ?? { version: 1 }
  );
  useEffect(() => {
    setLocalSettings({
      version: 1,
      valueRules: {
        min: storedLocal?.valueRules?.min,
        max: storedLocal?.valueRules?.max,
        step: storedLocal?.valueRules?.step,
        stepAuto: storedLocal?.valueRules?.stepAuto ?? true
      },
      controlStyle: storedLocal?.controlStyle
    });
  }, [storedLocal]);
  useEffect(() => {
    const onGlobal = (ev) => {
      const detail = ev.detail;
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
  const commitLocal = (next) => {
    setLocalSettings(next);
    if (settingsKey) saveTrnScrubNumberFieldLocalSettings(settingsKey, next);
  };
  const commitGlobal = (next) => {
    setGlobalSettings(next);
    saveTrnScrubNumberFieldGlobalSettings(next);
  };
  const controlStyleSwitchEnabled = appearance?.controlStyleSwitchEnabled ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.controlStyleSwitchEnabled;
  const mergedAppearance = {
    variant: globalSettings.appearance?.variant ?? appearance?.variant ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.variant,
    controlStyle: !controlStyleSwitchEnabled ? appearance?.controlStyle ?? "scrub" : localSettings.controlStyle ?? appearance?.controlStyle ?? defaultTrnScrubNumberFieldControlStyle(),
    controlStyleSwitchEnabled,
    inFieldFillWhenBounded: globalSettings.appearance?.inFieldFillWhenBounded ?? appearance?.inFieldFillWhenBounded ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.inFieldFillWhenBounded,
    inFieldFillStyle: globalSettings.appearance?.inFieldFillStyle ?? appearance?.inFieldFillStyle ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.inFieldFillStyle,
    inFieldFillGradient: clampTrnScrubInFieldFillGradient(
      globalSettings.appearance?.inFieldFillGradient ?? appearance?.inFieldFillGradient ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.inFieldFillGradient
    ),
    stepButtonsVisibility: globalSettings.appearance?.stepButtonsVisibility ?? appearance?.stepButtonsVisibility ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.stepButtonsVisibility,
    lockIconVisibility: globalSettings.appearance?.lockIconVisibility ?? appearance?.lockIconVisibility ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.lockIconVisibility,
    resetIconVisibility: globalSettings.appearance?.resetIconVisibility ?? appearance?.resetIconVisibility ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.resetIconVisibility,
    clearIconVisibility: globalSettings.appearance?.clearIconVisibility ?? appearance?.clearIconVisibility ?? TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE.clearIconVisibility
  };
  const mergedInteraction = {
    pointerScrubEnabled: globalSettings.interaction?.pointerScrubEnabled ?? interaction?.pointerScrubEnabled ?? true,
    wheelEnabled: globalSettings.interaction?.wheelEnabled ?? interaction?.wheelEnabled ?? true,
    wheelRequiresAlt: globalSettings.interaction?.wheelRequiresAlt ?? interaction?.wheelRequiresAlt ?? false,
    wheelUnboundedStep: globalSettings.interaction?.wheelUnboundedStep ?? interaction?.wheelUnboundedStep ?? 1,
    wheelBoundedMode: globalSettings.interaction?.wheelBoundedMode ?? interaction?.wheelBoundedMode ?? "span-percent",
    shiftMultiplier: globalSettings.interaction?.shiftMultiplier ?? interaction?.shiftMultiplier ?? 0.1,
    ctrlOrCmdMultiplier: globalSettings.interaction?.ctrlOrCmdMultiplier ?? interaction?.ctrlOrCmdMultiplier ?? 10,
    horizontalPxPerTenthPercent: coerceTrnScrubDragPxPerStep(
      globalSettings.interaction?.horizontalPxPerTenthPercent ?? interaction?.horizontalPxPerTenthPercent,
      TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT
    ),
    verticalPxPerPercent: coerceTrnScrubDragPxPerStep(
      globalSettings.interaction?.verticalPxPerPercent ?? interaction?.verticalPxPerPercent,
      TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT
    ),
    scrubActivationThresholdPx: coerceTrnScrubActivationThresholdPx(
      globalSettings.interaction?.scrubActivationThresholdPx ?? interaction?.scrubActivationThresholdPx
    ),
    wheelPixelAccumThreshold: globalSettings.interaction?.wheelPixelAccumThreshold ?? interaction?.wheelPixelAccumThreshold ?? TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD,
    dragSensitivityPreset: globalSettings.interaction?.dragSensitivityPreset ?? "normal"
  };
  const dragPreset = mergedInteraction.dragSensitivityPreset;
  const effectiveDragH = dragPreset === "custom" ? mergedInteraction.horizontalPxPerTenthPercent : DRAG_SENSITIVITY_PRESETS[dragPreset].h;
  const effectiveDragV = dragPreset === "custom" ? mergedInteraction.verticalPxPerPercent : DRAG_SENSITIVITY_PRESETS[dragPreset].v;
  const effectiveDragThr = dragPreset === "custom" ? mergedInteraction.scrubActivationThresholdPx : DRAG_SENSITIVITY_PRESETS[dragPreset].thr;
  const effectiveMin = typeof min === "number" ? min : localSettings.valueRules?.min;
  const effectiveMax = typeof max === "number" ? max : localSettings.valueRules?.max;
  const effectiveStepProp = typeof step === "number" ? step : localSettings.valueRules?.stepAuto === false ? localSettings.valueRules?.step : void 0;
  const { shellClass, inputSizeClass, iconSizeClass } = scrubFieldLayout(size);
  const iconBtnClass = scrubIconBtnClass(size);
  const stepButtonsVisibleClass = scrubFieldIconHoverClass(mergedAppearance.stepButtonsVisibility);
  const lockVisibleClass = scrubFieldIconHoverClass(mergedAppearance.lockIconVisibility);
  const resetVisibleClass = scrubFieldIconHoverClass(mergedAppearance.resetIconVisibility);
  const clearVisibleClass = scrubFieldIconHoverClass(mergedAppearance.clearIconVisibility);
  useEffect(() => {
    if (menuAnchor == null) return;
    const onPointerDown = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      setMenuAnchor(null);
    };
    const onKey = (e) => {
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
      const width = panel != null && panel.offsetWidth > 0 ? panel.offsetWidth : SCRUB_CONTEXT_MENU_EST_WIDTH_PX;
      const height = panel != null && panel.offsetHeight > 0 ? panel.offsetHeight : SCRUB_CONTEXT_MENU_EST_HEIGHT_PX;
      setMenuPos(
        computeFixedCursorMenuPlacement(menuAnchor.x, menuAnchor.y, width, height)
      );
    };
    place();
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("resize", place);
    };
  }, [menuAnchor]);
  const setLocked = (next) => {
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
    const span = finiteSpan2(effectiveMin, effectiveMax);
    if (span != null) {
      return Math.max(1e-6, span / 256);
    }
    return 1;
  }, [effectiveMax, effectiveMin, effectiveStepProp]);
  const stepMultiplierForEvent = (e) => {
    let mult = 1;
    if (e.shiftKey) mult *= mergedInteraction.shiftMultiplier;
    if (e.ctrlKey || e.metaKey) mult *= mergedInteraction.ctrlOrCmdMultiplier;
    return mult;
  };
  const onWheelCapture = (e) => {
    if (!mergedInteraction.wheelEnabled || disabled || locked) return;
    if (mergedInteraction.wheelRequiresAlt && !e.altKey) return;
    const span = finiteSpan2(effectiveMin, effectiveMax);
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
  const sliderSpanEarly = finiteSpan2(effectiveMin, effectiveMax);
  const showInFieldFill = mergedAppearance.inFieldFillWhenBounded && mergedAppearance.controlStyle === "scrub" && sliderSpanEarly != null;
  const showStepButtons = showFull && mergedAppearance.stepButtonsVisibility !== "hidden" && !showInFieldFill;
  const showLockToggle = showFull && mergedAppearance.lockIconVisibility !== "hidden";
  const resetTarget = defaultValue != null && Number.isFinite(defaultValue) ? defaultValue : null;
  const canReset = onReset != null || resetTarget != null;
  const showResetIcon = canReset && mergedAppearance.resetIconVisibility !== "hidden";
  const showClearIcon = onClear != null && mergedAppearance.clearIconVisibility !== "hidden";
  const resetAlreadyAtDefault = resetTarget != null && onReset == null && scrubValuesEqual(value, resetTarget, fractionDigits);
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
  const onFieldContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.getSelection()?.removeAllRanges();
    const active = document.activeElement;
    if (active instanceof HTMLInputElement && active.dataset.trnScrubInput === "1" && typeof active.selectionStart === "number") {
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
        SCRUB_CONTEXT_MENU_EST_HEIGHT_PX
      )
    );
  };
  const sliderSpan = sliderSpanEarly;
  const outOfRange = isTrnNumberOutOfRange(value, effectiveMin, effectiveMax);
  const valueToneClass = outOfRange ? "text-amber-400" : "";
  const oorHint = outOfRange && sliderSpan != null ? `Outside range (${effectiveMin} \u2026 ${effectiveMax})` : outOfRange ? "Outside range" : null;
  const scrubShellClass = twMerge(
    embedded ? "group/trnScrubField relative flex h-full min-h-0 min-w-0 w-full flex-1 items-center gap-0.5 overflow-hidden" : twMerge(FIELD_SHELL_BASE, "relative"),
    embedded ? "" : shellClass
  );
  const inFieldFillPercent = showInFieldFill && !valueEditing && sliderSpan != null && typeof effectiveMin === "number" ? Math.min(
    100,
    Math.max(
      0,
      (clampTrnNumberToRange(
        Number.isFinite(value) ? value : effectiveMin,
        effectiveMin,
        effectiveMax
      ) - effectiveMin) / sliderSpan * 100
    )
  ) : null;
  const inFieldFillLayer = inFieldFillPercent != null ? /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": true,
      className: "pointer-events-none absolute inset-[2px] overflow-hidden rounded-[2px]",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full w-full rounded-[inherit]",
          style: {
            ...trnScrubInFieldFillPaint(
              mergedAppearance.inFieldFillStyle,
              mergedAppearance.inFieldFillGradient
            ),
            WebkitMaskImage: `linear-gradient(90deg, #000 0%, #000 ${inFieldFillPercent}%, transparent ${inFieldFillPercent}%)`,
            maskImage: `linear-gradient(90deg, #000 0%, #000 ${inFieldFillPercent}%, transparent ${inFieldFillPercent}%)`
          }
        }
      )
    }
  ) : null;
  const stepDown = () => {
    if (disabled || locked) return;
    onChange((Number.isFinite(value) ? value : 0) - effectiveStep);
  };
  const stepUp = () => {
    if (disabled || locked) return;
    onChange((Number.isFinite(value) ? value : 0) + effectiveStep);
  };
  const menu = portalTarget && menuAnchor ? createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: menuRef,
        className: "pointer-events-auto fixed z-2200 flex animate-in fade-in zoom-in-95 duration-100",
        style: {
          top: menuPos?.top ?? menuAnchor.y,
          left: menuPos?.left ?? menuAnchor.x
        },
        onClick: (e) => e.stopPropagation(),
        children: /* @__PURE__ */ jsxs(TRNMenuPanel, { tone: "glass-dropdown", className: "w-64 p-1.5", children: [
          mergedAppearance.controlStyleSwitchEnabled ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(TRNMenuSectionTitle, { spacing: "labelOnly", children: "Style" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 space-y-1", children: [
              {
                id: "scrub",
                label: "Scrub",
                icon: /* @__PURE__ */ jsx(MoveHorizontal, { className: "h-4 w-4 text-zinc-300", "aria-hidden": true, strokeWidth: 2.25 })
              },
              {
                id: "slider",
                label: "Slider",
                icon: /* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-4 w-4 text-zinc-300", "aria-hidden": true, strokeWidth: 2.25 })
              }
            ].map((o) => {
              const active = mergedAppearance.controlStyle === o.id;
              return /* @__PURE__ */ jsx(
                TRNMenuItemButton,
                {
                  tone: "glass-dropdown",
                  label: o.label,
                  icon: o.icon,
                  rightSlot: active ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-cyan-300", "aria-hidden": true, strokeWidth: 2.25 }) : null,
                  onClick: () => {
                    commitLocal({ ...localSettings, controlStyle: o.id });
                    setMenuAnchor(null);
                    if (o.id === "slider" && finiteSpan2(effectiveMin, effectiveMax) == null) {
                      requestAnimationFrame(() => {
                        setSettingsAnchor(menuAnchor);
                        setSettingsOpen(true);
                      });
                    }
                  }
                },
                o.id
              );
            }) })
          ] }) : null,
          /* @__PURE__ */ jsx(
            TRNMenuSectionTitle,
            {
              spacing: mergedAppearance.controlStyleSwitchEnabled ? "menuNext" : "labelOnly",
              children: "Scrub field"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 space-y-1", children: [
            /* @__PURE__ */ jsx(
              TRNMenuItemButton,
              {
                tone: "glass-dropdown",
                label: locked ? "Unlock" : "Lock",
                icon: locked ? /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4 text-zinc-300", "aria-hidden": true, strokeWidth: 2.25 }) : /* @__PURE__ */ jsx(Unlock, { className: "h-4 w-4 text-zinc-300", "aria-hidden": true, strokeWidth: 2.25 }),
                onClick: () => {
                  setLocked(!locked);
                  setMenuAnchor(null);
                }
              }
            ),
            /* @__PURE__ */ jsx(
              TRNMenuItemButton,
              {
                tone: "glass-dropdown",
                label: "Reset to default",
                icon: /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4 text-zinc-300", "aria-hidden": true, strokeWidth: 2.25 }),
                disabled: defaultValue == null || disabled || locked,
                onClick: () => {
                  if (defaultValue == null) return;
                  onChange(defaultValue);
                  setMenuAnchor(null);
                }
              }
            ),
            /* @__PURE__ */ jsx(
              TRNMenuItemButton,
              {
                tone: "glass-dropdown",
                label: "Settings\u2026",
                icon: /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4 text-zinc-300", "aria-hidden": true, strokeWidth: 2.25 }),
                onClick: () => {
                  setMenuAnchor(null);
                  requestAnimationFrame(() => {
                    setSettingsAnchor(menuAnchor);
                    setSettingsOpen(true);
                  });
                }
              }
            )
          ] })
        ] })
      }
    ),
    portalTarget
  ) : null;
  const settingsDialog = /* @__PURE__ */ jsx(
    TRNContextDialog,
    {
      open: settingsOpen,
      onOpenChange: (open) => {
        setSettingsOpen(open);
        if (!open) {
          setSettingsAnchor(null);
        }
      },
      title: "Scrub settings",
      anchor: settingsAnchor,
      widthPx: 460,
      zIndex: MENU_Z_INDEX + 6,
      children: /* @__PURE__ */ jsx(
        TRNScrubNumberFieldSettingsPanel,
        {
          local: localSettings,
          global: globalSettings,
          onLocalChange: commitLocal,
          onGlobalChange: commitGlobal,
          resolvedAppearance: mergedAppearance,
          resolvedInteraction: mergedInteraction,
          dragPresets: DRAG_SENSITIVITY_PRESETS,
          effectiveStep,
          controlStyleSwitchEnabled,
          liveMin: typeof min === "number" ? min : void 0,
          liveMax: typeof max === "number" ? max : void 0,
          hasSettingsKey: Boolean(settingsKey)
        }
      )
    }
  );
  const chromeLeading = /* @__PURE__ */ jsx(Fragment, { children: showStepButtons ? /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: twMerge(
        iconBtnClass,
        STEP_BTN_TONE,
        mergedAppearance.stepButtonsVisibility === "always" ? "" : stepButtonsVisibleClass
      ),
      "aria-label": "Step down",
      tabIndex: -1,
      disabled: disabled || locked,
      onClick: (e) => {
        e.preventDefault();
        stepDown();
      },
      children: /* @__PURE__ */ jsx(ChevronLeft, { className: iconSizeClass, "aria-hidden": true, strokeWidth: 2.25 })
    }
  ) : null });
  const chromeTrailing = /* @__PURE__ */ jsxs(Fragment, { children: [
    showStepButtons ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: twMerge(
          iconBtnClass,
          STEP_BTN_TONE,
          mergedAppearance.stepButtonsVisibility === "always" ? "" : stepButtonsVisibleClass
        ),
        "aria-label": "Step up",
        tabIndex: -1,
        disabled: disabled || locked,
        onClick: (e) => {
          e.preventDefault();
          stepUp();
        },
        children: /* @__PURE__ */ jsx(ChevronRight, { className: iconSizeClass, "aria-hidden": true, strokeWidth: 2.25 })
      }
    ) : null,
    showLockToggle ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: twMerge(
          iconBtnClass,
          locked ? LOCK_BTN_LOCKED_TONE : LOCK_BTN_UNLOCKED_TONE,
          mergedAppearance.lockIconVisibility === "always" ? "" : lockVisibleClass
        ),
        "aria-label": locked ? "Unlock value" : "Lock value",
        tabIndex: -1,
        disabled,
        onClick: (e) => {
          e.preventDefault();
          setLocked(!locked);
        },
        children: locked ? /* @__PURE__ */ jsx(Lock, { className: iconSizeClass, "aria-hidden": true, strokeWidth: 2.25 }) : /* @__PURE__ */ jsx(Unlock, { className: iconSizeClass, "aria-hidden": true, strokeWidth: 2.25 })
      }
    ) : null,
    showResetIcon ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: twMerge(
          iconBtnClass,
          mergedAppearance.resetIconVisibility === "always" ? "" : resetVisibleClass
        ),
        "aria-label": resetAriaLabel ?? "Reset to default value",
        tabIndex: -1,
        disabled: disabled || locked || resetAlreadyAtDefault,
        onClick: (e) => {
          e.preventDefault();
          runReset();
        },
        children: /* @__PURE__ */ jsx(RotateCcw, { className: iconSizeClass, "aria-hidden": true, strokeWidth: 2.25 })
      }
    ) : null,
    showClearIcon ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: twMerge(
          iconBtnClass,
          mergedAppearance.clearIconVisibility === "always" ? "" : clearVisibleClass
        ),
        "aria-label": clearAriaLabel ?? "Clear value",
        tabIndex: -1,
        disabled,
        onClick: (e) => {
          e.preventDefault();
          onClear?.();
        },
        children: /* @__PURE__ */ jsx(X, { className: iconSizeClass, "aria-hidden": true, strokeWidth: 2.25 })
      }
    ) : null
  ] });
  const numberInput = (align, fill) => {
    const input = /* @__PURE__ */ jsx(
      TRNScrubNumberInput,
      {
        value,
        onChange,
        onChangeEnd,
        step: effectiveStepProp,
        min: effectiveMin,
        max: effectiveMax,
        fractionDigits,
        disabled,
        locked,
        pointerScrubEnabled: mergedInteraction.pointerScrubEnabled,
        wheelEnabled: mergedInteraction.wheelEnabled,
        wheelRequiresAlt: mergedInteraction.wheelRequiresAlt,
        horizontalPxPerTenthPercent: effectiveDragH,
        verticalPxPerPercent: effectiveDragV,
        scrubActivationThresholdPx: effectiveDragThr,
        wheelPixelAccumThreshold: mergedInteraction.wheelPixelAccumThreshold,
        className: fill ? "min-w-0 w-full flex-1" : "min-w-0 w-14 flex-none",
        inputClassName: twMerge(
          inputSizeClass,
          "font-sans proportional-nums",
          "text-center" ,
          valueToneClass,
          inputClassName
        ),
        "aria-label": ariaLabel,
        onEditingChange: setValueEditing
      }
    );
    if (oorHint == null) {
      return input;
    }
    const fillLayout = fill ? "min-w-0 w-full flex-1" : "min-w-0 w-14 flex-none";
    return /* @__PURE__ */ jsx(
      TRNTooltip,
      {
        content: oorHint,
        trigger: input,
        triggerWrapper: "span",
        disableHoverFx: true,
        className: twMerge("flex items-center", fillLayout),
        triggerClassName: twMerge(
          "!flex !rounded-none !p-0 min-w-0 w-full flex-1 items-stretch justify-stretch"
        ),
        placement: "top",
        triggerAriaLabel: oorHint
      }
    );
  };
  const labelNode = label != null ? /* @__PURE__ */ jsx("span", { className: twMerge(TRN_FIELD_CONTROL_LABEL_CLASS, "min-w-0 shrink-0"), children: label }) : null;
  const isSlider = mergedAppearance.controlStyle === "slider";
  const scrubBox = /* @__PURE__ */ jsxs("div", { className: scrubShellClass, onWheelCapture, children: [
    inFieldFillLayer,
    /* @__PURE__ */ jsxs("div", { className: "relative z-1 flex min-w-0 w-full flex-1 items-center gap-0.5", children: [
      chromeLeading,
      numberInput("center", true),
      chromeTrailing
    ] })
  ] });
  const scrubValueBox = /* @__PURE__ */ jsxs("div", { className: scrubShellClass, onWheelCapture, children: [
    inFieldFillLayer,
    /* @__PURE__ */ jsx("div", { className: "relative z-1 flex min-w-0 w-full flex-1 items-center gap-0.5", children: numberInput("center", true) })
  ] });
  const sliderBlock = /* @__PURE__ */ jsxs("div", { className: "flex w-full min-w-0 flex-col gap-0.5 overflow-visible", onWheelCapture, children: [
    /* @__PURE__ */ jsxs("div", { className: LABELED_HEADER_ROW_CLASS, children: [
      /* @__PURE__ */ jsx("div", { className: "min-w-0 justify-self-start", children: labelNode }),
      /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center justify-center", children: numberInput("center", false) }),
      /* @__PURE__ */ jsxs("div", { className: LABELED_HEADER_CHROME_CLASS, children: [
        chromeLeading,
        chromeTrailing
      ] })
    ] }),
    sliderSpan != null ? /* @__PURE__ */ jsx(
      TRNScrubSliderRail,
      {
        className: "w-full",
        value,
        min: effectiveMin,
        max: effectiveMax,
        step: effectiveStep,
        disabled,
        locked,
        onChange,
        onChangeEnd,
        ariaLabel: ariaLabel ?? (typeof label === "string" ? label : void 0)
      }
    ) : /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full rounded-full bg-zinc-800/40" })
  ] });
  const scrubWithLabel = /* @__PURE__ */ jsxs("div", { className: "flex w-full min-w-0 flex-col gap-0.5 overflow-visible", children: [
    /* @__PURE__ */ jsxs("div", { className: LABELED_HEADER_ROW_CLASS, children: [
      /* @__PURE__ */ jsx("div", { className: "min-w-0 justify-self-start", children: labelNode }),
      /* @__PURE__ */ jsx("div", {}),
      /* @__PURE__ */ jsxs("div", { className: LABELED_HEADER_CHROME_CLASS, children: [
        chromeLeading,
        chromeTrailing
      ] })
    ] }),
    scrubValueBox
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: twMerge(
          "@container/trnScrub min-w-0 w-full overflow-hidden select-none",
          embedded ? "flex h-full min-h-0 items-center" : void 0,
          className
        ),
        onContextMenu: onFieldContextMenu,
        children: isSlider ? sliderBlock : label != null ? scrubWithLabel : scrubBox
      }
    ),
    menu,
    settingsDialog
  ] });
}
var DEFAULT_OPTIONAL_APPEARANCE = {
  variant: "full",
  stepButtonsVisibility: "always",
  lockIconVisibility: "always",
  resetIconVisibility: "always",
  clearIconVisibility: "always"
};
var DEFAULT_OPTIONAL_INTERACTION = {
  pointerScrubEnabled: true,
  wheelEnabled: true,
  wheelBoundedMode: "span-percent"
};
var EMPTY_SHELL_CLASS = "w-full border-zinc-700/80 bg-zinc-950/45 text-zinc-500 hover:text-zinc-200";
function TRNOptionalScrubNumberField(props) {
  const {
    ariaLabel,
    value,
    onChange,
    step = 0.01,
    seedValue = 0,
    resetValue,
    disabled = false,
    className,
    min,
    max,
    fractionDigits,
    emptyLabel = "(none)",
    settingsKey,
    appearance = DEFAULT_OPTIONAL_APPEARANCE,
    interaction = DEFAULT_OPTIONAL_INTERACTION
  } = props;
  const baseline = resetValue ?? seedValue;
  if (value == null) {
    return /* @__PURE__ */ jsx(
      TRNButton,
      {
        size: "compact",
        disabled,
        className: twMerge(EMPTY_SHELL_CLASS, className),
        hint: `No ${ariaLabel.toLowerCase()} bound. Click to set a value.`,
        "aria-label": `${ariaLabel}: not set. Activate to enter a value.`,
        onClick: () => onChange(seedValue),
        children: emptyLabel
      }
    );
  }
  return /* @__PURE__ */ jsx(
    TRNScrubNumberField,
    {
      ariaLabel,
      className: twMerge("w-full", className),
      inputClassName: "text-[11px]",
      value,
      step,
      min,
      max,
      fractionDigits,
      disabled,
      defaultValue: baseline,
      settingsKey,
      appearance,
      interaction,
      resetAriaLabel: `Reset ${ariaLabel}`,
      clearAriaLabel: `Clear ${ariaLabel}`,
      onClear: () => onChange(null),
      onChange: (n) => onChange(n)
    }
  );
}
var TRN_LABELED_SCRUB_NUMBER_FIELD_APPEARANCE = {
  variant: "full",
  controlStyle: "scrub",
  controlStyleSwitchEnabled: false,
  inFieldFillWhenBounded: true,
  inFieldFillStyle: "soft-gradient",
  stepButtonsVisibility: "hover",
  lockIconVisibility: "always",
  resetIconVisibility: "always",
  clearIconVisibility: "hidden"
};
var TRN_LABELED_SCRUB_NUMBER_FIELD_INTERACTION = {
  pointerScrubEnabled: true,
  wheelEnabled: true,
  wheelRequiresAlt: true,
  wheelBoundedMode: "span-percent"
};
function fractionDigitsFromStep(step) {
  if (!Number.isFinite(step) || step <= 0) {
    return 2;
  }
  if (step >= 1) {
    return 0;
  }
  if (step >= 0.1) {
    return 1;
  }
  if (step >= 0.01) {
    return 2;
  }
  if (step >= 1e-3) {
    return 3;
  }
  return 4;
}
function TRNLabeledScrubNumberField(props) {
  const {
    label,
    hint,
    labelColumnClassName,
    labelLeading,
    labelTrailing,
    ariaLabel,
    className,
    size = "field",
    appearance,
    interaction,
    step,
    fractionDigits,
    ...rest
  } = props;
  const resolvedFractionDigits = fractionDigits ?? (typeof step === "number" ? fractionDigitsFromStep(step) : void 0);
  const labelText = /* @__PURE__ */ jsx("span", { className: twMerge(TRN_FIELD_CONTROL_LABEL_CLASS, "min-w-0 truncate"), children: label });
  const labelNode = hint != null && hint.length > 0 ? /* @__PURE__ */ jsx(
    TRNHintTooltip,
    {
      trigger: /* @__PURE__ */ jsx("span", { className: "cursor-help truncate", children: labelText }),
      content: hint,
      triggerAriaLabel: `About ${label}`,
      placement: "left",
      triggerWrapper: "span",
      triggerClassName: "!justify-start !p-0",
      wide: hint.length > 120
    }
  ) : labelText;
  return /* @__PURE__ */ jsxs("div", { className: twMerge("flex w-full min-w-0 select-none items-center gap-3", className), children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: twMerge(
          "flex shrink-0 items-center gap-1 truncate",
          labelColumnClassName ?? "w-28"
        ),
        children: [
          labelLeading,
          labelNode,
          labelTrailing
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsx(
      TRNScrubNumberField,
      {
        ...rest,
        step,
        fractionDigits: resolvedFractionDigits,
        ariaLabel: ariaLabel ?? label,
        size,
        className: "w-full",
        appearance: { ...TRN_LABELED_SCRUB_NUMBER_FIELD_APPEARANCE, ...appearance },
        interaction: { ...TRN_LABELED_SCRUB_NUMBER_FIELD_INTERACTION, ...interaction }
      }
    ) })
  ] });
}

// src/trn-scrub-field-badge-tones.ts
var TRN_SCRUB_FIELD_BADGE_TONE_CLASS = {
  violet: "bg-violet-500/15 text-violet-300/95",
  amber: "bg-amber-500/15 text-amber-300/95",
  rose: "bg-rose-500/15 text-rose-300/95",
  emerald: "bg-emerald-500/15 text-emerald-300/95",
  sky: "bg-sky-500/15 text-sky-300/95",
  neutral: "bg-zinc-500/15 text-zinc-300/95"
};
function resolveToneClass(tone, className) {
  if (tone === "custom" || className != null) {
    return className ?? TRN_SCRUB_FIELD_BADGE_TONE_CLASS.neutral;
  }
  return TRN_SCRUB_FIELD_BADGE_TONE_CLASS[tone ?? "neutral"];
}
function TRNScrubFieldBadge(props) {
  const { badge, className } = props;
  if (badge.kind === "node") {
    return /* @__PURE__ */ jsx("span", { className: twMerge("shrink-0", className), children: badge.node });
  }
  const toneClass = resolveToneClass(badge.tone, badge.kind === "text" ? badge.className : badge.className);
  if (badge.kind === "icon") {
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: twMerge(
          "inline-flex w-5 shrink-0 items-center justify-center self-stretch p-0",
          toneClass,
          className
        ),
        "aria-label": badge.ariaLabel,
        children: badge.icon
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: twMerge(
        "inline-flex w-5 shrink-0 items-center justify-center self-stretch p-0 text-[10px] font-semibold",
        toneClass,
        className
      ),
      "aria-hidden": true,
      children: badge.text
    }
  );
}

// src/trn-dense-field-shell.ts
var TRN_DENSE_FIELD_SHELL = "flex min-h-[26px] w-full min-w-0 items-stretch gap-0 overflow-hidden rounded border border-zinc-700/80 bg-zinc-950/45 p-0";
var TRN_BADGED_SCRUB_COMPACT_APPEARANCE = {
  variant: "full",
  controlStyle: "scrub",
  controlStyleSwitchEnabled: false,
  stepButtonsVisibility: "hidden",
  lockIconVisibility: "always",
  resetIconVisibility: "hidden",
  clearIconVisibility: "hidden"
};
var TRN_BADGED_SCRUB_FULL_APPEARANCE = {
  variant: "full",
  controlStyle: "scrub",
  controlStyleSwitchEnabled: false,
  stepButtonsVisibility: "hidden",
  lockIconVisibility: "always",
  resetIconVisibility: "hover",
  clearIconVisibility: "hidden"
};
function TRNBadgedScrubNumberField(props) {
  const {
    badge,
    ariaLabel,
    value,
    onChange,
    min,
    max,
    step,
    fractionDigits,
    disabled = false,
    locked,
    onLockedChange,
    className,
    suffix,
    density = "compact",
    settingsKey,
    appearance,
    interaction,
    defaultValue,
    onClear,
    onReset,
    size = "md"
  } = props;
  const resolvedAppearance = {
    ...appearance ?? (density === "full" ? TRN_BADGED_SCRUB_FULL_APPEARANCE : TRN_BADGED_SCRUB_COMPACT_APPEARANCE),
    controlStyle: "scrub",
    controlStyleSwitchEnabled: false
  };
  const rowLocked = locked === true;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: twMerge(
        "group/trnScrubField min-w-0 w-full",
        TRN_DENSE_FIELD_SHELL,
        disabled ? "opacity-60" : "",
        rowLocked && !disabled ? "opacity-80" : "",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(TRNScrubFieldBadge, { badge }),
        /* @__PURE__ */ jsx(
          TRNScrubNumberField,
          {
            embedded: true,
            ariaLabel,
            className: "flex h-full min-h-0 min-w-0 flex-1 items-center px-1",
            inputClassName: size === "sm" ? "text-[10px] leading-none" : "text-[11px] leading-none",
            value,
            step,
            min,
            max,
            fractionDigits,
            disabled,
            locked,
            onLockedChange,
            settingsKey,
            appearance: resolvedAppearance,
            interaction,
            defaultValue,
            onClear,
            onReset,
            size,
            onChange: (next) => {
              if (rowLocked) {
                return;
              }
              onChange(next);
            }
          }
        ),
        suffix != null ? /* @__PURE__ */ jsx("span", { className: "shrink-0 self-center pr-1 pl-0.5 text-[10px] tracking-tight text-zinc-500", children: suffix }) : null
      ]
    }
  );
}
function TRNBadgedScrubNumberFieldGrid(props) {
  const { columns = 2, className, children } = props;
  const gridClass = columns === 3 ? "grid-cols-[repeat(3,minmax(0,1fr))]" : "grid-cols-[repeat(2,minmax(0,1fr))]";
  return /* @__PURE__ */ jsx("div", { className: twMerge("grid w-full min-w-0 gap-1.5", gridClass, className), children });
}
var PLACEMENT_BADGED_APPEARANCE = {
  variant: "full",
  controlStyle: "scrub",
  controlStyleSwitchEnabled: false,
  stepButtonsVisibility: "hidden",
  lockIconVisibility: "hidden",
  resetIconVisibility: "hidden",
  clearIconVisibility: "hidden"
};
var PLACEMENT_AXIS_META = [
  {
    key: "row",
    badge: { kind: "text", text: "R", tone: "emerald" },
    ariaLabel: "Row",
    limitKeys: { min: "rowMin", max: "rowMax" },
    defaultMin: 1,
    defaultMax: 200
  },
  {
    key: "column",
    badge: { kind: "text", text: "C", tone: "sky" },
    ariaLabel: "Column",
    limitKeys: { min: "columnMin", max: "columnMax" },
    defaultMin: 1,
    defaultMax: 48
  },
  {
    key: "columnSpan",
    badge: { kind: "text", text: "W", tone: "violet" },
    ariaLabel: "Width in columns",
    limitKeys: { min: "columnSpanMin", max: "columnSpanMax" },
    defaultMin: 1,
    defaultMax: 48
  },
  {
    key: "rowSpan",
    badge: { kind: "text", text: "H", tone: "amber" },
    ariaLabel: "Height in rows",
    limitKeys: { min: "rowSpanMin", max: "rowSpanMax" },
    defaultMin: 1,
    defaultMax: 200
  }
];
function resolveLimit(limits, key, fallback) {
  return limits?.[key] ?? fallback;
}
function PlacementBadgedField(props) {
  const { axis, value, limits, disabled = false, onChange } = props;
  const min = resolveLimit(limits, axis.limitKeys.min, axis.defaultMin);
  const max = resolveLimit(limits, axis.limitKeys.max, axis.defaultMax);
  return /* @__PURE__ */ jsx(
    TRNBadgedScrubNumberField,
    {
      badge: axis.badge,
      ariaLabel: axis.ariaLabel,
      value,
      min,
      max,
      step: 1,
      fractionDigits: 0,
      disabled,
      density: "compact",
      size: "sm",
      appearance: PLACEMENT_BADGED_APPEARANCE,
      interaction: { pointerScrubEnabled: false },
      onChange
    }
  );
}
function TRNGridPlacementBadgedFields(props) {
  const {
    placement,
    onPatch,
    layout = "stack",
    disabled = false,
    limits,
    className
  } = props;
  const fields = PLACEMENT_AXIS_META.map((axis) => /* @__PURE__ */ jsx(
    PlacementBadgedField,
    {
      axis,
      value: placement[axis.key],
      limits,
      disabled,
      onChange: (next) => {
        onPatch({ [axis.key]: next });
      }
    },
    axis.key
  ));
  if (layout === "strip") {
    return /* @__PURE__ */ jsx("div", { className: twMerge("grid grid-cols-4 gap-1.5", className), children: fields });
  }
  if (layout === "grid") {
    return /* @__PURE__ */ jsx(TRNBadgedScrubNumberFieldGrid, { className, columns: 2, children: fields });
  }
  return /* @__PURE__ */ jsx("div", { className: twMerge("flex flex-col gap-1.5", className), children: fields });
}
var AXIS_META = [
  { k: "x", label: "X", tone: "rose" },
  { k: "y", label: "Y", tone: "emerald" },
  { k: "z", label: "Z", tone: "sky" }
];
var TRN_VECTOR3_AXIS_UNLOCKED = {
  x: false,
  y: false,
  z: false
};
function TRNVector3Field(props) {
  const {
    label,
    hint,
    value,
    onChange,
    step = 0.01,
    min,
    max,
    fractionDigits,
    disabled = false,
    unit,
    className = "",
    showAxisLocks = true,
    lockedAxes: lockedAxesControlled,
    defaultLockedAxes,
    onLockedAxesChange,
    horizontalPxPerTenthPercent,
    verticalPxPerPercent,
    wheelPixelAccumThreshold,
    pointerScrubEnabled
  } = props;
  const [internalLocks, setInternalLocks] = useState(() => ({
    x: defaultLockedAxes?.x ?? false,
    y: defaultLockedAxes?.y ?? false,
    z: defaultLockedAxes?.z ?? false
  }));
  const locks = lockedAxesControlled !== void 0 ? lockedAxesControlled : internalLocks;
  const setAxisLock = useCallback(
    (axis, locked) => {
      const next = { ...locks, [axis]: locked };
      if (lockedAxesControlled === void 0) {
        setInternalLocks(next);
      }
      onLockedAxesChange?.(next);
    },
    [lockedAxesControlled, locks, onLockedAxesChange]
  );
  const stringLabel = typeof label === "string" ? label : void 0;
  const grid = /* @__PURE__ */ jsx(TRNBadgedScrubNumberFieldGrid, { columns: 3, children: AXIS_META.map((axis) => {
    const v = value[axis.k];
    const axisLocked = locks[axis.k];
    const ariaLabel = stringLabel != null ? `${stringLabel} ${axis.label}` : `${axis.label} axis`;
    return /* @__PURE__ */ jsx(
      TRNBadgedScrubNumberField,
      {
        badge: { kind: "text", text: axis.label, tone: axis.tone },
        ariaLabel,
        value: Number.isFinite(v) ? v : 0,
        step,
        min,
        max,
        fractionDigits,
        disabled,
        locked: showAxisLocks ? axisLocked : false,
        onLockedChange: showAxisLocks ? (next) => {
          setAxisLock(axis.k, next);
        } : void 0,
        suffix: unit != null && unit.length > 0 ? unit : void 0,
        density: "compact",
        interaction: {
          pointerScrubEnabled: pointerScrubEnabled ?? false,
          horizontalPxPerTenthPercent,
          verticalPxPerPercent,
          wheelPixelAccumThreshold
        },
        appearance: showAxisLocks ? void 0 : {
          ...TRN_BADGED_SCRUB_COMPACT_APPEARANCE,
          lockIconVisibility: "hidden"
        },
        onChange: (next) => {
          onChange({ ...value, [axis.k]: next });
        }
      },
      axis.k
    );
  }) });
  if (stringLabel != null) {
    return /* @__PURE__ */ jsx(TRNFormField, { label: stringLabel, hint, className, children: grid });
  }
  return /* @__PURE__ */ jsxs("div", { className: twMerge("space-y-1", className), children: [
    label != null ? /* @__PURE__ */ jsx("div", { className: "text-[11px] font-medium text-zinc-100", children: label }) : null,
    grid
  ] });
}
var GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6"
};
function TRNChipButtonGroup(props) {
  const {
    label,
    value,
    options,
    onChange,
    columns = 3,
    size = "sm",
    disabled = false,
    className,
    ariaLabel
  } = props;
  const sizeClass = size === "sm" ? TRN_COMPACT_CHOICE_BUTTON_SIZE : "py-1.5 px-2 text-xs font-semibold";
  return /* @__PURE__ */ jsxs("div", { className: twMerge("space-y-2", className), children: [
    label != null && label.length > 0 ? /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-zinc-100", children: label }) : null,
    /* @__PURE__ */ jsx(
      "div",
      {
        role: "radiogroup",
        "aria-label": ariaLabel ?? label,
        className: twMerge("grid gap-1", GRID_COLS[columns] ?? "grid-cols-3"),
        children: options.map((option) => {
          const isSelected = value === option.value;
          const isOptionDisabled = disabled || option.disabled === true;
          const isLoading = option.loading === true;
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              role: "radio",
              "aria-checked": isSelected,
              title: option.title,
              disabled: isOptionDisabled || isLoading,
              onClick: () => {
                if (!isOptionDisabled && !isLoading) {
                  onChange(option.value);
                }
              },
              className: twMerge(
                TRN_COMPACT_CHOICE_BUTTON_BASE,
                "w-full min-w-0 gap-1",
                sizeClass,
                trnCompactChoiceButtonTone(isSelected, isOptionDisabled || isLoading)
              ),
              children: isLoading ? /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent",
                  "aria-hidden": true
                }
              ) : /* @__PURE__ */ jsxs(Fragment, { children: [
                option.icon != null ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0", children: option.icon }) : null,
                /* @__PURE__ */ jsx("span", { className: "truncate", children: option.label })
              ] })
            },
            String(option.value)
          );
        })
      }
    )
  ] });
}
function TRNIconOptionGroup({
  label,
  value,
  options,
  onChange,
  layout = "column",
  className,
  disabled = false
}) {
  const gridClass = layout === "row" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2";
  const buttons = /* @__PURE__ */ jsx("div", { className: gridClass, role: "radiogroup", "aria-label": label, children: options.map((opt) => {
    const selected = opt.value === value;
    const Icon = opt.icon;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        role: "radio",
        "aria-checked": selected,
        title: opt.title,
        disabled,
        onClick: () => onChange(opt.value),
        className: twMerge(
          "inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border px-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50",
          selected ? "border-zinc-700/80 bg-cyan-500/20 text-cyan-100" : "border-zinc-700/80 bg-zinc-950/90 text-zinc-300 hover:bg-zinc-800/70"
        ),
        children: [
          Icon != null ? /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 shrink-0 opacity-90", "aria-hidden": true }) : null,
          /* @__PURE__ */ jsx("span", { className: "truncate text-center", children: opt.label })
        ]
      },
      opt.value
    );
  }) });
  if (label != null && label.length > 0) {
    return /* @__PURE__ */ jsx(TRNFormField, { label, className, children: buttons });
  }
  return /* @__PURE__ */ jsx("div", { className, children: buttons });
}

// src/trnSortableSettingsCardStorage.ts
var TRN_SORTABLE_SETTINGS_CARD_STORAGE_PREFIX = "t3d-card-order-";
function getTrnSortableSettingsCardStorageKey(panelId) {
  return `${TRN_SORTABLE_SETTINGS_CARD_STORAGE_PREFIX}${panelId}`;
}
function loadTrnSortableSettingsCardData(panelId, defaultOrder, items) {
  if (typeof window === "undefined") {
    const defaultExpandedStates2 = {};
    items.forEach((item) => {
      defaultExpandedStates2[item.id] = item.defaultExpanded ?? true;
    });
    return { order: defaultOrder, expandedStates: defaultExpandedStates2 };
  }
  try {
    const key = getTrnSortableSettingsCardStorageKey(panelId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const savedOrder = parsed.filter(
          (id) => defaultOrder.includes(id)
        );
        const newItems = defaultOrder.filter((id) => !parsed.includes(id));
        const migratedOrder = [...savedOrder, ...newItems];
        const migratedExpandedStates = {};
        items.forEach((item) => {
          migratedExpandedStates[item.id] = item.defaultExpanded ?? true;
        });
        const migratedData = {
          order: migratedOrder,
          expandedStates: migratedExpandedStates
        };
        saveTrnSortableSettingsCardData(panelId, migratedData);
        return migratedData;
      }
      if (parsed && typeof parsed === "object" && "order" in parsed && "expandedStates" in parsed) {
        const data = parsed;
        const savedOrder = data.order.filter((id) => defaultOrder.includes(id));
        const newItems = defaultOrder.filter((id) => !data.order.includes(id));
        const resultOrder = [...savedOrder, ...newItems];
        const resultExpandedStates = {
          ...data.expandedStates
        };
        items.forEach((item) => {
          if (!(item.id in resultExpandedStates)) {
            resultExpandedStates[item.id] = item.defaultExpanded ?? true;
          }
        });
        Object.keys(resultExpandedStates).forEach((id) => {
          if (!defaultOrder.includes(id)) {
            delete resultExpandedStates[id];
          }
        });
        return { order: resultOrder, expandedStates: resultExpandedStates };
      }
    }
  } catch (error) {
    console.warn("Failed to load sortable settings card data:", error);
  }
  const defaultExpandedStates = {};
  items.forEach((item) => {
    defaultExpandedStates[item.id] = item.defaultExpanded ?? true;
  });
  return { order: defaultOrder, expandedStates: defaultExpandedStates };
}
function saveTrnSortableSettingsCardData(panelId, data) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const key = getTrnSortableSettingsCardStorageKey(panelId);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, cannot save card data");
    } else {
      console.warn("Failed to save sortable settings card data:", error);
    }
  }
}
function TRNSortableSettingsCardList({
  items,
  panelId,
  className,
  persistState = true,
  defaultContentClassName = "border-t border-zinc-800/60 pt-2"
}) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const itemIdsString = useMemo(
    () => itemIds.slice().sort().join(","),
    [itemIds]
  );
  const buildDefaultExpandedStates = useCallback(() => {
    const states = {};
    items.forEach((item) => {
      states[item.id] = item.defaultExpanded ?? true;
    });
    return states;
  }, [items]);
  const defaultOrder = useMemo(() => itemIds, [itemIds]);
  const initialData = useMemo(() => {
    if (!persistState) {
      return {
        order: defaultOrder,
        expandedStates: buildDefaultExpandedStates()
      };
    }
    return loadTrnSortableSettingsCardData(panelId, defaultOrder, items);
  }, [panelId, itemIdsString, persistState]);
  const [order, setOrder] = useState(initialData.order);
  const [expandedStates, setExpandedStates] = useState(
    initialData.expandedStates
  );
  const previousItemIdsRef = useRef(itemIdsString);
  const persist = useCallback(
    (nextOrder, nextExpanded) => {
      if (persistState) {
        saveTrnSortableSettingsCardData(panelId, {
          order: nextOrder,
          expandedStates: nextExpanded
        });
      }
    },
    [panelId, persistState]
  );
  const handleCardToggle = useCallback(
    (cardId, expanded) => {
      setExpandedStates((prev) => {
        const newStates = { ...prev, [cardId]: expanded };
        persist(order, newStates);
        return newStates;
      });
    },
    [order, persist]
  );
  useEffect(() => {
    if (previousItemIdsRef.current === itemIdsString) {
      return;
    }
    const previousIds = new Set(
      previousItemIdsRef.current.split(",").filter(Boolean)
    );
    const currentIds = new Set(items.map((item) => item.id));
    const itemIdArray = items.map((item) => item.id);
    const hasNewItems = itemIdArray.some((id) => !previousIds.has(id));
    const hasRemovedItems = Array.from(previousIds).some(
      (id) => !currentIds.has(id)
    );
    if (hasNewItems || hasRemovedItems) {
      const existingOrder = order.filter((id) => currentIds.has(id));
      const newItemIds = itemIdArray.filter((id) => !previousIds.has(id));
      const newOrder = [...existingOrder, ...newItemIds];
      const newExpandedStates = { ...expandedStates };
      newItemIds.forEach((id) => {
        const item = items.find((entry) => entry.id === id);
        if (item && !(id in newExpandedStates)) {
          newExpandedStates[id] = item.defaultExpanded ?? true;
        }
      });
      Object.keys(newExpandedStates).forEach((id) => {
        if (!currentIds.has(id)) {
          delete newExpandedStates[id];
        }
      });
      if (JSON.stringify(newOrder) !== JSON.stringify(order)) {
        setOrder(newOrder);
        setExpandedStates(newExpandedStates);
        persist(newOrder, newExpandedStates);
      }
    }
    previousItemIdsRef.current = itemIdsString;
  }, [itemIdsString, items, order, expandedStates, persist]);
  const sortedItems = order.map((id) => items.find((item) => item.id === id)).filter((item) => item != null);
  const newItems = items.filter((item) => !order.includes(item.id));
  const finalItems = [...sortedItems, ...newItems];
  const sortableItemIds = finalItems.map((item) => item.id);
  const handleReorder = useCallback(
    (nextItemIds) => {
      setOrder(nextItemIds);
      persist(nextItemIds, expandedStates);
    },
    [expandedStates, persist]
  );
  return /* @__PURE__ */ jsx(
    TRNSortableContainer,
    {
      itemIds: sortableItemIds,
      onReorder: handleReorder,
      className: className ?? "space-y-2",
      children: finalItems.map((item) => /* @__PURE__ */ jsx(
        TRNSortableItem,
        {
          id: item.id,
          dragFx: "tilt",
          children: /* @__PURE__ */ jsx(
            TRNInteractiveCard,
            {
              title: item.title,
              hint: item.hint,
              shell: item.shell,
              className: item.cardClassName ?? "h-auto",
              headerTitleClassName: item.headerTitleClassName,
              titleLeadingSlot: item.icon != null ? /* @__PURE__ */ jsxs("span", { className: "inline-flex shrink-0 items-center gap-1", children: [
                /* @__PURE__ */ jsx(TRNDragHandle, {}),
                item.icon
              ] }) : /* @__PURE__ */ jsx(TRNDragHandle, {}),
              titleTrailingSlot: item.titleTrailingSlot,
              collapsible: true,
              collapsed: !(expandedStates[item.id] ?? item.defaultExpanded ?? true),
              onCollapsedChange: (collapsed) => handleCardToggle(item.id, !collapsed),
              collapsibleMeasureIntrinsic: true,
              contentClassName: item.contentClassName ?? defaultContentClassName,
              children: item.content
            }
          )
        },
        item.id
      ))
    }
  );
}
var READOUT_AXIS_META = {
  x: {
    label: "X",
    ring: "border-rose-500/70 text-rose-200",
    valueClass: "text-rose-200"
  },
  y: {
    label: "Y",
    ring: "border-emerald-500/70 text-emerald-200",
    valueClass: "text-emerald-200"
  },
  z: {
    label: "Z",
    ring: "border-sky-500/70 text-sky-200",
    valueClass: "text-sky-200"
  },
  w: {
    label: "W",
    ring: "border-pink-500/70 text-pink-200",
    valueClass: "text-pink-200"
  }
};
var TRN_AXIS_VALUE_CLASS = {
  x: "text-rose-300/95",
  y: "text-emerald-300/95",
  z: "text-sky-300/95",
  w: "text-pink-300/95"
};
function formatTrnAxisNumber(value, decimals = 3) {
  if (!Number.isFinite(value)) {
    return "\u2014";
  }
  return value.toFixed(decimals);
}
function gridColsClass(axisCount) {
  if (axisCount === 4) {
    return "grid-cols-4";
  }
  if (axisCount === 2) {
    return "grid-cols-2";
  }
  return "grid-cols-3";
}
function TRNAxisVectorReadout({
  axes,
  values,
  decimals = 3,
  className
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: twMerge(
        "grid gap-1.5",
        gridColsClass(axes.length),
        className
      ),
      children: axes.map((axis) => {
        const meta = READOUT_AXIS_META[axis];
        const value = values[axis] ?? NaN;
        const formatted = formatTrnAxisNumber(value, decimals);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex min-w-0 items-center gap-1 rounded border border-zinc-700/80 bg-zinc-950/45 px-1 py-1",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] font-semibold " + meta.ring,
                  "aria-hidden": true,
                  children: meta.label
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "min-w-0 flex-1 truncate text-right text-[11px] leading-tight " + meta.valueClass,
                  title: formatted,
                  children: formatted
                }
              )
            ]
          },
          axis
        );
      })
    }
  );
}
function TRNPoseCompareBlock({
  label,
  target,
  current,
  axes,
  decimals,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: twMerge("space-y-1.5", className), children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] font-medium text-zinc-300", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-zinc-500", children: "Target" }),
        /* @__PURE__ */ jsx(TRNAxisVectorReadout, { axes, values: target, decimals })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-zinc-500", children: "Current" }),
        /* @__PURE__ */ jsx(TRNAxisVectorReadout, { axes, values: current, decimals })
      ] })
    ] })
  ] });
}
function TRNPoseCompareStack({
  rows,
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: twMerge("space-y-3", className), children: rows.map((row) => /* @__PURE__ */ jsx(TRNPoseCompareBlock, { ...row }, row.label)) });
}
function TRNKeyValueRow({ label, value, className }) {
  return /* @__PURE__ */ jsxs("div", { className: twMerge("space-y-1 text-[11px]", className), children: [
    /* @__PURE__ */ jsx("div", { className: "font-medium text-zinc-500", children: label }),
    /* @__PURE__ */ jsx("div", { className: "min-w-0", children: value })
  ] });
}
function TRNTransformSection(props) {
  const {
    title = "Transform",
    value,
    onChange,
    showRotation = true,
    showScale = true,
    rotationUnitLabel = "",
    disabled = false,
    className = "",
    scrubInteraction
  } = props;
  const uniformScale = value.uniformScale !== false;
  const rotationDeg = value.rotationDeg ?? { x: 0, y: 0, z: 0 };
  return /* @__PURE__ */ jsxs("section", { className: "space-y-2 " + className, children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold text-zinc-100", children: title }),
    /* @__PURE__ */ jsx(
      TRNVector3Field,
      {
        label: "Position",
        value: value.position,
        onChange: (next) => onChange({ ...value, position: next }),
        step: 0.01,
        disabled,
        ...scrubInteraction
      }
    ),
    showRotation ? /* @__PURE__ */ jsx(
      TRNVector3Field,
      {
        label: "Rotation (deg)",
        value: rotationDeg,
        onChange: (next) => onChange({ ...value, rotationDeg: next }),
        step: 0.5,
        unit: rotationUnitLabel.length > 0 ? rotationUnitLabel : void 0,
        disabled,
        ...scrubInteraction
      }
    ) : null,
    showScale ? /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded border border-zinc-700/80 bg-zinc-950/35 px-2 py-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-zinc-200", children: "Uniform scale" }),
        /* @__PURE__ */ jsx(
          TRNToggleSwitch,
          {
            checked: uniformScale,
            ariaLabel: "Toggle uniform scale",
            onCheckedChange: (checked) => onChange({ ...value, uniformScale: checked }),
            disabled
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        TRNVector3Field,
        {
          label: "Scale",
          value: value.scale,
          onChange: (next) => {
            if (!uniformScale) {
              onChange({ ...value, scale: next });
              return;
            }
            const s = next.x ?? next.y ?? next.z ?? 1;
            onChange({ ...value, scale: { x: s, y: s, z: s } });
          },
          step: 0.01,
          disabled,
          ...scrubInteraction
        }
      )
    ] }) : null
  ] });
}
function sceneNodeLabel(obj) {
  const trimmed = obj.name.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  if (obj instanceof THREE.Mesh) {
    return "Mesh";
  }
  if (obj instanceof THREE.Group) {
    return "Group";
  }
  return obj.type;
}
function buildSceneNode(obj) {
  const childNodes = obj.children.map(buildSceneNode).filter((node) => node != null);
  const isMesh = obj instanceof THREE.Mesh;
  if (!isMesh && childNodes.length === 0) {
    return null;
  }
  return {
    id: obj.uuid,
    name: sceneNodeLabel(obj),
    kind: isMesh ? "mesh" : "group",
    meshName: isMesh && obj.name.trim().length > 0 ? obj.name.trim() : void 0,
    children: childNodes
  };
}
function buildTrnGlbSceneTree(root) {
  const topLevel = root.children.map(buildSceneNode).filter((node) => node != null);
  if (topLevel.length === 1) {
    return topLevel;
  }
  const rootNode = buildSceneNode(root);
  return rootNode != null ? [rootNode] : topLevel;
}

// src/glb-scene-tree/trnGlbSceneTreeUtils.ts
function isTrnGlbSceneMeshSelectable(node) {
  return node.kind === "mesh" && node.meshName != null;
}
function listTrnGlbSceneMeshNames(nodes) {
  const names = [];
  const walk = (node) => {
    if (node.kind === "mesh" && node.meshName != null) {
      names.push(node.meshName);
    }
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return [...new Set(names)].sort();
}
function collectTrnGlbSceneExpandableIds(nodes) {
  const ids = [];
  const walk = (node) => {
    if (node.kind === "group" && node.children.length > 0) {
      ids.push(node.id);
    }
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return ids;
}
function isTrnGlbSceneNodeSelected(node, selectedNodeId, selectedMeshName) {
  if (selectedNodeId != null && node.id === selectedNodeId) {
    return true;
  }
  return selectedMeshName != null && node.meshName != null && node.meshName === selectedMeshName;
}
function trnGlbSceneTreeRowClass(selected, selectable) {
  const base = "flex min-h-[22px] w-full min-w-0 flex-1 items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] transition-colors";
  if (selected) {
    return `${base} ${TRN_GLASS_LISTBOX_OPTION_SELECTED_CLASSNAME}`;
  }
  if (!selectable) {
    return `${base} text-zinc-500`;
  }
  return `${base} text-zinc-200 hover:bg-zinc-900/65`;
}
function resolveTrnGlbSceneNodeIcon(node) {
  return node.kind === "mesh" ? Box : Folder;
}
function SceneTreeNodeRow(props) {
  const {
    node,
    depth,
    expandedIds,
    selectedNodeId,
    selectedMeshName,
    isNodeSelectable,
    onToggleExpand,
    onSelectNode,
    onSelectMeshName,
    onHoverNode
  } = props;
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const selectable = isNodeSelectable(node);
  const selected = selectable && isTrnGlbSceneNodeSelected(node, selectedNodeId, selectedMeshName);
  const NodeIcon = resolveTrnGlbSceneNodeIcon(node);
  const handleSelect = () => {
    if (!selectable) {
      return;
    }
    onSelectNode?.(node);
    if (node.meshName != null) {
      onSelectMeshName?.(node.meshName);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "min-w-0", style: { paddingLeft: depth * 10 }, children: /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-stretch gap-0.5", children: [
      hasChildren ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "flex size-5 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200",
          "aria-label": expanded ? "Collapse" : "Expand",
          onClick: () => onToggleExpand(node.id),
          children: expanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "size-3" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "size-3" })
        }
      ) : /* @__PURE__ */ jsx("span", { className: "size-5 shrink-0", "aria-hidden": true }),
      selectable ? /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: trnGlbSceneTreeRowClass(selected, true),
          onClick: handleSelect,
          onMouseEnter: () => onHoverNode?.(node),
          onMouseLeave: () => onHoverNode?.(null),
          children: [
            /* @__PURE__ */ jsx(NodeIcon, { className: "size-3 shrink-0 text-zinc-500", "aria-hidden": true }),
            /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: node.name })
          ]
        }
      ) : /* @__PURE__ */ jsxs("div", { className: trnGlbSceneTreeRowClass(false, false), children: [
        /* @__PURE__ */ jsx(
          NodeIcon,
          {
            className: "size-3 shrink-0 " + (node.kind === "mesh" ? "text-zinc-600" : "text-zinc-500"),
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: node.name })
      ] })
    ] }) }),
    hasChildren && expanded ? node.children.map((child) => /* @__PURE__ */ jsx(
      SceneTreeNodeRow,
      {
        node: child,
        depth: depth + 1,
        expandedIds,
        selectedNodeId,
        selectedMeshName,
        isNodeSelectable,
        onToggleExpand,
        onSelectNode,
        onSelectMeshName,
        onHoverNode
      },
      child.id
    )) : null
  ] });
}
function TRNGlbSceneTree(props) {
  const {
    nodes,
    treeKey,
    selectedNodeId = null,
    selectedMeshName = null,
    onSelectNode,
    onSelectMeshName,
    onHoverNode,
    isNodeSelectable = isTrnGlbSceneMeshSelectable,
    showExpandToolbar = true,
    className,
    scrollClassName,
    ariaLabel = "Model outline",
    emptyState = null
  } = props;
  const [expandedIds, setExpandedIds] = useState(() => /* @__PURE__ */ new Set());
  useEffect(() => {
    setExpandedIds(new Set(collectTrnGlbSceneExpandableIds(nodes)));
  }, [nodes, treeKey]);
  const toggleExpand = useCallback((nodeId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);
  const expandAll = useCallback(() => {
    setExpandedIds(new Set(collectTrnGlbSceneExpandableIds(nodes)));
  }, [nodes]);
  const collapseAll = useCallback(() => {
    setExpandedIds(/* @__PURE__ */ new Set());
  }, []);
  if (nodes.length === 0) {
    return emptyState;
  }
  return /* @__PURE__ */ jsxs("div", { className: twMerge("min-w-0", className), children: [
    showExpandToolbar ? /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-end gap-1", children: [
      /* @__PURE__ */ jsx(
        TRNButton,
        {
          type: "button",
          size: "compact",
          className: "px-2 text-[10px]",
          hint: "Expand every branch in the scene hierarchy.",
          onClick: expandAll,
          children: "Expand all"
        }
      ),
      /* @__PURE__ */ jsx(
        TRNButton,
        {
          type: "button",
          size: "compact",
          className: "px-2 text-[10px]",
          hint: "Collapse to root nodes only.",
          onClick: collapseAll,
          children: "Collapse all"
        }
      )
    ] }) : null,
    /* @__PURE__ */ jsx(
      TRNMenuScrollRegion,
      {
        className: twMerge("max-h-48 rounded-md", scrollClassName),
        role: "tree",
        "aria-label": ariaLabel,
        children: /* @__PURE__ */ jsx("div", { className: "space-y-px p-1", children: nodes.map((node) => /* @__PURE__ */ jsx(
          SceneTreeNodeRow,
          {
            node,
            depth: 0,
            expandedIds,
            selectedNodeId,
            selectedMeshName,
            isNodeSelectable,
            onToggleExpand: toggleExpand,
            onSelectNode,
            onSelectMeshName,
            onHoverNode
          },
          node.id
        )) })
      }
    )
  ] });
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
function isEditableTarget2(target) {
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
      if (isEditableTarget2(event.target)) {
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
      if (isEditableTarget2(event.target)) {
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
      gsap: gsap,
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

export { DEFAULT_TRN_ICON_PULSE_PEAK_COLOR_HEX, TOOLBAR_HEADER_DROPDOWN_MENU_ITEM_CLASS, TOOLBAR_HEADER_DROPDOWN_MENU_PANEL_CLASS, TRNAccordion, TRNAccordionContent, TRNAccordionItem, TRNAccordionTrigger, TRNAlertOverlay, TRNAxisVectorReadout, TRNBadgedScrubNumberField, TRNBadgedScrubNumberFieldGrid, TRNBooleanSegment, TRNButton, TRNCard, TRNCardHeader, TRNChipButtonGroup, TRNColorRingPicker, TRNCommandPalette, TRNContainer, TRNContextDialog, TRNDataGrid, TRNDragHandle, TRNFloatingNotice, TRNFormField, TRNFormSection, TRNGlassButton, TRNGlbSceneTree, TRNGridPlacementBadgedFields, TRNHighlightedCodeBlock, TRNHighlightedJsonBlock, TRNHighlightedJsonTextarea, TRNHintText, TRNHintTooltip, TRNHoldModeIconButton, TRNIconButton, TRNIconOptionGroup, TRNIconRailSplitPane, TRNInlineEdit, TRNInlineToggleRow, TRNInput, TRNInputGroup, TRNInspectorContextBar, TRNInspectorIconRail, TRNInspectorPanelShell, TRNInteractiveCard, TRNKeyValueRow, TRNLabeledScrubNumberField, TRNMenuFilterableSection, TRNMenuItemButton, TRNMenuNoResults, TRNMenuPanel, TRNMenuScrollRegion, TRNMenuSearchField, TRNMenuSearchProvider, TRNMenuSearchableRow, TRNMenuSectionTitle, TRNMessageDialog, TRNOptionalScrubNumberField, TRNParameter, TRNParameterSlider, TRNPieMenu, TRNPoseCompareBlock, TRNPoseCompareStack, TRNPresetGroup, TRNQuickHintTooltip, TRNRangeSlider, TRNScrollableEdgeHints, TRNScrubFieldBadge, TRNScrubNumberField, TRNScrubNumberInput, TRNSearchableMenuShell, TRNSectionContainer, TRNSegmentedControl, TRNSelect, TRNSettingRow, TRNSettingsPanel, TRNSidePanel, TRNSortableCard, TRNSortableContainer, TRNSortableItem, TRNSortableSettingsCardList, TRNSplitPane, TRNStatusIcon, TRNTabs, TRNTabsContent, TRNTabsList, TRNTabsTrigger, TRNTextarea, TRNTitleDescriptionHint, TRNToggleSwitch, TRNToolbar, TRNToolbarDivider, TRNToolbarGroup, TRNToolbarSpacer, TRNToolboxPanel, TRNTooltip, TRNTransformSection, TRNTransientStatusBadge, TRNTree, TRNVector3Field, TRNWindow, TRN_AXIS_VALUE_CLASS, TRN_BADGED_SCRUB_COMPACT_APPEARANCE, TRN_BADGED_SCRUB_FULL_APPEARANCE, TRN_DENSE_FIELD_SHELL, TRN_FIELD_CONTROL_BORDER_BG_CLASS, TRN_FIELD_CONTROL_DEFAULT_SIZE, TRN_FIELD_CONTROL_DEFAULT_VARIANT, TRN_FIELD_CONTROL_FIELD_VARIANT_CLASS, TRN_FIELD_CONTROL_GLASS_VARIANT_CLASS, TRN_FIELD_CONTROL_LABEL_CLASS, TRN_FIELD_CONTROL_PADDING_MD_CLASS, TRN_FIELD_CONTROL_ROW_SHELL_CLASS, TRN_FIELD_CONTROL_SHADOW_BLUR_CLASS, TRN_FIELD_CONTROL_TRIGGER_BASE_CLASS, TRN_FIELD_SELECT_LEADING_ICON_CLASS, TRN_FIELD_TEXT_PREFIX_ICON, TRN_FIELD_TEXT_PREFIX_ICON_CLASS, TRN_GLASS_DROPDOWN_TEXT_CLASS, TRN_GLASS_LISTBOX_OPTION_ROW_COMPACT_CLASSNAME, TRN_GLASS_LISTBOX_OPTION_SELECTED_CLASSNAME, TRN_HIGHLIGHTED_JSON_DEFAULT_SYNTAX_THEME_ID, TRN_HIGHLIGHTED_JSON_SYNTAX_THEME_OPTIONS, TRN_HINT_HOVER_DELAY_MS, TRN_HINT_POPOVER_PANEL_CLASS, TRN_HOLD_MODE_ICON_BUTTON_DEFAULT_HOLD_MS, TRN_HOLD_MODE_PROGRESS_ARM_MS, TRN_HOTKEY_REGION_ATTR, TRN_ICON_PULSE_ANIMATION_PRESETS, TRN_ICON_PULSE_INTENSITY_PRESETS, TRN_INLINE_TOGGLE_ROW_DEFAULT_SIZE, TRN_INLINE_TOGGLE_ROW_DEFAULT_VARIANT, TRN_INSPECTOR_CONTEXT_BAR_WRAP_CLASS, TRN_INSPECTOR_PANEL_BODY_COLUMN_CLASS, TRN_INSPECTOR_PANEL_EMBEDDED_SHELL_CLASS, TRN_INSPECTOR_PANEL_INSET_X_CLASS, TRN_INSPECTOR_PANEL_SCROLL_CLASS, TRN_INSPECTOR_PANEL_SHELL_CLASS, TRN_INSPECTOR_TAB_ACTIVE_CLASS, TRN_INSPECTOR_TAB_BAR_WRAP_CLASS, TRN_INSPECTOR_TAB_LABEL_CLASS, TRN_INSPECTOR_TAB_LIST_CLASS, TRN_INSPECTOR_TAB_TRIGGER_CLASS, TRN_INTERACTIVE_CARD_SHELL_CLASS, TRN_LABELED_SCRUB_NUMBER_FIELD_APPEARANCE, TRN_LABELED_SCRUB_NUMBER_FIELD_INTERACTION, TRN_MENU_SEARCH_MIN_ITEMS, TRN_PIE_DEAD_ZONE_PX, TRN_PIE_DEFAULT_LAYOUT, TRN_PIE_DIAGONAL_RADIUS_PX, TRN_PIE_DIGIT_TO_SLOT, TRN_PIE_ELLIPSE_RX_PX, TRN_PIE_ELLIPSE_RY_PX, TRN_PIE_HOVER_DISC_PX, TRN_PIE_HUB_RING_RADIUS_PX, TRN_PIE_HUB_SIZE_PX, TRN_PIE_INNER_RADIUS_PX, TRN_PIE_RADIUS_PX, TRN_PIE_ROW_STEP_PX, TRN_PIE_SIDE_X_MAX_PX, TRN_PIE_SIDE_X_PX, TRN_PIE_SLICE_HEIGHT_PX, TRN_PIE_SLICE_WIDTH_PX, TRN_PIE_SLOT_COUNT, TRN_PIE_SLOT_TO_DIGIT, TRN_PIE_VIEWPORT_PAD_PX, TRN_QUICK_HINT_HOVER_DELAY_MS, TRN_SCRUB_DEFAULT_ACTIVATION_THRESHOLD_PX, TRN_SCRUB_DEFAULT_HORIZONTAL_PX_PER_TENTH_PERCENT, TRN_SCRUB_DEFAULT_VERTICAL_PX_PER_PERCENT, TRN_SCRUB_INTERACTION_END_EVENT, TRN_SCRUB_IN_FIELD_FILL_GRADIENT_DEFAULT, TRN_SCRUB_IN_FIELD_FILL_PRESETS, TRN_SCRUB_NUMBER_FIELD_FACTORY_APPEARANCE, TRN_SCRUB_WHEEL_PIXEL_ACCUM_THRESHOLD, TRN_SETTING_ROW_HINT_HOVER_MS, TRN_SORTABLE_SETTINGS_CARD_STORAGE_PREFIX, TRN_TOOLBOX_PIN_GLASS_BLUR_PX, TRN_TOOLBOX_PIN_GLASS_BORDER_OPACITY, TRN_TOOLBOX_PIN_GLASS_OPACITY, TRN_VECTOR3_AXIS_UNLOCKED, TrnLiveDataPulseIcon, buildTrnGlbSceneTree, buildTrnPieMenuGsapCloseTimeline, buildTrnPieMenuGsapOpenTimeline, clampTrnNumberToRange, clampTrnPieCenter, clampTrnScrubInFieldFillGradient, cloneTrnScrubInFieldFillPreset, coerceTrnScrubDragPxPerStep, collectTrnGlbSceneExpandableIds, commitTrnScrubDraftText, computeFixedMenuPlacement, computeResizedWindowRect, computeTrnScrubDisplayDecimals, defaultTrnScrubNumberFieldControlStyle, displayValueStableKey, formatTrnAxisNumber, formatTrnScrubDisplayValue, getTrnHotkeyPointer, getTrnSortableSettingsCardStorageKey, isTrnGlbSceneMeshSelectable, isTrnGlbSceneNodeSelected, isTrnHighlightedJsonSyntaxThemeId, isTrnNumberOutOfRange, listTrnGlbSceneMeshNames, loadPersistedWindowGeometry, loadTrnSortableSettingsCardData, matchesTrnMenuSearch, normalizeRect, normalizeTrnIconPulseAnimationPreset, normalizeTrnIconPulseIntensityPreset, noteTrnHotkeyPointer, notifyTrnScrubInteractionEnd, resetTrnHotkeyPointerForTests, resetTrnPieMenuGsapTargets, resolveInspectorPanelShellClass, resolveTrnGlbSceneNodeIcon, resolveTrnHintContent, resolveTrnHotkeyRegion, resolveTrnHotkeyRegionAtLastPointer, resolveTrnHotkeyRegionFromNode, resolveTrnLabeledHintContent, resolveTrnPieMenuAnimation, resolveTrnPieMenuBehavior, resolveTrnPieMenuLayout, resolveTrnPieMenuThemeTokens, resolveTrnPieOpenCenter, resolveTrnScrubDragStepUnit, saveTrnSortableSettingsCardData, shouldShowTrnMenuSearch, stripTrnHintLeadingLabel, toolbarHeaderDropdownMenuIcon, trnFieldControlRowShellClass, trnFractionDigitsFromStep, trnGlbSceneTreeRowClass, trnInspectorTabActiveClassName, trnInteractiveCardPaddingClass, trnInteractiveCardShellClass, trnPieBuildSlotLayout, trnPieHubHoverArcD, trnPieMenuCssAnimationClass, trnPieMenuCssVars, trnPieMenuEffectiveAnimationPreset, trnPieMenuMatchesRepeatCancelChord, trnPieSliceOffset, trnPieSlotAttachRadius, trnPieSlotBoxAlign, trnPieSlotFromDigitKey, trnPieSlotFromPointer, trnScrubInFieldFillPaint, useFixedMenuAnchor, useGsapIconPulseOnValueChange, useOptionalTRNMenuSearchContext, useScrollContainerEdgeAutoScroll, useScrollOverflowHint, useScrollbarEdgeReveal, useTRNMenuItemMatches, useTrnHotkeyPointerTracking, useTrnPieMenuController, useTrnPieMenuMotion, useTrnPieMenuPointerAnchor };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map