import { createEditorPane, createSplit } from "../../src/layoutBuilders.js";

/** Minimal three-pane layout for portable package tests. */
export const SAMPLE_WORKBENCH_LAYOUT = createSplit(
  createEditorPane("flow"),
  createSplit(
    createEditorPane("inspector"),
    createEditorPane("library"),
    "horizontal",
    0.6,
  ),
  "horizontal",
  0.7,
);
