import { useCallback, useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { twMerge } from "tailwind-merge";
import {
  TRN_HIGHLIGHTED_JSON_DEFAULT_SYNTAX_THEME_ID,
  TRN_HIGHLIGHTED_JSON_PRISM_STYLES,
  type TRNHighlightedJsonSyntaxThemeId,
} from "./trnHighlightedJsonSyntaxThemes.js";

/** Matches `TRNHighlightedJsonBlock` / fenced-code monospace metrics. */
const TRN_CODE_FONT_FAMILY =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

export const TRN_CODE_FONT_SIZE_DEFAULT_PX = 11;
const TRN_CODE_FONT_SIZE_MIN_PX = 8;
const TRN_CODE_FONT_SIZE_MAX_PX = 24;
const TRN_CODE_CTRL_WHEEL_ZOOM_FACTOR = 1.12;

function clampTrnCodeFontSizePx(sizePx: number): number
{
  return Math.min(
    TRN_CODE_FONT_SIZE_MAX_PX,
    Math.max(TRN_CODE_FONT_SIZE_MIN_PX, sizePx),
  );
}

export type TRNHighlightedCodeBlockProps = {
  value: string;
  language?: string;
  className?: string;
  emptyPlaceholder?: string;
  syntaxThemeId?: TRNHighlightedJsonSyntaxThemeId;
  /** Heavier code weight for long export panes (Prism token spans included). */
  semibold?: boolean;
  /** Ctrl/⌘ + wheel adjusts monospace size (blocks browser page zoom over the block). */
  ctrlWheelZoom?: boolean;
};

/**
 * Read-only source with Prism highlighting — same stack as {@link TRNHighlightedJsonBlock}.
 */
export function TRNHighlightedCodeBlock({
  value,
  language = "c",
  className,
  emptyPlaceholder = " ",
  syntaxThemeId = TRN_HIGHLIGHTED_JSON_DEFAULT_SYNTAX_THEME_ID,
  semibold = false,
  ctrlWheelZoom = false,
}: TRNHighlightedCodeBlockProps)
{
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fontSizePx, setFontSizePx] = useState(TRN_CODE_FONT_SIZE_DEFAULT_PX);
  const source = value.length === 0 ? emptyPlaceholder : value;
  const prismStyle = TRN_HIGHLIGHTED_JSON_PRISM_STYLES[syntaxThemeId];
  const codeWeight = semibold ? 600 : undefined;
  const zoomPercent = Math.round((fontSizePx / TRN_CODE_FONT_SIZE_DEFAULT_PX) * 100);

  const onWheelZoom = useCallback((event: WheelEvent) =>
  {
    if (!event.ctrlKey && !event.metaKey)
    {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const factor =
      event.deltaY < 0
        ? TRN_CODE_CTRL_WHEEL_ZOOM_FACTOR
        : 1 / TRN_CODE_CTRL_WHEEL_ZOOM_FACTOR;
    setFontSizePx((prev) => clampTrnCodeFontSizePx(prev * factor));
  }, []);

  useEffect(() =>
  {
    if (!ctrlWheelZoom)
    {
      return undefined;
    }
    const element = scrollRef.current;
    if (element == null)
    {
      return undefined;
    }
    element.addEventListener("wheel", onWheelZoom, { passive: false });
    return () => element.removeEventListener("wheel", onWheelZoom);
  }, [ctrlWheelZoom, onWheelZoom]);

  return (
    <div
      ref={scrollRef}
      className={twMerge(
        "relative overflow-auto rounded border border-white/10 bg-black/40 px-2 py-1",
        semibold ? "[&_code]:!font-semibold [&_code_span]:!font-semibold" : "",
        className,
      )}
    >
      <SyntaxHighlighter
        language={language}
        style={prismStyle}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontWeight: codeWeight,
        }}
        codeTagProps={{
          style: {
            fontFamily: TRN_CODE_FONT_FAMILY,
            fontSize: `${fontSizePx}px`,
            lineHeight: "1.35",
            fontWeight: codeWeight,
            whiteSpace: "pre",
            overflowWrap: "normal",
          },
        }}
      >
        {source}
      </SyntaxHighlighter>
      {ctrlWheelZoom && zoomPercent !== 100 ? (
        <span className="pointer-events-none absolute bottom-1 right-2 rounded bg-zinc-950/80 px-1 py-0.5 text-[10px] font-medium text-zinc-500">
          {zoomPercent}%
        </span>
      ) : null}
    </div>
  );
}
