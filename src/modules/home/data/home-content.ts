// Content extracted verbatim from the "Meat Plus Home" design handoff bundle.
// All Persian copy, prices and asset references mirror the source prototype.

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: 'خانه', href: '/' },
  { label: 'فروشگاه', href: '#' },
  { label: 'بلاگ', href: '/blog' },
  { label: 'درباره ما', href: '/about' },
  { label: 'تماس با ما', href: '/contact' },
];

export type HeroSlide = {
  /** Background image for the slide. */
  image: string;
  /** Optional eyebrow shown above the headline. */
  eyebrow?: string;
  /** Headline (display font). */
  title: string;
  /** Sub-copy under the headline. */
  subtitle: string;
  /** Optional CTA. */
  cta?: { label: string; href: string };
  /**
   * When `true`, the source image has its own baked headline / decoration; the
   * slide template skips its own text overlay so the design stays pixel-true.
   */
  baked?: boolean;
};

export const heroSlides: HeroSlide[] = [
  {
    image: '/assets/hero-section-ref.jpg',
    title: 'گوشت قرمز تازه',
    subtitle: 'گوسفند، گوساله، شترمرغ و شتر',
    baked: true,
  },
  {
    image: '/assets/hero-steak.jpg',
    eyebrow: 'ویژه‌ی این هفته',
    title: 'استیک‌های آماده طبخ',
    subtitle: 'گوشت گرم و کشتار روز، آماده‌ی روی شعله',
    cta: { label: 'مشاهده محصولات', href: '#' },
  },
  {
    image: '/assets/art3.jpg',
    eyebrow: 'تخفیف ماه',
    title: 'دنده‌های کبابی ممتاز',
    subtitle: 'بهترین برش‌ها برای دورهمی‌های خانوادگی',
    cta: { label: 'سفارش بدهید', href: '#' },
  },
];

export type FeatureCardData = {
  id: 'card-beef' | 'card-chicken' | 'card-ribs' | 'card-sea';
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  decoration?: 'shrimp';
};

export const featureCardsTop: FeatureCardData[] = [
  {
    id: 'card-chicken',
    title: 'مرغ و فیله',
    subtitle: 'استفاده از گوشت گرم و کشتار روز',
    cta: 'مشاهده محصولات',
    image: '/assets/card-chicken.png',
  },
  {
    id: 'card-beef',
    title: 'گوشت گوساله',
    subtitle: 'استفاده از گوشت گرم و کشتار روز',
    cta: 'مشاهده محصولات',
    image: '/assets/card-beef.png',
  },
];

export const featureCardsBottom: FeatureCardData[] = [
  {
    id: 'card-ribs',
    title: 'دنده کبابی',
    subtitle: 'استفاده از گوشت گرم و کشتار روز',
    cta: 'مشاهده محصولات',
    image: '/assets/card-ribs.png',
  },
  {
    id: 'card-sea',
    title: 'دریایی',
    subtitle: 'صید تازه',
    cta: 'مشاهده محصولات',
    image: '/assets/card-fish.png',
    decoration: 'shrimp',
  },
];

export type Category = { label: string; image: string; arrow: boolean };

export const categoriesRowOne: Category[] = [
  { label: 'گوسفند', image: '/assets/card-beef.png', arrow: true },
  { label: 'گوساله', image: '/assets/card-ribs.png', arrow: true },
  { label: 'دریایی', image: '/assets/card-fish.png', arrow: true },
  { label: 'گوشت قرمز', image: '/assets/product-tile.png', arrow: true },
  { label: 'مرغ', image: '/assets/cat-white-chicken.png', arrow: true },
  { label: 'گوشت سفید', image: '/assets/card-chicken.png', arrow: true },
];

export const categoriesRowTwo: Category[] = [
  { label: 'مارکتی', image: '/assets/cat-market.png', arrow: true },
  { label: 'گوشت شتر', image: '/assets/cat-redmeat.png', arrow: true },
  { label: 'بلدرچین', image: '/assets/cat-shrimp.png', arrow: true },
  { label: 'شترمرغ', image: '/assets/cat-ostrich.png', arrow: true },
  { label: 'بوقلمون', image: '/assets/cat-turkey.png', arrow: false },
  { label: 'میگو', image: '/assets/cat-shrimp.png', arrow: false },
];

export const whyList: string[] = [
  'تولید سوسیس، کالباس و همبرگر در حضور مشتریان عزیز',
  'استفاده از گوشت گرم و کشتار روز',
  'لذت خوردن فست فودی سالم',
];

