---
name: add-markdown-content
description: Renders markdown content as HTML — for docs pages, AI-generated content, externally sourced markdown, changelogs. Uses `react-markdown` + `remark-gfm` + Tailwind Typography for styling. Use for displaying markdown SOURCE; for rich-text editing in the blog editor, use add-rich-text-editor (Tiptap) instead — Tiptap stores JSON, not markdown.
allowed-tools: Bash(npm *), Bash(npx *), Read, Write
---

# Render markdown content

When the project has content that's authored as markdown — documentation, AI-generated summaries, externally fetched markdown (GitHub READMEs, blog feeds), changelogs — render it with `react-markdown`.

## Where this fits vs the rich text editor

| You have… | Use |
|---|---|
| A Tiptap editor producing JSON | `add-rich-text-editor` → render with the JSON renderer |
| Markdown source as a string | this skill |
| HTML from a CMS | (escalate — usually a sign content authoring needs revisiting) |

It's common to want both — Tiptap for blog post composition, react-markdown for docs pages. They coexist fine.

## When to use

- A docs page rendered from `.md` files in the repo.
- AI-generated content (most LLMs emit markdown).
- Imported content from a markdown source (Notion exports, GitHub READMEs, public RSS).
- A changelog page sourced from `CHANGELOG.md`.

## When NOT to use

- Blog post bodies authored in Tiptap — use the Tiptap JSON renderer instead.
- Plain user-typed text in comments — markdown rendering on user input opens parsing edge cases. Prefer plain text + autolink.

## Why these libraries

- **`react-markdown`** — the standard, well-maintained markdown renderer for React. Built on `unified` / `remark` / `rehype` — modular, predictable, no surprises.
- **`remark-gfm`** — adds GitHub Flavoured Markdown: tables, strikethrough, task lists, autolinks. Most markdown users expect these.
- **`@tailwindcss/typography`** — supplies the `prose` class for clean, readable defaults. Without it, your headings, paragraphs, and lists will look unstyled.

## Packages to install (per-skill)

```bash
npm install react-markdown remark-gfm
npm install --save-dev @tailwindcss/typography
```

Then add the typography plugin to your Tailwind config:

```js
// tailwind.config.ts
plugins: [require('@tailwindcss/typography')],
```

## Inputs expected

- `component_name` — PascalCase, e.g. `MarkdownContent`.
- `allow_html` — default `false`. Set `true` only when the markdown source is trusted (your own docs files). Never `true` for user-provided or fetched content.

## Workflow

1. Read `references/markdown-rendering.md` — the security model, GFM specifics, customising element renderers.
2. Copy `assets/markdown.tsx.template` to `src/common/components/markdown.tsx`. The renderer is shared — used by docs pages, blog excerpt previews, and any other surface that displays markdown.
3. Use as a Server Component:
   ```tsx
   <Markdown>{markdownString}</Markdown>
   ```
4. For code blocks with syntax highlighting, see the reference doc — typically via `rehype-pretty-code` or Shiki, both server-side, no client cost.

## Files in this skill

- `assets/markdown.tsx.template` — the Markdown renderer Server Component.
- `references/markdown-rendering.md` — security, GFM, customising renderers, code highlighting.
