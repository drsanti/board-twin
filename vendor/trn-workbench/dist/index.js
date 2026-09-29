import React2, { memo, useRef, useCallback, useState, useMemo, useLayoutEffect, useEffect, createContext, forwardRef, useImperativeHandle, useReducer, useContext } from 'react';
import { clsx } from 'clsx';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { PictureInPicture2, GripVertical, X, Maximize2, Move, Dock, ChevronUp, ChevronDown, Minimize2, Columns2, Rows2, PanelLeftClose, PanelsTopLeft, LayoutTemplate, FolderOpen, Star, Pencil, Copy, Download, ArrowUp, ArrowDown, Trash2, LayoutGrid, HelpCircle, Bookmark, Save, FolderKanban, Upload, RotateCcw, PanelRightOpen, Cpu, Rows3 } from 'lucide-react';
import { createPortal, unstable_batchedUpdates } from 'react-dom';
import { TRNCommandPalette, TRNMessageDialog, TRNTooltip, TRN_HINT_HOVER_DELAY_MS, TRNWindow, TRNFormField, TRNButton, TRNSelect, useOptionalTRNMenuSearchContext, TRNMenuFilterableSection, TRNMenuItemButton, TOOLBAR_HEADER_DROPDOWN_MENU_ITEM_CLASS, useTRNMenuItemMatches, TRN_GLASS_DROPDOWN_TEXT_CLASS, TRNSearchableMenuShell, TOOLBAR_HEADER_DROPDOWN_MENU_PANEL_CLASS, toolbarHeaderDropdownMenuIcon, useFixedMenuAnchor } from '@ternion/trn-ui';
import { v4 } from 'uuid';
import { twMerge } from 'tailwind-merge';

// src/TRNWorkbench.tsx

// src/paneDock.ts
var PANE_DOCK_ZONE_HIT_PX = 56;
var WORKBENCH_GLOBAL_DOCK_EDGE_PX = 72;
function workbenchGlobalZoneAtPoint(container, clientX, clientY) {
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const w = rect.width;
  const h = rect.height;
  const edge = WORKBENCH_GLOBAL_DOCK_EDGE_PX;
  if (x < edge) return "left";
  if (x > w - edge) return "right";
  if (y < edge) return "top";
  if (y > h - edge) return "bottom";
  return null;
}
function cn(...inputs) {
  return clsx(inputs);
}
var ZONE_LABEL = {
  top: "Dock to top",
  bottom: "Dock to bottom",
  left: "Dock to left",
  right: "Dock to right"
};
var WorkbenchGlobalDockOverlay = memo(function WorkbenchGlobalDockOverlay2({
  visible,
  activeZone
}) {
  if (!visible) return null;
  const edge = WORKBENCH_GLOBAL_DOCK_EDGE_PX;
  const zoneClass = (zone) => cn(
    "absolute transition-colors",
    activeZone === zone ? "bg-emerald-500/30 ring-1 ring-inset ring-emerald-400/70" : "bg-emerald-500/8"
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "pointer-events-none absolute inset-0 z-[255]",
      "aria-hidden": !visible,
      children: [
        /* @__PURE__ */ jsx("div", { className: cn(zoneClass("top"), "inset-x-0 top-0"), style: { height: edge } }),
        /* @__PURE__ */ jsx("div", { className: cn(zoneClass("bottom"), "inset-x-0 bottom-0"), style: { height: edge } }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(zoneClass("left"), "left-0"),
            style: { top: edge, bottom: edge, width: edge }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(zoneClass("right"), "right-0"),
            style: { top: edge, bottom: edge, width: edge }
          }
        ),
        activeZone ? /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "rounded bg-black/75 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-200 shadow-lg", children: ZONE_LABEL[activeZone] }) }) : null
      ]
    }
  );
});
var WorkbenchFloatDetachHint = memo(function WorkbenchFloatDetachHint2({
  visible
}) {
  if (!visible) return null;
  return /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 z-[254] flex items-center justify-center bg-violet-500/10", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-violet-400/50 bg-black/70 px-4 py-2 shadow-xl", children: [
    /* @__PURE__ */ jsx(PictureInPicture2, { size: 16, className: "text-violet-300", "aria-hidden": true }),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] font-bold uppercase tracking-wider text-violet-200", children: "Release to float pane" })
  ] }) });
});

// src/workbenchFloat.ts
var DEFAULT_FLOAT_PANE_WIDTH = 520;
var DEFAULT_FLOAT_PANE_HEIGHT = 400;
var MIN_FLOAT_PANE_WIDTH = 280;
var MIN_FLOAT_PANE_HEIGHT = 200;
var FLOAT_DETACH_MARGIN_PX = 16;
function isPointerOutsideElement(el, clientX, clientY, margin = FLOAT_DETACH_MARGIN_PX) {
  const rect = el.getBoundingClientRect();
  return clientX < rect.left - margin || clientX > rect.right + margin || clientY < rect.top - margin || clientY > rect.bottom + margin;
}
function floatPanePositionFromPointer(clientX, clientY, width = DEFAULT_FLOAT_PANE_WIDTH, height = DEFAULT_FLOAT_PANE_HEIGHT) {
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  return {
    x: Math.min(maxX, Math.max(margin, clientX - width * 0.35)),
    y: Math.min(maxY, Math.max(margin, clientY - 24))
  };
}
function clampFloatSize(width, height) {
  return {
    width: Math.max(MIN_FLOAT_PANE_WIDTH, Math.min(width, window.innerWidth - 16)),
    height: Math.max(MIN_FLOAT_PANE_HEIGHT, Math.min(height, window.innerHeight - 16))
  };
}
function clampFloatPosition(x, y, width, height) {
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - 40);
  return {
    x: Math.min(maxX, Math.max(margin, x)),
    y: Math.min(maxY, Math.max(margin, y))
  };
}

// src/types.ts
function resolveWorkbenchPaneLabel(entry, fallback = "Unknown") {
  if (entry == null) {
    return fallback;
  }
  return entry.paneLabel ?? entry.label;
}
function zoneFromPointer(el, clientX, clientY) {
  const rect = el.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const w = rect.width;
  const h = rect.height;
  const edge = PANE_DOCK_ZONE_HIT_PX;
  const inCenterX = x > edge && x < w - edge;
  const inCenterY = y > edge && y < h - edge;
  if (inCenterX && inCenterY) return "center";
  const topDist = y;
  const bottomDist = h - y;
  const leftDist = x;
  const rightDist = w - x;
  const min = Math.min(topDist, bottomDist, leftDist, rightDist);
  if (min === topDist) return "top";
  if (min === bottomDist) return "bottom";
  if (min === leftDist) return "left";
  return "right";
}
var ZONE_LABEL2 = {
  top: "Dock top",
  bottom: "Dock bottom",
  left: "Dock left",
  right: "Dock right",
  center: "Add tab"
};
var PaneDockDropOverlay = memo(function PaneDockDropOverlay2({
  paneId,
  visible,
  activeZone,
  onZoneChange
}) {
  const rootRef = useRef(null);
  const updateZone = useCallback(
    (clientX, clientY) => {
      const el = rootRef.current;
      if (!el) return;
      onZoneChange(paneId, zoneFromPointer(el, clientX, clientY));
    },
    [onZoneChange, paneId]
  );
  if (!visible) return null;
  const edge = PANE_DOCK_ZONE_HIT_PX;
  const zoneClass = (zone) => cn(
    "pointer-events-auto absolute z-[200] transition-colors",
    activeZone === zone ? "bg-blue-500/35 ring-1 ring-inset ring-blue-400/60" : "bg-blue-500/10 hover:bg-blue-500/20",
    zone === "center" && "rounded-md"
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: rootRef,
      className: "pointer-events-none absolute inset-0 z-[150]",
      "aria-hidden": !visible,
      onPointerMove: (e) => updateZone(e.clientX, e.clientY),
      onPointerLeave: () => onZoneChange(paneId, null),
      children: [
        /* @__PURE__ */ jsx("div", { className: cn(zoneClass("top"), "inset-x-0 top-0"), style: { height: edge } }),
        /* @__PURE__ */ jsx("div", { className: cn(zoneClass("bottom"), "inset-x-0 bottom-0"), style: { height: edge } }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(zoneClass("left"), "left-0"),
            style: { top: edge, bottom: edge, width: edge }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(zoneClass("right"), "right-0"),
            style: { top: edge, bottom: edge, width: edge }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(zoneClass("center"), "inset-0"),
            style: {
              top: edge,
              bottom: edge,
              left: edge,
              right: edge
            }
          }
        ),
        activeZone ? /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "rounded bg-black/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-blue-200", children: ZONE_LABEL2[activeZone] }) }) : null
      ]
    }
  );
});
function menuLabel(entry, fallbackKey) {
  return entry.label || fallbackKey;
}
var PaneEditorTypeMenu = memo(function PaneEditorTypeMenu2({
  open,
  anchorEl,
  currentEditorType,
  registry,
  hiddenEditorTypes,
  preferredEditorType,
  purpose = "change",
  onSelect,
  onClose
}) {
  const menuRef = useRef(null);
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const [menuPosition, setMenuPosition] = useState(null);
  const hiddenSet = useMemo(() => new Set(hiddenEditorTypes ?? []), [hiddenEditorTypes]);
  const entries = useMemo(() => {
    return Object.entries(registry).filter(([key]) => {
      if (purpose === "split") {
        return !hiddenSet.has(key);
      }
      return !hiddenSet.has(key) || key === currentEditorType;
    }).sort(([keyA, a], [keyB, b]) => {
      if (preferredEditorType != null && preferredEditorType.length > 0) {
        if (keyA === preferredEditorType) return -1;
        if (keyB === preferredEditorType) return 1;
      }
      return menuLabel(a, keyA).localeCompare(menuLabel(b, keyB), void 0, {
        sensitivity: "base"
      });
    });
  }, [registry, hiddenSet, currentEditorType, purpose, preferredEditorType]);
  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setMenuPosition(null);
      return;
    }
    const update = () => {
      const rect = anchorEl.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight ?? 280;
      const gap = 4;
      const fitsBelow = rect.bottom + gap + menuHeight <= window.innerHeight - 8;
      setMenuPosition({
        top: fitsBelow ? rect.bottom + gap : Math.max(8, rect.top - gap - menuHeight),
        left: Math.min(rect.left, window.innerWidth - 200)
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorEl, open, entries.length]);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (menuRef.current?.contains(target)) return;
      if (anchorEl?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorEl, onClose, open]);
  if (!open || !portalTarget || !anchorEl || !menuPosition) return null;
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: menuRef,
        role: "listbox",
        "aria-label": purpose === "split" ? "Open pane" : "Change pane type",
        className: "pointer-events-auto fixed z-[1100] flex w-52 max-h-[min(60vh,22rem)] flex-col overflow-hidden rounded-lg border border-white/10 bg-bg-header/95 p-1 shadow-2xl shadow-black/50 backdrop-blur-2xl",
        style: { top: menuPosition.top, left: menuPosition.left },
        onClick: (e) => e.stopPropagation(),
        children: [
          purpose === "split" ? /* @__PURE__ */ jsx("div", { className: "px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500", children: "Open pane" }) : null,
          /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto scrollbar-hide", children: entries.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-xs text-tertiary", children: "No panes available" }) : entries.map(([key, info]) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              role: "option",
              "aria-selected": purpose === "change" && currentEditorType === key,
              onClick: () => {
                onSelect(key);
                onClose();
              },
              className: cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition-colors",
                purpose === "change" && currentEditorType === key ? "bg-blue-600/20 text-blue-400" : "text-primary hover:bg-white/10 hover:text-primary"
              ),
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: info.icon }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: menuLabel(info, key) })
              ]
            },
            key
          )) })
        ]
      }
    ),
    portalTarget
  );
});
function WorkbenchHintButton({
  hint,
  ariaLabel,
  children,
  className,
  triggerClassName,
  tooltipClassName,
  onClick,
  onPointerDown,
  onContextMenu,
  disabled,
  type = "button"
}) {
  return /* @__PURE__ */ jsx(
    TRNTooltip,
    {
      content: hint,
      className: tooltipClassName,
      triggerClassName,
      trigger: /* @__PURE__ */ jsx(
        "button",
        {
          type,
          "aria-label": ariaLabel,
          className,
          disabled,
          onClick,
          onPointerDown,
          onContextMenu,
          children
        }
      ),
      triggerWrapper: "span",
      openDelayMs: TRN_HINT_HOVER_DELAY_MS
    }
  );
}
var WorkbenchEditorKeepAliveContext = createContext(
  null
);
function useWorkbenchEditorKeepAlive() {
  return useContext(WorkbenchEditorKeepAliveContext);
}
function collectKeepAliveEditorPanes(node) {
  if (node.type === "editor") {
    return [node];
  }
  if (node.type === "tabs") {
    if (node.panes.length === 0) {
      return [];
    }
    const idx = Math.max(0, Math.min(node.activeIndex, node.panes.length - 1));
    const active = node.panes[idx];
    return active != null ? [active] : [];
  }
  return [
    ...collectKeepAliveEditorPanes(node.first),
    ...collectKeepAliveEditorPanes(node.second)
  ];
}
function ensurePortalContainer(map, paneId) {
  let el = map.get(paneId);
  if (el != null) {
    return el;
  }
  el = document.createElement("div");
  el.className = "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col";
  el.dataset.workbenchKeptEditor = paneId;
  map.set(paneId, el);
  return el;
}
function WorkbenchEditorSlot(props) {
  const { paneId, className } = props;
  const ctx = useWorkbenchEditorKeepAlive();
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (ctx == null) {
      return;
    }
    const el = ref.current;
    ctx.setSlot(paneId, el);
    return () => {
      ctx.setSlot(paneId, null);
    };
  }, [ctx, paneId]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn(
        "relative flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden",
        className
      ),
      "data-workbench-editor-slot": paneId
    }
  );
}
function WorkbenchKeptEditor(props) {
  const {
    paneId,
    editorType,
    registry,
    slotsVersion,
    slotsRef,
    parkingRef,
    containersRef
  } = props;
  const container = useMemo(() => {
    const map = containersRef.current;
    if (map == null) {
      throw new Error("Workbench keep-alive containers missing");
    }
    return ensurePortalContainer(map, paneId);
  }, [containersRef, paneId]);
  const info = registry[editorType];
  const Comp = info?.component ?? (() => /* @__PURE__ */ jsxs("div", { className: "p-5 text-tertiary", children: [
    /* @__PURE__ */ jsx(HelpCircle, { size: 14, className: "mb-2 inline", "aria-hidden": true }),
    "Editor not found"
  ] }));
  useLayoutEffect(() => {
    const parking = parkingRef.current;
    if (parking == null) {
      return;
    }
    const slot = slotsRef.current?.get(paneId);
    const target = slot ?? parking;
    if (container.parentElement !== target) {
      target.appendChild(container);
    }
    const parked = target === parking;
    container.toggleAttribute("data-workbench-editor-parked", parked);
    container.dataset.workbenchEditorType = editorType;
    if (parked) {
      container.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;";
    } else {
      container.style.cssText = "";
      container.className = "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col";
    }
  }, [paneId, slotsVersion, editorType, parkingRef, slotsRef, container]);
  useLayoutEffect(() => {
    return () => {
      container.remove();
      containersRef.current?.delete(paneId);
    };
  }, [container, containersRef, paneId]);
  return createPortal(/* @__PURE__ */ jsx(Comp, {}, editorType), container);
}
function WorkbenchEditorKeepAliveProvider(props) {
  const { layout, registry, floatingEditors, children } = props;
  const parkingRef = useRef(null);
  const slotsRef = useRef(/* @__PURE__ */ new Map());
  const containersRef = useRef(/* @__PURE__ */ new Map());
  const [slotsVersion, setSlotsVersion] = useState(0);
  const setSlot = useCallback((paneId, el) => {
    const map = slotsRef.current;
    if (el == null) {
      if (!map.has(paneId)) {
        return;
      }
      map.delete(paneId);
      setSlotsVersion((v) => v + 1);
      return;
    }
    if (map.get(paneId) === el) {
      return;
    }
    map.set(paneId, el);
    setSlotsVersion((v) => v + 1);
  }, []);
  const panesDesired = useMemo(() => {
    const byId = /* @__PURE__ */ new Map();
    for (const p of collectKeepAliveEditorPanes(layout)) {
      byId.set(p.id, { id: p.id, editorType: p.editorType });
    }
    for (const p of floatingEditors ?? []) {
      byId.set(p.id, { id: p.id, editorType: p.editorType });
    }
    return [...byId.values()];
  }, [layout, floatingEditors]);
  const desiredSignature = panesDesired.map((p) => `${p.id}:${p.editorType}`).sort().join("|");
  const [panes, setPanes] = useState(panesDesired);
  useLayoutEffect(() => {
    setPanes((prev) => {
      const merged = new Map(prev.map((p) => [p.id, p]));
      for (const p of panesDesired) {
        merged.set(p.id, p);
      }
      return [...merged.values()];
    });
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPanes(panesDesired);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [desiredSignature, panesDesired]);
  const ctx = useMemo(
    () => ({ enabled: true, setSlot }),
    [setSlot]
  );
  return /* @__PURE__ */ jsxs(WorkbenchEditorKeepAliveContext.Provider, { value: ctx, children: [
    children,
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: parkingRef,
        className: "pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0",
        "aria-hidden": true,
        "data-workbench-editor-parking": true
      }
    ),
    panes.map((pane) => /* @__PURE__ */ jsx(
      WorkbenchKeptEditor,
      {
        paneId: pane.id,
        editorType: pane.editorType,
        registry,
        slotsVersion,
        slotsRef,
        parkingRef,
        containersRef
      },
      pane.id
    ))
  ] });
}
function PaneFrame({
  node,
  registry,
  onSplit,
  onClose,
  onCollapse,
  onChangeType,
  onActivate,
  isActive = false,
  paneMaximized = false,
  onToggleMaximize,
  onUndock,
  dockDragSourceId = null,
  dockHoverZone = null,
  onDockZoneChange,
  onDockDragStart,
  hiddenEditorTypes,
  splitHiddenEditorTypes,
  preferredSplitEditorType = null,
  closeDisabled = false
}) {
  const [showSelector, setShowSelector] = useState(false);
  const [selectorAnchorEl, setSelectorAnchorEl] = useState(null);
  const selectorTriggerRef = useRef(null);
  const [splitMenuDirection, setSplitMenuDirection] = useState(null);
  const [splitAnchorEl, setSplitAnchorEl] = useState(null);
  const splitSideWrapRef = useRef(null);
  const splitStackWrapRef = useRef(null);
  useLayoutEffect(() => {
    setSelectorAnchorEl(showSelector ? selectorTriggerRef.current : null);
  }, [showSelector]);
  useLayoutEffect(() => {
    if (splitMenuDirection === "horizontal") {
      setSplitAnchorEl(splitSideWrapRef.current);
    } else if (splitMenuDirection === "vertical") {
      setSplitAnchorEl(splitStackWrapRef.current);
    } else {
      setSplitAnchorEl(null);
    }
  }, [splitMenuDirection]);
  const keepAlive = useWorkbenchEditorKeepAlive();
  const currentInfo = registry[node.editorType] || {
    icon: /* @__PURE__ */ jsx(HelpCircle, { size: 14 }),
    label: "Unknown",
    component: () => /* @__PURE__ */ jsx("div", { className: "p-5 text-tertiary", children: "Editor not found" })
  };
  const isDockDragging = dockDragSourceId != null;
  const isDragSource = dockDragSourceId === node.id;
  const showDropOverlay = isDockDragging && !isDragSource && dockDragSourceId !== node.id;
  const splitHiddenSet = useMemo(
    () => new Set(splitHiddenEditorTypes ?? []),
    [splitHiddenEditorTypes]
  );
  const canSplit = useMemo(
    () => Object.keys(registry).some((key) => !splitHiddenSet.has(key)),
    [registry, splitHiddenSet]
  );
  const openSplitMenu = (direction) => {
    setShowSelector(false);
    setSplitMenuDirection((prev) => prev === direction ? null : direction);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 w-full h-full overflow-hidden min-h-0 bg-bg-panel", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "wb-pane-chrome-header relative z-20 flex h-8 shrink-0 items-center gap-0 overflow-visible border-0 pl-0 pr-2 select-none ring-0 outline-none",
          isDragSource && "bg-zinc-900/30",
          isActive && !isDragSource && "bg-zinc-900/40",
          paneMaximized && "bg-zinc-900/50"
        ),
        onPointerDown: () => onActivate?.(),
        onDoubleClick: (e) => {
          if (e.target.closest("button")) return;
          onToggleMaximize?.();
        },
        children: [
          /* @__PURE__ */ jsx(
            WorkbenchHintButton,
            {
              hint: "Drag \u2014 outside workbench to float; green ring = studio edge; blue = split or tabs",
              ariaLabel: "Drag pane to dock",
              tooltipClassName: "shrink-0 -ml-1",
              triggerClassName: "!p-0",
              className: "flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded text-tertiary hover:bg-white/10 hover:text-primary active:cursor-grabbing",
              onPointerDown: (e) => {
                if (e.button !== 0) return;
                e.stopPropagation();
                onDockDragStart?.(node.id);
              },
              children: /* @__PURE__ */ jsx(GripVertical, { size: 12, "aria-hidden": true })
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              ref: selectorTriggerRef,
              role: "button",
              tabIndex: 0,
              "aria-expanded": showSelector,
              "aria-haspopup": "listbox",
              onClick: (e) => {
                e.stopPropagation();
                setSplitMenuDirection(null);
                setShowSelector((open) => !open);
              },
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSplitMenuDirection(null);
                  setShowSelector((open) => !open);
                }
              },
              className: cn(
                "flex cursor-pointer items-center rounded px-2 py-0.5 transition-colors",
                showSelector ? "bg-blue-600 text-white" : "text-secondary hover:bg-white/10"
              ),
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-w-[14px]", children: currentInfo.icon }),
                /* @__PURE__ */ jsx("span", { className: "ml-1.5 opacity-50", children: showSelector ? /* @__PURE__ */ jsx(ChevronUp, { size: 10 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 10 }) })
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "min-w-0 shrink truncate text-[10px] font-bold text-tertiary uppercase tracking-widest", children: resolveWorkbenchPaneLabel(currentInfo, "Unknown") }),
          /* @__PURE__ */ jsx("div", { className: "flex-1" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-0.5", children: [
            onToggleMaximize ? /* @__PURE__ */ jsx(
              WorkbenchHintButton,
              {
                hint: paneMaximized ? "Restore pane size (double-click header)" : "Maximize pane in workbench (double-click header)",
                ariaLabel: paneMaximized ? "Restore pane size" : "Maximize pane",
                className: "flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-blue-400 transition-all",
                onClick: onToggleMaximize,
                children: paneMaximized ? /* @__PURE__ */ jsx(Minimize2, { size: 13 }) : /* @__PURE__ */ jsx(Maximize2, { size: 13 })
              }
            ) : null,
            onUndock ? /* @__PURE__ */ jsx(
              WorkbenchHintButton,
              {
                hint: "Undock to floating window (or drag grip outside the workbench)",
                ariaLabel: "Undock pane to floating window",
                className: "flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-blue-400 transition-all",
                onClick: onUndock,
                children: /* @__PURE__ */ jsx(PictureInPicture2, { size: 13 })
              }
            ) : null,
            canSplit ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { ref: splitSideWrapRef, className: "inline-flex", children: /* @__PURE__ */ jsx(
                WorkbenchHintButton,
                {
                  hint: "Split side-by-side \u2014 choose which pane to open",
                  ariaLabel: "Split side-by-side",
                  className: cn(
                    "flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-blue-400 transition-all",
                    splitMenuDirection === "horizontal" && "bg-white/10 text-blue-400"
                  ),
                  onClick: () => openSplitMenu("horizontal"),
                  children: /* @__PURE__ */ jsx(Columns2, { size: 13 })
                }
              ) }),
              /* @__PURE__ */ jsx("span", { ref: splitStackWrapRef, className: "inline-flex", children: /* @__PURE__ */ jsx(
                WorkbenchHintButton,
                {
                  hint: "Split stacked \u2014 choose which pane to open",
                  ariaLabel: "Split stacked",
                  className: cn(
                    "flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-blue-400 transition-all",
                    splitMenuDirection === "vertical" && "bg-white/10 text-blue-400"
                  ),
                  onClick: () => openSplitMenu("vertical"),
                  children: /* @__PURE__ */ jsx(Rows2, { size: 13 })
                }
              ) })
            ] }) : null,
            /* @__PURE__ */ jsx(
              WorkbenchHintButton,
              {
                hint: "Collapse to edge strip (keeps slot \u2014 Ctrl+Shift+C)",
                ariaLabel: "Collapse pane to edge strip",
                className: "flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-primary transition-all",
                onClick: onCollapse,
                children: /* @__PURE__ */ jsx(PanelLeftClose, { size: 13 })
              }
            ),
            !closeDisabled ? /* @__PURE__ */ jsx(
              WorkbenchHintButton,
              {
                hint: "Remove pane from layout",
                ariaLabel: "Remove pane from layout",
                className: "flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-red-600/20 hover:text-red-500 transition-all ml-1",
                onClick: onClose,
                children: /* @__PURE__ */ jsx(X, { size: 14 })
              }
            ) : null
          ] }),
          /* @__PURE__ */ jsx(
            PaneEditorTypeMenu,
            {
              open: showSelector,
              anchorEl: selectorAnchorEl,
              currentEditorType: node.editorType,
              registry,
              hiddenEditorTypes,
              purpose: "change",
              onSelect: onChangeType,
              onClose: () => setShowSelector(false)
            }
          ),
          /* @__PURE__ */ jsx(
            PaneEditorTypeMenu,
            {
              open: splitMenuDirection != null,
              anchorEl: splitAnchorEl,
              currentEditorType: node.editorType,
              registry,
              hiddenEditorTypes: splitHiddenEditorTypes,
              preferredEditorType: preferredSplitEditorType,
              purpose: "split",
              onSelect: (editorType) => {
                if (splitMenuDirection != null) {
                  onSplit(splitMenuDirection, editorType);
                }
                setSplitMenuDirection(null);
              },
              onClose: () => setSplitMenuDirection(null)
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden", children: [
      keepAlive?.enabled ? /* @__PURE__ */ jsx(WorkbenchEditorSlot, { paneId: node.id }) : currentInfo.component ? /* @__PURE__ */ jsx(currentInfo.component, {}) : null,
      showDropOverlay && onDockZoneChange ? /* @__PURE__ */ jsx(
        PaneDockDropOverlay,
        {
          paneId: node.id,
          visible: true,
          activeZone: dockHoverZone,
          onZoneChange: onDockZoneChange
        }
      ) : null
    ] })
  ] });
}
var SNAP_RATIOS = [0.25, 1 / 3, 0.5, 2 / 3, 0.75];
var SNAP_THRESHOLD = 0.04;
function snapRatio(raw) {
  const clamped = Math.max(0.05, Math.min(0.95, raw));
  let best = clamped;
  let bestDist = SNAP_THRESHOLD;
  for (const target of SNAP_RATIOS) {
    const dist = Math.abs(clamped - target);
    if (dist < bestDist) {
      bestDist = dist;
      best = target;
    }
  }
  return best;
}
var Splitter = memo(({ direction, onResize, containerRef }) => {
  const isHorizontal = direction === "horizontal";
  const [dragRatio, setDragRatio] = useState(null);
  const [hovered, setHovered] = useState(false);
  const resizeCursor = isHorizontal ? "col-resize" : "row-resize";
  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const onMouseMove = (moveEvent) => {
      const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
      const offset = isHorizontal ? rect.left : rect.top;
      const size = isHorizontal ? rect.width : rect.height;
      const raw = (currentPos - offset) / size;
      const snapped = snapRatio(raw);
      setDragRatio(snapped);
      onResize(snapped);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      setDragRatio(null);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = resizeCursor;
  };
  const label = dragRatio != null ? `${Math.round(dragRatio * 100)}%` : null;
  const active = hovered || dragRatio != null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "trn-splitter relative h-full w-full min-h-0 min-w-0",
        isHorizontal ? "trn-splitter--horizontal cursor-col-resize" : "trn-splitter--vertical cursor-row-resize"
      ),
      style: { cursor: resizeCursor, touchAction: "none" },
      onMouseDown,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      role: "separator",
      "aria-orientation": isHorizontal ? "vertical" : "horizontal",
      "aria-label": "Resize panes",
      "data-splitter-active": active ? "" : void 0,
      children: [
        label ? /* @__PURE__ */ jsx(
          "span",
          {
            className: cn(
              "pointer-events-none absolute z-[200] rounded bg-black/75 px-1.5 py-0.5 text-[9px] text-blue-200",
              isHorizontal ? "-top-5 left-1/2 -translate-x-1/2" : "-left-10 top-1/2 -translate-y-1/2"
            ),
            children: label
          }
        ) : null,
        /* @__PURE__ */ jsx("div", { className: cn("trn-splitter__track", active && "trn-splitter__track--active") }),
        /* @__PURE__ */ jsx("div", { className: cn("trn-splitter__line", active && "trn-splitter__line--active") })
      ]
    }
  );
});
Splitter.displayName = "Splitter";
function createEditorPane(editorType, options) {
  return {
    id: options?.id ?? v4(),
    type: "editor",
    editorType,
    collapsed: options?.collapsed,
    collapseEdge: options?.collapseEdge,
    expandedRatio: options?.expandedRatio
  };
}
function createSplit(first, second, direction, ratio = 0.5, id) {
  return {
    id: id ?? v4(),
    type: "split",
    direction,
    ratio,
    first,
    second
  };
}
function createTabs(panes, activeIndex = 0, id) {
  return {
    id: id ?? v4(),
    type: "tabs",
    activeIndex: Math.max(0, Math.min(activeIndex, panes.length - 1)),
    panes
  };
}

// src/layoutTraversal.ts
function mapLayout(node, fn) {
  const next = fn(node);
  if (next.type === "split") {
    return {
      ...next,
      first: mapLayout(next.first, fn),
      second: mapLayout(next.second, fn)
    };
  }
  if (next.type === "tabs") {
    return {
      ...next,
      panes: next.panes.map((p) => mapLayout(p, fn))
    };
  }
  return next;
}
function findEditorPane(node, editorId) {
  if (node.type === "editor") {
    return node.id === editorId ? node : null;
  }
  if (node.type === "tabs") {
    return node.panes.find((p) => p.id === editorId) ?? null;
  }
  return findEditorPane(node.first, editorId) ?? findEditorPane(node.second, editorId);
}
function collectEditorPanes(node) {
  if (node.type === "editor") return [node];
  if (node.type === "tabs") return [...node.panes];
  return [
    ...collectEditorPanes(node.first),
    ...collectEditorPanes(node.second)
  ];
}
function directSplitChildEditorType(node) {
  if (node.type === "editor") return node.editorType;
  if (node.type === "tabs") {
    const idx = Math.max(0, Math.min(node.activeIndex, node.panes.length - 1));
    return node.panes[idx]?.editorType ?? node.panes[0]?.editorType ?? null;
  }
  const panes = collectEditorPanes(node);
  return panes[0]?.editorType ?? null;
}
function countEditorPanes(node) {
  if (node.type === "editor") return 1;
  if (node.type === "tabs") return node.panes.length;
  return countEditorPanes(node.first) + countEditorPanes(node.second);
}
function removeEditorPane(node, paneId) {
  if (node.type === "editor") {
    return node.id === paneId ? null : node;
  }
  if (node.type === "tabs") {
    const panes = node.panes.filter((p) => p.id !== paneId);
    if (panes.length === 0) return null;
    if (panes.length === 1) return panes[0];
    const activeIndex = Math.min(
      node.activeIndex >= panes.length ? panes.length - 1 : node.activeIndex,
      panes.length - 1
    );
    return { ...node, panes, activeIndex: Math.max(0, activeIndex) };
  }
  const first = removeEditorPane(node.first, paneId);
  const second = removeEditorPane(node.second, paneId);
  if (first === null) return second;
  if (second === null) return first;
  return { ...node, first, second };
}
function replaceEditorPane(node, paneId, replacement) {
  if (node.type === "editor") {
    return node.id === paneId ? replacement : node;
  }
  if (node.type === "tabs") {
    return {
      ...node,
      panes: node.panes.map(
        (p) => p.id === paneId ? replacement : p
      )
    };
  }
  return {
    ...node,
    first: replaceEditorPane(node.first, paneId, replacement),
    second: replaceEditorPane(node.second, paneId, replacement)
  };
}

