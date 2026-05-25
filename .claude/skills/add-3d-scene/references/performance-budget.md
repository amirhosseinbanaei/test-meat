# 3D scene performance budget

3D is the most expensive thing the FE team ships. The budget exists so this stays honest.

## The locked targets

| Metric | Target | How to measure |
|---|---|---|
| Initial JS bundle (route with 3D) | ≤ 800KB gzipped including model | `npm run build` → analyze chunk size |
| Frame time on mid-tier mobile (Pixel 5) | ≤ 16ms steady, ≤ 33ms during interaction | DevTools Performance panel, throttled CPU |
| First-render to interactive | ≤ 3s on mid-tier mobile, 3G | Lighthouse on the route |
| GPU memory per scene | ≤ 100MB | DevTools Memory (about:gpu in Chrome) |
| Number of draw calls per frame | ≤ 100 | r3f Stats / `gl.info.render.calls` |
| Polycount (triangle count) | ≤ 200,000 for hero scenes | Blender / model viewer |

Exceed any of these and the scene needs to be optimized OR the design has to budget. Push back rather than ship.

## Measuring at build time

After `npm run build`:

```bash
# In .next/analyze/ (if next-bundle-analyzer is set up) or via:
ls -lh .next/static/chunks/ | sort -k5 -h | tail -20
```

Look for chunks containing `three`, `@react-three`, or the scene's name. Aim for under 800KB total for the route.

If the route's total chunk size is large but split across many files, the user pays it serialised — multiple HTTP requests, multiple parses. Better than one huge file but still a real cost.

## Measuring at runtime

### r3f Stats overlay

In dev only:

```tsx
import { Stats } from '@react-three/drei';

<Canvas>
  <Stats />
  {/* ... */}
</Canvas>
```

Top-left shows FPS, MS (frame time), MB (memory).

Strip in production — don't ship the FPS counter to users.

### DevTools Performance

1. Open the route.
2. DevTools → Performance → CPU: 4× slowdown.
3. Record. Interact with the scene (rotate, zoom).
4. Stop. Inspect the flame chart.

Look for:

- Long frames (>16ms) in steady state. If yes, something runs every frame unnecessarily.
- Long "Compositor" tasks. Too many draw calls or layers.
- GC pauses. Object allocation in `useFrame` is the usual culprit.

### `gl.info.render`

```tsx
useFrame(({ gl }) => {
  console.log(gl.info.render.calls);     // draw calls per frame
  console.log(gl.info.render.triangles); // triangles rendered
  console.log(gl.info.memory.geometries);// geometries in GPU
  console.log(gl.info.memory.textures);  // textures in GPU
});
```

Run once, log, remove. Confirms what's in the scene.

## Common performance fixes

### Reduce model size

The model itself is usually the biggest file. Optimize:

1. **gltfpack with Draco**: `gltfpack -i in.glb -o out.glb -cc` — 10× compression typical.
2. **Reduce textures**: 1024×1024 instead of 4K. KTX2 + Basis instead of PNG (5–10× smaller).
3. **Reduce polycount**: in Blender, Decimate modifier to 50% often imperceptible. Bake high-poly details to a normal map.
4. **Remove unused channels**: vertex colors, multiple UV sets, embedded animations you don't use.
5. **Quantize positions**: with gltfpack, positions go from float32 to int16 with negligible loss.

A 5MB model can usually be 500KB without visible quality loss.

### Reduce DPR

```tsx
<Canvas dpr={[1, 2]}>
```

This single line typically doubles frame rate on retina/4K devices. Locked default.

### `frameloop="demand"`

For static scenes that don't animate:

```tsx
<Canvas frameloop="demand">
```

No frames render after the initial paint until something invalidates. Saves continuous GPU cost.

For interactive-but-mostly-still scenes (configurator), set `demand` and call `invalidate()` from r3f's `useThree()` on changes.

### Lower polycount with Detail variants

For models that need detail when close but not far:

```tsx
import { Detail, Detailed } from '@react-three/drei';

<Detailed distances={[0, 5, 20]}>
  <mesh geometry={highPolyGeom} />
  <mesh geometry={midPolyGeom} />
  <mesh geometry={lowPolyGeom} />
</Detailed>
```

Drei swaps between LODs based on camera distance. Free fps.

### Instanced meshes

For repeated identical objects (trees, particles, etc.):

```tsx
import { Instances, Instance } from '@react-three/drei';

<Instances limit={1000}>
  <boxGeometry />
  <meshStandardMaterial />
  {positions.map((p, i) => (
    <Instance key={i} position={p} />
  ))}
</Instances>
```

One draw call for thousands of objects. Massive win when applicable.

### Shadows

Shadows are expensive. The locked default:

- `castShadow` on the directional light.
- `castShadow` and `receiveShadow` on relevant meshes only.
- Shadow map size: 1024 (default, fine for product scenes).

For static scenes, use baked shadows (texture maps with shadows pre-rendered) instead. Free.

For very lightweight shadow approximation:

```tsx
<ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} />
```

A single flat circle of shadow under objects. Looks fine for product scenes.

### Avoid postprocessing unless required

Each postprocessing effect adds:

- Bundle size (10–50KB per effect).
- A full-screen render pass (significant GPU cost on mobile).
- Often visible quality regressions on low-DPR devices.

If design specs bloom or DOF, push back — verify it adds enough value to justify. Most product scenes look great without.

## Mobile profiling

Desktop performance doesn't translate to mobile. The locked test devices:

- **Pixel 5** (mid-tier Android baseline). If it runs poorly here, it runs poorly for half your users.
- **iPhone 12 / iPhone 14 SE** (mid-tier iOS baseline).

DevTools CPU throttling (4×) approximates mid-tier mobile but isn't perfect. Real-device testing is the gate.

For Android testing without owning every device: BrowserStack, LambdaTest, or Chrome's remote device debugging via USB.

## When to skip 3D on mobile entirely

If the scene can't hit 30fps on a Pixel 5, the right move is:

```tsx
const isMobile = useMediaQuery('(max-width: 768px)');
return isMobile ? <StaticImage src="/product-hero.jpg" /> : <SceneContainer ... />;
```

Don't ship a slow scene. A static image is a strictly better UX than a slow 3D scene that drops frames.

For mid-tier devices that CAN run the scene but only with reduced fidelity:

```tsx
<Canvas dpr={isMobile ? 1 : [1, 2]}>
  {/* lower-poly fallback on mobile */}
</Canvas>
```

## Battery considerations

3D burns battery faster than any other front-end work. For pages that are likely to be open for extended periods (configurators, dashboards), set `frameloop="demand"` and only animate during interaction.

Auto-rotating idle scenes are battery vandalism — the user isn't even looking. Disable auto-rotate when the page isn't visible:

```tsx
useEffect(() => {
  const handleVisibilityChange = () => {
    // pause the auto-rotate or invalidate accordingly
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

`requestAnimationFrame` already pauses when the tab is hidden. But a scene with `frameloop="always"` and no animation logic still does compositor work.

## Sign-off

For any 3D scene shipping to production, qa-lead's release checklist includes:

- [ ] Tested on Pixel 5 (or equivalent mid-tier Android), achieves ≥30fps steady state.
- [ ] Tested on iPhone 12, achieves ≥30fps.
- [ ] Bundle size measured: route's total JS ≤ 800KB gzipped.
- [ ] Model size measured: ≤ 5MB (≤ 2MB for hero scenes).
- [ ] Reduced-motion path verified: no auto-rotate, no camera moves.
- [ ] Static image fallback in place (or explicit decision documented to not have one).

The performance budget isn't optional. A slow scene is a worse UX than no scene.
