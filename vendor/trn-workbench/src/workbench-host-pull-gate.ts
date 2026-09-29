import type { WorkbenchLayoutAppId } from "./workbench-layout-library";
import { getIsVsCodeExtensionWebview } from "./vscode";

const pullCompleteWaiters = new Map<WorkbenchLayoutAppId, Set<() => void>>();
const pullCompleted = new Set<WorkbenchLayoutAppId>();

/** Mark host pull finished (success, empty, or error) so layout hydrate can proceed. */
export function signalWorkbenchHostPullComplete(appId: WorkbenchLayoutAppId): void {
  pullCompleted.add(appId);
  const waiters = pullCompleteWaiters.get(appId);
  if (waiters == null) {
    return;
  }
  for (const done of waiters) {
    done();
  }
  waiters.clear();
}

/**
 * In VS Code webviews, wait until globalStorage mirror pull settles (or timeout).
 * Browser / Vite resolves immediately — localStorage is already durable.
 */
export function waitForWorkbenchHostPull(
  appId: WorkbenchLayoutAppId,
  timeoutMs = 900,
): Promise<void> {
  if (!getIsVsCodeExtensionWebview()) {
    return Promise.resolve();
  }
  if (pullCompleted.has(appId)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      waiters.delete(finish);
      resolve();
    };
    const timer = window.setTimeout(finish, timeoutMs);
    let waiters = pullCompleteWaiters.get(appId);
    if (waiters == null) {
      waiters = new Set();
      pullCompleteWaiters.set(appId, waiters);
    }
    waiters.add(finish);
  });
}

/** Test helper — clear pull gate state between cases. */
export function resetWorkbenchHostPullGateForTests(): void {
  pullCompleteWaiters.clear();
  pullCompleted.clear();
}
