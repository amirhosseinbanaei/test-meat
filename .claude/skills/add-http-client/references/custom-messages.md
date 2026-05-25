# Custom error messages

Two layers of customisation, in priority order from most specific to least:

1. **Per-call** — `errorMessages` option on the `http()` call.
2. **Backend-returned** — the response body's `message` field, if present.
3. **Defaults** — built into `HttpError.fromResponse` per status code.

The `handleApiError()` function adds a fourth layer on top:

4. **Per-handler** — a custom message passed to `handleApiError(err, customMessage)` overrides whatever was thrown.

## Per-call: `errorMessages`

Pass a map of status codes (or causes) to messages:

```ts
await http<Order>(`/api/orders/${id}`, {
  errorMessages: {
    404: "We couldn't find that order. It may have been cancelled.",
    403: "You don't have access to this order.",
    500: 'The orders service is having trouble. Please try again shortly.',
    timeout: 'Loading the order is taking longer than expected.',
    network: 'Check your internet connection and try again.',
    default: 'Something went wrong loading the order.',
  },
});
```

The map keys can be:

| Key | When it applies |
|---|---|
| A number (e.g. `404`) | Status code matches exactly |
| `'timeout'` | Request timed out (status `0`, cause `'timeout'`) |
| `'network'` | Network error (status `0`, cause `'network'`) |
| `'aborted'` | External cancellation (status `0`, cause `'aborted'`) |
| `'default'` | Catch-all fallback |

You only need to define what's different from the defaults. Anything you skip falls through to the next priority.

## Backend-returned message

If the response body is JSON and includes a `message` field, that's used **after** per-call but **before** defaults:

```json
// Server response on 422:
{
  "message": "Email is already registered.",
  "errors": {
    "email": "This email is already taken."
  }
}
```

The thrown `HttpError.message` will be `"Email is already registered."` — unless `errorMessages[422]` was set.

The convention to look for `body.message` follows what most JSON APIs do (Stripe, GitHub, your typical NestJS / Express backend). If your backend uses a different field, customise `HttpError.fromResponse` in `http-types.ts`.

## Defaults per status

Built into `defaultMessageForStatus()` in `http-types.ts`:

| Status | Default message |
|---|---|
| 400 | "The request was invalid." |
| 401 | "You need to sign in to continue." |
| 403 | "You don't have permission to do that." |
| 404 | "We couldn't find what you were looking for." |
| 409 | "This conflicts with another change. Please refresh and try again." |
| 422 | "The submission has validation errors." |
| 429 | "You're going a bit fast. Please wait a moment." |
| 5xx | "The server is having trouble right now. Please try again." |
| Other | "Request failed with status NNN." |

Edit these directly when the team's voice / vocabulary requires it. Same file, same approach.

## Per-handler override at the call site

The most flexible layer — applied when handling the error, not when throwing it:

```ts
try {
  await deleteUser(id);
} catch (err) {
  const { message } = handleApiError(
    err,
    "We couldn't delete this user. They may have already been removed.",
  );
  toast.error(message);
}
```

When `customMessage` is passed to `handleApiError`, it wins over everything else. This is what you'd use for action-specific phrasing — "delete this user" is more meaningful than the generic per-status messages.

## When to put messages where

| Where | When |
|---|---|
| Per-call `errorMessages` | The endpoint has its own vocabulary and you reuse it across components. Define once with the fetcher. |
| Backend `body.message` | The backend already returns good messages and you trust them. Default in most projects. |
| Default per-status | Generic CRUD where the per-status default is fine. |
| `handleApiError` custom | The action has a specific user-facing phrase that doesn't match the per-status default. |

## i18n

If the project uses `next-intl`, your error messages should come from translation keys, not hardcoded strings:

```ts
import { useTranslations } from 'next-intl';

const t = useTranslations('errors');

await http<User>('/api/users', {
  errorMessages: {
    404: t('userNotFound'),
    500: t('userServerError'),
    default: t('genericError'),
  },
});
```

Don't put translation logic inside `HttpError` itself — that couples a service-layer file to React/i18n. Keep the translation at the call site (in components and hooks) where the `useTranslations` hook is available.

For non-React contexts (Server Actions, plain modules), use `getTranslations` from `next-intl/server`.

## Don't put HTML or React in messages

Messages are strings. If you need formatted error content (clickable links, formatted lists), that's a UI concern, not a message concern. The message is the headline; the UI decides how to present the rest.

Example: rendering a list of validation errors:

```tsx
{handled.isHttpError && (
  <Alert variant="destructive">
    <AlertTitle>{handled.message}</AlertTitle>
    {fieldErrors && (
      <AlertDescription>
        <ul>
          {Object.entries(fieldErrors).map(([f, m]) => (
            <li key={f}>{f}: {m}</li>
          ))}
        </ul>
      </AlertDescription>
    )}
  </Alert>
)}
```

The headline is one string. The details get UI treatment.
