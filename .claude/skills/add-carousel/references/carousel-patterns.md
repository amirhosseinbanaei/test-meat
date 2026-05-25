# Carousel patterns

Patterns by use case. Each one starts from shadcn's `Carousel` and adjusts.

## Image gallery

```tsx
'use client';

import Image from 'next/image';
import {
  Carousel, CarouselContent, CarouselItem,
  CarouselNext, CarouselPrevious,
} from '@/components/ui/carousel';

export function ImageGallery({ images }: { images: { src: string; alt: string }[] }) {
  return (
    <Carousel
      opts={{ align: 'center', loop: false }}
      className="w-full max-w-3xl mx-auto"
    >
      <CarouselContent>
        {images.map((img, i) => (
          <CarouselItem key={i} className="md:basis-3/4">
            <Image
              src={img.src}
              alt={img.alt}
              width={1200}
              height={800}
              className="aspect-video w-full rounded-md object-cover"
              priority={i === 0}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

Defaults:
- No autoplay (galleries are user-driven).
- No loop (reaching the end is fine; lets the user know they've seen them all).
- One large item at center, with peek of adjacent items via `md:basis-3/4`.

## Testimonial / review rotator

```tsx
'use client';

import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';
import {
  Carousel, CarouselContent, CarouselItem,
} from '@/components/ui/carousel';

export function TestimonialRotator({ items }: { items: Testimonial[] }) {
  const autoplay = useRef(Autoplay({ delay: 6000, stopOnInteraction: false }));

  return (
    <Carousel
      opts={{ align: 'start', loop: true }}
      plugins={[autoplay.current]}
      className="w-full"
    >
      <CarouselContent>
        {items.map((t) => (
          <CarouselItem key={t.id} className="md:basis-1/2 lg:basis-1/3">
            <blockquote className="rounded-lg border bg-card p-6">
              <p className="text-base">{t.quote}</p>
              <footer className="mt-4 text-sm text-muted-foreground">
                — {t.author}, {t.role}
              </footer>
            </blockquote>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
```

Defaults:
- Autoplay on (slow, every 6s).
- Loop on.
- `stopOnInteraction: false` so it resumes after the user pauses.
- No arrows — let it scroll, users can interact via swipe.

## Hero slideshow

```tsx
'use client';

import Autoplay from 'embla-carousel-autoplay';
import { useRef, useState, useEffect } from 'react';
import {
  Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/common/lib/utils';

export function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const autoplay = useRef(Autoplay({ delay: 5000 }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="relative">
      <Carousel
        opts={{ align: 'start', loop: true }}
        plugins={[autoplay.current]}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((s, i) => (
            <CarouselItem key={i}>
              {/* full-bleed slide */}
              <div className="relative aspect-[21/9] w-full">…</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              i === current ? 'bg-white' : 'bg-white/40',
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
```

Defaults:
- Autoplay on (faster, every 5s for marketing rotation).
- Loop on.
- Dot indicators (users want to know where they are).
- No arrows on hero slideshows (clean visuals matter).

## Product strip

```tsx
<Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
  <CarouselContent>
    {products.map((p) => (
      <CarouselItem key={p.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
        <ProductCard {...p} />
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

Key options:
- `dragFree: true` — feels like an Apple website carousel; drag scrolls freely without snapping.
- No autoplay.
- Responsive item count via `basis-*` classes.

## Accessibility

shadcn's Carousel ships solid defaults:

- `role="region"` with `aria-roledescription="carousel"`.
- Arrow buttons have `aria-label`.
- Keyboard navigation: arrow keys when the carousel has focus.

What you still have to do:

- **Pause autoplay on focus / hover.** Embla's Autoplay plugin pauses by default on user interaction, but for screen-reader users who keyboard-tab in, you may want to pause more aggressively. Use `stopOnFocusIn: true` in the autoplay options.
- **Reduced motion.** Honour `prefers-reduced-motion`. The simplest path: turn off autoplay when the user prefers reduced motion.

```tsx
const reduce = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const autoplay = useRef(reduce ? null : Autoplay({ delay: 5000 }));
```

- **Live region for slide changes** (only for important content carousels — testimonials don't need it, hero with text content does).

## Other Embla plugins worth knowing

| Plugin | Use case |
|---|---|
| `embla-carousel-autoplay` | The most common add-on. |
| `embla-carousel-fade` | Crossfade instead of slide. Hero slideshows. |
| `embla-carousel-class-names` | Toggle CSS classes on slides (active/inactive). |
| `embla-carousel-auto-height` | Adjust carousel height to current slide. Useful when slides have varying heights. |
| `embla-carousel-wheel-gestures` | Add mouse wheel support. Subtle UX win for desktop. |
| `embla-carousel-auto-scroll` | Continuous slow scroll, like a logo wall. |

Install only when needed.

## What NOT to do

- **Don't put a carousel above the fold on a marketing page.** Carousel content gets ignored by users (every UX study confirms this). One static hero converts better.
- **Don't use carousels for primary navigation.** They hide content behind interaction.
- **Don't put many cards in a vertical carousel.** Vertical carousels are awkward; vertical scrolling is the native pattern. Use a list.
- **Don't autoplay testimonials too fast.** 6 seconds is the minimum to read a short quote; 8 is better.
