# @ternion/trn-ui

React UI primitives for TERNION apps (Bitstream Studio, Sensor Studio, external graph engines).

## Install

```bash
npm install @ternion/trn-ui
```

Peer dependencies: `react`, `react-dom`.

## Styles

Import bundled CSS once in your app entry (Tailwind 4 project):

```css
@import "@ternion/trn-ui/styles.css";
```

Or import source theme + notice CSS during local package development.

## Usage

```tsx
import {
  TRNButton,
  TRNSelect,
  TRNParameter,
  TRN_GLASS_DROPDOWN_TEXT_CLASS,
  useFixedMenuAnchor,
} from "@ternion/trn-ui";
```

### GLB scene tree (optional subpath)

```tsx
import { TRNGlbSceneTree, buildTrnGlbSceneTree } from "@ternion/trn-ui/glb-scene-tree";
```

### Pie menu (optional subpath)

```tsx
import { TRNPieMenu, noteTrnHotkeyPointer } from "@ternion/trn-ui/pie-menu";
```

Tap-to-open radial pie + hover-region hotkey helpers. Guide: `src/pie-menu/docs/TRNPieMenu.md`.

## Build

```bash
npm run build
```

Produces `dist/index.js`, `dist/glb-scene-tree/index.js`, `dist/pie-menu/index.js`, and `dist/styles.css`.

## Development / linking

| Context | Workflow |
|---------|----------|
| **Bitstream-Studio extension** | Edit this package’s `src/`; extension Vite aliases give HMR — no daily `build` needed |
| **External repo (`file:` / link)** | Run `npm run build` here, or from monorepo root: `npm run build:packages` / `npm run dev:packages:watch` |
| **Watch (dist rebuild)** | `npm run dev` in this package (`tsup --watch`) |

Full active-development rules: **`packages/docs/TRN_LIBRARIES_CONSUMER_GUIDE.md`** § *Active development: staying on latest*.
