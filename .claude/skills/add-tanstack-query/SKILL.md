---
name: add-tanstack-query
description: Adds a TanStack Query hook (query or mutation) for client-side server state. Only use after confirming the use case is NOT an initial page data fetch (that should be RSC) and NOT a one-shot mutation (that should be a Server Action). TanStack Query is for client-reactive needs — polling, optimistic UI spanning components, infinite scroll, refetch-on-interaction.
allowed-tools: Read, Write
---

# Add a TanStack Query hook

TanStack Query lives behind a strict rule in this stack: it's for **client-reactive needs only**, not for initial page data, not for one-shot mutations.

## Where TanStack Query fits — decision table

| Need | Right tool | Why |
|---|---|---|
| Initial page data | **RSC** + `fetch`/`cache()` | Zero client JS, streams as part of the page |
| Refetch after a mutation | **Server Action** + `revalidateTag()` | Server-driven, no client cache to manage |
| Polling for fresh data | **TanStack Query** | `refetchInterval` does it cleanly |
| Optimistic UI across many components | **TanStack Query** | Centralised cache makes optimistic + rollback consistent |
| Infinite scroll / paginated lists | **TanStack Query** | `useInfiniteQuery` handles cursor / page state |
| Refetch on focus / network reconnect | **TanStack Query** | Default behaviour |
| User-triggered refetch (search-as-you-type with debounce) | **TanStack Query** | Cache + dedup |
| Single form submit | **Server Action** | No client cache needed |

If the row above the task isn't TanStack Query, don't use TanStack Query.

## When to use this skill

- One of the rows above maps to TanStack Query.
- The QueryClient provider is already in `src/app/providers.tsx` (added by `scaffold-nextjs-app`). If it isn't, fix that first.

## When NOT to use

- The use case is in a "wrong row" (initial data, simple mutation, etc.).
- The use case doesn't need a cache — a one-off `fetch` is enough.

## Inputs expected

- `kind` — `query` | `infinite-query` | `mutation`.
- `name` — camelCase name of the data being queried/mutated, e.g. `userPosts`, `commentList`, `createPost`.
- `key_parts` — list of values that uniquely identify this query (e.g. `['posts', userId, filter]`).

## Workflow

1. Read `references/query-patterns.md` — the FE team's rules: query keys, cache invalidation, optimistic updates, integration with Server Actions.
2. Pick the right template from `assets/`:
   - `query.ts.template` — for `useQuery`.
   - `mutation.ts.template` — for `useMutation` (with optimistic update).
3. Place it inside the consuming module: `src/modules/<feature>/hooks/<name>.ts`. Queries and mutations are almost always feature-specific. If a module accumulates many query/mutation hooks, split into `src/modules/<feature>/queries/` and `src/modules/<feature>/mutations/` subfolders.
4. Call from a **Client Component only** — TanStack Query hooks require the `QueryClientProvider`, which is set up in `src/app/providers.tsx`.
5. If other modules need this hook (rare), export it through the module's `index.ts`. Most queries stay internal to their module.

## Files in this skill

- `assets/query.ts.template` — `useQuery` hook template.
- `assets/mutation.ts.template` — `useMutation` hook template with optimistic-update scaffolding.
- `references/query-patterns.md` — keys, invalidation, optimistic updates, RSC interplay.
