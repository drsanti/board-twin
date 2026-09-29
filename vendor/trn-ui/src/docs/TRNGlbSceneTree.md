# TRNGlbSceneTree

Reusable collapsible **GLB / Three.js scene hierarchy** explorer for model outline panels (HMI Studio, Sensor Studio, and other webview apps).

## Data

Build tree data once from a loaded model root:

```tsx
import {
  TRNGlbSceneTree,
  buildTrnGlbSceneTree,
  listTrnGlbSceneMeshNames,
  type TrnGlbSceneNode,
} from "../../ui/TRN/index.js";

const nodes = buildTrnGlbSceneTree(gltfRoot);
const meshNames = listTrnGlbSceneMeshNames(nodes);
```

`TrnGlbSceneNode`: `id` (`Object3D.uuid`), `name`, `kind` (`group` | `mesh`), optional `meshName`, `children`.

## UI

```tsx
<TRNGlbSceneTree
  treeKey={modelPath}
  nodes={nodes}
  selectedMeshName={activeMeshName}
  onSelectMeshName={(meshName) => bindScreenMesh(meshName)}
  onHoverNode={(node) => setHoveredMeshName(node?.meshName ?? null)}
/>
```

## Props (highlights)

| Prop | Description |
| --- | --- |
| `nodes` | Root outline nodes from `buildTrnGlbSceneTree`. |
| `treeKey` | Resets expand-all when the model reloads. |
| `selectedMeshName` / `selectedNodeId` | Highlight active row. |
| `onSelectMeshName` | Mesh-binding convenience callback. |
| `isNodeSelectable` | Override default (named meshes only). |
| `showExpandToolbar` | Expand all / Collapse all (default `true`). |
| `emptyState` | Render when `nodes` is empty. |

See `TRNGlbSceneTree.tsx` for the full prop list.

## Related

- Generic trees without GLB semantics: `TRNTree`
- Sensor Studio model outliner: richer spawn/drag — may adopt this component over time
