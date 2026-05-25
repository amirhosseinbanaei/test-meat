'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { VALID_COUPON } from '../data/cart-content';

type CouponRowProps = {
  onApply: (valid: boolean) => void;
};

/**
 * CouponRow — the discount code strip.
 *
 * Design (exact match):
 *   - White card, border border-brand-line, rounded-[18px]
 *   - Inside: input on the right (placeholder "کد تخفیف") + olive button on the left
 *   - Button label: "اعمال تخفیف"
 *   - Input border: only a left divider between input and button (matching the design's
 *     single full-width strip look — the right half is the input, left half is the button)
 */
export function CouponRow({ onApply }: CouponRowProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleApply = () => {
    if (!code.trim()) return;
    const isValid = code.trim().toUpperCase() === VALID_COUPON;
    setStatus(isValid ? 'valid' : 'invalid');
    onApply(isValid);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div
      className="w-full border border-brand-line rounded-[18px] overflow-hidden bg-white"
      dir="rtl"
    >
      <div className="flex items-stretch h-14 sm:h-[52px]">
        {/* Input — right side */}
        <div className="flex-1 flex items-center px-4 gap-2 min-w-0">
          {status === 'valid' && (
            <CheckCircle className="size-4 text-brand-olive shrink-0" strokeWidth={2} />
          )}
          {status === 'invalid' && (
            <XCircle className="size-4 text-brand-red shrink-0" strokeWidth={2} />
          )}
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            onKeyDown={handleKeyDown}
            placeholder="کد تخفیف"
            aria-label="کد تخفیف"
            className="flex-1 bg-transparent text-sm text-right text-brand-ink placeholder:text-brand-mute outline-none min-w-0"
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-brand-line self-stretch" aria-hidden />

        {/* Button — left side */}
        <button
          type="button"
          onClick={handleApply}
          className="h-full px-6 sm:px-8 bg-brand-olive text-brand-ink text-sm font-medium whitespace-nowrap hover:brightness-95 transition-[filter] active:scale-[0.98] cursor-pointer"
        >
          اعمال تخفیف
        </button>
      </div>

      {/* Feedback message */}
      {status === 'valid' && (
        <p className="text-xs text-brand-olive px-4 pb-3 font-light">
          کد تخفیف با موفقیت اعمال شد!
        </p>
      )}
      {status === 'invalid' && (
        <p className="text-xs text-brand-red px-4 pb-3 font-light">
          کد تخفیف نامعتبر است.
        </p>
      )}
    </div>
  );
}
