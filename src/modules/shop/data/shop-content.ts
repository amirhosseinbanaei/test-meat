// Content for the /shop (فروشگاه) page.
// All copy mirrors the design; photos will be replaced by the user.

export type ShopProduct = {
  id: string;
  name: string;
  pricePerKg: string;
  image: string;
  rating: string;
};

export const shopProducts: ShopProduct[] = [
  {
    id: 'p1',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۷۰۰/۰۰۰',
    image: '/assets/card-beef.png',
    rating: '۴.۸',
  },
  {
    id: 'p2',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۲۰۰/۰۰۰',
    image: '/assets/card-ribs.png',
    rating: '۴.۶',
  },
  {
    id: 'p3',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۲۰۰/۰۰۰',
    image: '/assets/product-tile.png',
    rating: '۴.۷',
  },
  {
    id: 'p4',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۲۰۰/۰۰۰',
    image: '/assets/card-chicken.png',
    rating: '۴.۵',
  },
  {
    id: 'p5',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۲۰۰/۰۰۰',
    image: '/assets/card-ribs.png',
    rating: '۴.۷',
  },
  {
    id: 'p6',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۷۰۰/۰۰۰',
    image: '/assets/card-beef.png',
    rating: '۴.۹',
  },
  {
    id: 'p7',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۲۰۰/۰۰۰',
    image: '/assets/product-tile.png',
    rating: '۴.۶',
  },
  {
    id: 'p8',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۲۰۰/۰۰۰',
    image: '/assets/card-ribs.png',
    rating: '۴.۷',
  },
  {
    id: 'p9',
    name: 'گوشت گوساله',
    pricePerKg: '۱/۷۰۰/۰۰۰',
    image: '/assets/card-beef.png',
    rating: '۴.۸',
  },
];

export type SidebarCategory = { label: string; active?: boolean };

export const sidebarCategories: SidebarCategory[] = [
  { label: 'گوشت سفید' },
  { label: 'مرغ' },
  { label: 'گوشت قرمز', active: true },
  { label: 'دریایی' },
  { label: 'گوساله' },
  { label: 'گوسفند' },
  { label: 'بوقلمون' },
  { label: 'شتر مرغ' },
  { label: 'گوشت شتر' },
  { label: 'مارکتی' },
];

export const sidebarKeywords: string[] = [
  'گوشت کبابی',
  'دنده گوساله',
  'سینه مرغ',
  'گوشت سفید دریایی',
  'میگو',
];

export const SHOP_TOTAL_PRODUCTS = '۱۸';
export const SHOP_SHOWING = '۱۳';
export const SHOP_MAX_PRICE = '۵/۰۰۰/۰۰۰';

export const shopHeroBannerData = {
  title: 'فروشگاه آنلاین\nمحصولات پروتئینر',
  subtitle: 'گوسفند، گوساله، شترمرغ و شتر',
  image: '/assets/hero-section-ref.jpg',
};
