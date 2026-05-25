---
name: create-ds-component
description: Create a new design-system component following the FE team's locked three-layer pattern. The 5-step workflow — variant file, optional new ui/ primitive, ds/ component with forwardRef + useSlots + classNames API, form/ wrapper, Storybook story. Use whenever the orchestrator needs a NEW reusable interactive component that should live in the project's design system (Input variant, Select variant, custom Button, etc.). DO NOT use for feature-specific components (those go through `create-component`) or for one-off layouts.
allowed-tools: Read, Write, Bash(npx shadcn:*)
---

# Create a new design-system component

The locked 5-step workflow for adding a component to the project's design system.
Follows the three-layer pattern set up by `add-design-system-foundation`.

## When to use this skill

The component you're creating is a **reusable interactive primitive** that's
brand-level, not feature-level:

- A new kind of input (NumberInput, CurrencyInput, PhoneInput).
- A custom select-like (MultiSelect, AsyncCombobox, GroupedSelect).
- A new button shape (IconButton, SplitButton, ToggleButton — that isn't already
  in ds/).
- A new visual primitive (Badge, Avatar, Spinner, Skeleton — if missing).
- A new dialog or popover-like (ConfirmDialog as a wrapper around shadcn Dialog).

## When NOT to use this skill

| Situation | Use instead |
|---|---|
| Feature-specific component (`JobCard`, `ResumePreview`) | `create-component` (lands in module or `common/components/` root) |
| Composite page shell (`PageHeader`, `AppShell`) | `create-component`, lands at `common/components/` root |
| One-off JSX used in one page | Inline. Promote when the 3+ rule fires. |
| Just adding a shadcn primitive that already exists in the shadcn registry | `add-shadcn-component` — only adds to `ui/` |
| Wiring an existing ds component into a form | `add-rhf-form` or hand-write a `Form<Name>` next to the existing pattern |
| Modifying an existing ds component | Edit it directly, run `lint-and-typecheck`, update the story |

## Prerequisites

- `add-design-system-foundation` has run. (Variant tokens, `useSlots`,
  `useControllableState`, `InputOption`, `Form.tsx` all exist.)
