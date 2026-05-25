# File and folder naming convention

A locked, non-negotiable convention. Same rule, every project, no per-developer drift. Use ESLint's `unicorn/filename-case` rule to enforce mechanically — but the human rule is below.

## The rules

| Category | Case | Examples |
|---|---|---|
| **React component files** | **PascalCase** | `LoginForm.tsx`, `BlogPostCard.tsx`, `PageHeader.tsx`, `DataTable.tsx` |
| **React hook files** | **camelCase** | `useDebouncedValue.ts`, `useCurrentUser.ts`, `useLocalStorage.ts` |
| **Every other source file** | **kebab-case** | `auth-service.ts`, `api-client.ts`, `dates.ts`, `format-currency.ts`, `login.action.ts` |
| **Config and root files** | **kebab-case or lowercase** as the tool requires | `next.config.ts`, `tsconfig.json`, `package.json`, `eslint.config.mjs`, `proxy.ts` |
| **Folders** | **kebab-case** | `modules/auth/`, `common/components/ui/`, `modules/blog-posts/` |
| **Tests** | **same case as the file being tested**, `.test.` or `.spec.` infix | `LoginForm.test.tsx`, `auth-service.test.ts`, `useDebouncedValue.test.ts` |

**Snake_case (`like_this.ts`) is forbidden.** No file in the codebase uses it. ESLint will block it.

## What goes where, with concrete examples

```
src/
├── app/
│   ├── layout.tsx                      ← Next.js convention (lowercase, locked by framework)
│   ├── page.tsx                        ← same
│   ├── proxy.ts                        ← Next.js convention
│   └── (auth)/
│       └── login/
│           └── page.tsx
├── common/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx              ← shadcn primitive, kebab-case by vendor convention
│   │   │   ├── dialog.tsx              ← shadcn primitive
│   │   │   └── dropdown-menu.tsx       ← shadcn primitive
│   │   ├── AppShell.tsx                ← our custom component, PascalCase
│   │   ├── PageHeader.tsx              ← our custom component
│   │   ├── EmptyState.tsx
│   │   └── DataTable.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts          ← hook, camelCase
│   │   ├── useDebouncedValue.ts
│   │   └── useMediaQuery.ts
│   ├── lib/
│   │   ├── utils.ts                    ← non-React module, kebab-case
│   │   ├── dates.ts
│   │   ├── env.ts
│   │   └── format-currency.ts
│   ├── services/
│   │   ├── api-client.ts
│   │   ├── session.ts
│   │   └── http.ts
│   ├── stores/
│   │   ├── theme-store.ts              ← non-React module (the Zustand store factory)
│   │   └── sidebar-store.ts
│   └── types/
│       └── api.ts
└── modules/
    └── auth/
        ├── components/
        │   ├── LoginForm.tsx           ← PascalCase
        │   ├── RegisterForm.tsx
        │   └── AuthGuard.tsx
        ├── actions/
        │   ├── login.ts                ← Server Action, kebab-case (not a component)
        │   ├── logout.ts
        │   └── register.ts
        ├── services/
        │   └── auth-service.ts
        ├── schemas/
        │   ├── login.ts                ← Zod schema file, kebab-case
        │   └── register.ts
        ├── hooks/
        │   └── useCurrentUser.ts       ← camelCase
        ├── lib/
        │   └── token-utils.ts
        ├── types.ts
        └── index.ts                    ← barrel
```

## Specific cases that trip people up

### shadcn/ui primitives stay kebab-case
Files in `src/common/components/ui/` are vendored from shadcn (`button.tsx`, `dialog.tsx`, `dropdown-menu.tsx`). The `npx shadcn@latest add` CLI writes them this way. **Don't rename them** — the CLI overwrites with kebab on update, and shadcn's docs / community examples all assume this. Our convention applies to *our own* components.

### Components inside a Server Action file
Server Action files are not components, so they're **kebab-case**: `login.ts`, `update-profile.ts`. The exported function is a server action; the file is logic, not UI.

