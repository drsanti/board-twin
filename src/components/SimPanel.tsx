import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { board, type SimStats } from "../lib/board";
import { TRNIconButton, TRNSegmentedControl } from "@ternion/trn-ui";
import { McuChip } from "./peripherals/McuChip";

function fmtUptime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const STATE_DOT: Record<string, string> = {
  running: "bg-bt-ok",
  ready: "bg-bt-accent-soft",
  blocked: "bg-bt-warn",
  suspended: "bg-bt-err",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="bt-silk text-[8px]">{label}</span>
      <span className="font-silk text-[13px] text-bt-text">{value}</span>
    </div>
  );
}

export interface SimPanelProps {
  connected: boolean;
  powered: boolean;
  stats: SimStats | null;
}

/** Simulator card — chip + stat strip (INFO) or live task table (TASKS). */
export function SimPanel({ connected, powered, stats }: SimPanelProps) {
  const [view, setView] = useState<string | null>("info");
  const heapPct =
    stats && stats.heapTotal > 0
      ? Math.round((stats.heapFree / stats.heapTotal) * 100)
      : null;

  return (
    <div className="flex flex-col gap-3">
      {/* view switch + reset */}
      <div className="flex items-center justify-between">
        <TRNSegmentedControl
          value={view}
          onValueChange={(v) => v && setView(v)}
          ariaLabel="simulator view"
          size="sm"
          tone="accent"
          options={[
            { value: "info", label: "INFO" },
            { value: "tasks", label: "TASKS" },
          ]}
        />
        <TRNIconButton
          variant="ghost"
          icon={<RotateCcw size={15} />}
          label="Reset board"
          hintTitle="Reset board"
          hintDescription="Clears all device state (RST)"
          nativeTitle={false}
          disabled={!connected}
          onClick={() => board.reset()}
        />
      </div>

      {view === "info" ? (
        /* ---- A: chip + stat strip ---- */
        <div className="flex items-center gap-5">
          <McuChip connected={connected} running={powered} />
          {stats ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <Stat label="uptime" value={fmtUptime(stats.up)} />
              <Stat label="tick" value={`${stats.tick} Hz`} />
              <Stat label="tasks" value={String(stats.tasks.length)} />
              <Stat label="heap free" value={heapPct != null ? `${heapPct}%` : "-"} />
            </div>
          ) : (
            <span className="bt-silk text-[9px] text-bt-faint">
              no telemetry — call BSP_SendStats()
            </span>
          )}
        </div>
      ) : (
        /* ---- B: live task table ---- */
        stats ? (
          <div className="bt-scroll max-h-[136px] overflow-y-auto">
            <table className="w-full font-silk text-[10px]">
              <thead>
                <tr className="bt-silk text-left text-[8px] text-bt-faint">
                  <th className="pb-1 font-normal">task</th>
                  <th className="pb-1 font-normal">state</th>
                  <th className="pb-1 text-right font-normal">prio</th>
                  <th className="pb-1 text-right font-normal">stack free</th>
                </tr>
              </thead>
              <tbody>
                {stats.tasks.map((t) => (
                  <tr key={t.n} className="border-t border-white/5">
                    <td className="py-0.5 text-bt-text">{t.n}</td>
                    <td className="py-0.5">
                      <span className="flex items-center gap-1.5 text-bt-muted">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATE_DOT[t.s] ?? "bg-bt-faint"}`}
                        />
                        {t.s}
                      </span>
                    </td>
                    <td className="py-0.5 text-right text-bt-muted">{t.p}</td>
                    <td className="py-0.5 text-right text-bt-live">
                      {t.hwm} B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <span className="bt-silk py-6 text-center text-[9px] text-bt-faint">
            no telemetry — call BSP_SendStats()
          </span>
        )
      )}
    </div>
  );
}
