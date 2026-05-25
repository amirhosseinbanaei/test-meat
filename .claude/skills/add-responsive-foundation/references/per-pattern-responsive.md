# Per-pattern responsive playbook

Locked patterns for every UI primitive that historically breaks in responsive
layouts. Copy these patterns; don't reinvent them.

## Navigation — top bar with logo + links

The most common header. Phones get a hamburger drawer; tablets+ get inline links.

```tsx
import { MobileMenu, NavLink } from '@/common/components/MobileMenu';
import { ResponsiveContainer } from '@/common/components/ResponsiveContainer';

<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
  <ResponsiveContainer>
    <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
      {/* Logo */}
      <a href="/" className="min-h-touch flex items-center" aria-label="Home">
        <Logo />
      </a>

      {/* Desktop nav — hidden below lg */}
      <nav className="hidden items-center gap-1 lg:flex">
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/pricing">Pricing</NavLink>
        <NavLink href="/about">About</NavLink>
      </nav>

      {/* Right side — user + mobile menu trigger */}
      <div className="flex items-center gap-2">
        <Button variant="primary" className="hidden min-h-touch lg:inline-flex">
          Sign in
        </Button>

        <MobileMenu>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/about">About</NavLink>
        </MobileMenu>
      </div>
    </div>
  </ResponsiveContainer>
</header>
```

Key rules:

- Header height: 64px on phone (`h-16`), 80px on desktop (`lg:h-20`).
- Sticky with backdrop blur — common pattern.
- Mobile menu is in the locked `MobileMenu` component (from the responsive
  foundation skill).
- Desktop nav `hidden lg:flex` — visible only at laptop+.

## Side navigation — collapsible sidebar

For dashboards / app shells with persistent side nav.

```tsx
<div className="flex min-h-screen">
  {/* Sidebar — full width on phone (as drawer), fixed width on desktop */}
  <aside className="
    hidden border-r bg-card
    lg:flex lg:w-64 lg:flex-col
    xl:w-72
  ">
    {/* Desktop sidebar content */}
    <Logo className="p-4" />
    <nav className="flex-1 p-2">{links}</nav>
  </aside>

  {/* Main */}
  <main className="flex-1 overflow-auto">
    {/* Mobile header with hamburger — only shown < lg */}
    <header className="border-b lg:hidden">
      <ResponsiveContainer>
        <div className="flex h-16 items-center gap-4">
          <MobileMenu>{links}</MobileMenu>
          <Logo />
        </div>
      </ResponsiveContainer>
    </header>

    <ResponsiveContainer>{children}</ResponsiveContainer>
  </main>
</div>
```

Sidebar width: 256px (`lg:w-64`) on laptop, 288px (`xl:w-72`) on wide displays.
Don't go below 240px — nav links become cramped.

## Tables — the responsive table problem

Tables don't fit on phones. There are exactly three locked patterns. Pick one
per table based on the content.

### Pattern A: scroll horizontally (data-heavy, all columns matter)

```tsx
<div className="overflow-x-auto rounded-lg border">
  <table className="w-full text-sm">
    <thead className="bg-muted">
      <tr>
        <th className="sticky start-0 z-10 bg-muted px-4 py-3 text-start">Name</th>
        <th className="px-4 py-3 text-start">Email</th>
        <th className="px-4 py-3 text-start">Role</th>
        <th className="px-4 py-3 text-start">Joined</th>
      </tr>
    </thead>
    <tbody>{rows}</tbody>
  </table>
</div>
```

Best for: dashboards, admin panels, financial data where every column matters.
Make the first column "sticky" so context doesn't scroll away.

### Pattern B: cards on mobile, table on tablet+ (recommended for most UI)

```tsx
{/* Mobile: card view */}
<div className="grid grid-cols-1 gap-3 md:hidden">
  {users.map((u) => (
    <article key={u.id} className="rounded-lg border p-4">
      <h3 className="font-medium">{u.name}</h3>
      <p className="text-fluid-sm text-muted-foreground">{u.email}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-fluid-sm">
        <div>
          <dt className="text-muted-foreground">Role</dt>
          <dd>{u.role}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Joined</dt>
          <dd>{u.joined}</dd>
        </div>
      </dl>
    </article>
  ))}
</div>

{/* Tablet+: real table */}
<table className="hidden w-full md:table">
  {/* ... */}
</table>
```

Best for: consumer-facing list views, user-management screens, anywhere the row
is reading-oriented rather than scanning-oriented.

### Pattern C: drop columns at smaller widths (compromise)

