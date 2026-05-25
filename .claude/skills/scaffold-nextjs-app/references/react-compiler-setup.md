# React Compiler 1.0 — Setup and rules

The React Compiler is a build-time tool that memoises components and hooks automatically. With it enabled, the FE Lead should write components as if every value were already memoised — and the compiler will make that true.

## Setup

Two pieces wire this up. The scaffold script handles both, but for reference:

1. **In `next.config.ts`** — set `reactCompiler: true`. This switches Next.js to compile the project through the React Compiler.
2. **As a dev dependency** — install `babel-plugin-react-compiler@latest`. Next.js runs the compiler through Babel internally; this package must be present.

```bash
npm install --save-dev babel-plugin-react-compiler@latest
```

The lint rules ship inside `eslint-plugin-react-hooks@latest` — they no longer live in a separate `eslint-plugin-react-compiler` package. Use only the hooks plugin.

## What the compiler does

For every component and every hook in the project, the compiler:

- Analyses which values change between renders.
- Auto-memoises the ones that don't, so child components and effects don't fire pointlessly.
- Applies the same logic to JSX, derived values, and hook return values.

You never see this in source code. You see it in the React DevTools — memoised components are tagged `Memo ✨`.

## What the compiler will not fix

The compiler only memoises code that already follows the Rules of React. If your code breaks the rules, the compiler will skip it (and the lint rules will tell you why). The most common rule breaks:

- **State updates inside render.** Calling `setState` during render — even conditionally — is a render loop. The `set-state-in-render` rule flags it.
- **Mutating props or state directly.** React assumes both are immutable. Use a new object instead.
- **Conditional hook calls.** Hooks must be called in the same order on every render.
- **Effects with missing dependencies** the linter cannot reason about.

If the compiler skips a component, you have not made it faster — you have left manual optimisation work for later.

## What to *stop* writing

With the compiler on, these patterns become anti-patterns:

```tsx
// DON'T — manual memoisation is now redundant and usually wrong.
const value = useMemo(() => expensive(input), [input]);
const handler = useCallback(() => doStuff(id), [id]);
const Component = React.memo(MyComponent);
```

```tsx
// DO — just write it directly. The compiler memoises it.
const value = expensive(input);
const handler = () => doStuff(id);
// no React.memo wrapper at all
```

The only legitimate manual `useMemo`/`useCallback` is when:

- You have profiled the component and the compiler is provably not memoising it.
- An external API requires a stable reference (e.g. an effect that depends on a function whose identity matters across renders for reasons the compiler can't see).

These are rare. Default to letting the compiler do it.

## The `useEffectEvent` escape hatch

For non-reactive logic inside an effect (a logger call that uses the latest `userId` but should not retrigger the effect), use `useEffectEvent` from React 19.2. It must be declared in the same component or hook as the effect that uses it, and it must not appear in the dependency array. The lint rules enforce both.

```tsx
function Page({ userId }: { userId: string }) {
  const onView = useEffectEvent(() => {
    logView(userId);
  });

  useEffect(() => {
    onView();
    // ^ userId is *not* a dependency. onView reads the latest value when it runs.
  }, []);

  return <div>...</div>;
}
```

## Verifying the compiler is on

After scaffolding, run the dev server, open React DevTools, and check the Components panel. Memoised components show `Memo ✨` next to their name. If nothing is tagged, `reactCompiler: true` is missing or `babel-plugin-react-compiler` is not installed.
