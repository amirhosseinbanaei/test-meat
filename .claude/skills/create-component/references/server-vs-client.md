# Server Components vs Client Components

This is the single most important architectural decision in any Next.js 16 App Router project. Get it wrong on the high-traffic pages and you ship megabytes of JavaScript the user didn't ask for.

## The two worlds

| Server Components                            | Client Components                              |
|----------------------------------------------|------------------------------------------------|
| Run on the server only.                      | Run on the server (for SSR) and the browser.   |
| Zero JS sent to the client for this component. | The component's JS ships to the client.      |
| Can be `async`. Can await data directly.     | Cannot be `async`. Must read data via `use()` or fetch in an effect. |
| Cannot have state, effects, or handlers.     | Has state, effects, and handlers.              |
| Cannot use browser APIs.                     | Can use browser APIs.                          |
| Default everywhere.                          | Requires `'use client'` at the top of the file. |

## How the boundary works

You don't draw the boundary per *component* — you draw it per *file*. The `'use client'` directive applies to the file it's in and to every module that file imports. Once a Client Component imports a "Server-side-only" module (one that uses Node APIs, DB calls, secrets), the build fails.

But the **other direction works fine**: a Server Component can render a Client Component as a child. That's how you mix them.

```tsx
// app/products/page.tsx — Server Component (default)
import { getProducts } from '@/common/services/db';     // server-only OK here
import AddToCartButton from '@/components/add-to-cart-button';  // ← Client Component

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name}
          <AddToCartButton productId={p.id} />  {/* Client island inside Server tree */}
        </li>
      ))}
    </ul>
  );
}
```

The `<AddToCartButton>` is interactive. Everything else (the data fetch, the loop, the markup) ran on the server and shipped as HTML.

## "Push the boundary down"

The single biggest mistake people make: putting `'use client'` at the top of the **whole page**. That makes every descendant a Client Component and ships the whole subtree's JavaScript. Even simple presentational children — which didn't need to be Client at all — become part of the client bundle.

The fix: extract just the interactive piece into its own file with `'use client'`, and import it from a Server parent. Push `'use client'` as close to the leaf as possible.

## Props that cross the boundary must be serialisable

Server → Client passes props through serialisation. Allowed: primitives, plain objects, arrays, Dates, Maps, Sets, `Promise`s (React 19 unwraps them on the client via `use()`), and JSX. **Not allowed:** functions (other than Server Actions, which are special), class instances, symbols, `Map` of functions, etc.

If you need to pass a callback from the server to the client, what you actually want is a **Server Action**. Use the `create-server-action` skill.

## Cheap mental model

- If the component only renders props and JSX → Server.
- If the component fetches data → Server.
- If the component uses any of `useState`, `useEffect`, `onClick`, `window.x` → Client.
- If you're unsure → Server. The compiler will tell you if it can't be on the server.

## What changes with React 19.2

Two new options for behaviour that used to require client-side libraries:

- **View Transitions** — animated page transitions without a library. The transition itself is implemented in React and works across the Server/Client boundary.
- **`<Activity />`** — hide and unhide UI without unmounting. Useful for tab-like interfaces where you want to preserve state in inactive tabs without paying the re-mount cost. Works in both Server and Client trees.

Use these before reaching for a third-party animation or state library.
