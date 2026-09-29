import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MutableRefObject,
  type Ref,
  type RefCallback,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  FoldHorizontal,
  FoldVertical,
  Maximize2,
  Minimize2,
  PanelsTopLeft,
  StretchHorizontal,
  StretchVertical,
  X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

export type TRNWindowRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TRNWindowReopenStrategy = "preserve" | "normalize" | "reset";
/**
 * `menu` matches the `TRNMenuPanel` `glass-dropdown` edge — white-tinted hairline, inner
 * ring highlight, `rounded-lg`, deep soft shadow — while keeping a viewport-friendly blur
 * so the 3D scene still reads through a tool window.
 */
export type TRNWindowGlassPreset =
  | "soft"
  | "medium"
  | "strong"
  | "toolbox"
  | "menu";
export type TRNWindowHeightMode = "fixed" | "auto";

export type TRNWindowResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/**
 * `se` — bottom-right only (legacy). `all` — edges + corners (top via corners only).
 * `ew` — left/right only: width is adjustable while height stays owned by
 * `heightMode` (an auto-height shell can never be locked to pixels by a stray drag).
 */
export type TRNWindowResizeEdges = "se" | "all" | "ew";

/** Optional attributes merged onto the outer window shell (before internal `className` / `style`). */
export type TRNWindowShellProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "ref" | "children"
> & {
  /** Set by `TRNToolboxPanel` for tests / document queries. */
  "data-trn-toolbox-panel"?: boolean;
};

export type TRNWindowProps = {
  open?: boolean;
  title?: string;
  prefixIcon?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  initialRect?: Partial<TRNWindowRect>;
  minWidth?: number;
  minHeight?: number;
  /**
   * When set, the window is rendered **inside** this element via a portal. Geometry (`x`, `y`,
   * `width`, `height`) is **relative to the bounds element** (top-left origin). Drag / resize /
   * maximize clamp to the bounds box. The element should use **`position: relative`** (and usually
   * `overflow: hidden` if you want content clipped).
   */
  boundsRef?: RefObject<HTMLElement | null>;
  /**
   * `fixed` — height comes from `rect` / `initialRect` (default).
   * `auto` — shell height follows content up to `autoHeightMaxViewportFraction` of the viewport height; inner body scrolls when needed.
   */
  heightMode?: TRNWindowHeightMode;
  /** When `heightMode` is `auto`, max shell height as a fraction of the viewport height (default `0.8`). */
  autoHeightMaxViewportFraction?: number;
  modal?: boolean;
  /**
   * When `modal` is true: if true (default), clicking the dimmed backdrop calls `onClose`.
   * Set to false for alert-style dialogs that must be dismissed only via the header close button or actions.
   */
  modalBackdropCloses?: boolean;
  zIndex?: number;
  /**
   * When `modal={false}`, clicking the window brings it to front by raising its z-index within the same
   * app runtime (simple window manager). Default `true`.
   */
  bringToFrontOnPointerDown?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  /**
   * When `resizable`: `se` keeps the legacy bottom-right grip only; `all` adds edge/corner resize
   * (north resize via top corners only so the title bar center stays drag-only).
   */
  resizeEdges?: TRNWindowResizeEdges;
  reopenStrategy?: TRNWindowReopenStrategy;
  className?: string;
  contentClassName?: string;
  glass?: boolean;
  glassPreset?: TRNWindowGlassPreset;
  glassBlurPx?: number;
  glassOpacity?: number;
  glassBorderOpacity?: number;
  /** Hide the metrics footer (compact / HUD-style shells). Default `true`. */
  showFooter?: boolean;
  /** Hide the maximize / restore control. Default `true`. */
  showMaximize?: boolean;
  /**
   * Header toggle: fill the overlay / bounds **width** (`x = 0`, `width = overlay width`) while keeping
   * current height and vertical position (until restored). Disabled while maximized. Default `false`.
   */
  showExpandFullWidth?: boolean;
  /**
   * Header toggle: fill the overlay **height** (`y = 0`, `height = overlay height`) while keeping
   * current width and horizontal position (until restored). Disabled while maximized. Default `false`.
   */
  showExpandFullHeight?: boolean;
  /**
   * Extra controls in the header row (before maximize / close). Click handlers should call
   * `stopPropagation` on pointer down if they must not start a drag.
   */
  headerActions?: ReactNode;
  /**
   * When dragging, snap the panel flush to overlay edges when within this many pixels (viewport or
   * `boundsRef` box): **left**, **right**, and **bottom** (distance from each outer edge to the
   * matching overlay edge). Omit or set `0` to disable.
   */
  dragEdgeSnapPx?: number;
  /**
   * Extra attributes for the outer shell `div` (e.g. `onKeyDown`, `tabIndex`, `data-*`). Merged
   * with internal layout; `className` / `style` are combined with the component’s own.
   */
  shellProps?: TRNWindowShellProps;
  /** Optional ref to the outer shell element (merged with the internal shell ref). */
  shellRef?: Ref<HTMLDivElement | null>;
  /**
   * When set, persists `{ x, y, width, height }` to `localStorage` after drag/resize ends and
   * merges saved geometry on first open (after bounds/viewport size is known).
   */
  persistRectStorageKey?: string;
  /**
   * When false, the scrollable body region is not rendered (header / footer / resize handle
   * unchanged). Use with toolbox collapse so an empty body wrapper does not reserve space.
   */
  showContent?: boolean;
  /** Merged last over the shell `style` (e.g. transparent border/background for HUD chrome). */
  shellStyle?: CSSProperties;
  /** Merged last over the scrollable body `style`. */
  contentStyle?: CSSProperties;
  /** Merged last over the title-bar row `style`. */
  headerStyle?: CSSProperties;
  /** Extra classes on the title-bar row (after defaults). */
  headerClassName?: string;
};

