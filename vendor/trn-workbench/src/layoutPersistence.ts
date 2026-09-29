import type { LayoutNode } from "./types";
import { notifyWorkbenchHostMirrorDirty } from "./workbench-host-mirror-notify";

const STORAGE_PREFIX = "trn_workbench_";
const LEGACY_STORAGE_PREFIX = "ternion_workbench_";

export type PersistLayoutOptions = {
  /** When false, skip host-mirror dirty notify (host pull apply). Default true. */
  mirror?: boolean;
};

export function workbenchPersistenceKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function legacyWorkbenchPersistenceKey(key: string): string {
  return `${LEGACY_STORAGE_PREFIX}${key}`;
}

export function loadPersistedLayout(key: string): LayoutNode | null {
  const keys = [workbenchPersistenceKey(key), legacyWorkbenchPersistenceKey(key)];
  for (const storageKey of keys) {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        continue;
      }
      return JSON.parse(saved) as LayoutNode;
    } catch {
      // try next key
    }
  }
  return null;
}

export function savePersistedLayout(
  key: string,
  layout: LayoutNode,
  options?: PersistLayoutOptions,
): void {
  try {
    localStorage.setItem(workbenchPersistenceKey(key), JSON.stringify(layout));
    if (options?.mirror !== false) {
      notifyWorkbenchHostMirrorDirty(key);
    }
  } catch {
    // Quota / private mode — keep in-memory layout; next refresh falls back to default.
  }
}

export function clearPersistedLayout(key: string): void {
  try {
    localStorage.removeItem(workbenchPersistenceKey(key));
    localStorage.removeItem(legacyWorkbenchPersistenceKey(key));
  } catch {
    // ignore
  }
}
