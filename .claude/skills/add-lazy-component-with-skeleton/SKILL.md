---
name: add-lazy-component-with-skeleton
description: Lazy-load heavy React components with shadcn Skeleton fallbacks. Use for below-the-fold sections, modal/dialog contents, route-level islands, components that depend on heavy libraries (charts, editors, 3D, GSAP). Two locked patterns — route-mount lazy (next/dynamic) and viewport-triggered lazy (IntersectionObserver). Skeletons are dimensioned to prevent CLS. Never lazy-load above-the-fold components.
allowed-tools: Read, Write
---

# Lazy-load components with skeletons

Defer the JavaScript cost of heavy components until they're actually needed — on user intent, on scroll-into-view, or on route. While loading, show a skeleton that reserves the right space and tells the user something's coming.

## When to use

A component earns lazy loading when **any** of these apply:

- It depends on a heavy library not used elsewhere on the route (chart libs, rich-text editors, 3D scenes, GSAP, code highlighters, PDF viewers).
- It renders below the fold and isn't critical to first paint.
- It only appears on user interaction (modal contents, popover bodies, sidebar panels that expand).
- It's on a route that's reached after a clear intent action (admin panels, settings, account flows).

## When NOT to use

- The component is above the fold. Users see it; it should load with the page.
- The component is small and uses no heavy deps. Lazy-loading saves nothing; you pay a network round-trip for nothing.
- The component is the page's primary content. The user clicked this route to see it — don't make them wait twice.
- It's already part of the initial JS bundle via direct import elsewhere. `next/dynamic` only helps when the module isn't otherwise reachable.

## The two locked patterns

### Pattern 1: route-mount lazy (`next/dynamic`)

For components that render when their parent renders — but the parent renders below the fold, in a tab, or in a modal.

```tsx
import dynamic from 'next/dynamic';
import { ChartSkeleton } from './ChartSkeleton';

const RevenueChart = dynamic(
  () => import('./RevenueChart').then((m) => ({ default: m.RevenueChart })),
  { loading: () => <ChartSkeleton />, ssr: false },
);

export default function DashboardPage() {
  return (
    <div>
      <KpiTiles />
      <RevenueChart />   {/* JS loads when this renders */}
    </div>
  );
}
```

The chart's JS doesn't ship with the page bundle. It loads when the component mounts. The skeleton shows while loading.

### Pattern 2: viewport-triggered lazy (IntersectionObserver)

For components way below the fold — the user might never scroll to them. Load only when they enter (or are about to enter) the viewport.

```tsx
'use client';
import { LazyOnView } from '@/common/components/LazyOnView';
import { ChartSkeleton } from './ChartSkeleton';

const RevenueChart = dynamic(
  () => import('./RevenueChart').then((m) => ({ default: m.RevenueChart })),
  { loading: () => <ChartSkeleton />, ssr: false },
);

export default function ReportPage() {
  return (
    <main>
      <ReportHeader />
      <ReportSummary />
      <LazyOnView fallback={<ChartSkeleton />} rootMargin="200px">
        <RevenueChart />
      </LazyOnView>
    </main>
  );
}
```

`LazyOnView` defers even the dynamic import call until the placeholder is near the viewport. The skeleton shows until the component is reached.

## Workflow

1. Read `references/when-to-lazy.md` — the decision rules and antipatterns.
2. Read `references/skeleton-patterns.md` — locked skeleton shapes per component type.
3. Drop `assets/LazyOnView.tsx.template` → `src/common/components/LazyOnView.tsx` (one-time per project).
4. For each lazy load:
   - Identify the heavy component.
   - Write its skeleton (`<ComponentName>Skeleton.tsx`) next to it, in the same components folder.
   - Wrap the import in `dynamic()` with the skeleton as `loading`.
   - If viewport-triggered, wrap the usage in `<LazyOnView>`.
5. Run `lint-and-typecheck` and verify the chunk split: `npm run build` then check that the heavy lib is in its own chunk.

## What's the difference between the two patterns?

| Trigger | Pattern | When to pick it |
|---|---|---|
| Component renders → JS loads | `next/dynamic` only | Component is reached via intentional UI (tab click, modal open, route visit) |
| Component scrolls near viewport → JS loads | `next/dynamic` + `LazyOnView` | Component is far below the fold and may never be reached |

If unsure: start with Pattern 1. Add Pattern 2 only when measurement shows the component's JS is downloaded but the user never scrolls there.

## Skeletons

Every lazy component has a sibling skeleton. The skeleton:

- Renders **the same outer dimensions** as the loaded component (no CLS when content swaps in).
- Uses shadcn `<Skeleton>` for the shimmer effect.
- Conveys **structure**, not content (rectangles in roughly the right shape).
- Has `role="status"` + `aria-label="Loading"` on the wrapping container for screen readers.
- Is short — under 30 lines. Long skeletons are an antipattern (you're nearly building the component again).

See `references/skeleton-patterns.md` for shapes per component type.

## ssr: false vs ssr: true

`next/dynamic` defaults to `ssr: true` — the component still renders server-side. Use this for:

- Components that work in SSR (no `window`, no `document` access).
- Components where the HTML output matters for SEO or LCP.

Use `ssr: false` for:

- Components touching `window`, `document`, `localStorage` directly at module top.
- Components depending on libraries that crash on the server (most chart libs, three.js, GSAP).
- Components where server rendering wastes work (e.g. user-specific dashboards behind auth).

When in doubt: try `ssr: true` first; fall back to `ssr: false` if you get hydration errors.

## What this gives you

- The page's initial JS bundle stays small — heavy components ship as separate chunks.
- Skeletons prevent layout shift during load (CLS friendly).
- Components below the fold or behind interaction don't burn bandwidth or battery on initial load.
- Screen-reader users hear "loading" via the skeleton's `aria-label`.

## Files in this skill

- `assets/LazyOnView.tsx.template` — viewport-triggered lazy wrapper using IntersectionObserver.
- `assets/ChartSkeleton.tsx.template` — example skeleton (replace per component type).
- `references/when-to-lazy.md` — decision rules, what NOT to lazy-load, common pitfalls.
- `references/skeleton-patterns.md` — locked skeleton shapes for charts, tables, articles, forms, cards, lists.