// src/utils.ts
var findEditorNode = findEditorPane;
function isCollapsedEditor(node) {
  return node.type === "editor" && node.collapsed === true;
}
function collapseEdgeForSplitChild(direction, which) {
  if (direction === "horizontal") return which === "first" ? "left" : "right";
  return which === "first" ? "top" : "bottom";
}
function findParentTabsOfEditor(node, editorId, parentTabs = null) {
  if (node.type === "tabs") {
    if (node.panes.some((p) => p.id === editorId)) return node;
    return null;
  }
  if (node.type === "editor") {
    return parentTabs;
  }
  if (node.type === "split") {
    return findParentTabsOfEditor(node.first, editorId, parentTabs) ?? findParentTabsOfEditor(node.second, editorId, parentTabs);
  }
  return null;
}
function setTabsActiveIndex(root, tabsId, activeIndex) {
  return mapLayout(root, (node) => {
    if (node.type === "tabs" && node.id === tabsId) {
      const idx = Math.max(0, Math.min(activeIndex, node.panes.length - 1));
      return { ...node, activeIndex: idx };
    }
    return node;
  });
}
function findParentSplitOfEditor(node, editorId, parent = null, which = null) {
  if (node.type === "editor" && node.id === editorId && parent && which) {
    return { splitId: parent.id, which, ratio: parent.ratio, parent };
  }
  if (node.type === "tabs") {
    for (const pane of node.panes) {
      const found = findParentSplitOfEditor(pane, editorId, parent, which);
      if (found) return found;
    }
    return null;
  }
  if (node.type === "split") {
    return findParentSplitOfEditor(node.first, editorId, node, "first") ?? findParentSplitOfEditor(node.second, editorId, node, "second");
  }
  return null;
}
function setEditorExpandedRatio(node, editorId, ratio) {
  if (node.type === "editor" && node.id === editorId) {
    return { ...node, expandedRatio: ratio };
  }
  if (node.type === "tabs") {
    return {
      ...node,
      panes: node.panes.map((p) => setEditorExpandedRatio(p, editorId, ratio))
    };
  }
  if (node.type === "split") {
    return {
      ...node,
      first: setEditorExpandedRatio(node.first, editorId, ratio),
      second: setEditorExpandedRatio(node.second, editorId, ratio)
    };
  }
  return node;
}
function tagDirectEditorChildrenExpandedRatio(node, ratio) {
  const tag = (child) => {
    if (child.type === "editor") return { ...child, expandedRatio: ratio };
    return child;
  };
  return { ...node, ratio, first: tag(node.first), second: tag(node.second) };
}
function collectCollapsedEditorIds(node) {
  if (node.type === "editor") {
    return node.collapsed ? [node.id] : [];
  }
  if (node.type === "tabs") {
    return node.panes.flatMap((p) => collectCollapsedEditorIds(p));
  }
  return [
    ...collectCollapsedEditorIds(node.first),
    ...collectCollapsedEditorIds(node.second)
  ];
}
var setNodeCollapsed = (node, targetId, collapsed, collapseEdge) => {
  if (node.id === targetId && node.type === "editor") {
    if (!collapsed) {
      const { collapsed: _removed, ...rest } = node;
      return rest;
    }
    return {
      ...node,
      collapsed: true,
      collapseEdge: collapseEdge ?? node.collapseEdge
    };
  }
  if (node.type === "tabs") {
    return {
      ...node,
      panes: node.panes.map(
        (p) => setNodeCollapsed(p, targetId, collapsed, collapseEdge)
      )
    };
  }
  if (node.type === "split") {
    const edgeFirst = collapseEdgeForSplitChild(node.direction, "first");
    const edgeSecond = collapseEdgeForSplitChild(node.direction, "second");
    return {
      ...node,
      first: setNodeCollapsed(
        node.first,
        targetId,
        collapsed,
        node.first.id === targetId ? edgeFirst : collapseEdge
      ),
      second: setNodeCollapsed(
        node.second,
        targetId,
        collapsed,
        node.second.id === targetId ? edgeSecond : collapseEdge
      )
    };
  }
  return node;
};
function collapseEditorPane(root, targetId) {
  const parent = findParentSplitOfEditor(root, targetId);
  let next = setNodeCollapsed(root, targetId, true);
  if (parent) {
    next = setEditorExpandedRatio(next, targetId, parent.ratio);
  }
  return next;
}
function expandEditorPane(root, targetId) {
  const editor = findEditorNode(root, targetId);
  const parent = findParentSplitOfEditor(root, targetId);
  let next = setNodeCollapsed(root, targetId, false);
  const saved = editor?.expandedRatio;
  if (parent && typeof saved === "number" && Number.isFinite(saved)) {
    next = updateNodeRatioAndSyncEditors(next, parent.splitId, saved);
  }
  return next;
}
function reorderCollapsedInSplit(root, splitId, orderedPaneIds) {
  if (root.type === "split" && root.id === splitId) {
    if (!isCollapsedEditor(root.first) || !isCollapsedEditor(root.second)) {
      return root;
    }
    if (orderedPaneIds.length < 2) return root;
    const byId = {
      [root.first.id]: root.first,
      [root.second.id]: root.second
    };
    const first = byId[orderedPaneIds[0]];
    const second = byId[orderedPaneIds[1]];
    if (!first || !second) return root;
    return { ...root, first, second };
  }
  if (root.type === "split") {
    return {
      ...root,
      first: reorderCollapsedInSplit(root.first, splitId, orderedPaneIds),
      second: reorderCollapsedInSplit(root.second, splitId, orderedPaneIds)
    };
  }
  return root;
}
var updateNodeRatio = (node, targetId, ratio) => {
  const clamped = Math.max(0.05, Math.min(0.95, ratio));
  if (node.id === targetId && node.type === "split") {
    return tagDirectEditorChildrenExpandedRatio({ ...node, ratio: clamped }, clamped);
  }
  if (node.type === "split") {
    return {
      ...node,
      first: updateNodeRatio(node.first, targetId, clamped),
      second: updateNodeRatio(node.second, targetId, clamped)
    };
  }
  return node;
};
function updateNodeRatioAndSyncEditors(node, targetId, ratio) {
  return updateNodeRatio(node, targetId, ratio);
}
var splitNodeWithEditor = (node, targetId, direction, newEditorType, ratio = 0.55) => {
  if (node.id === targetId && node.type === "editor") {
    return {
      id: v4(),
      type: "split",
      direction,
      ratio,
      first: { ...node },
      second: { id: v4(), type: "editor", editorType: newEditorType }
    };
  }
  if (node.type === "tabs") {
    return {
      ...node,
      panes: node.panes.map(
        (p) => splitNodeWithEditor(p, targetId, direction, newEditorType, ratio)
      )
    };
  }
  if (node.type === "split") {
    return {
      ...node,
      first: splitNodeWithEditor(node.first, targetId, direction, newEditorType, ratio),
      second: splitNodeWithEditor(node.second, targetId, direction, newEditorType, ratio)
    };
  }
  return node;
};
function findEditorPaneId(node, editorType) {
  if (node.type === "editor") {
    return node.editorType === editorType ? node.id : null;
  }
  if (node.type === "tabs") {
    for (const pane of node.panes) {
      const id = findEditorPaneId(pane, editorType);
      if (id) return id;
    }
    return null;
  }
  return findEditorPaneId(node.first, editorType) ?? findEditorPaneId(node.second, editorType);
}
function getHiddenSingletonEditorTypes(layout, currentPaneId, singletonEditorTypes) {
  if (!singletonEditorTypes?.length) return [];
  const singletonSet = new Set(singletonEditorTypes);
  const hidden = [];
  for (const pane of collectEditorPanes(layout)) {
    if (pane.id === currentPaneId) continue;
    if (singletonSet.has(pane.editorType)) {
      hidden.push(pane.editorType);
    }
  }
  return hidden;
}
function getSplitMenuHiddenEditorTypes(layout, singletonEditorTypes) {
  if (!singletonEditorTypes?.length) return [];
  const present = new Set(
    collectEditorPanes(layout).map((pane) => pane.editorType)
  );
  return singletonEditorTypes.filter((editorType) => present.has(editorType));
}
function isSingletonEditorTypeBlocked(layout, targetPaneId, editorType, singletonEditorTypes) {
  if (!singletonEditorTypes?.includes(editorType)) return false;
  for (const pane of collectEditorPanes(layout)) {
    if (pane.id === targetPaneId) continue;
    if (pane.editorType === editorType) return true;
  }
  return false;
}
function isSingletonEditorPane(editorType, singletonEditorTypes) {
  return singletonEditorTypes?.includes(editorType) ?? false;
}
var splitNode = (node, targetId, direction) => {
  if (node.id === targetId && node.type === "editor") {
    return {
      id: v4(),
      type: "split",
      direction,
      ratio: 0.5,
      first: { ...node },
      second: { id: v4(), type: "editor", editorType: node.editorType }
    };
  }
  if (node.type === "tabs") {
    return {
      ...node,
      panes: node.panes.map((p) => splitNode(p, targetId, direction))
    };
  }
  if (node.type === "split") {
    return {
      ...node,
      first: splitNode(node.first, targetId, direction),
      second: splitNode(node.second, targetId, direction)
    };
  }
  return node;
};
var closeNode = (node, targetId) => {
  if (node.type === "tabs") {
    if (node.panes.some((p) => p.id === targetId)) {
      const next = removeEditorPane(node, targetId);
      return next ?? node;
    }
    return node;
  }
  if (node.type === "split") {
    if (node.first.id === targetId) return node.second;
    if (node.second.id === targetId) return node.first;
    return {
      ...node,
      first: closeNode(node.first, targetId),
      second: closeNode(node.second, targetId)
    };
  }
  return node;
};
var changeNodeType = (node, targetId, editorType) => {
  if (node.id === targetId && node.type === "editor") {
    return { ...node, editorType };
  }
  if (node.type === "tabs") {
    return {
      ...node,
      panes: node.panes.map(
        (p) => p.id === targetId ? { ...p, editorType } : p
      )
    };
  }
  if (node.type === "split") {
    return {
      ...node,
      first: changeNodeType(node.first, targetId, editorType),
      second: changeNodeType(node.second, targetId, editorType)
    };
  }
  return node;
};
function extractEditorPane(root, paneId) {
  const editor = findEditorNode(root, paneId);
  if (!editor) return { layout: root, editor: null };
  const layout = removeEditorPane(root, paneId);
  if (!layout) return { layout: root, editor: null };
  const { collapsed: _c, collapseEdge: _e, ...rest } = editor;
  return { layout, editor: rest };
}
function addEditorToTabs(node, tabsId, editor) {
  return mapLayout(node, (n) => {
    if (n.type === "tabs" && n.id === tabsId) {
      return {
        ...n,
        panes: [...n.panes, editor],
        activeIndex: n.panes.length
      };
    }
    return n;
  });
}
function insertDockedEditor(node, targetId, zone, editor, ratio) {
  if (node.type === "editor" && node.id === targetId) {
    const target = { ...node };
    const incoming = { ...editor, id: editor.id };
    if (zone === "center") {
      return {
        id: v4(),
        type: "tabs",
        activeIndex: 1,
        panes: [target, incoming]
      };
    }
    switch (zone) {
      case "bottom":
        return {
          id: v4(),
          type: "split",
          direction: "vertical",
          ratio,
          first: target,
          second: incoming
        };
      case "top":
        return {
          id: v4(),
          type: "split",
          direction: "vertical",
          ratio,
          first: incoming,
          second: target
        };
      case "right":
        return {
          id: v4(),
          type: "split",
          direction: "horizontal",
          ratio,
          first: target,
          second: incoming
        };
      case "left":
        return {
          id: v4(),
          type: "split",
          direction: "horizontal",
          ratio,
          first: incoming,
          second: target
        };
    }
  }
  if (node.type === "tabs") {
    for (const pane of node.panes) {
      if (pane.id === targetId) {
        const replacement = insertDockedEditor(pane, targetId, zone, editor, ratio);
        if (replacement !== pane) {
          return replaceEditorPane(node, targetId, replacement);
        }
      }
    }
    return node;
  }
  if (node.type === "split") {
    return {
      ...node,
      first: insertDockedEditor(node.first, targetId, zone, editor, ratio),
      second: insertDockedEditor(node.second, targetId, zone, editor, ratio)
    };
  }
  return node;
}
function countEditorPanesOfType(root, editorType) {
  return collectEditorPanes(root).filter((pane) => pane.editorType === editorType).length;
}
function canCloseEditorPane(root, paneId, requiredEditorTypes) {
  if (countEditorPanes(root) <= 1) return false;
  const editor = findEditorNode(root, paneId);
  if (editor == null) return false;
  if (requiredEditorTypes != null && requiredEditorTypes.includes(editor.editorType) && countEditorPanesOfType(root, editor.editorType) <= 1) {
    return false;
  }
  return true;
}
function coerceRequiredEditorTypes(layout, requiredEditorTypes) {
  if (requiredEditorTypes == null || requiredEditorTypes.length === 0) {
    return layout;
  }
  let next = layout;
  for (const editorType of requiredEditorTypes) {
    const panes = collectEditorPanes(next).filter((pane) => pane.editorType === editorType);
    if (panes.length > 1) {
      for (const extra of panes.slice(1)) {
        next = closeNode(next, extra.id);
      }
      continue;
    }
    if (panes.length === 0) {
      const anchor = collectEditorPanes(next)[0];
      if (anchor == null) {
        next = createEditorPane(editorType);
        continue;
      }
      next = splitNodeWithEditor(next, anchor.id, "horizontal", editorType, 0.62);
      const added = collectEditorPanes(next).filter((pane) => pane.editorType === editorType);
      if (added.length === 1) {
        next = promoteEditorPaneAsPrimary(next, added[0].id, 0.62);
      }
    }
  }
  return next;
}
function promoteEditorPaneAsPrimary(root, paneId, ratio) {
  if (root.type === "split") {
    if (root.second.id === paneId && root.second.type === "editor") {
      return {
        ...root,
        ratio,
        first: root.second,
        second: root.first
      };
    }
    if (root.first.id === paneId && root.first.type === "editor") {
      return { ...root, ratio };
    }
    return {
      ...root,
      first: promoteEditorPaneAsPrimary(root.first, paneId, ratio),
      second: promoteEditorPaneAsPrimary(root.second, paneId, ratio)
    };
  }
  if (root.type === "tabs") {
    return root;
  }
  return root;
}
function isRequiredEditorPane(editorType, requiredEditorTypes) {
  return requiredEditorTypes?.includes(editorType) ?? false;
}
function dockEditorPane(root, sourcePaneId, targetPaneId, zone, ratio = 0.55) {
  if (sourcePaneId === targetPaneId) return null;
  const { layout, editor } = extractEditorPane(root, sourcePaneId);
  if (!editor) return null;
  const target = findEditorNode(layout, targetPaneId);
  if (!target || target.collapsed) return null;
  if (zone === "center") {
    const parentTabs = findParentTabsOfEditor(layout, targetPaneId);
    if (parentTabs) {
      return addEditorToTabs(layout, parentTabs.id, editor);
    }
  }
  return insertDockedEditor(layout, targetPaneId, zone, editor, ratio);
}
function dockExtractedEditorPane(layout, editor, targetPaneId, zone, ratio = 0.55) {
  const target = findEditorNode(layout, targetPaneId);
  if (!target || target.collapsed) return null;
  const incoming = { ...editor, id: editor.id };
  if (zone === "center") {
    const parentTabs = findParentTabsOfEditor(layout, targetPaneId);
    if (parentTabs) {
      return addEditorToTabs(layout, parentTabs.id, incoming);
    }
  }
  return insertDockedEditor(layout, targetPaneId, zone, incoming, ratio);
}
var WORKBENCH_EDGE_DOCK_RATIO = {
  left: 0.22,
  right: 0.78,
  top: 0.28,
  bottom: 0.72
};
function dockEditorPaneAtWorkbenchEdge(root, sourcePaneId, zone, ratio = WORKBENCH_EDGE_DOCK_RATIO[zone]) {
  const { layout, editor } = extractEditorPane(root, sourcePaneId);
  if (!editor || !layout) return null;
  const incoming = { ...editor, id: editor.id };
  const clamped = Math.max(0.05, Math.min(0.95, ratio));
  switch (zone) {
    case "left":
      return {
        id: v4(),
        type: "split",
        direction: "horizontal",
        ratio: clamped,
        first: incoming,
        second: layout
      };
    case "right":
      return {
        id: v4(),
        type: "split",
        direction: "horizontal",
        ratio: clamped,
        first: layout,
        second: incoming
      };
    case "top":
      return {
        id: v4(),
        type: "split",
        direction: "vertical",
        ratio: clamped,
        first: incoming,
        second: layout
      };
    case "bottom":
      return {
        id: v4(),
        type: "split",
        direction: "vertical",
        ratio: clamped,
        first: layout,
        second: incoming
      };
  }
}
function dockExtractedEditorAtWorkbenchEdge(layout, editor, zone, ratio = WORKBENCH_EDGE_DOCK_RATIO[zone]) {
  const incoming = { ...editor, id: editor.id };
  const clamped = Math.max(0.05, Math.min(0.95, ratio));
  switch (zone) {
    case "left":
      return {
        id: v4(),
        type: "split",
        direction: "horizontal",
        ratio: clamped,
        first: incoming,
        second: layout
      };
    case "right":
      return {
        id: v4(),
        type: "split",
        direction: "horizontal",
        ratio: clamped,
        first: layout,
        second: incoming
      };
    case "top":
      return {
        id: v4(),
        type: "split",
        direction: "vertical",
        ratio: clamped,
        first: incoming,
        second: layout
      };
    case "bottom":
      return {
        id: v4(),
        type: "split",
        direction: "vertical",
        ratio: clamped,
        first: layout,
        second: incoming
      };
  }
}
var GUTTER_PX = 10;
function paneCellStyle(collapsed) {
  if (collapsed) {
    return {
      minWidth: 0,
      minHeight: 0,
      width: "var(--workbench-rail-px, 32px)",
      maxWidth: "var(--workbench-rail-px, 32px)",
      overflow: "hidden"
    };
  }
  return { minWidth: 0, minHeight: 0, overflow: "hidden" };
}
var WorkbenchSplitHost = memo(function WorkbenchSplitHost2({
  node,
  layout,
  onLayoutChange,
  onSplitResized,
  first,
  second
}) {
  const splitRef = useRef(null);
  const isHorizontal = node.direction === "horizontal";
  const firstCollapsed = isCollapsedEditor(node.first);
  const secondCollapsed = isCollapsedEditor(node.second);
  const ratio = Math.max(0.05, Math.min(0.95, node.ratio));
  const gridStyle = useMemo(() => {
    if (isHorizontal) {
      if (firstCollapsed && !secondCollapsed) {
        return {
          display: "grid",
          gridTemplateColumns: `var(--workbench-rail-px, 32px) minmax(0, 1fr)`,
          gridTemplateRows: "1fr"
        };
      }
      if (secondCollapsed && !firstCollapsed) {
        return {
          display: "grid",
          gridTemplateColumns: `minmax(0, 1fr) var(--workbench-rail-px, 32px)`,
          gridTemplateRows: "1fr"
        };
      }
      return {
        display: "grid",
        gridTemplateColumns: `minmax(0, ${ratio}fr) ${GUTTER_PX}px minmax(0, ${1 - ratio}fr)`,
        gridTemplateRows: "1fr"
      };
    }
    if (firstCollapsed && !secondCollapsed) {
      return {
        display: "grid",
        gridTemplateRows: `var(--workbench-rail-px, 32px) minmax(0, 1fr)`,
        gridTemplateColumns: "1fr"
      };
    }
    if (secondCollapsed && !firstCollapsed) {
      return {
        display: "grid",
        gridTemplateRows: `minmax(0, 1fr) var(--workbench-rail-px, 32px)`,
        gridTemplateColumns: "1fr"
      };
    }
    return {
      display: "grid",
      gridTemplateRows: `minmax(0, ${ratio}fr) ${GUTTER_PX}px minmax(0, ${1 - ratio}fr)`,
      gridTemplateColumns: "1fr"
    };
  }, [isHorizontal, ratio, firstCollapsed, secondCollapsed]);
  const showGutter = !firstCollapsed && !secondCollapsed;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: splitRef,
      className: "h-full min-h-0 w-full overflow-hidden",
      style: gridStyle,
      children: [
        /* @__PURE__ */ jsx("div", { className: "relative flex min-h-0 min-w-0 flex-col", style: paneCellStyle(firstCollapsed), children: first }),
        showGutter ? /* @__PURE__ */ jsx(
          Splitter,
          {
            direction: node.direction,
            containerRef: splitRef,
            onResize: (newRatio) => {
              onLayoutChange(updateNodeRatioAndSyncEditors(layout, node.id, newRatio));
              const firstType = directSplitChildEditorType(node.first);
              const secondType = directSplitChildEditorType(node.second);
              if (firstType && secondType) {
                onSplitResized?.(firstType, secondType, node.direction, newRatio);
              }
            }
          }
        ) : null,
        /* @__PURE__ */ jsx("div", { className: "relative flex min-h-0 min-w-0 flex-col", style: paneCellStyle(secondCollapsed), children: second })
      ]
    }
  );
});
var WorkbenchDockDragLayer = memo(function WorkbenchDockDragLayer2({
  label,
  icon,
  x,
  y
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "pointer-events-none fixed z-[5000] flex items-center gap-2 rounded-md border border-blue-500/40",
        "bg-bg-header/95 px-2 py-1 shadow-lg shadow-black/40 backdrop-blur-md"
      ),
      style: { left: x + 12, top: y + 12 },
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-secondary", children: icon }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-primary", children: label })
      ]
    }
  );
});
function registryLabel(registry, editorType) {
  const info = registry[editorType];
  return {
    label: resolveWorkbenchPaneLabel(info, editorType),
    icon: info?.icon ?? null
  };
}
var PaneTabGroup = memo(function PaneTabGroup2({
  node,
  registry,
  activePaneId = null,
  paneMaximized = false,
  onSelectTab,
  onSplit,
  onClose,
  onCollapse,
  onChangeType,
  onActivate,
  onToggleMaximize,
  onUndock,
  dockDragSourceId = null,
  dockHoverZone = null,
  dockHoverTargetPaneId = null,
  onDockZoneChange,
  onDockDragStart,
  hiddenEditorTypes,
  splitHiddenEditorTypes,
  preferredSplitEditorType = null,
  canClosePane
}) {
  const activeIndex = Math.max(
    0,
    Math.min(node.activeIndex, Math.max(0, node.panes.length - 1))
  );
  const activePane = node.panes[activeIndex];
  if (!activePane) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center text-xs text-tertiary", children: "No panes in tab group" });
  }
  const hoverZone = dockHoverTargetPaneId === activePane.id ? dockHoverZone : null;
  return /* @__PURE__ */ jsxs("div", { className: "relative flex min-h-0 flex-1 flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "wb-pane-chrome-header flex h-8 shrink-0 items-stretch gap-0.5 border-0 px-1",
        role: "tablist",
        "aria-label": "Docked pane tabs",
        children: node.panes.map((pane, index) => {
          const { label, icon } = registryLabel(registry, pane.editorType);
          const selected = index === activeIndex;
          const isDragSource = dockDragSourceId === pane.id;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "group flex min-w-0 max-w-[13rem] items-center rounded-t border border-transparent",
                selected ? "border-zinc-700 border-b-bg-panel bg-bg-panel text-primary" : "text-tertiary hover:bg-white/5 hover:text-primary",
                isDragSource && "bg-zinc-900/30"
              ),
              children: [
                /* @__PURE__ */ jsx(
                  WorkbenchHintButton,
                  {
                    hint: `Drag ${label} \u2014 green studio edge or blue pane edge to dock`,
                    ariaLabel: `Drag ${label} to another pane`,
                    className: "flex h-6 w-4 shrink-0 cursor-grab items-center justify-center rounded text-tertiary hover:bg-white/10 hover:text-primary active:cursor-grabbing",
                    onPointerDown: (e) => {
                      if (e.button !== 0) return;
                      e.stopPropagation();
                      onDockDragStart?.(pane.id);
                    },
                    children: /* @__PURE__ */ jsx(GripVertical, { size: 10, "aria-hidden": true })
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    role: "tab",
                    "aria-selected": selected,
                    className: "flex min-w-0 flex-1 items-center gap-1.5 truncate px-1 py-1 text-[11px] font-medium",
                    onClick: () => {
                      onSelectTab(index);
                      onActivate?.(pane.id);
                    },
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "shrink-0 opacity-80", children: icon }),
                      /* @__PURE__ */ jsx("span", { className: "truncate", children: label })
                    ]
                  }
                ),
                node.panes.length > 1 && (canClosePane?.(pane.id) ?? true) ? /* @__PURE__ */ jsx(
                  WorkbenchHintButton,
                  {
                    hint: `Close ${label}`,
                    ariaLabel: `Close ${label}`,
                    className: "mr-0.5 shrink-0 rounded p-0.5 text-tertiary opacity-0 transition-opacity hover:bg-white/10 hover:text-primary group-hover:opacity-100",
                    onClick: (e) => {
                      e.stopPropagation();
                      onClose(pane.id);
                    },
                    children: /* @__PURE__ */ jsx(X, { size: 12, "aria-hidden": true })
                  }
                ) : null
              ]
            },
            pane.id
          );
        })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "relative flex min-h-0 flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsx(
      PaneFrame,
      {
        node: activePane,
        registry,
        isActive: activePaneId === activePane.id,
        paneMaximized,
        onSplit: (dir, editorType) => onSplit(activePane.id, dir, editorType),
        onClose: () => onClose(activePane.id),
        onCollapse: () => onCollapse(activePane.id),
        onChangeType: (type) => onChangeType(activePane.id, type),
        onActivate: () => onActivate?.(activePane.id),
        onToggleMaximize: onToggleMaximize != null ? () => onToggleMaximize(activePane.id) : void 0,
        onUndock: onUndock != null ? () => onUndock(activePane.id) : void 0,
        dockDragSourceId,
        dockHoverZone: hoverZone,
        onDockZoneChange,
        onDockDragStart,
        hiddenEditorTypes,
        splitHiddenEditorTypes,
        preferredSplitEditorType,
        closeDisabled: !(canClosePane?.(activePane.id) ?? true)
      }
    ) })
  ] });
});
function useCombinedRefs() {
  for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
    refs[_key] = arguments[_key];
  }
  return useMemo(
    () => (node) => {
      refs.forEach((ref) => ref(node));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
var canUseDOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function isWindow(element) {
  const elementString = Object.prototype.toString.call(element);
  return elementString === "[object Window]" || // In Electron context the Window object serializes to [object global]
  elementString === "[object global]";
}
function isNode(node) {
  return "nodeType" in node;
}
function getWindow(target) {
  var _target$ownerDocument, _target$ownerDocument2;
  if (!target) {
    return window;
  }
  if (isWindow(target)) {
    return target;
  }
  if (!isNode(target)) {
    return window;
  }
  return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}
function isDocument(node) {
  const {
    Document
  } = getWindow(node);
  return node instanceof Document;
}
function isHTMLElement(node) {
  if (isWindow(node)) {
    return false;
  }
  return node instanceof getWindow(node).HTMLElement;
}
function isSVGElement(node) {
  return node instanceof getWindow(node).SVGElement;
}
function getOwnerDocument(target) {
  if (!target) {
    return document;
  }
  if (isWindow(target)) {
    return target.document;
  }
  if (!isNode(target)) {
    return document;
  }
  if (isDocument(target)) {
    return target;
  }
  if (isHTMLElement(target) || isSVGElement(target)) {
    return target.ownerDocument;
  }
  return document;
}
var useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;
function useEvent(handler) {
  const handlerRef = useRef(handler);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return useCallback(function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return handlerRef.current == null ? void 0 : handlerRef.current(...args);
  }, []);
}
function useInterval() {
  const intervalRef = useRef(null);
  const set = useCallback((listener, duration) => {
    intervalRef.current = setInterval(listener, duration);
  }, []);
  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  return [set, clear];
}
function useLatestValue(value, dependencies) {
  if (dependencies === void 0) {
    dependencies = [value];
  }
  const valueRef = useRef(value);
  useIsomorphicLayoutEffect(() => {
    if (valueRef.current !== value) {
      valueRef.current = value;
    }
  }, dependencies);
  return valueRef;
}
function useLazyMemo(callback, dependencies) {
  const valueRef = useRef();
  return useMemo(
    () => {
      const newValue = callback(valueRef.current);
      valueRef.current = newValue;
      return newValue;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies]
  );
}
function useNodeRef(onChange) {
  const onChangeHandler = useEvent(onChange);
  const node = useRef(null);
  const setNodeRef = useCallback(
    (element) => {
      if (element !== node.current) {
        onChangeHandler == null ? void 0 : onChangeHandler(element, node.current);
      }
      node.current = element;
    },
    //eslint-disable-next-line
    []
  );
  return [node, setNodeRef];
}
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
var ids = {};
function useUniqueId(prefix, value) {
  return useMemo(() => {
    if (value) {
      return value;
    }
    const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
    ids[prefix] = id;
    return prefix + "-" + id;
  }, [prefix, value]);
}
function createAdjustmentFn(modifier) {
  return function(object) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }
    return adjustments.reduce((accumulator, adjustment) => {
      const entries = Object.entries(adjustment);
      for (const [key, valueAdjustment] of entries) {
        const value = accumulator[key];
        if (value != null) {
          accumulator[key] = value + modifier * valueAdjustment;
        }
      }
      return accumulator;
    }, {
      ...object
    });
  };
}
var add = /* @__PURE__ */ createAdjustmentFn(1);
var subtract = /* @__PURE__ */ createAdjustmentFn(-1);
function hasViewportRelativeCoordinates(event) {
  return "clientX" in event && "clientY" in event;
}
function isKeyboardEvent(event) {
  if (!event) {
    return false;
  }
  const {
    KeyboardEvent
  } = getWindow(event.target);
  return KeyboardEvent && event instanceof KeyboardEvent;
}
function isTouchEvent(event) {
  if (!event) {
    return false;
  }
  const {
    TouchEvent
  } = getWindow(event.target);
  return TouchEvent && event instanceof TouchEvent;
}
function getEventCoordinates(event) {
  if (isTouchEvent(event)) {
    if (event.touches && event.touches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.touches[0];
      return {
        x,
        y
      };
    } else if (event.changedTouches && event.changedTouches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.changedTouches[0];
      return {
        x,
        y
      };
    }
  }
  if (hasViewportRelativeCoordinates(event)) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  return null;
}
var CSS = /* @__PURE__ */ Object.freeze({
  Translate: {
    toString(transform) {
      if (!transform) {
        return;
      }
      const {
        x,
        y
      } = transform;
      return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
    }
  },
  Scale: {
    toString(transform) {
      if (!transform) {
        return;
      }
      const {
        scaleX,
        scaleY
      } = transform;
      return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
    }
  },
  Transform: {
    toString(transform) {
      if (!transform) {
        return;
      }
      return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(" ");
    }
  },
  Transition: {
    toString(_ref) {
      let {
        property,
        duration,
        easing
      } = _ref;
      return property + " " + duration + "ms " + easing;
    }
  }
});
var SELECTOR = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
function findFirstFocusableNode(element) {
  if (element.matches(SELECTOR)) {
    return element;
  }
  return element.querySelector(SELECTOR);
}
var hiddenStyles = {
  display: "none"
};
function HiddenText(_ref) {
  let {
    id,
    value
  } = _ref;
  return React2.createElement("div", {
    id,
    style: hiddenStyles
  }, value);
}
function LiveRegion(_ref) {
  let {
    id,
    announcement,
    ariaLiveType = "assertive"
  } = _ref;
  const visuallyHidden = {
    position: "fixed",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(100%)",
    whiteSpace: "nowrap"
  };
  return React2.createElement("div", {
    id,
    style: visuallyHidden,
    role: "status",
    "aria-live": ariaLiveType,
    "aria-atomic": true
  }, announcement);
}
function useAnnouncement() {
  const [announcement, setAnnouncement] = useState("");
  const announce = useCallback((value) => {
    if (value != null) {
      setAnnouncement(value);
    }
  }, []);
  return {
    announce,
    announcement
  };
}

