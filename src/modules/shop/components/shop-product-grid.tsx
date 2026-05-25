import { shopProducts, SHOP_SHOWING, SHOP_TOTAL_PRODUCTS } from '../data/shop-content';
import { ShopProductCard } from './shop-product-card';

/**
 * ShopProductGrid — main product listing area on /shop.
 *
 * Shows a "مشاهده X تا Y محصول" count line (RTL),
 * then a 3-column responsive grid of ShopProductCard.
 * Pagination is rendered by ShopPagination (sibling component).
 */
export function ShopProductGrid() {
  return (
    <div className="flex flex-col gap-6">
      {/* Count label */}
      <p
        className="text-sm text-brand-mute text-right"
        dir="rtl"
        aria-live="polite"
      >
        مشاهده {SHOP_SHOWING} تا محصول از {SHOP_TOTAL_PRODUCTS}
      </p>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shopProducts.map((product) => (
          <ShopProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
