import { useEffect, useRef } from "react";
import { PanelRightOpen, ScrollText, X } from "lucide-react";
import { TRNIconButton } from "@ternion/trn-ui";

interface EventLogPanelProps {
  lines: string[];
  open: boolean;
  onToggle: () => void;
}

function lineClass(l: string): string {
  if (l.startsWith("uart>")) return "text-bt-ok";
  if (l.startsWith("evt")) return "text-bt-warn";
  if (l.startsWith("set")) return "text-bt-live";
  if (l.includes("reset") || l.startsWith("connected") || l.startsWith("board"))
    return "text-bt-text";
  return "text-bt-muted";
}

/** Collapsible side console for broker traffic. */
export function EventLogPanel({ lines, open, onToggle }: EventLogPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight);
  }, [lines, open]);

  /* collapsed rail */
  if (!open) {
    return (
      <aside className="flex w-11 flex-col items-center gap-3 border-l border-white/5 bg-bt-canvas py-3">
        <TRNIconButton
          variant="ghost"
          icon={<PanelRightOpen size={15} />}
          label="Show event log"
          hint="Show event log"
          nativeTitle={false}
          onClick={onToggle}
        />
        <span className="bt-silk text-[9px] text-bt-faint [writing-mode:vertical-rl]">
          event log
        </span>
        <span className="font-silk text-[9px] text-bt-faint">{lines.length}</span>
      </aside>
    );
  }

  return (
    <aside className="flex w-[330px] shrink-0 flex-col border-l border-white/5 bg-bt-canvas">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5">
        <ScrollText size={13} className="text-bt-faint" />
        <span className="bt-silk text-[9px] text-bt-muted">event log</span>
        <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-px font-silk text-[9px] text-bt-faint">
          {lines.length}
        </span>
        <div className="flex-1" />
        <TRNIconButton
          variant="ghost"
          icon={<X size={13} />}
          label="Collapse panel"
          hint="Collapse panel"
          nativeTitle={false}
          onClick={onToggle}
        />
      </div>

      {/* stream */}
      <div
        ref={ref}
        className="bt-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2 font-silk text-[11px] leading-[1.7]"
      >
        {lines.length === 0 ? (
          <div className="grid h-full place-items-center">
            <span className="bt-silk text-[9px] text-bt-faint">no traffic yet</span>
          </div>
        ) : (
          lines.map((l, i) => (
            <div key={i} className={`whitespace-pre-wrap break-all ${lineClass(l)}`}>
              <span className="mr-2 select-none text-bt-faint/60">
                {String(i + 1).padStart(3, "0")}
              </span>
              {l}
            </div>
          ))
        )}
      </div>

      {/* footer strip */}
      <div className="border-t border-white/5 px-3 py-1.5">
        <span className="bt-silk text-[8px] text-bt-faint">
          ws://{location.hostname}:7392 · tail 300
        </span>
      </div>
    </aside>
  );
}
