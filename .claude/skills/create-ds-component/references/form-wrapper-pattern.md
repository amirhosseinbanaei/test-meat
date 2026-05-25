# Form wrapper pattern

The locked shape for every `Form<Name>` wrapper. Read once; the pattern is
mechanical thereafter.

## What the wrapper does

Takes a ds component and connects it to react-hook-form's state. Specifically:

- Pulls `name` (the RHF field path) as a typed prop.
- Subscribes to that field's value via `Controller`.
- Renders the ds component inside `FormItem`/`FormControl`.
- Renders RHF validation errors via `FormMessage` (no need to pass `error`
  manually — the wrapper handles it).
- Forwards every other prop to the ds component.

## The locked file shape

```tsx
'use client';

import { type ComponentPropsWithRef } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';
import { ComponentName } from '@/common/components/ds/ComponentName';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from '@/common/components/form/Form';

export interface FormComponentNameProps<TFormSchema extends FieldValues>
  extends Omit<ComponentPropsWithRef<typeof ComponentName>, 'name' | 'error'> {
  name: Path<TFormSchema>;
}

export function FormComponentName<TFormSchema extends FieldValues>({
  name,
  description,
  ...props
}: FormComponentNameProps<TFormSchema>) {
  const form = useFormContext<TFormSchema>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <ComponentName
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              {...props}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

## Five locked rules

### 1. Generic over `TFormSchema extends FieldValues`

```ts
export function FormInput<TFormSchema extends FieldValues>(...)
```

This is what makes `name: Path<TFormSchema>` type-safe — the consumer's
`FormValues` type narrows it to only the valid field paths. Without the generic,
`name` would be `string`, and typos wouldn't be caught.

### 2. `name: Path<TFormSchema>` is required

Always required. Removing the `?`. RHF requires it.

### 3. Inherit ds props minus `name` and `error`

```ts
extends Omit<ComponentPropsWithRef<typeof ComponentName>, 'name' | 'error'>
```

- Strip `name` — RHF owns it (and the type changes from `string` to `Path<T>`).
- Strip `error` — RHF computes it from validation; the wrapper passes it through
  `FormMessage` automatically.

If the ds component has other props that conflict with RHF (rare), strip those
too. Don't add to this list lightly.

### 4. Always use `Controller` via `FormField`

```tsx
<FormField
  control={form.control}
  name={name}
  render={({ field }) => (
    <ComponentName
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      {...props}
    />
  )}
/>
```

`FormField` wraps RHF's `Controller`. It gives you `field.value`, `field.onChange`,
`field.onBlur`, `field.ref` — the four things every input needs. **Always wire
all four**, even when the ds component might not use them. RHF needs them for
proper state tracking.

### 5. Never import from `ui/`

The form wrapper imports from `ds/` (the public API), not from `ui/`. Two
reasons:

- The layer contract — `form/` wraps `ds/`, not `ui/`.
- The ds component does the slots, classNames, brand styles. Bypassing it loses
  all of that.

The only `ui/` import in `form/` is `Label` (used by `FormLabel` inside
`Form.tsx`). That's the foundation file, not a wrapper.

## Common patterns

### Components with custom event signatures

Some ds components don't have a standard `onChange(e)`. Examples:

- `Select` has `onValueChange(value: string)`.
- `DatePicker` has `onChange(date: Date | undefined)`.
- `Checkbox` has `onCheckedChange(checked: boolean)`.

Wire them explicitly:

```tsx
// FormSelect.tsx
<Select
  value={field.value}
  onValueChange={field.onChange}
  onOpenChange={(open) => { if (!open) field.onBlur(); }}
  {...props}
/>
```

The `field.onChange` works for both signatures — it just takes whatever the
component emits and stores it as the field's value.

### Components with controlled state requiring more than value/onChange

For `TagInput` (returns an array), `Combobox` (with async loading state),
`FileUpload` (returns File[] and progress) — pass whatever the ds component
needs:

```tsx
<FormField
  control={form.control}
  name={name}
  render={({ field }) => (
    <Combobox
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      // Combobox-specific async props pass through via {...props}:
      {...props}
    />
  )}
/>
```

The async-loading state lives outside RHF — pass it as a regular prop.

### When the ds component's `value` shape differs from the RHF field

Sometimes the ds component emits a richer value than the form needs. Example:
`Combobox` emits `InputOption | null`, but the form wants `string`. Add a small
adapter:

```tsx
<FormField
  control={form.control}
  name={name}
  render={({ field }) => (
    <Combobox
      value={options.find((o) => o.value === field.value) ?? null}
      onChange={(opt) => field.onChange(opt?.value ?? '')}
      onBlur={field.onBlur}
      options={options}
      {...props}
    />
  )}
/>
```

The wrapper does the translation. The form stays clean (it stores strings); the
ds component stays clean (it works with full options).

## What the wrapper does NOT need

- **No own `useState`**. RHF owns the state.
- **No own validation**. The schema (zod, etc.) owns validation; RHF runs it.
- **No own error rendering**. `FormMessage` reads from RHF's `formState.errors`
  and renders automatically.
- **No `useEffect` for syncing state**. If you find yourself reaching for one,
  the wiring is wrong — fix the wiring.

## What NOT to do

- **Don't wrap your form code in `<FormProvider>` manually** — the `Form` export
  from `Form.tsx` is the FormProvider. Use it:
  ```tsx
  const form = useForm<FormValues>(...);
  return <Form {...form}><form onSubmit={form.handleSubmit(...)}>...</form></Form>;
  ```
- **Don't import from `ui/`** in a form wrapper.
- **Don't accept `error` as a prop**. RHF provides it.
- **Don't omit `field.onBlur`** — RHF needs it for touched-state tracking.
- **Don't skip the generic** (`<TFormSchema extends FieldValues>`). Without it,
  `name` is `string` and you lose type-safety.
- **Don't make the wrapper "smart"**. It's a wiring layer. The ds component does
  the rendering; the schema does the validation; RHF does the state. The wrapper
  connects three things — that's all.
