---
name: add-carousel
description: Adds a carousel/slider using shadcn's Carousel primitive (built on Embla under the hood). Covers image galleries, content sliders, testimonial rotators, product carousels. Embla is small, accessible, dependency-free, and what shadcn already wraps — no need to install a different carousel library.
allowed-tools: Bash(npm *), Bash(npx *), Read, Write
---

# Add a carousel

shadcn/ui ships a `Carousel` primitive built on **Embla Carousel** — small, accessible, dependency-free. That's the FE team's lock. No Swiper, no Slick, no Keen.

## When to use

- Image galleries (lightbox-like, sequential images).
- Testimonial / review rotators.
- Hero slideshows on marketing pages.
- "More like this" product strips.
- Onboarding intro carousels.

## When NOT to use

- A vertical list of items — that's just a list (or a virtualised list, see `add-virtualized-list`).
- A continuously scrolling marquee — not a carousel; use CSS `animation: scroll`.
- A full-screen content swiper for mobile (use a router-based pattern instead).

## Setup

The shadcn Carousel component is added via `add-shadcn-component`:

```bash
npx shadcn@latest add carousel
```

This installs `embla-carousel-react` (the Embla bindings) and drops the component source into `src/components/ui/carousel.tsx`. You own that file.

For autoplay, add:

```bash
npm install embla-carousel-autoplay
```

Other Embla plugins (Fade, ClassNames, AutoScroll, AutoHeight, WheelGestures) are available on demand.

## Inputs expected

- `kind` — `image-gallery` | `testimonial` | `hero-slideshow` | `product-strip` | `custom`.
- `orientation` — `horizontal` (default) | `vertical`.
- `autoplay` — `true` | `false`. Default `false`. Marketing heroes often want it; image galleries don't.
- `loop` — `true` | `false`. Default `true` for autoplay, `false` for galleries.

## Workflow

1. Ensure shadcn's Carousel is present. If `src/components/ui/carousel.tsx` doesn't exist, run `npx shadcn@latest add carousel`.
2. Read `references/carousel-patterns.md` — the patterns per `kind`, snap behaviour, accessibility.
3. Build the carousel where it's needed — there's no project-wide carousel file to create; carousels are use-case-specific.

## Files in this skill

- `references/carousel-patterns.md` — patterns per use case (gallery, testimonial, hero, product), autoplay setup, dot navigation, accessibility.
