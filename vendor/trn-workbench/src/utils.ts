import type { CollapseEdge, LayoutNode } from './types';
import type { TabsPaneNode } from './layoutTraversal';
import type { PaneDockZone } from './paneDock';
import { v4 as uuidv4 } from 'uuid';
import { createEditorPane } from './layoutBuilders';
import {
  countEditorPanes,
  collectEditorPanes,
  findEditorPane,
  mapLayout,
  removeEditorPane,
  replaceEditorPane,
} from './layoutTraversal';

export type EditorLayoutNode = Extract<LayoutNode, { type: 'editor' }>;

export const findEditorNode = findEditorPane;

export function isCollapsedEditor(node: LayoutNode): node is Extract<LayoutNode, { type: 'editor' }> {
  return node.type === 'editor' && node.collapsed === true;
}

export function collapseEdgeForSplitChild(
  direction: 'horizontal' | 'vertical',
  which: 'first' | 'second',
): CollapseEdge {
  if (direction === 'horizontal') return which === 'first' ? 'left' : 'right';
  return which === 'first' ? 'top' : 'bottom';
}

export type EditorParentSplit = {
  splitId: string;
  which: 'first' | 'second';
  ratio: number;
};

export function findParentTabsOfEditor(
  node: LayoutNode,
  editorId: string,
  parentTabs: TabsPaneNode | null = null,
): TabsPaneNode | null {
  if (node.type === 'tabs') {
    if (node.panes.some((p) => p.id === editorId)) return node;
    return null;
  }
  if (node.type === 'editor') {
    return parentTabs;
  }
  if (node.type === 'split') {
    return (
      findParentTabsOfEditor(node.first, editorId, parentTabs) ??
      findParentTabsOfEditor(node.second, editorId, parentTabs)
    );
  }
  return null;
}

export function setTabsActiveIndex(
  root: LayoutNode,
  tabsId: string,
  activeIndex: number,
): LayoutNode {
  return mapLayout(root, (node) => {
    if (node.type === 'tabs' && node.id === tabsId) {
      const idx = Math.max(0, Math.min(activeIndex, node.panes.length - 1));
      return { ...node, activeIndex: idx };
    }
    return node;
  });
}

export function findParentSplitOfEditor(
  node: LayoutNode,
  editorId: string,
  parent: Extract<LayoutNode, { type: 'split' }> | null = null,
  which: 'first' | 'second' | null = null,
): (EditorParentSplit & { parent: Extract<LayoutNode, { type: 'split' }> }) | null {
  if (node.type === 'editor' && node.id === editorId && parent && which) {
    return { splitId: parent.id, which, ratio: parent.ratio, parent };
  }
  if (node.type === 'tabs') {
    for (const pane of node.panes) {
      const found = findParentSplitOfEditor(pane, editorId, parent, which);
      if (found) return found;
    }
    return null;
  }
  if (node.type === 'split') {
    return (
      findParentSplitOfEditor(node.first, editorId, node, 'first') ??
      findParentSplitOfEditor(node.second, editorId, node, 'second')
    );
  }
  return null;
}

function setEditorExpandedRatio(
  node: LayoutNode,
  editorId: string,
  ratio: number,
): LayoutNode {
  if (node.type === 'editor' && node.id === editorId) {
    return { ...node, expandedRatio: ratio };
  }
  if (node.type === 'tabs') {
    return {
      ...node,
      panes: node.panes.map((p) => setEditorExpandedRatio(p, editorId, ratio) as EditorLayoutNode),
    };
  }
  if (node.type === 'split') {
    return {
      ...node,
      first: setEditorExpandedRatio(node.first, editorId, ratio),
      second: setEditorExpandedRatio(node.second, editorId, ratio),
    };
  }
  return node;
}

function tagDirectEditorChildrenExpandedRatio(
  node: Extract<LayoutNode, { type: 'split' }>,
  ratio: number,
): Extract<LayoutNode, { type: 'split' }> {
  const tag = (child: LayoutNode): LayoutNode => {
    if (child.type === 'editor') return { ...child, expandedRatio: ratio };
    return child;
  };
  return { ...node, ratio, first: tag(node.first), second: tag(node.second) };
}

