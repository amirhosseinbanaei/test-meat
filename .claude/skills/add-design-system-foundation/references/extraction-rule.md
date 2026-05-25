# The extraction rule — when JSX becomes a component

A locked heuristic. Repeated inline JSX is the largest source of drift in component
libraries — three slightly-different "cards" become twelve slightly-different cards
become a maintenance disaster. This rule prevents that.

## The rule

**When a piece of JSX appears 3+ times with the same shape and intent, extract it
as a component.**

Two qualifiers matter:

- **Same shape**: the structural skeleton is the same (a header, then an image,
  then a body, then a footer — or whatever the pattern is). Not "the JSX looks
  alphabetically similar" — actual structural equivalence.
- **Same intent**: the three usages mean the same thing semantically. Three "job
  cards" on a job list → same intent. A "user avatar" appearing in a header and
  a "user avatar" in a comment list → arguably same intent; arguably different
  (one is small with a name, one is bigger and clickable). Use judgment.

## What's NOT extraction-worthy

- **Three `<Button>`s that happen to be buttons.** `<Button>` already IS the
  extracted component. Three uses of `<Button>` on a page is not a problem.
- **Three layouts that share a flexbox container with the same gap.** Tailwind's
  `flex gap-4` is the extraction. Wrapping it in `<HorizontalStack>` is overkill
  unless there's other structural commonality.
- **Two identical pieces of JSX.** Two is below the threshold. Don't pre-extract.
  Wait for the third use — that's when the pattern is real.
- **Three similar-looking pieces that mean different things.** A "card" on the
  product page that's a product, a "card" on the dashboard that's a metric tile,
  and a "card" on the blog that's a post preview — these share the visual word
  "card" but have nothing structurally in common. Don't force them into one
  component.

## What IS extraction-worthy

- **3+ product cards** on a product list → `ProductCard` component.
- **3+ KPI tiles** on a dashboard → `KpiTile` component.
- **3+ "section header with title + optional CTA"** patterns → `SectionHeader`.
- **3+ "form field row with label + input + helper text"** patterns → already
  solved by `FormItem` from `Form.tsx`. Use it.
- **3+ "empty state with icon + heading + body + CTA"** patterns → `EmptyState`.
- **3+ "avatar pill with name and role"** patterns → `UserPill`.
- **3+ pages with the same top-bar shape** → `PageHeader`.

## Where the extracted component goes

Decided by reach, not by file type:

| Used in... | Goes in |
|---|---|
| One feature only | `src/modules/<feature>/components/<Name>.tsx` |
| 3+ unrelated features | `src/common/components/<Name>.tsx` (root of common/components/, NOT ds/) |
| Reusable interactive primitive (input/select/button-like) | `src/common/components/ds/<Name>.tsx` (follow `create-ds-component`) |

**Important**: most extracted components are NOT design-system components. A
`ProductCard` is feature-level, not DS-level. The DS layer is for **brand-level
building blocks** (inputs, selects, buttons, dialogs). The DS doesn't grow with
the product surface — it stabilizes early. Feature components grow.

## When to promote a feature component to common

The locked rule (also enforced for non-component code):

- Used inside **one** feature → stays in that feature's `components/`.
- Used by **two** features → stays in the originating feature, imported across the
  boundary if absolutely necessary, but flagged for promotion at the next change.
- Used by **3+ unrelated features** → promote to `src/common/components/`.

"Unrelated" matters — two features in the same domain area (`modules/jobs` and
`modules/job-applications`) sharing a `JobCard` is fine without promotion. Three
features in unrelated areas (`modules/jobs`, `modules/billing`, `modules/blog`)
sharing something means it's genuinely cross-cutting.

## Worked examples

### Example 1: Job list with card layouts

You're building a job-list page. The design has:

- A "featured jobs" carousel at the top with 6 cards.
- A "recent jobs" grid with 24 cards.
- A "saved jobs" sidebar with 8 cards.

All three use the same card shape: company logo, job title, company name,
location, salary range, "apply" button.

**Action**: extract `JobCard` to `src/modules/jobs/components/JobCard.tsx`. Pass
the job data as a prop. Use it in all three places.

If a year later, `modules/job-applications` and `modules/saved-searches` also need
the same card, **promote** to `src/common/components/JobCard.tsx`.

### Example 2: KPI tiles on a dashboard

The dashboard has 6 KPI tiles, each with: icon, label, big number, trend
indicator.

**Action**: extract `KpiTile` to `src/modules/dashboard/components/KpiTile.tsx`.

If KPIs appear on three different feature dashboards, promote to common.

### Example 3: Three buttons that look alike

Three different pages have a "Save" button in the top-right corner. Each is just
`<Button variant="primary">Save</Button>`.

**Action**: nothing. `<Button>` is already the extraction. The pattern is "use
the existing component," not "extract a new wrapper."

### Example 4: Three different cards that aren't actually the same

- `ProductCard` (product page) — image, title, price, "add to cart" button.
- `BlogPostCard` (blog) — image, title, excerpt, date, "read more" link.
- `KpiTile` (dashboard) — icon, label, number, trend.

These all visually look like "cards" but mean entirely different things.
**Don't extract a generic `Card`** that tries to unify them. They go in three
separate feature folders.

(The exception: if your shadcn library has a `<Card>` primitive providing the
shared shadow/border container, you might use it as the inner shell of all
three. That's a primitive use, not an extraction.)

## How the FE Lead enforces this

At code-review / handoff time, the FE Lead scans for:

- Repeated JSX patterns (same skeleton, 3+ places).
- Inline JSX in pages or feature components that's structurally a card / list
  item / form row / empty state / header.
- Component files in `modules/X/components/` that are imported by 3+ unrelated
  modules without being promoted.

Each finding produces an extraction or promotion task. Inline JSX repetition is a
duty violation, not a style preference.

## The cost of not extracting

What happens if you skip extraction:

- **Drift**: three card layouts become twelve, each slightly different because the
  CSS got tweaked over time in one place but not the others.
- **A11y regressions**: someone fixed a focus-visible bug on one card; the other
  eleven still have it.
- **Translation pain**: copy goes in twelve places. RTL spacing fixes go in
  twelve places.
- **Slow feature work**: every new variation of "card" requires understanding
  twelve existing card sites instead of one.

The first two extracted card components feel like overhead. The 12th one feels
like a survival mechanism. The rule prefers a little early overhead.

## The cost of premature extraction

Equally real:

- **Wrong abstraction**: extracting at 2 uses often locks in the wrong props,
  because the two uses happen to be similar in ways that don't generalize.
- **Boilerplate**: a `<ProductCard>` with 14 props because every detail was
  parameterized "just in case" — most of which are unused.
- **Coupling**: changes in one feature ripple to others via the shared component.

The 3+ rule is the floor, not a target. If you see 3 uses, extract. If you see 2,
wait — but make a mental note. When the 3rd shows up, extract immediately.
