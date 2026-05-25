# React 19 form hooks — `useActionState`, `useFormStatus`, `useOptimistic`

These three hooks replace the old "controlled form + onSubmit handler + manual loading state" pattern. They are the standard way the FE team builds any interactive form.

## `useActionState`

Wraps a Server Action and gives you back its current state plus a "wrapped" action you pass to `<form action>`.

```tsx
const [state, formAction, isPending] = useActionState(
  action,        // your Server Action
  initialState,  // what `state` is on first render
  permalink?,    // optional, for progressive enhancement
);
```

- `state` — the latest return value of the action (or `initialState` if the action hasn't run yet).
- `formAction` — pass this to `<form action={formAction}>`.
- `isPending` — `true` while the action is in flight.

The action signature must match `(prevState, formData) => Promise<newState>`. `useActionState` calls your action with `(state, formData)` automatically.

**Use this for:** every form mutation. It is the entry point.

## `useFormStatus`

Reads the pending state of the **nearest enclosing `<form>`**. Crucial rule: it must be called from a **child** component of the form. It does not work in the same component that renders the form.

```tsx
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}

function MyForm() {
  // useFormStatus() HERE would always return pending: false. The form is below us, not above us.
  return (
    <form action={...}>
      <SubmitButton />
    </form>
  );
}
```

- `pending` — `true` while the form is submitting.
- `data` — the `FormData` currently being submitted (useful for optimistic UI).
- `method` — `'get'` or `'post'`.
- `action` — the function being called.

**Use this for:** disabling the submit button, showing a spinner inside the submit button, rendering "saving…" text. Always extract the button into its own child component so the hook actually sees the form.

## `useOptimistic`

Render a value that *assumes the mutation succeeded*, immediately, while the real mutation is in flight. If the action fails or completes with a different value, React snaps the UI back to reality.

```tsx
const [optimisticItems, addOptimistic] = useOptimistic<Item[], Item>(
  items,                       // real, server-confirmed list
  (current, optimisticItem) => [...current, optimisticItem],  // how to merge
);

async function handleAdd(formData: FormData) {
  const newItem = { id: 'temp', text: String(formData.get('text')) };
  addOptimistic(newItem);
  await addItemAction(formData);
}
```

The returned `optimisticItems` is what you render. While the action is pending, it includes the optimistic value. When the action resolves and the parent re-renders with the real updated list, the optimistic value disappears (replaced by the real one if it now matches, or simply removed).

**Use this for:** anything where the user expects an instant response — likes, comments, list reorders, toggles.

## How the three fit together

The standard form layout is:

```tsx
'use client';
import { useActionState, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';

// Submit button (a child of the form) reads form status.
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? '…' : 'Post'}</button>;
}

// The form wires the action via useActionState, and optionally optimistic state.
export function CommentForm({ comments }: { comments: Comment[] }) {
  const [state, formAction] = useActionState(postComment, null);
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (current, next: Comment) => [...current, next],
  );

  return (
    <>
      <ul>{optimisticComments.map((c) => <li key={c.id}>{c.text}</li>)}</ul>
      <form
        action={async (formData: FormData) => {
          addOptimistic({ id: crypto.randomUUID(), text: String(formData.get('text')) });
          formAction(formData);
        }}
      >
        <textarea name="text" />
        <SubmitButton />
      </form>
      {state && !state.ok && <p role="alert">{state.error}</p>}
    </>
  );
}
```

That's the full pattern. No manual `useState`, no `onSubmit`, no `fetch`, no parallel "isLoading" flag.

## Common mistakes

- Calling `useFormStatus` in the same component that renders the form. It will always return `pending: false`. Move the consumer into a child.
- Maintaining a duplicate `useState` for form values. Not needed — the action gets `FormData` directly. Only do this if you need fine-grained cross-field validation during typing.
- Mixing the React 19 form pattern with the old `useFormState`. `useFormState` is renamed to `useActionState`. The old name still works in 19 but is deprecated — use the new one in new code.
