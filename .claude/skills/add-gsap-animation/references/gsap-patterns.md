# GSAP patterns

The locked usage patterns for GSAP across the team. Conservative — favors React-correct hooks, lazy loading, and explicit reduced-motion handling over GSAP's flexibility.

## Entry point: `@gsap/react`

Always use the `useGSAP` hook from `@gsap/react`. Don't write raw `useEffect` with GSAP tweens — the GSAP team published this hook specifically because the manual pattern leaks animations on unmount.

```tsx
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from '@/common/lib/gsap-init';

export function Card() {
  const card = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.title', { opacity: 0, y: 20, duration: 0.8 });
  }, { scope: card });

  return (
    <div ref={card}>
      <h3 className="title">...</h3>
    </div>
  );
}
```

The `{scope}` option scopes the selectors so `.title` matches inside `card.current`, not globally. Without it, `gsap.from('.title')` would animate every `.title` on the page — a real bug.

`useGSAP` calls `gsap.context()` internally; cleanup happens on unmount automatically. ScrollTriggers attached inside the scope are also revoked.

## Folder structure

Animations live with the feature they animate:

```
src/modules/marketing/
├── components/
│   └── HeroSection.tsx              ← the rendered React component
├── animations/
│   └── hero-timeline.ts             ← the GSAP timeline construction
```

`hero-timeline.ts` exports a function that takes the scope element and returns the constructed timeline. The component imports it and calls it inside `useGSAP`.

```ts
// modules/marketing/animations/hero-timeline.ts
import { gsap, ScrollTrigger } from '@/common/lib/gsap-init';

export function createHeroTimeline(scope: HTMLElement): gsap.core.Timeline {
  return gsap.timeline({
    scrollTrigger: {
      trigger: scope,
      start: 'top top',
      end: '+=1500',
      scrub: 1,
    },
  });
}
```

Separating the timeline from the component:

1. Makes the component cleaner (rendering vs. animation).
2. Makes the timeline testable (you can construct it in a test harness).
3. Lets the timeline be tree-shaken independently.

For tiny one-off animations (a hover effect, a click bounce), inline `gsap.to` in `useGSAP` is fine. The separation pays off when timelines grow.

## Lazy loading

GSAP is 30–50KB depending on plugins. Don't ship it on routes that don't use it.

Two patterns:

### Pattern 1: dynamic import the component

If the GSAP-animated component is on a specific route or below the fold, use `next/dynamic`:

```tsx
import dynamic from 'next/dynamic';

const HeroSection = dynamic(
  () => import('@/modules/marketing/components/HeroSection').then(m => m.HeroSection),
  { ssr: false, loading: () => <HeroSectionSkeleton /> }
);
```

`ssr: false` because GSAP touches the DOM — there's no benefit to server-rendering it. The skeleton renders during load, full animation hydrates on client.

### Pattern 2: dynamic import the GSAP module

If only a small part of a component needs GSAP, gate the import on intent (interaction, intersection):

```tsx
'use client';
import { useEffect, useRef } from 'react';

export function LazyAnimatedThing() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const { gsap } = await import('@/common/lib/gsap-init');
      gsap.from(el.current, { opacity: 0, y: 50, duration: 1 });
    });
    observer.observe(el.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={el}>...</div>;
}
```

The GSAP chunk loads when the element is about to be visible. Saves bytes on initial load, costs a small delay on first appearance.

## ScrollTrigger setup

Always register the plugin once at module load, never per-component:

```ts
// common/lib/gsap-init.ts
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

`registerPlugin` is idempotent — extra calls are no-ops — so calling it from `gsap-init.ts` everywhere is safe.

ScrollTrigger watches `window` scroll events. With Lenis present, ScrollTrigger needs to be told to use Lenis's tick (see Lenis integration below).

## Lenis integration

When both `add-smooth-scroll` AND this skill are in a project, ScrollTrigger and Lenis must share a ticker. Without this, pinned elements drift relative to Lenis-driven scroll position.

Apply this patch to `SmoothScroll.tsx` — replaces its `requestAnimationFrame` loop with GSAP's ticker:

```tsx
// In SmoothScroll.tsx, replace the raf loop with:
import { gsap } from '@/common/lib/gsap-init';
import { ScrollTrigger } from '@/common/lib/gsap-init';

// ... inside the effect, after creating lenis:
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Cleanup:
return () => {
  gsap.ticker.remove(/* the function above */);
  lenis.destroy();
};
```

The `lenis.on('scroll', ScrollTrigger.update)` line is critical — without it, ScrollTrigger's internal scroll position cache goes stale.

## Common patterns

### Reveal on scroll into view

```ts
useGSAP(() => {
  gsap.from('.item', {
    scrollTrigger: {
      trigger: '.item',
      start: 'top 80%',
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
  });
}, { scope: container });
```

### Pinned section with scrubbed content

```ts
gsap.timeline({
  scrollTrigger: {
    trigger: '.pinned-section',
    start: 'top top',
    end: '+=2000',
    pin: true,
    scrub: 1,
  },
})
  .to('.layer-1', { y: -200 })
  .to('.layer-2', { y: -400 }, 0)  // start at same time as layer-1
  .to('.layer-3', { y: -600 }, 0);
```

### Parallax background

```ts
gsap.to('.parallax-bg', {
  yPercent: -30,
  ease: 'none',
  scrollTrigger: {
    trigger: '.parallax-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
});
```

### Counter / number animation

```ts
const obj = { value: 0 };
gsap.to(obj, {
  value: 1000,
  duration: 2,
  ease: 'power1.out',
  scrollTrigger: { trigger: '.counter', start: 'top 80%' },
  onUpdate: () => {
    counterEl.textContent = Math.floor(obj.value).toString();
  },
});
```

## Pitfalls

| Pitfall | Why it happens | Fix |
|---|---|---|
| Tweens leak on unmount | Manual `useEffect` doesn't clean up | Use `useGSAP` |
| Selectors hit unrelated elements | Missing `{scope}` | Always pass `{scope: container}` |
| ScrollTrigger position is wrong after layout shift | Trigger calculated before layout settled | Call `ScrollTrigger.refresh()` after layout-changing events (image load, font load) |
| Animation runs twice in dev mode | React StrictMode double-invokes effects | `useGSAP` handles this correctly by design; don't bypass it |
| GSAP imported on every route despite lazy intent | Importing from `common/lib/gsap-init` in a top-level module | Use dynamic import for the module that uses GSAP, not direct import |

## Performance budget

If GSAP shows up in your top 10 JavaScript-cost files, you're using too much. Targets:

- Total GSAP-related JS per page < 60KB gzipped (including plugins).
- No more than 2 active ScrollTriggers per route at one time. (Many can be defined; only a few should be actively scrubbing as the user scrolls.)
- Reduced-motion path is the fast path — verify it short-circuits early.

## When NOT to use GSAP

Listed in the main SKILL.md but worth restating here. GSAP is heavy, imperative, and lives outside React's rendering model. Reach for it when the design demands timeline orchestration. For component-tree-driven animation (open/closed, mount/unmount, gestures, layouts), Motion is the locked default and is strictly better-fit for that work.
