# The breakpoint contract

The locked breakpoint names, their pixel values, and what device classes they
target. **Every project uses this same contract.** Without consistency across
components, layouts drift — one card breaks at 640px, the next at 768px, and
the page becomes unpredictable.

## The five locked tiers (aligned to Tailwind defaults)

| Tier | Tailwind | min-width | rem | Targets |
|---|---|---|---|---|
| **base** | (no prefix) | 0 | 0 | Phones portrait — 320px to 639px. Every base style targets this. |
| **sm** | `sm:` | 640px | 40rem | Phones landscape, very small tablets. |
| **md** | `md:` | 768px | 48rem | Tablets portrait. |
| **lg** | `lg:` | 1024px | 64rem | Laptops, tablets landscape, small desktops. |
| **xl** | `xl:` | 1280px | 80rem | Desktops. |
| **2xl** | `2xl:` | 1536px | 96rem | Wide / large desktops. |

These align to Tailwind's defaults. Don't change them per-project unless the
project genuinely needs different breakpoints (an admin tool that only ships
to 1280+, for example).

## Device class → breakpoint mapping

The **base** tier targets the smallest phone screens. Test at:

- **iPhone SE / small Android**: 360px–375px. Every layout must work here.
- **iPhone Pro / standard Android**: 390px–430px. Most users.
- **Pixel Pro / Galaxy Note**: 412px–428px. Large phones.

The **sm** tier (640+) catches phone landscape orientation. **md** (768+) catches
the smallest tablets (iPad Mini portrait is 768×1024). **lg** (1024+) catches
iPad landscape and small laptops. **xl** (1280+) is the design's "default"
desktop. **2xl** (1536+) is wide displays and large monitors.

## Critical viewport widths to test at (locked)

Three viewport widths every feature is checked at before handoff:

1. **375px** — small phone (iPhone SE-class). The hardest case. If it works here,
   most phones will be fine.
2. **768px** — tablet portrait. The breakpoint transition zone — many bugs hide
   here.
3. **1280px** — desktop. The "design's home" — what the designer hands you.

If a feature passes all three, it's responsive. (Plus the verification
checklist — see `verification-protocol.md` — for the remaining hazards.)

## Container queries — the smaller scale

For ds components used in multiple slot widths (sidebars, modals, multi-column
grids), use container queries with this scale:

| CQ tier | Container min-width |
|---|---|
| `@sm` | 24rem (384px) |
| `@md` | 28rem (448px) |
| `@lg` | 32rem (512px) |
| `@xl` | 36rem (576px) |
| `@2xl` | 42rem (672px) |

These are **smaller than viewport breakpoints** because containers are typically
narrower than viewports. A card in a 3-column grid at desktop is around 400px
wide — `@md` (448px) is its "comfortable" threshold for moving to a 2-column
internal layout.

When to use viewport vs. container — see `container-queries.md`.

## What "mobile-first" means in this contract

Every Tailwind utility class without a prefix applies at base (mobile). Prefixed
classes (`md:`, `lg:`, etc.) ADD to or OVERRIDE the base when the viewport is at
least that wide.

```html
<!-- ✅ Mobile-first — base is mobile, larger viewports get more columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

<!-- ❌ Anti-pattern — desktop-first, retrofits mobile with overrides -->
<div class="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
```

The first form reads top-down: "1 column on phone, 2 on tablet, 3 on desktop."
The second form requires reading right-to-left and inverting mentally. Always
the first form. See `mobile-first-discipline.md`.

## What NOT to add to the contract

- **A "tablet landscape" breakpoint** between md and lg. The `lg` tier covers
  tablet landscape (iPad landscape is 1024px). Adding a new tier means every
  component has to consider one more breakpoint.
- **Custom intermediate breakpoints** like `[890px]`. If your design demands it,
  the design's responsive intent isn't well-defined — push back to the
  ui-visual-lead. Arbitrary pixel breakpoints in one component (e.g.
  `min-[900px]:flex`) are fine once or twice in a project; they're a smell at
  ten times.
- **A "wide" breakpoint above 2xl**. Wide displays scale content via fluid
  spacing and clamp() type — the design doesn't typically need a 1920px-only
  variant. The `--container-wide` (1536px) max-width handles the layout cap.

## Edge cases worth knowing

- **iPhone 15 Pro Max in landscape**: 932×430. The width 932 is between
  Tailwind's `md` (768) and `lg` (1024). Layouts at md+ will trigger. Test
  landscape orientation explicitly for phone-targeted apps.
- **Folding phones unfolded** (Z Fold, Pixel Fold): 670×850 typical. Falls in the
  `sm` → `md` gap. The 2-column tablet layout typically works fine.
- **Tablet portrait with foldable keyboard / split-screen**: can drop to 600px-
  ish width. Falls in the base / sm range. The mobile layout (1-column) should
  still be acceptable.
- **Print preview**: not viewport-based. Use the `@media print` block in
  `globals.css` for print-specific styles. Most apps need only "hide chrome,
  unwrap content, keep tables intact."

## How the FE Lead enforces the contract

At code review, the FE Lead scans for:

- **Custom breakpoint values** in component code (`min-[900px]:`, `max-[450px]:`).
  Push back to use a named breakpoint or container query.
- **Desktop-first ordering** (`grid-cols-3 sm:grid-cols-1`). Push back.
- **Viewport breakpoints on components** that are used in multiple slot widths
  (sidebars vs. main area). Push to container queries.

These are mechanical findings. The verification protocol catches the rest.
