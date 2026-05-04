# 12 — Shaders, WebGPU & TSL

> WebGPU reached **Baseline (Jan 2026)** — Chrome, Edge, Firefox, and Safari 26 ship it. As of May 2026 ≈70-75% of users have it. The default story is "WebGPU first, WebGL2 fallback." This file is the routing map for everything shader-shaped: GLSL, WGSL, and Three.js's TSL node graph that compiles to both.

## 12.1 The three languages

| Lang | Where it runs | When to reach for it |
|---|---|---|
| **GLSL ES 1.0 / 3.0** | WebGL1 / WebGL2 | Targeting the artifact sandbox (Three.js r128 is WebGL only); legacy code; ShaderToy ports. |
| **WGSL** | WebGPU | First-party shader code on `WebGPURenderer`; compute shaders; future-proof. |
| **TSL** (Three Shader Language) | Three.js node system | Ship one source, get both WebGPU and WebGL2 back-ends for free. |

Picking:
- **In a published artifact** → GLSL on WebGL2. WebGPU is not exposed via Three.js r128.
- **Outside the sandbox** (`playground/`, your app) → TSL when using Three.js, WGSL otherwise.
- **Standalone WebGPU** (no Three.js) → WGSL with `webgpu-utils` for boilerplate.
- **Compute** (particles, GPU physics, image processing) → WGSL or TSL compute nodes; not available in WebGL.

## 12.2 TSL — the recommended path inside Three.js

TSL is a JavaScript node graph that compiles to WGSL (WebGPU) or GLSL (WebGL2). Same source, two back-ends, automatic feature gating.

```js
import * as THREE from "three/webgpu";
import { uv, time, sin, vec3, mix, mx_noise_float } from "three/tsl";

const renderer = new THREE.WebGPURenderer({ antialias: true });
await renderer.init();
// ...standard scene setup...

const mat = new THREE.MeshStandardNodeMaterial();
const noise = mx_noise_float(uv().mul(8).add(time.mul(0.4)));
mat.colorNode = mix(vec3(0.05, 0.1, 0.4), vec3(1.0, 0.9, 0.6), noise);
mesh.material = mat;
```

Key node families (`three/tsl`):

| Family | Examples | Purpose |
|---|---|---|
| **Inputs** | `uv()`, `position`, `normal`, `time`, `uniform()`, `attribute(...)` | Vertex/fragment/compute inputs. |
| **Math** | `add`, `mul`, `mix`, `smoothstep`, `length`, `dot`, `cross`, `pow` | Standard ops; chainable. |
| **Noise** | `mx_noise_float`, `mx_worley_noise_float`, `mx_cell_noise_float` | MaterialX-derived noise — same function across both back-ends. |
| **Texture** | `texture(map, uv)`, `cubeTexture`, `videoTexture` | Sampling. |
| **Lighting** | `directionalLight`, `pointLight`, `pmremTexture`, `oren_nayar`, `clearcoat` | Wire into `MeshStandardNodeMaterial`. |
| **Compute** | `Fn`, `attributeArray`, `storageObject`, `computeShader` | GPU compute on WebGPU. |
| **Post** | `pass`, `output`, `pmrem` (post stack) | NodePostProcessing. |

Fall-back behavior: if the user has no WebGPU, instantiate `WebGLRenderer` instead and the same node graph gets compiled to GLSL automatically — minus compute features. Feature-detect:

```js
const supportsGPU = "gpu" in navigator;
const renderer = supportsGPU
  ? new THREE.WebGPURenderer({ antialias: true })
  : new THREE.WebGLRenderer({ antialias: true });
if (supportsGPU) await renderer.init();
```

## 12.3 WGSL primer (when you're standalone)

WGSL is Rust-flavored, statically typed, with explicit storage classes (`uniform`, `storage`, `private`, `function`, `workgroup`). A vertex/fragment pair:

```wgsl
struct VSIn  { @location(0) pos: vec2f, @location(1) uv: vec2f };
struct VSOut { @builtin(position) clip: vec4f, @location(0) uv: vec2f };

@vertex
fn vs(in: VSIn) -> VSOut {
  return VSOut(vec4f(in.pos, 0.0, 1.0), in.uv);
}

@group(0) @binding(0) var<uniform> uTime: f32;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex:  texture_2d<f32>;

@fragment
fn fs(in: VSOut) -> @location(0) vec4f {
  let c = textureSample(tex, samp, in.uv).rgb;
  return vec4f(c * (0.5 + 0.5 * sin(uTime)), 1.0);
}
```

Compute (1M-particle update):

```wgsl
struct Particle { pos: vec2f, vel: vec2f };
@group(0) @binding(0) var<storage, read_write> ps: array<Particle>;
@group(0) @binding(1) var<uniform> dt: f32;

@compute @workgroup_size(64)
fn step(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= arrayLength(&ps)) { return; }
  ps[i].pos = ps[i].pos + ps[i].vel * dt;
  // attraction toward origin
  ps[i].vel = ps[i].vel + (-ps[i].pos) * 0.5 * dt;
}
```

Dispatch from JS: `pass.dispatchWorkgroups(Math.ceil(N / 64))`.

## 12.4 GLSL refresher (artifact sandbox path)

The artifact sandbox runs Three.js r128 on WebGL2. Use GLSL ES 3.00 (in a `<script type="x-shader/x-fragment">` or via `RawShaderMaterial`/`ShaderMaterial`).

