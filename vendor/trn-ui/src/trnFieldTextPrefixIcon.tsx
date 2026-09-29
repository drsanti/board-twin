/*******************************************************************************
 * File Name        : trnFieldTextPrefixIcon.tsx
 *
 * Description      : Default Type prefix for field-variant text controls.
 *
 * Author           : Asst.Prof.Santi Nuratch, Ph.D
 * Thailand Embedded Systems Association (TESA)
 * Version          : 1.0
 * Target           : PSoC Edge E84 (shared)
 *
 *******************************************************************************/

import { Type, type LucideIcon } from "lucide-react";
import { isValidElement, type ReactNode } from "react";
import type { TRNInputVariant } from "./trnInputClasses.js";

export const TRN_FIELD_TEXT_PREFIX_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-zinc-400";

export const TRN_FIELD_TEXT_PREFIX_ICON = (
  <Type className={TRN_FIELD_TEXT_PREFIX_ICON_CLASS} aria-hidden />
);

const FIELD_PREFIX_EXCLUDED_INPUT_TYPES = new Set([
  "number",
  "search",
  "password",
  "file",
  "hidden",
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week",
]);

export function renderTrnInputPrefixIcon(prefix: LucideIcon | ReactNode): ReactNode
{
  if (isValidElement(prefix))
  {
    return prefix;
  }
  const Icon = prefix as LucideIcon;
  return <Icon className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />;
}

export function resolveTrnFieldTextPrefixIcon(options: {
  variant: TRNInputVariant;
  prefixIcon?: LucideIcon | ReactNode;
  showPrefixIcon?: boolean;
  type?: string;
}): ReactNode | undefined
{
  const { variant, prefixIcon, showPrefixIcon, type } = options;
  if (variant !== "field")
  {
    return prefixIcon != null ? renderTrnInputPrefixIcon(prefixIcon) : undefined;
  }
  if (prefixIcon != null)
  {
    return renderTrnInputPrefixIcon(prefixIcon);
  }
  if (showPrefixIcon === false)
  {
    return undefined;
  }
  const normalizedType = type?.toLowerCase() ?? "text";
  if (FIELD_PREFIX_EXCLUDED_INPUT_TYPES.has(normalizedType))
  {
    return undefined;
  }
  return TRN_FIELD_TEXT_PREFIX_ICON;
}
