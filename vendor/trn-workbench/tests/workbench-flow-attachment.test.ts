import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SAMPLE_WORKBENCH_LAYOUT } from "./fixtures/sample-layout.js";
import {
  coerceWorkbenchFlowAttachment,
  createWorkbenchFlowAttachment,
} from "../src/workbench-flow-attachment.js";
import { createWorkbenchLayoutSnapshotFromCurrent } from "../src/workbench-layout-library.js";

describe("workbench flow attachment", () => {
  it("round-trips a layout snapshot in flow export envelope", () => {
    const snapshot = createWorkbenchLayoutSnapshotFromCurrent({
      appId: "sensor-studio",
      name: "Flow export",
      layout: SAMPLE_WORKBENCH_LAYOUT,
      dockMemory: { "flow|inspector|left": 0.58 },
    });
    const attachment = createWorkbenchFlowAttachment(snapshot);
    const json = JSON.stringify(attachment);
    const parsed = coerceWorkbenchFlowAttachment(JSON.parse(json));
    assert.ok(parsed);
    assert.equal(parsed?.appId, "sensor-studio");
    assert.deepEqual(parsed?.snapshot.dockMemory, attachment.snapshot.dockMemory);
  });

  it("rejects attachments with mismatched app ids", () => {
    const bad = {
      version: 1,
      appId: "sensor-studio",
      snapshot: {
        version: 1,
        id: "x",
        name: "Bad",
        appId: "other-app",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "user",
        layout: SAMPLE_WORKBENCH_LAYOUT,
      },
    };
    assert.equal(coerceWorkbenchFlowAttachment(bad), null);
  });
});
