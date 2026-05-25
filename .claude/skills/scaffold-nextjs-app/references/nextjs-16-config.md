# Next.js 16 — Locked configuration reference

This file explains every option set in `next.config.ts.template` so the FE Lead always knows *why* a flag is there. Stay at the conceptual level — do not change values without team agreement.

## Why `reactCompiler: true`

The React Compiler (stable since React Compiler 1.0, October 2025) memoises components and hooks at build time. With it on:

- Manual `useMemo`, `useCallback`, and `React.memo` become unnecessary in almost all cases.
- Components re-render less often without any code change.
- Some hand-written memos that *were* correct in React 18 may become wrong with the compiler — the compiler's analysis is stricter than humans usually are.

Trade-off: compile times in `next dev` and `next build` are a little slower because the compiler relies on Babel. This is acceptable. The runtime gains outweigh the build cost for production traffic.

## Why `typedRoutes: true`

Typed routes turn every `<Link href="/some/path">` into a compile-time check. If the route doesn't exist, TypeScript errors before the dev server even runs. This catches a class of "broken internal link" bugs that are otherwise invisible until QA.

## Why `reactStrictMode: true`

This is the default in Next.js 16, but we set it explicitly to make the contract obvious. Strict mode double-invokes effects in development to surface subtle bugs and is harmless in production.

## Why no custom webpack config

Turbopack is the default bundler in Next.js 16 for both `next dev` and `next build`. If you add a `webpack` block to `next.config.ts`, the build will refuse to run. If you genuinely need a build extension, use `turbopack.resolveAlias` or a Build Adapter (alpha API). Bring this to the FE Lead first — it should be rare.

## Why no `experimental.ppr`

Partial Prerendering's experimental flag is gone. In Next.js 16 it has been replaced by Cache Components, which is the documented path for that pattern. Do not re-introduce `experimental.ppr` — it will be ignored or error.

## Image remote patterns

By default Next.js will refuse to optimise images from hostnames that aren't listed in `images.remotePatterns`. This is intentional — it stops random remote hosts being trusted as image sources. Add a `remotePatterns` entry whenever a new external image source is introduced. Never set `unoptimized: true` to skip this check.

## What's intentionally absent

- `swcMinify` — always true in Next.js 16, no flag needed.
- `experimental.serverActions` — Server Actions are stable now, no flag needed.
- `appDir` — App Router is the only router we use. No flag needed.
- Custom Babel plugins outside the React Compiler — these break Turbopack performance. If a Babel plugin is required, escalate to the FE Lead.
