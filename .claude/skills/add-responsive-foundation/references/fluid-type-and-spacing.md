# Fluid type and spacing

The `clamp()`-based scale that eliminates jarring steps between breakpoints.

## Why fluid

Step-based responsive typography:

```html
<h1 class="text-2xl md:text-4xl lg:text-5xl">
```

At 767px viewport: `text-2xl` (24px). At 768px: `text-4xl` (36px). **A 12px
jump from one resize pixel to the next.** Users resizing windows see the page
jolt. Designs at 800px viewport look weird because they're getting the desktop
type at near-mobile width.

Fluid typography:

```html
<h1 class="text-fluid-3xl">
```

The size interpolates smoothly from 30px on small phones to 48px on large
desktops via `clamp(1.875rem, 1.65rem + 1.25vw, 3rem)`. Every intermediate
viewport gets a proportional size — no jumps.

## The locked type scale

| Utility | clamp() | Min (mobile) | Max (desktop) | Use for |
|---|---|---|---|---|
| `text-fluid-xs` | clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem) | 12px | 14px | Captions, footnotes |
| `text-fluid-sm` | clamp(0.875rem, 0.825rem + 0.25vw, 1rem) | 14px | 16px | Helper text, labels |
| `text-fluid-base` | clamp(1rem, 0.95rem + 0.25vw, 1.125rem) | 16px | 18px | Body |
| `text-fluid-lg` | clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem) | 18px | 22px | Lead paragraph |
| `text-fluid-xl` | clamp(1.25rem, 1.15rem + 0.5vw, 1.75rem) | 20px | 28px | H4, small heading |
| `text-fluid-2xl` | clamp(1.5rem, 1.35rem + 0.75vw, 2.25rem) | 24px | 36px | H3 |
| `text-fluid-3xl` | clamp(1.875rem, 1.65rem + 1.25vw, 3rem) | 30px | 48px | H2 |
| `text-fluid-4xl` | clamp(2.5rem, 2.1rem + 2vw, 4rem) | 40px | 64px | H1 / hero |
| `text-fluid-5xl` | clamp(3rem, 2.4rem + 3vw, 5rem) | 48px | 80px | Marketing hero |

The min and max values were tuned for the locked viewport range:

- **Min activates at ~360px** (small phone). Below this you may need to use a
  smaller value via override; most apps are fine at the minimums.
- **Max activates at ~1536px** (wide desktop). Above this the size stops
  growing — preventing absurd 100px headings on 27" monitors.

## When to use fluid vs. step responsive

| Use fluid (`text-fluid-*`) | Use step (`text-md md:text-lg`) |
|---|---|
| Most body text and headings | When the design literally specifies one size at mobile and a different one at desktop with NO in-between |
| Hero headings — visually scale with the experience | UI chrome where exactness matters (an icon button label that must be exactly 14px) |
| Marketing pages | A design where the type changes role at different breakpoints (e.g. compact metadata at mobile becomes a full caption at desktop) |
| Article / blog content | Code blocks (always monospace, often pinned to one size) |

Most projects: use fluid for 80% of type. Reach for step responsive only when
the design genuinely demands it.

## The fluid spacing scale

| Variable / utility | clamp() | Use for |
|---|---|---|
| `--space-fluid-2xs` (8→12) | clamp(0.5rem, 0.45rem + 0.25vw, 0.75rem) | Tightest component-internal gaps |
| `--space-fluid-xs` (12→16) | clamp(0.75rem, 0.65rem + 0.5vw, 1rem) | Form-field gap, card-internal gap |
| `--space-fluid-sm` (16→24) | clamp(1rem, 0.85rem + 0.75vw, 1.5rem) | Between cards, section subheadings |
| `--space-fluid-md` (24→40) | clamp(1.5rem, 1.25rem + 1.25vw, 2.5rem) | Major section gaps |
| `--space-fluid-lg` (32→64) | clamp(2rem, 1.5rem + 2.5vw, 4rem) | Page-section vertical rhythm |
| `--space-fluid-xl` (48→96) | clamp(3rem, 2.25rem + 3.75vw, 6rem) | Hero padding, between marketing sections |
| `--space-fluid-2xl` (64→128) | clamp(4rem, 3rem + 5vw, 8rem) | Extreme — only for full-bleed marketing |

