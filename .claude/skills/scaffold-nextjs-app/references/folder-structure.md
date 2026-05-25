# Folder structure — the modular convention

The FE team uses a **feature-modular** layout. This is non-negotiable across every project. The structure exists because flat-by-type folders (`components/`, `hooks/`, `services/` all holding files for every feature) collapse under their own weight as soon as the project has more than a handful of features.

## The shape

```
src/
├── app/                          # ROUTING ONLY
├── common/                       # code SHARED across many modules
└── modules/                      # code SPECIFIC to one feature
```

Three top-level folders under `src/`. That's the whole story.

## Why this structure

- **Encapsulation.** Auth-only code lives in `modules/auth/`. Nothing outside auth can accidentally depend on its internals.
- **Discoverability.** Working on auth means opening one folder.
- **Deletability.** Removing a feature is deleting its folder.
- **Refactor-ready.** A module that grows large enough to become a separate package is *already* shaped right.
- **Team scaling.** Two developers shipping parallel features have near-zero merge conflicts.

## Inside `app/`

`app/` is **routing only**. Each file is one of Next.js's special filenames — `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`. Pages are **thin wires** that import from modules.

```tsx
// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/modules/auth';

export default function LoginPage() {
  return <LoginForm />;
}
```

Three lines. That's the right shape for a route file. If your route file has business logic, hooks, fetcher functions, schemas — move them into the module.

Use **route groups** `(name)` to apply layouts without affecting the URL:

- `(marketing)/` — pages with the marketing layout
- `(app)/` — protected pages with the app shell layout
- `(auth)/` — login/signup pages with the auth shell

`proxy.ts` lives at the **project root** (not in `src/`) — that's where Next.js looks for it.

## Inside `common/`

Shared infrastructure. Things used by **many** modules.

```
common/
├── components/
│   ├── ui/           # LAYER 1: shadcn primitives — vendor, kebab-case, read-only
│   ├── ds/           # LAYER 2: the project's design system — PascalCase, the public API
│   ├── form/         # LAYER 3: RHF wrappers around ds/ — PascalCase
│   ├── variants/     # CVA variant files — camelCase, one per ds component + _shared.ts
│   └── (root)        # composite shells reused across modules: AppShell, PageHeader, EmptyState
├── hooks/            # cross-feature hooks — camelCase: useSlots, useControllableState, useDebouncedValue, useMediaQuery
├── lib/              # utility code: cn, dates.ts, formatters
├── services/         # api-client, session helpers — the network layer
├── stores/           # global Zustand stores (theme, sidebar, command palette)
├── contexts/         # React Context providers (theme, intl) — rare in RSC world
├── types/            # global types (User, ApiError, InputOption, global.d.ts)
├── schemas/          # shared Zod schemas (User, ApiError, common fragments)
├── utils/            # pure non-React utilities: to-options.ts, format-date.ts (optional split from lib/)
└── stories/          # Storybook stories for ds components — PascalCase folders, one per component
```

### What goes where in `common/`

| Subfolder | Use for | Examples |
|---|---|---|
| `components/ui/` | **Layer 1: shadcn primitives.** Copy in via `npx shadcn@latest add`. You own the source but treat as vendor — never edit. Filenames stay kebab-case (shadcn convention). | `button.tsx`, `dialog.tsx`, `dropdown-menu.tsx` |
| `components/ds/` | **Layer 2: the project's design system.** PascalCase files. The public API for product code. Wraps `ui/` primitives with brand styles, slots, classNames. Add via `create-ds-component`. | `Input.tsx`, `Select.tsx`, `DatePicker.tsx`, `Button.tsx` |
| `components/form/` | **Layer 3: RHF wrappers around `ds/`.** PascalCase. One `Form<Name>` per ds component. Imports from `ds/`, never from `ui/`. | `Form.tsx`, `FormInput.tsx`, `FormSelect.tsx` |
| `components/variants/` | CVA variant definitions. camelCase filenames (utility modules, not components). One file per ds component plus `_shared.ts`. | `_shared.ts`, `input.ts`, `select.ts`, `button.ts` |
| `components/` (root) | Composite shells reused across modules — NOT design-system primitives. PascalCase filenames. | `AppShell.tsx`, `PageHeader.tsx`, `EmptyState.tsx` |
| `hooks/` | React hooks used by 3+ modules. camelCase filenames. | `useDebouncedValue.ts`, `useMediaQuery.ts`, `useSlots.tsx`, `useControllableState.ts` |
| `lib/` | Utility functions, formatters, helpers. The `cn()` helper goes here. | `utils.ts`, `dates.ts`, `env.ts` |
| `services/` | The network layer. The `api-client.ts` lives here. | `api-client.ts`, `session.ts` |
| `stores/` | Zustand stores that are genuinely global. | `theme-store.ts`, `sidebar-store.ts` |
| `contexts/` | React Context providers. Rare. | `theme-provider.tsx` |
| `types/` | Type definitions used across modules. | `api.ts`, `pagination.ts`, `input-option.ts`, `global.d.ts` |
| `schemas/` | Zod schemas shared across modules. | `user.ts`, `api-error.ts` |
| `stories/` | Storybook stories for ds components. PascalCase folders. | `Input/Input.stories.tsx`, `Select/Select.stories.tsx` |
| `utils/` | Pure non-React utility functions (separate from `lib/` for codebases that want to distinguish). | `to-options.ts`, `format-date.ts` |

