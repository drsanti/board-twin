/*******************************************************************************
 * File Name : TRNHoldModeIconButton.tsx
 *
 * Description : Icon button with short-click primary action + hold / corner-click
 *               mode menu (progress ring). Portaled glass flyout.
 *
 *******************************************************************************/

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { TRN_HINT_POPOVER_PANEL_CLASS } from "./TRNHintText.js";
import { TRNTooltip, type TRNTooltipPlacement } from "./TRNTooltip.js";

/**
 * Webview UI checklist:
 * - Sibling: TwinSceneHudFlyoutTool / TRNIconButton toolbar chrome
 * - Control: TRNTooltip + portaled glass menu (no native title)
 * - Menus ≤5 — no search; portal to document.body
 * - No tabular-nums
 */

export const TRN_HOLD_MODE_ICON_BUTTON_DEFAULT_HOLD_MS = 800;
/** Delay before the hold progress ring appears (short clicks stay ring-free). */
export const TRN_HOLD_MODE_PROGRESS_ARM_MS = 200;

const CORNER_HIT_PX = 12;

export type TRNHoldModeIconButtonItem = {
  id: string;
  label: string;
  /** Secondary line under the label in the mode menu. */
  subtitle?: string;
  icon: ReactNode;
  /** Face `aria-label` when this mode is active (defaults to `label`). */
  ariaLabel?: string;
};

export type TRNHoldModeIconButtonProps = {
  items: readonly TRNHoldModeIconButtonItem[];
  activeItemId: string;
  onActiveItemChange: (id: string) => void;
  /**
   * Short click (when menu did not open). Skipped when `primaryActionEnabled` is false.
   */
  onPrimaryAction?: () => void;
  /** When false, short click is a no-op (hold / corner still open the menu). Default true. */
  primaryActionEnabled?: boolean;
  /** Dim face (inactive / nothing to do). */
  dimmed?: boolean;
  /** Pulse face (e.g. auto action pending). */
  pending?: boolean;
  /**
   * Stronger “needs click” cue (Manual dirty Apply) — pulse + amber ring.
   * Prefer this over `pending` when the operator must click to commit.
   */
  attention?: boolean;
  /** Cyan emphasis (active / dirty). */
  emphasize?: boolean;
  /** Optional `aria-pressed` for toggle-like modes (e.g. Auto on). */
  pressed?: boolean | undefined;
  /** Hover hint; defaults to active item label. */
  hint?: ReactNode;
  menuAriaLabel?: string;
  holdMs?: number;
  /** Ms before the circular progress appears (default {@link TRN_HOLD_MODE_PROGRESS_ARM_MS}). */
  progressArmMs?: number;
  className?: string;
  tooltipPlacement?: TRNTooltipPlacement;
  tooltipOpenDelayMs?: number;
};

