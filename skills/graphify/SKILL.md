---
name: graphify
description: Build and query a codebase knowledge graph with graphify (https://github.com/safishamsi/graphify). Use when the user wants to map a repo, find god nodes, trace what connects two files or modules, surface design rationale buried in comments, or audit cross-file surprises before a refactor. Wraps the graphify CLI and MCP server, reads the auto-generated GRAPH_REPORT.md, and answers structural questions by citing nodes and edge confidence (EXTRACTED / INFERRED / AMBIGUOUS). Do NOT use for plain code search, single-file edits, or runtime call traces — use Grep, Edit, or a profiler instead.
license: MIT
---

# Graphify

Turn a folder into a queryable knowledge graph, then answer the user's question
by citing the graph — not by grepping.

## When to trigger

Clear triggers:

- "Map this repo / give me a tour."
- "What connects X to Y?"
- "Where are the god nodes / hottest files?"
- "Find the surprising cross-file connections."
- "Show me design rationale hidden in comments."
- "Before we refactor, where are the load-bearing edges?"

Not this skill:

- Plain text search → use `Grep` / `rg`.
- Single-file reads → use `Read`.
- Static call graphs in a single language → use a language-specific tool
  (e.g. `pyan3`, `ts-morph`, `clangd`).
- Runtime traces / flame graphs → use a profiler.

## Core recipe

1. **Confirm install.** Run `graphify --version`. If missing:

   ```bash
   uv tool install graphifyy
   graphify install
   ```

   `graphify install` registers the MCP server and slash commands with the
   user's IDE assistant (Claude Code, Cursor, etc.).

2. **Build the graph.** From the repo root:

   ```bash
   graphify .
   ```

   Or via slash command in Claude Code: `/graphify .`. Outputs land in
   `graphify-out/`:

   - `graph.html` — interactive browser visualisation (clickable nodes,
     filter, search).
   - `GRAPH_REPORT.md` — god nodes, surprising connections, suggested
     questions.
   - `graph.json` — full structured graph for tools.

3. **Read `GRAPH_REPORT.md` first.** It is the briefing. Surface the top
   god nodes, any flagged surprises, and the "suggested questions" block to
   the user before answering — they often re-frame the original ask.

4. **Answer by querying the graph**, not by re-reading files:

   ```bash
   graphify query "what connects auth to database?"
   graphify path "UserService" "DatabasePool"
   ```

   In Claude Code: `/graphify query "..."`, `/graphify path "A" "B"`.

5. **Cite nodes and confidence** in the response. Every claim points to a
   node name and an edge tag — `EXTRACTED` (parsed from code),
   `INFERRED` (heuristic), or `AMBIGUOUS` (flagged for review). AMBIGUOUS
   edges are stated as such, not papered over.

6. **Tell the user where the visual is** — `graphify-out/graph.html`. They
   open it locally; the graph is not an artifact.

## MCP mode (preferred when registered)

If `graphify` appears in `claude mcp list`, prefer the MCP tools to shelling
out — results come back structured and don't pollute the conversation with
raw CLI output. The MCP config template lives at
`mcp/configs/creative-stack.mcp.json`:

```json
"graphify": {
  "command": "graphify",
  "args": ["mcp"]
}
```

## Auto-rebuild on commit

For repos under active development, suggest:

```bash
graphify hook install
```

This drops a git hook that rebuilds `graphify-out/` after each commit so the
graph stays in sync. The hook is opt-in per repo.

## Output checklist

- [ ] `graphify-out/GRAPH_REPORT.md` was read before answering.
- [ ] Every structural claim cites at least one node from the graph.
- [ ] AMBIGUOUS edges are flagged, not silently promoted.
- [ ] User is told `graphify-out/graph.html` is the visual.
- [ ] If the repo is mutating, `graphify hook install` was offered once.

## Further reading

- `recipes/codebase-knowledge-graph.md` — full walkthrough on this repo.
- `knowledge/10-workflows.md` — where graphify sits in the Observe → Plan
  → Build loop.
- Upstream: <https://github.com/safishamsi/graphify>.
