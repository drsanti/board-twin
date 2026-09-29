import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { TRNRangeSlider } from "@ternion/trn-ui";
import { board } from "../../lib/board";
import { ScopeModeControl, SignalScope, type ScopeMode } from "./SignalScope";

const SEND_HZ = 10;          // mic level publish rate
const SCALE = 1000;          // protocol range: 0..1000

/**
 * Virtual microphone lane — header (icon button, name, state, dBFS) above
 * a live oscilloscope + spectrum strip. Captures the PC mic via
 * getUserMedia and publishes a smoothed RMS level (0..1000) as
 * `set mic/<id>` so the simulator can BSP_Mic_Read() it. Falls back to a
 * manual slider when capture is unavailable or permission is denied.
 */
export function MicMeter({ id }: { id: number }) {
  const [mode, setMode] = useState<"off" | "live" | "manual">("off");
  const [scopeMode, setScopeMode] = useState<ScopeMode>("both");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const levelRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // publish loop — throttle to SEND_HZ, skip unchanged values
  useEffect(() => {
    if (mode === "off") return;
    let last = -1;
    const t = setInterval(() => {
      const v = Math.round(levelRef.current);
      if (v !== last) {
        last = v;
        board.set("mic", id, v);
      }
    }, 1000 / SEND_HZ);
    return () => clearInterval(t);
  }, [mode, id]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const ana = ctx.createAnalyser();
      ana.fftSize = 2048;
      src.connect(ana);
      setAnalyser(ana);
      streamRef.current = stream;
      ctxRef.current = ctx;

      const buf = new Uint8Array(ana.fftSize);
      let lastDisp = 0;
      const tick = () => {
        ana.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const x = (buf[i] - 128) / 128;
          sum += x * x;
        }
        const rms = Math.sqrt(sum / buf.length);
        const v = Math.min(SCALE, Math.round(rms * SCALE * 3)); // ×3 gain
        levelRef.current = levelRef.current * 0.7 + v * 0.3;    // smooth
        /* throttle the readout to ~6 Hz — digits strobing at 60 fps
           are unreadable */
        const now = performance.now();
        if (now - lastDisp > 160) {
          lastDisp = now;
          setLevel(Math.round(levelRef.current));
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setError(null);
      setMode("live");
    } catch (e) {
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      console.warn("[mic] getUserMedia failed:", msg);
      setError(msg);
      setMode("manual"); // denied / unsupported → slider
    }
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
    streamRef.current = null;
    ctxRef.current = null;
    setAnalyser(null);
    levelRef.current = 0;
    setLevel(0);
    setMode("off");
    board.set("mic", id, 0);
  };

  useEffect(() => () => {   // unmount cleanup
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
  }, []);

  const db = mode === "off" ? "-inf"
    : level > 0 ? `${Math.max(-60, Math.round(20 * Math.log10(level / SCALE)))} dB`
    : "-60 dB";

  return (
    <div className="w-full select-none">
      {/* parameter row: toggle · name · state pill · labeled readouts */}
      <div className="mb-1.5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={mode === "live" ? stop : start}
          title={mode === "manual" ? `mic unavailable — ${error ?? "slider mode"} (click to retry)` : "click to toggle mic"}
          className={`grid h-7 w-7 place-items-center rounded-md border
                      border-bt-line transition-colors ${
            mode === "live"
              ? "bg-bt-danger/20 text-bt-err"
              : "bg-bt-panel-2/60 text-bt-faint hover:bg-bt-selected/60"
          }`}
        >
          {mode === "live" ? <Mic size={14} /> : <MicOff size={14} />}
        </button>
        <span className="font-silk text-[10px] text-bt-muted">MIC{id}</span>
        <span
          className={`font-silk flex w-[8ch] items-center justify-center gap-1
                      rounded px-1 py-0.5 text-[10px] ${
            mode === "live" ? "bg-bt-danger/15 text-bt-err"
            : mode === "manual" ? "bg-bt-warning/10 text-bt-warn"
            : "bg-bt-panel-2/50 text-bt-faint"
          }`}
        >
          <span
            className={`h-1 w-1 rounded-full ${
              mode === "live" ? "animate-pulse bg-bt-err"
              : mode === "manual" ? "bg-bt-warn"
              : "bg-bt-line"
            }`}
          />
          {mode}
        </span>
        <ScopeModeControl mode={scopeMode} onModeChange={setScopeMode} />
        {mode === "manual" && (
          <TRNRangeSlider
            min={0} max={SCALE} value={level}
            onChange={(e) => {
              const v = Number(e.target.value);
              setLevel(v);
              levelRef.current = v;
            }}
            className="w-24"
          />
        )}
        <span className="font-silk ml-auto text-[9px] text-bt-faint">IN</span>
        <span className="font-silk w-[7ch] text-right text-[10px] text-bt-text">
          {db}
        </span>
        {/* mini VU — segmented level bar, green→amber→red */}
        <span className="flex h-2 items-end gap-px">
          {Array.from({ length: 10 }, (_, i) => {
            const on = level / SCALE > (i + 1) / 11;
            return (
              <span
                key={i}
                className={`w-1 rounded-[1px] transition-colors duration-100 ${
                  on
                    ? i < 6 ? "bg-bt-ok" : i < 8 ? "bg-bt-warn" : "bg-bt-err"
                    : "bg-bt-line/60"
                }`}
                style={{ height: `${40 + i * 6}%` }}
              />
            );
          })}
        </span>
      </div>
      <SignalScope analyser={analyser} color="rgba(251,113,133,0.95)" mode={scopeMode} onModeChange={setScopeMode} />
    </div>
  );
}
