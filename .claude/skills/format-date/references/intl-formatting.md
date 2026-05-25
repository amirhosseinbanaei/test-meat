# Intl date formatting — the matrix

`Intl.DateTimeFormat` is the only formatter the FE Lead uses for display. It's built into every modern runtime, supports every locale, and natively speaks alternative calendars including Persian (Jalali) and Islamic (Hijri).

## The shape of a locale string

A BCP 47 locale string can optionally carry Unicode extensions that swap the calendar or the numbering system:

```
fa-IR-u-ca-persian
│   │  │  │   │
│   │  │  │   └── calendar identifier
│   │  │  └────── "calendar" key
│   │  └───────── "Unicode extension" marker
│   └──────────── region
└──────────────── language
```

The `u-ca-…` block is what switches the calendar.

## Common combinations

| Locale string | Output for `new Date()` with `dateStyle: 'long'` |
|---|---|
| `en-US` | `May 13, 2026` |
| `en-GB` | `13 May 2026` |
| `fa-IR` | `۲۳ اردیبهشت ۱۴۰۵` (Persian language, **Gregorian** calendar — usually wrong) |
| `fa-IR-u-ca-persian` | `۲۳ اردیبهشت ۱۴۰۵` (Persian language, **Jalali** calendar — usually what you want) |
| `ar-SA` | `13 مايو 2026 م` (Arabic, **Gregorian**) |
| `ar-SA-u-ca-islamic` | `٢٧ شوال ١٤٤٧ هـ` (Arabic, **Hijri**) |
| `ar-EG` | `13 مايو 2026` (Arabic, Egypt — Western digits) |

Common pitfall: `fa-IR` alone does NOT give you Jalali — it gives you Persian *language* with the Gregorian calendar (so dates look right typographically but the year is wrong for Iranian users). Always include `-u-ca-persian` for Iranian projects.

## The `dateStyle` shortcut

The simplest API: pass a `dateStyle` and let the locale decide the format.

```ts
new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'short' }).format(d)
// "۱۴۰۵/۲/۲۳"

new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium' }).format(d)
// "۲۳ اردیبهشت ۱۴۰۵"

new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long' }).format(d)
// "۲۳ اردیبهشت ۱۴۰۵"  (locale-dependent — Persian doesn't distinguish much from medium)

new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'full' }).format(d)
// "چهارشنبه ۲۳ اردیبهشت ۱۴۰۵"  (adds weekday)
```

`dateStyle` handles 90% of needs. Reach for individual options (`year`, `month`, `day`) only when `dateStyle` doesn't give you the shape you want.

## Adding time

`timeStyle: 'short' | 'medium' | 'long' | 'full'` works the same way, can be combined with `dateStyle`.

```ts
new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(d)
// "May 13, 2026 at 6:45 PM"

new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
// "۲۳ اردیبهشت ۱۴۰۵، ۱۸:۴۵"
```

## When to override

Use individual options when you need a specific shape:

```ts
new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(d)
// "۲۳/۰۲/۱۴۰۵"
```

## Why this is preferable to a library

- No bundle cost — Intl is built in.
- All calendars supported — Persian, Hijri, Buddhist, Hebrew, Indian, Japanese, all of them.
- All numbering systems — Western digits, Persian digits, Arabic-Indic digits, Devanagari, etc.
- Time zone aware via `timeZone: 'Asia/Tehran'`.
- Relative time formatting via `Intl.RelativeTimeFormat`.
- Locale-aware sorting via `Intl.Collator`.

The one thing Intl **cannot** do is arithmetic — adding days, subtracting months, parsing arbitrary strings. That's what `date-fns` and `date-fns-jalali` are for. See `jalali-manipulation.md` for that side.
