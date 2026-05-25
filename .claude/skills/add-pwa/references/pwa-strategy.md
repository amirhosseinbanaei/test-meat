# PWA caching strategy

Why each resource type gets the strategy it gets. The shape of these decisions is the difference between a PWA that feels instant and one that ships stale data.

## The mental model

Service Workers intercept network requests and decide what to return. Four strategies cover ~95% of cases:

| Strategy | What happens | Best for |
|---|---|---|
| **CacheFirst** | Look in cache; only hit network if missing. | Versioned, immutable assets (hashed JS/CSS bundles, fonts, build artifacts). |
| **NetworkFirst** | Try network with a timeout; fall back to cache. | Pages, API responses where freshness matters. |
| **StaleWhileRevalidate** | Return cache immediately; fetch in background to update. | Images, semi-static content where slightly-stale is fine. |
| **NetworkOnly** | Skip cache entirely. | Auth flows, mutations, real-time data. |

## The team's locked map

```
Fonts (woff2, ttf, …)        →  CacheFirst        (1 year, immutable hash)
Images                       →  StaleWhileRevalidate (30 days)
API GET (/api/*)             →  NetworkFirst      (10s timeout, 1 hour cache)
Page navigations             →  NetworkFirst      (5s timeout, 24 hour cache)
Build assets (hashed JS/CSS) →  Precached         (immutable, replaced on update)
Mutations (POST/PUT/DELETE)  →  NetworkOnly       (never cache mutations)
Anything else                →  NetworkFirst with cache fallback
```

## Why these choices

### Fonts → CacheFirst, 1 year
Fonts almost never change for a project. When they do, the URL changes. Cache-first is the right pick. The 1-year `Cache-Control` value is what the team would set at the HTTP layer too.

### Images → StaleWhileRevalidate, 30 days
Images don't change unless URLs change. SWR returns the cached image instantly and updates in the background — perceived performance win. The 30-day window prevents unbounded growth on devices that revisit constantly.

### API GET → NetworkFirst, 10s timeout
APIs return data that *can* change. NetworkFirst means freshness is preferred. The 10-second timeout matters: slow networks shouldn't block the user — fall back to cache while the request continues. The 1-hour cache lifetime is short enough that stale-data anxiety is minimal; tune per project if needed.

### Page navigations → NetworkFirst, 5s timeout
Same logic as API but tighter. Pages should be fresh; failing fast to cache is better than staring at a spinner. The 24-hour cache window is enough for repeat-visitor instant-loads.

### Mutations → NetworkOnly
NEVER cache POST / PUT / DELETE. They have side effects on the server. The Service Worker doesn't even try.

### Build assets → Precached
Serwist's precaching runs at build time. It collects the build's hashed outputs and stuffs them into the cache when the SW installs. They're immutable — different hash, different URL — so cache-first is safe and infinitely reusable.

## What's NOT cached

- Anything from a different origin (third-party scripts, analytics) — the SW only proxies same-origin requests by default.
- `Authorization` header'd requests are not cached (the matcher in `sw.ts` filters them out for the API route).
- Anything beyond the size limit. Workbox/Serwist drop very large responses (default 50MB cap per cache).

## Authentication interaction

Two interactions matter:

1. **Logged-out users seeing logged-in cache** is a real risk if the same URL serves different content based on cookies. The locked answer: pages that depend on auth should *not* be cached for offline (mark them `Cache-Control: private, no-store` on the server, and the SW respects that with `noCache` plugin if needed). Public pages cache freely.
2. **API caching when the auth token rotates.** The frontend's api-client refreshes tokens on 401. The SW's NetworkFirst caches the *response*, not the request — so if a 401 happens, the SW doesn't cache that, it tries again with the refreshed token. No special handling needed beyond what's already in place.

## Cache versioning and invalidation

Serwist generates a new precache manifest per build, keyed by content hash. When the SW installs an update, it:

1. Caches the new immutable assets.
2. Marks the old cache for cleanup (Serwist handles this automatically — `cleanupOutdatedCaches`).
3. Waits to activate (skipWaiting: false in our config) until the user accepts the update via PwaUpdater.

Runtime caches (fonts, images, api) are versioned by name, not hash. To force-bust a runtime cache (rare — usually unnecessary), change the cache name in `sw.ts` and rebuild. Old cache becomes orphaned and gets cleaned up.

## What about real-time data?

Don't try to cache real-time data (WebSocket, SSE, polling endpoints) through the Service Worker. SW caching is for request/response cycles. Real-time channels are separate connections that bypass the SW. The SW shouldn't touch them.

## Quotas and eviction

Browsers cap storage per origin (varies — Chrome gives ~6% of free disk; Safari ~1GB; Firefox 10%). When the quota fills, the browser can evict the whole origin's data without warning.

Implications:

- Don't cache aggressively beyond what users need offline. The 30-day image window above is deliberate.
- Don't store critical user data in cache only — use IndexedDB for that. (Out of scope for this skill.)
- Plan for cache being empty as the default state — every strategy here has a network or fallback path.

## Measuring

After install, the **Application → Service Workers** tab in DevTools shows the registered SW. **Cache Storage** shows what's in each cache and total size. The **Network** tab marks SW-served responses with "(ServiceWorker)" in the Size column.

For production telemetry, the SW can report cache-hit metrics via `postMessage` to a client that forwards them to analytics. We don't wire that by default — add it when there's a measurable need.
