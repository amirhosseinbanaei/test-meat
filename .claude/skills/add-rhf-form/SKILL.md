---
name: add-rhf-form
description: Builds a complex form using React Hook Form + Zod resolver, with the actual mutation handed off to a Server Action on submit. Use this ONLY when the form has rich client-side concerns — real-time validation, dynamic field arrays, multi-step wizards, very large forms (50+ fields), or async client-side validation. For simple forms, use create-server-action instead.
allowed-tools: Read, Write
---

# Add a complex form (React Hook Form + Zod + Server Action)

This is the **complex form** path. For simple forms, the right skill is `create-server-action` — it uses the React 19 native pattern (`useActionState` + `<form action>`), no form library, smaller bundle.

## The form decision rule

| Form characteristics | Path |
|---|---|
| One or two fields, server-side validation only | `create-server-action` (React 19 native) |
| Optional client validation, no rich UX | `create-server-action` |
| Real-time / cross-field validation while typing | **this skill (RHF + Zod)** |
| Dynamic / repeating fields (`useFieldArray`) | **this skill** |
| Multi-step wizard, state persists across steps | **this skill** |
| Very large form (50+ fields, controlled inputs would lag) | **this skill** |
| Async validation against the backend on blur | **this skill** |

If you're unsure, default to `create-server-action`. RHF is real bundle weight; only ship it when the form benefits.

## When to use

- The form matches one of the "this skill" rows above.
- A Server Action exists (or will be created) to handle the final submit.

## When NOT to use

- The form is simple. Use `create-server-action`.
- The form has no submit (search filters, controlled state) — use Zustand or `useState` directly.

## Inputs expected

- `form_component_name` — PascalCase, e.g. `OnboardingForm`, `BillingDetailsForm`.
- `action_import_path` — path to the Server Action that handles submit, e.g. `@/actions/save-onboarding`.
- `schema_name` — camelCase name for the Zod schema, e.g. `onboardingSchema`.

## Workflow

1. Read `references/rhf-zod-pattern.md` — the wiring between RHF, Zod, and the Server Action.
2. Define the Zod schema in `src/modules/<feature>/schemas/<schema-name>.ts` so it can be **imported by both** the form component AND the Server Action. **One schema, two consumers** is the trust-boundary win.
3. Copy `assets/form.tsx.template` to `src/modules/<feature>/components/<FormName>.tsx`.
4. Fill in placeholders and wire the form fields to the schema.
5. On submit, RHF's `handleSubmit` validates → if valid, calls the Server Action (in `src/modules/<feature>/actions/`) → server re-validates the same schema → persists → returns.
6. If the form is the module's public surface (e.g. the LoginForm of the auth module), export it from `src/modules/<feature>/index.ts`.

## Files in this skill

- `assets/form.tsx.template` — the RHF form Client Component.
- `assets/schema.ts.template` — the Zod schema (shared by form + action).
- `references/rhf-zod-pattern.md` — wiring details, error handling, field arrays, wizards.
