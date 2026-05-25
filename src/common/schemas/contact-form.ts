import { z } from 'zod';

/**
 * Contact form schema — validates all three fields server-side and client-side.
 * Persian error messages match the RTL UI copy.
 */
export const contactFormSchema = z.object({
  lastName: z
    .string()
    .min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد')
    .max(60, 'نام خانوادگی نباید بیشتر از ۶۰ کاراکتر باشد'),

  phone: z
    .string()
    .min(10, 'شماره تماس معتبر نیست')
    .max(15, 'شماره تماس معتبر نیست')
    .regex(/^[\d\u06F0-\u06F9+\-\s()]+$/, 'شماره تماس فقط می‌تواند عدد باشد'),

  message: z
    .string()
    .min(10, 'پیام باید حداقل ۱۰ کاراکتر باشد')
    .max(1000, 'پیام نباید بیشتر از ۱۰۰۰ کاراکتر باشد'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
