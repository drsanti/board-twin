import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SAMPLE_WORKBENCH_LAYOUT } from "./fixtures/sample-layout.js";
import { createEditorPane, createSplit } from "../src/layoutBuilders.js";
import { collectEditorPanes, findEditorPane } from "../src/layoutTraversal.js";
import { validateLayoutTree } from "../src/layoutValidateCore.js";
import {
  collapseEditorPane,
  isCollapsedEditor,
} from "../src/utils.js";
import {
  canRedoLayout,
  canUndoLayout,
  clearLayoutHistory,
  pushLayoutHistory,
  redoLayout,
  undoLayout,
} from "../src/layout-history.js";

describe("TRN workbench layout core", () => {
  it("validates layout tree and replaces unknown editor types", () => {
    const bad = structuredClone(SAMPLE_WORKBENCH_LAYOUT);
    const pane = collectEditorPanes(bad).find((n) => n.editorType === "library");
    assert.ok(pane);
    pane!.editorType = "unknown-pane";

    const fixed = validateLayoutTree(bad, {
      fallback: SAMPLE_WORKBENCH_LAYOUT,
      knownEditorTypes: new Set(["library", "flow", "inspector"]),
      fallbackEditorType: "flow",
    });

    const replaced = collectEditorPanes(fixed).find((n) => n.id === pane!.id);
    assert.ok(replaced);
    assert.equal(replaced!.editorType, "flow");
  });

  it("supports tab groups in persisted layouts", () => {
    const tabsLayout = createSplit(
      createEditorPane("flow"),
      {
        id: "tabs-1",
        type: "tabs",
        activeIndex: 0,
        panes: [createEditorPane("inspector"), createEditorPane("library")],
      },
      "horizontal",
      0.7,
    );

    const parsed = validateLayoutTree(tabsLayout, {
      fallback: SAMPLE_WORKBENCH_LAYOUT,
      knownEditorTypes: new Set(["library", "flow", "inspector"]),
      fallbackEditorType: "flow",
    });

    assert.equal(parsed.type, "split");
  });

  it("collapseEditorPane marks pane collapsed with edge metadata", () => {
    const pane = createEditorPane("inspector");
    const layout = createSplit(createEditorPane("flow"), pane, "horizontal", 0.75);
    const collapsed = collapseEditorPane(layout, pane.id);
    const after = findEditorPane(collapsed, pane.id);
    assert.equal(after?.collapsed, true);
    assert.ok(after?.collapseEdge);
  });

  it("layout history supports undo and redo", () => {
    clearLayoutHistory();
    const base = SAMPLE_WORKBENCH_LAYOUT;
    const libraryId = collectEditorPanes(base).find((p) => p.editorType === "library")!.id;
    const changed = collapseEditorPane(base, libraryId);
    pushLayoutHistory(base);
    const undone = undoLayout(changed);
    assert.ok(undone);
    assert.equal(
      isCollapsedEditor(findEditorPane(undone!, libraryId)!),
      false,
    );
    assert.equal(canUndoLayout(), false);
    assert.equal(canRedoLayout(), true);
    const redone = redoLayout(undone!);
    assert.ok(redone);
    assert.equal(isCollapsedEditor(findEditorPane(redone!, libraryId)!), true);
    clearLayoutHistory();
  });
});
