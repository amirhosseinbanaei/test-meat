---
name: create-component
description: Creates a new reusable React 19 component in TypeScript — either a Server Component (default) or a Client Component (when interactivity is required). Use whenever the frontend-lead needs to add a component file outside the App Router conventions (i.e. anything that isn't `page.tsx`, `layout.tsx`, etc.). The skill enforces the Server-by-default rule and the React-Compiler-friendly style.
allowed-tools: Read, Write
---

# Create a React 19 component

This skill generates one component file at a time. It enforces the FE team's two strongest rules:

1. **Server Components are the default.** Only generate a Client Component when at least one of the Client triggers (state, effects, event handlers, browser APIs) is genuinely needed.
2. **No manual memoisation.** No `useMemo`, no `useCallback`, no `React.memo` wrappers in generated code. The React Compiler handles all of that.

## When to use

- Building a reusable UI piece (a card, a button, a navigation link, a data table row, etc.).
- Splitting a page into smaller composable units.
- Refactoring a Server Component to extract a Client island.

## When NOT to use

- Creating a route file (`page`, `layout`, `loading`, `error`, `not-found`) — use `create-route` instead.
- Creating a Server Action — use `create-server-action` instead.
- **Creating a design-system component** (reusable interactive primitive like a new Input variant, custom Select, Badge variant) — use `create-ds-component` instead. That skill creates the variant file + ds component + form wrapper + Storybook story in one go. `create-component` is for **feature-level** components (a `JobCard`, a `ResumePreview`) and **composite shells** (a `PageHeader`, an `EmptyState`) — NOT for design-system primitives.

## Inputs expected

- `component_name` — PascalCase name, e.g. `ProductCard`, `ThemeToggle`.
- `kind` — `server` | `client`. **Default `server`.** Switch to `client` only when one of the triggers below applies.
- `scope` — `module` | `common`. **Default `module`.** Decides where the file lands:
  - `module` → `src/modules/<feature>/components/<ComponentName>.tsx` — **PascalCase filename**.
  - `common` → `src/common/components/<ComponentName>.tsx` — **PascalCase filename**. Only when 3+ unrelated modules will use it.

  Filename is **identical** to the component name. `LoginForm` → `LoginForm.tsx`. Never kebab, never snake. See `scaffold-nextjs-app/references/naming-convention.md`.
- `feature` — when `scope: module`, the module name (e.g. `auth`, `blog`).
- `props` — optional list of prop names and types (string descriptions, not real schemas).

## How to choose `server` vs `client`

Choose `client` only if **at least one** is true:
- The component uses `useState`, `useReducer`, or any other state hook.
- The component uses `useEffect` or any other effect hook.
- The component has an event handler (`onClick`, `onChange`, `onSubmit`, etc.).
- The component touches the browser (`window`, `document`, `localStorage`, geolocation, IntersectionObserver, etc.).
- The component imports a third-party library that requires the browser.

If none of those apply, choose `server`. Server Components ship zero JavaScript for that component to the client — that is the win the FE team optimises for.

If you're unsure, choose `server` and let the FE Lead override.

## Workflow

1. Read `references/server-vs-client.md` to confirm the boundary rules.
2. If `kind` is `client`, read `references/react-19-hooks.md` to use the right hook set.
3. Copy the matching template from `assets/`:
   - `server` → `assets/server-component.tsx.template`
   - `client` → `assets/client-component.tsx.template`
4. Fill in placeholders: `{{COMPONENT_NAME}}`, `{{PROPS_TYPE}}`.
5. Write the file to the resolved `path`.
6. Hand the file path back so the FE Lead can run `lint-and-typecheck`.

## Files in this skill

- `assets/server-component.tsx.template` — Server Component template.
- `assets/client-component.tsx.template` — Client Component template.
- `references/server-vs-client.md` — the boundary rules in detail.
- `references/react-19-hooks.md` — which hook to use for which job in React 19.2.

## Output

A `.tsx` file at the resolved path, ready to compile. Will pass `tsc --noEmit` immediately.
