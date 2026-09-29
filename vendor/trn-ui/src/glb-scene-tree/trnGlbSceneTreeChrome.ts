/*******************************************************************************
 * File Name : trnGlbSceneTreeChrome.ts
 *
 * Description : Row styling and icons for {@link TRNGlbSceneTree}.
 *
 * Author : Asst.Prof.Santi Nuratch, Ph.D
 * Thailand Embedded Systems Association (TESA)
 * Version : 1.0
 * Target : PSoC Edge E84 (shared)
 *
 *******************************************************************************/

import type { LucideIcon } from "lucide-react";
import { Box, Folder } from "lucide-react";
import { TRN_GLASS_LISTBOX_OPTION_SELECTED_CLASSNAME } from "../TRNMenu.js";
import type { TrnGlbSceneNode } from "./trnGlbSceneTreeTypes.js";

export function trnGlbSceneTreeRowClass(selected: boolean, selectable: boolean): string
{
  const base =
    "flex min-h-[22px] w-full min-w-0 flex-1 items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] transition-colors";
  if (selected)
  {
    return `${base} ${TRN_GLASS_LISTBOX_OPTION_SELECTED_CLASSNAME}`;
  }
  if (!selectable)
  {
    return `${base} text-zinc-500`;
  }
  return `${base} text-zinc-200 hover:bg-zinc-900/65`;
}

export function resolveTrnGlbSceneNodeIcon(node: TrnGlbSceneNode): LucideIcon
{
  return node.kind === "mesh" ? Box : Folder;
}
