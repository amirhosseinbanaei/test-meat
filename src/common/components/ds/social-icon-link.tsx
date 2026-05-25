import type { ComponentType, SVGProps } from "react";
import { cn } from "@/common/lib/cn";

/**
 * Brand-coloured social link — used in the footer row. The icon component
 * is passed in so the footer can wire up Telegram / YouTube / Instagram /
 * Aparat or any other Lucide / custom SVG glyph.
 */
export function SocialIconLink({
  href,
  label,
  Icon,
  className,
}: {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full",
        "text-brand-red hover:bg-brand-red/10",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40",
        "transition-colors",
        className,
      )}
    >
      <Icon className="size-[22px]" />
    </a>
  );
}
