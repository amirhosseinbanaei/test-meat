/**
 * CartBreadcrumb — single-line RTL breadcrumb shown below the header.
 * Matches the design exactly: "خانه / سبد خرید" right-aligned.
 */
export function CartBreadcrumb() {
  return (
    <nav
      aria-label="مسیر صفحه"
      className="flex items-center justify-end gap-2 py-5 text-sm text-brand-ink"
      dir="rtl"
    >
      <a href="/" className="hover:text-brand-red transition-colors font-light">
        خانه
      </a>
      <span className="text-brand-mute">/</span>
      <span className="font-medium">سبد خرید</span>
    </nav>
  );
}
