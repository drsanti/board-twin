import { useCallback, useState, type RefObject } from 'react';
import type { FloatingWorkbenchPane } from './floatingTypes';
import type { LayoutNode } from './types';
import type { TRNWorkbenchHandle, TRNWorkbenchProps } from './TRNWorkbench';
import {
  applyFloatDockRestore,
  captureFloatDockRestore,
  floatingPaneAsEditor,
  type FloatDockBackResult,
} from './floatDockRestore';
import {
  canCloseEditorPane,
  findEditorNode,
  type EditorLayoutNode,
} from './utils';
import { removeEditorPane } from './layoutTraversal';
import {
  DEFAULT_FLOAT_PANE_HEIGHT,
  DEFAULT_FLOAT_PANE_WIDTH,
  clampFloatPosition,
  floatPanePositionFromPointer,
} from './workbenchFloat';

export interface UseWorkbenchFloatingOptions {
  layout: LayoutNode;
  onLayoutChange: (layout: LayoutNode) => void;
  /** When false, floating APIs no-op (workbench-only mode). */
  enabled?: boolean;
  onDetachRejected?: () => void;
  /** Fired after Dock-back (exact restore, fallback slot, or failure). */
  onDockBackResult?: (result: FloatDockBackResult) => void;
  /** Required panes cannot detach to float when they are the sole instance. */
  requiredEditorTypes?: readonly string[];
}

export interface WorkbenchFloatingBindings {
  floatingPanes: FloatingWorkbenchPane[];
  frontPaneId: string | null;
  activePaneId: string | null;
  setActivePaneId: (paneId: string | null) => void;
  detachPaneToFloat: (paneId: string, clientX: number, clientY: number) => void;
  closeFloatingPane: (paneId: string) => void;
  clearAllFloatingPanes: () => void;
  moveFloatingPane: (paneId: string, x: number, y: number) => void;
  resizeFloatingPane: (paneId: string, width: number, height: number) => void;
  focusFloatingPane: (paneId: string) => void;
  getFloatingEditor: (paneId: string) => EditorLayoutNode | null;
  dockFloatingPane: (paneId: string, nextLayout: LayoutNode) => void;
  /** Dock float back beside its previous sibling (or fallback). */
  redockFloatingPaneToPrevious: (paneId: string) => FloatDockBackResult;
  /** Spread onto {@link TRNWorkbench} together with layout/registry/onLayoutChange. */
  workbenchProps: Pick<
    TRNWorkbenchProps,
    | 'canDetachPane'
    | 'onDetachToFloat'
    | 'getFloatingEditor'
    | 'onFloatingPaneDocked'
    | 'onPaneActivate'
  >;
  /** Props for {@link FloatingWorkbenchLayer} (registry + ref passed separately). */
  layerProps: (workbenchRef: RefObject<TRNWorkbenchHandle | null>) => {
    panes: FloatingWorkbenchPane[];
    frontPaneId: string | null;
    onFocusPane: (paneId: string) => void;
    onClosePane: (paneId: string) => void;
    onMovePane: (paneId: string, x: number, y: number) => void;
    onResizePane: (paneId: string, width: number, height: number) => void;
    onDockDragStart: (paneId: string) => void;
    onDockBack: (paneId: string) => void;
  };
}

