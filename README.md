# claude-creative-stack

Scaffolding + reference pack for building **art, animation, graphics, UX/UI, games, audio, and dataviz** with Claude-native tooling — Artifacts, Skills, MCP, and the API.

Designed to be mounted into a [Claude Project](https://support.claude.com/en/articles/9517075-what-are-projects) so every conversation is grounded in the same facts, follows the same defaults, and has ready-made scaffolds to build against.

> Targets the Claude ecosystem as of **April 2026** — Opus 4.7, Sonnet 4.6, Haiku 4.5. See [`knowledge/99-caveats.md`](knowledge/99-caveats.md) for values Anthropic rotates silently.

---

## What's inside

```
knowledge/         11 re-chunked reference docs + index (the Project knowledge payload)
skills/             7 Agent Skills in SKILL.md format
artifacts/         12 single-file starters (7 HTML, 5 React/JSX)
prompts/           10 ready-to-paste prompt scaffolds
recipes/            4 end-to-end workflow narratives
mcp/                1 working TypeScript MCP server + drop-in .mcp.json
playground/        optional Vite + React + TS harness for off-sandbox iteration
react-rive-pacman/ Vite + React + Rive port of the "Photo Maze" PR-campaign game
CLAUDE.md          routing rules + defaults (loaded into Project custom instructions)
```

### knowledge/ — the reference layer

| File | Covers |
|---|---|
| [`01-claude-ecosystem.md`](knowledge/01-claude-ecosystem.md) | Models, pricing, tool use, caching, batch, thinking, MCP basics |
| [`02-skills-system.md`](knowledge/02-skills-system.md) | Writing and evaluating a Skill |
| [`03-artifacts.md`](knowledge/03-artifacts.md) | Artifact sandbox constraints — read before building in-artifact |
| [`04-animation.md`](knowledge/04-animation.md) | CSS, GSAP, Motion, Anime, SVG, Canvas, easing |
| [`05-graphics-design.md`](knowledge/05-graphics-design.md) | Design, typography, color, icons, Tailwind |
| [`06-games.md`](knowledge/06-games.md) | Engines, ECS, 2D/3D, juice, procgen, pathfinding, AI, netcode |
| [`07-audio.md`](knowledge/07-audio.md) | Tone.js, Web Audio, Howler, SFX, procedural music |
| [`08-dataviz.md`](knowledge/08-dataviz.md) | Dataviz patterns and libraries |
| [`09-prompting.md`](knowledge/09-prompting.md) | XML, few-shot, CoT, caching strategy, long-context |
| [`10-workflows.md`](knowledge/10-workflows.md) | Skills + Artifacts + MCP together, critique loops, Claudeception |
| [`99-caveats.md`](knowledge/99-caveats.md) | Values Anthropic silently rotates — check before hardcoding |

### skills/ — 7 Agent Skills

[`artifact-game-builder`](skills/artifact-game-builder/SKILL.md) · [`animation-composer`](skills/animation-composer/SKILL.md) · [`shader-smith`](skills/shader-smith/SKILL.md) · [`palette-generator`](skills/palette-generator/SKILL.md) · [`sprite-atlas-builder`](skills/sprite-atlas-builder/SKILL.md) · [`ui-design-kit`](skills/ui-design-kit/SKILL.md) · [`procgen-toolkit`](skills/procgen-toolkit/SKILL.md)

### artifacts/ — sandbox-correct starters

HTML: Three.js (r128), GSAP scroll story, Kaplay, Phaser 4, shader playground, procgen dungeon, Tone.js procedural music.
React: bento-grid landing, kinetic typography, dataviz dashboard, ECS game starter, Claudeception critic loop.

All respect the real artifact constraints: composite-only CSS, `window.storage` (not `localStorage`), allow-listed fetch, Three.js **r128 only**, no `CapsuleGeometry`, no `OrbitControls` from addons. See [`artifacts/README.md`](artifacts/README.md).

### mcp/ — working server

[`palette-oklch`](mcp/servers/palette-oklch) is a real TypeScript MCP server (not a placeholder) for generating WCAG-checked oklch color palettes. See [`mcp/configs/creative-stack.mcp.json`](mcp/configs/creative-stack.mcp.json) for the drop-in client config.

---

## Install

### Into a Claude Project (primary use case)

1. Create a new Claude Project at [claude.ai](https://claude.ai).
2. Paste [`CLAUDE.md`](CLAUDE.md) into the project's **Custom Instructions** field.
3. Upload every file in [`knowledge/`](knowledge/) to the project's knowledge base.
4. *(Optional)* Upload any [`prompts/`](prompts/) or [`recipes/`](recipes/) files you want Claude to reference directly.
5. Start a new chat — Claude now has the full reference plus routing rules.

### Skills

- **Claude Code** — copy a skill folder into `~/.claude/skills/<skill-name>/`, or `/plugin add /path/to/claude-creative-stack/skills/<skill-name>`.
- **Claude.ai (Pro/Max/Team/Enterprise)** — upload via the Skills panel.
- **API** — upload to `/v1/skills` (requires `code-execution` tool).

### MCP server

```bash
cd mcp/servers/palette-oklch
npm install && npm run build
```

Then add it to `~/.claude.json` or a project `.mcp.json` using the template at [`mcp/configs/creative-stack.mcp.json`](mcp/configs/creative-stack.mcp.json).

### Artifacts

Open any [`artifacts/html/*.html`](artifacts/html/) directly in a browser — no build step. React starters are `.jsx` written against the artifact runtime's library whitelist; paste into a Claude chat, or import into [`playground/`](playground/) to iterate outside the sandbox.

---

## Defaults (enforced via `CLAUDE.md`)

- Composite-only CSS props for animation (`transform`, `opacity`, `filter`) — never animate layout-triggering properties.
- `oklch()` over hex/hsl; check WCAG contrast on paired text/background.
- Three.js **r128** inside artifacts; no `CapsuleGeometry`; no `OrbitControls` from the addons path.
- `window.storage`, not `localStorage`. Fetch only `api.anthropic.com/v1/messages` (key-less, billed to viewer).
- Three-layer pipeline when shipping: **Skill** (determinism) → **Artifact** (live preview) → **MCP** (side-effects).

---

## Related work (install alongside)

This repo does **not** duplicate prior art. For deeper coverage, install in parallel:

- [anthropics/skills](https://github.com/anthropics/skills) — official skills (`docx`, `pptx`, `xlsx`, `pdf`, `algorithmic-art`, `canvas-design`, `frontend-design`, `web-artifacts-builder`, `theme-factory`, `skill-creator`, `mcp-builder`, `slack-gif-creator`, `brand-guidelines`).
- [greensock/gsap-skills](https://github.com/greensock/gsap-skills) — official GSAP skills for agents.
- [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) — maintained 3D/animation skills marketplace (Three.js, R3F, Babylon, A-Frame, PlayCanvas, Pixi, Motion, React Spring, Magic UI, Lottie, Anime, Rive, Blender, Spline).
- [HermeticOrmus/claude-code-game-development](https://github.com/HermeticOrmus/claude-code-game-development) — game-dev patterns.
- [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) / [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) — discovery lists.
- Plugin registries: [buildwithclaude.com](https://buildwithclaude.com) · [claudemarketplaces.com](https://claudemarketplaces.com) · [claudepluginhub.com](https://www.claudepluginhub.com).

#### One-shot install via Claude Code plugin marketplaces

```sh
# Add the four marketplaces
claude plugin marketplace add anthropics/skills
claude plugin marketplace add greensock/gsap-skills
claude plugin marketplace add freshtechbro/claudedesignskills
claude plugin marketplace add HermeticOrmus/claude-code-game-development

# Core skills
claude plugin install example-skills@anthropic-agent-skills
claude plugin install claude-api@anthropic-agent-skills
claude plugin install gsap-skills@gsap-skills
claude plugin install game-development@claude-code-workflows

# Design-stack skills (3D, motion, scroll, components)
for p in threejs-webgl react-three-fiber pixijs-2d animejs motion-framer \
         lottie-animations rive-interactive gsap-scrolltrigger react-spring-physics \
         babylonjs-engine playcanvas-engine aframe-webxr spline-interactive \
         blender-web-pipeline modern-web-design lightweight-3d-effects \
         scroll-reveal-libraries locomotive-scroll barba-js \
         animated-component-libraries animation-components authoring-motion \
         core-3d-animation extended-3d-scroll web3d-integration-patterns \
         substance-3d-texturing meta-skills; do
  claude plugin install "$p@claude-design-skillstack"
done
```

Browse with `claude plugin list --available --json`; remove with `claude plugin uninstall <name>`.

### What this repo adds

| Others | This repo |
|---|---|
| Claude Code-first | **Claude Project-first** — `knowledge/` is the primary deliverable |
| Skills only | Knowledge + prompts + skills + artifacts + MCP + recipes, unified |
| Configs and docs | A **real** working MCP server you can `npm install && run` |
| Silent on version drift | [`knowledge/99-caveats.md`](knowledge/99-caveats.md) calls it out explicitly |
| Animation/3D only | Full creative scope: art, animation, UX/UI, graphics, games, audio, dataviz |

---

## License & contributing

MIT — see [`LICENSE`](LICENSE).

PRs welcome. New skills should follow the `SKILL.md` format documented in [`knowledge/02-skills-system.md`](knowledge/02-skills-system.md). Starter ideas → open an issue.
