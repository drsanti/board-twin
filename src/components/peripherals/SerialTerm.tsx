import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";
import { board, type SerialLine } from "../../lib/board";
import { TRNButton, TRNInput } from "@ternion/trn-ui";

const MAX_SHOW = 80;

/**
 * UART terminal — scrolling transcript of `UART` frames from the sim
 * (rx, green) plus lines the user typed (tx, cyan `»` prefix). Enter or
 * the send button publishes the line to the sim via the broker.
 */
export function SerialTerm({ lines }: { lines: SerialLine[] }) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const shown = lines.slice(-MAX_SHOW);

  /* auto-scroll to the newest line */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    board.uart(text);
    setDraft("");
  };

  return (
    <div className="flex w-full select-none flex-col gap-1.5">
      {/* transcript */}
      <div
        ref={scrollRef}
        className="bt-scroll h-32 w-full overflow-y-auto rounded-md border border-bt-line
                   bg-bt-canvas/80 px-2 py-1.5 font-silk text-[10px] leading-4"
      >
        {shown.length === 0 ? (
          <span className="text-bt-faint">— no uart output yet —</span>
        ) : (
          shown.map((l, i) =>
            l.dir === "rx" ? (
              <div key={i} className="whitespace-pre-wrap text-bt-ok">
                {l.text}
              </div>
            ) : (
              <div key={i} className="whitespace-pre-wrap text-bt-live">
                » {l.text}
              </div>
            ),
          )
        )}
      </div>

      {/* input row */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-1.5"
      >
        <Terminal size={12} className="shrink-0 text-bt-faint" />
        <TRNInput
          size="sm"
          variant="field"
          showPrefixIcon={false}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="type a line → sim (BSP_UART_ReadLine)"
          className="min-w-0 flex-1"
          inputClassName="font-silk text-[10px]"
        />
        <TRNButton
          size="compact"
          type="submit"
          className="border-white/15! bg-white/[0.06]! px-3
                     font-silk text-[10px] tracking-widest text-bt-accent-soft!
                     hover:border-bt-accent/40! hover:bg-bt-accent/15! hover:text-bt-accent-soft!"
        >
          send
        </TRNButton>
      </form>
    </div>
  );
}
