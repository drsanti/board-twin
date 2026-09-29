import type { EditorType } from './types';
import type { FloatDockRestoreV1 } from './floatDockRestore';

/** A pane detached from the tiling tree into a floating window. */
export interface FloatingWorkbenchPane {
  id: string;
  editorType: EditorType;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Prior dock slot — used by header “Dock back”. */
  dockRestore?: FloatDockRestoreV1 | null;
}
