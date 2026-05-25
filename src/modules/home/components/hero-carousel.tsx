"use client";

import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselArrows,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselViewport,
} from "@/common/components/ds";
import type { HeroSlide as HeroSlideData } from "../data/home-content";
import { HeroSlide } from "./hero-slide";

export function HeroCarousel({ slides }: { slides: HeroSlideData[] }) {
  // Lazy initial state so the Autoplay plugin instance is created once per
  // mount (Embla requires a stable plugin identity to wire its lifecycle).
  // This is preferred over `useRef` because the React Compiler lint rules
  // disallow reading `ref.current` during render.
  const [autoplay] = useState(() =>
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  );

  return (
    <Carousel
      opts={{ loop: true, direction: "rtl", duration: 32 }}
      plugins={[autoplay]}
      className="overflow-hidden w-[94.5%] rounded-2xl xl:rounded-br-[280px] 2xl:rounded-br-curve relative xl:static"
    >
      <CarouselViewport className="block">
        <CarouselContent className="">
          {slides.map((slide) => (
            <CarouselItem key={slide.title} className="basis-full">
              <HeroSlide slide={slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>

      <CarouselDots
        tone="light"
        className="absolute inset-x-0 bottom-5 sm:bottom-6 z-10"
      />

      <CarouselArrows
        surface="gray"
        className="absolute right-7 bottom-4 sm:bottom-5 z-10 hidden xl:block"
      />
    </Carousel>
  );
}
