# The image pipeline

Three optional stages between "user picked an image" and "upload starts":

```
   pick → [crop] → [compress] → upload
```

Each stage is opt-in. The defaults are sensible; override per use case.

## Stage 1 — crop (optional)

Use `react-image-crop` (via the `ImageCropModal` from this skill's assets) when:

- The output needs a fixed aspect ratio (avatar, profile banner, blog hero).
- The user should choose the framing (square crop of a portrait photo).

Skip cropping when:

- The image will be used at multiple aspect ratios (let the consumer choose framing in CSS).
- The image is documentation — don't force a crop on a screenshot.

Aspect ratios in use across our projects:

| Use case | Aspect |
|---|---|
| Avatar | `1` (square) |
| Hero / cover image | `16/9` or `21/9` |
| Blog inline image | freeform (no crop) |
| Card thumbnail | `4/3` or `1` |

The crop happens client-side. The output is a new `File` of the cropped region — the original is discarded.

## Stage 2 — compress

Use `browser-image-compression` (via the `compressImage` helper) for **every image upload**. The presets:

| Preset | Max size | Max dimension | Quality | Use for |
|---|---|---|---|---|
| `avatar` | 200 KB | 512 px | 0.85 | Profile pictures |
| `blog-image` | 1 MB | 1920 px | 0.85 | Inline blog images, content imagery |
| `attachment-image` | 500 KB | 1600 px | 0.8 | Generic image attachments |

The library runs in a Web Worker — it doesn't block the main thread.

### Why client-side compression matters

A user with a phone takes a 12 MB photo. Without compression, that 12 MB goes over the network (slow on mobile), through your storage egress, and then your backend has to resize for display anyway. Compressing to 500 KB - 1 MB before upload:

- 10-20× faster upload on mobile.
- Lower storage costs.
- Smaller files for the backend to process.

The quality hit at 0.85 is invisible for almost any photo. Don't go below 0.8 without testing.

### What gets skipped

- **SVG** — vector format; compressing rasterises it. The helper detects `image/svg+xml` and passes the file through unchanged.
- **GIF** — animation gets destroyed by recompression. Pass through.
- **Non-images** — PDFs, docs, anything else. Pass through.

### Output format

By default we preserve the input format. Two reasons to deviate:

- **Large PNG → JPEG.** PNG is for graphics with sharp edges and transparency. Photos saved as PNG are usually 5-10× larger than the equivalent JPEG. If you know the input is a photo, force JPEG. Set `fileType: 'image/jpeg'` in the options.
- **Anything → WebP.** WebP is 25-35% smaller than JPEG at equivalent quality. Forcing WebP saves bandwidth, at the cost of slightly slower decoding on old devices. Browser support is universal now; safe to force WebP for blog images and avatars.

To force WebP, edit `compress-image.ts`:

```ts
const compressed = await imageCompression(file, {
  ...opts,
  useWebWorker: true,
  fileType: 'image/webp', // ← force WebP
});
```

When to NOT force WebP: when the backend processes images for display via a CDN that emits the right format per client. Then keep the original format on upload; let the CDN do the right thing at serve time.

## Stage 3 — upload

See `upload-architecture.md` for the two modes. After compression, the file is small enough that the Server Action mode is viable for most images (under 1 MB for blog images, under 200 KB for avatars). The presigned-URL mode is still preferred when:

- The compressed file is still big (rare for typical use cases — usually means the source was already optimised, or we're uploading video).
- You need a progress bar.
- You're uploading many files in parallel.

## Storage on the backend side

The backend should store the **original compressed image** plus generate any derived sizes server-side (thumbnails, blog hero variants). The frontend uploads one file; the backend produces however many display variants it needs. Don't generate display thumbnails on the client — they'd all be the same size as the original anyway.

## Showing the uploaded image

After upload, the backend returns a `publicUrl`. Use Next.js's `<Image>` component to display it, **with the host added to `next.config.ts` `images.remotePatterns`** — otherwise `<Image>` rejects the URL.

```ts
// next.config.ts
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'cdn.our-storage.com' }],
},
```

`<Image>` handles responsive sizing, lazy loading, and modern format negotiation automatically — no need for a CDN-side image processor for basic responsive display.
