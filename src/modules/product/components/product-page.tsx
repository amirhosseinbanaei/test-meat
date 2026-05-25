import { Container } from '@/common/components/ds';
import { SiteHeader } from '../../home/components/site-header';
import { SiteFooter } from '../../home/components/site-footer';
import { ProductHeroBanner } from './product-hero-banner';
import { ProductGallery } from './product-gallery';
import { ProductInfo } from './product-info';
import { ProductTabs } from './product-tabs';
import { SimilarProductsSection } from './similar-products-section';
import type { ProductDetail } from '../data/product-content';

/**
 * ProductPage — full /product/[slug] page composition.
 *
 * Desktop layout (two-column, RTL):
 * ┌──────────────────────────────────┬────────────────────┐
 * │  ProductInfo (text, CTA) — left  │  ProductGallery    │
 * │                                  │  (image) — right   │
 * └──────────────────────────────────┴────────────────────┘
 * ProductTabs (full width below)
 * SimilarProductsSection (full width, cream band)
 *
 * Mobile layout: gallery first (top), info below, then tabs.
 */
export function ProductPage({ product }: { product: ProductDetail }) {
  return (
    <div
      className="bg-white text-brand-ink overflow-x-hidden min-h-screen"
      dir="rtl"
    >
      <SiteHeader />

      <ProductHeroBanner product={product} />

      <Container className="py-10 sm:py-14">
        {/* Main 2-col grid: Info (left) | Gallery (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_440px] gap-8 lg:gap-12 items-start">
          {/* Info — appears below gallery on mobile (order-2), left column on desktop */}
          <div className="order-2 lg:order-1">
            <ProductInfo product={product} />
          </div>

          {/* Gallery — appears above info on mobile (order-1), right column on desktop */}
          <div className="order-1 lg:order-2">
            <ProductGallery product={product} />
          </div>
        </div>

        {/* Tabs section — full width below the 2-col block */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-brand-line">
          <ProductTabs product={product} />
        </div>
      </Container>

      {/* Similar products carousel — cream band, same as BestSellersSection */}
      <SimilarProductsSection />

      <SiteFooter />
    </div>
  );
}