export function collectCollapsedEditorIds(node: LayoutNode): string[] {
  if (node.type === 'editor') {
    return node.collapsed ? [node.id] : [];
  }
  if (node.type === 'tabs') {
    return node.panes.flatMap((p) => collectCollapsedEditorIds(p));
  }
  return [
    ...collectCollapsedEditorIds(node.first),
    ...collectCollapsedEditorIds(node.second),
  ];
}

export const setNodeCollapsed = (
  node: LayoutNode,
  targetId: string,
  collapsed: boolean,
  collapseEdge?: CollapseEdge,
): LayoutNode => {
  if (node.id === targetId && node.type === 'editor') {
    if (!collapsed) {
      const { collapsed: _removed, ...rest } = node;
      return rest;
    }
    return {
      ...node,
      collapsed: true,
      collapseEdge: collapseEdge ?? node.collapseEdge,
    };
  }
  if (node.type === 'tabs') {
    return {
      ...node,
      panes: node.panes.map((p) =>
        setNodeCollapsed(p, targetId, collapsed, collapseEdge) as EditorLayoutNode,
      ),
    };
  }
  if (node.type === 'split') {
    const edgeFirst = collapseEdgeForSplitChild(node.direction, 'first');
    const edgeSecond = collapseEdgeForSplitChild(node.direction, 'second');
    return {
      ...node,
      first: setNodeCollapsed(
        node.first,
        targetId,
        collapsed,
        node.first.id === targetId ? edgeFirst : collapseEdge,
      ),
      second: setNodeCollapsed(
        node.second,
        targetId,
        collapsed,
        node.second.id === targetId ? edgeSecond : collapseEdge,
      ),
    };
  }
  return node;
};

/** Collapse pane and remember parent split ratio for restore on expand. */
export function collapseEditorPane(root: LayoutNode, targetId: string): LayoutNode {
  const parent = findParentSplitOfEditor(root, targetId);
  let next = setNodeCollapsed(root, targetId, true);
  if (parent) {
    next = setEditorExpandedRatio(next, targetId, parent.ratio);
  }
  return next;
}

/** Expand pane and restore parent split ratio when `expandedRatio` was saved. */
export function expandEditorPane(root: LayoutNode, targetId: string): LayoutNode {
  const editor = findEditorNode(root, targetId);
  const parent = findParentSplitOfEditor(root, targetId);
  let next = setNodeCollapsed(root, targetId, false);
  const saved = editor?.expandedRatio;
  if (parent && typeof saved === 'number' && Number.isFinite(saved)) {
    next = updateNodeRatioAndSyncEditors(next, parent.splitId, saved);
  }
  return next;
}

export function reorderCollapsedInSplit(
  root: LayoutNode,
  splitId: string,
  orderedPaneIds: string[],
): LayoutNode {
  if (root.type === 'split' && root.id === splitId) {
    if (!isCollapsedEditor(root.first) || !isCollapsedEditor(root.second)) {
      return root;
    }
    if (orderedPaneIds.length < 2) return root;
    const byId: Record<string, Extract<LayoutNode, { type: 'editor' }>> = {
      [root.first.id]: root.first,
      [root.second.id]: root.second,
    };
    const first = byId[orderedPaneIds[0]];
    const second = byId[orderedPaneIds[1]];
    if (!first || !second) return root;
    return { ...root, first, second };
  }
  if (root.type === 'split') {
    return {
      ...root,
      first: reorderCollapsedInSplit(root.first, splitId, orderedPaneIds),
      second: reorderCollapsedInSplit(root.second, splitId, orderedPaneIds),
    };
  }
  return root;
}

export const updateNodeRatio = (node: LayoutNode, targetId: string, ratio: number): LayoutNode => {
  const clamped = Math.max(0.05, Math.min(0.95, ratio));
  if (node.id === targetId && node.type === 'split') {
    return tagDirectEditorChildrenExpandedRatio({ ...node, ratio: clamped }, clamped);
  }
  if (node.type === 'split') {
    return {
      ...node,
      first: updateNodeRatio(node.first, targetId, clamped),
      second: updateNodeRatio(node.second, targetId, clamped),
    };
  }
  return node;
};

