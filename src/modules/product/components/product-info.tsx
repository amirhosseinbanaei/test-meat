'use client';

import { useState } from 'react';
import { Heart, Bookmark, ShoppingCart, Send, Shield, Star } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { Button } from '@/common/components/ui/button';
import type { ProductDetail } from '../data/product-content';

/**
 * ProductInfo — the left-side info panel on the product detail page.
 *
 * Sections (RTL, top → bottom):
 *   Title row   — product name · bookmark · wishlist
 *   Description — short lorem paragraph
 *   Weight note — "وزن نهایی ۵۰۰ گرم می باشد" (bold red label)
 *   Price row   — price per kg
 *   CTA row     — quantity stepper + "افزودن به سبد خرید"
 *   Trust badges — free shipping · quality guarantee
 */
export function ProductInfo({ product }: { product: ProductDetail }) {
  const [qty, setQty] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const [wished, setWished] = useState(false);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  return (
    <div className="flex flex-col gap-5 text-right" dir="rtl">

      {/* ── Title + actions ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-ink leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-1 shrink-0">
            {/* Wishlist */}
            <button
              type="button"
              onClick={() => setWished((w) => !w)}
              aria-label="افزودن به علاقه مندی"
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                wished ? 'text-brand-red' : 'text-brand-ink hover:text-brand-red',
              )}
            >
              <Heart
                className="size-4"
                strokeWidth={2}
                fill={wished ? 'currentColor' : 'none'}
              />
              <span>افزودن به علاقه مندی</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => setBookmarked((b) => !b)}
              aria-label="نشان کردن"
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                bookmarked ? 'text-brand-red' : 'text-brand-ink hover:text-brand-red',
              )}
            >
              <Bookmark
                className="size-4"
                strokeWidth={2}
                fill={bookmarked ? 'currentColor' : 'none'}
              />
              <span>نشان کردن</span>
            </button>
          </div>
        </div>

        {/* Short description paragraph */}
        <p className="text-sm leading-[1.9] font-light text-brand-ink text-justify">
          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان
          گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای
          شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.
          کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می
          طلبد.
        </p>
      </div>

      {/* ── Weight note ── */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-brand-ink">
          وزن نهایی{' '}
          <span className="text-brand-red">۵۰۰ گرم می باشد</span>
        </p>
      </div>

      <hr className="border-brand-line" />

      {/* ── Price ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-brand-red text-sm">به ازای هر کیلوگرم</span>
        <span className="h-5 w-px bg-brand-line" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-brand-ink">{product.pricePerKg}</span>
          <span className="text-sm text-brand-ink">تومان</span>
        </div>
      </div>

      {/* ── Quantity + Add to cart ── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Add to cart */}
        <Button
          variant="olive"
          size="lg"
          className="flex items-center gap-2 px-6 h-12 flex-1 sm:flex-none"
        >
          <ShoppingCart className="size-4" strokeWidth={2} />
          <span>افزودن به سبد خرید</span>
        </Button>

        {/* Quantity stepper */}
        <div className="flex items-center border border-brand-line rounded-[10px] overflow-hidden h-12 shrink-0">
          <button
            type="button"
            onClick={dec}
            aria-label="کاهش تعداد"
            className="w-11 h-full flex items-center justify-center text-brand-ink text-lg font-medium hover:bg-brand-bg transition-colors"
          >
            −
          </button>
          <span
            className="w-10 h-full flex items-center justify-center text-base font-medium text-brand-ink border-x border-brand-line"
            aria-live="polite"
            aria-label={`تعداد: ${qty}`}
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={inc}
            aria-label="افزایش تعداد"
            className="w-11 h-full flex items-center justify-center text-brand-ink text-lg font-medium hover:bg-brand-bg transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="flex items-center gap-6 flex-wrap mt-1">
        <div className="flex items-center gap-2 text-xs text-brand-mute-2">
          <Send className="size-4 text-brand-olive" strokeWidth={1.8} />
          <span>ارسال رایگان</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-mute-2">
          <Shield className="size-4 text-brand-olive" strokeWidth={1.8} />
          <span>ضمانت کالا</span>
        </div>
      </div>
    </div>
  );
}
