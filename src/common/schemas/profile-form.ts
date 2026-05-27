import { z } from 'zod';

/**
 * Profile page — two independent Zod schemas:
 *
 *  1. `profileInfoSchema`   — personal info + addresses panel.
 *  2. `changePasswordSchema` — password change panel.
 *
 * Persian error messages match the RTL UI copy exactly.
 */

/* ── Address sub-schema ─────────────────────────────────────── */
export const addressSchema = z.object({
  address: z
    .string()
    .min(5, 'آدرس باید حداقل ۵ کاراکتر باشد')
    .max(200, 'آدرس نباید بیشتر از ۲۰۰ کاراکتر باشد'),
  postalCode: z
    .string()
    .min(10, 'کد پستی باید ۱۰ رقم باشد')
    .max(10, 'کد پستی باید ۱۰ رقم باشد')
    .regex(/^[\d\u06F0-\u06F9]+$/, 'کد پستی فقط می‌تواند عدد باشد'),
});

export type AddressValues = z.infer<typeof addressSchema>;

/* ── Profile info schema ────────────────────────────────────── */
export const profileInfoSchema = z.object({
  lastName: z
    .string()
    .min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد')
    .max(60, 'نام خانوادگی نباید بیشتر از ۶۰ کاراکتر باشد'),
  phone: z
    .string()
    .min(10, 'شماره موبایل معتبر نیست')
    .max(15, 'شماره موبایل معتبر نیست')
    .regex(/^[\d\u06F0-\u06F9+\-\s()]+$/, 'شماره موبایل فقط می‌تواند عدد باشد'),
  address1: addressSchema,
  address2: addressSchema.partial().optional(),
});

export type ProfileInfoValues = z.infer<typeof profileInfoSchema>;

/* ── Password change schema ─────────────────────────────────── */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'رمز عبور فعلی الزامی است'),
    newPassword: z
      .string()
      .min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد')
      .max(72, 'رمز عبور نباید بیشتر از ۷۲ کاراکتر باشد'),
    confirmPassword: z.string().min(1, 'تایید رمز عبور الزامی است'),
  })
  .refine((data: { newPassword: string; confirmPassword: string }) => data.newPassword === data.confirmPassword, {
    message: 'رمز عبور جدید و تایید آن یکسان نیستند',
    path: ['confirmPassword'],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
