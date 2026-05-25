# Tier 4 — Motion

Motion (the package previously known as Framer Motion) is the team's escape hatch when CSS, View Transitions, and `<Activity/>` can't do the job. Reach for it for: gestures (drag, swipe, hover with physics), spring physics curves, orchestration of many children, layout animation, scroll-driven motion, and exit animations on conditional rendering.

The package is `motion`. Import from `motion/react`.

## Anatomy of a Motion component

```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 8 }}      // state at mount
  animate={{ opacity: 1, y: 0 }}      // state to animate to
  exit={{ opacity: 0, y: -8 }}        // state on unmount (needs AnimatePresence)
  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
>
  …
</motion.div>
```

Any HTML element prefixed with `motion.` (`motion.div`, `motion.button`, `motion.li`, …) accepts these animation props.

## Five patterns that cover ~90% of needs

### 1. Mount animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  Welcome
</motion.div>
```

The element animates from `initial` to `animate` once on mount. Useful for cards, modals, and toasts appearing.

### 2. Mount + unmount animation

```tsx
import { AnimatePresence, motion } from 'motion/react';

<AnimatePresence>
  {isOpen && (
    <motion.div
      key="dialog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      …
    </motion.div>
  )}
</AnimatePresence>
```

`AnimatePresence` is the only way to animate elements **as they leave the DOM**. Without it, React removes the element instantly and the `exit` prop is ignored. The `key` is required so AnimatePresence can track which child is leaving.

### 3. Staggered children

```tsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.05 } },
  }}
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item.label}
    </motion.li>
  ))}
</motion.ul>
```

`variants` let you name states and have parents orchestrate children. `staggerChildren` cascades the children's animations.

### 4. Layout animation

```tsx
<motion.div layout>…</motion.div>
```

When this element's position or size changes in the next render (because of state, layout shift, content change), Motion animates it smoothly to the new position. Great for resizable cards, list reorders within a single render pass.

For shared elements across two separate components, use the `layoutId` prop — same value on the source and target morphs between them. (For *route*-level shared elements, prefer View Transitions in Tier 2 instead.)

### 5. Gesture-driven animation

```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 200 }}
  whileDrag={{ scale: 1.05 }}
>
  Swipe me
</motion.div>
```

`drag`, `whileHover`, `whileTap`, `whileFocus`, `whileInView` — Motion has hooks for each. They're declarative: you describe the target style for the gesture state and Motion handles the rest.

## Spring physics

For organic motion, use spring transitions:

```tsx
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

- `stiffness`: how strongly the spring pulls toward the target. Higher = faster.
- `damping`: how much friction. Higher = less bounce.

A good rule of thumb: 300/30 feels brisk and "macOS-y". 100/15 feels playful and bouncy. 500/40 feels snappy and decisive.

Spring transitions ignore `duration` — they're physics-driven. Don't set both.

## `prefers-reduced-motion`

Motion respects the user's preference automatically when you use the `useReducedMotion` hook to gate things:

```tsx
import { useReducedMotion } from 'motion/react';

const reduce = useReducedMotion();

<motion.div
  initial={reduce ? false : { opacity: 0, y: 8 }}
  animate={reduce ? {} : { opacity: 1, y: 0 }}
/>
```

For animations that exist for *informational* reasons (like an error shake), it's fine to keep them. For decorative animations, always honour the user's preference.

## Performance

Motion uses `transform` and `opacity` whenever it can — both are compositor-cheap. Avoid animating `width`, `height`, `top`, `left`, `margin` directly when possible (they trigger layout). When you must, that's exactly where `layout` shines — Motion uses FLIP under the hood to translate the change into transforms.

For lists that animate often, set `style={{ willChange: 'transform' }}` on the items — gives the browser a hint to put them on their own layer.

## When NOT to use Motion

- The animation is a simple hover state — Tier 1 (CSS).
- The animation is a route-level shared element — Tier 2 (View Transitions) is more efficient.
- You only want the subtree to persist, not animate — Tier 3 (`<Activity/>`).
- The "animation" is a loading state — use a Skeleton from shadcn, not an animated div.

## Server Components and Motion

`motion.*` components are Client Components by definition (they use refs and hooks). Putting them in a Server Component file is a compile error. Wrap the motion-using parts in a Client Component (`'use client'` at the top of the file) and import that from the Server Component.

This is usually fine — the Server Component renders the data, the Client Component takes that data as props and animates it.
