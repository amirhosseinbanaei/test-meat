import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditional Tailwind class helper used by every component.
 *
 * - `clsx` handles the conditional / array / object class composition.
 * - `tailwind-merge` resolves conflicts so the last winning utility wins
 *   (e.g. `cn("p-2", "p-4")` → `"p-4"`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
