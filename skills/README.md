# Skills

Ten agent skills that layer on top of the official Anthropic skills. Each is a folder containing a `SKILL.md` (progressive-disclosure entry point) and optional supporting files (scripts, references, assets).

| Skill | Triggers | Backed by | Demo |
|---|---|---|---|
| [`artifact-game-builder`](artifact-game-builder/SKILL.md) | "build a game", "mini game", "playable artifact" | `knowledge/06-games.md`, `knowledge/03-artifacts.md` | [`artifacts/react/game-ecs-starter.jsx`](../artifacts/react/game-ecs-starter.jsx) |
| [`animation-composer`](animation-composer/SKILL.md) | "animate", "scroll story", "timeline" | `knowledge/04-animation.md` | [`artifacts/html/gsap-scroll-story.html`](../artifacts/html/gsap-scroll-story.html), [`artifacts/html/css-animation-hero.html`](../artifacts/html/css-animation-hero.html) |
| [`shader-smith`](shader-smith/SKILL.md) | "shader", "glsl", "fragment", "raymarch" | `knowledge/12-shaders-webgpu.md`, `knowledge/05-graphics-design.md` | [`artifacts/html/shader-playground.html`](../artifacts/html/shader-playground.html), [`assets/`](shader-smith/assets) |
| [`palette-generator`](palette-generator/SKILL.md) | "palette", "color tokens", "oklch" | `knowledge/05-graphics-design.md`, `knowledge/14-accessibility-performance.md` | [`mcp/servers/palette-oklch/`](../mcp/servers/palette-oklch/) |
| [`sprite-atlas-builder`](sprite-atlas-builder/SKILL.md) | "sprite sheet", "atlas", "animation frames" | `knowledge/15-export-recording.md` §15.8 | [`scripts/pack.ts`](sprite-atlas-builder/scripts/pack.ts), [`mcp/servers/sprite-packer/`](../mcp/servers/sprite-packer/) |
| [`ui-design-kit`](ui-design-kit/SKILL.md) | "design system", "ui kit", "components" | `knowledge/05-graphics-design.md` | [`artifacts/react/bento-grid-landing.jsx`](../artifacts/react/bento-grid-landing.jsx), [`artifacts/react/anchor-positioned-popover.jsx`](../artifacts/react/anchor-positioned-popover.jsx) |
| [`editorial-scanner-skin`](editorial-scanner-skin/SKILL.md) | "news scanner", "editorial dashboard", "RTL Claude tool", "loop web_search and show cards" | `knowledge/05-graphics-design.md`, `knowledge/03-artifacts.md`, `knowledge/14-accessibility-performance.md` | [`references/skeleton.html`](editorial-scanner-skin/references/skeleton.html), [`references/components.css`](editorial-scanner-skin/references/components.css) |
| [`procgen-toolkit`](procgen-toolkit/SKILL.md) | "procedural", "dungeon", "map gen", "wfc", "bsp" | `knowledge/06-games.md` §6.6 | [`artifacts/html/procgen-dungeon.html`](../artifacts/html/procgen-dungeon.html), [`references/algorithms.md`](procgen-toolkit/references/algorithms.md) |
| [`asset-generator`](asset-generator/SKILL.md) | "generate {image,voice,music,video}", "concept art" | `knowledge/13-asset-pipelines.md` | [`mcp/servers/asset-router/`](../mcp/servers/asset-router/), [`recipes/agentic-asset-pipeline.md`](../recipes/agentic-asset-pipeline.md) |
| [`critique-loop`](critique-loop/SKILL.md) | "critique this", "review", "iterate" | `knowledge/09-prompting.md` | [`artifacts/react/claudeception-critic.jsx`](../artifacts/react/claudeception-critic.jsx), [`artifacts/react/shader-jam.jsx`](../artifacts/react/shader-jam.jsx) |

## Philosophy

- **Orchestration over duplication.** Where there's a solid existing skill (`anthropics/skills`, `greensock/gsap-skills`, `freshtechbro/claudedesignskills`), we route to it rather than rewrite. See `animation-composer` and `shader-smith` for this pattern.
- **Progressive disclosure.** `SKILL.md` frontmatter is ~100 tokens; the body is under 500 lines; deep references live in sibling files or link to `knowledge/`.
- **Honest about the sandbox.** Every skill that produces runtime code respects the artifact constraints in `knowledge/03-artifacts.md` and `knowledge/99-caveats.md`.

## Install

**Claude Code:**
```bash
# Install all skills from this repo
cp -r skills/* ~/.claude/skills/

# Or install one
cp -r skills/artifact-game-builder ~/.claude/skills/
```

Or, if this repo is set up as a plugin marketplace (see `.claude-plugin/marketplace.json`):

```bash
/plugin marketplace add /path/to/claude-creative-stack
/plugin install claude-creative-stack
```

**Claude.ai (Pro / Max / Team / Enterprise):** upload the skill folder via the Skills panel.

**API:** POST to `/v1/skills` (requires the `code-execution` tool to be enabled on the request).

## SKILL.md format

See `knowledge/02-skills-system.md` for the full frontmatter schema. Short version:

```yaml
---
name: skill-name  # kebab-case, ≤64 chars
description: One-liner that makes the triggering intent clear. ≤1024 chars.
license: MIT
---
```
