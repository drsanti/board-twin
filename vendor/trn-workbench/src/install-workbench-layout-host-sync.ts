import { getIsVsCodeExtensionWebview } from "./vscode.js";
import { loadPersistedDockSizeMemory, savePersistedDockSizeMemory } from "./dock-size-persistence";
import { loadPersistedLayout, savePersistedLayout } from "./layoutPersistence";
import type { LayoutNode } from "./types";
import type { WorkbenchDockSizeMemory } from "./workbench-dock-size-memory";
import {
  hasStoredWorkbenchStartupPreference,
  readWorkbenchLayoutLibrary,
  readWorkbenchStartupPreference,
  writeWorkbenchLayoutLibrary,
  writeWorkbenchStartupPreference,
  type WorkbenchLayoutAppId,
  type WorkbenchLayoutLibraryV1,
  type WorkbenchStartupPreference,
} from "./workbench-layout-library";
import { registerWorkbenchHostMirrorPush } from "./workbench-host-mirror-notify";
import { signalWorkbenchHostPullComplete } from "./workbench-host-pull-gate";

export const WORKBENCH_HOST_MIRROR_VERSION = 1 as const;

const MSG_PULL = "workbench-layout-host-pull" as const;
const MSG_PUSH = "workbench-layout-host-push" as const;
const MSG_RESP = "workbench-layout-host-response" as const;

export type WorkbenchHostMirrorV1 = {
  version: typeof WORKBENCH_HOST_MIRROR_VERSION;
  appId: WorkbenchLayoutAppId;
  updatedAt: string;
  library?: WorkbenchLayoutLibraryV1;
  startup?: WorkbenchStartupPreference;
  sessionLayout?: LayoutNode;
  sessionDock?: WorkbenchDockSizeMemory;
};

type HostResponseMsg = {
  type: typeof MSG_RESP;
  appId?: string;
  configJson?: string | null;
  error?: string;
};

export function serializeWorkbenchHostMirror(appId: WorkbenchLayoutAppId): string {
  const payload: WorkbenchHostMirrorV1 = {
    version: WORKBENCH_HOST_MIRROR_VERSION,
    appId,
    updatedAt: new Date().toISOString(),
    library: readWorkbenchLayoutLibrary(appId),
    startup: readWorkbenchStartupPreference(appId),
    sessionLayout: loadPersistedLayout(appId) ?? undefined,
    sessionDock: loadPersistedDockSizeMemory(appId),
  };
  return JSON.stringify(payload);
}

function isHostMirror(value: unknown): value is WorkbenchHostMirrorV1 {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as WorkbenchHostMirrorV1;
  return row.version === WORKBENCH_HOST_MIRROR_VERSION && typeof row.appId === "string";
}

function localLibraryEmpty(appId: WorkbenchLayoutAppId): boolean {
  return readWorkbenchLayoutLibrary(appId).layouts.length === 0;
}

/** Restore durable host mirror into wiped webview localStorage (quiet — no push loop). */
function applyHostMirror(mirror: WorkbenchHostMirrorV1): void {
  const quiet = { mirror: false } as const;
  if (mirror.library && localLibraryEmpty(mirror.appId)) {
    writeWorkbenchLayoutLibrary(mirror.library, quiet);
  }
  if (mirror.startup && !hasStoredWorkbenchStartupPreference(mirror.appId)) {
    writeWorkbenchStartupPreference(mirror.appId, mirror.startup, quiet);
  }
  if (mirror.sessionLayout && loadPersistedLayout(mirror.appId) == null) {
    savePersistedLayout(mirror.appId, mirror.sessionLayout, quiet);
    if (mirror.sessionDock) {
      savePersistedDockSizeMemory(mirror.appId, mirror.sessionDock, quiet);
    }
  }
}

export function installWorkbenchLayoutHostSync(appId: WorkbenchLayoutAppId): () => void {
  if (!getIsVsCodeExtensionWebview()) {
    signalWorkbenchHostPullComplete(appId);
    return () => {};
  }

  const w = window as Window & { __VSCODE_API__?: { postMessage: (m: unknown) => void } };
  const vscode = w.__VSCODE_API__;
  if (!vscode?.postMessage) {
    signalWorkbenchHostPullComplete(appId);
    return () => {};
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastPushed = "";

  const flushPush = (): void => {
    const next = serializeWorkbenchHostMirror(appId);
    if (next === lastPushed) {
      return;
    }
    lastPushed = next;
    vscode.postMessage({ type: MSG_PUSH, appId, configJson: next });
  };

  const schedulePush = (): void => {
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      flushPush();
    }, 480);
  };

  const onMessage = (event: MessageEvent): void => {
    const data = event.data as HostResponseMsg | undefined;
    if (!data || data.type !== MSG_RESP || data.appId !== appId) {
      return;
    }
    try {
      if (typeof data.error === "string" && data.error.length > 0) {
        return;
      }
      if (typeof data.configJson === "string" && data.configJson.trim().length > 0) {
        const parsed = JSON.parse(data.configJson) as unknown;
        if (isHostMirror(parsed) && parsed.appId === appId) {
          applyHostMirror(parsed);
        }
      }
    } catch {
      // ignore invalid host mirror
    } finally {
      lastPushed = serializeWorkbenchHostMirror(appId);
      signalWorkbenchHostPullComplete(appId);
    }
  };

  window.addEventListener("message", onMessage);
  vscode.postMessage({ type: MSG_PULL, appId });
  const unregisterPush = registerWorkbenchHostMirrorPush(appId, schedulePush);

  return () => {
    unregisterPush();
    window.removeEventListener("message", onMessage);
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
    }
  };
}
