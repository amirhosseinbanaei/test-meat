---
name: scaffold-nextjs-app
description: Bootstraps a new Next.js 16 project with the FE team's fully locked stack — Tailwind, shadcn/ui CLI initialised, Zod, Zustand, TanStack Query, React Hook Form, date-fns + date-fns-jalali, Motion, Lucide, Vitest, T3 Env, plus the React Compiler and ESLint preset. Use this when starting a brand-new project. Do not use to modify an existing project.
allowed-tools: Bash(bash *), Bash(npx *), Bash(npm *), Bash(npm *), Bash(yarn *), Bash(node *), Read, Write
---

# Scaffold a Next.js 16 app with the locked stack

Bootstraps a fresh Next.js 16 project and installs **every package the FE team has locked**. After this skill runs, the project has the full toolchain ready — Tailwind configured, shadcn/ui initialised, all data/form/state libraries installed, the React Compiler wired up, ESLint preset active, test runners ready.

## When to use

- The orchestrator is starting a new website project, no `package.json` exists yet.
- A brand-new project explicitly requested in the brief.

## When NOT to use

- A project is already in place — add to it with the other skills.
- The brief calls for a different framework — escalate to FE Lead, do not deviate silently.

## Inputs expected

- `project_name` — folder name. Default: `web`.
- `package_manager` — `npm` | `yarn`. Default: `npm` (**locked**). **`pnpm` is rejected** — the locked stack standardizes on npm for zero-install simplicity, predictable CI, and zero per-developer setup. If the script receives `pnpm`, it errors and exits.
- `with_jalali` — `true` if the project needs Iranian/Persian calendar support; installs `date-fns-jalali`. Default: `true` (we ship it by default since it's a small package and most projects in our context need it).

## Workflow

1. Read `references/folder-structure.md` — **the modular layout the scaffold creates**. Every other skill places files according to this doc; understanding it is prerequisite to using the project.
2. Read `references/naming-convention.md` — **the file naming rules** (PascalCase components, camelCase hooks, kebab-case everything else, no snake_case ever). ESLint enforces this mechanically.
3. Read `references/locked-stack.md` — the canonical list of every installed package and what it's for.
4. Read `references/nextjs-16-config.md` and `references/react-compiler-setup.md` — what the configs do.
5. Run the scaffolding script:
   ```bash
   bash ${CLAUDE_SKILL_DIR}/scripts/scaffold.sh <project_name> <package_manager> <with_jalali>
   ```
5. After it completes, run `lint-and-typecheck` against the new project. The scaffolded code passes immediately; if it doesn't, the templates need updating.

## What the script does, in order

1. Runs `create-next-app@latest` with locked flags (TS, ESLint, App Router, src dir, alias `@/*`, Tailwind on).
2. Replaces the generated configs with the FE team's locked versions (`next.config.ts`, `tsconfig.json` with `@/common/*` and `@/modules/*` aliases, `eslint.config.mjs`).
3. Installs **runtime** packages: `zod`, `zustand`, `@tanstack/react-query`, `@tanstack/react-query-devtools`, `react-hook-form`, `@hookform/resolvers`, `date-fns`, `date-fns-jalali` (conditionally), `motion`, `lucide-react`, `jose`, `@t3-oss/env-nextjs`.
4. Installs **dev** packages: `babel-plugin-react-compiler`, `eslint-plugin-react-hooks@latest`, `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`, `jsdom`.
5. Initialises `shadcn/ui` via its CLI, then **rewrites `components.json`** so primitives land in `src/common/components/ui/` instead of the default `src/components/ui/`. Moves the generated `lib/utils.ts` to `src/common/lib/utils.ts`.
6. **Creates the modular folder structure** under `src/`: `common/{components/ui,lib,services,hooks,stores,contexts,types,schemas}/` and `modules/`. Drops short READMEs inside `common/` and `modules/` pointing at the convention doc.
7. Drops starter library files: `src/common/lib/env.ts` (T3 Env schema), `src/app/providers.tsx` (TanStack Query provider).
8. Runs a verification build to make sure everything compiled.

## Output

A new directory at `./<project_name>` with the full locked stack installed and working. The FE Lead can immediately start using the other skills against it.

## Files in this skill

- `scripts/scaffold.sh` — the executable scaffolding script.
- `assets/next.config.ts.template` — locked Next.js config (React Compiler, typed routes).
- `assets/tsconfig.json.template` — locked TypeScript config (strict mode + extras + `@/common/*` and `@/modules/*` aliases).
- `assets/eslint.config.mjs.template` — locked ESLint config.
- `assets/env.ts.template` — T3 Env schema with placeholder vars.
- `assets/providers.tsx.template` — QueryClient provider for the root layout.
- `references/folder-structure.md` — **the canonical modular folder convention. Every other skill follows this.**
- `references/naming-convention.md` — **the file naming convention. PascalCase / camelCase / kebab-case rules enforced by ESLint.**
- `references/locked-stack.md` — every package, what it's for, and the FE Lead's usage rule.
- `references/nextjs-16-config.md` — Next.js config explained.
- `references/react-compiler-setup.md` — React Compiler wiring.
