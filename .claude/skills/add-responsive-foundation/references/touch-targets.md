# Touch targets

The locked rule: **44×44 CSS pixels minimum for every interactive element** on
touch-capable devices. This is WCAG 2.2 Level AA Success Criterion 2.5.8
("Target Size — Minimum"). It's also the most-violated rule in AI-generated
code.

## The rule

Any element a user can tap, click, drag, or interact with must have a hit area
of at least **44×44 CSS pixels**. This includes:

- Buttons (`<button>`, role="button")
- Links (`<a>`)
- Form controls (inputs, selects, checkboxes, radios, switches)
- Tabs, menu items, accordion triggers
- Icon buttons (the most-violated category)
- Drag handles
- Anything with `onClick` / `onTap` / `onPointerDown`

The 44px applies to the **effective hit area**, not the visible element. If the
visible icon is 16×16, the hit area can still be 44×44 via padding.

## The locked tokens

In `globals.css`:

```css
--size-touch: 2.75rem;    /* 44px — WCAG 2.2 AA minimum */
--size-touch-lg: 3rem;    /* 48px — Material Design / preferred */
```

In Tailwind:

```html
<button class="min-h-touch min-w-touch">...</button>       <!-- 44×44 minimum -->
<button class="min-h-touch-lg min-w-touch-lg">...</button> <!-- 48×48 preferred -->
<button class="size-touch">...</button>                    <!-- exact 44×44 -->
```

## Pattern 1: visibly-sized button is 44+ already

The simplest case. Your button is `h-10 w-24` (40×96px) — close to the limit but
under. Bump to `min-h-touch`:

```html
<!-- ❌ 40px tall — fails 2.5.8 -->
<button class="h-10 px-6 rounded-md">Save</button>

<!-- ✅ Minimum 44px tall -->
<button class="min-h-touch px-6 rounded-md">Save</button>
```

`min-h-touch` ensures 44px floor without preventing the button from growing
taller if content demands.

## Pattern 2: small visible icon, hit area needs to be 44+

The most common case: an icon-button is visually 16×16 or 20×20, but the
clickable element should be 44×44.

```html
<!-- ❌ 24×24 hit area — too small -->
<button class="size-6">
  <X class="size-6" />
</button>

<!-- ✅ Inflate via padding to reach 44×44 -->
<button class="inline-flex size-touch items-center justify-center">
  <X class="size-5" />  <!-- icon stays small visually -->
</button>
```

The button is 44×44; the icon is 20×20 centered inside. Hit area is full button.

## Pattern 3: visible icon is correctly small, can't add padding

Sometimes the design has a row of small icons (e.g. social media row, toolbar
icons) where adding padding would change the layout. Use **invisible hit area
expansion** via a pseudo-element:

```css
/* In globals.css or component file */
.touch-target::before {
  content: '';
  position: absolute;
  inset: 50%;
  width: max(100%, var(--size-touch));
  height: max(100%, var(--size-touch));
  transform: translate(-50%, -50%);
}
```

```html
<button class="relative touch-target size-6">
  <X class="size-6" />
</button>
```

The button looks like a 24×24 icon. The `::before` pseudo-element creates a
44×44 invisible hit area centered on it. Adjacent buttons may overlap their
hit areas — typically fine on icon toolbars (the user's finger is in only one
place).

Note: Tailwind 4 supports arbitrary `::before` pseudo styles via `before:`
variants. The class-based form is locked here because it's reusable.

## Pattern 4: spacing between touch targets

WCAG 2.2 AA actually allows targets smaller than 44px IF they have sufficient
spacing around them (24px between target centers, measured corner-to-corner).
But the simpler rule — make every target 44px — is easier to enforce and
review. Use the 44px rule by default.

If you can't (e.g. a dense data table with rows of action icons), apply
spacing:

