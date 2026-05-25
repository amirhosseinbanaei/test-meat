# Zod validation in Server Actions

Every Server Action validates its input with Zod. The form on the client may have already validated; the server **must** re-validate. The form is UX; the server is correctness.

## The trust boundary

A `FormData` payload — or a JSON body to a Route Handler — is hostile input until proven otherwise. Anyone with the action's URL can post anything to it, including from `curl`, a malicious site, or a tampered client. The Zod schema in the action is the line between "untrusted bytes" and "typed input we'll act on".

```
   Client (untrusted)                          Server (trusted)
 ┌─────────────────────┐    formData ───►    ┌─────────────────────────┐
 │  RHF + Zod          │                     │  Server Action          │
 │  validates for UX   │                     │  schema.safeParse(…)    │
 └─────────────────────┘                     │  ↑ trust boundary       │
                                             │  → input typed object   │
                                             │  → mutation             │
                                             └─────────────────────────┘
```

Even if RHF validated 30 milliseconds ago, the server doesn't trust the network in between. `safeParse` is non-negotiable.

## Sharing the schema between form and action

When the same schema applies on both sides (the usual case), put it in `src/schemas/<name>.ts` and import from both. One source of truth.

```ts
// src/schemas/create-comment.ts
import { z } from 'zod';

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
```

```ts
// src/actions/create-comment.ts
import { createCommentSchema } from '@/schemas/create-comment';

// schema imported, used for safeParse.
```

```tsx
// src/components/forms/comment-form.tsx
import { createCommentSchema } from '@/schemas/create-comment';
// resolver uses the same schema.
```

When the server needs *more* validation than the client (e.g. checking for uniqueness), extend the base schema server-side rather than maintain a second one:

```ts
import { createCommentSchema } from '@/schemas/create-comment';
const serverSchema = createCommentSchema.extend({
  // server-only refinements
});
```

## `safeParse` vs `parse`

- `safeParse` returns `{ success: true, data }` or `{ success: false, error }` — **never throws**. Use this in Server Actions. Validation failures are *expected* and need to be returned to the form, not surfaced through the error boundary.
- `parse` throws on failure. Use this only when a failure genuinely is unexpected (e.g. parsing the backend's `/me` response — if that ever fails, something is wrong at the system level).

## Mapping Zod issues to field errors

The action returns `fieldErrors` so the form can show messages next to the right fields. The pattern in the template:

```ts
const fieldErrors: Record<string, string> = {};
for (const issue of parsed.error.issues) {
  const key = issue.path[0];
  if (typeof key === 'string' && !(key in fieldErrors)) {
    fieldErrors[key] = issue.message;
  }
}
return { ok: false, error: 'Please correct the highlighted fields.', fieldErrors };
```

- `issue.path[0]` is the top-level field name (matches the form input `name`).
- We only keep the *first* message per field. Most users only want one error per input.
- The top-level `error` is a summary the form can show at the top — "Please correct the highlighted fields", or whatever copy fits.

This shape — `{ ok, error, fieldErrors? }` — is the same shape the RHF form's `setError` consumes. Same shape for simple-form errors and complex-form errors keeps the form layer uniform.

## Coercing types from FormData

`FormData` returns strings (and Files). For non-string fields, use Zod's coercion or transformations:

```ts
const schema = z.object({
  postId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  isPublic: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
});
```

- `z.coerce.number()` does `Number(value)` first, then validates.
- `z.preprocess` lets you map the raw value before validation — useful for checkboxes (which come in as `'on'` or absent), comma-separated arrays, etc.

For multi-value fields (multiple `<input name="tag" />` or `<select multiple>`), use `formData.getAll('tag')` to get an array instead of `Object.fromEntries`.

## Don't validate twice for no reason

Zod is fast, but parsing on the client *and* the server for a 50-field form is wasted work if the schema is the same. The pattern is:

- Client: `zodResolver(schema)` validates on blur. Cheap incremental work as the user types.
- Server: `schema.safeParse(...)` validates once at submit. The boundary check.

You're not validating each field twice on the server — Zod's a single `safeParse` call covering the whole shape.

## What's NOT in the schema

- **Database existence checks** (does this user own this post?). That's authorisation, not validation. Do it after `safeParse` succeeds, before the mutation.
- **Uniqueness checks** (is this email taken?). The schema describes *shape*; uniqueness is a *backend* check that returns a specific error code we then surface as a field error.
- **Business rules that depend on state** (can this user still cancel this order?). Same as above — check after schema validation.

The schema validates shape and basic constraints. Everything stateful happens after.
