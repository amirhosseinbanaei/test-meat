# Image formats and quality

The locked decision tree for what format to use and what quality setting to choose.

## Format decision tree

```
Is it a logo, icon, or simple illustration?
└── Yes → SVG (inline or raw <img>, not <Image>)

Is it a screenshot / UI capture with sharp edges and limited colors?
└── Yes → PNG (let Next.js convert to AVIF/WebP via <Image>)

Is it animated content?
└── Yes → MP4 + WebM <video>, not GIF

Is it a photograph or photo-quality image?
└── Yes → JPEG source (let Next.js convert to AVIF/WebP via <Image>)

Otherwise → JPEG, treated as photographic.
```

The browser picks the served format based on what it supports. Next.js generates AVIF, WebP, and original from your source.

## Source format recommendations

| Source content | Source format | Why |
|---|---|---|
| Photographs | JPEG | Lossy compression efficient for photos |
| Screenshots, UI captures | PNG | Lossless, no compression artifacts on text |
| Diagrams with text | PNG or SVG | Sharp text edges matter |
| Logos | SVG | Vector, scales perfectly |
| Icons | SVG inline | Reused via React, no network cost |
| Illustrations | SVG if vector-source, PNG if raster | Match the source |
| Profile photos | JPEG | Photographic |

## What Next.js does with the source

`<Image src="/foo.jpg">` (or PNG, or any format the loader supports):

1. Browser requests `/_next/image?url=/foo.jpg&w=640&q=75`.
2. Next.js's optimizer reads the source.
3. Generates an AVIF / WebP variant at the requested width.
4. Serves the format the browser prefers via Accept header.
5. Caches the result (Vercel's edge cache, or the build directory in dev).

The source format barely matters — the served format is always AVIF or WebP for clients that support it.

## Why locked formats: AVIF first, WebP fallback

- **AVIF**: 30–50% smaller than WebP at equivalent quality. Modern. ~94% browser support as of 2026.
- **WebP**: 25–35% smaller than JPEG. Universal modern browser support.
- **JPEG/PNG**: fallback for the rare browser without WebP.

Next.js's `formats: ['image/avif', 'image/webp']` (locked in config) serves them in that preference order.

The trade-off: AVIF encoding is slower than WebP. On `next dev` you may notice longer image generation times. In production (where images are pre-generated or edge-cached), this is irrelevant.

## Quality settings

| Use case | Quality |
|---|---|
| Hero images, marketing | 85 |
| Default content images | 75 |
| List thumbnails (many on page) | 70 |
| Avatar, profile photo | 80 |
| Background / decorative | 65–70 |
| Logos / icons / illustrations | 90 |
| Image where text is part of the image | 85+ (text compression artifacts are visible) |

**Don't go above 90.** The visual difference between 90 and 100 is invisible to humans; the file size difference is large.

**Don't go below 60.** Compression artifacts become visible.

## When the format choice is wrong

### "PNG that's huge"

A PNG with photographic content. Convert source to JPEG, save 70% file size.

### "JPEG that looks blocky"

A JPEG with sharp text or hard edges. Convert source to PNG (lossless), let Next.js compress to AVIF.

### "Many SVGs on one page"

Each SVG as a separate file → many HTTP requests. Inline as React components instead (Lucide-style).

### "AVIF too slow on dev"

Lock `formats: ['image/webp']` only in `next.config.ts` dev mode if it's painful. Production keeps AVIF.

## Animated content (revisit)

GIFs are file-size disasters. A 5-second 480p GIF can be 5MB. The same content as MP4 is ~200KB.

```tsx
<video src="/animation.mp4" autoPlay loop muted playsInline poster="/animation-poster.jpg" />
```

For accessibility (reduced motion), conditionally swap to a static image. See `add-accessibility/references/motion-and-reduced-motion.md`.

## Modern format options on a CDN

If serving via Cloudinary / imgix / Cloudflare Images / Bunny CDN:

- All support AVIF / WebP / format-on-Accept-header.
- Set the CDN to "auto format" or equivalent.
- Use a custom Next.js Image loader to pass through CDN params.

Don't double-encode (Next.js converts then CDN converts again — visible quality loss). Pick one: Next.js's pipeline OR the CDN's. The locked default is Next.js's pipeline; CDN integration is per-project decision.

## Lossless mode

For artwork, screenshots where bit-perfection matters:

```tsx
<Image src="/diagram.png" alt="..." width={1200} height={800} unoptimized />
```

`unoptimized`: skips the optimization pipeline, serves the original file as-is. Use sparingly — usually 70–85 quality is visually indistinguishable from lossless at a fraction of the size.

## Sanity checks

Per project:

- [ ] Sample 10 images on the largest page in the app.
- [ ] DevTools → Network → check served format. AVIF on Chrome 90+, WebP on Safari 14+.
- [ ] Confirm sizes (in KB) are reasonable for the resolution. A 1200×800 photo at quality 75 should be ~50–80KB AVIF.
- [ ] Confirm no JPEGs > 200KB on common viewports.
- [ ] Confirm no PNGs > 100KB unless they're genuinely lossless-requiring (text/diagram).

If any check fails: format choice or quality setting needs adjustment.

## Anti-patterns

| Don't | Why |
|---|---|
| Source PNG of photograph | 3–5× larger than JPEG with no quality benefit |
| GIF animation | 10–100× larger than MP4 |
| `quality={100}` | No visible improvement, large file |
| `unoptimized` on everything | Bypasses every optimization Next.js provides |
| Multiple format files in `public/` (`.jpg.webp.avif`) | Next.js does this automatically; manual files are redundant |
| Different sources at different breakpoints (`art direction`) handled with CSS | Use `<picture>` element instead, or different `<Image>` instances |
