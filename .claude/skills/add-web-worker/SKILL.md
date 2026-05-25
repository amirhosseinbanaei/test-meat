---
name: add-web-worker
description: Move heavy CPU work off the main thread into a Web Worker. Use whenever a task takes more than ~50ms of synchronous JavaScript and runs on user-facing flows (parsing, transforming, hashing, image processing, large filters/sorts, JSON-of-thousands-of-records work). Sets up a typed worker module, a Comlink-style RPC wrapper, and a React hook for invocation.
allowed-tools: Read, Write
---

# Offload heavy work to a Web Worker

The main thread is the UI thread. Anything that runs on it longer than ~50ms causes jank (dropped frames, frozen scrolling, delayed input). Web Workers are the answer — separate threads that run JavaScript without touching the DOM. They communicate via `postMessage` (or, via the wrapper this skill installs, typed RPC).

## When to use

A task earns a worker when **all three** apply:

- **CPU-bound**, not I/O-bound (fetches don't need workers — they're already async).
- **>50ms** synchronous execution per call on a representative device. If you don't know, measure with `performance.now()` first.
- **Pure** — depends only on its inputs and a known set of libraries, not on the DOM, window, or localStorage. (Workers don't have these.)

Concrete triggers:

- Parsing or transforming JSON / CSV / large config (>500KB or >5k records).
- Image processing — resize, compress, crop, blur, watermark — before upload.
- Hashing or encryption (crypto operations).
- Searching / filtering / sorting >5k records client-side.
- Markdown / syntax-highlight rendering for large documents.
- PDF rendering or generation (pdf-lib, pdfjs).
- Heavy regex over large inputs.
- Computing derived data for charts/visualizations from large datasets.

## When NOT to use

- The work is async I/O — `fetch`, `IndexedDB`, network calls don't need workers; they're already off-main-thread.
- The work is fast (<10ms). Worker overhead (~5ms startup + message passing) costs more than the win.
- The work has to touch the DOM. Workers can't.
- The work runs once on app boot. Pay the cost on the main thread once; don't ship the worker.
- The data is huge (>50MB) and serialization across `postMessage` would be slow. Use `Transferable` objects (ArrayBuffers, ImageBitmaps) — built in here — or reconsider the approach.

## Inputs expected

- `worker_name` — PascalCase identifier for the worker's API (e.g. `CsvParser`, `ImageProcessor`). Files derive from this.
- `feature` — the module the worker lives in (`csv-import`, `image-upload`). Worker is module-scoped unless used by 3+ unrelated modules.
- `operations` — list of exposed operation names with input/output types.

## Workflow

1. Read `references/worker-patterns.md` — the FE team's worker conventions, Comlink-style RPC, error handling, transferables, terminate-on-unmount.
2. Read `references/when-to-offload.md` — the explicit decision rules for "does this earn a worker?".
3. Copy `assets/worker.ts.template` to `src/modules/<feature>/workers/<worker-name-kebab>.worker.ts`. The `.worker.ts` suffix is convention — Next.js's webpack config recognizes it.
4. Copy `assets/worker-rpc.ts.template` to `src/common/lib/worker-rpc.ts` (one-time per project; only on first worker installation). This is the tiny RPC wrapper.
5. Copy `assets/useWorker.ts.template` to `src/common/hooks/useWorker.ts` (one-time per project; only on first worker installation). React hook that owns the worker lifecycle.
6. Wire the worker's operations into the worker file and the consuming component imports through the hook.
7. Run `lint-and-typecheck`.

## Usage at a glance

```tsx
'use client';
import { useWorker } from '@/common/hooks/useWorker';
import type { CsvParserApi } from '@/modules/csv-import/workers/csv-parser.worker';

export function CsvImporter() {
  const { call, busy } = useWorker<CsvParserApi>(
    () => new Worker(new URL('@/modules/csv-import/workers/csv-parser.worker.ts', import.meta.url), { type: 'module' })
  );

  const handleFile = async (file: File) => {
    const text = await file.text();
    const rows = await call('parse', text);
    setRows(rows);
  };

  return <input type="file" onChange={e => handleFile(e.target.files![0])} disabled={busy} />;
}
```

The worker module looks like:

```ts
// src/modules/csv-import/workers/csv-parser.worker.ts
import { expose } from '@/common/lib/worker-rpc';

const api = {
  parse(text: string): Row[] {
    // Heavy work runs here, off the main thread.
    return parseCsv(text);
  },
  validate(rows: Row[]): ValidationResult {
    return runValidation(rows);
  },
};

export type CsvParserApi = typeof api;
expose(api);
```

The consuming code calls `await call('parse', text)` — type-safe because `CsvParserApi` flows through.

## Files in this skill

- `assets/worker.ts.template` — worker module template with `expose()`.
- `assets/worker-rpc.ts.template` — the tiny RPC wrapper (`expose` for the worker side, `wrap` for the host side). Project-wide, dropped into `common/lib/` once.
- `assets/useWorker.ts.template` — React hook that owns worker creation, the wrap call, busy state, and terminate-on-unmount. Project-wide, dropped into `common/hooks/` once.
- `references/worker-patterns.md` — full pattern documentation.
- `references/when-to-offload.md` — decision rules with measurement guidance.
