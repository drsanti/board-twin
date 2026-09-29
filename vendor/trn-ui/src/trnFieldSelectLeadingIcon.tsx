/*******************************************************************************
 * File Name        : trnFieldSelectLeadingIcon.tsx
 *
 * Description      : Default leading icons for field-variant TRNSelect triggers.
 *
 * Author           : Asst.Prof.Santi Nuratch, Ph.D
 * Thailand Embedded Systems Association (TESA)
 * Version          : 1.0
 * Target           : PSoC Edge E84 (shared)
 *
 *******************************************************************************/

import {
  Activity,
  AlignLeft,
  BarChart3,
  Bold,
  Box,
  Cable,
  CheckSquare,
  Clock,
  Factory,
  Globe,
  Hash,
  Image,
  Keyboard,
  Layers,
  LayoutGrid,
  LayoutList,
  LayoutTemplate,
  LineChart,
  Link2,
  List,
  Monitor,
  Move3d,
  MoveHorizontal,
  Palette,
  Pill,
  Search,
  Shapes,
  SlidersHorizontal,
  ToggleLeft,
  Type,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { TRNFieldControlVariant } from "./trnFieldControlClasses.js";

export const TRN_FIELD_SELECT_LEADING_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-zinc-400";

export type TrnFieldSelectLeadingIconKind =
  | "palette"
  | "bold"
  | "pill"
  | "shapes"
  | "line-chart"
  | "activity"
  | "move-horizontal"
  | "bar-chart"
  | "hash"
  | "clock"
  | "link"
  | "cable"
  | "box"
  | "move-3d"
  | "layers"
  | "monitor"
  | "layout-template"
  | "factory"
  | "globe"
  | "keyboard"
  | "toggle"
  | "image"
  | "layout-list"
  | "align-left"
  | "check-square"
  | "sliders"
  | "layout-grid"
  | "search"
  | "wifi"
  | "type"
  | "list";

const LEADING_ICON_BY_KIND: Record<TrnFieldSelectLeadingIconKind, LucideIcon> = {
  palette: Palette,
  bold: Bold,
  pill: Pill,
  shapes: Shapes,
  "line-chart": LineChart,
  activity: Activity,
  "move-horizontal": MoveHorizontal,
  "bar-chart": BarChart3,
  hash: Hash,
  clock: Clock,
  link: Link2,
  cable: Cable,
  box: Box,
  "move-3d": Move3d,
  layers: Layers,
  monitor: Monitor,
  "layout-template": LayoutTemplate,
  factory: Factory,
  globe: Globe,
  keyboard: Keyboard,
  toggle: ToggleLeft,
  image: Image,
  "layout-list": LayoutList,
  "align-left": AlignLeft,
  "check-square": CheckSquare,
  sliders: SlidersHorizontal,
  "layout-grid": LayoutGrid,
  search: Search,
  wifi: Wifi,
  type: Type,
  list: List,
};

type LeadingIconRule = {
  matches: (normalizedLabel: string) => boolean;
  kind: TrnFieldSelectLeadingIconKind;
};

const LEADING_ICON_RULES: LeadingIconRule[] = [
  { matches: (label) => label.includes("theme preset") || label.includes("canvas theme"), kind: "palette" },
  { matches: (label) => label.includes("theme"), kind: "palette" },
  { matches: (label) => label.includes("font style") || label.includes("font weight"), kind: "bold" },
  { matches: (label) => label.includes("pill style"), kind: "pill" },
  { matches: (label) => label.includes("widget type") || label.includes("block type"), kind: "shapes" },
  { matches: (label) => label.includes("chart type"), kind: "line-chart" },
  { matches: (label) => label.includes("waveform"), kind: "activity" },
  { matches: (label) => label.includes("orientation") || label.includes("scale orientation"), kind: "move-horizontal" },
  { matches: (label) => label.includes("bar mode"), kind: "bar-chart" },
  { matches: (label) => label.includes("format") || label.includes("decimal"), kind: "hash" },
  { matches: (label) => label.includes("clock"), kind: "clock" },
  { matches: (label) => label.includes("connection"), kind: "link" },
  { matches: (label) => label.includes("binding") || label.includes("data source"), kind: "cable" },
  { matches: (label) => label.includes("material"), kind: "palette" },
  { matches: (label) => label.includes("collider") || label.includes("shape kind"), kind: "box" },
  { matches: (label) => label.includes("motion type"), kind: "move-3d" },
  { matches: (label) => label.includes("collision layer"), kind: "layers" },
  { matches: (label) => label.includes("display profile") || label.includes("tft"), kind: "monitor" },
  { matches: (label) => label.includes("template"), kind: "layout-template" },
  { matches: (label) => label.includes("factory"), kind: "factory" },
  { matches: (label) => label.includes("environment"), kind: "globe" },
  { matches: (label) => label.includes("keyboard"), kind: "keyboard" },
  { matches: (label) => label.includes("password"), kind: "toggle" },
  { matches: (label) => label.includes("image") || label.includes("scale percent"), kind: "image" },
  { matches: (label) => label.includes("tab index") || label.includes("menu index"), kind: "layout-list" },
  { matches: (label) => label.includes("align"), kind: "align-left" },
  { matches: (label) => label.includes("scroll"), kind: "layout-list" },
  { matches: (label) => label.includes("checked"), kind: "check-square" },
  { matches: (label) => label.includes("mode"), kind: "toggle" },
  { matches: (label) => label.includes("slider"), kind: "sliders" },
  { matches: (label) => label.includes("grid column") || label.includes("grid row"), kind: "layout-grid" },
  { matches: (label) => label.includes("filter"), kind: "search" },
  { matches: (label) => label.includes("model") || label.includes("mesh"), kind: "box" },
  { matches: (label) => label.includes("wifi") || label.includes("network"), kind: "wifi" },
  { matches: (label) => label.includes("unit"), kind: "type" },
  { matches: (label) => label.includes("inspector section"), kind: "list" },
  { matches: (label) => label.includes("transform space"), kind: "move-3d" },
  { matches: (label) => label.includes("button style"), kind: "toggle" },
];

export function pickTrnFieldSelectLeadingIconKind(ariaLabel?: string | null): TrnFieldSelectLeadingIconKind
{
  const normalized = (ariaLabel ?? "").trim().toLowerCase();
  if (normalized.length === 0)
  {
    return "list";
  }
  for (const rule of LEADING_ICON_RULES)
  {
    if (rule.matches(normalized))
    {
      return rule.kind;
    }
  }
  return "list";
}

function fieldSelectLeadingIcon(Icon: LucideIcon): ReactNode
{
  return <Icon className={TRN_FIELD_SELECT_LEADING_ICON_CLASS} aria-hidden />;
}

export function resolveTrnFieldSelectLeadingIcon(options: {
  variant?: TRNFieldControlVariant;
  ariaLabel?: string | null;
  showLeadingIcon?: boolean;
}): ReactNode | undefined
{
  const { variant = "field", ariaLabel, showLeadingIcon } = options;
  if (variant !== "field" || showLeadingIcon === false)
  {
    return undefined;
  }
  const kind = pickTrnFieldSelectLeadingIconKind(ariaLabel);
  return fieldSelectLeadingIcon(LEADING_ICON_BY_KIND[kind]);
}
