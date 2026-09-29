import type { LayoutNode } from "./types";
import { validateLayoutTree } from "./layoutValidateCore";
import { coerceRequiredEditorTypes } from "./utils";

export function createWorkbenchLayoutValidator(
  fallback: LayoutNode,
  knownEditorTypes: readonly string[],
  fallbackEditorType?: string,
  requiredEditorTypes?: readonly string[],
): (raw: unknown) => LayoutNode {
  const known = new Set(knownEditorTypes);
  const fallbackType = fallbackEditorType ?? knownEditorTypes[0] ?? "main";
  return (raw: unknown) =>
    coerceRequiredEditorTypes(
      validateLayoutTree(raw, {
        fallback,
        knownEditorTypes: known,
        fallbackEditorType: fallbackType,
      }),
      requiredEditorTypes,
    );
}
