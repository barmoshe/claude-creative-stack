# R7 — Repo Architecture Fit

> Status: draft
> Owner: Wave-4 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

The system fits the repo's three-layer canon — Skill × MCP × Artifact —
documented in [`knowledge/10-workflows.md` §10.1](../../knowledge/10-workflows.md).
One Skill (`skills/keyword-extractor-voiceover/`) modelled on
[`skills/viral-news-scanner/SKILL.md`](../../skills/viral-news-scanner/SKILL.md)
holds prompt, schema, segmenter, treatment classifier, and Remotion templates.
One new MCP (`mcp/servers/voiceover-router/`) modelled on
[`mcp/servers/asset-router/README.md`](../../mcp/servers/asset-router/README.md)
wraps Whisper, stock-API search/download, generative fallback, SigLIP-2,
saliency. An optional second MCP (`mcp/servers/graphics-renderer/`) wraps
Remotion CLI and is **deferred to phase 2**. One React artifact
(`artifacts/react/voiceover-timeline.jsx`) gives the timeline preview; one
recipe (`recipes/voiceover-to-broll.md`) stitches them; one prompt scaffold
(`prompts/voiceover-extractor-prompt.md`). Soft pick (not a lock): single
voiceover-router MCP for MVP; graphics-renderer split in phase 2. R9 picks.

## Scope & questions

How does the project map onto the existing `skills/` × `mcp/servers/` ×
`artifacts/` × `recipes/` × `prompts/` layout? Which layer owns which artifact
from R0–R6? What's the MVP cut vs the phase-2 cut? What artifact-sandbox
constraints apply to the live preview? How does the new MCP register?
Per [`HANDOFF.md` §2](./HANDOFF.md), R7 enumerates options; R9 picks.

## Findings

### Layer mapping (Skill, MCP × 2, Artifact, Recipe, Templates, Prompt)

- **Skill** — deterministic logic. SKILL.md frontmatter + body following
  [`knowledge/02-skills-system.md` §2.1–2.4](../../knowledge/02-skills-system.md)
  and the long-form pattern in
  [`skills/viral-news-scanner/SKILL.md`](../../skills/viral-news-scanner/SKILL.md).
  Owns: the single-pass extractor prompt
  ([R3](./03-prompt-design-and-caching.md)), scene+keyword schema validators
  ([R2](./02-scene-and-keyword-schema.md)), scene-segmenter wrapper,
  `visual_treatment` classifier
  ([R0c](./00c-scene-types-and-graphic-templates.md)), and an evaluation
  harness over a held-out HE clip set.
- **MCP — voiceover-router** — every side-effect call. Mirrors the tool
  surface shape of
  [`mcp/servers/asset-router/README.md`](../../mcp/servers/asset-router/README.md):
  one server, multiple tools, deterministic stub fallback when keys are
  missing. Tools:
  `transcribe(audio, lang)` — cloud `gpt-4o-mini-transcribe` or local
  `faster-whisper` + `ivrit-ai/whisper-large-v3-turbo-ct2` per
  [R1](./01-whisper-variant-comparison.md);
  `search_clips(query, source)` — Pexels/Pixabay/Storyblocks per
  [R4](./04-background-video-sourcing.md);
  `download_clip(url)`; `generate_clip(prompt, duration_s)` — Ray2/Gen-3
  fallback; `embed_clip(clip_id)` — SigLIP-2 cache per
  [R5](./05-matching-algorithm.md);
  `saliency_pass(clip)` — MediaPipe/U²-Net for `crop_safety`.
- **MCP — graphics-renderer** (proposed, phase 2) — wraps Remotion CLI per
  [R6](./06-output-edl-and-renderer.md): `render_scene(template, props,
  duration_s) → mp4`, `render_edl(edl) → final_mp4`. **Tradeoff**: a separate
  server keeps Node/Remotion deps isolated from voiceover-router's
  Python/ML deps, matching the one-server-per-concern shape across
  `mcp/servers/{palette-oklch,sprite-packer,asset-router}`. Folding into
  voiceover-router is one fewer registration but creates a multi-runtime
  dep tree. Soft recommendation: keep separate; defer build to phase 2.
- **Artifact** — `artifacts/react/voiceover-timeline.jsx`, sibling of
  [`artifacts/react/dataviz-dashboard.jsx`](../../artifacts/react/dataviz-dashboard.jsx)
  and [`artifacts/react/claudeception-critic.jsx`](../../artifacts/react/claudeception-critic.jsx).
  Renders waveform + transcript + scene chips on a timeline, broll
  thumbnails, and Remotion templates client-side (Remotion is React+DOM —
  sandbox-compatible; see constraints below).
- **Recipe** — `recipes/voiceover-to-broll.md`, mirroring
  [`recipes/agentic-asset-pipeline.md`](../../recipes/agentic-asset-pipeline.md):
  one paste-ready prompt that drives Skill+MCP+artifact end-to-end on a real
  HE weather clip, with stub fallback for CI.
- **Templates** — `skills/keyword-extractor-voiceover/templates/*.tsx` —
  six Remotion templates per [R0c](./00c-scene-types-and-graphic-templates.md)
  (`graphic_table`, `weather_map`, `lower_third`, `quote_card`,
  `bullet_list`, `headline_card`). Lives inside the Skill so progressive
  disclosure (`assets/` / `references/` per
  [`knowledge/02-skills-system.md` §2.1](../../knowledge/02-skills-system.md))
  pulls them only when needed.
- **Prompt** — `prompts/voiceover-extractor-prompt.md`, sibling of
  [`prompts/build-dataviz.md`](../../prompts/build-dataviz.md), with the
  1h-TTL cache breakpoints from [R3](./03-prompt-design-and-caching.md)
  documented inline.

