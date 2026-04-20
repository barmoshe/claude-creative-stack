# claude-creative-stack

Drop-in reference + scaffolding for building **art, animation, asset creation, UX/UI, graphics, design, games, and advanced creative workflows** with Claude (Artifacts, Skills, MCP, API).

Designed to be mounted into a [Claude Project](https://support.claude.com/en/articles/9517075-what-are-projects) so that any conversation in that project is grounded in up-to-date Claude ecosystem facts and has ready-made scaffolds to work against.

---

## What's in here

| Folder | Purpose |
|---|---|
| `knowledge/` | Re-chunked reference — Claude ecosystem, skills, artifacts, animation, graphics, games, audio, dataviz, prompting, workflows, caveats. Load these into Claude Project knowledge. |
| `prompts/` | Ready-to-paste prompt scaffolds for common creative tasks. |
| `skills/` | Agent Skills (`SKILL.md` format) for artifact-game-builder, animation-composer, shader-smith, palette-generator, sprite-atlas-builder, ui-design-kit, procgen-toolkit. Drop into `~/.claude/skills/` or load per-project. |
| `artifacts/` | Canonical single-file starters (HTML + React/JSX) that respect the real artifact sandbox — r128 Three.js, no arbitrary fetch, no localStorage. |
| `mcp/` | A drop-in `.mcp.json` and a working TypeScript MCP server (`palette-oklch`). |
| `recipes/` | End-to-end workflow narratives tying skills + prompts + artifacts + MCP together. |
| `playground/` | *(Optional)* Vite + React + TS harness for iterating outside the artifact sandbox. |

---

## How to install into a Claude Project

1. Create a new Claude Project (`claude.ai` → New Project).
2. **Paste** the contents of `CLAUDE.md` into the project's **Custom Instructions** field.
3. **Upload** every file in `knowledge/` to the project's knowledge base. (Markdown, ≤30MB each, up to the project's 200k-token context.)
4. Optionally upload any file from `prompts/` or `recipes/` you want Claude to reference directly.
5. Start a new chat in the project. Claude now has the full reference plus routing instructions.

## How to use the skills

- **Claude Code:** copy a skill folder into `~/.claude/skills/<skill-name>/` or run `/plugin add /path/to/claude-creative-stack/skills/<skill-name>` from the repo root.
- **Claude.ai (Pro/Max/Team/Enterprise):** upload skills via the Skills panel.
- **API:** upload to `/v1/skills` (requires `code-execution` tool).

See [`skills/README.md`](skills/README.md) for details.

## How to use the artifacts

- **Preview locally:** open any `artifacts/html/*.html` file directly in a browser. No build step.
- **React artifacts:** they're `.jsx` files written against the artifact runtime's library whitelist. Paste into a Claude chat as a new artifact, or import into `playground/` to iterate.
- **Remember the sandbox rules:** `artifacts/README.md` lists the real constraints (Three.js r128, allow-listed fetch, no `localStorage`, etc.).

## How to use the MCP server

```bash
cd mcp/servers/palette-oklch
npm install
npm run build
```

Then add to your `~/.claude.json` or project `.mcp.json` (see `mcp/configs/creative-stack.mcp.json` for a template).

---

## Versioning

Targets **Claude ecosystem as of April 2026** (Opus 4.7, Sonnet 4.6, Haiku 4.5). Anthropic rotates pinned values (artifact library versions, artifact-embedded model IDs) silently — see [`knowledge/99-caveats.md`](knowledge/99-caveats.md).

## Related work (install these alongside)

This repo intentionally **does not duplicate** prior art. Install these alongside for deeper coverage:

- **[anthropics/skills](https://github.com/anthropics/skills)** — official Anthropic skills (`docx`, `pptx`, `xlsx`, `pdf`, `algorithmic-art`, `canvas-design`, `frontend-design`, `web-artifacts-builder`, `theme-factory`, `skill-creator`, `mcp-builder`, `slack-gif-creator`, `brand-guidelines`). Load first; treat as the canonical layer.
- **[greensock/gsap-skills](https://github.com/greensock/gsap-skills)** — official GSAP skills for AI agents. Our `animation-composer` skill references it rather than duplicating.
- **[freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills)** — maintained 3D/animation skills marketplace for Claude Code (Three.js, R3F, Babylon.js, A-Frame, PlayCanvas, PixiJS, Motion, React Spring, Magic UI, Lottie, Anime.js, Rive, Blender, Spline). Install for deep 3D/animation work.
- **[HermeticOrmus/claude-code-game-development](https://github.com/HermeticOrmus/claude-code-game-development)** — game dev patterns and workflows.
- **[awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)** / **[awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)** — curated discovery lists.
- **Plugin registries:** [buildwithclaude.com](https://buildwithclaude.com), [claudemarketplaces.com](https://claudemarketplaces.com), [claudepluginhub.com](https://www.claudepluginhub.com).

### What this repo adds on top

| Others | This repo |
|---|---|
| Claude Code-first skills marketplaces | **Claude Project-first** (web app + API), with `knowledge/` as the primary deliverable |
| Skills only | Knowledge + prompts + skills + single-file artifacts + MCP + recipes, unified |
| Configs and docs | A **real working MCP server** (`palette-oklch`) you can `npm install && run` |
| Silent on version drift | `knowledge/99-caveats.md` calls out Anthropic-rotating values explicitly |
| Animation/3D only | Full scope: art, animation, UX/UI, graphics, games, audio, dataviz, prompting, workflows |

## License

MIT — see [`LICENSE`](LICENSE).

## Contributing

Small team / friendly. Open an issue with a starter idea or a PR with a new skill; follow the `SKILL.md` format documented in [`knowledge/02-skills-system.md`](knowledge/02-skills-system.md).
