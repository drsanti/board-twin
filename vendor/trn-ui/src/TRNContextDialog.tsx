import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { isEventInsideTrnFloatingLayer } from "./trn-floating-menu-placement.js";

export type TRNContextDialogAnchor = { x: number; y: number };

export type TRNContextDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  anchor: TRNContextDialogAnchor | null;
  widthPx?: number;
  zIndex?: number;
  /** Optional additional className for the outer panel shell. */
  panelClassName?: string;
  children: ReactNode;
};

const VIEWPORT_PAD_PX = 12;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function clampDialogRect(
  left: number,
  top: number,
  width: number,
  height: number,
): { left: number; top: number; maxHeight: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxHeight = Math.max(160, vh - VIEWPORT_PAD_PX * 2);
  const usedHeight = Math.min(height, maxHeight);
  return {
    left: clamp(left, VIEWPORT_PAD_PX, Math.max(VIEWPORT_PAD_PX, vw - width - VIEWPORT_PAD_PX)),
    top: clamp(top, VIEWPORT_PAD_PX, Math.max(VIEWPORT_PAD_PX, vh - usedHeight - VIEWPORT_PAD_PX)),
    maxHeight,
  };
}

export function TRNContextDialog(props: TRNContextDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    anchor,
    widthPx = 420,
    zIndex = 2400,
    panelClassName,
    children,
  } = props;
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<{ left: number; top: number; maxHeight: number } | null>(null);
  const rectRef = useRef(rect);
  rectRef.current = rect;
  const dragRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const placedForAnchorRef = useRef<TRNContextDialogAnchor | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    if (!open || anchor == null || typeof window === "undefined") {
      setRect(null);
      placedForAnchorRef.current = null;
      return;
    }
    const preferredFromAnchor = (height: number) => {
      const preferredTop = anchor.y + 8;
      const flippedTop = anchor.y - height - 8;
      const vh = window.innerHeight;
      if (preferredTop + height > vh - VIEWPORT_PAD_PX && flippedTop >= VIEWPORT_PAD_PX) {
        return flippedTop;
      }
      return preferredTop;
    };
    const update = (mode: "place" | "clamp") => {
      if (dragRef.current != null) return;
      const panel = panelRef.current;
      const height = panel?.offsetHeight && panel.offsetHeight > 0 ? panel.offsetHeight : 480;
      const current = rectRef.current;
      const sameAnchor =
        placedForAnchorRef.current != null &&
        placedForAnchorRef.current.x === anchor.x &&
        placedForAnchorRef.current.y === anchor.y;
      if (mode === "place" || current == null || !sameAnchor) {
        placedForAnchorRef.current = { x: anchor.x, y: anchor.y };
        setRect(clampDialogRect(anchor.x, preferredFromAnchor(height), widthPx, height));
        return;
      }
      setRect(clampDialogRect(current.left, current.top, widthPx, height));
    };
    const sameAnchor =
      placedForAnchorRef.current != null &&
      placedForAnchorRef.current.x === anchor.x &&
      placedForAnchorRef.current.y === anchor.y;
    update(sameAnchor && rectRef.current != null ? "clamp" : "place");
    const panel = panelRef.current;
    const ro =
      panel != null && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => update("clamp"))
        : null;
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
    const onPointerDown = (e: PointerEvent) => {
      if (dragRef.current != null) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      // Portaled pickers/menus (e.g. TRNColorRingPicker) render under document.body.
      if (isEventInsideTrnFloatingLayer(e.target)) return;
      onOpenChange(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
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

  const onHeaderPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const current =
      rectRef.current ??
      clampDialogRect(
        VIEWPORT_PAD_PX,
        VIEWPORT_PAD_PX,
        widthPx,
        panelRef.current?.offsetHeight ?? 480,
      );

    e.preventDefault();
    e.stopPropagation();

    const pointerId = e.pointerId;
    dragRef.current = {
      pointerId,
      originX: e.clientX,
      originY: e.clientY,
      startLeft: current.left,
      startTop: current.top,
    };
    setDragging(true);

    try {
      e.currentTarget.setPointerCapture(pointerId);
    } catch {
      // Some hosts reject capture; window listeners below still move the dialog.
    }

    const onMove = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (drag == null || ev.pointerId !== drag.pointerId) return;
      const panel = panelRef.current;
      const height = panel?.offsetHeight ?? 480;
      const next = clampDialogRect(
        drag.startLeft + (ev.clientX - drag.originX),
        drag.startTop + (ev.clientY - drag.originY),
        widthPx,
        height,
      );
      rectRef.current = next;
      setRect(next);
    };

    const onUp = (ev: PointerEvent) => {
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
        // ignore
      }
    };
  };

  if (!open || anchor == null || portalTarget == null) {
    return null;
  }

  const style: CSSProperties = {
    top: rect?.top ?? VIEWPORT_PAD_PX,
    left: rect?.left ?? VIEWPORT_PAD_PX,
    width: widthPx,
    maxHeight: rect?.maxHeight ?? `calc(100vh - ${VIEWPORT_PAD_PX * 2}px)`,
  };

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex }}
      aria-hidden={false}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-label={title}
        aria-modal="false"
        className="pointer-events-auto fixed flex flex-col"
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={twMerge(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-zinc-700/85 bg-zinc-900/70 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm",
            panelClassName,
          )}
        >
          <div
            className={twMerge(
              "flex shrink-0 select-none items-center justify-between gap-2 border-b border-zinc-700/80 bg-linear-to-r from-zinc-900/70 to-zinc-800/55 py-1 pl-3 pr-1.5",
            )}
          >
            <div
              className={twMerge(
                "flex min-w-0 flex-1 touch-none items-center py-0.5",
                dragging ? "cursor-grabbing" : "cursor-grab",
              )}
              onPointerDown={onHeaderPointerDown}
            >
              <div className="min-w-0 truncate text-xs font-semibold text-zinc-100">
                {title}
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border border-red-500/35 bg-red-500/20 text-red-200/90 transition-colors hover:border-red-500/50 hover:bg-red-500/30 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/35"
              aria-label="Close dialog"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                endDrag();
                onOpenChange(false);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                endDrag();
                onOpenChange(false);
              }}
            >
              <X className="h-4 w-4" aria-hidden strokeWidth={2.25} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
            <div className="space-y-3">{children}</div>
          </div>
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
