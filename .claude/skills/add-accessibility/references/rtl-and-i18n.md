# RTL and i18n accessibility

Accessibility considerations specific to right-to-left languages (Persian/Farsi, Arabic, Hebrew, Urdu) and to multi-language sites in general. Our products often serve Persian-speaking users — this isn't a nice-to-have.

## The fundamentals

### `lang` and `dir` attributes

```html
<html lang="fa" dir="rtl">
```

`next-intl` (locked in the stack) sets both based on the active locale. Don't override.

For pages or sections in a different language than the document, mark the boundary:

```tsx
<blockquote lang="en" dir="ltr">"Original English quote here"</blockquote>
```

Screen readers switch voice / pronunciation rules on `lang` changes. Critical for mixed-language content.

### `dir` is inherited

A `<div>` inside an `<html dir="rtl">` document is RTL unless you say otherwise. Don't sprinkle `dir="rtl"` on individual elements — the document-level attribute cascades.

The exception: embedded LTR content (English code samples, English brand names quoted verbatim, technical IDs). Wrap in `<bdi>` or set `dir="ltr"` explicitly.

```tsx
<p>The user ID is <bdi>USR-2026-A1B2</bdi>.</p>
```

`<bdi>` (bidirectional isolate) tells the browser to render this fragment in its own direction without disturbing surrounding text.

## Logical properties — the Tailwind rule

**Never use `left`/`right` in layout classes.** Use `start`/`end`.

| Don't | Do |
|---|---|
| `ml-4` | `ms-4` (margin-start) |
| `mr-4` | `me-4` (margin-end) |
| `pl-2` | `ps-2` |
| `pr-2` | `pe-2` |
| `left-0` | `start-0` |
| `right-0` | `end-0` |
| `border-l` | `border-s` |
| `text-left` | `text-start` |
| `rounded-l` | `rounded-s` |
| `rounded-r` | `rounded-e` |

Tailwind 4 supports all logical properties natively. The `s`/`e` variants flip automatically with `dir`.

When you genuinely mean "the physical left side regardless of direction" (rare — usually for a fixed UI element like a dev-mode badge), use `left`/`right` and document why.

## Icons that flip — and that don't

Some icons have direction. Some don't.

**Flip in RTL:**
- Arrows (back, forward, chevron, caret in carousels)
- Send / submit icons (paper plane, arrow)
- Undo / redo (curved arrows)
- Reply (left-pointing arrow)
- List bullets in some scripts

**Don't flip:**
- Search (magnifying glass — universal symbol)
- Settings (gear)
- Profile / user
- Home
- Heart / star / bookmark
- Clock (numbers face the same way)
- Sound / volume

For Lucide icons that need flipping, use the Tailwind `rtl:` variant:

```tsx
<ChevronRight className="size-4 rtl:rotate-180" />
```

Or for the carousel-back-button pattern:

```tsx
<Button variant="ghost" aria-label={t('previous')}>
  <ChevronLeft className="size-4 rtl:rotate-180" />
</Button>
```

**Critical**: the `aria-label` is the translated word — "previous" in English, "قبلی" in Persian. The icon flips. The accessible label is always direction-correct.

## Keyboard navigation in RTL

This is the highest-impact RTL accessibility bug source.

In RTL:
- **Tab** still moves forward in DOM order. Visually, that's right-to-left on most pages.
- **Arrow keys in custom widgets must invert.** Right arrow on a carousel in RTL means "previous", not "next." Radix primitives handle this automatically with `dir`. Custom widgets must.
- **Home/End** in lists still mean "first item / last item" — not "leftmost / rightmost."

If you build a custom keyboard-driven widget, test it in RTL. The bugs are usually arrow-key direction confusion.

## Reading order

DOM order = reading order, in both LTR and RTL. Don't reorder visually with `flex-row-reverse` or `order-` properties — screen readers still read DOM order, and the mismatch between visual and spoken order is genuinely disorienting.

When you need the visual to mirror in RTL but the reading order to stay the same, use logical properties and let the natural flow handle it. Tailwind's flex direction respects `dir` automatically in most cases.

The pattern that breaks: a card layout with the image on the left in LTR and the text on the right. In RTL, you want the image on the right and the text on the left, but you DON'T want to reverse the DOM order (image first, text second is the correct reading order regardless). Logical properties handle this — `flex` direction stays the same, and the layout flips because `start`/`end` flips.

## Numbers, dates, currency

