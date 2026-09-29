import { Loader2 } from "lucide-react";

export function WorkbenchPaneLoadingFallback(props: { label: string }) {
  const { label } = props;
  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-2 bg-bg-panel px-4 py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-violet-400/85" aria-hidden />
      <span className="text-center text-[11px] leading-snug text-zinc-500">{label}</span>
    </div>
  );
}
