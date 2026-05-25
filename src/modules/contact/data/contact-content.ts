// Static content for the /contact page.
// All copy mirrors the design exactly.

export const contactInfo = {
  address: 'تهران، صادقیه، خیابان هفتم ، پلاک ۲۱',
  postalCode: '۷۸۵۵۱۱۱۵۲',
  phone: '۰۲۱- ۴۴ ۴۲ ۵۸ ۷۴',
  email: 'info@meatplus.ir',
};

export type ServiceFeature = {
  id: string;
  title: string;
  subtitle: string;
  icon: 'discount' | 'delivery' | 'payment' | 'packaging';
};

export const serviceFeatures: ServiceFeature[] = [
  {
    id: 'discount',
    title: 'تخفیف بیشتر',
    subtitle: 'کالاها با قیمت مناسب ارسال می شود',
    icon: 'discount',
  },
  {
    id: 'delivery',
    title: 'ارسال بهترین کالاها',
    subtitle: 'کلچین محصولات از بین بهترین ها',
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

/** Google Maps embed URL — centred on Sadaghiyeh, Tehran */
export const MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d207193.4505232394!2d51.17523!3d35.70036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e00491ff3dcd9%3A0xf0b3697c567024bc!2sTehran%2C+Iran!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s';
