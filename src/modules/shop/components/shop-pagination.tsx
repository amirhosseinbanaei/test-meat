'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/common/lib/cn';

const TOTAL_PAGES = 2;

/**
 * ShopPagination — numbered page buttons with a prev-arrow, matching the
 * design: active page = brand-red pill, others = brand-bg rounded.
 */
export function ShopPagination() {
  const [page, setPage] = useState(1);

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label="صفحه‌بندی محصولات"
      dir="ltr"
    >
      {/* Prev arrow */}
      <button
        type="button"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        aria-label="صفحه قبل"
        className={cn(
          'flex items-center justify-center size-10 rounded-full',
          'border border-brand-line bg-white text-brand-ink',
          'hover:border-brand-red hover:text-brand-red transition-colors',
          'disabled:opacity-40 disabled:pointer-events-none',
        )}
      >
        <ChevronRight className="size-4" strokeWidth={2} />
      </button>

      {/* Page numbers */}
      {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setPage(n)}
          aria-current={page === n ? 'page' : undefined}
          className={cn(
            'flex items-center justify-center size-10 rounded-full text-sm font-medium transition-colors',
            page === n
              ? 'bg-brand-red text-white'
              : 'bg-brand-bg text-brand-ink hover:bg-brand-red/10',
          )}
        >
          {n}
        </button>
      ))}
    </nav>
  );
}
