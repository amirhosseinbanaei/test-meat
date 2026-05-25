# Image placeholders

The locked rules for what shows in an image's space while it loads.

## The three placeholder modes

Next.js `<Image>` supports three modes via the `placeholder` prop:

| Mode | What renders | Use when |
|---|---|---|
| `empty` (default) | Nothing — empty space the size of the image | Below-the-fold; loading is fast; you don't want any visual pop |
| `blur` | A tiny, blurred version of the image | Above-the-fold; visual continuity matters; you have a `blurDataURL` |
| `color` (via custom placeholder) | A solid color (typically the image's average) | When blur is too heavy but empty looks broken |

## When to use blur

`placeholder="blur"` shows a small base64-encoded blurred image while the real one loads. The user sees the rough composition immediately; the sharp image fades in.

```tsx
<Image
  src="/hero.jpg"
  alt="..."
  width={1920}
  height={1080}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSk..."
/>
```

The `blurDataURL` is a tiny (typically 8×6 pixel) base64-encoded JPEG. It adds ~200 bytes to your HTML — cheap.

### Static imports get blur for free

If the source is a static file imported into the bundle:

```tsx
import hero from '@/public/hero.jpg';

<Image src={hero} alt="..." placeholder="blur" />
```

Next.js generates the `blurDataURL` at build time. No manual work.

### Remote / CMS images need a manual `blurDataURL`

For images coming from a CMS or user uploads:

- The backend generates the blur placeholder on upload (using `plaiceholder`, `sharp`, or similar) and stores it alongside the URL.
- The API returns `{ url, width, height, blurDataURL }` for each image.
- Frontend passes them straight through.

Without a `blurDataURL`, you can't use `placeholder="blur"` — Next.js will throw at build time.

### When NOT to use blur

- **Below the fold** when the image is reached via scroll — by the time the user gets there, `<Image>`'s lazy load means the image is fetching. The blur shows briefly, then the real image. The blur is visual noise users don't notice.
- **Tiny images** (avatars, icons) — the blur of a 40×40 image is essentially a single pixel of average color. Use a color background on the container instead.
- **When you don't have a `blurDataURL`** and generating one would cost more than the visual benefit.

## When to use color

For images where blur is overkill but empty looks wrong (broken layout feel), use a solid color background on the container:

```tsx
<div className="bg-muted" style={{ aspectRatio: '16/9' }}>
  <Image src="/photo.jpg" alt="..." fill sizes="100vw" />
</div>
```

The container's background shows until the image renders. No prop on `<Image>` needed — `placeholder="empty"` (default) is fine because the container fills the space.

For brand-aligned color (matching the image's average), generate it server-side or use a service like `plaiceholder` which returns both a color and a `blurDataURL`.

## When to use empty

`placeholder="empty"` (the default) renders nothing in the image's space until it loads. Use when:

- The image is below the fold and lazy-loads.
- The image is small (avatars, icons).
- The image's container has a background or border that fills the space adequately.
- You don't have a `blurDataURL` AND don't want to generate one.

Most images in a typical project use `empty`. Reserve `blur` for hero / above-the-fold / visually critical images.

## Combining placeholders with skeleton wrappers

For a card with an image inside a `LazyOnView`:

```tsx
<LazyOnView fallback={<CardSkeleton />}>
  <Card>
    <Image src="..." alt="..." placeholder="blur" blurDataURL="..." />
  </Card>
</LazyOnView>
```

The `CardSkeleton` covers the whole card while the JS loads. Once the card renders, `<Image>`'s own placeholder takes over for the image-specific loading. Two phases:

1. JS not loaded yet → CardSkeleton shows.
2. JS loaded, image loading → blur placeholder shows inside the card.
3. Image loaded → final state.

This is the right composition. Don't try to render the skeleton inside Image's placeholder — `<Image>` controls its own loading state.

## Generating blur placeholders for CMS/uploads

Server-side workflow:

```ts
// On upload — using `plaiceholder` (Node)
import { getPlaiceholder } from 'plaiceholder';

const buffer = await fileToBuffer(uploadedFile);
const { base64, color, metadata } = await getPlaiceholder(buffer);

// Store base64 (the blurDataURL) and dimensions alongside the file URL.
await db.image.create({
  data: {
    url: uploadedFile.url,
    width: metadata.width,
    height: metadata.height,
    blurDataURL: base64,
    averageColor: color.hex,
  },
});
```

API returns all four fields. Frontend uses them.

For backends that don't yet generate `blurDataURL`: ship without blur, use a color background on the container instead. Don't block on adding blur — it's a polish, not a requirement.

## Anti-patterns

| Don't | Why |
|---|---|
| `placeholder="blur"` without `blurDataURL` | Build-time error |
| `blurDataURL` that's a full-size image | Defeats the point; should be 8×6 pixels base64 |
| `placeholder="blur"` on every image | Adds ~200 bytes per image; only worth it for important images |
| Container with no dimensions + `placeholder="blur"` | CLS — the blur doesn't reserve space, the parent must |
| Generating `blurDataURL` on the client | Heavy work; do it server-side at upload |
| Loading spinner overlaid on an `<Image>` | `<Image>` handles its own loading state; don't double up |

## Decision shortcut

```
Above the fold, important visual?
└── Use placeholder="blur" with blurDataURL.

Below the fold or smaller?
└── Use placeholder="empty" (default), ensure container has a background or dimensions.

No blurDataURL available?
└── Container bg-muted, placeholder="empty".
```