/** Resize split and sync `expandedRatio` on direct editor children for collapse restore. */
export function updateNodeRatioAndSyncEditors(
  node: LayoutNode,
  targetId: string,
  ratio: number,
): LayoutNode {
  return updateNodeRatio(node, targetId, ratio);
};

/** Split an editor pane; the new pane uses `newEditorType` (defaults to duplicating the target). */
export const splitNodeWithEditor = (
  node: LayoutNode,
  targetId: string,
  direction: 'horizontal' | 'vertical',
  newEditorType: string,
  ratio = 0.55,
): LayoutNode => {
  if (node.id === targetId && node.type === 'editor') {
    return {
      id: uuidv4(),
      type: 'split',
      direction,
      ratio,
      first: { ...node },
      second: { id: uuidv4(), type: 'editor', editorType: newEditorType },
    };
  }
  if (node.type === 'tabs') {
    return {
      ...node,
      panes: node.panes.map((p) =>
        splitNodeWithEditor(p, targetId, direction, newEditorType, ratio) as EditorLayoutNode,
      ),
    };
  }
  if (node.type === 'split') {
    return {
      ...node,
      first: splitNodeWithEditor(node.first, targetId, direction, newEditorType, ratio),
      second: splitNodeWithEditor(node.second, targetId, direction, newEditorType, ratio),
    };
  }
  return node;
};

export function findEditorPaneId(node: LayoutNode, editorType: string): string | null {
  if (node.type === 'editor') {
    return node.editorType === editorType ? node.id : null;
  }
  if (node.type === 'tabs') {
    for (const pane of node.panes) {
      const id = findEditorPaneId(pane, editorType);
      if (id) return id;
    }
    return null;
  }
  return (
    findEditorPaneId(node.first, editorType) ?? findEditorPaneId(node.second, editorType)
  );
}

/** Editor types already used by other panes — hide from the pane-type menu on `currentPaneId`. */
export function getHiddenSingletonEditorTypes(
  layout: LayoutNode,
  currentPaneId: string,
  singletonEditorTypes: readonly string[] | undefined,
): readonly string[] {
  if (!singletonEditorTypes?.length) return [];
  const singletonSet = new Set(singletonEditorTypes);
  const hidden: string[] = [];
  for (const pane of collectEditorPanes(layout)) {
    if (pane.id === currentPaneId) continue;
    if (singletonSet.has(pane.editorType)) {
      hidden.push(pane.editorType);
    }
  }
  return hidden;
}

/**
 * Types that must not appear in a **Split → Open pane** menu (singletons already
 * present anywhere in the layout, including the source pane).
 */
export function getSplitMenuHiddenEditorTypes(
  layout: LayoutNode,
  singletonEditorTypes: readonly string[] | undefined,
): readonly string[] {
  if (!singletonEditorTypes?.length) return [];
  const present = new Set(
    collectEditorPanes(layout).map((pane) => pane.editorType),
  );
  return singletonEditorTypes.filter((editorType) => present.has(editorType));
}

export function isSingletonEditorTypeBlocked(
  layout: LayoutNode,
  targetPaneId: string,
  editorType: string,
  singletonEditorTypes: readonly string[] | undefined,
): boolean {
  if (!singletonEditorTypes?.includes(editorType)) return false;
  for (const pane of collectEditorPanes(layout)) {
    if (pane.id === targetPaneId) continue;
    if (pane.editorType === editorType) return true;
  }
  return false;
}

export function isSingletonEditorPane(
  editorType: string,
  singletonEditorTypes: readonly string[] | undefined,
): boolean {
  return singletonEditorTypes?.includes(editorType) ?? false;
}

