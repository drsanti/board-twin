import { useCallback, useEffect, useRef, useState } from "react";
import { Volume, Volume2, VolumeX } from "lucide-react";
import { ScopeModeControl, SignalScope, type ScopeMode } from "./SignalScope";

/**
 * Virtual speaker lane — header (test-beep button, name, state, freq)
 * above a live oscilloscope + spectrum strip tapped off the output chain
 * (osc → gain → analyser → destination), so the scope shows the real
 * signal including going flat while the AudioContext is suspended.
 *
 * Plays a tone while state `spk/<id>` holds a non-zero frequency
 * (sim writes `SET spk 0 <hz>`, 0 = off). Browsers/WebView2 suspend
 * AudioContext until a user gesture — the context is created eagerly,
 * resume() is retried, and clicking the tile plays a test beep.
 */
export function Speaker({ id, freq }: { id: number; freq: number }) {
  const [ctxState, setCtxState] = useState<AudioContextState>("suspended");
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [scopeMode, setScopeMode] = useState<ScopeMode>("both");
  const [muted, setMuted] = useState(false);
  const playing = freq > 0 && !muted;

  /* display hold: keep the last tone on the readout ~1.2 s after it ends
     so short beeps/ticks don't flicker playing↔ready / —↔N Hz.
     (audio still starts/stops instantly — this only gates the text) */
  const [dispFreq, setDispFreq] = useState(0);
  const dispTimer = useRef(0);
  useEffect(() => {
    if (freq > 0) {
      clearTimeout(dispTimer.current);
      setDispFreq(freq);
    } else {
      dispTimer.current = window.setTimeout(() => setDispFreq(0), 1200);
      return () => clearTimeout(dispTimer.current);
    }
  }, [freq]);
  const dispPlaying = dispFreq > 0 && !muted;

  const ensureCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0.25;
      const ana = ctx.createAnalyser();
      ana.fftSize = 2048;
      gain.connect(ana);
      ana.connect(ctx.destination);
      ctx.onstatechange = () => setCtxState(ctx.state);
      ctxRef.current = ctx;
      gainRef.current = gain;
      oscRef.current = null;
      setAnalyser(ana);
      setCtxState(ctx.state);
    }
    return ctxRef.current;
  }, []);

  // create eagerly on mount; keep retrying resume() while suspended
  // (in Tauri the autoplay flag lets it start on its own; browsers still
  // need the user-gesture listeners below)
  useEffect(() => {
    const ctx = ensureCtx();
    setCtxState(ctx.state);
    const retry = setInterval(() => {
      if (ctx.state !== "running") ctx.resume().catch(() => {});
      else setCtxState("running");
    }, 1500);
    const unlock = () => { ctx.resume().catch(() => {}); };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      clearInterval(retry);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureCtx]);

  // drive the oscillator from the broker state
  useEffect(() => {
    const ctx = ensureCtx();
    if (!playing) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current = null;
      }
      return;
    }
    ctx.resume().catch(() => {});
    if (!oscRef.current) {
      const osc = ctx.createOscillator();
      osc.type = "square"; // piezo-buzzer character
      osc.connect(gainRef.current!);
      osc.start();
      oscRef.current = osc;
    }
    oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.01);
  }, [freq, playing, ensureCtx]);

  // mute = silence the output tap (scope goes flat — honest "no output")
  useEffect(() => {
    const g = gainRef.current;
    if (g) g.gain.setTargetAtTime(muted ? 0 : 0.25, ctxRef.current!.currentTime, 0.02);
  }, [muted]);

  useEffect(() => () => { ctxRef.current?.close(); }, []);

  /** click toggles mute; unmuting also unlocks audio + confirms with a
   *  short test beep. The osc is scheduled only after resume() resolves —
   *  while suspended ctx.currentTime is frozen, so start/stop set up
   *  front can fire back-to-back and the beep is never heard. */
  const toggle = async () => {
    if (muted) {          // unmute → confirm with a beep
      setMuted(false);
      // restore gain synchronously — the state-driven effect may lag the beep
      gainRef.current?.gain.setTargetAtTime(0.25, ensureCtx().currentTime, 0.02);
      await testBeep();
    } else {
      setMuted(true);
    }
  };

  const testBeep = async () => {
    let ctx = ensureCtx();
    try { await ctx.resume(); } catch { /* fall through to recreate */ }
    if (ctx.state !== "running") {
      // still suspended even inside a gesture? recreate — a context
      // created during the click is treated as gesture-initiated
      ctxRef.current = null;
      oscRef.current = null;
      ctx = ensureCtx();
      try { await ctx.resume(); } catch { return; }
      if (ctx.state !== "running") return;
    }
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(g).connect(gainRef.current!); // through the tap → scope sees it
    osc.start(t);
    osc.stop(t + 0.5);
  };

  const stateText = muted ? "muted"
    : dispPlaying ? "playing"
    : ctxState === "running" ? "ready"
    : ctxState;

  return (
    <div className="w-full select-none">
      {/* parameter row: mute button · name · state pill · labeled params */}
      <div className="mb-1.5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => void toggle()}
          title={muted ? "click = unmute + test beep"
              : ctxState === "running" ? "click = mute" : "click = enable sound"}
          className={`relative grid h-7 w-7 place-items-center rounded-md border
                      border-bt-line transition-colors ${
            dispPlaying
              ? "bg-bt-accent/20 text-bt-accent-soft"
              : "bg-bt-panel-2/60 text-bt-faint hover:bg-bt-selected/60"
          }`}
        >
          {muted ? <VolumeX size={14} />
            : dispPlaying ? <Volume2 size={14} />
            : <Volume size={14} />}
          {ctxState !== "running" && !muted && (
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-bt-warn" />
          )}
        </button>
        <span className="font-silk text-[10px] text-bt-muted">SPK{id}</span>
        <span
          className={`font-silk flex w-[10ch] items-center justify-center gap-1
                      rounded px-1 py-0.5 text-[10px] ${
            dispPlaying ? "bg-bt-accent/15 text-bt-accent-soft"
            : muted ? "bg-bt-warning/10 text-bt-warn"
            : ctxState === "running" ? "bg-bt-panel-2/50 text-bt-faint"
            : "bg-bt-warning/10 text-bt-warn"
          }`}
        >
          <span
            className={`h-1 w-1 rounded-full ${
              dispPlaying ? "animate-pulse bg-bt-accent-soft"
              : muted ? "bg-bt-warn"
              : ctxState === "running" ? "bg-bt-ok"
              : "bg-bt-warn"
            }`}
          />
          {stateText}
        </span>
        <ScopeModeControl mode={scopeMode} onModeChange={setScopeMode} />
        <span className="font-silk ml-auto text-[9px] text-bt-faint">FREQ</span>
        <span
          className={`font-silk w-[8ch] text-right text-[10px] ${
            dispFreq > 0 ? "text-bt-live" : "text-bt-faint"
          }`}
        >
          {dispFreq > 0 ? `${dispFreq} Hz` : "0 Hz"}
        </span>
      </div>
      <SignalScope analyser={analyser} color="rgba(96,165,250,0.95)" mode={scopeMode} onModeChange={setScopeMode} />
    </div>
  );
}
