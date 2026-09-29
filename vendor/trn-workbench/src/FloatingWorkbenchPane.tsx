import { memo, useCallback, useRef } from 'react';
import { Dock, GripVertical, Maximize2, X } from 'lucide-react';
import type { FloatingWorkbenchPane } from './floatingTypes';
import type { WorkbenchRegistry } from './types';
import { registryLabel } from './WorkbenchDockDragLayer';
import { cn } from './cn';
import {
  clampFloatPosition,
  clampFloatSize,
  MIN_FLOAT_PANE_HEIGHT,
  MIN_FLOAT_PANE_WIDTH,
} from './workbenchFloat';
import { WorkbenchHintButton } from './WorkbenchHintButton';
import {
  useWorkbenchEditorKeepAlive,
  WorkbenchEditorSlot,
} from './WorkbenchEditorKeepAlive';

export const FloatingWorkbenchPaneWindow = memo(function FloatingWorkbenchPaneWindow({
  pane,
  registry,
  isFront,
  onFocus,
  onClose,
  onMove,
  onResize,
  onDockDragStart,
  onDockBack,
}: {
  pane: FloatingWorkbenchPane;
  registry: WorkbenchRegistry;
  isFront: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDockDragStart: (paneId: string) => void;
  onDockBack: (paneId: string) => void;
}) {
  const { label, icon } = registryLabel(registry, pane.editorType);
  const info = registry[pane.editorType];
  const Component = info?.component;
  const keepAlive = useWorkbenchEditorKeepAlive();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const moveRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originW: number;
    originH: number;
  } | null>(null);
  const livePosRef = useRef<{ x: number; y: number } | null>(null);
  const liveSizeRef = useRef<{ width: number; height: number } | null>(null);

  const startMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      // Ignore chrome buttons (dock / focus / close) — they stopPropagation themselves.
      const target = e.target as HTMLElement | null;
      if (target?.closest('button')) return;

      e.preventDefault();
      e.stopPropagation();
      if (!isFront) {
        onFocus();
      }

      const originX = livePosRef.current?.x ?? pane.x;
      const originY = livePosRef.current?.y ?? pane.y;
      moveRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX,
        originY,
      };
      livePosRef.current = { x: originX, y: originY };

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const onPointerMove = (ev: PointerEvent) => {
        const m = moveRef.current;
        if (!m || ev.pointerId !== m.pointerId) return;
        const next = clampFloatPosition(
          m.originX + (ev.clientX - m.startX),
          m.originY + (ev.clientY - m.startY),
          pane.width,
          pane.height,
        );
        livePosRef.current = next;
        const el = rootRef.current;
        if (el != null) {
          el.style.left = `${next.x}px`;
          el.style.top = `${next.y}px`;
        }
      };

      const onPointerUp = (ev: PointerEvent) => {
        const m = moveRef.current;
        if (m != null && ev.pointerId !== m.pointerId) return;
        moveRef.current = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        try {
          if (e.currentTarget.hasPointerCapture(ev.pointerId)) {
            e.currentTarget.releasePointerCapture(ev.pointerId);
          }
        } catch {
          // ignore
        }
        const live = livePosRef.current;
        if (live != null) {
          onMove(pane.id, live.x, live.y);
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [isFront, onFocus, onMove, pane.height, pane.id, pane.width, pane.x, pane.y],
  );

  const startResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      if (!isFront) {
        onFocus();
      }
      resizeRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originW: liveSizeRef.current?.width ?? pane.width,
        originH: liveSizeRef.current?.height ?? pane.height,
      };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const onPointerMove = (ev: PointerEvent) => {
        const r = resizeRef.current;
        if (!r || ev.pointerId !== r.pointerId) return;
        const next = clampFloatSize(
          r.originW + (ev.clientX - r.startX),
          r.originH + (ev.clientY - r.startY),
        );
        liveSizeRef.current = next;
        const el = rootRef.current;
        if (el != null) {
          el.style.width = `${next.width}px`;
          el.style.height = `${next.height}px`;
        }
      };

      const onPointerUp = (ev: PointerEvent) => {
        const r = resizeRef.current;
        if (r != null && ev.pointerId !== r.pointerId) return;
        resizeRef.current = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        try {
          if (e.currentTarget.hasPointerCapture(ev.pointerId)) {
            e.currentTarget.releasePointerCapture(ev.pointerId);
          }
        } catch {
          // ignore
        }
        const live = liveSizeRef.current;
        if (live != null) {
          onResize(pane.id, live.width, live.height);
          liveSizeRef.current = null;
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [isFront, onFocus, onResize, pane.height, pane.id, pane.width],
  );

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label={`${label} floating pane`}
      className={cn(
        'fixed flex flex-col overflow-hidden rounded-lg border border-white/12 bg-bg-panel shadow-2xl shadow-black/60',
        isFront ? 'ring-1 ring-violet-500/40' : 'ring-1 ring-white/8',
      )}
      style={{
        left: pane.x,
        top: pane.y,
        width: pane.width,
        height: pane.height,
        zIndex: isFront ? 4800 : 4700,
        minWidth: MIN_FLOAT_PANE_WIDTH,
        minHeight: MIN_FLOAT_PANE_HEIGHT,
        willChange: 'left, top, width, height',
      }}
      onPointerDown={onFocus}
    >
      <div
        className="flex h-8 shrink-0 cursor-grab items-center gap-1.5 border-b border-white/8 bg-bg-header/90 px-1.5 backdrop-blur-md touch-none active:cursor-grabbing"
        onPointerDown={startMove}
      >
        <WorkbenchHintButton
          hint="Drag to dock back into workbench"
          ariaLabel="Dock pane"
          className="flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded text-tertiary hover:bg-white/10 hover:text-primary active:cursor-grabbing"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            onDockDragStart(pane.id);
          }}
        >
          <GripVertical size={12} aria-hidden />
        </WorkbenchHintButton>
        <span className="shrink-0 opacity-80">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-widest text-primary">
          {label}
        </span>
        <WorkbenchHintButton
          hint="Dock back to previous location (or drag the grip onto the workbench)"
          ariaLabel="Dock pane back to previous location"
          className="flex h-6 w-6 items-center justify-center rounded text-violet-300/90 hover:bg-white/10 hover:text-violet-200"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDockBack(pane.id);
          }}
        >
          <Dock size={12} aria-hidden />
        </WorkbenchHintButton>
        <WorkbenchHintButton
          hint="Focus pane"
          ariaLabel="Focus pane"
          className="flex h-6 w-6 items-center justify-center rounded text-tertiary hover:bg-white/10 hover:text-primary"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onFocus();
          }}
        >
          <Maximize2 size={12} aria-hidden />
        </WorkbenchHintButton>
        <WorkbenchHintButton
          hint="Close floating pane"
          ariaLabel="Close floating pane"
          className="flex h-6 w-6 items-center justify-center rounded text-tertiary hover:bg-red-500/15 hover:text-red-400"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X size={13} aria-hidden />
        </WorkbenchHintButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {keepAlive?.enabled ? (
          <WorkbenchEditorSlot paneId={pane.id} />
        ) : Component ? (
          <Component />
        ) : null}
      </div>

      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize touch-none"
        onPointerDown={startResize}
        aria-label="Resize floating pane"
        role="separator"
      />
    </div>
  );
});