export const splitNode = (node: LayoutNode, targetId: string, direction: 'horizontal' | 'vertical'): LayoutNode => {
  if (node.id === targetId && node.type === 'editor') {
    return {
      id: uuidv4(),
      type: 'split',
      direction,
      ratio: 0.5,
      first: { ...node },
      second: { id: uuidv4(), type: 'editor', editorType: node.editorType },
    };
  }
  if (node.type === 'tabs') {
    return {
      ...node,
      panes: node.panes.map((p) => splitNode(p, targetId, direction) as EditorLayoutNode),
    };
  }
  if (node.type === 'split') {
    return {
      ...node,
      first: splitNode(node.first, targetId, direction),
      second: splitNode(node.second, targetId, direction),
    };
  }
  return node;
};

export const closeNode = (node: LayoutNode, targetId: string): LayoutNode => {
  if (node.type === 'tabs') {
    if (node.panes.some((p) => p.id === targetId)) {
      const next = removeEditorPane(node, targetId);
      return next ?? node;
    }
    return node;
  }
  if (node.type === 'split') {
    if (node.first.id === targetId) return node.second;
    if (node.second.id === targetId) return node.first;

    return {
      ...node,
      first: closeNode(node.first, targetId),
      second: closeNode(node.second, targetId),
    };
  }
  return node;
};

export const changeNodeType = (node: LayoutNode, targetId: string, editorType: string): LayoutNode => {
  if (node.id === targetId && node.type === 'editor') {
    return { ...node, editorType };
  }
  if (node.type === 'tabs') {
    return {
      ...node,
      panes: node.panes.map((p) =>
        p.id === targetId ? { ...p, editorType } : p,
      ),
    };
  }
  if (node.type === 'split') {
    return {
      ...node,
      first: changeNodeType(node.first, targetId, editorType),
      second: changeNodeType(node.second, targetId, editorType),
    };
  }
  return node;
};

export { countEditorPanes, removeEditorPane };

/** Detach a pane from the layout tree for docking elsewhere. */
export function extractEditorPane(
  root: LayoutNode,
  paneId: string,
): { layout: LayoutNode; editor: EditorLayoutNode | null } {
  const editor = findEditorNode(root, paneId);
  if (!editor) return { layout: root, editor: null };

  const layout = removeEditorPane(root, paneId);
  if (!layout) return { layout: root, editor: null };

  const { collapsed: _c, collapseEdge: _e, ...rest } = editor;
  return { layout, editor: rest as EditorLayoutNode };
}

function addEditorToTabs(
  node: LayoutNode,
  tabsId: string,
  editor: EditorLayoutNode,
): LayoutNode {
  return mapLayout(node, (n) => {
    if (n.type === 'tabs' && n.id === tabsId) {
      return {
        ...n,
        panes: [...n.panes, editor],
        activeIndex: n.panes.length,
      };
    }
    return n;
  });
}

function insertDockedEditor(
  node: LayoutNode,
  targetId: string,
  zone: PaneDockZone,
  editor: EditorLayoutNode,
  ratio: number,
): LayoutNode {
  if (node.type === 'editor' && node.id === targetId) {
    const target = { ...node };
    const incoming: EditorLayoutNode = { ...editor, id: editor.id };

    if (zone === 'center') {
      return {
        id: uuidv4(),
        type: 'tabs',
        activeIndex: 1,
        panes: [target, incoming],
      };
    }

    switch (zone) {
      case 'bottom':
        return {
          id: uuidv4(),
          type: 'split',
          direction: 'vertical',
          ratio,
          first: target,
          second: incoming,
        };
      case 'top':
        return {
          id: uuidv4(),
          type: 'split',
          direction: 'vertical',
          ratio,
          first: incoming,
          second: target,
        };
      case 'right':
        return {
          id: uuidv4(),
          type: 'split',
          direction: 'horizontal',
          ratio,
          first: target,
          second: incoming,
        };
      case 'left':
        return {
          id: uuidv4(),
          type: 'split',
          direction: 'horizontal',
          ratio,
          first: incoming,
          second: target,
        };
    }
  }

  if (node.type === 'tabs') {
    for (const pane of node.panes) {
      if (pane.id === targetId) {
        const replacement = insertDockedEditor(pane, targetId, zone, editor, ratio);
        if (replacement !== pane) {
          return replaceEditorPane(node, targetId, replacement);
        }
      }
    }
    return node;
  }

  if (node.type === 'split') {
    return {
      ...node,
      first: insertDockedEditor(node.first, targetId, zone, editor, ratio),
      second: insertDockedEditor(node.second, targetId, zone, editor, ratio),
    };
  }

  return node;
}

