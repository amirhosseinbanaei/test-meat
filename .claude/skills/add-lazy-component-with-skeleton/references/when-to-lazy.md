# When to lazy-load a component

The decision rule. Lazy loading helps when it removes bytes from the critical path; it hurts when it adds round-trips for components the user needs immediately.

## The decision flow

```
Is the component above the fold on initial page load?
└── Yes → DO NOT lazy-load. Include in the initial bundle.

Does the component depend on a heavy library (>30KB) not used elsewhere?
├── Yes → Strong candidate for lazy.
└── No
    │
    Is the component reached via clear user intent (click, scroll, route nav)?
    ├── Yes → Lazy via next/dynamic. Skeleton matches the empty state.
    └── No
        │
        Does the component appear on most page loads, near the fold?
        ├── Yes → DO NOT lazy-load. The user pays a round-trip for no benefit.
        └── No → Lazy via LazyOnView for viewport-triggered loading.
```

## Strong candidates

| Component type | Typical lib weight | Lazy pattern |
|---|---|---|
| Charts (Recharts, Chart.js, D3) | 50–200KB | `next/dynamic`, often `ssr: false` |
| Rich text editor (Tiptap, Lexical, ProseMirror) | 100–300KB | `next/dynamic`, `ssr: false` |
| Code highlighter (Prism, Shiki, highlight.js) | 30–500KB depending on languages | `next/dynamic` |
| PDF viewer | 200KB+ | `next/dynamic`, `ssr: false` |
| 3D scene (Three.js, r3f) | 600KB+ | `next/dynamic`, `ssr: false` (handled in `add-3d-scene`) |
| GSAP-animated section | 30–60KB | `next/dynamic` (handled in `add-gsap-animation`) |
| Map (Mapbox, Leaflet, Google Maps) | 100–300KB | `next/dynamic`, `ssr: false` |
| Date picker (heavy ones with calendars + ranges) | 50KB+ | `next/dynamic` |
| Modal-only deep content (settings panels, data tables in dialogs) | varies | `next/dynamic` |
| Below-the-fold marketing sections | varies | `LazyOnView` |
| Comments section on an article | depends on stack | `LazyOnView` |
| Recommended-products carousel at page bottom | depends on stack | `LazyOnView` |

## What NOT to lazy-load

| Component | Why |
|---|---|
| The page's primary content | The user came for this — don't make them wait twice |
| Navigation, header, footer | On every page, used immediately, small |
| Shadcn UI primitives (`<Button>`, `<Card>`, etc.) | Already tree-shaken; lazy adds overhead for no benefit |
| Components that are already in the initial bundle via other imports | Lazy can't help — the JS is already there |
| Tiny components (< 5KB after build) | Round-trip cost exceeds savings |
| Form fields the user is about to interact with | Latency on first paint hurts UX more than first-bundle bytes |
| Anything in the initial viewport | "Above the fold" includes the entire visible area on page load, accounting for the user's likely viewport size |

## Measuring before deciding

Before lazy-loading anything, measure the savings:

1. Build the page with the component imported normally.
2. `npm run build` → inspect `.next/static/chunks/` for the page's chunk size.
3. Move the component to lazy. Rebuild.
4. Inspect again. Did the page chunk shrink? Did a new chunk appear?
5. If the saving is < 20KB, the lazy is probably not worth the complexity.

Tools:

- `@next/bundle-analyzer` — visualizes chunk composition.
- Lighthouse on the route — measures real impact on LCP / TBT.

## Common pitfalls

### Lazy-loading a component that's also imported eagerly elsewhere

```tsx
// Page A
import { HeavyChart } from './HeavyChart';  // eager — ships with page A

// Page B
const HeavyChart = dynamic(() => import('./HeavyChart'));  // lazy attempt — fails to split
```

Webpack puts `HeavyChart` in page A's chunk because page A eager-imports it. Page B's `dynamic()` resolves to the existing chunk. Lazy is a no-op.

Fix: don't eager-import a shared heavy component. Either make all consumers lazy, or accept that it's in the initial bundle.

### Forgetting the skeleton

```tsx
const Chart = dynamic(() => import('./Chart'));  // no loading prop
```

Without `loading`, the user sees an empty space, then the chart pops in. CLS + jarring.

Always provide a skeleton that matches dimensions.

### Lazy-loading something the user clicks IMMEDIATELY after page load

```tsx
const Modal = dynamic(() => import('./Modal'));

<Button onClick={() => setOpen(true)}>Open</Button>  // user clicks within 100ms
```

The user clicks; the modal's JS starts downloading; the user sees a blank skeleton for 500ms+ on a slow connection. They click again, frustrated.

For high-likelihood-of-click items: **preload on hover**:

```tsx
const Modal = dynamic(() => import('./Modal'));

<Button
  onMouseEnter={() => import('./Modal')}  // pre-fetch
  onClick={() => setOpen(true)}
>
  Open
</Button>
```

Or on intent (focus, mouse-near-button). The dynamic import is cached — by the time the user clicks, the module's already in memory.

### Forgetting `ssr: false` for client-only libs

```tsx
const Editor = dynamic(() => import('./Editor'));  // tiptap inside
```

If `Editor` touches `window` or `document` at module top, SSR crashes. The Next.js error is helpful, but a slow build cycle.

For known client-only libs (3D, GSAP, charts, editors), default to `ssr: false`. Even for SSR-safe libs, if the component is user-specific and there's no LCP benefit to SSR, `ssr: false` is fine.

### Wrapping every component in LazyOnView

```tsx
<LazyOnView><Header /></LazyOnView>
<LazyOnView><Card1 /></LazyOnView>
<LazyOnView><Card2 /></LazyOnView>
```

Every wrapper adds:

- An IntersectionObserver registration.
- An extra DOM element (the wrapper div).
- A state machine that swaps content on scroll.

For tiny components: just render them. The cost of the lazy machinery exceeds the saving.

LazyOnView is for genuinely heavy below-the-fold sections — the comments thread, the recommendations carousel, the chart panel. Not for every visual block.

## Preloading patterns

Three places to preload a lazy chunk so the user doesn't wait when they click:

```tsx
const Modal = dynamic(() => import('./Modal'));

// On hover — likely click coming
<Button onMouseEnter={() => import('./Modal')} onClick={...}>...</Button>

// On focus — keyboard user about to act
<Button onFocus={() => import('./Modal')} onClick={...}>...</Button>

// On idle — browser idle time, no UI cost
useEffect(() => {
  if ('requestIdleCallback' in window) {
    const id = requestIdleCallback(() => { void import('./Modal'); });
    return () => cancelIdleCallback(id);
  }
}, []);
```

Use sparingly. Preloading everything defeats lazy loading.

## Anti-patterns to avoid

| Anti-pattern | Better |
|---|---|
| Lazy-loading the only thing on a route | Don't lazy; the route's job IS that component |
| Lazy-loading without a skeleton | Always supply a dimensioned fallback |
| Lazy-loading a tiny component | Skip; round-trip > savings |
| Lazy-loading something used eagerly elsewhere | Either lazy everywhere or eager everywhere |
| Using lazy as a way to fix SSR errors | Fix the SSR error (move client-only code into useEffect) or use `'use client'` correctly |
| Skeleton has wrong dimensions | Measure and match |
| Lazy + LazyOnView with rootMargin 0 | Loads JUST as user reaches it; spinner visible. Use 100–300px margin |
