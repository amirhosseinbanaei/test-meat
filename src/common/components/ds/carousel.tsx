"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/common/lib/cn";
import { IconButton } from "./icon-button";

/**
 * Composable Carousel built on Embla (the engine shadcn ships with). The
 * surface follows shadcn's pattern — `<Carousel>` provides context, and
 * `<CarouselViewport>` / `<CarouselContent>` / `<CarouselItem>` / `<CarouselPrev>` /
 * `<CarouselNext>` / `<CarouselDots>` are slot components that read from it.
 *
 * RTL-aware: pass `opts={{ direction: "rtl" }}` and Embla will swap the
 * direction of motion + prev/next semantics automatically. The arrow glyphs
 * still need to be rendered in their visual orientation (handled inside
 * `<CarouselPrev>` / `<CarouselNext>` below).
 */

export type CarouselOptions = EmblaOptionsType;
export type CarouselPlugin = EmblaPluginType;
export type CarouselApi = EmblaCarouselType;

type CarouselContextValue = {
  carouselRef: (node: HTMLElement | null) => void;
  api: CarouselApi | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
  scrollTo: (index: number) => void;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel(): CarouselContextValue {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) {
    throw new Error("Carousel subcomponents must be used inside <Carousel/>");
  }
  return ctx;
}

export function Carousel({
  opts,
  plugins,
  className,
  children,
  setApi,
}: {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin[];
  className?: string;
  children: React.ReactNode;
  setApi?: (api: CarouselApi) => void;
}) {
  const [carouselRef, api] = useEmblaCarousel(
    { align: "start", containScroll: "trimSnaps", ...opts },
    plugins,
  );

  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);
  const [selected, setSelected] = React.useState(0);
  const [snaps, setSnaps] = React.useState<number[]>([]);

  const onSelect = React.useCallback((current: CarouselApi | undefined) => {
    if (!current) return;
    setCanPrev(current.canScrollPrev());
    setCanNext(current.canScrollNext());
    setSelected(current.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (!api) return;
    // We deliberately sync local state from the Embla instance after mount —
    // it's an external store, so a useEffect is the canonical way to subscribe.
    // The React Compiler `set-state-in-effect` heuristic flags this even
    // though the state is genuinely derived from the carousel lifecycle, so
    // it's locally disabled here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnaps(api.scrollSnapList());
    onSelect(api);
    const handleSelect = () => onSelect(api);
    const handleReInit = () => {
      setSnaps(api.scrollSnapList());
      onSelect(api);
    };
    api.on("select", handleSelect);
    api.on("reInit", handleReInit);
    setApi?.(api);
    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleReInit);
    };
  }, [api, onSelect, setApi]);

  const value = React.useMemo<CarouselContextValue>(
    () => ({
      carouselRef,
      api,
      scrollPrev: () => api?.scrollPrev(),
      scrollNext: () => api?.scrollNext(),
      canScrollPrev: canPrev,
      canScrollNext: canNext,
      selectedIndex: selected,
      scrollSnaps: snaps,
      scrollTo: (index: number) => api?.scrollTo(index),
    }),
    [api, canPrev, canNext, carouselRef, selected, snaps],
  );

  return (
    <CarouselContext.Provider value={value}>
      <section
        className={cn("relative", className)}
        aria-roledescription="carousel"
        dir={opts?.direction ?? "rtl"}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

export function CarouselViewport({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className={cn("overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CarouselContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex touch-pan-y will-change-transform", className)}>
      {children}
    </div>
  );
}

export function CarouselItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0", className)}
    >
      {children}
    </div>
  );
}

export function CarouselPrev({
  surface = "gray",
  className,
}: {
  surface?: "gray" | "white";
  className?: string;
}) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <IconButton
      surface={surface}
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="قبلی"
      className={cn(
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        className,
      )}
    >
      <ChevronRight className="size-5" strokeWidth={2.5} />
    </IconButton>
  );
}

export function CarouselNext({
  surface = "gray",
  className,
}: {
  surface?: "gray" | "white";
  className?: string;
}) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <IconButton
      surface={surface}
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="بعدی"
      className={cn(
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        className,
      )}
    >
      <ChevronLeft className="size-5" strokeWidth={2.5} />
    </IconButton>
  );
}

/**
 * Prev + Next paired in a flex row. Render order matters for RTL — the first
 * child (prev) sits on the start (right) side, the second (next) sits on the
 * end (left) side. */
export function CarouselArrows({
  surface = "gray",
  className,
}: {
  surface?: "gray" | "white";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <CarouselPrev surface={surface} />
      <CarouselNext surface={surface} />
    </div>
  );
}

export function CarouselDots({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "light";
  className?: string;
}) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();

  if (scrollSnaps.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {scrollSnaps.map((_, index) => {
        const active = index === selectedIndex;
        return (
          <button
            type="button"
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`اسلاید ${index + 1}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              "block h-[7px] rounded-full transition-all duration-200 outline-none",
              "focus-visible:ring-2 focus-visible:ring-brand-red/40 focus-visible:ring-offset-1",
              active ? "w-[18px]" : "w-[7px] hover:w-2.5",
              tone === "light"
                ? active
                  ? "bg-brand-red"
                  : "bg-white/60 hover:bg-white/80"
                : active
                  ? "bg-brand-red"
                  : "bg-brand-ink/25 hover:bg-brand-ink/40",
            )}
          />
        );
      })}
    </div>
  );
}
