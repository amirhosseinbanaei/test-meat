import { ArrowLeft } from "lucide-react";
import { cn } from "@/common/lib/cn";
import { Button } from "../ui/button";

/**
 * "همه محصولات" / view-all button — text + long left-pointing arrow.
 * Used by the Special Discount (white text), Best Sellers and Articles
 * (ink text) sections.
 */
export function AllProductsButton({
  tone = "ink",
  label = "همه محصولات",
  className,
  ...rest
}: {
  tone?: "ink" | "light";
  label?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant={tone === "light" ? "redGhost" : "ghost"}
      size="lg"
      className={cn(
        "font-bold gap-2.5 px-4",
        tone === "light" ? "text-white" : "text-brand-ink",
        className,
      )}
      {...rest}
    >
      {label}
      <ArrowLeft className="size-[18px]" strokeWidth={2} />
    </Button>
  );
}
