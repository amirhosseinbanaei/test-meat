import { similarProducts } from '../data/product-content';
import { ProductRailSection } from '../../home/components/product-rail-section';

/**
 * SimilarProductsSection — "محصولات مشابه" carousel on the product detail page.
 *
 * Uses the exact same <ProductRailSection /> that powers BestSellersSection
 * on the home page — cream surface, white arrow tiles, ink tone, default card
 * variant. Only the title and dataset differ.
 */
export function SimilarProductsSection() {
  return (
    <ProductRailSection
      title="محصولات مشابه"
      products={similarProducts}
      tone="ink"
      arrowSurface="white"
      cardVariant="default"
      surface="bg-brand-cream-soft py-14 sm:py-16 lg:py-20 mt-1"
    />
  );
}
