# Skills

Seven agent skills that layer on top of the official Anthropic skills. Each is a folder containing a `SKILL.md` (progressive-disclosure entry point) and optional supporting files.

| Skill | Triggers | Purpose |
|---|---|---|
| [`artifact-game-builder`](artifact-game-builder/SKILL.md) | "build a game", "mini game", "playable artifact" | End-to-end single-file game scaffolding. |
| [`animation-composer`](animation-composer/SKILL.md) | "animate", "scroll story", "timeline" | Orchestrator — picks CSS / Motion / GSAP / Theatre. Defers to `gsap-skills` where relevant. |
| [`shader-smith`](shader-smith/SKILL.md) | "shader", "glsl", "fragment", "raymarch" | GLSL fragment shader authoring + WebGL2 wrapping. |
| [`palette-generator`](palette-generator/SKILL.md) | "palette", "color tokens", "oklch" | Accessible oklch palettes with AA verification. |
| [`sprite-atlas-builder`](sprite-atlas-builder/SKILL.md) | "sprite sheet", "atlas", "animation frames" | Atlas layout, JSON manifest, Phaser/Pixi integration. |
| [`ui-design-kit`](ui-design-kit/SKILL.md) | "design system", "ui kit", "components" | shadcn-style component kit with tokens. |
| [`procgen-toolkit`](procgen-toolkit/SKILL.md) | "procedural", "dungeon", "map gen", "wfc", "bsp" | BSP / WFC / cellular automata generators. |

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
