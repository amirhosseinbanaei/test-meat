import type { HTMLAttributes } from "react";
import { cn } from "@/common/lib/cn";

/**
 * Page-width container — caps content at 1320px (the inner width used by the
 * Meat Plus design) and applies fluid horizontal padding so it stays readable
 * from 320px through ultra-wide.
 */
export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-330",
        "px-4 sm:px-6 lg:px-8 xl:px-0",
        className,
      )}
      {...props}
    />
  );
}
