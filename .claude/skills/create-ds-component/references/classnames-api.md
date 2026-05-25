# classNames API — author's guide

How to design the `classNames` subpart map for a new ds component. (For
consumer-side usage, see `add-design-system-foundation/references/classnames-and-slots-api.md`.)

## The shape

```ts
classNames?: {
  container?: string;
  label?: string;
  input?: string;
  description?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
};
```

A map keyed by subpart. Each key is a class string the consumer can pass to
override styles on that subpart.

## How to derive the subpart keys

Walk the component's rendered DOM, top-down. Every element that has a default
class AND that a consumer might reasonably want to target → it's a subpart.

For an Input:

```
<div className="container">              ← classNames?.container
  <label className="label">              ← classNames?.label
    {labelText}
  </label>
  <div className="relative">             ← (not styled by default — skip)
    <span>{leftIcon}</span>              ← classNames?.leftIcon (only if it has default classes)
    <input className="input" />          ← classNames?.input
    <span>{rightIcon}</span>             ← classNames?.rightIcon
  </div>
  <p className="description">            ← classNames?.description
    {description}
  </p>
  <p className="error">                  ← classNames?.error
    {error}
  </p>
</div>
```

Result: 7 keys (container, label, leftIcon, input, rightIcon, description, error).

Skip elements that:

- Have no default class (the `<div className="relative">` above — it's
  structural, not styled).
- Aren't meaningfully targetable (deeply nested layout divs).
- Don't render in all states (e.g. error `<p>` only renders when there's an
  error — but it's still in the map because when it renders, the consumer might
  want to style it).

## How to apply them in the component

Always use `cn()` with the consumer override second:

```tsx
<div className={cn('flex flex-col gap-1', classNames?.container)}>
  <label className={cn('text-sm font-medium', classNames?.label)}>...</label>
  <input className={cn(inputVariants({ variant }), classNames?.input)} />
</div>
```

`cn()` is `clsx` + extended `tailwind-merge`. The consumer's class wins when it
conflicts with the default — that's the whole point. Without `cn()`, both classes
end up on the element and CSS's specificity rules (last-wins, sometimes) pick
inconsistently.

## Nested ds components — the classNames bridge

If your ds component contains another ds component, expose its classNames as a
nested key:

```ts
// ds/Combobox.tsx
classNames?: {
  trigger?: ComponentProps<typeof ComboboxTrigger>['classNames'];
  content?: ComponentProps<typeof ComboboxContent>['classNames'];
  item?: string;  // for ComboboxItem children
};
```

And in the implementation:

```tsx
<BaseCombobox.Root>
  <ComboboxTrigger classNames={classNames?.trigger}>...</ComboboxTrigger>
  <BaseCombobox.Content
    className={cn(popoverContent, classNames?.content?.container)}
    dir="rtl"
  >
    {options.map((opt) => (
      <BaseCombobox.Item className={cn(popoverContentItem, classNames?.item)}>
        {opt.label}
      </BaseCombobox.Item>
    ))}
  </BaseCombobox.Content>
</BaseCombobox.Root>
```

The nested object means consumers can override the trigger's label without
affecting the content panel:

```tsx
<Combobox
  classNames={{
    trigger: { label: 'text-primary' },
    content: { container: 'w-96' },
  }}
/>
```

## When to use a single `className` instead

If the component has **one visually meaningful element** (Badge, Separator,
Spinner, Skeleton), use a single `className` prop on the root and call it a
day. The map is overhead when there's nothing to nest.

Heuristic:

| Component | Style API |
|---|---|
| Badge | `className` (one element) |
| Separator | `className` |
| Skeleton | `className` |
| Spinner | `className` |
| Input | `classNames` (container, label, input, description, error) |
| Select | `classNames` (with nested trigger/content) |
| Button | `className` (one element — the button itself) |
| ButtonWithIcon | `className` (probably; icons are slots not subparts) |
| DatePicker | `classNames` (trigger + calendar content) |

## What NOT to do

- **Don't accept both `className` AND `classNames`** on the same component. Pick
  one. Confusing API; consumers won't know which wins.
- **Don't make `classNames` keys optional except where logical**. Every subpart
  key is `string | undefined` — fine. But don't omit a major subpart from the
  type just because consumers haven't asked for it yet. Be generous in what you
  expose.
- **Don't add a `style` prop** as an escape hatch. If `classNames` doesn't cover
  what you need, the subpart map needs a new key, not a separate API.
- **Don't override subpart classes with `!important`** in the component. If your
  defaults can't be cleanly overridden by consumer classes via `cn()`, the
  defaults are wrong.
- **Don't expose internal-implementation subparts**. A `div` you added just for
  flexbox alignment isn't a subpart — it's structure. Only expose things the
  consumer would semantically target ("label", "error", "input"), not structural
  scaffolding.
- **Don't break consumer overrides via specificity**. The defaults use Tailwind
  utilities; the consumer overrides use Tailwind utilities. `cn()` resolves
  conflicts correctly. If you ever feel the need for `!important`, stop — the
  classNames API is broken at that point.

## Documenting the keys

In the component's exported type, document each key:

```ts
export interface InputProps {
  /** Subpart-style overrides. Each key targets a section of the rendered DOM. */
  classNames?: {
    /** Outermost container — `<div className="flex flex-col gap-1">`. */
    container?: string;
    /** Visible label — `<label>`. */
    label?: string;
    /** The input element itself — `<input>`. */
    input?: string;
    /** Helper-text paragraph below the input. */
    description?: string;
    /** Error-message paragraph below the input. */
    error?: string;
    /** Wrapper span around `slots.leftIcon`. */
    leftIcon?: string;
    /** Wrapper span around `slots.rightIcon`. */
    rightIcon?: string;
  };
}
```

The JSDoc surfaces in Storybook's auto-generated docs and in IDE autocomplete.
Consumers learn the API by hovering.
