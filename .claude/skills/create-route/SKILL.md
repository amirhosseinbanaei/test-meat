---
name: create-route
description: Creates a new App Router route in a Next.js 16 project — page, layout, loading, error, not-found — using the FE team's conventions. Use whenever the frontend-lead needs to add a new page or wrap a section in a new layout. All generated files are TypeScript Server Components by default; async params are always handled correctly.
allowed-tools: Read, Write
---

# Create a Next.js 16 App Router route

This skill scaffolds one route segment in the App Router with all the conventional files filled in correctly: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.

Every file generated is a TypeScript Server Component unless interactivity is requested explicitly. `params` and `searchParams` are always treated as Promises — synchronous access does not exist in Next.js 16.

## When to use

- Adding any new page to the site.
- Wrapping a section in its own layout (e.g. a dashboard or auth shell).
- Adding a loading or error boundary to an existing route segment.

## When NOT to use

- The project has no `app/` directory yet — run `scaffold-nextjs-app` first.
- The user wants a Route Handler (API endpoint). That's a different file (`route.ts`) and a different skill (not yet built — escalate to FE Lead).

## Inputs expected

- `route_path` — the URL path of the new segment relative to `app/`. Examples: `/`, `/blog`, `/blog/[slug]`, `/(marketing)/about`.
- `files` — which of `page`, `layout`, `loading`, `error`, `not-found` to generate. Default: just `page`.
- `dynamic` — `true` if the segment is dynamic (the path contains `[param]` or `[...slug]`). The skill detects this from `route_path` and templates the params type accordingly.

## Workflow

1. Read `references/app-router-conventions.md` — understand which file is for what and the rules for each.
2. Read `references/async-params.md` if the route is dynamic — confirm how `params` and `searchParams` must be awaited.
3. Resolve the target directory: `src/app/<route_path>/`. Create it if it does not exist.
4. For each requested file, copy the matching template from `assets/`, then fill in:
   - The route's params type (for dynamic segments).
   - A meaningful component name based on the route path.
   - Sensible default contents (a placeholder heading and metadata) — the FE Lead will replace these after.
5. Hand the file list back so the FE Lead can run `lint-and-typecheck` next.

## Files in this skill

- `assets/page.tsx.template` — page template (the actual page content).
- `assets/layout.tsx.template` — layout template (wraps the segment and its children).
- `assets/loading.tsx.template` — streaming fallback while the page renders.
- `assets/error.tsx.template` — error boundary for the segment (must be a Client Component).
- `assets/not-found.tsx.template` — 404 boundary for the segment.
- `references/app-router-conventions.md` — which file convention is for what.
- `references/async-params.md` — how to handle `params` and `searchParams` in Next.js 16.

## Output

A set of `.tsx` files inside `src/app/<route_path>/` ready to compile. They will pass `tsc --noEmit` immediately, even before any real content is added.
