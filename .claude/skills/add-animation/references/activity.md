# Tier 3 — `<Activity/>`

`<Activity/>` is a React 19.2 primitive that lets you hide a subtree without unmounting it. It's not an animation tool by itself, but it solves a problem animations often run into: when you want to hide UI but keep the state and DOM intact for when it reappears.

## When to reach for `<Activity/>`

- A tab system where each tab should keep its scroll position, form values, and any in-flight queries when you leave and come back.
- A wizard where step 1's inputs should still hold their values after the user advances to step 2 and then goes back.
- An off-screen drawer that you want to slide in and out fast — by keeping it mounted with `<Activity/>`, the open/close transition is instantaneous.
- Any conditional rendering where unmount/remount is too expensive or destroys state you want to keep.

## Usage

```tsx
import { Activity } from 'react';

function TabContent({ activeTab }: { activeTab: 'overview' | 'settings' }) {
  return (
    <>
      <Activity mode={activeTab === 'overview' ? 'visible' : 'hidden'}>
        <OverviewPanel />
      </Activity>
      <Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>
        <SettingsPanel />
      </Activity>
    </>
  );
}
```

The hidden subtree is still in the React tree. Its effects pause (the docs term: "components inside a hidden Activity prepare like they're being rendered, but with deprioritized updates"). When the mode flips back to `visible`, React resumes the subtree as-is.

## How this relates to animation

By itself, `<Activity/>` doesn't animate. It controls the **structural** behaviour — the subtree stays mounted. Pair it with one of the other tiers when you need movement:

- Tier 1 — toggle a CSS class on the wrapper to animate the visible/hidden visual state (opacity, transform).
- Tier 4 — wrap the children in a Motion component with `initial`/`animate`/`exit` to animate as they "appear" or "disappear" visually.

The point is: `<Activity/>` preserves the *state* (form values, scroll, queries); animations handle the *visuals*.

## What `<Activity/>` is NOT

- **Not a replacement for conditional rendering.** If you really want the subtree gone, just don't render it. `<Activity/>` is for the cases where you want it kept.
- **Not a performance silver bullet.** Hidden subtrees consume memory. Don't wrap dozens of large subtrees in `<Activity/>` just because the API allows it.
- **Not an animation primitive.** It controls visibility, not motion.

## Common combination

A drawer with state preservation + slide animation:

```tsx
import { Activity } from 'react';
import { motion } from 'motion/react';

function NotificationsDrawer({ open }: { open: boolean }) {
  return (
    <Activity mode={open ? 'visible' : 'hidden'}>
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* The drawer keeps its state (scroll, in-flight requests) when closed,
            because <Activity> keeps it mounted; the slide is Motion's job. */}
      </motion.aside>
    </Activity>
  );
}
```

This combo — `<Activity/>` for state + Motion for movement — is the right call whenever a "panel" comes and goes and the user might come back to it.

## What it costs

- Memory: the hidden subtree is still in memory. Don't use this for genuinely throwaway UI.
- A small render scheduling cost — React still has to track the hidden subtree.

For most cases the cost is invisible; reach for it when state preservation pays for it.
