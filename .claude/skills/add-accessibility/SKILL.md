---
name: add-accessibility
description: The FE team's locked accessibility playbook — WCAG 2.2 Level AA as the bar, enforced through coding conventions, eslint-plugin-jsx-a11y, axe-core integration in tests, and a pre-launch audit checklist. Use during every feature build (consult the per-pattern references) and as a one-time setup for the eslint plugin + axe wiring + Storybook a11y addon. Accessibility is non-negotiable on this team.
allowed-tools: Read, Write, Bash(npm install:*)
---

# Set up accessibility

Accessibility on this team isn't a checkbox at the end — it's a default that runs through every component, every interaction, every page. The locked bar is **WCAG 2.2 Level AA**. This skill installs the tooling that catches violations early and documents the per-pattern conventions.

## When to use

- Once per project, as setup (installs eslint plugin + axe + dev-mode reporter).
- Then **consult the references during every feature build** — per-pattern guidance for forms, modals, navigation, images, color, motion, keyboard, screen readers, RTL.

## When NOT to use

- There is no "not to use." Every project, every feature. Pretending the audience doesn't include people with disabilities makes both the product and the team worse.

## The bar: WCAG 2.2 Level AA

Why AA: it's the industry standard professional bar, legally required in many jurisdictions, and represents real-world accessibility without the extremism of AAA. We don't aim for AAA because AAA is rarely achievable for arbitrary content (e.g. AAA requires 7:1 contrast, sign-language interpretation for prerecorded audio, etc.).

WCAG 2.2 added nine new criteria to 2.1, focused on cognitive disabilities, motor disabilities, and mobile usability:

- 2.4.11 Focus Not Obscured (Minimum) — focused element can't be hidden by sticky headers/footers.
- 2.4.12 Focus Not Obscured (Enhanced) — AAA-only, we don't enforce.
- 2.4.13 Focus Appearance — AAA, not enforced.
- 2.5.7 Dragging Movements — anything draggable has a non-drag alternative.
- 2.5.8 Target Size (Minimum) — interactive targets at least 24×24 CSS pixels.
- 3.2.6 Consistent Help — help mechanisms appear in the same place.
- 3.3.7 Redundant Entry — don't ask users to re-enter info already provided.
- 3.3.8 Accessible Authentication (Minimum) — no cognitive function tests as auth.
- 3.3.9 Accessible Authentication (Enhanced) — AAA, not enforced.

The team's locked AA scope includes everything above except the AAA-only criteria.

## Workflow

1. Read `references/wcag-22-aa-summary.md` — the conformance criteria as a checklist, in plain English with examples.
2. Read `references/per-pattern.md` — accessibility patterns for every common UI element: forms, modals, menus, tabs, accordions, toasts, focus management, etc. (Most of this is handled by Radix-via-shadcn, but the doc explains what to check.)
3. Read `references/color-and-contrast.md` — locked contrast minimums and how the design system enforces them.
4. Read `references/motion-and-reduced-motion.md` — locked `prefers-reduced-motion` handling.
5. Read `references/keyboard-and-screen-reader.md` — keyboard testing protocol and the locked screen-reader testing matrix.
6. Read `references/rtl-and-i18n.md` — accessibility considerations specific to RTL and multi-language.
7. Read `references/audit-checklist.md` — the pre-launch audit gate qa-lead runs.
8. Install tooling:
   ```bash
   npm install --save-dev eslint-plugin-jsx-a11y @axe-core/react axe-playwright
   ```
9. Update `eslint.config.mjs` to register `eslint-plugin-jsx-a11y` with the `strict` ruleset (the skill provides the diff).
10. Drop `assets/AxeReporter.tsx.template` into `src/common/components/AxeReporter.tsx`. Mount it conditionally in `app/layout.tsx` (development only — uses `@axe-core/react` to report violations to the dev console).
11. Drop `assets/a11y-playwright.config.ts.template` into `tests/a11y/` — Playwright config that runs `axe` against every E2E route.
12. Add a CI step: `npm run lint` blocks on jsx-a11y errors. `npm test:e2e:a11y` runs the Playwright a11y suite.

## What this gives you

- **eslint-plugin-jsx-a11y/strict** running on every save. Catches missing alt text, missing labels, invalid ARIA, role/element mismatch, keyboard event handlers without click handlers, and ~30 other patterns at the source.
- **@axe-core/react** in development. Logs accessibility violations to the dev console as the page renders. The first time a developer sees a real screen-reader-relevant warning while building, they remember it forever.
- **axe-playwright** in E2E tests. Every test page goes through axe and fails the test on serious violations. Wired into qa-lead's release checklist.
- **Radix primitives** (already locked via shadcn) — keyboard navigation, focus management, ARIA roles, and live regions are handled correctly by default. The shadcn components inherit them.

## Files in this skill

- `assets/AxeReporter.tsx.template` — Client Component that mounts axe in dev only.
- `assets/a11y-playwright.config.ts.template` — Playwright config for the a11y test suite.
- `assets/eslint.config.a11y.patch` — text-based patch instructions for the eslint config.
- `references/wcag-22-aa-summary.md` — the 50 AA criteria in plain English.
- `references/per-pattern.md` — patterns for forms, modals, menus, etc.
- `references/color-and-contrast.md` — locked contrast values + tooling.
- `references/motion-and-reduced-motion.md` — `prefers-reduced-motion` handling.
- `references/keyboard-and-screen-reader.md` — testing protocol.
- `references/rtl-and-i18n.md` — RTL and language a11y.
- `references/audit-checklist.md` — the pre-launch gate.
