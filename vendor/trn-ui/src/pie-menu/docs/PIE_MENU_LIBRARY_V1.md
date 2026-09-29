# Pie menu library v1 spec

Canonical design for publishing `@ternion/trn-ui/pie-menu` (future standalone `@ternion/trn-pie-menu`). Implementation status: **Phase 1 shipped** in this repo.

## Goals

- **Headless geometry + controller** — layout math and keyboard/hover state without DOM opinions.
- **Styled default** — TRN glass slices, hub ring, tooltips; overridable via tokens and `classNames`.
- **Host owns domain** — Snap actions, scene routing, toasts stay outside the package.
- **Animations** — CSS presets + optional GSAP timelines (`spring`, custom builders). Layout transforms live on outer wrappers; motion targets inner nodes only.

## Layer stack

```text
pie-layout.ts          Pure slot positions, clamp, digit map
pie-config.ts          resolve layout / behavior / animation / tokens
usePieMenuController   open, hoverSlot, confirm, cancel, keyboard
TRNPieMenu.tsx         Portal HUD + default slice chrome
Host (TwinSceneSnapPie) Catalog, icons, Shift+S wiring
```

## Public API (v1)

### Component

```tsx
<TRNPieMenu
  open={open}
  anchor={{ x, y }}
  items={items}           // 8 slots, null = empty
  title="Snap"
  layout={{ rowStepPx: 58, distributeRadiusPx: 84 }}
  behavior={{
    confirmOn: ["click", "digit", "mnemonic"],
    cancelOn: ["escape", "backdrop", "rmb", "repeatChord"],
    repeatCancelChord: { key: "s", shift: true },
  }}
  animation={{ preset: "fade-scale", durationSec: 0.18, staggerSec: 0.025 }}
  // Twin Snap: animation={{ engine: "gsap", preset: "spring" }}
  tokens={{ hubHoverArcStroke: "#60a5fa" }}
  classNames={{ sliceActive: "ring-1 ring-cyan-400/50" }}
  onConfirm={(id) => {}}
  onCancel={() => {}}
/>
```

### Headless hooks

| Hook | Purpose |
|------|---------|
| `useTrnPieMenuController` | hover, confirm/cancel, keyboard while open |
| `useTrnPieMenuPointerAnchor` | `{ note, snapshot }` for chord-open at cursor |
| `useTrnHotkeyPointerTracking` | window capture `pointermove` → region router |

### Pure helpers

`resolveTrnPieMenuLayout`, `trnPieBuildSlotLayout`, `trnPieSliceOffset`, `resolveTrnPieOpenCenter`, `trnPieSlotFromPointer`, `trnPieMenuCssVars`, `resolveTrnPieMenuBehavior`, `resolveTrnPieMenuAnimation`.

## Layout config

| Field | Default | Role |
|-------|---------|------|
| `rowStepPx` | 58 | Vertical gap between adjacent rows (clockwise) |
| `distributeRadiusPx` | 84 | E/W horizontal attach |
| `diagonalRadiusPx` | 68 | Diagonal horizontal attach |
| `deadZonePx` | 32 | Hub pointer dead zone |
| `hubSizePx` | 36 | Hub SVG box |
| `hubRingRadiusPx` | 13 | Hub ring radius |
| `hoverDiscPx` | auto | Invisible hit disc |
| `viewportPadPx` | 10 | Hub clamp padding |
| `scale` | 1 | Uniform multiplier |

Layout uses **five equal vertical bands** (stadium). Clockwise neighbors always differ by one `rowStepPx` in Y.

## Behavior config

| Field | Default | Role |
|-------|---------|------|
| `mode` | `"tap"` | v1 only; hold-flick backlog |
| `hoverMode` | `"angular"` | Hub arc + highlight follow pointer wedge (Blender) |
| `confirmClick` | `"anywhere"` | LMB anywhere confirms armed wedge; `"slice-only"` for legacy |
| `disabledItems` | `"show"` | `"hide"` removes disabled slices from render |
| `confirmOn` | click, digit, mnemonic | Digit keys work anywhere while open. Arrows walk slices; Enter confirms the armed wedge. |
| `cancelOn` | escape, backdrop, rmb | LMB in dead zone / empty wedge → cancel |
| `repeatCancelChord` | null | Host chord to close (Twin: Shift+S) |

**Note:** Repeat-chord cancel is **opt-in** via `cancelOn: […, "repeatChord"]` + `repeatCancelChord`. Generic hosts omit it.

