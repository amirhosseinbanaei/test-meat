# Responsive verification protocol

The locked checklist run on every feature before handoff. Mechanical, fast,
catches the vast majority of responsive bugs.

## The three viewports

Every feature is checked at these three widths in DevTools, in order:

| Viewport | Width | Device class | Why this width |
|---|---|---|---|
| Small phone | **375px** | iPhone SE, small Android | Smallest mainstream — if it works here, ~99% of phones work |
| Tablet | **768px** | iPad Mini portrait | The `md:` breakpoint transition — where many bugs hide |
| Desktop | **1280px** | Laptop / desktop | The design's "home" width |

Open DevTools → device toggle → set each viewport in turn. Don't skip.

Optional but recommended:
- 1024px — laptop / iPad landscape (the `lg:` transition).
- 1536px — wide desktop (the `2xl:` boundary).

## The six checks per viewport

At each viewport, run these six checks:

### 1. Overflow check

Open the feature. Scroll vertically — no horizontal scroll should appear at the
PAGE level. (Component-level horizontal scroll on `overflow-x-auto` tables is
fine.)

If horizontal scroll appears: open DevTools → toggle outlines on body
descendants → find the element overflowing the viewport. Usually it's:

- A fixed-width element (`w-[400px]`) wider than the viewport.
- An image without `max-w-full`.
- A table without `overflow-x-auto` parent.
- Long unbreakable text (URLs, code snippets) without `overflow-wrap: anywhere`.

### 2. Touch-target check

Tap every interactive element. Each tap area should be at least 44×44.

Quick test: in DevTools Elements panel, click the element → check Box Model for
total size. For icon buttons, check that padding inflates to 44×44 minimum.

Failures: icon buttons at 24×24 or 32×32 without `min-h-touch`.

### 3. Touch-only interaction check

Use DevTools' "Device Mode" pointer simulation (or test on a real touch device).
Trigger every interaction:

- Hover-only states (e.g. hover-to-reveal delete button) — fail. Mobile users
  can't access them. Must have an always-visible or tap-to-reveal alternative.
- Drag-and-drop with no touch handle — fails on touch. dnd-kit's keyboard /
  touch sensors must be wired.
- Tooltips on hover-only — they don't show on touch. Either also show on
  tap-and-hold, or make the tooltip content available another way.

### 4. Typography check

Read body text at each viewport.

- On phone: is text small enough to fit lines reasonably but large enough to
  read? Aim for ~16px (= `text-fluid-base` at small viewport).
- On desktop: are lines too long? Body text in a wide container should be
  constrained with `max-w-prose` (~65 characters).
- Hero / heading: not too cramped on phone, not absurdly large on desktop. If
  using fluid type, this should be automatic.

### 5. Source-order check

On phone (375px), scroll through the feature top to bottom. Is the order of
content logical? Specifically:

- Primary content (copy, key actions) appears before secondary (decorative
  images, related content).
- Form fields are in the order the user expects to fill them.
- Nav / chrome is at top, but doesn't dominate (sticky headers shouldn't
  consume > 80px of viewport height).

If the desktop layout has a "reverse" order (image left, copy right), the
mobile source order should still lead with copy. Use `order-*` utilities for
desktop swapping.

### 6. Resize-jolt check

Slowly drag the DevTools viewport from 320px to 1920px wide. Watch for:

- **Jumps in layout** at exact breakpoint boundaries — usually 768px, 1024px.
  Sudden type size shifts indicate step-based type that should be fluid.
- **Card or section heights changing abruptly** — usually because content
  changed (column count) but spacing didn't scale.
- **Touch targets shrinking below 44px** at intermediate widths — a button
  sized in `vw` units without a min.

A well-tuned responsive page is *smooth* during resize. Jolts are bugs.

## Automated checks via Playwright (in CI)

The `add-accessibility` skill's `axe-playwright` config tests three viewports
automatically:

```ts
// In e2e tests
test.describe('responsive', () => {
  for (const viewport of [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 800, name: 'desktop' },
  ]) {
    test(`is accessible at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/feature');
      await checkA11y(page);
    });
  }
});
```

This catches WCAG violations (including 2.5.8 touch targets) at all three
viewports. Add to every feature's E2E test.

## What CI catches vs. what humans catch

| CI catches | Humans catch |
|---|---|
| 2.5.8 touch-target violations (axe) | Hover-only patterns failing on touch |
| Missing alt text | Inappropriate source order |
| Color contrast failures | Cramped or absurd type at intermediate widths |
| Missing landmarks | Drag interactions on touch |
| Form labels missing | Resize jolts |
| Keyboard traps | Designs that "look weird" at tablet |

Neither replaces the other. Run both.

## The 5-minute sanity check

Even before CI, every developer runs this before handoff:

1. Open the feature in Chrome DevTools.
2. Set viewport to 375 × 667. Scroll through. Tap visible interactive elements.
3. Resize slowly to 1280 × 800. Watch for jolts.
4. Set viewport to 768 × 1024 (tablet portrait). Re-check.
5. Open in real Safari on iOS (or a phone). Same scroll-and-tap.

If steps 1–4 reveal no issues and step 5 (real device) works smoothly, the
feature is responsive-clean. If any step reveals a bug, fix before handoff.

## Common bugs the protocol catches

### Bug class 1: phone overflow

`<div className="w-[600px]">` overflows on a 375px phone. The fix: `w-full
max-w-[600px]`.

### Bug class 2: small icon button hit area

A close button in a modal corner: `<button><X className="size-4" /></button>`.
Hit area is ~16×16. The fix: add `min-h-touch min-w-touch flex items-center
justify-center`.

### Bug class 3: hover-only menu

Desktop pattern: hover the user avatar → menu drops down. Phone users can't
reach it. The fix: convert to click-on-tap behavior (Radix DropdownMenu handles
this automatically).

### Bug class 4: text too small on phone

Body text at `text-sm` (14px) on a phone is just below comfortable. The fix:
use `text-fluid-base` (interpolates 16→18) or `text-base md:text-lg`.

### Bug class 5: heading too large on phone

`text-5xl` (48px) heading on a 375px phone wraps to 4 lines and looks shouting.
The fix: `text-fluid-3xl` or `text-2xl md:text-4xl lg:text-5xl`.

### Bug class 6: table that shrinks to unreadable

A table with `text-xs` on phone to fit columns. The fix: use one of the three
table patterns in `per-pattern-responsive.md` — never just shrink text.

### Bug class 7: modal cramped on phone

A 400px-wide modal on a 375px phone has 4px of side margin per side. The fix:
full-screen sheet on phone, modal on tablet+ (see modals pattern).

### Bug class 8: image hogging the top on phone

A two-column hero with the image left and copy right. On phone, the image
stacks first — eating half the screen before users see the copy. The fix:
put copy first in source order, use `order` to swap on desktop if needed.

## Document the verification

When the FE Lead hands off to QA / orchestrator, the handoff includes a brief:

> "Responsive verified at 375 / 768 / 1280. axe-playwright passes at all three.
> Real-device check on iOS 17 Safari and Android Chrome — no issues."

If anything was overridden (a fixed-width admin tool that doesn't ship mobile),
note it:

> "This feature targets 1024+ only. Responsive verified at 1280 and 1536. Mobile
> is intentionally unsupported per PRD."

Explicit overrides prevent confusion downstream.
