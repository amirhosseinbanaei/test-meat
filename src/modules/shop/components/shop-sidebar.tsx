'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { Input } from '@/common/components/ui/input';
import {
  sidebarCategories,
  sidebarKeywords,
  SHOP_MAX_PRICE,
} from '../data/shop-content';

/**
 * ShopSidebar — right-side filter panel on /shop.
 *
 * Sections (RTL order, top → bottom):
 *   1. Search box with label
 *   2. Category list with bullet dots (active = red)
 *   3. Price range slider
 *   4. Keyword tag cloud
 */
export function ShopSidebar({ className }: { className?: string }) {
  const [priceValue, setPriceValue] = useState(100);

  return (
    <aside
      className={cn('flex flex-col gap-6 text-right', className)}
      dir="rtl"
    >
      {/* ── 1. Search ── */}
      <div className="bg-white rounded-[14px] p-5 shadow-[0_2px_12px_rgb(0_0_0/0.06)]">
        <p className="text-xs font-bold text-brand-red mb-3">
          محصول مورد نظر فوز را قیمت و بوکنید
        </p>
        <label className="flex items-center gap-2 h-10 px-3 rounded-[10px] border border-brand-line bg-brand-bg focus-within:ring-2 focus-within:ring-brand-red/20 text-brand-red">
          <Input
            className="text-xs text-brand-red text-right placeholder:text-brand-red/70"
            placeholder="جست و جو محصول...."
            aria-label="جستجوی محصول"
          />
          <Search className="size-4 shrink-0" strokeWidth={2} />
        </label>
      </div>

      {/* ── 2. Categories ── */}
      <div className="bg-white rounded-[14px] p-5 shadow-[0_2px_12px_rgb(0_0_0/0.06)]">
        <h3 className="text-sm font-bold text-brand-red mb-4">
          دسته بندی‌محصولات
        </h3>
        <ul className="flex flex-col gap-3">
          {sidebarCategories.map((cat) => (
            <li key={cat.label} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'size-2 rounded-full shrink-0',
                  cat.active ? 'bg-brand-red' : 'bg-brand-olive',
                )}
              />
              <a
                href="#"
                className={cn(
                  'text-sm transition-colors',
                  cat.active
                    ? 'text-brand-red font-bold'
                    : 'text-brand-ink font-light hover:text-brand-red',
                )}
              >
                {cat.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 3. Price Range ── */}
      <div className="bg-white rounded-[14px] p-5 shadow-[0_2px_12px_rgb(0_0_0/0.06)]">
        <h3 className="text-sm font-bold text-brand-ink mb-4">فلتر بر قیمت</h3>
        <div className="relative w-full">
          <input
            type="range"
            min={0}
            max={100}
            value={priceValue}
            onChange={(e) => setPriceValue(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              bg-brand-line
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:size-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-brand-red
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-md"
            style={{
              background: `linear-gradient(to left, #a42125 ${priceValue}%, #dedede ${priceValue}%)`,
            }}
            aria-label="حداکثر قیمت"
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-brand-ink">
          <span>به ازای هر کیلو</span>
          <span className="font-medium text-brand-red">{SHOP_MAX_PRICE}</span>
        </div>
      </div>

      {/* ── 4. Keywords ── */}
      <div className="bg-white rounded-[14px] p-5 shadow-[0_2px_12px_rgb(0_0_0/0.06)]">
        <h3 className="text-sm font-bold text-brand-ink mb-4">کلمات کلیدی</h3>
        <div className="flex flex-wrap gap-2">
          {sidebarKeywords.map((kw) => (
            <button
              key={kw}
              type="button"
              className="text-xs px-3 py-1.5 rounded-full border border-brand-line
                bg-brand-bg text-brand-ink hover:border-brand-red hover:text-brand-red
                transition-colors cursor-pointer"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
