# Pre-launch accessibility audit checklist

The gate that qa-lead runs before every production release. Going through this finds problems that per-feature dev-loop tooling missed. Budget half a day for a thorough audit on a non-trivial release; less for incremental releases.

This is a manual + automated hybrid. Tools catch ~30% of WCAG criteria; the rest require human judgment.

## Pre-flight

- [ ] Latest build is deployed to a staging environment.
- [ ] The build includes the production bundle (axe-core not running in prod).
- [ ] Real or representative data loaded.
- [ ] Both LTR and RTL locales accessible (if multi-language).
- [ ] Both light and dark themes accessible (if dual-mode).

## 1. Automated scans

Run before any manual work — these find low-hanging fruit fast.

- [ ] **axe-playwright suite passes**: `npm run test:a11y`. Zero serious or critical violations on any tested route.
- [ ] **Lighthouse Accessibility score ≥ 95** on the top 5 routes (home, product, signup, checkout/conversion, dashboard). Run via `npx lighthouse https://staging.example.com/path --only-categories=accessibility`.
- [ ] **eslint reports zero `jsx-a11y` violations** on the latest build.

Document the routes covered. If a route isn't in the test suite, add it before next release.

## 2. Manual keyboard walkthrough

For each of the critical user journeys (defined per-project by product-manager + ux-design-lead):

- [ ] **Skip link works.** Tab once from page load → skip-to-main link visible → Enter → focus lands on main content.
- [ ] **Tab order is logical.** Visual order and DOM order match. No surprises.
- [ ] **Every interactive element is reachable.** Buttons, links, form fields, custom widgets — all reachable with Tab.
- [ ] **Focus is always visible.** Never lost, never invisible.
- [ ] **Focus is never obscured** (WCAG 2.2 2.4.11). Sticky headers/footers don't cover focused elements.
- [ ] **Modals trap focus.** Tab cycles inside while modal is open. Escape closes. Focus returns to trigger on close.
- [ ] **Dropdowns / menus** open on Enter/Space, navigate with arrows, close with Escape.
- [ ] **Forms submit on Enter** in single-field forms; explicit submit on multi-field.
- [ ] **No keyboard traps.** Every component can be exited.
- [ ] **Custom keyboard shortcuts** (if any) are documented and have a way to disable.

## 3. Screen reader walkthrough

Walk the same critical user journeys with VoiceOver (Cmd+F5 on macOS Safari) AND NVDA (Windows Firefox/Chrome). The differences between screen readers catch different bugs.

For each route:

- [ ] **Page title announces** on load.
- [ ] **Heading outline is logical** (use rotor: VO Cmd+U → Headings; NVDA Insert+F7 → Headings). h1 → h2 → h3, no skipped levels.
- [ ] **Landmarks announce** (header, nav, main, footer). Use rotor to confirm.
- [ ] **All images have meaningful alt** OR are correctly marked decorative.
- [ ] **Form inputs announce their labels**, required status, helper text, current value.
- [ ] **Error messages announce** when validation fails.
- [ ] **Buttons announce purpose** (not "button" with no context).
- [ ] **Custom widgets announce role and state** (e.g. "Expanded, button, Menu" not just "button").
- [ ] **Toasts and notifications announce** without the user navigating to find them.
- [ ] **Loading states announce** ("Loading", or progress milestones).
- [ ] **Route changes announce** — new page title or main content focus.

For high-stakes flows (auth, payment, account changes), screen-reader-walk the entire flow end-to-end with notes.

## 4. Color and contrast

- [ ] **axe-core contrast violations are zero** (covered in section 1).
- [ ] **Manual spot-check of brand-color CTAs** with WebAIM Contrast Checker. Anything close to 4.5:1 gets verified.
- [ ] **Dark mode contrast verified** by toggling theme and re-running scans.
- [ ] **Disabled states are obvious** but exempt from contrast requirement.
- [ ] **Focus indicators** clear 3:1 against adjacent colors (WCAG 1.4.11).
- [ ] **Non-text content** (icons-as-info, chart elements) clears 3:1.

## 5. RTL audit (if multi-language)

Toggle to Persian (or other RTL locale) and:

- [ ] **Document direction is `rtl`** at `<html dir>` level.
- [ ] **Layout flips correctly** — sidebars, cards, columns all on the right side where they were on the left in LTR.
- [ ] **No hardcoded left/right.** Walk the page and visually scan for elements stuck on the wrong side.
- [ ] **Icons with direction flip** (arrows, chevrons in carousels, back/forward).
- [ ] **Icons without direction don't flip** (search, settings, profile).
- [ ] **Keyboard arrow navigation respects direction** in carousels, menus, tabs.
- [ ] **Embedded LTR content** (email addresses, URLs, IDs) renders correctly with bidirectional isolation.
- [ ] **Translated copy fits** — buttons, nav, modal titles don't overflow or wrap awkwardly.
- [ ] **Dates and numbers** show in the appropriate format (Persian calendar / Persian digits if locked, or Gregorian if explicitly so).
- [ ] **Screen reader in Persian voice** announces correctly.

## 6. Motion and reduced motion

