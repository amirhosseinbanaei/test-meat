# Upload architecture

Two modes, one rule.

## The rule

**Next.js never proxies large files through Server Actions.** Server Actions are blocking — a 50 MB upload ties up a worker for as long as the upload takes, which is awful both for the user (slow) and the server (concurrency dies).

For anything bigger than ~1 MB after compression, the upload bytes go **directly from the browser to object storage** via a presigned URL the backend issues. The frontend's job is:

1. Ask the backend (via a Server Action) for a presigned URL.
2. PUT the bytes to that URL.
3. Tell the backend "done" so it can finalise.

For tiny files (avatars after compression, single-image attachments), a Server Action multipart upload is fine. Less infrastructure, slightly cheaper to wire.

## Mode 1 — presigned URL (preferred)

```
┌────────┐  1. requestUploadUrl(file meta)  ┌─────────────┐
│Browser │ ─────────────────────────────►   │ Next.js     │
│        │                                  │ Server Act. │
│        │  ◄──── { uploadUrl, fileId } ─── │             │
│        │                                  └─────┬───────┘
│        │                                        │ forwards
│        │                                        ▼
│        │                                  ┌─────────────┐
│        │  2. PUT bytes  ──────────────►   │ Backend     │
│        │  (direct to storage URL)         │ + Storage   │
│        │  ◄───── 200 OK ──────────────    │ (S3/R2)     │
│        │                                  └─────────────┘
│        │  3. notifyComplete(fileId)       ┌─────────────┐
│        │ ─────────────────────────────►   │ Next.js     │
│        │                                  │ Server Act. │
│        │  ◄──── { ok: true, url } ──────  └─────────────┘
└────────┘
```

### Backend contract

The backend exposes two endpoints (or whatever shapes them — the Server Actions wrap them):

```
POST /uploads
  body:  { contentType, size, filename, kind }
  returns: { uploadUrl, fileId, publicUrl, fields? }

POST /uploads/:id/complete
  body:  { fileId, meta? }
  returns: { ok: true } | { ok: false, error }
```

The `fields` (when using S3 POST policies instead of PUT) are extra form fields the backend prescribes. PUT presigned URLs are simpler; use them unless the storage requires POST.

### When to use this mode

- Always for files > 1 MB.
- Always when you want a progress bar (the hook uses XHR, which has upload progress).
- Always for blog images, document attachments, video.

## Mode 2 — Server Action multipart

```
┌────────┐  uploadFile(FormData)  ┌─────────────┐
│Browser │ ──────────────────►    │ Next.js     │
│        │                        │ Server Act. │
│        │                        └──────┬──────┘
│        │                               │ POST multipart
│        │                               ▼
│        │                        ┌─────────────┐
│        │  ◄──── { ok, url } ──  │ Backend     │
└────────┘                        └─────────────┘
```

### When to use

- Tiny files only (avatars after compression, sub-1-MB single uploads).
- One-off forms where presigned-URL infrastructure isn't justified.
- When progress reporting isn't needed.

### Trade-offs

- Simpler — one Server Action, no presigned-URL endpoint.
- Slower for big files.
- No granular progress.
- Bytes pass through Next.js — extra hop, extra worker time.

## Why not Server Actions for everything

Two reasons we hit fast in practice:

1. **Worker concurrency.** Server Actions block a server function. On Vercel-like deployments, this means upload duration eats your concurrency budget. Two users uploading 30 MB videos can starve every other request.
2. **Progress.** Fetch's upload progress is awful to implement (no native `progress` event for upload streams in all browsers). XHR is the boring answer that works.

## Why not UploadThing or similar

UploadThing is excellent for projects with no backend. We have a separate backend; the upload contract should live there. Adding UploadThing means a third system in the auth/storage chain — that's the kind of complexity the locked stack exists to avoid.

If you find yourself needing UploadThing-level features (file management UI, image transforms on demand, etc.), build them on the backend's storage layer — the FE just calls the backend's URLs.

## Auth on the upload itself

Two layers:

- The presigned URL is short-lived (5-15 min) and bound to the upload's metadata (size, content type). Even leaked, it's a tiny window.
- The `notifyComplete` call goes through the Server Action, which has the user's auth cookie. The backend knows who's claiming this upload.

Never put the access token in a query string or include it in the public storage URL. The presigned URL is its own authenticator.

## Error cases the hook handles

- File too large → rejected at the dropzone before any network call.
- Wrong content type → rejected at the dropzone.
- Network failure mid-upload → state goes to `error`; user can retry.
- 401 from the backend on the request-URL step → handled by the api-client's refresh flow; if refresh fails, surface "session expired".
- Storage returns 4xx (URL expired, signature mismatch) → state goes to `error`; usually means clock skew or a too-long delay between request and PUT. Hook treats it as retriable.

## Multiple files

Both hooks support sequential uploads by calling `upload(file)` in a loop with `await`. For parallel uploads, kick off the promises without awaiting them and `Promise.all` at the end. Storage providers handle 5-10 parallel uploads from one browser without issue.

For uploads of many files (drag a folder of 50 images), throttle to 4-6 parallel to avoid hitting connection limits. A simple `p-limit`-style helper is fine — don't bring in a library for it.
