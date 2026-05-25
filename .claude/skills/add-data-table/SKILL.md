---
name: add-data-table
description: Adds a data table — sortable, filterable, paginated, with row selection — using TanStack Table for the logic and shadcn's Table primitive for the styling. Use whenever the screen needs a list of records with operations: admin user lists, product catalogues, log viewers, anything with columns and actions. For simple bulleted lists, use the create-component skill instead.
allowed-tools: Bash(npm *), Bash(npx *), Read, Write
---

# Add a data table

Lock for any "list of records with columns" UI. TanStack Table is headless — we wire its hooks to shadcn's `Table` primitive for styling.

## When to use

- Admin user / customer / product listings.
- Log viewers.
- Order / transaction lists.
- Anything with: columns, sorting, filtering, pagination, selection, or expandable rows.

## When NOT to use

- Simple flat list with no columns or operations — that's just a `<ul>` or `create-component`.
- Spreadsheet editing (in-cell editing across thousands of cells) — TanStack Table isn't designed for that. Use AG Grid (commercial) or escalate.
- Performance-critical list rendering thousands of items at once — combine with `add-virtualized-list` instead.

## Why TanStack Table

- Same team as TanStack Query and TanStack Virtual — consistent API.
- Headless. You write the markup; the library handles state.
- Composable. Sort + filter + paginate + select are each opt-in features.
- Server-driven OR client-driven. Same API; different mode.

The rejected alternatives: AG Grid (commercial, heavy), Material React Table (couples you to MUI), simple custom — fine for one tiny table, painful when the second feature lands.

## Packages to install (per-skill)

```bash
npm install @tanstack/react-table
npx shadcn@latest add table
```

The shadcn `table` adds `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>` — pure presentational components.

## Inputs expected

- `table_name` — camelCase, e.g. `usersTable`, `ordersTable`.
- `data_source` — `client` (everything in memory) | `server` (pagination/sort/filter all driven by the backend).
- `features` — list: `sorting`, `filtering`, `pagination`, `row-selection`, `column-visibility`, `expanding`.

## Workflow

1. Read `references/table-architecture.md` — column definitions, state, server vs client mode.
2. Read `references/table-patterns.md` — common patterns: sortable header, row actions menu, bulk delete, server-side filtering.
3. Copy `assets/data-table.tsx.template` to `src/common/components/data-table.tsx`. **This is the generic wrapper** — placed in `common/` because every module that has a table reuses the same one.
4. Copy `assets/columns.ts.template` to `src/modules/<feature>/components/<TableName>.columns.ts`. **Column definitions are feature-specific** — the columns for a Users table live in `modules/admin-users/`, not in common.
5. Call the table from the page or section component, passing data + the module's columns.

## Files in this skill

- `assets/data-table.tsx.template` — reusable `DataTable<T>` Client Component.
- `assets/columns.ts.template` — column definitions example.
- `references/table-architecture.md` — TanStack Table's mental model, column defs, state.
- `references/table-patterns.md` — sortable headers, row actions, bulk operations, server-side mode.
