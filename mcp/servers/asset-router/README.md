# asset-router MCP server

Single tool surface for image / voice / music / video generation. Routes to Replicate, Fal, ElevenLabs, Suno, Luma, or Runway based on rules in `src/routing.ts`. Falls back to deterministic stubs when API keys are missing — recipes and CI runs stay green offline.

## Install

```bash
cd mcp/servers/asset-router
npm install
npm run build
```

Optional env keys:

| Variable | Provider |
|---|---|
| `REPLICATE_API_TOKEN` | Replicate (image) |
| `ELEVENLABS_API_KEY` | ElevenLabs (voice) |
| `FAL_KEY` | fal.ai (image, not yet wired — falls back to Replicate) |
| `SUNO_API_KEY` | Suno (music — currently stubbed) |
| `LUMAAI_API_KEY` | Luma (video — currently stubbed) |
| `RUNWAY_API_KEY` | Runway (video — currently stubbed) |

When a key is missing the router returns deterministic SVG/silent-WAV stubs marked `is_stub: true`.

## Register

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "asset-router": {
      "command": "node",
      "args": ["./mcp/servers/asset-router/dist/index.js"],
      "env": {
        "REPLICATE_API_TOKEN": "...",
        "ELEVENLABS_API_KEY": "..."
      }
    }
  }
}
```

## Tools

- `generate_image({ prompt, style, ratio, count, seed?, provider? })`
- `generate_voice({ text, voice_id? })`
- `generate_music({ prompt, duration_s, instrumental })`
- `generate_video({ prompt, duration_s, ratio })`
- `estimate_cost({ task, style?, ..., count? })`

## Test

```bash
npm test
```

Tests run entirely in stub mode — no API keys required. They verify routing rules and stub determinism.

## See also

- [`knowledge/13-asset-pipelines.md`](../../../knowledge/13-asset-pipelines.md) — provider matrix, prompt templates, cost guardrails.
- [`skills/asset-generator/`](../../../skills/asset-generator) — task-aware skill that calls this MCP.
- [`recipes/agentic-asset-pipeline.md`](../../../recipes/agentic-asset-pipeline.md) — end-to-end demo using this router with `palette-oklch` and `sprite-packer`.
