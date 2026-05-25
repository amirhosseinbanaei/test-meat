'use client';

import { useState } from 'react';
import { cn } from '@/common/lib/cn';
import type { ProductDetail } from '../data/product-content';

/**
 * ProductGallery — right-side image block on the product detail layout.
 *
 * On desktop: stacked vertically (large hero + 3 thumbnail strip below).
 * On mobile: hero fills full width, thumbnails scroll horizontally.
 *
 * Active thumbnail gets a brand-red ring.
 */
export function ProductGallery({ product }: { product: ProductDetail }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main hero image */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-[18px] overflow-hidden bg-brand-bg">
        <img
          src={product.images[activeIndex]}
          alt={product.name}
          className="w-full h-full object-contain p-6 transition-all duration-300"
          key={activeIndex}
        />
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1" dir="rtl">
        {product.images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`تصویر ${i + 1}`}
            aria-pressed={activeIndex === i}
            className={cn(
              'flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-[12px] overflow-hidden',
              'bg-brand-bg border-2 transition-all duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40',
              activeIndex === i
                ? 'border-brand-red shadow-[0_0_0_2px_rgb(164_33_37/0.15)]'
                : 'border-brand-line hover:border-brand-mute',
            )}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-contain p-2"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
