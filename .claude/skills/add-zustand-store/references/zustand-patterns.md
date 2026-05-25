# Zustand patterns

A short guide to the FE team's Zustand conventions. The library is tiny on purpose — these rules are about *how* we use it, not how it works.

## The selector rule

**Always read from the store via a selector function.** Not via destructuring.

```tsx
// ❌ — subscribes to the WHOLE store. Any change to any field re-renders this component.
const { open, toggle } = useSidebarStore();

// ✅ — subscribes only to `open`. Toggling unrelated fields doesn't re-render.
const open = useSidebarStore((s) => s.open);
const toggle = useSidebarStore((s) => s.toggle);
```

The selector creates a fine-grained subscription. Zustand re-renders the component only when the selected slice changes (by reference).

If you need multiple values at once, use the `useShallow` helper:

```tsx
import { useShallow } from 'zustand/shallow';

const { open, mobileOpen } = useSidebarStore(
  useShallow((s) => ({ open: s.open, mobileOpen: s.mobileOpen })),
);
```

Without `useShallow`, returning an object literal from the selector creates a new reference every render and you re-render every time anyway.

## Actions are stable

Functions set inside `create((set, get) => ({ … }))` are created once and never replaced. Passing them down to children, into effects, or as event handlers is fine. The React Compiler doesn't memoise them because it doesn't need to — they're already stable.

## No immer by default

Plain `set({ ... })` and `set((state) => ({ … }))` are enough for the shapes Zustand stores should have. If a store gets nested enough to *need* immer, that's a smell — split it into smaller stores, or move it server-side.

## When to split into multiple stores

One store per concern is the right granularity. Don't make a "global app store" with twenty fields. A `useSidebarStore` and a `useThemeStore` and a `useCommandPaletteStore` are clearer, easier to type, and have smaller re-render impact than one mega-store.

## Persistence

To persist state across reloads (theme, last-used filter), wrap with `persist`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist<ThemeState>(
    (set) => ({
      mode: 'light',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'theme' }, // localStorage key
  ),
);
```

Two gotchas:

1. **Hydration mismatch.** The server renders with the default state; the client hydrates with the persisted state. If they differ, React will warn. For theme specifically, this is fine — read from localStorage on the client and let the warning happen, or render only after mount. Don't try to read localStorage during render.
2. **Avoid persisting derived state.** Persist the inputs; re-derive on read.

## Server Components and Zustand

Zustand stores are client-only. Don't import them from a Server Component. If a Server Component needs to read state that's in a store, the answer is almost always "lift the data to the server" — pass it from the server, not the store. Stores are for state that *originates* on the client.

## When the answer isn't Zustand

| The state is… | The right tool |
|---|---|
| Form data being typed | React Hook Form / `useActionState` |
| Server data (lists, paginated, refetchable) | TanStack Query |
| Local to one component | `useState` / `useReducer` |
| Theme / sidebar / command palette | **Zustand** |
| URL-derived (filters, tabs visible) | `searchParams` + Next.js router |
| Across pages, persists across reloads | Zustand + `persist` middleware |

Most "I need a global store" reflexes turn out to be one of the first three rows in disguise.
