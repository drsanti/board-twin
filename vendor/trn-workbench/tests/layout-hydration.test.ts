import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createEditorPane, createSplit } from "../src/layoutBuilders";
import { savePersistedLayout } from "../src/layoutPersistence";
import { resolveInitialWorkbenchState } from "../src/workbench-initial-state";
import { writeWorkbenchStartupPreference } from "../src/workbench-layout-library";

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function installMockLocalStorage(): StorageLike {
  const store = new Map<string, string>();
  const mock: StorageLike = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
  (globalThis as { localStorage?: StorageLike; window?: { localStorage?: StorageLike } }).localStorage =
    mock;
  (globalThis as { window?: { localStorage?: StorageLike } }).window = { localStorage: mock };
  return mock;
}

describe("resolveInitialWorkbenchState", () => {
  it("returns initialLayout when window is unavailable (SSR)", () => {
    const initialLayout = createSplit(
      createEditorPane("graph", { id: "graph" }),
      createEditorPane("inspector", { id: "inspector" }),
      "horizontal",
      0.62,
      "root",
    );
    const persisted = createSplit(
      createEditorPane("graph", { id: "graph" }),
      createEditorPane("inspector", { id: "inspector" }),
      "horizontal",
      0.75,
      "root",
    );

    const priorWindow = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = undefined;

    try {
      const result = resolveInitialWorkbenchState({
        initialLayout,
        persistenceKey: "test-app",
        layoutPresets: [],
      });
      assert.equal(result.layout, initialLayout);
      assert.deepEqual(result.dockMemory, {});
    } finally {
      (globalThis as { window?: unknown }).window = priorWindow;
    }

    installMockLocalStorage();
    savePersistedLayout("test-app", persisted);
    const client = resolveInitialWorkbenchState({
      initialLayout,
      persistenceKey: "test-app",
      layoutPresets: [],
    });
    assert.equal(client.layout.ratio, 0.75);
  });

  it("prefers session layout over startup preset", () => {
    installMockLocalStorage();
    const initialLayout = createSplit(
      createEditorPane("graph", { id: "graph" }),
      createEditorPane("inspector", { id: "inspector" }),
      "horizontal",
      0.5,
      "root",
    );
    const session = createSplit(
      createEditorPane("graph", { id: "graph" }),
      createEditorPane("inspector", { id: "inspector" }),
      "horizontal",
      0.88,
      "root",
    );
    const presetLayout = createSplit(
      createEditorPane("graph", { id: "graph" }),
      createEditorPane("inspector", { id: "inspector" }),
      "horizontal",
      0.33,
      "root",
    );
    savePersistedLayout("sensor-studio", session);
    writeWorkbenchStartupPreference("sensor-studio", {
      kind: "preset",
      presetId: "desk",
    });
    const result = resolveInitialWorkbenchState({
      initialLayout,
      persistenceKey: "sensor-studio",
      layoutPresets: [
        {
          id: "desk",
          label: "Desk",
          description: "test",
          layout: presetLayout,
        },
      ],
    });
    assert.equal(result.layout.ratio, 0.88);
  });

  it("uses startup preset when session layout is missing", () => {
    installMockLocalStorage();
    const initialLayout = createSplit(
      createEditorPane("graph", { id: "graph" }),
      createEditorPane("inspector", { id: "inspector" }),
      "horizontal",
      0.5,
      "root",
    );
    const presetLayout = createSplit(
      createEditorPane("graph", { id: "graph" }),
      createEditorPane("inspector", { id: "inspector" }),
      "horizontal",
      0.33,
      "root",
    );
    writeWorkbenchStartupPreference("sensor-studio", {
      kind: "preset",
      presetId: "desk",
    });
    const result = resolveInitialWorkbenchState({
      initialLayout,
      persistenceKey: "sensor-studio",
      layoutPresets: [
        {
          id: "desk",
          label: "Desk",
          description: "test",
          layout: presetLayout,
        },
      ],
    });
    assert.equal(result.layout.ratio, 0.33);
  });
});
