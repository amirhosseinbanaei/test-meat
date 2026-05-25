# Usage conventions

When to reach for each file. Use the file's named functions directly — don't re-export them through a barrel; tree-shaking is more effective on direct imports.

## Cross-reference: function → file

| Need | File | Function |
|---|---|---|
| Save a setting across page loads | `storage.ts` | `local.set(key, value)` or `storageItem({ key, defaultValue })` |
| Save a setting for one session | `storage.ts` | `session.set(...)` or `storageItem({ ..., backend: 'session' })` |
| Read a non-HttpOnly cookie | `cookies.ts` | `getCookie(name)` |
| Format a price | `numbers.ts` | `formatCurrency(amount, 'USD')` |
| Format a "1.2K" / "3.4M" badge | `numbers.ts` | `formatCompact(n)` |
| Parse a user-typed price | `numbers.ts` | `parseNumber('$1,234.56')` |
| Cap a value | `numbers.ts` | `clamp(n, min, max)` |
| Make a URL slug | `strings.ts` | `slugify('Some Title!')` |
| Truncate with ellipsis | `strings.ts` | `truncate(s, 80)` |
| Hide most of a credit card | `strings.ts` | `mask(s, { end: 4 })` |
| Build a URL with params | `url.ts` | `buildUrl(base, { q, page })` |
| Parse `location.search` | `url.ts` | `parseQuery(window.location.search)` |
| Decide if link goes external | `url.ts` | `isExternalUrl(href)` |
| Dedupe an array of records | `arrays.ts` | `uniqueBy(rows, 'id')` |
| Group an array of records | `arrays.ts` | `groupBy(rows, 'category')` |
| Paginate a list locally | `arrays.ts` | `chunk(rows, pageSize)` |
| Subset of an object | `objects.ts` | `pick(user, ['id', 'name'])` |
| Object minus some keys | `objects.ts` | `omit(user, ['password'])` |
| Deep-clone form state | `objects.ts` | `deepClone(state)` |
| Safe nested access | `objects.ts` | `getNested(obj, 'a.b.c')` |
| Validate an email field on blur | `validation.ts` | `isValidEmail(input)` |
| Score a password | `validation.ts` | `passwordStrength(input)` |
| Show iOS-specific install hint | `device.ts` | `isIOS()` |
| Toggle layout on touch | `device.ts` | `isTouchDevice()` |
| One-shot online check | `network.ts` | `isOnline()` |
| Defer high-res images on slow | `network.ts` | `isSlowConnection()` |
| Debounce a search input (vanilla) | `debounce.ts` | `debounce(fn, 300)` |
| Throttle a scroll handler (vanilla) | `debounce.ts` | `throttle(fn, 100)` |
| Pause inside an async function | `async.ts` | `await sleep(500)` |
| Race a promise against a deadline | `async.ts` | `await withTimeout(p, 5000)` |
| Generic retry-with-backoff | `async.ts` | `await retry(fn, { retries: 3 })` |

## When NOT to use these

| Situation | Use this instead |
|---|---|
| Inside a React component, need debounced state | `useDebouncedValue` from `add-common-hooks` |
| Inside a React component, need debounced callback | `useDebouncedCallback` from `add-common-hooks` |
| Inside a React component, need reactive online status | `useOnline` from `add-common-hooks` |
| Inside a React component, need media query | `useMediaQuery` from `add-common-hooks` |
| Server-side cookies (Server Action, RSC, proxy) | `cookies()` from `next/headers` (or wrappers in `common/services/session.ts`) |
| Date formatting | `formatDate` / `formatRelative` from `common/lib/dates.ts` |
| Schema validation in forms / actions | Zod schemas in `modules/<feature>/schemas/` |
| HTTP retry inside a fetch call | The `retries` option on `http()` itself (don't wrap `http()` in `retry()`) |

## Reactive vs imperative

The lib files are **imperative** — call once, get a value. The hooks (next skill) are **reactive** — values re-render the component when they change.

| Need | Imperative | Reactive |
|---|---|---|
| Width | `window.innerWidth` (one-shot) | `useWindowSize()` |
| Online status | `isOnline()` | `useOnline()` |
| Stored value | `local.get('key', fallback)` | `useLocalStorage('key', fallback)` |
| Debounced fn | `debounce(fn, ms)` | `useDebouncedCallback(fn, ms)` |

If the component needs to re-render when the value changes, use the hook. If it only needs the value once (e.g. inside an event handler), use the imperative form.

## Don't reinvent

A few rules of thumb to avoid drift:

- **No project-specific `utils.ts`.** Every helper belongs to one of these named files. If it doesn't fit any, create a new domain file (and update this doc).
- **No mixed-concerns files.** Don't put HTTP retry next to string truncation just because they're both "utils". One purpose per file.
- **No duplicates.** Before adding a helper to a module's `lib/`, check if it already exists here. Module-local helpers should be genuinely feature-specific (e.g. `calculateOrderTax` lives in the orders module).
- **No external deps for things native runtimes do well.** `Intl.NumberFormat` beats `numeral.js`; `URL` and `URLSearchParams` beat `query-string`; `structuredClone` beats `lodash.clonedeep`. The locked stack avoids `lodash` and `ramda` for this reason.
