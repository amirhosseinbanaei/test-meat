---
name: add-responsive-foundation
description: Set up the FE team's locked responsive system — named breakpoint tiers (mobile / tablet / laptop / desktop / wide) mapped to Tailwind's sm/md/lg/xl/2xl, a fluid type scale via clamp(), a fluid spacing scale, container-query utilities, touch-target tokens (44×44 minimum per WCAG 2.2 AA), and the `useBreakpoint` hook. Drops the responsive design tokens into `globals.css`, registers the breakpoint contract in `tailwind.config`, and installs the locked patterns: mobile-first discipline, container-queries-default for ds components, three-viewport verification protocol. Run ONCE per project, right after `add-design-system-foundation`. Every component thereafter follows the locked patterns.
allowed-tools: Read, Write
---

# Set up the responsive foundation

The locked responsive system. After this runs, every component the team builds:

- Uses the same named breakpoints, mapped to Tailwind utilities consistently.
- Starts with mobile styles (base) and ADDS larger-viewport overrides — never the reverse.
- Uses fluid type via `clamp()` so the steps between breakpoints don't jolt.
- Uses container queries (`@md:`, `@lg:`) for ds components that live in multiple slot widths.
- Meets the 44×44 touch-target minimum for every interactive element.
- Passes the three-viewport verification before handoff.

This skill is the **discipline layer** for responsive design. Without it, every developer reaches for `md:` and `lg:` at slightly different breakpoints, fluid typography is inconsistent, touch targets vary per page, and tables die on phones.

## When to use this skill

- **Always**, once per project, right after `add-design-system-foundation`. Non-negotiable position in the init sequence.

## When NOT to use this skill

- Never skipped. Even for a desktop-only admin tool, the type scale, spacing scale, and touch-target tokens are still useful. Override the breakpoints in `tailwind.config` if the project genuinely doesn't ship mobile.

## Workflow

1. Read `references/breakpoint-contract.md` — the locked breakpoint names and their pixel values.
2. Read `references/mobile-first-discipline.md` — the order rules (`base → sm → md → lg → xl → 2xl`) and how to write Tailwind classes that respect it.
3. Read `references/fluid-type-and-spacing.md` — the clamp() scale, when to use it, and the locked CSS variables.
4. Read `references/container-queries.md` — when to use viewport breakpoints vs. container queries, and the translation pattern.
5. Read `references/touch-targets.md` — the 44×44 rule and the invisible-hit-area pattern.
6. Read `references/per-pattern-responsive.md` — locked responsive patterns for navigation, tables, modals, forms, hero sections, grids, images, typography.
7. Read `references/verification-protocol.md` — the three-viewport checklist run before every handoff.
8. Apply the patches:
   - `assets/globals.css.responsive.patch` → merge into `src/app/globals.css` (fluid type + spacing CSS variables, container-query setup).
   - `assets/tailwind.config.responsive.patch` → merge into `tailwind.config.ts` (breakpoint names, touch tokens, fluid utilities).
9. Drop the assets:
   - `assets/useBreakpoint.ts.template` → `src/common/hooks/useBreakpoint.ts`
   - `assets/useContainerQuery.ts.template` → `src/common/hooks/useContainerQuery.ts` (rare, for the few cases where JS needs to know container size)
   - `assets/ResponsiveContainer.tsx.template` → `src/common/components/ResponsiveContainer.tsx` (page-level container with locked max-widths)
   - `assets/MobileMenu.tsx.template` → `src/common/components/MobileMenu.tsx` (the locked mobile navigation pattern, used by AppShell)
10. Run `lint-and-typecheck`.

## What you get

After this skill runs:

**The locked breakpoint contract** is in `tailwind.config`:

| Tier name | Tailwind | px value | Targets |
|---|---|---|---|
| (default — base) | (none) | 0–639 | Phones (portrait). All base styles target this. |
| `sm` | `sm:` | 640+ | Phones (landscape), small tablets. |
| `md` | `md:` | 768+ | Tablets (portrait). |
| `lg` | `lg:` | 1024+ | Laptops, tablets (landscape), small desktops. |
| `xl` | `xl:` | 1280+ | Desktops. |
| `2xl` | `2xl:` | 1536+ | Wide / large desktops. |

**Container-query equivalents** are available with the same names but `@`-prefixed: `@sm:`, `@md:`, `@lg:`, `@xl:`, `@2xl:`. Use on any element that has `@container` set, to query the element's own width rather than the viewport.

**The fluid type scale** is in CSS variables and Tailwind utilities:

| Utility | clamp() range | Use for |
|---|---|---|
| `text-fluid-xs` | clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem) | Captions, microcopy |
| `text-fluid-sm` | clamp(0.875rem, 0.825rem + 0.25vw, 1rem) | Helper text, descriptions |
| `text-fluid-base` | clamp(1rem, 0.95rem + 0.25vw, 1.125rem) | Body |
| `text-fluid-lg` | clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem) | Lead paragraph, large body |
| `text-fluid-xl` | clamp(1.25rem, 1.15rem + 0.5vw, 1.75rem) | H4 / small heading |
| `text-fluid-2xl` | clamp(1.5rem, 1.35rem + 0.75vw, 2.25rem) | H3 |
| `text-fluid-3xl` | clamp(1.875rem, 1.65rem + 1.25vw, 3rem) | H2 |
| `text-fluid-4xl` | clamp(2.5rem, 2.1rem + 2vw, 4rem) | H1 / hero |

**The fluid spacing scale** is in CSS variables for section gaps that should scale with the viewport:

| Variable | clamp() range | Use for |
|---|---|---|
| `--space-fluid-sm` | clamp(1rem, 0.85rem + 0.75vw, 1.5rem) | Component-internal gaps |
| `--space-fluid-md` | clamp(1.5rem, 1.25rem + 1.25vw, 2.5rem) | Section gaps |
| `--space-fluid-lg` | clamp(2rem, 1.5rem + 2.5vw, 4rem) | Page sections |
| `--space-fluid-xl` | clamp(3rem, 2.25rem + 3.75vw, 6rem) | Hero / major sections |

Used as `py-[var(--space-fluid-md)]` or via the `gap-fluid-md` / `py-fluid-md` utility patches.

**Touch-target tokens** are in Tailwind:
- `min-h-touch` / `min-w-touch` / `size-touch` = 44px (WCAG 2.2 AA min).
- `min-h-touch-lg` / etc. = 48px (Material Design / preferred).

**The `useBreakpoint` hook** is in `common/hooks/useBreakpoint.ts`:

```ts
const bp = useBreakpoint();           // 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
const isMobile = useBreakpoint('< md'); // boolean — true below tablet
const isDesktop = useBreakpoint('>= lg'); // boolean — true at laptop+
```

**The `ResponsiveContainer`** is the locked page-level container with consistent max-widths:

```tsx
<ResponsiveContainer>{/* content */}</ResponsiveContainer>
// → max-w-[1280px], horizontal padding fluid (16px → 32px), centered.
```

## What product code looks like after this skill

```tsx
import { ResponsiveContainer } from '@/common/components/ResponsiveContainer';

export default function ProductPage() {
  return (
    <ResponsiveContainer>
      {/* Mobile-first: 1 column. Then 2 at md+, 3 at lg+. */}
      <div className="grid grid-cols-1 gap-fluid-md md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Fluid heading — scales smoothly with viewport, no jumps. */}
      <h1 className="text-fluid-3xl font-bold">Featured</h1>
    </ResponsiveContainer>
  );
}

// A ds component using container queries — adapts to its slot width, not viewport.
function ProductCard({ product }: { product: Product }) {
  return (
    <article className="@container">
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2">
        <img src={product.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
        <div className="flex flex-col gap-2">
          <h3 className="text-fluid-lg font-semibold">{product.name}</h3>
          <p className="text-fluid-sm text-muted-foreground">{product.description}</p>
          <Button className="min-h-touch self-start">Add to cart</Button>
        </div>
      </div>
    </article>
  );
}
```

## Files in this skill

- `assets/globals.css.responsive.patch` — CSS variables for fluid type, fluid spacing, container-query setup.
- `assets/tailwind.config.responsive.patch` — breakpoint names, touch tokens, fluid utilities.
- `assets/useBreakpoint.ts.template` — the breakpoint hook with `>= md`, `< lg` query syntax.
- `assets/useContainerQuery.ts.template` — JS-side container size detection (rare).
- `assets/ResponsiveContainer.tsx.template` — locked page-level container.
- `assets/MobileMenu.tsx.template` — the locked mobile navigation pattern.
- `references/breakpoint-contract.md` — named tiers + when each applies.
- `references/mobile-first-discipline.md` — base → larger order, locked patterns.
- `references/fluid-type-and-spacing.md` — clamp() scale, when to use, when to override.
- `references/container-queries.md` — viewport vs. container, translation patterns.
- `references/touch-targets.md` — 44×44 rule, invisible hit-area pattern, hover-vs-tap.
- `references/per-pattern-responsive.md` — patterns per UI primitive (nav, table, modal, form, hero, grid, image, type).
- `references/verification-protocol.md` — three-viewport checklist before every handoff.
