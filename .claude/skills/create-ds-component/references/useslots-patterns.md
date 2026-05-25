# useSlots patterns

How to wire `useSlots` correctly in a ds component. The hook is in
`@/common/hooks/useSlots.tsx`; here's the consumer-side discipline.

## The default flow

```tsx
const { withTooltip, leftIcon, rightIcon, hasLeftIcon, hasRightIcon } = useSlots(slots);

return withTooltip(
  <div className="relative">
    {leftIcon}
    <Body
      className={cn(
        base,
        hasLeftIcon && 'ps-9',
        hasRightIcon && 'pe-9',
      )}
    />
    {rightIcon}
  </div>,
);
```

Five things matter:

1. **Destructure all six properties.** Even if you don't use them all, having them
   in scope makes copying patterns between components easier.
2. **Always call `withTooltip`.** It's a no-op when there's no tooltip slot.
   Wrapping unconditionally means a consumer can add a tooltip later without you
   changing the component.
3. **Wrap the body in a `relative` container.** `leftIcon` and `rightIcon` are
   absolutely positioned — they need a positioned ancestor.
4. **Use logical padding (`ps-9`, `pe-9`)**, never `pl-9` / `pr-9`. The icons
   position via `start`/`end`, RTL-aware. The padding must match.
5. **Conditional padding based on `hasLeftIcon` / `hasRightIcon`**. Don't always
   apply `ps-9` — that creates wasted space when there's no icon.

## When the component doesn't have a clear "body" element

For components like Combobox that have a trigger AND a popover, slots typically
target the trigger:

```tsx
return withTooltip(
  <BaseCombobox.Root>
    <BaseCombobox.Trigger className="relative">
      {leftIcon}
      <BaseCombobox.Input className={cn(base, hasLeftIcon && 'ps-9', hasRightIcon && 'pe-9')} />
      {rightIcon}
    </BaseCombobox.Trigger>
    <BaseCombobox.Content dir="rtl">{...}</BaseCombobox.Content>
  </BaseCombobox.Root>,
);
```

The tooltip wraps the entire root because the tooltip is "for this component" —
hovering anywhere on it should show the tooltip.

## Customizing icon size or color

`useSlots` accepts a config object as the second argument:

```tsx
const { leftIcon, rightIcon } = useSlots(slots, {
  iconClass: 'size-5 text-primary shrink-0',  // bigger icons, branded color
});
```

When to override:

- Bigger component (`Button` with `size="lg"` uses `size-5` icons).
- Branded icon color (icons in a primary button should be `text-white`, not the
  default muted).
- Override the absolute positioning if the layout doesn't match the default
  (`leftIconPosition`, `rightIconPosition` config keys).

## Components that don't accept slots

Not every component needs slots. Examples:

- **Checkbox** — there's no "left icon" meaning for a checkbox.
- **Switch** — same.
- **RadioGroup** — same (per-radio icons, if needed, would be in option's `meta`).
- **Badge** — accepts a single icon as a child or via `icon` prop, not slots.
- **Separator** — no slots.

Be deliberate. If the component genuinely never accepts an icon or tooltip, omit
the `slots` prop. Don't expose an API that doesn't work.

## Components that have MORE than left/right icons

For components with richer slot needs (e.g. a Card with header-icon + footer-
action), the `useSlots` defaults don't fit. Either:

1. Build a component-specific slot map (don't call `useSlots`; accept a
   `slots: { headerIcon, footerAction, ... }` prop and place each manually).
2. Use children-based composition (`Card.Header`, `Card.Footer`).

Choice depends on rigidity needs. The slots-map pattern is more enforced; the
children pattern is more flexible. Locked default: slots-map for predictability,
children-pattern only when the use case really demands it.

## RTL behavior

The default `useSlots` positions use `start-3` and `end-3` — Tailwind 4 logical
properties. In LTR, `start` = `left`; in RTL, `start` = `right`. The icons swap
sides automatically based on the document direction.

If you need to override the positioning (e.g. an icon that should always be on
the visual left regardless of direction):

```tsx
const { leftIcon } = useSlots(slots, {
  leftIconPosition: 'absolute left-3 top-1/2 -translate-y-1/2',  // physical left
});
```

Rare. Almost always you want the logical default.

## When `leftIcon` and `rightIcon` aren't enough

Three pieces of content (a leading icon, a separator, a trailing icon)? The slot
API doesn't fit. Two options:

1. Accept `slots.leftIcon` as a `ReactNode` and let the consumer compose:
   ```tsx
   slots={{ leftIcon: <><Icon1 /><Sep /><Icon2 /></> }}
   ```
   Simple but limits styling control.

2. Build a component-specific slot type:
   ```ts
   slots?: {
     leadingIcon?: ReactNode;
     trailingIcon?: ReactNode;
     statusIcon?: ReactNode;
     tooltip?: { content; side; delayDuration };
   }
   ```
   Then call `useSlots` for the standard parts you have (left + tooltip) and
   handle the extra slot manually.

Don't bend the standard `SlotOptions` type. Either use it as-is or roll a
component-specific replacement.

## What NOT to do

- **Don't render `slots.leftIcon` directly without going through `useSlots`**. The
  hook handles positioning, RTL, the icon-class default, and tooltip integration.
- **Don't apply `ps-9` unconditionally**. Use `hasLeftIcon &&`.
- **Don't use `pl-9` / `pr-9`**. Logical only.
- **Don't put icons in component `children`** for a slot-accepting component.
  Always use `slots`.
- **Don't forget `withTooltip`**. Wrap the root return even when you "know" no
  tooltip will be set — a consumer might add one later.
