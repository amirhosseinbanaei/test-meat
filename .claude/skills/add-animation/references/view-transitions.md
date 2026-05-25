# Tier 2 — View Transitions

React 19 ships first-class support for the browser's View Transitions API. It animates a DOM change from one state to the next — including when elements move, resize, appear, or disappear. Two paired elements with the same `viewTransitionName` morph into each other.

## The mental model

Without View Transitions, when state changes, the browser tears down the old DOM and renders the new one. The change is instantaneous.

With View Transitions, the browser snapshots the old DOM, snapshots the new DOM, and animates between them. Default behaviour: a crossfade. Paired elements (matching `viewTransitionName`): an animated morph from the old position/size/style to the new.

## When to use

- **Route transitions** where elements persist across pages (the product thumbnail on `/products` morphs into the hero image on `/products/[id]`).
- **List reorders** — items animate to their new positions rather than jumping.
- **Card → modal expansion** — a card grows to become a detail panel.
- **Tab content swap** where the new content should fade in over the old.

## Using `<ViewTransition>` in React 19

React 19 exposes the `<ViewTransition>` component. Wrap the surface whose state change should be animated:

```tsx
import { ViewTransition } from 'react';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ViewTransition>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <img src={p.thumbnail} style={{ viewTransitionName: `product-${p.id}` }} />
            <h3>{p.title}</h3>
          </li>
        ))}
      </ul>
    </ViewTransition>
  );
}
```

The `viewTransitionName` inline style is what pairs an element across states. If the same `product-42` appears in the next render — anywhere in the tree — the browser animates the morph.

## Naming rules

- Each `viewTransitionName` value must be **unique within a single document snapshot**. Two elements with `viewTransitionName: 'foo'` at the same time will crash the transition. Include the entity id (e.g. `product-${id}`).
- Names disappear when the element does, and the morphed name on the target picks up.
- Don't reuse the same name for unrelated elements — the browser will try to morph them and the result will be weird.

## Customising the animation

The default crossfade can be overridden in CSS using the `::view-transition-*` pseudo-elements:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 250ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

::view-transition-old(product-42) {
  animation: fade-and-shrink 250ms both;
}
```

For most cases, leave the defaults alone. The browser's default crossfade is fine.

## Route transitions specifically

In the Next.js App Router, navigation already triggers a DOM change. Wrap the `RootLayout`'s children in `<ViewTransition>` and pair elements across pages by giving them stable `viewTransitionName`s:

```tsx
// src/app/layout.tsx
import { ViewTransition } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ViewTransition>{children}</ViewTransition>
      </body>
    </html>
  );
}
```

Now any element with a `viewTransitionName` that appears on both the source and destination route will morph.

## Constraints

- The View Transitions API works on modern Chromium, Safari (with the latest version), and Firefox (behind a flag in older versions). The fallback is "no animation" — the DOM change happens instantly. Don't rely on it for correctness, only for polish.
- Animated elements are **frozen snapshots** during the transition. JS event handlers don't fire on the morphing element; only on the final new DOM.
- Each named element morphs independently. If you want children to morph together with their parent, the parent gets the name — children get carried.
- `prefers-reduced-motion` is respected by the browser automatically — transitions skip when the user requests reduced motion.

## When View Transitions are the wrong tier

- The animation needs gestures (swipe, drag) — Tier 4 (Motion).
- The animation needs a spring physics curve, not an ease — Tier 4 (Motion).
- The DOM doesn't actually change, but you want something to move on its own — Tier 1 (CSS keyframes) or Tier 4 (Motion).
- You need exit animations on `display: none` toggles — Tier 4 (Motion's `AnimatePresence`).
