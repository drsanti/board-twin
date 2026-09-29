/*******************************************************************************
 * File Name : useTrnPieMenuController.ts
 *
 * Description : Headless pie state — hover slot, confirm/cancel, keyboard.
 *
 *******************************************************************************/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  resolveTrnPieMenuBehavior,
  trnPieMenuMatchesRepeatCancelChord,
  trnPieNextArmableSlot,
  trnPieSlotArmable,
  type TRNPieMenuBehaviorConfig,
} from "./trn-pie-menu-config.js";
import {
  resolveTrnPieMenuLayout,
  trnPieSlotFromDigitKey,
  trnPieSlotFromPointer,
  type TRNPieMenuLayoutConfig,
} from "./trn-pie-menu-layout.js";
import type { TRNPieMenuItem } from "./TRNPieMenu.js";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export type UseTrnPieMenuControllerArgs = {
  open: boolean;
  items: ReadonlyArray<TRNPieMenuItem | null>;
  layout?: TRNPieMenuLayoutConfig;
  behavior?: TRNPieMenuBehaviorConfig;
  /** Hub center in viewport coordinates while open. */
  hubCenter: { x: number; y: number } | null;
  /** Pointer at open (for initial wedge arm). */
  openPointer: { x: number; y: number } | null;
  onConfirm: (id: string) => void;
  onCancel: () => void;
};

