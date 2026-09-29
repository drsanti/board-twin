import { loadPersistedDockSizeMemory } from "./dock-size-persistence";
import { loadPersistedLayout } from "./layoutPersistence";
import type { LayoutNode } from "./types";
import type { WorkbenchDockSizeMemory } from "./workbench-dock-size-memory";
import {
  getNamedWorkbenchLayout,
  readWorkbenchStartupPreference,
  type WorkbenchLayoutPreset,
} from "./workbench-layout-library";

export function resolveInitialWorkbenchState(input: {
  initialLayout: LayoutNode;
  persistenceKey?: string;
  ignorePersistedLayout?: boolean;
  validateLayout?: (raw: unknown) => LayoutNode;
  layoutPresets: readonly WorkbenchLayoutPreset[];
}): { layout: LayoutNode; dockMemory: WorkbenchDockSizeMemory } {
  if (
    input.persistenceKey == null ||
    typeof window === "undefined" ||
    input.ignorePersistedLayout
  ) {
    return { layout: input.initialLayout, dockMemory: {} };
  }

  // Prefer last session layout on refresh (browser / Vite / VSIX). Startup preset/named
  // only applies when there is no session yet (cold start or after Reset layout).
  const saved = loadPersistedLayout(input.persistenceKey);
  if (saved != null) {
    return {
      layout: input.validateLayout ? input.validateLayout(saved) : saved,
      dockMemory: loadPersistedDockSizeMemory(input.persistenceKey),
    };
  }

  const startup = readWorkbenchStartupPreference(input.persistenceKey);
  if (startup.kind === "preset") {
    const preset = input.layoutPresets.find((row) => row.id === startup.presetId);
    if (preset) {
      return {
        layout: input.validateLayout
          ? input.validateLayout(preset.layout)
          : preset.layout,
        dockMemory: {},
      };
    }
  }
  if (startup.kind === "named") {
    const snapshot = getNamedWorkbenchLayout(input.persistenceKey, startup.layoutId);
    if (snapshot) {
      return {
        layout: input.validateLayout
          ? input.validateLayout(snapshot.layout)
          : snapshot.layout,
        dockMemory: structuredClone(snapshot.dockMemory ?? {}),
      };
    }
  }

  return { layout: input.initialLayout, dockMemory: {} };
}