export function countEditorPanesOfType(root: LayoutNode, editorType: string): number {
  return collectEditorPanes(root).filter((pane) => pane.editorType === editorType).length;
}

/**
 * Whether a docked pane may be closed.
 * - Never close the last pane in the workbench.
 * - Never close the last instance of a required editor type (viewport policy VP-2).
 */
export function canCloseEditorPane(
  root: LayoutNode,
  paneId: string,
  requiredEditorTypes?: readonly string[],
): boolean {
  if (countEditorPanes(root) <= 1) return false;
  const editor = findEditorNode(root, paneId);
  if (editor == null) return false;
  if (
    requiredEditorTypes != null &&
    requiredEditorTypes.includes(editor.editorType) &&
    countEditorPanesOfType(root, editor.editorType) <= 1
  ) {
    return false;
  }
  return true;
}

/**
 * Ensure each required editor type appears exactly once in the docked layout.
 * Extra instances are closed (first kept). Missing types are split beside the first pane.
 */
export function coerceRequiredEditorTypes(
  layout: LayoutNode,
  requiredEditorTypes: readonly string[] | undefined,
): LayoutNode {
  if (requiredEditorTypes == null || requiredEditorTypes.length === 0) {
    return layout;
  }

  let next = layout;
  for (const editorType of requiredEditorTypes) {
    const panes = collectEditorPanes(next).filter((pane) => pane.editorType === editorType);
    if (panes.length > 1) {
      for (const extra of panes.slice(1)) {
        next = closeNode(next, extra.id);
      }
      continue;
    }
    if (panes.length === 0) {
      const anchor = collectEditorPanes(next)[0];
      if (anchor == null) {
        next = createEditorPane(editorType);
        continue;
      }
      // New required viewport becomes the large primary leaf (first / higher ratio).
      next = splitNodeWithEditor(next, anchor.id, "horizontal", editorType, 0.62);
      const added = collectEditorPanes(next).filter((pane) => pane.editorType === editorType);
      if (added.length === 1) {
        // Prefer the new viewport as `first` with more space — rebuild local split if needed.
        next = promoteEditorPaneAsPrimary(next, added[0]!.id, 0.62);
      }
    }
  }
  return next;
}

/** Move an editor pane to be the primary (first) child of its parent split when possible. */
function promoteEditorPaneAsPrimary(
  root: LayoutNode,
  paneId: string,
  ratio: number,
): LayoutNode {
  if (root.type === "split") {
    if (root.second.id === paneId && root.second.type === "editor") {
      return {
        ...root,
        ratio,
        first: root.second,
        second: root.first,
      };
    }
    if (root.first.id === paneId && root.first.type === "editor") {
      return { ...root, ratio };
    }
    return {
      ...root,
      first: promoteEditorPaneAsPrimary(root.first, paneId, ratio),
      second: promoteEditorPaneAsPrimary(root.second, paneId, ratio),
    };
  }
  if (root.type === "tabs") {
    return root;
  }
  return root;
}

export function isRequiredEditorPane(
  editorType: string,
  requiredEditorTypes: readonly string[] | undefined,
): boolean {
  return requiredEditorTypes?.includes(editorType) ?? false;
}

export function dockEditorPane(
  root: LayoutNode,
  sourcePaneId: string,
  targetPaneId: string,
  zone: PaneDockZone,
  ratio = 0.55,
): LayoutNode | null {
  if (sourcePaneId === targetPaneId) return null;

  const { layout, editor } = extractEditorPane(root, sourcePaneId);
  if (!editor) return null;

  const target = findEditorNode(layout, targetPaneId);
  if (!target || target.collapsed) return null;

  if (zone === 'center') {
    const parentTabs = findParentTabsOfEditor(layout, targetPaneId);
    if (parentTabs) {
      return addEditorToTabs(layout, parentTabs.id, editor);
    }
  }

  return insertDockedEditor(layout, targetPaneId, zone, editor, ratio);
}

