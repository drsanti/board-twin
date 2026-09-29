import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyFloatDockRestore,
  captureFloatDockRestore,
} from "../src/floatDockRestore.js";
import { createEditorPane, createSplit, createTabs } from "../src/layoutBuilders.js";
import { collectEditorPanes, removeEditorPane } from "../src/layoutTraversal.js";
import { findEditorNode } from "../src/utils.js";

describe("floatDockRestore", () => {
  it("captures split sibling restore metadata", () => {
    const left = createEditorPane("scene", { id: "scene-1" });
    const right = createEditorPane("look", { id: "look-1" });
    const layout = createSplit(left, right, "horizontal", 0.62, "split-1");

    const restore = captureFloatDockRestore(layout, "look-1");
    assert.deepEqual(restore, {
      kind: "split",
      siblingId: "scene-1",
      side: "second",
      direction: "horizontal",
      ratio: 0.62,
    });
  });

  it("restores a floated pane beside its previous sibling", () => {
    const left = createEditorPane("scene", { id: "scene-1" });
    const right = createEditorPane("look", { id: "look-1" });
    const layout = createSplit(left, right, "horizontal", 0.62, "split-1");
    const restore = captureFloatDockRestore(layout, "look-1");
    const remaining = removeEditorPane(layout, "look-1");
    assert.ok(remaining);

    const applied = applyFloatDockRestore(
      remaining!,
      { id: "look-1", type: "editor", editorType: "look" },
      restore,
    );
    assert.ok(applied);
    assert.equal(applied!.mode, "previous");
    assert.ok(findEditorNode(applied!.layout, "look-1"));
    assert.ok(findEditorNode(applied!.layout, "scene-1"));
  });

  it("captures and restores tab group index", () => {
    const tabs = createTabs(
      [createEditorPane("inspector", { id: "ins-1" }), createEditorPane("look", { id: "look-1" })],
      1,
      "tabs-1",
    );
    const layout = createSplit(
      createEditorPane("scene", { id: "scene-1" }),
      tabs,
      "horizontal",
      0.7,
    );
    const restore = captureFloatDockRestore(layout, "look-1");
    assert.deepEqual(restore, {
      kind: "tabs",
      tabsId: "tabs-1",
      index: 1,
      peerIds: ["ins-1"],
    });

    const remaining = removeEditorPane(layout, "look-1");
    assert.ok(remaining);
    const applied = applyFloatDockRestore(
      remaining!,
      { id: "look-1", type: "editor", editorType: "look" },
      restore,
    );
    assert.ok(applied);
    assert.equal(applied!.mode, "previous");
    assert.ok(findEditorNode(applied!.layout, "look-1"));
    assert.equal(collectEditorPanes(applied!.layout).length, 3);
  });

  it("falls back when previous sibling is gone", () => {
    const left = createEditorPane("scene", { id: "scene-1" });
    const right = createEditorPane("look", { id: "look-1" });
    const layout = createSplit(left, right, "horizontal", 0.5, "split-1");
    const restore = captureFloatDockRestore(layout, "look-1");
    // After float, only scene remains — then replace scene with hierarchy.
    let remaining = removeEditorPane(layout, "look-1");
    assert.ok(remaining);
    remaining = createEditorPane("hierarchy", { id: "hier-1" });

    const applied = applyFloatDockRestore(
      remaining,
      { id: "look-1", type: "editor", editorType: "look" },
      restore,
    );
    assert.ok(applied);
    assert.equal(applied!.mode, "fallback");
    assert.ok(findEditorNode(applied!.layout, "look-1"));
    assert.ok(findEditorNode(applied!.layout, "hier-1"));
  });

  it("returns null when editor is already docked", () => {
    const layout = createEditorPane("look", { id: "look-1" });
    const applied = applyFloatDockRestore(
      layout,
      { id: "look-1", type: "editor", editorType: "look" },
      null,
    );
    assert.equal(applied, null);
  });
});
