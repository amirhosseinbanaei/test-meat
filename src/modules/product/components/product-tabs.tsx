'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { Button } from '@/common/components/ui/button';
import type { ProductDetail, ProductReview } from '../data/product-content';

/* ─── Star row helper ─── */
function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`امتیاز ${rating} از ۵`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            size === 'md' ? 'size-5' : 'size-4',
            i < rating ? 'stroke-brand-amber fill-brand-amber' : 'stroke-brand-line fill-brand-line',
          )}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/* ─── Single review card ─── */
function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* User review */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            {/* Avatar placeholder */}
            <div className="size-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-red font-bold text-sm shrink-0">
              {review.author.charAt(0)}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-brand-ink">{review.author}</span>
              <span className="text-xs text-brand-mute">{review.date}</span>
            </div>
          </div>
          <StarRow rating={review.rating} />
        </div>
        <p className="text-sm leading-[1.9] font-light text-brand-ink text-justify pr-13">
          {review.body}
        </p>
      </div>

      {/* Brand reply */}
      {review.replyBody && (
        <div className="mr-6 sm:mr-10 bg-brand-bg rounded-[12px] p-4 border-r-2 border-brand-red">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-7 rounded-full bg-brand-red flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">M</span>
            </div>
            <span className="text-xs font-bold text-brand-red">• Meatplus</span>
            <span className="text-xs text-brand-mute">پاسخ مجموعه</span>
          </div>
          <p className="text-sm leading-[1.9] font-light text-brand-ink text-justify">
            {review.replyBody}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Review sort bar ─── */
const SORT_OPTIONS = [
  { id: 'newest', label: 'جدیدترین' },
  { id: 'popular', label: 'دیدگاه خریداران' },
  { id: 'sorted', label: 'مرتب سازی' },
];

/* ─── Main Tabs component ─── */
type Tab = 'description' | 'reviews';

export function ProductTabs({ product }: { product: ProductDetail }) {
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [activeSort, setActiveSort] = useState('newest');

  return (
    <div className="flex flex-col gap-0" dir="rtl">
      {/* Tab headers */}
      <div className="flex items-center gap-6 border-b border-brand-line pb-0">
        {(
          [
            { id: 'description', label: 'توضیحات' },
            { id: 'reviews', label: 'دیدگاه ها' },
          ] as { id: Tab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative pb-3 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/30',
              activeTab === tab.id
                ? 'text-brand-red after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full after:bg-brand-red'
                : 'text-brand-mute hover:text-brand-ink',
            )}
          >
            {tab.label}
          </button>
        ))}

        {/* Rating summary on the right */}
        <div className="mr-auto flex items-center gap-2">
          <StarRow rating={Math.round(parseFloat(product.rating.replace('٫', '.')) || 4)} size="md" />
          <span className="text-xs text-brand-mute">
            ({product.reviewCount} نظر ثبت شده)
          </span>
        </div>
      </div>

      {/* Tab panels */}
      <div className="pt-6">
        {/* Description panel */}
        {activeTab === 'description' && (
          <div className="text-sm leading-[2] font-light text-brand-ink text-justify whitespace-pre-line">
            {product.description}
          </div>
        )}

        {/* Reviews panel */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-8">
            {/* CTA to submit review */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm font-medium text-brand-ink">
                شما هم درباره این کالا دیدگاه ثبت کنید:
              </p>
              <Button variant="olive" size="sm" className="text-xs px-4">
                ثبت نظر
              </Button>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveSort(opt.id)}
                  className={cn(
                    'text-xs px-4 py-1.5 rounded-full border transition-colors',
                    activeSort === opt.id
                      ? 'bg-brand-red border-brand-red text-white'
                      : 'border-brand-line text-brand-ink hover:border-brand-red hover:text-brand-red',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Review list */}
            {product.reviews.length > 0 ? (
              <div className="flex flex-col gap-8 divide-y divide-brand-line">
                {product.reviews.map((review) => (
                  <div key={review.id} className="pt-6 first:pt-0">
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-mute text-center py-8">
                هنوز دیدگاهی ثبت نشده است. اولین نفر باشید!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
