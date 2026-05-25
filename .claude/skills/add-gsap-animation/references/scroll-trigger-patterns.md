# ScrollTrigger patterns and pitfalls

ScrollTrigger is the most-used GSAP plugin and the source of most GSAP confusion. This doc covers the patterns that come up and the bugs that bite.

## The four-position model

Every ScrollTrigger has a `start` and `end`, each expressed as `<trigger-element-position> <viewport-position>`:

```
start: 'top top'      → trigger's top hits viewport's top
start: 'top 80%'      → trigger's top hits 80% down the viewport (i.e. near bottom)
start: 'top bottom'   → trigger's top enters the viewport's bottom
end:   'bottom top'   → trigger's bottom hits viewport's top (i.e. trigger has scrolled off-screen up)
end:   '+=500'        → end is 500px scroll distance after start
end:   '+=100%'       → end is 100% of viewport height after start
```

Mental model: think of two reference points (trigger's edge, viewport's edge) meeting.

## `scrub`

Without `scrub`, the timeline plays once when `start` is reached. With `scrub`:

- `scrub: true` → timeline progress is tied 1:1 to scroll position.
- `scrub: 1` → timeline catches up to scroll with a 1-second delay (smoother feel).
- `scrub: 0.5` → catches up with 0.5-second delay (snappier).

For scroll-driven scrubbing (panels reveal as you scroll), `scrub: 1` is the locked default. Feels natural.

## `pin`

Pinning fixes the trigger in place while the user scrolls through the timeline duration.

```ts
scrollTrigger: {
  trigger: '.hero',
  start: 'top top',
  end: '+=2000',
  pin: true,
  scrub: 1,
}
```

The hero stays at the top of the viewport for 2000px of scroll, during which the timeline plays. After 2000px the pin releases and normal scrolling resumes.

Pinning is the most powerful AND most fragile ScrollTrigger feature. Pitfalls:

- **Layout shifts**: pinning inserts a spacer to preserve scroll height. If the trigger's height changes after pinning starts, the spacer is wrong.
- **CSS transforms on ancestors**: if a parent has `transform`, `filter`, or `will-change`, the fixed-position trick ScrollTrigger uses breaks. The trigger needs to be pinned in `<body>` context — `pinSpacer` argument can help, or restructure the layout.
- **Multiple pins overlap**: pin two elements with overlapping triggers and you get UI chaos. Sequence them with explicit `end` values.

## Refresh on layout change

ScrollTrigger calculates positions at construction time and on window resize. If something changes layout WITHOUT firing resize — font loaded, image loaded, content fetched, route changed — the calculations stale.

```ts
// After a layout-shifting event:
ScrollTrigger.refresh();
```

Common triggers for explicit refresh:

- After a font finishes loading (Next.js's `next/font` mostly avoids this, but verify).
- After images load (use `image.onload` or `IntersectionObserver`).
- After a route transition that keeps the page mounted but changes content.
- After a sidebar/drawer opens that changes available viewport width.

If you ever see "the animation works on refresh but not on first load", it's almost always a stale-calculation issue. Add `ScrollTrigger.refresh()` after the layout-shifting event.

## Markers (development only)

```ts
scrollTrigger: {
  trigger: '.section',
  start: 'top center',
  end: 'bottom center',
  scrub: 1,
  markers: process.env.NODE_ENV === 'development',
}
```

`markers: true` draws colored lines at the start and end positions. Indispensable when tuning. Strip them in production.

## `toggleActions`

Without `scrub`, the timeline plays on enter. `toggleActions` controls what happens on each boundary:

```ts
toggleActions: 'play none none reverse'
//             ^onEnter ^onLeave ^onEnterBack ^onLeaveBack
```

Values: `play`, `pause`, `resume`, `reverse`, `restart`, `reset`, `complete`, `none`.

The locked default: `'play none none reverse'` for reveal-on-enter animations. Animation plays forward when scrolling down into the trigger; reverses when scrolling back up past it.

For "play once and never reverse":

```ts
toggleActions: 'play none none none'
// or simply
scrollTrigger: {
  trigger: '.thing',
  start: 'top 80%',
  once: true,
}
```

## Containerization

By default, ScrollTrigger watches `window` scroll. For scroll inside a different container (e.g. a sidebar with its own scroll), use `scroller`:

```ts
scrollTrigger: {
  trigger: '.thing-inside-sidebar',
  scroller: '.sidebar',
  start: 'top top',
}
```

This is rare. Most projects only have window scroll.

## Responsive timelines

`gsap.matchMedia` runs different timelines per breakpoint. Locked usage:

```ts
const mm = gsap.matchMedia();
mm.add(
  {
    isDesktop: '(min-width: 769px)',
    isMobile: '(max-width: 768px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  },
  (context) => {
    const { isDesktop, isMobile, reduceMotion } = context.conditions!;

    if (reduceMotion) {
      gsap.set('.reveal', { opacity: 1, y: 0 });
      return;
    }

    if (isDesktop) {
      // Full timeline with pinning
    } else {
      // Simpler mobile timeline, no pin
    }
  },
);
```

When the media query no longer matches (user resizes / rotates device), GSAP automatically reverts the animations from that branch and runs the new matching one. Free responsive animation.

Each branch's animations are GC'd when the branch is no longer matched. Don't store animation references outside the branch — they may be revoked.

## Common ScrollTrigger bugs

| Symptom | Likely cause |
|---|---|
| Trigger fires at wrong scroll position | Stale calculations — call `ScrollTrigger.refresh()` after layout changes |
| Pinned element jitters during scroll | Lenis + ScrollTrigger not synced via shared ticker |
| Pinned element jumps when scroll starts | Layout shift on pin — wrap trigger in a fixed-height parent |
| Animation runs only on first reload | Module loaded before DOM ready; ensure `useGSAP` (which waits) is used |
| Multiple triggers overlap unexpectedly | Each has independent `start`/`end`; sequence them with explicit numeric distances |
| Animation triggers don't update after route nav | Triggers tied to unmounted DOM; `useGSAP` should clean up automatically — verify scope |
| Mobile feels broken | Pinning is heavy on mobile; consider `isMobile` branch without pin |

## Performance notes

- Each ScrollTrigger adds a scroll event listener (Lenis-aware). They're cheap individually; expensive in aggregation. Don't create 50 triggers for 50 list items — use one trigger that controls a stagger.
- Pinning forces composite-layer creation. Heavy on low-end devices.
- `scrub: true` (no smoothing) is more performant than `scrub: 1` because there's no per-frame interpolation. Visually different; pick deliberately.

## When NOT to use ScrollTrigger

- Animation that should happen on mount, not on scroll. Use plain `gsap.from` or Motion.
- Animation that doesn't need to be tied to scroll position. Use `IntersectionObserver` + Motion / CSS for "appear when visible".
- Animation that's part of a state change (modal open, card expanded). Motion is better.

ScrollTrigger is for animation that's a function of scroll position. Anything else fits another tool better.
