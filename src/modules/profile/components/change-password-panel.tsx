'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2 } from 'lucide-react';
import { RhfFormField } from '@/common/components/form/rhf-form-field';
import { Button } from '@/common/components/ui/button';
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from '@/common/schemas/profile-form';

/**
 * ChangePasswordPanel — "تغییر گذرواژه" section of /profile.
 *
 * Design (exact match):
 *   Section title: "تغییر گذرواژه"
 *
 *   Three full-width password inputs stacked:
 *     - رمز عبور پیشین (in صورتی که قصد تغییر ندارید خالی بگذارید)
 *     - رمز عبور جدید  (in صورتی که قصد تغییر ندارید خالی بگذارید)
 *     - تایید رمز عبور جدید
 *
 *   olive CTA button right-aligned: "ذخیره تغییرات"
 *
 * Placed in `modules/profile/components/` — page-specific form panel.
 */
export function ChangePasswordPanel() {
  const [saved, setSaved] = useState(false);

  const methods = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (_data: ChangePasswordValues) => {
    // TODO: replace with your Server Action / API call
    await new Promise((r) => setTimeout(r, 1000));
    setSaved(true);
    reset();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Section title */}
      <h2 className="text-base font-medium text-brand-ink text-right">
        تغییر گذرواژه
      </h2>

      {saved && (
        <div className="flex items-center gap-2 bg-brand-olive/10 border border-brand-olive/30 rounded-[10px] px-4 py-3">
          <CheckCircle className="size-4 text-brand-olive shrink-0" strokeWidth={2} />
          <p className="text-sm font-light text-brand-ink">
            رمز عبور با موفقیت تغییر کرد.
          </p>
        </div>
      )}

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
          dir="rtl"
        >
          {/* Current password */}
          <RhfFormField<ChangePasswordValues>
            name="currentPassword"
            type="password"
            placeholder="رمز عبور پیشین (در صورتی که قصد تغییر ندارید خالی بگذارید)"
            aria-label="رمز عبور پیشین"
            autoComplete="current-password"
          />

          {/* New password */}
          <RhfFormField<ChangePasswordValues>
            name="newPassword"
            type="password"
            placeholder="رمز عبور جدید (در صورتی که قصد تغییر ندارید خالی بگذارید)"
            aria-label="رمز عبور جدید"
            autoComplete="new-password"
          />

          {/* Confirm password */}
          <RhfFormField<ChangePasswordValues>
            name="confirmPassword"
            type="password"
            placeholder="تایید رمز عبور جدید"
            aria-label="تایید رمز عبور جدید"
            autoComplete="new-password"
          />

          {/* Submit button — right-aligned (RTL end = left visually) */}
          <div className="flex justify-start pt-2">
            <Button
              type="submit"
              variant="olive"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[160px] flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'ذخیره تغییرات'
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
