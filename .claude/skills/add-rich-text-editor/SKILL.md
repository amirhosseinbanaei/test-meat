---
name: add-rich-text-editor
description: Adds a Tiptap-based rich text editor — used for blog post composition, long-form content, in-app comments with formatting. Tiptap is headless and built on ProseMirror; pairs naturally with Tailwind and shadcn. Outputs JSON for storage (preferred) or HTML if needed. Use whenever the user needs to write formatted text — bold, headings, lists, links, embedded images, code blocks.
allowed-tools: Bash(npm *), Read, Write
---

# Add a Tiptap rich text editor

Tiptap is the FE team's rich text choice. Headless (we style with Tailwind), ProseMirror-based (battle-tested), extensible.

## When to use

- Blog post editor.
- Long-form content composition anywhere — page content, course material, knowledge base.
- Comments that need formatting (rarely worth it — usually plain text + markdown is enough).

## When NOT to use

- Plain text input — `<textarea>` is fine.
- Markdown editor where the user types raw markdown — let them type into a textarea and render with `add-markdown-content`.
- Code-only input — use Monaco or CodeMirror, not Tiptap.

## Output format — JSON, not HTML

Default: serialize Tiptap output as **JSON** and store it. Render server-side by feeding the JSON back through Tiptap's `generateHTML` (or `renderToReactElement`).

Why JSON:

- Structured. Easy to migrate when the schema evolves.
- Lossless. Nothing the editor can produce gets dropped on save.
- Safe. No HTML sanitisation problem — you never serve user-pasted HTML directly.
- Searchable. Walk the tree to extract plain text for search indexes.

When to use HTML: when the content needs to be embedded in non-Tiptap contexts (RSS feeds, email digests). Even then, store JSON; convert to HTML at render time.

## Packages to install (per-skill, NOT in scaffold)

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-link @tiptap/extension-image \
  @tiptap/extension-placeholder
```

Add more extensions only as the feature set grows (e.g. `@tiptap/extension-table` for tables, `@tiptap/extension-code-block-lowlight` for syntax-highlighted code blocks). Each extension is small; install on demand.

## Inputs expected

- `editor_component_name` — PascalCase, e.g. `BlogPostEditor`, `CommentEditor`.
- `placeholder` — placeholder text.
- `extensions` — list beyond the starter kit: `link`, `image`, `code-block`, `table`, `mentions`, etc.
- `image_upload` — `true` if the editor should support inline image uploads. If yes, this skill assumes `add-file-upload` is already set up.

## Workflow

1. Read `references/tiptap-architecture.md` — how Tiptap's editor / state / extensions relate, the difference between schema marks and nodes.
2. Read `references/blog-editor-patterns.md` — the patterns specific to a blog editor: toolbar, slash commands, image embedding, save-as-JSON.
3. Install the packages above (+ any feature-specific extensions).
4. Copy `assets/editor.tsx.template` to `src/modules/<feature>/components/<EditorName>.tsx`. The editor belongs to the module that owns the content type — typically `modules/blog/components/blog-post-editor.tsx`.
5. Copy `assets/render-tiptap-json.tsx.template` to `src/modules/<feature>/components/render-tiptap-json.tsx` — the read-side renderer for stored JSON.
6. Wire the editor: parent component owns the JSON state (`Editor`'s `onUpdate` returns the JSON), submits via a Server Action (in the same module's `actions/`).
7. For image uploads: the editor's image command calls the `useUploadPresigned` hook from `add-file-upload`; on success, inserts the returned URL as an image node.
8. If the editor is part of the module's public surface (rare — usually internal to one page), export it through `src/modules/<feature>/index.ts`.

## Files in this skill

- `assets/editor.tsx.template` — the Tiptap editor Client Component with a basic toolbar.
- `assets/render-tiptap-json.tsx.template` — server-renderable component that takes stored JSON and outputs HTML.
- `references/tiptap-architecture.md` — schema, state model, extension types.
- `references/blog-editor-patterns.md` — toolbar, slash commands, image embedding, accessibility.
