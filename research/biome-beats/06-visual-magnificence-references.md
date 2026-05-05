# Visual Magnificence References
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

Per-biome reference board for BiomeBeats running inside `jweb` (THREE r128 for Space, Canvas2D elsewhere). Space's baseline is the 11-program `cosmic-chord-synth/shared/shaders.ts` set; Star Nest, Auroras, and Seascape are the ShaderToy "primary keys" to mine. The Canvas2D vocabulary is: distance-field soft particles, Voronoi-based caustics, scrolling additive gradients, 2D boids. Phase-1 hits 60fps on integrated GPU by capping counts (~1.5k Canvas2D, ~5k THREE points), staying composite-only, and gating post-pro through a single full-screen quad. `prefers-reduced-motion` collapses every motion to a static frame plus a slow opacity breath.

## Scope & questions

This report curates **visual references** — not architecture. Out of scope: shader code, asset specs, audio reactivity ladder. In scope:

- For each biome (Space, Jungle, Sea, Cyberpunk, Tundra), 3–5 portable reference works with one-line technique notes.
- Phase-1 technique shortlist that runs in `jweb` (THREE r128 + Canvas2D, no addons paths, no `CapsuleGeometry`, no `OrbitControls` from addons), hits 60fps on Intel Iris / M-series base, and degrades cleanly under `prefers-reduced-motion`.
- Phase-2 stretch list for techniques that would need WebGPU, a desktop GPU, or JUCE OpenGL/Metal — flagged but deferred.

Question this answers: *what specific shader IDs and works should the design team study before locking the visual direction in R10?*

## Findings (with inline citations)

### Space

The existing `cosmic-chord-synth/shared/shaders.ts` ships 11 programs (starfield with scintillation + spiral breathing, warm-palette pulsing star with limb darkening, halo, drum-star pulse, galaxy spiral, nebulae, post-process bloom/blur/composite) — that is the **baseline** to port and extend, not replace [^cosmic-shaders].

- **"Star Nest" — Kali** (`https://www.shadertoy.com/view/XlfGRj`). 3D Kaliset fractal with volumetric stepping; ~65 lines GLSL, infinite-detail parallax. Direct port candidate for the deep-space layer behind the existing galaxy [^starnest].
- **"Auroras" — nimitz** (`https://www.shadertoy.com/view/XtGGRt`). Cheap procedural northern-lights pass — also doubles as a soft nebula band (Tundra reuses it; Space gets the same code with a cooler palette + bloom) [^auroras].
- **"Starfield" — The Art of Code (BigWings)** (`https://www.shadertoy.com/view/wtcXWX`). Layered parallax stars + soft nebula cloud, designed for tutorial portability [^aocstars].
- **NVIDIA AI Art Gallery — Refik Anadol, *Machine Hallucinations — Space*** (`https://www.nvidia.com/en-us/research/ai-art-gallery/artists/refik-anadol/`). Mood-board only: latent-flow palette transitions for the AI-DJ phase fades [^anadol-space].

### Jungle

- **"Rainforest" — iq** (`https://www.shadertoy.com/view/4ttSWf`). Raymarched forest with depth-based mist and volumetric haze — too heavy to ship full, but the colour grading and fog falloff transfer to Canvas2D [^rainforest].
- **"glowing particles" — ShaderToy** (`https://www.shadertoy.com/view/Ml3cWs`). Soft additive blobs — exact technique we want for fireflies in Canvas2D (radial-gradient sprite, additive composite) [^glow-particles].
- **"Interactive Particles"** (`https://www.shadertoy.com/view/McXXzH`). Mouse-attractor particle field — pattern for touch-driven firefly response [^interactive-particles].
- **Refik Anadol — *Machine Hallucinations — Nature Dreams*** (`https://refikanadol.com/works/machine-hallucinations-nature-dreams/`). Mood reference for slow-flow canopy transitions and saturation [^anadol-nature].

### Sea

