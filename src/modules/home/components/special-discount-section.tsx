import { specialProducts } from "../data/home-content";
import { ProductRailSection } from "./product-rail-section";

/**
 * Section 06 — "تخفیف ویژه".
 *
 * Visual identity matches the design exactly: red panel with a giant
 * top-start curve (508px on wide screens, fluidly smaller on phones),
 * a subtle multiply-overlay texture and white headline copy.
 */
export function SpecialDiscountSection() {
  return (
    <ProductRailSection
      title="تخفیف ویژه"
      products={specialProducts}
      tone="light"
      arrowSurface="gray"
      cardVariant="discount"
      surface="bg-brand-red text-white rounded-tl-[280px] 2xl:rounded-tl-curve py-14 sm:py-16 overflow-hidden pl-10"
      decoration={
        <div
          aria-hidden
          className="pointer-events-none absolute bg-cover mix-blend-overlay"
          style={{ backgroundImage: "url('/assets/red-bg-texture.png')" }}
        />
      }
    />
  );
}
