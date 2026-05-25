# The FE-only auth pattern

This is the only auth pattern the FE Lead uses. The rule above everything else: **Next.js never touches a database**. The separate backend owns users, sessions, and credential storage. Next.js only holds short-lived cookies and forwards calls.

## Trust model

```
┌─────────────────────┐  HTTPS  ┌───────────────────────┐
│  Browser            │ ──────► │  Next.js (this app)   │
│  cookies attached   │         │  - cookies()          │
│  automatically      │ ◄────── │  - Server Actions     │
└─────────────────────┘         │  - Server Components  │
                                └──────────┬────────────┘
                                           │  Authorization: Bearer …
                                           │  attached by api-client
                                           ▼
                                ┌───────────────────────┐
                                │  Backend API          │
                                │  (separate service)   │
                                │  - DB                 │
                                │  - issues JWTs        │
                                │  - validates tokens   │
                                └───────────────────────┘
```

The browser only ever talks to Next.js. Next.js holds the tokens in HTTP-only cookies and forwards backend calls. The backend is the source of truth for *who* the user is and *what* they can do.

Authorisation decisions (can this user view that page? edit that resource?) are made by the backend, not by Next.js. Next.js's "auth checks" are UX only — they redirect to `/login` if the access token cookie is missing, but they don't decide what a logged-in user is allowed to do.

## Cookies

| Cookie | Lifetime | Purpose |
|---|---|---|
| `access_token` | Short (e.g. 15 min) | Sent as `Authorization: Bearer …` on every backend call. |
| `refresh_token` | Long (e.g. 30 days) | Used by the refresh flow to get a new access token. |

Both cookies are:

- **HttpOnly** — JavaScript can't read them. XSS can't exfiltrate them.
- **Secure** — only sent over HTTPS in production.
- **SameSite=Lax** — blocks CSRF on cross-site state-changing requests while still working for top-level navigation. Tighten to `Strict` if the backend allows.
- **Path `/`** — available across the app.

## Request flow

### Login

1. User submits the login form. The form action is the `login` Server Action.
2. The action validates the input with Zod and calls `POST /auth/login` on the backend (unauthenticated request).
3. Backend returns `{ accessToken, refreshToken, expiresAt }`.
4. The action calls `setSession(...)` from `lib/session.ts` to set both cookies as HttpOnly.
5. The action calls `redirect()` (which throws internally — never wrap in try/catch).

### Server-side data fetch (RSC)

1. RSC calls `getJson('/some/path')` from `lib/api-client.ts`.
2. The client reads the `access_token` cookie and adds `Authorization: Bearer …`.
3. Calls the backend; returns the response.
4. If the backend returns 401, the client tries ONE refresh:
   - Reads `refresh_token`, POSTs to `/auth/refresh`.
   - If success, the new tokens are stored and the original request is retried once.
   - If failure, the cookies are cleared and the 401 propagates.

### Client Component data fetch (TanStack Query)

Two valid approaches:

- **Preferred:** the Client Component calls a Server Action that wraps the backend call. The Server Action is the one calling the api-client, so cookies and refresh just work. This keeps the access token out of any client-facing endpoint.
- **Alternative:** expose a thin Route Handler (`route.ts`) that proxies the request to the backend, attaching the cookie token. The Client Component calls that handler. Use when you need streaming or non-action HTTP semantics.

Never call the backend directly from a Client Component — the access token is HttpOnly and not readable from JS.

### Logout

1. User clicks Sign Out. The action is the `logout` Server Action.
2. The action calls `POST /auth/logout` on the backend (best-effort).
3. The action calls `clearSession()` to delete both cookies.
4. The action redirects to `/login`.

### `proxy.ts` route protection

Runs before every matched request. Reads the `access_token` cookie (presence only — does not verify the JWT) and either redirects unauthenticated users away from protected routes or redirects authenticated users away from auth-only routes (`/login`, `/signup`).

This is **UX**, not security. A request to a protected backend endpoint will be denied by the backend even if `proxy.ts` somehow lets the page render.

## Why not Auth.js / Clerk / Better Auth?

- We have a separate backend that **already** issues JWTs and owns users. Those libraries duplicate that — they want to own the user table, the session storage, sometimes the credential hashing.
- Adding a second source of truth for "who is this user" is a long-term liability.
- The pattern here is ~150 lines of code we fully understand, with no provider, no dependency on a library that might change its API, no extra database table.

When *would* you reach for one? Only if the separate backend doesn't exist (architecture pivot) or the project explicitly outsources auth. Both require escalation to the FE Lead.

## Why `jose` and not `jsonwebtoken`?

`jose` is the modern, runtime-agnostic JWT library. It works on the Node.js runtime, the Edge runtime, and in browsers. We use it only for `decodeJwt(token)` to peek at the `exp` claim when computing cookie max-age — we **don't** verify signatures in the frontend. Signature verification is the backend's job.

## What's NOT in this layer

- **No user table, no password hashing.** That lives on the backend.
- **No OAuth providers.** If you need "Sign in with Google", the backend handles the OAuth dance and gives us the same JWT pair at the end. The FE just calls a different endpoint to kick it off.
- **No magic links / passkeys.** Same — backend owns the flow, FE displays the form.
