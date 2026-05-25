# Virtualization patterns

The "when, how, and when not" of `@tanstack/react-virtual`.

## The 200-item rule

Don't virtualise small lists. The library is fast, but rendering 50 plain `<div>`s is faster than running a virtualiser, computing positions, and absolute-positioning 10 elements.

Rough thresholds:

| Item count | Approach |
|---|---|
| < 200 | Plain `.map()` rendering. |
| 200 – 1,000 | Virtualisation pays off. Fixed-height variant if possible. |
| 1,000 – 100,000+ | Virtualisation required. Dynamic-height is fine; consider pagination as well if data also takes time to fetch. |

For very large datasets, pair virtualisation with pagination via `useInfiniteQuery`. Don't fetch 50,000 rows upfront and let the virtualiser hide them — you've paid the network cost regardless.

## The scroll container is what matters

The virtualiser needs ONE scroll element to attach to. By default that's the parent `<div>` we render in the templates, with `overflow: auto` and a fixed height.

If you want the **window** (`document.body`) to be the scroll element — like a feed that scrolls with the page — use `useWindowVirtualizer` instead:

```ts
import { useWindowVirtualizer } from '@tanstack/react-virtual';
```

Pros of window-scroll: feels more native, page-level navigation works, scroll restoration is automatic on Next.js navigation.
Cons: harder to position relative to the viewport, header/footer become parts of the same scroll surface.

For embedded lists (chat panel, side drawer with comments), container-scroll is the right call. For full-page feeds, window-scroll often wins.

## `estimateSize` accuracy

The `estimateSize` callback returns the predicted height of each item. The virtualiser uses this:

- To compute the total scrollbar size before any item is rendered.
- To decide how many items to render in the viewport.

A close estimate is better. A bad estimate causes scroll jumps as items get measured and the total size shifts.

**For fixed-height items**, return the exact height — virtualisation will be optimal.
**For dynamic items**, return an average. Common technique: render the first batch, log the actual heights, update the estimate.

## `measureElement` for variable heights

For dynamic-height items, pass `measureElement` to `useVirtualizer` and `ref={virtualizer.measureElement}` on each rendered row. The library reads each row's actual height on first render and caches it.

The `data-index` attribute is **required** on the row — it's how the library identifies which virtual row this DOM node corresponds to. The templates set this for you.

Caveat: items must NOT change height after they've been rendered. If a row is "expandable" (click to show more), call `virtualizer.measure()` after the expansion to re-measure. Otherwise, scroll position will drift.

## `overscan`

The virtualiser renders extra rows above and below the viewport so the user doesn't see white space during fast scrolling. `overscan: 5` means 5 extra rows on each side. Raise this if scrolling feels jumpy; lower it if memory matters.

Don't go above ~10 unless you have a specific reason. The whole point of virtualisation is to not render what's invisible.

## `contain: 'strict'` on the scroll container

The templates set `style={{ contain: 'strict' }}` on the scroll container. This is a CSS containment hint: it tells the browser this element's layout, paint, and size are independent of the rest of the page. Real performance win for large lists — the browser doesn't have to re-layout the whole document on every scroll.

Keep it. Only remove if your design genuinely needs the container's height to flex with content (rare for virtualised lists, which always have a known height).

## Horizontal lists and grids

Same API, different axis:

```ts
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200,
  horizontal: true, // ← swap axis
  overscan: 3,
});
```

For grids, use two virtualisers — one for columns, one for rows — and render the cross product. TanStack docs have a grid example; the pattern is well-documented.

## Scrolling to a specific index

```ts
virtualizer.scrollToIndex(42, { align: 'center', behavior: 'smooth' });
```

- `align`: `'start' | 'center' | 'end' | 'auto'` — where in the viewport to land.
- `behavior`: `'smooth' | 'auto'` — smooth scrolls, auto jumps.

Useful for "jump to top" buttons, search-result highlighting in a long list, focus-on-mount for keyboard users.

## Keyboard navigation

The virtualiser handles scroll position but not focus management. For lists where Tab / arrows should move between items, you have to:

1. Track the focused index in state.
2. On arrow key, update the index AND call `scrollToIndex` to keep it in view.
3. Apply `tabIndex={isFocused ? 0 : -1}` so only the focused item is tabbable.

This is more work than non-virtualised lists. If keyboard navigation across every item is critical (a navigation menu), virtualising might be the wrong tool — pagination or sectioning may be better.

## When to fall back to pagination

Virtualisation hides the cost of rendering, not the cost of fetching. If the dataset is genuinely huge AND the user often jumps around (sorting, filtering, searching), pagination beats infinite scroll on UX:

- The user knows where they are ("page 3 of 47").
- They can deep-link to a position.
- Filtering doesn't require re-fetching from scratch.

Combine when sensible: pagination at the API level (one fetch per page), virtualisation at the render level (smooth scrolling within fetched content). The `infinite-scroll-list` template does exactly that.

## What NOT to do

- **Don't virtualise above the fold.** The virtualiser hides items from the initial paint; that hurts SEO and first impression. The top of a public-facing list should be plain-rendered; virtualisation kicks in further down.
- **Don't put navigation elements in a virtualised list.** Headings, anchors, "skip to section" links — these need to be in the DOM regardless of scroll position.
- **Don't fight the library on layout.** Items are absolute-positioned inside the inner div. Don't try to add CSS margins between rows (they'd be ignored). Pad inside the row instead.
- **Don't lazy-load images inside virtualised rows with Intersection Observer.** The rows themselves are appearing and disappearing — the IO won't fire as you'd expect. Use `<Image priority={false}>` (the default) and let Next.js handle it.