export function useWorkbenchFloating({
  layout,
  onLayoutChange,
  enabled = true,
  onDetachRejected,
  onDockBackResult,
  requiredEditorTypes,
}: UseWorkbenchFloatingOptions): WorkbenchFloatingBindings {
  const [floatingPanes, setFloatingPanes] = useState<FloatingWorkbenchPane[]>([]);
  const [frontPaneId, setFrontPaneId] = useState<string | null>(null);
  const [activePaneId, setActivePaneId] = useState<string | null>(null);

  const detachPaneToFloat = useCallback(
    (paneId: string, clientX: number, clientY: number) => {
      if (!enabled) return;
      if (!canCloseEditorPane(layout, paneId, requiredEditorTypes)) {
        onDetachRejected?.();
        return;
      }
      const editor = findEditorNode(layout, paneId);
      if (!editor) return;
      const dockRestore = captureFloatDockRestore(layout, paneId);
      const nextLayout = removeEditorPane(layout, paneId);
      if (!nextLayout) return;
      const pos = floatPanePositionFromPointer(clientX, clientY);
      const floating: FloatingWorkbenchPane = {
        id: editor.id,
        editorType: editor.editorType,
        x: pos.x,
        y: pos.y,
        width: DEFAULT_FLOAT_PANE_WIDTH,
        height: DEFAULT_FLOAT_PANE_HEIGHT,
        dockRestore,
      };
      // Float list first so keep-alive sticky + floatingEditors see the pane before layout drops it.
      setFloatingPanes((prev) => [...prev, floating]);
      setFrontPaneId(floating.id);
      setActivePaneId(null);
      onLayoutChange(nextLayout);
    },
    [enabled, layout, onDetachRejected, onLayoutChange, requiredEditorTypes],
  );

  const closeFloatingPane = useCallback((paneId: string) => {
    setFloatingPanes((prev) => {
      const next = prev.filter((p) => p.id !== paneId);
      setFrontPaneId((front) => (front === paneId ? next[0]?.id ?? null : front));
      return next;
    });
  }, []);

  const moveFloatingPane = useCallback((paneId: string, x: number, y: number) => {
    setFloatingPanes((prev) =>
      prev.map((p) => {
        if (p.id !== paneId) return p;
        const next = clampFloatPosition(x, y, p.width, p.height);
        return { ...p, x: next.x, y: next.y };
      }),
    );
  }, []);

  const resizeFloatingPane = useCallback((paneId: string, width: number, height: number) => {
    setFloatingPanes((prev) =>
      prev.map((p) => (p.id === paneId ? { ...p, width, height } : p)),
    );
  }, []);

  const focusFloatingPane = useCallback((paneId: string) => {
    setFrontPaneId(paneId);
  }, []);

  const getFloatingEditor = useCallback(
    (paneId: string): EditorLayoutNode | null => {
      const pane = floatingPanes.find((p) => p.id === paneId);
      if (!pane) return null;
      return { id: pane.id, type: 'editor', editorType: pane.editorType };
    },
    [floatingPanes],
  );

  const dockFloatingPane = useCallback(
    (paneId: string, nextLayout: LayoutNode) => {
      // Layout first so keep-alive sees the docked pane before float list drops it.
      onLayoutChange(nextLayout);
      setFloatingPanes((prev) => prev.filter((p) => p.id !== paneId));
      setFrontPaneId((front) => (front === paneId ? null : front));
      setActivePaneId(paneId);
    },
    [onLayoutChange],
  );

  const redockFloatingPaneToPrevious = useCallback(
    (paneId: string): FloatDockBackResult => {
      if (!enabled) {
        const result: FloatDockBackResult = { ok: false, reason: 'disabled' };
        onDockBackResult?.(result);
        return result;
      }
      const pane = floatingPanes.find((p) => p.id === paneId);
      if (pane == null) {
        const result: FloatDockBackResult = { ok: false, reason: 'missing' };
        onDockBackResult?.(result);
        return result;
      }
      if (findEditorNode(layout, pane.id) != null) {
        const result: FloatDockBackResult = { ok: false, reason: 'already-docked' };
        onDockBackResult?.(result);
        return result;
      }
      const applied = applyFloatDockRestore(
        layout,
        floatingPaneAsEditor(pane),
        pane.dockRestore,
      );
      if (applied == null) {
        const result: FloatDockBackResult = { ok: false, reason: 'failed' };
        onDockBackResult?.(result);
        return result;
      }
      dockFloatingPane(paneId, applied.layout);
      const result: FloatDockBackResult = { ok: true, mode: applied.mode };
      onDockBackResult?.(result);
      return result;
    },
    [dockFloatingPane, enabled, floatingPanes, layout, onDockBackResult],
  );

  const workbenchProps: WorkbenchFloatingBindings['workbenchProps'] = {
    onPaneActivate: setActivePaneId,
    canDetachPane: enabled
      ? (paneId) => canCloseEditorPane(layout, paneId, requiredEditorTypes)
      : undefined,
    onDetachToFloat: enabled ? detachPaneToFloat : undefined,
    getFloatingEditor: enabled ? getFloatingEditor : undefined,
    onFloatingPaneDocked: enabled ? dockFloatingPane : undefined,
  };

  const layerProps: WorkbenchFloatingBindings['layerProps'] = (workbenchRef) => ({
    panes: floatingPanes,
    frontPaneId,
    onFocusPane: focusFloatingPane,
    onClosePane: closeFloatingPane,
    onMovePane: moveFloatingPane,
    onResizePane: resizeFloatingPane,
    onDockDragStart: (paneId) => {
      const pane = floatingPanes.find((p) => p.id === paneId);
      if (!pane) return;
      workbenchRef.current?.startDockDrag(paneId, pane.editorType, { fromFloat: true });
    },
    onDockBack: (paneId) => {
      redockFloatingPaneToPrevious(paneId);
    },
  });

  const clearAllFloatingPanes = useCallback(() => {
    setFloatingPanes([]);
    setFrontPaneId(null);
  }, []);

  return {
    floatingPanes,
    frontPaneId,
    activePaneId,
    setActivePaneId,
    detachPaneToFloat,
    closeFloatingPane,
    clearAllFloatingPanes,
    moveFloatingPane,
    resizeFloatingPane,
    focusFloatingPane,
    getFloatingEditor,
    dockFloatingPane,
    redockFloatingPaneToPrevious,
    workbenchProps,
    layerProps,
  };
}
