import { SiteHeader } from '../../home/components/site-header';
import { SiteFooter } from '../../home/components/site-footer';
import { ProfileClientPage } from './profile-client-page';

/**
 * ProfilePage — top-level /profile page composition (Server Component).
 *
 * Layout:
 *   SiteHeader
 *   ProfileClientPage  ← all interactive state lives here
 *   SiteFooter
 *
 * Mirrors the exact pattern used by CartPage and ContactPage — no hero banner,
 * goes straight from the header into a breadcrumb row then the two-column
 * sidebar + content layout.
 */
export function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <SiteHeader />
      <ProfileClientPage />
      <SiteFooter />
    </div>
  );
}
