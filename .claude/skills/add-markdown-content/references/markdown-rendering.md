# Markdown rendering

The patterns for `react-markdown` + `remark-gfm` in this stack.

## Security: HTML in markdown

Markdown allows raw HTML by default:

```md
This is **bold**, but <script>alert('xss')</script> is dangerous.
```

`react-markdown` disables HTML by default (with `skipHtml: true`). The template enforces this — `allowHtml` defaults to `false`, the prop maps to `skipHtml`.

**Set `allowHtml: true` only when the source is trusted at build time** (your own `.md` files in the repo). For:

- AI-generated content
- User-pasted content
- Fetched markdown from any external source

…leave `allowHtml: false`. The output is sanitised by virtue of the renderer never emitting raw HTML from the source.

## GFM additions

`remark-gfm` adds:

| Feature | Syntax |
|---|---|
| Tables | `\| col \| col \|` with `\|---\|---\|` separator |
| Strikethrough | `~~struck~~` |
| Task lists | `- [ ] todo` / `- [x] done` |
| Autolinks | URLs become links automatically |
| Footnotes | `[^1]` and `[^1]: ...` |

This is what users mean by "markdown" in 2026. Don't ship without it.

## Tailwind Typography

`@tailwindcss/typography` provides the `prose` utility class. Add it to the wrapper and headings, paragraphs, lists, blockquotes, tables, and code all look reasonable out of the box.

```tsx
<div className="prose prose-neutral dark:prose-invert max-w-none">
  <Markdown>{source}</Markdown>
</div>
```

- `prose` enables the styles.
- `prose-neutral` / `prose-slate` / `prose-zinc` — color scheme.
- `dark:prose-invert` — invert for dark mode.
- `max-w-none` — remove the default 65ch max width. Important when the markdown is inside a designed page; let your layout decide the width.

For finer control over what `prose` styles, the Tailwind Typography docs have a full modifier list (`prose-headings:`, `prose-a:`, `prose-table:`, etc.).

## Customising element renderers

`react-markdown`'s `components` prop maps element names to custom renderers. The template uses this to open external links in new tabs:

```tsx
<ReactMarkdown
  components={{
    a: ({ href, children, ...props }) => {
      const isExternal = href?.startsWith('http');
      return (
        <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} {...props}>
          {children}
        </a>
      );
    },
  }}
>
```

Other useful overrides:

- **Headings**: add `id` for anchor links, or include a "#" copy-link button.
- **Images**: use Next.js `<Image>` instead of plain `<img>` (needs `next.config.ts` `images.remotePatterns` set up).
- **Tables**: wrap in `<div class="overflow-x-auto">` for responsive horizontal scrolling.
- **Code blocks**: see the syntax highlighting section below.

## Syntax highlighting for code blocks

react-markdown emits ``<pre><code className="language-xxx">…</code></pre>`` for fenced code blocks. To highlight:

### Option 1: `rehype-pretty-code` (Shiki-based, server-side)

Best path. Highlighting happens at render time (server), zero client JS, every theme Shiki supports.

```bash
npm install rehype-pretty-code shiki
```

```tsx
import rehypePrettyCode from 'rehype-pretty-code';

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[[rehypePrettyCode, { theme: 'github-dark' }]]}
>
```

### Option 2: `react-syntax-highlighter` (client-side)

Older, larger, runs on the client. Avoid unless there's a specific reason.

### Option 3: don't highlight

If the page only occasionally shows code, plain monospace with a subtle background is fine. Tailwind Typography styles it already.

## Component injection ("MDX-light")

`react-markdown` doesn't let you embed custom React components in the source (`<MyChart />` won't work — it's HTML, which is disabled).

If you need that, the right tool is **MDX** (`@next/mdx` or `next-mdx-remote`), not react-markdown. MDX is a superset of markdown that compiles to JSX, letting `<MyChart data={...} />` evaluate as React.

| Need | Use |
|---|---|
| Plain markdown + GFM | `react-markdown` (this skill) |
| Markdown + React components inline | MDX |
| Rich text WYSIWYG editor | Tiptap (`add-rich-text-editor`) |

Don't reach for MDX unless the project genuinely has component-in-markdown needs. It's heavier to set up.

## Server-side fetching

Since the renderer is a Server Component, fetching the markdown source is straightforward:

```tsx
// app/docs/[slug]/page.tsx
import { readFile } from 'node:fs/promises';
import { Markdown } from '@/components/content/markdown';

export default async function DocsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const source = await readFile(`./content/docs/${slug}.md`, 'utf-8');
  return <Markdown>{source}</Markdown>;
}
```

For markdown from a CMS or backend, use the api-client to fetch, then pass to `<Markdown>`. Validate the source as a string with Zod when crossing the network boundary.

## Performance

`react-markdown` parses on every render. For pages where the markdown comes from a Server Component, this happens once on the server — fine.

If the markdown is dynamic on the client (preview pane in an editor), memoise the parsed result. Don't re-parse on every keystroke.

## What NOT to do

- **Don't enable `allowHtml: true` for any content you didn't write.** XSS waiting to happen.
- **Don't pipe Tiptap output through this.** Tiptap stores JSON; use the Tiptap renderer for it.
- **Don't generate IDs on the client for heading anchors.** Either bake them into the renderer (server-side), or skip them. Client-side ID generation breaks RSC hydration.
- **Don't render extremely long markdown documents (>100 KB) on the client.** Render on the server (default for this skill) and the user gets static HTML.
