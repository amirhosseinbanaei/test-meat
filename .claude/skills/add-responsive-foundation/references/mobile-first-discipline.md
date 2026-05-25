# Mobile-first discipline

The single most important responsive rule: **base classes target mobile;
larger-viewport prefixes ADD to them.** Never the reverse. This document is the
discipline — read it, follow it, enforce it at review.

## The rule

```html
<!-- ✅ Mobile-first — read top to bottom, base → larger -->
<div class="
  flex flex-col gap-3            /* base: phone — vertical stack */
  md:flex-row md:gap-6            /* tablet+: horizontal row */
  lg:gap-8                        /* laptop+: wider gap */
">
```

Read aloud: "stack vertically with small gap, **then at tablet** switch to row
and grow the gap, **then at laptop** grow the gap more." The mental model is
*progressive enhancement*: start with the cheapest layout (mobile), enhance as
the viewport gets bigger.

## The anti-pattern

```html
<!-- ❌ Desktop-first — reads right-to-left mentally -->
<div class="
  flex flex-row gap-8             /* assumes desktop */
  md:flex-row md:gap-6            /* still desktop-ish */
  sm:flex-col sm:gap-3            /* OVERRIDES for mobile */
">
```

Two problems:

1. **You have to mentally invert.** To know what the phone gets, you read every
   override. The reader has to compute "desktop minus all the smaller-viewport
   overrides."
2. **`sm:` is "640+", not "phone only".** Most teams who write this style assume
   `sm:` means "small / mobile". It doesn't. It means "640px and up". The class
   `sm:flex-col` makes the layout column from 640px upward — exactly when you
   typically want it to be a row.

Tailwind's prefixes are **min-width**, not "this size only." The grammar is:
"at this size and larger, apply this."

## How to write mobile-first in practice

### Rule 1: every Tailwind class with no prefix targets mobile

```html
<h1 class="text-2xl">     <!-- 24px on phone -->
<h1 class="text-2xl md:text-4xl">  <!-- 24px on phone, 36px on tablet+ -->
```

### Rule 2: every prefixed class only ADDS

Never use `sm:` / `md:` / etc. to REVERT a base style. If a feature only applies
to desktop, write it ONLY on the prefixed class:

```html
<!-- ❌ Reverting at smaller size -->
<div class="hidden sm:hidden md:block">   <!-- confusing -->

<!-- ✅ Adding at larger size -->
<div class="hidden md:block">             <!-- "hidden on mobile, block on tablet+" -->
```

### Rule 3: build the smallest layout first, then enhance

When writing a component, write the mobile (base) class FIRST in source order,
then `sm:`, then `md:`, then `lg:`, etc.:

```html
<!-- ✅ Source order matches viewport order -->
<div class="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6">
```

This isn't enforced by Tailwind (the cascade works regardless of class order),
but it makes the code self-documenting. Reading left-to-right tells the story.

### Rule 4: prefer additive utilities for layout, not overrides

Bad:

```html
<!-- ❌ Hide-then-show — extra paint at first render -->
<div class="block md:hidden">  Mobile-only menu </div>
<div class="hidden md:block">  Desktop nav </div>
```

This is OK as a pattern (two components rendered, one shown), but consider
whether one component with a responsive internal structure is clearer:

```html
<!-- ✅ One component, internal layout shifts -->
<nav class="flex flex-col md:flex-row md:items-center md:gap-6">
  <Logo />
  <div class="hidden md:flex md:gap-4">{links}</div>
  <MobileMenu className="md:hidden">{links}</MobileMenu>
</nav>
```

Different content for different viewports is fine when the content genuinely
differs (a drawer with full-width touch targets isn't the same as a horizontal
nav bar). But "the same content laid out differently" → one component, internal
responsive layout.

## When prefixed classes are a smell

Five (or more) responsive prefixes on a single element usually means the
component is doing too much:

