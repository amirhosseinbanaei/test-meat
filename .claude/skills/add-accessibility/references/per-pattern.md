# Accessibility per pattern

Common UI patterns and how to do each one right. Most of the heavy work is handled by Radix (via shadcn) — these docs explain what Radix gets right so you understand what NOT to override, and what's left to you.

## Forms

**The labels rule:** every form control has a label, visible or screen-reader-only. shadcn's `<Label htmlFor="...">` does this. `<FormLabel>` inside `<FormField>` (the RHF + shadcn pattern) does it automatically.

**Required vs optional:**
- Mark required fields visually AND with `aria-required="true"` (or just `required` attribute — HTML5 sets aria-required automatically).
- Better: mark optional fields and let required be the default.

**Error messages:**
- Inline below the field, associated via `aria-describedby` pointing at the message's id.
- `aria-invalid="true"` on the input when invalid.
- shadcn `<FormMessage>` handles both.

**Helper text:**
- Same `aria-describedby` mechanism. If both helper and error apply, list both ids.

**Grouping:**
- Related controls (radio groups, checkbox groups, date ranges) wrapped in `<fieldset>` with `<legend>`. shadcn `<RadioGroup>` and `<CheckboxGroup>` produce this.

**Autocomplete:**
- Use `autocomplete="email"`, `"current-password"`, `"new-password"`, `"name"`, `"tel"`, etc. on common inputs. WCAG 1.3.5 and a real UX win.

**Password fields:**
- Allow paste. Don't disable. WCAG 2.2 3.3.8 explicitly forbids password-paste blocking.
- Provide a "show password" toggle for accessibility (users with cognitive disabilities, dyslexia).

## Buttons

- Use `<button>`, not `<div onClick>`. The browser does keyboard, focus, role, and disabled-state for free.
- Icon-only buttons need an accessible name. `aria-label="Close"` is the standard.
- Disabled buttons should explain why nearby (or via tooltip). Don't disable without context.
- `<button type="submit">` for form submission; `<button type="button">` for everything else. Default `type` is `submit` and trips people up.

Visible target size: **24×24 minimum** per WCAG 2.2 2.5.8. shadcn's default button sizes clear this. Watch icon buttons in dense toolbars.

## Links

- Use `<a href="...">` (with Next.js `<Link>`) for navigation. Use `<button>` for actions. They're not interchangeable.
- Link text should make sense out of context. "Click here" fails when read by a screen reader's link list.
- External links: indicate the new tab/window with text or an icon + sr-only text. `<ExternalLink className="size-4" /><span className="sr-only">opens in new tab</span>`.
- Don't open new windows without warning the user.

## Modals / Dialogs

shadcn's `<Dialog>` (Radix Dialog underneath) handles:

- Focus moves into the dialog on open.
- Focus trapped inside the dialog while open (Tab cycles within).
- Escape closes.
- Focus returns to the trigger on close.
- `aria-modal="true"`, `role="dialog"`, `aria-labelledby` pointing at the title.
- Background content marked `aria-hidden="true"`.

Use it. Don't roll your own.

The only thing you have to do: ensure `<DialogTitle>` always exists (visually hidden via `sr-only` if you don't want it visible). Without it, screen readers don't announce the dialog properly.

## Menus / Dropdowns

Same story. shadcn's `<DropdownMenu>` and `<Menubar>` handle keyboard nav (arrows, type-to-search, Home/End), roles (`menu`, `menuitem`), and focus correctly.

If you build a custom menu, you're missing a lot. Don't.

## Tabs

shadcn's `<Tabs>` handles:

- Arrow-key navigation between tabs.
- `role="tablist"`, `role="tab"`, `role="tabpanel"`.
- `aria-selected` on the active tab.
- `aria-controls` linking tab to panel.

Use it. Don't custom-build.

## Accordions

shadcn's `<Accordion>` handles `aria-expanded`, keyboard expansion (Enter/Space), and focus.

## Toasts / Notifications

The team's locked toast lib (Sonner via shadcn) puts notifications in a region with `aria-live="polite"`. Screen readers announce them automatically.

Don't put critical actions inside toasts (they auto-dismiss). Critical action confirmations go in dialogs.

## Tooltips

Radix `<Tooltip>` handles:

- Open on focus AND hover.
- Dismissable via Escape (WCAG 1.4.13).
- Hoverable content (you can move into it without it closing).

Tooltips are NOT a substitute for visible labels. They're supplementary. Don't put critical info in a tooltip.

## Tables

For data tables:

- `<table>`, `<thead>`, `<tbody>`. Not divs.
- Headers in `<th scope="col">` or `<th scope="row">`.
- Captions via `<caption>` (visually hidden is fine if the surrounding context provides the title).
- Sort buttons in headers use `aria-sort="ascending"|"descending"|"none"`.

For layout (rare — Tailwind grid usually does it better), use divs with `role="grid"` if you must but really, use grid CSS.

## Images

- `alt` is mandatory. Decorative images use `alt=""` (the empty string — different from omitting alt).
- Informative images describe what they convey. Don't say "image of" or "picture of" — screen readers add that.
- Complex images (charts, infographics) need longer descriptions in surrounding text or via `aria-describedby`.
- Next.js `<Image>` requires alt; lint catches missing alt.
- Background CSS images don't need alt (they're decorative by definition) but real content shouldn't be background.