- **"Seascape" — Alexander Alekseev (TDM)** (`https://www.shadertoy.com/view/Ms2SD1`). Gold-standard procedural ocean — fractal-noise heightfield + analytic normals + specular. Above-water reference; we lift the colour ramp and noise stack for the Canvas2D wave overlay [^seascape].
- **"Gerstner Waves, first attempt"** (`https://www.shadertoy.com/view/WcjyRh`). Cleaner Gerstner sum than Seascape's noise — useful when the team wants explicit wave control [^gerstner].
- **CGSea — acknosyn** (`https://github.com/acknosyn/CGSea`). Underwater scene with swarming fish, procedural terrain, and Voronoi-distorted caustics — the *full pattern* for our Sea biome [^cgsea].
- **Ouchhh — *AI Art of Oceans* (MSC World Europa)** (`https://www.itsmachas.com/consultancy/view/ai-art-of-oceans-ouchhh-studio-data-painting-installation-msc-world-europa`). Data-painting reference for the slow blue-green hue drift [^ouchhh-oceans].
- **Refik Anadol — *Coral Dreams*** (`https://refikanadol.com/works/coraldreams/`). Reef colour direction [^anadol-coral].

### Cyberpunk

- **"Cyber Punk" — ShaderToy** (`https://www.shadertoy.com/view/7lVSDw`). Combines wave-tile, image-block, scanline-jitter, analog-noise, screen-jump — the canonical glitch sampler [^cyberpunk-shader].
- **"Glitch scanline jitter"** (`https://www.shadertoy.com/view/ftGXWm`). Isolated scanline+RGB-shift pass; 3-tap chromatic aberration — fits a single Canvas2D post pass on a 2D context [^glitch-scanline].
- **"Fast CRT v2"** (`https://www.shadertoy.com/view/7d2fzD`). Cheap CRT mask + bloom; portable to a full-screen `<canvas>` overlay [^fast-crt].
- **Ouchhh studio (homepage)** (`https://ouchhh.tv/`). Mood reference for neural-data scanline fields [^ouchhh].

### Tundra

- **"Auroras" — nimitz** (`https://www.shadertoy.com/view/XtGGRt`). Same shader as Space — palette-swap to cool pastels and overlay onto Canvas2D sky gradient [^auroras].
- **"Snow is falling"** (`https://www.shadertoy.com/view/4lfcz4`). Multi-layer parallax snow — directly reproducible as a Canvas2D particle pool with `globalCompositeOperation = "lighter"` [^snow].
- **Refik Anadol — *Machine Hallucinations — Nature Dreams*** (`https://refikanadol.com/works/machine-hallucinations-nature-dreams/`). Pastel mood for glacier transitions [^anadol-nature].
- **Björk — *Biophilia* (Cosmogony / Solstice)** (`https://www.snibbe.com/apps/biophilia`). Touch-music interaction reference; cool palette, slow celestial motion [^biophilia].

## Implications for BiomeBeats

### Phase-1 technique shortlist

1. **Procedural starfield + nebula band (THREE r128 fragment shader on a full-screen quad).** Biome: Space. Source: Star Nest + Auroras palette-swap. Reduced-motion fallback: freeze the `iTime` uniform; keep one slow opacity breath (8 s).
2. **Additive soft-particle pool (radial-gradient sprite, `THREE.AdditiveBlending` for Space; `globalCompositeOperation = "lighter"` for Canvas2D).** Biomes: Space (drum stars), Jungle (fireflies), Tundra (snow). Cap: 5k THREE points / 1.5k Canvas2D. Reduced-motion fallback: freeze positions, drop count by 70%, hold a static breath.
3. **2D boids flock (CPU, plain JS).** Biome: Sea (fish school). Cap: ~120 agents with grid hashing for neighbour queries. Reduced-motion fallback: render the school as a static silhouette cluster.
4. **Voronoi-based caustic overlay (Canvas2D — pre-baked noise tile + scrolling distortion).** Biome: Sea. CGSea pattern. Reduced-motion fallback: freeze the scroll offsets; reduce overlay opacity to 30%.
5. **Scanline + chromatic-aberration post-pass (Canvas2D).** Biome: Cyberpunk. From "Fast CRT v2" / "Glitch scanline jitter". Reduced-motion fallback: drop the RGB offset to 0; keep the static scanline texture only.
6. **Gerstner-sum wave overlay on top of a baked gradient (Canvas2D).** Biome: Sea (above-water band). From "Gerstner Waves, first attempt". Reduced-motion fallback: render a single static wave silhouette.
7. **Volumetric mist bands (Canvas2D — multi-octave value noise blitted as semi-transparent strips).** Biome: Jungle. Inspired by iq's "Rainforest". Reduced-motion fallback: bake one frame, hold.
8. **Aurora ribbon (THREE r128 OR Canvas2D additive gradient strips with per-strip phase offset).** Biomes: Tundra, Space (nebula re-skin). From nimitz's "Auroras". Reduced-motion fallback: freeze phase, reduce strip count by 50%.
9. **Bloom-on-bright pass (THREE r128 — single ping-pong RT, downsample → blur → composite).** Biome: Space. Already in `cosmic-chord-synth/shared/shaders.ts`. Reduced-motion fallback: skip the blur entirely; just clamp the additive output.
10. **FFT-driven uniform pulses (`u_bass`, `u_treble`, `u_pitch`, `u_volume`).** All biomes. Canonical pattern from the existing Space shaders and `artifacts/html/audio-visualizer.html`. Reduced-motion fallback: clamp uniform deltas to ±10% of the rest value (e.g. `u_bass = mix(u_bass_rest, u_bass, 0.1)`).

