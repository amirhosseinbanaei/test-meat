---
name: add-3d-scene
description: 3D scenes in React via @react-three/fiber + @react-three/drei. NOT raw Three.js — React-idiomatic wrappers with declarative scene graphs and the common-utility components. Always lazy-loaded (huge bundle), always behind a Suspense skeleton, always respects prefers-reduced-motion (no auto-rotate, no camera moves), always has a documented performance budget. Use only when 3D is a meaningful part of the design — never for decoration.
allowed-tools: Read, Write, Bash(npm install:*)
---

# Add a 3D scene (react-three-fiber)

3D content via [@react-three/fiber](https://r3f.docs.pmnd.rs/) and [@react-three/drei](https://github.com/pmndrs/drei). React-idiomatic wrappers around Three.js — declarative scene graphs, hook integration, the common-utility components (orbit controls, environment maps, GLTF loading, post-processing).

**Always wrapped in lazy load and Suspense.** 3D bundles are huge (Three.js core is ~600KB minified; drei adds more; GLTF models add MB). The locked pattern keeps this out of every other route.

## Honest framing

3D is expensive on every axis:

- **Bundle size**: 600KB+ before models.
- **Runtime cost**: GPU work, draw calls, shader compilation.
- **Battery**: animated 3D drains mobile batteries fast.
- **Accessibility**: 3D scenes are by default inaccessible to screen readers. Animation creates vestibular-discomfort risk.

The cost is justified when 3D is **central to the experience** — a product configurator, an architectural visualization, a data-driven 3D chart, an interactive demo. Cost is NOT justified when 3D is decoration.

## When to use

- Product configurators (rotate-to-view, color-pick, customize).
- Architectural / interior visualization.
- 3D data visualization (force-directed graphs, geographical globes, terrain).
- Hero scenes in marketing pages where 3D IS the message.

## When NOT to use

- Background ambience. Use video or static imagery.
- Decorative "wow factor" without functional purpose.
- Anywhere mobile users are >30% of traffic and the scene is heavy.
- Anywhere SEO discovery matters for the 3D content itself (search engines don't index 3D models).

## Workflow

1. Read `references/r3f-patterns.md` — the locked component structure, lazy loading, Suspense pattern.
2. Read `references/performance-budget.md` — locked targets and how to measure.
3. Read `references/accessibility-and-reduced-motion.md` — required a11y handling.
4. Install: `npm install three @react-three/fiber @react-three/drei`
5. Install types: `npm install --save-dev @types/three`
6. Drop the scene scaffolding:
   - `assets/Scene.tsx.template` → `src/modules/<feature>/components/<SceneName>.tsx` — the Three.js scene component (renders inside `<Canvas>`).
   - `assets/SceneContainer.tsx.template` → `src/modules/<feature>/components/<SceneName>Container.tsx` — the lazy-load + Suspense wrapper.
   - `assets/SceneFallback.tsx.template` → `src/modules/<feature>/components/<SceneName>Fallback.tsx` — what renders while the 3D loads.
7. Place GLTF / GLB models in `public/models/` (or a CDN with proper CORS).
8. Run `lint-and-typecheck` and verify the bundle: `npm run build` then check the route's chunk size.

## Usage at a glance

```tsx
// In a page or component:
import { ProductSceneContainer } from '@/modules/products/components/ProductSceneContainer';

export default function ProductPage() {
  return (
    <main>
      <h1>Configure your product</h1>
      <ProductSceneContainer modelUrl="/models/product.glb" />
    </main>
  );
}
```

The container handles dynamic import of the Scene component, the Canvas wrapper, the Suspense fallback, and the reduced-motion check.

## The locked safeguards

- **Lazy load** via `next/dynamic` with `ssr: false`. The Scene only loads when the route loads.
- **Suspense fallback** during model loading.
- **Reduced motion**: when on, the scene renders the model but disables auto-rotate, camera moves, and idle animations. Static view only.
- **`Canvas` is contained**: never full-page-fixed. Always has explicit width/height so layout shifts don't occur.
- **Frameloop demand** by default: render only when something changes (`frameloop="demand"`). Static scenes don't run the GPU.
- **DPR clamp**: pixel ratio capped at 2 to prevent retina/4K devices from burning GPU.

## Performance budget (locked)

- **Initial bundle on route**: < 800KB gzipped including model.
- **Frame time on mid-tier mobile (Pixel 5)**: < 16ms steady state, < 33ms during interaction.
- **First-render to interactive**: < 3s on mid-tier mobile, 3G.
- **GPU memory**: < 100MB per scene.

Exceed any of these and the design needs to budget. Push back on the design rather than ship a slow scene.

## Files in this skill

- `assets/Scene.tsx.template` — the scene component (children of `<Canvas>`).
- `assets/SceneContainer.tsx.template` — lazy wrapper with `<Canvas>` and Suspense.
- `assets/SceneFallback.tsx.template` — load-time skeleton.
- `references/r3f-patterns.md` — locked patterns, hooks, common components from drei.
- `references/performance-budget.md` — measurement and tuning.
- `references/accessibility-and-reduced-motion.md` — a11y handling.
