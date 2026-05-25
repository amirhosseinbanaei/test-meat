import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { Button } from '@/common/components/ui/button';
import type { ShopProduct } from '../data/shop-content';

/**
 * ShopProductCard — shop-page specific card.
 *
 * Visual contract (matches the /shop design):
 *   • White card, rounded-[18px], fixed height on desktop, fluid on mobile
 *   • Product image (square, object-contain)
 *   • Product name centred below image
 *   • "به ازای هر کیلوگرم | <price> تومان" price row
 *   • Two-button footer: "افزودن به سبد خرید" (olive) + "مشاهده محصول" (ghost/link)
 */
export function ShopProductCard({
  product,
  className,
}: {
  product: ShopProduct;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'flex flex-col bg-white rounded-[18px] overflow-hidden',
        'shadow-[0_2px_16px_rgb(0_0_0/0.06)]',
        className,
      )}
    >
      {/* Product image */}
      <div className="relative w-full aspect-square overflow-hidden bg-brand-bg rounded-[18px]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4"
        />
      </div>

      {/* Info block */}
      <div className="flex flex-col items-center gap-2 px-4 pt-4 pb-5">
        {/* Name */}
        <h3 className="text-base font-medium text-brand-ink text-center leading-snug">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center justify-center gap-2 text-xs mt-1">
          <span className="text-brand-red whitespace-nowrap">به ازای هر کیلوگرم</span>
          <span className="block h-[18px] w-px bg-brand-line" />
          <span className="flex items-center gap-1 text-brand-ink whitespace-nowrap">
            <span className="text-sm font-medium">{product.pricePerKg}</span>
            <span>تومان</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between w-full gap-2 mt-2">
          {/* View product — text link style */}
          <a
            href={`/product/${product.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-brand-ink hover:text-brand-red transition-colors shrink-0"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} />
            <span>مشاهده محصول</span>
          </a>

          {/* Add to cart — olive pill */}
          <Button
            variant="olive"
            size="pill"
            className="flex items-center gap-1.5 text-xs font-normal px-3 h-9"
          >
            <ShoppingCart className="size-3.5" strokeWidth={2} />
            <span>افزودن به سبد خرید</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
