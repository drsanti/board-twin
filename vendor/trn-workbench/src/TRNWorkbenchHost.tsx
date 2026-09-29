import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  memo,
  type ReactNode,
} from 'react';
import { TRNWorkbench, type TRNWorkbenchHandle, type TRNWorkbenchProps } from './TRNWorkbench';
import { FloatingWorkbenchLayer } from './FloatingWorkbenchLayer';
import {
  useWorkbenchFloating,
  type WorkbenchFloatingBindings,
} from './useWorkbenchFloating';
import type { FloatDockBackResult } from './floatDockRestore';
import { WorkbenchEditorKeepAliveProvider } from './WorkbenchEditorKeepAlive';

export interface TRNWorkbenchHostProps extends TRNWorkbenchProps {
  /**
   * When true (default), panes can detach to floating windows and dock back via drag.
   * Set false for a tiling-only shell.
   */
  enableFloating?: boolean;
  /** Portal target for float windows. Defaults to `document.body`. */
  portalTarget?: HTMLElement | null;
  /** Called when the user tries to float the last remaining pane. */
  onDetachRejected?: () => void;
  /** Fired after floating pane Dock-back (restore / fallback / failure). */
  onDockBackResult?: (result: FloatDockBackResult) => void;
  /** Optional chrome above the tiling area (workspace tabs, toolbars). */
  header?: ReactNode;
  className?: string;
  /** Parent-supplied floating layer (avoids duplicate state when composing managed workbench). */
  floatingBindings?: WorkbenchFloatingBindings;
}

/**
 * Batteries-included workbench: tiling tree + optional floating layer.
 * Owns editor keep-alive so dock ↔ float shares the same React editor instance.
 */
export const TRNWorkbenchHost = memo(
  forwardRef<TRNWorkbenchHandle, TRNWorkbenchHostProps>(function TRNWorkbenchHost(
    {
      enableFloating = true,
      portalTarget,
      onDetachRejected,
      onDockBackResult,
      header,
      className,
      floatingBindings,
      layout,
      onLayoutChange,
      activePaneId: activePaneIdProp,
      onPaneActivate: onPaneActivateProp,
      registry,
      provideEditorKeepAlive: _ignoredProvide,
      ...workbenchProps
    },
    ref,
  ) {
    const innerRef = useRef<TRNWorkbenchHandle>(null);
    useImperativeHandle(ref, () => innerRef.current!, []);

    const internalFloating = useWorkbenchFloating({
      layout,
      onLayoutChange,
      enabled: enableFloating && floatingBindings == null,
      onDetachRejected,
      onDockBackResult,
      requiredEditorTypes: workbenchProps.requiredEditorTypes,
    });
    const floating = floatingBindings ?? internalFloating;

    const activePaneId = activePaneIdProp ?? floating.activePaneId;
    const onPaneActivate = useCallback(
      (id: string) => {
        if (activePaneIdProp == null) floating.setActivePaneId(id);
        onPaneActivateProp?.(id);
      },
      [activePaneIdProp, floating, onPaneActivateProp],
    );

    const floatingEditors = useMemo(
      () =>
        floating.floatingPanes.map((p) => ({
          id: p.id,
          editorType: p.editorType,
        })),
      [floating.floatingPanes],
    );

    return (
      <WorkbenchEditorKeepAliveProvider
        layout={layout}
        registry={registry}
        floatingEditors={enableFloating ? floatingEditors : undefined}
      >
        <div className={className ?? 'flex flex-1 flex-col min-h-0 min-w-0'}>
          {header}
          <div className="relative flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
            <TRNWorkbench
              ref={innerRef}
              layout={layout}
              registry={registry}
              onLayoutChange={onLayoutChange}
              activePaneId={activePaneId}
              onPaneActivate={onPaneActivate}
              provideEditorKeepAlive={false}
              {...workbenchProps}
              {...(enableFloating ? floating.workbenchProps : {})}
            />
          </div>
          {enableFloating ? (
            <FloatingWorkbenchLayer
              registry={registry}
              portalTarget={portalTarget}
              {...floating.layerProps(innerRef)}
            />
          ) : null}
        </div>
      </WorkbenchEditorKeepAliveProvider>
    );
  }),
);

TRNWorkbenchHost.displayName = 'TRNWorkbenchHost';