// ../../node_modules/@dnd-kit/core/dist/core.esm.js
var DndMonitorContext = /* @__PURE__ */ createContext(null);
function useDndMonitor(listener) {
  const registerListener = useContext(DndMonitorContext);
  useEffect(() => {
    if (!registerListener) {
      throw new Error("useDndMonitor must be used within a children of <DndContext>");
    }
    const unsubscribe = registerListener(listener);
    return unsubscribe;
  }, [listener, registerListener]);
}
function useDndMonitorProvider() {
  const [listeners] = useState(() => /* @__PURE__ */ new Set());
  const registerListener = useCallback((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [listeners]);
  const dispatch = useCallback((_ref) => {
    let {
      type,
      event
    } = _ref;
    listeners.forEach((listener) => {
      var _listener$type;
      return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
    });
  }, [listeners]);
  return [dispatch, registerListener];
}
var defaultScreenReaderInstructions = {
  draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
};
var defaultAnnouncements = {
  onDragStart(_ref) {
    let {
      active
    } = _ref;
    return "Picked up draggable item " + active.id + ".";
  },
  onDragOver(_ref2) {
    let {
      active,
      over
    } = _ref2;
    if (over) {
      return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
    }
    return "Draggable item " + active.id + " is no longer over a droppable area.";
  },
  onDragEnd(_ref3) {
    let {
      active,
      over
    } = _ref3;
    if (over) {
      return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
    }
    return "Draggable item " + active.id + " was dropped.";
  },
  onDragCancel(_ref4) {
    let {
      active
    } = _ref4;
    return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
  }
};
function Accessibility(_ref) {
  let {
    announcements = defaultAnnouncements,
    container,
    hiddenTextDescribedById,
    screenReaderInstructions = defaultScreenReaderInstructions
  } = _ref;
  const {
    announce,
    announcement
  } = useAnnouncement();
  const liveRegionId = useUniqueId("DndLiveRegion");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useDndMonitor(useMemo(() => ({
    onDragStart(_ref2) {
      let {
        active
      } = _ref2;
      announce(announcements.onDragStart({
        active
      }));
    },
    onDragMove(_ref3) {
      let {
        active,
        over
      } = _ref3;
      if (announcements.onDragMove) {
        announce(announcements.onDragMove({
          active,
          over
        }));
      }
    },
    onDragOver(_ref4) {
      let {
        active,
        over
      } = _ref4;
      announce(announcements.onDragOver({
        active,
        over
      }));
    },
    onDragEnd(_ref5) {
      let {
        active,
        over
      } = _ref5;
      announce(announcements.onDragEnd({
        active,
        over
      }));
    },
    onDragCancel(_ref6) {
      let {
        active,
        over
      } = _ref6;
      announce(announcements.onDragCancel({
        active,
        over
      }));
    }
  }), [announce, announcements]));
  if (!mounted) {
    return null;
  }
  const markup = React2.createElement(React2.Fragment, null, React2.createElement(HiddenText, {
    id: hiddenTextDescribedById,
    value: screenReaderInstructions.draggable
  }), React2.createElement(LiveRegion, {
    id: liveRegionId,
    announcement
  }));
  return container ? createPortal(markup, container) : markup;
}
var Action;
(function(Action2) {
  Action2["DragStart"] = "dragStart";
  Action2["DragMove"] = "dragMove";
  Action2["DragEnd"] = "dragEnd";
  Action2["DragCancel"] = "dragCancel";
  Action2["DragOver"] = "dragOver";
  Action2["RegisterDroppable"] = "registerDroppable";
  Action2["SetDroppableDisabled"] = "setDroppableDisabled";
  Action2["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));
function noop() {
}
function useSensor(sensor, options) {
  return useMemo(
    () => ({
      sensor,
      options: options != null ? options : {}
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sensor, options]
  );
}
function useSensors() {
  for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) {
    sensors[_key] = arguments[_key];
  }
  return useMemo(
    () => [...sensors].filter((sensor) => sensor != null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...sensors]
  );
}
var defaultCoordinates = /* @__PURE__ */ Object.freeze({
  x: 0,
  y: 0
});
function distanceBetween(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function sortCollisionsAsc(_ref, _ref2) {
  let {
    data: {
      value: a
    }
  } = _ref;
  let {
    data: {
      value: b
    }
  } = _ref2;
  return a - b;
}
function sortCollisionsDesc(_ref3, _ref4) {
  let {
    data: {
      value: a
    }
  } = _ref3;
  let {
    data: {
      value: b
    }
  } = _ref4;
  return b - a;
}
function getFirstCollision(collisions, property) {
  if (!collisions || collisions.length === 0) {
    return null;
  }
  const [firstCollision] = collisions;
  return firstCollision[property] ;
}
function centerOfRectangle(rect, left, top) {
  if (left === void 0) {
    left = rect.left;
  }
  if (top === void 0) {
    top = rect.top;
  }
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5
  };
}
var closestCenter = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
      collisions.push({
        id,
        data: {
          droppableContainer,
          value: distBetween
        }
      });
    }
  }
  return collisions.sort(sortCollisionsAsc);
};
function getIntersectionRatio(entry, target) {
  const top = Math.max(target.top, entry.top);
  const left = Math.max(target.left, entry.left);
  const right = Math.min(target.left + target.width, entry.left + entry.width);
  const bottom = Math.min(target.top + target.height, entry.top + entry.height);
  const width = right - left;
  const height = bottom - top;
  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
    return Number(intersectionRatio.toFixed(4));
  }
  return 0;
}
var rectIntersection = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);
      if (intersectionRatio > 0) {
        collisions.push({
          id,
          data: {
            droppableContainer,
            value: intersectionRatio
          }
        });
      }
    }
  }
  return collisions.sort(sortCollisionsDesc);
};
function adjustScale(transform, rect1, rect2) {
  return {
    ...transform,
    scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
    scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
  };
}
function getRectDelta(rect1, rect2) {
  return rect1 && rect2 ? {
    x: rect1.left - rect2.left,
    y: rect1.top - rect2.top
  } : defaultCoordinates;
}
function createRectAdjustmentFn(modifier) {
  return function adjustClientRect(rect) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }
    return adjustments.reduce((acc, adjustment) => ({
      ...acc,
      top: acc.top + modifier * adjustment.y,
      bottom: acc.bottom + modifier * adjustment.y,
      left: acc.left + modifier * adjustment.x,
      right: acc.right + modifier * adjustment.x
    }), {
      ...rect
    });
  };
}
var getAdjustedRect = /* @__PURE__ */ createRectAdjustmentFn(1);
function parseTransform(transform) {
  if (transform.startsWith("matrix3d(")) {
    const transformArray = transform.slice(9, -1).split(/, /);
    return {
      x: +transformArray[12],
      y: +transformArray[13],
      scaleX: +transformArray[0],
      scaleY: +transformArray[5]
    };
  } else if (transform.startsWith("matrix(")) {
    const transformArray = transform.slice(7, -1).split(/, /);
    return {
      x: +transformArray[4],
      y: +transformArray[5],
      scaleX: +transformArray[0],
      scaleY: +transformArray[3]
    };
  }
  return null;
}
function inverseTransform(rect, transform, transformOrigin) {
  const parsedTransform = parseTransform(transform);
  if (!parsedTransform) {
    return rect;
  }
  const {
    scaleX,
    scaleY,
    x: translateX,
    y: translateY
  } = parsedTransform;
  const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
  const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
  const w = scaleX ? rect.width / scaleX : rect.width;
  const h = scaleY ? rect.height / scaleY : rect.height;
  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x
  };
}
var defaultOptions = {
  ignoreTransform: false
};
function getClientRect(element, options) {
  if (options === void 0) {
    options = defaultOptions;
  }
  let rect = element.getBoundingClientRect();
  if (options.ignoreTransform) {
    const {
      transform,
      transformOrigin
    } = getWindow(element).getComputedStyle(element);
    if (transform) {
      rect = inverseTransform(rect, transform, transformOrigin);
    }
  }
  const {
    top,
    left,
    width,
    height,
    bottom,
    right
  } = rect;
  return {
    top,
    left,
    width,
    height,
    bottom,
    right
  };
}
function getTransformAgnosticClientRect(element) {
  return getClientRect(element, {
    ignoreTransform: true
  });
}
function getWindowClientRect(element) {
  const width = element.innerWidth;
  const height = element.innerHeight;
  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height
  };
}
function isFixed(node, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getWindow(node).getComputedStyle(node);
  }
  return computedStyle.position === "fixed";
}
function isScrollable(element, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getWindow(element).getComputedStyle(element);
  }
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties2 = ["overflow", "overflowX", "overflowY"];
  return properties2.some((property) => {
    const value = computedStyle[property];
    return typeof value === "string" ? overflowRegex.test(value) : false;
  });
}
function getScrollableAncestors(element, limit) {
  const scrollParents = [];
  function findScrollableAncestors(node) {
    if (limit != null && scrollParents.length >= limit) {
      return scrollParents;
    }
    if (!node) {
      return scrollParents;
    }
    if (isDocument(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
      scrollParents.push(node.scrollingElement);
      return scrollParents;
    }
    if (!isHTMLElement(node) || isSVGElement(node)) {
      return scrollParents;
    }
    if (scrollParents.includes(node)) {
      return scrollParents;
    }
    const computedStyle = getWindow(element).getComputedStyle(node);
    if (node !== element) {
      if (isScrollable(node, computedStyle)) {
        scrollParents.push(node);
      }
    }
    if (isFixed(node, computedStyle)) {
      return scrollParents;
    }
    return findScrollableAncestors(node.parentNode);
  }
  if (!element) {
    return scrollParents;
  }
  return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
  const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
  return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}
function getScrollableElement(element) {
  if (!canUseDOM || !element) {
    return null;
  }
  if (isWindow(element)) {
    return element;
  }
  if (!isNode(element)) {
    return null;
  }
  if (isDocument(element) || element === getOwnerDocument(element).scrollingElement) {
    return window;
  }
  if (isHTMLElement(element)) {
    return element;
  }
  return null;
}
function getScrollXCoordinate(element) {
  if (isWindow(element)) {
    return element.scrollX;
  }
  return element.scrollLeft;
}
function getScrollYCoordinate(element) {
  if (isWindow(element)) {
    return element.scrollY;
  }
  return element.scrollTop;
}
function getScrollCoordinates(element) {
  return {
    x: getScrollXCoordinate(element),
    y: getScrollYCoordinate(element)
  };
}
var Direction;
(function(Direction2) {
  Direction2[Direction2["Forward"] = 1] = "Forward";
  Direction2[Direction2["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));
function isDocumentScrollingElement(element) {
  if (!canUseDOM || !element) {
    return false;
  }
  return element === document.scrollingElement;
}
function getScrollPosition(scrollingContainer) {
  const minScroll = {
    x: 0,
    y: 0
  };
  const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
    height: window.innerHeight,
    width: window.innerWidth
  } : {
    height: scrollingContainer.clientHeight,
    width: scrollingContainer.clientWidth
  };
  const maxScroll = {
    x: scrollingContainer.scrollWidth - dimensions.width,
    y: scrollingContainer.scrollHeight - dimensions.height
  };
  const isTop = scrollingContainer.scrollTop <= minScroll.y;
  const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
  const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
  const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
  return {
    isTop,
    isLeft,
    isBottom,
    isRight,
    maxScroll,
    minScroll
  };
}
var defaultThreshold = {
  x: 0.2,
  y: 0.2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
  let {
    top,
    left,
    right,
    bottom
  } = _ref;
  if (acceleration === void 0) {
    acceleration = 10;
  }
  if (thresholdPercentage === void 0) {
    thresholdPercentage = defaultThreshold;
  }
  const {
    isTop,
    isBottom,
    isLeft,
    isRight
  } = getScrollPosition(scrollContainer);
  const direction = {
    x: 0,
    y: 0
  };
  const speed = {
    x: 0,
    y: 0
  };
  const threshold = {
    height: scrollContainerRect.height * thresholdPercentage.y,
    width: scrollContainerRect.width * thresholdPercentage.x
  };
  if (!isTop && top <= scrollContainerRect.top + threshold.height) {
    direction.y = Direction.Backward;
    speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
  } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
    direction.y = Direction.Forward;
    speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
  }
  if (!isRight && right >= scrollContainerRect.right - threshold.width) {
    direction.x = Direction.Forward;
    speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
  } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
    direction.x = Direction.Backward;
    speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
  }
  return {
    direction,
    speed
  };
}
function getScrollElementRect(element) {
  if (element === document.scrollingElement) {
    const {
      innerWidth,
      innerHeight
    } = window;
    return {
      top: 0,
      left: 0,
      right: innerWidth,
      bottom: innerHeight,
      width: innerWidth,
      height: innerHeight
    };
  }
  const {
    top,
    left,
    right,
    bottom
  } = element.getBoundingClientRect();
  return {
    top,
    left,
    right,
    bottom,
    width: element.clientWidth,
    height: element.clientHeight
  };
}
function getScrollOffsets(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return add(acc, getScrollCoordinates(node));
  }, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollXCoordinate(node);
  }, 0);
}
function getScrollYOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollYCoordinate(node);
  }, 0);
}
function scrollIntoViewIfNeeded(element, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }
  if (!element) {
    return;
  }
  const {
    top,
    left,
    bottom,
    right
  } = measure(element);
  const firstScrollableAncestor = getFirstScrollableAncestor(element);
  if (!firstScrollableAncestor) {
    return;
  }
  if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) {
    element.scrollIntoView({
      block: "center",
      inline: "center"
    });
  }
}
var properties = [["x", ["left", "right"], getScrollXOffset], ["y", ["top", "bottom"], getScrollYOffset]];
var Rect = class {
  constructor(rect, element) {
    this.rect = void 0;
    this.width = void 0;
    this.height = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.right = void 0;
    this.left = void 0;
    const scrollableAncestors = getScrollableAncestors(element);
    const scrollOffsets = getScrollOffsets(scrollableAncestors);
    this.rect = {
      ...rect
    };
    this.width = rect.width;
    this.height = rect.height;
    for (const [axis, keys, getScrollOffset] of properties) {
      for (const key of keys) {
        Object.defineProperty(this, key, {
          get: () => {
            const currentOffsets = getScrollOffset(scrollableAncestors);
            const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
            return this.rect[key] + scrollOffsetsDeltla;
          },
          enumerable: true
        });
      }
    }
    Object.defineProperty(this, "rect", {
      enumerable: false
    });
  }
};
var Listeners = class {
  constructor(target) {
    this.target = void 0;
    this.listeners = [];
    this.removeAll = () => {
      this.listeners.forEach((listener) => {
        var _this$target;
        return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
      });
    };
    this.target = target;
  }
  add(eventName, handler, options) {
    var _this$target2;
    (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
    this.listeners.push([eventName, handler, options]);
  }
};
function getEventListenerTarget(target) {
  const {
    EventTarget
  } = getWindow(target);
  return target instanceof EventTarget ? target : getOwnerDocument(target);
}
function hasExceededDistance(delta, measurement) {
  const dx = Math.abs(delta.x);
  const dy = Math.abs(delta.y);
  if (typeof measurement === "number") {
    return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
  }
  if ("x" in measurement && "y" in measurement) {
    return dx > measurement.x && dy > measurement.y;
  }
  if ("x" in measurement) {
    return dx > measurement.x;
  }
  if ("y" in measurement) {
    return dy > measurement.y;
  }
  return false;
}
var EventName;
(function(EventName2) {
  EventName2["Click"] = "click";
  EventName2["DragStart"] = "dragstart";
  EventName2["Keydown"] = "keydown";
  EventName2["ContextMenu"] = "contextmenu";
  EventName2["Resize"] = "resize";
  EventName2["SelectionChange"] = "selectionchange";
  EventName2["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));
function preventDefault(event) {
  event.preventDefault();
}
function stopPropagation(event) {
  event.stopPropagation();
}
var KeyboardCode;
(function(KeyboardCode2) {
  KeyboardCode2["Space"] = "Space";
  KeyboardCode2["Down"] = "ArrowDown";
  KeyboardCode2["Right"] = "ArrowRight";
  KeyboardCode2["Left"] = "ArrowLeft";
  KeyboardCode2["Up"] = "ArrowUp";
  KeyboardCode2["Esc"] = "Escape";
  KeyboardCode2["Enter"] = "Enter";
  KeyboardCode2["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));
var defaultKeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab]
};
var defaultKeyboardCoordinateGetter = (event, _ref) => {
  let {
    currentCoordinates
  } = _ref;
  switch (event.code) {
    case KeyboardCode.Right:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x + 25
      };
    case KeyboardCode.Left:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x - 25
      };
    case KeyboardCode.Down:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y + 25
      };
    case KeyboardCode.Up:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y - 25
      };
  }
  return void 0;
};
var KeyboardSensor = class {
  constructor(props) {
    this.props = void 0;
    this.autoScrollEnabled = false;
    this.referenceCoordinates = void 0;
    this.listeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    const {
      event: {
        target
      }
    } = props;
    this.props = props;
    this.listeners = new Listeners(getOwnerDocument(target));
    this.windowListeners = new Listeners(getWindow(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.attach();
  }
  attach() {
    this.handleStart();
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
  }
  handleStart() {
    const {
      activeNode,
      onStart
    } = this.props;
    const node = activeNode.node.current;
    if (node) {
      scrollIntoViewIfNeeded(node);
    }
    onStart(defaultCoordinates);
  }
  handleKeyDown(event) {
    if (isKeyboardEvent(event)) {
      const {
        active,
        context,
        options
      } = this.props;
      const {
        keyboardCodes = defaultKeyboardCodes,
        coordinateGetter = defaultKeyboardCoordinateGetter,
        scrollBehavior = "smooth"
      } = options;
      const {
        code
      } = event;
      if (keyboardCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }
      if (keyboardCodes.cancel.includes(code)) {
        this.handleCancel(event);
        return;
      }
      const {
        collisionRect
      } = context.current;
      const currentCoordinates = collisionRect ? {
        x: collisionRect.left,
        y: collisionRect.top
      } : defaultCoordinates;
      if (!this.referenceCoordinates) {
        this.referenceCoordinates = currentCoordinates;
      }
      const newCoordinates = coordinateGetter(event, {
        active,
        context: context.current,
        currentCoordinates
      });
      if (newCoordinates) {
        const coordinatesDelta = subtract(newCoordinates, currentCoordinates);
        const scrollDelta = {
          x: 0,
          y: 0
        };
        const {
          scrollableAncestors
        } = context.current;
        for (const scrollContainer of scrollableAncestors) {
          const direction = event.code;
          const {
            isTop,
            isRight,
            isLeft,
            isBottom,
            maxScroll,
            minScroll
          } = getScrollPosition(scrollContainer);
          const scrollElementRect = getScrollElementRect(scrollContainer);
          const clampedCoordinates = {
            x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
            y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
          };
          const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
          const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
            const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
            if (canScrollToNewCoordinates && !coordinatesDelta.y) {
              scrollContainer.scrollTo({
                left: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }
            if (canScrollToNewCoordinates) {
              scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
            } else {
              scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
            }
            if (scrollDelta.x) {
              scrollContainer.scrollBy({
                left: -scrollDelta.x,
                behavior: scrollBehavior
              });
            }
            break;
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
            const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
            if (canScrollToNewCoordinates && !coordinatesDelta.x) {
              scrollContainer.scrollTo({
                top: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }
            if (canScrollToNewCoordinates) {
              scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
            } else {
              scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
            }
            if (scrollDelta.y) {
              scrollContainer.scrollBy({
                top: -scrollDelta.y,
                behavior: scrollBehavior
              });
            }
            break;
          }
        }
        this.handleMove(event, add(subtract(newCoordinates, this.referenceCoordinates), scrollDelta));
      }
    }
  }
  handleMove(event, coordinates) {
    const {
      onMove
    } = this.props;
    event.preventDefault();
    onMove(coordinates);
  }
  handleEnd(event) {
    const {
      onEnd
    } = this.props;
    event.preventDefault();
    this.detach();
    onEnd();
  }
  handleCancel(event) {
    const {
      onCancel
    } = this.props;
    event.preventDefault();
    this.detach();
    onCancel();
  }
  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
  }
};
KeyboardSensor.activators = [{
  eventName: "onKeyDown",
  handler: (event, _ref, _ref2) => {
    let {
      keyboardCodes = defaultKeyboardCodes,
      onActivation
    } = _ref;
    let {
      active
    } = _ref2;
    const {
      code
    } = event.nativeEvent;
    if (keyboardCodes.start.includes(code)) {
      const activator = active.activatorNode.current;
      if (activator && event.target !== activator) {
        return false;
      }
      event.preventDefault();
      onActivation == null ? void 0 : onActivation({
        event: event.nativeEvent
      });
      return true;
    }
    return false;
  }
}];
function isDistanceConstraint(constraint) {
  return Boolean(constraint && "distance" in constraint);
}
function isDelayConstraint(constraint) {
  return Boolean(constraint && "delay" in constraint);
}
var AbstractPointerSensor = class {
  constructor(props, events2, listenerTarget) {
    var _getEventCoordinates;
    if (listenerTarget === void 0) {
      listenerTarget = getEventListenerTarget(props.event.target);
    }
    this.props = void 0;
    this.events = void 0;
    this.autoScrollEnabled = true;
    this.document = void 0;
    this.activated = false;
    this.initialCoordinates = void 0;
    this.timeoutId = null;
    this.listeners = void 0;
    this.documentListeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    this.events = events2;
    const {
      event
    } = props;
    const {
      target
    } = event;
    this.props = props;
    this.events = events2;
    this.document = getOwnerDocument(target);
    this.documentListeners = new Listeners(this.document);
    this.listeners = new Listeners(listenerTarget);
    this.windowListeners = new Listeners(getWindow(target));
    this.initialCoordinates = (_getEventCoordinates = getEventCoordinates(event)) != null ? _getEventCoordinates : defaultCoordinates;
    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.removeTextSelection = this.removeTextSelection.bind(this);
    this.attach();
  }
  attach() {
    const {
      events: events2,
      props: {
        options: {
          activationConstraint,
          bypassActivationConstraint
        }
      }
    } = this;
    this.listeners.add(events2.move.name, this.handleMove, {
      passive: false
    });
    this.listeners.add(events2.end.name, this.handleEnd);
    if (events2.cancel) {
      this.listeners.add(events2.cancel.name, this.handleCancel);
    }
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.DragStart, preventDefault);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    this.windowListeners.add(EventName.ContextMenu, preventDefault);
    this.documentListeners.add(EventName.Keydown, this.handleKeydown);
    if (activationConstraint) {
      if (bypassActivationConstraint != null && bypassActivationConstraint({
        event: this.props.event,
        activeNode: this.props.activeNode,
        options: this.props.options
      })) {
        return this.handleStart();
      }
      if (isDelayConstraint(activationConstraint)) {
        this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
        this.handlePending(activationConstraint);
        return;
      }
      if (isDistanceConstraint(activationConstraint)) {
        this.handlePending(activationConstraint);
        return;
      }
    }
    this.handleStart();
  }
  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
    setTimeout(this.documentListeners.removeAll, 50);
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  handlePending(constraint, offset) {
    const {
      active,
      onPending
    } = this.props;
    onPending(active, constraint, this.initialCoordinates, offset);
  }
  handleStart() {
    const {
      initialCoordinates
    } = this;
    const {
      onStart
    } = this.props;
    if (initialCoordinates) {
      this.activated = true;
      this.documentListeners.add(EventName.Click, stopPropagation, {
        capture: true
      });
      this.removeTextSelection();
      this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
      onStart(initialCoordinates);
    }
  }
  handleMove(event) {
    var _getEventCoordinates2;
    const {
      activated,
      initialCoordinates,
      props
    } = this;
    const {
      onMove,
      options: {
        activationConstraint
      }
    } = props;
    if (!initialCoordinates) {
      return;
    }
    const coordinates = (_getEventCoordinates2 = getEventCoordinates(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
    const delta = subtract(initialCoordinates, coordinates);
    if (!activated && activationConstraint) {
      if (isDistanceConstraint(activationConstraint)) {
        if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
        if (hasExceededDistance(delta, activationConstraint.distance)) {
          return this.handleStart();
        }
      }
      if (isDelayConstraint(activationConstraint)) {
        if (hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
      }
      this.handlePending(activationConstraint, delta);
      return;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    onMove(coordinates);
  }
  handleEnd() {
    const {
      onAbort,
      onEnd
    } = this.props;
    this.detach();
    if (!this.activated) {
      onAbort(this.props.active);
    }
    onEnd();
  }
  handleCancel() {
    const {
      onAbort,
      onCancel
    } = this.props;
    this.detach();
    if (!this.activated) {
      onAbort(this.props.active);
    }
    onCancel();
  }
  handleKeydown(event) {
    if (event.code === KeyboardCode.Esc) {
      this.handleCancel();
    }
  }
  removeTextSelection() {
    var _this$document$getSel;
    (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
  }
};
var events = {
  cancel: {
    name: "pointercancel"
  },
  move: {
    name: "pointermove"
  },
  end: {
    name: "pointerup"
  }
};
var PointerSensor = class extends AbstractPointerSensor {
  constructor(props) {
    const {
      event
    } = props;
    const listenerTarget = getOwnerDocument(event.target);
    super(props, events, listenerTarget);
  }
};
PointerSensor.activators = [{
  eventName: "onPointerDown",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    if (!event.isPrimary || event.button !== 0) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var events$1 = {
  move: {
    name: "mousemove"
  },
  end: {
    name: "mouseup"
  }
};
var MouseButton;
(function(MouseButton2) {
  MouseButton2[MouseButton2["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));
var MouseSensor = class extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$1, getOwnerDocument(props.event.target));
  }
};
MouseSensor.activators = [{
  eventName: "onMouseDown",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    if (event.button === MouseButton.RightClick) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var events$2 = {
  cancel: {
    name: "touchcancel"
  },
  move: {
    name: "touchmove"
  },
  end: {
    name: "touchend"
  }
};
var TouchSensor = class extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$2);
  }
  static setup() {
    window.addEventListener(events$2.move.name, noop2, {
      capture: false,
      passive: false
    });
    return function teardown() {
      window.removeEventListener(events$2.move.name, noop2);
    };
    function noop2() {
    }
  }
};
TouchSensor.activators = [{
  eventName: "onTouchStart",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    const {
      touches
    } = event;
    if (touches.length > 1) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var AutoScrollActivator;
(function(AutoScrollActivator2) {
  AutoScrollActivator2[AutoScrollActivator2["Pointer"] = 0] = "Pointer";
  AutoScrollActivator2[AutoScrollActivator2["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));
var TraversalOrder;
(function(TraversalOrder2) {
  TraversalOrder2[TraversalOrder2["TreeOrder"] = 0] = "TreeOrder";
  TraversalOrder2[TraversalOrder2["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));
function useAutoScroller(_ref) {
  let {
    acceleration,
    activator = AutoScrollActivator.Pointer,
    canScroll,
    draggingRect,
    enabled,
    interval = 5,
    order = TraversalOrder.TreeOrder,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects,
    delta,
    threshold
  } = _ref;
  const scrollIntent = useScrollIntent({
    delta,
    disabled: !enabled
  });
  const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
  const scrollSpeed = useRef({
    x: 0,
    y: 0
  });
  const scrollDirection = useRef({
    x: 0,
    y: 0
  });
  const rect = useMemo(() => {
    switch (activator) {
      case AutoScrollActivator.Pointer:
        return pointerCoordinates ? {
          top: pointerCoordinates.y,
          bottom: pointerCoordinates.y,
          left: pointerCoordinates.x,
          right: pointerCoordinates.x
        } : null;
      case AutoScrollActivator.DraggableRect:
        return draggingRect;
    }
  }, [activator, draggingRect, pointerCoordinates]);
  const scrollContainerRef = useRef(null);
  const autoScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }
    const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
    const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
    scrollContainer.scrollBy(scrollLeft, scrollTop);
  }, []);
  const sortedScrollableAncestors = useMemo(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
  useEffect(
    () => {
      if (!enabled || !scrollableAncestors.length || !rect) {
        clearAutoScrollInterval();
        return;
      }
      for (const scrollContainer of sortedScrollableAncestors) {
        if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
          continue;
        }
        const index = scrollableAncestors.indexOf(scrollContainer);
        const scrollContainerRect = scrollableAncestorRects[index];
        if (!scrollContainerRect) {
          continue;
        }
        const {
          direction,
          speed
        } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
        for (const axis of ["x", "y"]) {
          if (!scrollIntent[axis][direction[axis]]) {
            speed[axis] = 0;
            direction[axis] = 0;
          }
        }
        if (speed.x > 0 || speed.y > 0) {
          clearAutoScrollInterval();
          scrollContainerRef.current = scrollContainer;
          setAutoScrollInterval(autoScroll, interval);
          scrollSpeed.current = speed;
          scrollDirection.current = direction;
          return;
        }
      }
      scrollSpeed.current = {
        x: 0,
        y: 0
      };
      scrollDirection.current = {
        x: 0,
        y: 0
      };
      clearAutoScrollInterval();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      acceleration,
      autoScroll,
      canScroll,
      clearAutoScrollInterval,
      enabled,
      interval,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(rect),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(scrollIntent),
      setAutoScrollInterval,
      scrollableAncestors,
      sortedScrollableAncestors,
      scrollableAncestorRects,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(threshold)
    ]
  );
}
var defaultScrollIntent = {
  x: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  },
  y: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  }
};
function useScrollIntent(_ref2) {
  let {
    delta,
    disabled
  } = _ref2;
  const previousDelta = usePrevious(delta);
  return useLazyMemo((previousIntent) => {
    if (disabled || !previousDelta || !previousIntent) {
      return defaultScrollIntent;
    }
    const direction = {
      x: Math.sign(delta.x - previousDelta.x),
      y: Math.sign(delta.y - previousDelta.y)
    };
    return {
      x: {
        [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
        [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
      },
      y: {
        [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
        [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
      }
    };
  }, [disabled, delta, previousDelta]);
}
function useCachedNode(draggableNodes, id) {
  const draggableNode = id != null ? draggableNodes.get(id) : void 0;
  const node = draggableNode ? draggableNode.node.current : null;
  return useLazyMemo((cachedNode) => {
    var _ref;
    if (id == null) {
      return null;
    }
    return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
  }, [node, id]);
}
function useCombineActivators(sensors, getSyntheticHandler) {
  return useMemo(() => sensors.reduce((accumulator, sensor) => {
    const {
      sensor: Sensor
    } = sensor;
    const sensorActivators = Sensor.activators.map((activator) => ({
      eventName: activator.eventName,
      handler: getSyntheticHandler(activator.handler, sensor)
    }));
    return [...accumulator, ...sensorActivators];
  }, []), [sensors, getSyntheticHandler]);
}
var MeasuringStrategy;
(function(MeasuringStrategy2) {
  MeasuringStrategy2[MeasuringStrategy2["Always"] = 0] = "Always";
  MeasuringStrategy2[MeasuringStrategy2["BeforeDragging"] = 1] = "BeforeDragging";
  MeasuringStrategy2[MeasuringStrategy2["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));
var MeasuringFrequency;
(function(MeasuringFrequency2) {
  MeasuringFrequency2["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));
var defaultValue = /* @__PURE__ */ new Map();
function useDroppableMeasuring(containers, _ref) {
  let {
    dragging,
    dependencies,
    config
  } = _ref;
  const [queue, setQueue] = useState(null);
  const {
    frequency,
    measure,
    strategy
  } = config;
  const containersRef = useRef(containers);
  const disabled = isDisabled();
  const disabledRef = useLatestValue(disabled);
  const measureDroppableContainers = useCallback(function(ids2) {
    if (ids2 === void 0) {
      ids2 = [];
    }
    if (disabledRef.current) {
      return;
    }
    setQueue((value) => {
      if (value === null) {
        return ids2;
      }
      return value.concat(ids2.filter((id) => !value.includes(id)));
    });
  }, [disabledRef]);
  const timeoutId = useRef(null);
  const droppableRects = useLazyMemo((previousValue) => {
    if (disabled && !dragging) {
      return defaultValue;
    }
    if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
      const map = /* @__PURE__ */ new Map();
      for (let container of containers) {
        if (!container) {
          continue;
        }
        if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
          map.set(container.id, container.rect.current);
          continue;
        }
        const node = container.node.current;
        const rect = node ? new Rect(measure(node), node) : null;
        container.rect.current = rect;
        if (rect) {
          map.set(container.id, rect);
        }
      }
      return map;
    }
    return previousValue;
  }, [containers, queue, dragging, disabled, measure]);
  useEffect(() => {
    containersRef.current = containers;
  }, [containers]);
  useEffect(
    () => {
      if (disabled) {
        return;
      }
      measureDroppableContainers();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, disabled]
  );
  useEffect(
    () => {
      if (queue && queue.length > 0) {
        setQueue(null);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(queue)]
  );
  useEffect(
    () => {
      if (disabled || typeof frequency !== "number" || timeoutId.current !== null) {
        return;
      }
      timeoutId.current = setTimeout(() => {
        measureDroppableContainers();
        timeoutId.current = null;
      }, frequency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, disabled, measureDroppableContainers, ...dependencies]
  );
  return {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled: queue != null
  };
  function isDisabled() {
    switch (strategy) {
      case MeasuringStrategy.Always:
        return false;
      case MeasuringStrategy.BeforeDragging:
        return dragging;
      default:
        return !dragging;
    }
  }
}
function useInitialValue(value, computeFn) {
  return useLazyMemo((previousValue) => {
    if (!value) {
      return null;
    }
    if (previousValue) {
      return previousValue;
    }
    return typeof computeFn === "function" ? computeFn(value) : value;
  }, [computeFn, value]);
}
function useInitialRect(node, measure) {
  return useInitialValue(node, measure);
}
function useMutationObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleMutations = useEvent(callback);
  const mutationObserver = useMemo(() => {
    if (disabled || typeof window === "undefined" || typeof window.MutationObserver === "undefined") {
      return void 0;
    }
    const {
      MutationObserver
    } = window;
    return new MutationObserver(handleMutations);
  }, [handleMutations, disabled]);
  useEffect(() => {
    return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
  }, [mutationObserver]);
  return mutationObserver;
}
function useResizeObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleResize = useEvent(callback);
  const resizeObserver = useMemo(
    () => {
      if (disabled || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") {
        return void 0;
      }
      const {
        ResizeObserver
      } = window;
      return new ResizeObserver(handleResize);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );
  useEffect(() => {
    return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
  }, [resizeObserver]);
  return resizeObserver;
}
function defaultMeasure(element) {
  return new Rect(getClientRect(element), element);
}
function useRect(element, measure, fallbackRect) {
  if (measure === void 0) {
    measure = defaultMeasure;
  }
  const [rect, setRect] = useState(null);
  function measureRect() {
    setRect((currentRect) => {
      if (!element) {
        return null;
      }
      if (element.isConnected === false) {
        var _ref;
        return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
      }
      const newRect = measure(element);
      if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
        return currentRect;
      }
      return newRect;
    });
  }
  const mutationObserver = useMutationObserver({
    callback(records) {
      if (!element) {
        return;
      }
      for (const record of records) {
        const {
          type,
          target
        } = record;
        if (type === "childList" && target instanceof HTMLElement && target.contains(element)) {
          measureRect();
          break;
        }
      }
    }
  });
  const resizeObserver = useResizeObserver({
    callback: measureRect
  });
  useIsomorphicLayoutEffect(() => {
    measureRect();
    if (element) {
      resizeObserver == null ? void 0 : resizeObserver.observe(element);
      mutationObserver == null ? void 0 : mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }
  }, [element]);
  return rect;
}
function useRectDelta(rect) {
  const initialRect = useInitialValue(rect);
  return getRectDelta(rect, initialRect);
}
var defaultValue$1 = [];
function useScrollableAncestors(node) {
  const previousNode = useRef(node);
  const ancestors = useLazyMemo((previousValue) => {
    if (!node) {
      return defaultValue$1;
    }
    if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) {
      return previousValue;
    }
    return getScrollableAncestors(node);
  }, [node]);
  useEffect(() => {
    previousNode.current = node;
  }, [node]);
  return ancestors;
}
function useScrollOffsets(elements) {
  const [scrollCoordinates, setScrollCoordinates] = useState(null);
  const prevElements = useRef(elements);
  const handleScroll = useCallback((event) => {
    const scrollingElement = getScrollableElement(event.target);
    if (!scrollingElement) {
      return;
    }
    setScrollCoordinates((scrollCoordinates2) => {
      if (!scrollCoordinates2) {
        return null;
      }
      scrollCoordinates2.set(scrollingElement, getScrollCoordinates(scrollingElement));
      return new Map(scrollCoordinates2);
    });
  }, []);
  useEffect(() => {
    const previousElements = prevElements.current;
    if (elements !== previousElements) {
      cleanup(previousElements);
      const entries = elements.map((element) => {
        const scrollableElement = getScrollableElement(element);
        if (scrollableElement) {
          scrollableElement.addEventListener("scroll", handleScroll, {
            passive: true
          });
          return [scrollableElement, getScrollCoordinates(scrollableElement)];
        }
        return null;
      }).filter((entry) => entry != null);
      setScrollCoordinates(entries.length ? new Map(entries) : null);
      prevElements.current = elements;
    }
    return () => {
      cleanup(elements);
      cleanup(previousElements);
    };
    function cleanup(elements2) {
      elements2.forEach((element) => {
        const scrollableElement = getScrollableElement(element);
        scrollableElement == null ? void 0 : scrollableElement.removeEventListener("scroll", handleScroll);
      });
    }
  }, [handleScroll, elements]);
  return useMemo(() => {
    if (elements.length) {
      return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
    }
    return defaultCoordinates;
  }, [elements, scrollCoordinates]);
}
function useScrollOffsetsDelta(scrollOffsets, dependencies) {
  if (dependencies === void 0) {
    dependencies = [];
  }
  const initialScrollOffsets = useRef(null);
  useEffect(
    () => {
      initialScrollOffsets.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );
  useEffect(() => {
    const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
    if (hasScrollOffsets && !initialScrollOffsets.current) {
      initialScrollOffsets.current = scrollOffsets;
    }
    if (!hasScrollOffsets && initialScrollOffsets.current) {
      initialScrollOffsets.current = null;
    }
  }, [scrollOffsets]);
  return initialScrollOffsets.current ? subtract(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}
function useSensorSetup(sensors) {
  useEffect(
    () => {
      if (!canUseDOM) {
        return;
      }
      const teardownFns = sensors.map((_ref) => {
        let {
          sensor
        } = _ref;
        return sensor.setup == null ? void 0 : sensor.setup();
      });
      return () => {
        for (const teardown of teardownFns) {
          teardown == null ? void 0 : teardown();
        }
      };
    },
    // TO-DO: Sensors length could theoretically change which would not be a valid dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    sensors.map((_ref2) => {
      let {
        sensor
      } = _ref2;
      return sensor;
    })
  );
}
function useSyntheticListeners(listeners, id) {
  return useMemo(() => {
    return listeners.reduce((acc, _ref) => {
      let {
        eventName,
        handler
      } = _ref;
      acc[eventName] = (event) => {
        handler(event, id);
      };
      return acc;
    }, {});
  }, [listeners, id]);
}
function useWindowRect(element) {
  return useMemo(() => element ? getWindowClientRect(element) : null, [element]);
}
var defaultValue$2 = [];
function useRects(elements, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }
  const [firstElement] = elements;
  const windowRect = useWindowRect(firstElement ? getWindow(firstElement) : null);
  const [rects, setRects] = useState(defaultValue$2);
  function measureRects() {
    setRects(() => {
      if (!elements.length) {
        return defaultValue$2;
      }
      return elements.map((element) => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
    });
  }
  const resizeObserver = useResizeObserver({
    callback: measureRects
  });
  useIsomorphicLayoutEffect(() => {
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    measureRects();
    elements.forEach((element) => resizeObserver == null ? void 0 : resizeObserver.observe(element));
  }, [elements]);
  return rects;
}
function getMeasurableNode(node) {
  if (!node) {
    return null;
  }
  if (node.children.length > 1) {
    return node;
  }
  const firstChild = node.children[0];
  return isHTMLElement(firstChild) ? firstChild : node;
}
function useDragOverlayMeasuring(_ref) {
  let {
    measure
  } = _ref;
  const [rect, setRect] = useState(null);
  const handleResize = useCallback((entries) => {
    for (const {
      target
    } of entries) {
      if (isHTMLElement(target)) {
        setRect((rect2) => {
          const newRect = measure(target);
          return rect2 ? {
            ...rect2,
            width: newRect.width,
            height: newRect.height
          } : newRect;
        });
        break;
      }
    }
  }, [measure]);
  const resizeObserver = useResizeObserver({
    callback: handleResize
  });
  const handleNodeChange = useCallback((element) => {
    const node = getMeasurableNode(element);
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    if (node) {
      resizeObserver == null ? void 0 : resizeObserver.observe(node);
    }
    setRect(node ? measure(node) : null);
  }, [measure, resizeObserver]);
  const [nodeRef, setRef] = useNodeRef(handleNodeChange);
  return useMemo(() => ({
    nodeRef,
    rect,
    setRef
  }), [rect, nodeRef, setRef]);
}
var defaultSensors = [{
  sensor: PointerSensor,
  options: {}
}, {
  sensor: KeyboardSensor,
  options: {}
}];
var defaultData = {
  current: {}
};
var defaultMeasuringConfiguration = {
  draggable: {
    measure: getTransformAgnosticClientRect
  },
  droppable: {
    measure: getTransformAgnosticClientRect,
    strategy: MeasuringStrategy.WhileDragging,
    frequency: MeasuringFrequency.Optimized
  },
  dragOverlay: {
    measure: getClientRect
  }
};
var DroppableContainersMap = class extends Map {
  get(id) {
    var _super$get;
    return id != null ? (_super$get = super.get(id)) != null ? _super$get : void 0 : void 0;
  }
  toArray() {
    return Array.from(this.values());
  }
  getEnabled() {
    return this.toArray().filter((_ref) => {
      let {
        disabled
      } = _ref;
      return !disabled;
    });
  }
  getNodeFor(id) {
    var _this$get$node$curren, _this$get;
    return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : void 0;
  }
};
var defaultPublicContext = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: /* @__PURE__ */ new Map(),
  droppableRects: /* @__PURE__ */ new Map(),
  droppableContainers: /* @__PURE__ */ new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: noop
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: defaultMeasuringConfiguration,
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false
};
var defaultInternalContext = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: ""
  },
  dispatch: noop,
  draggableNodes: /* @__PURE__ */ new Map(),
  over: null,
  measureDroppableContainers: noop
};
var InternalContext = /* @__PURE__ */ createContext(defaultInternalContext);
var PublicContext = /* @__PURE__ */ createContext(defaultPublicContext);
function getInitialState() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: /* @__PURE__ */ new Map(),
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new DroppableContainersMap()
    }
  };
}
function reducer(state, action) {
  switch (action.type) {
    case Action.DragStart:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          initialCoordinates: action.initialCoordinates,
          active: action.active
        }
      };
    case Action.DragMove:
      if (state.draggable.active == null) {
        return state;
      }
      return {
        ...state,
        draggable: {
          ...state.draggable,
          translate: {
            x: action.coordinates.x - state.draggable.initialCoordinates.x,
            y: action.coordinates.y - state.draggable.initialCoordinates.y
          }
        }
      };
    case Action.DragEnd:
    case Action.DragCancel:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };
    case Action.RegisterDroppable: {
      const {
        element
      } = action;
      const {
        id
      } = element;
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, element);
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    case Action.SetDroppableDisabled: {
      const {
        id,
        key,
        disabled
      } = action;
      const element = state.droppable.containers.get(id);
      if (!element || key !== element.key) {
        return state;
      }
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, {
        ...element,
        disabled
      });
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    case Action.UnregisterDroppable: {
      const {
        id,
        key
      } = action;
      const element = state.droppable.containers.get(id);
      if (!element || key !== element.key) {
        return state;
      }
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.delete(id);
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    default: {
      return state;
    }
  }
}
function RestoreFocus(_ref) {
  let {
    disabled
  } = _ref;
  const {
    active,
    activatorEvent,
    draggableNodes
  } = useContext(InternalContext);
  const previousActivatorEvent = usePrevious(activatorEvent);
  const previousActiveId = usePrevious(active == null ? void 0 : active.id);
  useEffect(() => {
    if (disabled) {
      return;
    }
    if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
      if (!isKeyboardEvent(previousActivatorEvent)) {
        return;
      }
      if (document.activeElement === previousActivatorEvent.target) {
        return;
      }
      const draggableNode = draggableNodes.get(previousActiveId);
      if (!draggableNode) {
        return;
      }
      const {
        activatorNode,
        node
      } = draggableNode;
      if (!activatorNode.current && !node.current) {
        return;
      }
      requestAnimationFrame(() => {
        for (const element of [activatorNode.current, node.current]) {
          if (!element) {
            continue;
          }
          const focusableNode = findFirstFocusableNode(element);
          if (focusableNode) {
            focusableNode.focus();
            break;
          }
        }
      });
    }
  }, [activatorEvent, disabled, draggableNodes, previousActiveId, previousActivatorEvent]);
  return null;
}
function applyModifiers(modifiers, _ref) {
  let {
    transform,
    ...args
  } = _ref;
  return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
    return modifier({
      transform: accumulator,
      ...args
    });
  }, transform) : transform;
}
function useMeasuringConfiguration(config) {
  return useMemo(
    () => ({
      draggable: {
        ...defaultMeasuringConfiguration.draggable,
        ...config == null ? void 0 : config.draggable
      },
      droppable: {
        ...defaultMeasuringConfiguration.droppable,
        ...config == null ? void 0 : config.droppable
      },
      dragOverlay: {
        ...defaultMeasuringConfiguration.dragOverlay,
        ...config == null ? void 0 : config.dragOverlay
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config == null ? void 0 : config.draggable, config == null ? void 0 : config.droppable, config == null ? void 0 : config.dragOverlay]
  );
}
function useLayoutShiftScrollCompensation(_ref) {
  let {
    activeNode,
    measure,
    initialRect,
    config = true
  } = _ref;
  const initialized = useRef(false);
  const {
    x,
    y
  } = typeof config === "boolean" ? {
    x: config,
    y: config
  } : config;
  useIsomorphicLayoutEffect(() => {
    const disabled = !x && !y;
    if (disabled || !activeNode) {
      initialized.current = false;
      return;
    }
    if (initialized.current || !initialRect) {
      return;
    }
    const node = activeNode == null ? void 0 : activeNode.node.current;
    if (!node || node.isConnected === false) {
      return;
    }
    const rect = measure(node);
    const rectDelta = getRectDelta(rect, initialRect);
    if (!x) {
      rectDelta.x = 0;
    }
    if (!y) {
      rectDelta.y = 0;
    }
    initialized.current = true;
    if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
      const firstScrollableAncestor = getFirstScrollableAncestor(node);
      if (firstScrollableAncestor) {
        firstScrollableAncestor.scrollBy({
          top: rectDelta.y,
          left: rectDelta.x
        });
      }
    }
  }, [activeNode, x, y, initialRect, measure]);
}
var ActiveDraggableContext = /* @__PURE__ */ createContext({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1
});
var Status;
(function(Status2) {
  Status2[Status2["Uninitialized"] = 0] = "Uninitialized";
  Status2[Status2["Initializing"] = 1] = "Initializing";
  Status2[Status2["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));
var DndContext = /* @__PURE__ */ memo(function DndContext2(_ref) {
  var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
  let {
    id,
    accessibility,
    autoScroll = true,
    children,
    sensors = defaultSensors,
    collisionDetection = rectIntersection,
    measuring,
    modifiers,
    ...props
  } = _ref;
  const store = useReducer(reducer, void 0, getInitialState);
  const [state, dispatch] = store;
  const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
  const [status, setStatus] = useState(Status.Uninitialized);
  const isInitialized = status === Status.Initialized;
  const {
    draggable: {
      active: activeId,
      nodes: draggableNodes,
      translate
    },
    droppable: {
      containers: droppableContainers
    }
  } = state;
  const node = activeId != null ? draggableNodes.get(activeId) : null;
  const activeRects = useRef({
    initial: null,
    translated: null
  });
  const active = useMemo(() => {
    var _node$data;
    return activeId != null ? {
      id: activeId,
      // It's possible for the active node to unmount while dragging
      data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
      rect: activeRects
    } : null;
  }, [activeId, node]);
  const activeRef = useRef(null);
  const [activeSensor, setActiveSensor] = useState(null);
  const [activatorEvent, setActivatorEvent] = useState(null);
  const latestProps = useLatestValue(props, Object.values(props));
  const draggableDescribedById = useUniqueId("DndDescribedBy", id);
  const enabledDroppableContainers = useMemo(() => droppableContainers.getEnabled(), [droppableContainers]);
  const measuringConfiguration = useMeasuringConfiguration(measuring);
  const {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled
  } = useDroppableMeasuring(enabledDroppableContainers, {
    dragging: isInitialized,
    dependencies: [translate.x, translate.y],
    config: measuringConfiguration.droppable
  });
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = useMemo(() => activatorEvent ? getEventCoordinates(activatorEvent) : null, [activatorEvent]);
  const autoScrollOptions = getAutoScrollerOptions();
  const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
  useLayoutShiftScrollCompensation({
    activeNode: activeId != null ? draggableNodes.get(activeId) : null,
    config: autoScrollOptions.layoutShiftCompensation,
    initialRect: initialActiveNodeRect,
    measure: measuringConfiguration.draggable.measure
  });
  const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
  const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
  const sensorContext = useRef({
    activatorEvent: null,
    active: null,
    activeNode,
    collisionRect: null,
    collisions: null,
    droppableRects,
    draggableNodes,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null
  });
  const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
  const dragOverlay = useDragOverlayMeasuring({
    measure: measuringConfiguration.dragOverlay.measure
  });
  const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
  const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
  const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect);
  const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);
  const windowRect = useWindowRect(draggingNode ? getWindow(draggingNode) : null);
  const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
  const scrollableAncestorRects = useRects(scrollableAncestors);
  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect,
    over: sensorContext.current.over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  });
  const pointerCoordinates = activationCoordinates ? add(activationCoordinates, translate) : null;
  const scrollOffsets = useScrollOffsets(scrollableAncestors);
  const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
  const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
  const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);
  const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
  const collisions = active && collisionRect ? collisionDetection({
    active,
    collisionRect,
    droppableRects,
    droppableContainers: enabledDroppableContainers,
    pointerCoordinates
  }) : null;
  const overId = getFirstCollision(collisions, "id");
  const [over, setOver] = useState(null);
  const appliedTranslate = usesDragOverlay ? modifiedTranslate : add(modifiedTranslate, activeNodeScrollDelta);
  const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
  const activeSensorRef = useRef(null);
  const instantiateSensor = useCallback(
    (event, _ref2) => {
      let {
        sensor: Sensor,
        options
      } = _ref2;
      if (activeRef.current == null) {
        return;
      }
      const activeNode2 = draggableNodes.get(activeRef.current);
      if (!activeNode2) {
        return;
      }
      const activatorEvent2 = event.nativeEvent;
      const sensorInstance = new Sensor({
        active: activeRef.current,
        activeNode: activeNode2,
        event: activatorEvent2,
        options,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: sensorContext,
        onAbort(id2) {
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragAbort
          } = latestProps.current;
          const event2 = {
            id: id2
          };
          onDragAbort == null ? void 0 : onDragAbort(event2);
          dispatchMonitorEvent({
            type: "onDragAbort",
            event: event2
          });
        },
        onPending(id2, constraint, initialCoordinates, offset) {
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragPending
          } = latestProps.current;
          const event2 = {
            id: id2,
            constraint,
            initialCoordinates,
            offset
          };
          onDragPending == null ? void 0 : onDragPending(event2);
          dispatchMonitorEvent({
            type: "onDragPending",
            event: event2
          });
        },
        onStart(initialCoordinates) {
          const id2 = activeRef.current;
          if (id2 == null) {
            return;
          }
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragStart
          } = latestProps.current;
          const event2 = {
            activatorEvent: activatorEvent2,
            active: {
              id: id2,
              data: draggableNode.data,
              rect: activeRects
            }
          };
          unstable_batchedUpdates(() => {
            onDragStart == null ? void 0 : onDragStart(event2);
            setStatus(Status.Initializing);
            dispatch({
              type: Action.DragStart,
              initialCoordinates,
              active: id2
            });
            dispatchMonitorEvent({
              type: "onDragStart",
              event: event2
            });
            setActiveSensor(activeSensorRef.current);
            setActivatorEvent(activatorEvent2);
          });
        },
        onMove(coordinates) {
          dispatch({
            type: Action.DragMove,
            coordinates
          });
        },
        onEnd: createHandler(Action.DragEnd),
        onCancel: createHandler(Action.DragCancel)
      });
      activeSensorRef.current = sensorInstance;
      function createHandler(type) {
        return async function handler() {
          const {
            active: active2,
            collisions: collisions2,
            over: over2,
            scrollAdjustedTranslate: scrollAdjustedTranslate2
          } = sensorContext.current;
          let event2 = null;
          if (active2 && scrollAdjustedTranslate2) {
            const {
              cancelDrop
            } = latestProps.current;
            event2 = {
              activatorEvent: activatorEvent2,
              active: active2,
              collisions: collisions2,
              delta: scrollAdjustedTranslate2,
              over: over2
            };
            if (type === Action.DragEnd && typeof cancelDrop === "function") {
              const shouldCancel = await Promise.resolve(cancelDrop(event2));
              if (shouldCancel) {
                type = Action.DragCancel;
              }
            }
          }
          activeRef.current = null;
          unstable_batchedUpdates(() => {
            dispatch({
              type
            });
            setStatus(Status.Uninitialized);
            setOver(null);
            setActiveSensor(null);
            setActivatorEvent(null);
            activeSensorRef.current = null;
            const eventName = type === Action.DragEnd ? "onDragEnd" : "onDragCancel";
            if (event2) {
              const handler2 = latestProps.current[eventName];
              handler2 == null ? void 0 : handler2(event2);
              dispatchMonitorEvent({
                type: eventName,
                event: event2
              });
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes]
  );
  const bindActivatorToSensorInstantiator = useCallback((handler, sensor) => {
    return (event, active2) => {
      const nativeEvent = event.nativeEvent;
      const activeDraggableNode = draggableNodes.get(active2);
      if (
        // Another sensor is already instantiating
        activeRef.current !== null || // No active draggable
        !activeDraggableNode || // Event has already been captured
        nativeEvent.dndKit || nativeEvent.defaultPrevented
      ) {
        return;
      }
      const activationContext = {
        active: activeDraggableNode
      };
      const shouldActivate = handler(event, sensor.options, activationContext);
      if (shouldActivate === true) {
        nativeEvent.dndKit = {
          capturedBy: sensor.sensor
        };
        activeRef.current = active2;
        instantiateSensor(event, sensor);
      }
    };
  }, [draggableNodes, instantiateSensor]);
  const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
  useSensorSetup(sensors);
  useIsomorphicLayoutEffect(() => {
    if (activeNodeRect && status === Status.Initializing) {
      setStatus(Status.Initialized);
    }
  }, [activeNodeRect, status]);
  useEffect(
    () => {
      const {
        onDragMove
      } = latestProps.current;
      const {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        over: over2
      } = sensorContext.current;
      if (!active2 || !activatorEvent2) {
        return;
      }
      const event = {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y
        },
        over: over2
      };
      unstable_batchedUpdates(() => {
        onDragMove == null ? void 0 : onDragMove(event);
        dispatchMonitorEvent({
          type: "onDragMove",
          event
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]
  );
  useEffect(
    () => {
      const {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        droppableContainers: droppableContainers2,
        scrollAdjustedTranslate: scrollAdjustedTranslate2
      } = sensorContext.current;
      if (!active2 || activeRef.current == null || !activatorEvent2 || !scrollAdjustedTranslate2) {
        return;
      }
      const {
        onDragOver
      } = latestProps.current;
      const overContainer = droppableContainers2.get(overId);
      const over2 = overContainer && overContainer.rect.current ? {
        id: overContainer.id,
        rect: overContainer.rect.current,
        data: overContainer.data,
        disabled: overContainer.disabled
      } : null;
      const event = {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        delta: {
          x: scrollAdjustedTranslate2.x,
          y: scrollAdjustedTranslate2.y
        },
        over: over2
      };
      unstable_batchedUpdates(() => {
        setOver(over2);
        onDragOver == null ? void 0 : onDragOver(event);
        dispatchMonitorEvent({
          type: "onDragOver",
          event
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overId]
  );
  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      activatorEvent,
      active,
      activeNode,
      collisionRect,
      collisions,
      droppableRects,
      draggableNodes,
      draggingNode,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate
    };
    activeRects.current = {
      initial: draggingNodeRect,
      translated: collisionRect
    };
  }, [active, activeNode, collisions, collisionRect, draggableNodes, draggingNode, draggingNodeRect, droppableRects, droppableContainers, over, scrollableAncestors, scrollAdjustedTranslate]);
  useAutoScroller({
    ...autoScrollOptions,
    delta: translate,
    draggingRect: collisionRect,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects
  });
  const publicContext = useMemo(() => {
    const context = {
      active,
      activeNode,
      activeNodeRect,
      activatorEvent,
      collisions,
      containerNodeRect,
      dragOverlay,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      measureDroppableContainers,
      scrollableAncestors,
      scrollableAncestorRects,
      measuringConfiguration,
      measuringScheduled,
      windowRect
    };
    return context;
  }, [active, activeNode, activeNodeRect, activatorEvent, collisions, containerNodeRect, dragOverlay, draggableNodes, droppableContainers, droppableRects, over, measureDroppableContainers, scrollableAncestors, scrollableAncestorRects, measuringConfiguration, measuringScheduled, windowRect]);
  const internalContext = useMemo(() => {
    const context = {
      activatorEvent,
      activators,
      active,
      activeNodeRect,
      ariaDescribedById: {
        draggable: draggableDescribedById
      },
      dispatch,
      draggableNodes,
      over,
      measureDroppableContainers
    };
    return context;
  }, [activatorEvent, activators, active, activeNodeRect, dispatch, draggableDescribedById, draggableNodes, over, measureDroppableContainers]);
  return React2.createElement(DndMonitorContext.Provider, {
    value: registerMonitorListener
  }, React2.createElement(InternalContext.Provider, {
    value: internalContext
  }, React2.createElement(PublicContext.Provider, {
    value: publicContext
  }, React2.createElement(ActiveDraggableContext.Provider, {
    value: transform
  }, children)), React2.createElement(RestoreFocus, {
    disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
  })), React2.createElement(Accessibility, {
    ...accessibility,
    hiddenTextDescribedById: draggableDescribedById
  }));
  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
    const autoScrollGloballyDisabled = typeof autoScroll === "object" ? autoScroll.enabled === false : autoScroll === false;
    const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
    if (typeof autoScroll === "object") {
      return {
        ...autoScroll,
        enabled
      };
    }
    return {
      enabled
    };
  }
});
var NullContext = /* @__PURE__ */ createContext(null);
var defaultRole = "button";
var ID_PREFIX = "Draggable";
function useDraggable(_ref) {
  let {
    id,
    data,
    disabled = false,
    attributes
  } = _ref;
  const key = useUniqueId(ID_PREFIX);
  const {
    activators,
    activatorEvent,
    active,
    activeNodeRect,
    ariaDescribedById,
    draggableNodes,
    over
  } = useContext(InternalContext);
  const {
    role = defaultRole,
    roleDescription = "draggable",
    tabIndex = 0
  } = attributes != null ? attributes : {};
  const isDragging = (active == null ? void 0 : active.id) === id;
  const transform = useContext(isDragging ? ActiveDraggableContext : NullContext);
  const [node, setNodeRef] = useNodeRef();
  const [activatorNode, setActivatorNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useLatestValue(data);
  useIsomorphicLayoutEffect(
    () => {
      draggableNodes.set(id, {
        id,
        key,
        node,
        activatorNode,
        data: dataRef
      });
      return () => {
        const node2 = draggableNodes.get(id);
        if (node2 && node2.key === key) {
          draggableNodes.delete(id);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );
  const memoizedAttributes = useMemo(() => ({
    role,
    tabIndex,
    "aria-disabled": disabled,
    "aria-pressed": isDragging && role === defaultRole ? true : void 0,
    "aria-roledescription": roleDescription,
    "aria-describedby": ariaDescribedById.draggable
  }), [disabled, role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]);
  return {
    active,
    activatorEvent,
    activeNodeRect,
    attributes: memoizedAttributes,
    isDragging,
    listeners: disabled ? void 0 : listeners,
    node,
    over,
    setNodeRef,
    setActivatorNodeRef,
    transform
  };
}
function useDndContext() {
  return useContext(PublicContext);
}
var ID_PREFIX$1 = "Droppable";
var defaultResizeObserverConfig = {
  timeout: 25
};
function useDroppable(_ref) {
  let {
    data,
    disabled = false,
    id,
    resizeObserverConfig
  } = _ref;
  const key = useUniqueId(ID_PREFIX$1);
  const {
    active,
    dispatch,
    over,
    measureDroppableContainers
  } = useContext(InternalContext);
  const previous = useRef({
    disabled
  });
  const resizeObserverConnected = useRef(false);
  const rect = useRef(null);
  const callbackId = useRef(null);
  const {
    disabled: resizeObserverDisabled,
    updateMeasurementsFor,
    timeout: resizeObserverTimeout
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig
  };
  const ids2 = useLatestValue(updateMeasurementsFor != null ? updateMeasurementsFor : id);
  const handleResize = useCallback(
    () => {
      if (!resizeObserverConnected.current) {
        resizeObserverConnected.current = true;
        return;
      }
      if (callbackId.current != null) {
        clearTimeout(callbackId.current);
      }
      callbackId.current = setTimeout(() => {
        measureDroppableContainers(Array.isArray(ids2.current) ? ids2.current : [ids2.current]);
        callbackId.current = null;
      }, resizeObserverTimeout);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [resizeObserverTimeout]
  );
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    disabled: resizeObserverDisabled || !active
  });
  const handleNodeChange = useCallback((newElement, previousElement) => {
    if (!resizeObserver) {
      return;
    }
    if (previousElement) {
      resizeObserver.unobserve(previousElement);
      resizeObserverConnected.current = false;
    }
    if (newElement) {
      resizeObserver.observe(newElement);
    }
  }, [resizeObserver]);
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(data);
  useEffect(() => {
    if (!resizeObserver || !nodeRef.current) {
      return;
    }
    resizeObserver.disconnect();
    resizeObserverConnected.current = false;
    resizeObserver.observe(nodeRef.current);
  }, [nodeRef, resizeObserver]);
  useEffect(
    () => {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          key,
          disabled,
          node: nodeRef,
          rect,
          data: dataRef
        }
      });
      return () => dispatch({
        type: Action.UnregisterDroppable,
        key,
        id
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );
  useEffect(() => {
    if (disabled !== previous.current.disabled) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled
      });
      previous.current.disabled = disabled;
    }
  }, [id, key, disabled, dispatch]);
  return {
    active,
    rect,
    isOver: (over == null ? void 0 : over.id) === id,
    node: nodeRef,
    over,
    setNodeRef
  };
}
function arrayMove(array, from, to) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}
function getSortedRects(items, rects) {
  return items.reduce((accumulator, id, index) => {
    const rect = rects.get(id);
    if (rect) {
      accumulator[index] = rect;
    }
    return accumulator;
  }, Array(items.length));
}
function isValidIndex(index) {
  return index !== null && index >= 0;
}
function itemsEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
function normalizeDisabled(disabled) {
  if (typeof disabled === "boolean") {
    return {
      draggable: disabled,
      droppable: disabled
    };
  }
  return disabled;
}
var defaultScale = {
  scaleX: 1,
  scaleY: 1
};
var horizontalListSortingStrategy = (_ref) => {
  var _rects$activeIndex;
  let {
    rects,
    activeNodeRect: fallbackActiveRect,
    activeIndex,
    overIndex,
    index
  } = _ref;
  const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
  if (!activeNodeRect) {
    return null;
  }
  const itemGap = getItemGap(rects, index, activeIndex);
  if (index === activeIndex) {
    const newIndexRect = rects[overIndex];
    if (!newIndexRect) {
      return null;
    }
    return {
      x: activeIndex < overIndex ? newIndexRect.left + newIndexRect.width - (activeNodeRect.left + activeNodeRect.width) : newIndexRect.left - activeNodeRect.left,
      y: 0,
      ...defaultScale
    };
  }
  if (index > activeIndex && index <= overIndex) {
    return {
      x: -activeNodeRect.width - itemGap,
      y: 0,
      ...defaultScale
    };
  }
  if (index < activeIndex && index >= overIndex) {
    return {
      x: activeNodeRect.width + itemGap,
      y: 0,
      ...defaultScale
    };
  }
  return {
    x: 0,
    y: 0,
    ...defaultScale
  };
};
function getItemGap(rects, index, activeIndex) {
  const currentRect = rects[index];
  const previousRect = rects[index - 1];
  const nextRect = rects[index + 1];
  if (!currentRect || !previousRect && !nextRect) {
    return 0;
  }
  if (activeIndex < index) {
    return previousRect ? currentRect.left - (previousRect.left + previousRect.width) : nextRect.left - (currentRect.left + currentRect.width);
  }
  return nextRect ? nextRect.left - (currentRect.left + currentRect.width) : currentRect.left - (previousRect.left + previousRect.width);
}
var rectSortingStrategy = (_ref) => {
  let {
    rects,
    activeIndex,
    overIndex,
    index
  } = _ref;
  const newRects = arrayMove(rects, overIndex, activeIndex);
  const oldRect = rects[index];
  const newRect = newRects[index];
  if (!newRect || !oldRect) {
    return null;
  }
  return {
    x: newRect.left - oldRect.left,
    y: newRect.top - oldRect.top,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height
  };
};
var defaultScale$1 = {
  scaleX: 1,
  scaleY: 1
};
var verticalListSortingStrategy = (_ref) => {
  var _rects$activeIndex;
  let {
    activeIndex,
    activeNodeRect: fallbackActiveRect,
    index,
    rects,
    overIndex
  } = _ref;
  const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
  if (!activeNodeRect) {
    return null;
  }
  if (index === activeIndex) {
    const overIndexRect = rects[overIndex];
    if (!overIndexRect) {
      return null;
    }
    return {
      x: 0,
      y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
      ...defaultScale$1
    };
  }
  const itemGap = getItemGap$1(rects, index, activeIndex);
  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeNodeRect.height - itemGap,
      ...defaultScale$1
    };
  }
  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeNodeRect.height + itemGap,
      ...defaultScale$1
    };
  }
  return {
    x: 0,
    y: 0,
    ...defaultScale$1
  };
};
function getItemGap$1(clientRects, index, activeIndex) {
  const currentRect = clientRects[index];
  const previousRect = clientRects[index - 1];
  const nextRect = clientRects[index + 1];
  if (!currentRect) {
    return 0;
  }
  if (activeIndex < index) {
    return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
  }
  return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
}
var ID_PREFIX2 = "Sortable";
var Context = /* @__PURE__ */ React2.createContext({
  activeIndex: -1,
  containerId: ID_PREFIX2,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
  disabled: {
    draggable: false,
    droppable: false
  }
});
function SortableContext(_ref) {
  let {
    children,
    id,
    items: userDefinedItems,
    strategy = rectSortingStrategy,
    disabled: disabledProp = false
  } = _ref;
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX2, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = useMemo(() => userDefinedItems.map((item) => typeof item === "object" && "id" in item ? item.id : item), [userDefinedItems]);
  const isDragging = active != null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = useRef(items);
  const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
  const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
  const disabled = normalizeDisabled(disabledProp);
  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging) {
      measureDroppableContainers(items);
    }
  }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);
  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);
  const contextValue = useMemo(
    () => ({
      activeIndex,
      containerId,
      disabled,
      disableTransforms,
      items,
      overIndex,
      useDragOverlay,
      sortedRects: getSortedRects(items, droppableRects),
      strategy
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex, containerId, disabled.draggable, disabled.droppable, disableTransforms, items, overIndex, droppableRects, useDragOverlay, strategy]
  );
  return React2.createElement(Context.Provider, {
    value: contextValue
  }, children);
}
var defaultNewIndexGetter = (_ref) => {
  let {
    id,
    items,
    activeIndex,
    overIndex
  } = _ref;
  return arrayMove(items, activeIndex, overIndex).indexOf(id);
};
var defaultAnimateLayoutChanges = (_ref2) => {
  let {
    containerId,
    isSorting,
    wasDragging,
    index,
    items,
    newIndex,
    previousItems,
    previousContainerId,
    transition
  } = _ref2;
  if (!transition || !wasDragging) {
    return false;
  }
  if (previousItems !== items && index === newIndex) {
    return false;
  }
  if (isSorting) {
    return true;
  }
  return newIndex !== index && containerId === previousContainerId;
};
var defaultTransition = {
  duration: 200,
  easing: "ease"
};
var transitionProperty = "transform";
var disabledTransition = /* @__PURE__ */ CSS.Transition.toString({
  property: transitionProperty,
  duration: 0,
  easing: "linear"
});
var defaultAttributes = {
  roleDescription: "sortable"
};
function useDerivedTransform(_ref) {
  let {
    disabled,
    index,
    node,
    rect
  } = _ref;
  const [derivedTransform, setDerivedtransform] = useState(null);
  const previousIndex = useRef(index);
  useIsomorphicLayoutEffect(() => {
    if (!disabled && index !== previousIndex.current && node.current) {
      const initial = rect.current;
      if (initial) {
        const current = getClientRect(node.current, {
          ignoreTransform: true
        });
        const delta = {
          x: initial.left - current.left,
          y: initial.top - current.top,
          scaleX: initial.width / current.width,
          scaleY: initial.height / current.height
        };
        if (delta.x || delta.y) {
          setDerivedtransform(delta);
        }
      }
    }
    if (index !== previousIndex.current) {
      previousIndex.current = index;
    }
  }, [disabled, index, node, rect]);
  useEffect(() => {
    if (derivedTransform) {
      setDerivedtransform(null);
    }
  }, [derivedTransform]);
  return derivedTransform;
}
function useSortable(_ref) {
  let {
    animateLayoutChanges = defaultAnimateLayoutChanges,
    attributes: userDefinedAttributes,
    disabled: localDisabled,
    data: customData,
    getNewIndex = defaultNewIndexGetter,
    id,
    strategy: localStrategy,
    resizeObserverConfig,
    transition = defaultTransition
  } = _ref;
  const {
    items,
    containerId,
    activeIndex,
    disabled: globalDisabled,
    disableTransforms,
    sortedRects,
    overIndex,
    useDragOverlay,
    strategy: globalStrategy
  } = useContext(Context);
  const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
  const index = items.indexOf(id);
  const data = useMemo(() => ({
    sortable: {
      containerId,
      index,
      items
    },
    ...customData
  }), [containerId, customData, index, items]);
  const itemsAfterCurrentSortable = useMemo(() => items.slice(items.indexOf(id)), [items, id]);
  const {
    rect,
    node,
    isOver,
    setNodeRef: setDroppableNodeRef
  } = useDroppable({
    id,
    data,
    disabled: disabled.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: itemsAfterCurrentSortable,
      ...resizeObserverConfig
    }
  });
  const {
    active,
    activatorEvent,
    activeNodeRect,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    over,
    setActivatorNodeRef,
    transform
  } = useDraggable({
    id,
    data,
    attributes: {
      ...defaultAttributes,
      ...userDefinedAttributes
    },
    disabled: disabled.draggable
  });
  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = Boolean(active);
  const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
  const shouldDisplaceDragSource = !useDragOverlay && isDragging;
  const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
  const strategy = localStrategy != null ? localStrategy : globalStrategy;
  const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
    rects: sortedRects,
    activeNodeRect,
    activeIndex,
    overIndex,
    index
  }) : null;
  const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
    id,
    items,
    activeIndex,
    overIndex
  }) : index;
  const activeId = active == null ? void 0 : active.id;
  const previous = useRef({
    activeId,
    items,
    newIndex,
    containerId
  });
  const itemsHaveChanged = items !== previous.current.items;
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: previous.current.newIndex,
    previousItems: previous.current.items,
    previousContainerId: previous.current.containerId,
    transition,
    wasDragging: previous.current.activeId != null
  });
  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect
  });
  useEffect(() => {
    if (isSorting && previous.current.newIndex !== newIndex) {
      previous.current.newIndex = newIndex;
    }
    if (containerId !== previous.current.containerId) {
      previous.current.containerId = containerId;
    }
    if (items !== previous.current.items) {
      previous.current.items = items;
    }
  }, [isSorting, newIndex, containerId, items]);
  useEffect(() => {
    if (activeId === previous.current.activeId) {
      return;
    }
    if (activeId && !previous.current.activeId) {
      previous.current.activeId = activeId;
      return;
    }
    const timeoutId = setTimeout(() => {
      previous.current.activeId = activeId;
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [activeId]);
  return {
    active,
    activeIndex,
    attributes,
    data,
    rect,
    index,
    newIndex,
    items,
    isOver,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
    over,
    setNodeRef,
    setActivatorNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform != null ? derivedTransform : finalTransform,
    transition: getTransition()
  };
  function getTransition() {
    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
      itemsHaveChanged && previous.current.newIndex === index
    ) {
      return disabledTransition;
    }
    if (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent) || !transition) {
      return void 0;
    }
    if (isSorting || shouldAnimateLayoutChanges) {
      return CSS.Transition.toString({
        ...transition,
        property: transitionProperty
      });
    }
    return void 0;
  }
}
function normalizeLocalDisabled(localDisabled, globalDisabled) {
  var _localDisabled$dragga, _localDisabled$droppa;
  if (typeof localDisabled === "boolean") {
    return {
      draggable: localDisabled,
      // Backwards compatibility
      droppable: false
    };
  }
  return {
    draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
    droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
  };
}
[KeyboardCode.Down, KeyboardCode.Right, KeyboardCode.Up, KeyboardCode.Left];
var ROW = "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-white/[0.06]";
var CollapsedRailContextMenu = memo(function CollapsedRailContextMenu2({
  anchor,
  onClose,
  onExpand,
  onClosePane,
  onBeginMove
}) {
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const panelRef = useRef(null);
  useEffect(() => {
    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      onClose();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [onClose]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!portalTarget) return null;
  const { paneId, paneLabel } = anchor;
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: panelRef,
        role: "menu",
        "aria-label": `${paneLabel} collapsed pane`,
        className: "pointer-events-auto fixed z-[600] min-w-[11rem] animate-in fade-in zoom-in-95 overflow-hidden rounded-md border border-white/10 bg-bg-header/95 py-1 shadow-2xl shadow-black/80 backdrop-blur-xl duration-100",
        style: { top: anchor.y, left: anchor.x },
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsx("div", { className: "px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-tertiary", children: paneLabel }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: ROW,
              onClick: () => {
                onExpand(paneId);
                onClose();
              },
              children: [
                /* @__PURE__ */ jsx(Maximize2, { size: 12, className: "shrink-0 opacity-70" }),
                "Expand"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: cn(ROW, "text-tertiary hover:text-primary"),
              onClick: () => {
                onBeginMove(paneId);
                onClose();
              },
              children: [
                /* @__PURE__ */ jsx(Move, { size: 12, className: "shrink-0 opacity-70" }),
                "Move pane\u2026"
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "mx-2 my-1 border-t border-white/8", role: "separator" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              role: "menuitem",
              className: cn(ROW, "text-red-300/90 hover:bg-red-500/10 hover:text-red-200"),
              onClick: () => {
                onClosePane(paneId);
                onClose();
              },
              children: [
                /* @__PURE__ */ jsx(X, { size: 12, className: "shrink-0 opacity-70" }),
                "Close pane"
              ]
            }
          )
        ]
      }
    ),
    portalTarget
  );
});
var RAIL_VERTICAL_CLASS = "flex w-[var(--workbench-rail-px,32px)] shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-white/8 bg-bg-header/60 py-1.5 select-none";
var RAIL_HORIZONTAL_CLASS = "flex h-[var(--workbench-rail-px,32px)] shrink-0 flex-row items-center gap-0.5 overflow-x-auto border-white/8 bg-bg-header/60 px-1.5 select-none";
function railBorderClass(edge) {
  switch (edge) {
    case "left":
      return "border-r";
    case "right":
      return "border-l";
    case "top":
      return "border-b";
    case "bottom":
      return "border-t";
  }
}
function SortableCollapsedTab({
  entry,
  registry,
  onExpand,
  onContextMenu,
  vertical,
  focused,
  reorderable
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: entry.id, disabled: !reorderable });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const info = registry[entry.editorType] ?? {
    icon: /* @__PURE__ */ jsx(HelpCircle, { size: 14 }),
    label: "Unknown"
  };
  const paneLabel = resolveWorkbenchPaneLabel(info);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: setNodeRef,
      style,
      className: cn(
        "flex flex-col items-center",
        isDragging && "z-10 opacity-60"
      ),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "flex items-center rounded transition-colors",
            vertical ? "flex-col" : "flex-row",
            focused ? "bg-blue-600/25 ring-1 ring-blue-500/40" : "hover:bg-white/10"
          ),
          children: [
            reorderable ? /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: cn(
                  "flex cursor-grab items-center justify-center text-tertiary active:cursor-grabbing",
                  vertical ? "h-4 w-7" : "h-7 w-4"
                ),
                "aria-label": "Drag to reorder collapsed pane",
                ...attributes,
                ...listeners,
                children: /* @__PURE__ */ jsx(
                  GripVertical,
                  {
                    size: 10,
                    className: vertical ? "rotate-0" : "rotate-90",
                    "aria-hidden": true
                  }
                )
              }
            ) : null,
            /* @__PURE__ */ jsxs(
              WorkbenchHintButton,
              {
                hint: `Expand ${paneLabel} \u2014 right-click for menu`,
                ariaLabel: `Expand ${paneLabel}`,
                className: cn(
                  "flex items-center justify-center rounded text-tertiary transition-colors hover:text-primary",
                  vertical ? "h-8 w-7 shrink-0" : "h-7 min-w-8 shrink-0 px-1"
                ),
                onClick: () => onExpand(entry.id),
                onContextMenu: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContextMenu(entry.id, paneLabel, e.clientX, e.clientY);
                },
                children: [
                  /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center", children: info.icon }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cn(
                        "max-w-[4.5rem] truncate text-[8px] font-bold uppercase tracking-wider",
                        vertical ? "sr-only" : "ml-0.5"
                      ),
                      children: paneLabel
                    }
                  )
                ]
              }
            )
          ]
        }
      )
    }
  );
}
var CollapsedPaneRail = memo(function CollapsedPaneRail2({
  panes,
  registry,
  onExpand,
  onClosePane,
  onBeginDockDrag,
  onReorder,
  stackSplitId,
  focusedPaneId
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const openContextMenu = useCallback(
    (paneId, paneLabel, clientX, clientY) => {
      setMenuAnchor({ x: clientX, y: clientY, paneId, paneLabel });
    },
    []
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const edge = panes[0]?.collapseEdge ?? "right";
  const vertical = edge === "left" || edge === "right";
  const reorderable = panes.length > 1 && Boolean(onReorder && stackSplitId);
  const paneIds = useMemo(() => panes.map((p) => p.id), [panes]);
  const handleDragEnd = (event) => {
    if (!reorderable || !stackSplitId || !onReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = paneIds.indexOf(String(active.id));
    const newIndex = paneIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(stackSplitId, arrayMove(paneIds, oldIndex, newIndex));
  };
  if (panes.length === 0) return null;
  const tabs = panes.map((entry, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
    index > 0 ? /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "bg-white/10",
          vertical ? "my-0.5 h-px w-5" : "mx-0.5 h-5 w-px"
        ),
        "aria-hidden": true
      }
    ) : null,
    /* @__PURE__ */ jsx(
      SortableCollapsedTab,
      {
        entry,
        registry,
        onExpand,
        onContextMenu: openContextMenu,
        vertical,
        focused: focusedPaneId === entry.id,
        reorderable
      }
    )
  ] }, entry.id));
  const body = /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        vertical ? RAIL_VERTICAL_CLASS : RAIL_HORIZONTAL_CLASS,
        railBorderClass(edge)
      ),
      role: "toolbar",
      "aria-label": "Collapsed panes",
      children: reorderable ? /* @__PURE__ */ jsx(
        SortableContext,
        {
          items: paneIds,
          strategy: vertical ? verticalListSortingStrategy : horizontalListSortingStrategy,
          children: tabs
        }
      ) : tabs
    }
  );
  const shell = /* @__PURE__ */ jsxs(Fragment, { children: [
    body,
    menuAnchor ? /* @__PURE__ */ jsx(
      CollapsedRailContextMenu,
      {
        anchor: menuAnchor,
        onClose: () => setMenuAnchor(null),
        onExpand,
        onClosePane,
        onBeginMove: onBeginDockDrag
      }
    ) : null
  ] });
  if (!reorderable) return shell;
  return /* @__PURE__ */ jsx(
    DndContext,
    {
      sensors,
      collisionDetection: closestCenter,
      onDragEnd: handleDragEnd,
      children: shell
    }
  );
});
var TRNWorkbench = memo(
  forwardRef(function TRNWorkbench2({
    layout,
    registry,
    onLayoutChange,
    activePaneId = null,
    collapsedRailFocusId = null,
    onPaneActivate,
    onClosePane,
    onTogglePaneMaximize,
    paneMaximized = false,
    resolveDockSplitRatio: resolveDockSplitRatio2,
    resolveEdgeDockRatio,
    onDockSplitApplied,
    onEdgeDockApplied,
    onSplitResized,
    canDetachPane,
    onDetachToFloat,
    getFloatingEditor,
    onFloatingPaneDocked,
    singletonEditorTypes,
    requiredEditorTypes,
    resolveSplitNewEditorType,
    provideEditorKeepAlive = true
  }, ref) {
    const containerRef = useRef(null);
    const [dockDrag, setDockDrag] = useState(null);
    const [dockHover, setDockHover] = useState(null);
    const [detachFloatHover, setDetachFloatHover] = useState(false);
    const [dragPointer, setDragPointer] = useState({ x: 0, y: 0 });
    const handleDockZoneChange = useCallback(
      (targetPaneId, zone) => {
        if (!dockDrag || dockDrag.sourcePaneId === targetPaneId) {
          setDockHover(null);
          return;
        }
        if (zone == null) {
          setDockHover(
            (prev) => prev?.kind === "pane" && prev.targetPaneId === targetPaneId ? null : prev
          );
          return;
        }
        setDockHover({ kind: "pane", targetPaneId, zone });
      },
      [dockDrag]
    );
    const startDockDrag = useCallback(
      (sourcePaneId, editorType, options) => {
        const fromFloat = options?.fromFloat ?? false;
        const resolvedType = editorType ?? findEditorNode(layout, sourcePaneId)?.editorType ?? getFloatingEditor?.(sourcePaneId)?.editorType;
        if (!resolvedType) return;
        setDockDrag({ sourcePaneId, editorType: resolvedType, fromFloat });
        setDockHover(null);
        setDetachFloatHover(false);
        onPaneActivate?.(sourcePaneId);
      },
      [layout, onPaneActivate, getFloatingEditor]
    );
    useImperativeHandle(ref, () => ({ startDockDrag }), [startDockDrag]);
    useEffect(() => {
      if (!dockDrag) return;
      const onMove = (e) => {
        setDragPointer({ x: e.clientX, y: e.clientY });
        const el = containerRef.current;
        if (!el) return;
        const outside = isPointerOutsideElement(el, e.clientX, e.clientY);
        if (outside && !dockDrag?.fromFloat && onDetachToFloat) {
          setDetachFloatHover(true);
          setDockHover(null);
          return;
        }
        setDetachFloatHover(false);
        const globalZone = workbenchGlobalZoneAtPoint(el, e.clientX, e.clientY);
        if (globalZone) {
          setDockHover({ kind: "global", zone: globalZone });
        } else {
          setDockHover((prev) => prev?.kind === "global" ? null : prev);
        }
      };
      const onEnd = () => {
        if (dockDrag) {
          if (detachFloatHover && !dockHover && !dockDrag.fromFloat && onDetachToFloat && (canDetachPane?.(dockDrag.sourcePaneId) ?? true)) {
            onDetachToFloat(dockDrag.sourcePaneId, dragPointer.x, dragPointer.y);
          } else if (dockHover) {
            let next = null;
            const floatingEditor = dockDrag.fromFloat ? getFloatingEditor?.(dockDrag.sourcePaneId) : null;
            if (dockHover.kind === "global") {
              const zone = dockHover.zone;
              const ratio = resolveEdgeDockRatio?.(dockDrag.editorType, zone) ?? WORKBENCH_EDGE_DOCK_RATIO[zone];
              next = floatingEditor ? dockExtractedEditorAtWorkbenchEdge(layout, floatingEditor, zone, ratio) : dockEditorPaneAtWorkbenchEdge(
                layout,
                dockDrag.sourcePaneId,
                zone,
                ratio
              );
              if (next) onEdgeDockApplied?.(dockDrag.editorType, zone, ratio);
            } else {
              const target = findEditorNode(layout, dockHover.targetPaneId);
              const zone = dockHover.zone;
              const ratio = target && zone !== "center" ? resolveDockSplitRatio2?.(
                dockDrag.editorType,
                target.editorType,
                zone
              ) ?? 0.55 : 0.55;
              next = floatingEditor ? dockExtractedEditorPane(
                layout,
                floatingEditor,
                dockHover.targetPaneId,
                zone,
                ratio
              ) : dockEditorPane(
                layout,
                dockDrag.sourcePaneId,
                dockHover.targetPaneId,
                zone,
                ratio
              );
              if (next && target && zone !== "center") {
                onDockSplitApplied?.(dockDrag.editorType, target.editorType, zone, ratio);
              }
            }
            if (next) {
              if (floatingEditor) {
                onFloatingPaneDocked?.(dockDrag.sourcePaneId, next);
              } else {
                onLayoutChange(next);
              }
              onPaneActivate?.(dockDrag.sourcePaneId);
            }
          }
        }
        setDockDrag(null);
        setDockHover(null);
        setDetachFloatHover(false);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };
    }, [
      dockDrag,
      dockHover,
      layout,
      onLayoutChange,
      onPaneActivate,
      resolveDockSplitRatio2,
      resolveEdgeDockRatio,
      onDockSplitApplied,
      onEdgeDockApplied,
      detachFloatHover,
      canDetachPane,
      onDetachToFloat,
      getFloatingEditor,
      onFloatingPaneDocked
    ]);
    const handleExpand = useCallback(
      (paneId) => {
        onLayoutChange(expandEditorPane(layout, paneId));
      },
      [layout, onLayoutChange]
    );
    const handleReorder = useCallback(
      (splitId, orderedPaneIds) => {
        onLayoutChange(reorderCollapsedInSplit(layout, splitId, orderedPaneIds));
      },
      [layout, onLayoutChange]
    );
    const applyPaneSplit = useCallback(
      (paneId, dir, editorType) => {
        if (isSingletonEditorTypeBlocked(
          layout,
          "__split-new__",
          editorType,
          singletonEditorTypes
        )) {
          return;
        }
        onLayoutChange(splitNodeWithEditor(layout, paneId, dir, editorType, 0.5));
      },
      [layout, onLayoutChange, singletonEditorTypes]
    );
    const renderNode = useCallback((node) => {
      if (node.type === "editor") {
        if (node.collapsed) {
          const edge = node.collapseEdge ?? "right";
          return /* @__PURE__ */ jsx(
            CollapsedPaneRail,
            {
              panes: [{ id: node.id, editorType: node.editorType, collapseEdge: edge }],
              registry,
              onExpand: handleExpand,
              onClosePane: (paneId) => {
                if (!canCloseEditorPane(layout, paneId, requiredEditorTypes)) {
                  return;
                }
                if (onClosePane) {
                  onClosePane(paneId);
                } else {
                  onLayoutChange(closeNode(layout, paneId));
                }
              },
              onBeginDockDrag: startDockDrag,
              focusedPaneId: collapsedRailFocusId ?? activePaneId
            },
            node.id
          );
        }
        const hoverZone = dockHover?.kind === "pane" && dockHover.targetPaneId === node.id ? dockHover.zone : null;
        return /* @__PURE__ */ jsx(
          PaneFrame,
          {
            node,
            registry,
            isActive: activePaneId === node.id,
            paneMaximized,
            onSplit: (dir, editorType) => {
              applyPaneSplit(node.id, dir, editorType);
            },
            onClose: () => {
              if (!canCloseEditorPane(layout, node.id, requiredEditorTypes)) {
                return;
              }
              if (onClosePane) {
                onClosePane(node.id);
              } else {
                onLayoutChange(closeNode(layout, node.id));
              }
            },
            onCollapse: () => onLayoutChange(collapseEditorPane(layout, node.id)),
            onChangeType: (type) => {
              if (isSingletonEditorTypeBlocked(layout, node.id, type, singletonEditorTypes)) {
                return;
              }
              onLayoutChange(changeNodeType(layout, node.id, type));
            },
            onActivate: () => onPaneActivate?.(node.id),
            onToggleMaximize: onTogglePaneMaximize != null ? () => onTogglePaneMaximize(node.id) : void 0,
            onUndock: onDetachToFloat != null && (canDetachPane?.(node.id) ?? true) ? () => onDetachToFloat(
              node.id,
              window.innerWidth * 0.5,
              window.innerHeight * 0.35
            ) : void 0,
            dockDragSourceId: dockDrag?.sourcePaneId ?? null,
            dockHoverZone: hoverZone,
            onDockZoneChange: handleDockZoneChange,
            onDockDragStart: startDockDrag,
            hiddenEditorTypes: getHiddenSingletonEditorTypes(
              layout,
              node.id,
              singletonEditorTypes
            ),
            splitHiddenEditorTypes: getSplitMenuHiddenEditorTypes(
              layout,
              singletonEditorTypes
            ),
            preferredSplitEditorType: resolveSplitNewEditorType?.(node.editorType) ?? null,
            closeDisabled: !canCloseEditorPane(layout, node.id, requiredEditorTypes)
          },
          node.id
        );
      }
      if (node.type === "tabs") {
        const activeIdx = Math.max(
          0,
          Math.min(node.activeIndex, Math.max(0, node.panes.length - 1))
        );
        const activePane = node.panes[activeIdx];
        const hoverTargetId = activePane?.id ?? null;
        const hoverZone = hoverTargetId && dockHover?.kind === "pane" && dockHover.targetPaneId === hoverTargetId ? dockHover.zone : null;
        return /* @__PURE__ */ jsx(
          PaneTabGroup,
          {
            node,
            registry,
            activePaneId,
            paneMaximized,
            onSelectTab: (index) => onLayoutChange(setTabsActiveIndex(layout, node.id, index)),
            onSplit: (paneId, dir, editorType) => {
              applyPaneSplit(paneId, dir, editorType);
            },
            onClose: (paneId) => {
              if (!canCloseEditorPane(layout, paneId, requiredEditorTypes)) {
                return;
              }
              if (onClosePane) {
                onClosePane(paneId);
              } else {
                onLayoutChange(closeNode(layout, paneId));
              }
            },
            onCollapse: (paneId) => onLayoutChange(collapseEditorPane(layout, paneId)),
            onChangeType: (paneId, type) => {
              if (isSingletonEditorTypeBlocked(layout, paneId, type, singletonEditorTypes)) {
                return;
              }
              onLayoutChange(changeNodeType(layout, paneId, type));
            },
            onActivate: (paneId) => onPaneActivate?.(paneId),
            onToggleMaximize: onTogglePaneMaximize != null && activePane != null ? () => onTogglePaneMaximize(activePane.id) : void 0,
            onUndock: onDetachToFloat != null ? (paneId) => {
              if (!(canDetachPane?.(paneId) ?? true)) {
                return;
              }
              onDetachToFloat(
                paneId,
                window.innerWidth * 0.5,
                window.innerHeight * 0.35
              );
            } : void 0,
            dockDragSourceId: dockDrag?.sourcePaneId ?? null,
            dockHoverZone: hoverZone,
            dockHoverTargetPaneId: hoverTargetId,
            onDockZoneChange: handleDockZoneChange,
            onDockDragStart: startDockDrag,
            hiddenEditorTypes: activePane ? getHiddenSingletonEditorTypes(layout, activePane.id, singletonEditorTypes) : [],
            splitHiddenEditorTypes: getSplitMenuHiddenEditorTypes(
              layout,
              singletonEditorTypes
            ),
            preferredSplitEditorType: activePane != null ? resolveSplitNewEditorType?.(activePane.editorType) ?? null : null,
            canClosePane: (paneId) => canCloseEditorPane(layout, paneId, requiredEditorTypes)
          },
          node.id
        );
      }
      if (isCollapsedEditor(node.first) && isCollapsedEditor(node.second)) {
        const edge = node.first.collapseEdge ?? collapseEdgeForSplitChild(node.direction, "first");
        return /* @__PURE__ */ jsx(
          CollapsedPaneRail,
          {
            stackSplitId: node.id,
            panes: [
              {
                id: node.first.id,
                editorType: node.first.editorType,
                collapseEdge: edge
              },
              {
                id: node.second.id,
                editorType: node.second.editorType,
                collapseEdge: edge
              }
            ],
            registry,
            onExpand: handleExpand,
            onClosePane: (paneId) => {
              if (!canCloseEditorPane(layout, paneId, requiredEditorTypes)) {
                return;
              }
              if (onClosePane) {
                onClosePane(paneId);
              } else {
                onLayoutChange(closeNode(layout, paneId));
              }
            },
            onBeginDockDrag: startDockDrag,
            onReorder: handleReorder,
            focusedPaneId: collapsedRailFocusId ?? activePaneId
          },
          node.id
        );
      }
      return /* @__PURE__ */ jsx(
        WorkbenchSplitHost,
        {
          node,
          layout,
          onLayoutChange,
          onSplitResized,
          first: renderNode(node.first),
          second: renderNode(node.second)
        },
        node.id
      );
    }, [
      layout,
      registry,
      onLayoutChange,
      handleExpand,
      handleReorder,
      activePaneId,
      collapsedRailFocusId,
      onPaneActivate,
      onClosePane,
      onTogglePaneMaximize,
      paneMaximized,
      startDockDrag,
      dockDrag,
      dockHover,
      handleDockZoneChange,
      singletonEditorTypes,
      requiredEditorTypes,
      resolveSplitNewEditorType,
      applyPaneSplit
    ]);
    const dragGhost = dockDrag ? registryLabel(registry, dockDrag.editorType) : null;
    const globalDockZone = dockHover?.kind === "global" ? dockHover.zone : null;
    const tiling = /* @__PURE__ */ jsxs(
      "div",
      {
        ref: containerRef,
        className: "relative flex flex-col flex-1 min-h-0 w-full h-full overflow-hidden bg-bg-main text-white font-sans selection:bg-blue-500/30",
        children: [
          renderNode(layout),
          /* @__PURE__ */ jsx(WorkbenchFloatDetachHint, { visible: detachFloatHover }),
          dockDrag ? /* @__PURE__ */ jsx(
            WorkbenchGlobalDockOverlay,
            {
              visible: true,
              activeZone: globalDockZone
            }
          ) : null,
          dockDrag && dragGhost ? /* @__PURE__ */ jsx(
            WorkbenchDockDragLayer,
            {
              label: dragGhost.label,
              icon: dragGhost.icon,
              x: dragPointer.x,
              y: dragPointer.y
            }
          ) : null
        ]
      }
    );
    if (!provideEditorKeepAlive) {
      return tiling;
    }
    return /* @__PURE__ */ jsx(WorkbenchEditorKeepAliveProvider, { layout, registry, children: tiling });
  })
);
TRNWorkbench.displayName = "TRNWorkbench";
var FloatingWorkbenchPaneWindow = memo(function FloatingWorkbenchPaneWindow2({
  pane,
  registry,
  isFront,
  onFocus,
  onClose,
  onMove,
  onResize,
  onDockDragStart,
  onDockBack
}) {
  const { label, icon } = registryLabel(registry, pane.editorType);
  const info = registry[pane.editorType];
  const Component = info?.component;
  const keepAlive = useWorkbenchEditorKeepAlive();
  const rootRef = useRef(null);
  const moveRef = useRef(null);
  const resizeRef = useRef(null);
  const livePosRef = useRef(null);
  const liveSizeRef = useRef(null);
  const startMove = useCallback(
    (e) => {
      if (e.button !== 0) return;
      const target = e.target;
      if (target?.closest("button")) return;
      e.preventDefault();
      e.stopPropagation();
      if (!isFront) {
        onFocus();
      }
      const originX = livePosRef.current?.x ?? pane.x;
      const originY = livePosRef.current?.y ?? pane.y;
      moveRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX,
        originY
      };
      livePosRef.current = { x: originX, y: originY };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
      }
      const onPointerMove = (ev) => {
        const m = moveRef.current;
        if (!m || ev.pointerId !== m.pointerId) return;
        const next = clampFloatPosition(
          m.originX + (ev.clientX - m.startX),
          m.originY + (ev.clientY - m.startY),
          pane.width,
          pane.height
        );
        livePosRef.current = next;
        const el = rootRef.current;
        if (el != null) {
          el.style.left = `${next.x}px`;
          el.style.top = `${next.y}px`;
        }
      };
      const onPointerUp = (ev) => {
        const m = moveRef.current;
        if (m != null && ev.pointerId !== m.pointerId) return;
        moveRef.current = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        try {
          if (e.currentTarget.hasPointerCapture(ev.pointerId)) {
            e.currentTarget.releasePointerCapture(ev.pointerId);
          }
        } catch {
        }
        const live = livePosRef.current;
        if (live != null) {
          onMove(pane.id, live.x, live.y);
        }
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    },
    [isFront, onFocus, onMove, pane.height, pane.id, pane.width, pane.x, pane.y]
  );
  const startResize = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      if (!isFront) {
        onFocus();
      }
      resizeRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originW: liveSizeRef.current?.width ?? pane.width,
        originH: liveSizeRef.current?.height ?? pane.height
      };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
      }
      const onPointerMove = (ev) => {
        const r = resizeRef.current;
        if (!r || ev.pointerId !== r.pointerId) return;
        const next = clampFloatSize(
          r.originW + (ev.clientX - r.startX),
          r.originH + (ev.clientY - r.startY)
        );
        liveSizeRef.current = next;
        const el = rootRef.current;
        if (el != null) {
          el.style.width = `${next.width}px`;
          el.style.height = `${next.height}px`;
        }
      };
      const onPointerUp = (ev) => {
        const r = resizeRef.current;
        if (r != null && ev.pointerId !== r.pointerId) return;
        resizeRef.current = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        try {
          if (e.currentTarget.hasPointerCapture(ev.pointerId)) {
            e.currentTarget.releasePointerCapture(ev.pointerId);
          }
        } catch {
        }
        const live = liveSizeRef.current;
        if (live != null) {
          onResize(pane.id, live.width, live.height);
          liveSizeRef.current = null;
        }
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    },
    [isFront, onFocus, onResize, pane.height, pane.id, pane.width]
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: rootRef,
      role: "dialog",
      "aria-label": `${label} floating pane`,
      className: cn(
        "fixed flex flex-col overflow-hidden rounded-lg border border-white/12 bg-bg-panel shadow-2xl shadow-black/60",
        isFront ? "ring-1 ring-violet-500/40" : "ring-1 ring-white/8"
      ),
      style: {
        left: pane.x,
        top: pane.y,
        width: pane.width,
        height: pane.height,
        zIndex: isFront ? 4800 : 4700,
        minWidth: MIN_FLOAT_PANE_WIDTH,
        minHeight: MIN_FLOAT_PANE_HEIGHT,
        willChange: "left, top, width, height"
      },
      onPointerDown: onFocus,
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex h-8 shrink-0 cursor-grab items-center gap-1.5 border-b border-white/8 bg-bg-header/90 px-1.5 backdrop-blur-md touch-none active:cursor-grabbing",
            onPointerDown: startMove,
            children: [
              /* @__PURE__ */ jsx(
                WorkbenchHintButton,
                {
                  hint: "Drag to dock back into workbench",
                  ariaLabel: "Dock pane",
                  className: "flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded text-tertiary hover:bg-white/10 hover:text-primary active:cursor-grabbing",
                  onPointerDown: (e) => {
                    if (e.button !== 0) return;
                    e.stopPropagation();
                    onDockDragStart(pane.id);
                  },
                  children: /* @__PURE__ */ jsx(GripVertical, { size: 12, "aria-hidden": true })
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "shrink-0 opacity-80", children: icon }),
              /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-widest text-primary", children: label }),
              /* @__PURE__ */ jsx(
                WorkbenchHintButton,
                {
                  hint: "Dock back to previous location (or drag the grip onto the workbench)",
                  ariaLabel: "Dock pane back to previous location",
                  className: "flex h-6 w-6 items-center justify-center rounded text-violet-300/90 hover:bg-white/10 hover:text-violet-200",
                  onPointerDown: (e) => e.stopPropagation(),
                  onClick: (e) => {
                    e.stopPropagation();
                    onDockBack(pane.id);
                  },
                  children: /* @__PURE__ */ jsx(Dock, { size: 12, "aria-hidden": true })
                }
              ),
              /* @__PURE__ */ jsx(
                WorkbenchHintButton,
                {
                  hint: "Focus pane",
                  ariaLabel: "Focus pane",
                  className: "flex h-6 w-6 items-center justify-center rounded text-tertiary hover:bg-white/10 hover:text-primary",
                  onPointerDown: (e) => e.stopPropagation(),
                  onClick: (e) => {
                    e.stopPropagation();
                    onFocus();
                  },
                  children: /* @__PURE__ */ jsx(Maximize2, { size: 12, "aria-hidden": true })
                }
              ),
              /* @__PURE__ */ jsx(
                WorkbenchHintButton,
                {
                  hint: "Close floating pane",
                  ariaLabel: "Close floating pane",
                  className: "flex h-6 w-6 items-center justify-center rounded text-tertiary hover:bg-red-500/15 hover:text-red-400",
                  onPointerDown: (e) => e.stopPropagation(),
                  onClick: (e) => {
                    e.stopPropagation();
                    onClose();
                  },
                  children: /* @__PURE__ */ jsx(X, { size: 13, "aria-hidden": true })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "relative min-h-0 flex-1 overflow-hidden", children: keepAlive?.enabled ? /* @__PURE__ */ jsx(WorkbenchEditorSlot, { paneId: pane.id }) : Component ? /* @__PURE__ */ jsx(Component, {}) : null }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute bottom-0 right-0 h-4 w-4 cursor-se-resize touch-none",
            onPointerDown: startResize,
            "aria-label": "Resize floating pane",
            role: "separator"
          }
        )
      ]
    }
  );
});
var FloatingWorkbenchLayer = memo(function FloatingWorkbenchLayer2({
  panes,
  registry,
  frontPaneId,
  onFocusPane,
  onClosePane,
  onMovePane,
  onResizePane,
  onDockDragStart,
  onDockBack,
  portalTarget: portalTargetProp
}) {
  const [bodyPortal, setBodyPortal] = useState(null);
  useEffect(() => {
    setBodyPortal(document.body);
  }, []);
  const portalTarget = portalTargetProp ?? bodyPortal;
  if (!portalTarget || panes.length === 0) return null;
  return createPortal(
    /* @__PURE__ */ jsx(Fragment, { children: panes.map((pane) => /* @__PURE__ */ jsx(
      FloatingWorkbenchPaneWindow,
      {
        pane,
        registry,
        isFront: frontPaneId === pane.id,
        onFocus: () => onFocusPane(pane.id),
        onClose: () => onClosePane(pane.id),
        onMove: onMovePane,
        onResize: onResizePane,
        onDockDragStart,
        onDockBack
      },
      pane.id
    )) }),
    portalTarget
  );
});

