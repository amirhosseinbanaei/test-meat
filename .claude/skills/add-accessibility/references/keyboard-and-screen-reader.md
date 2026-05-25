# Keyboard and screen-reader testing

The two testing modalities that catch what tools can't. Keyboard testing is cheap and fast. Screen-reader testing is slower but catches what keyboard alone misses.

## Keyboard testing — the 60-second walkthrough

For any new feature, do this manually before merging:

1. Click in the address bar to clear focus.
2. Press **Tab**. The first focusable element should be the skip link OR (if no skip link) something obvious near the top.
3. Press **Tab** again. The focus moves to the next logical element. Visible indicator.
4. Continue through the feature. Every interactive element should be reachable.
5. At each element, the **correct activation key works**:
   - **Enter** activates buttons and links.
   - **Space** activates buttons and toggles checkboxes.
   - **Arrows** navigate within radio groups, tabs, menus, sliders.
   - **Escape** dismisses dialogs, popovers, menus.
6. **Shift+Tab** moves backwards. The reverse path matches the forward path (no orphans).
7. Inside any modal: Tab cycles within. Escape closes. Focus returns to the trigger.

If any step fails, the feature isn't done.

## Screen-reader testing matrix

Three combinations cover ~95% of users:

| Screen reader | OS | Browser | Cost / setup |
|---|---|---|---|
| **VoiceOver** | macOS | Safari | Free, built-in. Cmd+F5 to start. |
| **NVDA** | Windows | Firefox or Chrome | Free download. |
| **TalkBack** | Android | Chrome | Built-in. Activate via Settings → Accessibility. |

The team's locked test matrix: **VoiceOver on macOS Safari** (most accessible to a developer with a Mac) and **NVDA on Windows Chrome** (most-used desktop screen reader). TalkBack for mobile-critical projects.

JAWS is the other major Windows screen reader, more common in enterprise. Licensed. NVDA covers the same ground for testing purposes.

## VoiceOver basics

- **Cmd+F5** — start/stop.
- **Ctrl+Option+Right Arrow** — next element.
- **Ctrl+Option+Space** — activate.
- **Ctrl+Option+U** — open rotor (jump to headings, links, form controls, landmarks).
- **Tab** — move between focusable elements (same as no-VO Tab).

The rotor is the killer feature. Open it and switch to "Headings" — you should see a logical heading outline. If your page jumps from h1 to h4 to h2, that's an authoring bug.

## NVDA basics

- **Insert+T** — read title.
- **Down Arrow** — next element.
- **Insert+F7** — element list (links, headings, form fields, landmarks).
- **H** — next heading. **F** — next form field. **K** — next link. (Single-letter navigation.)
- **NVDA+Down** — read continuously.

## What to verify

For any feature, walk it with a screen reader and confirm:

1. **Heading outline is logical.** h1 is page topic, h2 are major sections, h3 are subsections, no skipped levels.
2. **Landmarks announce.** `<header>`, `<nav>`, `<main>`, `<footer>` announce their landmark roles.
3. **Form labels announce.** Each input should announce its label, required state, and any helper text.
4. **Buttons announce purpose.** "Save" not "button". Icon buttons announce their `aria-label`.
5. **State changes announce.** Opening a menu, completing a save, applying a filter — these should reach the user.
6. **Error messages announce.** When validation fails, the user hears the error without having to navigate to find it.
7. **Live regions don't over-announce.** Don't put `aria-live="polite"` on something that updates 60 times per second.

## Reading order

Screen readers read in DOM order, not visual order. This catches CSS-only reordering bugs:

- A floating panel that visually appears at the top but is `<aside>` at the bottom of the source: VoiceOver reads it last.
- A two-column layout where source order is "left column then right column" but visual order is "right then left" due to `direction: rtl` or grid placement: confusing.

Fix in source order. CSS Grid's `order` property and flex `order` are visually convenient but break reading order. Don't use them for content reordering.

## Focus management on route change

This is the silent breakage that Next.js routing has by default. On client-side navigation, focus stays where it was on the previous page. Screen-reader users land on the new page with no announcement and focus somewhere weird.

The locked fix in the team's projects: a `useFocusOnRouteChange` hook (in `common/hooks/`) that:

1. Watches the pathname.
2. On change, focuses `#main` (the main content region).
3. Optionally announces the page title via an aria-live region.

Mount it in `app/layout.tsx` once. From then on, every navigation does the right thing.

## Testing per feature

When building a new feature, the locked workflow:

1. **Build with keyboard in mind.** Tab through as you build.
2. **Run axe in dev** (AxeReporter is mounted). Fix violations as they appear.
3. **Before merge, run the 60-second keyboard walkthrough.**
4. **Before merge, screen-reader-walk it** if the feature is non-trivial (new modal, new flow, new interaction pattern). Skip for tiny tweaks.

## Pre-launch
qa-lead's audit (see `audit-checklist.md`) includes a full screen-reader walkthrough of the critical user journeys. That's the gate.

## Common screen-reader bugs and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Button announces as "button" with no name | Icon-only button without `aria-label` | Add `aria-label="Close"` or visible text |
| Form input announces as "edit" with no label | Missing `<label htmlFor>` or `aria-labelledby` | Wrap with `<Label>` from shadcn |
| Modal opens but VoiceOver still reads background | Background not `aria-hidden` | Use Radix `<Dialog>` which handles this |
| "Saved" toast doesn't announce | Toast region isn't `aria-live` | Use Sonner from shadcn (live by default) |
| Heading levels jump (h1 → h4) | Skipped levels for visual size | Use heading level for hierarchy; size with CSS |
| Tab moves to invisible / off-screen elements | Off-screen but not `tabIndex={-1}` or `display:none` | If genuinely hidden, hide from a11y tree too |
| Focus disappears after route change | Default Next.js behavior | Add `useFocusOnRouteChange` hook |
| Reading order doesn't match visual order | CSS reordering | Reorder DOM source |

## Auditing tools

In approximate order of catch-rate:

1. **Manual keyboard walk.** Cheapest, catches a lot.
2. **axe-core (in dev + CI).** Catches ~30% of WCAG criteria mechanically.
3. **Lighthouse a11y audit.** Subset of axe; useful as a CI score.
4. **Screen-reader walk.** Catches what nothing else does (reading order, announcement quality, screen-reader-specific weirdness).
5. **Real-user testing with disabled users.** Gold standard, expensive, do for high-stakes products.

The team's locked stack covers 1–3 mechanically and bakes 4 into per-feature dev and qa-lead's audit gate.
