# Working with shadcn/ui components

shadcn/ui isn't a component library in the npm sense. It's a CLI that copies component source into your repo. That changes the rules.

## You own the code

Once `npx shadcn@latest add button` has run, `src/components/ui/button.tsx` is yours. Edit it freely. There's no "ejecting", no "wrapping" pattern — when you need a project-specific variant, change the file.

## The `cn()` helper

Every shadcn component uses `cn()` from `src/common/lib/utils.ts` to merge class names. It combines `clsx` (conditional classes) with `tailwind-merge` (resolving conflicting Tailwind utilities). Always use it when conditionally applying classes — never raw string concatenation.

```tsx
import { cn } from '@/common/lib/utils';

<div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)} />
```

`tailwind-merge` ensures that if `className` (passed in) and the base classes both define `px-*`, the passed-in one wins. Without `cn()`, you'd ship conflicting Tailwind utilities and the result would be unpredictable.

## Three ways to customise

### 1. Change the source
The simplest. Open `src/components/ui/button.tsx`, edit the variants in the `cva()` call. Done.

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium …',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        brand:   'bg-amber-500 text-amber-950 hover:bg-amber-400',  // ← added
        // … the rest
      },
      // …
    },
  },
);
```

### 2. Compose at the call site
For one-off overrides, pass `className` and let `cn()` + `tailwind-merge` resolve.

```tsx
<Button className="rounded-full px-8" variant="default">Continue</Button>
```

### 3. Wrap into a project component
When the variant is used in many places, wrap once.

```tsx
// src/components/buttons/continue-button.tsx
import { Button } from '@/components/ui/button';
export function ContinueButton(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} className="rounded-full px-8" variant="default" />;
}
```

The wrapper file lives in `src/components/`, not `src/components/ui/`. Reserve `ui/` for the shadcn primitives themselves.

## Updating to a newer shadcn version

There's no version pin — you've copied the code. To pull a newer version of a component, just re-run `npx shadcn@latest add <component>`. The CLI will detect the existing file and prompt you to overwrite or skip. **Overwrite, then re-apply your customisations.**

This is why heavy customisation should go in wrappers (option 3) when possible — the wrapper survives an update, the underlying primitive can be refreshed cleanly.

## Common primitives and what they ship

| Component | Underlying Radix |
|---|---|
| `button` | none — pure Tailwind + cva |
| `dialog` | `@radix-ui/react-dialog` |
| `dropdown-menu` | `@radix-ui/react-dropdown-menu` |
| `popover` | `@radix-ui/react-popover` |
| `tabs` | `@radix-ui/react-tabs` |
| `toast` | `@radix-ui/react-toast` (or `sonner` in newer setups) |
| `form` | None — opinionated React Hook Form integration |
| `command` | `cmdk` |
| `select` | `@radix-ui/react-select` |
| `tooltip` | `@radix-ui/react-tooltip` |

When the CLI adds a primitive, it auto-installs its Radix dep. You don't have to manage those manually.

## What NOT to do

- **Don't install MUI / Chakra / Mantine / Ant Design alongside shadcn.** Pick one design system. The FE team picked shadcn.
- **Don't fight the Tailwind variants by writing inline styles.** Add the variant to the component's `cva()` definition instead.
- **Don't put project-specific business logic inside `ui/` components.** They're presentational primitives; behaviour belongs in wrappers in `src/components/`.
- **Don't bypass `cn()` when conditionally setting classes.** The Tailwind conflict resolution matters.

## Accessibility

Radix primitives handle keyboard navigation, focus management, and ARIA correctly out of the box. The shadcn wrappers preserve all of that. As long as you don't strip props (e.g. don't drop `aria-*` attributes), you keep the a11y. Always pass `{...props}` through wrappers.

For components that have visible labels (Button, Toggle, MenuItem), you generally don't need extra ARIA. For icon-only triggers, add an `aria-label`.

## Theme tokens

shadcn components reference Tailwind CSS variables defined in `src/app/globals.css` (`--background`, `--foreground`, `--primary`, etc.). To change the brand palette, edit those variables — every component picks up the new values automatically. Don't hardcode hex values in component files.
