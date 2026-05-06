# Recipe — Map a codebase before you change it

**Goal:** before any non-trivial creative or refactor work on an existing
repo, produce a queryable knowledge graph and use it as the briefing for
the Skill → Artifact → MCP loop.

The tool: [`graphify`](https://github.com/safishamsi/graphify) — a Python
CLI + MCP server that turns any folder of code, docs, SQL, scripts, PDFs,
images, audio, and video into nodes/edges.

## Session 1 — Install and build (10 min)

```bash
uv tool install graphifyy
graphify install        # registers the MCP server + slash commands
```

From the repo root (this very repo works as a fixture):

```bash
graphify .
```

Outputs land in `graphify-out/`:

- `graph.html` — interactive visual; open it in a browser.
- `GRAPH_REPORT.md` — the briefing document.
- `graph.json` — full graph for tools.

In Claude Code the equivalent is `/graphify .`.

## Session 2 — Read the briefing (15 min)

Open `GRAPH_REPORT.md` first. The interesting blocks:

- **God nodes** — most-connected concepts. On `claude-creative-stack` you
  should expect `CLAUDE.md`, `knowledge/00-index.md`, and
  `claude-plugin.marketplace.json` near the top. If a file you didn't know
  about is in this list, that is the finding.
- **Surprising connections** — cross-file edges the report flags as
  unexpected. Skim them; each one is either a real coupling worth
  documenting or a false positive worth noting in a comment.
- **Suggested questions** — graphify proposes the queries it thinks the
  graph can answer well. Use them as a starting menu.

Hand the briefing to the user before doing anything else. It frequently
re-frames the original ask.

## Session 3 — Query, don't grep (30 min)

Three queries that demonstrate value on this repo:

```bash
graphify query "what connects skills/ to artifacts/?"
graphify path "palette-generator" "mcp/servers/palette-oklch"
graphify query "where is design rationale stored in this repo?"
```

In Claude Code: `/graphify query "..."`, `/graphify path "A" "B"`. If
the graphify MCP server is registered (see
`mcp/configs/creative-stack.mcp.json`), Claude calls it directly and you
get structured tool calls instead of CLI text.

When citing back to the user, always include the **node name** and the
**edge confidence** — `EXTRACTED`, `INFERRED`, or `AMBIGUOUS`. AMBIGUOUS
edges get flagged as such, never silently promoted.

## Session 4 — Wire the auto-rebuild hook (5 min)

For repos under active development:

```bash
graphify hook install
```

The hook rebuilds `graphify-out/` after each commit so the graph stays in
sync. Opt-in per repo. Commit `graphify-out/` if your team wants the graph
in code review; `.gitignore` it if you don't.

## Session 5 — Hand off to the existing pipeline

Graphify is the **observe** layer. Once the graph exists, the
`claude-creative-stack` three-layer pipeline takes over:

- **Skill** — pick the skill that matches the next move
  (`critique-loop` for an architectural review, `animation-composer` for a
  landing rebuild, etc.). The graph's god-node list tells you which files
  the skill must respect.
- **Artifact** — build the demo or fix in a single-file artifact under
  `artifacts/`. The graph's surprising-connections list tells you which
  cross-file edges your change is allowed to touch.
- **MCP** — wire side-effects (palettes, sprites, assets) via the MCP
  servers in `mcp/configs/creative-stack.mcp.json`.

## What earned its keep

- The god-node list catches "this file is load-bearing and you didn't know
  it" before the first edit.
- Edge confidence (`EXTRACTED` / `INFERRED` / `AMBIGUOUS`) keeps Claude's
  structural claims honest — no more "I think this connects to X."
- The auto-rebuild hook means the graph never drifts from reality, which
  is the failure mode that kills every static doc.
- It plugs into the existing routing in `CLAUDE.md` — Claude knows when
  to suggest `/graphify .` instead of grepping.
