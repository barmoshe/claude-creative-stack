# Plan — Claude Creative Stack Repo

> Proposal for your approval. **Nothing is built yet.** Review, edit, or say "go" (or "go with changes").

---

## 1. What this repo is

A drop-in knowledge + scaffolding repo to mount inside a Claude Project so that any conversation in that project is instantly grounded in:

- current Claude ecosystem (models, APIs, Skills, Artifacts, MCP)
- art / animation / asset creation / UX-UI / graphics / design / games / advanced creative workflows
- a small library of ready-to-use prompt scaffolds, Skills, single-file artifact starters, and an MCP server or two

Optimized for: *"Claude, build me a \_\_\_"* that yields good-tasting output on the first try.

---

## 2. Proposed repo name

Recommendation: **`claude-creative-stack`** — matches the knowledge base's own title, google-able, communicates scope without locking us to "games" or "artifacts" alone.

Alternates if you want something punchier: `claude-art-lab`, `claude-maker-kit`, `claude-forge-creative`, `canvas-and-code`.

---

## 3. Research summary — what shapes the design

From the research pass:

- **Claude Projects** support MD, PDF, DOCX, CSV, TXT, HTML, up to 30MB/file, unlimited files, sharing a 200K token context across all project files. Split is better than monolith because retrieval stays cleaner (Anthropic's own guidance + community confirmation).
- **CLAUDE.md** should stay under ~200 lines and can `@import` other markdown files. A `.claude/rules/` convention (split by concern) is popular.
- **Skills** (`anthropics/skills`) use a three-tier progressive disclosure pattern: `SKILL.md` frontmatter (~100 tokens, always loaded) → body (<500 lines) → on-demand `scripts/`, `references/`, `assets/`. SKILL.md frontmatter needs a description with "pushy" triggers.
- **Existing starters** worth learning from: `claude-artifacts-starter` (Vite harness), `claude-artifact-runner` (single-file → deployable React), `Awesome-Claude-Artifacts` (curation), `HermeticOrmus/claude-code-game-development` (game workflows), `Donchitos/Claude-Code-Game-Studios` (agent hierarchy — too heavy for our needs but interesting patterns). None of these cleanly combine reference-grade knowledge + skill folders + artifact starters + MCP configs in one drop-in.
- **MCP** TypeScript SDK (`@modelcontextprotocol/typescript-sdk`) + `create-mcp-server` CLI are the current scaffolding standard. Streamable HTTP is the active transport; SSE is deprecated. Zod for schemas.
- **Artifacts**, critically: constrained to a hard library whitelist, Three.js r128, no `localStorage`, HTML-artifact CDN limited to `cdnjs.cloudflare.com`, `fetch` allow-listed only to `api.anthropic.com/v1/messages`. Starters must respect these or they fail silently in users' hands.

---

## 4. Proposed folder structure

```
claude-creative-stack/
├── README.md                          # What it is, how to install into a Claude Project, how to use skills
├── CLAUDE.md                          # Short routing file: "if user asks about X, read knowledge/0Y-...md"
├── LICENSE                            # MIT
├── .gitignore
├── .mcp.json                          # Example project-level MCP config (filesystem + git + github + memory)
│
├── knowledge/                         # THE knowledge base — split for cleaner retrieval
│   ├── 00-index.md                    # Routing table: "if asking about X → open file Y"
│   ├── 01-claude-ecosystem.md         # Models, pricing, tool use, caching, batch, thinking, MCP
│   ├── 02-skills-system.md            # SKILL.md format, progressive disclosure, chaining, composition
│   ├── 03-artifacts.md                # Artifact types, constraints, window.storage, Claudeception
│   ├── 04-animation.md                # CSS, JS libs (GSAP/Motion/Anime), SVG, Canvas 2D, easing
│   ├── 05-graphics-design.md          # Trends, Tailwind v4, oklch color, typography, SVG, icons
│   ├── 06-games.md                    # Engines, ECS, 2D/3D, juice, procgen, pathfinding, AI, multiplayer
│   ├── 07-audio.md                    # Tone.js, Web Audio, Howler, SFX, procedural music
│   ├── 08-dataviz.md                  # D3, Recharts, Chart.js, Plotly, ECharts, deck.gl
│   ├── 09-prompting.md                # XML tags, few-shot, CoT, caching, long-context, tool-use
│   ├── 10-workflows.md                # Skills+Artifacts+MCP pipelines, critique loops, pipelines
│   └── 99-caveats.md                  # Things Anthropic rotates silently; pinned-version warnings
│
├── prompts/                           # Ready-to-copy prompt scaffolds (just paste into Claude)
│   ├── README.md
│   ├── build-animation.md
│   ├── build-artifact-game.md
│   ├── build-shader.md
│   ├── build-dataviz.md
│   ├── build-landing-hero.md
│   ├── generate-palette.md
│   ├── generate-sprite-sheet.md
│   ├── generate-ui-kit.md
│   ├── critique-and-refine.md         # Claudeception critique template
│   └── persona-voting.md              # Multi-persona review pattern
│
├── skills/                            # Agent Skills — drop into ~/.claude/skills/ or load per project
│   ├── README.md                      # How to install, how they compose
│   ├── artifact-game-builder/         # Scaffolds single-file HTML/React artifact games
│   │   ├── SKILL.md
│   │   ├── references/constraints.md  # Artifact whitelist + Three.js r128 gotchas
│   │   └── assets/boilerplates/
│   ├── animation-composer/            # Picks CSS vs GSAP vs Motion for a given requirement
│   │   ├── SKILL.md
│   │   └── references/decision-tree.md
│   ├── shader-smith/                  # GLSL frag shader authoring; lygia noise/sdf helpers
│   │   ├── SKILL.md
│   │   └── references/glsl-cheatsheet.md
│   ├── palette-generator/             # oklch palettes w/ WCAG check
│   │   ├── SKILL.md
│   │   └── scripts/gen_palette.ts
│   ├── sprite-atlas-builder/          # Canvas-based sprite sheet pack + JSON atlas
│   │   ├── SKILL.md
│   │   └── scripts/pack.ts
│   ├── ui-design-kit/                 # Bento, glassmorphism, neo-brutalism, editorial snippets
│   │   ├── SKILL.md
│   │   └── assets/snippets/
│   └── procgen-toolkit/               # BSP dungeons, cellular caves, WFC, L-systems
│       ├── SKILL.md
│       └── references/recipes.md
│
├── artifacts/                         # Canonical single-file starters (openable in browser)
│   ├── README.md
│   ├── html/
│   │   ├── three-r128-scene.html      # Three.js r128 scene w/ OrbitControls polyfill note
│   │   ├── phaser3-platformer.html    # Phaser 4 w/ coyote + jump buffer
│   │   ├── shader-playground.html     # Fragment shader live editor
│   │   ├── gsap-scroll-story.html     # GSAP ScrollTrigger hero
│   │   ├── procgen-dungeon.html       # BSP dungeon on canvas
│   │   ├── kaplay-top-down.html       # Kaplay 2D starter
│   │   └── tone-procmusic.html        # Tone.js procedural melody
│   └── react/
│       ├── dataviz-dashboard.jsx      # Recharts + window.storage persistence
│       ├── kinetic-typography.jsx     # Motion v12 + variable fonts
│       ├── bento-grid-landing.jsx     # Tailwind bento layout
│       ├── game-ecs-starter.jsx       # Minimal POJO ECS
│       └── claudeception-critic.jsx   # Artifact that calls api.anthropic.com to self-critique
│
├── mcp/                               # MCP servers + configs
│   ├── README.md
│   ├── configs/
│   │   ├── creative-stack.mcp.json    # filesystem + git + github + memory + brave-search
│   │   └── README.md
│   └── servers/
│       └── palette-oklch/             # Small TS MCP server: generate accessible palettes
│           ├── package.json
│           ├── src/index.ts
│           └── README.md
│
├── recipes/                           # End-to-end narratives tying everything together
│   ├── recipe-game-jam.md             # Prompt → skill → artifact → MCP publish to GitHub
│   ├── recipe-animated-landing.md
│   ├── recipe-data-story.md
│   └── recipe-design-system.md
│
├── playground/                        # Optional Vite+React+TS harness for dev-mode iteration
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── README.md
│   └── src/
│       ├── App.tsx
│       └── examples/                  # Imports artifacts into a real dev env
│
└── .github/
    └── workflows/
        └── validate.yml               # Lint SKILL.md frontmatter, markdown-lint
```

---

## 5. Starter-format decision (I chose after research)

Your answer: "you decide after research." Based on the research, I'm recommending a **three-layer starter strategy**:

1. **`prompts/`** — plain-text scaffolds. Fastest value; zero friction. Works in any Claude surface (web, Code, API).
2. **`skills/`** — agent Skills using the official `SKILL.md` format. Progressive disclosure, auto-triggered when descriptions match. Works in Claude Code + Claude.ai paid plans.
3. **`artifacts/`** — single-file HTML/JSX starters that respect the real artifact environment (r128 Three.js, no arbitrary fetch, no localStorage, no Framer Motion). Openable in a browser *or* paste-able into a Claude chat. These are "reference implementations" Claude can read when scaffolding new work.
4. **`mcp/`** — a usable `.mcp.json` + one real TS MCP server as proof-of-concept.
5. **`playground/`** (optional, gated behind its own README) — Vite + React + TS for team members who want a real dev harness. Clearly marked as optional because it adds maintenance.

Rationale: the repo needs to serve both the "talking to Claude inside a Project" case (prompts + knowledge + skills) and the "handing Claude a known-good scaffold to mutate" case (artifacts + playground). MCP is the side-effects layer for both.

---

## 6. Language decision

- **Knowledge / prompts / skills** → Markdown (no build, Claude-native).
- **Artifacts** → **Plain JS / JSX** (required — artifacts don't compile TS; they run directly in Claude's sandbox).
- **MCP servers + playground** → **TypeScript** (ergonomic, matches modern MCP SDK, Zod schemas).
- **Skill scripts** → TypeScript where it makes sense, Bash for glue.

Net: TS everywhere it buys something; plain JS where the runtime enforces it.

---

## 7. Deliverables checklist (what "done" looks like for v0.1)

- [ ] Root README + CLAUDE.md + LICENSE + .gitignore
- [ ] `knowledge/` — 11 split markdown files derived from your uploaded knowledge base, retaining all facts but re-chunked with tight headings + a 00-index routing file
- [ ] `prompts/` — 10 prompt scaffolds listed above
- [ ] `skills/` — 7 skills with SKILL.md + ≥1 reference/asset each
- [ ] `artifacts/` — 7 HTML + 5 React starters, tested to load in a browser
- [ ] `mcp/configs/creative-stack.mcp.json` — drop-in MCP config
- [ ] `mcp/servers/palette-oklch/` — working TS MCP server w/ stdio transport
- [ ] `recipes/` — 4 end-to-end workflows
- [ ] `playground/` — Vite + React + TS shell with 2-3 example pages (can be deferred to v0.2 if you'd rather)
- [ ] `.github/workflows/validate.yml` — minimal lint pass

---

## 8. Tradeoffs & decisions surfaced

**Chunked knowledge vs monolith.** Chunked wins on retrieval clarity and CLAUDE.md `@import` patterns, but you lose the one-file grep appeal of the original. Mitigation: keep `knowledge/99-full-source.md` as the untouched original for occasional one-shot reads.

**Skills as plain folders vs plugin marketplace.** Plain folders are simplest, portable, and work in every Claude surface today. Plugin marketplace (`/plugin marketplace add user/repo`) is nice but adds a manifest layer. Recommendation: **ship plain folders now, add marketplace manifest in v0.2** if you use it often.

**Playground size.** A real Vite project adds node_modules churn, Dependabot noise, and "does this actually run" maintenance. I'm including it but clearly marked optional, with a minimum of 2-3 examples so it's not abandoned-feeling.

**Silent version drift.** Anthropic rotates artifact-pinned versions (lucide-react, `claude-sonnet-4-20250514` model ID) without notice. `knowledge/99-caveats.md` calls this out explicitly so starters don't confidently hardcode stale values. MCP server + playground will pin via lockfile.

**Scope creep risk.** You listed "art, animation, asset creation, UX-UI, graphics, design, games, advanced." All eight fit inside the proposed tree without inflating it: art/assets live across `skills/sprite-atlas-builder` + `skills/palette-generator` + prompts, UX-UI lives in `skills/ui-design-kit` + `artifacts/react/bento-grid-landing`. Equal weight by default; I'll happily rebalance if you want games-heavier.

**License.** MIT is the usual fit for "me + small team but potentially shareable." Say the word and I'll switch to Apache-2.0 or keep it private-only (no LICENSE file).

**GitHub creation.** I can either (a) prepare the full tree in your workspace and hand you a `git init && push` one-liner, or (b) use the GitHub MCP (if connected) to create the repo directly. Not connected right now, so default plan is (a) unless you say otherwise.

---

## 9. What I need from you to start building

Say *"go"* if this looks right as-is, or reply with any of:

1. Rename it to `___`.
2. Change license to `___` / private / no license.
3. Drop `___` (e.g., "skip playground", "skip MCP server", "skip recipes").
4. Rebalance scope (e.g., "games-heavier", "no games, more motion graphics").
5. Private repo vs public.
6. Any specific library or engine to add/remove in the starters (e.g., "add Babylon.js", "no Phaser, Kaplay only").
7. Any starters you want first so I can sequence delivery (e.g., "artifacts + skills first, knowledge/ last").

Once you approve, I'll build it incrementally — knowledge + CLAUDE.md first, then skills, then artifacts, then MCP, then playground, with a review checkpoint after each major folder.
