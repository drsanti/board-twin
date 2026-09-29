/*******************************************************************************
 * File Name : useTrnHotkeyPointerTracking.ts
 *
 * Description : Window pointermove → noteTrnHotkeyPointer.
 *
 *******************************************************************************/

import { useEffect } from "react";
import { noteTrnHotkeyPointer } from "./trn-hotkey-region.js";

/** Call once near the app root so chord pies know hover target. */
export function useTrnHotkeyPointerTracking(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }
    const onMove = (event: PointerEvent) => {
      noteTrnHotkeyPointer(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", onMove, { capture: true });
    return () => {
      window.removeEventListener("pointermove", onMove, { capture: true });
    };
  }, [enabled]);
}
