import type { ReactNode } from "react";
import {
  AllProductsButton,
  Carousel,
  CarouselArrows,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselViewport,
  Container,
  ProductCard,
  SectionTitle,
  type ProductCardProduct,
} from "@/common/components/ds";
import { cn } from "@/common/lib/cn";

/**
 * Reusable product-carousel section. Both the Special Discount and the Best
 * Sellers section share the same anatomy — title, "view all" CTA, prev/next
 * arrows, an Embla carousel of product cards, pagination dots — so we model
 * it once and project the surface treatment through props:
 *
 *   • `tone`         — "ink" (cream surface) or "light" (red panel).
 *   • `surface`      — wrapping classes for the outer section (background,
 *                       corner curve, padding).
 *   • `arrowSurface` — "gray" sits on light backgrounds, "white" sits on
 *                       cream so the arrow tiles pop off the panel.
 *   • `cardVariant`  — passed through to ProductCard ("discount" vs "default").
 */
type ProductRailSectionProps = {
  title: string;
  products: ProductCardProduct[];
  tone?: "ink" | "light";
  arrowSurface?: "gray" | "white";
  cardVariant?: "default" | "discount";
  surface?: string;
  decoration?: ReactNode;
  allLabel?: string;
};

export function ProductRailSection({
  title,
  products,
  tone = "ink",
  arrowSurface = "gray",
  cardVariant = "default",
  surface = "bg-white",
  decoration,
  allLabel,
}: ProductRailSectionProps) {
  return (
    <section className={cn("relative", surface)} aria-label={title}>
      {decoration}
      <Container className="relative">
        <Carousel
          opts={{
            direction: "rtl",
            align: "start",
            containScroll: "trimSnaps",
            slidesToScroll: "auto",
          }}
        >
          {/* header row: arrows + view-all (start) ←→ title (end) */}
          <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-4">
            <SectionTitle tone={tone} className="font-khodkar text-5xl">{title}</SectionTitle>
            <div className="flex items-center gap-3 sm:gap-5">
              {/* <CarouselArrows surface={arrowSurface} /> */}
              <AllProductsButton tone={tone} label={allLabel} />
            </div>
          </div>

          {/* rail */}
          <CarouselViewport className="mt-7 sm:mt-9 -mx-3">
            <CarouselContent>
              {products.map((product, index) => (
                <CarouselItem
                  key={`${product.name}-${index}`}
                  className="basis-auto px-3"
                >
                  <ProductCard product={product} variant={cardVariant} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </CarouselViewport>

          {/* dots */}
          <CarouselDots tone={tone} className="mt-6 sm:mt-7" />
        </Carousel>
      </Container>
    </section>
  );
}