### Hook files that export multiple hooks
Still **camelCase**, named for the primary hook: `useLocalStorage.ts` exports `useLocalStorage` (primary) and optionally a `local` helper. If you have a genuinely co-equal pair, split them.

### Files that export one component + adjacent utilities
The file is named for the component (PascalCase). Co-located utilities are internal:

```
modules/blog/components/BlogPostHero.tsx
  ↳ exports BlogPostHero (default), and helper formatHeroDate (local, not exported)
```

If the utility grows to need its own tests, extract it to `modules/blog/lib/format-hero-date.ts` and import it back.

### Files that pair (component + columns / component + variants / component + types)
Same PascalCase root with a clarifying suffix. The suffix uses kebab-case:

```
modules/admin-users/components/UsersTable.tsx
modules/admin-users/components/UsersTable.columns.ts    ← columns config, dot-separated, kebab tail
modules/admin-users/components/UsersTable.types.ts      ← types, dot-separated, kebab tail
```

Reads naturally: "UsersTable, dot, columns" — same root, different role.

### Tests
Mirror the source file's case. Add `.test.` or `.spec.` immediately before the extension:

```
LoginForm.tsx               → LoginForm.test.tsx
useLocalStorage.ts          → useLocalStorage.test.ts
auth-service.ts             → auth-service.test.ts
format-currency.ts          → format-currency.test.ts
```

### Page / layout / loading / error files
Next.js dictates the names. These are **lowercase** by framework convention: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, `default.tsx`, `route.ts`, `proxy.ts`. **Don't fight the framework here** — Next.js's router resolves these by filename.

### Type-only files
Kebab-case: `src/common/types/api.ts`, `src/common/types/pagination.ts`. Inside a module, `types.ts` (single file) at the module root.

### Schema files
Kebab-case: `src/modules/auth/schemas/login.ts`, `src/modules/blog/schemas/create-post.ts`.

### Constants files
Kebab-case: `src/common/lib/constants.ts`, `src/modules/billing/lib/plan-tiers.ts`.

## Enforcement

`eslint.config.mjs` includes the `unicorn/filename-case` rule with the per-folder config:

```js
{
  files: ['src/common/components/**/*.tsx', 'src/modules/**/components/**/*.tsx'],
  rules: {
    'unicorn/filename-case': ['error', {
      case: 'pascalCase',
      ignore: ['^[a-z][a-z0-9-]+\\.tsx$']  // shadcn primitives in common/components/ui/
    }]
  }
},
{
  files: ['src/**/hooks/**/*.{ts,tsx}'],
  rules: {
    'unicorn/filename-case': ['error', { case: 'camelCase' }]
  }
},
{
  files: ['src/**/*.{ts,tsx}'],
  excludedFiles: [
    'src/**/components/**',
    'src/**/hooks/**',
    'src/app/**'  // framework files
  ],
  rules: {
    'unicorn/filename-case': ['error', { case: 'kebabCase' }]
  }
}
```

The result: violations fail CI; you can't merge a snake_case file or a `MyHook.ts` hook or a `loginForm.tsx` component.

## Why this convention

- **PascalCase for components** matches the JSX import (`import { LoginForm } from './LoginForm'`). When the file and the symbol agree, dev-tool navigation and "go to definition" feel natural.
- **camelCase for hooks** matches the hook export (`useDebouncedValue`). Same logic.
- **kebab-case for everything else** is the JS/TS ecosystem default. It works in every shell, every URL, every filesystem (case-insensitive macOS won't surprise you).
- **No snake_case** because the rest of the JS ecosystem doesn't use it; mixing conventions in one tree creates friction every time someone imports something.
- **One convention per category, no exceptions** because exceptions are the start of drift.

## Renames are mechanical

If you migrate a codebase to this convention, run the rename in one PR per category (components, hooks, then the rest). Use `git mv` so history follows. ESLint will flag any drift after the migration.
