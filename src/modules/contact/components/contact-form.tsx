'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { RhfFormField } from '@/common/components/form/rhf-form-field';
import {
  contactFormSchema,
  type ContactFormValues,
} from '@/common/schemas/contact-form';

/**
 * ContactForm — React Hook Form + Zod powered contact form.
 *
 * Fields (RTL order in the design):
 *   Row 1: نام خانوادگی* | شماره تماس*   (two columns on ≥sm)
 *   Row 2: پیام شما                         (full width textarea)
 *   Row 3: ارسال button (red pill, arrow icon)
 *
 * On submit simulates an async request (replace with your Server Action).
 * Shows a success confirmation card after submission.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const methods = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { lastName: '', phone: '', message: '' },
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (_data: ContactFormValues) => {
    // TODO: replace with your Server Action / API call
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center" dir="rtl">
        <CheckCircle className="size-14 text-brand-olive" strokeWidth={1.5} />
        <p className="text-base font-medium text-brand-ink">
          پیام شما با موفقیت ارسال شد!
        </p>
        <p className="text-sm font-light text-brand-mute">
          کارشناسان ما در اولین فرصت با شما تماس خواهند گرفت.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setSubmitted(false)}
        >
          ارسال پیام جدید
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
        dir="rtl"
      >
        {/* Row 1 — last name + phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RhfFormField<ContactFormValues>
            name="lastName"
            placeholder="نام خانوادگی*"
            autoComplete="family-name"
            aria-label="نام خانوادگی"
          />
          <RhfFormField<ContactFormValues>
            name="phone"
            placeholder="شماره تماس*"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-label="شماره تماس"
          />
        </div>

        {/* Row 2 — message */}
        <RhfFormField<ContactFormValues>
          name="message"
          as="textarea"
          rows={7}
          placeholder="پیام شما"
          aria-label="پیام شما"
          className="resize-none"
        />

        {/* Row 3 — submit */}
        <div className="flex items-center justify-start">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-red text-white hover:brightness-95 h-12 px-8 rounded-[10px] flex items-center gap-3 min-w-[130px]"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <ArrowLeft className="size-4" strokeWidth={2} />
                <span>ارسال</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
