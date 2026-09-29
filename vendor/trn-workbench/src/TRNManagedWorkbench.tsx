import { useState, useEffect, memo, useRef } from 'react';
import type { LayoutNode, WorkbenchRegistry } from './types';
import { TRNWorkbenchHost } from './TRNWorkbenchHost';
import type { TRNWorkbenchHandle } from './TRNWorkbench';
import { loadPersistedLayout, savePersistedLayout } from './layoutPersistence';

/**
 * Props for the easy-to-use TRNManagedWorkbench.
 * Manages layout state, optional localStorage persistence, and optional floating panes.
 */
export interface TRNManagedWorkbenchProps {
  initialLayout: LayoutNode;
  registry: WorkbenchRegistry;
  persistenceKey?: string;
  enableFloating?: boolean;
  onDetachRejected?: () => void;
  onDockBackResult?: (result: import('./floatDockRestore').FloatDockBackResult) => void;
  portalTarget?: HTMLElement | null;
  className?: string;
  /** Validate loaded/saved JSON before applying (defaults to structural check only). */
  validateLayout?: (raw: unknown) => LayoutNode;
}

/**
 * Self-contained workbench with internal state — ideal for copy-paste into a new app.
 */
export const TRNManagedWorkbench = memo(function TRNManagedWorkbench({
  initialLayout,
  registry,
  persistenceKey,
  enableFloating = true,
  onDetachRejected,
  onDockBackResult,
  portalTarget,
  className,
  validateLayout,
}: TRNManagedWorkbenchProps) {
  const ref = useRef<TRNWorkbenchHandle>(null);
  /** Match SSR `initialLayout` on first paint; restore storage after mount. */
  const [layoutHydrated, setLayoutHydrated] = useState(false);
  const [layout, setLayout] = useState<LayoutNode>(initialLayout);

  useEffect(() => {
    if (layoutHydrated) {
      return;
    }
    if (persistenceKey == null || typeof window === 'undefined') {
      setLayoutHydrated(true);
      return;
    }
    const saved = loadPersistedLayout(persistenceKey);
    if (saved) {
      setLayout(validateLayout ? validateLayout(saved) : saved);
    }
    setLayoutHydrated(true);
  }, [initialLayout, layoutHydrated, persistenceKey, validateLayout]);

  useEffect(() => {
    if (!layoutHydrated || persistenceKey == null || typeof window === 'undefined') {
      return;
    }
    savePersistedLayout(persistenceKey, layout);
  }, [layout, layoutHydrated, persistenceKey]);

  return (
    <TRNWorkbenchHost
      ref={ref}
      layout={layout}
      registry={registry}
      onLayoutChange={setLayout}
      enableFloating={enableFloating}
      onDetachRejected={onDetachRejected}
      onDockBackResult={onDockBackResult}
      portalTarget={portalTarget}
      className={className}
    />
  );
});

TRNManagedWorkbench.displayName = 'TRNManagedWorkbench';
