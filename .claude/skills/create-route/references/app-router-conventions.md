# App Router file conventions — Next.js 16

Every folder under `app/` is a route segment. The files inside that folder are special — their filename determines their role. Use this as the reference for which file does what.

## The core seven

| File              | What it is                                           | Server or Client? |
|-------------------|------------------------------------------------------|-------------------|
| `page.tsx`        | The actual page content for this segment.            | Server by default |
| `layout.tsx`      | Wraps the segment and its children. Preserves state. | Server by default |
| `loading.tsx`     | Suspense fallback while the page is rendering.       | Server            |
| `error.tsx`       | Error boundary for the segment.                      | **Client only**   |
| `not-found.tsx`   | 404 boundary for the segment.                        | Server by default |
| `template.tsx`    | Like layout but re-mounts on navigation. Rare.       | Server by default |
| `route.ts`        | HTTP route handler. Replaces the API route pattern.  | Server only       |

## What "preserves state" means for layouts

When you navigate from `/blog/foo` to `/blog/bar`, the `app/blog/layout.tsx` does **not** re-render. Its DOM stays mounted, its state stays alive, its effects don't re-fire. Only the `page.tsx` swaps. This is why layouts are perfect for nav bars, sidebars, and persistent shells — and wrong for per-page chrome.

If you genuinely want re-mount-on-navigate behaviour, use `template.tsx` instead. It is structurally identical to `layout.tsx` but unmounts and remounts on every navigation.

## How `error.tsx` works (and the one thing people miss)

`error.tsx` catches errors thrown anywhere inside its segment — pages, child layouts, child error boundaries that re-threw. It does **not** catch errors from its own sibling `layout.tsx`. If your layout itself can throw, place an `error.tsx` one segment higher.

`error.tsx` is the only one of the seven that *must* be a Client Component. It is impossible to have a Server-side `error.tsx`; it would have nothing to recover with.

## How `loading.tsx` works

`loading.tsx` is shorthand for wrapping the segment's `page.tsx` in `<Suspense fallback={<Loading />}>`. You do not need to wrap anything yourself. If you want finer-grained streaming (e.g. show the article body fast, but defer the comments section), use `<Suspense>` explicitly inside the page — `loading.tsx` is the segment-level case.

## Route groups and parallel routes

| Pattern              | What it does                                                                                         |
|----------------------|------------------------------------------------------------------------------------------------------|
| `(group-name)`       | Groups routes for organisation (different layouts, shared concerns) without affecting the URL.       |
| `@slot`              | A parallel route that fills a named slot in the parent layout.                                       |
| `[param]`            | Dynamic segment. `params` will include the segment value.                                            |
| `[...catchAll]`      | Catch-all segment. Receives an array.                                                                |
| `[[...optional]]`    | Optional catch-all. May match the parent path too.                                                   |

Route groups (`(folder)`) are an organisation tool — they let `/about` and `/contact` live under different layouts without nesting their URLs. Parallel routes (`@slot`) are how you render two pages side by side under one layout (e.g. a modal + a page).

## What about Route Handlers (`route.ts`)?

If you need to expose an HTTP endpoint (webhook, API for a non-React client, file upload), use `route.ts`. It exports named functions matching HTTP methods (`GET`, `POST`, etc.) and returns a `Response`. Do not use `route.ts` for things the frontend itself calls — prefer a Server Action via the `create-server-action` skill.

## Things that have moved

- **`middleware.ts` → `proxy.ts`.** Same purpose (request interception, redirects, header manipulation), new name. The exported function is `proxy`, not `middleware`. The old file still works in Next.js 16 but is deprecated.
- **Pages Router (`pages/`) is not used.** Anything that pattern-matches Pages Router conventions should be flagged to the FE Lead.
