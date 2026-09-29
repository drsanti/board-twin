/*******************************************************************************
 * File Name : buildTrnGlbSceneTree.ts
 *
 * Description : Build a {@link TrnGlbSceneNode} tree from a loaded GLB root.
 *
 * Author : Asst.Prof.Santi Nuratch, Ph.D
 * Thailand Embedded Systems Association (TESA)
 * Version : 1.0
 * Target : PSoC Edge E84 (shared)
 *
 *******************************************************************************/

import * as THREE from "three";
import type { TrnGlbSceneNode } from "./trnGlbSceneTreeTypes.js";

function sceneNodeLabel(obj: THREE.Object3D): string
{
  const trimmed = obj.name.trim();
  if (trimmed.length > 0)
  {
    return trimmed;
  }
  if (obj instanceof THREE.Mesh)
  {
    return "Mesh";
  }
  if (obj instanceof THREE.Group)
  {
    return "Group";
  }
  return obj.type;
}

function buildSceneNode(obj: THREE.Object3D): TrnGlbSceneNode | null
{
  const childNodes = obj.children
    .map(buildSceneNode)
    .filter((node): node is TrnGlbSceneNode => node != null);

  const isMesh = obj instanceof THREE.Mesh;
  if (!isMesh && childNodes.length === 0)
  {
    return null;
  }

  return {
    id: obj.uuid,
    name: sceneNodeLabel(obj),
    kind: isMesh ? "mesh" : "group",
    meshName: isMesh && obj.name.trim().length > 0 ? obj.name.trim() : undefined,
    children: childNodes,
  };
}

/** Builds a hierarchical outline from the loaded GLB root (children of scene root). */
export function buildTrnGlbSceneTree(root: THREE.Object3D): TrnGlbSceneNode[]
{
  const topLevel = root.children
    .map(buildSceneNode)
    .filter((node): node is TrnGlbSceneNode => node != null);

  if (topLevel.length === 1)
  {
    return topLevel;
  }

  const rootNode = buildSceneNode(root);
  return rootNode != null ? [rootNode] : topLevel;
}
