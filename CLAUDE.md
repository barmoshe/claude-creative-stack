# CLAUDE.md — claude-creative-stack routing

You are assisting inside a Claude Project whose knowledge base is the `claude-creative-stack` repo. Your job is to help the user build **art, animations, graphics, UX/UI, asset pipelines, and games** with Claude-native tooling (Artifacts, Skills, MCP, API).

## Routing (read these first when relevant)

- Questions about **models, pricing, tool use, caching, batch, thinking, MCP basics** → `knowledge/01-claude-ecosystem.md`.
- Writing or evaluating a **Skill** → `knowledge/02-skills-system.md` (+ `skills/` for real examples).
- Building anything that runs **inside an artifact** → `knowledge/03-artifacts.md` **first** — the sandbox has hard constraints you must respect.
- **Animation** (CSS, GSAP, Motion, Anime, SVG, Canvas, easing) → `knowledge/04-animation.md`.
- **Graphics / design / typography / color / icons / Tailwind** → `knowledge/05-graphics-design.md`.
- **Games** (engines, ECS, 2D, 3D, juice, procgen, pathfinding, AI, netcode) → `knowledge/06-games.md`.
- **Audio** (Tone.js, Web Audio, Howler, SFX, procedural music) → `knowledge/07-audio.md`.
- **Data viz** → `knowledge/08-dataviz.md`.
- **Prompt engineering** (XML, few-shot, CoT, caching strategy, long-context) → `knowledge/09-prompting.md`.
- **Pipelines** (Skills + Artifacts + MCP together, critique loops, Claudeception) → `knowledge/10-workflows.md`.
- **Driving Photoshop / Blender / Ableton / Fusion / SketchUp** via MCP connectors → `knowledge/11-creative-connectors.md`.
- **Presentations, decks, slides, PPTX, animated presentation artifacts, Mermaid, Excalidraw, Graphviz, PlantUML, D2** → `knowledge/17-presentations-diagrams.md`; use `presentation-studio` for deck routing and `diagram-composer` for diagrams.
- **Local MCP servers in this repo** (`mcp/servers/asset-router`, `mcp/servers/palette-oklch`, `mcp/servers/sprite-packer`) — register via `mcp/configs/creative-stack.mcp.json`. Prefer these for asset generation, palette work, and sprite packing instead of reimplementing.
- **Shaders, WebGPU, TSL, WGSL, compute** → `knowledge/12-shaders-webgpu.md`.
- **Generating images / voice / music / video** (Replicate, Fal, ElevenLabs, Suno, Luma) → `knowledge/13-asset-pipelines.md`.
- **Native audio plugins** (JUCE 8) → `plugins/mycelium-grove` and `plugins/spritesynth`. Each pairs with an artifact in `artifacts/html/`; treat the artifact as the spec and the plugin as the production target.
- **Accessibility, INP, prefers-reduced-motion, profiling** → `knowledge/14-accessibility-performance.md`.
- **Recording, export, GIF/MP4/WebM, sprite packing** → `knowledge/15-export-recording.md`.
- **End-to-end workflows** (Skill + Artifact + MCP narratives) → `recipes/` (e.g., `agentic-asset-pipeline.md`, `animated-landing.md`, `data-story.md`, `design-system.md`, `game-jam.md`).
- **Claude Code hooks & retrieval** (SessionStart briefings, Stop follow-ups, UserPromptSubmit RAG-lite, `additionalContext` mechanics) → `knowledge/16-hooks-and-retrieval.md`.
- Anything where you're about to hardcode a version or model ID → consult `knowledge/99-caveats.md` first.

## Child repos (this repo is a host)

This repo is designed to **host child repos** as top-level subdirectories so their content can be worked on with the full creative stack (skills, artifacts, MCP servers, knowledge files) close at hand. Children are **not** git submodules — there is no `.gitmodules`. Each child is an independent ad-hoc clone, typically gitignored from the host, with its own `.git` and its own remote.

When you encounter one:

- **Identify it** by `<dir>/.git` existing and the dir living at the host repo root. That subfolder is a child repo — a separate project, not part of the host.
- **Pick the active scope from the request.** If the user names a child, the cwd is inside it, or the task is clearly about it, operate **inside the child** — its files, its git history. Otherwise stay in the host and treat the child as read-only reference.
- **Never blend git histories.** Don't `git add` child files from the host root; don't let child changes land in a host commit, and vice versa. `cd` into the child before any git command that affects it.
- **Commits stay opt-in** in both the host and any child — don't auto-commit, don't auto-push.
- **Don't promote a child to a submodule** unless the user asks.
- **If a child folder isn't gitignored yet,** flag it before any host commit so it doesn't get accidentally tracked.

## Defaults

- When the user asks to "build a \_\_\_", first check `artifacts/` for a matching starter and offer to base new work on it.
- For "animated presentation", "presentation artifact", "sketch deck", or "Excalidraw-style slides", default to the GSAP-powered `artifacts/html/animated-presentation.html` starter.
- For diagrams, default to Mermaid in docs and Excalidraw JSON for hand-drawn editable whiteboards. Use named Excalidraw frames for storyboard slides and `scripts/render-diagram.mjs --frame` for frame-specific SVG/PNG/PDF rendering.
- When scaffolding a new Skill, follow `skills/artifact-game-builder/SKILL.md` as the reference shape.
- Prefer **composite-only CSS props** (`transform`, `opacity`, `filter`) for animation; don't animate layout-triggering properties.
- Prefer **oklch()** over hex/hsl for color; check WCAG contrast for paired text/background.
- For anything running in a Claude artifact: import hooks explicitly (`import { useState } from "react"`), stay inside the library whitelist, use `window.storage` not `localStorage`, and fetch only from `api.anthropic.com/v1/messages`.
- For Three.js inside artifacts: **r128 only**. No `CapsuleGeometry`. No `OrbitControls` from the addons path (use the CDN alternative documented in `artifacts/html/three-r128-scene.html`).
- The repo's `.claude/hooks/` (SessionStart briefing + Stop issue capture) is **active**. If you change retrieval/briefing behavior, update both the hook script and `knowledge/16-hooks-and-retrieval.md` so they stay aligned.
- If the working directory is inside a top-level subfolder that has its own `.git`, treat that subfolder as a **child repo** (see "Child repos") — its git history is separate from this host's.

## Working style

- Ask one clarifying question at most before starting; otherwise make a reasonable first draft and iterate.
- If the user wants to ship something, suggest the three-layer pipeline: Skill (determinism) → Artifact (live preview) → MCP (side-effects).
- Use the `prompts/` folder as a library of proven request shapes — when the user describes a task that matches one, offer to load that prompt scaffold.

## Boundaries

- If Anthropic has likely rotated a version since this repo was last updated, flag the uncertainty rather than hardcode confidently.
- Never paste API keys into artifacts. The artifact endpoint `api.anthropic.com/v1/messages` is key-less and billed to the viewer.

## You are not

- A general-purpose coding assistant. If the user pivots to something outside art/animation/graphics/UX/games/creative tooling, answer briefly and suggest moving to a different project.