### The three-layer component rule

The `components/` subfolder splits across three layers — never mix them:

```
Product code (pages, modules)  →  imports from  →  ds/  and  form/
                                                       │
                                                       ▼
                                                wraps ui/ primitives
                                                       │
                                                       ▼
                                            ui/ (shadcn, never edited)
```

- **Layer 1 — `ui/`**: shadcn primitives. Vendor files. Never edited. Never
  imported directly by product code.
- **Layer 2 — `ds/`**: the project's brand-aware reusable components. PascalCase
  filenames. Public API for product code.
- **Layer 3 — `form/`**: RHF wrappers around `ds/`. PascalCase filenames. Used in
  any form-connected context.

Each layer has its own creation skill:
- `add-shadcn-component` adds primitives to `ui/`.
- `create-ds-component` adds components to `ds/` (with matching `form/` wrapper +
  Storybook story).
- `create-component` adds non-DS composites (page shells, feature components) —
  these go in `common/components/` root or `modules/<feature>/components/`.

See the `add-design-system-foundation` skill's references for the full architecture.

## Inside a module

Every module follows the same shape. Pick the subfolders the feature actually uses — don't create empty folders.

```
modules/auth/
├── components/       # LoginForm, RegisterForm, AuthGuard
├── actions/          # login.ts, logout.ts, register.ts (Server Actions)
├── services/         # auth-service.ts — typed fetchers wrapping api-client
├── schemas/          # login.ts, register.ts (Zod)
├── hooks/            # use-current-user.ts
├── stores/           # auth-related Zustand stores (rare; usually server state)
├── lib/              # auth-only helpers, e.g. token-utils.ts
├── types.ts          # auth-specific types (Session, AuthError)
└── index.ts          # ← PUBLIC API of this module
```

### What goes where in a module

| Subfolder | Use for |
|---|---|
| `components/` | Components specific to this feature: forms, panels, headers, lists. |
| `actions/` | Server Actions for this feature's mutations (`login`, `logout`, `updateProfile`). |
| `services/` | Typed functions that wrap `api-client` calls for this feature's backend endpoints. The actions call these. RSCs call these for reads. |
| `schemas/` | Zod schemas owned by this feature. Imported by the actions AND by the forms — one schema, two consumers. |
| `hooks/` | Hooks specific to this feature (`useCurrentUser`, `useDraftSync`). |
| `stores/` | Zustand stores specific to this feature. Most state belongs server-side via RSC + `cache()`. |
| `lib/` | Pure utility code for this feature. |
| `types.ts` | Types specific to this feature. Small enough to be one file most of the time. |
| `index.ts` | **The public API.** Re-exports the things other parts of the app are allowed to use. |

## The `index.ts` barrel — the contract

`index.ts` is the module's contract with the rest of the app. It re-exports the symbols other code may import. Everything else is internal.

```ts
// src/modules/auth/index.ts

// Components: the public surface
export { LoginForm } from './components/login-form';
export { RegisterForm } from './components/register-form';
export { AuthGuard } from './components/auth-guard';

// Hooks
export { useCurrentUser } from './hooks/use-current-user';

// Actions — only export the ones called from outside the module
export { logout } from './actions/logout';

// Types
export type { Session, User } from './types';

// NOT exported:
//   - services/auth-service.ts (internal implementation)
//   - lib/token-utils.ts       (internal implementation)
//   - schemas/                 (internal implementation)
//   - login / register actions (only called from this module's own forms)
```

Other code imports through the barrel:

