import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEditorPane, createSplit, createTabs } from "../src/layoutBuilders.js";
import { collectKeepAliveEditorPanes } from "../src/WorkbenchEditorKeepAlive.js";
import { closeNode, collapseEditorPane } from "../src/utils.js";

describe("workbench editor keep-alive collection", () => {
  it("keeps both leaves across a split (ids stable after close promote)", () => {
    const scene = createEditorPane("scene", { id: "pane-scene" });
    const inspector = createEditorPane("inspector", { id: "pane-inspector" });
    const layout = createSplit(scene, inspector, "horizontal", 0.7);
    const before = collectKeepAliveEditorPanes(layout).map((p) => p.id).sort();
    assert.deepEqual(before, ["pane-inspector", "pane-scene"]);

    const afterClose = closeNode(layout, "pane-inspector");
    const after = collectKeepAliveEditorPanes(afterClose).map((p) => p.id);
    assert.deepEqual(after, ["pane-scene"]);
  });

  it("includes collapsed editors (VP-5 park, do not drop from keep-alive set)", () => {
    const scene = createEditorPane("scene", { id: "pane-scene" });
    const hierarchy = createEditorPane("hierarchy", { id: "pane-hierarchy" });
    const layout = createSplit(scene, hierarchy, "horizontal", 0.7);
    const collapsed = collapseEditorPane(layout, "pane-scene");
    const ids = collectKeepAliveEditorPanes(collapsed).map((p) => p.id).sort();
    assert.deepEqual(ids, ["pane-hierarchy", "pane-scene"]);
  });

  it("keeps only the active tab in a tabs group", () => {
    const a = createEditorPane("flow", { id: "tab-a" });
    const b = createEditorPane("inspector", { id: "tab-b" });
    const tabs = createTabs([a, b], 0);
    assert.deepEqual(
      collectKeepAliveEditorPanes(tabs).map((p) => p.id),
      ["tab-a"],
    );
    const tabs1 = { ...tabs, activeIndex: 1 };
    assert.deepEqual(
      collectKeepAliveEditorPanes(tabs1).map((p) => p.id),
      ["tab-b"],
    );
  });

  it("nested side-pane close keeps scene in the keep-alive set", () => {
    const scene = createEditorPane("scene", { id: "pane-scene" });
    const inspector = createEditorPane("inspector", { id: "pane-inspector" });
    const materials = createEditorPane("materials", { id: "pane-materials" });
    const right = createSplit(inspector, materials, "vertical", 0.5);
    const layout = createSplit(scene, right, "horizontal", 0.7);
    const after = closeNode(layout, "pane-materials");
    const ids = collectKeepAliveEditorPanes(after).map((p) => p.id).sort();
    assert.deepEqual(ids, ["pane-inspector", "pane-scene"]);
  });
});
