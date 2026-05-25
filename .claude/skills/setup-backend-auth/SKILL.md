---
name: setup-backend-auth
description: Sets up the FE-only authentication layer that talks to a separate backend API. Installs no third-party auth library — uses Next.js `cookies()`, `jose` for JWT decode, Server Actions for login/logout, and `proxy.ts` for protected routes. Next.js never touches a database. Use this once per project when authentication is needed.
allowed-tools: Read, Write
---

# Set up backend-driven authentication

Wires up everything the frontend needs to authenticate users against a **separate backend API**:

- Session cookie management (HTTP-only, secure, SameSite).
- A typed API client that forwards the access token to backend calls.
- Server Actions for `login`, `logout`, and `refresh`.
- A `proxy.ts` that protects routes before the page renders.
- Helpers to read the current user from RSCs and from Client Components.

This is the **only** auth setup the FE Lead uses. Do not install `next-auth`, `@auth/*`, `@clerk/*`, `better-auth`, or `lucia`.

## When to use

- A project needs authenticated users, and there's a separate backend that issues tokens.
- One-time setup per project — runs once at the start.

## When NOT to use

- The brief explicitly calls for a managed auth provider (Clerk, etc.) — escalate to FE Lead so the locked stack can be reviewed.
- There is no separate backend (Next.js owns the DB) — that violates the locked architecture; escalate.

## Inputs expected

- `backend_base_url_env_var` — the env var holding the backend's base URL. Default: `BACKEND_API_URL`.
- `login_path` — the backend route that accepts credentials. Default: `/auth/login`.
- `refresh_path` — the backend route that exchanges a refresh token for a new access token. Default: `/auth/refresh`.
- `logout_path` — the backend route that invalidates the session server-side. Default: `/auth/logout`.

## Workflow

This skill creates the **auth module** at `src/modules/auth/` plus drops infrastructure into `src/common/services/`. Files split as follows:

| File | Location | Why |
|---|---|---|
| `session.ts` (cookie helpers) | `src/common/services/session.ts` | Cookie management is infrastructure — usable by anything, not auth-specific. |
| `api-client.ts` (HTTP wrapper) | `src/common/services/api-client.ts` | The HTTP layer is used by every module. |
| `auth.ts` (`getCurrentUser` / `requireUser`) | `src/modules/auth/lib/auth.ts` | These are the auth module's domain functions. |
| `login` Server Action | `src/modules/auth/actions/login.ts` | Owned by the auth module. |
| `logout` Server Action | `src/modules/auth/actions/logout.ts` | Owned by the auth module. |
| `proxy.ts` | Project root (`./proxy.ts`) | Next.js requires this at the root. |
| `index.ts` (module barrel) | `src/modules/auth/index.ts` | Public API of the auth module. |

Steps:

1. Read `references/auth-pattern.md` — request flow, trust model, cookie strategy.
2. Read `references/protected-routes.md` — what `proxy.ts` enforces.
3. Read `scaffold-nextjs-app/references/folder-structure.md` — module layout rules.
4. Create directories:
   ```bash
   mkdir -p src/modules/auth/{actions,lib,services,schemas,components,hooks}
   ```
5. Drop in infrastructure (used by many modules):
   - `src/common/services/session.ts` from `assets/session.ts.template`
   - `src/common/services/api-client.ts` from `assets/api-client.ts.template`
6. Drop in auth module files:
   - `src/modules/auth/lib/auth.ts` from `assets/auth.ts.template`
   - `src/modules/auth/actions/login.ts` from `assets/login.action.ts.template`
   - `src/modules/auth/actions/logout.ts` from `assets/logout.action.ts.template`
7. Drop in `proxy.ts` at the **project root** (NOT in `src/`) from `assets/proxy.ts.template`.
8. Create the auth module's public API:
   ```ts
   // src/modules/auth/index.ts
   export { getCurrentUser, requireUser } from './lib/auth';
   export { logout } from './actions/logout';
   export type { User } from './lib/auth';
   ```
   `login` is NOT exported — it's only called from the auth module's own LoginForm component (which will be added later via `add-rhf-form` or `create-server-action`).
9. Tell the FE Lead which routes need protection so the matcher in `proxy.ts` can be updated.

## Output

A working auth layer. The FE Lead can now:
- Build a login form via `create-server-action` (calling the `login` action).
- Read the current user in any RSC: `const user = await getCurrentUser();`
- Read the current user in a Client Component via TanStack Query against the backend's `/me` endpoint, with the access token auto-forwarded by the api-client.
- Protect routes by adding the path to `proxy.ts`'s matcher.

## Files in this skill

- `assets/session.ts.template` — cookie helpers.
- `assets/api-client.ts.template` — fetch wrapper with token injection + refresh.
- `assets/auth.ts.template` — `getCurrentUser()` for RSCs.
- `assets/login.action.ts.template` — login Server Action.
- `assets/logout.action.ts.template` — logout Server Action.
- `assets/proxy.ts.template` — route protection in `proxy.ts`.
- `references/auth-pattern.md` — the full request flow + trust model.
- `references/protected-routes.md` — how the proxy.ts matcher works.
