import { bestSellerProducts } from "../data/home-content";
import { ProductRailSection } from "./product-rail-section";

/**
 * Section 08 — "پرفروش ترین ها". Cream-tinted band with white arrow tiles
 * (so they pop off the cream background) and the standard product rail.
 */
export function BestSellersSection() {
  return (
    <ProductRailSection
      title="پرفروش ترین ها"
      products={bestSellerProducts}
      tone="ink"
      arrowSurface="white"
      cardVariant="default"
      surface="bg-brand-cream-soft py-14 sm:py-16 lg:py-20 mt-1"
    />
  );
}
