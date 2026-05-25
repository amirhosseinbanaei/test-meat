# The locked stack — every package, its role, and the rule

Every package the scaffold installs is here, with the FE Lead's rule for when to use it. If a need comes up that isn't on this list, escalate to the FE Lead before installing anything.

## Runtime dependencies

### Foundation
| Package | Role | Rule |
|---|---|---|
| `next` | Framework | App Router only. Turbopack default. |
| `react` / `react-dom` | UI runtime | Version 19.2 with the React Compiler enabled. |

### Styling and primitives
| Package | Role | Rule |
|---|---|---|
| `tailwindcss` | Utility-first styling | The only styling system. No runtime CSS-in-JS. |
| `lucide-react` | Icons | Tree-shake imports: `import { Search } from 'lucide-react'`. |
| `class-variance-authority` | Type-safe variant API | **Locked.** Every ds component has a matching variant file in `common/components/variants/<componentName>.ts`. Variants compose shared tokens from `_shared.ts`. |
| `clsx`, `tailwind-merge` | Class composition | Helpers used by `cn()` in `src/common/lib/utils.ts`. Don't import directly elsewhere; always use `cn()`. |
| Radix UI primitives (via shadcn) | Accessible headless components | Installed per-component by the shadcn CLI when you add a component. Land in `common/components/ui/` and are treated as vendor files. |

### State, data, forms
| Package | Role | Rule |
|---|---|---|
| `zustand` | Global client state | Only for genuinely client-only state. Server-side state belongs in RSC. |
| `@tanstack/react-query` | Client-reactive server state | Use for polling, optimistic UI, infinite scroll, refetch-on-mutation **on the client**. Not for initial page data — that's RSC + `fetch`/`cache()`. |
| `@tanstack/react-query-devtools` | Devtools | Dev only — provider only renders it when `NODE_ENV === 'development'`. |
| `react-hook-form` | Complex form library | Use for: multi-step wizards, dynamic field arrays, real-time validation, very large forms. Simple forms go through React 19 native (`useActionState`). |
| `@hookform/resolvers` | RHF + Zod integration | Always paired with RHF when validation is needed. |
| `zod` | Schema validation | Universal. Validates forms (via RHF resolver), Server Action inputs (the trust boundary), env vars (via T3 Env), and parses API responses. |

### Dates
| Package | Role | Rule |
|---|---|---|
| `date-fns` | Date manipulation (Gregorian) | Use for any add/subtract/diff/parse logic. Pure functions, tree-shakeable. |
| `date-fns-jalali` | Date manipulation (Iranian/Persian/Shamsi calendar) | Drop-in API — same functions, different import. Use when the project displays dates to Iranian users. |
| *Native* `Intl.DateTimeFormat` | Date formatting | Use this — not date-fns format helpers — for display. It speaks every locale and supports the Persian and Hijri calendars natively (`fa-IR-u-ca-persian`, `ar-SA-u-ca-islamic`). |

### Animation
| Package | Role | Rule |
|---|---|---|
| `motion` (formerly Framer Motion) | **Tier 1** — component-level animation library | Reach for this **only after** React 19's View Transitions and `<Activity/>` are ruled out for the use case. Handles enter/exit, state transitions, gestures, layouts, drag — ~90% of React animation needs. |
| `gsap` + `@gsap/react` (+ `gsap/ScrollTrigger`) | **Tier 2** — complex timeline orchestration | ONLY for scroll-driven storytelling, SVG morphing, sequenced choreography across many elements. Lazy-loaded. Never default. Installed by `add-gsap-animation`. |
| `lenis` | Opt-in smooth scrolling | Locked safeguards: bypasses for `prefers-reduced-motion`, `?lenis=off` kill switch, keyboard scroll preserved. Use only when design demands it. Installed by `add-smooth-scroll`. |

### 3D
| Package | Role | Rule |
|---|---|---|
| `three` + `@react-three/fiber` + `@react-three/drei` | 3D content | NEVER raw Three.js — always through r3f. Lazy-loaded (Canvas via `next/dynamic` + `ssr:false`), Suspense fallback, reduced-motion respect, perf budget (≤800KB bundle, ≥30fps on Pixel 5). Installed by `add-3d-scene`. |

### PWA / offline
| Package | Role | Rule |
|---|---|---|
| `@serwist/next` + `serwist` | Service Worker + manifest, App-Router-native | The maintained successor to `next-pwa`. Locked caching: CacheFirst fonts, SWR images, NetworkFirst pages/API. Installed by `add-pwa`. |

### Accessibility tooling
| Package | Role | Rule |
|---|---|---|
| `eslint-plugin-jsx-a11y` (dev) | Static a11y linting | `strict` ruleset. Build-time enforcement of WCAG criteria that can be caught from source. |
| `@axe-core/react` (dev) | Runtime a11y reporter | Loaded only in development. Reports violations to the dev console as the app renders. |
| `axe-playwright` (dev) | CI a11y testing | Runs against every E2E route. Fails build on serious/critical violations. |
| `eslint-plugin-unicorn` (dev) | Filename casing enforcement | The `filename-case` rule enforces PascalCase components, camelCase hooks, kebab-case everything else. |

