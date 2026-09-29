import { twMerge } from "tailwind-merge";

export type TRNToggleSwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  /** Visual size (track + thumb). Defaults to `md`. */
  size?: "sm" | "md" | "lg";
};

const TRACK_BASE_CLASS =
  "relative inline-block box-border shrink-0 overflow-hidden rounded-full border border-zinc-700/80 transition-colors disabled:opacity-50";

/** ON track — follows {@code --color-accent-blue} from theme / appearance prefs. */
const TRACK_ON_CLASS =
  "bg-[color-mix(in_srgb,var(--color-accent-blue)_20%,transparent)]";

const TRACK_OFF_CLASS = "bg-zinc-900/85";

const THUMB_BASE_CLASS =
  "absolute box-border top-1/2 left-0.5 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[transform,background-color,border-color] duration-150 ease-out -translate-y-1/2";

/** ON thumb — accent from {@code --color-accent-blue}. */
const THUMB_ON_CLASS =
  "border-[color-mix(in_srgb,var(--color-accent-blue)_55%,white)] bg-[color-mix(in_srgb,var(--color-accent-blue)_85%,transparent)]";

const THUMB_OFF_CLASS = "border-zinc-600/55 bg-zinc-500/85";

const SIZE_CLASSES: Record<
  NonNullable<TRNToggleSwitchProps["size"]>,
  { track: string; thumb: string; onTranslate: string; offTranslate: string }
> = {
  sm: {
    track: "h-3.5 w-7",
    thumb: "size-2.5",
    // Vertically centered via -translate-y-1/2; X slide keeps Y.
    onTranslate: "translate-x-[13px] -translate-y-1/2",
    offTranslate: "translate-x-0 -translate-y-1/2",
  },
  md: {
    // 16px track + 12px thumb → 2px inset top/bottom when centered.
    track: "h-4 w-8",
    thumb: "size-3",
    onTranslate: "translate-x-[14px] -translate-y-1/2",
    offTranslate: "translate-x-0 -translate-y-1/2",
  },
  lg: {
    track: "h-5 w-10",
    thumb: "size-4",
    onTranslate: "translate-x-5 -translate-y-1/2",
    offTranslate: "translate-x-0 -translate-y-1/2",
  },
};

export function TRNToggleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel,
  size = "md",
}: TRNToggleSwitchProps) {
  const s = SIZE_CLASSES[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }
        onCheckedChange(!checked);
      }}
      className={twMerge(
        TRACK_BASE_CLASS,
        s.track,
        checked ? TRACK_ON_CLASS : TRACK_OFF_CLASS,
      )}
    >
      <span
        className={twMerge(
          THUMB_BASE_CLASS,
          s.thumb,
          checked ? THUMB_ON_CLASS : THUMB_OFF_CLASS,
          checked ? s.onTranslate : s.offTranslate,
        )}
        aria-hidden
      />
    </button>
  );
}
