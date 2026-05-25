# Retry, timeout, and abort

The mental model for these three things — they interact in subtle ways.

## Timeout

Every request has a budget. Default: **30 seconds**. Override per call:

```ts
await http<Data>('/api/long-query', { timeout: 60_000 });
await http<Data>('/api/healthcheck', { timeout: 2_000 });
```

Implementation: an `AbortController` whose signal aborts after `timeout` ms. When that happens, `http` throws an `HttpError` with:

- `status: 0`
- `details.cause === 'timeout'`
- `message` taken from `errorMessages.timeout` if provided, otherwise `'Request timed out.'`

## Retry

By default, **retries are off** (`retries: 0`). Opt in per call:

```ts
await http<Data>('/api/orders', { retries: 3 });
```

When `retries > 0`, the http function retries on:

- **Network errors** — DNS failure, refused connection, broken pipe. (Always retry-eligible up to `retries`.)
- **Timeouts** — same. Each retry gets a fresh timeout budget.
- **Configured statuses** — by default `[408, 429, 502, 503, 504]`. Override with `retryOnStatuses`.

The function **does not retry** on:

- 4xx other than 408 / 429 — the request is wrong, retrying won't help.
- 5xx other than 502 / 503 / 504 — the server is in a bad state; the specific "transient" 5xx codes retry, others don't.
- External AbortSignal — if the caller cancelled, retrying would surprise them.

## Exponential backoff

Retry delays double on each attempt:

```
attempt 1: retryDelay × 1     (default: 1s)
attempt 2: retryDelay × 2     (2s)
attempt 3: retryDelay × 4     (4s)
attempt 4: retryDelay × 8     (8s)
...
```

Capped at 30 seconds.

Customise the base delay:

```ts
await http<Data>('/api/x', { retries: 3, retryDelay: 500 });
// 500ms, 1s, 2s — total worst-case ~3.5s
```

No jitter is applied. If your backend gets thundering-herd issues with many clients retrying simultaneously, add jitter at the application level or move to a queue-based pattern.

## Combining timeout + retry

This is the part that trips people up. The interaction:

- `timeout` is **per attempt**, not per request lifetime.
- `retries: 3, timeout: 10_000` means each of the (up to 4) attempts gets its own 10s budget.
- Total worst-case time: `(retries + 1) × timeout + sum-of-backoffs` = `40s + 7s` = `~47s` with defaults.

For "give up after total X seconds regardless", pass your own AbortSignal and cancel it from outside:

```ts
const controller = new AbortController();
setTimeout(() => controller.abort('overall timeout'), 30_000);
await http('/api/x', { signal: controller.signal, retries: 5, timeout: 5_000 });
```

## External cancellation

Pass your own `AbortSignal` to cancel the request from outside — e.g. when the user navigates away or types over a search:

```ts
const controller = new AbortController();
const result = http('/api/search', {
  json: { q: query },
  signal: controller.signal,
});
// Later, when the user changes their query:
controller.abort('user changed query');
```

The internal timeout signal and the external signal are **composed**: whichever aborts first wins. If the external signal aborts, `http` throws `HttpError` with `details.cause === 'aborted'` (distinguishing it from a timeout).

## What to retry vs. handle

For idempotent reads (GET), retrying is safe — same request, same effect. For writes (POST, PUT, DELETE), retrying without idempotency keys can create duplicates. Default: only retry **safe methods** + the specific transient statuses.

If you're calling a non-idempotent POST and want retries, the backend must support idempotency keys. Set them per call:

```ts
await http<Data>('/api/charge', {
  method: 'POST',
  headers: { 'idempotency-key': crypto.randomUUID() },
  json: payload,
  retries: 3,
});
```

The backend then deduplicates if it sees the same key twice — safe to retry.

## The AbortSignal in TanStack Query

TanStack Query passes its own `AbortSignal` to query functions:

```ts
useQuery({
  queryKey: ['users'],
  queryFn: ({ signal }) => http<User[]>('/api/users', { signal }),
});
```

When the query is unmounted, refetched, or its key changes, TanStack Query aborts the signal. `http` sees the external abort and throws an `HttpError` with `cause: 'aborted'`. TanStack Query catches this and silently discards the result. Don't surface aborted errors to the user.

```ts
if (isHttpStatus(err, 0) && err.details?.cause === 'aborted') {
  return; // Aborted — usually intentional.
}
```

## Summary table

| Scenario | What happens |
|---|---|
| Server returns 200 | Returns parsed body |
| Server returns 4xx (other than 408/429) | Throws `HttpError(status: 4xx)`. No retry. |
| Server returns 502 | Retries `retries` times, then throws |
| Server returns 500 | Throws immediately (500 is not in the retry list by default) |
| Network error (offline, DNS fail) | Retries `retries` times, then throws `HttpError(status: 0, cause: 'network')` |
| Timeout fires | Retries (each with a fresh budget), then throws `HttpError(status: 0, cause: 'timeout')` |
| External signal aborts | Throws `HttpError(status: 0, cause: 'aborted')` immediately, no retry |
