import * as React from "react";
import { cn } from "@/common/lib/cn";

/**
 * Primitive Input — vendor-style shadcn input. Visual chrome (icon, border,
 * placeholder colour) is layered on by the consumer (see `ds/SearchInput`).
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full bg-transparent text-sm outline-none",
        "placeholder:text-current placeholder:opacity-85",
        "disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}
