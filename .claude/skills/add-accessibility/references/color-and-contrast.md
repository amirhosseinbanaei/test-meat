# Color and contrast

WCAG 2.2 AA contrast minimums and how we hit them.

## The numbers

| What | Minimum |
|---|---|
| Body text against background | **4.5:1** |
| Large text (18pt+ / 14pt+ bold / 24px+ / 18.66px+ bold) against background | **3:1** |
| UI components (button borders, form input borders, focus rings) against adjacent colors | **3:1** |
| Graphics that convey info (chart elements, status icons) against adjacent colors | **3:1** |
| Text inside a colored UI component (button label on button background) | **4.5:1** |
| Disabled UI controls | **No requirement** — disabled state is exempt |
| Logos, decorative imagery | **No requirement** |

## The design-token rule

ui-visual-lead defines the project's color tokens. The locked rule: **every text+background pair documented in the design system must clear AA at the relevant size**. ui-visual-lead documents the pairs; frontend-lead doesn't invent new pairs at component time.

Pairs are checked at token-design time, not at every component. If a new pair is needed, it goes back to ui-visual-lead for token-system review, not into a one-off Tailwind class.

## Common pitfalls

### Placeholder text
Placeholder text in form inputs is often light gray for visual hierarchy. **It must still clear AA against the input background** if it's the only visible label or instruction. If you only use placeholders for examples (with a real `<Label>` above), looser contrast is acceptable but be conservative.

### Disabled buttons
Exempt from the contrast requirement, but still: make disabled obvious. Don't use the same color as enabled.

### Color-coded info
Charts, status indicators, validation states — these must NOT rely on color alone (WCAG 1.4.1). Pair color with:
- An icon (✓ green / ✗ red / ⚠ yellow)
- Text ("Approved" / "Rejected" / "Pending")
- A different shape or pattern in charts

Even with the redundancy, the color itself still needs **3:1** against adjacent colors.

### Focus rings
The focus indicator is a non-text element. WCAG 1.4.11 requires **3:1** against the focused element's background AND against the page background. The default Tailwind `ring-2 ring-primary` usually clears this if `primary` is well-chosen — but check at the design-system level.

### Text over images
If text overlays an image (hero, banner), the contrast must be checked **against the actual pixels under the text**, not the average image color. Solutions:
- Dark overlay between image and text (`bg-black/40` etc.).
- Text container with a solid background.
- Text shadow that adds contrast (visually subtle, still helps).

For real reliability: don't put body-length text over photographs.

## Tooling

### At design time
ui-visual-lead uses **Figma's contrast plugin** (Stark or Contrast) on every color pair. The output is part of the token documentation.

### At code time
Two layers catch issues:

1. **`@axe-core/react`** (loaded by `AxeReporter` in dev) — measures real rendered contrast and reports failures in the dev console.
2. **axe-playwright** in CI — runs on every E2E test page.

Both catch what's actually on screen, including dynamic colors (theme switches, computed states).

### Manual
For one-off checks: [WebAIM's contrast checker](https://webaim.org/resources/contrastchecker/). Faster than diving into DevTools.

## Dark mode

Two color modes mean **two complete sets of contrast checks**. Every pair, both modes.

Common dark-mode pitfall: dimming `gray-500` text below the `gray-200`-on-`gray-50` light-mode contrast. Dark mode usually means slightly LIGHTER mid-tones, not the same hex inverted.

## Brand color exceptions

If brand demands a color that doesn't clear AA (e.g. a yellow CTA on white), there are two acceptable resolutions:

1. **Adjust the brand color** for product use. Brand palettes for marketing can include shades; product uses the AA-clearing shade.
2. **Add a non-text indicator.** If the yellow is decorative (e.g. accent bar), it's not subject to text contrast. If yellow text is required, the surrounding container can be darkened so the text becomes "text on dark."

What's not acceptable: shipping low-contrast text and hoping nobody notices.

## RTL contrast

Same numbers. The colors don't change. The reading direction does. Verify dark-mode contrast in RTL the same as LTR — sometimes a sticky element that's `right-0` becomes `left-0` and ends up in a different stacking context.

## Programmatic enforcement

The locked CI runs `axe-playwright` over every route in the `tests/a11y/` suite. A contrast violation on a key route fails the build.

For pages with dynamic content (data tables with user content, charts), test with representative data:

```ts
test('users table — contrast', async ({ page }) => {
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
```

## When you genuinely can't fix it

Sometimes the constraint is real (legacy partner integration, regulated content). The honest path:

1. Document the exception with reasoning in `docs/a11y-exceptions.md`.
2. Provide a high-contrast alternative (theme toggle, accessibility menu).
3. Don't pretend.

This is rare. The locked posture is: fix the design.
