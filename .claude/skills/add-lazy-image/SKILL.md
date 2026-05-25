---
name: add-lazy-image
description: The FE team's image strategy — Next.js `<Image>` with locked priority rules, sizing strategies, blur placeholders, formats (AVIF first, WebP fallback). Lazy load by default, eager only for above-the-fold. Explicit sizes mandatory. Aspect ratio reservation to prevent CLS. Use on every project — image strategy isn't optional.
allowed-tools: Read, Write
---

# Lazy-load images correctly

Next.js `<Image>` does most of the work — but only when used correctly. This skill locks the team's usage: priority rules, sizes patterns, placeholder strategies, format preferences.

## When to use

- Every project. This is the locked image pattern. The skill is conceptual + reference; there's no install step.

## What `<Image>` does for you

- **Lazy loading by default** — `loading="lazy"` is implicit; off-screen images don't fetch until near the viewport.
- **Responsive sizing** — generates multiple sizes and picks the right one via `srcSet`.
- **Modern formats** — serves AVIF first (browsers supporting it), WebP fallback, original last.
- **CLS prevention** — when you supply `width`/`height` or aspect-ratio props.
- **Placeholder** — blur placeholder while loading.

What it doesn't do automatically:

- Know which images are above-the-fold (`priority` prop manual).
- Know what `sizes` to declare for responsive layouts (manual).
- Know the right placeholder (manual).
- Lazy-load NON-image elements — that's a separate concern (see `add-lazy-component-with-skeleton`).

## Workflow

1. Read `references/image-patterns.md` — locked patterns by image type (hero, content, avatar, list thumbnail, gallery).
2. Read `references/sizing-and-cls.md` — locked sizing strategy and CLS prevention.
3. Read `references/formats-and-quality.md` — AVIF / WebP / JPEG / SVG decision tree, quality defaults.
4. Read `references/placeholders.md` — blur, color, skeleton choice per context.
5. Drop `assets/Image.tsx.template` → `src/common/components/Image.tsx` if the project wants a thin wrapper enforcing team defaults (recommended). Otherwise import `next/image` directly.
6. Update `next.config.ts` with locked image config (the skill provides a patch).

## The locked rules

### Always

- `<Image>` from `next/image`. Never raw `<img>` (it doesn't lazy-load by default, doesn't serve modern formats, doesn't help CLS).
- Explicit `width` + `height` OR `fill` + sized parent. Never neither — CLS guaranteed.
- Explicit `alt`. `alt=""` (empty) for purely decorative; otherwise meaningful.
- `sizes` prop on every responsive image. Without it, browsers download the largest src.

### `priority` for above-the-fold only

```tsx
<Image priority src="/hero.jpg" alt="..." width={1600} height={900} sizes="100vw" />
```

`priority`:

- Disables lazy loading (the image fetches immediately).
- Preloads via `<link rel="preload">` in the document head.
- Skips the blur placeholder animation.

Use ONLY for images visible in the initial viewport on initial load. Hero images, the user avatar in the top nav, the first product card in a grid. NEVER for below-the-fold content.

Rule of thumb: 0–3 `priority` images per route. More than 3 and you're priority-spamming, which causes head-of-line blocking on slow connections.

### `loading="lazy"` is the default — don't override to "eager"

Don't set `loading="eager"` on `<Image>`. If you think you need to, use `priority` instead.

### Quality defaults

- Default: `quality={75}` (Next.js default).
- Hero images: `quality={85}`.
- Logos / icons: `quality={90}` (less compression, lossless-ish).
- Thumbnails / gallery: `quality={70}` (you're showing many; trade quality for speed).

These are tuned trade-offs. Don't change per-image without measuring.

## What this gives you

- Every image lazy-loads automatically except above-the-fold.
- No CLS because every image has explicit dimensions.
- Responsive images via `sizes` + `srcSet`, picked by the browser.
- AVIF / WebP served automatically.
- Blur placeholders prevent visual pop-in on slow connections.

## Files in this skill

- `assets/Image.tsx.template` — thin wrapper around `next/image` enforcing team defaults.
- `assets/next.config.image.patch` — text instructions to update `next.config.ts` with locked image config.
- `references/image-patterns.md` — patterns by image type.
- `references/sizing-and-cls.md` — sizing strategy + CLS prevention.
- `references/formats-and-quality.md` — format decision tree.
- `references/placeholders.md` — placeholder strategies.
