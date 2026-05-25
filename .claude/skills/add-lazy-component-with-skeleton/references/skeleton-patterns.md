# Skeleton patterns by component type

Locked skeleton shapes per common component category. Copy and adapt. The goal: same outer dimensions as the loaded component, conveying structure rather than content.

## The shadcn Skeleton primitive

Every skeleton uses `<Skeleton>` from `@/common/components/ui/skeleton` (vendored from shadcn). It's a div with a shimmer animation and rounded corners.

```tsx
import { Skeleton } from '@/common/components/ui/skeleton';

<Skeleton className="h-4 w-32" />
<Skeleton className="size-12 rounded-full" />
<Skeleton className="aspect-video w-full" />
```

The shimmer is CSS-only (a moving gradient). No JS cost per skeleton.

## Locked design rules

- **Match outer dimensions.** Inspect the loaded component's container width/height. Skeleton's outer wrapper uses the same.
- **Match major structure.** Header rows, columns, image regions — show the silhouette.
- **Don't render text.** No "Loading..." text inside a skeleton — the `aria-label` on the wrapper announces it.
- **One wrapping role.** `role="status" aria-label="Loading <thing>"` on the outermost div. Don't repeat on nested children.
- **Respect reduced motion.** Tailwind 4 / shadcn's Skeleton uses an animate-pulse animation that's a fade, not movement. It's vestibular-safe by default. Don't add motion that moves.
- **Keep it short.** Skeletons over 30 lines mean you're nearly recreating the component. Simplify.

## Card

For a content card with image, title, body, footer:

```tsx
<div className="rounded-lg border p-4" role="status" aria-label="Loading card">
  <Skeleton className="aspect-video w-full rounded-md" />
  <Skeleton className="mt-3 h-5 w-3/4" />
  <Skeleton className="mt-2 h-4 w-full" />
  <Skeleton className="mt-1 h-4 w-5/6" />
  <div className="mt-4 flex gap-2">
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-8 w-20" />
  </div>
</div>
```

## Card list / grid

Many cards. Render 3–6 skeleton cards depending on grid columns:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading items">
  {Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="rounded-lg border p-4">
      <Skeleton className="aspect-video w-full rounded-md" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-full" />
    </div>
  ))}
</div>
```

Don't render 100 skeleton cards for a long list — 6 is enough. The user gets the visual signal.

## Article / long-form content

```tsx
<article role="status" aria-label="Loading article">
  <Skeleton className="h-10 w-3/4" />          {/* title */}
  <Skeleton className="mt-2 h-4 w-1/4" />      {/* byline */}
  <Skeleton className="mt-6 aspect-video w-full" />  {/* hero image */}
  <div className="mt-6 space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
  </div>
</article>
```

## Table

```tsx
<div className="rounded-lg border" role="status" aria-label="Loading table">
  {/* Header */}
  <div className="flex gap-4 border-b p-4">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="ml-auto h-4 w-16" />
  </div>
  {/* Rows */}
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex gap-4 border-b p-4 last:border-0">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="ml-auto h-4 w-16" />
    </div>
  ))}
</div>
```

Match the actual table's column widths approximately. 5 skeleton rows; let the real table populate more.

## Chart

See the `ChartSkeleton.tsx.template` in this skill's assets. Bars or lines rendered as Skeleton elements at varied heights to suggest data.

## Form

```tsx
<div className="space-y-4" role="status" aria-label="Loading form">
  <div>
    <Skeleton className="h-4 w-20" />        {/* label */}
    <Skeleton className="mt-1 h-10 w-full" /> {/* input */}
  </div>
  <div>
    <Skeleton className="h-4 w-24" />
    <Skeleton className="mt-1 h-10 w-full" />
  </div>
  <div>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="mt-1 h-24 w-full" /> {/* textarea */}
  </div>
  <Skeleton className="h-10 w-32" />          {/* submit button */}
</div>
```

Useful when an entire form depends on data being loaded (edit-existing-record forms).

## Avatar + name (user pill)

```tsx
<div className="flex items-center gap-3" role="status" aria-label="Loading user">
  <Skeleton className="size-10 rounded-full" />
  <div className="space-y-1">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-24" />
  </div>
</div>
```

## Comment thread

```tsx
<div className="space-y-4" role="status" aria-label="Loading comments">
  {Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="flex gap-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ))}
</div>
```

## Dashboard KPI tile

```tsx
<div className="rounded-lg border p-4" role="status" aria-label="Loading metric">
  <Skeleton className="h-4 w-24" />          {/* label */}
  <Skeleton className="mt-3 h-8 w-32" />     {/* value */}
  <Skeleton className="mt-2 h-3 w-20" />     {/* trend / sublabel */}
</div>
```

## Editor (rich text)

The editor surface itself, while loading:

```tsx
<div className="rounded-lg border" role="status" aria-label="Loading editor">
  {/* Toolbar */}
  <div className="flex gap-1 border-b p-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} className="size-8" />
    ))}
  </div>
  {/* Content area */}
  <div className="space-y-2 p-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
</div>
```

## Map

```tsx
<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted" role="status" aria-label="Loading map">
  <Skeleton className="absolute inset-0" />
  {/* Optional pin placeholder */}
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <Skeleton className="size-6 rounded-full" />
  </div>
</div>
```

## 3D scene

Covered in `add-3d-scene/assets/SceneFallback.tsx.template`. Match the Canvas's dimensions; a spinner or skeleton circle suggests "something's rendering."

## Picking sizes (heuristics)

Without measuring the real component:

- Text line ≈ `h-4` (16px-ish, matches body text)
- Heading ≈ `h-6` to `h-10` depending on level
- Button ≈ `h-9` or `h-10` (matches shadcn's default Button)
- Input ≈ `h-10`
- Avatar small ≈ `size-8` to `size-10`; large ≈ `size-12` to `size-16`
- Image: use aspect-ratio classes (`aspect-video`, `aspect-square`)
- Icons ≈ `size-4` to `size-6`

Widths: roughly match the loaded component, but be loose. `w-3/4`, `w-32`, `w-full` are fine — exactness isn't the point.

## When the skeleton looks wrong

Common symptoms:

| Symptom | Likely cause | Fix |
|---|---|---|
| Page jumps when component loads | Skeleton dimensions don't match component | Measure component height/width, update skeleton |
| Skeleton shimmer looks janky | Too many Skeleton elements (>50) animating | Reduce count — 5–8 rows is enough |
| Skeleton renders nothing visible | Parent has no dimensions | Add explicit width/height or aspect-ratio to skeleton wrapper |
| Skeleton flashes briefly then component renders | Component loaded too fast — skeleton barely visible | This is fine, don't fix |
| Skeleton stays visible too long | Component is slow to load (or LazyOnView rootMargin too tight) | Profile the load; widen rootMargin if scroll-triggered |

## Pre-built skeletons in the project

For consistent patterns across the project, add the common skeletons to `src/common/components/skeletons/`:

```
src/common/components/skeletons/
├── CardSkeleton.tsx
├── ListSkeleton.tsx
├── TableSkeleton.tsx
├── ArticleSkeleton.tsx
└── ProfileSkeleton.tsx
```

Reuse via direct import. Component-specific skeletons (`<RevenueChartSkeleton>`) stay adjacent to the component they mirror.