/** Dock a pane that is not in `layout` (e.g. floating window) into the tree. */
export function dockExtractedEditorPane(
  layout: LayoutNode,
  editor: EditorLayoutNode,
  targetPaneId: string,
  zone: PaneDockZone,
  ratio = 0.55,
): LayoutNode | null {
  const target = findEditorNode(layout, targetPaneId);
  if (!target || target.collapsed) return null;

  const incoming: EditorLayoutNode = { ...editor, id: editor.id };

  if (zone === 'center') {
    const parentTabs = findParentTabsOfEditor(layout, targetPaneId);
    if (parentTabs) {
      return addEditorToTabs(layout, parentTabs.id, incoming);
    }
  }

  return insertDockedEditor(layout, targetPaneId, zone, incoming, ratio);
}

export const WORKBENCH_EDGE_DOCK_RATIO: Record<
  Exclude<PaneDockZone, 'center'>,
  number
> = {
  left: 0.22,
  right: 0.78,
  top: 0.28,
  bottom: 0.72,
};

/**
 * Dock a pane on the outer edge of the entire workbench (new root split).
 * Used by the global drop overlay when the pointer is in the workbench margin.
 */
export function dockEditorPaneAtWorkbenchEdge(
  root: LayoutNode,
  sourcePaneId: string,
  zone: Exclude<PaneDockZone, 'center'>,
  ratio = WORKBENCH_EDGE_DOCK_RATIO[zone],
): LayoutNode | null {
  const { layout, editor } = extractEditorPane(root, sourcePaneId);
  if (!editor || !layout) return null;

  const incoming: EditorLayoutNode = { ...editor, id: editor.id };
  const clamped = Math.max(0.05, Math.min(0.95, ratio));

  switch (zone) {
    case 'left':
      return {
        id: uuidv4(),
        type: 'split',
        direction: 'horizontal',
        ratio: clamped,
        first: incoming,
        second: layout,
      };
    case 'right':
      return {
        id: uuidv4(),
        type: 'split',
        direction: 'horizontal',
        ratio: clamped,
        first: layout,
        second: incoming,
      };
    case 'top':
      return {
        id: uuidv4(),
        type: 'split',
        direction: 'vertical',
        ratio: clamped,
        first: incoming,
        second: layout,
      };
    case 'bottom':
      return {
        id: uuidv4(),
        type: 'split',
        direction: 'vertical',
        ratio: clamped,
        first: layout,
        second: incoming,
      };
  }
}

/** Dock a floating pane onto the outer workbench edge. */
export function dockExtractedEditorAtWorkbenchEdge(
  layout: LayoutNode,
  editor: EditorLayoutNode,
  zone: Exclude<PaneDockZone, 'center'>,
  ratio = WORKBENCH_EDGE_DOCK_RATIO[zone],
): LayoutNode {
  const incoming: EditorLayoutNode = { ...editor, id: editor.id };
  const clamped = Math.max(0.05, Math.min(0.95, ratio));

  switch (zone) {
    case 'left':
      return {
        id: uuidv4(),
        type: 'split',
        direction: 'horizontal',
        ratio: clamped,
        first: incoming,
        second: layout,
      };
    case 'right':
      return {
        id: uuidv4(),
        type: 'split',
        direction: 'horizontal',
        ratio: clamped,
        first: layout,
        second: incoming,
      };
    case 'top':
      return {
        id: uuidv4(),
        type: 'split',
        direction: 'vertical',
        ratio: clamped,
        first: incoming,
        second: layout,
      };
    case 'bottom':
      return {
        id: uuidv4(),
        type: 'split',
        direction: 'vertical',
        ratio: clamped,
        first: layout,
        second: incoming,
      };
  }
}
