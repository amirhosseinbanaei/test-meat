# WCAG 2.2 Level AA — the bar in plain English

The conformance criteria as a working checklist. Each line: the criterion, what it means, where it lives in our stack. Items marked **[2.2]** are new in WCAG 2.2.

## Perceivable

### 1.1 Text alternatives
- **1.1.1 Non-text Content** — every image has alt text. Decorative images use `alt=""`. The shadcn `Avatar` falls back to initials. SVG icons used as buttons need `aria-label`.

### 1.2 Time-based media
- **1.2.1–1.2.5** — captions, transcripts, audio descriptions for video. Most projects don't host video; for those that do, this is a content-lead concern at production time, not a code concern.

### 1.3 Adaptable
- **1.3.1 Info and Relationships** — semantic HTML. Headings are `<h1>–<h6>` in order, lists are `<ul>/<ol>`, forms have labels, tables have headers. The biggest pitfall: divs and spans where elements with meaning belong.
- **1.3.2 Meaningful Sequence** — DOM order matches reading order. Don't use CSS to reorder content semantically.
- **1.3.3 Sensory Characteristics** — instructions don't rely solely on shape, color, or position ("click the red button on the left"). Pair with text.
- **1.3.4 Orientation** — content works in portrait AND landscape. Don't lock orientation unless essential.
- **1.3.5 Identify Input Purpose** — common inputs use `autocomplete` attributes (email, name, tel, etc.).

### 1.4 Distinguishable
- **1.4.1 Use of Color** — info isn't conveyed by color alone. Error states show an icon + text, not just red.
- **1.4.3 Contrast (Minimum)** — text and images of text: **4.5:1** for normal, **3:1** for large (18pt+ or 14pt+ bold). See `color-and-contrast.md`.
- **1.4.4 Resize Text** — text scales to 200% without loss of functionality. Use `rem` not fixed `px` for body text.
- **1.4.5 Images of Text** — avoid them. Use real text styled with CSS.
- **1.4.10 Reflow** — content reflows at 320px viewport width with no horizontal scroll (except for elements like data tables that genuinely need it).
- **1.4.11 Non-text Contrast** — UI components and graphics need **3:1** contrast against adjacent colors. Form input borders, button outlines, focus indicators all count.
- **1.4.12 Text Spacing** — text remains readable when users override line-height, letter-spacing, etc. Don't break layout with fixed line-height on user-content blocks.
- **1.4.13 Content on Hover or Focus** — tooltips can be dismissed (Esc), hovered themselves, and stay visible until dismissed/moved. Radix tooltips handle this.

## Operable

### 2.1 Keyboard accessible
- **2.1.1 Keyboard** — every interactive element is keyboard-reachable and operable. No mouse-only features.
- **2.1.2 No Keyboard Trap** — keyboard focus can move out of any component. Modals trap focus inside while open; close trap on dismiss. Radix Dialog handles this.
- **2.1.4 Character Key Shortcuts** — if you bind single-key shortcuts, provide a way to turn them off or remap.

### 2.2 Enough time
- **2.2.1 Timing Adjustable** — auto-logout warnings give the user a way to extend or turn off the timer.
- **2.2.2 Pause, Stop, Hide** — auto-advancing content (carousels, animations) has a way to pause.

### 2.3 Seizures and physical reactions
- **2.3.1 Three Flashes** — nothing flashes more than 3 times per second.

### 2.4 Navigable
- **2.4.1 Bypass Blocks** — "Skip to main content" link as the first focusable element in the layout.
- **2.4.2 Page Titled** — every route has a descriptive `<title>`. Use Next.js `metadata` exports per route.
- **2.4.3 Focus Order** — focus moves in the order that makes sense (visual + logical order match).
- **2.4.4 Link Purpose (In Context)** — link text describes its destination. Avoid "click here". The shadcn link styling doesn't help — the text must.
- **2.4.5 Multiple Ways** — provide more than one way to reach pages (nav + search + sitemap).
- **2.4.6 Headings and Labels** — descriptive headings and labels. `<h1>` is the page topic, not the brand name.
- **2.4.7 Focus Visible** — focused element has a visible indicator. Tailwind's `focus-visible:` ring on every interactive component.
- **[2.2] 2.4.11 Focus Not Obscured (Minimum)** — sticky headers / footers / fixed banners must not fully obscure the focused element. Test by tabbing through and watching what gets covered.

