import {
  Percent,
  Truck,
  CreditCard,
  PackageCheck,
} from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { serviceFeatures, type ServiceFeature } from '../data/contact-content';

/** Maps the icon key to the matching Lucide component. */
function FeatureIcon({
  icon,
  className,
}: {
  icon: ServiceFeature['icon'];
  className?: string;
}) {
  const cls = cn('size-10 text-brand-red shrink-0', className);
  switch (icon) {
    case 'discount':
      return <Percent className={cls} strokeWidth={1.6} />;
    case 'delivery':
      return <Truck className={cls} strokeWidth={1.6} />;
    case 'payment':
      return <CreditCard className={cls} strokeWidth={1.6} />;
    case 'packaging':
      return <PackageCheck className={cls} strokeWidth={1.6} />;
  }
}

/**
 * ServiceFeaturesStrip — horizontal 4-column band (collapses to 2-col on
 * mobile, 4-col on md+) showing the four service promises.
 *
 * Bordered card, matching the design's thin red outline container.
 */
export function ServiceFeaturesStrip() {
  return (
    <section
      className="w-full border border-brand-red/25 rounded-[16px] overflow-hidden"
      aria-label="مزایای خدمات میت پلاس"
      dir="rtl"
    >
      <div className="grid grid-cols-2 md:grid-cols-4">
        {serviceFeatures.map((feature, index) => (
          <div
            key={feature.id}
            className={cn(
              'flex flex-col items-center gap-3 px-4 py-8 text-center',
              // Vertical divider between columns (except last)
              index < serviceFeatures.length - 1 &&
                'border-l border-brand-red/20',
              // Horizontal divider between rows on 2-col mobile
              index < 2 && 'border-b border-brand-red/20 md:border-b-0',
            )}
          >
            <FeatureIcon icon={feature.icon} />
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-bold text-brand-red">
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
