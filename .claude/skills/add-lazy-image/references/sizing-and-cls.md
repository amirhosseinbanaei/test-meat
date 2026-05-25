# Image sizing and CLS prevention

CLS (Cumulative Layout Shift) is the metric that catches you when images load and push other content around. Locked rule: every image must reserve its space before the source loads.

## The CLS rule

`<Image>` requires either:

1. Explicit `width` AND `height`, OR
2. `fill` AND a parent with explicit dimensions.

There is no third option. If you don't supply either, you get CLS.

## Why width/height matter

Browser doesn't know an image's dimensions until it loads. Without explicit dimensions, the image element is 0×0 until load, then jumps to its natural size, pushing surrounding content.

`width` + `height` props give the browser an aspect ratio to reserve. Even before the image loads, the space is correct.

```tsx
<Image src="/photo.jpg" alt="..." width={800} height={600} sizes="..." />
```

The `width` and `height` are **the aspect ratio**, not the rendered size. The image renders at whatever size CSS (or `sizes`) dictates. Just give the original dimensions so the aspect is correct.

## `fill` pattern

When the image fills a container of dynamic size:

```tsx
<div className="relative aspect-[16/9] w-full">
  <Image src="/photo.jpg" alt="..." fill className="object-cover" sizes="100vw" />
</div>
```

The parent has `aspect-[16/9]` — Tailwind's aspect-ratio utility reserves the space. The image fills it via `fill`. `object-cover` makes it crop to fit.

Without the aspect-ratio on the parent: CLS. The parent is 0 high, then becomes image-height tall when loaded.

## The `sizes` prop

`sizes` tells the browser what CSS size the image will be rendered at, so it can pick the right src from the srcSet.

### Static sizes

For a fixed-size image:

```tsx
sizes="40px"             // Always 40px
sizes="800px"            // Always 800px
```

### Responsive sizes

For images that change size with viewport:

```tsx
sizes="(max-width: 768px) 100vw, 50vw"
```

Read as: "if viewport ≤ 768px, the image is 100vw wide. Otherwise, 50vw."

Multiple breakpoints:

```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

Mobile: full width. Tablet: half. Desktop: third.

### Match the actual layout

`sizes` must reflect what CSS does. If you write `sizes="100vw"` but your layout shows the image at 800px max-width, the browser downloads a huge image and scales down — wasted bytes.

The locked rule: `sizes` matches the layout's max-width at each breakpoint.

```tsx
// Layout: max-w-3xl (768px) container, image full-width inside
sizes="(max-width: 768px) 100vw, 768px"
```

## When you don't know the dimensions

For user-uploaded images where dimensions aren't known at render time:

```tsx
<div className="relative aspect-square w-full">
  <Image
    src={user.uploadedImage}
    alt="..."
    fill
    className="object-cover"
    sizes="..."
  />
</div>
```

You force an aspect ratio via the container. The image crops to fit. Common for product images, avatars, gallery items where consistent dimensions matter more than the source's natural aspect.

For showing arbitrary aspect ratios faithfully, you must store the dimensions on upload. Backend returns `{ url, width, height }`, frontend uses them as Image props. There's no shortcut.

## Aspect-ratio reservation patterns

Common shapes:

```tsx
<div className="aspect-square">       {/* 1:1 */}
<div className="aspect-video">         {/* 16:9 */}
<div className="aspect-[4/3]">         {/* 4:3 */}
<div className="aspect-[3/4]">         {/* 3:4 portrait */}
<div className="aspect-[21/9]">        {/* ultra-wide */}
```

For project-specific aspect ratios that recur, add to Tailwind config:

```js
// tailwind.config (if not on Tailwind 4 which is config-less)
theme: {
  extend: {
    aspectRatio: {
      'product': '4 / 5',
      'banner': '5 / 1',
    },
  },
},
```

Then `aspect-product` is a class.

## Measuring CLS

Lighthouse's CLS score. The locked target: **< 0.1**.

Test specifically with the page paint slowed down (Network throttling: 3G in DevTools). Images that load fast on Wi-Fi may show CLS on slow connections.

If you see CLS > 0.1:

1. Check every `<Image>` for missing width/height or fill+aspect.
2. Check for `<img>` (raw) without dimensions.
3. Check for fonts loading and shifting text. (`next/font` handles this; if not using it, you'll see CLS.)
4. Check for embedded videos, iframes, ads without reserved space.

## Don't fight `<Image>`

A common antipattern: trying to override `<Image>`'s behavior with CSS:

```tsx
{/* WRONG */}
<Image src="..." width={9999} height={9999} className="w-full h-auto object-contain" />
```

The browser sees `width=9999`, downloads the largest src, ignores `sizes` because there's no responsive constraint.

The right way: actual width/height of the source, with `sizes` constraining display:

```tsx
<Image src="..." width={1920} height={1080} sizes="(max-width: 768px) 100vw, 768px" />
```

The CSS doesn't need to override anything — `<Image>` outputs the right HTML.

## Image dimensions in CMS / API responses

When images come from a CMS or API, the backend should return `{ url, width, height, blurDataURL? }` for each image. Frontend uses these directly:

```tsx
<Image
  src={cmsImage.url}
  width={cmsImage.width}
  height={cmsImage.height}
  alt={cmsImage.alt}
  placeholder={cmsImage.blurDataURL ? 'blur' : 'empty'}
  blurDataURL={cmsImage.blurDataURL}
  sizes="..."
/>
```

If the API doesn't return dimensions, push back. Adding image dimensions to the API response is one line on the backend; without it, the frontend is forced into `fill` patterns that may not fit the design.

## CDN-served images with on-the-fly sizing

If using Cloudinary / imgix / Cloudflare Images, the CDN can generate any size on demand. Compatible with Next.js Image:

```tsx
<Image
  loader={cloudinaryLoader}        // custom loader hooks the CDN
  src="public-id-of-image"
  width={800}
  height={600}
  sizes="..."
/>
```

Custom loaders bypass Next.js's optimization pipeline. The CDN handles format conversion (AVIF/WebP) and size variants. Set this up per-project; don't change without coordinating with devops-lead (CDN config implications).
