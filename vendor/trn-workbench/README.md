# @ternion/trn-workbench

Tiling workbench layout engine, named layout library, and chrome for React + Tailwind apps.

## Install

```bash
npm install @ternion/trn-workbench @ternion/trn-ui
```

Peer dependencies: `react`, `react-dom`.

## Styles

```css
@import "@ternion/trn-workbench/styles.css";
```

Requires `@ternion/trn-ui/styles.css` (or equivalent TRN theme tokens) in the same app.

## Usage

```tsx
import {
  StandaloneWorkbench,
  createEditorPane,
  createSplit,
  validateLayoutTree,
} from "@ternion/trn-workbench";
```

### VS Code webview host mirror

Call once at app boot in extension webviews:

```ts
import { configureTrnWorkbenchVscode } from "@ternion/trn-workbench";

configureTrnWorkbenchVscode({ isVsCodeExtensionWebview: () => Boolean(window.__VSCODE_API__) });
```

Then `installWorkbenchLayoutHostSync(appId)` syncs layout library JSON with the extension host.

## Build & test

```bash
npm run build
npm test
```

## Development / linking

| Context | Workflow |
|---------|----------|
| **Bitstream-Studio extension** | Edit this package’s `src/`; extension Vite aliases give HMR — no daily `build` needed |
| **External repo (`file:` / link)** | Run `npm run build` here, or from monorepo root: `npm run build:packages` / `npm run dev:packages:watch` |
| **Watch (dist rebuild)** | `npm run dev` in this package (`tsup --watch`) |

Full active-development rules: **`packages/docs/TRN_LIBRARIES_CONSUMER_GUIDE.md`** § *Active development: staying on latest*.