/**
 * Matches title row `h-6`. Used in auto-height `calc()` for scroll body — keep in sync if header height changes.
 */
const TRN_WINDOW_HEADER_HEIGHT_REM = "1.5rem";

type TRNWindowGlassProfile = {
  blurPx: number;
  opacity: number;
  borderOpacity: number;
  /** Base color the border opacity mixes into. Zinc reads as panel chrome, white as glass. */
  borderRgb: string;
  /** Corner radius, inner ring, and shadow — the part that makes a shell read as glass. */
  shellClass: string;
  /** Title row corners must follow the shell radius; the shell does not clip its children. */
  headerClass: string;
  headerBorderColor: string;
};

const TRN_WINDOW_PANEL_SHELL_CLASS = "rounded-md shadow-2xl";

/** Mirrors `TRNMenuPanel` `glass-dropdown` so a tool window and a dropdown look related. */
const TRN_WINDOW_MENU_SHELL_CLASS =
  "rounded-lg ring-1 ring-white/10 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.9)]";

const TRN_WINDOW_PANEL_BORDER_RGB = "rgb(63 63 70)";

function getGlassProfile(preset: TRNWindowGlassPreset): TRNWindowGlassProfile {
  const panel = {
    borderRgb: TRN_WINDOW_PANEL_BORDER_RGB,
    shellClass: TRN_WINDOW_PANEL_SHELL_CLASS,
    headerClass: "rounded-t-md",
    headerBorderColor: "rgb(82 82 91 / 0.72)",
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
    // Blur stays well under the dropdown's `backdrop-blur-2xl`: a tool window sits over
    // the scene for minutes, and smearing it that hard hides what the operator is editing.
    return {
      blurPx: 10,
      opacity: 0.62,
      borderOpacity: 0.15,
      borderRgb: "rgb(255 255 255)",
      shellClass: TRN_WINDOW_MENU_SHELL_CLASS,
      headerClass: "rounded-t-lg",
      headerBorderColor: "rgb(255 255 255 / 0.12)",
    };
  }
  return { blurPx: 12, opacity: 0.72, borderOpacity: 0.8, ...panel };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (ref == null) {
        continue;
      }
      if (typeof ref === "function") {
        ref(value);
      } else {
        (ref as MutableRefObject<T | null>).current = value;
      }
    }
  };
}

export function normalizeRect(
  rect: TRNWindowRect,
  viewportWidth: number,
  viewportHeight: number,
  minWidth: number,
  minHeight: number,
): TRNWindowRect {
  const width = clamp(rect.width, minWidth, viewportWidth);
  const height = clamp(rect.height, minHeight, viewportHeight);
  const x = clamp(rect.x, 0, Math.max(0, viewportWidth - width));
  const y = clamp(rect.y, 0, Math.max(0, viewportHeight - height));
  return { x, y, width, height };
}

/** 5px was below a comfortable pointer target; 8px still sits over normal panel padding. */
const TRN_WINDOW_EDGE_HIT_PX = 8;
const TRN_WINDOW_CORNER_HIT_PX = 12;

function resizeEdgeUsesEast(edge: TRNWindowResizeEdge): boolean
{
  return edge === "e" || edge === "ne" || edge === "se";
}

function resizeEdgeUsesWest(edge: TRNWindowResizeEdge): boolean
{
  return edge === "w" || edge === "nw" || edge === "sw";
}

function resizeEdgeUsesSouth(edge: TRNWindowResizeEdge): boolean
{
  return edge === "s" || edge === "se" || edge === "sw";
}

function resizeEdgeUsesNorth(edge: TRNWindowResizeEdge): boolean
{
  return edge === "n" || edge === "ne" || edge === "nw";
}

/**
 * Apply a pointer delta for one resize handle, anchoring the opposite edge.
 *
 * The dragged edge tracks the pointer and stops at the bounds. Clamping through
 * {@link normalizeRect} instead would keep the new size and translate the rect, so a
 * window resized against an edge of its bounds box slid sideways while the grabbed
 * edge stayed pinned — the pointer and the edge visibly came apart.
 */
export function computeResizedWindowRect(
  edge: TRNWindowResizeEdge,
  base: TRNWindowRect,
  dx: number,
  dy: number,
  viewportWidth: number,
  viewportHeight: number,
  minWidth: number,
  minHeight: number,
): TRNWindowRect
{
  let x = base.x;
  let y = base.y;
  let width = base.width;
  let height = base.height;

  if (resizeEdgeUsesEast(edge))
  {
    // `base.width` in the ceiling keeps an already-oversized window from snapping
    // smaller the instant it is grabbed; shrinking is still free.
    const maxWidth = Math.max(minWidth, base.width, viewportWidth - base.x);
    width = clamp(base.width + dx, minWidth, maxWidth);
  }
  if (resizeEdgeUsesWest(edge))
  {
    const right = base.x + base.width;
    x = clamp(base.x + dx, 0, Math.max(0, right - minWidth));
    width = Math.max(minWidth, right - x);
  }
  if (resizeEdgeUsesSouth(edge))
  {
    const maxHeight = Math.max(minHeight, base.height, viewportHeight - base.y);
    height = clamp(base.height + dy, minHeight, maxHeight);
  }
  if (resizeEdgeUsesNorth(edge))
  {
    const bottom = base.y + base.height;
    y = clamp(base.y + dy, 0, Math.max(0, bottom - minHeight));
    height = Math.max(minHeight, bottom - y);
  }

  return { x, y, width, height };
}

