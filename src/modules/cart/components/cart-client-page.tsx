'use client';

import { useState } from 'react';
import { Container } from '@/common/components/ds';
import { CartBreadcrumb } from './cart-breadcrumb';
import { CartItemsTable } from './cart-items-table';
import { CouponRow } from './coupon-row';
import { PaymentDetailsCard } from './payment-details-card';
import { CartServiceStrip } from './cart-service-strip';
import { initialCartItems, type CartItem } from '../data/cart-content';

/**
 * CartClientPage — all interactive state lives here:
 *   - items array (qty changes, remove)
 *   - discount flag (coupon applied)
 *
 * This is a client component. The parent server component (CartPage) simply
 * renders this so the route stays a Server Component at the top level.
 */
export function CartClientPage() {
  const [items, setItems] = useState<CartItem[]>(initialCartItems);
  const [discountApplied, setDiscountApplied] = useState(false);

  const handleQtyChange = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalRaw = items.reduce(
    (sum, item) => sum + item.pricePerKg * item.qty,
    0,
  );

  return (
    <div className="flex-1 bg-white" dir="rtl">
      <Container>
        {/* Breadcrumb */}
        <CartBreadcrumb />

        {/* Main stack */}
        <div className="flex flex-col gap-5 pb-16">
          {/* Cart items table */}
          <CartItemsTable
            items={items}
            onQtyChange={handleQtyChange}
            onRemove={handleRemove}
          />

          {/* Coupon row */}
          <CouponRow onApply={(valid) => setDiscountApplied(valid)} />

          {/* Payment summary */}
          <PaymentDetailsCard
            itemCount={items.reduce((sum, item) => sum + item.qty, 0)}
            totalRaw={totalRaw}
            discountApplied={discountApplied}
          />

          {/* Service strip */}
          <CartServiceStrip />
        </div>
      </Container>
    </div>
  );
}
