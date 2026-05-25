import { Package, Tag, Truck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Single "why-feature" row item — icon, red title, muted helper text.
 * Used in the 2×2 grid below the "چرا میت پلاس" CTAs.
 */
export type WhyFeatureIconName = "truck" | "discount" | "wallet" | "box";

const ICONS: Record<WhyFeatureIconName, LucideIcon> = {
  truck: Truck,
  discount: Tag,
  wallet: Wallet,
  box: Package,
};

export function WhyFeature({
  icon,
  title,
  text,
}: {
  icon: WhyFeatureIconName;
  title: string;
  text: string;
}) {
  const Icon = ICONS[icon];
  return (
    <div className="flex items-start gap-7">
      <span className="shrink-0 inline-flex size-10 items-center justify-center text-brand-red">
        <Icon className="size-10" strokeWidth={2} />
      </span>
      <div className="flex flex-1 flex-col gap-3">
        <p className="text-base font-bold leading-none text-brand-red">
          {title}
        </p>
        <p className="text-sm leading-tight text-brand-mute-2">{text}</p>
      </div>
    </div>
  );
}
