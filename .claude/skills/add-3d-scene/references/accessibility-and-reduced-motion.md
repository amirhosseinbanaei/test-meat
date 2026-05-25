# Accessibility and reduced-motion for 3D

3D scenes are accessibility-hostile by default. Canvas is opaque to screen readers, motion is heavy, interaction is mouse-centric. This doc covers the locked mitigations.

## The non-negotiables

For every 3D scene shipping to production:

- [ ] **Container has `role` and `aria-label`** describing what the scene shows.
- [ ] **Reduced-motion is respected**: no auto-rotate, no camera flights, no idle animations when `prefers-reduced-motion: reduce` is on. `frameloop="demand"` when reduced.
- [ ] **A non-3D alternative exists** OR is documented as deliberately not provided. (For product scenes: a static image. For data viz: a table or chart.)
- [ ] **Keyboard interaction works** if interaction is part of the experience. OrbitControls doesn't keyboard-rotate by default; add it.
- [ ] **No flashing / high-contrast strobing** in animations.

## The `role` and `aria-label`

Canvas is invisible to screen readers. The container element gets meaningful semantics:

```tsx
<div role="img" aria-label="3D model of the product, rotating">
  <Canvas>...</Canvas>
</div>
```

For interactive scenes:

```tsx
<div role="application" aria-label="Product configurator. Drag to rotate, scroll to zoom.">
  <Canvas>...</Canvas>
</div>
```

`role="application"` tells the screen reader to stop intercepting keystrokes — necessary for keyboard-driven 3D interaction. Use sparingly; `role="img"` is the default for non-interactive scenes.

## Reduced-motion handling

The locked SceneContainer template detects `prefers-reduced-motion` and passes it to Scene. Scene must honor:

```tsx
useFrame((_state, delta) => {
  if (reduceMotion) return;  // no per-frame work
  groupRef.current.rotation.y += delta * 0.2;
});

<OrbitControls
  autoRotate={false}                       // never auto-rotate under reduced motion
  enableRotate={!reduceMotion}             // (debatable — see below)
/>

<Canvas frameloop={reduceMotion ? 'demand' : 'always'}>
```

### Should rotate-on-drag be disabled under reduced motion?

Edge case. The user IS initiating the motion — it's their intent. But the resulting motion may still be uncomfortable for vestibular users.

The locked default:

- **Auto-rotate, camera moves, idle animations**: hard off under reduced motion.
- **User-initiated rotation (orbit drag)**: allowed, but consider whether the user can still understand the scene from a static view. If yes, allow rotation. If the scene REQUIRES rotation to be useful, the design has an a11y problem regardless.

When in doubt: provide the static image alternative AND disable rotation under reduced motion.

## Non-3D alternative

For decorative or product-showcase 3D, the locked rule: provide a static image alternative for users with reduced motion, or for performance reasons on mobile.

```tsx
'use client';
import { useState, useEffect } from 'react';

export function ProductHero({ modelUrl, fallbackImage }: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  // Optional: fall back to image on mobile + reduced motion combo.
  if (reduceMotion && isMobile) {
    return <img src={fallbackImage} alt="Product photo" />;
  }

  return <SceneContainer modelUrl={modelUrl} />;
}
```

For data visualizations: provide a table version. WCAG 1.1.1 (text alternatives) applies to charts as much as anything.

## Keyboard interaction

`OrbitControls` is mouse / touch only out of the box. For keyboard accessibility, add explicit handlers:

```tsx
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

function KeyboardOrbit() {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!controls.current) return;
      const step = 0.1;
      switch (e.key) {
        case 'ArrowLeft':
          controls.current.azimuthAngle -= step;
          break;
        case 'ArrowRight':
          controls.current.azimuthAngle += step;
          break;
        case 'ArrowUp':
          controls.current.polarAngle -= step;
          break;
        case 'ArrowDown':
          controls.current.polarAngle += step;
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return <OrbitControls ref={controls} />;
}
```

This is a starter. Production keyboard orbit handling needs:

- Container has `tabIndex={0}` so it's focusable.
- Visible focus indicator on the container.
- Instructions visible or announced ("Use arrow keys to rotate. Plus/minus to zoom.").
- The keyboard handler attaches/detaches based on container focus, not global window.

Build this only when keyboard interaction is genuinely required. For decorative 3D, screen-reader-friendly description is enough.

## What screen readers will say

Without help: nothing useful. The Canvas is a black box.

With the locked `role` + `aria-label`: the user hears the label. They get the gist of what the visual shows.

With a non-3D alternative: they can access the same information another way.

The minimum bar: the user knows what they're missing. A screen-reader user hearing "3D model viewer of the product" knows that's there, can ask "is there a non-3D version?" via product support, and isn't blocked from the rest of the page.

## Flashing content

WCAG 2.3.1 — nothing flashes more than 3 times per second. Common 3D pitfalls:

- Animated lighting that strobes.
- Particle systems with high turnover.
- Shader effects that pulse.

If any of these are part of the design, the locked test: record the scene, sample frame brightness, confirm no period under 333ms.

## Documenting exceptions

Some scenes can't fully meet these standards (e.g. an interactive simulation where keyboard orbit isn't viable). Document the exception:

```
docs/a11y-exceptions.md

## Product configurator — keyboard interaction

The product configurator scene uses drag-to-rotate as its primary interaction.
Implementing keyboard-equivalent rotation that's as usable would require a
substantial redesign. Mitigation:

  1. Static product image with all configurations is the alternative path
     (linked from the configurator page).
  2. Configurator state can be set via URL parameters, allowing a screen-reader
     user to set up the configuration via text input.
  3. The container announces "3D configurator — drag to rotate. Static product
     gallery available at /products/[slug]/gallery."

This exception is reviewed every quarter for whether keyboard-equivalent is now feasible.
```

This is what honest accessibility looks like — acknowledging where you can't fully meet AA, and providing real alternatives instead of pretending.

## QA checklist for 3D scenes

For every 3D scene:

- [ ] Container has `role="img"` or `role="application"` + descriptive `aria-label`.
- [ ] `prefers-reduced-motion: reduce` disables auto-rotate, camera moves, idle animation.
- [ ] `frameloop="demand"` under reduced motion.
- [ ] A non-3D alternative exists (static image, table, etc.) OR the exception is documented.
- [ ] No flashing content faster than 3 per second.
- [ ] Keyboard interaction (if interactive) is documented and works.
- [ ] Screen reader announces something meaningful when focused on the container.
- [ ] Loading state has accessible text ("Loading 3D scene…").

If any items fail, the scene isn't ready for production.
