# GSAP and prefers-reduced-motion

The locked rule: every GSAP timeline in the project respects `prefers-reduced-motion: reduce`. No exceptions.

## The `gsap.matchMedia` pattern

GSAP exposes `matchMedia` with native media-query support — including `(prefers-reduced-motion: reduce)`. This is the only locked pattern for reduced-motion handling.

```ts
useGSAP(() => {
  const mm = gsap.matchMedia();

  mm.add(
    {
      reduceMotion: '(prefers-reduced-motion: reduce)',
      // ... other breakpoints
    },
    (context) => {
      const { reduceMotion } = context.conditions!;

      if (reduceMotion) {
        // No animation. Set the final state instantly.
        gsap.set('.fade-in', { opacity: 1, y: 0 });
        gsap.set('.scale-in', { opacity: 1, scale: 1 });
        return;
      }

      // Normal animation branch
      gsap.from('.fade-in', { opacity: 0, y: 50, duration: 0.8, stagger: 0.1 });
    },
  );
}, { scope: container });
```

## Why `gsap.set` in the reduced-motion branch?

GSAP `from` tweens animate FROM a state TO the rendered state. Without the tween, the element renders in its final state — usually fine.

But: many designs render initial states with CSS (e.g. `opacity-0` on a `.fade-in` element so it's invisible until the animation runs). If GSAP doesn't tween, the element stays invisible.

So: in the reduced-motion branch, explicitly `gsap.set` to the final state. The element becomes visible immediately.

Two patterns to choose between:

### Pattern A: CSS handles initial state

```css
.fade-in { opacity: 0; transform: translateY(50px); }
```

The HTML renders invisible. GSAP `from` animates to visible. In reduced-motion: `gsap.set('.fade-in', { opacity: 1, y: 0 })` makes them appear.

Pro: visually consistent during the brief window before GSAP runs (no flash of content).
Con: requires the `gsap.set` step in reduced-motion branch.

### Pattern B: JS handles initial state

```css
/* nothing — elements render normally */
```

GSAP `from` reads current state, animates from offset to current. Initial render may "flash" the final state for a frame.

In reduced-motion: do nothing — elements are already in their natural state.

Pro: no fix needed for reduced-motion.
Con: occasional flash of content as it appears before GSAP grabs control.

**The locked default: Pattern A** for above-the-fold animations (no flash) and Pattern B for below-the-fold (the flash is invisible since the user hasn't scrolled there yet).

## What gets disabled vs. simplified

In reduced-motion mode, the rules:

| Animation kind | Reduced-motion behavior |
|---|---|
| Reveal on scroll (fade, slide-in) | Skip — elements appear in final state instantly |
| Scroll-driven parallax | Skip — elements stay in final position |
| Pinned scroll-storytelling | Skip pin, skip scrub — content appears statically |
| Scroll-driven counter / number animation | Set to final number immediately |
| Page-load timeline (hero entrance) | Skip — content appears statically |
| Hover effect (subtle scale, shadow) | Keep — user-initiated, gives feedback |
| Click feedback (small bounce) | Keep — user-initiated, fast |
| Loading spinner | Keep — essential feedback |
| Auto-rotating carousel | Stop auto-rotation; user can click |
| Infinite ambient animation (rotating logo) | Pause |

The rule: anything **user-initiated and brief** stays. Anything **automatic, ambient, or large-movement** is removed.

## Bare-minimum compliance

If you only have time for the minimum, the absolute floor:

```ts
useGSAP(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;  // no animation at all
  }
  // normal animation
}, { scope: container });
```

This works but has two problems:

1. If the user toggles reduced-motion at runtime, the animation doesn't update (the effect already ran).
2. If your animation hides content until it runs (Pattern A above), reduced-motion users see invisible content.

`gsap.matchMedia` solves both: it re-runs when the media query changes, and the explicit `gsap.set` ensures final-state rendering.

Use `matchMedia` for anything production-bound. The shortcut is only for prototypes.

## Testing

For every GSAP animation surface, manually verify:

1. **DevTools → Rendering → "Emulate CSS prefers-reduced-motion" → "reduce"**. Reload.
2. **Scroll / navigate through the surface.** Confirm:
   - Content appears in its final state (no flash of invisible elements).
   - No automatic movement happens.
   - Scroll-driven animations don't activate.
   - Anything essential (loading, error feedback) still works.
3. **Open the page natively** (no emulation). Confirm animations DO run.
4. **Toggle the OS setting on and off** while the page is loaded. Animations should respect the change.

If any of those fail, the matchMedia branch is wrong.

## Vestibular discomfort — the why

Beyond WCAG: ~1% of users have vestibular disorders. Large or repetitive motion can cause nausea, dizziness, or migraines. For them, "annoying animations" isn't a UX preference — it's physically uncomfortable.

GSAP-driven scroll storytelling is the highest-risk animation category for vestibular users. Parallax, pinned content with moving elements behind, sudden camera shifts. These ARE the patterns GSAP excels at, AND the patterns that hurt vestibular users.

The matchMedia branch isn't an accessibility checkbox. It's an opt-out for users who need it.

## What you cannot do

- **Force motion on** for users who've opted out. There is no way to override their OS preference.
- **Add a "turn motion back on" toggle.** Their OS preference is authoritative.
- **Hide the reduced-motion branch behind a setting.** It must respond to the system preference automatically.

## What you can do

Add a project-specific opt-out: a "reduce motion further" toggle for users who want less than the system gives them. Stored in localStorage, layered on top of the OS preference. Optional — most projects don't need it.

```ts
const userOptedOut = localStorage.getItem('reduce-motion') === '1';
const systemReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reduceMotion = userOptedOut || systemReduced;
```

Even if the user explicitly enables motion via your toggle while their system says reduce, the safer default is to honor the system — they may have forgotten the toggle exists, may be borrowing the device, etc.
