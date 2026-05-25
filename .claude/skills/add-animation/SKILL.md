---
name: add-animation
description: Adds animation to the frontend. Reaches for React 19's built-ins FIRST — View Transitions for cross-state DOM morphs, `<Activity/>` for show/hide without unmount, CSS transitions for hover/focus — and only falls back to Motion (formerly Framer Motion) for component-level animation that needs physics, gestures, orchestration, or layout animation. Use whenever a designer asks for movement, a list item should slide in, a page transition should feel smooth, or a value should ease toward its target.
allowed-tools: Read, Write
---

# Add animation

The FE team has a clear order of preference for animation. Always try them in this order; only fall through when the previous tier can't do the job.

## The four-tier rule

| Tier | Tool | Use for |
|---|---|---|
| 1 | **CSS transitions / `@keyframes`** via Tailwind | Hover, focus, color/opacity transitions on a single element. Lowest cost. |
| 2 | **React 19 View Transitions API** | Cross-state DOM morphs — list reorders, page transitions, expand/collapse of a card into a detail view. |
| 3 | **React 19 `<Activity/>`** | Conditionally hide a subtree without unmounting it — preserves state and DOM, no animation in itself but the right tool when the UI shouldn't tear down. |
| 4 | **Motion** (`motion` package) | Component-level animation that needs gestures, physics springs, orchestration, layout animation (`layout` prop), exit animations, or scroll-driven movement. |

Reach for the lowest tier that fits. The first three are free (no library). Motion is the escape hatch — useful and worth installing, but not the default.

## When to use this skill

- A designer wants something to move.
- Two states share elements that should morph between them (route change, expand/collapse).
- A list should reorder or items should enter/exit with animation.
- A component needs drag, swipe, or scroll-linked motion.

## When NOT to use

- The "animation" is actually a state spinner or skeleton — that's a loading state, use the route's `loading.tsx` and shadcn's Skeleton instead.
- The motion is purely a `:hover` color change — that's a Tailwind transition class, not an animation skill task.

## Inputs expected

- `surface` — where the animation goes (a component path, a route, a list, etc.).
- `motion_type` — natural-language description, e.g. "list items slide in from bottom on mount", "route transition between /products and /products/[id]".

## Workflow

1. Decide the tier. Read the matching reference:
   - `references/css-and-tailwind.md` — Tier 1.
   - `references/view-transitions.md` — Tier 2.
   - `references/activity.md` — Tier 3.
   - `references/motion-patterns.md` — Tier 4.
2. Implement. None of the tiers needs a new file — animations sit inside the component being animated.
3. Run `lint-and-typecheck`.

## Examples of tier selection

| The brief | The tier | Why |
|---|---|---|
| "Buttons fade on hover" | 1 (Tailwind) | `transition-colors duration-150 hover:bg-…` is enough. |
| "When the user submits the form, a success card slides up from below" | 4 (Motion) | Enter animation on mount, easing curve matters — Motion's `<motion.div initial animate>` is the cleanest path. |
| "Route transition between list and detail morphs the thumbnail into the hero" | 2 (View Transitions) | Shared element morph across DOM rewrites — exactly what the View Transitions API is for. |
| "Tab content should keep its scroll position when switching tabs and back" | 3 (`<Activity/>`) | Preserve state of the inactive tab; the visual transition is incidental. |
| "Drag-to-reorder list" | 4 (Motion) | Drag gesture handling is Motion's territory. |
| "Pulse animation on a notification badge" | 1 (Tailwind) | `animate-pulse` is built in. |

## Files in this skill

- `references/css-and-tailwind.md` — Tier 1 patterns (Tailwind classes, custom keyframes).
- `references/view-transitions.md` — Tier 2 patterns (`startViewTransition`, `view-transition-name`).
- `references/activity.md` — Tier 3 patterns (`<Activity mode="hidden">`).
- `references/motion-patterns.md` — Tier 4 patterns (Motion components, gestures, layout animation).
