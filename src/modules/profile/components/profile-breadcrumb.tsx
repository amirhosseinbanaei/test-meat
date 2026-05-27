/**
 * ProfileBreadcrumb — single-line RTL breadcrumb shown below the header on /profile.
 * Matches the design exactly: "خانه / حساب کاربری" right-aligned.
 */
export function ProfileBreadcrumb() {
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
      <span className="font-medium">حساب کاربری</span>
    </nav>
  );
}