```tsx
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th className="hidden md:table-cell">Role</th>     {/* hide < md */}
      <th className="hidden lg:table-cell">Joined</th>   {/* hide < lg */}
    </tr>
  </thead>
  <tbody>
    {users.map((u) => (
      <tr key={u.id}>
        <td>{u.name}</td>
        <td>{u.email}</td>
        <td className="hidden md:table-cell">{u.role}</td>
        <td className="hidden lg:table-cell">{u.joined}</td>
      </tr>
    ))}
  </tbody>
</table>
```

Best for: tables where some columns are clearly secondary (timestamps, IDs,
metadata) and can be hidden without losing primary information.

### Anti-pattern: tiny tables

```html
<!-- ❌ Phone: 4 columns @ 60px each, unreadable -->
<table class="w-full text-[10px]">
```

Never make a table fit by shrinking text. Use one of the three patterns above.

## Modals / dialogs — full-screen on mobile

Shadcn `Dialog` defaults to a centered modal at all sizes. On phones, this
creates a tiny dialog with content cramped. The locked override: full-screen on
mobile, centered modal on tablet+.

```tsx
<DialogContent className="
  inset-0 max-h-none w-full max-w-none translate-x-0 translate-y-0 rounded-none border-0
  data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom
  sm:inset-auto sm:left-[50%] sm:top-[50%] sm:max-h-[85vh] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border
  sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95
">
  {/* Content */}
</DialogContent>
```

Phone: full-screen sheet sliding up. Tablet+: centered modal. Consider using the
shadcn `Sheet` component on mobile (it has this pattern built in) and `Dialog`
on tablet+ via the `useBreakpoint` hook for the choice.

### Drawer-on-mobile pattern (preferred)

```tsx
const isMobile = useBreakpoint('< md');

if (isMobile) {
  return (
    <Sheet>
      <SheetTrigger>...</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh]">
        {/* Drawer content */}
      </SheetContent>
    </Sheet>
  );
}

return (
  <Dialog>
    <DialogTrigger>...</DialogTrigger>
    <DialogContent className="max-w-lg">
      {/* Modal content */}
    </DialogContent>
  </Dialog>
);
```

Cleaner. The mobile and desktop UIs are different *components*, both Radix-based,
with their own scroll containment / focus management.

## Forms — stack on mobile, columns on desktop

```tsx
<form className="flex flex-col gap-4">
  {/* Single-column section — stack always */}
  <FormInput name="email" label="Email" />

  {/* Two-column section — stack on mobile, side-by-side at md+ */}
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <FormInput name="firstName" label="First name" />
    <FormInput name="lastName" label="Last name" />
  </div>

  {/* Full-width submit */}
  <FormButton type="submit" className="min-h-touch md:self-start md:px-8">
    Submit
  </FormButton>
</form>
```

Key rules:

- Forms ALWAYS use `flex flex-col gap-4` as the outer wrapper. Vertical rhythm.
- Multi-field rows use `grid grid-cols-1 md:grid-cols-2` (or `-3` for 3-up).
- Submit button: full-width on mobile (`block` with no width class), inline on
  desktop (`md:self-start`). Phones favor edge-to-edge tap targets.

## Hero sections — fluid type, image second

Marketing heroes break in two ways: huge text on phones, image hogging the top.

```tsx
<section className="bg-muted">
  <ResponsiveContainer>
    <div className="grid grid-cols-1 items-center gap-fluid-md py-fluid-xl md:grid-cols-2">
      {/* Copy first in DOM — visible at the top on mobile */}
      <div className="flex flex-col gap-fluid-sm">
        <h1 className="text-fluid-4xl font-bold leading-tight">
          The compelling headline
        </h1>
        <p className="text-fluid-lg text-muted-foreground">
          Supporting paragraph that scales with the viewport.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="min-h-touch-lg">
            Get started
          </Button>
          <Button variant="outline" size="lg" className="min-h-touch-lg">
            Learn more
          </Button>
        </div>
      </div>

      {/* Image second */}
      <Image
        src="/hero.jpg"
        alt="..."
        width={800}
        height={600}
        priority
        className="w-full rounded-lg object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
    </div>
  </ResponsiveContainer>
</section>
```

Key rules:

- Headline: `text-fluid-4xl` — scales from ~40px on phone to 64px on desktop.
- Copy first in source order — phones see it before scrolling. Use CSS `order`
  only when desktop demands a reverse layout AND the order swap is intentional.
- Buttons: `min-h-touch-lg` (48px) — heroes have prominent CTAs.
- Image: `sizes="(min-width: 768px) 50vw, 100vw"` — the image is 100vw on
  mobile, 50vw on tablet+.

## Grids of cards — 1 → 2 → 3 → 4 columns

The locked progression. Most card grids do:

