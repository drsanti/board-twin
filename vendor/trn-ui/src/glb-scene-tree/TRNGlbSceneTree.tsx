/*******************************************************************************
 * File Name : TRNGlbSceneTree.tsx
 *
 * Description : Reusable collapsible GLB / Three.js scene hierarchy explorer.
 *
 * Author : Asst.Prof.Santi Nuratch, Ph.D
 * Thailand Embedded Systems Association (TESA)
 * Version : 1.0
 * Target : PSoC Edge E84 (shared)
 *
 *******************************************************************************/

import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { TRNButton } from "../TRNButton.js";
import { TRNMenuScrollRegion } from "../TRNMenu.js";
import type { TrnGlbSceneNode } from "./trnGlbSceneTreeTypes.js";
import {
  collectTrnGlbSceneExpandableIds,
  isTrnGlbSceneMeshSelectable,
  isTrnGlbSceneNodeSelected,
} from "./trnGlbSceneTreeUtils.js";
import {
  resolveTrnGlbSceneNodeIcon,
  trnGlbSceneTreeRowClass,
} from "./trnGlbSceneTreeChrome.js";

export type TRNGlbSceneTreeProps = {
  /** Root nodes — build with {@link buildTrnGlbSceneTree}. */
  nodes: readonly TrnGlbSceneNode[];
  /** Resets expansion when the loaded model changes. */
  treeKey?: string;
  selectedNodeId?: string | null;
  /** Convenience for mesh-binding panels (`TrnGlbSceneNode.meshName`). */
  selectedMeshName?: string | null;
  onSelectNode?: (node: TrnGlbSceneNode) => void;
  onSelectMeshName?: (meshName: string) => void;
  onHoverNode?: (node: TrnGlbSceneNode | null) => void;
  isNodeSelectable?: (node: TrnGlbSceneNode) => boolean;
  showExpandToolbar?: boolean;
  className?: string;
  scrollClassName?: string;
  ariaLabel?: string;
  emptyState?: ReactNode;
};

type SceneTreeNodeRowProps = {
  node: TrnGlbSceneNode;
  depth: number;
  expandedIds: ReadonlySet<string>;
  selectedNodeId: string | null | undefined;
  selectedMeshName: string | null | undefined;
  isNodeSelectable: (node: TrnGlbSceneNode) => boolean;
  onToggleExpand: (nodeId: string) => void;
  onSelectNode?: (node: TrnGlbSceneNode) => void;
  onSelectMeshName?: (meshName: string) => void;
  onHoverNode?: (node: TrnGlbSceneNode | null) => void;
};

function SceneTreeNodeRow(props: SceneTreeNodeRowProps)
{
  const {
    node,
    depth,
    expandedIds,
    selectedNodeId,
    selectedMeshName,
    isNodeSelectable,
    onToggleExpand,
    onSelectNode,
    onSelectMeshName,
    onHoverNode,
  } = props;

  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const selectable = isNodeSelectable(node);
  const selected = selectable && isTrnGlbSceneNodeSelected(node, selectedNodeId, selectedMeshName);
  const NodeIcon = resolveTrnGlbSceneNodeIcon(node);

  const handleSelect = () =>
  {
    if (!selectable)
    {
      return;
    }
    onSelectNode?.(node);
    if (node.meshName != null)
    {
      onSelectMeshName?.(node.meshName);
    }
  };

  return (
    <>
      <div className="min-w-0" style={{ paddingLeft: depth * 10 }}>
        <div className="flex min-w-0 items-stretch gap-0.5">
          {hasChildren ? (
            <button
              type="button"
              className="flex size-5 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200"
              aria-label={expanded ? "Collapse" : "Expand"}
              onClick={() => onToggleExpand(node.id)}
            >
              {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            </button>
          ) : (
            <span className="size-5 shrink-0" aria-hidden />
          )}

          {selectable ? (
            <button
              type="button"
              className={trnGlbSceneTreeRowClass(selected, true)}
              onClick={handleSelect}
              onMouseEnter={() => onHoverNode?.(node)}
              onMouseLeave={() => onHoverNode?.(null)}
            >
              <NodeIcon className="size-3 shrink-0 text-zinc-500" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{node.name}</span>
            </button>
          ) : (
            <div className={trnGlbSceneTreeRowClass(false, false)}>
              <NodeIcon
                className={
                  "size-3 shrink-0 "
                  + (node.kind === "mesh" ? "text-zinc-600" : "text-zinc-500")
                }
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{node.name}</span>
            </div>
          )}
        </div>
      </div>

      {hasChildren && expanded
        ? node.children.map((child) => (
            <SceneTreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedNodeId={selectedNodeId}
              selectedMeshName={selectedMeshName}
              isNodeSelectable={isNodeSelectable}
              onToggleExpand={onToggleExpand}
              onSelectNode={onSelectNode}
              onSelectMeshName={onSelectMeshName}
              onHoverNode={onHoverNode}
            />
          ))
        : null}
    </>
  );
}

/** Collapsible scene-graph explorer for GLB / Three.js models. */
export function TRNGlbSceneTree(props: TRNGlbSceneTreeProps)
{
  const {
    nodes,
    treeKey,
    selectedNodeId = null,
    selectedMeshName = null,
    onSelectNode,
    onSelectMeshName,
    onHoverNode,
    isNodeSelectable = isTrnGlbSceneMeshSelectable,
    showExpandToolbar = true,
    className,
    scrollClassName,
    ariaLabel = "Model outline",
    emptyState = null,
  } = props;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  useEffect(() =>
  {
    setExpandedIds(new Set(collectTrnGlbSceneExpandableIds(nodes)));
  }, [nodes, treeKey]);

  const toggleExpand = useCallback((nodeId: string) =>
  {
    setExpandedIds((prev) =>
    {
      const next = new Set(prev);
      if (next.has(nodeId))
      {
        next.delete(nodeId);
      }
      else
      {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() =>
  {
    setExpandedIds(new Set(collectTrnGlbSceneExpandableIds(nodes)));
  }, [nodes]);

  const collapseAll = useCallback(() =>
  {
    setExpandedIds(new Set());
  }, []);

  if (nodes.length === 0)
  {
    return emptyState;
  }

  return (
    <div className={twMerge("min-w-0", className)}>
      {showExpandToolbar ? (
        <div className="mb-1 flex items-center justify-end gap-1">
          <TRNButton
            type="button"
            size="compact"
            className="px-2 text-[10px]"
            hint="Expand every branch in the scene hierarchy."
            onClick={expandAll}
          >
            Expand all
          </TRNButton>
          <TRNButton
            type="button"
            size="compact"
            className="px-2 text-[10px]"
            hint="Collapse to root nodes only."
            onClick={collapseAll}
          >
            Collapse all
          </TRNButton>
        </div>
      ) : null}
      <TRNMenuScrollRegion
        className={twMerge("max-h-48 rounded-md", scrollClassName)}
        role="tree"
        aria-label={ariaLabel}
      >
        <div className="space-y-px p-1">
          {nodes.map((node) => (
            <SceneTreeNodeRow
              key={node.id}
              node={node}
              depth={0}
              expandedIds={expandedIds}
              selectedNodeId={selectedNodeId}
              selectedMeshName={selectedMeshName}
              isNodeSelectable={isNodeSelectable}
              onToggleExpand={toggleExpand}
              onSelectNode={onSelectNode}
              onSelectMeshName={onSelectMeshName}
              onHoverNode={onHoverNode}
            />
          ))}
        </div>
      </TRNMenuScrollRegion>
    </div>
  );
}
