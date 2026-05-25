import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/common/lib/cn";

/**
 * Rounded-rectangle icon button used for slider prev/next chrome.
 *
 * `surface` — chooses the resting tile colour:
 *   - `gray` (default) sits on light section backgrounds (hero, Special panel)
 *   - `white` sits on cream backgrounds (Best Sellers)
 *
 * The button is always at least the 44×44 touch target.
 */
export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  surface?: "gray" | "white";
  children: ReactNode;
};

export function IconButton({
  surface = "gray",
  className,
  children,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center",
        "w-11 h-[46px] rounded-[10px]",
        "text-brand-red cursor-pointer",
        "transition-transform duration-150 ease-out hover:-translate-y-0.5",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus-visible:ring-offset-2",
        surface === "white"
          ? "bg-white shadow-[0_2px_8px_rgb(0_0_0/0.05)]"
          : "bg-brand-bg",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
