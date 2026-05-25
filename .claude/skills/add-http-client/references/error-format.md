# The standard error format

Every failed HTTP request in the project throws an `HttpError` with exactly this shape:

```ts
{
  message: string;        // user-facing, ready to display
  details: T;             // structured server body (parsed JSON or raw text)
  data?: K;               // partial data the server returned with the error (rare)
  status: number;         // HTTP status; 0 for network/timeout/abort failures
  isOk: false;            // always false on errors — kept for shape uniformity
}
```

The shape is **static** — these five fields, in this order, for every error, for every endpoint, for every retry, for every helper. Anything else lives inside `details`.

## Why `isOk: false`?

If you ever want to handle an error WITHOUT throwing (e.g. return it as a Result), `isOk` discriminates errors from successes when both follow the same shape. We default to throwing — but the field is reserved so the shape never changes if the team adopts a Result-returning helper later.

## Why a class, not just an object?

A class gives:

- **`instanceof` checks.** `if (err instanceof HttpError)` is faster and safer than duck-typing.
- **Stack traces.** Inherited from `Error`.
- **`toString()`.** Logs nicely without extra work.
- **Subclass-ability.** A future `BackendApiError` could extend `HttpError` and add backend-specific fields without breaking the public contract.

## The thrown vs. caught contract

| Function | On success | On failure |
|---|---|---|
| `http<T>(url, opts)` | Returns parsed `T` | Throws `HttpError` |
| `postJson<T>` / `getJson<T>` (api-client) | Returns parsed `T` | Throws `HttpError` (or subclass) |
| Server Action | Returns `{ ok: true, data }` or `{ ok: false, error, fieldErrors? }` | Should NOT throw on validation failures (return `ok: false`). Throws are for unexpected bugs — they hit `error.tsx`. |

The Server Action's return shape and `HttpError` are deliberately different. Server Actions own the form-submission contract; `http` owns the network contract. Both reach the user, but through different channels.

## When to throw, when to return

| Situation | Throw or return? |
|---|---|
| Network failure | Throw `HttpError` (the http() function does this) |
| 4xx / 5xx from backend | Throw `HttpError` (http() does this) |
| Zod validation failure inside a Server Action | **Return** `{ ok: false, fieldErrors }` |
| Authorisation failure in a Server Action | Return `{ ok: false, error: 'You don't have permission' }` |
| Internal invariant violation (a bug) | Throw a plain Error — error boundary catches it |
| User cancelled the request | Throw `HttpError` with `status: 0` and `details.cause === 'aborted'` |

The rule: **expected failures return; unexpected failures throw**. `HttpError` is "expected" because the API can always fail — but the throw is the natural propagation mechanism for it.

## Reading the error

```ts
import { HttpError } from '@/common/services/http-types';
import { handleApiError, isHttpStatus, extractFieldErrors } from '@/common/services/handle-error';

try {
  await http('/api/users/42');
} catch (err) {
  // Quick checks
  if (isHttpStatus(err, 404)) return; // Silently ignore — user navigated away
  if (isHttpStatus(err, [401, 403])) router.push('/login');

  // For validation failures
  const fieldErrors = extractFieldErrors(err);
  if (fieldErrors) {
    // Map to form fields
  }

  // Everything else — display
  const { message } = handleApiError(err);
  toast.error(message);
}
```

## The `details` field is generic — make use of it

When the backend returns structured error info, type it:

```ts
type ConflictDetails = { conflictingId: string; conflictingType: 'order' | 'invoice' };

try {
  await http<Order>('/api/orders', { method: 'POST', json: payload });
} catch (err) {
  if (err instanceof HttpError && err.status === 409) {
    const details = err.details as ConflictDetails;
    // details.conflictingId, details.conflictingType — typed
  }
}
```

If you find yourself doing this in many places, define a typed `HttpError` subclass per error shape and have the api-client narrow types itself.

## Don't display `err.message` directly

It's tempting to write `toast.error(err.message)`. Don't — always go through `handleApiError`. Three reasons:

1. **The error might not be an HttpError.** A plain `Error` from a JS bug shouldn't surface raw to the user.
2. **`handleApiError` lets you override.** Per-call custom messages live there, not at the throw site.
3. **`handleApiError` can log to Sentry.** Centralised reporting hooks into one place.

## When the message isn't right for your context

```ts
const { message } = handleApiError(err, "We couldn't save your changes. Try again.");
```

The custom message wins regardless of the underlying error. Use this when:

- The default per-status message is too generic for this action.
- The action is high-stakes and deserves a more specific phrase.
- You're translating the error into the user's vocabulary ("save" vs. "POST").

When the custom message is short and the status varies, you might prefer the auto-message — pass `undefined` and let the handler decide.
