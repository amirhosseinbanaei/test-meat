# React Hook Form + Zod + Server Action — the wiring

The pattern in three sentences: define one Zod schema → RHF uses it on the client for instant validation feedback → the Server Action re-validates with the same schema as the trust boundary → on submit success, the form is done; on failure, server errors map back onto the right fields.

## The shared-schema rule

The Zod schema lives in `src/schemas/<name>.ts` and is imported by **both** the form Client Component and the Server Action. This is the win — without it, you write client validation and server validation twice and they drift.

```
              ┌──── @/schemas/onboarding.ts ────┐
              │  export const onboardingSchema  │
              └─────────────────────────────────┘
                  │                           │
                  ▼                           ▼
        ┌─────────────────┐         ┌──────────────────┐
        │ OnboardingForm  │         │ saveOnboarding   │
        │ (Client)        │         │ Server Action    │
        │ — zodResolver   │         │ — schema.parse   │
        └─────────────────┘         └──────────────────┘
```

If something has to be different between client and server (e.g. the server checks "email already exists"), `.extend()` the base schema on the server side — keep the base as the shared one.

## Validation modes

`useForm({ resolver: zodResolver(schema), mode: '…' })`:

| Mode | When the user sees an error |
|---|---|
| `onSubmit` (default) | Only after they click Submit. Good for short forms. |
| `onBlur` | When they leave a field. Best general default for complex forms. |
| `onChange` | While typing. Use sparingly — feels naggy unless the field really benefits. |
| `onTouched` | After first blur, then onChange. The "smart default" — quiet while typing, helpful after. |

Pick per form. The team default is `onBlur` for complex forms.

## Mapping server-side field errors back to the form

When the Server Action discovers something the client schema couldn't catch (e.g. "this email is already registered"), it returns the same `{ ok: false, error, fieldErrors }` shape used by `create-server-action`. The form uses `setError` to push each one onto the right field:

```tsx
const result = await saveOnboarding(values);
if (!result.ok) {
  if (result.fieldErrors) {
    for (const [field, message] of Object.entries(result.fieldErrors)) {
      setError(field as keyof OnboardingInput, { type: 'server', message });
    }
  }
  setServerError(result.error);
}
```

`{ type: 'server', message }` tells RHF this error came from the server (vs. the client schema). It will clear automatically the next time the user edits that field. No special handling needed.

## Field arrays (`useFieldArray`)

For dynamic / repeating fields — a team can add as many members as they want, a survey can have any number of questions.

```tsx
const { control, register, handleSubmit } = useForm<TeamForm>({
  resolver: zodResolver(teamSchema),
});
const { fields, append, remove } = useFieldArray({ control, name: 'members' });

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    {fields.map((field, i) => (
      <div key={field.id}>
        <input {...register(`members.${i}.name`)} />
        <button type="button" onClick={() => remove(i)}>Remove</button>
      </div>
    ))}
    <button type="button" onClick={() => append({ name: '' })}>Add member</button>
    <button type="submit">Save</button>
  </form>
);
```

The Zod side uses `z.array(memberSchema)`. The `field.id` from RHF is *not* your data id — it's RHF's internal key for React's reconciliation. Always use it for `key={}`, never your own index.

## Multi-step wizards

Three options, in order of preference:

1. **One form, multiple "pages".** Keep the form state in RHF, render different field groups based on a step state. Submit only on the final step. RHF preserves the values across steps automatically.
2. **One form per step, lifted state.** When the steps are wildly different shapes, build them as separate forms and lift the data to a parent. The parent submits the merged result.
3. **Server-side wizard state.** When the wizard is multi-session (user can leave and come back), persist partial state on the backend after each step. The frontend reads it on mount.

Default to option 1.

## Async / cross-field validation

Zod can do async refinement, but it's awkward to wire into the RHF validation loop. For async checks (like "is this username taken?"), do them as a normal RHF `register` validator instead:

```tsx
<input
  {...register('username', {
    validate: async (value) => {
      if (!value) return true;
      const res = await fetch(`/api/username-available?u=${encodeURIComponent(value)}`);
      const { available } = await res.json();
      return available || 'That username is taken.';
    },
  })}
/>
```

The Zod schema still enforces the *shape*; this validator handles the *async* part. The Server Action's `schema.parse` is the final defense.

## Submit handling

Use `useTransition` to keep the form responsive:

```tsx
const [pending, startTransition] = useTransition();

const onSubmit = handleSubmit((values) => {
  startTransition(async () => {
    const result = await saveOnboarding(values);
    // …
  });
});
```

`isSubmitting` (from `formState`) covers the time *during* RHF's validation; `pending` covers the time the Server Action is running. Show a spinner if either is true.

## What NOT to do with RHF in this stack

- **Don't reach for RHF for simple forms.** A two-field newsletter signup doesn't need it. Use `create-server-action`.
- **Don't make RHF "controlled" by feeding `value` through `register`.** `register` provides ref-based uncontrolled inputs — that's how RHF is fast. Use `Controller` only when wrapping third-party components that demand controlled input.
- **Don't ship two schemas (one for the client, one for the server).** Always one shared. Refine on either side via `.extend()`.
- **Don't skip `setError` for server-side field errors.** Field-specific errors must land on the field; a single top-level error message is worse UX.
- **Don't use RHF for filter / search forms.** Those don't submit — Zustand or `useState` is right.

## When to use Controller

`<Controller>` is RHF's bridge for components that don't expose a plain `ref` — common with shadcn components built on Radix. Use it for `Select`, `Combobox`, `DatePicker`, etc.:

```tsx
<Controller
  control={control}
  name="country"
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      …
    </Select>
  )}
/>
```

For plain `<input>` / `<textarea>` / `<select>`, always prefer `register` — it's lighter.
