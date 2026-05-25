# The three-layer component architecture

The locked structure. Every reusable interactive component in every FE team project
lives in one of three layers. Mixing them is the highest-impact maintainability bug
in component libraries — this document exists so nobody mixes them.

## The layers

### Layer 1: `src/common/components/ui/` — Primitives

- **What lives here**: shadcn/ui components vendored by `npx shadcn@latest add`.
  These are Radix UI primitives wrapped with shadcn's accessibility patterns and
  minimal styling.
- **Filename casing**: **kebab-case** (`button.tsx`, `dialog.tsx`, `dropdown-menu.tsx`).
  This is shadcn's convention — the CLI writes these files and overwrites them on
  update. We don't rename them.
- **Treat as read-only**. Never edit a file in `ui/` to add a brand variant or a
  custom behavior. If you need that, build it in `ds/`. Editing `ui/` files breaks
  the upgrade path (shadcn CLI overwrites them) and locks the project to a snapshot.
- **What product code does with `ui/`**: nothing. Product code does NOT import from
  `@/common/components/ui/...`. Ever.
- **What `form/` does with `ui/`**: nothing. `form/` imports from `ds/`, not `ui/`.
- **What `ds/` does with `ui/`**: wraps it.

### Layer 2: `src/common/components/ds/` — Design system

- **What lives here**: the project's design system components — the public API that
  product code consumes. Each `ds/` component wraps a corresponding `ui/` primitive
  (or composes multiple) and applies:
  - CVA variants from `variants/<componentName>.ts`
  - Brand-specific styles
  - The slots API (`useSlots`)
  - The classNames API (subpart map for fine-grained overrides)
  - The controllable-state pattern (`useControllableState`)
- **Filename casing**: **PascalCase** (`Input.tsx`, `Select.tsx`, `DatePicker.tsx`).
  Matches the exported component name.
- **The export shape** (locked):
  ```ts
  export { ComponentName, type ComponentNameProps };
  ```
  Named exports only. Never default.
- **Every interactive ds component starts with `'use client';`**. The DS is the
  interactive layer.
- **forwardRef + DisplayName** (locked):
  ```ts
  const ComponentName = React.forwardRef<RefType, PropsType>((props, ref) => { ... });
  ComponentName.displayName = 'ComponentName';
  ```
- **Slots and classNames are mandatory** for any component that could plausibly
  receive icons / tooltips or need style overrides. See
  `classnames-and-slots-api.md`.

### Layer 3: `src/common/components/form/` — Form wrappers

- **What lives here**: one `Form<ComponentName>.tsx` per ds component that's
  form-connectable. `FormInput`, `FormSelect`, `FormCheckbox`, `FormDatePicker`,
  `FormTextarea`, `FormRadioGroup`, `FormSwitch`, `FormCombobox`, `FormTagInput`,
  `FormFileUpload`, `FormButton`, etc.
- **Filename casing**: **PascalCase** (`FormInput.tsx`).
- **What they do**: wrap the ds component with `react-hook-form`'s `Controller`,
  pulling `name` as a typed prop and emitting RHF errors through `FormMessage`.
- **What they DON'T do**: import from `ui/`. They wrap `ds/`. They use the
  `FormField`, `FormItem`, `FormControl`, `FormMessage` helpers from `Form.tsx`
  for the RHF wiring.
- **Generic signature** (locked):
  ```ts
  export function FormInput<TFormSchema extends FieldValues>(
    props: FormInputProps<TFormSchema>
  ) { ... }
  ```
- **The required prop is `name: Path<TFormSchema>`**. All other ds props pass through.

## How a single feature uses all three

```
src/app/(auth)/sign-up/page.tsx
  → imports SignUpForm from src/modules/auth/components/SignUpForm.tsx
       → imports Form, FormInput, FormButton from @/common/components/form/...
            → which internally wrap Input, Button from @/common/components/ds/...
                 → which internally wrap BaseInput, BaseButton from @/common/components/ui/...
                      → which are Radix/shadcn primitives
```