// src/floatDockRestore.ts
function captureFloatDockRestore(layout, paneId) {
  const tabs = findParentTabsOfEditor(layout, paneId);
  if (tabs != null) {
    const index = tabs.panes.findIndex((p) => p.id === paneId);
    if (index < 0) {
      return null;
    }
    return {
      kind: "tabs",
      tabsId: tabs.id,
      index,
      peerIds: tabs.panes.filter((p) => p.id !== paneId).map((p) => p.id)
    };
  }
  const split = findParentSplitOfEditor(layout, paneId);
  if (split == null) {
    return null;
  }
  const sibling = split.which === "first" ? split.parent.second : split.parent.first;
  return {
    kind: "split",
    siblingId: sibling.id,
    side: split.which,
    direction: split.parent.direction,
    ratio: split.parent.ratio
  };
}
function findNodeById(node, id) {
  if (node.id === id) {
    return node;
  }
  if (node.type === "split") {
    return findNodeById(node.first, id) ?? findNodeById(node.second, id);
  }
  if (node.type === "tabs") {
    return node.panes.find((p) => p.id === id) ?? null;
  }
  return null;
}
function zoneForSplitRestore(direction, side) {
  if (direction === "horizontal") {
    return side === "first" ? "left" : "right";
  }
  return side === "first" ? "top" : "bottom";
}
function insertIntoTabsAtIndex(layout, tabsId, editor, index) {
  let applied = false;
  const next = mapLayout(layout, (node) => {
    if (node.type !== "tabs" || node.id !== tabsId) {
      return node;
    }
    if (node.panes.some((p) => p.id === editor.id)) {
      applied = true;
      return node;
    }
    const panes = [...node.panes];
    const at = Math.max(0, Math.min(index, panes.length));
    panes.splice(at, 0, { ...editor });
    applied = true;
    return {
      ...node,
      panes,
      activeIndex: at
    };
  });
  return applied ? next : null;
}
function applyFloatDockRestore(layout, editor, restore) {
  if (findEditorNode(layout, editor.id) != null) {
    return null;
  }
  if (restore?.kind === "tabs") {
    const tabs = findNodeById(layout, restore.tabsId);
    if (tabs?.type === "tabs") {
      const next2 = insertIntoTabsAtIndex(layout, restore.tabsId, editor, restore.index);
      if (next2 != null) {
        return { layout: next2, mode: "previous" };
      }
    }
    if (tabs?.type === "editor") {
      const next2 = dockExtractedEditorPane(layout, editor, tabs.id, "center", 0.55);
      if (next2 != null) {
        return { layout: next2, mode: "previous" };
      }
    }
    for (const peerId of restore.peerIds) {
      if (findEditorNode(layout, peerId) != null) {
        const next2 = dockExtractedEditorPane(layout, editor, peerId, "center", 0.55);
        if (next2 != null) {
          return { layout: next2, mode: "previous" };
        }
      }
    }
  }
  if (restore?.kind === "split") {
    const siblingNode = findNodeById(layout, restore.siblingId);
    const targetEditor = siblingNode?.type === "editor" ? siblingNode : siblingNode != null ? collectEditorPanes(siblingNode)[0] : findEditorNode(layout, restore.siblingId);
    if (targetEditor != null) {
      const zone = zoneForSplitRestore(restore.direction, restore.side);
      const next2 = dockExtractedEditorPane(
        layout,
        editor,
        targetEditor.id,
        zone,
        restore.ratio
      );
      if (next2 != null) {
        return { layout: next2, mode: "previous" };
      }
    }
  }
  const fallback = collectEditorPanes(layout)[0];
  if (fallback == null) {
    return { layout: { ...editor }, mode: "solo" };
  }
  const next = dockExtractedEditorPane(layout, editor, fallback.id, "right", 0.55);
  if (next == null) {
    return null;
  }
  return { layout: next, mode: "fallback" };
}
function floatingPaneAsEditor(pane) {
  return {
    id: pane.id,
    type: "editor",
    editorType: pane.editorType
  };
}

