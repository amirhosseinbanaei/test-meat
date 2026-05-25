# CVA variant patterns

How variant files are structured in this project. Locked conventions.

## File location and naming

Variant files live in `src/common/components/variants/`. One file per ds
component, named in **camelCase** matching the component:

```
variants/
├── _shared.ts          ← the locked shared tokens
├── button.ts           ← variants for ds/Button.tsx
├── input.ts            ← variants for ds/Input.tsx
├── select.ts           ← variants for ds/Select.tsx
└── datePicker.ts       ← variants for ds/DatePicker.tsx
```

Variant files are NOT components — they're utility modules, hence camelCase (not
PascalCase). Same convention as other non-component TS files.

## The locked structure

```ts
import { cva } from 'class-variance-authority';
import {
  base, disabled, aria, focusVisible, placeholder,
} from './_shared';

export const inputVariants = cva(
  // Base classes — array of strings, one logical group per element.
  [
    base,
    disabled,
    aria,
    focusVisible,
    placeholder,
    'w-full',  // any component-specific base
  ],
  {
    variants: {
      variant: {
        outline: 'bg-white/60',
        fill: 'bg-ds-gray-200/40 border-0',
        ghost: 'bg-transparent border-0',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
);
```

Three rules:

1. **Always import from `_shared.ts`**. Never inline `h-base-height` or the
   disabled/aria/focus tokens. If a token needs to change, change it once in
   `_shared.ts`.
2. **Use array form for the base classes**, one logical group per element. Makes
   the diff readable when you add or remove a group.
3. **Always declare `defaultVariants`**. Even if there's only one variant axis,
   explicit defaults prevent surprises when consumers omit the prop.

## Composing tokens

`_shared.ts` exports these locked tokens — compose what you need:

| Token | Use it on |
|---|---|
| `base` | Input-like (Input, Textarea, Select trigger, Combobox trigger, DatePicker trigger). Adds height/min-width/radius/border/padding/text-size. |
| `disabled` | Anything that can be disabled. |
| `aria` | Anything that has ARIA state (aria-expanded, aria-invalid). |
| `focusVisible` | Anything keyboard-focusable. |
| `placeholder` | Components with a placeholder slot. |
| `popoverContent` | Dropdown/popover content panels (Select content, Combobox content, DatePicker calendar wrapper). |
| `popoverContentItem` | Items inside dropdown/popover content. |

You won't always use all of them. A Button doesn't need `placeholder`. A Badge
doesn't need most of them — it has its own minimal variant. Use judgment, but
when in doubt, include `disabled` and `aria` — they're almost always relevant.

## Variant axes

Most components have 1–2 variant axes. Common ones:

- `variant` — the visual treatment (outline, fill, ghost, primary, secondary).
- `size` — sm / md / lg (only if the component genuinely supports multiple
  sizes; many input-like components are locked to one height via `--base-height`).
- `intent` — info / success / warning / error (for status-aware components like
  Badge, Alert).

If you have more than 3 axes, the component is doing too much. Split it.

### Avoid: large variant axes

A `variant` axis with 8 options means the component is trying to be 8 components.
Two strategies:

1. **Split the component**. `<Button variant="primary">` and
   `<ButtonIcon variant="primary">` are clearly different things. Don't unify.
2. **Push to slots**. If the variation is "with icon" vs "without icon", that's a
   slot, not a variant. Use `slots.leftIcon` and let it be there or not.

## Per-state classes

CVA doesn't have a built-in concept of "states" beyond ARIA. Use Tailwind's
state-prefixed utilities inside the variant strings:

```ts
variant: {
  primary:
    'bg-primary text-white ' +
    'hover:bg-primary/90 ' +
    'active:bg-primary/80 ' +
    'data-[state=loading]:opacity-60',
},
```

For consistency, the order: `hover` → `focus` → `active` → `data-state` → `aria`.
Tailwind doesn't enforce this; the convention does.

## Compound variants

When a combination of two variant values needs special treatment:

```ts
compoundVariants: [
  {
    variant: 'ghost',
    size: 'sm',
    class: 'px-2',  // smaller padding only for small ghosts
  },
],
```

Use sparingly. If you find yourself writing many compound variants, the axes are
wrong (often size and variant are conflated).

## Tokens vs. arbitrary values

Inside variants, you should rarely write arbitrary Tailwind values (`bg-[#abc123]`).
Reach for tokens first:

- Color → token (`bg-primary`, `text-ds-gray-700`).
- Size → token (`h-base-height`) or scale value (`h-10`).
- Spacing → scale (`px-3`, `gap-4`).

If you genuinely need an arbitrary value once, OK. Third time, it earns a token.

## Tailwind merge interaction

The project's `cn()` utility is `tailwind-merge` configured for the custom
base tokens. That means in the ds component:

```tsx
className={cn(
  inputVariants({ variant }),  // includes h-base-height
  classNames?.input,           // consumer might pass h-12
)}
```

If the consumer passes `h-12`, it wins over `h-base-height` because both target
`height`. tailwind-merge handles the conflict. Don't worry about it in the
variant file.

## What NOT to do

- **Don't put consumer-overridable styles in the variant**. The variant is the
  *defaults*. Consumer overrides go through `classNames`. If a style needs to
  change per-instance, it's not a variant — it's a className.
- **Don't inline `_shared.ts` content**. Always import.
- **Don't add a variant for a one-off use case**. Variants are reusable. If only
  one feature needs a "purple-bordered" input, that's a `classNames` job.
- **Don't put long class strings on one line**. Break them across `+` or use the
  array form. Easier to diff, easier to read.
- **Don't put `'use client'` in variant files**. They're plain modules with no
  React; they run anywhere.
