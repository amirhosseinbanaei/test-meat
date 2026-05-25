---
name: add-design-system-foundation
description: Set up the FE team's locked three-layer design system architecture — `ui/` (shadcn/Radix primitives, vendored, read-only) → `ds/` (project's design system, the public component API) → `form/` (react-hook-form wrappers around ds/). Drops the shared variant tokens (`_shared.ts` — base/disabled/aria/focusVisible/placeholder/popoverContent), `useSlots` hook (icons + tooltips), `useControllableState` hook, `InputOption<T>` global type, `toOptions()` utility, the RHF `Form` provider, and optional Storybook 10 setup. Run ONCE per project, right after `add-common-hooks` — every feature thereafter builds on top of this.
allowed-tools: Read, Write, Bash(npm install:*)
---

# Set up the design system foundation

This skill installs the **architectural foundation** for the project's design system. After this runs, every component the team builds follows the three-layer pattern; every form uses the locked RHF `Form` provider; every dropdown / select uses the `InputOption<T>` shape; every reusable visual element ends up in `ds/`.

This is run once per project. The decisions baked in here are not negotiable per-feature.

## The three-layer architecture (locked)

```
src/common/components/
├── ui/         ← Layer 1: shadcn primitives (vendored from shadcn CLI). READ-ONLY.
├── ds/         ← Layer 2: the project's design system. Wraps ui/ with brand styles + slots + classNames.
├── form/       ← Layer 3: RHF-connected wrappers around ds/.
├── variants/   ← CVA variant definitions, one file per ds component + _shared.ts.
└── (custom)    ← Composite / feature components that don't fit ds/ (e.g. PageHeader, EmptyState).
```

