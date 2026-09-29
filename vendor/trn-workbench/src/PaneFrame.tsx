import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Columns2,
  Rows2,
  X,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  PanelLeftClose,
  GripVertical,
  Maximize2,
  Minimize2,
  PictureInPicture2,
} from 'lucide-react';
import type { LayoutNode, WorkbenchRegistry } from './types';
import { resolveWorkbenchPaneLabel } from './types';
import type { PaneDockZone } from './paneDock';
import { PaneDockDropOverlay } from './PaneDockDropOverlay';
import { PaneEditorTypeMenu } from './PaneEditorTypeMenu';
import { WorkbenchHintButton } from './WorkbenchHintButton';
import {
  useWorkbenchEditorKeepAlive,
  WorkbenchEditorSlot,
} from './WorkbenchEditorKeepAlive';
import { cn } from './cn';

type SplitDirection = 'horizontal' | 'vertical';

interface PaneFrameProps {
  node: Extract<LayoutNode, { type: 'editor' }>;
  registry: WorkbenchRegistry;
  /** Create a new pane of `editorType` in the given split direction. */
  onSplit: (direction: SplitDirection, editorType: string) => void;
  onClose: () => void;
  onCollapse: () => void;
  onChangeType: (type: string) => void;
  onActivate?: () => void;
  isActive?: boolean;
  paneMaximized?: boolean;
  onToggleMaximize?: () => void;
  /** Undock this docked pane into a floating window (same as drag outside workbench). */
  onUndock?: () => void;
  dockDragSourceId?: string | null;
  dockHoverZone?: PaneDockZone | null;
  onDockZoneChange?: (targetPaneId: string, zone: PaneDockZone | null) => void;
  onDockDragStart?: (sourcePaneId: string) => void;
  hiddenEditorTypes?: readonly string[];
  /** Types hidden from the Split → Open pane menu (e.g. singletons already open). */
  splitHiddenEditorTypes?: readonly string[];
  /** Preferred first row in the split menu (e.g. Config beside Machine Twin). */
  preferredSplitEditorType?: string | null;
  /** When true, hide the close (remove pane) control — required viewport VP-2. */
  closeDisabled?: boolean;
}

