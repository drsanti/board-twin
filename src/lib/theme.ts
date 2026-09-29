/*
 * theme.ts — runtime overrides for --bt-* tokens (ByteFlow pattern).
 * Ctrl+Shift+F1 overlay edits these; diffs persist in localStorage.
 * `window.btTheme` console API: get / set(token, hex) / reset(token?).
 */

export const BT_THEME_STORAGE_KEY = "boardtwin:theme";

export interface ThemeToken {
  token: string;
  label: string;
  defaultHex: string;
  role: string;
}

export const THEME_GROUPS: Record<
  string,
  { title: string; rule: string; tokens: ThemeToken[] }
> = {
  surfaces: {
    title: "Surfaces",
    rule: "Near-black zinc — no mid charcoal.",
    tokens: [
      { token: "--bt-bg", label: "bg", defaultHex: "#121214", role: "App chrome" },
      { token: "--bt-panel", label: "panel", defaultHex: "#18181b", role: "Panels" },
      { token: "--bt-panel-2", label: "panel-2", defaultHex: "#202023", role: "Raised" },
      { token: "--bt-canvas", label: "canvas", defaultHex: "#0a0a0b", role: "Bench" },
      { token: "--bt-field", label: "field", defaultHex: "#141416", role: "Inputs" },
    ],
  },
  chrome: {
    title: "Chrome",
    rule: "Borders and interaction washes.",
    tokens: [
      { token: "--bt-line", label: "line", defaultHex: "#2d2d32", role: "1px borders" },
      { token: "--bt-hover", label: "hover", defaultHex: "#1f1f22", role: "Hover wash" },
      { token: "--bt-selected", label: "selected", defaultHex: "#27272a", role: "Selected" },
    ],
  },
  type: {
    title: "Type",
    rule: "Zinc text ladder.",
    tokens: [
      { token: "--bt-text", label: "text", defaultHex: "#f4f4f5", role: "Primary" },
      { token: "--bt-muted", label: "muted", defaultHex: "#a1a1aa", role: "Secondary" },
      { token: "--bt-faint", label: "faint", defaultHex: "#71717a", role: "Labels" },
    ],
  },
  accent: {
    title: "Accent",
    rule: "Sparse — CTA / live marker only.",
    tokens: [
      { token: "--bt-accent", label: "accent", defaultHex: "#3b82f6", role: "CTA / live" },
      { token: "--bt-accent-soft", label: "accent-soft", defaultHex: "#60a5fa", role: "Soft accent" },
      { token: "--bt-live", label: "live", defaultHex: "#7ab5ec", role: "Terminal / values" },
    ],
  },
  status: {
    title: "Status",
    rule: "True ok/warn/error only — desaturated.",
    tokens: [
      { token: "--bt-ok", label: "ok", defaultHex: "#86b576", role: "OK text" },
      { token: "--bt-warn", label: "warn", defaultHex: "#d4b06a", role: "Warn text" },
      { token: "--bt-err", label: "err", defaultHex: "#d98383", role: "Error text" },
      { token: "--bt-success", label: "success", defaultHex: "#5a8f4a", role: "OK fill" },
      { token: "--bt-warning", label: "warning", defaultHex: "#b8944a", role: "Warn fill" },
      { token: "--bt-danger", label: "danger", defaultHex: "#b85a5a", role: "Danger fill" },
    ],
  },
};

type Listener = (overrides: Record<string, string>) => void;
const listeners = new Set<Listener>();

function rootEl(): HTMLElement {
  return document.documentElement;
}

function readStored(): Record<string, string> {
  try {
    const raw = localStorage.getItem(BT_THEME_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* ignore */
  }
  return {};
}

function writeStored(overrides: Record<string, string>) {
  try {
    if (Object.keys(overrides).length === 0) {
      localStorage.removeItem(BT_THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(BT_THEME_STORAGE_KEY, JSON.stringify(overrides));
    }
  } catch {
    /* ignore */
  }
}

function notify(overrides: Record<string, string>) {
  for (const l of listeners) l(overrides);
}

/** Apply stored overrides on boot (call from main.tsx). */
export function initTheme() {
  for (const [token, value] of Object.entries(readStored())) {
    rootEl().style.setProperty(token, value);
  }
}

export function getThemeOverrides(): Record<string, string> {
  return { ...readStored() };
}

export function getThemeValue(token: string, fallbackHex: string): string {
  const o = readStored()[token];
  if (o) return o;
  if (typeof document !== "undefined") {
    const live = getComputedStyle(rootEl()).getPropertyValue(token).trim();
    if (live) return live;
  }
  return fallbackHex;
}

export function setThemeToken(token: string, hex: string) {
  const normalized = hex.trim();
  rootEl().style.setProperty(token, normalized);
  const next = readStored();
  const def = Object.values(THEME_GROUPS)
    .flatMap((g) => g.tokens)
    .find((t) => t.token === token)?.defaultHex;
  if (def && normalized.toLowerCase() === def.toLowerCase()) {
    delete next[token];
    rootEl().style.removeProperty(token);
  } else {
    next[token] = normalized;
  }
  writeStored(next);
  notify(next);
}

export function resetThemeToken(token: string) {
  rootEl().style.removeProperty(token);
  const next = readStored();
  delete next[token];
  writeStored(next);
  notify(next);
}

export function resetAllTheme() {
  for (const token of Object.keys(readStored())) {
    rootEl().style.removeProperty(token);
  }
  writeStored({});
  notify({});
}

export function subscribeTheme(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

declare global {
  interface Window {
    btTheme?: {
      get: () => Record<string, string>;
      set: (token: string, hex: string) => void;
      reset: (token?: string) => void;
    };
  }
}

export function exposeThemeApi() {
  if (typeof window === "undefined") return;
  window.btTheme = {
    get: () => getThemeOverrides(),
    set: (token, hex) => setThemeToken(token, hex),
    reset: (token) => (token ? resetThemeToken(token) : resetAllTheme()),
  };
}
