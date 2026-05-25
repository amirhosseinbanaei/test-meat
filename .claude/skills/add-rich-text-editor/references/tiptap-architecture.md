# Tiptap architecture

Tiptap is a thin React wrapper around ProseMirror. Understanding three concepts — schema, nodes/marks, extensions — saves hours of confusion.

## ProseMirror's schema

Every Tiptap editor has a **schema**: a strict declaration of which content types are allowed and how they can nest. If the schema says "blockquote can contain paragraphs but not headings", trying to put a heading in a blockquote silently fails.

This is the safety property:

- Pasted HTML that doesn't match the schema gets sanitised on the way in.
- Stored JSON that doesn't match the schema gets sanitised on the way out (when rendered).
- The editor can't produce content the schema doesn't permit.

For our blog use case, the StarterKit's schema is good enough:

- **Block nodes** — paragraph, heading (1-6), bullet/ordered list, blockquote, code block, horizontal rule.
- **Inline nodes** — text, hard break.
- **Marks** — bold, italic, strike, code (inline).
- **Plus the extensions we add** — Link (mark), Image (block node), Placeholder.

Adding tables, mentions, task lists, etc. extends the schema. Each extension is one `npm install` away.

## Nodes vs marks

This trips everyone up.

- **Nodes** are block-level or inline elements that have content of their own — paragraph, heading, image, list item.
- **Marks** are formatting applied to a range of text — bold, italic, link.

Bold isn't a `<strong>` node containing a text node; it's a "bold mark" applied to one or more text nodes. This matters for two reasons:

1. The Tiptap commands are named accordingly — `toggleBold` (mark) vs `setParagraph` (node).
2. When you query state, marks and nodes have different APIs — `editor.isActive('bold')` (mark) vs `editor.isActive('heading', { level: 1 })` (node with attrs).

## The state lives in ProseMirror

Tiptap is a controlled component pattern in spirit, but **the editor owns its own state** internally. You don't pass `value` and re-render on each keystroke (that would be unbearably slow for long documents).

The pattern:

- Initialise with `content: storedJSON`.
- Subscribe to `onUpdate` (fired on each change, debounced internally).
- On form submit, read the current state with `editor.getJSON()`.

If you NEED to re-set the editor's content from outside (e.g. loading a different draft), call `editor.commands.setContent(newJSON)` — but use sparingly. The "value lives in the editor" model is the right one 99% of the time.

## Extensions

Three types:

| Type | What it adds |
|---|---|
| **Node** | A new block or inline kind of content (Image, Mention, Table). Schema extension. |
| **Mark** | A new text decoration (Link, Highlight, Underline). Schema extension. |
| **Functionality** | No schema change; just behaviour (Placeholder, History — which is in StarterKit, CharacterCount, BubbleMenu). |

StarterKit bundles the most common ones (Bold, Italic, Strike, Code, Heading, Paragraph, BulletList, OrderedList, ListItem, Blockquote, CodeBlock, HorizontalRule, HardBreak, Dropcursor, Gapcursor, History, Text, Document). You almost always start with StarterKit + a couple specific extensions.

## Server-side rendering and Next.js

Tiptap is a Client Component — it uses refs and contains a ProseMirror DOM view. To avoid hydration mismatches in Next.js App Router:

- Pass `immediatelyRender: false` to `useEditor` (already in the template). This delays the editor's DOM construction until after hydration.
- The editor file itself is `'use client'`.
- The renderer for stored JSON is a **Server Component** — it uses `generateHTML` (sync, no browser APIs needed).

The split is important: editing happens in a Client Component; reading happens in a Server Component. Pages that show a finished blog post should never bundle Tiptap's editor code.

## The "list of extensions" gotcha

If the editor and the renderer disagree on which extensions exist, content can be lost on render.

The safest pattern: a shared `extensions.ts` file imported by both:

```ts
// src/components/editors/tiptap-extensions.ts
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

export const tiptapExtensions = [
  StarterKit,
  Link.configure({ openOnClick: false }),
  Image,
];
```

Then both `editor.tsx` and `render-tiptap-json.tsx` import `tiptapExtensions`. When a feature is added (e.g. tables), it lands in one file and both sides update.

The templates in this skill don't enforce the split — refactor to a shared list as soon as the project adds more than one extension to the renderer.

## Performance for long documents

- The starter kit handles documents up to ~10,000 words without issue.
- For longer documents (book chapters, transcripts), virtualisation isn't available in Tiptap. Split into multiple editors per section.
- The `onUpdate` callback fires often; the parent's setState is fine, but avoid heavy work synchronously inside `onUpdate`. Debounce auto-save with `setTimeout` + cleanup.

## What about Lexical / Plate / TinyMCE?

- **Lexical** (Meta) — fast, growing. The team's reason for Tiptap over Lexical: bigger extension ecosystem, easier headless theming with Tailwind, more docs / examples online. Both are good; Tiptap is the pick.
- **Plate** — built on Slate. Lots of components out of the box; heavier; opinionated UI. Tiptap gives more control.
- **TinyMCE / CKEditor** — commercial. Out of scope.

Stick with Tiptap unless a project has a very specific need the others uniquely solve.
