# When to offload to a worker

The honest answer: most code doesn't need a worker. Workers carry startup cost, serialization cost, and complexity cost. Adding one to a task that runs in 15ms makes the app slower, not faster.

## The decision rule

Offload when **all three** are true:

1. **It's CPU-bound, not I/O-bound.**
   - CPU-bound: parsing, transforming, hashing, computing. The bottleneck is the JS engine doing work.
   - I/O-bound: `fetch`, `IndexedDB`, network. These are already async and don't touch the main thread for long.

2. **It takes >50ms on a representative device.**
   - 50ms is roughly where users start noticing jank (>60fps means a frame budget of 16ms).
   - A representative device is **not your dev laptop**. Test on a mid-tier Android phone or a CPU-throttled DevTools simulation (4× slowdown).
   - When in doubt, measure with `performance.now()`:
     ```ts
     const t = performance.now();
     const result = expensiveOperation(input);
     console.log(`took ${performance.now() - t}ms`);
     ```

3. **The inputs and outputs are structured-cloneable.**
   - If you'd have to pass DOM nodes, class instances, or functions, the worker doesn't fit.
   - For large data (>1MB), plan for transferables (ArrayBuffer / ImageBitmap) — copying that across `postMessage` defeats the win.

## Concrete triggers

### Strongly favoured for workers

| Task | Why |
|---|---|
| Parsing JSON > 500KB | JSON.parse blocks proportional to size; large blobs cause visible jank. |
| Parsing CSV / Excel | Same. |
| Image transforms (resize, blur, crop, watermark) | OffscreenCanvas + ImageBitmap transfers are designed for this. |
| Hashing files for content-addressable storage / dedup | crypto.subtle.digest on large files is slow on main thread. |
| Sorting / filtering 5k+ records by computed keys | Sort is O(n log n); 50k+ records will block noticeably. |
| Markdown rendering of long docs | unified/remark pipelines for 10k-line docs take seconds. |
| Syntax highlighting code samples | Prism/Shiki on long code blocks. |
| PDF generation (pdf-lib) | CPU-heavy in non-trivial documents. |
| Computing chart data from 10k+ raw points | Aggregations, downsampling, smoothing. |

### Usually not worth it

| Task | Why |
|---|---|
| Validating a form (Zod schema) | Sub-millisecond on any device. |
| Sorting <1000 records | Sub-10ms. |
| Date formatting | Native Intl is fast. |
| Filtering a 200-item list | Imperceptible. |
| Anything that runs once on boot | Pay the cost once on the main thread; don't ship a worker bundle. |
| Anything async (network, IDB) | Already off-thread; a worker would just add a layer. |

## Measuring before deciding

Don't pre-optimize. The worker pattern has cognitive cost (separate files, message types, async-only API). Pay it only when the data justifies it.

### Quick measurement

```ts
function measure<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  console.log(`[${label}] ${duration.toFixed(2)}ms`);
  return result;
}

const rows = measure('parseCsv', () => parseCsv(text));
```

If `parseCsv` consistently takes <30ms even on slow inputs, no worker. If it can spike past 100ms in real usage, worker.

### Better: use the Performance panel

DevTools → Performance → Record. Press the button that triggers the work. Look for long tasks (red triangles, >50ms blocks of script). If you see them, that's your worker candidate. If you don't, the work isn't blocking.

### Even better: long-task observer

For production telemetry, register a long-task observer:

```ts
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Report to analytics — entry.duration, entry.name, entry.attribution
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

Wire this through analytics-lead's stack — surfaces real-user long tasks that aren't obvious in dev.

## Designing the worker API

Once you decide a task earns a worker, design the API for the **least** message-passing:

- **Batch where possible.** One `parse(text)` call is better than ten `parseRow(row)` calls — each message has serialization overhead.
- **Pre-aggregate inside the worker.** Return the filtered/sorted/computed result, not raw data + a "filter on the host" instruction.
- **Use transferables for large outputs.** Don't structured-clone a 10MB ArrayBuffer — transfer ownership.
- **Avoid round-trips.** If the worker needs more data, structure the API so the host provides it upfront, not via a back-and-forth.

## Don't offload the wrong thing

A common antipattern: putting `fetch` calls inside a worker because "I want it off the main thread". Fetch doesn't block the main thread — its callbacks do, briefly, when they resolve. Putting it in a worker adds startup and round-trip cost for zero gain.

The CPU-bound rule matters. If you can't point at the synchronous JavaScript that's blocking, the worker won't help.
