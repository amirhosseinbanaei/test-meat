# Offline behavior

Honest framing: "offline support" doesn't mean the full app works offline. It means we degrade gracefully. Here's the locked behavior, by user action:

## What works offline (after at least one visit)

| Action | Result offline |
|---|---|
| Visit a page they've been to before | Served from cache. Looks instant. |
| Load images they've seen before | Served from cache. |
| Use static features (forms, calculators, in-memory state) | Works. The SW serves the JS bundle from precache. |
| Click an internal link to a cached page | Works. |
| Click an internal link to an uncached page | Falls back to /offline. |
| Click an internal link to an API-driven page | NetworkFirst times out (5s), then serves cached page if it exists, else /offline. |
| Trigger a mutation (form submit, "save", "delete") | Fails with the standard network error. **No queueing by default.** See "Queue-and-retry" below. |
| Receive a push notification | Works. Push delivery is server-driven and runs through the SW. |

## What does NOT work offline

| Action | Why it doesn't work |
|---|---|
| Logging in for the first time | Auth requires the backend. NetworkOnly. |
| Refresh on a never-visited page | No cache to fall back to. |
| Real-time data (WebSocket, SSE) | Bypasses the SW; requires a connection. |
| Mutations (POST/PUT/DELETE) | NetworkOnly by policy. |

## The offline page

When network and cache both fail for a navigation, the SW serves `/offline`. This page is **self-contained** — no API calls, no client-only deps that need network. The point is it works without one.

Three actions on the offline page:

1. "Go home" — back to `/`, which is almost always cached.
2. "Try again" — `location.reload()`. If network came back, you get the real page.
3. Implicit: any of the user's previous visits remain accessible from the nav.

Don't put feature content on the offline page. It's a graceful fallback, not a destination.

## Optimistic UI for offline mutations

A common pattern: the user clicks "save" offline. The app shows "saved" optimistically; the SW queues the mutation; it sends when connectivity returns.

**We don't ship this by default.** Reasons:

- It works well for small things (favorite a post, set a flag) but breaks badly for high-stakes things (place an order, send a message that can't be sent twice).
- Conflict resolution when the queued mutation hits a server that's moved on is hard. The wrong default is "silently apply"; the right default per case requires product input.
- It hides the network state from the user, which confuses them when something fails after they thought it succeeded.

When a feature genuinely needs offline-queued mutations:

- Identify the operation as idempotent or non-idempotent.
- Use the backend's idempotency-key support (frontend already sends keys for retryable POSTs).
- Surface "this will be sent when you're back online" UI — don't fake success.
- Build per-feature; don't generalize.

Add a per-feature skill for this when it comes up. Don't centralize it in the SW.

## Detecting offline state in the UI

Use the `useOnline()` hook from `common/hooks/useOnline.ts` (already in the team's hook library). Show a small banner / status when offline, hide it when online.

```tsx
const online = useOnline();
{!online && <OfflineBanner />}
```

Caveat: `navigator.onLine` reports network *interface* state, not actual internet reachability. Wi-Fi but no internet still reads as "online". For truly knowing, ping a healthcheck endpoint — but most apps don't need that.

## What the SW shows in DevTools

- **Application → Service Workers**: registered SW, status, version.
- **Application → Cache Storage**: every cache by name, sizes, entries.
- **Application → Manifest**: parsed manifest, install eligibility.
- **Network → Offline checkbox**: simulate offline for testing.

The locked workflow includes testing the offline path:

1. Visit the app, navigate around to seed caches.
2. DevTools → Network → check "Offline".
3. Refresh. Confirm cached pages work; navigate to a never-visited route; confirm /offline appears.

## Mobile considerations

- **iOS Safari** supports SW but the install-from-home-screen flow goes through the Share menu, not `beforeinstallprompt`. The PwaUpdater component won't show the install button on iOS — there's no event to capture. We can add an iOS-specific "Add to Home Screen" tutorial component if a project needs it.
- **Android Chrome** is the gold standard for PWA support. `beforeinstallprompt` fires when the install criteria are met.
- **Samsung Internet**: works similarly to Chrome.

iOS detection is in `common/lib/device.ts` (`isIOS()`); use it to render an iOS-specific install hint where appropriate.