// src/useWorkbenchFloating.ts
function useWorkbenchFloating({
  layout,
  onLayoutChange,
  enabled = true,
  onDetachRejected,
  onDockBackResult,
  requiredEditorTypes
}) {
  const [floatingPanes, setFloatingPanes] = useState([]);
  const [frontPaneId, setFrontPaneId] = useState(null);
  const [activePaneId, setActivePaneId] = useState(null);
  const detachPaneToFloat = useCallback(
    (paneId, clientX, clientY) => {
      if (!enabled) return;
      if (!canCloseEditorPane(layout, paneId, requiredEditorTypes)) {
        onDetachRejected?.();
        return;
      }
      const editor = findEditorNode(layout, paneId);
      if (!editor) return;
      const dockRestore = captureFloatDockRestore(layout, paneId);
      const nextLayout = removeEditorPane(layout, paneId);
      if (!nextLayout) return;
      const pos = floatPanePositionFromPointer(clientX, clientY);
      const floating = {
        id: editor.id,
        editorType: editor.editorType,
        x: pos.x,
        y: pos.y,
        width: DEFAULT_FLOAT_PANE_WIDTH,
        height: DEFAULT_FLOAT_PANE_HEIGHT,
        dockRestore
      };
      setFloatingPanes((prev) => [...prev, floating]);
      setFrontPaneId(floating.id);
      setActivePaneId(null);
      onLayoutChange(nextLayout);
    },
    [enabled, layout, onDetachRejected, onLayoutChange, requiredEditorTypes]
  );
  const closeFloatingPane = useCallback((paneId) => {
    setFloatingPanes((prev) => {
      const next = prev.filter((p) => p.id !== paneId);
      setFrontPaneId((front) => front === paneId ? next[0]?.id ?? null : front);
      return next;
    });
  }, []);
  const moveFloatingPane = useCallback((paneId, x, y) => {
    setFloatingPanes(
      (prev) => prev.map((p) => {
        if (p.id !== paneId) return p;
        const next = clampFloatPosition(x, y, p.width, p.height);
        return { ...p, x: next.x, y: next.y };
      })
    );
  }, []);
  const resizeFloatingPane = useCallback((paneId, width, height) => {
    setFloatingPanes(
      (prev) => prev.map((p) => p.id === paneId ? { ...p, width, height } : p)
    );
  }, []);
  const focusFloatingPane = useCallback((paneId) => {
    setFrontPaneId(paneId);
  }, []);
  const getFloatingEditor = useCallback(
    (paneId) => {
      const pane = floatingPanes.find((p) => p.id === paneId);
      if (!pane) return null;
      return { id: pane.id, type: "editor", editorType: pane.editorType };
    },
    [floatingPanes]
  );
  const dockFloatingPane = useCallback(
    (paneId, nextLayout) => {
      onLayoutChange(nextLayout);
      setFloatingPanes((prev) => prev.filter((p) => p.id !== paneId));
      setFrontPaneId((front) => front === paneId ? null : front);
      setActivePaneId(paneId);
    },
    [onLayoutChange]
  );
  const redockFloatingPaneToPrevious = useCallback(
    (paneId) => {
      if (!enabled) {
        const result2 = { ok: false, reason: "disabled" };
        onDockBackResult?.(result2);
        return result2;
      }
      const pane = floatingPanes.find((p) => p.id === paneId);
      if (pane == null) {
        const result2 = { ok: false, reason: "missing" };
        onDockBackResult?.(result2);
        return result2;
      }
      if (findEditorNode(layout, pane.id) != null) {
        const result2 = { ok: false, reason: "already-docked" };
        onDockBackResult?.(result2);
        return result2;
      }
      const applied = applyFloatDockRestore(
        layout,
        floatingPaneAsEditor(pane),
        pane.dockRestore
      );
      if (applied == null) {
        const result2 = { ok: false, reason: "failed" };
        onDockBackResult?.(result2);
        return result2;
      }
      dockFloatingPane(paneId, applied.layout);
      const result = { ok: true, mode: applied.mode };
      onDockBackResult?.(result);
      return result;
    },
    [dockFloatingPane, enabled, floatingPanes, layout, onDockBackResult]
  );
  const workbenchProps = {
    onPaneActivate: setActivePaneId,
    canDetachPane: enabled ? (paneId) => canCloseEditorPane(layout, paneId, requiredEditorTypes) : void 0,
    onDetachToFloat: enabled ? detachPaneToFloat : void 0,
    getFloatingEditor: enabled ? getFloatingEditor : void 0,
    onFloatingPaneDocked: enabled ? dockFloatingPane : void 0
  };
  const layerProps = (workbenchRef) => ({
    panes: floatingPanes,
    frontPaneId,
    onFocusPane: focusFloatingPane,
    onClosePane: closeFloatingPane,
    onMovePane: moveFloatingPane,
    onResizePane: resizeFloatingPane,
    onDockDragStart: (paneId) => {
      const pane = floatingPanes.find((p) => p.id === paneId);
      if (!pane) return;
      workbenchRef.current?.startDockDrag(paneId, pane.editorType, { fromFloat: true });
    },
    onDockBack: (paneId) => {
      redockFloatingPaneToPrevious(paneId);
    }
  });
  const clearAllFloatingPanes = useCallback(() => {
    setFloatingPanes([]);
    setFrontPaneId(null);
  }, []);
  return {
    floatingPanes,
    frontPaneId,
    activePaneId,
    setActivePaneId,
    detachPaneToFloat,
    closeFloatingPane,
    clearAllFloatingPanes,
    moveFloatingPane,
    resizeFloatingPane,
    focusFloatingPane,
    getFloatingEditor,
    dockFloatingPane,
    redockFloatingPaneToPrevious,
    workbenchProps,
    layerProps
  };
}
var TRNWorkbenchHost = memo(
  forwardRef(function TRNWorkbenchHost2({
    enableFloating = true,
    portalTarget,
    onDetachRejected,
    onDockBackResult,
    header,
    className,
    floatingBindings,
    layout,
    onLayoutChange,
    activePaneId: activePaneIdProp,
    onPaneActivate: onPaneActivateProp,
    registry,
    provideEditorKeepAlive: _ignoredProvide,
    ...workbenchProps
  }, ref) {
    const innerRef = useRef(null);
    useImperativeHandle(ref, () => innerRef.current, []);
    const internalFloating = useWorkbenchFloating({
      layout,
      onLayoutChange,
      enabled: enableFloating && floatingBindings == null,
      onDetachRejected,
      onDockBackResult,
      requiredEditorTypes: workbenchProps.requiredEditorTypes
    });
    const floating = floatingBindings ?? internalFloating;
    const activePaneId = activePaneIdProp ?? floating.activePaneId;
    const onPaneActivate = useCallback(
      (id) => {
        if (activePaneIdProp == null) floating.setActivePaneId(id);
        onPaneActivateProp?.(id);
      },
      [activePaneIdProp, floating, onPaneActivateProp]
    );
    const floatingEditors = useMemo(
      () => floating.floatingPanes.map((p) => ({
        id: p.id,
        editorType: p.editorType
      })),
      [floating.floatingPanes]
    );
    return /* @__PURE__ */ jsx(
      WorkbenchEditorKeepAliveProvider,
      {
        layout,
        registry,
        floatingEditors: enableFloating ? floatingEditors : void 0,
        children: /* @__PURE__ */ jsxs("div", { className: className ?? "flex flex-1 flex-col min-h-0 min-w-0", children: [
          header,
          /* @__PURE__ */ jsx("div", { className: "relative flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden", children: /* @__PURE__ */ jsx(
            TRNWorkbench,
            {
              ref: innerRef,
              layout,
              registry,
              onLayoutChange,
              activePaneId,
              onPaneActivate,
              provideEditorKeepAlive: false,
              ...workbenchProps,
              ...enableFloating ? floating.workbenchProps : {}
            }
          ) }),
          enableFloating ? /* @__PURE__ */ jsx(
            FloatingWorkbenchLayer,
            {
              registry,
              portalTarget,
              ...floating.layerProps(innerRef)
            }
          ) : null
        ] })
      }
    );
  })
);
TRNWorkbenchHost.displayName = "TRNWorkbenchHost";

