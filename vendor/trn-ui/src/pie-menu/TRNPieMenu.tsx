/*******************************************************************************
 * File Name : TRNPieMenu.tsx
 *
 * Description : Tap-to-open radial pie (Blender-like). Portal HUD with 8
 *               glass slices clockwise from 12 o'clock. Domain-free.
 *
 *******************************************************************************/

import {
  useMemo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { TRNTooltip } from "../TRNTooltip.js";
import "./pie-menu.css"; // slate chrome — variable fills, no charcoal !important hardcodes
import {
  clampTrnPieCenter,
  resolveTrnPieMenuLayout,
  TRN_PIE_SLOT_TO_DIGIT,
  trnPieHubHoverArcD,
  trnPieSliceOffset,
  trnPieSlotBoxAlign,
  type TRNPieMenuClampBounds,
  type TRNPieMenuLayoutConfig,
} from "./trn-pie-menu-layout.js";
import {
  resolveTrnPieMenuAnimation,
  resolveTrnPieMenuThemeTokens,
  trnPieMenuCssVars,
  type TRNPieMenuAnimationConfig,
  type TRNPieMenuBehaviorConfig,
  type TRNPieMenuClassNames,
  type TRNPieMenuThemeId,
  type TRNPieMenuTokensConfig,
} from "./trn-pie-menu-config.js";
import { useTrnPieMenuController } from "./useTrnPieMenuController.js";
import { useTrnPieMenuMotion } from "./useTrnPieMenuMotion.js";

export type TRNPieMenuItem = {
  id: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  /** Letter in the label to underline; also confirms the slice when typed. */
  mnemonic?: string;
  disabled?: boolean;
  disabledHint?: string;
};

export type TRNPieMenuProps = {
  open: boolean;
  title?: string;
  /** Eight slots clockwise from 12 o'clock. Use `null` for an empty slot. */
  items: ReadonlyArray<TRNPieMenuItem | null>;
  anchor: { x: number; y: number };
  /** Row spacing, distribute radius, hub size, etc. Omit for TRN defaults. */
  layout?: TRNPieMenuLayoutConfig;
  /** Confirm/cancel chords and interaction mode. */
  behavior?: TRNPieMenuBehaviorConfig;
  /** Open/hover motion presets. Default fade-scale with reduced-motion respect. */
  animation?: TRNPieMenuAnimationConfig;
  /** Visual preset. Default `glass`. Twin Factory uses `slate`. */
  theme?: TRNPieMenuThemeId;
  /** CSS custom property overrides for hub / slice chrome. */
  tokens?: TRNPieMenuTokensConfig;
  /** Tailwind or app classes per pie region. */
  classNames?: TRNPieMenuClassNames;
  /** Client rect to keep the full pie inside (e.g. 3D Scene canvas). Defaults to window. */
  clampBounds?: TRNPieMenuClampBounds | null;
  onConfirm: (id: string) => void;
  onCancel: () => void;
};

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
  TRNPieMenuRepeatCancelChord,
  TRNPieMenuThemeId,
  TRNPieMenuTokensConfig,
} from "./trn-pie-menu-config.js";
export type { TRNPieMenuLayoutConfig, TRNPieMenuClampBounds } from "./trn-pie-menu-layout.js";

const TRN_PIE_SLICE_ACTIVE_CLASSNAME = "trn-pie-menu__slice--active";

/** Layout only — fills come from inline token colors so TRN glass utilities cannot leak. */
const TRN_PIE_SLICE_LAYOUT_CLASS =
  "flex h-8 w-max max-w-[240px] shrink-0 items-center justify-start gap-2 border px-2.5 py-1 text-left text-[11px] font-medium leading-tight shadow-none";

function pieLabelWithMnemonic(label: string, mnemonic?: string): ReactNode {
  if (mnemonic == null || mnemonic.length === 0) {
    return label;
  }
  const needle = mnemonic[0] ?? "";
  const idx = label.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) {
    return label;
  }
  return (
    <>
      {label.slice(0, idx)}
      <span className="underline underline-offset-2">{label.slice(idx, idx + 1)}</span>
      {label.slice(idx + 1)}
    </>
  );
}