type PersistedWindowGeometry = {
  rect: Partial<TRNWindowRect>;
  /** When true, `heightMode: "auto"` uses a fixed pixel shell height (`rect.height`). */
  autoHeightShellLocked: boolean;
};

export function loadPersistedWindowGeometry(
  key: string,
): PersistedWindowGeometry | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw.length === 0) {
      return null;
    }
    const o = JSON.parse(raw) as Record<string, unknown>;
    const out: Partial<TRNWindowRect> = {};
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
    const autoHeightShellLocked =
      typeof o.autoHeightShellLocked === "boolean"
        ? o.autoHeightShellLocked
        : false;
    return { rect: out, autoHeightShellLocked };
  } catch {
    return null;
  }
}

function savePersistedWindowGeometry(
  key: string,
  rect: TRNWindowRect,
  options?: { autoHeightShellLocked?: boolean },
): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    const payload: Record<string, unknown> = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
    if (typeof options?.autoHeightShellLocked === "boolean") {
      payload.autoHeightShellLocked = options.autoHeightShellLocked;
    }
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

/** Lucide default stroke is 2; slightly thicker for small chrome icons. */
const TRN_WINDOW_HEADER_ACTION_STROKE = 2.5;

/** Do not start title-bar drag when the pointer hits chrome controls or form fields. */
const TRN_WINDOW_HEADER_DRAG_IGNORE_SELECTOR =
  "button, a, input, textarea, select, label, [role='button'], [data-trn-window-header-no-drag]";

function shouldIgnoreHeaderDrag(evt: { target: EventTarget | null }): boolean {
  const target = evt.target;
  if (!(target instanceof Element)) {
    return false;
  }
  return target.closest(TRN_WINDOW_HEADER_DRAG_IGNORE_SELECTOR) != null;
}

function WindowActionButton(props: {
  label: string;
  title: string;
  onClick: () => void;
  icon: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      className={
        "box-border h-6 min-w-6 rounded border-0 bg-transparent px-1 text-xs transition-colors " +
        (props.disabled
          ? "cursor-not-allowed text-zinc-600 opacity-50"
          : "text-zinc-300 hover:bg-zinc-800/85 hover:text-zinc-100")
      }
      data-trn-window-header-no-drag
      onPointerDown={(evt) => evt.stopPropagation()}
      onClick={(evt) => {
        evt.stopPropagation();
        props.onClick();
      }}
      aria-label={props.label}
      title={props.title}
    >
      <span className="inline-flex items-center justify-center pt-0.5">
        {props.icon}
      </span>
    </button>
  );
}

function WindowResizeHandles(props: {
  mode: TRNWindowResizeEdges;
  onResizeStart: (
    edge: TRNWindowResizeEdge,
    evt: ReactPointerEvent<HTMLDivElement>,
  ) => void;
  /** Auto-height shells only: double-click a bottom handle to drop back to hugging content. */
  onFitHeight?: () => void;
})
{
  const { mode, onResizeStart, onFitHeight } = props;
  const edgeInset = TRN_WINDOW_CORNER_HIT_PX;
  const verticalTitle =
    onFitHeight != null
      ? "Resize window (double-click to fit content height)"
      : "Resize window";

  if (mode === "se")
  {
    return (
      <div
        className="absolute right-0 bottom-0 z-20 h-4 w-4 cursor-se-resize"
        onPointerDown={(evt) => onResizeStart("se", evt)}
        title="Resize window"
        aria-label="Resize window"
      >
        <div className="absolute right-1 bottom-1 h-2.5 w-2.5 border-r-2 border-b-2 border-zinc-400/70" />
      </div>
    );
  }

  const edgeHit = `${TRN_WINDOW_EDGE_HIT_PX}px`;
  const cornerHit = `${TRN_WINDOW_CORNER_HIT_PX}px`;

  if (mode === "ew") {
    return (
      <>
        <div
          className="absolute z-20 cursor-w-resize"
          style={{ top: 0, bottom: 0, left: 0, width: edgeHit }}
          onPointerDown={(evt) => onResizeStart("w", evt)}
          aria-label="Resize window from left edge"
          title="Resize window width"
        />
        <div
          className="absolute z-20 cursor-e-resize"
          style={{ top: 0, bottom: 0, right: 0, width: edgeHit }}
          onPointerDown={(evt) => onResizeStart("e", evt)}
          aria-label="Resize window from right edge"
          title="Resize window width"
        />
      </>
    );
  }

  return (
    <>
      <div
        className="absolute z-20 cursor-w-resize"
        style={{ top: edgeInset, bottom: edgeInset, left: 0, width: edgeHit }}
        onPointerDown={(evt) => onResizeStart("w", evt)}
        aria-label="Resize window from left edge"
        title="Resize window"
      />
      <div
        className="absolute z-20 cursor-e-resize"
        style={{ top: edgeInset, bottom: edgeInset, right: 0, width: edgeHit }}
        onPointerDown={(evt) => onResizeStart("e", evt)}
        aria-label="Resize window from right edge"
        title="Resize window"
      />
      <div
        className="absolute z-20 cursor-s-resize"
        style={{ left: edgeInset, right: edgeInset, bottom: 0, height: edgeHit }}
        onPointerDown={(evt) => onResizeStart("s", evt)}
        onDoubleClick={onFitHeight}
        aria-label="Resize window from bottom edge"
        title={verticalTitle}
      />
      <div
        className="absolute left-0 top-0 z-20 cursor-nw-resize"
        style={{ width: cornerHit, height: cornerHit }}
        onPointerDown={(evt) => onResizeStart("nw", evt)}
        aria-label="Resize window from top-left corner"
        title="Resize window"
      />
      <div
        className="absolute right-0 top-0 z-20 cursor-ne-resize"
        style={{ width: cornerHit, height: cornerHit }}
        onPointerDown={(evt) => onResizeStart("ne", evt)}
        aria-label="Resize window from top-right corner"
        title="Resize window"
      />
      <div
        className="absolute bottom-0 left-0 z-20 cursor-sw-resize"
        style={{ width: cornerHit, height: cornerHit }}
        onPointerDown={(evt) => onResizeStart("sw", evt)}
        onDoubleClick={onFitHeight}
        aria-label="Resize window from bottom-left corner"
        title={verticalTitle}
      />
      <div
        className="absolute bottom-0 right-0 z-20 cursor-se-resize"
        style={{ width: cornerHit, height: cornerHit }}
        onPointerDown={(evt) => onResizeStart("se", evt)}
        onDoubleClick={onFitHeight}
        aria-label="Resize window from bottom-right corner"
        title={verticalTitle}
      />
    </>
  );
}

