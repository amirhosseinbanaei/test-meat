# dnd-kit architecture

`dnd-kit` separates concerns cleanly across a few primitives. Internalising these saves hours of trial-and-error.

## The three layers

| Layer | What it does |
|---|---|
| **DndContext** | The outer provider. Holds the drag state, dispatches events (`onDragStart`, `onDragOver`, `onDragEnd`), decides collisions. One per drag-and-drop surface. |
| **SortableContext** | Inside DndContext. Marks a set of items as a sortable list, with a strategy (vertical, horizontal, grid). Used for reordering — not needed for free-form drop targets. |
| **useSortable / useDraggable / useDroppable** | The hooks on individual items. `useSortable` for reorderable items, `useDraggable` + `useDroppable` for "drag this onto that" without ordering. |

For a sortable list: one `DndContext`, one `SortableContext`, `useSortable` per row.
For a kanban: one `DndContext`, one `SortableContext` per column, `useSortable` per card.
For a drag-onto-target: one `DndContext`, `useDraggable` on the source, `useDroppable` on the target.

## Sensors

Sensors translate user input into drag events. The two we always use:

| Sensor | Why |
|---|---|
| `PointerSensor` | Covers mouse, touch, and pen. Modern default. |
| `KeyboardSensor` | Required for accessibility. Lets users drag with the keyboard. |

```ts
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
);
```

The `activationConstraint: { distance: 5 }` is critical for items that are also clickable — the drag only starts after the pointer moves 5 px. Without it, every click would be interpreted as the start of a drag.

Alternative: `delay: 200` activates after a 200 ms hold. Use this on touch surfaces where horizontal scroll and drag share the same gesture.

## Collision detection

Decides which droppable the user is hovering over. Two algorithms cover most cases:

- `closestCenter` (the default for sortable lists). The droppable closest to the dragged item's center wins. Works well when items are similar in size.
- `pointerWithin`. The droppable directly under the pointer wins. Best for kanban-style boards with large column targets that contain smaller cards.

For more advanced cases (rectIntersection, closestCorners), check dnd-kit's docs — but `closestCenter` + `pointerWithin` cover 95% of layouts.

## Accessibility (built in, opt-out only)

dnd-kit ships keyboard support and screen-reader announcements automatically. You don't have to do anything to enable them — they happen.

The default keyboard interaction:

| Key | Action |
|---|---|
| Tab | Move focus to the drag handle. |
| Space (or Enter) | Lift the item. |
| Arrow keys | Move the item. |
| Space (or Enter) | Drop. |
| Escape | Cancel. |

Screen-reader announcements describe each step ("Picked up Task 1", "Task 1 was moved over Task 3", "Dropped Task 1 in position 3").

What you DO need to do for accessibility:

- Give the drag handle button an `aria-label` ("Drag to reorder").
- Don't disable focus on the row containing the handle.
- If items have descriptive text that isn't immediately obvious from the visual, customise the announcements via `accessibility={{ announcements }}` on `DndContext`.

## The drag overlay (optional but recommended)

By default, the dragged item moves in place — the original DOM node translates with the cursor. This can look weird when items have shadows, padding, or are inside `overflow: hidden` containers.

Use `<DragOverlay>` to render a portal-mounted "ghost" of the item that follows the cursor:

```tsx
import { DragOverlay } from '@dnd-kit/core';

const [activeId, setActiveId] = useState<string | null>(null);

<DndContext
  onDragStart={(e) => setActiveId(String(e.active.id))}
  onDragEnd={(e) => { handleDragEnd(e); setActiveId(null); }}
>
  …
  <DragOverlay>
    {activeId ? <Card id={activeId} /> : null}
  </DragOverlay>
</DndContext>
```

The original item stays in place; the overlay shows the drag preview. Cleaner visually, more performant, no `overflow` issues.

## Persisting to the backend

The drag-end handler updates local state immediately (optimistic) and fires a Server Action to persist:

```ts
const handleDragEnd = (e: DragEndEvent) => {
  // ... compute the new order in local state ...
  setLocalItems(next);
  startTransition(async () => {
    const result = await reorderItemsAction(next.map((i) => ({ id: i.id, position: i.position })));
    if (!result.ok) {
      // Roll back on failure.
      setLocalItems(previous);
      toast.error('Could not save the new order.');
    }
  });
};
```

The Server Action sends positions to the backend. The backend persists. On success, `revalidateTag` invalidates the cached list so other surfaces see the new order on next read.

**Don't persist on every move during a drag.** Persist on `onDragEnd` only. Intermediate positions during a drag are not the user's final intent.

## What about the backend contract?

Two common shapes:

1. **Send the full new order.** `[{ id: 'a', position: 0 }, { id: 'b', position: 1 }, ...]`. Simplest, backend just overwrites. Best when lists are small (< 100 items).

2. **Send only the move.** `{ id: 'b', fromPosition: 3, toPosition: 0 }`. Better for large lists; backend can use fractional indexing (LexoRank, etc.) to avoid rewriting every row.

Default to option 1 unless the lists are big enough that the diff matters.

## Cross-container drags (kanban)

When a card can move between columns, the trick is updating `columnId` during `onDragOver` (not on drop), so the visual layout updates as the user drags. The kanban template implements this. The `pointerWithin` collision strategy is critical here — `closestCenter` doesn't work well when the target areas are columns much larger than the cards.

## Modifiers

Optional constraints on the drag. Common ones:

- `restrictToVerticalAxis` / `restrictToHorizontalAxis` — lock the drag to one axis.
- `restrictToParentElement` — drag can't leave the parent container.
- `snapCenterToCursor` — the dragged item centers on the cursor.

Install `@dnd-kit/modifiers` when you need them; pass to `DndContext` via the `modifiers` prop.

## What NOT to do

- **Don't use `useDraggable` + `useDroppable` for a sortable list.** That's a kanban-style pattern, more complex than needed. Use `useSortable`.
- **Don't put the drag handle's listeners on the whole row** if the row contains clickable elements. The activation constraint helps, but a dedicated handle is the cleanest UX.
- **Don't fight the keyboard accessibility.** It just works; don't override it without a strong reason.
- **Don't drag across orientations** (vertical list + horizontal list in one `DndContext`). The collision strategies don't handle it cleanly. Use separate `DndContext`s if you need both.
