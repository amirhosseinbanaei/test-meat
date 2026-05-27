/**
 * profile-content.ts — Static data, types and seed values for the /profile page.
 *
 * Types are intentionally minimal; in a real app these would come from
 * an API response. The seed data mirrors the Figma design exactly.
 */

/* ── Sidebar nav items ──────────────────────────────────────── */
export type ProfileNavItem = {
  id: ProfileSection;
  label: string;
  icon: 'edit' | 'lock' | 'orders' | 'logout';
};

export type ProfileSection =
  | 'edit-profile'
  | 'change-password'
  | 'orders'
  | 'logout';

export const profileNavItems: ProfileNavItem[] = [
  { id: 'edit-profile',    label: 'ویرایش حساب',      icon: 'edit'    },
  { id: 'change-password', label: 'تنظیمات رمز عبور', icon: 'lock'    },
  { id: 'orders',          label: 'سفارش ها',          icon: 'orders'  },
  { id: 'logout',          label: 'خروج',              icon: 'logout'  },
];

/* ── Order list ─────────────────────────────────────────────── */
export type OrderStatus = 'online' | 'cash';

export type Order = {
  id: string;
  orderNumber: string;
  date: string;     // Persian (Shamsi) date string — display only
  status: OrderStatus;
  statusLabel: string;
  amount: number;
  amountLabel: string; // pre-formatted Persian e.g. "۳/۵۰۰/۰۰۰"
};

export const sampleOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: '#۱۴۵۸۷۵۲',
    date: '۱۴۰۵/۰۲/۰۸',
    status: 'online',
    statusLabel: 'آنلاین انجام شده',
    amount: 3500000,
    amountLabel: '۳/۵۰۰/۰۰۰',
  },
  {
    id: 'order-2',
    orderNumber: '#۱۴۵۸۷۵۲',
    date: '۱۴۰۵/۰۲/۰۸',
    status: 'online',
    statusLabel: 'آنلاین انجام شده',
    amount: 3500000,
    amountLabel: '۳/۵۰۰/۰۰۰',
  },
];

/* ── Default form seed data (mock "current user") ───────────── */
export const defaultProfileInfo = {
  lastName: '',
  phone: '',
  address1: { address: '', postalCode: '' },
  address2: { address: '', postalCode: '' },
};

/* ── Phone prefix ────────────────────────────────────────────── */
export const PHONE_PREFIX = '+۹۸';
