import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { TRNCardHeader } from "./TRNCardHeader.js";
import { TRNHintTooltip } from "./TRNHintTooltip.js";
import {
  trnInteractiveCardPaddingClass,
  trnInteractiveCardShellClass,
  type TRNInteractiveCardShell,
} from "./trnInteractiveCardShell.js";

export type { TRNInteractiveCardShell } from "./trnInteractiveCardShell.js";

/** Read full scroll height even when the collapsible wrapper already caps max-height. */
function measureIntrinsicContentHeight(element: HTMLElement): number {
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

/** Padding / border-top on inner panels — avoid clipping the last row. */
const COLLAPSIBLE_INTRINSIC_HEIGHT_BUFFER_PX = 8;

function InteractiveCardTitle(props: {
  title: ReactNode;
  hint?: ReactNode;
  titleClassName?: string;
}) {
  const { title, hint, titleClassName } = props;
  const labelClass = twMerge(
    "block min-w-0 truncate text-xs font-semibold leading-none normal-case tracking-normal text-zinc-100",
    titleClassName,
    hint != null ? "cursor-help" : null,
  );

  if (hint == null || (typeof hint === "string" && hint.trim().length === 0)) {
    return typeof title === "string" ? <span className={labelClass}>{title}</span> : title;
  }

  const hintLabel = typeof title === "string" ? title : "section";

  return (
    <TRNHintTooltip
      trigger={<span className={labelClass}>{title}</span>}
      content={hint}
      triggerAriaLabel={`About ${hintLabel}`}
      placement="top-start"
      triggerClassName="min-w-0 flex-1 text-left"
      triggerWrapper="span"
      wide={typeof hint === "string" ? hint.length > 120 : true}
    />
  );
}

export type TRNInteractiveCardProps = {
  title: ReactNode;
  /** Hover tooltip on the title ({@link TRNHintTooltip}). */
  hint?: ReactNode;
  titleLeadingSlot?: ReactNode;
  titleTrailingSlot?: ReactNode;
  children?: ReactNode;
  /** Card surface chrome. Default `glass`. Use `className` for layout only (`h-auto`, `flex-1`, …). */
  shell?: TRNInteractiveCardShell;
  className?: string;
  headerClassName?: string;
  headerTitleClassName?: string;
  contentClassName?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  /** When `collapsible`, start expanded (default `true`). Ignored if `defaultCollapsed` is set. */
  defaultExpanded?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  animationDurationMs?: number;
  animationEasing?: string;
  /**
   * When collapsible, animates `max-height` from measured inner scroll height (default).
   * Set `false` when children use flex (`flex-1` / fill height); intrinsic measurement
   * caps height and breaks canvases and other stretch layouts.
   */
  collapsibleMeasureIntrinsic?: boolean;
};

export function TRNInteractiveCard(props: TRNInteractiveCardProps) {
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
    collapsibleMeasureIntrinsic = true,
  } = props;

  const isCollapsedControlled = collapsed != null;
  const initialCollapsed = defaultCollapsedProp ?? !defaultExpanded;
  const [internalCollapsed, setInternalCollapsed] = useState(initialCollapsed);
  const effectiveCollapsed = isCollapsedControlled
    ? (collapsed as boolean)
    : internalCollapsed;

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const measuredHeightRef = useRef(0);

  useEffect(() => {
    if (
      !collapsible ||
      !collapsibleMeasureIntrinsic ||
      contentRef.current == null
    ) {
      return;
    }
    const element = contentRef.current;
    let measureRafId = 0;
    const updateHeight = () => {
      cancelAnimationFrame(measureRafId);
      measureRafId = requestAnimationFrame(() => {
        // While collapsed the wrapper is max-height: 0; keep the last expanded
        // measurement for the expand animation instead of re-reading a clipped box.
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

  const setCollapsed = (next: boolean) => {
    if (!isCollapsedControlled) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const contentStyle: CSSProperties | undefined = useMemo(() => {
    if (!collapsible) {
      return undefined;
    }
    if (!collapsibleMeasureIntrinsic) {
      return {
        maxHeight: effectiveCollapsed ? 0 : undefined,
        opacity: effectiveCollapsed ? 0 : 1,
        transitionProperty: "max-height, opacity",
        transitionDuration: `${animationDurationMs}ms`,
        transitionTimingFunction: animationEasing,
        flex: effectiveCollapsed ? undefined : "1 1 0%",
        minHeight: 0,
      };
    }
    return {
      maxHeight: effectiveCollapsed
        ? 0
        : measuredHeight > 0
          ? measuredHeight + COLLAPSIBLE_INTRINSIC_HEIGHT_BUFFER_PX
          : undefined,
      opacity: effectiveCollapsed ? 0 : 1,
      transitionProperty: "max-height, opacity",
      transitionDuration: `${animationDurationMs}ms`,
      transitionTimingFunction: animationEasing,
    };
  }, [
    animationDurationMs,
    animationEasing,
    collapsible,
    collapsibleMeasureIntrinsic,
    effectiveCollapsed,
    measuredHeight,
  ]);

  const collapseButton = collapsible ? (
    <button
      type="button"
      className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-transparent text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200"
      aria-label={effectiveCollapsed ? "Expand card" : "Collapse card"}
      onClick={() => setCollapsed(!effectiveCollapsed)}
    >
      <ChevronDown
        className="h-3.5 w-3.5 transition-transform duration-200 ease-out"
        strokeWidth={3}
        style={{
          transform: effectiveCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
        }}
        aria-hidden
      />
    </button>
  ) : null;
  const isCollapsedState = collapsible && effectiveCollapsed;
  const sectionClassName = twMerge(
    trnInteractiveCardShellClass(shell),
    trnInteractiveCardPaddingClass(shell, collapsible, isCollapsedState),
    className,
  );
  /** Collapsed: no gap under header; collapsible cards keep header height identical (no extra py). */
  const headerCombinedClassName = twMerge(
    collapsible ? "py-0" : undefined,
    isCollapsedState ? "mb-0!" : undefined,
    headerClassName,
  );

  return (
    <section className={sectionClassName}>
      <TRNCardHeader
        title={<InteractiveCardTitle title={title} hint={hint} />}
        leadingSlot={titleLeadingSlot}
        trailingSlot={
          <>
            {titleTrailingSlot != null ? titleTrailingSlot : null}
            {collapseButton}
          </>
        }
        className={headerCombinedClassName}
        titleClassName={headerTitleClassName}
      />
      {collapsible ? (
        <div
          className={twMerge(
            "min-h-0 overflow-hidden",
            !collapsibleMeasureIntrinsic && !effectiveCollapsed
              ? "flex min-h-0 flex-1 flex-col"
              : null,
            effectiveCollapsed ? "pointer-events-none" : null,
          )}
          style={contentStyle}
          aria-hidden={effectiveCollapsed ? true : undefined}
        >
          {/*
            Padding / border-top / gaps belong on the inner panel only.
            If they sit on this outer wrapper, `max-height: 0` still leaves padding + border
            visible (~one spacing rhythm tall) when collapsed.
          */}
          <div
            ref={contentRef}
            className={twMerge(
              collapsibleMeasureIntrinsic || effectiveCollapsed
                ? undefined
                : "flex h-full min-h-0 flex-1 flex-col",
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      ) : (
        <div className={contentClassName}>{children}</div>
      )}
    </section>
  );
}
