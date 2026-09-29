import { useEffect, useRef } from "react";
import { TRNSegmentedControl } from "@ternion/trn-ui";

const H = 144;
const SPEC_FRac = 0.38;  // bottom fraction used by the spectrum strip
const BINS = 48;         // spectrum bars drawn

export type ScopeMode = "time" | "freq" | "both";
type Mode = ScopeMode;
const NEXT: Record<Mode, Mode> = { time: "freq", freq: "both", both: "time" };
const MODE_LABEL: Record<Mode, string> = {
  time: "TIME", freq: "FREQ", both: "T+F",
};

/**
 * Mini oscilloscope + spectrum strip driven by a Web Audio AnalyserNode.
 * Click cycles the view: time domain → frequency domain → both → time.
 * `analyser === null` draws a flat baseline (no signal / no device).
 * Canvas stretches to its container's width.
 */
export function SignalScope({
  analyser,
  color,
  mode,
  onModeChange,
}: {
  analyser: AnalyserNode | null;
  color: string;
  mode: Mode;
  onModeChange: (m: Mode) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const modeRef = useRef<Mode>(mode);
  analyserRef.current = analyser;
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const g = canvas.getContext("2d")!;
    const timeBuf = new Float32Array(2048);
    const freqBuf = new Uint8Array(2048);
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const ana = analyserRef.current;
      const m = modeRef.current;

      /* keep backing store in sync with CSS size */
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(80, canvas.clientWidth);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== H * dpr) {
        canvas.width = Math.round(w * dpr);
        canvas.height = H * dpr;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const waveH = m === "both" ? Math.round(H * (1 - SPEC_FRac)) : H - 16;
      const specTop = waveH + 8;
      const axisY = H - 12;          // freq-axis baseline (labels sit below)
      const plotBottom = m === "time" ? H - 4 : axisY;

      g.clearRect(0, 0, w, H);
      g.font = "8px monospace";

      /* ---- graticule ------------------------------------------------ */
      if (m !== "freq") {
        /* y-axis: +FS / 0 / -FS ticks at the left edge */
        g.strokeStyle = "rgba(148,163,184,0.18)";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(0, waveH / 2); g.lineTo(w, waveH / 2);
        for (const y of [2, waveH / 4, waveH / 2, (waveH * 3) / 4, waveH - 2]) {
          g.moveTo(0, y); g.lineTo(4, y);
        }
        g.stroke();
        /* x-axis: vertical divisions across the waveform area */
        g.strokeStyle = "rgba(148,163,184,0.07)";
        g.beginPath();
        for (let x = w / 8; x < w; x += w / 8) {
          g.moveTo(x, 0); g.lineTo(x, waveH);
          g.moveTo(x - 2, waveH); g.lineTo(x + 2, waveH);
        }
        g.stroke();
        /* amplitude labels */
        g.fillStyle = "rgba(148,163,184,0.45)";
        g.fillText("+1", w - 14, 8);
        g.fillText("0", w - 8, waveH / 2 + 3);
        g.fillText("-1", w - 14, waveH - 2);
      }

      /* ---- signal ---------------------------------------------------- */
      if (!ana) {
        /* flat baseline — signal chain dead */
        if (m !== "freq") {
          g.strokeStyle = "rgba(100,116,139,0.45)";
          g.beginPath();
          g.moveTo(0, waveH / 2); g.lineTo(w, waveH / 2);
          g.stroke();
        }
      } else {
        /* time domain */
        if (m !== "freq") {
          const n = Math.min(ana.fftSize, timeBuf.length);
          ana.getFloatTimeDomainData(timeBuf);
          g.strokeStyle = color;
          g.lineWidth = 1.4;
          g.beginPath();
          for (let i = 0; i < w; i++) {
            const s = timeBuf[Math.floor((i / w) * n)];
            const y = waveH / 2 - s * (waveH / 2 - 3);
            if (i === 0) g.moveTo(0, y); else g.lineTo(i, y);
          }
          g.stroke();
        }

        /* frequency domain — skip bin 0 (DC), map to BINS bars */
        if (m !== "time") {
          const top = m === "freq" ? 4 : specTop;
          ana.getByteFrequencyData(freqBuf);
          const usable = ana.frequencyBinCount;
          const bw = w / BINS;
          for (let i = 0; i < BINS; i++) {
            const bin = 1 + Math.floor((i / BINS) * (usable - 1));
            const mag = freqBuf[bin] / 255;
            const bh = Math.max(1, mag * (plotBottom - top));
            g.fillStyle = color;
            g.globalAlpha = mag > 0.02 ? 0.85 : 0.12;
            g.fillRect(i * bw + 0.5, plotBottom - bh, Math.max(1, bw - 1), bh);
          }
          g.globalAlpha = 1;
        }
      }

      /* ---- frequency axis (ticks + Hz labels) ------------------------ */
      if (m !== "time") {
        g.strokeStyle = "rgba(148,163,184,0.18)";
        g.beginPath();
        g.moveTo(0, axisY); g.lineTo(w, axisY);
        for (let i = 0; i <= 4; i++) {
          const x = (w * i) / 4;
          g.moveTo(x, axisY); g.lineTo(x, axisY + 3);
        }
        g.stroke();
        const nyq = ana ? ana.context.sampleRate / 2 : 24000;
        g.fillStyle = "rgba(148,163,184,0.45)";
        const k = (f: number) => (f >= 1000 ? `${Math.round(f / 1000)}k` : `${Math.round(f)}`);
        g.fillText("0", 2, axisY + 10);
        g.fillText(k(nyq / 2), w / 2 - 8, axisY + 10);
        g.fillText(`${k(nyq)} Hz`, w - 32, axisY + 10);
      }

      /* mode tag */
      g.fillStyle = "rgba(148,163,184,0.55)";
      g.fillText(MODE_LABEL[m], 6, 10);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [color]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ height: H }}
        title="click: cycle time / freq / both"
        onClick={() => onModeChange(NEXT[modeRef.current])}
        className="w-full cursor-pointer rounded-md border border-bt-line
                   bg-bt-canvas/60 hover:border-bt-faint/50"
      />
    </div>
  );
}

/** T / F / T+F picker — render in the instrument header row. */
export function ScopeModeControl({
  mode,
  onModeChange,
}: {
  mode: ScopeMode;
  onModeChange: (m: ScopeMode) => void;
}) {
  return (
    <TRNSegmentedControl
      size="sm"
      tone="accent"
      ariaLabel="scope view"
      value={mode}
      onValueChange={(v) => v && onModeChange(v as ScopeMode)}
      options={[
        { value: "time", label: "T" },
        { value: "freq", label: "F" },
        { value: "both", label: "T+F" },
      ]}
    />
  );
}