export type WhyFeature = {
  icon: 'truck' | 'discount' | 'wallet' | 'box';
  title: string;
  text: string;
};

export const whyFeatures: WhyFeature[] = [
  {
    icon: 'truck',
    title: 'ارسال بهترین کالاها',
    text: 'گلچین محصولات از بین بهترین ها',
  },
  {
    icon: 'discount',
    title: 'تخفیف بیشتر',
    text: 'کالاها با قیمت مناسب ارسال می شود',
  },
  {
    icon: 'wallet',
    title: 'پرداخت درب محل',
    text: 'ابتدا محصول را دریافت کنید!',
  },
  {
    icon: 'box',
    title: 'بسته بندی مناسب',
    text: 'ارسال سفارش با بسته بندی مناسب',
  },
];

export type Product = {
  rating: string;
  image: string;
  name: string;
  price: string;
  oldPrice?: string;
};

export const specialProducts: Product[] = [
  {
    rating: '۴.۷',
    image: '/assets/card-beef.png',
    name: 'گوشت گوساله',
    price: '۱/۲۰۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-chicken.png',
    name: 'ساق مرغ',
    price: '۷۵۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-ribs.png',
    name: 'گوشت گوساله چرخی',
    price: '۱/۲۰۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/product-tile.png',
    name: 'دنده گوسفندی',
    price: '۱/۲۰۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-beef.png',
    name: 'راسته گوسفندی',
    price: '۱/۲۰۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-beef.png',
    name: 'گوشت گوساله',
    price: '۱/۲۰۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-chicken.png',
    name: 'ساق مرغ',
    price: '۷۵۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-ribs.png',
    name: 'گوشت گوساله چرخی',
    price: '۱/۲۰۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/product-tile.png',
    name: 'دنده گوسفندی',
    price: '۱/۲۰۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-beef.png',
    name: 'راسته گوسفندی',
    price: '۱/۲۰۰/۰۰۰',
    oldPrice: 'تومان ۱/۹۰۰/۰۰۰',
  },
];

export const bestSellerProducts: Product[] = [
  {
    rating: '۴.۷',
    image: '/assets/card-beef.png',
    name: 'گوشت گوساله',
    price: '۱/۲۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-chicken.png',
    name: 'ساق مرغ',
    price: '۷۵۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-ribs.png',
    name: 'گوشت گوساله چرخ شده',
    price: '۱/۲۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/product-tile.png',
    name: 'دنده گوسفندی',
    price: '۲/۲۰۰/۰۰۰',
  },
  {
    rating: '۴.۷',
    image: '/assets/card-beef.png',
    name: 'راسته گوسفندی',
    price: '۳/۲۰۰/۰۰۰',
  },
];

export type Article = {
  image: string;
  day: string;
  month: string;
  title: string;
  body: string;
};

export const articles: Article[] = [
  {
    image: '/assets/art1-b.png',
    day: '۸',
    month: 'دی',
    title: 'پیشنهاد برای دورهمی',
    body: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ...',
  },
  {
    image: '/assets/art2.jpg',
    day: '۱۰',
    month: 'آبان',
    title: 'انواع پیشنهاد غذای دریایی',
    body: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ...',
  },
  {
    image: '/assets/art3.jpg',
    day: '۱۸',
    month: 'مهر',
    title: 'انواع استیک خانگی',
    body: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ...',
  },
  {
    image: '/assets/art4-b.jpg',
    day: '۲۱',
    month: 'مهر',
    title: 'طرز تهیه گوشت کبابی',
    body: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ...',
  },
];

export const footerQuickLinks: NavLink[] = [
  { label: 'دسته بندی محصولات', href: '#' },
  { label: 'مقالات', href: '#' },
  { label: 'همکاری با ما', href: '#' },
  { label: 'درباره ما', href: '#' },
  { label: 'تماس با ما', href: '#' },
];

export const footerAbout =
  'میت پلاس با هدف عرضه محصولات پروتئینی خام و فرآوری شده آماده طبخ در سال ۱۴۰۰ تاسیس گردید و در راستای سیاست های کیفیتی خود استاندارد های ISO22000 و H.A.C.C.P را بکار گرفته است...';

export const footerContact = [
  { label: 'تلفن:', value: '۰۲۱-۶۵۳ ۵۲ ۲۳' },
  { label: 'آدرس:', value: 'صادقیه، خیابان هفتم، پلاک ۱۲' },
  { label: 'ایمیل:', value: 'info@meatplus.com' },
];

export const footerCopyright =
  'تمامی حقوق اثر محفوظ است @ ۱۴۰۵. طراحی آسمان ثبت';
