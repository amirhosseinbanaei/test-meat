import { Percent, Truck, CreditCard, PackageCheck } from 'lucide-react';
import { cn } from '@/common/lib/cn';

type ServiceFeature = {
  id: string;
  title: string;
  subtitle: string;
  icon: 'discount' | 'delivery' | 'payment' | 'packaging';
};

const features: ServiceFeature[] = [
  {
    id: 'discount',
    title: 'تخفیف بیشتر',
    subtitle: 'کالاها با قیمت مناسب ارسال می شود',
    icon: 'discount',
  },
  {
    id: 'delivery',
    title: 'ارسال بهترین کالاها',
    subtitle: 'گلچین محصولات از بین بهترین ها',
    icon: 'delivery',
  },
  {
    id: 'payment',
    title: 'پرداخت درب محل',
    subtitle: 'ابتدا محصول را دریافت کنید!',
    icon: 'payment',
  },
  {
    id: 'packaging',
    title: 'بسته بندی مناسب',
    subtitle: 'ارسال سفارش با بسته بندی مناسب',
    icon: 'packaging',
  },
];

function FeatureIcon({
  icon,
  className,
}: {
  icon: ServiceFeature['icon'];
  className?: string;
}) {
  const cls = cn('size-9 text-brand-red shrink-0', className);
  switch (icon) {
    case 'discount':  return <Percent      className={cls} strokeWidth={1.6} />;
    case 'delivery':  return <Truck        className={cls} strokeWidth={1.6} />;
    case 'payment':   return <CreditCard   className={cls} strokeWidth={1.6} />;
    case 'packaging': return <PackageCheck className={cls} strokeWidth={1.6} />;
  }
}

/**
 * ProfileServiceStrip — 4-column service-promise band at the bottom of /profile.
 *
 * Shares the same visual pattern as CartServiceStrip and ServiceFeaturesStrip
 * but is kept module-local to avoid coupling profile to cart or contact modules.
 *
 * Design (exact match):
 *   - Thin brand-red/25 border, rounded-[18px]
 *   - 4 equal columns with vertical dividers, 2×2 on mobile
 *   - Each cell: icon + title (red bold) + subtitle (mute light) — RTL row layout
 */
export function ProfileServiceStrip() {
  return (
    <section
      className="w-full border border-brand-line rounded-[18px] bg-white overflow-hidden"
      aria-label="مزایای خرید از میت پلاس"
      dir="rtl"
    >
      <div className="grid grid-cols-2 md:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={cn(
              'flex flex-row-reverse items-center gap-4 px-5 py-7',
              index < features.length - 1 && 'border-l border-brand-line',
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
