# TanStack Table architecture

TanStack Table is **headless** — it gives you state and computations, you render the markup. Three things to internalise.

## Column definitions

A column is one entry in the `columns` array. Each column has:

| Field | Meaning |
|---|---|
| `accessorKey` | Which field of the row this column displays. Strings like `'email'` or dotted paths like `'profile.handle'`. |
| `id` | A synthetic column id, when there's no row field — checkboxes, action menus. One of `id` or `accessorKey` is required. |
| `header` | What to render in the header cell. String or `({ column, table }) => ReactNode`. |
| `cell` | What to render in each body cell. Defaults to the raw accessor value. `({ row, getValue }) => ReactNode`. |
| `enableSorting` | Boolean. Defaults true. |
| `filterFn` | Custom filter logic when the user filters this column. |
| `meta` | Bag for your own data — anything you want to read in cell renderers. |

The column definitions are the *only* place row data is interpreted. Cell renderers can do anything — format dates, render badges, show action menus.

## Hooks for features

Features are opt-in via `getXxxRowModel` calls passed to `useReactTable`:

```ts
useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),         // always required
  getSortedRowModel: getSortedRowModel(),     // for sorting
  getFilteredRowModel: getFilteredRowModel(), // for filtering
  getPaginationRowModel: getPaginationRowModel(), // for pagination
  // getGroupedRowModel, getExpandedRowModel, getFacetedRowModel, ...
});
```

Don't include row models you don't use — they have measurable bundle cost.

## Client mode vs server mode

The same component handles both. The difference is **who owns sort/filter/pagination state**.

**Client mode (default):** all data lives in the table; sort/filter/paginate happen in memory. Good for ≤ 1,000 rows fully loaded. The default templates use this.

**Server mode:** the backend handles sort/filter/paginate, the table just renders the current page. Pass `manual*` flags and sync state with `onStateChange` callbacks:

```ts
useReactTable({
  data,
  columns,
  manualSorting: true,
  manualFiltering: true,
  manualPagination: true,
  pageCount, // tell the table how many pages exist
  state: { sorting, columnFilters, pagination },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  // No getSortedRowModel / getFilteredRowModel / getPaginationRowModel —
  // the backend already returned sorted/filtered/paginated data.
});
```

Then sync the table's state into the URL or a TanStack Query call:

```tsx
const { data, isPending } = useQuery({
  queryKey: ['users', sorting, columnFilters, pagination],
  queryFn: () => fetchUsers({ sorting, columnFilters, pagination }),
});
```

The pattern: **table state → query key → backend fetch**. Changing the sort triggers a new query.

## When to use which mode

| Situation | Mode |
|---|---|
| ≤ 1,000 rows, fetched in one go | Client |
| Truly large dataset (10k+) | Server |
| Filter UX needs to be instant on huge data | Server with debounced query |
| Backend already paginates (most REST APIs) | Server |
| Static data exported from CMS / build time | Client |

Mixing — client-side sort but server-side pagination — is possible, but rarely worth the complexity. Pick a mode per table.

## Row selection

`enableRowSelection: true` + a selection column. The template's "select" column shows the pattern. Selected row state lives at the top level (`rowSelection` in the template). Bulk actions read from `table.getFilteredSelectedRowModel().rows`.

For server-driven tables, selection ids should be stable identifiers (not row indices, which change per page). The template uses the row's id automatically.

## Column visibility

Add a "show/hide columns" dropdown:

```tsx
useReactTable({
  // ...
  state: { columnVisibility, /* ...others */ },
  onColumnVisibilityChange: setColumnVisibility,
});

// In the toolbar, iterate table.getAllColumns() and toggle.
```

shadcn ships a `DropdownMenu` + `DropdownMenuCheckboxItem` for this — common UX win on tables with many columns.

## Expanding rows

For showing sub-detail under a row on click:

```ts
import { getExpandedRowModel } from '@tanstack/react-table';

useReactTable({
  // ...
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
});
```

Then add an expand toggle to the row and conditionally render `row.getIsExpanded() && <ExtraContent row={row} />` in the body.

## Virtualizing the rows

For tables with many rendered rows at once (think log viewer), combine with `add-virtualized-list`. TanStack Table gives you the row model; TanStack Virtual handles positioning. The shadcn `Table` components need a small tweak — absolute-positioned rows inside a scrolling container.

Don't reach for this unless you've measured the table feels slow. Pagination usually beats virtualisation for tables — users prefer "page 3 of 47" to a long scroll for tabular data.
