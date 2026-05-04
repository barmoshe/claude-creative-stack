# Knowledge — Index

This folder is the reference context for Claude working inside the `claude-creative-stack` Project. Chunks are split so retrieval stays clean. Date target: **May 2026**.

## Routing table

| If the user is asking about… | Open |
|---|---|
| Models, pricing, tool use, prompt caching, batch API, extended/adaptive thinking, Claude products, MCP basics | [`01-claude-ecosystem.md`](01-claude-ecosystem.md) |
| Writing a Skill, frontmatter, progressive disclosure, composition, chaining, installing skills | [`02-skills-system.md`](02-skills-system.md) |
| Building an artifact, types, library whitelist, `window.storage`, Claudeception, sandbox constraints | [`03-artifacts.md`](03-artifacts.md) |
| CSS animations, GSAP, Motion, Anime, SVG/SMIL, Canvas 2D, WebGL/Three.js/R3F, physics, easing, perf | [`04-animation.md`](04-animation.md) |
| Design trends, Tailwind v4, GLSL cheatsheet, SVG mastery, icon sets, typography, color (oklch, P3) | [`05-graphics-design.md`](05-graphics-design.md) |
| Game engines, core patterns, 2D/3D, game feel, procgen, pathfinding, AI, multiplayer, genres, input | [`06-games.md`](06-games.md) |
| Tone.js, Web Audio raw, Howler, SFX generation, procedural music | [`07-audio.md`](07-audio.md) |
| D3, Recharts, Chart.js, Plotly, Observable Plot, Visx, ECharts, nivo, deck.gl, regl | [`08-dataviz.md`](08-dataviz.md) |
| XML tags, few-shot, chain of thought, system prompts, caching strategy, long-context, tool-use prompting | [`09-prompting.md`](09-prompting.md) |
| Combining Skills + Artifacts + MCP, critique loops, recursive Claude calls inside artifacts, asset pipelines | [`10-workflows.md`](10-workflows.md) |
| Driving Photoshop / Blender / Ableton / Fusion / SketchUp via MCP — when to use which connector | [`11-creative-connectors.md`](11-creative-connectors.md) |
| WebGPU, TSL, WGSL, GLSL, compute shaders, NodeMaterial, the WebGL2 fallback path | [`12-shaders-webgpu.md`](12-shaders-webgpu.md) |
| Generating images, voice, music, video via Replicate / Fal / ElevenLabs / Suno / Luma — provider selection, cost, prompts | [`13-asset-pipelines.md`](13-asset-pipelines.md) |
| INP / LCP / CLS targets, prefers-reduced-motion, keyboard nav for canvas, profiling, color contrast | [`14-accessibility-performance.md`](14-accessibility-performance.md) |
| Exporting canvas → PNG/GIF/MP4/WebM, MediaRecorder, WebCodecs, ffmpeg.wasm, sprite packing | [`15-export-recording.md`](15-export-recording.md) |
| "Is this version still current? Is this model ID still valid?" | [`99-caveats.md`](99-caveats.md) |

## Reading priority for cold starts

1. `03-artifacts.md` — always relevant; sandbox constraints are easy to violate.
2. `01-claude-ecosystem.md` — grounding on model IDs and API shapes.
3. The domain file matching the user's task (animation / graphics / games / audio / dataviz / connectors / shaders / asset-pipelines).
4. `14-accessibility-performance.md` — apply before declaring anything "done."
5. `99-caveats.md` — last check before hardcoding any version or model ID.

## Conventions

- Tables use pipe-separated Markdown.
- All code fences are language-tagged for syntax highlighting.
- Version numbers are flagged as approximate where Anthropic rotates them silently (see caveats).
