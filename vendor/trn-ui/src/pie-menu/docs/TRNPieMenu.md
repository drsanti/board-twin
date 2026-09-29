# TRN pie menu

Reusable tap-to-open radial pie for TERNION webviews. Domain-free: the package owns HUD layout and hover-region routing; the host owns actions.

Import:

```ts
import {
  TRNPieMenu,
  noteTrnHotkeyPointer,
  resolveTrnHotkeyRegionAtLastPointer,
  TRN_HOTKEY_REGION_ATTR,
} from "@ternion/trn-ui/pie-menu";
```

Also re-exported from `@ternion/trn-ui` / `@/ui/TRN`.

## Tap to open

- Open at the pointer. The hub stays on the cursor when the full pie fits; otherwise it nudges inward so slices stay inside `clampBounds` (Twin Scene: 3D canvas rect) or the window.
- Labels sit on **five equal vertical bands** (stadium layout). Clockwise neighbors are one row apart so vertical gaps stay even; E/W columns no longer stack too tight. Hover paints a blue arc on the hub.
- Confirm: LMB on a slice, Digit / Numpad 1–9 (Blender clock), mnemonic letter, or **Enter** on the armed wedge. **Arrow** keys walk armable slices.
- Cancel: Esc, click empty, RMB, or the same chord again (host or pie).
- Hub dead zone: click center does not confirm.
- No HTML `title`. Pass `hint` / `disabledHint` for `TRNTooltip`.
- Pie is not a list menu — do not add search (even with 8 slices).

Eight slots clockwise from 12 o’clock. Digit map: 8, 9, 6, 3, 2, 1, 4, 7.

## Layout config

Pass `layout` to `TRNPieMenu` (or `resolveTrnPieMenuLayout` in tests). All fields optional; defaults match the shipped Snap pie.

| Field | Role | Default |
|-------|------|---------|
| `rowStepPx` | Vertical gap between adjacent rows | 58 |
| `distributeRadiusPx` | E/W (3 & 9 o'clock) horizontal attach | 84 |
| `diagonalRadiusPx` | NE/SE/NW/SW horizontal attach | 68 |
| `deadZonePx` | Hub pointer dead zone | 32 |
| `hubSizePx` / `hubRingRadiusPx` | Hub SVG size & ring | 36 / 13 |
| `hoverDiscPx` | Invisible hit disc (auto if omitted) | derived |
| `viewportPadPx` | Hub clamp padding | 10 |
| `scale` | Uniform multiplier after other fields | 1 |

```tsx
<TRNPieMenu
  open={open}
  items={items}
  anchor={anchor}
  layout={{ rowStepPx: 64, distributeRadiusPx: 92 }}
  onConfirm={onConfirm}
  onCancel={onCancel}
/>
```

Twin Factory: optional `layout` on `TwinSceneSnapPie` forwards to TRN unchanged.

**Library v1 spec:** `docs/PIE_MENU_LIBRARY_V1.md` (behavior, animation, tokens, headless hooks).

## Behavior config

Pass `behavior` for confirm/cancel paths and Blender-style angular arming. Repeat-chord cancel is opt-in (Twin Snap: Shift+S).

| Field | Default | Role |
|-------|---------|------|
| `hoverMode` | `"angular"` | Wedge from hub→cursor arms slice + hub arc (Blender). `"slice-hit"` = button hover only. |
| `confirmClick` | `"anywhere"` | LMB on overlay confirms armed wedge. `"slice-only"` = click the slice button. |
| `disabledItems` | `"show"` | `"hide"` omits disabled slices from the ring (wedge stays inert). Disabled slots never highlight. |
| `confirmOn` | click, digit, mnemonic | Digit / mnemonic work anywhere while open. |
| `cancelOn` | escape, backdrop, rmb | Backdrop LMB cancels when no wedge is armed (angular + anywhere). |
| `repeatCancelChord` | null — set with `cancelOn: […, "repeatChord"]` |

## Animation (CSS + GSAP)

| Field | Default | Role |
|-------|---------|------|
| `engine` | `"css"` | `"css"` or `"gsap"` |
| `preset` | `"fade-scale"` | `none`, `fade-scale`, `blender`, `spring` |
| `durationSec` / `staggerSec` | 0.18 / 0.025 | Shared timing |
| `gsap` | — | Per-target tween overrides (`hubFrom`, `sliceTo`, `ease`, …) |
| `buildOpenTimeline` / `buildCloseTimeline` | — | Full custom GSAP timelines |
| `animateClose` | `true` when gsap | Close animation before unmount |
| `onOpenComplete` / `onCloseComplete` | — | Lifecycle hooks |

**CSS engine** — keyframe presets in `pie-menu.css` (`fade-scale`, `blender`).

**GSAP engine** — programmatic open/close; `spring` uses elastic hub + back.out slices. Twin Factory Snap pie uses `{ engine: "gsap", preset: "spring" }`.

**Layout vs motion:** `__slice-wrap` / `__title-wrap` hold attach transforms; `__slice-inner` / inner title are animated. Custom GSAP timelines must target the same inner refs (via `buildOpenTimeline` context) — do not tween the wrap nodes if they carry `translate(...)`.

```tsx
<TRNPieMenu
  animation={{
    engine: "gsap",
    preset: "spring",
    gsap: { sliceTo: { ease: "back.out(2)" } },
    buildOpenTimeline: (ctx) => {
      const tl = ctx.gsap.timeline();
      // full control …
      return tl;
    },
  }}
/>
```

Respects `prefers-reduced-motion` → preset `none`.

## Hover-routed chords

```html
<div data-trn-hotkey-region="scene">…</div>
<div data-trn-hotkey-region="inspector">…</div>
```

Call `noteTrnHotkeyPointer` on **capture-phase** `pointermove` (or `useTrnHotkeyPointerTracking`). Hosts that open a pie from a chord should pass `{ x, y }` from that same listener — do not fall back to pane center when the pointer was never seen. On the chord, `resolveTrnHotkeyRegionAtLastPointer()` returns the region under the cursor via `elementFromPoint` + `closest`. Same shortcut can open different catalogs later (Scene Snap vs Inspector). Typing in an input must win.

v1 Twin Factory: only `scene` opens the Snap pie. Inspector / Hierarchy tags exist so the router is real.

## Future

- Hold-flick (press, flick, release-to-confirm)
- Arrow-key slice walk
- Host example catalog window
- Split `@ternion/trn-pie-menu` only if a second consumer cannot take `@ternion/trn-ui`
