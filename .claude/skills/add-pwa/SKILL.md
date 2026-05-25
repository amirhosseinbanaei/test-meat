---
name: add-pwa
description: Turn the Next.js app into an installable PWA with a Service Worker, manifest, offline fallback, runtime caching strategy, and Web Push readiness. Uses Serwist (the maintained successor to next-pwa) configured for Next.js 16 App Router. Locks the strategy: cache-first for static assets, stale-while-revalidate for images, network-first for API and pages, dedicated offline fallback route. Run once per project.
allowed-tools: Read, Write, Bash(npm install:*)
---

# Set up the PWA layer

Adds Progressive Web App capabilities: a Service Worker that proxies network requests for offline support, a Web App Manifest for installation, an offline fallback route, and an `Add to Home Screen` flow. Built on **Serwist** — the maintained, App-Router-native successor to next-pwa, wrapping Workbox primitives.

## When to use

- The product needs to work offline, even if partially.
- The product should be installable on mobile / desktop (PWA install banner).
- The product wants push notifications.
- General UX win: instant repeat loads from cache.

## When NOT to use

- Pure marketing site that's never visited twice. PWA overhead doesn't pay back.
- A site that updates content too frequently to benefit from caching at all.
- The product is wrapped in a native shell already (capacitor / Cordova / RN-Web). The native shell handles offline differently.

## Workflow

1. Read `references/pwa-strategy.md` — the locked caching strategies per resource type, why each was chosen.
2. Read `references/offline-pattern.md` — what works offline, what doesn't, how the offline page is wired.
3. Read `references/install-and-update-flow.md` — the install prompt UX, update detection, when-and-how the SW activates.
4. Install Serwist:
   ```bash
   npm install @serwist/next serwist
   ```
5. Drop config + wrapper:
   - `assets/serwist.config.ts.template` → project root: `serwist.config.ts`
   - `assets/sw.ts.template` → `src/app/sw.ts` (the Service Worker source)
   - `assets/manifest.ts.template` → `src/app/manifest.ts` (Next.js metadata-based manifest)
   - `assets/offline-page.tsx.template` → `src/app/offline/page.tsx` (fallback when network and cache both fail)
6. Update `next.config.ts` to wrap with `withSerwist`. The skill provides a patch to existing config.
7. Drop a Client Component for the install + update UI: `assets/PwaUpdater.tsx.template` → `src/common/components/PwaUpdater.tsx`. Mount it in `app/layout.tsx`.
8. Drop the brand icon set into `public/icons/` — sizes 192×192, 512×512, plus maskable 192×192 and 512×512. (Project-provided — the manifest references them.)
9. Run `lint-and-typecheck` and `npm run build`. The Service Worker is generated at build time by Serwist.

## What this gives you

- **Cache-first for static assets** (JS, CSS, fonts) — instant repeat loads.
- **Stale-while-revalidate for images** — fast, with background refresh.
- **Network-first with cache fallback for pages and API** — fresh when possible, cached when not.
- **Offline fallback page** — when network and cache both miss, the user sees a friendly page instead of the browser's default offline screen.
- **Install prompt UI** — handled by `PwaUpdater.tsx`. Captures `beforeinstallprompt`, renders an in-app "Install" button when eligible.
- **Update detection** — when a new Service Worker is ready, `PwaUpdater.tsx` shows a "New version available — Reload" prompt.
- **Web Push readiness** — the SW is structured to handle push events. Project-specific push subscription flow is added later when needed.

## Files in this skill

- `assets/serwist.config.ts.template` — Serwist config with locked strategies.
- `assets/sw.ts.template` — Service Worker source (precaching + runtime caching + offline + push handler).
- `assets/manifest.ts.template` — App Router metadata-based manifest.
- `assets/offline-page.tsx.template` — the offline fallback route.
- `assets/PwaUpdater.tsx.template` — Client Component for install prompt + update notice.
- `references/pwa-strategy.md` — caching strategies per resource type and why.
- `references/offline-pattern.md` — what's available offline, how the fallback works.
- `references/install-and-update-flow.md` — install/update UX, SW lifecycle.
