import { SiteHeader } from '../../home/components/site-header';
import { SiteFooter } from '../../home/components/site-footer';
import { CartClientPage } from './cart-client-page';

/**
 * CartPage — top-level /cart page composition (Server Component).
 *
 * Layout:
 *   SiteHeader
 *   CartClientPage  ← all interactive state lives here
 *   SiteFooter
 *
 * No hero banner — design goes straight from the header to a breadcrumb row,
 * matching the design exactly.
 */
export function CartPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <SiteHeader />
      <CartClientPage />
      <SiteFooter />
    </div>
  );
}
