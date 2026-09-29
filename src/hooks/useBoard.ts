import { useSyncExternalStore } from "react";
import { board, type Snapshot } from "../lib/board";

/** Live snapshot of the virtual board — re-renders on every broker update. */
export function useBoard(): Snapshot {
  return useSyncExternalStore(board.subscribe, board.getSnapshot);
}