// src/workbench-host-mirror-notify.ts
var hostSyncPushByApp = /* @__PURE__ */ new Map();
function registerWorkbenchHostMirrorPush(appId, push) {
  hostSyncPushByApp.set(appId, push);
  return () => {
    hostSyncPushByApp.delete(appId);
  };
}
function notifyWorkbenchHostMirrorDirty(appId) {
  hostSyncPushByApp.get(appId)?.();
}

// src/layoutPersistence.ts
var STORAGE_PREFIX = "trn_workbench_";
var LEGACY_STORAGE_PREFIX = "ternion_workbench_";
function workbenchPersistenceKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}
function legacyWorkbenchPersistenceKey(key) {
  return `${LEGACY_STORAGE_PREFIX}${key}`;
}
function loadPersistedLayout(key) {
  const keys = [workbenchPersistenceKey(key), legacyWorkbenchPersistenceKey(key)];
  for (const storageKey of keys) {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        continue;
      }
      return JSON.parse(saved);
    } catch {
    }
  }
  return null;
}
function savePersistedLayout(key, layout, options) {
  try {
    localStorage.setItem(workbenchPersistenceKey(key), JSON.stringify(layout));
    if (options?.mirror !== false) {
      notifyWorkbenchHostMirrorDirty(key);
    }
  } catch {
  }
}
function clearPersistedLayout(key) {
  try {
    localStorage.removeItem(workbenchPersistenceKey(key));
    localStorage.removeItem(legacyWorkbenchPersistenceKey(key));
  } catch {
  }
}
var TRNManagedWorkbench = memo(function TRNManagedWorkbench2({
  initialLayout,
  registry,
  persistenceKey,
  enableFloating = true,
  onDetachRejected,
  onDockBackResult,
  portalTarget,
  className,
  validateLayout
}) {
  const ref = useRef(null);
  const [layoutHydrated, setLayoutHydrated] = useState(false);
  const [layout, setLayout] = useState(initialLayout);
  useEffect(() => {
    if (layoutHydrated) {
      return;
    }
    if (persistenceKey == null || typeof window === "undefined") {
      setLayoutHydrated(true);
      return;
    }
    const saved = loadPersistedLayout(persistenceKey);
    if (saved) {
      setLayout(validateLayout ? validateLayout(saved) : saved);
    }
    setLayoutHydrated(true);
  }, [initialLayout, layoutHydrated, persistenceKey, validateLayout]);
  useEffect(() => {
    if (!layoutHydrated || persistenceKey == null || typeof window === "undefined") {
      return;
    }
    savePersistedLayout(persistenceKey, layout);
  }, [layout, layoutHydrated, persistenceKey]);
  return /* @__PURE__ */ jsx(
    TRNWorkbenchHost,
    {
      ref,
      layout,
      registry,
      onLayoutChange: setLayout,
      enableFloating,
      onDetachRejected,
      onDockBackResult,
      portalTarget,
      className
    }
  );
});
TRNManagedWorkbench.displayName = "TRNManagedWorkbench";

// src/layoutValidateCore.ts
function isLayoutNodeShape(value) {
  if (!value || typeof value !== "object") return false;
  const node = value;
  if (node.type === "editor") return typeof node.id === "string" && typeof node.editorType === "string";
  if (node.type === "tabs") {
    return typeof node.id === "string" && Array.isArray(node.panes) && node.panes.length > 0 && typeof node.activeIndex === "number";
  }
  if (node.type === "split") {
    return typeof node.id === "string" && (node.direction === "horizontal" || node.direction === "vertical") && typeof node.ratio === "number" && node.first != null && node.second != null;
  }
  return false;
}
function migrateEditorTypesInTree(node, options) {
  const { knownEditorTypes, fallbackEditorType = "main", migrateEditorType } = options;
  if (node.type === "editor") {
    let editorType = migrateEditorType ? migrateEditorType(node.editorType) : node.editorType;
    if (knownEditorTypes && !knownEditorTypes.has(editorType)) {
      editorType = knownEditorTypes.has(node.editorType) ? node.editorType : fallbackEditorType;
    }
    return { ...node, editorType };
  }
  if (node.type === "tabs") {
    const panes = node.panes.map(
      (p) => migrateEditorTypesInTree(p, options)
    );
    const activeIndex = Math.max(0, Math.min(node.activeIndex, panes.length - 1));
    return { ...node, panes, activeIndex };
  }
  return {
    ...node,
    first: migrateEditorTypesInTree(node.first, options),
    second: migrateEditorTypesInTree(node.second, options)
  };
}
function validateLayoutTree(raw, options) {
  const fallback = structuredClone(options.fallback);
  if (!isLayoutNodeShape(raw)) return fallback;
  let layout = migrateEditorTypesInTree(raw, options);
  if (options.postMigrate) layout = options.postMigrate(layout);
  return layout;
}
var WORKBENCH_LAYOUT_LIBRARY_VERSION = 1;
var MAX_NAMED_WORKBENCH_LAYOUTS = 12;
var LIBRARY_STORAGE_PREFIX = "trn_workbench_layout_lib_";
function getWebLocalStorage() {
  if (typeof globalThis === "undefined") {
    return null;
  }
  const g = globalThis;
  if (typeof g.window !== "undefined" && g.window?.localStorage != null) {
    return g.window.localStorage;
  }
  if (g.localStorage != null) {
    return g.localStorage;
  }
  return null;
}
function workbenchLayoutLibraryStorageKey(appId) {
  return `${LIBRARY_STORAGE_PREFIX}${appId}`;
}
function emptyLibrary(appId) {
  return { version: WORKBENCH_LAYOUT_LIBRARY_VERSION, appId, layouts: [] };
}
function isSnapshot(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value;
  return row.version === WORKBENCH_LAYOUT_LIBRARY_VERSION && typeof row.id === "string" && typeof row.name === "string" && typeof row.appId === "string" && row.layout != null && typeof row.layout === "object";
}
function isLibrary(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value;
  return row.version === WORKBENCH_LAYOUT_LIBRARY_VERSION && typeof row.appId === "string" && Array.isArray(row.layouts);
}
function readWorkbenchLayoutLibrary(appId) {
  const ls = getWebLocalStorage();
  if (ls == null) {
    return emptyLibrary(appId);
  }
  try {
    const raw = ls.getItem(workbenchLayoutLibraryStorageKey(appId));
    if (!raw) {
      return emptyLibrary(appId);
    }
    const parsed = JSON.parse(raw);
    if (!isLibrary(parsed) || parsed.appId !== appId) {
      return emptyLibrary(appId);
    }
    return {
      ...parsed,
      layouts: parsed.layouts.filter(isSnapshot)
    };
  } catch {
    return emptyLibrary(appId);
  }
}
function writeWorkbenchLayoutLibrary(library, options) {
  const ls = getWebLocalStorage();
  if (ls == null) {
    return;
  }
  ls.setItem(
    workbenchLayoutLibraryStorageKey(library.appId),
    JSON.stringify(library)
  );
  if (options?.mirror !== false) {
    notifyWorkbenchHostMirrorDirty(library.appId);
  }
}
function normalizeWorkbenchLayoutName(name) {
  return name.trim().replace(/\s+/g, " ").slice(0, 48);
}
function findNamedWorkbenchLayoutByName(library, name) {
  const needle = normalizeWorkbenchLayoutName(name).toLowerCase();
  if (!needle) {
    return null;
  }
  return library.layouts.find(
    (row) => normalizeWorkbenchLayoutName(row.name).toLowerCase() === needle
  ) ?? null;
}
function saveNamedWorkbenchLayout(input) {
  const name = normalizeWorkbenchLayoutName(input.name);
  if (!name) {
    return { ok: false, reason: "empty_name" };
  }
  const library = readWorkbenchLayoutLibrary(input.appId);
  const existing = findNamedWorkbenchLayoutByName(library, name);
  if (existing && !input.allowOverwrite) {
    return { ok: false, reason: "name_conflict", existing };
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const snapshot = existing ? {
    ...existing,
    name,
    updatedAt: now,
    layout: structuredClone(input.layout),
    dockMemory: structuredClone(input.dockMemory ?? {}),
    description: input.description?.trim() || void 0,
    basedOnPresetId: input.basedOnPresetId,
    source: "user"
  } : {
    version: WORKBENCH_LAYOUT_LIBRARY_VERSION,
    id: v4(),
    name,
    appId: input.appId,
    createdAt: now,
    updatedAt: now,
    source: "user",
    layout: structuredClone(input.layout),
    dockMemory: structuredClone(input.dockMemory ?? {}),
    description: input.description?.trim() || void 0,
    basedOnPresetId: input.basedOnPresetId
  };
  if (!existing && library.layouts.length >= MAX_NAMED_WORKBENCH_LAYOUTS) {
    return { ok: false, reason: "library_full" };
  }
  const nextLayouts = existing ? library.layouts.map((row) => row.id === existing.id ? snapshot : row) : [...library.layouts, snapshot];
  writeWorkbenchLayoutLibrary({ ...library, layouts: nextLayouts });
  return { ok: true, snapshot, overwritten: Boolean(existing) };
}
function deleteNamedWorkbenchLayout(appId, layoutId) {
  const library = readWorkbenchLayoutLibrary(appId);
  const next = library.layouts.filter((row) => row.id !== layoutId);
  if (next.length === library.layouts.length) {
    return false;
  }
  writeWorkbenchLayoutLibrary({ ...library, layouts: next });
  return true;
}
function getNamedWorkbenchLayout(appId, layoutId) {
  return readWorkbenchLayoutLibrary(appId).layouts.find((row) => row.id === layoutId) ?? null;
}
function listNamedWorkbenchLayouts(appId) {
  return [...readWorkbenchLayoutLibrary(appId).layouts];
}
function listNamedWorkbenchLayoutsSorted(appId) {
  return [...readWorkbenchLayoutLibrary(appId).layouts].sort(
    (a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "base" })
  );
}
function renameNamedWorkbenchLayout(input) {
  const name = normalizeWorkbenchLayoutName(input.name);
  if (!name) {
    return { ok: false, reason: "empty_name" };
  }
  const library = readWorkbenchLayoutLibrary(input.appId);
  const target = library.layouts.find((row) => row.id === input.layoutId);
  if (!target) {
    return { ok: false, reason: "not_found" };
  }
  const conflict = findNamedWorkbenchLayoutByName(library, name);
  if (conflict && conflict.id !== target.id) {
    return { ok: false, reason: "name_conflict", existing: conflict };
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const snapshot = {
    ...target,
    name,
    updatedAt: now
  };
  writeWorkbenchLayoutLibrary({
    ...library,
    layouts: library.layouts.map((row) => row.id === target.id ? snapshot : row)
  });
  return { ok: true, snapshot };
}
function suggestDuplicateLayoutName(library, baseName) {
  const base = normalizeWorkbenchLayoutName(baseName);
  let candidate = `${base} copy`;
  let index = 2;
  while (findNamedWorkbenchLayoutByName(library, candidate)) {
    candidate = `${base} (${index})`;
    index += 1;
  }
  return candidate;
}
function duplicateNamedWorkbenchLayout(appId, layoutId) {
  const library = readWorkbenchLayoutLibrary(appId);
  const source = library.layouts.find((row) => row.id === layoutId);
  if (!source) {
    return { ok: false, reason: "not_found" };
  }
  if (library.layouts.length >= MAX_NAMED_WORKBENCH_LAYOUTS) {
    return { ok: false, reason: "library_full" };
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const snapshot = {
    ...structuredClone(source),
    id: v4(),
    name: suggestDuplicateLayoutName(library, source.name),
    createdAt: now,
    updatedAt: now,
    source: "user"
  };
  writeWorkbenchLayoutLibrary({ ...library, layouts: [...library.layouts, snapshot] });
  return { ok: true, snapshot };
}
function reorderNamedWorkbenchLayout(appId, layoutId, direction) {
  const library = readWorkbenchLayoutLibrary(appId);
  const index = library.layouts.findIndex((row2) => row2.id === layoutId);
  if (index < 0) {
    return false;
  }
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= library.layouts.length) {
    return false;
  }
  const nextLayouts = [...library.layouts];
  const [row] = nextLayouts.splice(index, 1);
  nextLayouts.splice(nextIndex, 0, row);
  writeWorkbenchLayoutLibrary({ ...library, layouts: nextLayouts });
  return true;
}
var STARTUP_STORAGE_PREFIX = "trn_workbench_startup_";
function workbenchStartupPreferenceStorageKey(appId) {
  return `${STARTUP_STORAGE_PREFIX}${appId}`;
}
function isStartupPreference(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value;
  if (row.kind === "session") {
    return true;
  }
  if (row.kind === "preset" && typeof row.presetId === "string" && row.presetId.length > 0) {
    return true;
  }
  if (row.kind === "named" && typeof row.layoutId === "string" && row.layoutId.length > 0) {
    return true;
  }
  return false;
}
function readWorkbenchStartupPreference(appId) {
  const ls = getWebLocalStorage();
  if (ls == null) {
    return { kind: "session" };
  }
  try {
    const raw = ls.getItem(workbenchStartupPreferenceStorageKey(appId));
    if (!raw) {
      return { kind: "session" };
    }
    const parsed = JSON.parse(raw);
    return isStartupPreference(parsed) ? parsed : { kind: "session" };
  } catch {
    return { kind: "session" };
  }
}
function hasStoredWorkbenchStartupPreference(appId) {
  const ls = getWebLocalStorage();
  if (ls == null) {
    return false;
  }
  try {
    const raw = ls.getItem(workbenchStartupPreferenceStorageKey(appId));
    return raw != null && raw.length > 0;
  } catch {
    return false;
  }
}
function writeWorkbenchStartupPreference(appId, preference, options) {
  const ls = getWebLocalStorage();
  if (ls == null) {
    return;
  }
  ls.setItem(workbenchStartupPreferenceStorageKey(appId), JSON.stringify(preference));
  if (options?.mirror !== false) {
    notifyWorkbenchHostMirrorDirty(appId);
  }
}
function createWorkbenchLayoutExport(snapshot) {
  return {
    exportVersion: WORKBENCH_LAYOUT_LIBRARY_VERSION,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    snapshot: structuredClone(snapshot)
  };
}
function serializeWorkbenchLayoutExport(snapshot) {
  return JSON.stringify(createWorkbenchLayoutExport(snapshot), null, 2);
}
function parseWorkbenchLayoutImport(raw, expectedAppId) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, reason: "invalid_format" };
  }
  const envelope = parsed;
  const snapshot = envelope.exportVersion === WORKBENCH_LAYOUT_LIBRARY_VERSION && envelope.snapshot && isSnapshot(envelope.snapshot) ? envelope.snapshot : isSnapshot(parsed) ? parsed : null;
  if (!snapshot) {
    return { ok: false, reason: "invalid_format" };
  }
  if (snapshot.appId !== expectedAppId) {
    return { ok: false, reason: "wrong_app" };
  }
  return { ok: true, snapshot };
}
function importWorkbenchLayoutToLibrary(input) {
  const name = normalizeWorkbenchLayoutName(input.nameOverride ?? input.snapshot.name);
  return saveNamedWorkbenchLayout({
    appId: input.appId,
    name,
    layout: input.snapshot.layout,
    dockMemory: input.snapshot.dockMemory,
    description: input.snapshot.description,
    basedOnPresetId: input.snapshot.basedOnPresetId,
    allowOverwrite: input.allowOverwrite
  });
}
function createWorkbenchLayoutSnapshotFromCurrent(input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    version: WORKBENCH_LAYOUT_LIBRARY_VERSION,
    id: v4(),
    name: normalizeWorkbenchLayoutName(input.name),
    appId: input.appId,
    createdAt: now,
    updatedAt: now,
    source: "user",
    layout: structuredClone(input.layout),
    dockMemory: structuredClone(input.dockMemory ?? {}),
    description: input.description?.trim() || void 0,
    basedOnPresetId: input.basedOnPresetId
  };
}
function workbenchLayoutExportFilename(snapshot) {
  const slug = snapshot.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  const safeSlug = slug || "layout";
  return `${snapshot.appId}-${safeSlug}.trn-workbench-layout.json`;
}
function downloadWorkbenchLayoutJson(snapshot) {
  if (typeof document === "undefined") {
    return;
  }
  const json = serializeWorkbenchLayoutExport(snapshot);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = workbenchLayoutExportFilename(snapshot);
  anchor.click();
  URL.revokeObjectURL(url);
}
function summarizeWorkbenchLayoutPanes(layout) {
  const types = /* @__PURE__ */ new Set();
  const walk = (node) => {
    if (node.type === "editor") {
      types.add(node.editorType);
      return;
    }
    if (node.type === "tabs") {
      for (const pane of node.panes) {
        types.add(pane.editorType);
      }
      return;
    }
    walk(node.first);
    walk(node.second);
  };
  walk(layout);
  return Array.from(types).join(" \xB7 ");
}

// src/workbench-layout-dialog-chrome.ts
var WORKBENCH_LAYOUT_FIELD_INPUT_CLASS = "w-full min-w-0 rounded-md border border-zinc-700/80 bg-zinc-900/70 px-2.5 py-1.5 text-[13px] text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-500/45 focus:ring-1 focus:ring-cyan-500/20";
function computeCenteredWorkbenchDialogRect(widthPx, heightPx) {
  if (typeof window === "undefined") {
    return { x: 120, y: 80, width: widthPx, height: heightPx };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(widthPx, Math.max(320, vw - 48));
  const height = Math.min(heightPx, Math.max(240, vh - 48));
  return {
    x: Math.max(16, (vw - width) / 2),
    y: Math.max(16, (vh - height) / 2),
    width,
    height
  };
}
var MANAGE_LAYOUT_DIALOG_WIDTH_PX = 520;
var MANAGE_LAYOUT_DIALOG_HEIGHT_PX = 520;
var RENAME_LAYOUT_DIALOG_WIDTH_PX = 400;
var RENAME_LAYOUT_DIALOG_HEIGHT_PX = 220;
function startupLabel(preference, presets, namedLayouts) {
  if (preference.kind === "session") {
    return "Last session layout";
  }
  if (preference.kind === "preset") {
    return presets.find((row) => row.id === preference.presetId)?.label ?? preference.presetId;
  }
  return namedLayouts.find((row) => row.id === preference.layoutId)?.name ?? "Saved layout";
}
function WorkbenchLayoutLibraryPanel({
  open,
  onOpenChange,
  appId,
  presets,
  revision,
  onRevisionChange,
  onLoadNamed,
  onExportSnapshot,
  onImportPick,
  importError
}) {
  const [renameTargetId, setRenameTargetId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [manageRect, setManageRect] = useState(
    () => computeCenteredWorkbenchDialogRect(
      MANAGE_LAYOUT_DIALOG_WIDTH_PX,
      MANAGE_LAYOUT_DIALOG_HEIGHT_PX
    )
  );
  const [renameRect, setRenameRect] = useState(
    () => computeCenteredWorkbenchDialogRect(
      RENAME_LAYOUT_DIALOG_WIDTH_PX,
      RENAME_LAYOUT_DIALOG_HEIGHT_PX
    )
  );
  const namedLayouts = useMemo(
    () => listNamedWorkbenchLayouts(appId),
    [appId, revision]
  );
  const startupPreference = useMemo(
    () => readWorkbenchStartupPreference(appId),
    [appId, revision]
  );
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    setManageRect(
      computeCenteredWorkbenchDialogRect(
        MANAGE_LAYOUT_DIALOG_WIDTH_PX,
        MANAGE_LAYOUT_DIALOG_HEIGHT_PX
      )
    );
  }, [open]);
  useLayoutEffect(() => {
    if (renameTargetId == null) {
      return;
    }
    setRenameRect(
      computeCenteredWorkbenchDialogRect(
        RENAME_LAYOUT_DIALOG_WIDTH_PX,
        RENAME_LAYOUT_DIALOG_HEIGHT_PX
      )
    );
  }, [renameTargetId]);
  useEffect(() => {
    if (!open) {
      setRenameTargetId(null);
      setRenameValue("");
      setRenameError(null);
      setDeleteTargetId(null);
    }
  }, [open]);
  const startupOptions = useMemo(() => {
    const rows = [{ value: "session", label: "Last session layout" }];
    for (const preset of presets) {
      rows.push({ value: `preset:${preset.id}`, label: `Preset: ${preset.label}` });
    }
    for (const layout of namedLayouts) {
      rows.push({ value: `named:${layout.id}`, label: `Saved: ${layout.name}` });
    }
    return rows;
  }, [namedLayouts, presets]);
  const startupSelectValue = useMemo(() => {
    if (startupPreference.kind === "session") {
      return "session";
    }
    if (startupPreference.kind === "preset") {
      return `preset:${startupPreference.presetId}`;
    }
    return `named:${startupPreference.layoutId}`;
  }, [startupPreference]);
  const closeDialog = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  const handleStartupChange = useCallback(
    (value) => {
      if (value === "session") {
        writeWorkbenchStartupPreference(appId, { kind: "session" });
      } else if (value.startsWith("preset:")) {
        writeWorkbenchStartupPreference(appId, {
          kind: "preset",
          presetId: value.slice("preset:".length)
        });
      } else if (value.startsWith("named:")) {
        writeWorkbenchStartupPreference(appId, {
          kind: "named",
          layoutId: value.slice("named:".length)
        });
      }
      onRevisionChange();
    },
    [appId, onRevisionChange]
  );
  const handleRename = useCallback(() => {
    if (!renameTargetId) {
      return;
    }
    const result = renameNamedWorkbenchLayout({
      appId,
      layoutId: renameTargetId,
      name: renameValue
    });
    if (!result.ok) {
      if (result.reason === "name_conflict") {
        setRenameError(`Name already used by \u201C${result.existing?.name}\u201D.`);
        return;
      }
      setRenameError("Enter a layout name.");
      return;
    }
    setRenameTargetId(null);
    onRevisionChange();
  }, [appId, onRevisionChange, renameTargetId, renameValue]);
  const deleteTargetName = namedLayouts.find((row) => row.id === deleteTargetId)?.name ?? "layout";
  const savedCount = namedLayouts.length;
  const libraryFull = savedCount >= MAX_NAMED_WORKBENCH_LAYOUTS;
  const activeStartupLabel = startupLabel(startupPreference, presets, namedLayouts);
  if (!open) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      TRNWindow,
      {
        open: open && renameTargetId == null,
        title: "Manage layouts",
        prefixIcon: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4 text-cyan-300/90", strokeWidth: 2, "aria-hidden": true }),
        onClose: closeDialog,
        initialRect: manageRect,
        minWidth: 400,
        minHeight: 360,
        modal: true,
        modalBackdropCloses: false,
        draggable: false,
        resizable: false,
        showMaximize: false,
        showFooter: false,
        glass: true,
        glassPreset: "medium",
        zIndex: 6200,
        contentClassName: "min-h-0 overflow-hidden",
        children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-1 flex-col gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-zinc-700/70 bg-zinc-950/55 p-2.5", children: [
            /* @__PURE__ */ jsx(
              TRNFormField,
              {
                label: "Startup layout",
                hint: "Applied when this workspace opens (after built-in presets and saved layouts).",
                children: /* @__PURE__ */ jsx(
                  TRNSelect,
                  {
                    ariaLabel: "Startup layout",
                    size: "sm",
                    value: startupSelectValue,
                    options: startupOptions,
                    onValueChange: handleStartupChange
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "truncate text-[10px] text-zinc-500", children: [
                "Active: ",
                /* @__PURE__ */ jsx("span", { className: "text-zinc-300", children: activeStartupLabel })
              ] }),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: twMerge(
                    "shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold tracking-wide",
                    libraryFull ? "border-amber-500/35 bg-amber-950/40 text-amber-200/90" : "border-zinc-600/80 bg-zinc-900/80 text-zinc-300"
                  ),
                  children: [
                    savedCount,
                    " / ",
                    MAX_NAMED_WORKBENCH_LAYOUTS,
                    " saved"
                  ]
                }
              )
            ] })
          ] }),
          importError ? /* @__PURE__ */ jsx("p", { className: "text-[11px] leading-snug text-amber-300/90", children: importError }) : null,
          /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto scrollbar-hide rounded-md border border-zinc-700/70 bg-zinc-950/40", children: namedLayouts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 px-4 py-10 text-center", children: [
            /* @__PURE__ */ jsx(FolderOpen, { className: "h-8 w-8 text-zinc-600", strokeWidth: 1.5, "aria-hidden": true }),
            /* @__PURE__ */ jsx("p", { className: "text-[12px] font-medium text-zinc-400", children: "No saved layouts yet" }),
            /* @__PURE__ */ jsx("p", { className: "max-w-xs text-[11px] leading-snug text-zinc-500", children: "Use Layout \u2192 Save current layout as\u2026 to add one, then load or set it as startup here." })
          ] }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-zinc-800/80", children: namedLayouts.map((row, index) => {
            const isStartup = startupPreference.kind === "named" && startupPreference.layoutId === row.id;
            const paneSummary = summarizeWorkbenchLayoutPanes(row.layout);
            return /* @__PURE__ */ jsxs(
              "li",
              {
                className: twMerge(
                  "flex items-start gap-2 px-2.5 py-2 transition-colors",
                  isStartup ? "bg-amber-950/15" : "hover:bg-zinc-900/35"
                ),
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                      isStartup ? /* @__PURE__ */ jsx(
                        Star,
                        {
                          className: "size-3 shrink-0 text-amber-300/90",
                          "aria-hidden": true
                        }
                      ) : /* @__PURE__ */ jsx("span", { className: "size-3 shrink-0", "aria-hidden": true }),
                      /* @__PURE__ */ jsx("span", { className: "truncate text-[12px] font-medium text-zinc-100", children: row.name }),
                      isStartup ? /* @__PURE__ */ jsx("span", { className: "shrink-0 rounded border border-amber-500/30 bg-amber-950/40 px-1 py-px text-[8px] font-semibold tracking-wide text-amber-200/90", children: "Startup" }) : null
                    ] }),
                    paneSummary.length > 0 ? /* @__PURE__ */ jsx("p", { className: "truncate pl-4 text-[10px] text-zinc-500", children: paneSummary }) : null
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-wrap items-center justify-end gap-0.5", children: [
                    /* @__PURE__ */ jsx(
                      TRNButton,
                      {
                        size: "compact",
                        selected: true,
                        className: "px-2",
                        onClick: () => onLoadNamed(row.id),
                        children: "Load"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TRNButton,
                      {
                        size: "compact",
                        className: "px-1.5",
                        hint: "Rename",
                        onClick: () => {
                          setRenameTargetId(row.id);
                          setRenameValue(row.name);
                          setRenameError(null);
                        },
                        children: /* @__PURE__ */ jsx(Pencil, { className: "size-3", "aria-hidden": true })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TRNButton,
                      {
                        size: "compact",
                        className: "px-1.5",
                        hint: "Duplicate",
                        disabled: libraryFull,
                        onClick: () => {
                          duplicateNamedWorkbenchLayout(appId, row.id);
                          onRevisionChange();
                        },
                        children: /* @__PURE__ */ jsx(Copy, { className: "size-3", "aria-hidden": true })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TRNButton,
                      {
                        size: "compact",
                        className: "px-1.5",
                        hint: "Export JSON",
                        onClick: () => onExportSnapshot(row.id),
                        children: /* @__PURE__ */ jsx(Download, { className: "size-3", "aria-hidden": true })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TRNButton,
                      {
                        size: "compact",
                        className: "px-1.5",
                        hint: "Move up",
                        disabled: index === 0,
                        onClick: () => {
                          reorderNamedWorkbenchLayout(appId, row.id, -1);
                          onRevisionChange();
                        },
                        children: /* @__PURE__ */ jsx(ArrowUp, { className: "size-3", "aria-hidden": true })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TRNButton,
                      {
                        size: "compact",
                        className: "px-1.5",
                        hint: "Move down",
                        disabled: index === namedLayouts.length - 1,
                        onClick: () => {
                          reorderNamedWorkbenchLayout(appId, row.id, 1);
                          onRevisionChange();
                        },
                        children: /* @__PURE__ */ jsx(ArrowDown, { className: "size-3", "aria-hidden": true })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TRNButton,
                      {
                        size: "compact",
                        className: "px-1.5",
                        hint: "Delete",
                        onClick: () => setDeleteTargetId(row.id),
                        children: /* @__PURE__ */ jsx(Trash2, { className: "size-3 text-rose-300/90", "aria-hidden": true })
                      }
                    )
                  ] })
                ]
              },
              row.id
            );
          }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-2", children: [
            /* @__PURE__ */ jsx(TRNButton, { size: "compact", onClick: onImportPick, children: "Import layout\u2026" }),
            /* @__PURE__ */ jsx(TRNButton, { size: "compact", onClick: closeDialog, children: "Close" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      TRNWindow,
      {
        open: renameTargetId != null,
        title: "Rename layout",
        prefixIcon: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4 text-cyan-300/90", strokeWidth: 2, "aria-hidden": true }),
        onClose: () => setRenameTargetId(null),
        initialRect: renameRect,
        minWidth: 320,
        minHeight: 200,
        modal: true,
        modalBackdropCloses: false,
        draggable: false,
        resizable: false,
        showMaximize: false,
        showFooter: false,
        glass: true,
        glassPreset: "medium",
        zIndex: 6300,
        contentClassName: "min-h-0 overflow-hidden",
        children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-1 flex-col gap-3", children: [
          /* @__PURE__ */ jsx(
            TRNFormField,
            {
              id: "workbench-rename-layout-name",
              label: "Layout name",
              required: true,
              error: renameError ?? void 0,
              children: /* @__PURE__ */ jsx(
                "input",
                {
                  id: "workbench-rename-layout-name",
                  type: "text",
                  value: renameValue,
                  autoFocus: true,
                  maxLength: 48,
                  className: WORKBENCH_LAYOUT_FIELD_INPUT_CLASS,
                  onChange: (event) => {
                    setRenameValue(event.target.value);
                    setRenameError(null);
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Enter" && normalizeWorkbenchLayoutName(renameValue)) {
                      event.preventDefault();
                      handleRename();
                    }
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-auto flex justify-end gap-2 border-t border-zinc-800/80 pt-2", children: [
            /* @__PURE__ */ jsx(TRNButton, { size: "compact", onClick: () => setRenameTargetId(null), children: "Cancel" }),
            /* @__PURE__ */ jsx(
              TRNButton,
              {
                size: "compact",
                selected: true,
                disabled: !normalizeWorkbenchLayoutName(renameValue),
                onClick: handleRename,
                children: "Rename"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs(
      TRNMessageDialog,
      {
        open: deleteTargetId != null,
        onOpenChange: (next) => {
          if (!next) {
            setDeleteTargetId(null);
          }
        },
        title: "Delete saved layout?",
        variant: "warning",
        primaryTone: "danger",
        primaryAction: {
          label: "Delete",
          onClick: () => {
            if (deleteTargetId) {
              deleteNamedWorkbenchLayout(appId, deleteTargetId);
              if (startupPreference.kind === "named" && startupPreference.layoutId === deleteTargetId) {
                writeWorkbenchStartupPreference(appId, { kind: "session" });
              }
              onRevisionChange();
            }
            setDeleteTargetId(null);
          }
        },
        secondaryAction: {
          label: "Cancel",
          onClick: () => setDeleteTargetId(null)
        },
        children: [
          "Remove ",
          /* @__PURE__ */ jsx("strong", { className: "text-zinc-100", children: deleteTargetName }),
          " from your layout library?"
        ]
      }
    )
  ] });
}

// src/dock-size-persistence.ts
var STORAGE_PREFIX2 = "trn_workbench_dock_";
function loadPersistedDockSizeMemory(key) {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX2}${key}`);
    if (!saved) {
      return {};
    }
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}
function savePersistedDockSizeMemory(key, memory, options) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX2}${key}`, JSON.stringify(memory));
    if (options?.mirror !== false) {
      notifyWorkbenchHostMirrorDirty(key);
    }
  } catch {
  }
}
function clearPersistedDockSizeMemory(key) {
  localStorage.removeItem(`${STORAGE_PREFIX2}${key}`);
}

// src/layout-history.ts
var DEFAULT_MAX = 40;
var past = [];
var future = [];
var skipDepth = 0;
function getMaxSteps() {
  const raw = globalThis.__layoutHistoryMaxSteps;
  return Math.max(10, Math.min(100, Math.round(raw ?? DEFAULT_MAX)));
}
function trim() {
  const max = getMaxSteps();
  if (past.length > max) {
    past = past.slice(past.length - max);
  }
  if (future.length > max) {
    future = future.slice(future.length - max);
  }
}
function layoutsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function pushLayoutHistory(before) {
  if (skipDepth > 0) {
    return;
  }
  const last = past[past.length - 1];
  if (last && layoutsEqual(last, before)) {
    return;
  }
  past.push(structuredClone(before));
  future = [];
  trim();
}
function runWithoutLayoutHistory(fn) {
  skipDepth++;
  try {
    fn();
  } finally {
    skipDepth = Math.max(0, skipDepth - 1);
  }
}
function undoLayout(current) {
  const prev = past.pop();
  if (!prev) {
    return null;
  }
  future.push(structuredClone(current));
  trim();
  return prev;
}
function redoLayout(current) {
  const next = future.pop();
  if (!next) {
    return null;
  }
  past.push(structuredClone(current));
  trim();
  return next;
}
function canUndoLayout() {
  return past.length > 0;
}
function canRedoLayout() {
  return future.length > 0;
}
function clearLayoutHistory() {
  past = [];
  future = [];
}

// src/workbench-keyboard.ts
function cycleCollapsedPaneFocus(collapsedIds, currentFocusId, direction) {
  if (collapsedIds.length === 0) {
    return null;
  }
  if (!currentFocusId || !collapsedIds.includes(currentFocusId)) {
    return collapsedIds[direction === 1 ? 0 : collapsedIds.length - 1];
  }
  const index = collapsedIds.indexOf(currentFocusId);
  const next = (index + direction + collapsedIds.length) % collapsedIds.length;
  return collapsedIds[next] ?? null;
}
function resolveCollapseTargetPaneId(layout, activePaneId) {
  if (!activePaneId) {
    return null;
  }
  const editor = findEditorNode(layout, activePaneId);
  if (!editor || editor.collapsed) {
    return null;
  }
  return activePaneId;
}
function resolveExpandTargetPaneId(layout, activePaneId, collapsedFocusId) {
  const collapsed = collectCollapsedEditorIds(layout);
  if (collapsed.length === 0) {
    return null;
  }
  if (activePaneId) {
    const active = findEditorNode(layout, activePaneId);
    if (active?.collapsed) {
      return activePaneId;
    }
  }
  if (collapsedFocusId && collapsed.includes(collapsedFocusId)) {
    return collapsedFocusId;
  }
  return collapsed[0] ?? null;
}
function applyWorkbenchCollapse(layout, paneId) {
  return collapseEditorPane(layout, paneId);
}
function applyWorkbenchExpand(layout, paneId) {
  return expandEditorPane(layout, paneId);
}

// src/workbench-dock-size-memory.ts
var clampRatio = (ratio) => Math.max(0.05, Math.min(0.95, ratio));
function dockSplitMemoryKey(incomingType, targetType, zone) {
  return `${incomingType}|${targetType}|${zone}`;
}
function workbenchEdgeMemoryKey(editorType, zone) {
  return `__edge__|${editorType}|${zone}`;
}
function resolveDockSplitRatio(memory, incomingType, targetType, zone, fallback) {
  if (zone === "center") {
    return fallback;
  }
  const stored = memory[dockSplitMemoryKey(incomingType, targetType, zone)];
  return stored != null && Number.isFinite(stored) ? clampRatio(stored) : fallback;
}
function resolveWorkbenchEdgeRatio(memory, editorType, zone, fallback) {
  const stored = memory[workbenchEdgeMemoryKey(editorType, zone)];
  return stored != null && Number.isFinite(stored) ? clampRatio(stored) : fallback;
}
function rememberDockSplitRatio(memory, incomingType, targetType, zone, ratio) {
  if (zone === "center") {
    return memory;
  }
  const key = dockSplitMemoryKey(incomingType, targetType, zone);
  return { ...memory, [key]: clampRatio(ratio) };
}
function rememberWorkbenchEdgeRatio(memory, editorType, zone, ratio) {
  return { ...memory, [workbenchEdgeMemoryKey(editorType, zone)]: clampRatio(ratio) };
}
function rememberSplitResizeRatio(memory, firstType, secondType, direction, ratio) {
  const r = clampRatio(ratio);
  let next = { ...memory };
  if (direction === "horizontal") {
    next = { ...next, [dockSplitMemoryKey(firstType, secondType, "left")]: r };
    next = { ...next, [dockSplitMemoryKey(secondType, firstType, "right")]: r };
  } else {
    next = { ...next, [dockSplitMemoryKey(firstType, secondType, "top")]: r };
    next = { ...next, [dockSplitMemoryKey(secondType, firstType, "bottom")]: r };
  }
  return next;
}

// src/workbench-pane-maximize.ts
function buildMaximizedLayoutRoot(layout, paneId) {
  const editor = findEditorPane(layout, paneId);
  if (editor == null) {
    return null;
  }
  const tabs = findParentTabsOfEditor(layout, paneId);
  if (tabs != null) {
    const activeIndex = tabs.panes.findIndex((pane) => pane.id === paneId);
    return {
      ...tabs,
      activeIndex: activeIndex >= 0 ? activeIndex : tabs.activeIndex,
      panes: tabs.panes.map((pane) => ({ ...pane, collapsed: false }))
    };
  }
  return { ...editor, collapsed: false };
}

// src/workbench-initial-state.ts
function resolveInitialWorkbenchState(input) {
  if (input.persistenceKey == null || typeof window === "undefined" || input.ignorePersistedLayout) {
    return { layout: input.initialLayout, dockMemory: {} };
  }
  const saved = loadPersistedLayout(input.persistenceKey);
  if (saved != null) {
    return {
      layout: input.validateLayout ? input.validateLayout(saved) : saved,
      dockMemory: loadPersistedDockSizeMemory(input.persistenceKey)
    };
  }
  const startup = readWorkbenchStartupPreference(input.persistenceKey);
  if (startup.kind === "preset") {
    const preset = input.layoutPresets.find((row) => row.id === startup.presetId);
    if (preset) {
      return {
        layout: input.validateLayout ? input.validateLayout(preset.layout) : preset.layout,
        dockMemory: {}
      };
    }
  }
  if (startup.kind === "named") {
    const snapshot = getNamedWorkbenchLayout(input.persistenceKey, startup.layoutId);
    if (snapshot) {
      return {
        layout: input.validateLayout ? input.validateLayout(snapshot.layout) : snapshot.layout,
        dockMemory: structuredClone(snapshot.dockMemory ?? {})
      };
    }
  }
  return { layout: input.initialLayout, dockMemory: {} };
}

// src/vscode.ts
var isVsCodeExtensionWebviewImpl = () => false;
function configureTrnWorkbenchVscode(options) {
  isVsCodeExtensionWebviewImpl = options.isVsCodeExtensionWebview;
}
function getIsVsCodeExtensionWebview() {
  return isVsCodeExtensionWebviewImpl();
}

// src/workbench-host-pull-gate.ts
var pullCompleteWaiters = /* @__PURE__ */ new Map();
var pullCompleted = /* @__PURE__ */ new Set();
function signalWorkbenchHostPullComplete(appId) {
  pullCompleted.add(appId);
  const waiters = pullCompleteWaiters.get(appId);
  if (waiters == null) {
    return;
  }
  for (const done of waiters) {
    done();
  }
  waiters.clear();
}
function waitForWorkbenchHostPull(appId, timeoutMs = 900) {
  if (!getIsVsCodeExtensionWebview()) {
    return Promise.resolve();
  }
  if (pullCompleted.has(appId)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      waiters.delete(finish);
      resolve();
    };
    const timer = window.setTimeout(finish, timeoutMs);
    let waiters = pullCompleteWaiters.get(appId);
    if (waiters == null) {
      waiters = /* @__PURE__ */ new Set();
      pullCompleteWaiters.set(appId, waiters);
    }
    waiters.add(finish);
  });
}
function resetWorkbenchHostPullGateForTests() {
  pullCompleteWaiters.clear();
  pullCompleted.clear();
}

