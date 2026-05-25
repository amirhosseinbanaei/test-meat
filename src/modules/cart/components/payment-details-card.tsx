import { ArrowLeft } from 'lucide-react';
import { formatPrice, DISCOUNT_LABEL } from '../data/cart-content';

type PaymentDetailsProps = {
  itemCount: number;
  totalRaw: number;
  discountApplied: boolean;
};

/**
 * PaymentDetailsCard — the white bordered card below the coupon row.
 *
 * Design (exact match):
 *   - White card, border border-brand-line, rounded-[18px], p-6
 *   - Title: "جزئیات پرداخت" right-aligned, font-medium
 *   - Three rows: جمع اقلام سفارش (N) | تخفیف | جمع نهایی
 *   - Each row: label right, value left — values in brand-olive
 *   - Rows separated by border-t border-brand-line
 *   - Checkout button: full-width, bg-brand-red, text-white, rounded-[14px], h-14
 *     label: "ادامه جهت تسویه حساب" with left arrow icon
 */
export function PaymentDetailsCard({
  itemCount,
  totalRaw,
  discountApplied,
}: PaymentDetailsProps) {
  const discountRaw = discountApplied ? 800000 : 0;
  const finalRaw = Math.max(0, totalRaw - discountRaw);

  const totalLabel = formatPrice(totalRaw);
  const finalLabel = formatPrice(finalRaw);

  return (
    <div className="flex flex-col gap-0 w-full" dir="rtl">
      {/* Details card */}
      <div className="border border-brand-line rounded-[18px] bg-white overflow-hidden">
        {/* Title */}
        <div className="px-6 pt-5 pb-4">
          <h2 className="text-base font-medium text-brand-ink text-right">
            جزئیات پرداخت
          </h2>
        </div>

        {/* Row 1 — order subtotal */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-line">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-medium text-brand-olive">{totalLabel}</span>
            <span className="font-light text-brand-mute">تومان</span>
          </div>
          <span className="text-sm font-light text-brand-ink">
            جمع اقلام سفارش ({itemCount})
          </span>
        </div>

        {/* Row 2 — discount */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-line">
          <div className="flex items-center gap-1 text-sm">
            {discountApplied ? (
              <>
                <span className="font-medium text-brand-olive">{DISCOUNT_LABEL}</span>
                <span className="font-light text-brand-mute">تومان</span>
              </>
            ) : (
              <span className="font-light text-brand-mute">—</span>
            )}
          </div>
          <span className="text-sm font-light text-brand-ink">تخفیف</span>
        </div>

        {/* Row 3 — final total */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-line">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-medium text-brand-olive">{finalLabel}</span>
            <span className="font-light text-brand-mute">تومان</span>
          </div>
          <span className="text-sm font-light text-brand-ink">جمع نهایی</span>
        </div>
      </div>

      {/* Checkout button — sits flush below the card */}
      <button
        type="button"
        className="mt-4 w-full h-14 rounded-[14px] bg-brand-red text-white text-base font-medium
          flex items-center justify-center gap-3
          hover:brightness-95 transition-[filter] active:scale-[0.99] cursor-pointer"
        aria-label="ادامه جهت تسویه حساب"
      >
        <ArrowLeft className="size-5" strokeWidth={2} />
        <span>ادامه جهت تسویه حساب</span>
      </button>
    </div>
  );
}
