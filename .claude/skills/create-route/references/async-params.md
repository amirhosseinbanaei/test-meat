# Async params and searchParams in Next.js 16

This is the **largest** breaking change between Next.js 14 and Next.js 16. Every page and layout in a dynamic route must handle it correctly or the build fails.

## The rule

In Next.js 16, `params` and `searchParams` are **Promises**, not plain objects. The synchronous form was deprecated in Next.js 15 and **removed** in Next.js 16. There is no compatibility shim. The TypeScript types now reflect this — if you treat them as plain objects, the type error blocks the build.

## How to read them

In an `async` Server Component, `await` the promise:

```tsx
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  // …use slug and page here
}
```

In a Client Component (which can't be `async`), use React's `use()` hook to unwrap the promise:

```tsx
'use client';
import { use } from 'react';

type Props = { params: Promise<{ slug: string }> };

export default function ClientPage({ params }: Props) {
  const { slug } = use(params);
  return <div>{slug}</div>;
}
```

## Why this changed

Treating params as promises lets Next.js stream them. The router can hand the page tree to React before the dynamic values are fully resolved, so the layout and any non-param-dependent content can render immediately while the param-dependent parts stream in. The synchronous form blocked all of that.

## What layouts get

Layouts receive `params` only — **never** `searchParams`. This is intentional. Layouts are shared across many URLs in a segment; if they could read `searchParams`, every search change would invalidate the layout and break the "layouts don't re-render on navigation" guarantee.

If a layout needs to react to search params, lift the logic into the page beneath it.

## What `generateStaticParams` returns

`generateStaticParams` for dynamic routes still returns a plain array of objects — it is **not** affected by the Promise change. The Promise wrapping happens at the page-component boundary, not at the build-time generator boundary.

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((post) => ({ slug: post.slug })); // plain objects, not promises
}
```

## Mistakes the compiler will catch for you

- `params.slug` instead of `(await params).slug` — TypeScript error.
- `searchParams.foo` — TypeScript error.
- Destructuring synchronously: `const { slug } = params;` — TypeScript error.

If TypeScript is happy, you're handling it correctly.

## Codemod path

If migrating an old project, `npx @next/codemod@canary upgrade latest` walks every page and layout and converts the prop types to Promises and adds `await`. Do not hand-migrate file by file — the codemod is reliable for this transform.
