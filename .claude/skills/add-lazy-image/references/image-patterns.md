# Image patterns by type

The locked patterns. Every image in the project fits one of these shapes.

## Hero image (above the fold)

The big image at the top of a page. Visible on initial load.

```tsx
<Image
  src="/hero.jpg"
  alt="Descriptive alt text"
  width={1920}
  height={1080}
  priority
  quality={85}
  sizes="100vw"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

Why each prop:

- `priority`: above the fold, must load immediately, preload in head.
- `sizes="100vw"`: hero is full-width.
- `quality={85}`: hero deserves higher quality.
- `placeholder="blur"` + `blurDataURL`: prevent flash of empty container.
- `width/height`: the aspect ratio of the source. Browser uses this to reserve space.

Generate `blurDataURL` at build time (Next.js does this for static imports) OR via a build step for remote images.

## Content image (in article body, mid-page)

Lazy-loaded by default.

```tsx
<Image
  src="/diagram.png"
  alt="Architecture diagram showing client, edge, and origin"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 800px"
  quality={75}
/>
```

`sizes="(max-width: 768px) 100vw, 800px"`: full-width on mobile, fixed 800px on desktop. Browser picks the appropriate src from the generated srcSet.

## Avatar

Small, fixed size.

```tsx
<Image
  src={user.avatarUrl}
  alt={`${user.name}'s avatar`}
  width={40}
  height={40}
  className="rounded-full"
  quality={80}
  sizes="40px"
/>
```

`sizes="40px"`: tells the browser exactly what size to fetch. Without this, browser downloads the largest source.

For larger profile photos (in a profile page header):

```tsx
<Image
  src={user.photoUrl}
  alt={`${user.name}`}
  width={120}
  height={120}
  className="rounded-full"
  quality={80}
  sizes="120px"
/>
```

## List thumbnail

Many small images. In a product grid, blog post list, search results.

```tsx
<Image
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={70}
/>
```

`quality={70}`: each thumbnail is one of many; total bytes matter more than per-image quality.

`sizes`: 1 column on phone, 2 on tablet, 3 on desktop — match this to the layout's grid.

## Background / decoration

Decorative image filling a container.

```tsx
<div className="relative aspect-video">
  <Image
    src="/background.jpg"
    alt=""  // empty alt for decorative — required, not omitted
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
    quality={70}
  />
</div>
```

`fill`: takes the parent's dimensions. The parent MUST have explicit dimensions or aspect-ratio — without it, the image has nothing to fill.

`alt=""`: empty alt = decorative. Different from no alt (which fails lint).

## Gallery / lightbox image (small + large variants)

Show small in grid, large in modal. The locked approach: separate `<Image>` instances, both with explicit sizes.

```tsx
// Grid
<Image src={`/gallery/${id}-thumb.jpg`} width={300} height={300} alt={alt} sizes="300px" quality={70} />

// Modal (loaded only when modal opens)
<Image src={`/gallery/${id}-full.jpg`} width={1600} height={1200} alt={alt} sizes="(max-width: 768px) 100vw, 1200px" quality={85} />
```

Don't try to upscale the thumbnail to look full-size — that defeats responsive images.

## SVG (logos, icons)

Don't use `<Image>`. Two options:

```tsx
// Option 1: inline SVG (preferred for icons used multiple times)
import Logo from '@/common/components/icons/Logo';
<Logo className="size-8" />

// Option 2: raw <img> for one-off SVG files
<img src="/logos/partner.svg" alt="Partner Co" className="h-8 w-auto" loading="lazy" />
```

`<img loading="lazy">` is fine for SVGs because:

- SVG doesn't have multiple sizes to pick from.
- Modern format conversion (AVIF/WebP) doesn't apply.
- The Next.js optimization pipeline isn't needed.
- `dangerouslyAllowSVG` is locked false for security.

For SVG icons used many times, inline as React components (Lucide does this for its icons). Reuse via React, not the network.

## Profile / detailed product image

Larger than a thumbnail, smaller than a hero. Often loaded eagerly on its specific page.

```tsx
<Image
  src={product.heroImage}
  alt={product.name}
  width={1200}
  height={900}
  priority
  sizes="(max-width: 1024px) 100vw, 800px"
  quality={85}
  placeholder="blur"
  blurDataURL={product.blurDataURL}
/>
```

`priority` on a non-hero image because on its specific page (product detail), this IS the hero-equivalent.

## Animated images (GIFs, looping)

**Don't ship GIFs.** Use `<video autoplay loop muted playsinline>` with an MP4 or WebM. GIFs are 10–100× larger than equivalent video.

```tsx
<video
  src="/demo.mp4"
  autoPlay
  loop
  muted
  playsInline
  className="w-full"
  poster="/demo-poster.jpg"
/>
```

`poster` shows while the video loads — equivalent to placeholder for images.

For reduced-motion users: provide a pause control or static fallback. Don't auto-play under reduced motion.

## Off-screen / virtualized list images

When using `add-virtualized-list`, images inside virtualized rows still benefit from `<Image>` lazy loading — the rows themselves are virtualized, but the images load when their row renders.

```tsx
<VirtualList
  rows={items}
  renderRow={(item) => (
    <Image src={item.image} alt={item.title} width={80} height={80} sizes="80px" quality={70} />
  )}
/>
```

Don't add additional lazy logic; `<Image>`'s default `loading="lazy"` is enough.

## Pattern decision

| Image role | Pattern |
|---|---|
| Visible on page load (hero) | `priority`, `sizes="100vw"`, `quality={85}` |
| Below the fold (article body) | Default lazy, `sizes` matched to layout |
| Avatar | Fixed `width/height/sizes`, `quality={80}` |
| List thumbnail (many) | `quality={70}`, `sizes` with breakpoints |
| Decorative background | `fill`, `alt=""`, sized parent |
| SVG icon (reused) | Inline as React component |
| SVG one-off | Raw `<img>` |
| Animated content | `<video>`, not GIF |

If a use case doesn't fit, ask ui-visual-lead — most likely the design has an unusual ask, not the patterns missing a case.

## Anti-patterns

| Don't | Why |
|---|---|
| `<img src="/foo.jpg">` | No lazy load, no responsive, no format optimization |
| `<Image>` without `width/height` and not `fill` with sized parent | CLS |
| `<Image>` without `sizes` (when responsive) | Downloads largest variant always |
| `priority` on more than 3 images per page | Head-of-line blocking |
| `priority` on below-the-fold | Wastes initial load budget |
| Same image at thumbnail and full-size, scaled via CSS | Defeats responsive image strategy |
| GIFs for animation | 10–100× video file size |
| `quality={100}` | Diminishing returns; ~85 is visually identical |
| `quality={20}` | Visible artifacts |
| `<Image>` for SVG (with `dangerouslyAllowSVG: true`) | Security risk |
