---
name: add-common-hooks
description: Sets up the FE team's standard React hooks library — useLocalStorage, useSessionStorage, useDebouncedValue, useDebouncedCallback, useThrottledCallback, useMediaQuery, useWindowSize, useOnline, useMounted, useOnClickOutside, useEventListener, useCopyToClipboard, useInterval, useTimeout, usePrevious, useUpdateEffect, useIsomorphicLayoutEffect, useDocumentTitle, useScrollLock. Drops nineteen focused hook files into `src/common/hooks/`. Run once per project, after `add-common-utils`.
allowed-tools: Read, Write
---

# Set up the common hooks library

Drops nineteen focused hook files into `src/common/hooks/`. Each is a single-purpose, well-typed hook that handles SSR / hydration / cleanup correctly.

## When to use

- Once per project, after `add-common-utils` (some hooks use lib functions).
- Even on small projects — these are the hooks that come up everywhere.

## The nineteen hooks

| Hook | What it does |
|---|---|
| `useLocalStorage<T>(key, initial)` | Reactive localStorage. Returns `[value, set, remove]`. Cross-tab sync. |
| `useSessionStorage<T>(key, initial)` | Same, for sessionStorage. |
| `useDebouncedValue<T>(value, ms)` | Debounced version of `value` — updates after `ms` of stability. |
| `useDebouncedCallback(fn, ms)` | Stable debounced callback that always sees the latest `fn`. |
| `useThrottledCallback(fn, ms)` | Stable throttled callback. |
| `useMediaQuery(query)` | `true` if the media query matches. Live updates on resize. |
| `useWindowSize()` | `{ width, height }` — throttled to 100ms. |
| `useOnline()` | Reactive `navigator.onLine`. |
| `useMounted()` | `true` after the first client render — avoid hydration mismatches. |
| `useOnClickOutside(ref, handler)` | Run handler when clicking outside the ref'd element. |
| `useEventListener(target, event, handler)` | Typed event listener with cleanup. |
| `useCopyToClipboard()` | `[copied, copy(text)]` — handles permissions and fallbacks. |
| `useInterval(callback, ms)` | `setInterval` with proper cleanup and latest-callback handling. |
| `useTimeout(callback, ms)` | `setTimeout` with the same. |
| `usePrevious<T>(value)` | The value from the previous render. |
| `useUpdateEffect(fn, deps)` | Like `useEffect` but skips the first render. |
| `useIsomorphicLayoutEffect` | `useLayoutEffect` on client, `useEffect` on server (no SSR warning). |
| `useDocumentTitle(title)` | Set `document.title` for the duration of the component. |
| `useScrollLock(locked)` | Lock body scroll when `locked` is true (for modals / drawers). |

## When NOT to use individual hooks

Same logic as `add-common-utils` — these are infrastructure, ship them all. Tree-shaking handles unused imports.

## Workflow

1. Read `references/hooks-patterns.md` — how each hook handles SSR, cleanup, stability of returned values, and interaction with the React Compiler.
2. Drop each file from `assets/` into `src/common/hooks/`. **Hook files are camelCase** — same as their export name:
   ```bash
   for f in \
     useLocalStorage useSessionStorage \
     useDebouncedValue useDebouncedCallback useThrottledCallback \
     useMediaQuery useWindowSize useOnline \
     useMounted useOnClickOutside useEventListener \
     useCopyToClipboard useInterval useTimeout \
     usePrevious useUpdateEffect useIsomorphicLayoutEffect \
     useDocumentTitle useScrollLock; do
     cp ${CLAUDE_SKILL_DIR}/assets/${f}.ts.template src/common/hooks/${f}.ts
   done
   ```
3. Run `lint-and-typecheck` to confirm everything compiles.

## How to use

Direct imports, not barrels — tree-shaking and dev-tool clarity:

```tsx
'use client';
import { useLocalStorage } from '@/common/hooks/useLocalStorage';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import { useMediaQuery } from '@/common/hooks/useMediaQuery';

export function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const isWide = useMediaQuery('(min-width: 1024px)');
  // ...
}
```

All hooks are client-only — every file starts with `'use client'`. Calling them from a Server Component is a compile-error-or-runtime-error depending on the path.

## Files in this skill

- `assets/useLocalStorage.ts.template`
- `assets/useSessionStorage.ts.template`
- `assets/useDebouncedValue.ts.template`
- `assets/useDebouncedCallback.ts.template`
- `assets/useThrottledCallback.ts.template`
- `assets/useMediaQuery.ts.template`
- `assets/useWindowSize.ts.template`
- `assets/useOnline.ts.template`
- `assets/useMounted.ts.template`
- `assets/useOnClickOutside.ts.template`
- `assets/useEventListener.ts.template`
- `assets/useCopyToClipboard.ts.template`
- `assets/useInterval.ts.template`
- `assets/useTimeout.ts.template`
- `assets/usePrevious.ts.template`
- `assets/useUpdateEffect.ts.template`
- `assets/useIsomorphicLayoutEffect.ts.template`
- `assets/useDocumentTitle.ts.template`
- `assets/useScrollLock.ts.template`
- `references/hooks-patterns.md` — SSR, hydration, cleanup, stable references, compiler interaction.
