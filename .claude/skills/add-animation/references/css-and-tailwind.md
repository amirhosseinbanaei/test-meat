# Tier 1 — CSS and Tailwind animations

The cheapest tier. Always try first. Costs zero bytes of JavaScript and runs on the compositor (60fps for free).

## Built-in Tailwind utilities

| Utility | Effect |
|---|---|
| `transition`, `transition-colors`, `transition-transform`, `transition-opacity`, `transition-all` | Enable a transition on the matching property group |
| `duration-75 / -100 / -150 / -200 / -300 / -500 / -700 / -1000` | Transition duration |
| `ease-linear / -in / -out / -in-out` | Easing curve |
| `delay-75 / -100 / -150 / -200 / -300 / -500 / -700 / -1000` | Delay before the transition starts |
| `animate-spin`, `animate-ping`, `animate-pulse`, `animate-bounce` | Pre-baked `@keyframes` animations |

```tsx
<button className="rounded-md bg-primary px-4 py-2 transition-colors duration-150 hover:bg-primary/90">
  Continue
</button>
```

## When CSS transitions are the right answer

- Hover and focus state changes (color, background, border, shadow).
- Mount-driven visual changes you can express as toggling a class.
- "Always visible, slightly changes" animations like a pulsing dot.
- Anything where the same animation runs every time, no orchestration with other elements.

## Custom keyframes

When `animate-pulse` / `animate-bounce` aren't right, add a custom `@keyframes` block to `globals.css` and a matching utility:

```css
/* src/app/globals.css */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.animate-slide-up {
  animation: slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

Use it as a class:

```tsx
<div className="animate-slide-up">…</div>
```

This is still Tier 1 — no JS runtime, no library. The animation runs once on mount and stops.

## `prefers-reduced-motion`

Some users disable animations system-wide. Tailwind has `motion-reduce:` and `motion-safe:` modifiers:

```tsx
<div className="motion-safe:animate-slide-up motion-reduce:animate-none">…</div>
```

Or in CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-up { animation: none; }
}
```

**Apply this everywhere movement isn't purely informational.** It's an accessibility commitment, not a nice-to-have.

## When to leave Tier 1

Move up when you need:

- An exit animation (Tier 4 — CSS can't animate `display: none` to gone cleanly).
- Shared elements morphing across a state change (Tier 2 — View Transitions).
- Orchestration across many children with staggered timing (Tier 4 — Motion).
- Gesture-driven motion (Tier 4 — Motion).

For anything else, Tier 1 is fine.
