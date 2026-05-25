# Lenis patterns

The locked configuration, the lifecycle, and how Lenis integrates with the rest of the stack.

## Locked defaults

The `SmoothScroll` component initializes with these defaults:

```ts
new Lenis({
  duration: 1.2,                                                  // Time to settle on programmatic scrollTo
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),      // Sharp settle, no bounce
  smoothWheel: true,                                              // Smooth on mouse wheel
  wheelMultiplier: 1,                                             // Don't amplify wheel
  touchMultiplier: 1.5,                                           // Slight amplification on touch
  lerp: 0.1,                                                      // Interpolation factor — lower = smoother
});
```

The `easing` function is exponential-out, which feels precise rather than bouncy. Bouncy easings (cubic-bezier with overshoot) feel toy-ish on content sites — fine for marketing experiments, wrong for product surfaces.

`lerp` of 0.1 is the canonical Lenis default. Lower values (0.05) are slower and softer; higher (0.2) snap quicker. Don't go above 0.15 — anything sharper than that and you might as well use native.

## When to override

Override per-project only with ui-visual-lead sign-off. Common cases:

- **Storytelling sites**: increase `duration` to 1.5–2.0 for slower, more deliberate scroll-pacing.
- **Apps with productivity flow**: `lerp` up to 0.15 for snappier response.
- **Mobile-heavy products**: drop `smoothWheel` (rarely fires on mobile) and tune `touchMultiplier` carefully — mobile users have OS-tuned momentum and Lenis can fight it.

## Lifecycle

```
mount → check reduced-motion ─ yes ─→ no Lenis. Native scroll.
              │
              no
              ↓
        check ?lenis=off ─ yes ─→ no Lenis.
              │
              no
              ↓
        new Lenis(...) + raf loop + event listeners
              │
              ↓
unmount → cancelAnimationFrame + remove listeners + lenis.destroy()
```

The `raf` loop runs every frame while mounted and Lenis is active. Lenis uses it to interpolate the current scroll position toward the target. Performance: typically <1% of a frame's budget on desktop, ~2-3% on mid-tier mobile. Real but small.

## GSAP ScrollTrigger integration

Lenis pairs naturally with GSAP ScrollTrigger. The pattern:

```ts
// Once, after both Lenis and ScrollTrigger are loaded:
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// In SmoothScroll's effect, after creating lenis:
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

This replaces the manual `requestAnimationFrame` loop with GSAP's ticker, so both Lenis and ScrollTrigger update in lockstep. Without this, ScrollTrigger pins drift relative to Lenis-driven scroll.

When both `add-smooth-scroll` AND `add-gsap-animation` skills are in the project, the GSAP skill adds the integration code to `SmoothScroll.tsx`. The default `SmoothScroll` template runs its own raf loop; the integration patch replaces it.

## Anchor links

The default behavior: `<a href="#section">` triggers Lenis smooth-scroll to the target. Implemented via document-level click listener in `SmoothScroll.tsx`.

To opt out for a specific link, add `data-lenis-ignore="true"`:

```tsx
<a href="#footer" data-lenis-ignore="true">Footer (instant jump)</a>
```

Useful for skip-links — the skip-to-main link should jump instantly so screen-reader and keyboard users land on content immediately.

## Focus-into-view

When an element receives focus via Tab and is out of viewport, `SmoothScroll` calls `lenis.scrollTo(el, { offset: -100 })` to bring it into view. The offset accounts for sticky headers.

Project-specific sticky header sizes: tune the offset in `SmoothScroll.tsx` if needed.

## What Lenis does NOT do

- Doesn't handle programmatic `window.scrollTo()` or `element.scrollIntoView()`. Native calls still go through native. Use `useLenisScroll` for programmatic smooth-scroll.
- Doesn't handle scrolling inside specific elements (modals, sidebars). It hooks into document scroll only. Internal scroll containers behave natively, which is usually correct.
- Doesn't handle horizontal scroll. Lenis is vertical-only by default. Horizontal mode exists but isn't part of the locked setup.

## Performance hooks

Lenis has `on('scroll', cb)` for hooking into scroll events. Use it for scroll-driven UI (progress bars, parallax effects). Don't use it to fire heavy work on every scroll frame — throttle to once per 100ms minimum.

```ts
let lastFired = 0;
lenis.on('scroll', () => {
  const now = performance.now();
  if (now - lastFired < 100) return;
  lastFired = now;
  updateScrollProgress();
});
```

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Sticky elements lag during scroll | Sticky + Lenis fight each other on some browsers | Use `position: sticky` with `top` set; avoid mixing Lenis with scroll-event-based sticky polyfills |
| GSAP ScrollTrigger pins drift | Lenis and ScrollTrigger not synced via shared ticker | Apply the ScrollTrigger integration above |
| iOS Safari momentum feels off | Lenis intercepting native momentum-scroll | Test on real iOS. If bad: `smoothTouch: false` or skip Lenis on iOS entirely |
| Page jumps to top on route change | Lenis lazily updates its bounds | Call `lenis.resize()` on navigation; or `lenis.scrollTo(0, { immediate: true })` |
| Modal scroll inside is jumpy | Lenis trying to handle the modal | Modal content is in a scroll container — Lenis ignores it. If it doesn't, add `data-lenis-prevent` |

## Mental model

Lenis is a thin layer between user input (wheel, touch) and the browser's scroll. It collects input, smooths it via lerp interpolation, and applies `window.scrollTo()` on every frame. The actual scroll is still native — just driven by Lenis instead of the browser.

This means everything that watches `window` scroll events (`IntersectionObserver`, scroll-driven animations, scroll-based analytics) sees scroll happen — just smoothly over time instead of in discrete jumps. Mostly compatible. Mostly.