- [ ] **DevTools → Rendering → "prefers-reduced-motion: reduce"** enabled. Reload.
- [ ] **No parallax** active.
- [ ] **No auto-advancing carousels** auto-advance (they stay still until clicked).
- [ ] **Page transitions** are instant or simple fades, not movements.
- [ ] **Scroll-triggered animations** are disabled or replaced with appear-on-mount.
- [ ] **Lenis smooth scroll** (if used) is bypassed — native scroll active.
- [ ] **3D scenes** (if any) pause / freeze / disable auto-rotate.
- [ ] **GSAP timelines** respect the media query.
- [ ] **Critical motion** (loading spinners) still works — feedback loops aren't broken.
- [ ] **No content disappears** when motion is reduced (animations that fade in should still end visible).

## 7. Zoom and reflow

- [ ] **Zoom to 200%** in the browser. Page still works — no horizontal scroll on body, all content reachable, all interactive elements clickable.
- [ ] **Reflow at 320px wide** (mobile portrait). No horizontal scroll (except for genuinely wide content like data tables that opt-in).
- [ ] **Text scaling to 200%** via OS / browser setting. Layout doesn't break.

## 8. Touch targets (mobile / tablet)

- [ ] **Interactive targets ≥ 24×24 CSS pixels** (WCAG 2.2 2.5.8). Especially watch icon-only buttons, close buttons, link lists with tight spacing.
- [ ] **No drag-only interactions** without a click/tap alternative (WCAG 2.2 2.5.7). Drag-and-drop has a keyboard or click alternative.

## 9. Forms

- [ ] **Every input has a visible label** OR a screen-reader-only label with strong visible context.
- [ ] **Required fields** are marked both visually and via `aria-required` / `required`.
- [ ] **Validation errors** appear inline, associated via `aria-describedby`, announced by screen reader.
- [ ] **Error suggestion** present — not just "invalid", but how to fix.
- [ ] **Autocomplete attributes** on common inputs (email, name, tel, address).
- [ ] **Password fields allow paste** (WCAG 2.2 3.3.8).
- [ ] **Show-password toggle** present on password inputs (good practice).
- [ ] **No redundant entry** (WCAG 2.2 3.3.7) — info entered earlier in the flow is carried forward, not re-asked.
- [ ] **Submitting a form with errors** announces the error count and focuses the first invalid field.

## 10. Authentication

- [ ] **No cognitive-function tests** required for auth (WCAG 2.2 3.3.8). No transcription, math, puzzles as the only auth method.
- [ ] **2FA code inputs allow paste.**
- [ ] **"Forgot password" recovery flow** works with keyboard and screen reader.
- [ ] **Session timeout warnings** (if present) are accessible and reachable before timeout.

## 11. Content-specific

For sites with media:

- [ ] **Videos have captions** (WCAG 1.2.2).
- [ ] **Audio-only content has transcripts.**
- [ ] **Auto-playing media has controls** (pause minimum).
- [ ] **No content flashes more than 3× per second** (WCAG 2.3.1).

For sites with data:

- [ ] **Tables use `<th>`** with appropriate `scope`.
- [ ] **Sortable columns** indicate sort state via `aria-sort`.
- [ ] **Pagination** is keyboard-navigable, announces current page.

## 12. Documents

- [ ] **PDFs are tagged** (if you host any). Untagged PDFs are inaccessible.
- [ ] **Downloadable content** (forms, reports) has accessible alternatives where reasonable.

## 13. Cross-browser / cross-AT spot-check

Pick one route from the critical journey and verify on:

- [ ] **macOS Safari + VoiceOver**
- [ ] **Windows Chrome + NVDA**
- [ ] **iOS Safari + VoiceOver** (mobile)
- [ ] **Android Chrome + TalkBack** (mobile)

If a project's analytics show JAWS users, add JAWS to the matrix.

## 14. Sign-off

Output of the audit:

1. **Pass / Fail summary** per section.
2. **Blocker list** — anything that fails WCAG AA must be fixed before launch.
3. **Recommendations** — things that aren't blockers but should be improved next iteration.
4. **Routes that need test coverage** — anything that wasn't in the axe-playwright suite.

qa-lead delivers this to vp-engineering and head-of-design jointly. Either signs off on launch or returns to the team with blockers.

## Cadence

- **Per release**: sections 1, 2, 6, 7, 8, 9. The mechanical pass.
- **Per major release** (feature additions, design refresh): full checklist.
- **Quarterly**: full checklist on the live production site, even if no recent release.

Accessibility regresses over time as components evolve. The recurring audit catches drift before users do.

## Reporting bugs found

Each violation gets a ticket with:

- The route and reproduction steps.
- The WCAG criterion violated (e.g. "2.4.7 Focus Visible").
- The severity per axe (critical / serious / moderate / minor) OR a judgment if found manually.
- A suggested fix where obvious.

Severity informs whether it blocks launch:

- **Critical / Serious** → blocker.
- **Moderate** → fix this sprint.
- **Minor** → backlog with a deadline.

Don't ship known critical violations. Don't normalize the "we'll fix it later" path on accessibility — that path is how AA-required products become AA-failing products.
