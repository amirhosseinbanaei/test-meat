# Server Actions in Next.js 16

A Server Action is an async function that runs on the server but is callable directly from a Client Component, with no HTTP route in between. Under the hood Next.js still does an HTTP round-trip — but you don't write the endpoint, the framing, or the deserialisation. You write a function and a `<form action={fn}>`.

## How to declare one

Two ways:

```ts
// File-level — every export in this file is a Server Action.
'use server';

export async function createComment(prev: State, formData: FormData) { /* … */ }
```

```tsx
// Inline — the function itself is the action.
export default function Page() {
  async function createComment(formData: FormData) {
    'use server';
    // …
  }

  return <form action={createComment}>{/* … */}</form>;
}
```

The file-level form is the one this skill generates. It keeps the action testable in isolation.

## How a Client Component calls it

```tsx
'use client';
import { useActionState } from 'react';
import { createComment } from '@/actions/create-comment';

const [state, formAction] = useActionState(createComment, null);

return <form action={formAction}>{/* fields */}</form>;
```

The `action` prop on `<form>` accepts a Server Action directly. Submitting the form serialises the `FormData`, sends it to the server, runs the action, and returns the result to the client as the next `state` value.

## The trust boundary

A Server Action is a public, network-exposed endpoint. Treat it as such:

- **Validate every input.** `FormData.get(...)` returns `FormDataEntryValue | null` — narrow it before using.
- **Authorise.** A Server Action does not inherit session checks from anywhere. Do the auth check inside the action.
- **Never trust hidden fields.** A user can send any value for any field. "Hidden" doesn't mean "trusted".
- **Rate limit.** Same as any public endpoint.

`security-lead` should review every action that touches sensitive data.

## Return shape — use a discriminated union

Throwing from a Server Action for an expected failure (e.g. validation) is a bad pattern: the throw goes through the segment's `error.tsx` boundary and the user loses their form input.

Instead, return a discriminated union:

```ts
type Result =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
```

Throws are reserved for *unexpected* errors (DB down, third party 500). Those *should* surface in `error.tsx`.

## Revalidating cached data after a mutation

After a successful write, anything cached based on the data you just changed is stale. Two tools:

### `revalidateTag(tag, cacheLifeProfile)`

Invalidate all cache entries tagged with `tag`. The second argument — the **cacheLife profile** — is mandatory in Next.js 16. The single-argument call from earlier versions produces a TypeScript error.

```ts
import { revalidateTag } from 'next/cache';

revalidateTag('comments', 'default');
```

### `updateTag(tag, value)` (new in Next.js 16)

When you can compute the new cached value directly, `updateTag` lets you push the new value into the cache without re-fetching. Use this when the action already produced the freshest version of the data — it's cheaper than `revalidateTag`.

### `redirect(...)`

For navigations after a successful write, call `redirect('/next/page')` from `next/navigation`. It throws internally — never wrap it in a try/catch. The throw is how Next.js signals the navigation.

## What to use instead of API routes

Anywhere your frontend was previously calling `fetch('/api/something', { method: 'POST', body })`, use a Server Action instead. It's:

- **Type-safe end to end** — TypeScript follows the function signature across the boundary.
- **Smaller bundle** — no client-side fetch wrapper or response parser to ship.
- **Cache-aware** — `revalidateTag`, `revalidatePath`, and `updateTag` work inline.
- **Closure-bindable** — actions can close over server-only values (DB clients, secrets) without exposing them.

Use Route Handlers (`route.ts`) only when something *other than your own frontend* needs to call the endpoint — webhooks, mobile apps, server-to-server callers.
