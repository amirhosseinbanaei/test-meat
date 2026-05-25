# Container queries — when and how

The locked answer to: "this component looks broken when used in a sidebar vs.
the main content area."

## The problem viewport queries don't solve

A `ProductCard` component is used in three places:

1. The product grid — 3 columns on desktop → each card is ~400px wide.
2. A "related products" sidebar on the product detail page — full-height column,
   each card is ~280px wide.
3. A recommended-products carousel — each card is ~240px wide.

At desktop viewport (xl, 1280+), all three contexts trigger the same `xl:`
classes. But the card LIVES in three different actual widths. Using viewport
queries here forces compromises — either the desktop card layout is wrong in
the sidebar, or the sidebar card layout is wrong in the grid.

Container queries fix this. The card queries **its own width**, not the
viewport's.

## The container-query pattern

```html
<!-- The card declares itself a container -->
<article class="@container">
  <!-- Children query the container's width -->
  <div class="
    flex flex-col gap-3            /* base: narrow container → stack */
    @md:flex-row @md:gap-4          /* container ≥ 448px: side-by-side */
  ">
    <img class="aspect-square w-full @md:w-32" />
    <div class="flex flex-col gap-2">
      <h3 class="text-fluid-base @md:text-fluid-lg">{name}</h3>
      <p class="text-fluid-sm text-muted-foreground">{description}</p>
    </div>
  </div>
</article>
```

In the wide grid (400px card) → `@md:` triggers → side-by-side layout.
In the narrow sidebar (280px card) → `@md:` doesn't trigger → stacked layout.
Same code; correct rendering in both.

## When to use container queries

Use container queries when the component is **slot-agnostic** — it doesn't know
where it'll be rendered. Common cases:

- **Cards in grids** of varying column counts.
- **List items** that appear both in a main feed and a sidebar feed.
- **Form fields** that may go in a wide form OR a narrow modal.
- **Dashboard widgets** that get placed in user-configurable layouts.
- **Empty states** that may render in a full-page context or a small panel.

When to use viewport queries instead:

- **Page-level layouts** — the page IS the viewport; container queries don't add
  anything.
- **App shells** — the nav, sidebar, header layouts depend on viewport.
- **Hero sections** — they're full-bleed; viewport == container.
- **Modals' overall size** — though modal *content* might use container queries.

## Translating "viewport intent" to "container intent"

Designers think in viewports. Specs say:

> "On tablet, the product card switches to a side-by-side layout."

To translate to container queries, the FE Lead asks: "what width does the card
actually have when the viewport is tablet?"

- Tablet portrait = 768px viewport.
- The card is in a 2-column grid at that viewport.
- Each card is roughly (768 − 32 padding − 16 gap) / 2 = ~360px.
- A 360px card comfortably side-by-side at @md (448px) → no.
- It works side-by-side at @sm (384px) → yes, close.

So the "tablet → side by side" intent translates to `@sm:flex-row` on the card.

The FE Lead does this translation explicitly. Document it in code comments:

```tsx
// Design intent: tablet+ (~768px viewport, ~360px card) → side-by-side.
// Translates to @sm container query on the card itself.
<article className="@container">
  <div className="flex flex-col gap-3 @sm:flex-row">
```

## Naming containers (for nested use)

When a card has its own `@container` AND lives inside a `@container` parent,
disambiguate with names:

```html
<div class="@container/page">
  <article class="@container/card">
    <!-- Query the card's width: -->
    <h3 class="@md/card:text-fluid-2xl">{title}</h3>
    <!-- Query the page-context width: -->
    <span class="@lg/page:block hidden">{detail}</span>
  </article>
</div>
```

Use this only when nesting actually exists. For a single-container component,
unnamed `@container` is cleaner.

## The container-query scale (smaller than viewport)

| Name | Container min-width | Roughly equivalent viewport |
|---|---|---|
| `@sm` | 384px | (none — smaller than mobile viewport) |
| `@md` | 448px | between mobile and tablet — a card in a 2-col grid |
| `@lg` | 512px | a card in a wide layout, OR a narrow main column |
| `@xl` | 576px | a wide card or narrow content area |
| `@2xl` | 672px | a wide main content area |

These intentionally don't match viewport breakpoints. A card is rarely the same
width as the viewport, so the relevant thresholds are smaller.

## Custom container-query values

For one-off widths that don't fit the scale, use arbitrary values:

```html
<div class="@container">
  <div class="@[700px]:grid-cols-3 grid-cols-1">
```

Use sparingly — these are bespoke, like arbitrary viewport breakpoints, and
become hard to maintain. If a value appears 3+ times, add it to the scale.

## Setting up a container in code

Always declare `@container` on the **outermost wrapper** that represents the
"slot." For a card:

```tsx
// ❌ Container is too deep — content inside can't query it
<article>
  <div className="@container">
    <Header />
    <Body />
  </div>
</article>

// ✅ Container is the outermost element — everything inside queries it
<article className="@container">
  <Header />
  <Body />
</article>
```

The wrapper that establishes the container should be the component's root.

## When to use `useContainerQuery` (the JS hook)

Rarely. CSS container queries solve the styling problem. Use the JS hook only
when **logic** (not just styles) depends on the container width:

- Choosing how many columns to render in a virtualized list.
- Deciding whether to use a chart vs. a sparkline depending on width.
- Lazy-loading more product detail content when the container is wide enough.

For styling, always use CSS.

## What NOT to do

- **Don't use container queries for page-level breakpoints.** Pages are the
  viewport. Use `md:`, `lg:`, etc.
- **Don't nest `@container` unnecessarily.** One container per component is
  the norm. Three nested containers in one component → refactor.
- **Don't use both viewport AND container queries on the same element** for the
  same property:
  ```html
  <!-- ❌ Confused: which wins? -->
  <div class="md:grid-cols-2 @md:grid-cols-3">
  ```
  Pick one approach per property per element.
- **Don't apply `@container` on a non-block element** (inline elements, SVG). It
  needs to behave like a containing box.
- **Don't query container size in `'use server'` code** — container queries are
  client-side CSS. Server components emit static HTML; the queries activate in
  the browser.

## Pushback to designers

If you find yourself unable to translate a design's viewport intent into clear
container intent — that's a real signal. Ask the designer:

> "This card appears in three places. The wide-grid layout you showed me wouldn't
> fit in the sidebar. Should the card behave the same in all three contexts, or
> should there be different layouts per context?"

Often the answer is "same component, different layouts" — and container queries
deliver that. Sometimes it's "different components" — and that's a refactor
signal, not a container-query failure.
