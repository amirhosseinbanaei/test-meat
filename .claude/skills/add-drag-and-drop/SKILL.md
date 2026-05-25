---
name: add-drag-and-drop
description: Adds drag-and-drop interactions using `dnd-kit` — modern, accessible (keyboard-supported), headless, modular. Covers sortable lists, kanban boards with multiple columns, drag-to-target zones. Use whenever the user needs to reorder items or drag items between containers.
allowed-tools: Bash(npm *), Read, Write
---

# Add drag-and-drop

`dnd-kit` is the FE team's lock for drag-and-drop. Accessible (keyboard support out of the box), headless (you keep design control), modular (install only what you need).

## When to use

- Reordering items in a list (tasks, playlist, settings priority).
- Kanban boards — drag cards between columns.
- File upload drop zones with internal reordering (combine with `add-file-upload`).
- Drag-to-target interactions (drag a tag onto a post).

## When NOT to use

- A simple "swap with arrows" UI — buttons are fine and more discoverable for short lists.
- File uploads alone — that's `add-file-upload` with `react-dropzone`, no drag-between-items needed.
- A canvas-style infinite plane with arbitrary positions (Figma-like) — dnd-kit isn't designed for that. Escalate.

## Why dnd-kit

- Accessible by default — every drag interaction has a keyboard equivalent (Space to grab, arrow keys to move, Enter to drop).
- Headless. You render the UI; the library tracks state.
- Tree-shakeable. Core + Sortable for most cases; Modifiers / Accessibility for advanced.
- Maintained, modern (React 18+), TypeScript-native.

Rejected: `react-beautiful-dnd` (Atlassian, in maintenance mode), `react-dnd` (older API, HTML5 backend has rough edges).

## Packages to install (per-skill)

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

For accessibility announcer customisation or sensor extensions, add `@dnd-kit/accessibility` and `@dnd-kit/modifiers` only when needed.

## Inputs expected

- `kind` — `sortable-list` (one container, reorderable) | `kanban` (multiple columns, drag between) | `drop-target` (drag onto a target, no reorder).
- `axis` — `vertical` (default) | `horizontal` | `both`.

## Workflow

1. Read `references/dnd-kit-architecture.md` — sensors, contexts, the difference between `DndContext` and `SortableContext`.
2. Pick the right template from `assets/`:
   - `assets/sortable-list.tsx.template` — one-container reordering.
   - `assets/kanban.tsx.template` — multi-column drag.
3. Place at `src/modules/<feature>/components/<ComponentName>.tsx`. Drag-and-drop components are always feature-specific — a kanban board belongs in the module that owns the data being arranged.
4. Wire the state. On reorder, call a Server Action that persists the new order to the separate backend.

## Files in this skill

- `assets/sortable-list.tsx.template` — sortable list Client Component.
- `assets/kanban.tsx.template` — kanban board with multiple columns.
- `references/dnd-kit-architecture.md` — sensors, contexts, accessibility, persistence patterns.
