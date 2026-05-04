---
name: asset-generator
description: Generate images, voice, music, or short video by routing to the right hosted provider (Replicate, Fal, ElevenLabs, Suno, Luma) via the asset-router MCP. Use when the user asks to generate concept art, sprites, logos, voiceover, SFX, music loops, or short clips. Picks a model based on style/cost/latency, composes a prompt, calls the MCP, retries on safety/quality fails, returns provenance metadata next to every asset. Prefers Adobe Firefly via the Creative Cloud connector for licensing-sensitive work. Falls back to the asset-router stub when no provider keys are configured so it remains demonstrable offline.
license: MIT
---

# Asset Generator

A task-aware router for asset-generating MCPs. The skill is the **decision layer**; the actual provider calls live in `mcp/servers/asset-router/`.

## When to trigger

- "Generate concept art for…"
- "Make me a logo / icon / hero image…"
- "Pixel sprite of…"
- "Voiceover saying…"
- "Music loop in {genre}…"
- "Short video clip of…"
- Any "give me {N} variants of…" where the asset is one of the above.

## Decision flow

```
1. Classify the task: image | voice | music | video.
2. Pick a style descriptor: photoreal | stylized | vector | pixel | line-art | painterly.
3. Pick a constraint surface:
     - cost-sensitive  → SDXL Lightning / smaller models
     - quality-final   → Flux 1.1 Pro / Recraft v3 / Suno v4.5
     - commercial-safe → Firefly via the Creative Cloud connector
     - on-brand pixel  → SDXL + pixel LoRA, or Recraft pixel
4. Compose the prompt using the templates in knowledge/13-asset-pipelines.md §13.5.
5. Cap counts: 4 candidates per call; up to 3 iterations; provenance recorded.
6. Call asset-router MCP — pick `provider` only if the user explicitly asked.
7. On safety reject: rephrase once, return the reason if it fails again.
8. Emit a Markdown table of outputs with cost + license + seed; sidecar provenance JSON.
```

## Calling the MCP

```ts
// Inside Claude Code or Claude.ai with the asset-router MCP installed.
const out = await tools.asset_router.generate_image({
  prompt: "isometric cozy farmhouse, warm dusk lighting, painterly",
  style: "stylized",
  ratio: "1:1",
  count: 4,
  seed: 0xC0FFEE,         // optional — re-rolls deterministically
});
// out: [{ url, provider, model, cost_cents, seed, license, provenance_url }]
```

For voice / music / video, the same MCP exposes `generate_voice`, `generate_music`, `generate_video` with task-shaped inputs (see `knowledge/13-asset-pipelines.md` §13.2).

## Cost discipline

| Phase | Model | Count | Why |
|---|---|---|---|
| Ideation | SDXL Lightning | 8 thumbnails | Cheap; iterate on direction. |
| Refinement | Flux 1.1 Pro | 4 | Pick a winner from ideation. |
| Final | Flux 1.1 Pro or Recraft v3 (vector) | 1–2 | Lock the seed. |
| Provenance | — | — | Sidecar JSON next to every asset. |

When stub-only (no API keys), each call returns a deterministic placeholder (constant gradient, silent WAV, black MP4) plus the metadata it would have produced. Recipes still run end-to-end; the user just sees placeholders.

## Prompt-template selection

Pull templates from `knowledge/13-asset-pipelines.md` §13.5:

- **Logo** → Flux/Recraft, `style: minimal | playful | luxury`, `--ratio 1:1`.
- **Game tile** → SDXL pixel, `palette_size: 8`, seamless edges.
- **Character sprite sheet** → Flux + ControlNet pose, 8 frames per cycle.
- **Voiceover** → ElevenLabs, voice id, settings tuned to use case.
- **Music brief** → Suno, mood + genre + BPM + key + duration.

## Composition with other skills

- **palette-generator** → run after image gen to extract a usable palette.
- **sprite-atlas-builder** → pack generated sprites into an atlas.
- **critique-loop** → ask Claude to score the result against the brief and decide whether to iterate.
- **artifact-game-builder** → drop the assets into a runnable game artifact.

The `recipes/agentic-asset-pipeline.md` recipe stitches all five into one end-to-end run.

## Safety rails

- **Never run "generate {large N}" without a confirm step**. 64 generations × $0.04 = $2.56; surface the estimate via `asset-router.estimate_cost()` first.
- **Always emit provenance.** Don't ship outputs without `{provider, model, seed, prompt, cost, license, timestamp}`.
- **Refuse identifiable-likeness prompts** unless the user has uploaded a reference they own. ElevenLabs voice cloning especially.
- **Tag commercial-restricted outputs** in the provenance file. Suno's terms vary by tier; ElevenLabs' likeness tooling is restricted.
- **Don't paste API keys into artifacts.** All provider calls go through the MCP, which reads keys from the local environment only.

## Output shape

1. **Brief** — one-line summary of what was generated and why this provider/model.
2. **Markdown table** of outputs with: thumbnail link, provider, model, cost, license, seed.
3. **Provenance JSON** sidecar (one per output).
4. **Recommended next step** — pick / iterate / refine, or "drop into <skill>".

## Further reading

- `knowledge/13-asset-pipelines.md` — full provider matrix and prompt templates.
- `knowledge/11-creative-connectors.md` — Adobe Firefly via Creative Cloud connector for commercial-safe output.
- `mcp/servers/asset-router/` — the routing MCP.
- `skills/critique-loop/SKILL.md` — pair this skill with critique-loop for self-graded iteration.
- `recipes/agentic-asset-pipeline.md` — end-to-end demo.
