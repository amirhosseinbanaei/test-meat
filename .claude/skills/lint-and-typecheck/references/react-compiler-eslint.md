# React Compiler ESLint rules — what they catch and how to fix them

The React Compiler rules live inside `eslint-plugin-react-hooks` since version 6. The recommended preset (`react-hooks/recommended-latest`) enables them automatically. There is no `eslint-plugin-react-compiler` to install — it's deprecated.

The rules check the same things the compiler checks. If the linter flags it, the compiler will refuse to memoise it. **Fixing the violation is the only correct response.** Disabling the rule lets the compiler skip that file, and you lose the runtime gain — sometimes silently.

## The Rules of React, enforced by lint

The compiler can only memoise code that follows the Rules of React. The rules below are the ones the ESLint plugin checks. The names are the actual ESLint rule IDs.

### `react-hooks/rules-of-hooks`

Hooks must be called at the top level of a component or another hook, in the same order on every render. Catches: conditional hooks, hooks in loops, hooks in regular (non-component, non-hook) functions.

**Fix:** Restructure so the hook is unconditional. Branch *inside* the hook (e.g. inside `useEffect`), not around it.

### `react-hooks/exhaustive-deps`

The dependency array of `useEffect`, `useMemo`, `useCallback`, and friends must include every reactive value the body reads. Catches missing or stale dependencies.

**Fix:** Add the missing dep. If adding it causes an unwanted retrigger, the right answer is usually `useEffectEvent` (see `create-component/references/react-19-hooks.md`), not removing the dep manually.

### `react-hooks/set-state-in-render`

Catches `setState` calls during the render phase — including conditional `setState` calls that *look* harmless but are render loops in disguise.

**Fix:** Move the update into an effect, an event handler, or derive the value at render time instead of storing it.

### `react-hooks/no-direct-mutation-state`

Catches direct mutation of state or props. `arr.push(x)` and `obj.foo = bar` are the classic offenders.

**Fix:** Use immutable updates — spread, `with`, `toSpliced`, a copy-then-set. The compiler assumes immutability and produces wrong memoisation results if you violate this.

### `react-hooks/no-mutable-default`

Catches default parameter values that are mutable (`= []`, `= {}`). These share state across renders in subtle ways.

**Fix:** Make the default `null` or `undefined` and resolve inside the function. Or use a sentinel.

### `react-hooks/no-component-mutation`

Catches mutation of objects rendered through React (props, JSX children, state).

**Fix:** Same as `no-direct-mutation-state`. Create a new object.

## Two rules people misread

### "missing dependency" warnings that you "know" are fine

When the linter says `react-hooks/exhaustive-deps` is missing a dep and your instinct is "but that's intentional, it doesn't need to retrigger" — that's the `useEffectEvent` signal. The pattern you want is:

```tsx
const onChange = useEffectEvent((next: T) => {
  doStuff(next);  // reads anything you want; never retriggers anything
});

useEffect(() => {
  subscription.on('change', onChange);
  return () => subscription.off('change', onChange);
}, [subscription]);  // ← onChange is intentionally NOT here. The linter knows.
```

`useEffectEvent` events are excluded from the dependency-array lint check by design. If the linter wants to add them, your `eslint-plugin-react-hooks` is outdated.

### "set state in render" inside a `useMemo`

`useMemo`'s body runs during render. Calling `setX(...)` inside it is `set-state-in-render`. You probably meant to derive that value, not store it:

```tsx
// WRONG — setX runs during render.
const x = useMemo(() => {
  const next = compute(input);
  setX(next);
  return next;
}, [input]);

// RIGHT — just derive. The compiler will memoise this for you.
const x = compute(input);
```

## How the compiler reports skipped files

If the compiler can't memoise a file because of rule violations, it doesn't fail the build — it skips that file silently. You won't notice unless:
- The lint check (this skill) flags the violations. **This is the early warning.**
- React DevTools shows the file's components *not* tagged `Memo ✨`.

The lint failure is the cheap signal. Fix it as soon as it appears.

## When a lint violation is genuinely a false positive

Rare, but it happens — especially with custom hooks the linter cannot fully analyse. The escape hatch:

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps -- <explain why>
```

The comment requires a justification after `--`. The FE Lead reviews every one of these in code review. They should never accumulate.
