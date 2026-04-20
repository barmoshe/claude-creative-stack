# Artifacts

Canonical single-file starters that respect the real Claude artifact sandbox. Each one is either a standalone HTML file (open in a browser — no build) or a React/JSX artifact (paste into Claude as a new artifact, or import into `playground/` to iterate outside the sandbox).

## Sandbox rules that shaped these files

From `../knowledge/03-artifacts.md` and `../knowledge/99-caveats.md`:

- **Three.js is pinned at r128.** No `three/examples/jsm/...` imports — addons aren't reachable. Controls and helpers are inline-polyfilled.
- **No arbitrary `fetch`.** Only `https://api.anthropic.com/v1/messages` is reachable from a published artifact. `claudeception-critic.jsx` demonstrates this.
- **No `localStorage` / `sessionStorage` / `indexedDB`.** Use `window.storage` in published artifacts (5 MB/key, 20 MB/artifact observed). Use React state for preview / playground.
- **No `<form type="submit">`** inside React artifacts — use `onClick`.
- **Tailwind core utilities only** — no arbitrary values like `text-[22px]`.
- **Artifact-pinned API model** for Claudeception is `claude-sonnet-4-20250514` (Anthropic silently rotates this).

## HTML starters

| File | What it demonstrates |
|---|---|
| [`html/three-r128-scene.html`](html/three-r128-scene.html) | Three.js r128 scene with inline OrbitControls polyfill. |
| [`html/phaser3-platformer.html`](html/phaser3-platformer.html) | Phaser 3 via CDN — arcade physics, sprite, jump, ground collision. |
| [`html/shader-playground.html`](html/shader-playground.html) | WebGL2 + GLSL ES 3.00 fragment shader with uTime/uMouse/uResolution uniforms. |
| [`html/gsap-scroll-story.html`](html/gsap-scroll-story.html) | GSAP ScrollTrigger horizontal-pin storytelling with reduced-motion fallback. |
| [`html/procgen-dungeon.html`](html/procgen-dungeon.html) | Seeded BSP dungeon with regenerate button and editable seed. |
| [`html/kaplay-top-down.html`](html/kaplay-top-down.html) | Kaplay top-down mover with trauma-based screen shake. |
| [`html/tone-procmusic.html`](html/tone-procmusic.html) | Tone.js procedural music — euclidean rhythm + scale-constrained melody. |

## React / JSX starters

| File | What it demonstrates |
|---|---|
| [`react/dataviz-dashboard.jsx`](react/dataviz-dashboard.jsx) | Recharts + oklch palette + responsive grid. |
| [`react/kinetic-typography.jsx`](react/kinetic-typography.jsx) | Motion v12 text reveal with stagger + scroll-triggered animation. |
| [`react/bento-grid-landing.jsx`](react/bento-grid-landing.jsx) | 2025–2026 bento-style landing hero with variable-font headline. |
| [`react/game-ecs-starter.jsx`](react/game-ecs-starter.jsx) | Tiny ECS game (inlined Miniplex-style) with fixed timestep and screen shake. |
| [`react/claudeception-critic.jsx`](react/claudeception-critic.jsx) | Calls `api.anthropic.com/v1/messages` from an artifact to critique its own state. |

## Preview

**HTML:** open the file directly in a browser. No build step; all dependencies are CDN or inline.

**JSX:** paste the whole file into a Claude chat as a new artifact, or import it into `playground/` (Vite+React+TS) for iteration.

## Caveats

Anthropic rotates the artifact runtime's pinned library versions silently. If a starter breaks overnight, check the library version printed at runtime against `knowledge/99-caveats.md`. Updates welcome via PR.
