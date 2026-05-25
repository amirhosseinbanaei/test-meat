# TanStack Query patterns

The FE team's rules for using TanStack Query inside the locked stack.

## Query keys

Keys are arrays. The first element is a stable string identifying the resource. Following elements parameterise it. Be deterministic — same inputs, same key.

```ts
queryKey: ['posts']                          // all posts
queryKey: ['posts', userId]                  // posts by user
queryKey: ['posts', userId, { sort: 'new' }] // posts by user, sorted
```

The shape of the key is also the shape of cache invalidation: invalidating `['posts']` invalidates every query whose key *starts with* `'posts'`. Invalidating `['posts', userId]` invalidates only that user's posts. Plan the key hierarchy with invalidation in mind.

## What goes through TanStack Query — the rule

TanStack Query is for **client-reactive** server state. Not for the initial page paint. If the data is needed when the page first renders, fetch it in an RSC and pass it down — the client gets the data as part of the HTML, no client-side fetch round-trip, no flash of loading state.

| Right side | TanStack Query is right because… |
|---|---|
| Live updates with `refetchInterval` | The cache + polling are central to the use case. |
| Optimistic UI across many components | The shared cache keeps all subscribers consistent on rollback. |
| Infinite scroll | `useInfiniteQuery` manages page state + dedup. |
| Search-as-you-type with debounce | Cache keyed by query string + dedup of concurrent searches. |
| User-triggered refetch (refresh button) | `refetch()` exposed by the hook. |

| Wrong side | Use this instead |
|---|---|
| Initial page data | RSC `fetch` + `cache()` |
| Mutation followed by full refetch | Server Action + `revalidateTag()` |
| One-shot read on click | Plain `fetch` is fine |
| Form state | React Hook Form / `useActionState` |

## Mutations and cache invalidation

Three jobs in a typical mutation:

1. Perform the mutation (`mutationFn`).
2. Update or invalidate affected queries.
3. (Optional) Optimistic update + rollback on error.

The simplest pattern — invalidate on success:

```ts
useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

Invalidation marks the queries stale and triggers a refetch on the next read. That's usually what you want.

## Optimistic updates

The pattern: snapshot the previous data, write the optimistic value, roll back on error, re-sync on settle.

```ts
useMutation({
  mutationFn: addComment,
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: ['comments', postId] });
    const previous = queryClient.getQueryData<Comment[]>(['comments', postId]);
    queryClient.setQueryData<Comment[]>(['comments', postId], (old) => [
      ...(old ?? []),
      { id: crypto.randomUUID(), ...input, pending: true },
    ]);
    return { previous };
  },
  onError: (_err, _input, ctx) => {
    if (ctx?.previous !== undefined) {
      queryClient.setQueryData(['comments', postId], ctx.previous);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['comments', postId] });
  },
});
```

`cancelQueries` stops any in-flight refetch from clobbering the optimistic state.
`onSettled` runs on success and error — guarantees the cache eventually converges with the server.

When in doubt, prefer React 19's `useOptimistic` for **local** optimistic UI and TanStack Query's pattern for **shared** optimistic state across many components.

## Talking to the separate backend from the client

The client doesn't talk to the backend directly — the access token is HttpOnly and can't be added to a fetch from the browser. Two options:

1. **Preferred: call a Server Action from the mutation's `mutationFn`.** The Server Action handles auth (cookies + token forwarding) and returns the result.
2. **Route Handler:** expose `route.ts` that proxies a single backend endpoint, attaches the cookie token, returns the response. The client fetches the Route Handler. Use when you need streaming responses or non-action HTTP semantics.

Never inline the backend URL in a Client Component's `fetch` — it can't authenticate.

## Default config

The provider in `src/app/providers.tsx` sets sensible defaults:

```ts
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,        // 1 minute
    refetchOnWindowFocus: false, // mostly noise in our apps
    retry: 1,
  },
}
```

Override per-query when the data has a different freshness profile (e.g. `staleTime: 0` for live chat, `staleTime: 5 * 60 * 1000` for a slow-changing list).

## Devtools

`<ReactQueryDevtools>` is mounted by the providers file **only** when `NODE_ENV === 'development'`. Don't import or render it elsewhere — it would ship to production.

## Things to NOT do

- Don't read from the cache imperatively to drive render (`queryClient.getQueryData(...)` inside a render function). Use `useQuery` so the component subscribes correctly.
- Don't use TanStack Query to store client-only state (filters, UI state). Use Zustand or component state.
- Don't have two queries for the same resource with different keys — they'll get out of sync.
- Don't `refetchOnMount: 'always'` as a default — it defeats the cache.
