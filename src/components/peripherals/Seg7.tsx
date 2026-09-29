/*
 * Seg7 — a single 7-segment digit (SVG, no deps).
 * value: 0..9 shown, anything else = blank (BSP sends -1).
 */

/* which segments light per digit — a,b,c,d,e,f,g */
const DIGIT_SEGS: Record<number, string> = {
  0: "abcdef",
  1: "bc",
  2: "abged",
  3: "abgcd",
  4: "fgbc",
  5: "afgcd",
  6: "afgedc",
  7: "abc",
  8: "abcdefg",
  9: "abfgcd",
};

/* segment rects in a 48×84 viewBox — horizontal and vertical bars */
const SEGMENTS: Record<string, [number, number, number, number]> = {
  a: [8, 4, 32, 8],
  g: [8, 38, 32, 8],
  d: [8, 70, 32, 8],
  f: [4, 8, 8, 32],
  b: [36, 8, 8, 32],
  e: [4, 44, 8, 32],
  c: [36, 44, 8, 32],
};

const LIT = "#ff4438";
const UNLIT = "rgba(255,255,255,0.045)";

export interface Seg7Props {
  id: number;
  value: number;           // 0..9, else blank
  label?: string;
}

export function Seg7({ id, value, label }: Seg7Props) {
  const lit = DIGIT_SEGS[value] ?? "";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="rounded-md border border-bt-line/80 bg-[#0b0503]
                   px-1.5 py-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
      >
        <svg width="40" height="70" viewBox="0 0 48 84">
          {Object.entries(SEGMENTS).map(([seg, [x, y, w, h]]) => {
            const on = lit.includes(seg);
            return (
              <rect
                key={seg}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={3}
                fill={on ? LIT : UNLIT}
                style={
                  on
                    ? { filter: `drop-shadow(0 0 4px ${LIT})` }
                    : undefined
                }
              />
            );
          })}
        </svg>
      </div>
      <span className="bt-silk text-[9px]">{label ?? `SEG${id}`}</span>
    </div>
  );
}
