# Jalali date manipulation — `date-fns-jalali`

For *math* on Persian dates — adding days, subtracting months, computing differences, parsing user input — use `date-fns-jalali`. For *display*, use `Intl.DateTimeFormat` (see `intl-formatting.md`).

## API parity with date-fns

`date-fns-jalali` is a fork of `date-fns` with the same function names and the same signatures. Anything you know in `date-fns` works the same way — except the calendar is Jalali instead of Gregorian.

```ts
import { addDays as addDaysGregorian } from 'date-fns';
import { addDays as addDaysJalali } from 'date-fns-jalali';

const d = new Date('2026-05-13'); // 23 Ordibehesht 1405 in Jalali

addDaysGregorian(d, 30);
// 2026-06-12 in Gregorian (23 Khordad 1405 in Jalali, since adding 30 calendar days

addDaysJalali(d, 30);
// 2026-06-12 in Gregorian — SAME result, because 30 calendar days are the same in either calendar
```

The interesting cases are units that aren't the same length across calendars: **months and years**.

```ts
import { addMonths as addMonthsGregorian } from 'date-fns';
import { addMonths as addMonthsJalali } from 'date-fns-jalali';

const d = new Date('2026-05-13'); // 23 Ordibehesht 1405

addMonthsGregorian(d, 1);
// 2026-06-13 (one Gregorian month later → 23 Khordad 1405)

addMonthsJalali(d, 1);
// 2026-06-12 (one Jalali month later → 23 Khordad 1405)
//                 ^ different! Jalali months have 31/30/29 days; the
//                 calculation is calendar-aware.
```

**Rule:** for any unit *bigger than a day* (month, year), use the matching calendar's function. For day-level math, either works.

## Returning Date objects, not Jalali objects

Both libraries operate on standard JavaScript `Date` objects. There is no `JalaliDate` class. You hand them a `Date`, you get a `Date` back. The difference is the *interpretation* the function uses when reasoning about months and years.

This means:

- Store and pass `Date` (or ISO strings) everywhere internally.
- Convert only at display time.
- TypeScript can't tell which calendar the date was reasoned about in — be careful at function boundaries to document expectations.

## Parsing user input

When a user types "1405/02/23" in an Iranian project, that's a Jalali date string. Parse it with `date-fns-jalali`'s `parse`:

```ts
import { parse } from 'date-fns-jalali';

const d = parse('1405/02/23', 'yyyy/MM/dd', new Date());
// Returns a Date representing 2026-05-13 — converted to Gregorian internally.
```

The third argument is the "reference date" — used to fill in missing fields when the format string is partial. Pass `new Date()` for sensible defaults.

The reverse — formatting a `Date` as a Jalali string for a form field or a URL — uses `format`:

```ts
import { format } from 'date-fns-jalali';

const s = format(new Date(), 'yyyy/MM/dd');
// "1405/02/23"
```

This is the one place we deliberately use the library's `format` instead of `Intl`: when the output must be a specific, parseable, ASCII string (Western digits, no locale variation). For human-readable display, still use `Intl`.

## What about Hijri?

There is no maintained `date-fns-hijri`. Two options:

1. **Display-only:** `Intl.DateTimeFormat('ar-SA-u-ca-islamic', ...)` formats a Gregorian `Date` into Hijri. Good enough for showing dates to users.
2. **If you need Hijri arithmetic:** there's no first-class library in the stack. Escalate to FE Lead — it usually means the project's requirements need a discussion.

## Calendar gotchas worth knowing

- **Persian New Year (Nowruz)** lands around March 20-21 in Gregorian. The Jalali year `1404` → `1405` transition happens on that boundary. If a feature involves year-end behaviour, test around Nowruz.
- **Jalali year length** is either 365 or 366 days. The leap rule is *not* the Gregorian one. Don't hand-compute leap years — trust `date-fns-jalali`.
- **Month lengths in Jalali:** first 6 months have 31 days, next 5 have 30, last month has 29 (30 in leap years). If you're rendering a calendar grid, the library's `endOfMonth` or `daysInMonth` (where available) keeps you sane.

## When to fall back to ISO

For storage, API contracts, and any inter-system communication: always ISO 8601 Gregorian (`2026-05-13T18:45:00Z`). The Jalali presentation is a UI concern. Don't store Jalali strings.
