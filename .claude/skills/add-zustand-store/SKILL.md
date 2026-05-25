---
name: add-zustand-store
description: Adds a typed Zustand store for genuinely client-only state. Use only when state needs to be shared between distant components AND can't reasonably live on the server (theme, sidebar open/closed, command palette, ephemeral UI). Most state should NOT be a Zustand store — RSCs + props handle it better.
allowed-tools: Read, Write
---

# Add a Zustand store

Zustand is the locked global client state library. But the FE team's bias is **strongly toward not using it**. With Server Components and props, most state that *would* have been global in a CSR app now arrives from the server. Reach for Zustand only when state is genuinely client-only and shared.

## When to use

Good fits:

- Theme / dark mode toggle.
- Sidebar / drawer open-closed state shared across pages.
- Command palette / search modal state.
- Optimistic UI that spans many components (rare — `useOptimistic` usually wins).
- A multi-step wizard whose state outlives one page.

## When NOT to use

- The state belongs to one component → use `useState`.
- The state lives on the server → fetch it in a Server Component and pass it down.
- The state is server-state for the client (lists, queries, paginated data) → use TanStack Query.
- The state is form data → use React Hook Form or the React 19 `useActionState` pattern.

If none of the "Good fits" applies, the answer is probably not Zustand.

## Inputs expected

- `store_name` — kebab-case file name, e.g. `theme`, `sidebar`, `command-palette`.
- `state_shape` — short list of fields and types (description, not actual types).

## Workflow

1. Read `references/zustand-patterns.md` — the FE team's rules: selectors, immer-vs-direct, when to slice.
2. Decide placement (see `scaffold-nextjs-app/references/folder-structure.md`):
   - **Global store** (theme, sidebar, command palette — used by many places): `src/common/stores/<store-name>.ts`.
   - **Feature-specific store** (e.g. blog draft state used only by the blog editor): `src/modules/<feature>/stores/<store-name>.ts`.
3. Copy `assets/store.ts.template` to the chosen location.
4. Replace `{{STORE_NAME}}`, the state shape type, the initial state, and the actions.
5. Import from the store as `useThemeStore`, `useSidebarStore`, etc. — always selector-based (`useStore(s => s.x)`), never bare `useStore()`.
6. If the store is feature-specific, add it to the module's `index.ts` only if external code needs to read it; otherwise keep it internal.

## Files in this skill

- `assets/store.ts.template` — typed Zustand store template.
- `references/zustand-patterns.md` — the rules: selectors, immer, slicing.
