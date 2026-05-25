# Typing rules

Three rules that run through every file in this skill.

## 1. SSR safety is built in

Every function that touches a browser-only API (`window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `crypto`) checks for its existence first and returns a sensible fallback on the server.

```ts
// Inside numbers.ts — no browser API needed, no guard.
export function clamp(n: number, min: number, max: number): number { ... }

// Inside storage.ts — touches localStorage, guarded.
export function getStorage(backend: StorageBackend): Storage | null {
  if (typeof window === 'undefined') return null;
  return backend === 'local' ? window.localStorage : window.sessionStorage;
}
```

You can call any of these from a Server Component without "ReferenceError: window is not defined". They just no-op.

For values that need to differ between server and client render, **don't read the value at render time** — read it in `useEffect` (after mount) or use the `useMounted` hook to gate the JSX. The lib functions return safe fallbacks, but React still complains about hydration mismatches when the SSR'd HTML differs from the first client render. The hooks (next skill) handle this properly.

## 2. Generics over `any`

Every utility that handles arbitrary data uses generics, not `any`. With `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` on, the compiler catches bugs the generics introduce.

```ts
// arrays.ts
export function uniqueBy<T, K extends keyof T>(
  arr: readonly T[],
  key: K | ((item: T) => unknown),
): T[]
```

- `readonly T[]` — the array isn't mutated. Don't pass a mutable array thinking you'll get a sorted copy.
- `K extends keyof T` — the key must exist on `T`. `uniqueBy(users, 'idd')` is a compile error if `User` has `id`.
- The return is `T[]` — same element type as input.

For functions that take an unknown shape (`getNested`, `deepClone`), the input is `unknown` and the return is `T | undefined` (caller asserts the type).

## 3. Optional runtime validation

Type-safety at compile time doesn't help against:

- localStorage values someone manually edited via DevTools.
- API responses that drifted from the contract.
- Old versions of the app stored under the same key with a different shape.

For these, pass a Zod schema:

```ts
import { z } from 'zod';
import { storageItem } from '@/common/lib/storage';

export const themePref = storageItem({
  key: 'theme',
  defaultValue: 'system' as const,
  schema: z.enum(['light', 'dark', 'system']),
});

themePref.get();
// If localStorage holds a corrupted value, returns 'system' (the default).
// If localStorage holds a valid value, returns it.
// Either way: the return type is 'light' | 'dark' | 'system'.
```

Without the schema, `storageItem` does best-effort parsing — corrupted values *could* slip through if their shape happens to look right.

## How the option signature works

Most helpers accept an options object instead of positional parameters. Reason: callsites are clearer (`{ retries: 3, timeout: 5000 }` reads better than `(..., 3, 5000)`) and adding new options doesn't break existing callers.

When the options object is empty, the parameter has a default:

```ts
export function formatNumber(value: number, options: Intl.NumberFormatOptions & { locale?: string } = {}): string
```

You can always call `formatNumber(123)` — the `options = {}` default fills in.

## Default values: `??` over `||`

In strict mode, `||` falls through on `0`, `''`, and `false` — usually not what you want.

```ts
// ✗ Wrong — 0 becomes the default
const delay = options.delay || 500;

// ✓ Right — only undefined / null becomes the default
const delay = options.delay ?? 500;
```

All defaults in these files use `??`.

## Read-only return types

Pure functions returning arrays/objects don't mark them `readonly` in the type — callers expect to mutate the result if they want. The functions don't mutate **inputs** (they take `readonly T[]`), but the **outputs** are owned by the caller.

## Index access under `noUncheckedIndexedAccess`

`tsconfig.json` has this on. Array and Record access returns `T | undefined`:

```ts
const first = arr[0];  // T | undefined, not T
const value = record['key'];  // T | undefined, not T
```

The lib files use this carefully:

- `last()` returns `T | undefined` — explicit about emptiness.
- `chunk()` builds chunks with `arr.slice(i, i + n)` — slice returns a non-undefined array.
- `shuffle()` uses non-null assertions inside the loop (`out[i]!`) because the algorithm guarantees the index is in bounds.

When you write code that uses these helpers, expect `undefined` from index access and handle it. The compiler will tell you if you forget.

## Avoid `unknown` leaks

A few helpers take `unknown` (`getNested`, `deepEqual`) — that's intentional because the input shape is arbitrary. The return is typed via generics. Don't propagate `unknown` further than necessary; assert or validate at the boundary.
