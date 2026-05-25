import { Bookmark, Star } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { Button } from '../ui/button';

/**
 * Product card — shared by the "تخفیف ویژه" (discount) and
 * "پرفروش ترین ها" (best-seller) carousels.
 *
 * Visual contract (matches the Meat Plus design):
 *   • 241×334 rounded-[18px] white card
 *   • rating + bookmark icon on the top row (RTL: rating on the right)
 *   • product hero image
 *   • product name (centred)
 *   • [discount variant only] floating "٪" badge over the image and the
 *     struck-through old price under the name
 *   • "به ازای هر کیلوگرم | <price> تومان" row
 *   • olive "مشاهده محصول" button anchored to the bottom of the card
 */
export type ProductCardProduct = {
  rating: string;
  image: string;
  name: string;
  price: string;
  oldPrice?: string;
};

export function ProductCard({
  product,
  variant = 'default',
  className,
}: {
  product: ProductCardProduct;
  variant?: 'default' | 'discount';
  className?: string;
}) {
  const isDiscount = variant === 'discount';

  return (
    <article
      className={cn(
        'relative shrink-0',
        'w-[241px] h-[334px]',
        'rounded-[18px] bg-white overflow-hidden',
        'snap-start',
        className,
      )}>
      {/* top row: rating ↔ bookmark */}
      <div className='flex items-center justify-between px-[19px] pt-[19px]'>
        <Bookmark
          className='size-[22px] text-brand-ink'
          strokeWidth={2}
          strokeLinejoin='round'
        />
        <span className='flex items-center gap-1.5 text-sm text-brand-ink'>
          {product.rating}
          <Star
            className='size-5  stroke-brand-amber'
            strokeWidth={1.5}
            strokeLinejoin='round'
          />
        </span>
      </div>

      {/* product image */}
      <div
        role='img'
        aria-label={product.name}
        className='mt-[22px] h-24 w-full bg-contain bg-center bg-no-repeat'
        style={{ backgroundImage: `url('${product.image}')` }}
      />

      {/* discount-only floating "%" badge */}
      {isDiscount && (
        <span
          aria-hidden
          className='absolute left-1/2 top-[144px] flex size-[25px] translate-x-[36px] items-center justify-center rounded-full bg-brand-red text-[13px] font-bold text-white font-sans'>
          ٪
        </span>
      )}

      {/* name */}
      <h3 className='mt-[18px] text-center font-medium text-base leading-none text-brand-ink px-3'>
        {product.name}
      </h3>

      {/* old price (discount only) */}
      {isDiscount && product.oldPrice && (
        <p className='mt-1.5 h-[18px] text-center text-xs font-medium leading-[18px] text-brand-mute'>
          <span className='price-strike'>{product.oldPrice}</span>
        </p>
      )}

      {/* price row */}
      <div
        className={cn(
          'mx-[18px] flex items-center justify-center gap-[9px] text-xs',
          isDiscount ? 'mt-2.5' : 'mt-6',
        )}>
        <span className='flex items-center gap-1 whitespace-nowrap text-brand-ink'>
          <span className='text-base font-medium'>{product.price}</span>
          <span>تومان</span>
        </span>
        <span className='block h-[21px] w-px bg-brand-line' />
        <span className='text-brand-red whitespace-nowrap'>
          به ازای هر کیلوگرم
        </span>
      </div>

      {/* CTA */}
      <Button
        variant='olive'
        size='pill'
        className='absolute bottom-5 left-1/2 -translate-x-1/2 w-[148px] font-normal'>
        مشاهده محصول
      </Button>
    </article>
  );
}
