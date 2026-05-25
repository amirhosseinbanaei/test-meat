# Storybook conventions

Every ds/ component gets a Storybook story. The story is the **visual contract**
of the component — it documents every variant and state that's allowed, and
provides a sandbox for designers / QA / new contributors to inspect the component
without spinning up the product.

## Where stories live

```
src/common/stories/
└── <ComponentName>/
    └── <ComponentName>.stories.tsx
```

- Folder per component, named in PascalCase.
- Story file in PascalCase matching the component.
- The `.storybook/main.ts` glob is set to `src/common/stories/**/*.stories.@(ts|tsx)`.

**Stories never live alongside the ds/ component file.** Keep them in
`common/stories/`. Reasons: (a) the ds/ folder stays focused on shipped code, (b)
the bundle analysis is easier when story files are separated, (c) the structure
mirrors how product code imports — there's no temptation for a developer to
import a story export by mistake.

## The locked story shape

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '@/common/components/ds/ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Design System/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'fill', 'ghost'],
    },
    // ... other args
  },
};

export default meta;

type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    placeholder: 'متن پیش‌فرض...',
    variant: 'outline',
  },
};

export const WithSlots: Story = {
  args: {
    placeholder: 'جستجو...',
    slots: {
      leftIcon: <Search className="size-4" />,
      tooltip: { content: 'جستجو', side: 'top' },
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'ایمیل',
    error: 'فرمت ایمیل صحیح نیست',
    value: 'not-an-email',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'مقدار غیرفعال',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ComponentName variant="outline" placeholder="outline" />
      <ComponentName variant="fill" placeholder="fill" />
      <ComponentName variant="ghost" placeholder="ghost" />
    </div>
  ),
};
```

## What stories must cover

For every ds component, at minimum:

| Story | Purpose |
|---|---|
| `Default` | The plainest usage. Just the component with sensible defaults. |
| One story per variant | If the component has 3 variants, show each in isolation. |
| `WithSlots` | Demonstrates the slots API (where applicable). |
| `WithError` | Error state (for input-like components). |
| `Disabled` | Disabled state. |
| `AllVariants` | Side-by-side comparison of all variants (useful for designers). |

Add more as the component grows. The goal: any visible state of the component
exists as a named story.

## The `title` convention

```ts
title: 'Design System/ComponentName';
```

Locked. Top-level group "Design System", then the component name. Storybook's
sidebar will group all ds components together.

For non-ds components (composite shells in `common/components/` at root, feature
components, etc.) — those don't get stories by default. Add a story only when the
component's visual contract is worth documenting publicly. If you do, use a
different top-level group:

- `Composite/PageHeader` for app-level shells.
- `Patterns/EmptyState` for cross-cutting patterns.

## `tags: ['autodocs']`

Locked on every story. Generates the Docs tab automatically from JSDoc comments,
prop types, and stories. Don't ship a story without it.

Add JSDoc to the component's exported props type for richer docs:

```ts
export interface InputProps {
  /** The visible label above the input. */
  label?: string;
  /** Helper text shown below the input. */
  description?: string;
  /** Error message shown below the input. Sets aria-invalid. */
  error?: string;
}
```

JSDoc on each prop appears in the auto-generated docs table.

## RTL story decorator

The Storybook preview (set up in `add-design-system-foundation`) includes a
global RTL/LTR toggle in the toolbar. Every story can be viewed in either
direction without per-story setup. The default direction is RTL for the FE
team's Persian-first products.

If a specific story has direction-sensitive content (icons that must flip), test
both directions when reviewing.

## Locked tags beyond autodocs

| Tag | When to add |
|---|---|
| `tags: ['autodocs']` | Always. |
| `tags: ['!dev']` | Hide a story from the sidebar but keep it for docs only (rare). |
| `tags: ['experimental']` | Component or story is in flux — signals to consumers not to depend on it yet. |

## Interactive stories with `play` functions

For components with rich interactions (Combobox, DatePicker, Carousel), add a
`play` function to demonstrate user flow:

```tsx
import { userEvent, within, expect } from '@storybook/test';

export const SelectsAnOption: Story = {
  args: { /* ... */ },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    await userEvent.click(canvas.getByText('تهران'));
    await expect(canvas.getByRole('combobox')).toHaveTextContent('تهران');
  },
};
```

This makes the story double as an integration test for the component. Use
sparingly — interaction stories are for documenting the happy path, not as a
substitute for a real test suite.

## Custom `render` for composed stories

When the default `args`-driven render doesn't fit (e.g. you need to show 3
instances side-by-side, or you need state), use a custom `render`:

```tsx
export const ControlledExample: Story = {
  render: function Story() {
    const [value, setValue] = React.useState('');
    return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
  },
};
```

The function form (`function Story()`) is required for hooks to work — arrow
functions in Storybook stories can't reliably hook React.

## What NOT to do

- **Don't put stories in `ds/`** or `form/`. They go in `src/common/stories/`.
- **Don't import from `ui/`** in a story. Story imports from `ds/` (the public
  API), same as product code.
- **Don't skip `tags: ['autodocs']`**. No autodocs, no docs page, no value to QA
  or designers.
- **Don't write a story without naming the variants explicitly** in `argTypes`.
  The default `argTypes` inference is OK but misses CVA-derived unions.
- **Don't dump every possible prop into one mega-story**. Split into focused
  stories, one concept per story.
- **Don't test logic in stories**. A `play` function tests interaction; unit
  tests still live in Vitest.

## Running and building Storybook

```bash
npm run storybook        # local dev — port 6007 by default
npm run build-storybook  # static build to ./storybook-static/
```

CI builds the static Storybook on every PR. Deploy the static output as a
review artifact so designers / PMs / QA can inspect the components on every
branch.
