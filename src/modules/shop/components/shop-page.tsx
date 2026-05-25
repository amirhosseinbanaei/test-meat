import { Container } from '@/common/components/ds';
import { SiteHeader } from '../../../modules/home/components/site-header';
import { SiteFooter } from '../../../modules/home/components/site-footer';
import { ShopHeroBanner } from './shop-hero-banner';
import { ShopSidebar } from './shop-sidebar';
import { ShopProductGrid } from './shop-product-grid';
import { ShopPagination } from './shop-pagination';

/**
 * ShopPage — full /shop page composition.
 *
 * Layout (desktop):
 *   SiteHeader
 *   ShopHeroBanner  (full width)
 *   ┌──────────────────────────┬──────────────┐
 *   │  ShopProductGrid (2/3)   │  ShopSidebar │
 *   │  ShopPagination          │  (1/3)       │
 *   └──────────────────────────┴──────────────┘
 *   SiteFooter
 *
 * On mobile the sidebar stacks above the grid (RTL: sidebar first for context).
 */
export function ShopPage() {
  return (
    <div className="bg-white text-brand-ink overflow-x-hidden min-h-screen" dir="rtl">
      <SiteHeader />

      <ShopHeroBanner />

      <Container className="py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main content — product grid + pagination */}
          <section className="flex-1 min-w-0 order-2 lg:order-1">
            <ShopProductGrid />
            <ShopPagination />
          </section>

          {/* Sidebar — filters */}
          <ShopSidebar className="w-full lg:w-[280px] xl:w-[300px] shrink-0 order-1 lg:order-2" />
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
}