```html
<!-- 🤔 Probably a refactor signal -->
<div class="
  grid grid-cols-1 gap-2 px-3 py-4 text-sm
  sm:grid-cols-2 sm:gap-3 sm:px-4 sm:py-5 sm:text-base
  md:grid-cols-3 md:gap-4 md:px-6 md:py-6 md:text-base
  lg:grid-cols-4 lg:gap-6 lg:px-8 lg:py-8 lg:text-lg
  xl:grid-cols-5 xl:gap-8
">
```

Options:

1. **Use fluid utilities** instead of breakpoint-step utilities for gap, padding,
   text:
   ```html
   <div class="grid grid-cols-1 gap-fluid-md p-fluid-md text-fluid-base
              sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
   ```
   Most of the steps disappear. Type and spacing scale smoothly via `clamp()`.

2. **Use container queries** if the component lives in multiple slot widths.
   Maybe the column count should adapt to the container's width, not the
   viewport's.

3. **Refactor**. Maybe what looks like one component is actually two — a phone
   card layout and a desktop table — and they don't share enough to be the same
   component.

## Common mobile-first mistakes Claude makes

These are the patterns the FE Lead should catch:

### Mistake 1: fixed widths on cards

```html
<!-- ❌ Breaks on 360px phones (overflow horizontally) -->
<div class="w-[400px] rounded-lg border p-4">

<!-- ✅ Constrained but not fixed -->
<div class="w-full max-w-md rounded-lg border p-4">
```

Fixed pixel widths on cards / panels / forms are the #1 source of mobile
overflow. Always `w-full` with a `max-w-*` cap.

### Mistake 2: large padding ignoring phones

```html
<!-- ❌ 48px padding eats the entire phone screen -->
<section class="p-12">

<!-- ✅ Mobile-first padding -->
<section class="p-4 md:p-8 lg:p-12">

<!-- ✅ Or fluid padding -->
<section class="p-fluid-md">
```

### Mistake 3: text-sized for desktop only

```html
<!-- ❌ 24px headings on a 360px phone look giant -->
<h2 class="text-3xl">

<!-- ✅ Step responsive sizing -->
<h2 class="text-xl md:text-2xl lg:text-3xl">

<!-- ✅ Fluid sizing -->
<h2 class="text-fluid-2xl">
```

### Mistake 4: horizontal layouts that don't wrap

```html
<!-- ❌ Two children side-by-side at 360px is squashed -->
<div class="flex gap-4">

<!-- ✅ Wraps on phone, stays inline on tablet+ -->
<div class="flex flex-wrap gap-4">

<!-- ✅ Or explicit column → row at md -->
<div class="flex flex-col gap-4 md:flex-row">
```

### Mistake 5: forgetting that phones are TALL

```html
<!-- ❌ Two-column hero with image on top — phone shows giant image, no copy -->
<section class="grid grid-cols-2 gap-8">
  <Image />
  <HeroCopy />
</section>

<!-- ✅ Stack on phone (copy first), side-by-side on desktop -->
<section class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
  <HeroCopy />  {/* copy first — users see it before scrolling */}
  <Image />
</section>
```

Source order matters: on mobile, the first child renders first. Put the most
important content (usually copy, not images) first in the DOM. Use CSS grid's
`order` utility if the desktop layout needs the image first:

```html
<HeroCopy class="md:order-2" />
<Image class="md:order-1" />
```

## The 60-second mental check

Before submitting any component, the developer asks themselves three questions:

1. **"What does this look like at 375px?"** Open DevTools, drop to 375px width,
   inspect. Is everything visible? Is anything overflowing? Are touch targets
   big enough?
2. **"What's my source-class order?"** Are unprefixed classes first, then `sm:`,
   `md:`, `lg:`, etc.? If a class has a smaller prefix than one before it, it's
   probably a desktop-first slip.
3. **"Did I use a fixed width anywhere?"** Search the file for `w-[`, `min-w-[`,
   `max-w-[` with px values. Each one is a potential overflow. Justify each.

These checks take a minute. They catch about 80% of responsive bugs before they
reach review.
