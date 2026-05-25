# React 19.2 hooks — which hook for which job

A quick reference for choosing the right hook. Every example assumes the React Compiler is enabled.

## State

### `useState`
Local, ephemeral component state. The most common state hook. No special considerations under the React Compiler.

### `useReducer`
Reach for this when state transitions are non-trivial — multiple actions, derived state, validation steps. A `useReducer` setup is also easier for the compiler to reason about than several `useState`s that update together.

### `useDeferredValue`
Wrap a value that triggers expensive rendering to let React schedule the update at a lower priority. The previous value is shown while React computes the new one in the background. Use for filter inputs, search-as-you-type, anything where the input changes faster than the result can render.

### `useTransition`
Mark a state update as non-urgent and read the `isPending` flag during the transition. Use it to keep the UI responsive during route changes, tab switches, or expensive list reorders.

## Effects

### `useEffect`
Synchronise with something outside React — a subscription, a timer, an analytics call. The dependency array still matters. The React Compiler does NOT touch effects; getting the deps right is on you.

### `useLayoutEffect`
Same as `useEffect`, but runs synchronously after DOM mutation, before the browser paints. Use only when you must measure layout before the user sees the result. Otherwise prefer `useEffect`.

### `useEffectEvent` (React 19.2)
The escape hatch for the "I want the latest value of X inside this effect, but I don't want X to retrigger the effect" pattern. Declare an Effect Event in the same component or hook as the effect that uses it. Effect Events must **not** appear in the effect's dependency array — the linter enforces this.

```tsx
function Page({ userId }: { userId: string }) {
  const onView = useEffectEvent(() => {
    logView(userId);
  });

  useEffect(() => {
    onView();  // reads the latest userId when it runs
  }, []);     // …but the effect itself only runs once.
}
```

## Forms (the React 19 pattern)

These three hooks replace the old "controlled form with onSubmit handler" pattern. See `create-server-action` skill for the full setup.

### `useActionState`
The replacement for the old `useFormState`. Wraps a Server Action and returns `[state, formAction, isPending]`. State is the action's return value. Use it as the `action` prop on a `<form>`.

### `useFormStatus`
Reads the pending state of the nearest enclosing `<form>`. Must be called from a component that is a descendant of the form. Use this to drive submit button disabled state and pending UI.

### `useOptimistic`
Render an optimistic value while the real mutation is in flight. If the mutation fails, React rolls back to the original value automatically.

## Data

### `use`
Unwrap a Promise or a Context inside a component, without an effect. Crucial in Client Components for reading the `params` Promise that pages now pass down.

```tsx
'use client';
import { use } from 'react';

export default function ClientChild({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <div>{id}</div>;
}
```

`use` suspends until the value is ready — wrap the caller in `<Suspense>` if it can be in flight.

## Refs

### `useRef`
Mutable container that does not trigger re-render when changed. Still the right hook for caching DOM nodes and mutable runtime values.

### Receiving a ref from a parent
**No `forwardRef`.** In React 19, `ref` is a regular prop on function components.

```tsx
// React 18 — DON'T do this in our codebase
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} {...props} />);

// React 19 — DO this
function Input({ ref, ...props }: Props & { ref: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

## Hooks the FE team avoids

### `useMemo` / `useCallback`
The React Compiler memoises automatically. Default to writing the computation directly. The lint rules will flag uses that are likely redundant.

Exception: an external API that requires a stable reference and the compiler can't see why. Profile first, justify in a code comment, then use the hook.

### `React.memo`
Not used. The compiler memoises components automatically.

### `useId` (React 19.2 update)
Still useful for accessible form labels and aria associations. The generated prefix changed from `«r»` to `_r_` in 19.2 to be compatible with View Transitions. No source-code change needed.