Each arrow points one direction. No layer reaches "upward" — `form/` doesn't import
from `app/`, `ds/` doesn't import from `form/`, `ui/` doesn't import from `ds/`.

## Where things live

| Kind | Folder | Example |
|---|---|---|
| Radix/shadcn primitive | `common/components/ui/` | `button.tsx`, `dialog.tsx` |
| DS component (project's brand) | `common/components/ds/` | `Input.tsx`, `Select.tsx` |
| Form wrapper around a DS component | `common/components/form/` | `FormInput.tsx`, `FormSelect.tsx` |
| Variant file (CVA) | `common/components/variants/` | `input.ts`, `select.ts`, `_shared.ts` |
| Page layout / shell / composite (not a primitive) | `common/components/` (root) | `AppShell.tsx`, `PageHeader.tsx`, `EmptyState.tsx` |
| Feature-specific composite | `modules/<feature>/components/` | `SignUpForm.tsx`, `JobCard.tsx` |
| Storybook story | `common/stories/<Name>/<Name>.stories.tsx` | `Input/Input.stories.tsx` |

## What NOT to do

- **Don't import from `ui/` in product code.** Product code (pages, modules)
  imports from `ds/` and `form/`. The only files that import from `ui/` are `ds/`
  components (wrapping them) and `Form.tsx` itself (using `Label`).
- **Don't import from `ui/` inside `form/`.** Form wrappers wrap ds components,
  not primitives.
- **Don't edit `ui/` files** to add brand styles. Brand goes in `ds/`.
- **Don't add a new component to `ds/` without a variant file.** Even if variants
  are trivial, the file establishes the convention and is the place to add new ones.
- **Don't add a new component to `ds/` without a Storybook story.** The story is
  the visual contract.
- **Don't add a component that's the same shape as existing components but with a
  different brand.** Change the brand tokens in `globals.css` instead.
- **Don't put feature-specific JSX in `ds/`.** A `JobCard` belongs in
  `modules/jobs/components/`, not `ds/`. The DS is brand-level building blocks,
  not feature components.

## When you need something that doesn't fit

- **You need a new Radix primitive**: install via `npx shadcn@latest add <name>`
  (or `add-shadcn-component` skill). It lands in `ui/`. Then create the matching
  `ds/<Name>.tsx`.
- **You need a composite shell** (page header, app shell, empty state, error
  boundary UI): goes in `src/common/components/` at the root (not in `ds/`).
  These are app-level composites, not design-system primitives. They may compose
  multiple `ds/` components.
- **You need a feature-specific composite** (a JobCard, a ResumePreview, a
  CompanyHeader): goes in `src/modules/<feature>/components/`. Stays feature-scoped
  until the 3+ rule kicks in.

## Why this architecture

The three-layer pattern solves four problems:

1. **Upgrade safety**. `ui/` files are vendor files — shadcn CLI overwrites them
   on update. By keeping all brand work in `ds/`, you can update shadcn without
   merge conflicts.
2. **One place to change brand**. To change the look of every input in the
   project, you change one variant file or one CSS token. Not 200 components.
3. **Forms are predictable**. Every form wrapper has the same shape. A new
   developer can add a new `FormX` in 10 minutes by copying the existing pattern.
4. **The component library has a clear public API**. Product devs know exactly
   where to import from. There are no "is this the right Input?" decisions.

## Reading order for a new contributor

1. This document.
2. `extraction-rule.md` — when JSX becomes a component.
3. `classnames-and-slots-api.md` — the locked component prop conventions.
4. `design-tokens.md` — the CSS variable layer beneath all of this.
5. `create-ds-component` skill — the workflow for adding a new ds component.
6. `storybook-conventions.md` — how to write the story.

That sequence takes about an hour and gets you producing correct DS components.
