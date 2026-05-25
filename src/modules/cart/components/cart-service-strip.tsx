import { Percent, Truck, CreditCard, PackageCheck } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { cartServiceFeatures, type CartServiceFeature } from '../data/cart-content';

function FeatureIcon({ icon, className }: { icon: CartServiceFeature['icon']; className?: string }) {
  const cls = cn('size-9 text-brand-red shrink-0', className);
  switch (icon) {
    case 'discount':   return <Percent      className={cls} strokeWidth={1.6} />;
    case 'delivery':   return <Truck        className={cls} strokeWidth={1.6} />;
    case 'payment':    return <CreditCard   className={cls} strokeWidth={1.6} />;
    case 'packaging':  return <PackageCheck className={cls} strokeWidth={1.6} />;
  }
}

/**
 * CartServiceStrip — the 4-column service-promise band at the bottom of /cart.
 *
 * Design (exact match):
 *   - White card, border border-brand-line, rounded-[18px]
 *   - 4 equal columns, separated by vertical dividers
 *   - Each column: icon (right) + text block (title in red, subtitle in mute)
 *   - On mobile: 2×2 grid with horizontal + vertical dividers
 *   - Icon + text are row-flex (horizontal), matching the design layout
 */
export function CartServiceStrip() {
  return (
    <section
      className="w-full border border-brand-line rounded-[18px] bg-white overflow-hidden"
      aria-label="مزایای خرید از میت پلاس"
      dir="rtl"
    >
      <div className="grid grid-cols-2 md:grid-cols-4">
        {cartServiceFeatures.map((feature, index) => (
          <div
            key={feature.id}
            className={cn(
              'flex flex-row-reverse items-center gap-4 px-5 py-7',
              // Vertical dividers between columns
              index < cartServiceFeatures.length - 1 && 'border-l border-brand-line',
              // Horizontal divider between the two rows on mobile 2-col
              index < 2 && 'border-b border-brand-line md:border-b-0',
            )}
          >
            <FeatureIcon icon={feature.icon} />
            <div className="flex flex-col gap-1.5 text-right min-w-0">
              <p className="text-sm font-bold text-brand-red leading-tight">
                {feature.title}
              </p>
              <p className="text-xs font-light text-brand-mute leading-relaxed">
                {feature.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