```ts
// ✓ Correct — through the public API
import { LoginForm, useCurrentUser } from '@/modules/auth';

// ✗ Wrong — reaches into internals
import { LoginForm } from '@/modules/auth/components/login-form';
import { authService } from '@/modules/auth/services/auth-service';
```

The "deep" import path **still works** technically — TypeScript won't stop you. The rule is enforced by code review and by ESLint (a `no-restricted-imports` rule, optional but recommended).

The barrel is what keeps the modular structure from decaying. Without it, the structure is cosmetic.

## The dependency rule

One-way imports. Memorise this:

```
app/        ──→  modules/       (routes import module surfaces)
modules/    ──→  common/        (modules import shared infrastructure)
common/     ──→  (nothing upward)
modules/    ──→  modules/       ✗ FORBIDDEN
```

| Direction | Allowed? | Notes |
|---|---|---|
| `app/` → `modules/` | ✓ | The point of `app/` is to compose modules into routes. |
| `app/` → `common/` | ✓ | Routes occasionally need shared UI (loading skeleton, error boundary). |
| `modules/` → `common/` | ✓ | Modules pull in shared infrastructure freely. |
| `modules/auth/` → `modules/blog/` | ✗ | **Cross-module imports are forbidden.** |
| `common/` → `modules/` | ✗ | Common knows nothing about modules. |
| `common/` → `common/` | ✓ | Within common, free. |

### When you think you need a cross-module import

You don't. The right move:

