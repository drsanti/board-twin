/*******************************************************************************
 * File Name : trnGlbSceneTreeUtils.ts
 *
 * Description : Helpers for {@link TrnGlbSceneNode} trees and {@link TRNGlbSceneTree}.
 *
 * Author : Asst.Prof.Santi Nuratch, Ph.D
 * Thailand Embedded Systems Association (TESA)
 * Version : 1.0
 * Target : PSoC Edge E84 (shared)
 *
 *******************************************************************************/

import type { TrnGlbSceneNode } from "./trnGlbSceneTreeTypes.js";

/** Default mesh-picker rule: named meshes only. */
export function isTrnGlbSceneMeshSelectable(node: TrnGlbSceneNode): boolean
{
  return node.kind === "mesh" && node.meshName != null;
}

/** Flat named mesh list for summaries, filters, and legacy pickers. */
export function listTrnGlbSceneMeshNames(nodes: readonly TrnGlbSceneNode[]): string[]
{
  const names: string[] = [];
  const walk = (node: TrnGlbSceneNode) =>
  {
    if (node.kind === "mesh" && node.meshName != null)
    {
      names.push(node.meshName);
    }
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return [...new Set(names)].sort();
}

/** Group branch ids that have children — used for default expand-all. */
export function collectTrnGlbSceneExpandableIds(nodes: readonly TrnGlbSceneNode[]): string[]
{
  const ids: string[] = [];
  const walk = (node: TrnGlbSceneNode) =>
  {
    if (node.kind === "group" && node.children.length > 0)
    {
      ids.push(node.id);
    }
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return ids;
}

export function isTrnGlbSceneNodeSelected(
  node: TrnGlbSceneNode,
  selectedNodeId: string | null | undefined,
  selectedMeshName: string | null | undefined,
): boolean
{
  if (selectedNodeId != null && node.id === selectedNodeId)
  {
    return true;
  }
  return (
    selectedMeshName != null
    && node.meshName != null
    && node.meshName === selectedMeshName
  );
}