export function TRNHoldModeIconButton(props: TRNHoldModeIconButtonProps) {
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
    tooltipOpenDelayMs = 400,
  } = props;

  const active =
    items.find((item) => item.id === activeItemId) ?? items[0] ?? null;
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const holdTimerRef = useRef<number | null>(null);
  const armTimerRef = useRef<number | null>(null);
  const holdRafRef = useRef<number | null>(null);
  /** When progress ring fill started (after arm delay). */
  const progressStartedAtRef = useRef<number | null>(null);
  const openedByHoldRef = useRef(false);
  /** True once arm delay elapsed — release must not fire primary. */
  const holdArmedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
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
    const onDown = (event: MouseEvent) => {
      if (rootRef.current != null && rootRef.current.contains(event.target as Node)) {
        return;
      }
      const menuEl = document.getElementById(menuId);
      if (menuEl != null && menuEl.contains(event.target as Node)) {
        return;
      }
      setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
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

  const isCornerHit = (event: ReactPointerEvent<HTMLButtonElement>): boolean => {
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    return (
      event.clientX >= r.right - CORNER_HIT_PX &&
      event.clientY >= r.bottom - CORNER_HIT_PX
    );
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

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || items.length === 0) {
      return;
    }
    // Shift+click or corner triangle — open mode menu immediately.
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
      // ignore
    }
    setHoldProgress(0);
    // Ring stays hidden until arm delay — normal clicks never flash progress.
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

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const wasHoldOpen = openedByHoldRef.current;
    const wasArmed = holdArmedRef.current;
    const pid = pointerIdRef.current;
    if (pid != null) {
      try {
        if (event.currentTarget.hasPointerCapture(pid)) {
          event.currentTarget.releasePointerCapture(pid);
        }
      } catch {
        // ignore
      }
      pointerIdRef.current = null;
    }
    clearHold();
    // After arm (ring visible) or menu open — abort, do not fire primary.
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

  const onPointerLeave = (event: ReactPointerEvent<HTMLButtonElement>) => {
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
  const tip =
    hint ?? (
      <span className="text-[11px] leading-relaxed text-zinc-100">
        {active.label}. Hold, Shift+click, or corner-click to switch mode.
      </span>
    );

  const ringSize = 26;
  const stroke = 2;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - holdProgress);
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const suppressTooltip = menuOpen || holdProgress > 0.02;

  const button = (
    <button
      ref={buttonRef}
      type="button"
      aria-label={faceLabel}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      aria-controls={menuOpen ? menuId : undefined}
      {...(pressed !== undefined ? { "aria-pressed": pressed } : {})}
      className={twMerge(
        "relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 shadow-none transition-colors",
        "hover:bg-zinc-800/45",
        dimmed
          ? "cursor-default text-zinc-500 opacity-50"
          : emphasize
            ? "text-cyan-300 hover:text-cyan-200"
            : "text-zinc-400 hover:text-zinc-100",
        pending || attention ? "animate-pulse" : null,
        attention
          ? "ring-1 ring-inset ring-amber-400/55 shadow-[0_0_10px_-2px_rgba(251,191,36,0.45)]"
          : null,
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerLeave}
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      {holdProgress > 0.01 ? (
        <svg
          className="pointer-events-none absolute inset-0 m-auto"
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          aria-hidden
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={stroke}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
          />
        </svg>
      ) : null}
      <span className="relative z-[1] inline-flex h-3.5 w-3.5 items-center justify-center">
        {active.icon}
      </span>
      <span
        className="pointer-events-none absolute bottom-0.5 right-0.5 h-0 w-0 border-b-[5px] border-l-[5px] border-b-zinc-300/90 border-l-transparent"
        aria-hidden
      />
    </button>
  );

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0">
      <TRNTooltip
        placement={tooltipPlacement}
        openDelayMs={tooltipOpenDelayMs}
        disableHoverFx
        forceClosed={suppressTooltip}
        triggerWrapper="span"
        triggerClassName="inline-flex"
        triggerAriaLabel={faceLabel}
        content={tip}
        panelClassName={TRN_HINT_POPOVER_PANEL_CLASS}
        trigger={button}
      />
      {menuOpen && menuPos != null && portalTarget != null
        ? createPortal(
            <div
              id={menuId}
              role="menu"
              aria-label={menuAriaLabel}
              className="pointer-events-auto fixed z-[2400] inline-flex min-w-[11.5rem] flex-col items-stretch gap-0.5 rounded-xl border border-zinc-600/55 bg-zinc-950/90 p-1 shadow-md backdrop-blur-md"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              {items.map((item) => {
                const selected = item.id === activeItemId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    className={twMerge(
                      "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                      selected
                        ? "bg-sky-500/35 text-white"
                        : "text-zinc-200 hover:bg-zinc-800/90",
                    )}
                    onClick={() => {
                      onActiveItemChange(item.id);
                      setMenuOpen(false);
                    }}
                  >
                    <span
                      className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-zinc-300"
                      aria-hidden
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-medium leading-tight">
                        {item.label}
                      </span>
                      {item.subtitle != null && item.subtitle.length > 0 ? (
                        <span className="mt-0.5 block text-[10px] leading-tight text-zinc-400">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
}
