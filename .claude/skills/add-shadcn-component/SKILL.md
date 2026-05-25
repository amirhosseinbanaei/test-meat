---
name: add-shadcn-component
description: Adds a shadcn/ui component to the project. Wraps the official `shadcn` CLI so the FE Lead always uses the canonical version, ports it into `src/common/components/ui/`, and never reinvents primitives the library already ships. Use whenever a new primitive is needed (button, dialog, dropdown, form, popover, etc.).
allowed-tools: Bash(npx *), Read, Write
---

# Add a shadcn/ui component

The FE team's component primitives all come from shadcn/ui (which itself wraps Radix UI for accessibility). Components live in `src/common/components/ui/` and **you own the source code** — they're copied into the project, not installed as a package.

## When to use

- A new shadcn primitive is needed (e.g. `Dialog`, `DropdownMenu`, `Tabs`, `Toast`).
- Updating a primitive to the latest version after a shadcn release.

## When NOT to use

- The component is custom to this app (not a shadcn primitive) — write it directly using the `create-component` skill.
- The shadcn version of the component doesn't fit and a custom one is needed — extend it locally in `src/common/components/ui/` after adding the base.

## Inputs expected

- `component_name` — kebab-case shadcn component name (e.g. `button`, `dialog`, `dropdown-menu`). Full list: https://ui.shadcn.com/docs/components

## Workflow

1. Read `references/shadcn-usage.md` for the FE team's rules on customising shadcn components.
2. Run the shadcn CLI:
   ```bash
   npx shadcn@latest add <component_name>
   ```
3. The CLI:
   - Installs any required Radix primitives as runtime deps (e.g. `@radix-ui/react-dialog`).
   - Drops the component source into `src/common/components/ui/<component-name>.tsx`.
   - Updates imports in `components.json` as needed.
4. Import from `@/components/ui/<component-name>` in pages and components.
5. Customise as needed — the file is yours.

## What it looks like after

```
src/common/components/ui/
├── button.tsx          ← shadcn's Button, copied in
├── dialog.tsx
├── dropdown-menu.tsx
└── …
```

Each file is regular TypeScript + Tailwind. The React Compiler memoises them automatically.

## Files in this skill

- `references/shadcn-usage.md` — when to customise vs extend, the cn() helper, common pitfalls.
