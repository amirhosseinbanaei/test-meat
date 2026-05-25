# Motion and reduced motion

WCAG and best practice on animation.

## The rules

- **WCAG 2.3.1** — nothing flashes more than 3 times per second.
- **WCAG 2.2.2** — auto-advancing content (carousels, animated content) can be paused, stopped, or hidden.
- **prefers-reduced-motion** — when the user has the OS-level "Reduce motion" setting on, big animations should be disabled or replaced with subtle fades.

The third is not strictly a WCAG criterion at AA, but it's how we honor users with vestibular disorders. The locked rule: every animation in the project respects `prefers-reduced-motion: reduce`.

## How we implement

### CSS-level
Tailwind 4 has the `motion-safe:` and `motion-reduce:` variants:

```tsx
<div className="transition-transform duration-300 motion-safe:hover:scale-105">
  ...
</div>
```

`motion-safe:` only applies the class when the user has NOT requested reduced motion. The hover scale doesn't happen when they have.

For animations that are essential (e.g. a loading spinner), keep them but make them subtler under reduced motion:

```tsx
<div className="animate-spin motion-reduce:animate-none motion-reduce:opacity-50">
  ...
</div>
```

### Motion library
The locked animation library (Motion / Framer Motion's successor) provides `useReducedMotion()`:

```tsx
import { useReducedMotion, motion } from 'motion/react';

export function FadeInPanel({ children }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

When `reduced` is true, the animation flattens to an instant fade. The content still appears; it just doesn't move.

### View Transitions
React 19's View Transitions API: pair with `prefers-reduced-motion` via CSS:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

The transitions still happen (the swap occurs), they just don't animate.

### GSAP / Lenis / Three.js
For the third-party tools:

- **GSAP**: read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at animation construction and either skip the animation, set duration to 0, or use `gsap.matchMedia()` (native support).
- **Lenis**: it has a `prefers-reduced-motion` option. The locked Lenis setup checks the media query and skips Lenis entirely (returns native scroll) when reduced motion is on. See `add-smooth-scroll`.
- **Three.js**: scenes should pause / freeze / skip auto-rotate / disable parallax when reduced motion is on. See `add-3d-scene`.

## What "reduced motion" means in practice

Reduced motion is NOT "no motion". It's "don't surprise me with large movement or repetitive motion that could trigger vestibular discomfort". The intent:

- **Skip / disable**: parallax, auto-scroll, auto-advance carousels, scroll-triggered storytelling, ambient ongoing motion (rotating logos, drifting backgrounds), screen-takeover transitions.
- **Replace with fade or instant**: page transitions, modal opens, panel reveals.
- **Keep**: loading indicators (essential feedback), animation that directly responds to user input (button press feedback).

The decision: when in doubt, disable / simplify.

## What NOT to do

### Don't auto-play video without controls
Video that auto-plays grabs attention and motion. WCAG 1.4.2 requires audio that plays more than 3 seconds to have a control to pause/stop. Even silent video, the team's policy is: any auto-play has a pause control.

### Don't trigger animation on scroll without restraint
Scroll-driven animations (parallax, "as you scroll the content slides in") are the most common motion-triggered discomfort source. Every scroll-driven animation in the project must be wrapped in `motion-safe:` or check `useReducedMotion()`. Not optional.

### Don't override the user's preference
You cannot force motion on when the OS says off. You also shouldn't add a toggle to "turn motion back on" — that respects the OS preference, which is the right behavior. If users want motion, they change the OS setting.

You CAN add a "reduce motion" toggle that adds another opt-out — for users who want some motion but not all. Rare, project-by-project decision.

### Don't ship infinite loops without a pause control
A logo that rotates forever, a loading spinner that never stops — these are exempt from reduced-motion if they're brief, but anything that loops continuously needs a way to stop.

## Testing

### Manual
DevTools → Rendering → "Emulate CSS prefers-reduced-motion" → "reduce". Reload. Walk the app and confirm:

- No surprising motion.
- Content still appears (don't accidentally hide things by setting opacity to 0 without animating it to 1).
- Loading states still indicate loading.

### Automated
axe-core flags some motion violations. Playwright's `useFakeTimers` won't catch reduced-motion compliance — manual testing is the gate.

For high-motion projects (storytelling sites, interactive demos), add an explicit Playwright test that emulates reduced motion and confirms key interactions still work.

## Vestibular discomfort considerations

Beyond WCAG: people with vestibular disorders (vertigo, motion sickness sensitivities) experience real physical discomfort from certain motion patterns. Highest-risk patterns:

- Parallax (different elements moving at different speeds while scrolling).
- Large-scale rotation or scaling.
- Sudden direction changes.
- Particle effects that move erratically.
- Camera moves in 3D scenes.

If your design includes any of these, `prefers-reduced-motion` handling is mandatory. The vestibular-discomfort minority is real, and getting this wrong means a small number of users physically can't use your product.

## The default

The default for new components: respect motion. If you add an animation, ask yourself in the same breath, "what's the reduced-motion variant?" If you don't have an answer, the animation isn't ready.
