# react-three-fiber patterns

The locked patterns for 3D scenes. r3f is a thin React wrapper around Three.js, so this doc is part React + part Three.js conventions.

## The Canvas + Scene split

The locked split:

- **`SceneContainer.tsx`** — owns `<Canvas>`, container sizing, reduced-motion detection, lazy loading.
- **`Scene.tsx`** — the children of `<Canvas>`: lights, models, controls, effects.

Why split: `<Canvas>` and `<Scene>` operate in different contexts. Components inside `<Canvas>` use Three.js elements (`<mesh>`, `<group>`) and r3f hooks (`useFrame`, `useThree`). Components outside use regular DOM. Mixing them in one file is constant context-switching.

## Hooks inside Canvas

Only these hooks work inside `<Canvas>`:

- **`useFrame`** — runs on each render frame. `(state, delta) => void`. Use for per-frame updates (rotation, position, shader uniforms).
- **`useThree`** — access to the renderer, scene, camera, viewport, gl context.
- **`useLoader`** — load assets (GLTF, textures, audio).

React's built-in hooks (`useState`, `useRef`, `useEffect`) work too — r3f is React all the way down.

DOM hooks (anything that touches `document` or `window`) work but you may be doing something off-pattern. The Canvas runs DOM-free; reach for DOM only in the container.

## Loading models

GLTF / GLB models via `useGLTF` from drei:

```tsx
const { scene, nodes, materials } = useGLTF('/models/product.glb');
```

The hook suspends while loading. Wrap in `<Suspense>` (the SceneContainer template does this).

**Preload** at known transition points:

```tsx
// In a route component, before navigating to the page that uses the scene:
useGLTF.preload('/models/product.glb');
```

Preloading happens on idle. By the time the user hits the page, the model is in cache.

## Model formats

- **GLB** (binary GLTF) — preferred. Single file, all assets embedded.
- **GLTF + bin + textures** — fine, but requires correct CORS on each file.
- **OBJ, FBX** — supported via different loaders. Don't use unless you must — GLTF is the standard.
- **USDZ** — Apple's AR format. Not natively supported in r3f.

For project models:

- Export from Blender / your DCC as GLB.
- Use [gltfpack](https://github.com/zeux/meshoptimizer) to compress: `gltfpack -i input.glb -o output.glb -cc` (Draco compression, ~10× size reduction).
- Verify model size: aim for < 5MB per scene. Hero scenes < 2MB.

## Lighting

Locked lighting setup for product scenes:

```tsx
<ambientLight intensity={0.4} />
<directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
<Environment preset="studio" />  // from drei
```

`Environment` provides image-based lighting from a built-in HDRI. Variants: `studio`, `sunset`, `dawn`, `night`, `warehouse`, `forest`, `apartment`, `lobby`, `park`, `city`. The preset is appended to the bundle — pick deliberately.

For full control, supply your own HDRI:

```tsx
<Environment files="/hdr/custom.hdr" />
```

HDRIs are ~1–5MB each. Lazy load via the same dynamic-import pattern as the Scene itself.

## Controls

`OrbitControls` from drei is the locked default for "let the user look around":

```tsx
<OrbitControls
  enablePan={false}              // Usually want to disable on product scenes
  enableZoom={true}
  enableRotate={true}
  autoRotate={false}             // Honor reduced-motion via prop
  minDistance={2}
  maxDistance={10}
  minPolarAngle={Math.PI / 4}    // Limit up/down so user can't flip upside down
  maxPolarAngle={Math.PI / 1.5}
/>
```

Always set min/max distance and polar angle. Without limits, users can break the scene visually.

For non-orbit interactions:

- **PresentationControls** — slight tilt on drag, snaps back. Less freedom than orbit, more on-brand.
- **TransformControls** — drag-to-move handles (for configurator-style apps).

## Performance hooks

### `useFrame` discipline

```tsx
// BAD: triggers re-render every frame
useFrame((state) => {
  setSomething(state.clock.elapsedTime);
});

// GOOD: mutate refs / objects directly
useFrame((_state, delta) => {
  if (groupRef.current) {
    groupRef.current.rotation.y += delta * 0.5;
  }
});
```

Setting React state in `useFrame` is the #1 performance killer in r3f apps. State updates trigger re-renders. Re-renders reconcile the scene graph. The scene graph is heavy. 60 re-renders per second tanks performance.

Mutate the underlying Three.js objects directly via refs.

### `frameloop="demand"`

The locked default for static scenes (rendered once, then idle until interaction):

```tsx
<Canvas frameloop="demand">
  {/* ... */}
</Canvas>
```

The scene renders once on mount, then only re-renders when:

- A control fires (orbit, click, hover).
- `invalidate()` is called (from r3f via `useThree`).

For animated scenes (auto-rotate, particle effects), use `frameloop="always"` (default).

Under reduced motion, the SceneContainer template flips to `demand` automatically — no GPU work happens until the user interacts.

### `dpr`

Device pixel ratio. Set explicitly:

```tsx
<Canvas dpr={[1, 2]}>  {/* min 1, max 2 — clamp 4K devices */}
```

Without the clamp, retina/4K devices render at native DPR (3–4 on iPhone Pro). 4× the pixels means 4× the GPU work. The clamp at 2 is virtually indistinguishable visually but massively faster.

## Common drei components

| Component | Use |
|---|---|
| `OrbitControls` | Orbit camera (locked default) |
| `PresentationControls` | Tilt-on-drag, snaps back |
| `Environment` | Image-based lighting |
| `useGLTF` | Load GLTF/GLB models |
| `useTexture` | Load image textures |
| `Html` | Render React DOM positioned in 3D space (labels) |
| `Text` | 3D text (uses canvas-rendered glyphs) |
| `Sky` | Procedural sky |
| `ContactShadows` | Cheap shadow approximation |
| `Stats` | FPS overlay (dev only) |
| `Loader` | Default loading screen |
| `Bvh` | Bounding-volume hierarchy for raycasting perf |

## Postprocessing

`@react-three/postprocessing` adds effects (bloom, depth of field, chromatic aberration). NOT in the locked install — only add when design specifies a specific effect. Each effect adds bundle size and GPU cost.

## SSR

`<Canvas>` doesn't render server-side. The container template uses `dynamic(... { ssr: false })` to gate this. Don't try to SSR the Canvas — three.js needs WebGL, which doesn't exist on the server.

This is fine for product scenes (decorative, below the fold). It's NOT fine if the 3D content is the indexable content (e.g. a product gallery). For that case, supply a static fallback image as the SSR'd version, hydrating to interactive 3D on the client.

## Memory management

WebGL doesn't garbage-collect like JS. When a model loads, geometries and textures live in GPU memory until you explicitly dispose them.

r3f handles disposal on unmount automatically — `useGLTF` cached models get released. The pitfall: holding references in module-scope (e.g. preloaded models that the user never visits) keeps them alive.

For projects with multiple scenes, unmount the previous before mounting the next. Don't keep both mounted with `display: none` — that keeps both in GPU memory.

## What r3f does NOT do well

- **Many independent objects with state** (thousands of cubes that each move independently). r3f's reconciler isn't optimized for that. Use raw Three.js with `InstancedMesh`.
- **WebGPU compute**. r3f is WebGL. WebGPU's still emerging.
- **AR / VR**. Different setup (XR API). Doable but out of scope for this skill.
- **Production-quality lighting**. r3f / Three.js is real-time rendering. For photorealism, you bake lighting in Blender → use simpler real-time approximations in r3f.
