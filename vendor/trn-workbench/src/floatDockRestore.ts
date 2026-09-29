/*******************************************************************************
 * File Name : floatDockRestore.ts
 *
 * Description : Capture / apply previous dock location when undocking a pane
 *               to a floating window so “Dock back” can restore it.
 *
 *******************************************************************************/

import type { FloatingWorkbenchPane } from './floatingTypes';
import type { LayoutNode } from './types';
import type { PaneDockZone } from './paneDock';
import { collectEditorPanes, mapLayout } from './layoutTraversal';
import {
  dockExtractedEditorPane,
  findEditorNode,
  findParentSplitOfEditor,
  findParentTabsOfEditor,
  type EditorLayoutNode,
} from './utils';

/** Where a pane sat in the tiling tree before it was floated. */
export type FloatDockRestoreV1 =
  | {
      kind: 'split';
      siblingId: string;
      side: 'first' | 'second';
      direction: 'horizontal' | 'vertical';
      ratio: number;
    }
  | {
      kind: 'tabs';
      tabsId: string;
      index: number;
      /** Other panes that shared the tab strip (survives collapse to a single editor). */
      peerIds: string[];
    };

/** Outcome of applying a float dock-back. */
export type FloatDockApplyResult = {
  layout: LayoutNode;
  /** `previous` = restore recipe used; `fallback` = beside first remaining pane; `solo` = became root. */
  mode: 'previous' | 'fallback' | 'solo';
};

export type FloatDockBackResult =
  | { ok: true; mode: FloatDockApplyResult['mode'] }
  | { ok: false; reason: 'disabled' | 'missing' | 'already-docked' | 'failed' };

export function captureFloatDockRestore(
  layout: LayoutNode,
  paneId: string,
): FloatDockRestoreV1 | null {
  const tabs = findParentTabsOfEditor(layout, paneId);
  if (tabs != null) {
    const index = tabs.panes.findIndex((p) => p.id === paneId);
    if (index < 0) {
      return null;
    }
    return {
      kind: 'tabs',
      tabsId: tabs.id,
      index,
      peerIds: tabs.panes.filter((p) => p.id !== paneId).map((p) => p.id),
    };
  }

  const split = findParentSplitOfEditor(layout, paneId);
  if (split == null) {
    return null;
  }

  const sibling = split.which === 'first' ? split.parent.second : split.parent.first;
  return {
    kind: 'split',
    siblingId: sibling.id,
    side: split.which,
    direction: split.parent.direction,
    ratio: split.parent.ratio,
  };
}

function findNodeById(node: LayoutNode, id: string): LayoutNode | null {
  if (node.id === id) {
    return node;
  }
  if (node.type === 'split') {
    return findNodeById(node.first, id) ?? findNodeById(node.second, id);
  }
  if (node.type === 'tabs') {
    return node.panes.find((p) => p.id === id) ?? null;
  }
  return null;
}

function zoneForSplitRestore(
  direction: 'horizontal' | 'vertical',
  side: 'first' | 'second',
): Exclude<PaneDockZone, 'center'> {
  if (direction === 'horizontal') {
    return side === 'first' ? 'left' : 'right';
  }
  return side === 'first' ? 'top' : 'bottom';
}

function insertIntoTabsAtIndex(
  layout: LayoutNode,
  tabsId: string,
  editor: EditorLayoutNode,
  index: number,
): LayoutNode | null {
  let applied = false;
  const next = mapLayout(layout, (node) => {
    if (node.type !== 'tabs' || node.id !== tabsId) {
      return node;
    }
    if (node.panes.some((p) => p.id === editor.id)) {
      applied = true;
      return node;
    }
    const panes = [...node.panes];
    const at = Math.max(0, Math.min(index, panes.length));
    panes.splice(at, 0, { ...editor });
    applied = true;
    return {
      ...node,
      panes,
      activeIndex: at,
    };
  });
  return applied ? next : null;
}

/**
 * Re-insert a floated editor into the layout near its previous dock slot.
 * Falls back to splitting beside the first remaining pane when the sibling is gone.
 */
export function applyFloatDockRestore(
  layout: LayoutNode,
  editor: EditorLayoutNode,
  restore: FloatDockRestoreV1 | null | undefined,
): FloatDockApplyResult | null {
  if (findEditorNode(layout, editor.id) != null) {
    return null;
  }

  if (restore?.kind === 'tabs') {
    const tabs = findNodeById(layout, restore.tabsId);
    if (tabs?.type === 'tabs') {
      const next = insertIntoTabsAtIndex(layout, restore.tabsId, editor, restore.index);
      if (next != null) {
        return { layout: next, mode: 'previous' };
      }
    }
    if (tabs?.type === 'editor') {
      const next = dockExtractedEditorPane(layout, editor, tabs.id, 'center', 0.55);
      if (next != null) {
        return { layout: next, mode: 'previous' };
      }
    }
    for (const peerId of restore.peerIds) {
      if (findEditorNode(layout, peerId) != null) {
        const next = dockExtractedEditorPane(layout, editor, peerId, 'center', 0.55);
        if (next != null) {
          return { layout: next, mode: 'previous' };
        }
      }
    }
  }

  if (restore?.kind === 'split') {
    const siblingNode = findNodeById(layout, restore.siblingId);
    const targetEditor =
      siblingNode?.type === 'editor'
        ? siblingNode
        : siblingNode != null
          ? collectEditorPanes(siblingNode)[0]
          : findEditorNode(layout, restore.siblingId);
    if (targetEditor != null) {
      const zone = zoneForSplitRestore(restore.direction, restore.side);
      const next = dockExtractedEditorPane(
        layout,
        editor,
        targetEditor.id,
        zone,
        restore.ratio,
      );
      if (next != null) {
        return { layout: next, mode: 'previous' };
      }
    }
  }

  const fallback = collectEditorPanes(layout)[0];
  if (fallback == null) {
    return { layout: { ...editor }, mode: 'solo' };
  }
  const next = dockExtractedEditorPane(layout, editor, fallback.id, 'right', 0.55);
  if (next == null) {
    return null;
  }
  return { layout: next, mode: 'fallback' };
}

export function floatingPaneAsEditor(
  pane: FloatingWorkbenchPane,
): EditorLayoutNode {
  return {
    id: pane.id,
    type: 'editor',
    editorType: pane.editorType,
  };
}
