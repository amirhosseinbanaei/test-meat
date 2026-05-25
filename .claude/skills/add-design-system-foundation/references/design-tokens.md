# Design tokens

The CSS-variable layer that sits beneath the variant tokens in `_shared.ts`. All
brand and base values live here.

## Where they live

`src/app/globals.css`, inside an `@theme` block (Tailwind 4 config-as-CSS).

## What's locked vs. what's per-project

### Locked structure (every project has these, with these names)

- `--color-primary` — the primary brand color
- `--color-secondary` — the secondary brand color
- `--color-destructive` — error / destructive actions
- `--color-muted` and `--color-muted-foreground` — subdued surfaces and text
- `--color-ds-{name}-{shade}` — the brand palette scales (50–700 typical)
- `--base-width`, `--base-height`, `--base-radius`, `--base-opacity`,
  `--base-border`, `--base-text`, `--base-placeholder` — the input base tokens

These names are stable across projects. They MUST exist. The variant files in
`_shared.ts` reference them.

### Per-project values

- The hex / rgba values of every brand and DS palette color.
- The exact shades present (some projects only need 50–500 of one palette; others
  need 50–900).
- Whether dark-mode equivalents are defined.

What you DON'T do per project:

- Rename the token. `--base-height` stays `--base-height`. Don't rename to
  `--input-height-large` or `--field-height`. The DS depends on the name.
- Add new "base" tokens without escalating. The base layer is locked across
  projects so DS components work the same way everywhere.
- Skip a token because "this project doesn't use it yet." Define all locked
  tokens even if the values default to sensible defaults.

## Tailwind utility mapping

Tailwind 4 turns every `@theme` variable into a utility automatically. So:

- `--base-height: 48px` → `h-base-height` is `height: 48px`.
- `--color-ds-purple-500: #6e45ff` → `bg-ds-purple-500`, `text-ds-purple-500`,
  `border-ds-purple-500`, etc.
- `--color-primary: #6e45ff` → `bg-primary`, `text-primary`, `border-primary`.

The `cn()` utility (in `src/common/lib/utils.ts`) is configured to know about
these custom tokens so it merges them correctly without conflict.

## Locked palette scale convention

For every brand-relevant color, generate a 50-to-700 scale (or wider if needed).
Tools that work well:

- [uicolors.app](https://uicolors.app) — paste a base hex, get a Tailwind scale.
- [tailwind-color-shades](https://tailwindcolorshades.com) — same idea.
- Hand-tune the dark end if AA contrast against white fails at 500.

Don't ship a brand color without its scale. The DS components reach for shades
(hover states use `-600`, focus rings use `-700`, etc.).

## Dark mode

The locked dark-mode strategy: a `.dark` class on `<html>` (or `<body>`) toggles
a complete second set of variable values. Each `@theme` variable gets its dark
equivalent inside `.dark { ... }`.

```css
@theme {
  --color-bg: #ffffff;
  --color-fg: #111111;
  /* ... */
}

.dark {
  --color-bg: #0a0a0a;
  --color-fg: #f5f5f5;
  /* ... */
}
```

For projects without dark mode, omit the `.dark` block entirely. Don't ship a
half-baked dark mode (some tokens defined, some not) — confusing and inconsistent.

## Accessibility check on token values

Every text/background pair that ships in the DS must clear WCAG AA contrast
(see `add-accessibility/references/color-and-contrast.md`):

- Body text on background: 4.5:1
- Large text: 3:1
- Interactive component borders: 3:1

ui-visual-lead's job to ensure this at token-design time. Use `npm`-installed
contrast-checker tools or design plugins (Stark, Contrast) on every brand pair.

If a brand color doesn't clear AA, the token's value is wrong. Adjust the value;
keep the token's name. Don't introduce a "low-contrast variant" — accessibility
isn't a variant.

## How tokens flow into a component

```
globals.css            : --base-height: 48px;
       │
       ▼
Tailwind 4 (auto)      : .h-base-height { height: 48px; }
       │
       ▼
_shared.ts             : export const base = 'h-base-height ...';
       │
       ▼
variants/input.ts      : cva([base, ...], { variants: { ... } });
       │
       ▼
ds/Input.tsx           : className={cn(inputVariants({ variant }))}
       │
       ▼
Rendered DOM           : <input class="h-base-height ..." style="height: 48px">
```

To change every input's height in the project, change `--base-height` once.
Everything downstream picks it up.

## What NOT to do

- **Don't inline a brand color** in a component. `<div className="bg-[#6e45ff]">` is
  forbidden. Use `bg-primary` or `bg-ds-purple-500`.
- **Don't override `--base-*` tokens** at component scope. They're project-wide.
  Override at the variant level if a single component needs a different size.
- **Don't define tokens in component files**. Every CSS variable lives in
  `globals.css`. There's one place to look.
- **Don't `style={{...}}` for color or sizing**. Always Tailwind utilities,
  always via cn().

## When you need a value that isn't a token

If you need a one-off color (e.g. an illustration accent) that's genuinely never
reused, inline as a Tailwind arbitrary value is acceptable: `bg-[#abc123]`. Use
sparingly — the 3rd time you use the same arbitrary value, it earns a token.

For sizes / spacing one-offs, same rule: Tailwind's arbitrary syntax (`mt-[13px]`)
is fine for one-offs. Promotes to a token at 3+ uses.