Use these for **section-level spacing** that should breathe more on bigger
screens. For **component-internal spacing** (button padding, form-field gap),
use Tailwind's static scale (`p-3`, `gap-2`) — components shouldn't change shape
with viewport.

### Decision rule

- **Component internal** → static (`gap-2`, `p-3`, `mt-4`). The button's
  padding shouldn't grow on a 27" monitor.
- **Section / page level** → fluid (`gap-fluid-md`, `py-fluid-lg`).
  Sections should breathe.

## How to use fluid utilities

If your Tailwind 4 setup auto-generates utilities from `--space-fluid-*` tokens
in the theme (recommended), use directly:

```html
<section class="py-fluid-lg">
<div class="gap-fluid-md">
<h1 class="text-fluid-4xl">
```

If your setup doesn't (some namespace configs), use the CSS-variable form:

```html
<section class="py-[var(--space-fluid-lg)]">
```

Both work. Prefer the utility form when available — it's shorter and Tailwind
can dead-code-eliminate unused values.

## Tradeoffs you should know about

### 1. Pixel-exactness is gone

Designers will hand you a Figma at 1440px showing `font-size: 32px` for an H2.
With `text-fluid-2xl`, at 1440px the H2 will be ~33px (interpolated). Close
enough — but not pixel-exact.

The pixel-exactness trade is worth it because the design is exact at ONE width
(1440px in Figma) and wrong at every other width with step responsive. Fluid
is approximately right everywhere.

If your designer is allergic to this, the override is per-component:

```html
<h2 class="text-[32px] lg:text-[40px]">  <!-- pixel-exact, designer-dictated -->
```

Don't do this everywhere — but it's a valid override.

### 2. The interpolation curve is linear

`clamp(min, X + Yvw, max)` is linear in viewport width. Most real designs are
fine with linear. If you need non-linear (e.g. a step at exactly 1024px), use
breakpoint-based step responsive for that specific element.

### 3. Container-based fluid is harder

`clamp()` reads the viewport. If a component lives in a sidebar, the heading
inside scales with the *viewport*, not the *sidebar's width*. For
container-relative scaling, use container queries plus step-based type within
the container (see `container-queries.md`). True container-relative fluid type
requires `cqi` units which work but are less ergonomic.

### 4. Long lines on wide displays

Fluid type without a `max-width` on the text container produces lines too long
to read on wide displays:

```html
<!-- ❌ Body text spans 1500px on a wide desktop — unreadable -->
<p class="text-fluid-base">Long article content...</p>

<!-- ✅ Constrain the prose width -->
<article class="mx-auto max-w-prose">
  <p class="text-fluid-base">Long article content...</p>
</article>
```

Tailwind's `max-w-prose` is ~65 characters. For articles, always constrain.

## What NOT to do

- **Don't mix fluid and step on the same element**:
  ```html
  <h1 class="text-fluid-2xl md:text-fluid-4xl">  <!-- pick one approach -->
  ```
  Fluid already scales — adding step on top is incoherent.
- **Don't use fluid for accessible touch targets**. Touch buttons should be
  reliably 44px+. Use static `min-h-touch`.
- **Don't define per-component clamp() values**. The locked scale is the
  scale. If you need a value not in the scale, add it ONCE to the scale (the
  whole project benefits) rather than scattering bespoke clamp() across files.
- **Don't fluid-size icon-only buttons**. Icons should be pinned (`size-5`).
  Buttons should be pinned (`size-touch`).
- **Don't use `vw` directly** (`text-[3vw]`). Always go through clamp() so you
  get a min and a max. Naked `vw` produces absurd sizes at extreme viewports.
