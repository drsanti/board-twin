import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEditorPane, createSplit } from "../src/layoutBuilders.js";
import { collectEditorPanes } from "../src/layoutTraversal.js";
import {
  canCloseEditorPane,
  coerceRequiredEditorTypes,
  countEditorPanesOfType,
  isRequiredEditorPane,
} from "../src/utils.js";

describe("viewport pane policy (VP-1 / VP-2)", () => {
  it("canCloseEditorPane blocks closing the last required editor", () => {
    const scene = createEditorPane("scene");
    const hierarchy = createEditorPane("hierarchy");
    const layout = createSplit(scene, hierarchy, "horizontal", 0.7);

    assert.equal(canCloseEditorPane(layout, scene.id, ["scene"]), false);
    assert.equal(canCloseEditorPane(layout, hierarchy.id, ["scene"]), true);
  });

  it("canCloseEditorPane still blocks closing the last pane overall", () => {
    const only = createEditorPane("inspector");
    assert.equal(canCloseEditorPane(only, only.id), false);
    assert.equal(canCloseEditorPane(only, only.id, ["scene"]), false);
  });

  it("canCloseEditorPane allows closing a required type when a duplicate exists", () => {
    const sceneA = createEditorPane("scene");
    const sceneB = createEditorPane("scene");
    const layout = createSplit(sceneA, sceneB, "horizontal", 0.5);
    assert.equal(canCloseEditorPane(layout, sceneA.id, ["scene"]), true);
    assert.equal(canCloseEditorPane(layout, sceneB.id, ["scene"]), true);
  });

  it("coerceRequiredEditorTypes injects a missing required editor", () => {
    const layout = createEditorPane("hierarchy");
    const next = coerceRequiredEditorTypes(layout, ["scene"]);
    assert.equal(countEditorPanesOfType(next, "scene"), 1);
    assert.equal(countEditorPanesOfType(next, "hierarchy"), 1);
  });

  it("coerceRequiredEditorTypes collapses duplicate required editors to one", () => {
    const sceneA = createEditorPane("scene");
    const sceneB = createEditorPane("scene");
    const hierarchy = createEditorPane("hierarchy");
    const layout = createSplit(
      createSplit(sceneA, sceneB, "horizontal", 0.5),
      hierarchy,
      "vertical",
      0.7,
    );
    const next = coerceRequiredEditorTypes(layout, ["scene"]);
    assert.equal(countEditorPanesOfType(next, "scene"), 1);
    assert.equal(collectEditorPanes(next).some((p) => p.editorType === "hierarchy"), true);
  });

  it("isRequiredEditorPane reports membership", () => {
    assert.equal(isRequiredEditorPane("scene", ["scene"]), true);
    assert.equal(isRequiredEditorPane("hierarchy", ["scene"]), false);
    assert.equal(isRequiredEditorPane("scene", undefined), false);
  });
});