Fragment template:

```glsl
#version 300 es
precision highp float;
uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uMouse;
in  vec2 vUv;
out vec4 outColor;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float d = length(uv) - 0.4;
  float a = smoothstep(0.01, 0.0, d);
  vec3 c = mix(vec3(0.05, 0.1, 0.2), vec3(1.0, 0.7, 0.4), a);
  outColor = vec4(c, 1.0);
}
```

See `artifacts/html/shader-playground.html` for the live editor.

## 12.5 Compute shaders — what's worth doing on the GPU now

Realistic browser-side wins (May 2026):

- **Particles** — 1M+ particles with per-frame physics in WGSL compute → render as a vertex shader-driven point cloud. Trivial 60fps on mid laptops.
- **SDF raymarchers** — large fragment-shader loops are still bottlenecked by ALU; compute shaders allow tile-sharing of intermediate values.
- **Image processing** — bloom, blur, color grading via compute often beats fragment-pass implementations on integrated GPUs.
- **Boids / flocking** — separation/alignment/cohesion across thousands of agents.
- **GPU sorting** — bitonic sort for transparency ordering at scale.

Not yet pragmatic in pure browser:

- Heavy mesh skinning (use vertex shaders or transform feedback equivalents in WGSL).
- Path tracing of full scenes — still too slow on most consumer GPUs.

## 12.6 Tooling

- **`webgpu-utils`** (Greggman) — fills in the boilerplate WebGPU forgot. Buffer layout helpers, mip generation, default samplers. `npm i webgpu-utils`.
- **`wgsl-analyzer`** — VS Code LSP for WGSL.
- **Tint validator** — built into Chrome DevTools; flags WGSL errors with line/col.
- **Naga** (Rust, `cargo install naga-cli`) — convert WGSL ↔ SPIR-V ↔ GLSL.
- **`spector.js`** — frame capture & inspect for both WebGL and WebGPU. Drop-in via DevTools panel.
- **ShaderFrog 2 / ShaderEditor** — node-based GLSL/WGSL editors that export node graphs.
- **lygia** (`patriciogonzalezvivo/lygia`) — modular GLSL stdlib (noise, SDF, color, math).
- **Compute Toys** — WGSL-only ShaderToy alternative; great for learning compute.

## 12.7 Learning paths

Ordered by how much you want to understand:

1. **30 minutes**: copy an artifact starter (`shader-playground.html` for GLSL; build something with TSL nodes for WebGPU).
2. **A weekend**: read **The Book of Shaders** (`thebookofshaders.com`), port one ShaderToy effect, then port the same effect to TSL.
3. **A focused week**: Maxime Heckel's *Field Guide to TSL & WebGPU* + the official Three.js TSL docs + Three.js Roadmap WebGPU section.
4. **A month**: SBCode's TSL tutorials, NikLever and Wawa Sensei's R3F+TSL playlists, build one production shader (cloth, water, foliage, hair).

Reference shaders:

- **Plasma** — sum of sines over UV, mapped to HSL.
- **Voronoi** — `mx_worley_noise_float` (TSL) or `lygia/generative/voronoi.glsl` (GLSL).
- **Raymarched sphere** — SDF + sphere-tracing loop with ε ≈ 0.001.
- **Volumetric clouds** — fbm with absorption; sample 32–64 steps; jitter to break banding.
- **SSS skin** — `MeshPhysicalMaterial` (artifact-friendly) with `transmission`, `thickness`, `iridescence` — or a TSL `oren_nayar` + diffusion approximation outside the sandbox.

Boilerplate fragments live in `skills/shader-smith/assets/`.

## 12.8 Pitfalls

- **Don't ship WGSL into an artifact.** Three.js r128 in the sandbox is WebGL only. Use TSL outside the sandbox.
- **WebGPU init is async.** `await renderer.init()` before the first `render()` call — `WebGLRenderer` is sync, the migration breaks this assumption.
- **Buffer alignment.** WebGPU uniforms are 16-byte aligned by default. `webgpu-utils` handles this automatically; hand-rolled struct writers will silently corrupt.
- **`workgroup_size` must be `<= maxComputeWorkgroupSizeX/Y/Z`.** 64×1×1 is the safe default.
- **Linear vs sRGB color space.** Three.js's r152+ output color management defaults to sRGB; older shader code that assumes linear-out will look washed out. Set `THREE.ColorManagement.enabled = true`.
- **TSL is still moving.** Pin `three` versions explicitly; node names occasionally rename between revisions.
- **Compute timing.** `device.queue.onSubmittedWorkDone()` is the only reliable way to time compute passes; `performance.now()` brackets cover the JS dispatch only.

## 12.9 See also

- `knowledge/04-animation.md` §4.5 — Three.js, R3F, GLSL cheat sheet.
- `knowledge/05-graphics-design.md` §5.3 — GLSL noise libraries, Tailwind v4 OKLCH.
- `skills/shader-smith/SKILL.md` — single-shader authoring skill with boilerplate references.
- `artifacts/html/shader-playground.html` — GLSL live editor (sandbox).
- `artifacts/html/webgpu-tsl-shader.html` — TSL with WebGL2 fallback.
- `artifacts/react/shader-jam.jsx` — live-coded TSL editor with AI critique loop (W8 flagship demo).
