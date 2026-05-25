import * as React from "react";
import { cn } from "@/common/lib/cn";
import { buttonVariants, type ButtonVariants } from "../variants/button";

/**
 * Primitive Button — the canonical shadcn-style interactive primitive used
 * across the app. All visual variants come from `buttonVariants` (CVA).
 * Higher-level "ds/" buttons (NavCtaButton, AllProductsButton, …) compose
 * this primitive — they don't reinvent the styling.
 */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
