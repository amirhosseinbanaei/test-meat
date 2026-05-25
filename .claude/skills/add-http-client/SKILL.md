---
name: add-http-client
description: Sets up the FE team's standard HTTP client primitives — a `http<T>()` function wrapping native fetch with configurable retry, timeout, abort, and standardized error throwing; the `HttpError` class with the team's static error shape; and `handleApiError()` for normalizing any thrown error into a uniform display object. Drops three files into `src/common/services/`. Run once per project.
allowed-tools: Read, Write
---

# Set up the HTTP client

Adds three foundational files to `src/common/services/`:

| File | Purpose |
|---|---|
| `http-types.ts` | `HttpError` class + `RequestOptions` type. The team's standard error shape: `{ message, details, data?, status, isOk: false }`. |
| `http.ts` | `http<T>(url, options)` — enhanced fetch with retry, timeout, error normalization, custom messages. |
| `handle-error.ts` | `handleApiError(error, customMessage?)` — global handler that normalizes any thrown error into `{ message, status, details }`. |

After this skill runs, every HTTP call in the project either uses `http()` directly (for arbitrary URLs) or `api-client` (from `setup-backend-auth`, for our backend with auth). Both throw the same `HttpError`, so the rest of the app handles errors uniformly.

## When to use

- Once per project, immediately after `scaffold-nextjs-app`.
- Before `setup-backend-auth` if both are needed in the same project (the api-client can use `http()` internally; see references).

## When NOT to use

- Project doesn't make HTTP calls at all (pure static site). Skip.

## Inputs expected

- `default_timeout_ms` — default request timeout. Default: `30000`.
- `default_retries` — default retry count for failed requests. Default: `0` (opt-in per call).
- `default_retry_delay_ms` — base delay between retries (doubled with each attempt). Default: `1000`.

## Workflow

1. Read `references/error-format.md` — the standard error shape, when to throw, what `handleApiError` returns.
2. Read `references/retry-and-timeout.md` — retry semantics, backoff strategy, which statuses retry by default.
3. Read `references/custom-messages.md` — how to override error messages per call vs. globally.
4. Drop the three files into `src/common/services/`:
   - `assets/http-types.ts.template` → `src/common/services/http-types.ts`
   - `assets/http.ts.template` → `src/common/services/http.ts`
   - `assets/handle-error.ts.template` → `src/common/services/handle-error.ts`
5. (Optional) If `setup-backend-auth` has already run, refactor `api-client.ts` to use `http()` underneath. The external API of the api-client stays the same; the body shrinks. See `references/api-client-integration.md`.

## Usage at a glance

```ts
import { http } from '@/common/services/http';

// Simple GET
const user = await http<User>('https://api.example.com/users/42');

// With retry + timeout + custom messages
const data = await http<Order[]>('https://api.example.com/orders', {
  retries: 3,
  timeout: 10_000,
  errorMessages: {
    404: 'No orders found.',
    500: 'The orders service is temporarily unavailable.',
    timeout: 'Loading orders is taking longer than expected.',
    network: 'Check your internet connection.',
  },
});

// Catching the error
import { handleApiError } from '@/common/services/handle-error';

try {
  await http('/api/something');
} catch (err) {
  const { message, status } = handleApiError(err);
  toast.error(message);
}

// Override the message at handle-time
try {
  await deleteUser(id);
} catch (err) {
  const { message } = handleApiError(err, "We couldn't delete this user. Try again.");
}
```

## Files in this skill

- `assets/http-types.ts.template` — `HttpError` class + `RequestOptions` type.
- `assets/http.ts.template` — the `http<T>()` function.
- `assets/handle-error.ts.template` — `handleApiError()`.
- `references/error-format.md` — the standard error shape and when to throw.
- `references/retry-and-timeout.md` — retry semantics + abort + timeout.
- `references/custom-messages.md` — per-call vs global error message overrides.
- `references/api-client-integration.md` — how to wire `http()` into `setup-backend-auth`'s api-client.
