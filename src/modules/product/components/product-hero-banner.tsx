import type { ProductDetail } from '../data/product-content';

/**
 * ProductHeroBanner — full-width dark image banner at the top of each
 * product page, with a breadcrumb overlay: "خانه / فروشگاه / {category}"
 */
export function ProductHeroBanner({ product }: { product: ProductDetail }) {
  return (
    <section
      className="relative w-full h-[180px] sm:h-[240px] lg:h-[300px] overflow-hidden bg-brand-ink"
      aria-label={`${product.name} — بنر صفحه محصول`}
    >
      {/* Background meat image */}
      <img
        src="/assets/hero-section-ref.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* Dark gradient overlay — stronger on right for text readability */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/40 to-black/20" />

      {/* Breadcrumb — RTL, anchored to the right-center */}
      <div className="absolute inset-0 flex items-center justify-end px-6 sm:px-10 lg:px-16">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-2 text-white text-sm sm:text-base font-light"
          dir="rtl"
        >
          <a href="/" className="hover:text-brand-cream transition-colors">
            خانه
          </a>
          <span className="opacity-60">/</span>
          <a href="/shop" className="hover:text-brand-cream transition-colors">
            فروشگاه
          </a>
          <span className="opacity-60">/</span>
          <span className="font-medium text-white">{product.category}</span>
        </nav>
      </div>
    </section>
  );
}
