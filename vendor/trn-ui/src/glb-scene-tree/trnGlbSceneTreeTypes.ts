/*******************************************************************************
 * File Name : trnGlbSceneTreeTypes.ts
 *
 * Description : Shared data model for GLB / Three.js scene hierarchy trees.
 *
 * Author : Asst.Prof.Santi Nuratch, Ph.D
 * Thailand Embedded Systems Association (TESA)
 * Version : 1.0
 * Target : PSoC Edge E84 (shared)
 *
 *******************************************************************************/

export type TrnGlbSceneNodeKind = "group" | "mesh";

export type TrnGlbSceneNode = {
  /** Stable `Object3D.uuid` — use for expand/collapse and selection keys. */
  id: string;
  name: string;
  kind: TrnGlbSceneNodeKind;
  /** Mesh binding key (`Mesh.name`) when `kind === "mesh"`. */
  meshName?: string;
  children: TrnGlbSceneNode[];
};