function pieCenterFromAnchor(
  anchor: { x: number; y: number },
  layoutConfig?: TRNPieMenuLayoutConfig,
  clampBounds?: TRNPieMenuClampBounds | null,
): { x: number; y: number } {
  if (typeof window === "undefined") {
    return anchor;
  }
  return clampTrnPieCenter({
    anchorX: anchor.x,
    anchorY: anchor.y,
    layout: layoutConfig,
    clampBounds,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });
}

export function TRNPieMenu(props: TRNPieMenuProps) {
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
    onCancel,
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
    confirmFromPointer,
  } = useTrnPieMenuController({
    open,
    items,
    layout: layoutConfig,
    behavior: behaviorConfig,
    hubCenter,
    openPointer,
    onConfirm,
    onCancel,
  });

  const angularHover = behavior.hoverMode === "angular";
  const confirmAnywhere =
    behavior.confirmClick === "anywhere" && behavior.confirmOn.includes("click");

  const motionSlots = useMemo(
    () =>
      slots.map((item) =>
        item != null ? { id: item.id, disabled: item.disabled } : null,
      ),
    [slots],
  );

  const {
    mounted,
    useGsap,
    cssAnimClass,
    clusterRef,
    hubAnimRef,
    titleRef,
    setSliceRef,
  } = useTrnPieMenuMotion({
    open,
    animationConfig,
    layout,
    slots: motionSlots,
  });

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const themeTokens = resolveTrnPieMenuThemeTokens(theme, tokens);
  const cssVars = trnPieMenuCssVars({ layout, tokens, theme, animation });

  const onOverlayPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!open) {
      return;
    }
    updateHoverFromPointer(event.clientX, event.clientY);
  };

  const onOverlayPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
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

  const slicePointerEvents =
    angularHover && confirmAnywhere ? "pointer-events-none" : "pointer-events-auto";

  return createPortal(
    <div
      className={twMerge("trn-pie-menu fixed inset-0 z-[2600]", classNames?.overlay)}
      data-trn-pie-menu
      data-trn-pie-theme={theme}
      style={cssVars}
      role="presentation"
      onPointerMove={onOverlayPointerMove}
      onPointerDown={onOverlayPointerDown}
      onContextMenu={(event) => {
        if (!behavior.cancelOn.includes("rmb")) {
          return;
        }
        event.preventDefault();
        onCancel();
      }}
    >
      <div
        className={twMerge("absolute inset-0 cursor-default", classNames?.backdrop)}
        aria-hidden
      />
      <div
        ref={clusterRef}
        className={twMerge(
          "trn-pie-menu pointer-events-none fixed z-[2601]",
          useGsap ? "trn-pie-menu--engine-gsap" : null,
          cssAnimClass,
          classNames?.cluster,
        )}
        data-trn-pie-engine={animation.engine}
        data-trn-pie-theme={theme}
        style={{ left: center.x, top: center.y, ...cssVars }}
      >
        <div
          className={twMerge(
            "pointer-events-none absolute z-0 rounded-full",
            classNames?.hoverDisc,
          )}
          style={{
            width: layout.hoverDiscPx,
            height: layout.hoverDiscPx,
            left: -layout.hoverDiscPx / 2,
            top: -layout.hoverDiscPx / 2,
          }}
          aria-hidden
        />
        <div
          className={twMerge(
            "trn-pie-menu__title-wrap pointer-events-none absolute z-10",
            classNames?.titleWrap,
          )}
          style={{
            left: 0,
            top: 0,
            transform: "translate(-50%, calc(-50% - 22px))",
          }}
        >
          <div
            ref={titleRef}
            className={twMerge(
              "trn-pie-menu__title whitespace-nowrap text-[10px] font-medium tracking-wide",
              classNames?.title,
            )}
          >
            {title}
          </div>
        </div>
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: -layout.hubSizePx / 2,
            top: -layout.hubSizePx / 2,
            width: layout.hubSizePx,
            height: layout.hubSizePx,
          }}
        >
          <svg
            className={twMerge(
              "trn-pie-menu__hub-svg pointer-events-none h-full w-full overflow-visible",
              classNames?.hubSvg,
            )}
            width={layout.hubSizePx}
            height={layout.hubSizePx}
            viewBox={`0 0 ${layout.hubSizePx} ${layout.hubSizePx}`}
            aria-hidden
          >
          <g ref={hubAnimRef}>
            <circle
              className={twMerge("trn-pie-menu__hub-ring", classNames?.hubRing)}
              cx={layout.hubSizePx / 2}
              cy={layout.hubSizePx / 2}
              r={layout.hubRingRadiusPx}
              strokeWidth="1.5"
            />
          </g>
          <path
            className={twMerge("trn-pie-menu__hub-hover-arc", classNames?.hubHoverArc)}
            d={trnPieHubHoverArcD({
              slot: hoverSlot ?? 0,
              cx: layout.hubSizePx / 2,
              cy: layout.hubSizePx / 2,
              radius: layout.hubRingRadiusPx,
            })}
            fill="none"
            stroke="var(--pie-hub-hover-arc-stroke, #60a5fa)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={hoverSlot == null ? 0 : 1}
          />
        </svg>
        </div>
        {slots.map((item, slot) => {
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
          const hint =
            item.disabled === true
              ? (item.disabledHint ?? item.hint)
              : item.hint;
          const opaqueChrome = theme !== "glass";
          const button = (
            <button
              type="button"
              disabled={item.disabled === true}
              data-trn-pie-slice-active={active ? "true" : undefined}
              style={{
                backgroundColor: active
                  ? themeTokens.sliceActiveFill
                  : themeTokens.sliceFill,
                borderColor: active
                  ? themeTokens.sliceActiveBorder
                  : themeTokens.sliceBorder,
                color: active ? themeTokens.sliceActiveText : themeTokens.sliceText,
                backdropFilter: opaqueChrome ? "none" : undefined,
                WebkitBackdropFilter: opaqueChrome ? "none" : undefined,
              }}
              className={twMerge(
                TRN_PIE_SLICE_LAYOUT_CLASS,
                opaqueChrome ? "rounded-full" : "rounded-md",
                classNames?.slice,
                active ? TRN_PIE_SLICE_ACTIVE_CLASSNAME : null,
                active ? classNames?.sliceActive : null,
                item.disabled === true ? "opacity-45" : null,
                item.disabled === true ? classNames?.sliceDisabled : null,
              )}
              onPointerDown={
                confirmAnywhere
                  ? undefined
                  : (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (event.button === 2 && behavior.cancelOn.includes("rmb")) {
                        onCancel();
                        return;
                      }
                      if (event.button === 0 && behavior.confirmOn.includes("click")) {
                        confirmSlot(slot, "click");
                      }
                    }
              }
            >
              {item.icon ? (
                <span className="inline-flex shrink-0 items-center">{item.icon}</span>
              ) : null}
              <span className="min-w-0 flex-1 truncate">
                {pieLabelWithMnemonic(item.label, item.mnemonic)}
              </span>
              <span
                className={twMerge(
                  "trn-pie-menu__slice-digit min-w-3 pl-1 text-right text-[10px]",
                  classNames?.sliceDigit,
                )}
              >
                {digit}
              </span>
            </button>
          );
          return (
            <div
              key={`${item.id}-${slot}`}
              className={twMerge(
                "trn-pie-menu__slice-wrap pointer-events-none absolute z-20",
                classNames?.sliceWrap,
              )}
              style={{
                left: offset.x,
                top: offset.y,
                transform: align.translate,
                ["--pie-slice-index" as string]: String(slot),
              }}
            >
              <div
                ref={(el) => setSliceRef(slot, el)}
                className={twMerge(
                  "trn-pie-menu__slice-inner",
                  slicePointerEvents,
                  classNames?.sliceInner,
                )}
                style={{ transformOrigin: sliceTransformOrigin }}
                onPointerEnter={
                  behavior.hoverMode === "slice-hit"
                    ? () => setSliceHover(slot)
                    : undefined
                }
              >
              {hint != null && hint.length > 0 ? (
                <TRNTooltip
                  content={hint}
                  trigger={button}
                  triggerWrapper="span"
                  placement="top"
                  openDelayMs={400}
                />
              ) : (
                button
              )}
              </div>
            </div>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
