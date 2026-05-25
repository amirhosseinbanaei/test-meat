# Hook patterns

How each hook handles the things that make hooks subtle: SSR, hydration, cleanup, stable identity, and the React Compiler.

## SSR & hydration

Every hook in this library is **`'use client'`**. They can be imported from Server Components only if not invoked — but practically, you only call them inside Client Components.

Three SSR strategies are used depending on what the hook does:

| Strategy | Used by | What it does |
|---|---|---|
| **Safe fallback** | `useLocalStorage`, `useSessionStorage`, `useWindowSize` | Returns a placeholder value on the server. On the client, re-reads after mount. |
| **`useSyncExternalStore`** | `useMediaQuery`, `useOnline` | The right primitive for "subscribe to external state". React guarantees consistent snapshots. |
| **Mount gate** | `useMounted` | Returns `false` until the first client effect runs. Use to defer rendering content that depends on client-only state. |

### Hydration mismatches

The classic trap: a Server Component renders one thing, the client renders something else, React warns about mismatch.

The hooks that read browser state (storage, window size, media queries) return a **fallback** value at SSR. If you render that value into JSX, the SSR HTML and the first client render match — happy hydration. After mount, the hook re-syncs to the real value and the component re-renders.

If your fallback value is wrong (the SSR shows "Mobile" but the user is on desktop), you have two options:

1. **Don't render until mounted.** Gate with `useMounted`:
   ```tsx
   const mounted = useMounted();
   const isDesktop = useMediaQuery('(min-width: 1024px)');
   if (!mounted) return <Skeleton />;
   return isDesktop ? <DesktopLayout /> : <MobileLayout />;
   ```
2. **Use CSS instead.** Media-query-based show/hide via Tailwind classes (`md:block hidden`) renders correctly on both server and client without JS.

CSS is almost always the right answer for layout. Reserve hooks for non-layout state.

## Cleanup discipline

Every hook that registers a listener, timer, or subscription **cleans up on unmount and on dependency change**. Without this, you'd accumulate listeners as the component re-renders.

```ts
useEffect(() => {
  window.addEventListener('online', onChange);
  return () => window.removeEventListener('online', onChange);
}, []);
```

The pattern in every hook here: return the cleanup function from the effect. If you write your own hooks, do the same.

## The "stable callback / latest closure" pattern

A common bug: passing a debounced function to an event handler captures the closure at registration time, so it never sees the latest props/state.

Solution: store the latest callback in a ref, invoke `ref.current(...args)` at fire time.

```ts
const callbackRef = useRef(callback);
useEffect(() => { callbackRef.current = callback; }, [callback]);

return (...args) => {
  // Always uses the latest callback.
  callbackRef.current(...args);
};
```

Used by `useDebouncedCallback`, `useThrottledCallback`, `useInterval`, `useTimeout`, `useOnClickOutside`, `useEventListener`. The returned function identity is stable; the behaviour reflects the latest props.

## Interaction with the React Compiler

The FE team's stack uses React 19 + the React Compiler, which auto-memoises most things. The hooks here are written to **work with the compiler, not against it**:

- **No manual `useMemo` / `useCallback`** at the public-API boundary. The compiler handles return-value memoisation.
- **Refs are used where the compiler can't help.** Specifically: latest-callback patterns, mutable counters (`useScrollLock`'s lock count). These need imperative storage; the compiler doesn't replace `useRef`.
- **Internal `useEffect` deps are correct** — even though `eslint-plugin-react-hooks` would catch wrong deps, the compiler relies on accurate deps to avoid over-memoising.

If you write your own hooks following this library's style, you should rarely need `useMemo` or `useCallback`. When you do, it's usually one of:

- Stable identity for a returned function the caller will pass to deps.
- Reference equality for performance in a hot render path.

For both, the compiler will memoise — but the explicit `useCallback` makes the intent visible.

## `useSyncExternalStore` vs `useState + useEffect`

When implementing reactive readings of *external* state (storage, media query, online status), `useSyncExternalStore` is the correct primitive. It's:

- **Concurrent-safe** — works under React's concurrent rendering modes.
- **Tear-resistant** — multiple components reading the same store always see consistent values.
- **Minimal** — three functions: subscribe, getSnapshot, getServerSnapshot.

The `useState + useEffect` pattern works for most cases but is concurrent-unsafe in edge cases (state can lag behind the source). The hooks here use `useSyncExternalStore` where it makes a difference (`useMediaQuery`, `useOnline`) and `useState + useEffect` where it's simpler and the difference doesn't matter (`useLocalStorage`).

## Cross-tab synchronisation

`useLocalStorage` syncs across tabs via the `storage` event. Same-tab updates dispatch a synthetic storage event because the native event only fires in *other* tabs:

```ts
window.localStorage.setItem(key, JSON.stringify(value));
window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(value) }));
```

If two tabs both read/write the same key, both see the latest value. `useSessionStorage` does NOT do this — sessionStorage is intentionally per-tab.

## When NOT to use these hooks

| Need | Use this instead |
|---|---|
| Server-side reading of a cookie / header | `cookies()` / `headers()` from `next/headers` |
| Route-dependent state (current URL, search params) | `usePathname`, `useSearchParams` from `next/navigation` |
| Async data fetching | `useQuery` from TanStack Query |
| Global app state (theme, sidebar) | Zustand store in `common/stores/` |
| Form state | React Hook Form, or React 19 native form |

Don't reach for these hooks when a more specific primitive exists.

## Module-scope state caveat

`useScrollLock` uses module-scope state to count nested locks. This is **intentional** — it allows multiple components to coordinate on the same global resource (body overflow). It's safe because the module is only loaded once per page.

Don't generalise this pattern carelessly. Module state is shared across the entire page; if two unrelated components both use it, they collide. Reserve module state for genuine global resources (body scroll, focus traps, route-blocking).