**The rules:**
- `ui/` is treated as a vendor dependency. Never edit. `npx shadcn@latest add` writes here.
- `ds/` is the **public API**. Product code imports from `@/common/components/ds/<Name>` — never from `ui/`.
- `form/` wraps `ds/`. Product code imports from `@/common/components/form/Form<Name>` for any form-connected field.
- Each `ds/` component has one variant file in `variants/<componentName>.ts` (camelCase the variant file even though the component is PascalCase — variant files aren't components).
- Composite / feature shells (page headers, layouts, empty states) that don't slot into the design-system mental model go in `common/components/` at the root or in a feature module if scoped.

## The extraction rule (locked)

**When a piece of JSX is repeated 3+ times with the same shape and intent, extract it as a component.** Not "components that look similar" — components that mean the same thing.

- 3 product cards on a page → one `ProductCard` component.
- 3 KPI tiles on a dashboard → one `KpiTile` component.
- A button group used in the top-right of three different pages → one `PageActionGroup` component.
- 3 `<Button>`s that happen to be buttons → not extraction-worthy. They're already components.

Where the extracted component goes:
- Used inside one feature → `src/modules/<feature>/components/<Name>.tsx`.
- Used by 3+ unrelated features → promote to `src/common/components/<Name>.tsx`.
- Reusable interactive primitive (input, button, select-like) → `src/common/components/ds/<Name>.tsx` (follow `create-ds-component`).

The FE Lead enforces this at code-review time. Inline JSX repetition is a Duty violation.

## When to use this skill

- **Always**, once per project, immediately after `add-common-hooks`. This is non-negotiable in the project init sequence.

## When NOT to use this skill

- For a tiny one-page tool with no plans for reuse. Honest tradeoff: the three-layer architecture pays off when (a) you'll build many features against the same components, (b) brand consistency matters across pages, (c) multiple teams or developers will work in the codebase. For a throwaway one-pager, the overhead exceeds the benefit. The FE Lead may skip this skill in that narrow case — but the default is run it.

## Workflow

1. Read `references/three-layer-architecture.md` — the layer contract, what goes where, what NOT to do.
2. Read `references/extraction-rule.md` — the 3+ rule with worked examples.
3. Read `references/design-tokens.md` — the locked CSS variable structure for `globals.css`.
4. Read `references/classnames-and-slots-api.md` — the locked component-prop conventions every ds component follows.
5. Read `references/storybook-conventions.md` — story file location, story shape, autodocs.
6. Drop the files:
   - `assets/_shared.ts.template` → `src/common/components/variants/_shared.ts`
   - `assets/useSlots.tsx.template` → `src/common/hooks/useSlots.tsx`
   - `assets/useControllableState.ts.template` → `src/common/hooks/useControllableState.ts`
   - `assets/input-option.ts.template` → `src/common/types/input-option.ts`
   - `assets/toOptions.ts.template` → `src/common/utils/to-options.ts`
   - `assets/Form.tsx.template` → `src/common/components/form/Form.tsx`
7. Apply the patch: `assets/globals.css.tokens.patch` documents the design tokens to add to `src/app/globals.css` under `@theme`. Merge into the existing globals.
8. **Set up Storybook** (default on; skip only if FE Lead explicitly opted out):
   ```bash
   npx storybook@latest init --type nextjs --skip-install
   npm install
   ```
   - Move `.storybook/main.ts` stories glob to `src/common/stories/**/*.stories.@(ts|tsx)`.
   - Drop `assets/storybook-preview.tsx.template` → `.storybook/preview.tsx` (replaces the generated one — wires Tailwind + RTL toggle + decorators).
9. Create the empty folder structure: `src/common/components/{ds,form,variants}/` and `src/common/stories/`.
10. Add the global `InputOption<T>` type declaration so it's available without import. Copy `assets/global.d.ts.template` → `src/common/types/global.d.ts` (or, if the file already exists, append its `declare global` block to the existing file). Ensure the project's `tsconfig.json` includes `src/common/types/global.d.ts` in `include`.
11. Run `lint-and-typecheck`.

## What you get

After this skill runs, the following is true of the project:

- `src/common/components/variants/_shared.ts` exports `base`, `disabled`, `aria`, `focusVisible`, `placeholder`, `popoverContent`, `popoverContentItem`. Every ds component imports from here, never inlines.
- `src/common/hooks/useSlots.tsx` exports `useSlots(slots, options?)` returning `{ withTooltip, leftIcon, rightIcon, hasLeftIcon, hasRightIcon }`. Every ds component that accepts icons/tooltips uses this.
- `src/common/hooks/useControllableState.ts` exports the controlled/uncontrolled pattern hook. Every ds component uses this for `value`/`defaultValue`/`onChange`.
- `src/common/types/input-option.ts` exports `InputOption<TValue>`. Globally available type.
- `src/common/utils/to-options.ts` exports `toOptions(items, getLabel, getValue, getMeta?)`. Every selectable list uses this — never hand-build option arrays.
- `src/common/components/form/Form.tsx` exports `Form`, `FormField`, `FormItem`, `FormControl`, `FormMessage`, `FormDescription`, `FormLabel`. The RHF provider. Every form wraps in `<Form {...form}>`.
- Storybook is set up. Every ds component will get a story under `src/common/stories/<Name>/<Name>.stories.tsx`.

## What product code looks like after this skill

```tsx
// In src/app/<route>/page.tsx or src/modules/<feature>/components/...
import { Input } from '@/common/components/ds/Input';
import { FormInput } from '@/common/components/form/FormInput';
import { Form } from '@/common/components/form/Form';
import { toOptions } from '@/common/utils/to-options';

// InputOption<T> is global — no import needed.
const options: InputOption[] = toOptions(users, u => u.name, u => u.id);
```

## Files in this skill

- `assets/_shared.ts.template` — the locked variant tokens.
- `assets/useSlots.tsx.template` — the icons + tooltip hook.
- `assets/useControllableState.ts.template` — controlled/uncontrolled state.
- `assets/input-option.ts.template` — the `InputOption<T>` type.
- `assets/toOptions.ts.template` — the option-builder utility.
- `assets/Form.tsx.template` — the RHF provider.
- `assets/global.d.ts.template` — global `InputOption<T>` declaration.
- `assets/storybook-preview.tsx.template` — Storybook decorator config.
- `assets/globals.css.tokens.patch` — design-token additions for globals.css.
- `references/three-layer-architecture.md` — what each layer is for, what NOT to do.
- `references/extraction-rule.md` — the 3+ rule with examples.
- `references/design-tokens.md` — the locked CSS variable structure.
- `references/classnames-and-slots-api.md` — the locked component-prop conventions.
- `references/storybook-conventions.md` — story location, shape, autodocs.