// src/use-managed-workbench.ts
function useManagedWorkbench({
  initialLayout,
  persistenceKey,
  persistLayout = true,
  ignorePersistedLayout = false,
  validateLayout,
  sidePanelEditorTypes = [],
  paneCommands = [],
  layoutPresets = [],
  layoutLibraryAppId,
  singletonEditorTypes,
  requiredEditorTypes,
  resolveSplitNewEditorType,
  onClearFloatingPanes
}) {
  const libraryAppId = layoutLibraryAppId ?? persistenceKey;
  const [libraryRevision, setLibraryRevision] = useState(0);
  const [layoutHydrated, setLayoutHydrated] = useState(false);
  const [layout, setLayoutState] = useState(initialLayout);
  const initialLayoutRef = useRef(initialLayout);
  initialLayoutRef.current = initialLayout;
  const [layoutCanUndo, setLayoutCanUndo] = useState(false);
  const [layoutCanRedo, setLayoutCanRedo] = useState(false);
  const [activePaneId, setActivePaneId] = useState(null);
  const [collapsedRailFocusId, setCollapsedRailFocusId] = useState(null);
  const [dockMemory, setDockMemory] = useState({});
  const [startupPreference, setStartupPreferenceState] = useState({
    kind: "session"
  });
  const layoutBeforeMaximizeRef = useRef(null);
  const [maximizedPaneId, setMaximizedPaneId] = useState(null);
  const paneMaximized = maximizedPaneId != null;
  useEffect(() => {
    if (layoutHydrated) {
      return;
    }
    if (persistenceKey == null || ignorePersistedLayout || typeof window === "undefined") {
      setLayoutHydrated(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      await waitForWorkbenchHostPull(persistenceKey);
      if (cancelled) {
        return;
      }
      const restored = resolveInitialWorkbenchState({
        initialLayout: initialLayoutRef.current,
        persistenceKey,
        ignorePersistedLayout,
        validateLayout,
        layoutPresets
      });
      setLayoutState(restored.layout);
      setDockMemory(restored.dockMemory);
      if (libraryAppId != null) {
        setStartupPreferenceState(readWorkbenchStartupPreference(libraryAppId));
      }
      setLayoutHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    ignorePersistedLayout,
    layoutHydrated,
    layoutPresets,
    libraryAppId,
    persistenceKey,
    validateLayout
  ]);
  const clearPaneMaximize = useCallback(() => {
    layoutBeforeMaximizeRef.current = null;
    setMaximizedPaneId(null);
  }, []);
  const syncHistoryFlags = useCallback(() => {
    setLayoutCanUndo(canUndoLayout());
    setLayoutCanRedo(canRedoLayout());
  }, []);
  const setLayout = useCallback(
    (action, recordHistory = true) => {
      setLayoutState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (next === prev) {
          return prev;
        }
        if (recordHistory) {
          pushLayoutHistory(prev);
        }
        syncHistoryFlags();
        return next;
      });
    },
    [syncHistoryFlags]
  );
  useEffect(() => {
    if (!layoutHydrated || !persistLayout || persistenceKey == null || typeof window === "undefined" || paneMaximized) {
      return;
    }
    savePersistedLayout(persistenceKey, layout);
  }, [layout, layoutHydrated, paneMaximized, persistLayout, persistenceKey]);
  useEffect(() => {
    if (!layoutHydrated || !persistLayout || persistenceKey == null || typeof window === "undefined") {
      return;
    }
    savePersistedDockSizeMemory(persistenceKey, dockMemory);
  }, [dockMemory, layoutHydrated, persistLayout, persistenceKey]);
  const applyLayoutSnapshot = useCallback(
    (nextLayout, nextDockMemory = {}, focusEditorType) => {
      onClearFloatingPanes?.();
      clearPaneMaximize();
      runWithoutLayoutHistory(() => {
        const validated = validateLayout ? validateLayout(nextLayout) : nextLayout;
        setLayoutState(validated);
        setDockMemory(structuredClone(nextDockMemory));
        const focusPaneId = focusEditorType != null ? findEditorPaneId(validated, focusEditorType) : null;
        setActivePaneId(focusPaneId);
        setCollapsedRailFocusId(null);
      });
      syncHistoryFlags();
    },
    [clearPaneMaximize, onClearFloatingPanes, syncHistoryFlags, validateLayout]
  );
  const loadLayoutPreset = useCallback(
    (presetId) => {
      const preset = layoutPresets.find((row) => row.id === presetId);
      if (!preset) {
        return false;
      }
      applyLayoutSnapshot(preset.layout, {});
      return true;
    },
    [applyLayoutSnapshot, layoutPresets]
  );
  const loadNamedLayout = useCallback(
    (layoutId) => {
      if (!libraryAppId) {
        return false;
      }
      const snapshot = getNamedWorkbenchLayout(libraryAppId, layoutId);
      if (!snapshot) {
        return false;
      }
      applyLayoutSnapshot(snapshot.layout, snapshot.dockMemory ?? {});
      return true;
    },
    [applyLayoutSnapshot, libraryAppId]
  );
  const deleteNamedLayout = useCallback(
    (layoutId) => {
      if (!libraryAppId) {
        return false;
      }
      const deleted = deleteNamedWorkbenchLayout(libraryAppId, layoutId);
      if (deleted) {
        setLibraryRevision((value) => value + 1);
      }
      return deleted;
    },
    [libraryAppId]
  );
  const bumpLibraryRevision = useCallback(() => {
    setLibraryRevision((value) => value + 1);
    if (libraryAppId != null && typeof window !== "undefined") {
      setStartupPreferenceState(readWorkbenchStartupPreference(libraryAppId));
    }
  }, [libraryAppId]);
  const resetLayout = useCallback(() => {
    if (persistenceKey != null && typeof window !== "undefined") {
      clearPersistedLayout(persistenceKey);
      clearPersistedDockSizeMemory(persistenceKey);
    }
    clearLayoutHistory();
    clearPaneMaximize();
    runWithoutLayoutHistory(() => {
      setLayoutState(initialLayout);
      setDockMemory({});
      setActivePaneId(null);
      setCollapsedRailFocusId(null);
    });
    syncHistoryFlags();
  }, [clearPaneMaximize, initialLayout, persistenceKey, syncHistoryFlags]);
  const undoLayoutChange = useCallback(() => {
    clearPaneMaximize();
    setLayoutState((current) => {
      const prev = undoLayout(current);
      if (!prev) {
        return current;
      }
      syncHistoryFlags();
      return prev;
    });
  }, [clearPaneMaximize, syncHistoryFlags]);
  const redoLayoutChange = useCallback(() => {
    clearPaneMaximize();
    setLayoutState((current) => {
      const next = redoLayout(current);
      if (!next) {
        return current;
      }
      syncHistoryFlags();
      return next;
    });
  }, [clearPaneMaximize, syncHistoryFlags]);
  const togglePaneMaximize = useCallback(
    (paneId) => {
      if (maximizedPaneId === paneId && layoutBeforeMaximizeRef.current != null) {
        const restored = layoutBeforeMaximizeRef.current;
        clearPaneMaximize();
        setLayout(restored, true);
        setActivePaneId(paneId);
        return;
      }
      const root = buildMaximizedLayoutRoot(layout, paneId);
      if (root == null) {
        return;
      }
      layoutBeforeMaximizeRef.current = layout;
      setMaximizedPaneId(paneId);
      setLayout(root, true);
      setActivePaneId(paneId);
    },
    [clearPaneMaximize, layout, maximizedPaneId, setLayout]
  );
  const handleClosePane = useCallback(
    (paneId) => {
      if (maximizedPaneId != null && layoutBeforeMaximizeRef.current != null) {
        const saved = layoutBeforeMaximizeRef.current;
        if (!canCloseEditorPane(saved, paneId, requiredEditorTypes)) {
          return;
        }
        clearPaneMaximize();
        setLayout(closeNode(saved, paneId), true);
        return;
      }
      setLayout((current) => {
        if (!canCloseEditorPane(current, paneId, requiredEditorTypes)) {
          return current;
        }
        return closeNode(current, paneId);
      }, true);
    },
    [clearPaneMaximize, maximizedPaneId, requiredEditorTypes, setLayout]
  );
  const collapseActivePane = useCallback(() => {
    const target = resolveCollapseTargetPaneId(layout, activePaneId);
    if (!target) {
      return;
    }
    setLayout(applyWorkbenchCollapse(layout, target));
    setCollapsedRailFocusId(target);
  }, [activePaneId, layout, setLayout]);
  const expandPaneTarget = useCallback(() => {
    const target = resolveExpandTargetPaneId(layout, activePaneId, collapsedRailFocusId);
    if (!target) {
      return;
    }
    setLayout(applyWorkbenchExpand(layout, target));
    setActivePaneId(target);
    setCollapsedRailFocusId(null);
  }, [activePaneId, collapsedRailFocusId, layout, setLayout]);
  const cycleCollapsedRailFocus = useCallback(
    (direction) => {
      const collapsed = collectCollapsedEditorIds(layout);
      const nextFocus = cycleCollapsedPaneFocus(collapsed, collapsedRailFocusId, direction);
      if (nextFocus) {
        setCollapsedRailFocusId(nextFocus);
      }
    },
    [collapsedRailFocusId, layout]
  );
  const focusOrOpenPane = useCallback(
    (editorType) => {
      let nextLayout = layout;
      const existingId = findEditorPaneId(nextLayout, editorType);
      if (existingId) {
        const editor = findEditorNode(nextLayout, existingId);
        if (editor?.collapsed) {
          nextLayout = expandEditorPane(nextLayout, existingId);
          setLayout(nextLayout, false);
        }
        setActivePaneId(existingId);
        setCollapsedRailFocusId(null);
        return;
      }
      const anchor = activePaneId && findEditorNode(nextLayout, activePaneId) ? activePaneId : findEditorPaneId(nextLayout, paneCommands[0]?.editorType ?? "flow") ?? collectEditorPanes(nextLayout)[0]?.id;
      if (!anchor) {
        return;
      }
      nextLayout = splitNodeWithEditor(nextLayout, anchor, "horizontal", editorType, 0.55);
      setLayout(nextLayout);
      const newId = findEditorPaneId(nextLayout, editorType);
      if (newId) {
        setActivePaneId(newId);
        setCollapsedRailFocusId(null);
      }
    },
    [activePaneId, layout, paneCommands, setLayout]
  );
  const collapseSidePanels = useCallback(() => {
    let next = layout;
    const panes = collectEditorPanes(next).filter(
      (pane) => sidePanelEditorTypes.includes(pane.editorType) && !pane.collapsed
    );
    if (panes.length === 0) {
      return;
    }
    for (const pane of panes) {
      next = collapseEditorPane(next, pane.id);
    }
    setLayout(next);
  }, [layout, setLayout, sidePanelEditorTypes]);
  const expandSidePanels = useCallback(() => {
    let next = layout;
    const panes = collectEditorPanes(next).filter(
      (pane) => sidePanelEditorTypes.includes(pane.editorType) && pane.collapsed
    );
    if (panes.length === 0) {
      return;
    }
    for (const pane of panes) {
      next = expandEditorPane(next, pane.id);
    }
    setLayout(next);
  }, [layout, setLayout, sidePanelEditorTypes]);
  const duplicateActivePane = useCallback(() => {
    if (!activePaneId) {
      return;
    }
    const editor = findEditorNode(layout, activePaneId);
    if (!editor || editor.collapsed) {
      return;
    }
    if (singletonEditorTypes?.includes(editor.editorType)) {
      return;
    }
    const next = splitNodeWithEditor(layout, activePaneId, "horizontal", editor.editorType, 0.5);
    setLayout(next);
    const newId = findEditorPaneId(next, editor.editorType);
    if (newId && newId !== activePaneId) {
      setActivePaneId(newId);
    }
  }, [activePaneId, layout, setLayout, singletonEditorTypes]);
  const commandItems = useMemo(() => {
    const presetItems = layoutPresets.map((preset) => ({
      id: `preset-${preset.id}`,
      group: "Presets",
      label: `Layout: ${preset.label}`,
      keywords: `${preset.id} ${preset.description} preset layout`
    }));
    const namedLayouts = libraryAppId != null ? listNamedWorkbenchLayoutsSorted(libraryAppId) : [];
    const myLayoutItems = namedLayouts.flatMap((row) => [
      {
        id: `load-layout-${row.id}`,
        group: "My layouts",
        label: `Load: ${row.name}`,
        keywords: `${row.name} saved layout load`
      },
      {
        id: `delete-layout-${row.id}`,
        group: "My layouts",
        label: `Delete: ${row.name}`,
        keywords: `${row.name} saved layout delete remove`
      }
    ]);
    const libraryItems = libraryAppId != null ? [
      {
        id: "layout-save-as",
        group: "Layout library",
        label: "Save current layout as\u2026",
        keywords: "save layout library named"
      },
      {
        id: "layout-manage",
        group: "Layout library",
        label: "Manage layouts\u2026",
        keywords: "manage rename duplicate reorder startup"
      },
      {
        id: "layout-export-current",
        group: "Layout library",
        label: "Export current layout\u2026",
        keywords: "export layout json download"
      },
      {
        id: "layout-import",
        group: "Layout library",
        label: "Import layout\u2026",
        keywords: "import layout json upload"
      }
    ] : [];
    const layoutItems = [
      {
        id: "layout-undo",
        group: "Layout",
        label: "Undo layout change",
        shortcut: "Ctrl+Alt+Z",
        disabled: !layoutCanUndo,
        keywords: "undo layout"
      },
      {
        id: "layout-redo",
        group: "Layout",
        label: "Redo layout change",
        shortcut: "Ctrl+Alt+Shift+Z",
        disabled: !layoutCanRedo,
        keywords: "redo layout"
      },
      {
        id: "layout-reset",
        group: "Layout",
        label: "Reset workbench layout",
        keywords: "reset default layout"
      },
      {
        id: "layout-collapse-active",
        group: "Layout",
        label: "Collapse active pane",
        shortcut: "Ctrl+Shift+C",
        keywords: "collapse hide rail"
      },
      {
        id: "layout-expand-target",
        group: "Layout",
        label: "Expand collapsed pane",
        shortcut: "Ctrl+Shift+E",
        keywords: "expand show rail"
      },
      {
        id: "layout-collapse-sides",
        group: "Layout",
        label: "Collapse side panels",
        keywords: "collapse sides hide"
      },
      {
        id: "layout-expand-sides",
        group: "Layout",
        label: "Expand side panels",
        keywords: "expand sides show"
      },
      {
        id: "layout-duplicate-pane",
        group: "Layout",
        label: "Duplicate active pane",
        shortcut: "Ctrl+Shift+D",
        keywords: "duplicate clone split"
      }
    ];
    const paneItems = paneCommands.map((pane) => ({
      id: `open-${pane.editorType}`,
      group: "Panes",
      label: pane.label,
      keywords: pane.keywords ?? pane.editorType
    }));
    return [...presetItems, ...libraryItems, ...myLayoutItems, ...layoutItems, ...paneItems];
  }, [
    layoutCanRedo,
    layoutCanUndo,
    layoutPresets,
    libraryAppId,
    libraryRevision,
    paneCommands
  ]);
  const runCommand = useCallback(
    (commandId, floatActivePane) => {
      if (commandId.startsWith("preset-")) {
        loadLayoutPreset(commandId.slice("preset-".length));
        return { kind: "handled" };
      }
      if (commandId.startsWith("load-layout-")) {
        loadNamedLayout(commandId.slice("load-layout-".length));
        return { kind: "handled" };
      }
      if (commandId.startsWith("delete-layout-")) {
        const layoutId = commandId.slice("delete-layout-".length);
        if (!libraryAppId) {
          return { kind: "handled" };
        }
        const snapshot = getNamedWorkbenchLayout(libraryAppId, layoutId);
        if (!snapshot) {
          return { kind: "handled" };
        }
        return {
          kind: "confirm-delete",
          layoutId,
          layoutName: snapshot.name
        };
      }
      if (commandId === "layout-save-as") {
        return { kind: "open-save-dialog" };
      }
      if (commandId === "layout-manage") {
        return { kind: "open-manage-panel" };
      }
      if (commandId === "layout-export-current") {
        return { kind: "export-current" };
      }
      if (commandId === "layout-import") {
        return { kind: "trigger-import" };
      }
      switch (commandId) {
        case "layout-undo":
          undoLayoutChange();
          return { kind: "handled" };
        case "layout-redo":
          redoLayoutChange();
          return { kind: "handled" };
        case "layout-reset":
          resetLayout();
          return { kind: "handled" };
        case "layout-collapse-active":
          collapseActivePane();
          return { kind: "handled" };
        case "layout-expand-target":
          expandPaneTarget();
          return { kind: "handled" };
        case "layout-collapse-sides":
          collapseSidePanels();
          return { kind: "handled" };
        case "layout-expand-sides":
          expandSidePanels();
          return { kind: "handled" };
        case "layout-duplicate-pane":
          duplicateActivePane();
          return { kind: "handled" };
        case "layout-float-pane":
          floatActivePane?.();
          return { kind: "handled" };
        default:
          if (commandId.startsWith("open-")) {
            focusOrOpenPane(commandId.slice("open-".length));
          }
          return { kind: "handled" };
      }
    },
    [
      collapseActivePane,
      collapseSidePanels,
      duplicateActivePane,
      expandPaneTarget,
      expandSidePanels,
      focusOrOpenPane,
      libraryAppId,
      loadLayoutPreset,
      loadNamedLayout,
      redoLayoutChange,
      resetLayout,
      undoLayoutChange
    ]
  );
  const workbenchProps = useMemo(() => ({
    layout,
    onLayoutChange: (next) => setLayout(next),
    activePaneId,
    collapsedRailFocusId,
    onPaneActivate: setActivePaneId,
    onClosePane: handleClosePane,
    onTogglePaneMaximize: togglePaneMaximize,
    paneMaximized,
    resolveDockSplitRatio: (incomingType, targetType, zone, fallback = 0.55) => resolveDockSplitRatio(dockMemory, incomingType, targetType, zone, fallback),
    resolveEdgeDockRatio: (editorType, zone, fallback) => resolveWorkbenchEdgeRatio(
      dockMemory,
      editorType,
      zone,
      fallback ?? WORKBENCH_EDGE_DOCK_RATIO[zone]
    ),
    onDockSplitApplied: (incomingType, targetType, zone, ratio) => {
      setDockMemory(
        (memory) => rememberDockSplitRatio(memory, incomingType, targetType, zone, ratio)
      );
    },
    onEdgeDockApplied: (editorType, zone, ratio) => {
      setDockMemory((memory) => rememberWorkbenchEdgeRatio(memory, editorType, zone, ratio));
    },
    onSplitResized: (firstType, secondType, direction, ratio) => {
      setDockMemory(
        (memory) => rememberSplitResizeRatio(memory, firstType, secondType, direction, ratio)
      );
    },
    singletonEditorTypes,
    requiredEditorTypes,
    resolveSplitNewEditorType
  }), [
    activePaneId,
    collapsedRailFocusId,
    dockMemory,
    handleClosePane,
    layout,
    paneMaximized,
    requiredEditorTypes,
    resolveSplitNewEditorType,
    setLayout,
    singletonEditorTypes,
    togglePaneMaximize
  ]);
  return {
    layout,
    setLayout,
    dockMemory,
    resetLayout,
    undoLayoutChange,
    redoLayoutChange,
    layoutCanUndo,
    layoutCanRedo,
    collapseActivePane,
    expandPaneTarget,
    cycleCollapsedRailFocus,
    focusOrOpenPane,
    duplicateActivePane,
    loadLayoutPreset,
    loadNamedLayout,
    deleteNamedLayout,
    bumpLibraryRevision,
    applyLayoutSnapshot,
    commandItems,
    runCommand,
    workbenchProps,
    activePaneId,
    libraryAppId,
    startupPreference,
    libraryRevision
  };
}
var WorkbenchCommandOverlay = memo(function WorkbenchCommandOverlay2({
  open,
  onClose,
  onSelect,
  items,
  title = "Workbench commands"
}) {
  if (!open) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[6000] flex items-start justify-center bg-black/55 p-4 pt-[12vh] backdrop-blur-[2px]", children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-lg overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/50", children: /* @__PURE__ */ jsx(
    TRNCommandPalette,
    {
      open,
      onClose,
      onSelect,
      items,
      title,
      placeholder: "Search layout or pane commands\u2026",
      zIndex: 6001
    }
  ) }) });
});
var SAVE_LAYOUT_DIALOG_WIDTH_PX = 420;
var SAVE_LAYOUT_DIALOG_HEIGHT_PX = 340;
function WorkbenchSaveLayoutDialog({
  open,
  onOpenChange,
  appId,
  layout,
  dockMemory,
  onSaved
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [overwriteName, setOverwriteName] = useState(null);
  const [initialRect, setInitialRect] = useState(
    () => computeCenteredWorkbenchDialogRect(
      SAVE_LAYOUT_DIALOG_WIDTH_PX,
      SAVE_LAYOUT_DIALOG_HEIGHT_PX
    )
  );
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    setInitialRect(
      computeCenteredWorkbenchDialogRect(
        SAVE_LAYOUT_DIALOG_WIDTH_PX,
        SAVE_LAYOUT_DIALOG_HEIGHT_PX
      )
    );
  }, [open]);
  useEffect(() => {
    if (!open) {
      setName("");
      setError(null);
      setOverwriteName(null);
    }
  }, [open]);
  const savedCount = useMemo(
    () => open ? listNamedWorkbenchLayouts(appId).length : 0,
    [appId, open]
  );
  const paneSummary = useMemo(() => summarizeWorkbenchLayoutPanes(layout), [layout]);
  const libraryFull = savedCount >= MAX_NAMED_WORKBENCH_LAYOUTS;
  const canSave = normalizeWorkbenchLayoutName(name).length > 0 && !libraryFull;
  const closeDialog = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  const attemptSave = useCallback(
    (allowOverwrite) => {
      const result = saveNamedWorkbenchLayout({
        appId,
        name,
        layout,
        dockMemory,
        allowOverwrite
      });
      if (!result.ok) {
        if (result.reason === "name_conflict" && result.existing) {
          setOverwriteName(result.existing.name);
          return;
        }
        if (result.reason === "library_full") {
          setError(`Library full (${MAX_NAMED_WORKBENCH_LAYOUTS} layouts). Delete one in Manage layouts.`);
          return;
        }
        setError("Enter a layout name.");
        return;
      }
      onSaved(result.snapshot.name);
      onOpenChange(false);
    },
    [appId, dockMemory, layout, name, onOpenChange, onSaved]
  );
  if (!open) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      TRNWindow,
      {
        open: open && overwriteName == null,
        title: "Save layout",
        prefixIcon: /* @__PURE__ */ jsx(LayoutTemplate, { className: "h-4 w-4 text-cyan-300/90", strokeWidth: 2, "aria-hidden": true }),
        onClose: closeDialog,
        initialRect,
        minWidth: 320,
        minHeight: 280,
        modal: true,
        modalBackdropCloses: false,
        draggable: false,
        resizable: false,
        showMaximize: false,
        showFooter: false,
        glass: true,
        glassPreset: "medium",
        zIndex: 6100,
        contentClassName: "min-h-0 overflow-hidden",
        children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-1 flex-col gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-zinc-700/70 bg-zinc-950/55 p-2.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-500/25 bg-cyan-950/35 text-cyan-200/90",
                  "aria-hidden": true,
                  children: /* @__PURE__ */ jsx(PanelsTopLeft, { className: "h-4 w-4", strokeWidth: 2 })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-zinc-100", children: "Current arrangement" }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] leading-snug text-zinc-400", children: "Saves open panes, tab groups, split ratios, and dock sizes for this workspace." }),
                paneSummary.length > 0 ? /* @__PURE__ */ jsx("p", { className: "truncate text-[10px] text-zinc-500", children: paneSummary }) : null
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-zinc-500", children: "Named layouts" }),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: twMerge(
                    "rounded border px-1.5 py-px text-[10px] font-semibold tracking-wide",
                    libraryFull ? "border-amber-500/35 bg-amber-950/40 text-amber-200/90" : "border-zinc-600/80 bg-zinc-900/80 text-zinc-300"
                  ),
                  children: [
                    savedCount,
                    " / ",
                    MAX_NAMED_WORKBENCH_LAYOUTS
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            TRNFormField,
            {
              id: "workbench-save-layout-name",
              label: "Layout name",
              required: true,
              hint: "Shown in Layout \u2192 Manage layouts and startup picker.",
              error: error ?? void 0,
              children: /* @__PURE__ */ jsx(
                "input",
                {
                  id: "workbench-save-layout-name",
                  type: "text",
                  value: name,
                  autoFocus: true,
                  maxLength: 48,
                  disabled: libraryFull,
                  className: WORKBENCH_LAYOUT_FIELD_INPUT_CLASS,
                  placeholder: "e.g. Graph authoring",
                  onChange: (e) => {
                    setName(e.target.value);
                    setError(null);
                  },
                  onKeyDown: (e) => {
                    if (e.key === "Enter" && canSave) {
                      e.preventDefault();
                      attemptSave(false);
                    }
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-zinc-800/80 pt-2", children: [
            /* @__PURE__ */ jsx(TRNButton, { size: "compact", onClick: closeDialog, children: "Cancel" }),
            /* @__PURE__ */ jsx(
              TRNButton,
              {
                size: "compact",
                selected: true,
                disabled: !canSave,
                onClick: () => attemptSave(false),
                children: "Save layout"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs(
      TRNMessageDialog,
      {
        open: overwriteName != null,
        onOpenChange: (next) => {
          if (!next) {
            setOverwriteName(null);
          }
        },
        title: "Replace saved layout?",
        variant: "warning",
        primaryTone: "default",
        primaryAction: {
          label: "Replace",
          onClick: () => {
            attemptSave(true);
            setOverwriteName(null);
          }
        },
        secondaryAction: {
          label: "Cancel",
          onClick: () => setOverwriteName(null)
        },
        children: [
          "A layout named ",
          /* @__PURE__ */ jsx("strong", { className: "text-zinc-100", children: overwriteName }),
          " already exists. Replace it with the current pane arrangement?"
        ]
      }
    )
  ] });
}
function isTypingTarget(target) {
  const el = target;
  return Boolean(el?.closest("input, textarea, select, [contenteditable=true]"));
}
function useWorkbenchKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const onKeyDown = (event) => {
      if (isTypingTarget(event.target)) {
        return;
      }
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.shiftKey && !event.altKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        handlers.onOpenCommandPalette();
        return;
      }
      if (mod && event.shiftKey && !event.altKey) {
        if (event.key === "[" || event.key === "{") {
          event.preventDefault();
          handlers.cycleCollapsedRailFocus(-1);
          return;
        }
        if (event.key === "]" || event.key === "}") {
          event.preventDefault();
          handlers.cycleCollapsedRailFocus(1);
          return;
        }
        const shiftKey = event.key.toLowerCase();
        if (shiftKey === "c") {
          event.preventDefault();
          handlers.collapseActivePane();
          return;
        }
        if (shiftKey === "e") {
          event.preventDefault();
          handlers.expandPaneTarget();
          return;
        }
        if (shiftKey === "d") {
          event.preventDefault();
          handlers.duplicateActivePane();
          return;
        }
      }
      if (mod && event.altKey && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        handlers.undoLayoutChange();
        return;
      }
      if (mod && event.altKey && event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        handlers.redoLayoutChange();
        return;
      }
      if (event.altKey && !mod && !event.shiftKey && !event.repeat) {
        if (event.code === "KeyP") {
          event.preventDefault();
          handlers.togglePaneByEditorType?.("library");
          return;
        }
        if (event.code === "KeyI") {
          event.preventDefault();
          handlers.togglePaneByEditorType?.("inspector");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, handlers]);
}

// src/install-workbench-layout-host-sync.ts
var WORKBENCH_HOST_MIRROR_VERSION = 1;
var MSG_PULL = "workbench-layout-host-pull";
var MSG_PUSH = "workbench-layout-host-push";
var MSG_RESP = "workbench-layout-host-response";
function serializeWorkbenchHostMirror(appId) {
  const payload = {
    version: WORKBENCH_HOST_MIRROR_VERSION,
    appId,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    library: readWorkbenchLayoutLibrary(appId),
    startup: readWorkbenchStartupPreference(appId),
    sessionLayout: loadPersistedLayout(appId) ?? void 0,
    sessionDock: loadPersistedDockSizeMemory(appId)
  };
  return JSON.stringify(payload);
}
function isHostMirror(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value;
  return row.version === WORKBENCH_HOST_MIRROR_VERSION && typeof row.appId === "string";
}
function localLibraryEmpty(appId) {
  return readWorkbenchLayoutLibrary(appId).layouts.length === 0;
}
function applyHostMirror(mirror) {
  const quiet = { mirror: false };
  if (mirror.library && localLibraryEmpty(mirror.appId)) {
    writeWorkbenchLayoutLibrary(mirror.library, quiet);
  }
  if (mirror.startup && !hasStoredWorkbenchStartupPreference(mirror.appId)) {
    writeWorkbenchStartupPreference(mirror.appId, mirror.startup, quiet);
  }
  if (mirror.sessionLayout && loadPersistedLayout(mirror.appId) == null) {
    savePersistedLayout(mirror.appId, mirror.sessionLayout, quiet);
    if (mirror.sessionDock) {
      savePersistedDockSizeMemory(mirror.appId, mirror.sessionDock, quiet);
    }
  }
}
function installWorkbenchLayoutHostSync(appId) {
  if (!getIsVsCodeExtensionWebview()) {
    signalWorkbenchHostPullComplete(appId);
    return () => {
    };
  }
  const w = window;
  const vscode = w.__VSCODE_API__;
  if (!vscode?.postMessage) {
    signalWorkbenchHostPullComplete(appId);
    return () => {
    };
  }
  let debounceTimer = null;
  let lastPushed = "";
  const flushPush = () => {
    const next = serializeWorkbenchHostMirror(appId);
    if (next === lastPushed) {
      return;
    }
    lastPushed = next;
    vscode.postMessage({ type: MSG_PUSH, appId, configJson: next });
  };
  const schedulePush = () => {
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      flushPush();
    }, 480);
  };
  const onMessage = (event) => {
    const data = event.data;
    if (!data || data.type !== MSG_RESP || data.appId !== appId) {
      return;
    }
    try {
      if (typeof data.error === "string" && data.error.length > 0) {
        return;
      }
      if (typeof data.configJson === "string" && data.configJson.trim().length > 0) {
        const parsed = JSON.parse(data.configJson);
        if (isHostMirror(parsed) && parsed.appId === appId) {
          applyHostMirror(parsed);
        }
      }
    } catch {
    } finally {
      lastPushed = serializeWorkbenchHostMirror(appId);
      signalWorkbenchHostPullComplete(appId);
    }
  };
  window.addEventListener("message", onMessage);
  vscode.postMessage({ type: MSG_PULL, appId });
  const unregisterPush = registerWorkbenchHostMirrorPush(appId, schedulePush);
  return () => {
    unregisterPush();
    window.removeEventListener("message", onMessage);
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
    }
  };
}
var StandaloneWorkbench = memo(
  forwardRef(function StandaloneWorkbench2({
    initialLayout,
    registry,
    persistenceKey,
    persistLayout = true,
    ignorePersistedLayout = false,
    enableFloating = true,
    enableCommandPalette = true,
    onDetachRejected,
    onDockBackResult,
    validateLayout,
    className = "ternion-workbench flex min-h-0 min-w-0 flex-1 flex-col",
    sidePanelEditorTypes = [],
    paneCommands = [],
    layoutPresets = [],
    singletonEditorTypes,
    requiredEditorTypes,
    resolveSplitNewEditorType,
    togglePaneByEditorType,
    onLayoutMenuPropsChange,
    onActiveEditorTypeChange,
    onWorkbenchLayoutChange,
    onWorkbenchSessionChange
  }, ref) {
    const clearFloatingRef = useRef(() => {
    });
    const importInputRef = useRef(null);
    const managed = useManagedWorkbench({
      initialLayout,
      persistenceKey,
      persistLayout,
      ignorePersistedLayout,
      validateLayout,
      sidePanelEditorTypes,
      paneCommands,
      layoutPresets,
      singletonEditorTypes,
      requiredEditorTypes,
      resolveSplitNewEditorType,
      onClearFloatingPanes: () => clearFloatingRef.current()
    });
    const floating = useWorkbenchFloating({
      layout: managed.layout,
      onLayoutChange: managed.setLayout,
      enabled: enableFloating,
      onDetachRejected,
      onDockBackResult,
      requiredEditorTypes
    });
    clearFloatingRef.current = floating.clearAllFloatingPanes;
    useLayoutEffect(() => {
      if (persistenceKey == null) {
        return;
      }
      return installWorkbenchLayoutHostSync(persistenceKey);
    }, [persistenceKey]);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [managePanelOpen, setManagePanelOpen] = useState(false);
    const [importError, setImportError] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const floatActivePane = useCallback(() => {
      if (!managed.activePaneId) {
        return;
      }
      floating.detachPaneToFloat(
        managed.activePaneId,
        window.innerWidth * 0.5,
        window.innerHeight * 0.35
      );
    }, [floating, managed.activePaneId]);
    const exportCurrentLayout = useCallback(() => {
      if (!persistenceKey) {
        return;
      }
      downloadWorkbenchLayoutJson(
        createWorkbenchLayoutSnapshotFromCurrent({
          appId: persistenceKey,
          name: "Current layout",
          layout: managed.layout,
          dockMemory: managed.dockMemory
        })
      );
    }, [managed.dockMemory, managed.layout, persistenceKey]);
    const exportNamedLayout = useCallback(
      (layoutId) => {
        if (!persistenceKey) {
          return;
        }
        const snapshot = getNamedWorkbenchLayout(persistenceKey, layoutId);
        if (snapshot) {
          downloadWorkbenchLayoutJson(snapshot);
        }
      },
      [persistenceKey]
    );
    const triggerImportLayout = useCallback(() => {
      setImportError(null);
      importInputRef.current?.click();
    }, []);
    const layoutMenuProps = useMemo(() => {
      if (persistenceKey == null) {
        return null;
      }
      return {
        presets: layoutPresets,
        namedLayouts: listNamedWorkbenchLayouts(persistenceKey),
        startupPreference: managed.startupPreference,
        onLoadPreset: managed.loadLayoutPreset,
        onLoadNamed: managed.loadNamedLayout,
        onSaveAs: () => setSaveDialogOpen(true),
        onManage: () => setManagePanelOpen(true),
        onExportCurrent: exportCurrentLayout,
        onImport: triggerImportLayout,
        onReset: managed.resetLayout
      };
    }, [
      exportCurrentLayout,
      layoutPresets,
      managed.libraryRevision,
      managed.loadLayoutPreset,
      managed.loadNamedLayout,
      managed.resetLayout,
      managed.startupPreference,
      persistenceKey,
      triggerImportLayout
    ]);
    const onLayoutMenuPropsChangeRef = useRef(onLayoutMenuPropsChange);
    useEffect(() => {
      onLayoutMenuPropsChangeRef.current = onLayoutMenuPropsChange;
    }, [onLayoutMenuPropsChange]);
    const layoutMenuSignature = useMemo(() => {
      if (layoutMenuProps == null) {
        return "null";
      }
      const presetSig = layoutMenuProps.presets.map((p) => p.id).join("|");
      const namedSig = layoutMenuProps.namedLayouts.map((l) => `${l.id}:${l.updatedAt ?? ""}`).join("|");
      return `${layoutMenuProps.startupPreference}__${presetSig}__${namedSig}`;
    }, [layoutMenuProps]);
    const lastLayoutMenuSignatureRef = useRef(null);
    useEffect(() => {
      if (lastLayoutMenuSignatureRef.current === layoutMenuSignature) {
        return;
      }
      lastLayoutMenuSignatureRef.current = layoutMenuSignature;
      onLayoutMenuPropsChangeRef.current?.(layoutMenuProps);
    }, [layoutMenuProps, layoutMenuSignature]);
    const commandItems = useMemo(() => {
      const items = [...managed.commandItems];
      if (enableFloating) {
        const floatIndex = items.findIndex((row) => row.id === "layout-duplicate-pane");
        if (floatIndex >= 0) {
          items.splice(floatIndex + 1, 0, {
            id: "layout-float-pane",
            group: "Layout",
            label: "Float active pane",
            keywords: "float detach window popup"
          });
        }
      }
      return items;
    }, [enableFloating, managed.commandItems]);
    const keyboardHandlers = useMemo(
      () => ({
        onOpenCommandPalette: () => setCommandPaletteOpen(true),
        collapseActivePane: managed.collapseActivePane,
        expandPaneTarget: managed.expandPaneTarget,
        cycleCollapsedRailFocus: managed.cycleCollapsedRailFocus,
        undoLayoutChange: managed.undoLayoutChange,
        redoLayoutChange: managed.redoLayoutChange,
        duplicateActivePane: managed.duplicateActivePane,
        togglePaneByEditorType: togglePaneByEditorType == null ? void 0 : (editorType) => {
          managed.setLayout((prev) => togglePaneByEditorType(prev, editorType));
        }
      }),
      [managed, togglePaneByEditorType]
    );
    useWorkbenchKeyboardShortcuts(keyboardHandlers, enableCommandPalette);
    useImperativeHandle(
      ref,
      () => ({
        resetLayout: managed.resetLayout,
        setLayout: managed.setLayout,
        getLayout: () => managed.layout,
        undoLayout: managed.undoLayoutChange,
        redoLayout: managed.redoLayoutChange,
        openCommandPalette: () => setCommandPaletteOpen(true),
        focusPane: (editorType) => {
          const floatingMatch = floating.floatingPanes.find(
            (pane) => pane.editorType === editorType
          );
          if (floatingMatch != null) {
            floating.focusFloatingPane(floatingMatch.id);
            return;
          }
          managed.focusOrOpenPane(editorType);
        },
        exportLayoutSnapshot: (name = "Flow export") => {
          if (persistenceKey == null) {
            return null;
          }
          return createWorkbenchLayoutSnapshotFromCurrent({
            appId: persistenceKey,
            name,
            layout: managed.layout,
            dockMemory: managed.dockMemory
          });
        },
        applyImportedLayoutSnapshot: (snapshot, focusEditorType) => {
          managed.applyLayoutSnapshot(
            snapshot.layout,
            snapshot.dockMemory ?? {},
            focusEditorType
          );
        }
      }),
      [floating, managed, persistenceKey]
    );
    const handleCommandSelect = useCallback(
      (commandId) => {
        const result = managed.runCommand(commandId, floatActivePane);
        if (result.kind === "open-save-dialog") {
          setSaveDialogOpen(true);
        } else if (result.kind === "open-manage-panel") {
          setManagePanelOpen(true);
        } else if (result.kind === "export-current") {
          exportCurrentLayout();
        } else if (result.kind === "trigger-import") {
          triggerImportLayout();
        } else if (result.kind === "confirm-delete") {
          setPendingDelete({
            layoutId: result.layoutId,
            layoutName: result.layoutName
          });
        }
        setCommandPaletteOpen(false);
      },
      [exportCurrentLayout, floatActivePane, managed, triggerImportLayout]
    );
    const handleImportFile = useCallback(
      async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !persistenceKey) {
          return;
        }
        try {
          const raw = await file.text();
          const parsed = parseWorkbenchLayoutImport(raw, persistenceKey);
          if (!parsed.ok) {
            if (parsed.reason === "wrong_app") {
              setImportError("Import file belongs to a different workspace.");
            } else {
              setImportError("Could not read layout file.");
            }
            setManagePanelOpen(true);
            return;
          }
          const imported = importWorkbenchLayoutToLibrary({
            appId: persistenceKey,
            snapshot: {
              ...parsed.snapshot,
              source: "import"
            },
            allowOverwrite: false
          });
          if (!imported.ok) {
            if (imported.reason === "name_conflict" && imported.existing) {
              const overwrite = importWorkbenchLayoutToLibrary({
                appId: persistenceKey,
                snapshot: { ...parsed.snapshot, source: "import" },
                allowOverwrite: true
              });
              if (overwrite.ok) {
                managed.bumpLibraryRevision();
                managed.loadNamedLayout(overwrite.snapshot.id);
                setImportError(null);
                return;
              }
            }
            if (imported.reason === "library_full") {
              setImportError("Layout library is full. Delete a layout first.");
            } else {
              setImportError("Could not import layout.");
            }
            setManagePanelOpen(true);
            return;
          }
          managed.bumpLibraryRevision();
          managed.loadNamedLayout(imported.snapshot.id);
          setImportError(null);
        } catch {
          setImportError("Could not read layout file.");
          setManagePanelOpen(true);
        }
      },
      [managed, persistenceKey]
    );
    const workbenchHostProps = useMemo(() => {
      const base = managed.workbenchProps;
      if (onActiveEditorTypeChange == null) {
        return base;
      }
      return {
        ...base,
        onPaneActivate: (paneId) => {
          base.onPaneActivate(paneId);
          const editor = findEditorNode(managed.layout, paneId);
          onActiveEditorTypeChange(editor?.editorType ?? null);
        }
      };
    }, [managed.layout, managed.workbenchProps, onActiveEditorTypeChange]);
    useEffect(() => {
      onWorkbenchLayoutChange?.(managed.layout);
    }, [managed.layout, onWorkbenchLayoutChange]);
    useEffect(() => {
      onWorkbenchSessionChange?.({
        layout: managed.layout,
        dockMemory: managed.dockMemory
      });
    }, [managed.dockMemory, managed.layout, onWorkbenchSessionChange]);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        TRNWorkbenchHost,
        {
          ref: null,
          registry,
          enableFloating,
          onDetachRejected,
          className,
          floatingBindings: floating,
          ...workbenchHostProps
        }
      ),
      enableCommandPalette ? /* @__PURE__ */ jsx(
        WorkbenchCommandOverlay,
        {
          open: commandPaletteOpen,
          onClose: () => setCommandPaletteOpen(false),
          items: commandItems,
          onSelect: handleCommandSelect
        }
      ) : null,
      persistenceKey != null ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: importInputRef,
            type: "file",
            accept: "application/json,.json,.trn-workbench-layout.json",
            className: "hidden",
            onChange: handleImportFile
          }
        ),
        /* @__PURE__ */ jsx(
          WorkbenchSaveLayoutDialog,
          {
            open: saveDialogOpen,
            onOpenChange: setSaveDialogOpen,
            appId: persistenceKey,
            layout: managed.layout,
            dockMemory: managed.dockMemory,
            onSaved: () => {
              managed.bumpLibraryRevision();
            }
          }
        ),
        /* @__PURE__ */ jsx(
          WorkbenchLayoutLibraryPanel,
          {
            open: managePanelOpen,
            onOpenChange: setManagePanelOpen,
            appId: persistenceKey,
            presets: layoutPresets,
            revision: managed.libraryRevision,
            onRevisionChange: managed.bumpLibraryRevision,
            onLoadNamed: (layoutId) => {
              managed.loadNamedLayout(layoutId);
              setManagePanelOpen(false);
            },
            onExportSnapshot: exportNamedLayout,
            onImportPick: triggerImportLayout,
            importError
          }
        )
      ] }) : null,
      /* @__PURE__ */ jsxs(
        TRNMessageDialog,
        {
          open: pendingDelete != null,
          onOpenChange: (open) => {
            if (!open) {
              setPendingDelete(null);
            }
          },
          title: "Delete saved layout?",
          variant: "warning",
          primaryTone: "danger",
          primaryAction: {
            label: "Delete",
            onClick: () => {
              if (pendingDelete) {
                managed.deleteNamedLayout(pendingDelete.layoutId);
              }
              setPendingDelete(null);
            }
          },
          secondaryAction: {
            label: "Cancel",
            onClick: () => setPendingDelete(null)
          },
          children: [
            "Remove ",
            /* @__PURE__ */ jsx("strong", { children: pendingDelete?.layoutName }),
            " from your layout library? This cannot be undone."
          ]
        }
      )
    ] });
  })
);
StandaloneWorkbench.displayName = "StandaloneWorkbench";