### Phase-2 stretch (deferred)

- **GPU-side flocking via FBO ping-pong** (boids on GPU). Needs a multi-pass setup that's awkward inside `jweb`'s single-document context — defer until JUCE OpenGL/Metal backend exists.
- **Volumetric raymarched forest (iq's "Rainforest" pattern).** Eats integrated-GPU budget instantly; defer to a desktop GPU build.
- **WebGPU compute particles (1M+ points).** Out of `jweb` r128 scope entirely.
- **Real-time TSL-driven postprocessing chain (multi-stage bloom + DOF + colour grade).** WebGPU-only; defer.

## Open questions

- Does the team want a single shared Canvas2D post-pass module (scanlines/CRT for Cyberpunk, vignette for Jungle), or per-biome custom passes? Cost-wise the shared module wins.
- For Space, do we keep the existing 11-program shader set as-is, or merge Star Nest into the galaxy program? Recommend merge to reduce uniform plumbing.
- Tundra aurora: shader (THREE-on-Tundra) or Canvas2D additive gradient strips? R10 to decide; the visual delta is small under `prefers-reduced-motion`.

## Sources

[^cosmic-shaders]: `cosmic-chord-synth/shared/shaders.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/shared/shaders.ts
[^starnest]: Star Nest by Kali (Pablo Román Andrioli) — https://www.shadertoy.com/view/XlfGRj
[^auroras]: Auroras by nimitz — https://www.shadertoy.com/view/XtGGRt
[^aocstars]: Starfield (SS7) by The Art of Code — https://www.shadertoy.com/view/wtcXWX
[^anadol-space]: Refik Anadol at NVIDIA AI Art Gallery — https://www.nvidia.com/en-us/research/ai-art-gallery/artists/refik-anadol/
[^rainforest]: Rainforest by iq — https://www.shadertoy.com/view/4ttSWf
[^glow-particles]: glowing particles — https://www.shadertoy.com/view/Ml3cWs
[^interactive-particles]: Interactive Particles — https://www.shadertoy.com/view/McXXzH
[^anadol-nature]: Machine Hallucinations — Nature Dreams (Refik Anadol) — https://refikanadol.com/works/machine-hallucinations-nature-dreams/
[^seascape]: Seascape by Alexander Alekseev (TDM) — https://www.shadertoy.com/view/Ms2SD1
[^gerstner]: Gerstner Waves, first attempt — https://www.shadertoy.com/view/WcjyRh
[^cgsea]: CGSea — https://github.com/acknosyn/CGSea
[^ouchhh-oceans]: AI Art of Oceans (Ouchhh / MSC World Europa) — https://www.itsmachas.com/consultancy/view/ai-art-of-oceans-ouchhh-studio-data-painting-installation-msc-world-europa
[^anadol-coral]: Coral Dreams (Refik Anadol) — https://refikanadol.com/works/coraldreams/
[^cyberpunk-shader]: Cyber Punk — https://www.shadertoy.com/view/7lVSDw
[^glitch-scanline]: Glitch scanline jitter — https://www.shadertoy.com/view/ftGXWm
[^fast-crt]: Fast CRT v2 — https://www.shadertoy.com/view/7d2fzD
[^ouchhh]: Ouchhh studio — https://ouchhh.tv/
[^snow]: Snow is falling — https://www.shadertoy.com/view/4lfcz4
[^biophilia]: Björk: Biophilia (Scott Snibbe) — https://www.snibbe.com/apps/biophilia
