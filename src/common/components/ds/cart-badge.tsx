import { ShoppingCart } from "lucide-react";

/**
 * Cart icon with an ink-coloured count chip in the top-left (RTL: visually the
 * top-near edge). The count is fed in as a localised string (Persian
 * numerals) so the data layer keeps full control of formatting.
 */
export function CartBadge({ count }: { count: string }) {
  return (
    <span className="relative inline-flex">
      <ShoppingCart className="size-[22px] text-brand-red" strokeWidth={2} />
      <span
        aria-label={`${count} مورد`}
        className="absolute -left-2 -top-2.5 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-brand-ink text-[11px] font-medium text-white"
      >
        {count}
      </span>
    </span>
  );
}