function WindowFooter(props: {
  rect: TRNWindowRect;
  measuredShellHeightPx?: number | null;
  heightMode: TRNWindowHeightMode;
  autoShellHeightLocked: boolean;
}) {
  const h =
    props.measuredShellHeightPx != null
      ? Math.round(props.measuredShellHeightPx)
      : Math.round(props.rect.height);
  const autoNote =
    props.heightMode === "auto"
      ? props.autoShellHeightLocked
        ? " (auto, height sized)"
        : " (auto)"
      : "";
  return (
    <div className="flex h-7 shrink-0 items-center justify-left gap-4 border-t border-zinc-700/70 px-2 text-[11px] text-zinc-400">
      <span className="font-semibold">Window metrics</span>
      <span>
        x: {Math.round(props.rect.x)} | y: {Math.round(props.rect.y)} | w:{" "}
        {Math.round(props.rect.width)} | h: {h}
        {autoNote}
      </span>
    </div>
  );
}

export function TRNWindow(props: TRNWindowProps) {
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
    children,
  } = props;

  // Simple z-index manager for non-modal windows.
  // Keeps all windows interactive while allowing the focused window to come to the front.
  const managedZIndexRef = useRef<number>(zIndex);
  const [managedZIndex, setManagedZIndex] = useState<number>(zIndex);
  const isNonModal = modal !== true;

  // Module-level counter (shared across TRNWindow instances).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zMgr = (globalThis as any).__TRN_WINDOW_Z_MGR__ as
    | { next: number }
    | undefined;
  if (!zMgr) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__TRN_WINDOW_Z_MGR__ = { next: Math.max(200, zIndex) };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zMgrLive = (globalThis as any).__TRN_WINDOW_Z_MGR__ as { next: number };

  useEffect(() => {
    // Reset to provided zIndex when switching modes or when consumer changes base zIndex.
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

  // Esc behavior: close only modal windows (non-modal should not steal Esc).
  useEffect(() => {
    if (!open || !modal || !onClose) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") {
        return;
      }
      e.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true } as any);
  }, [modal, onClose, open]);
  const effectivePrefixIcon = prefixIcon ?? (
    <PanelsTopLeft className="h-3.5 w-3.5" />
  );

  const initial = useMemo<TRNWindowRect>(
    () => ({
      x: initialRect?.x ?? 120,
      y: initialRect?.y ?? 80,
      width: initialRect?.width ?? 760,
      height: initialRect?.height ?? 480,
    }),
    [initialRect?.height, initialRect?.width, initialRect?.x, initialRect?.y],
  );

  const glassProfile = useMemo(
    () => getGlassProfile(glassPreset),
    [glassPreset],
  );
  const effectiveGlassBlurPx = glassBlurPx ?? glassProfile.blurPx;
  const effectiveGlassOpacity = glassOpacity ?? glassProfile.opacity;
  const effectiveGlassBorderOpacity =
    glassBorderOpacity ?? glassProfile.borderOpacity;
  const shellChromeClass = glass
    ? glassProfile.shellClass
    : TRN_WINDOW_PANEL_SHELL_CLASS;

  const overlayDimsRef = useRef({
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
    h: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  /** Mirrors `overlayDimsRef` so auto-height CSS can use viewport or bounds height without `vh`. */
  const [overlayPx, setOverlayPx] = useState(() => ({
    w: overlayDimsRef.current.w,
    h: overlayDimsRef.current.h,
  }));

  const [rect, setRect] = useState<TRNWindowRect>(initial);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isExpandedFullWidth, setIsExpandedFullWidth] = useState(false);
  const [isExpandedFullHeight, setIsExpandedFullHeight] = useState(false);
  const restoreFullWidthAxisRef = useRef<{ x: number; width: number } | null>(null);
  const restoreFullHeightAxisRef = useRef<{ y: number; height: number } | null>(null);
  /**
   * When `heightMode` is `auto` and false, shell height is `auto` (hugs content). After the user
   * resizes vertically, becomes true and shell uses pixel `rect.height` until reset (e.g. reopen).
   */
  const [autoShellHeightLocked, setAutoShellHeightLocked] = useState(false);
  /** No vertical handle means the operator could never undo a pixel height lock. */
  const verticalResizeAvailable = resizable && resizeEdges !== "ew";
  const [measuredShellHeightPx, setMeasuredShellHeightPx] = useState<
    number | null
  >(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const restoreRectRef = useRef<TRNWindowRect | null>(null);
  const prevOpenRef = useRef<boolean>(open);
  const rectRef = useRef<TRNWindowRect>(rect);
  rectRef.current = rect;
  const persistHydratedRef = useRef(false);
  const hasAppliedInitialRectEffectRef = useRef(false);

  const dragState = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);
  const resizeState = useRef<{
    edge: TRNWindowResizeEdge;
    startX: number;
    startY: number;
    baseWidth: number;
    baseHeight: number;
    baseX: number;
    baseY: number;
    /** This gesture switched an auto-height shell to pixels; undo it if nothing moved. */
    autoHeightLockApplied: boolean;
  } | null>(null);

  /** Portal target for bounded mode; `null` until `boundsRef.current` exists. */
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!boundsRef) {
      setPortalHost(null);
      return;
    }
    const syncHost = (): void => {
      const el = boundsRef.current;
      setPortalHost(el);
    };
    syncHost();
    const raf = requestAnimationFrame(syncHost);
    return () => cancelAnimationFrame(raf);
  }, [boundsRef, open]);

  function readDims(): { w: number; h: number } {
    if (boundsRef?.current) {
      const el = boundsRef.current;
      return { w: el.clientWidth, h: el.clientHeight };
    }
    return { w: window.innerWidth, h: window.innerHeight };
  }

  useLayoutEffect(() => {
    const apply = (): void => {
      const d = readDims();
      overlayDimsRef.current = d;
      setOverlayPx(d);
    };
    apply();

    if (!boundsRef) {
      const onWin = (): void => {
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
            minHeight,
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
    autoShellHeightLocked,
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
      heightMode === "auto" && !verticalResizeAvailable
        ? false
        : saved.autoHeightShellLocked,
    );
    setRect((prev) =>
      normalizeRect({ ...prev, ...saved.rect }, w, h, minWidth, minHeight),
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
    verticalResizeAvailable,
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
    // During the first render tick, `overlayDimsRef` can still be 0×0 even though the overlay is mounted.
    // Fall back to the real viewport so modal windows never "open into nothing" (backdrop only).
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
        height: vh,
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
          minHeight,
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
    heightMode,
  ]);

  useLayoutEffect(() => {
    if (!open || heightMode !== "auto" || isMaximized) {
      setMeasuredShellHeightPx((prev) => (prev == null ? prev : null));
      return;
    }
    const el = shellRef.current;
    if (!el) {
      return;
    }
    const measure = (): void => {
      const h = el.getBoundingClientRect().height;
      // Avoid render loops from tiny sub-pixel measurement churn.
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
    autoShellHeightLocked,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onMove = (evt: PointerEvent): void => {
      let { w: vw, h: vh } = overlayDimsRef.current;
      // A 0×0 bounds box (observer not settled, pane briefly hidden) would clamp a
      // resize to the current size and freeze the dragged edge under the pointer.
      if ((vw <= 0 || vh <= 0) && typeof window !== "undefined") {
        vw = window.innerWidth;
        vh = window.innerHeight;
      }
      if (dragState.current != null) {
        /**
         * `heightMode: auto` uses CSS `height: auto`; `rect.height` can stay stale (e.g. persisted
         * size). Edge snap and y-clamp must use the live shell height or bottom snap never aligns.
         */
        const layoutHeight = ((): number => {
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
            y: dragState.current.baseY + dy,
          },
          vw,
          vh,
          minWidth,
          minHeight,
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
            height: layoutHeight,
          },
          vw,
          vh,
          minWidth,
          minHeight,
        );
        setRect((prev) => ({ ...prev, x: next.x, y: next.y }));
      }
      if (resizeState.current != null)
      {
        const rs = resizeState.current;
        const dx = evt.clientX - rs.startX;
        const dy = evt.clientY - rs.startY;
        const next = computeResizedWindowRect(
          rs.edge,
          {
            x: rs.baseX,
            y: rs.baseY,
            width: rs.baseWidth,
            height: rs.baseHeight,
          },
          dx,
          dy,
          vw,
          vh,
          minWidth,
          minHeight,
        );
        setRect(next);
      }
    };

    const onUp = (): void => {
      const rs = resizeState.current;
      let becameHeightLocked = false;
      if (rs != null && heightMode === "auto") {
        const dh = Math.abs(rectRef.current.height - rs.baseHeight);
        if (dh >= 1) {
          becameHeightLocked = true;
        }
      }
      // A click on a vertical handle that never moved should not cost the shell its
      // content-hugging height.
      const revertHeightLock =
        rs?.autoHeightLockApplied === true && !becameHeightLocked;
      if (becameHeightLocked) {
        setAutoShellHeightLocked(true);
      } else if (revertHeightLock) {
        setAutoShellHeightLocked(false);
      }
      dragState.current = null;
      resizeState.current = null;
      if (persistRectStorageKey != null) {
        const locked =
          heightMode === "auto" &&
          !revertHeightLock &&
          (autoShellHeightLocked || becameHeightLocked);
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
          autoHeightShellLocked: heightMode === "auto" ? locked : undefined,
        });
      }
    };

    // Capture phase: a pane between the shell and `window` that stops pointer events
    // (3D canvas, flow surface) must not strand a drag mid-gesture. `pointercancel`
    // ends the gesture too — otherwise the window keeps tracking a released pointer.
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
    autoShellHeightLocked,
  ]);

  /**
   * Escape hatch for `heightMode: "auto"`: one vertical drag pins the shell to pixels,
   * and without this the operator could never get the content-hugging height back.
   */
  const fitShellHeightToContent = useCallback((): void => {
    if (heightMode !== "auto") {
      return;
    }
    setAutoShellHeightLocked(false);
    if (persistRectStorageKey == null) {
      return;
    }
    // Persist after the unlocked layout settles so the stored height matches content.
    requestAnimationFrame(() => {
      const h = shellRef.current?.getBoundingClientRect().height;
      const r =
        h != null && Number.isFinite(h) && h > 0
          ? { ...rectRef.current, height: h }
          : rectRef.current;
      savePersistedWindowGeometry(persistRectStorageKey, r, {
        autoHeightShellLocked: false,
      });
    });
  }, [heightMode, persistRectStorageKey]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onResize = (): void => {
      const d = readDims();
      overlayDimsRef.current = d;
      setOverlayPx(d);
      const { w: vw, h: vh } = d;
      if (isMaximized) {
        setRect({
          x: 0,
          y: 0,
          width: vw,
          height: vh,
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
            minHeight,
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
    autoShellHeightLocked,
  ]);

  const footerRem = showFooter ? "1.75rem" : "0rem";

  /** Auto mode: cap scrollable body using overlay height (full viewport or `boundsRef` box), not `vh` alone. */
  const autoContentMaxHeight = useMemo((): string | undefined => {
    if (heightMode !== "auto" || isMaximized) {
      return undefined;
    }
    // Once a vertical drag sized the shell, the shell height governs: keeping the cap
    // would leave dead space below the body when the operator drags past the fraction.
    if (autoShellHeightLocked) {
      return undefined;
    }
    const capPx = Math.round(autoHeightMaxViewportFraction * overlayPx.h);
    return `calc(${capPx}px - ${TRN_WINDOW_HEADER_HEIGHT_REM} - ${footerRem})`;
  }, [
    heightMode,
    isMaximized,
    autoShellHeightLocked,
    autoHeightMaxViewportFraction,
    overlayPx.h,
    footerRem,
  ]);

  /** Flex column shell + flex-1 body keeps the footer row pinned when shell height is fixed. */
  const contentAreaHeightClass =
    heightMode === "auto" && !autoShellHeightLocked
      ? "flex-none overflow-x-hidden overflow-y-auto p-2"
      : "min-h-0 flex-1 overflow-auto p-2";

  const {
    className: shellPropsClassName,
    style: shellPropsStyle,
    ...shellRest
  } = shellProps ?? {};

  const overlayInner = (
    <>
      {modal ? (
        <div
          className="pointer-events-auto absolute inset-0 bg-black/45"
          onClick={modalBackdropCloses ? onClose : undefined}
          aria-hidden="true"
        />
      ) : null}

      <div
        ref={mergeRefs(shellRef, shellRefProp)}
        {...shellRest}
        className={twMerge(
          "pointer-events-auto absolute flex min-h-0 flex-col border",
          shellChromeClass,
          shellPropsClassName,
          className,
        )}
        style={{
          ...(shellPropsStyle as CSSProperties | undefined),
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: ((): CSSProperties["height"] => {
            if (isMaximized) {
              return rect.height;
            }
            if (heightMode === "fixed") {
              return rect.height;
            }
            // Shells without a vertical handle hug content; a persisted locked height only adds gap.
            if (!verticalResizeAvailable) {
              return "auto";
            }
            return autoShellHeightLocked ? rect.height : "auto";
          })(),
          maxHeight:
            !isMaximized && heightMode === "auto"
              ? `${Math.round(autoHeightMaxViewportFraction * 100)}%`
              : undefined,
          minHeight:
            !isMaximized && heightMode === "auto" ? minHeight : undefined,
          borderColor: glass
            ? `color-mix(in srgb, ${glassProfile.borderRgb} ${Math.round(
                effectiveGlassBorderOpacity * 100,
              )}%, transparent)`
            : "rgb(63 63 70 / 0.75)",
          backgroundColor: glass
            ? `color-mix(in srgb, rgb(9 9 11) ${Math.round(
                effectiveGlassOpacity * 100,
              )}%, transparent)`
            : "rgb(9 9 11 / 0.96)",
          backdropFilter: glass
            ? `blur(${effectiveGlassBlurPx}px) saturate(140%)`
            : undefined,
          WebkitBackdropFilter: glass
            ? `blur(${effectiveGlassBlurPx}px) saturate(140%)`
            : undefined,
          zIndex: 1,
          ...shellStyle,
        }}
        role="dialog"
        aria-modal={modal}
        aria-label={title}
        onPointerDownCapture={() => {
          bringToFront();
        }}
      >
        <div
          className={twMerge(
            "relative z-10 h-7 shrink-0 border-b px-2 py-0.5 flex items-center justify-between ",
            isMaximized ? null : glassProfile.headerClass,
            draggable && !isMaximized ? "cursor-move select-none" : "",
            headerClassName,
          )}
          style={{
            borderBottomColor: glass
              ? glassProfile.headerBorderColor
              : "rgb(63 63 70 / 0.7)",
            backgroundColor: glass ? "rgb(24 24 27 / 0.5)" : undefined,
            ...headerStyle,
          }}
          onPointerDown={(evt) => {
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
              baseY: rectRef.current.y,
            };
          }}
          onPointerUp={(evt) => {
            if (typeof evt.currentTarget.releasePointerCapture === "function") {
              try {
                evt.currentTarget.releasePointerCapture(evt.pointerId);
              }
              catch {
                // Not capturing this pointer.
              }
            }
          }}
          onPointerCancel={(evt) => {
            dragState.current = null;
            if (typeof evt.currentTarget.releasePointerCapture === "function") {
              try {
                evt.currentTarget.releasePointerCapture(evt.pointerId);
              }
              catch {
                // Not capturing this pointer.
              }
            }
          }}
        >
          <div className="inline-flex items-center gap-1.5 leading-none text-xs font-semibold text-zinc-100">
            <span className="inline-flex items-center justify-center text-zinc-300">
              {effectivePrefixIcon}
            </span>
            <span>{title}</span>
          </div>
          <div
            className="flex translate-x-1.5 items-center gap-2"
            data-trn-window-header-no-drag
          >
            {headerActions}
            {showExpandFullWidth ? (
              <WindowActionButton
                label={isExpandedFullWidth ? "Restore width" : "Full width"}
                title={
                  isExpandedFullWidth
                    ? "Restore previous width"
                    : "Expand to full overlay width"
                }
                disabled={isMaximized}
                icon={
                  isExpandedFullWidth ? (
                    <FoldHorizontal
                      className="h-3.5 w-3.5"
                      strokeWidth={TRN_WINDOW_HEADER_ACTION_STROKE}
                      aria-hidden
                    />
                  ) : (
                    <StretchHorizontal
                      className="h-3.5 w-3.5"
                      strokeWidth={TRN_WINDOW_HEADER_ACTION_STROKE}
                      aria-hidden
                    />
                  )
                }
                onClick={() => {
                  if (isMaximized) {
                    return;
                  }
                  const { w: vw, h: vh } = overlayDimsRef.current;
                  const cur = rectRef.current;
                  if (!isExpandedFullWidth) {
                    restoreFullWidthAxisRef.current = { x: cur.x, width: cur.width };
                    const next = normalizeRect(
                      { ...cur, x: 0, width: vw },
                      vw,
                      vh,
                      minWidth,
                      minHeight,
                    );
                    setRect(next);
                    setIsExpandedFullWidth(true);
                    if (persistRectStorageKey != null) {
                      savePersistedWindowGeometry(persistRectStorageKey, next, {
                        autoHeightShellLocked:
                          heightMode === "auto" ? autoShellHeightLocked : undefined,
                      });
                    }
                    return;
                  }
                  const snap = restoreFullWidthAxisRef.current;
                  restoreFullWidthAxisRef.current = null;
                  setIsExpandedFullWidth(false);
                  const next =
                    snap != null
                      ? normalizeRect(
                          { ...rectRef.current, x: snap.x, width: snap.width },
                          vw,
                          vh,
                          minWidth,
                          minHeight,
                        )
                      : normalizeRect(rectRef.current, vw, vh, minWidth, minHeight);
                  setRect(next);
                  if (persistRectStorageKey != null) {
                    savePersistedWindowGeometry(persistRectStorageKey, next, {
                      autoHeightShellLocked:
                        heightMode === "auto" ? autoShellHeightLocked : undefined,
                    });
                  }
                }}
              />
            ) : null}
            {showExpandFullHeight ? (
              <WindowActionButton
                label={isExpandedFullHeight ? "Restore height" : "Full height"}
                title={
                  isExpandedFullHeight
                    ? "Restore previous height"
                    : "Expand to full overlay height"
                }
                disabled={isMaximized}
                icon={
                  isExpandedFullHeight ? (
                    <FoldVertical
                      className="h-3.5 w-3.5"
                      strokeWidth={TRN_WINDOW_HEADER_ACTION_STROKE}
                      aria-hidden
                    />
                  ) : (
                    <StretchVertical
                      className="h-3.5 w-3.5"
                      strokeWidth={TRN_WINDOW_HEADER_ACTION_STROKE}
                      aria-hidden
                    />
                  )
                }
                onClick={() => {
                  if (isMaximized) {
                    return;
                  }
                  const { w: vw, h: vh } = overlayDimsRef.current;
                  const cur = rectRef.current;
                  if (!isExpandedFullHeight) {
                    restoreFullHeightAxisRef.current = { y: cur.y, height: cur.height };
                    const next = normalizeRect(
                      { ...cur, y: 0, height: vh },
                      vw,
                      vh,
                      minWidth,
                      minHeight,
                    );
                    setRect(next);
                    setIsExpandedFullHeight(true);
                    if (persistRectStorageKey != null) {
                      savePersistedWindowGeometry(persistRectStorageKey, next, {
                        autoHeightShellLocked:
                          heightMode === "auto" ? autoShellHeightLocked : undefined,
                      });
                    }
                    return;
                  }
                  const snap = restoreFullHeightAxisRef.current;
                  restoreFullHeightAxisRef.current = null;
                  setIsExpandedFullHeight(false);
                  const next =
                    snap != null
                      ? normalizeRect(
                          { ...rectRef.current, y: snap.y, height: snap.height },
                          vw,
                          vh,
                          minWidth,
                          minHeight,
                        )
                      : normalizeRect(rectRef.current, vw, vh, minWidth, minHeight);
                  setRect(next);
                  if (persistRectStorageKey != null) {
                    savePersistedWindowGeometry(persistRectStorageKey, next, {
                      autoHeightShellLocked:
                        heightMode === "auto" ? autoShellHeightLocked : undefined,
                    });
                  }
                }}
              />
            ) : null}
            {showMaximize ? (
              <WindowActionButton
                label={isMaximized ? "Restore" : "Maximize"}
                title={isMaximized ? "Restore" : "Maximize"}
                icon={
                  isMaximized ? (
                    <Minimize2
                      className="h-3.5 w-3.5"
                      strokeWidth={TRN_WINDOW_HEADER_ACTION_STROKE}
                      aria-hidden
                    />
                  ) : (
                    <Maximize2
                      className="h-3.5 w-3.5"
                      strokeWidth={TRN_WINDOW_HEADER_ACTION_STROKE}
                      aria-hidden
                    />
                  )
                }
                onClick={() => {
                  const { w: vw, h: vh } = overlayDimsRef.current;
                  if (isMaximized) {
                    const restoreRect = restoreRectRef.current ?? initial;
                    const normalized = normalizeRect(
                      restoreRect,
                      vw,
                      vh,
                      minWidth,
                      minHeight,
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
                          autoHeightShellLocked:
                            heightMode === "auto" ? false : undefined,
                        },
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
                    height: vh,
                  };
                  setRect(maxed);
                  setIsMaximized(true);
                  if (persistRectStorageKey != null) {
                    savePersistedWindowGeometry(persistRectStorageKey, maxed, {
                      autoHeightShellLocked:
                        heightMode === "auto" ? false : undefined,
                    });
                  }
                }}
              />
            ) : null}
            {onClose ? (
              <WindowActionButton
                label="Close"
                title="Close"
                icon={
                  <X
                    className="h-3.5 w-3.5"
                    strokeWidth={TRN_WINDOW_HEADER_ACTION_STROKE}
                    aria-hidden
                  />
                }
                onClick={onClose}
              />
            ) : null}
          </div>
        </div>

        {showContent ? (
          <div
            className={twMerge("relative z-0", contentAreaHeightClass, contentClassName)}
            style={{
              backgroundColor: glass
                ? "rgb(9 9 11 / 0.26)"
                : "rgb(9 9 11 / 0.8)",
              ...(autoContentMaxHeight != null
                ? { maxHeight: autoContentMaxHeight }
                : {}),
              ...contentStyle,
            }}
          >
            {children}
          </div>
        ) : null}

        {showFooter ? (
          <WindowFooter
            rect={rect}
            measuredShellHeightPx={
              heightMode === "auto" && !isMaximized
                ? measuredShellHeightPx
                : null
            }
            heightMode={heightMode}
            autoShellHeightLocked={autoShellHeightLocked}
          />
        ) : null}

        {resizable && !isMaximized ? (
          <WindowResizeHandles
            mode={resizeEdges}
            onResizeStart={(edge, evt) =>
            {
              let baseW = rectRef.current.width;
              let baseH = rectRef.current.height;
              const autoHeightUnlocked =
                heightMode === "auto" && !autoShellHeightLocked;
              if (autoHeightUnlocked)
              {
                const shellH = shellRef.current?.getBoundingClientRect().height;
                if (shellH != null && Number.isFinite(shellH) && shellH > 0)
                {
                  baseH = shellH;
                  setRect((p) => ({ ...p, height: shellH }));
                }
              }
              /**
               * Take the pixel height up front on a vertical drag. Locking on pointer-up
               * instead left the shell on `height: auto` for the whole gesture, so the
               * bottom edge sat still and only jumped to the new size on release.
               */
              const verticalDrag =
                resizeEdgeUsesNorth(edge) || resizeEdgeUsesSouth(edge);
              const autoHeightLockApplied = autoHeightUnlocked && verticalDrag;
              if (autoHeightLockApplied)
              {
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
                autoHeightLockApplied,
              };
              // Keep receiving moves once the pointer leaves the 8px strip and travels
              // over the 3D canvas or another pane. Throws on an inactive pointer id;
              // the window listeners still carry the drag in that case.
              try {
                evt.currentTarget.setPointerCapture?.(evt.pointerId);
              } catch {
                /* capture unavailable */
              }
              evt.preventDefault();
              evt.stopPropagation();
            }}
            onFitHeight={
              heightMode === "auto" && verticalResizeAvailable
                ? fitShellHeightToContent
                : undefined
            }
          />
        ) : null}
      </div>
    </>
  );

  if (!open) {
    return null;
  }

  const overlayZIndex = isNonModal ? managedZIndex : zIndex;

  if (boundsRef) {
    if (portalHost == null) {
      return null;
    }
    return createPortal(
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ zIndex: overlayZIndex }}
      >
        {overlayInner}
      </div>,
      portalHost,
    );
  }

  const viewportOverlay = (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: overlayZIndex }}>
      {overlayInner}
    </div>
  );

  // Portal to document.body so fixed overlays stack above workbench panes / React Flow
  // transforms (inline render stays trapped in the pane stacking context).
  if (typeof document !== "undefined") {
    return createPortal(viewportOverlay, document.body);
  }

  return viewportOverlay;
}
