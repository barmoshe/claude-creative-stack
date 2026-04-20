# 02 — Claude Skills System

## 2.1 Folder shape

```
my-skill/
├── SKILL.md            # required
├── scripts/            # deterministic code (Python/Bash/JS)
├── references/         # on-demand docs
└── assets/             # templates, fonts, icons
```

## 2.2 SKILL.md frontmatter

```markdown
---
name: my-skill-name              # ≤64 chars, becomes /slash-command id
description: What it does. Use when user asks to [specific trigger phrases].
# Optional:
# dependencies: [...]
# allowed-tools: [...]
# model: claude-sonnet-4-6
---

# My Skill Name
Instructions Claude follows when loaded.
## Usage
## Examples
```

**Progressive disclosure (three levels)**:
1. **Frontmatter (~100 tokens)** — always in system prompt. Name + description drive routing.
2. **Body (<5k tokens, target ~1.5–2k)** — loaded when Claude judges skill relevant.
3. **Linked files** (`scripts/`, `references/`, `assets/`) — loaded on demand.

## 2.3 Official Anthropic skills (`anthropics/skills` on GitHub)

| Skill | Purpose |
|---|---|
| `docx` | Word: tracked changes, redlining, OOXML, TOC, images |
| `pptx` | PowerPoint: template or scratch, HTML→PPTX, speaker notes |
| `xlsx` | Excel: zero `#REF!/#DIV/0!`, charts, pivots, conditional formatting |
| `pdf` | PDF: extract, merge/split, rotate, watermark, forms, encrypt, OCR |
| `frontend-design` | Production UI avoiding "AI slop" look |
| `canvas-design` | PNG/PDF visual designs |
| `algorithmic-art` | p5.js generative art, flow fields, particles |
| `theme-factory` | Custom theme generation |
| `skill-creator` | Authoring guide (frontmatter, body, validation) |
| `mcp-builder` | Scaffolds MCP servers |
| `brand-guidelines` | Anthropic brand tokens |
| `internal-comms` | 3P updates, all-hands, incident reports |
| `doc-coauthoring` | Gather → refine → reader-test |
| `webapp-testing` | Playwright UI verification |
| `web-artifacts-builder` | Interactive artifacts with React+Tailwind+shadcn |
| `claude-api` | API usage helper |
| `slack-gif-creator` | Animated Slack GIFs |

Also bundled in Claude Code: `file-reading`, `pdf-reading`, `product-self-knowledge`.

## 2.4 Authoring best practices

- **Push the description**: Claude undertriggers; write pushy triggers ("Use whenever user mentions X, Y, Z even if not explicitly asked").
- **Third person**: "This skill should be used when…" not "Use this skill when…".
- **Keep SKILL.md lean** (~1.5–2k words). Offload details to `references/`.
- **Bundle scripts** for deterministic/repeated code.
- **Never hardcode secrets**; review downloaded skills (execute arbitrary code).
- **Test** with 8–10 should-trigger + 8–10 should-not-trigger queries, focusing on near-misses.
- **Portability**: the same skill works across Claude.ai, Claude Code, and API unchanged.
- **Body length**: under 500 lines for optimal performance; split overflow into `references/`.

## 2.5 Skill composition and chaining

- **Composition**: Claude auto-loads multiple skills in one session when descriptions match; e.g. `pdf-reading` → `xlsx` → `canvas-design` in one workflow.
- **Chaining pattern**: SKILL.md body can explicitly reference sibling skills ("After extracting, hand off to `frontend-design` for layout").
- **Orchestrator skill** pattern: a wrapper skill invokes `scripts/run.sh` which pipelines other skills' scripts.
- **Install (Claude Code)**:

```
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin add /path/to/local-skill
```

- **API**: upload custom skills to `/v1/skills` endpoints; requires `code-execution` tool.
