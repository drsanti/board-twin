/*******************************************************************************
 * File Name : WorkbenchEditorKeepAlive.tsx
 *
 * Description : Keep editor React trees alive across layout reshape (split
 *               promote / demote). PaneFrame hosts a slot; a stable portal
 *               container is moved into the slot without remounting editors.
 *
 *******************************************************************************/

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import type { LayoutNode, WorkbenchRegistry } from './types';
import type { EditorPaneNode } from './layoutTraversal';
import { cn } from './cn';

type KeepAliveContextValue = {
  enabled: true;
  setSlot: (paneId: string, el: HTMLElement | null) => void;
};

const WorkbenchEditorKeepAliveContext = createContext<KeepAliveContextValue | null>(
  null,
);

export function useWorkbenchEditorKeepAlive(): KeepAliveContextValue | null {
  return useContext(WorkbenchEditorKeepAliveContext);
}

/**
 * Editors that should keep React identity across tiling reshape.
 * Tab groups only keep the **active** tab (inactive tabs unmount as today).
 * Collapsed editors are included (VP-5 — park off-slot, do not dispose).
 */
export function collectKeepAliveEditorPanes(node: LayoutNode): EditorPaneNode[] {
  if (node.type === 'editor') {
    return [node];
  }
  if (node.type === 'tabs') {
    if (node.panes.length === 0) {
      return [];
    }
    const idx = Math.max(0, Math.min(node.activeIndex, node.panes.length - 1));
    const active = node.panes[idx];
    return active != null ? [active] : [];
  }
  return [
    ...collectKeepAliveEditorPanes(node.first),
    ...collectKeepAliveEditorPanes(node.second),
  ];
}

function ensurePortalContainer(
  map: Map<string, HTMLDivElement>,
  paneId: string,
): HTMLDivElement {
  let el = map.get(paneId);
  if (el != null) {
    return el;
  }
  el = document.createElement('div');
  el.className = 'flex h-full min-h-0 w-full min-w-0 flex-1 flex-col';
  el.dataset.workbenchKeptEditor = paneId;
  map.set(paneId, el);
  return el;
}

export function WorkbenchEditorSlot(props: {
  paneId: string;
  className?: string;
}) {
  const { paneId, className } = props;
  const ctx = useWorkbenchEditorKeepAlive();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ctx == null) {
      return;
    }
    const el = ref.current;
    ctx.setSlot(paneId, el);
    return () => {
      ctx.setSlot(paneId, null);
    };
  }, [ctx, paneId]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden',
        className,
      )}
      data-workbench-editor-slot={paneId}
    />
  );
}

function WorkbenchKeptEditor(props: {
  paneId: string;
  editorType: string;
  registry: WorkbenchRegistry;
  slotsVersion: number;
  slotsRef: RefObject<Map<string, HTMLElement>>;
  parkingRef: RefObject<HTMLDivElement | null>;
  containersRef: RefObject<Map<string, HTMLDivElement>>;
}) {
  const {
    paneId,
    editorType,
    registry,
    slotsVersion,
    slotsRef,
    parkingRef,
    containersRef,
  } = props;

  const container = useMemo(() => {
    const map = containersRef.current;
    if (map == null) {
      throw new Error('Workbench keep-alive containers missing');
    }
    return ensurePortalContainer(map, paneId);
  }, [containersRef, paneId]);

  const info = registry[editorType];
  const Comp =
    info?.component ??
    (() => (
      <div className="p-5 text-tertiary">
        <HelpCircle size={14} className="mb-2 inline" aria-hidden />
        Editor not found
      </div>
    ));

  useLayoutEffect(() => {
    const parking = parkingRef.current;
    if (parking == null) {
      return;
    }
    const slot = slotsRef.current?.get(paneId);
    const target = slot ?? parking;
    if (container.parentElement !== target) {
      target.appendChild(container);
    }
    const parked = target === parking;
    container.toggleAttribute('data-workbench-editor-parked', parked);
    container.dataset.workbenchEditorType = editorType;
    if (parked) {
      container.style.cssText =
        'position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
    } else {
      container.style.cssText = '';
      container.className =
        'flex h-full min-h-0 w-full min-w-0 flex-1 flex-col';
    }
  }, [paneId, slotsVersion, editorType, parkingRef, slotsRef, container]);

  useLayoutEffect(() => {
    return () => {
      container.remove();
      containersRef.current?.delete(paneId);
    };
  }, [container, containersRef, paneId]);

  return createPortal(<Comp key={editorType} />, container);
}

export function WorkbenchEditorKeepAliveProvider(props: {
  layout: LayoutNode;
  registry: WorkbenchRegistry;
  /** Extra floating editors (same pane id as docked when detached). */
  floatingEditors?: readonly { id: string; editorType: string }[];
  children: ReactNode;
}) {
  const { layout, registry, floatingEditors, children } = props;
  const parkingRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef(new Map<string, HTMLElement>());
  const containersRef = useRef(new Map<string, HTMLDivElement>());
  const [slotsVersion, setSlotsVersion] = useState(0);

  const setSlot = useCallback((paneId: string, el: HTMLElement | null) => {
    const map = slotsRef.current;
    if (el == null) {
      if (!map.has(paneId)) {
        return;
      }
      map.delete(paneId);
      setSlotsVersion((v) => v + 1);
      return;
    }
    if (map.get(paneId) === el) {
      return;
    }
    map.set(paneId, el);
    setSlotsVersion((v) => v + 1);
  }, []);

  const panesDesired = useMemo(() => {
    const byId = new Map<string, { id: string; editorType: string }>();
    for (const p of collectKeepAliveEditorPanes(layout)) {
      byId.set(p.id, { id: p.id, editorType: p.editorType });
    }
    for (const p of floatingEditors ?? []) {
      byId.set(p.id, { id: p.id, editorType: p.editorType });
    }
    return [...byId.values()];
  }, [layout, floatingEditors]);

  const desiredSignature = panesDesired
    .map((p) => `${p.id}:${p.editorType}`)
    .sort()
    .join('|');

  /** Sticky merge so dock↔float handoff does not drop a pane for one frame (would remount WebGL). */
  const [panes, setPanes] = useState(panesDesired);

  useLayoutEffect(() => {
    setPanes((prev) => {
      const merged = new Map(prev.map((p) => [p.id, p]));
      for (const p of panesDesired) {
        merged.set(p.id, p);
      }
      return [...merged.values()];
    });
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPanes(panesDesired);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [desiredSignature, panesDesired]);

  const ctx = useMemo<KeepAliveContextValue>(
    () => ({ enabled: true, setSlot }),
    [setSlot],
  );

  return (
    <WorkbenchEditorKeepAliveContext.Provider value={ctx}>
      {children}
      <div
        ref={parkingRef}
        className="pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0"
        aria-hidden
        data-workbench-editor-parking
      />
      {panes.map((pane) => (
        <WorkbenchKeptEditor
          key={pane.id}
          paneId={pane.id}
          editorType={pane.editorType}
          registry={registry}
          slotsVersion={slotsVersion}
          slotsRef={slotsRef}
          parkingRef={parkingRef}
          containersRef={containersRef}
        />
      ))}
    </WorkbenchEditorKeepAliveContext.Provider>
  );
}