### Concrete file paths

```
skills/keyword-extractor-voiceover/
├── SKILL.md
├── references/{schema.md,treatments.md,prompt.md,he-style.md}
├── scripts/{segment.py,classify_treatment.py,validate_edl.py}
└── templates/{graphic_table.tsx,weather_map.tsx,lower_third.tsx,
              quote_card.tsx,bullet_list.tsx,headline_card.tsx}
mcp/servers/voiceover-router/{README.md,package.json,
  src/{index.ts,whisper.ts,stock.ts,generative.ts,embed.ts,saliency.ts}}
mcp/servers/graphics-renderer/{README.md,src/{index.ts,remotion.ts}}    # phase 2
artifacts/react/voiceover-timeline.jsx
recipes/voiceover-to-broll.md
prompts/voiceover-extractor-prompt.md
```

### MVP vs phase-2 split

- **MVP (week 1–2)**: Skill + voiceover-router MCP + 2 Remotion templates
  (`graphic_table`, `lower_third`) + CLI demo on one real HE Noa Ben-Ari
  weather clip per [R0](./00-use-case-discovery.md). Render via headless
  Remotion called from the Skill's `scripts/render.sh` — graphics-renderer
  MCP not yet split out.
- **Phase 2 (week 3+)**: graphics-renderer MCP split, four remaining
  templates, the React artifact preview, FCPXML `--emit` flag
  ([R6](./06-output-edl-and-renderer.md)), Storyblocks paid path
  ([R4](./04-background-video-sourcing.md)).

### Artifact constraints

The timeline artifact must obey
[`knowledge/03-artifacts.md` §3.2–3.4](../../knowledge/03-artifacts.md):
imports limited to the React + shadcn + recharts + three + tone whitelist;
persistence via `window.storage` not `localStorage`; outbound `fetch` only
to `api.anthropic.com/v1/messages`. Remotion `<Player>` previews are
React+DOM and import inside the artifact, **provided** the templates use
only whitelisted deps (no `framer-motion`, no `date-fns`). All heavy work
(Whisper, SigLIP-2, Remotion CLI export) stays MCP-side.

### MCP registration

Append to
[`mcp/configs/creative-stack.mcp.json`](../../mcp/configs/creative-stack.mcp.json)
in the same shape as the existing `asset-router` block (lines 13–24):

```json
"voiceover-router": {
  "command": "node",
  "args": ["./mcp/servers/voiceover-router/dist/index.js"],
  "env": { "OPENAI_API_KEY": "${OPENAI_API_KEY:-}",
           "PEXELS_API_KEY": "${PEXELS_API_KEY:-}",
           "PIXABAY_API_KEY": "${PIXABAY_API_KEY:-}",
           "STORYBLOCKS_API_KEY": "${STORYBLOCKS_API_KEY:-}",
           "RUNWAY_API_KEY": "${RUNWAY_API_KEY:-}",
           "LUMAAI_API_KEY": "${LUMAAI_API_KEY:-}" }
}
```

Phase 2 adds a second `graphics-renderer` block. Stub-fallback policy
follows
[`mcp/servers/asset-router/README.md` §Install](../../mcp/servers/asset-router/README.md):
missing keys → deterministic stubs so CI stays green offline.

## Implications for keyword-extractor-voiceover

Three architectural options remain for R9:

1. **Two-MCP split** — clean dep isolation, mirrors one-server-per-concern
   across `mcp/servers/`.
2. **Single-MCP fold** — simpler register, heavier install, mixes Python ML
   with Node graphics deps.
3. **MVP-only single MCP, phase-2 split** — soft pick; ships week-1 while
   keeping the phase-2 boundary visible.

Templates placement: inside the Skill (progressive-disclosure-friendly per
[§2.1](../../knowledge/02-skills-system.md)) vs top-level for cross-Skill
reuse. HE lemmatiser: MCP-side helper (matches saliency/embedding) vs Skill
`scripts/` helper (matches segmenter).

## Open questions

- Is `graphics-renderer` worth a separate MCP, or fold into `voiceover-router`?
- HE lemmatiser: server-side helper inside the MCP, or `skills/.../scripts/`?
- `templates/` ownership: inside the Skill, or top-level for cross-Skill reuse?

## Sources

- [`knowledge/02-skills-system.md` §2.1–2.5](../../knowledge/02-skills-system.md)
- [`knowledge/03-artifacts.md` §3.1–3.4](../../knowledge/03-artifacts.md)
- [`knowledge/10-workflows.md` §10.1](../../knowledge/10-workflows.md)
- [`skills/viral-news-scanner/SKILL.md`](../../skills/viral-news-scanner/SKILL.md)
- [`skills/artifact-game-builder/SKILL.md`](../../skills/artifact-game-builder/SKILL.md)
- [`mcp/servers/asset-router/README.md`](../../mcp/servers/asset-router/README.md)
- [`mcp/configs/creative-stack.mcp.json`](../../mcp/configs/creative-stack.mcp.json)
- [`recipes/agentic-asset-pipeline.md`](../../recipes/agentic-asset-pipeline.md)
- [R0](./00-use-case-discovery.md), [R0c](./00c-scene-types-and-graphic-templates.md),
  [R1](./01-whisper-variant-comparison.md), [R2](./02-scene-and-keyword-schema.md),
  [R3](./03-prompt-design-and-caching.md), [R4](./04-background-video-sourcing.md),
  [R5](./05-matching-algorithm.md), [R6](./06-output-edl-and-renderer.md)
