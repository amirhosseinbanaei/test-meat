# When to use Lenis — and when not to

The decision rule. Lenis is opt-in for a reason.

## Use Lenis when...

### 1. The design is scroll-as-storytelling

A long-scroll landing page where content reveals progressively, sections fade or move with scroll, headings synchronize with imagery. The smoothness of scroll IS the experience — choppy native scroll would break it.

Example: agency portfolio sites, product launch reveal pages, narrative-driven case studies.

### 2. The project uses GSAP ScrollTrigger heavily

ScrollTrigger pinning, parallax, and timeline scrubbing feel substantially better with Lenis driving the scroll. Native momentum scroll on macOS/iOS introduces sub-pixel jitter that ScrollTrigger pins amplify. Lenis smooths it.

If `add-gsap-animation` is in the project and uses ScrollTrigger meaningfully, `add-smooth-scroll` usually follows.

### 3. The design system defines a specific motion language

Some brand identities specify a precise easing for all motion — including scroll. Lenis lets you match scroll feel to the rest of the motion design. Consistent across devices.

### 4. The site is content-light, motion-heavy

Marketing pages, product showcases, interactive demos. Few words, lots of motion. Lenis fits.

## Don't use Lenis when...

### 1. The site is read-heavy

Documentation, blogs, news, knowledge bases, dashboards with long lists. Users scroll to read. Lenis adds a tiny delay between intent and effect that compounds over many scroll actions. Native is faster.

### 2. The site is productivity software

Spreadsheets, editors, IDEs, project management. Users want immediate response to scroll. Smooth scroll feels lethargic.

### 3. The site is mobile-first

iOS and Android have OS-tuned scroll behavior. Users expect their device's scroll feel. Lenis can feel like fighting the device.

If mobile-first AND scroll-storytelling is genuinely required, Lenis can still work — but tune `touchMultiplier` carefully and test extensively on real devices.

### 4. The site serves a wide audience with diverse devices

The more devices in your audience, the more variance in default scroll behavior. Native handles the variance gracefully. Lenis creates one experience that may not be optimal anywhere.

### 5. You just want "smoother scroll" as polish

This is the most common misuse. Polish that costs accessibility, performance, and predictability isn't polish. Native scroll on modern browsers is excellent. If the only reason to add Lenis is "it feels nicer," skip it.

## The decision flow

```
Is smooth scroll part of the design specification?
├── No → Don't use Lenis. Skip.
└── Yes
    │
    Does design require synchronized scroll-driven animation
    (parallax, pinning, scrubbing)?
    ├── Yes → Use Lenis (with `add-gsap-animation`).
    └── No
        │
        Is the site primarily a read-and-scroll experience?
        ├── Yes → Don't use Lenis. Push back on the design.
        └── No
            │
            Is the audience mobile-heavy?
            ├── Yes → Strongly question Lenis. Test on real devices first.
            └── No → Lenis is reasonable. Continue with the safeguards.
```

## The accessibility constraint

Whatever the design says: **`prefers-reduced-motion` is non-negotiable**. The locked `SmoothScroll` component bypasses Lenis entirely when reduced-motion is on. This is not configurable. Removing this safeguard violates WCAG AA and our locked accessibility bar.

This means: a portion of your users always experience the site without Lenis. The design must hold up under native scroll, too. If the storytelling completely breaks without Lenis, the design has an accessibility problem, not Lenis.

## How to push back on a design ask

When a design hands the frontend "make scroll smooth" without clear motion-driven context, the right response:

1. **Ask what motion the smooth scroll is enabling.** If the answer is "it just feels nicer", explain the cost.
2. **Show the design at native scroll.** Often the team has been looking at a polished comp and assumes native scroll feels worse than it does. It usually doesn't.
3. **Offer the middle path.** CSS `scroll-behavior: smooth` for anchor links gives 80% of the perceived smoothness benefit for 0% of the cost. Native scroll otherwise.

CSS `scroll-behavior: smooth` is a one-line option that handles anchor link smoothness without intercepting wheel/touch. For most sites, that's enough.

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

Try this first. Reach for Lenis only when this isn't enough.

## Real-world fit check

If you finish reading this and you're still unsure, the answer is "don't use Lenis." Lenis pays off when its use case is obvious — long-form scroll storytelling with synchronized motion. Anything else and the cost-benefit is questionable.

When in doubt, the frontend team's default is **no Lenis**.