## Icons

- Decorative icons: `aria-hidden="true"` on the SVG. (Lucide icons accept this prop directly.)
- Icon-as-button: button has `aria-label`; icon is decorative.
- Icon-with-text: icon is decorative; text is the label.
- Icon-alone-as-info (status icon next to text): icon decorative + sibling text describes; or icon has `role="img"` + `aria-label`.

The default: **most icons are decorative**. Don't accidentally give them roles.

## Loading / Busy states

- Use `aria-busy="true"` on the container while loading.
- For full-page loading (route transitions), Next.js `loading.tsx` is announced naturally as the page content changes.
- For inline loading, pair the spinner with `<span className="sr-only">Loading…</span>` so screen readers announce it.
- For long-running async work, use `aria-live="polite"` regions to announce progress milestones.

## Skeletons

Skeletons are decorative. Wrap them in `<div role="status" aria-label="Loading">` or `aria-busy="true"` on the parent. Don't make screen readers read the skeleton structure.

## Focus management on route change

Next.js App Router doesn't move focus to the new page on client-side navigation by default. The page reads as a single document and screen readers don't announce the new content.

Fix: in `app/layout.tsx`, mark the main content region with `<main id="main" tabIndex={-1}>`. After navigation, programmatically focus it. The locked frontend has a `useFocusOnRouteChange` hook in `common/hooks/` that does this. (Add it during accessibility setup if not already present.)

Alternative: announce the new page title via an `aria-live` region. We use the focus approach because it both announces AND moves keyboard position usefully.

## Skip links

The first focusable element in the document body should be a "Skip to main content" link. Visually hidden by default, visible on focus.

```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:shadow focus:outline-2 focus:outline-primary">
  Skip to main content
</a>
```

Mount once in `app/layout.tsx`. Pair with the `<main id="main">` above.

## Live regions

Three flavors of `aria-live`:

- `polite` (default for most things) — announced when the screen reader is idle.
- `assertive` — interrupts whatever's being read. Use sparingly — error toasts, critical alerts.
- `off` (the default) — not announced.

The shadcn toast region uses `aria-live="polite"`. Don't ratchet it up to assertive without a real reason.

## Custom interactive elements

If a Radix primitive doesn't cover what you need:

1. Reconsider. Almost everything has a primitive.
2. If you must build, build with a primitive as the base. Radix has `Slot`, `Popover`, `DropdownMenu`, `Dialog` — composable building blocks.
3. If you must build raw, follow the WAI-ARIA Authoring Practices Guide pattern for your widget type. Implement keyboard nav, focus management, roles, states EXACTLY as the pattern specifies. Then test with a screen reader.

The decision rule: building custom interactive widgets is **expensive** and almost always reinvents wheels. Lean Radix.

## RTL

Most of this works in RTL automatically because Radix is direction-aware. Things to watch:

- Don't hardcode left/right in classnames. Use logical properties: `ms-` and `me-` (margin-start/end) instead of `ml-`/`mr-`. Tailwind 4 supports these natively.
- Icons that have direction (arrows, chevrons) flip in RTL. Use Tailwind's `rtl:` variant or CSS logical transforms.
- Use the `dir="rtl"` attribute on the `<html>` element (next-intl sets this).
- Test in RTL even if you "don't speak the language" — keyboard nav reversal is the highest-impact bug source.

See `rtl-and-i18n.md` for the full RTL accessibility playbook.

## What NOT to do

- Don't `tabIndex={0}` your way out of bad structure. If you need to make something focusable, ask why.
- Don't `tabIndex={-1}` an interactive element to skip it from tab order — users can't reach it any other way.
- Don't use `aria-label` to lie. The visible label and the accessible label should match (WCAG 2.5.3).
- Don't block paste on inputs. Ever.
- Don't trap focus outside of legitimate modals/menus.
- Don't auto-focus inputs on page load except on dedicated single-input pages (search results, login). Auto-focus surprises screen-reader users.
- Don't remove focus indicators with `outline: none` and not replace them. If you do remove default, add your own.
- Don't use `placeholder` as the only label — placeholder disappears on input, low-contrast, easily missed.
- Don't make hover the only way to discover something interactive.

## Quick checklist for any new component

1. Is it built with a Radix/shadcn primitive? (Probably solved.)
2. Does it have a visible label or an `aria-label`?
3. Is it keyboard-reachable? Tab to it, hit Enter/Space — does it activate?
4. Is the focus indicator visible?
5. Is the target size ≥24×24px?
6. Does it work at 200% zoom and 320px width?
7. Does it announce state changes (open/closed, busy, etc.)?
8. Does it work in RTL?

If yes to all: proceed. If no to any: fix before merging.
