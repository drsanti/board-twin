# TRNHoldModeIconButton

Icon toolbar control with:

- **Short click** — optional primary action (`onPrimaryAction`)
- **Hold (~0.8s)** — after **200ms** arm delay, circular progress fills, then mode menu
- **Shift+click** or **corner triangle click** — open mode menu immediately
- Short click before arm → primary action; release after arm → cancel (no primary)

Menu is portaled to `document.body` (glass HUD-style). Use for Apply Manual/Auto, similar dual-mode tools.

## Props

| Prop | Role |
|------|------|
| `items` | Mode rows (`id`, `label`, `subtitle?`, `icon`, `ariaLabel?`) |
| `activeItemId` / `onActiveItemChange` | Current mode |
| `onPrimaryAction` / `primaryActionEnabled` | Short-click action |
| `dimmed` / `pending` / `attention` / `emphasize` | Face chrome (`attention` = Manual dirty “needs click”) |
| `hint` | `TRNTooltip` content (no native `title`) |
| `holdMs` | Total hold to open menu (default **800**) |
| `progressArmMs` | Delay before ring appears (default **200**) |

## Example

```tsx
<TRNHoldModeIconButton
  items={[
    { id: "manual", label: "Manual", subtitle: "Click to apply", icon: <Check … /> },
    { id: "auto", label: "Auto", subtitle: "Apply on change", icon: <Zap … /> },
  ]}
  activeItemId={auto ? "auto" : "manual"}
  onActiveItemChange={(id) => setAuto(id === "auto")}
  onPrimaryAction={apply}
  primaryActionEnabled={!auto && dirty}
  dimmed={!auto && !dirty}
  pending={auto && dirty}
  emphasize={auto || dirty}
/>
```

Menus with more than 5 items should use searchable TRN menu shells instead.
