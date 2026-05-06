# 10 — Advanced Creative Workflows

## 10.1 Skills + Artifacts + MCP pipelines

A creative pipeline normally assembles three layers:
1. **Skills** — deterministic scaffolding (python-docx, python-pptx, p5.js template).
2. **Artifacts** — interactive live preview (React + Tailwind + shadcn).
3. **MCP** — real-world integration (Drive to save, Slack to publish, GitHub to commit, Asana to track).

**Observe → Plan → Build.** Before any non-trivial creative or refactor task on an existing codebase, run `/graphify .` to materialise a knowledge graph (`graphify-out/graph.html` + `GRAPH_REPORT.md` + `graph.json`). The god-node list and the auto-generated "suggested questions" become the briefing for the Skill → Artifact → MCP pipeline above. See `recipes/codebase-knowledge-graph.md` and `skills/graphify/SKILL.md`.

Example: generate a pitch deck.
- `skill-creator` or `pptx` skill scaffolds the `.pptx`.
- `frontend-design` skill applies non-generic layout rules.
- Artifact renders a live preview with shadcn components + persists via `window.storage`.
- MCP uploads final `.pptx` to Google Drive and posts a Slack summary.

## 10.2 Claudeception — recursive Claude calls inside artifacts

```jsx
async function suggestNext(state){
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1000,
      messages:[{ role:"user", content: `Project state:\n${JSON.stringify(state)}\nSuggest 3 next steps.` }]
    })
  });
  const d = await r.json();
  return d.content[0].text;
}
```

Critique loop: artifact generates → calls API "review and improve" → displays diff → user approves → `window.storage.set` commits.

## 10.3 Asset generation pipelines

- **Sprite sheets**: artifact draws frames to an offscreen canvas → API describes per-frame variations → composite into atlas → persist as base64 in `window.storage` (respect 20 MB cap).
- **Music / SFX on demand**: API returns params (BPM, scale, instrument choice, effects chain) → Tone.js synthesizes live. ZzFX for one-shots.
- **Progressive document generation**: artifact collects inputs → sections generated via API → MCP saves to Drive/Asana → `window.storage` caches progress for resume.

## 10.4 Iterative refinement patterns

- **Critique loop**: generate → self-review → approve/reject → commit.
- **Persona voting**: multiple sequential API calls with different system prompts ("as a security reviewer", "as a UX lead", "as a skeptic") → merge.
- **Human-in-the-loop checkpoints**: `window.storage`-based resume tokens for long multi-step workflows.
- **Multi-step creation**: Skills for determinism, Claude for creativity, MCP for side-effects, Artifact for live preview — compose all four.