### Auth helpers (FE → separate backend)
| Package | Role | Rule |
|---|---|---|
| `jose` | JWT decode / verify | Used in Server Actions and `proxy.ts` to peek at token expiry or verify the backend's signature. We do not issue tokens — the separate backend does. |

> Note on cookies: we use Next.js's built-in `cookies()` from `next/headers`. There is no separate cookie package.

### Env config
| Package | Role | Rule |
|---|---|---|
| `@t3-oss/env-nextjs` | Build-time-validated env vars | Every `process.env.X` access goes through `src/common/lib/env.ts`. Never read `process.env` directly. |

## Dev dependencies

### Build
| Package | Role |
|---|---|
| `babel-plugin-react-compiler` | The React Compiler itself. Required when `reactCompiler: true` is set. |
| `eslint-plugin-react-hooks@latest` | Ships the React Compiler ESLint rules. Do NOT install the deprecated `eslint-plugin-react-compiler`. |

### Tests
| Package | Role |
|---|---|
| `vitest` | Unit / integration test runner. |
| `@vitejs/plugin-react` | React JSX support for Vitest. |
| `jsdom` | DOM env for Vitest component tests. |
| `@testing-library/react` | React component testing utilities. |
| `@testing-library/jest-dom` | Custom matchers (`toBeInTheDocument`, etc.). |
| `@testing-library/user-event` | User interaction simulation in tests. |
| `@playwright/test` | End-to-end tests in real browsers. |

### Design system documentation
| Package | Role |
|---|---|
| `storybook` (10.x) | The component library docs platform — installed by `add-design-system-foundation`. |
| `@storybook/nextjs` | Next.js framework integration for Storybook 10. |
| `@storybook/addon-docs` | Auto-generated docs tab from JSDoc + prop types. |
| `@storybook/addon-controls` | Interactive prop controls. |
| `@storybook/test` | Interaction testing inside stories (the `play` API). |

## Per-skill packages (installed on demand, NOT in the scaffold)

These are part of the locked stack but install only when their skill is first used. Keeps the base scaffold lean for projects that don't need them.

| Concern | Packages | Skill |
|---|---|---|
| File upload (drop zone) | `react-dropzone` | `add-file-upload` |
| Image compression | `browser-image-compression` | `add-file-upload` |
| Image cropping | `react-image-crop` | `add-file-upload` |
| Rich text editor | `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder` | `add-rich-text-editor` |
| Carousel | shadcn Carousel installs `embla-carousel-react`; add `embla-carousel-autoplay` for autoplay | `add-carousel` |
| Virtualized lists | `@tanstack/react-virtual` | `add-virtualized-list` |
| Data tables | `@tanstack/react-table` (+ shadcn `table` primitive) | `add-data-table` |
| Drag-and-drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | `add-drag-and-drop` |
| Markdown content | `react-markdown`, `remark-gfm`, `@tailwindcss/typography` | `add-markdown-content` |
| PWA | `@serwist/next`, `serwist` | `add-pwa` |
| Smooth scroll | `lenis` | `add-smooth-scroll` |
| GSAP timelines | `gsap`, `@gsap/react` | `add-gsap-animation` |
| 3D scenes | `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` | `add-3d-scene` |
| Accessibility tooling | `eslint-plugin-jsx-a11y`, `@axe-core/react`, `axe-playwright`, `eslint-plugin-unicorn` | `add-accessibility` (the last one is registered by `scaffold-nextjs-app` for filename-case enforcement) |
| Design system foundation | `storybook` (10.x), `@storybook/nextjs`, `@storybook/addon-docs`, `@storybook/addon-controls`, `@storybook/test` | `add-design-system-foundation` |

## Design system architecture (locked)

Every project has the same three-layer component architecture:

```
common/components/ui/      ← Layer 1: shadcn primitives (vendor, kebab-case, read-only)
common/components/ds/      ← Layer 2: the project's design system (PascalCase, public API)
common/components/form/    ← Layer 3: RHF wrappers around ds/ (PascalCase)
common/components/variants/ ← CVA variant files (camelCase, one per ds component + _shared.ts)
common/stories/            ← Storybook stories (PascalCase folders, one per ds component)
```

Foundation installed by `add-design-system-foundation` (runs once after `add-common-hooks`):

