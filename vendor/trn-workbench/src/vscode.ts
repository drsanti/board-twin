let isVsCodeExtensionWebviewImpl: () => boolean = () => false;

/**
 * Inject VS Code webview detection for host mirror sync.
 * Call once at app boot in VS Code extension webviews.
 */
export function configureTrnWorkbenchVscode(options: {
  isVsCodeExtensionWebview: () => boolean;
}): void {
  isVsCodeExtensionWebviewImpl = options.isVsCodeExtensionWebview;
}

export function getIsVsCodeExtensionWebview(): boolean {
  return isVsCodeExtensionWebviewImpl();
}
