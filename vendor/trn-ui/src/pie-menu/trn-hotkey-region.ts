/*******************************************************************************
 * File Name : trn-hotkey-region.ts
 *
 * Description : Pointer-follow hotkey regions. Same chord can open different
 *               pies depending on what the mouse is over (Scene vs Inspector).
 *
 *******************************************************************************/

export const TRN_HOTKEY_REGION_ATTR = "data-trn-hotkey-region";

let lastClientX = 0;
let lastClientY = 0;
let pointerSeen = false;

export function noteTrnHotkeyPointer(clientX: number, clientY: number): void {
  lastClientX = clientX;
  lastClientY = clientY;
  pointerSeen = true;
}

export function resetTrnHotkeyPointerForTests(): void {
  lastClientX = 0;
  lastClientY = 0;
  pointerSeen = false;
}

export function getTrnHotkeyPointer(): {
  x: number;
  y: number;
  seen: boolean;
} {
  return { x: lastClientX, y: lastClientY, seen: pointerSeen };
}

export function resolveTrnHotkeyRegionFromNode(
  node: EventTarget | null,
): string | null {
  if (node == null || typeof (node as Element).closest !== "function") {
    return null;
  }
  const el = (node as Element).closest(`[${TRN_HOTKEY_REGION_ATTR}]`);
  if (el == null) {
    return null;
  }
  const value = el.getAttribute(TRN_HOTKEY_REGION_ATTR)?.trim() ?? "";
  return value.length > 0 ? value : null;
}

export function resolveTrnHotkeyRegion(
  clientX: number,
  clientY: number,
  doc?: Document,
): string | null {
  const root = doc ?? (typeof document !== "undefined" ? document : undefined);
  if (root == null || typeof root.elementFromPoint !== "function") {
    return null;
  }
  return resolveTrnHotkeyRegionFromNode(root.elementFromPoint(clientX, clientY));
}

/** Region under the last noted pointer, or null if never seen. */
export function resolveTrnHotkeyRegionAtLastPointer(
  doc?: Document,
): string | null {
  if (!pointerSeen) {
    return null;
  }
  return resolveTrnHotkeyRegion(lastClientX, lastClientY, doc);
}
