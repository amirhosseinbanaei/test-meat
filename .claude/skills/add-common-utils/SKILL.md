---
name: add-common-utils
description: Sets up the FE team's standard utility library — typed storage, cookies, number / string / URL helpers, array / object operations, validation, device detection, network status, debounce / throttle, async helpers. Drops twelve focused files into `src/common/lib/`. Run once per project after the scaffold.
allowed-tools: Read, Write
---

# Set up the common utility library

Drops twelve focused utility files into `src/common/lib/`. Each file has a clear single purpose; nothing is dumped into a generic `utils.ts` (apart from the shadcn `cn` helper which already lives there).

## When to use

- Once per project, immediately after `scaffold-nextjs-app`.
- Useful even on projects without authentication or complex features — every project needs storage helpers, formatters, validators.

## The twelve files

| File | What it provides |
|---|---|
| `storage.ts` | Typed localStorage / sessionStorage primitives (SSR-safe). Optional Zod validation. |
| `cookies.ts` | Client-side cookie read / write / delete. Server cookies use `cookies()` from `next/headers`. |
| `numbers.ts` | `formatNumber`, `formatCurrency`, `formatPercent`, `formatCompact`, `parseNumber`, `clamp`, `roundTo`. |
| `strings.ts` | `truncate`, `slugify`, `capitalize`, `escapeHtml`, `randomString`. |
| `url.ts` | `buildUrl(base, params)`, `parseQuery(qs)`, `isAbsoluteUrl`, `getDomain`. |
| `arrays.ts` | `uniqueBy`, `groupBy`, `chunk`, `partition`, `range`, `compact`, `last`. |
| `objects.ts` | `pick`, `omit`, `deepClone`, `isEmptyObject`, `getNested`, `mapValues`. |
| `validation.ts` | `isValidEmail`, `isValidUrl`, `isValidPhone`, `isStrongPassword`. |
| `device.ts` | `getDeviceType`, `isMobile`, `isTablet`, `isDesktop`, `isIOS`, `isAndroid`, `isTouchDevice`. |
| `network.ts` | `isOnline`, plus types for connection info. |
| `debounce.ts` | `debounce(fn, ms)` and `throttle(fn, ms)` — standalone, no React. |
| `async.ts` | `sleep(ms)`, `withTimeout(promise, ms)`, `retry(fn, opts)` — promise helpers. |

## When NOT to use individual files

These are infrastructure. The whole library is small enough to ship in every project; cherry-picking files is more bookkeeping than it's worth.

## Workflow

1. Read `references/usage-conventions.md` — when to use each function, what to NOT do.
2. Read `references/typing-rules.md` — how the generics, default values, and SSR-safety work.
3. Drop each file from `assets/` into `src/common/lib/`:
   ```bash
   for f in storage cookies numbers strings url arrays objects validation device network debounce async; do
     cp ${CLAUDE_SKILL_DIR}/assets/${f}.ts.template src/common/lib/${f}.ts
   done
   ```
4. Run `lint-and-typecheck` to confirm everything compiles cleanly.

## How to use

Import by domain — most code only needs one or two:

```ts
import { formatCurrency, clamp } from '@/common/lib/numbers';
import { groupBy, chunk } from '@/common/lib/arrays';
import { isValidEmail } from '@/common/lib/validation';
import { storageItem } from '@/common/lib/storage';
```

For React components that need *reactive* versions (debounced value as state, online status that re-renders), use the hooks in `add-common-hooks` instead. The lib functions here are pure / standalone.

## Files in this skill

- `assets/storage.ts.template`
- `assets/cookies.ts.template`
- `assets/numbers.ts.template`
- `assets/strings.ts.template`
- `assets/url.ts.template`
- `assets/arrays.ts.template`
- `assets/objects.ts.template`
- `assets/validation.ts.template`
- `assets/device.ts.template`
- `assets/network.ts.template`
- `assets/debounce.ts.template`
- `assets/async.ts.template`
- `references/usage-conventions.md` — when to reach for each.
- `references/typing-rules.md` — generics, SSR, runtime validation.
