# Artifacts

Canonical single-file starters that respect the real Claude artifact sandbox. Each one is either a standalone HTML file (open in a browser — no build) or a React/JSX artifact (paste into Claude as a new artifact, or import into `playground/` to iterate outside the sandbox).

## Sandbox rules that shaped these files

From [`../knowledge/03-artifacts.md`](../knowledge/03-artifacts.md) and [`../knowledge/99-caveats.md`](../knowledge/99-caveats.md):

- **Three.js is pinned at r128** in the artifact runtime. No `three/examples/jsm/...` imports. Controls and helpers are inline-polyfilled. The WebGPU starter (`webgpu-tsl-shader.html`) targets a **current** Three.js (r183) and is meant to run outside the sandbox.
- **No arbitrary `fetch`.** Only `https://api.anthropic.com/v1/messages` is reachable from a published artifact. `claudeception-critic.jsx` and the W8 `shader-jam.jsx` flagship demonstrate this.
- **No `localStorage` / `sessionStorage` / `indexedDB`.** Use `window.storage` in published artifacts (5 MB/key, 20 MB/artifact observed). React state in preview / playground.
- **No WebSockets / WebRTC / SharedArrayBuffer.** For "live" UX inside an artifact use `BroadcastChannel` (single-browser tab tree) — see `react/realtime-collab-cursor.jsx`.
- **No `<form type="submit">`** inside React artifacts — use `onClick`.
- **Tailwind core utilities only** — no arbitrary values like `text-[22px]`.
- **Artifact-pinned Claude API model** for Claudeception is `claude-sonnet-4-20250514` (Anthropic silently rotates this).

## HTML starters (open in any browser)

| File | What it demonstrates |
|---|---|
| [`html/three-r128-scene.html`](html/three-r128-scene.html) | Three.js r128 scene with inline OrbitControls polyfill. |
| [`html/phaser4-platformer.html`](html/phaser4-platformer.html) | Phaser 4 via CDN — arcade physics, sprite, jump, ground collision. |
| [`html/shader-playground.html`](html/shader-playground.html) | WebGL2 + GLSL ES 3.00 fragment shader with `uTime`/`uMouse`/`uResolution` uniforms. |
| [`html/webgpu-tsl-shader.html`](html/webgpu-tsl-shader.html) | Three.js WebGPURenderer + TSL with WebGL2 fallback. **Outside the sandbox.** |
| [`html/css-animation-hero.html`](html/css-animation-hero.html) | Pure-CSS hero — `@property` gradient animation, scroll-driven section reveals, full `prefers-reduced-motion` fallback. |
| [`html/view-transitions-demo.html`](html/view-transitions-demo.html) | Same-document View Transitions API morph (Baseline Oct 2025); falls back to instant DOM swap. |
| [`html/audio-visualizer.html`](html/audio-visualizer.html) | Tone.js generative arpeggio + `AnalyserNode` + Canvas visualizer (composite-only). |
| [`html/gsap-scroll-story.html`](html/gsap-scroll-story.html) | GSAP ScrollTrigger horizontal-pin storytelling with reduced-motion fallback. |
| [`html/procgen-dungeon.html`](html/procgen-dungeon.html) | Seeded BSP dungeon with regenerate button and editable seed. |
| [`html/kaplay-top-down.html`](html/kaplay-top-down.html) | Kaplay top-down mover with trauma-based screen shake. |
| [`html/tone-procmusic.html`](html/tone-procmusic.html) | Tone.js procedural music — euclidean rhythm + scale-constrained melody. |
| [`html/hdr-aurora-cathedral.html`](html/hdr-aurora-cathedral.html) | HDR pipeline flagship — Three.js r128 fullscreen aurora with FloatType render targets, hand-rolled bloom (bright extract + separable gaussian + ACES tone-map), oklch wide-gamut palette mapped through linear-sRGB so out-of-gamut chroma drives bloom, Tone.js drone audio-reactivity, and a `(dynamic-range: high) / (color-gamut: rec2020)` badge. |
| [`html/barmoshe-portfolio.html`](html/barmoshe-portfolio.html) | Long-form personal portfolio (kept for reference). |

## React / JSX starters (paste into a Claude chat)

| File | What it demonstrates |
|---|---|
| [`react/dataviz-dashboard.jsx`](react/dataviz-dashboard.jsx) | Recharts + oklch palette + responsive grid. |
| [`react/kinetic-typography.jsx`](react/kinetic-typography.jsx) | Motion v12 text reveal with stagger + scroll-triggered animation. |
| [`react/bento-grid-landing.jsx`](react/bento-grid-landing.jsx) | 2025–2026 bento-style landing hero with variable-font headline. |
| [`react/game-ecs-starter.jsx`](react/game-ecs-starter.jsx) | Tiny ECS game (inlined Miniplex-style) with fixed timestep and screen shake. |
| [`react/anchor-positioned-popover.jsx`](react/anchor-positioned-popover.jsx) | CSS Anchor Positioning + Popover API — zero positioning libs. JS fallback for unsupported browsers. |
| [`react/realtime-collab-cursor.jsx`](react/realtime-collab-cursor.jsx) | Multi-cursor demo via `BroadcastChannel` + `window.storage`. Open the artifact in two tabs. |
| [`react/claudeception-critic.jsx`](react/claudeception-critic.jsx) | Calls `api.anthropic.com/v1/messages` from an artifact to critique its own state. |
| [`react/shader-jam.jsx`](react/shader-jam.jsx) | **W8 flagship** — live GLSL editor with vision-grounded AI critique loop. |

## Preview

**HTML:** open the file directly in a browser. No build step; all dependencies are CDN or inline. The WebGPU starter requires a Chromium / Safari 26+ browser to take the WebGPU path; older browsers automatically fall back to WebGL2.

**JSX:** paste the whole file into a Claude chat as a new artifact, or import it into [`../playground/`](../playground/) (Vite+React+TS) for iteration.

## Caveats

Anthropic rotates the artifact runtime's pinned library versions silently. If a starter breaks overnight, check the library version printed at runtime against `knowledge/99-caveats.md`. Updates welcome via PR.
