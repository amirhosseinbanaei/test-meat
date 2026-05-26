import { Check } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { sampleOrders, type Order } from '../data/profile-content';

/**
 * OrdersPanel — "سفارش ها" section of /profile.
 *
 * Design (exact match):
 *   Section title: "سفارشات"
 *
 *   Table header row (RTL — right→left):
 *     شماره سفارش | تاریخ سفارش | پرداخت | مبلغ سفارش | مشاهده فاکتور
 *
 *   Each order row:
 *     - Order number (black, medium)
 *     - Date (light)
 *     - Status: checkmark + "آنلاین انجام شده" in brand-olive
 *     - Amount + "تومان" in brand-red
 *     - "مشاهده فاکتور" cream pill button
 *
 *   Mobile: stacked card per order
 *
 * Placed in `modules/profile/components/` — page-specific panel.
 */
export function OrdersPanel() {
  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Section title */}
      <h2 className="text-base font-medium text-brand-ink text-right">
        سفارشات
      </h2>

      {/* Orders container */}
      <div className="flex flex-col gap-3">
        {sampleOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm font-medium text-brand-ink">
              هنوز سفارشی ثبت نکرده‌اید
            </p>
            <p className="text-xs font-light text-brand-mute">
              محصولات مورد نظر خود را از فروشگاه انتخاب کنید
            </p>
            <a
              href="/shop"
              className="mt-2 inline-flex items-center justify-center h-10 px-6 rounded-[10px] bg-brand-olive text-brand-ink text-sm font-medium hover:brightness-95 transition-[filter]"
            >
              رفتن به فروشگاه
            </a>
          </div>
        ) : (
          <>
            {/* ── Desktop table header — hidden on mobile ── */}
            <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] items-center px-5 py-3 border-b border-brand-line bg-brand-bg rounded-t-[14px]">
              <span className="text-xs font-medium text-brand-ink text-right">
                شماره سفارش
              </span>
              <span className="text-xs font-medium text-brand-ink text-center">
                تاریخ سفارش
              </span>
              <span className="text-xs font-medium text-brand-ink text-center">
                پرداخت
              </span>
              <span className="text-xs font-medium text-brand-ink text-center">
                مبلغ سفارش
              </span>
              <span className="text-xs font-medium text-brand-ink text-left w-28 text-center">
                &nbsp;
              </span>
            </div>

            {/* ── Order rows ── */}
            <div className="border border-brand-line rounded-[14px] overflow-hidden">
              {sampleOrders.map((order, index) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isLast={index === sampleOrders.length - 1}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Single order row ────────────────────────────────────────── */
function OrderRow({ order, isLast }: { order: Order; isLast: boolean }) {
  return (
    <>
      {/* ── Desktop row ── */}
      <div
        className={cn(
          'hidden md:grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] items-center px-5 py-4 bg-white',
          !isLast && 'border-b border-brand-line',
        )}
      >
        {/* Order number */}
        <span className="text-sm font-medium text-brand-ink text-right">
          {order.orderNumber}
        </span>

        {/* Date */}
        <span className="text-sm font-light text-brand-ink text-center">
          {order.date}
        </span>

        {/* Payment status */}
        <div className="flex items-center justify-center gap-1.5">
          <Check className="size-3.5 text-brand-olive" strokeWidth={2.5} />
          <span className="text-sm font-medium text-brand-olive">
            {order.statusLabel}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-medium text-brand-red">
            {order.amountLabel}
          </span>
          <span className="text-xs font-light text-brand-mute">تومان</span>
        </div>

        {/* Invoice button */}
        <div className="flex justify-center w-28">
          <button
            type="button"
            className="h-9 px-4 rounded-[8px] bg-brand-cream text-brand-ink text-xs font-medium hover:brightness-95 transition-[filter] cursor-pointer"
          >
            مشاهده فاکتور
          </button>
        </div>
      </div>

      {/* ── Mobile card ── */}
      <div
        className={cn(
          'flex flex-col gap-3 px-4 py-4 bg-white md:hidden',
          !isLast && 'border-b border-brand-line',
        )}
      >
        {/* Top row: order number + date */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-light text-brand-mute">{order.date}</span>
          <span className="text-sm font-medium text-brand-ink">
            {order.orderNumber}
          </span>
        </div>

        {/* Middle row: status */}
        <div className="flex items-center gap-1.5 justify-end">
          <Check className="size-3.5 text-brand-olive" strokeWidth={2.5} />
          <span className="text-xs font-medium text-brand-olive">
            {order.statusLabel}
          </span>
        </div>

        {/* Bottom row: amount + invoice button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="h-8 px-4 rounded-[8px] bg-brand-cream text-brand-ink text-xs font-medium hover:brightness-95 transition-[filter]"
          >
            مشاهده فاکتور
          </button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-brand-red">
              {order.amountLabel}
            </span>
            <span className="text-xs font-light text-brand-mute">تومان</span>
          </div>
        </div>
      </div>
    </>
  );
}