```html
<div class="grid grid-cols-1 gap-fluid-sm md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {cards}
</div>
```

- Phone: 1 column (cards full-width, easy to tap).
- Tablet: 2 columns.
- Laptop: 3 columns.
- Wide desktop: 4 columns.

For dense / narrow cards (avatars, small tiles), shift one step up:

```html
<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
```

For "feature" cards (large, image-heavy), shift one step down:

```html
<div class="grid grid-cols-1 gap-fluid-md md:grid-cols-2 lg:grid-cols-3">
```

Never `grid-cols-5` or `grid-cols-7` unless the design specifically demands it.
Odd column counts create awkward last-row stragglers.

## Images — Next.js `<Image>` rules

Already covered in `add-lazy-image`, but the responsive-specific rules:

```tsx
{/* Above the fold, hero — priority + correct sizes */}
<Image
  src="/hero.jpg"
  alt="..."
  width={1600} height={900}
  priority
  sizes="100vw"
  className="w-full object-cover aspect-[16/9]"
/>

{/* In a card grid */}
<Image
  src={product.image}
  alt={product.name}
  width={600} height={400}
  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
  className="aspect-[3/2] w-full object-cover"
/>

{/* In an avatar (fixed size) */}
<Image
  src={user.avatar}
  alt=""
  width={40} height={40}
  className="size-10 rounded-full"
/>
```

The `sizes` attribute is the single most-forgotten thing. Without it,
`<Image>` downloads the full-size image on every breakpoint. The rule:

> "List the actual rendered widths the image will occupy, biggest viewport first."

For a card in a 4→3→2→1 column grid: `sizes="(min-width: 1280px) 25vw,
(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"`.

## Long text and `prose` width

Body text on a wide desktop reads as a 1500px line — unreadable. Always
constrain article content:

```html
<article class="mx-auto max-w-prose">
  <h1 class="text-fluid-3xl">...</h1>
  <p class="text-fluid-base">...</p>
</article>
```

`max-w-prose` is ~65 characters wide. The sweet spot for reading.

For full-page articles, the `ResponsiveContainer` with `width="narrow"` (720px)
is similar. Use `max-w-prose` for text inside other layouts (a card description,
a modal body).

## Sticky elements

Sticky CTAs and bars break on mobile (covering content) and look weird at large
viewports (floating mid-page). The locked rule: sticky only on mobile, in-flow
on desktop.

```html
<div class="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-4
            md:static md:border-0 md:p-0">
  <Button class="w-full md:w-auto">Buy now</Button>
</div>
```

Phone: fixed bottom bar (always visible). Tablet+: inline button (no longer
sticky).

## Long lists / feeds

Phone screens are vertically tall. Lists scroll forever. Two patterns:

1. **Infinite scroll** (use `@tanstack/react-virtual` from `add-virtualized-list`
   when items > 200).
2. **Pagination** with large touch-friendly controls:

```html
<nav class="flex items-center justify-center gap-2 py-fluid-md" aria-label="Pagination">
  <Button variant="outline" size="lg" disabled={page === 1} className="min-h-touch">
    Previous
  </Button>
  <span className="text-fluid-sm text-muted-foreground">Page {page} of {totalPages}</span>
  <Button variant="outline" size="lg" disabled={page === totalPages} className="min-h-touch">
    Next
  </Button>
</nav>
```

Don't put many page-number buttons on mobile — they cramp. "Previous / Next /
Page X of Y" is the touch-friendly pattern.

## Selects / dropdowns

Native `<select>` is best on mobile (the OS picker is huge and touch-friendly).
Shadcn's custom select is great on desktop. The locked pattern: use shadcn for
both — the underlying Radix Select handles touch correctly (opens an
appropriately-sized list).

If a project's brand demands a heavily-styled select that fails to feel
touch-native, fall back to native on mobile via the `useBreakpoint` hook —
rarely needed.

## What about landscape orientation on phones?

Phones in landscape (≥ 640px wide) trigger `sm:`. The locked design choice:
treat phone landscape as "small tablet" — same layout as `sm:` triggers. Most
designs work fine.

Edge case: very short viewports (a phone in landscape, height 360px). Hero
sections with vertical centering can clip. Avoid `min-h-screen` heroes; use
`min-h-[80vh]` or content-driven height.

## What about extremely large displays (1920px+, 4K)?

The `--container-default` (1280px) and `--container-wide` (1536px) cap content
width on huge displays. Content stays centered with empty space on the sides.
Don't try to fill 27" monitor edge-to-edge — line lengths become unreadable.

For dashboards genuinely needing to use the whole width: `--container-wide`
(1536px) or no container at all. But ensure individual data widgets cap their
own widths.
