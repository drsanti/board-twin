export type TRNScrubFieldBadgeTone =
  | "violet"
  | "amber"
  | "rose"
  | "emerald"
  | "sky"
  | "neutral"
  | "custom";

export const TRN_SCRUB_FIELD_BADGE_TONE_CLASS: Record<
  Exclude<TRNScrubFieldBadgeTone, "custom">,
  string
> = {
  violet: "bg-violet-500/15 text-violet-300/95",
  amber: "bg-amber-500/15 text-amber-300/95",
  rose: "bg-rose-500/15 text-rose-300/95",
  emerald: "bg-emerald-500/15 text-emerald-300/95",
  sky: "bg-sky-500/15 text-sky-300/95",
  neutral: "bg-zinc-500/15 text-zinc-300/95",
};
