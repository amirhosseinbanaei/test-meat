/**
 * ContactHeroBanner — full-width dark image banner at the top of /contact,
 * with breadcrumb overlay: "خانه / تماس با ما"
 */
export function ContactHeroBanner() {
  return (
    <section
      className="relative w-full h-[180px] sm:h-[240px] lg:h-[300px] overflow-hidden bg-brand-ink"
      aria-label="بنر صفحه تماس با ما"
    >
      {/* Background image */}
      <img
        src="/assets/hero-section-ref.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/40 to-black/20" />

      {/* Breadcrumb */}
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
          <span className="font-medium text-white">تماس با ما</span>
        </nav>
      </div>
    </section>
  );
}