## Animation presets

| Preset | Engine | Open | Reduced motion |
|--------|--------|------|----------------|
| `none` | css / gsap | Instant | Same |
| `fade-scale` **(default)** | css | Hub scale-in; slices fade + scale with stagger | → `none` |
| `blender` | css | Hub pop; slices fade only (no scale) | → `none` |
| `spring` | gsap | Elastic hub + back.out slices; animateClose | → `none` |

Timing defaults: **duration 0.18s**, **stagger 0.025s** per slot index. CSS lives in `pie-menu.css`; variables `--pie-anim-duration`, `--pie-anim-stagger`.

**GSAP engine** — `useTrnPieMenuMotion` + `buildTrnPieMenuGsapOpenTimeline` / `CloseTimeline`. Twin Snap: `{ engine: "gsap", preset: "spring" }`. Override tweens via `animation.gsap` or replace timelines with `buildOpenTimeline` / `buildCloseTimeline`.

### Motion vs layout DOM (required for GSAP scale)

Outer nodes keep **position + outward `translate`**; inner nodes are **animation targets** only:

```text
__slice-wrap   left/top + trnPieSlotBoxAlign translate  (never GSAP-transformed)
  __slice-inner   opacity / scale (CSS keyframes or GSAP)
__title-wrap   translate(-50%, …)
  __title        opacity
hub box        fixed hubSize; __hub-svg scales inside
```

Without this split, GSAP `scale` overwrites the attach transform and slices collapse toward the hub.

## Style customization

Pass `theme` for a built-in look, then optionally override with `tokens` / `classNames`.

| Theme | Look |
|-------|------|
| `glass` (library default) | TRN translucent slices |
| `blender` | Softer dark pills, muted icons |
| `solid` | Opaque charcoal pills — Blender Snap chrome |
| `slate` (Twin Factory default) | Cool blue-slate pills — readable on Inspector + Scene |

### 1. Theme + CSS variables (`tokens` prop → inline on cluster)

`--pie-hub-fill`, `--pie-hub-ring-stroke`, `--pie-hub-hover-arc-stroke`, `--pie-title-color`, `--pie-slice-digit-color`, `--pie-slice-fill`, `--pie-slice-border`, `--pie-slice-text`, `--pie-slice-icon`, `--pie-slice-active-*`, plus layout vars.

```tsx
<TRNPieMenu theme="blender" tokens={{ hubHoverArcStroke: "#22d3ee" }} … />
```

### 2. `classNames` map

`overlay`, `backdrop`, `cluster`, `hoverDisc`, `titleWrap`, `title`, `hubSvg`, `hubRing`, `hubHoverArc`, `sliceWrap`, `sliceInner`, `slice`, `sliceActive`, `sliceDisabled`, `sliceDigit`.

### 3. Render props (Phase 3 backlog)

`renderSlice`, `renderHub` for fully custom UI without forking TRN.

## npm packaging path

| Stage | Package | Trigger |
|-------|---------|---------|
| Now | `@ternion/trn-ui/pie-menu` | Bitstream + TRN consumers |
| Later | `@ternion/trn-pie-menu` | External app without full TRN |
| Optional | `@ternion/trn-pie-menu/themes` | Prebuilt light/dark CSS |

Ship `pie-menu.css` in `@ternion/trn-ui/styles.css` and document `@import` for standalone users.

## Twin Factory host (reference)

```tsx
// TwinSceneSnapPie.tsx — hide disabled + Shift+S repeat cancel + GSAP spring
<TRNPieMenu
  animation={{ engine: "gsap", preset: "spring" }}
  behavior={{
    disabledItems: "show",
    cancelOn: ["escape", "backdrop", "rmb", "repeatChord"],
    repeatCancelChord: { key: "s", shift: true },
  }}
  …
/>
```

Pointer anchor: `useTwinSceneViewportNavigationShortcuts` passes `{ x, y }` from capture-phase tracking (not pane center fallback).

## Backlog (v1.1+)

- Hold-flick interaction mode
- Arrow-key slice walk
- `renderSlice` / headless-only entry
- Variable slot counts (4 / 6 / 8)
- Inspector / Hierarchy catalogs on same chord
- Storybook demo with live layout sliders

## Related

- Operator guide: `TRNPieMenu.md`
- Twin GZ-8: `extension/src/webview/twin-factory/docs/TWIN_GIZMO_EDITING.md`
