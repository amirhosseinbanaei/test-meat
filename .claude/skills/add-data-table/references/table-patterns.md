# Table patterns

Common feature recipes built on top of `DataTable`.

## Sortable header

The columns example shows the pattern. The button calls `column.toggleSorting(currentlyAsc)` and Tanstack handles the rest:

```tsx
header: ({ column }) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    className="-ml-3 h-8"
  >
    Email
    <ArrowUpDown className="ml-2 size-3.5" />
  </Button>
),
```

Three states: `'asc'`, `'desc'`, or `false`. The button cycles through.

## Search box (global filter)

Add a global filter input above the table — filters across all string columns:

```tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';

// in the page:
const [globalFilter, setGlobalFilter] = useState('');

<DataTable
  data={users}
  columns={userColumns}
  toolbar={(table) => (
    <Input
      placeholder="Search…"
      value={globalFilter}
      onChange={(e) => {
        setGlobalFilter(e.target.value);
        table.setGlobalFilter(e.target.value);
      }}
      className="max-w-sm"
    />
  )}
/>
```

The table option `globalFilterFn: 'includesString'` (the default) does case-insensitive substring matching across all visible columns.

## Per-column filter (categorical)

For a column like `role` with a finite set of values, show a multi-select faceted filter:

```tsx
const roleColumn = table.getColumn('role');
const selected = (roleColumn?.getFilterValue() as string[]) ?? [];

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">Role {selected.length > 0 && `(${selected.length})`}</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {['admin', 'member', 'viewer'].map((role) => (
      <DropdownMenuCheckboxItem
        key={role}
        checked={selected.includes(role)}
        onCheckedChange={(checked) => {
          roleColumn?.setFilterValue(
            checked ? [...selected, role] : selected.filter((r) => r !== role)
          );
        }}
      >
        {role}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

The column's `filterFn` (in the columns example) reads the array and filters accordingly.

## Bulk operations on selected rows

Selected rows are accessible via `table.getFilteredSelectedRowModel().rows`. Each has `row.original` (the row data):

```tsx
const selectedRows = table.getFilteredSelectedRowModel().rows;
const handleBulkDelete = async () => {
  const ids = selectedRows.map((r) => r.original.id);
  await bulkDeleteUsersAction(ids); // Server Action
  table.resetRowSelection();
};

{selectedRows.length > 0 && (
  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
    Delete {selectedRows.length} selected
  </Button>
)}
```

The action is a Server Action with Zod-validated input (an array of ids), the same pattern as `create-server-action`. After the mutation, `revalidateTag` invalidates the cached list.

## URL-synced state

Sort, filter, and pagination state survive page reloads when synced to the URL:

```tsx
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

const sorting = parseSortingFromSearchParams(searchParams);
const onSortingChange = (next) => {
  const sp = new URLSearchParams(searchParams.toString());
  sp.set('sort', serialiseSorting(next));
  router.replace(`${pathname}?${sp}`);
};

<DataTable
  data={users}
  columns={userColumns}
  // pass state + onChange props as the wrapper supports them
/>
```

For server-mode tables, this is more than nice-to-have — it makes the URL deep-linkable, the table refreshable, and pagination shareable.

For complex URL state management across many filters, consider a tiny serialisation helper or `nuqs` (a small library — but only if the project has 3+ such tables).

## Server-mode example

```tsx
'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  useReactTable, getCoreRowModel, type SortingState, type ColumnFiltersState, type PaginationState,
} from '@tanstack/react-table';

export function ServerDrivenUsersTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const { data } = useQuery({
    queryKey: ['users', sorting, filters, pagination],
    queryFn: () => fetchUsers({ sorting, filters, pagination }),
    placeholderData: keepPreviousData, // don't blank on pagination changes
  });

  const table = useReactTable({
    data: data?.rows ?? [],
    columns: userColumns,
    pageCount: data?.pageCount ?? -1,
    state: { sorting, columnFilters: filters, pagination },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return /* render the table using TanStack's primitives */;
}
```

`placeholderData: keepPreviousData` prevents the table from emptying when navigating pages — feels much smoother.

## Row click navigation

For tables where a row click should navigate to a detail page:

```tsx
<TableRow
  key={row.id}
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => router.push(`/users/${row.original.id}`)}
>
```

Watch out: nested interactive elements (action menus, checkboxes) need `e.stopPropagation()` in their onClick so the row click doesn't fire when the user clicks them.

For accessibility, wrap the row in a `<Link>` if possible (semantically correct), or expose the primary action through an explicit "View" button — many users miss "click anywhere on the row".

## Empty state

The `DataTable` template renders "No results." when there are no rows after filtering. Customise via a prop if a richer empty state is needed (CTA to add the first item, illustration, etc.). For most admin tables, a single line is fine.

## When the table starts feeling slow

In order of cheap to expensive:

1. Reduce columns. Wide tables are expensive to render.
2. Cap row count via pagination (lower `pageSize`).
3. Move to server mode if data is large.
4. Virtualize rows (combine with `add-virtualized-list`).
5. Profile — likely the cell renderers are doing heavy work. Memoise inside the column def's `cell` function or simplify what's rendered.

Don't reach for virtualisation before checking the first four.
