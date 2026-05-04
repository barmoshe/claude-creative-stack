# Recipe — Agentic Asset Pipeline

> Take a one-sentence brief. Get back a runnable game artifact, themed end-to-end with generated tiles, an extracted palette, a packed atlas, and a self-critique summary.

This recipe stitches together every layer of the stack. **Goal**: from `"a cozy farming game tile set"` to a playable Kaplay artifact in under five minutes of agent time.

```
brief → asset-router (image gen) → palette-oklch (extract) → sprite-packer (atlas)
      → kaplay-top-down.html (live tileset) → critique-loop (vision-grounded) → iterate
```

## Prerequisites

- Claude Code or claude.ai with [`mcp/configs/creative-stack.mcp.json`](../mcp/configs/creative-stack.mcp.json) merged into your `.mcp.json`.
- The three MCP servers built (`npm run build:mcp` from repo root).
- (Optional, for real provider calls) `REPLICATE_API_TOKEN` exported. Without it the asset-router returns deterministic stub assets and the recipe still runs end-to-end — useful for CI and offline demos.

## Run it (one shot)

Paste this into a Claude Code session at the repo root:

```
Use the asset-generator skill, palette-generator, sprite-atlas-builder, artifact-game-builder, and critique-loop skills together. Goal: ship a runnable Kaplay artifact themed as "a cozy farming game tile set". Specifically:

1) Use the asset-router MCP `generate_image` tool, style "pixel", to produce 6 candidate 64×64 tiles for the brief: grass, dirt path, water, wood plank, fence post, flower patch. Cap count = 1 per tile, seed by tile name's djb2 hash. Save the URLs.
2) Use the palette-oklch MCP `generate_palette` tool to derive a 9-token light palette using the dominant hue you observe in the grass tile. Show the CSS block.
3) Use the sprite-packer MCP `pack_atlas` tool to combine the 6 tiles into ./out/cozy-atlas.png + ./out/cozy-atlas.json.
4) Modify a fresh copy of artifacts/html/kaplay-top-down.html to load cozy-atlas.json instead of the default Kaplay sprite, and theme the world tint with the palette's --bg / --accent values.
5) Use the critique-loop skill in `art-director` persona to score the result; capture the screenshot via canvas.toDataURL.
6) Print a final summary table: which provider was used per asset, total cost (use estimate_cost), and the critique score.

If any provider key is missing, accept the stub fallback and proceed; flag it in the summary.
```

## What you should see (annotated)

1. **MCP plan** — Claude announces the tool sequence and confirms which env keys are present.
2. **`generate_image` calls** — 6 small calls, one per tile. Costs displayed via `estimate_cost`. With keys: real PNG URLs. Without keys: SVG stubs colored by deterministic seed (still runnable end-to-end).
3. **`generate_palette`** — emits a 9-token CSS block tied to the grass-tile hue. Confirms WCAG AA pass for body text vs background.
4. **`pack_atlas`** — writes `./out/cozy-atlas.png` and `./out/cozy-atlas.json`. Both files referenced absolutely in the next step.
5. **Modified Kaplay artifact** — single-file, sandbox-safe, swaps the load path, applies the palette as CSS variables, sets a tile-aware camera.
6. **Critique** — Claude opens the artifact, captures a frame, runs the `art-director` persona from [`skills/critique-loop/SKILL.md`](../skills/critique-loop/SKILL.md), prints a score and a one-line bold pivot.
7. **Summary table** — per-asset provider + cost + license; total cents; critique score; iterate-or-ship recommendation.

## Variants

- **Hero asset, not tile set** — replace the brief with `"a hero character, idle / walk / run cycles"`, `--style stylized`, `count = 8`. The packer produces a horizontal sprite sheet; Kaplay binds frames via `play()`.
- **SFX pack** — add a step before (5) that calls the asset-router `generate_voice` for character barks and `generate_music` for an ambient loop. The Kaplay artifact wires the SFX into footsteps + idle.
- **Brand-safe** — switch to the Adobe Firefly route (via the Creative Cloud connector documented in [`knowledge/11-creative-connectors.md`](../knowledge/11-creative-connectors.md)). Lock the recipe to commercial-licensed output.
- **Determinism mode** — pass `seed` explicitly on every `generate_image` call. Re-running the recipe produces the exact same atlas + palette.

## Why this matters

Three reasons this recipe is the canonical demonstration of the stack:

1. **Five layers in one run** — knowledge (palette rules, artifact constraints), prompts (this file), skills (asset-generator, palette-generator, sprite-atlas-builder, artifact-game-builder, critique-loop), MCP (asset-router, palette-oklch, sprite-packer), and an artifact (Kaplay) all wire together.
2. **Stub fallback keeps it runnable** — the recipe is the same demo offline as it is with $5 of API credit. CI exercises it on every push.
3. **Provenance baked in** — every generated asset gets a sidecar `*.provenance.json` listing provider, model, seed, prompt, cost, license, timestamp. The summary table makes that legible.

## Verify

```bash
# From repo root, with MCPs registered:
npm run build:mcp
npm run validate                   # lints + smokes the artifact

# Real-provider run (optional)
export REPLICATE_API_TOKEN=...
# Then run the prompt in Claude Code; expect ./out/cozy-atlas.{png,json} to be created.
```

## See also

- [`knowledge/11-creative-connectors.md`](../knowledge/11-creative-connectors.md) — Adobe Firefly variant.
- [`knowledge/13-asset-pipelines.md`](../knowledge/13-asset-pipelines.md) — provider matrix and prompt templates.
- [`skills/asset-generator/SKILL.md`](../skills/asset-generator/SKILL.md) — the orchestrating skill.
- [`mcp/servers/asset-router/`](../mcp/servers/asset-router/) — the routing MCP.
- [`mcp/servers/sprite-packer/`](../mcp/servers/sprite-packer/) — the atlas MCP.
- [`artifacts/react/shader-jam.jsx`](../artifacts/react/shader-jam.jsx) — sibling flagship demo, single-artifact variant.
