import { shopHeroBannerData } from '../data/shop-content';

/**
 * ShopHeroBanner — full-width dark image banner at the top of /shop,
 * with Persian display text overlaid on the right side (RTL).
 *
 * Uses `font-khodkar` for the title to match the home hero design system.
 */
export function ShopHeroBanner() {
  return (
    <section
      className="relative w-full h-[220px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-brand-ink"
      aria-label="فروشگاه آنلاین محصولات پروتئینی"
    >
      {/* Background image */}
      <img
        src={shopHeroBannerData.image}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />

      {/* Text overlay — RTL, positioned to the right */}
      <div className="absolute inset-0 flex flex-col items-end justify-center px-6 sm:px-10 lg:px-16 text-right">
        <h1
          className="font-khodkar text-white leading-[1.3] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl whitespace-pre-line"
          style={{ direction: 'rtl' }}
        >
          {shopHeroBannerData.title}
        </h1>
        <p className="mt-2 text-white/80 text-sm sm:text-base font-light">
          {shopHeroBannerData.subtitle}
        </p>
      </div>
    </section>
  );
}
