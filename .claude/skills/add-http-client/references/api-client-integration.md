# Integrating `http()` with `setup-backend-auth`'s api-client

The two HTTP entry points in the project are:

- **`http()`** in `common/services/http.ts` — generic, for any URL.
- **`backendFetch()` / `postJson()` / `getJson()`** in `common/services/api-client.ts` — for our separate backend, with auth + refresh.

Both throw `HttpError`. The api-client adds the backend-specific concerns. By default each is implemented independently — fine on day one. As the project matures, the api-client should delegate to `http()` underneath so both share retry, timeout, and abort-merging logic.

## The refactor

In `setup-backend-auth`'s default template, `api-client.ts` calls `fetch` directly. The drop-in upgrade: route everything through `http()`.

### Before

```ts
// common/services/api-client.ts
export async function backendFetch(path: string, opts: RequestOptions = {}): Promise<Response> {
  const url = new URL(path, env.BACKEND_API_URL).toString();
  // … headers, token attach …
  const res = await fetch(url, { ...opts, headers, body });
  if (res.status === 401 && !opts.noRefresh && !opts.unauthenticated) {
    // … refresh flow …
  }
  return res;
}
```

### After

```ts
// common/services/api-client.ts
import 'server-only';
import { http } from './http';
import { HttpError, type RequestOptions as HttpRequestOptions } from './http-types';
import { env } from '@/common/lib/env';
import { getAccessToken, getRefreshToken, setSession, clearSession } from './session';

type BackendRequestOptions = HttpRequestOptions & {
  unauthenticated?: boolean;
  noRefresh?: boolean;
};

export class BackendApiError extends HttpError {
  readonly name = 'BackendApiError';
}

export async function getJson<T = unknown>(path: string, opts: BackendRequestOptions = {}): Promise<T> {
  return backendCall<T>(path, { ...opts, method: 'GET' });
}

export async function postJson<T = unknown>(path: string, json: unknown, opts: BackendRequestOptions = {}): Promise<T> {
  return backendCall<T>(path, { ...opts, method: 'POST', json });
}

async function backendCall<T>(path: string, opts: BackendRequestOptions): Promise<T> {
  const url = new URL(path, env.BACKEND_API_URL).toString();
  const headers = new Headers(opts.headers ?? {});

  if (!opts.unauthenticated) {
    const token = await getAccessToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
  }

  try {
    return await http<T>(url, { ...opts, headers });
  } catch (err) {
    // Auto-refresh on 401, then retry once.
    if (
      err instanceof HttpError &&
      err.status === 401 &&
      !opts.noRefresh &&
      !opts.unauthenticated
    ) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        const retryHeaders = new Headers(headers);
        const newToken = await getAccessToken();
        if (newToken) retryHeaders.set('authorization', `Bearer ${newToken}`);
        return http<T>(url, { ...opts, headers: retryHeaders });
      }
      await clearSession();
    }
    throw err;
  }
}

async function tryRefresh(): Promise<boolean> {
  // … same as before, but using http() instead of fetch() …
}
```

## What you gain

- **Retry per call** comes free — pass `retries: 3` on a `getJson` call.
- **Custom error messages per call** — same `errorMessages` option works.
- **Same timeout / abort semantics** as the rest of the app.
- **One `HttpError` class** — the BackendApiError extends it cleanly.

## What stays the same

- The public API: `getJson`, `postJson`, `backendFetch`. Existing code keeps working.
- The cookie / refresh logic — still wraps around the call.
- The `'server-only'` import — the api-client is still server-only.

## When to skip the refactor

If the project hasn't grown beyond a few endpoints and the api-client is doing its job, don't refactor for refactoring's sake. The default api-client (raw `fetch`) is fine for small projects. Move to the delegated version when:

- You start wanting retries on backend reads.
- Timeout customisation per endpoint becomes a need.
- You want one consistent `HttpError` shape across the codebase.

## Why not put `http()` inside the api-client?

Some projects only have ONE HTTP entry point (the backend). For those, "merge them" is tempting. Don't:

- Third-party APIs come up (payment providers, embeds, analytics). You'll want `http()` for those.
- Public endpoints (RSS, public APIs) shouldn't carry the auth token.
- The api-client's specific concerns (token attachment, refresh) shouldn't be every fetcher's burden.

Two layers, one error shape. That's the right separation.