### 2.5 Input modalities
- **2.5.1 Pointer Gestures** — multi-finger / path-based gestures (pinch, swipe) have a single-pointer alternative.
- **2.5.2 Pointer Cancellation** — clicks fire on `mouseup`, not `mousedown`, so users can drag away to cancel.
- **2.5.3 Label in Name** — the accessible name of an element contains the visible label text. (E.g. button visible label "Save" → accessible name includes "Save", not just an icon's aria-label "Disk".)
- **2.5.4 Motion Actuation** — actions triggered by device motion (shake, tilt) have alternatives.
- **[2.2] 2.5.7 Dragging Movements** — anything draggable has a non-drag alternative. dnd-kit supports keyboard reordering by default; expose it.
- **[2.2] 2.5.8 Target Size (Minimum)** — interactive targets at least 24×24 CSS pixels. Tailwind's `min-h-9 min-w-9` (36px) clears this comfortably. Watch icon-only buttons.

## Understandable

### 3.1 Readable
- **3.1.1 Language of Page** — `<html lang="...">` set correctly. next-intl handles this per locale.
- **3.1.2 Language of Parts** — `lang="..."` on elements that switch language mid-page.

### 3.2 Predictable
- **3.2.1 On Focus** — focus alone doesn't change context (don't navigate on focus).
- **3.2.2 On Input** — changing a single setting doesn't navigate or submit without warning.
- **3.2.3 Consistent Navigation** — nav appears in the same place on every page.
- **3.2.4 Consistent Identification** — same things are labeled the same way across pages.
- **[2.2] 3.2.6 Consistent Help** — help mechanisms (contact, FAQ, chat) appear in the same place on every page.

### 3.3 Input assistance
- **3.3.1 Error Identification** — errors are identified in text. shadcn Form components do this via `FormMessage`.
- **3.3.2 Labels or Instructions** — every input has a label. `<Label>` from shadcn, associated via `htmlFor` to the input's `id`.
- **3.3.3 Error Suggestion** — when an error has an obvious fix, suggest it. "Email is invalid" is not enough; "Please include an @ symbol" is better.
- **3.3.4 Error Prevention (Legal/Financial/Data)** — for high-stakes submissions, give a chance to review / reverse / confirm.
- **[2.2] 3.3.7 Redundant Entry** — don't ask users to re-enter info already entered earlier in the same process. Carry it forward (form state, autofill).
- **[2.2] 3.3.8 Accessible Authentication (Minimum)** — auth must not depend on cognitive function tests (puzzles, transcription, math). Password fields must allow paste (don't disable paste on password inputs — common antipattern). 2FA codes should accept paste too.

## Robust

### 4.1 Compatible
- **4.1.1 Parsing** — valid HTML. (Officially removed in 2.2 as redundant with modern browsers, but worth keeping in habit.)
- **4.1.2 Name, Role, Value** — custom widgets have correct accessible name, role, value, state. ARIA where necessary. Radix primitives handle this; don't custom-build interactive widgets that exist in Radix.
- **4.1.3 Status Messages** — toasts, save confirmations, validation summaries use `aria-live` so screen readers announce them. shadcn's Sonner-based toasts (or Radix's `Toast` primitive) handle this.

## What we don't enforce (and why)

- **AAA criteria** — generally unachievable for arbitrary content. AAA contrast (7:1), AAA-level focus appearance, AAA-level help availability, etc. We aim higher than AA in some places (often hit 7:1 contrast incidentally) but don't enforce it.
- **WCAG 2.2 [AAA] 2.4.12, 2.4.13, 3.3.9** — AAA-only versions of AA criteria.

## How to use this list

Three contexts:

1. **At build time** — eslint-plugin-jsx-a11y catches many of these mechanically. The plugin's `strict` ruleset enforces 1.1.1, 1.3.1, 2.1.1, 2.4.4, 3.3.2, 4.1.2 directly. Other criteria can't be caught from static code analysis.
2. **During development** — `@axe-core/react` checks the rendered DOM and reports violations. Faster feedback than waiting for QA. Catches contrast, missing roles, broken ARIA, and ~30 more.
3. **Pre-launch audit** — qa-lead runs `references/audit-checklist.md` against the full app. Manual + axe-playwright + screen-reader walkthrough.

Bake the first two into the loop. The third is the gate.