1. **Identify what you're trying to import.** Is it data, a component, a hook?
2. **Promote it.** Move it to `common/` (if it's truly shared) or create a *new* module that both A and B depend on.
3. **Update the importers.** They now both import from `common/` or the new module.

Common case: "blog needs to display the current user". The answer isn't `import { useCurrentUser } from '@/modules/auth'` from inside blog — that creates module coupling. The answer is: `useCurrentUser` is so universally useful that it belongs in `common/hooks/`, and both auth and blog use it from there.

Even better in this specific case: pass the user as a prop from the route (which can call `getCurrentUser()` in RSC) into both modules' surfaces. No hook needed.

## Decision rules: common or module?

Three questions, in order:

1. **Is this used by exactly one feature?** → it belongs in that module.
2. **Is this used by 2 features that are tightly related?** → keep it in whichever module owns the concern, or create a parent module.
3. **Is this used by 3+ unrelated features OR is it infrastructure?** → it belongs in `common/`.

The **rule of three**: don't promote something to `common/` until at least 3 unrelated places need it. Premature promotion creates tight coupling and unclear ownership.

### Examples

| Code | Where it goes |
|---|---|
| `<LoginForm>` | `modules/auth/components/login-form.tsx` |
| `login` Server Action | `modules/auth/actions/login.ts` |
| `cn()` Tailwind class merger | `common/lib/utils.ts` (shadcn convention) |
| `formatDate()` | `common/lib/dates.ts` |
| `api-client` HTTP wrapper | `common/services/api-client.ts` |
| `session.ts` cookie helpers | `common/services/session.ts` |
| `useCurrentUser` (called from many surfaces) | `common/hooks/use-current-user.ts` |
| `useDraftAutoSave` (called only in the blog editor) | `modules/blog/hooks/use-draft-auto-save.ts` |
| `<Button>` shadcn primitive | `common/components/ui/button.tsx` |
| `<AppShell>` top-level layout wrapper | `common/components/app-shell.tsx` |
| `<BlogPostHero>` | `modules/blog/components/blog-post-hero.tsx` |
| `User` type | `common/types/user.ts` (used by many modules) |
| `BlogPost` type | `modules/blog/types.ts` |
| `loginSchema` (Zod) | `modules/auth/schemas/login.ts` |
| `userSchema` (Zod, used by auth + profile + admin) | `common/schemas/user.ts` |
| Theme Zustand store | `common/stores/theme-store.ts` |
| Blog draft Zustand store (one editor uses it) | `modules/blog/stores/draft-store.ts` |

## Path aliases

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/common/*": ["./src/common/*"],
      "@/modules/*": ["./src/modules/*"]
    }
  }
}
```

Use the most specific alias that fits:

- `import { Button } from '@/common/components/ui/button';`
- `import { LoginForm } from '@/modules/auth';`
- `import { api } from '@/common/services/api-client';`

## Examples of common imports

```tsx
// In a route file (app/(auth)/login/page.tsx)
import { LoginForm } from '@/modules/auth';
import { PageHeader } from '@/common/components/page-header';

// In a module component (modules/auth/components/login-form.tsx)
'use client';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { loginSchema } from '../schemas/login';  // relative within module — fine
import { login } from '../actions/login';

// In a module action (modules/auth/actions/login.ts)
'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { setSession } from '@/common/services/session';
import { authService } from '../services/auth-service';
import { loginSchema } from '../schemas/login';

// In a module service (modules/auth/services/auth-service.ts)
import 'server-only';
import { postJson } from '@/common/services/api-client';
```

## Within-module imports: relative or absolute?

Inside a module, **prefer relative imports** for siblings and one-level-deep:

- `../actions/login` from inside `components/`
- `./login-form` for siblings in the same folder
- `../schemas/login` from inside `actions/`

Outside the module (to another module's public surface, or to common), **always use the path alias**:

- `@/common/components/ui/button` — not `../../../common/...`
- `@/modules/auth` — never reach into another module

The reason: relative imports inside a module keep its files *movable* (rename or relocate the module, the internals don't break). The alias for "leaving the module" is what makes the dependency direction visible.

## Anti-patterns

- **Cross-module imports.** `import { x } from '@/modules/blog'` from inside `modules/auth/`. Forbidden. Promote to `common/`.
- **Deep imports into another module's internals.** `import { Internal } from '@/modules/auth/components/internals/x'`. Use the barrel.
- **Business logic in `app/`.** Routes are wires. If `page.tsx` has more than ~10 lines of logic, you've put module code in the wrong place.
- **Folders named after types, not features.** `common/` is type-grouped on purpose (it's shared infrastructure); `modules/` is feature-grouped on purpose. Don't create `src/services/` at the top level.
- **Promoting before three modules need it.** A `common/lib/blog-formatter.ts` used by exactly one place is a smell.
- **A module that imports nothing from `common/`.** Almost certainly means it's reinventing utilities. Check first.
- **A `common/` folder that imports from `modules/`.** Direction violation. Refactor immediately.
- **No `index.ts` in modules.** Without barrels, the structure decays into a flat one.

## Where the existing skills place files

This is the map every skill follows. The skill's `SKILL.md` reiterates the specific location.

| Skill | Output goes to |
|---|---|
| `scaffold-nextjs-app` | Creates `src/app/`, `src/common/{components,lib,services,hooks,stores,contexts,types,schemas}/`, `src/modules/` |
| `create-route` | `src/app/...` — route files only |
| `create-component` | Asks: shared or feature-specific? → `src/common/components/...` or `src/modules/<feature>/components/...` |
| `create-server-action` | `src/modules/<feature>/actions/...` (99% of the time). Common only for actions used by 3+ unrelated features. |
| `add-shadcn-component` | `src/common/components/ui/<name>.tsx` |
| `add-zustand-store` | Global → `src/common/stores/`. Feature-specific → `src/modules/<feature>/stores/`. |
| `add-tanstack-query` | Feature-specific — `src/modules/<feature>/hooks/` or `src/modules/<feature>/queries/`. |
| `add-rhf-form` | Feature-specific — `src/modules/<feature>/components/`. Schema goes to `src/modules/<feature>/schemas/`. |
| `format-date` | `src/common/lib/dates.ts` (the single dates module) |
| `setup-backend-auth` | Creates `src/modules/auth/` (the auth module) AND drops infrastructure into `src/common/services/` (api-client, session). `proxy.ts` at project root. |
| `add-animation` | Lives inside the consuming component — no central file. |
| `add-file-upload` | Component lives in the consuming module. Generic dropzone in `src/common/components/`. Compression helper in `src/common/lib/compress-image.ts`. |
| `add-rich-text-editor` | Inside the consuming module (the blog editor goes in `modules/blog/components/`). |
| `add-carousel` | Inside the consuming component — no central file. |
| `add-virtualized-list` | Inside the consuming module. |
| `add-data-table` | The generic `DataTable<T>` wrapper goes to `src/common/components/data-table.tsx`. Per-table column definitions go in the consuming module. |
| `add-drag-and-drop` | Inside the consuming module. |
| `add-markdown-content` | Renderer at `src/common/components/content/markdown.tsx`. |

## When the structure is wrong for your project

This structure assumes a project with 3+ features. For a single-purpose marketing site with no real "modules", the structure is overkill — you could skip `modules/` entirely and put everything in `common/`. But: most projects grow. Starting modular costs almost nothing; retrofitting later is painful. The default stays modular.

For very large projects (20+ modules), the next step up is full Feature-Sliced Design with explicit layers (`shared`, `entities`, `features`, `widgets`, `pages`). Not the default; escalate to FE Lead if a project's size warrants it.