Persian uses Persian-Arabic digits (۰۱۲۳۴۵۶۷۸۹) in some contexts, Western digits (0123456789) in others. The locked rule: use `Intl.NumberFormat` and `Intl.DateTimeFormat` with the active locale.

```tsx
const formatted = new Intl.NumberFormat('fa-IR').format(12345);  // ۱۲٬۳۴۵
```

For dates: `date-fns-jalali` is in the locked stack. Use it for Persian-calendar dates. Don't render Gregorian dates to Persian-speaking users without explicit reason.

Currency: `Intl.NumberFormat('fa-IR', { style: 'currency', currency: 'IRR' })`.

## Phone numbers

Phone numbers stay LTR even in RTL documents. Use `<bdi>` or `dir="ltr"`:

```tsx
<a href="tel:+989121234567">
  <bdi>+98 912 123 4567</bdi>
</a>
```

Without the isolate, the surrounding RTL context can scramble the digits visually.

## Form fields

Form inputs in RTL show right-aligned text by default. Some fields should stay LTR regardless of document direction:

- Email addresses (always LTR semantics).
- URLs.
- Code / API keys / IDs.
- Phone numbers.
- Credit card numbers.

```tsx
<Input
  type="email"
  dir="ltr"
  className="text-start"
  placeholder="you@example.com"
/>
```

`text-start` (logical) means "start of the input's direction" — with `dir="ltr"`, that's left-aligned regardless of document direction. The placeholder still shows in the expected position.

The exceptions are small. Most form fields (names, addresses, free text) should respect the document direction.

## Translated copy is longer

Persian (like Russian and German) is often 20-30% longer than English. Buttons, navigation, modal titles — what fits in English may overflow in Persian.

Test every UI with Persian translations loaded. If a button's text wraps to two lines in Persian and looked tight in English, the layout needs more room or shorter copy.

Don't fix this with truncation (`text-ellipsis`) on critical actions — truncated button labels are an accessibility failure. The label must be readable.

## Bidirectional text

Mixed LTR and RTL in the same line:

> "I called محمدرضا yesterday at 09:30."

Modern browsers handle this with the Unicode Bidirectional Algorithm. Usually works. When it doesn't, wrap the foreign-direction segment in `<bdi>`.

For user-generated content (comments, messages), let the browser handle it — don't try to detect direction in JavaScript. Set `dir="auto"` on the container:

```tsx
<p dir="auto">{userMessage}</p>
```

The browser inspects the first strong directional character and renders accordingly. Almost always correct.

## Testing matrix for RTL accessibility

For every release that targets Persian-speaking users:

1. **Toggle to Persian locale.** Walk the keyboard-only path through the critical journey.
2. **Confirm arrow keys** in carousels, menus, and tabs respect direction.
3. **Confirm icons** with direction (back/forward arrows) flip.
4. **Confirm logical layouts** (cards, columns, sidebars) flip without reordering reading order.
5. **Read the page in screen reader** with Persian voice (VoiceOver supports Persian; NVDA via espeak-ng).
6. **Visual scan for overflows** — long Persian translations breaking layouts.
7. **Bidirectional content** — LTR snippets (emails, URLs) embedded in RTL paragraphs render correctly.

## Common RTL bugs

| Symptom | Cause | Fix |
|---|---|---|
| Layout looks LTR despite Persian locale | Missing `dir="rtl"` on `<html>` | Confirm next-intl is setting it |
| Sidebar on the wrong side | Hardcoded `left-0` instead of `start-0` | Use logical properties |
| Arrow key navigation feels reversed | Custom widget not handling RTL | Use Radix, or invert arrow handling on `dir==='rtl'` |
| Carousel "next" button has back-arrow | Icon not flipped | Add `rtl:rotate-180` |
| Email address renders backwards | No bidi isolation | Wrap in `<bdi>` or `dir="ltr"` |
| Button text overflows | Persian translation longer than English | Adjust layout, not the translation |
| Screen reader reads "letters" individually | Missing `lang="fa"` on the page or section | Set `lang` on the language change |
| Date shows in Gregorian for Persian users | Using `Date.toLocaleDateString()` without explicit locale, or not using date-fns-jalali | Use `date-fns-jalali` for Persian dates |

## The mental model

LTR and RTL aren't mirrored — they're two valid reading directions, each with its own conventions. RTL isn't "LTR but flipped." It's its own thing. Build with logical properties from the start and most issues never appear. Retrofit RTL onto a left/right-hardcoded codebase and you'll spend weeks.

The locked stack uses logical properties by default. Keep it that way.
