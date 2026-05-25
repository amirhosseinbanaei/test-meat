import { ArrowLeft } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import type { HeroSlide as HeroSlideData } from "../data/home-content";

/**
 * Single hero carousel slide. Two visual modes:
 *
 *   • `baked = true` — the slide image already contains its own composition
 *     (headline, decoration, etc.); we only render the image and let the
 *     carousel chrome float on top.
 *
 *   • `baked = false` — generic template: dark gradient overlay biased to the
 *     start side, eyebrow + headline + subtitle + optional CTA stacked on
 *     the right edge (RTL), centred vertically.
 */
export function HeroSlide({ slide }: { slide: HeroSlideData }) {
  return (
    <div
      role="img"
      aria-label={slide.title}
      className="relative aspect-[1825/460] min-h-[220px] w-full overflow-hidden bg-[#0a0a0a] bg-no-repeat bg-cover bg-[position:right_top]"
      style={{ backgroundImage: `url('${slide.image}')` }}
    >
      {slide.baked ? null : (
        <>
          {/* gradient: dark on the start (right, in RTL) → transparent on the end */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-l from-transparent via-black/30 to-black/75"
          />

          <div className="absolute inset-y-0 right-0 flex max-w-[min(560px,75%)] flex-col justify-center gap-3 px-6 sm:px-12 lg:px-20 text-right text-white">
            {slide.eyebrow && (
              <span className="inline-block w-fit rounded-full bg-brand-red/85 px-3 py-1 text-xs font-medium tracking-wide text-white shadow-sm sm:text-sm">
                {slide.eyebrow}
              </span>
            )}
            <h2 className="font-display text-fluid-card leading-none drop-shadow-md">
              {slide.title}
            </h2>
            <p className="text-sm leading-relaxed text-white/85 sm:text-base">
              {slide.subtitle}
            </p>
            {slide.cta && (
              <div className="mt-2">
                <Button variant="cream" size="lg" className="gap-2">
                  {slide.cta.label}
                  <ArrowLeft className="size-4" strokeWidth={2.4} />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
