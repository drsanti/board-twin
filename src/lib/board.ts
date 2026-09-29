/*
 * board.ts — singleton BoardTwinClient for the UI.
 *
 * The client lives in ../client (the publishable `board-twin-client`
 * package); this file just binds it to the app's broker URL so all
 * components share one connection.
 */
import { BoardTwinClient } from "board-twin-client";

export type {
  BoardDescriptor,
  BrokerMessage,
  ClientEvents,
  ClientMessage,
  SerialLine,
  SimStats,
  Snapshot,
  TaskInfo,
} from "board-twin-client";
export { BoardTwinClient } from "board-twin-client";

export const board = new BoardTwinClient(`ws://${location.hostname}:7392`);
