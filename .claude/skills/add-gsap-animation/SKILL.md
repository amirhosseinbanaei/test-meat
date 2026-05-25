---
name: add-gsap-animation
description: GSAP as the FE team's TIER-2 animation tool, behind Motion (the locked tier-1). Use GSAP when you need complex timelines (scroll-driven storytelling, SVG morphing, sequenced choreography across many elements). For component-level enter/exit, state transitions, gestures — use Motion instead. Includes ScrollTrigger and SVG plugin setup. Strict prefers-reduced-motion handling via gsap.matchMedia(). Lazy-loaded by default to keep the main bundle small.
allowed-tools: Read, Write, Bash(npm install:*)
---

# Add GSAP animation (tier-2)

GSAP is the second-tier animation tool. Motion (locked tier-1) is the default. Use GSAP when the animation profile is **complex timeline orchestration** — sequences of interdependent animations, scroll-driven scrubbing, SVG path morphing, choreography across many elements with precise pacing.

## Tier-1 vs Tier-2

| Use Motion (tier-1) for... | Use GSAP (tier-2) for... |
|---|---|
| Component enter/exit (`AnimatePresence`) | Long scroll-driven timelines with synchronized elements |
| State transitions (open/closed, expanded/collapsed) | SVG path morphing |
| Drag, gesture, layout animations | Complex sequenced choreography (>5 interdependent animations) |
| `useReducedMotion()` + per-component animation | Scroll storytelling (with ScrollTrigger) |
| Anything React component-tree-driven | Anything that needs imperative timeline control |

**Don't fork between the two for the same animation surface.** If a page is GSAP-driven, the page is GSAP. Mixing within one surface creates timing chaos.

## When to use this skill

- Design specifies scroll-driven storytelling (panels reveal as the user scrolls, headings pin while content scrolls beneath).
- SVG path morphing is required (logo transforms, icon-to-illustration transitions).
- A complex hero or landing section has sequenced animations across many elements.
- Design includes parallax that responds to scroll position with mathematical precision.

## When NOT to use

- Component-level animation (use Motion).
- Page transitions (use View Transitions API or Motion).
- Form field micro-interactions (CSS or Motion).
- Anything simple. Don't add GSAP to a project that doesn't need it — it's a 60KB+ library.

## Workflow

1. Read `references/gsap-patterns.md` — the project structure, the lazy-load pattern, and the integration with Lenis.
2. Read `references/scroll-trigger-patterns.md` — ScrollTrigger usage patterns, common pitfalls.
3. Read `references/reduced-motion.md` — the locked `gsap.matchMedia()` pattern.
4. Install GSAP: `npm install gsap`
5. Decide which plugins:
   - **ScrollTrigger** — scroll-driven (always installed with this skill).
   - **SVG morphing** — `MorphSVGPlugin` (paid; only if design demands SVG path morphing). The free `MotionPathPlugin` covers motion-along-path which is usually enough.
6. Drop the plugin registration: `assets/gsap-init.ts.template` → `src/common/lib/gsap-init.ts`. Imported once at app boot.
7. For each animation surface, create a component-scoped GSAP timeline. Template: `assets/AnimatedSection.tsx.template` → `src/modules/<feature>/components/<SectionName>.tsx`.
8. If using with Lenis: read `references/gsap-patterns.md` → "Lenis integration" and apply the shared-ticker patch to `SmoothScroll.tsx`.
9. Run `lint-and-typecheck`.

## Usage at a glance

```tsx
'use client';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollStoryPanel() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // gsap.matchMedia honors prefers-reduced-motion automatically.
      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: '(max-width: 768px)',
          isDesktop: '(min-width: 769px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { reduceMotion, isMobile } = context.conditions!;

          if (reduceMotion) {
            // Reveal everything instantly, no timeline.
            gsap.set('.fade-in', { opacity: 1, y: 0 });
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container.current,
              start: 'top top',
              end: '+=1500',
              scrub: 1,
              pin: !isMobile,
            },
          });

          tl.from('.headline', { y: 50, opacity: 0, duration: 1 })
            .from('.body', { opacity: 0, duration: 1 }, '-=0.5')
            .from('.cta', { scale: 0.8, opacity: 0, duration: 0.6 }, '-=0.3');
        },
      );
    },
    { scope: container },
  );

  return (
    <section ref={container}>
      <h1 className="headline">...</h1>
      <p className="body">...</p>
      <button className="cta">...</button>
    </section>
  );
}
```

The `@gsap/react` hook (`useGSAP`) is the locked entry point — it cleans up properly on unmount and is React 19 / Compiler-friendly.

## What this gives you

- **GSAP core** for arbitrary tweens and timelines.
- **ScrollTrigger** for scroll-driven animation.
- **`useGSAP`** hook from `@gsap/react` for React-correct cleanup.
- **`gsap.matchMedia`** wrapper that honors `prefers-reduced-motion` automatically.
- **Lazy load by default**: GSAP only loads on routes that use it (Next.js dynamic import). Marketing pages with no GSAP don't ship a 60KB chunk.

## Bundle impact

GSAP core: ~30KB gzipped.
+ ScrollTrigger: ~15KB gzipped.
+ MotionPathPlugin: ~5KB.

Total typical: ~50KB on routes that import it. Not loaded on routes that don't.

The `lazy-load` pattern in `references/gsap-patterns.md` shows how to dynamic-import the entire animation module so the heavy work is gated behind the route that needs it.

## Files in this skill

- `assets/gsap-init.ts.template` — plugin registration, lazy-load helper.
- `assets/AnimatedSection.tsx.template` — example pattern for a scroll-driven section.
- `references/gsap-patterns.md` — locked usage patterns, lazy-load, Lenis integration.
- `references/scroll-trigger-patterns.md` — ScrollTrigger-specific patterns and pitfalls.
- `references/reduced-motion.md` — the locked `matchMedia` pattern.