// src/create-workbench-layout-validator.ts
function createWorkbenchLayoutValidator(fallback, knownEditorTypes, fallbackEditorType, requiredEditorTypes) {
  const known = new Set(knownEditorTypes);
  const fallbackType = fallbackEditorType ?? knownEditorTypes[0] ?? "main";
  return (raw) => coerceRequiredEditorTypes(
    validateLayoutTree(raw, {
      fallback,
      knownEditorTypes: known,
      fallbackEditorType: fallbackType
    }),
    requiredEditorTypes
  );
}
var DEFAULT_BTN_CLASS = "inline-flex items-center gap-1 rounded border border-zinc-700/80 bg-zinc-900/60 px-2 py-1 text-[11px] text-zinc-200/90 hover:bg-zinc-800/80";
function ToolbarDropdownMenu(props) {
  const {
    label,
    hint,
    prefixIcon,
    iconOnly = false,
    showChevron: showChevronProp,
    buttonClassName,
    panelClassName,
    align = "left",
    children
  } = props;
  const showChevron = showChevronProp ?? !iconOnly;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const { placement, panelRef } = useFixedMenuAnchor(open, triggerRef, align);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, panelRef]);
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const menuPanel = open && portalTarget != null ? createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: panelRef,
        className: twMerge("fixed z-10000 outline-none", panelClassName),
        style: {
          top: placement?.top ?? -9999,
          left: placement?.left ?? -9999,
          visibility: placement?.positioned ? "visible" : "hidden",
          pointerEvents: placement?.positioned ? "auto" : "none"
        },
        role: "presentation",
        onClick: () => setOpen(false),
        children
      }
    ),
    portalTarget
  ) : null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: triggerRef,
        type: "button",
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-label": hint != null ? `${label}. ${hint}` : label,
        className: twMerge(DEFAULT_BTN_CLASS, buttonClassName),
        onClick: () => setOpen((value) => !value),
        children: [
          prefixIcon,
          iconOnly ? null : label,
          showChevron ? /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 shrink-0 opacity-70", "aria-hidden": true }) : null
        ]
      }
    ),
    menuPanel
  ] });
}
var WORKBENCH_LAYOUT_MENU_PANEL_CLASS = TOOLBAR_HEADER_DROPDOWN_MENU_PANEL_CLASS;
var WORKBENCH_LAYOUT_MENU_ITEM_CLASS = TOOLBAR_HEADER_DROPDOWN_MENU_ITEM_CLASS;
var workbenchLayoutMenuIcon = toolbarHeaderDropdownMenuIcon;
function workbenchLayoutPresetIcon(presetId) {
  switch (presetId) {
    case "default":
      return workbenchLayoutMenuIcon(LayoutGrid);
    case "deck-focus":
      return workbenchLayoutMenuIcon(Rows3);
    case "bring-up":
      return workbenchLayoutMenuIcon(Cpu);
    case "graph-focus":
      return workbenchLayoutMenuIcon(Maximize2);
    case "inspector-wide":
      return workbenchLayoutMenuIcon(PanelRightOpen);
    case "minimal":
      return workbenchLayoutMenuIcon(Minimize2);
    default:
      return workbenchLayoutMenuIcon(LayoutTemplate);
  }
}
var WORKBENCH_LAYOUT_MENU_ICONS = {
  namedLayout: Bookmark,
  saveAs: Save,
  manage: FolderKanban,
  exportCurrent: Download,
  importLayout: Upload,
  reset: RotateCcw
};
function WorkbenchLayoutMenuSections(props) {
  const {
    presets,
    namedLayouts,
    onLoadPreset,
    onLoadNamed,
    onSaveAs,
    onManage,
    onExportCurrent,
    onImport,
    onReset
  } = props;
  const search = useOptionalTRNMenuSearchContext();
  const itemMatches = search?.itemMatches ?? (() => true);
  const visiblePresets = presets.filter((preset) => itemMatches(preset.label, ["layout", "preset"]));
  const visibleNamedLayouts = namedLayouts.filter(
    (row) => itemMatches(row.name, ["layout", "saved"])
  );
  const layoutLibraryLabels = [
    "Save current layout as",
    "Manage layouts",
    "Export current layout",
    "Import layout"
  ];
  const resetLabels = ["Reset to factory default"];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    visiblePresets.length > 0 ? /* @__PURE__ */ jsx(
      TRNMenuFilterableSection,
      {
        title: "Presets",
        itemLabels: visiblePresets.map((preset) => preset.label),
        spacing: "menuNext",
        children: visiblePresets.map((preset) => /* @__PURE__ */ jsx(
          TRNMenuItemButton,
          {
            role: "menuitem",
            tone: "glass-dropdown",
            className: WORKBENCH_LAYOUT_MENU_ITEM_CLASS,
            icon: workbenchLayoutPresetIcon(preset.id),
            label: preset.label,
            onClick: () => {
              onLoadPreset(preset.id);
            }
          },
          preset.id
        ))
      }
    ) : null,
    visibleNamedLayouts.length > 0 ? /* @__PURE__ */ jsx(
      TRNMenuFilterableSection,
      {
        title: "My layouts",
        itemLabels: visibleNamedLayouts.map((row) => row.name),
        spacing: "menuNext",
        children: visibleNamedLayouts.map((row) => /* @__PURE__ */ jsx(
          TRNMenuItemButton,
          {
            role: "menuitem",
            tone: "glass-dropdown",
            className: WORKBENCH_LAYOUT_MENU_ITEM_CLASS,
            icon: workbenchLayoutMenuIcon(WORKBENCH_LAYOUT_MENU_ICONS.namedLayout),
            label: row.name,
            onClick: () => {
              onLoadNamed(row.id);
            }
          },
          row.id
        ))
      }
    ) : null,
    /* @__PURE__ */ jsxs(
      TRNMenuFilterableSection,
      {
        title: "Layout library",
        itemLabels: layoutLibraryLabels,
        spacing: "menuNext",
        children: [
          /* @__PURE__ */ jsx(
            WorkbenchLayoutMenuAction,
            {
              label: "Save current layout as",
              keywords: ["layout", "save"],
              icon: workbenchLayoutMenuIcon(WORKBENCH_LAYOUT_MENU_ICONS.saveAs),
              onClick: onSaveAs
            }
          ),
          /* @__PURE__ */ jsx(
            WorkbenchLayoutMenuAction,
            {
              label: "Manage layouts",
              keywords: ["layout", "library"],
              icon: workbenchLayoutMenuIcon(WORKBENCH_LAYOUT_MENU_ICONS.manage),
              onClick: onManage
            }
          ),
          /* @__PURE__ */ jsx(
            WorkbenchLayoutMenuAction,
            {
              label: "Export current layout",
              keywords: ["layout", "export"],
              icon: workbenchLayoutMenuIcon(WORKBENCH_LAYOUT_MENU_ICONS.exportCurrent),
              onClick: onExportCurrent
            }
          ),
          /* @__PURE__ */ jsx(
            WorkbenchLayoutMenuAction,
            {
              label: "Import layout",
              keywords: ["layout", "import"],
              icon: workbenchLayoutMenuIcon(WORKBENCH_LAYOUT_MENU_ICONS.importLayout),
              onClick: onImport
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(TRNMenuFilterableSection, { title: "Reset", itemLabels: resetLabels, spacing: "menuNext", children: /* @__PURE__ */ jsx(
      WorkbenchLayoutMenuAction,
      {
        label: "Reset to factory default",
        keywords: ["layout", "factory"],
        icon: workbenchLayoutMenuIcon(WORKBENCH_LAYOUT_MENU_ICONS.reset),
        onClick: onReset
      }
    ) })
  ] });
}
function WorkbenchLayoutMenuAction(props) {
  const visible = useTRNMenuItemMatches(props.label, props.keywords);
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    TRNMenuItemButton,
    {
      role: "menuitem",
      tone: "glass-dropdown",
      className: WORKBENCH_LAYOUT_MENU_ITEM_CLASS,
      icon: props.icon,
      label: props.label,
      onClick: props.onClick
    }
  );
}
function WorkbenchLayoutMenu(props) {
  const { menuTriggerClassName, ...menuProps } = props;
  const menuItemCount = useMemo(
    () => menuProps.presets.length + menuProps.namedLayouts.length + 5,
    [menuProps.namedLayouts.length, menuProps.presets.length]
  );
  const triggerClassName = menuTriggerClassName ?? `inline-flex items-center gap-1 rounded border border-sky-800/60 bg-sky-950/30 px-2 py-1 text-sky-100/90 hover:bg-sky-900/25 ${TRN_GLASS_DROPDOWN_TEXT_CLASS}`;
  return /* @__PURE__ */ jsx("div", { className: "relative shrink-0", children: /* @__PURE__ */ jsx(
    ToolbarDropdownMenu,
    {
      label: "Layout",
      hint: "Presets, saved layouts, export and import.",
      align: "right",
      prefixIcon: /* @__PURE__ */ jsx(LayoutTemplate, { className: "size-3 shrink-0 opacity-90", "aria-hidden": true }),
      buttonClassName: triggerClassName,
      children: /* @__PURE__ */ jsx(
        TRNSearchableMenuShell,
        {
          itemCount: menuItemCount,
          panelClassName: WORKBENCH_LAYOUT_MENU_PANEL_CLASS,
          maxHeightClassName: "max-h-80",
          children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", role: "menu", children: /* @__PURE__ */ jsx(WorkbenchLayoutMenuSections, { ...menuProps }) })
        }
      )
    }
  ) });
}

// src/workbench-flow-attachment.ts
var WORKBENCH_FLOW_ATTACHMENT_VERSION = 1;
function createWorkbenchFlowAttachment(snapshot) {
  return {
    version: WORKBENCH_FLOW_ATTACHMENT_VERSION,
    appId: snapshot.appId,
    snapshot: structuredClone(snapshot)
  };
}
function coerceWorkbenchFlowAttachment(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value;
  const snapshot = row.snapshot;
  if (row.version !== WORKBENCH_FLOW_ATTACHMENT_VERSION || typeof row.appId !== "string" || !snapshot || typeof snapshot !== "object") {
    return null;
  }
  const snap = snapshot;
  if (snap.version !== WORKBENCH_LAYOUT_LIBRARY_VERSION || typeof snap.appId !== "string" || snap.layout == null || typeof snap.layout !== "object") {
    return null;
  }
  if (snap.appId !== row.appId) {
    return null;
  }
  return {
    version: WORKBENCH_FLOW_ATTACHMENT_VERSION,
    appId: row.appId,
    snapshot: structuredClone(snap)
  };
}

export { DEFAULT_FLOAT_PANE_HEIGHT, DEFAULT_FLOAT_PANE_WIDTH, FLOAT_DETACH_MARGIN_PX, FloatingWorkbenchLayer, FloatingWorkbenchPaneWindow, MAX_NAMED_WORKBENCH_LAYOUTS, MIN_FLOAT_PANE_HEIGHT, MIN_FLOAT_PANE_WIDTH, PANE_DOCK_ZONE_HIT_PX, StandaloneWorkbench, TRNManagedWorkbench, TRNWorkbench, TRNWorkbenchHost, WORKBENCH_EDGE_DOCK_RATIO, WORKBENCH_FLOW_ATTACHMENT_VERSION, WORKBENCH_GLOBAL_DOCK_EDGE_PX, WORKBENCH_LAYOUT_LIBRARY_VERSION, WorkbenchCommandOverlay, WorkbenchEditorKeepAliveProvider, WorkbenchEditorSlot, WorkbenchLayoutLibraryPanel, WorkbenchLayoutMenu, WorkbenchLayoutMenuSections, WorkbenchSaveLayoutDialog, applyFloatDockRestore, applyWorkbenchCollapse, applyWorkbenchExpand, canCloseEditorPane, canRedoLayout, canUndoLayout, captureFloatDockRestore, changeNodeType, clampFloatSize, clearLayoutHistory, clearPersistedLayout, closeNode, cn, coerceRequiredEditorTypes, coerceWorkbenchFlowAttachment, collapseEditorPane, collectCollapsedEditorIds, collectEditorPanes, collectKeepAliveEditorPanes, configureTrnWorkbenchVscode, countEditorPanes, countEditorPanesOfType, createEditorPane, createSplit, createTabs, createWorkbenchFlowAttachment, createWorkbenchLayoutSnapshotFromCurrent, createWorkbenchLayoutValidator, cycleCollapsedPaneFocus, deleteNamedWorkbenchLayout, directSplitChildEditorType, dockEditorPane, dockEditorPaneAtWorkbenchEdge, dockExtractedEditorAtWorkbenchEdge, dockExtractedEditorPane, downloadWorkbenchLayoutJson, duplicateNamedWorkbenchLayout, expandEditorPane, extractEditorPane, findEditorNode, findEditorPane, findNamedWorkbenchLayoutByName, floatPanePositionFromPointer, getHiddenSingletonEditorTypes, getNamedWorkbenchLayout, getSplitMenuHiddenEditorTypes, hasStoredWorkbenchStartupPreference, importWorkbenchLayoutToLibrary, installWorkbenchLayoutHostSync, isCollapsedEditor, isPointerOutsideElement, isRequiredEditorPane, isSingletonEditorPane, isSingletonEditorTypeBlocked, listNamedWorkbenchLayouts, listNamedWorkbenchLayoutsSorted, loadPersistedLayout, mapLayout, normalizeWorkbenchLayoutName, parseWorkbenchLayoutImport, pushLayoutHistory, readWorkbenchLayoutLibrary, readWorkbenchStartupPreference, redoLayout, rememberDockSplitRatio, rememberSplitResizeRatio, rememberWorkbenchEdgeRatio, removeEditorPane, renameNamedWorkbenchLayout, reorderNamedWorkbenchLayout, replaceEditorPane, resetWorkbenchHostPullGateForTests, resolveCollapseTargetPaneId, resolveDockSplitRatio, resolveExpandTargetPaneId, resolveWorkbenchEdgeRatio, resolveWorkbenchPaneLabel, runWithoutLayoutHistory, saveNamedWorkbenchLayout, savePersistedLayout, serializeWorkbenchLayoutExport, setTabsActiveIndex, signalWorkbenchHostPullComplete, splitNode, summarizeWorkbenchLayoutPanes, undoLayout, updateNodeRatio, updateNodeRatioAndSyncEditors, useManagedWorkbench, useWorkbenchEditorKeepAlive, useWorkbenchFloating, useWorkbenchKeyboardShortcuts, validateLayoutTree, waitForWorkbenchHostPull, workbenchGlobalZoneAtPoint, workbenchPersistenceKey, workbenchStartupPreferenceStorageKey, writeWorkbenchLayoutLibrary, writeWorkbenchStartupPreference };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map