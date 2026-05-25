import { ChevronLeft } from "lucide-react";
import { cn } from "@/common/lib/cn";

/**
 * Category tile — circular product photo with an optional chevron + label.
 * Used in the 12-cell "دسته بندی محصولات" grid. In RTL the chevron sits to
 * the right of the label (visually pointing back toward the label).
 */
export function CategoryTile({
  label,
  image,
  withArrow = true,
  className,
}: {
  label: string;
  image: string;
  withArrow?: boolean;
  className?: string;
}) {
  return (
    <a
      href="#"
      className={cn(
        "group flex flex-col items-center gap-3.5 text-brand-ink",
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 rounded-2xl p-1",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden",
          "size-[120px] rounded-full bg-white",
          "shadow-[0_8px_18px_rgb(0_0_0/0.05)]",
          "transition-transform duration-200 ease-out group-hover:-translate-y-1",
        )}
      >
        <img
          src={image}
          alt=""
          className="h-[80%] w-[80%] object-contain"
        />
      </span>
      <span className="inline-flex items-center gap-2.5 text-base leading-[1.6] text-brand-ink">
        <span>{label}</span>
        {withArrow && (
          <ChevronLeft
            className="size-4 text-brand-red shrink-0"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </span>
    </a>
  );
}
