# The classNames + slots API conventions

Two locked prop conventions every ds/ component follows. Get these right and the
DS feels like a system; get them wrong and consumers fight the components.

## The `slots` prop

For any component that could plausibly accept a left icon, right icon, or
tooltip. That's: Input, InputPassword, Textarea, Select, Combobox, DatePicker,
TagInput, Button (with icon), and most other interactive components.

### Shape

```ts
export interface SlotOptions {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  tooltip?: {
    content: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    delayDuration?: number;
  };
}
```

Components accept `slots?: SlotOptions` and pass it through `useSlots`. The
hook returns wrapped, positioned elements ready to render.

### Why slots, not children

You might ask: "why not just compose this?"

```tsx
{/* Naive alternative */}
<Input>
  <Input.LeftIcon><SearchIcon /></Input.LeftIcon>
  <Input.RightIcon>...</Input.RightIcon>
</Input>
```

The slots API trades verbosity for predictability. Consumers don't have to
remember the right child slot names or worry about ordering. Positioning (RTL-
aware, padding adjustments) happens automatically. Trade-off: it's a slightly
unusual pattern — new developers need to learn it. The locked judgment: the
predictability wins.

### Consumer usage

```tsx
<Input
  placeholder="جستجو..."
  slots={{
    leftIcon: <Search className="size-4" />,
    tooltip: { content: 'جستجو در پروژه‌ها', side: 'bottom' },
  }}
/>

<Input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  slots={{
    leftIcon: <Search className="size-4" />,
    rightIcon: search && (
      <button onClick={() => setSearch('')} type="button" aria-label="پاک کردن">
        <X className="size-4" />
      </button>
    ),
  }}
/>
```

### DS component implementation

Always via `useSlots`:

```tsx
const { withTooltip, leftIcon, rightIcon, hasLeftIcon, hasRightIcon } = useSlots(slots);

return withTooltip(
  <div className="relative">
    {leftIcon}
    <BaseInput
      className={cn(
        inputVariants({ variant }),
        hasLeftIcon && 'ps-9',
        hasRightIcon && 'pe-9',
        classNames?.input,
      )}
      ref={ref}
      {...props}
    />
    {rightIcon}
  </div>,
);
```

Notes:
- `withTooltip` is a no-op when there's no tooltip slot — always call it.
- `hasLeftIcon` / `hasRightIcon` add `ps-9` / `pe-9` (logical padding, RTL-aware)
  to make room for the icon. Never use `pl-9` / `pr-9` here.
- `leftIcon` and `rightIcon` are pre-wrapped in absolutely-positioned spans. Drop
  them inside a `relative` container.

## The `classNames` prop

For style overrides. The locked convention: ds components expose a `classNames`
**map** keyed by subpart, not a single `className` string.

### Shape (per-component)

```ts
classNames?: {
  container?: string;   // outermost wrapper
  label?: string;       // visible label
  input?: string;       // the actual input element
  description?: string; // helper text
  error?: string;       // error message
  leftIcon?: string;
  rightIcon?: string;
};
```

The exact keys depend on the component's structure. Document them in the
component's type. The pattern:

- `container` → the root wrapper of the whole component.
- Then one key per visually-meaningful subpart.

### Component implementation

```tsx
<div className={cn('flex flex-col gap-1', classNames?.container)}>
  {label && <Label className={cn('text-sm', classNames?.label)}>{label}</Label>}
  <BaseInput className={cn(inputVariants({ variant }), classNames?.input)} {...props} />
  {error && <p className={cn('text-xs text-destructive', classNames?.error)}>{error}</p>}
</div>
```

Use `cn()` (extended tailwind-merge) so consumer classes win over defaults
where they conflict — that's the whole point.

### Components with nested ds parts

When a ds component contains another ds component (e.g. `Select` has a trigger
and a popover content), the nested classNames map nests:

```ts
classNames?: {
  trigger?: { container?: string; label?: string; input?: string };
  content?: { container?: string };
  item?: string;
};
```

Pass nested objects through:

```tsx
<SelectTrigger classNames={classNames?.trigger}>...</SelectTrigger>
<SelectContent className={cn(classNames?.content?.container)}>
  {options.map((opt) => (
    <SelectItem className={cn(classNames?.item)}>{opt.label}</SelectItem>
  ))}
</SelectContent>
```

### When `className` (single string) is acceptable

For **simple wrapper components** with a single visible element — Badge,
Separator, Spinner, Skeleton — accept a single `className` instead of a
`classNames` map. The map is for components with structure.

Heuristic: if the component renders more than one styled element that a consumer
might reasonably want to target, use `classNames`. Otherwise, `className`.

## Why this convention

The pre-locked alternative is "accept `className` on the root and call it a
day." Three problems:

1. **Can't target sub-elements** — there's no way to override just the label's
   color without overriding the whole component. Consumers reach for `:has`
   selectors, descendant combinators, `!important` — all messy.
2. **Specificity wars** — the default classes on a subpart can fight whatever
   global descendant rule a consumer writes.
3. **Wrapper proliferation** — consumers wrap the component in a `<div>` with
   nested CSS just to target a subpart.

The `classNames` map sidesteps all three.

## What NOT to do

- **Don't accept arbitrary props passed to subparts** ("escape hatches" via
  `inputProps`, `labelProps`, etc.). Use the slots API for content; the
  classNames API for styles. Anything else is signal that the component's
  abstraction is wrong — push back to ui-visual-lead or refactor.
- **Don't use `style={{...}}`** in consumer code as a workaround. If `classNames`
  doesn't cover what you need, the component needs a new subpart key — file an
  issue.
- **Don't put icons inline as children** of a component that has a `slots.leftIcon`
  prop. Always go through slots.
- **Don't accept both `className` AND `classNames` on the same component**. Pick
  one (usually `classNames` for components with structure). Two surfaces for the
  same job is a leak.
- **Don't break the slots type**. If a component doesn't support a tooltip,
  `Omit` the tooltip key from the `SlotOptions` type for that component. The
  type tells consumers what's actually supported.

## Quick reference: what a ds component's prop type looks like

```ts
import type { ComponentProps } from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { SlotOptions } from '@/common/hooks/useSlots';
import { BaseInput } from '@/common/components/ui/input';
import { inputVariants } from '@/common/components/variants/input';

export interface InputProps
  extends Omit<ComponentProps<typeof BaseInput>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  error?: string;
  slots?: SlotOptions;
  classNames?: {
    container?: string;
    label?: string;
    input?: string;
    description?: string;
    error?: string;
  };
}
```

That signature is the locked shape. Every component-creating skill produces a
type that follows it.
