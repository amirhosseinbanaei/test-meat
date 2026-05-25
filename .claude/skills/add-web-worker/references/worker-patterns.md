# Web Worker patterns

The mental model and the technical patterns we use across the project.

## Mental model

A Web Worker is a **separate thread** running JavaScript. It has its own global scope (`self`, not `window`), its own event loop, no DOM. The main thread and worker thread communicate via `postMessage`, which **structured-clones** the data — so you can't send DOM nodes, functions, or class instances (other than a fixed set: Date, Map, Set, ArrayBuffer, …).

Crucially: a worker has its own startup cost (~5ms cold start, plus the time to download the worker's script bundle), and every call has serialization cost (the structured clone). Tiny tasks aren't worth it.

## The team's pattern

We use a **module worker** with **typed RPC**. Three pieces:

1. **The worker file** (`*.worker.ts`) — defines an API object and calls `expose(api)`.
2. **The RPC wrapper** (`common/lib/worker-rpc.ts`) — one file, supplies `expose` (worker side) and `wrap` (host side). About 100 lines, no dependencies.
3. **The hook** (`common/hooks/useWorker.ts`) — manages lifecycle (create, wrap, terminate-on-unmount) and exposes `call` + `busy` to the component.

The worker file looks like a normal TypeScript module — just an object of methods. The RPC wrapper turns it into a callable RPC service. The hook owns the worker's lifetime.

## Module workers, not classic workers

We always use `type: 'module'` when constructing a Worker. This unlocks `import` syntax inside the worker file (so the worker can use shared types, lib functions, npm packages).

```ts
new Worker(new URL('./my.worker.ts', import.meta.url), { type: 'module' });
```

Next.js / webpack recognises the `new URL(..., import.meta.url)` pattern and produces a separate bundle for the worker. The `.worker.ts` suffix is convention — it makes the file's purpose obvious in code review and lets us add file-type-specific tooling later if needed.

## Structured clone — what you can send

| Type | Cloneable? |
|---|---|
| Primitives (string, number, boolean, null, undefined) | ✓ |
| Plain objects, arrays | ✓ |
| Date, RegExp, Map, Set | ✓ |
| ArrayBuffer, typed arrays, ImageData, ImageBitmap, Blob, File | ✓ (some also transferable — see below) |
| Functions | ✗ |
| DOM nodes | ✗ |
| Class instances (other than the above) | ✗ — only enumerable own properties survive, prototype is lost |
| Errors | ✓ (Error, TypeError, etc. — but only message/name; we re-build them on the host side) |
| Symbols | ✗ |

Test mental rule: **if it's JSON-stringifiable plus Date/Map/Set/binary types, it's fine.**

## Transferables — moving large data

For large data (>1MB-ish), structured clone is expensive. **Transferables** move ownership of memory between threads instead of copying — instant, regardless of size. The catch: after transfer, the sender can't use the data any more (it's gone from their side).

Transferable types: `ArrayBuffer`, `MessagePort`, `ImageBitmap`, `OffscreenCanvas`, `ReadableStream`, `WritableStream`, `TransformStream`.

Our RPC wrapper supports transferables. Have your worker method return `{ value, transfer: [...] }`:

```ts
// Worker side
const api = {
  resizeImage(blob: Blob): Promise<{ value: ArrayBuffer; transfer: Transferable[] }> {
    const resized = await doResize(blob);
    return { value: resized, transfer: [resized] };  // hands the buffer off, no copy
  },
};
```

The host doesn't see the `{ value, transfer }` wrapper — it gets the `value` directly. The wrapper unwraps it.

## Lifecycle: create lazy, terminate on unmount

```ts
const { call, busy } = useWorker<MyApi>(
  () => new Worker(new URL('./my.worker.ts', import.meta.url), { type: 'module' })
);
```

The hook:

- Creates the worker on first render of the component (lazy — no worker started if the component never mounts).
- Wraps it with the RPC client.
- Terminates the worker when the component unmounts. Any in-flight calls reject with `"Worker terminated"`.
- Tracks pending calls and exposes `busy: boolean` for UI use.

**Don't reuse a single worker across many components** unless they share a feature. Each component's hook owns its worker — simple, predictable, and the lifetime matches the use.

For workers that should outlive a component (e.g. a long-running indexing worker), put the worker in a module-scoped singleton in `modules/<feature>/workers/<name>-singleton.ts` and import it directly. Rare — most workers are per-component.

## Error handling

The RPC wrapper preserves errors across the boundary. If the worker throws, the host's `await call(...)` rejects with an `Error` carrying the original `name`, `message`, and (where available) `stack`.

Worker-level errors (uncaught throws at module top level, or syntax errors in the worker file) fire the worker's `error` event. Our wrapper listens and rejects all pending calls with a `WorkerCrash` error.

In components:

```ts
try {
  await call('parse', text);
} catch (err) {
  // Same error shape as any other thrown error — pipe through handleApiError if desired.
  toast.error(err instanceof Error ? err.message : 'Worker failed');
}
```

## What workers can NOT do

- Access `window`, `document`, `localStorage`, `sessionStorage`. (Workers have `self` and `WorkerGlobalScope` instead.)
- Render anything. Workers are pure compute.
- Send synchronous messages. All communication is async via `postMessage`.

What they CAN do:

- `fetch`, `WebSocket`, `EventSource`.
- `IndexedDB`, Cache API.
- `crypto.subtle` (full Web Crypto API).
- `performance` (timing), `console`.
- Import other modules (in module workers).

## Why not Comlink?

[Comlink](https://github.com/GoogleChromeLabs/comlink) is the popular library for this pattern (~3KB gzipped). We don't pull it in because:

- It's small but it's still a dep — and our locked-stack philosophy rejects deps when ~100 lines do the job.
- Comlink's proxy magic (you call `worker.method(args)` and it feels synchronous) is elegant but harder to debug than explicit `call('method', args)`.
- Type-safety with Comlink requires extra glue; ours is type-native via `keyof T`.

If a project ever needs the full Comlink feature set (recursive proxies, exposing classes, etc.), the door's open. For 99% of cases the tiny wrapper is enough.

## SharedWorker, ServiceWorker — different things

- **Web Worker** (this skill): one-to-one with the page that created it. Dies when that page goes away.
- **SharedWorker**: one-to-many across tabs of the same origin. Useful for cross-tab coordination but tricky and not well-supported on Safari. We don't use them by default.
- **Service Worker** (the `add-pwa` skill): proxies network requests, supports offline. Different purpose entirely.

Use this skill for Web Workers. Use the `add-pwa` skill for Service Workers. They coexist — a project can have both.
