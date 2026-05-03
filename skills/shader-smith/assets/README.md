# shader-smith / assets

Boilerplate shaders the skill can drop into a host artifact.

| File | Lang | Where it runs | Purpose |
|---|---|---|---|
| `plasma.glsl` | GLSL ES 3.00 | WebGL2 (artifact + standalone) | Sum-of-sines plasma with IQ palette. |
| `voronoi.glsl` | GLSL ES 3.00 | WebGL2 | Animated Voronoi cells. Base for skin, crystals, scales. |
| `raymarched-sphere.glsl` | GLSL ES 3.00 | WebGL2 | Minimal SDF raymarcher with soft shadow + fog + mouse-orbit camera. |
| `tsl-warp.tsl.js` | TSL (JS) | Three.js ≥ r171 with `WebGPURenderer` (WebGL2 fallback) | Domain-warped material. **Not** for the artifact sandbox (r128). |

## Why these three GLSL files plus a TSL example

- **Plasma** = simplest "looks like something" shader — good first target.
- **Voronoi** = single useful primitive that composes into many effects.
- **Raymarched sphere** = full vertical slice (lighting, shadow, fog, camera) in ~80 lines.
- **TSL warp** = same idea on the modern path; demonstrates that one source compiles to both WGSL and GLSL.

The host wrapper for the GLSL files is `artifacts/html/shader-playground.html`. The host for the TSL file lives in `playground/` (or your own project).

## See also

- [`../SKILL.md`](../SKILL.md) — the skill body.
- [`knowledge/12-shaders-webgpu.md`](../../../knowledge/12-shaders-webgpu.md) — language-by-language guide.
- [`artifacts/html/shader-playground.html`](../../../artifacts/html/shader-playground.html) — live editor.
- [`artifacts/html/webgpu-tsl-shader.html`](../../../artifacts/html/webgpu-tsl-shader.html) — WebGPU+TSL starter (W5).