- Designs from `ui-visual-lead` (the component's appearance and variants).
- The shadcn primitive in `ui/` exists, OR you'll add it as part of this skill.

## Workflow

1. Read `references/cva-patterns.md` — how variant files are structured, how to
   compose tokens from `_shared.ts`, when to add a new variant axis.
2. Read `references/useslots-patterns.md` — how to wire `useSlots` correctly
   (positioning, padding, RTL).
3. Read `references/classnames-api.md` — how to derive the `classNames` subpart
   map from the component's DOM.
4. Read `references/form-wrapper-pattern.md` — the locked `Form<Name>` shape.
5. **Step 1 — variant file**. Create `src/common/components/variants/<componentName>.ts`
   (camelCase the filename). Use `assets/variant-file.ts.template`.
6. **Step 2 — ui/ primitive (only if needed)**. If shadcn doesn't have what you
   need, run `npx shadcn@latest add <primitive>` OR copy an existing pattern. If
   shadcn has it but you haven't installed it yet, use `add-shadcn-component`.
   **DO NOT edit shadcn primitives**; if a primitive doesn't fit, escalate to
   ui-visual-lead — maybe the design needs to use what's available, or maybe a
   new ui/ primitive is genuinely needed.
7. **Step 3 — ds/ component**. Create `src/common/components/ds/<ComponentName>.tsx`
   (PascalCase). Use `assets/ds-component.tsx.template`. Always:
   - `'use client'`
   - `React.forwardRef` with `displayName`
   - `useSlots` for icons/tooltips (if applicable)
   - `useControllableState` for controlled state (if applicable)
   - `classNames` subpart map for style overrides
   - Named export: `export { ComponentName, type ComponentNameProps }`
8. **Step 4 — form/ wrapper**. Create `src/common/components/form/Form<ComponentName>.tsx`
   (PascalCase). Use `assets/form-component.tsx.template`. Always:
   - Generic over `TFormSchema extends FieldValues`
   - `name: Path<TFormSchema>` as required prop
   - Wraps in `FormField` + `FormItem` + `FormControl` + `FormMessage`
   - Imports the ds component, NEVER the ui/ primitive
9. **Step 5 — Storybook story**. Create
   `src/common/stories/<ComponentName>/<ComponentName>.stories.tsx`. Use
   `assets/storybook-story.tsx.template`. Cover at minimum: Default, each
   variant, WithSlots, WithError, Disabled, AllVariants.
10. Run `lint-and-typecheck`.
11. Visually check in Storybook: `npm run storybook`.

## What you're producing

After this skill runs, the project has:

```
src/common/components/
├── variants/<componentName>.ts             ← Step 1
├── ui/<primitive-name>.tsx                  ← Step 2 (if added)
├── ds/<ComponentName>.tsx                   ← Step 3
└── form/Form<ComponentName>.tsx             ← Step 4

src/common/stories/<ComponentName>/<ComponentName>.stories.tsx   ← Step 5
```

Five files added (or four if no new ui/ primitive needed). Each follows the
locked template. Each is independently lint-clean and type-checked.

## What the locked component looks like

The canonical Input-like component, sketched:

```tsx
// src/common/components/variants/myComponent.ts
import { cva } from 'class-variance-authority';
import { base, disabled, aria, focusVisible, placeholder } from './_shared';

export const myComponentVariants = cva(
  [base, disabled, aria, focusVisible, placeholder, 'w-full'],
  {
    variants: {
      variant: {
        outline: 'bg-white/60',
        fill: 'bg-ds-gray-200/40 border-0',
        ghost: 'bg-transparent border-0',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
);

// src/common/components/ds/MyComponent.tsx
'use client';
import React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/common/lib/utils';
import { useSlots, type SlotOptions } from '@/common/hooks/useSlots';
import { BaseMyComponent } from '@/common/components/ui/my-component';
import { myComponentVariants } from '@/common/components/variants/myComponent';

export interface MyComponentProps
  extends Omit<React.ComponentProps<typeof BaseMyComponent>, 'size'>,
    VariantProps<typeof myComponentVariants> {
  label?: string;
  error?: string;
  slots?: SlotOptions;
  classNames?: {
    container?: string;
    label?: string;
    input?: string;
    error?: string;
  };
}

const MyComponent = React.forwardRef<
  React.ComponentRef<typeof BaseMyComponent>,
  MyComponentProps
>(({ variant, label, error, slots, classNames, ...props }, ref) => {
  const { withTooltip, leftIcon, rightIcon, hasLeftIcon, hasRightIcon } = useSlots(slots);

  return withTooltip(
    <div className={cn('flex flex-col gap-1', classNames?.container)}>
      {label && (
        <label className={cn('text-sm', classNames?.label)}>{label}</label>
      )}
      <div className="relative">
        {leftIcon}
        <BaseMyComponent
          ref={ref}
          className={cn(
            myComponentVariants({ variant }),
            hasLeftIcon && 'ps-9',
            hasRightIcon && 'pe-9',
            classNames?.input,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {rightIcon}
      </div>
      {error && (
        <p className={cn('text-xs text-destructive', classNames?.error)}>{error}</p>
      )}
    </div>,
  );
});

MyComponent.displayName = 'MyComponent';

export { MyComponent };
```

```tsx
// src/common/components/form/FormMyComponent.tsx
'use client';
import { type ComponentPropsWithRef } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';
import { MyComponent } from '@/common/components/ds/MyComponent';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/common/components/form/Form';

export interface FormMyComponentProps<TFormSchema extends FieldValues>
  extends Omit<ComponentPropsWithRef<typeof MyComponent>, 'name'> {
  name: Path<TFormSchema>;
}

export function FormMyComponent<TFormSchema extends FieldValues>({
  name,
  ...props
}: FormMyComponentProps<TFormSchema>) {
  const form = useFormContext<TFormSchema>();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <MyComponent
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

## Files in this skill

- `assets/variant-file.ts.template`
- `assets/ds-component.tsx.template`
- `assets/form-component.tsx.template`
- `assets/storybook-story.tsx.template`
- `references/cva-patterns.md`
- `references/useslots-patterns.md`
- `references/classnames-api.md`
- `references/form-wrapper-pattern.md`
