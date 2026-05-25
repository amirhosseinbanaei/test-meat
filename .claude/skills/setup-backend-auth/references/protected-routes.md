# Protecting routes in `proxy.ts`

`proxy.ts` at the project root decides whether a request can reach a route. Two lists of regex patterns live at the top of the file:

- `PROTECTED_PATTERNS` — paths that require a logged-in user.
- `AUTH_ONLY_PATTERNS` — paths that require a logged-out user (login, signup, forgot-password).

## Adding a protected path

Just append a regex to `PROTECTED_PATTERNS`. Keep the format consistent: `^/<segment>(\/.*)?$`. The optional trailing `(\/.*)?` matches both `/dashboard` and `/dashboard/anything-below`.

```ts
const PROTECTED_PATTERNS: RegExp[] = [
  /^\/dashboard(\/.*)?$/,
  /^\/account(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/billing(\/.*)?$/,    // ← added
];
```

That's it. The proxy runs on every matched request and redirects unauthenticated visits to `/login?next=<original-path>`.

## Adding an auth-only path

Same idea for `AUTH_ONLY_PATTERNS`. These are routes only signed-out users should see — visiting them when logged in redirects to `/`.

```ts
const AUTH_ONLY_PATTERNS: RegExp[] = [
  /^\/login$/,
  /^\/signup$/,
  /^\/forgot-password$/,
  /^\/reset-password$/,    // ← added
];
```

## The matcher

The `config.matcher` at the bottom of `proxy.ts` controls which requests run through the proxy *at all*. By default it excludes static assets and Next.js internals so the proxy doesn't waste time on `/favicon.ico` or `/_next/static/...`.

Don't change the matcher unless you have a clear reason. If you do, **always exclude** `/_next/static`, `/_next/image`, and common static file extensions — otherwise every CSS/JS/font request runs through your proxy.

## What proxy.ts does NOT do

- **It does not verify the JWT.** It only checks whether the cookie is present. A valid-looking cookie with an expired token will be let through here; the backend will reject the eventual API call with 401, and the api-client will refresh or clear.
- **It does not authorize.** It doesn't know if the user has access to the resource they're requesting — only whether they're signed in.
- **It does not run for prefetches in all cases.** Prefetched pages can hit the proxy with subtly different request semantics (no body, GET only). Don't rely on side effects.

## What runs where — the full picture

| Layer | What it does | Cost |
|---|---|---|
| `proxy.ts` | Cheap presence check on the cookie. Redirect. | Runs on every request. Keep it light. |
| `getCurrentUser()` in RSC | Calls `/me` on the backend. The backend verifies the token. | One backend round-trip per render. `cache()` dedupes within a render. |
| Server Action | Calls the relevant backend endpoint with the token. | One backend round-trip per action call. |
| Backend | Verifies token, performs authorisation, executes business logic. | The source of truth. |

The browser → Next.js → backend chain means there are at most two RTTs per page: one for the static HTML, one for the backend call. With RSC streaming, even the backend call is part of the initial response.
