---
name: add-file-upload
description: Adds file uploads to the frontend. Uses `react-dropzone` for the drop-zone UI, `browser-image-compression` for client-side image compression before upload, and `react-image-crop` when the user needs to crop. Uploads go through the separate backend — either as multipart through a Server Action, or (preferred for large files) via a presigned URL the backend issues. Use whenever the user uploads anything — avatars, blog images, attachments.
allowed-tools: Bash(npm *), Bash(npx *), Read, Write
---

# Add file upload

Single, opinionated answer to "the user needs to upload a file".

## Architectural rule

**Next.js never proxies large files.** The separate backend issues a presigned URL; the browser PUTs the file straight to object storage; the frontend notifies the backend on success. Two reasons:

1. Big-file uploads through Next.js Server Actions block a worker for the upload duration. Not free, and it scales badly.
2. The backend already owns auth and storage credentials. Letting it mint a presigned URL is one extra endpoint, not a new responsibility.

For **small files** (avatars, single attachments under ~1 MB after compression), a Server Action multipart upload is fine. The skill supports both.

## When to use

- A user-facing form has a file/image input (single or multiple).
- The blog editor (from `add-rich-text-editor`) needs to upload images.
- An avatar / logo upload flow.

## When NOT to use

- The "upload" is server-side only (e.g. backend ingesting files from an API) — that's not a frontend concern.
- The need is a config / static asset — those aren't user uploads.

## Inputs expected

- `mode` — `presigned-url` (default for images/files >1 MB) | `server-action` (small files).
- `accept` — MIME types, e.g. `image/*`, `image/jpeg,image/png,application/pdf`.
- `max_size_mb` — number, the upper bound on file size.
- `multiple` — boolean, whether to accept many files.
- `image_compression` — `true` if the upload is images and should be compressed client-side before upload. Default `true` for `image/*`, `false` otherwise.
- `image_crop` — `true` if the user should crop the image before upload (avatars, hero images).

## Packages to install (per-skill, NOT in scaffold)

```bash
npm install react-dropzone browser-image-compression react-image-crop
```

These are not in the base scaffold — only install when this skill runs, so projects without uploads stay lean.

## Workflow

1. Read `references/upload-architecture.md` — the two upload modes, when to use which, what the backend must provide.
2. Read `references/image-pipeline.md` — compression and cropping decisions, quality vs size trade-offs.
3. Install the packages.
4. Copy the right template from `assets/`:
   - `assets/dropzone.tsx.template` — base drop-zone Client Component.
   - `assets/use-upload-presigned.ts.template` — hook for the presigned-URL flow.
   - `assets/use-upload-action.ts.template` — hook for the Server Action flow.
   - `assets/image-crop.tsx.template` — cropping modal Client Component.
5. Wire the dropzone to one of the hooks based on `mode`.
6. If `image_compression` is on, run uploads through the compressor before sending.
7. If `image_crop` is on, show the cropper modal after pick + before upload.

## Files in this skill

- `assets/dropzone.tsx.template` — Client Component for drag-and-drop file selection.
- `assets/use-upload-presigned.ts.template` — presigned-URL upload hook with progress.
- `assets/use-upload-action.ts.template` — Server Action multipart upload hook.
- `assets/image-crop.tsx.template` — react-image-crop modal.
- `assets/compress-image.ts.template` — wrapper around browser-image-compression with sensible defaults.
- `references/upload-architecture.md` — the two modes, backend contract, why no proxying.
- `references/image-pipeline.md` — compression and cropping rules.
