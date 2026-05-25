'use client';

import { Trash2 } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { formatPrice, type CartItem } from '../data/cart-content';

type CartItemsTableProps = {
  items: CartItem[];
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
};

/**
 * CartItemsTable — the main white rounded-[18px] bordered card.
 *
 * Desktop: 4-column table layout (RTL):
 *   محصول | قیمت | تعداد/کیلوگرم | جمع جزء
 *
 * Mobile: stacked card per item — product info at top, stepper + subtotal below.
 *
 * Design notes (exact match):
 *   - Border: border-brand-line, rounded-[18px]
 *   - Column headers: text-sm font-medium text-brand-ink, right-aligned
 *   - Price column: text-brand-olive (olive/green colour in design)
 *   - Stepper: border border-brand-line rounded-[8px], numbers in center
 *   - Row divider: border-t border-brand-line
 *   - Product image: ~60×60px, object-contain
 */
export function CartItemsTable({ items, onQtyChange, onRemove }: CartItemsTableProps) {
  return (
    <div
      className="w-full border border-brand-line rounded-[18px] overflow-hidden bg-white"
      dir="rtl"
    >
      {/* ── Header row — hidden on mobile ── */}
      <div className="hidden md:grid md:grid-cols-[2fr_1.5fr_1.8fr_1.5fr] items-center px-6 py-4 border-b border-brand-line bg-white">
        <span className="text-sm font-medium text-brand-ink text-right">محصول</span>
        <span className="text-sm font-medium text-brand-ink text-center">قیمت</span>
        <span className="text-sm font-medium text-brand-ink text-center">تعداد/ کیلوگرم</span>
        <span className="text-sm font-medium text-brand-ink text-left">جمع جزء</span>
      </div>

      {/* ── Item rows ── */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
          <p className="text-base font-medium text-brand-ink">سبد خرید شما خالی است</p>
          <p className="text-sm font-light text-brand-mute">محصولات مورد نظر خود را اضافه کنید</p>
          <a
            href="/shop"
            className="mt-2 inline-flex items-center justify-center h-10 px-6 rounded-[10px] bg-brand-olive text-brand-ink text-sm font-medium hover:brightness-95 transition-[filter]"
          >
            رفتن به فروشگاه
          </a>
        </div>
      ) : (
        items.map((item, index) => (
          <CartRow
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
            onQtyChange={onQtyChange}
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  );
}

/* ─── Single cart row ─── */
function CartRow({
  item,
  isLast,
  onQtyChange,
  onRemove,
}: {
  item: CartItem;
  isLast: boolean;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const subtotal = formatPrice(item.pricePerKg * item.qty);

  return (
    <>
      {/* ── Desktop row ── */}
      <div
        className={cn(
          'hidden md:grid md:grid-cols-[2fr_1.5fr_1.8fr_1.5fr] items-center px-6 py-5',
          !isLast && 'border-b border-brand-line',
        )}
      >
        {/* Col 1 — product */}
        <div className="flex items-center gap-4">
          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`حذف ${item.name} از سبد`}
            className="p-1.5 text-brand-mute hover:text-brand-red transition-colors rounded-[6px] hover:bg-red-50 shrink-0"
          >
            <Trash2 className="size-4" strokeWidth={1.8} />
          </button>
          <img
            src={item.image}
            alt={item.name}
            className="size-[60px] rounded-[10px] object-contain bg-brand-bg p-1 shrink-0"
          />
          <span className="text-sm font-medium text-brand-ink leading-snug">
            {item.name}
          </span>
        </div>

        {/* Col 2 — price per kg */}
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-medium text-brand-olive">{item.priceLabel}</span>
          <span className="text-xs text-brand-mute">تومان</span>
        </div>

        {/* Col 3 — qty stepper */}
        <div className="flex items-center justify-center">
          <QtyStepper
            qty={item.qty}
            onDec={() => onQtyChange(item.id, Math.max(1, item.qty - 1))}
            onInc={() => onQtyChange(item.id, item.qty + 1)}
          />
        </div>

        {/* Col 4 — subtotal */}
        <div className="flex items-center justify-end gap-1">
          <span className="text-sm font-medium text-brand-ink">{subtotal}</span>
          <span className="text-xs text-brand-mute">تومان</span>
        </div>
      </div>

      {/* ── Mobile row (stacked card) ── */}
      <div
        className={cn(
          'flex flex-col gap-4 px-4 py-5 md:hidden',
          !isLast && 'border-b border-brand-line',
        )}
      >
        {/* Product info row */}
        <div className="flex items-center gap-3">
          <img
            src={item.image}
            alt={item.name}
            className="size-[56px] rounded-[10px] object-contain bg-brand-bg p-1 shrink-0"
          />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-sm font-medium text-brand-ink leading-snug">
              {item.name}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-brand-olive">{item.priceLabel}</span>
              <span className="text-[11px] text-brand-mute">تومان</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`حذف ${item.name}`}
            className="p-1.5 text-brand-mute hover:text-brand-red transition-colors shrink-0"
          >
            <Trash2 className="size-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Stepper + subtotal row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-brand-mute">
            <span className="text-sm font-medium text-brand-ink">{subtotal}</span>
            <span>تومان</span>
          </div>
          <QtyStepper
            qty={item.qty}
            onDec={() => onQtyChange(item.id, Math.max(1, item.qty - 1))}
            onInc={() => onQtyChange(item.id, item.qty + 1)}
          />
        </div>
      </div>
    </>
  );
}

/* ─── Quantity stepper ─── */
function QtyStepper({
  qty,
  onDec,
  onInc,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div
      className="inline-flex items-center border border-brand-line rounded-[8px] overflow-hidden h-10"
      dir="ltr"
    >
      <button
        type="button"
        onClick={onDec}
        aria-label="کاهش تعداد"
        className="w-10 h-full flex items-center justify-center text-base font-medium text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
      >
        -
      </button>
      <span
        className="w-9 h-full flex items-center justify-center text-sm font-medium text-brand-ink border-x border-brand-line select-none"
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={onInc}
        aria-label="افزایش تعداد"
        className="w-10 h-full flex items-center justify-center text-base font-medium text-brand-ink hover:bg-brand-bg transition-colors cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
