---
name: add-smooth-scroll
description: Smooth scrolling via Lenis. OPT-IN, never default. Honors `prefers-reduced-motion` strictly — Lenis is bypassed entirely (native scroll) when the user has reduced motion on. Preserves keyboard scroll (PageUp/Down, Space, Home/End) and accessibility tree behavior. Includes a kill switch via URL parameter for debugging. Use only when design requires smooth scroll as part of the experience — never as a default polish layer.
allowed-tools: Read, Write, Bash(npm install:*)
---

# Add smooth scrolling with Lenis

Adds [Lenis](https://lenis.darkroom.engineering/) for buttery, programmatic smooth scrolling. **This is opt-in, not default.** Smooth scrolling overrides browser-native scroll behavior, which has real accessibility and performance costs. Use only when the design genuinely needs it.

## Honest framing

Lenis is a well-engineered library, but the *pattern* of intercepting native scroll has trade-offs:

- **Accessibility cost**: keyboard scrolling, screen-reader scroll-to-content, vestibular-discomfort users — all affected. We mitigate by respecting `prefers-reduced-motion` strictly.
- **Performance cost**: a `requestAnimationFrame` loop runs while scrolling. Small but non-zero on low-end devices.
- **UX cost**: native momentum-scroll on macOS / iOS is already smooth and tuned to the device. Replacing it with a generic smooth-scroll can feel worse on these platforms.
- **Debugging cost**: scroll bugs become trickier when Lenis sits between user input and the browser.

Use when:
- The design is **scroll-as-storytelling** (a long-scroll landing page with synchronized animations).
- There's heavy GSAP ScrollTrigger work that Lenis powers.
- A specific motion language requires the consistent easing Lenis provides across devices.

Don't use when:
- You just want "smoother scroll" as polish. Native is fine.
- The site is content-heavy and users scroll to read.
- The site is informational. Native scroll respects the user's OS, AT, and preferences.

## When to use this skill

- Design explicitly specifies smooth scroll as part of the experience.
- A GSAP ScrollTrigger workflow is being added (Lenis pairs well with it).
- Both situations: only with ui-visual-lead + ux-design-lead joint sign-off, since this is an interaction-design choice with a11y implications.

## Workflow

1. Read `references/lenis-patterns.md` — the locked Lenis configuration, lifecycle, and a11y handling.
2. Read `references/when-to-use-and-when-not.md` — the decision rules with concrete examples.
3. Install Lenis: `npm install lenis`
4. Drop the provider: `assets/SmoothScroll.tsx.template` → `src/common/components/SmoothScroll.tsx`. This is the Client Component that initializes Lenis. It:
   - Checks `prefers-reduced-motion` and returns null (native scroll) when reduced.
   - Checks `?lenis=off` URL param and returns null (kill switch).
   - Preserves keyboard scrolling.
   - Cleans up on unmount.
5. Mount once in `app/layout.tsx`, inside the body, wrapping `{children}`.
6. Optional: drop `assets/useLenisScroll.ts.template` → `src/common/hooks/useLenisScroll.ts` for programmatic scroll-to-target (`lenis.scrollTo(target)`).
7. Run `lint-and-typecheck`.

## Usage at a glance

In `app/layout.tsx`:

```tsx
import { SmoothScroll } from '@/common/components/SmoothScroll';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
```

Programmatic scroll in a component:

```tsx
'use client';
import { useLenisScroll } from '@/common/hooks/useLenisScroll';

export function JumpToSection() {
  const { scrollTo } = useLenisScroll();
  return <button onClick={() => scrollTo('#pricing', { duration: 1.2 })}>Pricing</button>;
}
```

## The locked safeguards

- **`prefers-reduced-motion`**: when on, Lenis doesn't initialize. Native scroll. No exceptions.
- **Kill switch**: `?lenis=off` disables Lenis for debugging or user-driven opt-out. Persisted via session-storage if `?lenis=off&persist=1`.
- **Keyboard preservation**: Space, PageUp/PageDown, Home/End, Arrow keys all work — Lenis intercepts wheel/touch but not keyboard.
- **Focus-scroll preservation**: when an element receives focus via Tab and is out of viewport, Lenis scrolls it into view smoothly (or native, under reduced motion).
- **Anchor links**: clicking `<a href="#section">` triggers Lenis smooth-scroll instead of the browser's instant jump.

## What to test

After installing, walk this list:

- [ ] DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload. Scroll. Confirm native scroll (no Lenis).
- [ ] Tab through focusable elements off-screen. Focus scrolls them into view.
- [ ] Press Space, PageDown, Home/End. All work.
- [ ] Click an in-page anchor (`<a href="#footer">`). Smooth scroll.
- [ ] Append `?lenis=off` to a URL. Scroll. Confirm native scroll.
- [ ] iOS Safari: scroll. Momentum should still feel responsive (Lenis on mobile is configurable — see references).
- [ ] Screen reader: navigate by headings. Page jumps work, no Lenis interference.

## Files in this skill

- `assets/SmoothScroll.tsx.template` — the provider Client Component.
- `assets/useLenisScroll.ts.template` — programmatic scroll-to hook.
- `references/lenis-patterns.md` — locked config, lifecycle, GSAP ScrollTrigger integration.
- `references/when-to-use-and-when-not.md` — the decision rules.