- Locked variant tokens in `_shared.ts` (`base`, `disabled`, `aria`, `focusVisible`, `placeholder`, `popoverContent`, `popoverContentItem`).
- `useSlots` hook (icons + tooltips, RTL-aware).
- `useControllableState` hook (controlled vs uncontrolled state).
- `InputOption<T>` global type and `toOptions()` builder utility.
- RHF `Form` provider (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`).
- Storybook 10 with RTL/LTR global toggle and Tailwind wiring.
- Design tokens patch to `app/globals.css` (brand colors, ds palette scales, `--base-*` input tokens).

Each new ds component added via `create-ds-component` follows the locked 5-step workflow: variant file → optional ui/ primitive → ds/ component (forwardRef + useSlots + classNames API) → form/ wrapper → Storybook story.

**Layer contract**: product code (pages, modules) imports from `ds/` and `form/`. Never from `ui/`. `form/` imports from `ds/`, never from `ui/`. `ds/` wraps `ui/`. One-way dependency.

## Responsive system (locked)

Every project also has the same locked responsive foundation. Set up once by `add-responsive-foundation` (runs immediately after `add-design-system-foundation`):

### The breakpoint contract

Aligned to Tailwind defaults. Five locked tiers — no custom intermediates:

| Tier | Tailwind | min-width | Targets |
|---|---|---|---|
| base | (no prefix) | 0px | Phones portrait (320–639px) |
| sm | `sm:` | 640px | Phone landscape, small tablet |
| md | `md:` | 768px | Tablet portrait |
| lg | `lg:` | 1024px | Laptop, tablet landscape |
| xl | `xl:` | 1280px | Desktop |
| 2xl | `2xl:` | 1536px | Wide desktop |

Plus container-query equivalents (`@sm:` to `@2xl:`) with smaller thresholds (384–672px) for slot-agnostic ds components.

### Fluid type and spacing

`clamp()`-based utilities so type and spacing scale smoothly between breakpoints — no jolts:

- `text-fluid-xs` through `text-fluid-5xl` (12px → 80px depending on tier)
- `space-fluid-2xs` through `space-fluid-2xl` (8px → 128px depending on tier), used as `py-fluid-md`, `gap-fluid-lg`, etc.

### Touch targets

- `min-h-touch` / `min-w-touch` / `size-touch` = 44px (WCAG 2.2 AA minimum, SC 2.5.8)
- `min-h-touch-lg` / `size-touch-lg` = 48px (Material Design / preferred)

### Verification protocol

Three viewports tested before every handoff: **375 / 768 / 1280**. Six checks per viewport (overflow, touch targets, touch-only interactions, typography, source order, resize-jolt). axe-playwright runs the same three viewports automatically in CI.

### Locked patterns

The responsive playbook (`add-responsive-foundation/references/per-pattern-responsive.md`) has locked patterns for: top-bar navigation, side navigation, tables (three patterns: scroll-x, cards-on-mobile, drop-columns), modals (full-screen on phone, modal on tablet+), forms, hero sections, card grids (1→2→3→4), images (Next.js `<Image>` with correct `sizes`), prose width.

## Explicitly rejected (do NOT install)

The FE Lead must refuse these without escalation:

- **`pnpm`** — the scaffold script errors out if passed. npm is the locked package manager. yarn is tolerated.
- **Pure `.css` files for components**, **CSS modules**, **BEM-style naming** — Tailwind utility classes on JSX are the locked styling model. Only `globals.css` exists, and that's for Tailwind directives + CSS variables.
- **Raw Three.js without react-three-fiber** — always go through `@react-three/fiber`.
- **GIFs for animation** — use `<video autoplay loop muted playsinline>` with MP4/WebM.
- **`next-pwa`** — deprecated. Use `@serwist/next` (its maintained successor).
- **Comlink** for Web Workers — the 100-line typed-RPC wrapper in `add-web-worker/assets/worker-rpc.ts` covers the locked use cases without a dep.
- `styled-components`, `@emotion/*`, `linaria` — runtime CSS-in-JS, breaks RSC.
- `@mui/*`, `@chakra-ui/*`, `antd`, `@mantine/*` — UI kits that fight customisation. Use shadcn + Radix.
- `eslint-plugin-react-compiler` — deprecated; rules live in `eslint-plugin-react-hooks`.
- `moment`, `moment-jalaali` — legacy and heavy. Use date-fns / date-fns-jalali.
- `axios` — native `fetch` is enough for this stack and works in both server and client.
- `redux`, `@reduxjs/toolkit` — Zustand covers the same territory more simply.
- `swr` — TanStack Query is the locked choice.
- `jest` — Vitest is the locked choice in new code.
- `cypress` — Playwright is the locked choice.
- `next-auth`, `@auth/*`, `@clerk/*`, `better-auth`, `lucia` — we use the FE-to-separate-backend auth pattern (see `setup-backend-auth` skill).
- `react-beautiful-dnd` — in maintenance mode; `dnd-kit` is the modern replacement.
- `react-window`, `react-virtuoso` — `@tanstack/react-virtual` is the locked choice (consistency with Query and Table).
- `swiper`, `slick-carousel`, `keen-slider` — shadcn's `Carousel` (Embla under the hood) is the locked choice.
- `Lexical`, `Plate`, `TinyMCE`, `CKEditor`, `Quill`, `Draft.js` — Tiptap is the locked rich text editor.
- `uppy`, `filepond`, `UploadThing` — file uploads use `react-dropzone` + the backend's presigned-URL flow.

## When to install something that isn't here

Three steps, in order:
1. Confirm the need can't be served by the existing stack (often it can).
2. If genuinely new, escalate to the FE Lead with the proposed package, the reason, the bundle-size impact, and the maintenance status.
3. If approved, the FE Lead adds the package to this reference document before it gets installed. Nothing in production silently extends the stack.
