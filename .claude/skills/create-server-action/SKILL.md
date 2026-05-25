---
name: create-server-action
description: Creates a Server Action plus the Client Component form that calls it, using the React 19 form pattern (`useActionState` + `useFormStatus` + optionally `useOptimistic`). Use whenever the frontend-lead needs interactivity that performs a mutation — submitting a form, toggling a state, performing any write the user triggers from the UI. Prefer Server Actions over API routes for everything the frontend itself calls.
allowed-tools: Read, Write
---

# Create a Server Action

This skill scaffolds two coordinated files:

1. **The action itself** — a `'use server'` function in a `.ts` file.
2. **The form Client Component** — a `'use client'` component that calls the action via `useActionState`, drives a submit button via `useFormStatus`, and optionally renders an optimistic preview via `useOptimistic`.

The goal is to use Server Actions as the **default** way to write any mutation. Reach for an HTTP API route only when the action must be callable by something other than this frontend.

## When to use

- Submitting a form (sign-up, contact, settings save, comment post).
- Toggling a persisted state (like, follow, mark-as-read).
- Any user-triggered write that the frontend performs.

## When NOT to use

- The mutation needs to be called by a non-React client (mobile app, webhook receiver, server-to-server). Use a Route Handler (`route.ts`) instead — escalate to FE Lead.
- The mutation is read-only — that's just a fetch, not an action.

## Inputs expected

- `action_name` — camelCase, e.g. `createComment`, `updateProfile`.
- `form_component_name` — PascalCase, e.g. `CommentForm`, `ProfileSettingsForm`.
- `feature` — the module the action belongs to. Actions are almost always module-specific.
- `action_path` — where the action file goes. Default: `src/modules/<feature>/actions/<action-name-kebab>.ts`.
- `form_path` — where the form component goes. Default: `src/modules/<feature>/components/<FormName>.tsx`.
- `schema_path` — where the Zod schema goes (when shared with a form). Default: `src/modules/<feature>/schemas/<action-name-kebab>.ts`.
- `optimistic` — `true` if the form should show an optimistic update (default `false`).

## Workflow

1. Read `references/server-actions.md` — the action contract and security rules.
2. Read `references/form-hooks.md` — the React 19 hook pattern the form uses.
3. Read `references/zod-validation.md` — how the Zod schema in the template works as the trust boundary, and the rule about sharing schemas with RHF forms.
4. Create the action file from `assets/server-action.ts.template`. Fill in `{{ACTION_NAME}}`, `{{SCHEMA_NAME}}`, and the schema fields. The template uses a discriminated-union return so the form can branch on success vs error without throwing.
5. Create the form component from `assets/action-form.tsx.template`. Fill in `{{FORM_COMPONENT_NAME}}`, `{{ACTION_IMPORT_PATH}}`, and `{{ACTION_NAME}}`. If `optimistic` is true, uncomment the `useOptimistic` block.
6. Return both file paths to the FE Lead. The FE Lead then runs `lint-and-typecheck`.

## Files in this skill

- `assets/server-action.ts.template` — the action file (Zod-validated).
- `assets/action-form.tsx.template` — the form Client Component.
- `references/server-actions.md` — what a Server Action is, how it works, security rules.
- `references/form-hooks.md` — `useActionState`, `useFormStatus`, `useOptimistic`.
- `references/zod-validation.md` — schema as trust boundary, sharing schemas with RHF forms, field-error mapping.

## Output

Two `.tsx`/`.ts` files. Together they implement one mutation end-to-end: the form collects input, the action validates and persists, the form renders the result or the error.