```html
<!-- Smaller targets, but spaced — passes 2.5.8 via spacing -->
<div class="flex gap-3">  <!-- 12px gap = 12+24+12 = adequate spacing -->
  <button class="size-6">A</button>
  <button class="size-6">B</button>
  <button class="size-6">C</button>
</div>
```

The math: button is 24px; gap is 12px; center-to-center is 36px (24/2 + 12 + 24/2 = 36).
Need 24px center-to-center minimum. Passes.

This is a valid escape hatch. Use it for dense UIs; default to 44×44 elsewhere.

## Hover vs. tap — the missing primary interaction

Desktops have hover; phones don't. A pattern that relies on hover for a primary
interaction fails on touch:

```html
<!-- ❌ Mobile users can't see this — there's no "hover" on touch -->
<div class="group">
  <Card />
  <Button class="opacity-0 group-hover:opacity-100">Delete</Button>
</div>
```

On phone, the delete button is invisible and inaccessible. Fix by ensuring the
button is always reachable on touch:

```html
<!-- ✅ Always visible on touch; hide-on-hover only on devices that have hover -->
<div class="group">
  <Card />
  <Button class="@media(hover:hover){opacity-0 group-hover:opacity-100}">
    Delete
  </Button>
</div>
```

Or use the Tailwind `pointer-fine:` variant (the `@media (pointer: fine)`
mapping):

```html
<Button class="pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100">
```

Locked rule: any UI that's only revealed on hover MUST have an always-visible
equivalent on touch devices.

## Form field heights

Form inputs are interactive. The locked `--base-height: 48px` in the design
system foundation already passes (48 > 44). Don't override below 44px.

For inline inputs (search bars, chip filters) where 48px feels heavy on
desktop, drop to 40px ONLY at lg+ AND keep at 44+ on touch:

```html
<input class="h-12 lg:h-10">  <!-- 48 mobile (overshoots 44 — fine), 40 desktop — fine because no touch -->
```

Better: `pointer-fine:` to target devices that genuinely have a mouse:

```html
<input class="h-12 pointer-fine:h-10">
```

## What about hover-only-on-desktop touch devices?

Some devices have BOTH (laptop with touchscreen). The CSS rule
`@media (pointer: fine)` matches devices with a precise pointer — typically a
mouse. `@media (pointer: coarse)` matches touch. A device with both reports
`fine` (the most precise input is what's reported).

Practical guidance: use `pointer-fine:` for "this requires a mouse" affordances
(small click targets); use `pointer-coarse:` for "this is a touch UI"
adjustments (larger touch targets, swipe gestures). Most layouts work without
either — the 44×44 minimum on touch is harmless on mouse.

## How the FE Lead enforces this

The `add-accessibility` skill's CI (axe-playwright) catches violations of
SC 2.5.8 automatically. Plus at code review:

- Search the diff for `size-4`, `size-5`, `size-6`, `h-6`, `h-8`, `w-8` on
  interactive elements. If found, check for `min-h-touch` or padding that
  brings the hit area to 44+.
- Search for `:hover` / `group-hover:` without a touch-safe alternative.
- Open the feature on a phone-sized viewport in DevTools; tap visually at the
  smallest visible interactive areas to check.

## What NOT to do

- **Don't size icons to 44px.** The visible icon is 16, 20, or 24 — the BUTTON
  is 44. Confusing icon size with button size makes designs look clunky.
- **Don't override `min-h-touch` to something smaller** to "match the design."
  Push back to the designer. AA isn't optional.
- **Don't use `padding` to inflate a `<span onClick>`** instead of using a real
  `<button>`. Accessibility needs the right element, not just the right size.
- **Don't make form fields huge on desktop** because of touch targets. Use
  `pointer-fine:` to drop to 40px on mouse-driven devices.
- **Don't forget links.** Inline links in text are not subject to 2.5.8 (per
  WCAG, inline links are exempt). But standalone link buttons (nav links, card
  links) are. Apply `min-h-touch` to standalone link buttons.
