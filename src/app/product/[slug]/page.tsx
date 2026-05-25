import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductPage, getProductBySlug, getAllSlugs } from '@/modules/product';

type Props = {
  params: Promise<{ slug: string }>;
};

/** Pre-render all known product slugs at build time. */
export function generateStaticParams() {
  return getAllSlugs();
}

/** Generate per-product <title> and meta description. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'محصول یافت نشد — میت پلاس' };
  return {
    title: `${product.name} — میت پلاس | Meat Plus`,
    description: `خرید ${product.name} با بهترین کیفیت از میت پلاس. قیمت هر کیلوگرم: ${product.pricePerKg} تومان.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} />;
}
