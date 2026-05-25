// Product catalogue — drives both the /product/[slug] detail page and the
// "similar products" rail.  Each entry is the single source of truth for a
// product: slug, images, price, description, reviews, weight note, etc.

import type { ProductCardProduct } from '@/common/components/ds';

export type ProductReview = {
  id: string;
  author: string;
  date: string;
  rating: number; // 1–5
  body: string;
  replyBody?: string;
};

export type ProductDetail = {
  slug: string;
  name: string;
  /** Short tagline shown in the breadcrumb / hero banner. */
  category: string;
  /** All images: first is the main hero, rest shown as thumbnails. */
  images: string[];
  pricePerKg: string;
  rating: string;
  reviewCount: string;
  /** Descriptive body shown in the "توضیحات" tab. */
  description: string;
  weightNote: string;
  reviews: ProductReview[];
};

export const allProducts: ProductDetail[] = [
  {
    slug: 'rasté-gosfandi',
    name: 'راسته گوسفندی کبابی',
    category: 'گوشت قرمز',
    images: [
      '/assets/card-beef.png',
      '/assets/card-ribs.png',
      '/assets/product-tile.png',
    ],
    pricePerKg: '۱/۲۰۰/۰۰۰',
    rating: '۴.۷',
    reviewCount: '۳',
    weightNote: 'وزن نهایی ۵۰۰ گرم می باشد',
    description:
      'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد.\n\nلورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته حال و آینده شناخت فراوان جامعه و متخصصان را می طلبد.',
    reviews: [
      {
        id: 'r1',
        author: 'مریم میلانی',
        date: '۵ شهریور ۱۴۰۱',
        rating: 3,
        body: 'سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد.',
        replyBody:
          'کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد.',
      },
    ],
  },
  {
    slug: 'gosht-gosaleh',
    name: 'گوشت گوساله',
    category: 'گوشت قرمز',
    images: ['/assets/card-beef.png', '/assets/product-tile.png', '/assets/card-ribs.png'],
    pricePerKg: '۱/۷۰۰/۰۰۰',
    rating: '۴.۸',
    reviewCount: '۵',
    weightNote: 'وزن نهایی ۵۰۰ گرم می باشد',
    description:
      'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.',
    reviews: [],
  },
  {
    slug: 'dandeh-gosaleh',
    name: 'دنده گوساله',
    category: 'گوشت قرمز',
    images: ['/assets/card-ribs.png', '/assets/card-beef.png', '/assets/product-tile.png'],
    pricePerKg: '۲/۷۰۰/۰۰۰',
    rating: '۴.۷',
    reviewCount: '۲',
    weightNote: 'وزن نهایی ۵۰۰ گرم می باشد',
    description:
      'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است.',
    reviews: [],
  },
  {
    slug: 'gosht-gosaleh-charkh-shodeh',
    name: 'گوشت گوساله چرخ شده',
    category: 'گوشت قرمز',
    images: ['/assets/product-tile.png', '/assets/card-beef.png', '/assets/card-ribs.png'],
    pricePerKg: '۱/۷۰۰/۰۰۰',
    rating: '۴.۷',
    reviewCount: '۴',
    weightNote: 'وزن نهایی ۵۰۰ گرم می باشد',
    description:
      'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است.',
    reviews: [],
  },
  {
    slug: 'saq-morgh',
    name: 'ساق مرغ',
    category: 'گوشت سفید',
    images: ['/assets/card-chicken.png', '/assets/card-beef.png', '/assets/product-tile.png'],
    pricePerKg: '۷۵۰/۰۰۰',
    rating: '۴.۷',
    reviewCount: '۶',
    weightNote: 'وزن نهایی ۵۰۰ گرم می باشد',
    description:
      'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است.',
    reviews: [],
  },
];

/** Products shown in the "similar products" carousel (with slug for linking). */
export const similarProducts: ProductCardProduct[] = allProducts.map((p) => ({
  name: p.name,
  image: p.images[0],
  price: p.pricePerKg,
  rating: p.rating,
  slug: p.slug,
}));

/** Resolve a slug to its product detail (returns undefined if not found). */
export function getProductBySlug(slug: string): ProductDetail | undefined {
  return allProducts.find((p) => p.slug === slug);
}

/** Generate static params for Next.js generateStaticParams. */
export function getAllSlugs(): { slug: string }[] {
  return allProducts.map((p) => ({ slug: p.slug }));
}
