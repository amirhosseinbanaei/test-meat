---
name: add-virtualized-list
description: Adds a virtualized list using `@tanstack/react-virtual`. Use for any list with 200+ items, infinite-scroll feeds, large data grids, chat message histories, autocomplete dropdowns with many options. For lists smaller than ~200 items, plain rendering is faster — don't reach for this prematurely.
allowed-tools: Bash(npm *), Read, Write
---

# Add a virtualized list

Virtualization renders only the items currently visible in the viewport, instead of all of them. For a list of 10,000 items, the DOM holds maybe 20-30 elements. That's the only way to make long lists fast.

## When to use

- Lists with 200+ items rendered at once.
- Infinite-scroll feeds (paired with TanStack Query's `useInfiniteQuery`).
- Chat message histories.
- Large autocomplete dropdowns.
- Tables with many rows (also see `add-data-table`).
- Calendar / agenda views with many entries.

## When NOT to use

- Lists under ~200 items. Virtualization itself has overhead — for small lists, plain rendering beats it.
- Lists with very heavy items where you can't accurately estimate height. Virtualization works best when items are reasonably uniform or you can measure on the fly.
- Server-rendered content where the SEO concern is to have all items in HTML. Virtualization hides items from the initial DOM.
- A primary navigation list. If users need to scan everything, don't hide most of it.

## Why TanStack Virtual

- Same team as TanStack Query and TanStack Table — consistent API across the stack.
- Headless. You render the DOM; the library gives you positions.
- Works vertically, horizontally, and as a grid.
- Supports dynamic item heights via measurement.
- ~5 KB.

The rejected alternatives: `react-window` (lighter, less flexible), `react-virtuoso` (heavier, more opinionated). TanStack is the right balance for this stack.

## Packages to install (per-skill, NOT in scaffold)

```bash
npm install @tanstack/react-virtual
```

## Inputs expected

- `kind` — `vertical` (default) | `horizontal` | `grid`.
- `dynamic_heights` — `true` if items have variable height that needs measuring; `false` if all items are the same height (much faster).
- `infinite_scroll` — `true` if paired with `useInfiniteQuery`; `false` for a static list.

## Workflow

1. Read `references/virtualization-patterns.md` — the rules around scroll element, item measurement, performance tips, when to virtualise vs paginate.
2. Pick the right template from `assets/`:
   - `assets/vertical-list.tsx.template` — basic vertical virtualization.
   - `assets/dynamic-height-list.tsx.template` — variable-height items with measurement.
   - `assets/infinite-scroll-list.tsx.template` — paired with TanStack Query's `useInfiniteQuery`.
3. Place at `src/modules/<feature>/components/<ListName>.tsx`. A virtualised list almost always belongs inside the module that owns the data — there's no value in making it generic across features.
4. Wire the data source — static array, or a `useInfiniteQuery` result.

## Files in this skill

- `assets/vertical-list.tsx.template` — fixed-height vertical list.
- `assets/dynamic-height-list.tsx.template` — variable-height list with `measureElement`.
- `assets/infinite-scroll-list.tsx.template` — virtualised + paginated via TanStack Query.
- `references/virtualization-patterns.md` — rules of thumb, perf tips, when to fall back to pagination.
