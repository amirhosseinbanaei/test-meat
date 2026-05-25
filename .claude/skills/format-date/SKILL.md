---
name: format-date
description: Formats and manipulates dates across Gregorian, Persian (Jalali / Shamsi), and Islamic (Hijri) calendars. Uses native `Intl.DateTimeFormat` for formatting (it natively speaks Persian and Hijri calendars), `date-fns` for Gregorian manipulation, and `date-fns-jalali` for Jalali manipulation. Use whenever the frontend needs to display, parse, add/subtract, or compare dates.
allowed-tools: Read, Write
---

# Format and manipulate dates

Single source of truth for every date operation in the project. The FE Lead never reaches outside this skill for date logic.

## When to use

- Displaying a date or time anywhere in the UI.
- Parsing a date from a user input (form field).
- Adding or subtracting days / months / years.
- Comparing two dates.
- Anything that requires the Persian (Jalali) or Hijri calendar.

## Why this matters in our stack

Two things shape every decision in this skill:

1. **Iranian/Persian projects need the Jalali (Shamsi) calendar.** Users see "۲۳ اردیبهشت ۱۴۰۵", not "13 May 2026". Internally we store ISO Gregorian; on display we convert.
2. **The native `Intl` API already handles this.** It speaks Persian (`fa-IR-u-ca-persian`) and Islamic Hijri (`ar-SA-u-ca-islamic`) calendars out of the box. **For formatting, no library is needed.** A library only enters the picture when we need to add, subtract, or parse Jalali dates — and that's what `date-fns-jalali` is for.

## The three-tool split

| Task | Tool |
|---|---|
| Display a date in any locale or calendar | Native `Intl.DateTimeFormat` |
| Manipulate Gregorian dates (add days, diff, parse) | `date-fns` |
| Manipulate Jalali / Persian dates | `date-fns-jalali` (drop-in API match for date-fns) |
| Manipulate Hijri / Islamic dates | Convert with `Intl` for display, store/manipulate in Gregorian. (No `date-fns` equivalent.) |

## Workflow

1. Read `references/intl-formatting.md` for the formatting matrix — which locale string produces which calendar.
2. Read `references/jalali-manipulation.md` when the project needs Iranian/Persian date math.
3. Copy `assets/dates.ts.template` to `src/common/lib/dates.ts` — this is the single import surface the rest of the codebase uses for dates.
4. Use the helpers in `src/common/lib/dates.ts` everywhere. Do not import `date-fns` or `date-fns-jalali` directly from components.

## Workflow rule

**All date operations go through `src/common/lib/dates.ts`.** Components never import `date-fns`, `date-fns-jalali`, or build their own `Intl.DateTimeFormat` instances. This keeps locale + calendar consistent across the app and makes locale switching a one-file change.

## Files in this skill

- `assets/dates.ts.template` — the single dates module with formatters and manipulators for Gregorian + Jalali.
- `references/intl-formatting.md` — locale strings, calendar tags, formatting options.
- `references/jalali-manipulation.md` — date-fns-jalali API and the API parity rule.
