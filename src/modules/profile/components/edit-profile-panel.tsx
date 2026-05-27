'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, CheckSquare, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { FormField } from '@/common/components/ds';
import { RhfFormField } from '@/common/components/form/rhf-form-field';
import {
  profileInfoSchema,
  type ProfileInfoValues,
} from '@/common/schemas/profile-form';
import { PHONE_PREFIX } from '../data/profile-content';

/**
 * EditProfilePanel — "ویرایش حساب کاربری" section of /profile.
 *
 * Design (exact match):
 *   Section title right-aligned: "ویرایش حساب کاربری"
 *
 *   Row 1 (RTL): نام خانوادگی* field (2/3) | شماره موبایل* with +۹۸ prefix (1/3)
 *   Row 2 (RTL): آدرس ارسال ۱ with MapPin icon + checkbox (wide) | کد پستی ۱ (narrow)
 *   Row 3 (RTL): آدرس ۲ with MapPin icon + checkbox (wide) | کد پستی ۲ (narrow)
 *   Row 4: "افزودن آدرس" red-outlined pill button (centered)
 *
 * Placed in `modules/profile/components/` — page-specific form panel.
 */
export function EditProfilePanel() {
  const [showAddress2, setShowAddress2] = useState(true);

  const methods = useForm<ProfileInfoValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      lastName: '',
      phone: '',
      address1: { address: '', postalCode: '' },
      address2: { address: '', postalCode: '' },
    },
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (_data: ProfileInfoValues) => {
    // TODO: replace with your Server Action / API call
    await new Promise((r) => setTimeout(r, 1000));
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-8"
        dir="rtl"
      >
        {/* ── Section title ───────────────────────────────── */}
        <h2 className="text-base font-medium text-brand-ink text-right">
          ویرایش حساب کاربری
        </h2>

        {/* ── Row 1: نام خانوادگی + شماره موبایل ─────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
          {/* نام خانوادگی — takes remaining space */}
          <RhfFormField<ProfileInfoValues>
            name="lastName"
            placeholder="نام خانوادگی*"
            autoComplete="family-name"
            aria-label="نام خانوادگی"
          />

          {/* شماره موبایل — with +۹۸ prefix badge */}
          <div className="flex items-stretch gap-0 w-full sm:w-[260px]">
            {/* Prefix badge */}
            <div
              className={cn(
                'flex items-center justify-center shrink-0',
                'h-[50px] px-3',
                'bg-white border border-brand-line rounded-r-[10px]',
                'text-sm font-light text-brand-mute border-l-0',
              )}
            >
              {PHONE_PREFIX}
            </div>
            {/* Phone input — left-rounded only */}
            <div className="flex-1">
              <FormField
                placeholder="شماره موبایل*"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-label="شماره موبایل"
                className="rounded-r-none border-r-0 text-right"
                {...methods.register('phone')}
              />
            </div>
          </div>
        </div>

        {/* ── Row 2: آدرس ۱ + کد پستی ۱ ─────────────────── */}
        <AddressRow
          addressName="address1.address"
          postalCodeName="address1.postalCode"
          addressPlaceholder="آدرس ارسال*"
          postalPlaceholder="کد پستی*"
        />

        {/* ── Row 3: آدرس ۲ + کد پستی ۲ ─────────────────── */}
        {showAddress2 && (
          <AddressRow
            addressName="address2.address"
            postalCodeName="address2.postalCode"
            addressPlaceholder="آدرس ۲"
            postalPlaceholder="کد پستی*"
          />
        )}

        {/* ── Add address button ───────────────────────────── */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAddress2((v) => !v)}
            className={cn(
              'inline-flex items-center gap-2',
              'h-[46px] px-7 rounded-[10px]',
              'border border-brand-red text-brand-red',
              'text-sm font-medium',
              'hover:bg-brand-red/5 transition-colors duration-150',
            )}
          >
            <Plus className="size-4" strokeWidth={2} />
            <span>افزودن آدرس</span>
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

/* ─── Address row sub-component ─────────────────────────────── */
type AddressRowProps = {
  addressName: string;
  postalCodeName: string;
  addressPlaceholder: string;
  postalPlaceholder: string;
};

function AddressRow({
  addressName,
  postalCodeName,
  addressPlaceholder,
  postalPlaceholder,
}: AddressRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3 items-start">
      {/* Address field with MapPin icon + checkbox on the left */}
      <div className="relative">
        <FormField
          placeholder={addressPlaceholder}
          aria-label={addressPlaceholder}
          className="pr-4 pl-20 text-right"
        />
        {/* MapPin icon — right side inside field */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-mute">
          <MapPin className="size-4" strokeWidth={1.8} />
        </span>
        {/* Checkbox — left side inside field (design shows a check icon) */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-olive cursor-pointer">
          <CheckSquare className="size-4" strokeWidth={1.8} />
        </span>
      </div>

      {/* Postal code */}
      <FormField
        placeholder={postalPlaceholder}
        aria-label={postalPlaceholder}
        inputMode="numeric"
        className="text-right"
      />
    </div>
  );
}
