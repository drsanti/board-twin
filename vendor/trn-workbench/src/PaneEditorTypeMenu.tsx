import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { WorkbenchRegistry } from './types';
import { cn } from './cn';

/** Open / change-type menus use the short static `label`, not dynamic `paneLabel`. */
function menuLabel(entry: WorkbenchRegistry[string], fallbackKey: string): string {
  return entry.label || fallbackKey;
}

export type PaneEditorTypeMenuPurpose = 'change' | 'split';

export const PaneEditorTypeMenu = memo(function PaneEditorTypeMenu({
  open,
  anchorEl,
  currentEditorType,
  registry,
  hiddenEditorTypes,
  preferredEditorType,
  purpose = 'change',
  onSelect,
  onClose,
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
  currentEditorType: string;
  registry: WorkbenchRegistry;
  /** Types omitted from the list (except current when purpose is change). */
  hiddenEditorTypes?: readonly string[];
  /** Optional type sorted first (e.g. Config when splitting Machine Twin). */
  preferredEditorType?: string | null;
  purpose?: PaneEditorTypeMenuPurpose;
  onSelect: (editorType: string) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const hiddenSet = useMemo(() => new Set(hiddenEditorTypes ?? []), [hiddenEditorTypes]);

  const entries = useMemo(() => {
    return Object.entries(registry)
      .filter(([key]) => {
        if (purpose === 'split') {
          return !hiddenSet.has(key);
        }
        return !hiddenSet.has(key) || key === currentEditorType;
      })
      .sort(([keyA, a], [keyB, b]) => {
        if (preferredEditorType != null && preferredEditorType.length > 0) {
          if (keyA === preferredEditorType) return -1;
          if (keyB === preferredEditorType) return 1;
        }
        return menuLabel(a, keyA).localeCompare(menuLabel(b, keyB), undefined, {
          sensitivity: 'base',
        });
      });
  }, [registry, hiddenSet, currentEditorType, purpose, preferredEditorType]);

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setMenuPosition(null);
      return;
    }
    const update = () => {
      const rect = anchorEl.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight ?? 280;
      const gap = 4;
      const fitsBelow = rect.bottom + gap + menuHeight <= window.innerHeight - 8;
      setMenuPosition({
        top: fitsBelow ? rect.bottom + gap : Math.max(8, rect.top - gap - menuHeight),
        left: Math.min(rect.left, window.innerWidth - 200),
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorEl, open, entries.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorEl?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [anchorEl, onClose, open]);

  if (!open || !portalTarget || !anchorEl || !menuPosition) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="listbox"
      aria-label={purpose === 'split' ? 'Open pane' : 'Change pane type'}
      className="pointer-events-auto fixed z-[1100] flex w-52 max-h-[min(60vh,22rem)] flex-col overflow-hidden rounded-lg border border-white/10 bg-bg-header/95 p-1 shadow-2xl shadow-black/50 backdrop-blur-2xl"
      style={{ top: menuPosition.top, left: menuPosition.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {purpose === 'split' ? (
        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          Open pane
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        {entries.length === 0 ? (
          <div className="px-3 py-2 text-xs text-tertiary">No panes available</div>
        ) : (
          entries.map(([key, info]) => (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={purpose === 'change' && currentEditorType === key}
              onClick={() => {
                onSelect(key);
                onClose();
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition-colors',
                purpose === 'change' && currentEditorType === key
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-primary hover:bg-white/10 hover:text-primary',
              )}
            >
              <span className="text-sm">{info.icon}</span>
              <span className="font-medium">{menuLabel(info, key)}</span>
            </button>
          ))
        )}
      </div>
    </div>,
    portalTarget,
  );
});