export function PaneFrame({
  node,
  registry,
  onSplit,
  onClose,
  onCollapse,
  onChangeType,
  onActivate,
  isActive = false,
  paneMaximized = false,
  onToggleMaximize,
  onUndock,
  dockDragSourceId = null,
  dockHoverZone = null,
  onDockZoneChange,
  onDockDragStart,
  hiddenEditorTypes,
  splitHiddenEditorTypes,
  preferredSplitEditorType = null,
  closeDisabled = false,
}: PaneFrameProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [selectorAnchorEl, setSelectorAnchorEl] = useState<HTMLElement | null>(null);
  const selectorTriggerRef = useRef<HTMLDivElement>(null);

  const [splitMenuDirection, setSplitMenuDirection] = useState<SplitDirection | null>(null);
  const [splitAnchorEl, setSplitAnchorEl] = useState<HTMLElement | null>(null);
  const splitSideWrapRef = useRef<HTMLSpanElement>(null);
  const splitStackWrapRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    setSelectorAnchorEl(showSelector ? selectorTriggerRef.current : null);
  }, [showSelector]);

  useLayoutEffect(() => {
    if (splitMenuDirection === 'horizontal') {
      setSplitAnchorEl(splitSideWrapRef.current);
    } else if (splitMenuDirection === 'vertical') {
      setSplitAnchorEl(splitStackWrapRef.current);
    } else {
      setSplitAnchorEl(null);
    }
  }, [splitMenuDirection]);

  const keepAlive = useWorkbenchEditorKeepAlive();
  const currentInfo = registry[node.editorType] || {
    icon: <HelpCircle size={14} />,
    label: 'Unknown',
    component: () => <div className="p-5 text-tertiary">Editor not found</div>,
  };

  const isDockDragging = dockDragSourceId != null;
  const isDragSource = dockDragSourceId === node.id;
  const showDropOverlay =
    isDockDragging && !isDragSource && dockDragSourceId !== node.id;

  const splitHiddenSet = useMemo(
    () => new Set(splitHiddenEditorTypes ?? []),
    [splitHiddenEditorTypes],
  );
  const canSplit = useMemo(
    () => Object.keys(registry).some((key) => !splitHiddenSet.has(key)),
    [registry, splitHiddenSet],
  );

  const openSplitMenu = (direction: SplitDirection) => {
    setShowSelector(false);
    setSplitMenuDirection((prev) => (prev === direction ? null : direction));
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-hidden min-h-0 bg-bg-panel">
      <div
        className={cn(
          'wb-pane-chrome-header relative z-20 flex h-8 shrink-0 items-center gap-0 overflow-visible border-0 pl-0 pr-2 select-none ring-0 outline-none',
          isDragSource && 'bg-zinc-900/30',
          isActive && !isDragSource && 'bg-zinc-900/40',
          paneMaximized && 'bg-zinc-900/50',
        )}
        onPointerDown={() => onActivate?.()}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onToggleMaximize?.();
        }}
      >
        <WorkbenchHintButton
          hint="Drag — outside workbench to float; green ring = studio edge; blue = split or tabs"
          ariaLabel="Drag pane to dock"
          tooltipClassName="shrink-0 -ml-1"
          triggerClassName="!p-0"
          className="flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded text-tertiary hover:bg-white/10 hover:text-primary active:cursor-grabbing"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            onDockDragStart?.(node.id);
          }}
        >
          <GripVertical size={12} aria-hidden />
        </WorkbenchHintButton>

        <div
          ref={selectorTriggerRef}
          role="button"
          tabIndex={0}
          aria-expanded={showSelector}
          aria-haspopup="listbox"
          onClick={(e) => {
            e.stopPropagation();
            setSplitMenuDirection(null);
            setShowSelector((open) => !open);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSplitMenuDirection(null);
              setShowSelector((open) => !open);
            }
          }}
          className={cn(
            'flex cursor-pointer items-center rounded px-2 py-0.5 transition-colors',
            showSelector ? 'bg-blue-600 text-white' : 'text-secondary hover:bg-white/10',
          )}
        >
          <div className="flex items-center justify-center min-w-[14px]">
            {currentInfo.icon}
          </div>
          <span className="ml-1.5 opacity-50">
            {showSelector ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </span>
        </div>

        <div className="min-w-0 shrink truncate text-[10px] font-bold text-tertiary uppercase tracking-widest">
          {resolveWorkbenchPaneLabel(currentInfo, 'Unknown')}
        </div>

        <div className="flex-1" />

        <div className="flex gap-0.5">
          {onToggleMaximize ? (
            <WorkbenchHintButton
              hint={
                paneMaximized
                  ? "Restore pane size (double-click header)"
                  : "Maximize pane in workbench (double-click header)"
              }
              ariaLabel={paneMaximized ? "Restore pane size" : "Maximize pane"}
              className="flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-blue-400 transition-all"
              onClick={onToggleMaximize}
            >
              {paneMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </WorkbenchHintButton>
          ) : null}
          {onUndock ? (
            <WorkbenchHintButton
              hint="Undock to floating window (or drag grip outside the workbench)"
              ariaLabel="Undock pane to floating window"
              className="flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-blue-400 transition-all"
              onClick={onUndock}
            >
              <PictureInPicture2 size={13} />
            </WorkbenchHintButton>
          ) : null}
          {canSplit ? (
            <>
              <span ref={splitSideWrapRef} className="inline-flex">
                <WorkbenchHintButton
                  hint="Split side-by-side — choose which pane to open"
                  ariaLabel="Split side-by-side"
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-blue-400 transition-all',
                    splitMenuDirection === 'horizontal' && 'bg-white/10 text-blue-400',
                  )}
                  onClick={() => openSplitMenu('horizontal')}
                >
                  <Columns2 size={13} />
                </WorkbenchHintButton>
              </span>
              <span ref={splitStackWrapRef} className="inline-flex">
                <WorkbenchHintButton
                  hint="Split stacked — choose which pane to open"
                  ariaLabel="Split stacked"
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-blue-400 transition-all',
                    splitMenuDirection === 'vertical' && 'bg-white/10 text-blue-400',
                  )}
                  onClick={() => openSplitMenu('vertical')}
                >
                  <Rows2 size={13} />
                </WorkbenchHintButton>
              </span>
            </>
          ) : null}
          <WorkbenchHintButton
            hint="Collapse to edge strip (keeps slot — Ctrl+Shift+C)"
            ariaLabel="Collapse pane to edge strip"
            className="flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-white/10 hover:text-primary transition-all"
            onClick={onCollapse}
          >
            <PanelLeftClose size={13} />
          </WorkbenchHintButton>
          {!closeDisabled ? (
            <WorkbenchHintButton
              hint="Remove pane from layout"
              ariaLabel="Remove pane from layout"
              className="flex items-center justify-center w-6 h-6 rounded text-tertiary hover:bg-red-600/20 hover:text-red-500 transition-all ml-1"
              onClick={onClose}
            >
              <X size={14} />
            </WorkbenchHintButton>
          ) : null}
        </div>

        <PaneEditorTypeMenu
          open={showSelector}
          anchorEl={selectorAnchorEl}
          currentEditorType={node.editorType}
          registry={registry}
          hiddenEditorTypes={hiddenEditorTypes}
          purpose="change"
          onSelect={onChangeType}
          onClose={() => setShowSelector(false)}
        />
        <PaneEditorTypeMenu
          open={splitMenuDirection != null}
          anchorEl={splitAnchorEl}
          currentEditorType={node.editorType}
          registry={registry}
          hiddenEditorTypes={splitHiddenEditorTypes}
          preferredEditorType={preferredSplitEditorType}
          purpose="split"
          onSelect={(editorType) => {
            if (splitMenuDirection != null) {
              onSplit(splitMenuDirection, editorType);
            }
            setSplitMenuDirection(null);
          }}
          onClose={() => setSplitMenuDirection(null)}
        />
      </div>

      <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
        {keepAlive?.enabled ? (
          <WorkbenchEditorSlot paneId={node.id} />
        ) : currentInfo.component ? (
          <currentInfo.component />
        ) : null}
        {showDropOverlay && onDockZoneChange ? (
          <PaneDockDropOverlay
            paneId={node.id}
            visible
            activeZone={dockHoverZone}
            onZoneChange={onDockZoneChange}
          />
        ) : null}
      </div>
    </div>
  );
}