export function useTrnPieMenuController(args: UseTrnPieMenuControllerArgs) {
  const {
    open,
    items,
    layout: layoutConfig,
    behavior: behaviorConfig,
    hubCenter,
    openPointer,
    onConfirm,
    onCancel,
  } = args;
  const layout = useMemo(
    () => resolveTrnPieMenuLayout(layoutConfig),
    [layoutConfig],
  );
  const behavior = useMemo(
    () => resolveTrnPieMenuBehavior(behaviorConfig),
    [behaviorConfig],
  );
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const hubCenterRef = useRef(hubCenter);
  hubCenterRef.current = hubCenter;
  const openPointerRef = useRef(openPointer);
  openPointerRef.current = openPointer;
  const slotsRef = useRef<Array<TRNPieMenuItem | null>>([]);
  const openSeededRef = useRef(false);

  const slots = useMemo(() => {
    const next: Array<TRNPieMenuItem | null> = [];
    for (let i = 0; i < 8; i += 1) {
      next.push(items[i] ?? null);
    }
    return next;
  }, [items]);
  slotsRef.current = slots;

  const slotFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const hub = hubCenterRef.current;
      if (hub == null) {
        return null;
      }
      const dx = clientX - hub.x;
      const dy = clientY - hub.y;
      return trnPieSlotFromPointer(dx, dy, layout.deadZonePx);
    },
    [layout.deadZonePx],
  );

  const resolveHoverFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (behavior.hoverMode !== "angular") {
        return null;
      }
      return trnPieSlotArmable(slotFromPointer(clientX, clientY), slotsRef.current);
    },
    [behavior.hoverMode, slotFromPointer],
  );

  const confirmSlot = useCallback(
    (slot: number | null, via: "click" | "digit" | "mnemonic" = "click") => {
      if (!open || slot == null || !behavior.confirmOn.includes(via)) {
        return;
      }
      const item = slots[slot];
      if (item == null || item.disabled === true) {
        return;
      }
      setHoverSlot(slot);
      onConfirm(item.id);
    },
    [behavior.confirmOn, onConfirm, open, slots],
  );

  const updateHoverFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!open || behavior.hoverMode !== "angular") {
        return;
      }
      setHoverSlot((prev) => {
        const next = resolveHoverFromPointer(clientX, clientY);
        return prev === next ? prev : next;
      });
    },
    [behavior.hoverMode, open, resolveHoverFromPointer],
  );

  const confirmFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const slot = resolveHoverFromPointer(clientX, clientY);
      if (slot != null) {
        confirmSlot(slot, "click");
        return true;
      }
      return false;
    },
    [confirmSlot, resolveHoverFromPointer],
  );

  useEffect(() => {
    if (!open) {
      openSeededRef.current = false;
      return;
    }
    if (behavior.hoverMode !== "angular" || openSeededRef.current) {
      return;
    }
    openSeededRef.current = true;
    const hub = hubCenterRef.current;
    const pointer = openPointerRef.current;
    const px = pointer?.x ?? hub?.x;
    const py = pointer?.y ?? hub?.y;
    if (px == null || py == null) {
      return;
    }
    setHoverSlot(resolveHoverFromPointer(px, py));
  }, [behavior.hoverMode, open, resolveHoverFromPointer]);

  useEffect(() => {
    if (!open || behavior.hoverMode !== "angular") {
      return;
    }
    const onPointerMove = (event: PointerEvent) => {
      updateHoverFromPointer(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", onPointerMove, true);
    return () => {
      window.removeEventListener("pointermove", onPointerMove, true);
    };
  }, [behavior.hoverMode, open, updateHoverFromPointer]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      if (behavior.cancelOn.includes("escape") && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
        return;
      }
      if (
        behavior.cancelOn.includes("repeatChord") &&
        behavior.repeatCancelChord != null &&
        trnPieMenuMatchesRepeatCancelChord(event, behavior.repeatCancelChord)
      ) {
        if (behavior.mode === "hold-flick") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        onCancel();
        return;
      }
      if (behavior.confirmOn.includes("digit")) {
        const digitSlot = trnPieSlotFromDigitKey(event.code, event.key);
        if (digitSlot != null) {
          event.preventDefault();
          event.stopPropagation();
          confirmSlot(trnPieSlotArmable(digitSlot, slots), "digit");
          return;
        }
      }
      if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        event.stopPropagation();
        const forward =
          event.key === "ArrowRight" || event.key === "ArrowDown";
        const next = trnPieNextArmableSlot(
          hoverSlot,
          slots,
          forward ? 1 : -1,
        );
        if (next != null) {
          setHoverSlot(next);
        }
        return;
      }
      if (event.key === "Enter" && behavior.confirmOn.includes("click")) {
        const armed = trnPieSlotArmable(hoverSlot, slots);
        if (armed != null) {
          event.preventDefault();
          event.stopPropagation();
          confirmSlot(armed, "click");
        }
        return;
      }
      if (!behavior.confirmOn.includes("mnemonic")) {
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }
      const letter = event.key.length === 1 ? event.key.toLowerCase() : "";
      if (letter.length === 0) {
        return;
      }
      const mnemonicHits = slots
        .map((item, index) => ({ item, index }))
        .filter(
          ({ item }) =>
            item != null &&
            item.disabled !== true &&
            item.mnemonic != null &&
            item.mnemonic.toLowerCase() === letter,
        );
      if (mnemonicHits.length === 1) {
        event.preventDefault();
        event.stopPropagation();
        confirmSlot(mnemonicHits[0]!.index, "mnemonic");
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [behavior, confirmSlot, hoverSlot, onCancel, open, slots]);

  useEffect(() => {
    if (
      !open ||
      behavior.mode !== "hold-flick" ||
      behavior.repeatCancelChord == null
    ) {
      return;
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      if (!trnPieMenuMatchesRepeatCancelChord(event, behavior.repeatCancelChord!)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const armed = trnPieSlotArmable(hoverSlot, slots);
      if (armed != null) {
        confirmSlot(armed, "click");
        return;
      }
      onCancel();
    };
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [behavior, confirmSlot, hoverSlot, onCancel, open, slots]);

  const setSliceHover = useCallback(
    (slot: number | null) => {
      if (behavior.hoverMode !== "slice-hit") {
        return;
      }
      setHoverSlot(trnPieSlotArmable(slot, slots));
    },
    [behavior.hoverMode, slots],
  );

  return {
    layout,
    behavior,
    hoverSlot,
    setSliceHover,
    slots,
    confirmSlot,
    updateHoverFromPointer,
    confirmFromPointer,
    slotFromPointer,
  };
}

/** Local pointer ref for chord-open at cursor (use with capture-phase move/down). */
export function useTrnPieMenuPointerAnchor() {
  const ref = useMemo(
    () => ({ x: 0, y: 0, seen: false as boolean }),
    [],
  );
  const note = useCallback((clientX: number, clientY: number) => {
    ref.x = clientX;
    ref.y = clientY;
    ref.seen = true;
  }, [ref]);
  const snapshot = useCallback(() => ({ x: ref.x, y: ref.y, seen: ref.seen }), [ref]);
  return { note, snapshot };
}
