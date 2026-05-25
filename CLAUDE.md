# Frontend Team — Claude Code Project

A self-contained Claude Code setup for the frontend team. One agent (`frontend-lead`) plus thirty-three skills that scaffold and build a Next.js 16 website end-to-end on a fully locked stack — including the locked three-layer design system architecture (`ui/` → `ds/` → `form/`), Storybook 10 documentation, the locked responsive system (mobile-first, fluid type/spacing, container queries, 44×44 touch targets, three-viewport verification), PWA / offline, Web Worker offload for heavy work, WCAG 2.2 AA accessibility, lazy-loaded images and components with skeletons, optional Lenis smooth scroll, GSAP for complex timelines, and 3D scenes via react-three-fiber.

## The locked stack

Every project the FE team ships uses the same tools. No per-project debates.

### Foundation
- **Framework:** Next.js 16 (App Router only, Turbopack default).
- **UI runtime:** React 19.2 with the React Compiler (`reactCompiler: true`).
- **Language:** TypeScript everywhere, strict mode.
- **Linter:** `eslint-plugin-react-hooks@latest` (ships the React Compiler rules).
- **Package manager:** **npm** (locked — `pnpm` is rejected by the scaffold; `yarn` is tolerated but not the default).

### Tier 1 (every project — installed in scaffold)
- **Styling:** Tailwind CSS.
- **Component primitives:** shadcn/ui + Radix UI (copied into `src/components/ui/`).
- **Icons:** Lucide.
- **Global client state:** Zustand (only for genuinely client-only state).
- **Server state (client side):** TanStack Query (only for client-reactive needs — polling, optimistic UI, infinite scroll; NOT for initial page data).
- **Forms — simple:** React 19 native (`useActionState` + Server Action).
- **Forms — complex:** React Hook Form + Zod resolver, handing off to a Server Action on submit.
- **Schema validation:** Zod (forms, action inputs, env vars, API responses).
- **Testing:** Vitest + Testing Library (unit/integration), Playwright (E2E).
- **Env vars:** `@t3-oss/env-nextjs`.
- **Component architecture:** Three locked layers. `common/components/ui/` (shadcn primitives, vendor, never edited) → `common/components/ds/` (the project's design system, PascalCase, public API) → `common/components/form/` (RHF wrappers around ds/, one per ds component). Variant files in `common/components/variants/` (one per ds component + `_shared.ts`). Product code imports from `ds/` and `form/`, **never** from `ui/`.
- **Responsive system:** Mobile-first, Tailwind defaults (`sm/md/lg/xl/2xl` = 640/768/1024/1280/1536), fluid type and spacing via `clamp()` (`text-fluid-*`, `gap-fluid-*`), container queries (`@container` + `@md:`) for slot-agnostic ds components, 44×44 touch targets minimum (`min-h-touch`), three-viewport verification (375/768/1280) before every handoff. Locked patterns for nav, tables, modals, forms, hero, grids, images in `add-responsive-foundation/references/per-pattern-responsive.md`.
- **Component library docs:** Storybook 10 + `@storybook/nextjs`. Every ds component gets a story in `common/stories/<Name>/<Name>.stories.tsx` with autodocs + RTL toggle.
- **Class variants:** `class-variance-authority` (CVA). One variant file per ds component, importing shared tokens from `_shared.ts`.

### Tier 2 (installed per-skill, when first needed)
- **Animation — tier 1:** React 19 View Transitions + `<Activity/>` first, then Motion (`motion`) for component-level animation.
- **Animation — tier 2:** GSAP (`gsap` + `@gsap/react` + `ScrollTrigger`) ONLY for complex timeline orchestration (scroll storytelling, SVG morphing, sequenced choreography). Lazy-loaded.
- **Smooth scroll (opt-in):** Lenis. Never default. Locked safeguards: `prefers-reduced-motion` bypass, kill switch, keyboard preservation.
- **3D scenes (per-project):** `@react-three/fiber` + `@react-three/drei` wrapping Three.js. Always lazy + Suspense + reduced-motion + perf budget. Raw Three.js is rejected.
- **PWA / offline:** Serwist (next-pwa successor). Service Worker with locked caching strategy, offline fallback, Web App Manifest, install + update UI.
- **Web Workers:** native module workers via a tiny in-house typed-RPC wrapper (~100 lines, no Comlink dep). For CPU-bound tasks >50ms.
- **Accessibility tooling:** `eslint-plugin-jsx-a11y/strict`, `@axe-core/react` dev reporter, `axe-playwright` CI suite. WCAG 2.2 Level AA is the locked bar.
- **Image strategy:** Next.js `<Image>` (AVIF first, WebP fallback). Locked patterns: `priority` only above the fold (≤3/route), `sizes` always set, dimensions explicit, blur placeholder where worth it.
- **Lazy components:** `next/dynamic` for route-mount lazy, `LazyOnView` (IntersectionObserver) for viewport-triggered. Every lazy component pairs with a dimensioned shadcn-`Skeleton` fallback.
- **Dates:** native `Intl.DateTimeFormat` for display (speaks Persian and Hijri calendars), `date-fns` for Gregorian, `date-fns-jalali` for Iranian/Persian (Shamsi).
- **Authentication:** FE-only pattern against a **separate backend** — Next.js never touches a database. Uses `cookies()`, `jose`, Server Actions, `proxy.ts`.
- **File upload:** `react-dropzone` + `browser-image-compression` + `react-image-crop`, uploading via backend-issued presigned URLs.
- **Rich text editor (blogs):** Tiptap (`@tiptap/react` + StarterKit + extensions). Stores JSON.
- **Carousel:** Embla via shadcn's `Carousel` primitive.
- **Virtualization:** `@tanstack/react-virtual` for lists with 200+ items.
- **Data tables:** `@tanstack/react-table` + shadcn `Table`.
- **Drag-and-drop:** `dnd-kit` (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`).
- **Markdown rendering:** `react-markdown` + `remark-gfm` + `@tailwindcss/typography`.
- **i18n:** next-intl. **Error tracking:** Sentry. **Web Vitals:** Vercel Analytics + Speed Insights. **Product analytics:** PostHog.

### Explicitly rejected (full list in `.claude/skills/scaffold-nextjs-app/references/locked-stack.md`)
- **`pnpm`** — the scaffold script errors out if passed. npm is locked.
- **Pure `.css` files for components**, **CSS modules**, **BEM-style naming** — Tailwind utility classes on JSX are the locked styling model.
- **Raw Three.js** — always through react-three-fiber.
- **GIFs for animation** — use `<video>` instead.
- **`next-pwa`** (deprecated) — use Serwist.
- **Comlink** — the tiny in-house RPC wrapper covers the locked Web Worker use cases.
- Runtime CSS-in-JS (`styled-components`, `@emotion/*`).
- Full UI kits (`@mui/*`, `@chakra-ui/*`, `antd`, `@mantine/*`).
- `axios`, `redux`, `swr`, `jest`, `cypress`.
- `next-auth`, `@clerk/*`, `better-auth`, `lucia`.
- `moment`, `moment-jalaali`.
- `react-beautiful-dnd`, `react-window`, `react-virtuoso`.
- `swiper`, `slick-carousel`, `keen-slider`.
- `Lexical`, `Plate`, `TinyMCE`, `CKEditor`, `Quill`, `Draft.js`.
- `uppy`, `filepond`, `UploadThing`.

## Folder structure — feature-modular

The project layout is non-negotiable. Three top-level folders under `src/`:

```
src/
├── app/        # ROUTING ONLY — page.tsx, layout.tsx, etc.
├── common/     # shared infrastructure (components/ui, lib, services, hooks, stores, types, schemas)
└── modules/    # feature modules (auth, blog, dashboard, …)
```

**Dependency direction is one-way:** `app/` → `modules/` → `common/`. No upward imports. **No cross-module imports** — promote shared code to `common/` instead.

Each module exports through `index.ts`:
```ts
import { LoginForm, useCurrentUser } from '@/modules/auth';   // ✓ via barrel
import { LoginForm } from '@/modules/auth/components/login-form';  // ✗ reaches into internals
```

Canonical doc: `.claude/skills/scaffold-nextjs-app/references/folder-structure.md`. Read it before placing files. Every skill follows the per-skill location table at the end.

## Skills

```
.claude/skills/
├── scaffold-nextjs-app/                    # bootstrap a project — installs the entire Tier 1 stack + modular folders
├── add-http-client/                        # http() wrapper, HttpError class, handleApiError — the network primitive
├── add-common-utils/                       # 12 lib files: storage, cookies, numbers, strings, url, arrays, etc.
├── add-common-hooks/                       # 19 React hooks: useLocalStorage, useDebouncedValue, useMediaQuery, …
├── add-design-system-foundation/           # Three-layer DS foundation: variants, useSlots, InputOption, toOptions, Storybook (NEW)
├── add-responsive-foundation/              # Mobile-first, fluid type/spacing, container queries, 44×44 touch, verification (NEW)
├── create-ds-component/                    # Add a new ds component: variant file + ds/ + form/ + Storybook story (NEW)
├── add-accessibility/                      # WCAG 2.2 AA tooling + per-pattern references (NEW)
├── add-lazy-image/                         # Next.js <Image> rules: priority, sizes, formats, CLS prevention (NEW)
├── add-lazy-component-with-skeleton/       # next/dynamic + LazyOnView + dimensioned skeletons (NEW)
├── add-web-worker/                         # offload CPU-bound >50ms tasks to a worker (NEW)
├── add-pwa/                                # Serwist Service Worker + manifest + offline + install/update UI (NEW)
├── add-smooth-scroll/                      # opt-in Lenis with strict a11y safeguards (NEW)
├── add-gsap-animation/                     # tier-2 GSAP for complex timelines, lazy-loaded (NEW)
├── add-3d-scene/                           # react-three-fiber + drei, lazy + Suspense + perf budget (NEW)
├── create-route/                           # add an App Router route
├── create-component/                       # add a Server or Client component
├── create-server-action/                   # add a mutation + simple form (Zod-validated)
├── add-shadcn-component/                   # add a shadcn/ui primitive (button, dialog, …)
├── add-zustand-store/                      # add a typed Zustand store
├── add-tanstack-query/                     # add a useQuery / useMutation for client-reactive needs
├── add-rhf-form/                           # build a complex form (RHF + Zod + Server Action handoff)
├── format-date/                            # date formatting + manipulation (Gregorian + Jalali + Hijri)
├── setup-backend-auth/                     # one-time auth wiring against a separate backend
├── add-animation/                          # View Transitions / Activity / Motion patterns (tier-1)
├── add-file-upload/                        # drop zone + compression + crop + presigned-URL upload
├── add-rich-text-editor/                   # Tiptap-based editor for blogs / long-form
├── add-carousel/                           # shadcn Carousel patterns (Embla)
├── add-virtualized-list/                   # TanStack Virtual — long lists, infinite scroll
├── add-data-table/                         # TanStack Table + shadcn Table — sortable, filterable
├── add-drag-and-drop/                      # dnd-kit — sortable lists, kanban
├── add-markdown-content/                   # react-markdown — docs, AI content, external markdown
└── lint-and-typecheck/                     # quality gate before any handoff
```

Each skill is a folder with:
- `SKILL.md` — instructions Claude reads to execute it.
- `references/` — stack-specific docs Claude reads on demand.
- `assets/` — file templates Claude fills in.
- `scripts/` — executable scripts (where applicable).

## How the team works

The `frontend-lead` agent is the manager. It plans frontend work, then executes through the skills above. Typical order on a new project:

1. `scaffold-nextjs-app` — once, at project start. Creates the folder structure too.
2. `add-http-client` — once. Sets up the `http()` primitive every fetcher uses.
3. `add-common-utils` — once. Drops the 12 lib files into `src/common/lib/`.
4. `add-common-hooks` — once. Drops the 19 hook files into `src/common/hooks/`.
5. `format-date` — once if dates are needed.
6. `setup-backend-auth` — once if authentication is needed.
7. `create-route` — per page.
8. `create-component` — per reusable UI piece (Server by default).
9. `add-shadcn-component` — per primitive needed (`button`, `dialog`, etc).
10. `create-server-action` / `add-rhf-form` — per mutation (simple vs complex form).
11. `add-tanstack-query` / `add-zustand-store` — only when the rules in each skill say to.
12. `add-animation` / `add-file-upload` / `add-rich-text-editor` / `add-carousel` / `add-virtualized-list` / `add-data-table` / `add-drag-and-drop` / `add-markdown-content` — as the feature set requires.
13. `lint-and-typecheck` — before every handoff.

Agent definition: `.claude/agents/frontend-lead.md`.

## Core conventions

- **Three-layer component architecture is locked.** `common/components/ui/` (shadcn primitives, never edited) → `common/components/ds/` (project's design system) → `common/components/form/` (RHF wrappers). Product code imports from `ds/` and `form/` only. Variant files in `common/components/variants/` use shared tokens from `_shared.ts`. Every ds component has a Storybook story under `common/stories/`. Run `add-design-system-foundation` once after `add-common-hooks`, then `create-ds-component` for each new DS component, BEFORE feature pages start.
- **Responsive is mobile-first, always.** Base Tailwind classes target phone (375px); `sm:` / `md:` / `lg:` / `xl:` / `2xl:` prefixes ADD to them. Never desktop-first. Locked breakpoints: 640/768/1024/1280/1536 (Tailwind defaults). Fluid type and section spacing via `clamp()` (`text-fluid-*`, `gap-fluid-*`). Container queries (`@container` + `@md:`) for slot-agnostic ds components. 44×44 touch targets minimum (`min-h-touch min-w-touch`). Three-viewport verification (375/768/1280) before every handoff.
- **The extraction rule.** JSX repeated 3+ times with the same shape and intent becomes a component. Reusable interactive primitive → `ds/`. Feature-specific composite (`JobCard`, `ResumePreview`) → `modules/<feature>/components/`. Cross-feature composite shell (`PageHeader`, `EmptyState`) → `common/components/` root. Inline JSX repetition is a duty violation.
- **File naming is locked.** Components in PascalCase (`LoginForm.tsx`), hooks in camelCase (`useLocalStorage.ts`), everything else in kebab-case (`auth-service.ts`, `api-client.ts`). **No snake_case anywhere.** shadcn primitives in `common/components/ui/` keep their vendor kebab-case naming (they're vendored, not ours). Variant files in `common/components/variants/` are camelCase (utility modules, not components). ESLint's `unicorn/filename-case` rule enforces it per folder. Full doc: `.claude/skills/scaffold-nextjs-app/references/naming-convention.md`.
- **Styling is Tailwind utility classes on JSX.** No `.css` files except `globals.css`. No CSS modules. No BEM. No CSS-in-JS. Project tokens live in Tailwind config / CSS variables in `globals.css`.
- **Accessibility bar is WCAG 2.2 Level AA.** Non-negotiable. `eslint-plugin-jsx-a11y/strict`, `@axe-core/react` in dev, `axe-playwright` in CI. Every animation honors `prefers-reduced-motion`.
- **Performance is enforced.** Web Workers for CPU-bound >50ms tasks. Lazy-loaded heavy components with dimensioned skeletons. Next.js `<Image>` for every image. No `<img>` (except SVG).
- **Server Components are the default.** `'use client'` only on real triggers (state, effects, event handlers, browser APIs).
- **Initial data lives on the server.** RSC + `cache()`. TanStack Query is for client-reactive needs only.
- **`params` and `searchParams` are Promises.** Always `await`.
- **Caching tags require a profile.** `revalidateTag(tag, profile)`.
- **`proxy.ts` replaces `middleware.ts`** for request interception.
- **`ref` is a prop.** No `forwardRef`.
- **No manual `useMemo` / `useCallback` / `React.memo`.** The React Compiler memoises.
- **Validation is universal via Zod.** Same schema validates the form on the client and the action input on the server.
- **Authentication always goes through a separate backend.** Next.js never holds the user table.
- **All date logic goes through `src/common/lib/dates.ts`.** No direct `date-fns` imports in components.
- **Large file uploads go via presigned URL.** Next.js never proxies the bytes.
- **Tiptap editor output is JSON, not HTML.** Stored, rendered server-side via `generateHTML`.
- **Virtualization is for 200+ item lists.** Don't reach for it on small lists.
- **Package manager is npm.** All install commands in skills assume this. `pnpm` is rejected by `scaffold-nextjs-app`.

## Tool permissions

The scaffold and lint scripts need bash execution. Make sure the skills' `allowed-tools` frontmatter is honoured by your Claude Code settings, or run them through the FE Lead which inherits the necessary permissions.
