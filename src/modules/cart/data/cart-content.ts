// Cart module static data.
// CartItem is the shape managed by the client store; initial seed data
// mirrors the two rows visible in the design.

export type CartItem = {
  id: string;
  name: string;
  image: string;
  pricePerKg: number;   // raw number for arithmetic
  priceLabel: string;   // pre-formatted Persian label (e.g. "۲/۴۰۰/۰۰۰")
  qty: number;
};

export const initialCartItems: CartItem[] = [
  {
    id: 'rasté-gosfandi',
    name: 'راسته گوسفندی کبابی',
    image: '/assets/card-beef.png',
    pricePerKg: 2400000,
    priceLabel: '۲/۴۰۰/۰۰۰',
    qty: 1,
  },
  {
    id: 'dandeh-gosaleh',
    name: 'دنده گوساله',
    image: '/assets/card-ribs.png',
    pricePerKg: 2400000,
    priceLabel: '۲/۴۰۰/۰۰۰',
    qty: 1,
  },
];

/** Formats a raw integer price into Persian numeral groups, e.g. 2400000 → "۲/۴۰۰/۰۰۰" */
export function formatPrice(value: number): string {
  const persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const grouped = value.toLocaleString('en-US'); // "2,400,000"
  return grouped
    .replace(/,/g, '/')
    .replace(/\d/g, (d) => persian[parseInt(d)]);
}

export type CartServiceFeature = {
  id: string;
  title: string;
  subtitle: string;
  icon: 'discount' | 'delivery' | 'payment' | 'packaging';
};

export const cartServiceFeatures: CartServiceFeature[] = [
  {
    id: 'discount',
    title: 'تخفیف بیشتر',
    subtitle: 'کالاها با قیمت مناسب ارسال می شود',
    icon: 'discount',
  },
  {
    id: 'delivery',
    title: 'ارسال بهترین کالاها',
    subtitle: 'گلچین محصولات از بین بهترین ها',
    icon: 'delivery',
  },
  {
    id: 'payment',
    title: 'پرداخت درب محل',
    subtitle: 'ابتدا محصول را دریافت کنید!',
    icon: 'payment',
  },
  {
    id: 'packaging',
    title: 'بسته بندی مناسب',
    subtitle: 'ارسال سفارش با بسته بندی مناسب',
    icon: 'packaging',
  },
];

// Simulated discount code
export const VALID_COUPON = 'MEAT10';
export const DISCOUNT_AMOUNT = 800000;
export const DISCOUNT_LABEL = '۸۰۰/۰۰۰';
