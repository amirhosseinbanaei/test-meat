import type { HTMLAttributes } from "react";
import { cn } from "@/common/lib/cn";

/**
 * Section heading — display-font, fluid scale, RTL right-aligned by default.
 * Use `tone="light"` on dark/red panels (Special Discount, hero).
 */
export type SectionTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  tone?: "ink" | "light";
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
};

export function SectionTitle({
  tone = "ink",
  align = "start",
  as: Tag = "h2",
  className,
  ...props
}: SectionTitleProps) {
  return (
    <Tag
      className={cn(
        "font-display leading-none text-fluid-section",
        tone === "light" ? "text-white" : "text-brand-ink",
        align === "center" ? "text-center" : "text-right",
        className,
      )}
      {...props}
    />
  );
}
