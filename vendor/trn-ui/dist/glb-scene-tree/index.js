import * as THREE from 'three';
import { Box, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useRef, useId, useMemo, createElement } from 'react';
import { twMerge } from 'tailwind-merge';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';

// src/glb-scene-tree/buildTrnGlbSceneTree.ts
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
var TRN_HINT_HOVER_DELAY_MS = 1e3;
var TRN_HINT_POPOVER_PANEL_CLASS = "rounded-md border border-zinc-700/80 bg-zinc-900/96 px-2.5 py-2 text-xs leading-relaxed text-zinc-100 shadow-lg ring-1 ring-black/35";
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
var TRN_GLASS_LISTBOX_OPTION_SELECTED_CLASSNAME = "border-cyan-500/45 bg-cyan-500/18 text-cyan-200 hover:border-cyan-500/50 hover:bg-cyan-500/22";
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

export { TRNGlbSceneTree, buildTrnGlbSceneTree, collectTrnGlbSceneExpandableIds, isTrnGlbSceneMeshSelectable, isTrnGlbSceneNodeSelected, listTrnGlbSceneMeshNames, resolveTrnGlbSceneNodeIcon, trnGlbSceneTreeRowClass };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map