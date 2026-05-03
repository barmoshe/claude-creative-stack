# 13 — AI Asset Pipelines

> Hosted models for image / video / voice / music generation. This file covers **how to call them safely from Skills and MCP servers** — not from inside an artifact (the fetch whitelist blocks arbitrary providers; the asset-router pattern is "Skill calls MCP calls provider; Artifact previews the result").

**Scope of this file**:
- Choosing the right provider per task.
- Calling patterns: REST polling, webhooks, streaming, batching.
- Cost and rate-limit gotchas.
- Prompt templates that produce reliably-styled output.
- Where this fits in the agentic asset pipeline (`recipes/agentic-asset-pipeline.md`).

## 13.1 Provider matrix (May 2026)

| Provider | Models | Modality | MCP | Notes |
|---|---|---|---|---|
| **Replicate** | Flux 1.1 Pro / Schnell, SDXL Lightning, Recraft v3, Hailuo 02, Kling 2.0, Runway Gen-3 Alpha Turbo, ElevenLabs voice, etc. | image / video / voice | No first-party MCP — wrap with the project's `asset-router` MCP | Pay per second of compute; predictable pricing. |
| **Fal.ai** | 1000+ models behind one endpoint, including Flux variants, AuraFlow, AnimateDiff, ElevenLabs | image / video / voice | **Hosted MCP** (`fal-ai/mcp-fal`) | Fastest cold-start in the industry. |
| **ElevenLabs** | TTS, voice cloning, voice changer, SFX | voice / SFX | **Official MCP** (`elevenlabs/elevenlabs-mcp`) | Best TTS quality; per-character billing. |
| **Suno** | v4.5 song generation | music | **`mcp-suno`** (PyPI) + hosted at `suno.mcp.acedata.cloud/mcp` | Lyric + style prompt → 2 candidate songs. |
| **Luma** | Photon (image), Ray2 (video) | image / video | **`mcp-luma`** (PyPI) | Strong on motion realism. |
| **Stability AI** | SD 3.5, SDXL Turbo, SVD | image / video | No first-party MCP | Self-host friendly via `stability-sdk`. |
| **Midjourney** | v7 (May 2026) | image | None public; goes via APIframe | No official API; APIframe + Discord-relay is the workaround. |
| **Runway** | Gen-3 Alpha Turbo, Act-One | video | None first-party | Best-in-class motion brushes. |
| **APIframe** | Aggregator: Midjourney + Luma + Suno + ElevenLabs + … | mixed | None first-party | Single key for many providers; useful for reducing config complexity. |

Default picks if you need to pick blindly:

- **Photoreal images** → Flux 1.1 Pro (Replicate or Fal). 1024×1024 in ~3 s.
- **Stylized / sticker / sprite** → Recraft v3 (Replicate) — supports vector output.
- **Logo / icon** → Flux + a tight system-prompt; Recraft for vector.
- **Pixel art** → SDXL with the right LoRA (via Replicate); see §13.6.
- **Voice** → ElevenLabs Multilingual v2 + Voice Design API.
- **Music (loops/stems)** → Suno v4.5 (lyric or instrumental).
- **Short video** → Luma Ray2 (5s) or Runway Gen-3 Alpha Turbo (10s).

## 13.2 The asset-router MCP pattern

This repo ships `mcp/servers/asset-router/` (W4) which collapses all providers behind a single tool surface. Skills and recipes call **one MCP**; the router handles provider selection, key management, retries, and a stub fallback when no keys are configured.

```
generate_image({ prompt, style, ratio, count, seed?, provider? }) → URLs[]
generate_voice({ text, voice_id, settings? })                     → URLs[]
generate_music({ prompt, duration_s, instrumental })              → URLs[]
generate_video({ prompt, duration_s, ratio, motion_strength? })   → URLs[]
estimate_cost({ task, params })                                   → { cents, eta_s }
```

Routing rules (`asset-router/src/routing.ts`):

```ts
// First match wins; later rules override earlier ones via merge.
[
  { task: "image", style: "photoreal", provider: "replicate", model: "black-forest-labs/flux-1.1-pro" },
  { task: "image", style: "stylized",  provider: "replicate", model: "recraft-ai/recraft-v3" },
  { task: "image", style: "pixel",     provider: "replicate", model: "lucataco/sdxl-pixel-art" },
  { task: "image", style: "vector",    provider: "replicate", model: "recraft-ai/recraft-v3-svg" },
  { task: "voice",                     provider: "elevenlabs",  model: "eleven_multilingual_v2" },
  { task: "music", instrumental: true, provider: "suno",        model: "v4.5-inst" },
  { task: "music", instrumental: false,provider: "suno",        model: "v4.5" },
  { task: "video", duration_s: { lte: 5 }, provider: "luma",    model: "ray-2" },
  { task: "video", duration_s: { gt:  5 }, provider: "runway",  model: "gen-3-alpha-turbo" },
]
```

Stub fallback: when an env key is missing, the router emits a deterministic placeholder image / silent WAV / black MP4 with metadata indicating which provider would have run. This keeps recipes runnable and CI green without secrets.

## 13.3 Calling pattern — Replicate (REST + polling)

```ts
// Inside an MCP server (NOT an artifact)
const start = await fetch("https://api.replicate.com/v1/predictions", {
  method: "POST",
  headers: { "Authorization": `Token ${env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    version: "black-forest-labs/flux-1.1-pro",
    input: { prompt, aspect_ratio: ratio, output_format: "png", seed }
  })
}).then(r => r.json());

let pred = start;
while (pred.status === "starting" || pred.status === "processing") {
  await new Promise(r => setTimeout(r, 1000));
  pred = await fetch(`https://api.replicate.com/v1/predictions/${start.id}`, {
    headers: { "Authorization": `Token ${env.REPLICATE_API_TOKEN}` }
  }).then(r => r.json());
}
if (pred.status !== "succeeded") throw new Error(pred.error || "unknown");
return pred.output as string[];
```

For batches, prefer **webhooks** (`webhook_url` on the create call) over polling.

## 13.4 Cost & rate guardrails

| Provider | Rough $/unit (May 2026, approximate) | Rate ceilings |
|---|---|---|
| Flux 1.1 Pro (Replicate) | ~$0.04 / image | 50 concurrent predictions on the free tier. |
| SDXL Lightning | ~$0.003 / image | High; use for ideation. |
| Recraft v3 | ~$0.04 / image | Lower concurrency. |
| ElevenLabs Multi v2 | ~$0.18 / 1k chars (TTS) | 10k req/h on Creator+. |
| Suno v4.5 | ~$0.20 / song (≤4 min) | 10 concurrent. |
| Luma Ray2 | ~$0.40 / 5 s clip | Tight; expect queue. |
| Runway Gen-3 Alpha Turbo | ~$0.50 / 10 s clip | Burst-friendly. |

These rotate fast — **`asset-router.estimate_cost(...)` always re-quotes from the provider API**, never uses these constants. Use this table only for capacity planning.

Patterns:

- **Cap `count` at 4** in agentic loops. Two retries × 4 candidates × 3 iterations = 24 calls — at $0.04 that's ~$1; easy to blow if uncapped.
- **Cache by deterministic seed** in the MCP layer. The same `(prompt, model, seed, ratio)` should hit cache.
- **Use SDXL Lightning for ideation, Flux 1.1 Pro for finals.** A 10× cost gap is normal between "explore" and "ship."
- **Batch via webhooks** when generating > 8 assets — no polling overhead, no idle compute on your side.

## 13.5 Prompt templates that work

**Logo (Flux / Recraft)**:

```
{brand_name} logo, {style: minimal | playful | technical | luxury}, {era: modern | retro 80s | art-deco | bauhaus},
single mark on {bg: solid white | transparent | gradient}, vector-clean lines, no text artifacts,
high-contrast, scalable, isolated, --ratio 1:1
```

**Game tile (SDXL / Recraft pixel)**:

```
{tile_subject: grass | path | water | wood plank}, top-down 16-bit pixel art tile, {palette_size: 8} colors,
seamless tile-able edges, no shading outside the tile, sharp pixel boundaries, 32x32 base render upscaled cleanly
```

**Character sprite sheet (Flux + ControlNet pose)**:

```
2D character sprite sheet, idle/walk/run/jump cycles, 8 frames per cycle, side view, pixel art,
{character: small mage with red robes}, transparent background, consistent pose, --ratio 4:3
```

**Voiceover (ElevenLabs)**:

```
voice: Adam (deep narrator) | Bella (warm friendly) | custom_<id>
text: "{copy}"
settings: stability=0.45, similarity_boost=0.75, style=0.30, use_speaker_boost=true
```

**Music brief (Suno)**:

```
prompt: "{mood: melancholic} {genre: lo-fi hip-hop} loop, 90 BPM, in C minor,
no vocals, gentle piano, subtle vinyl crackle, suitable for {use: cozy farming game}"
duration_s: 60
instrumental: true
```

## 13.6 LoRA & ControlNet — when style consistency matters

For sprite sheets, branded illustration, or repeating characters, base-model output drifts. Two answers:

1. **LoRA fine-tunes** (Replicate hosts thousands; search by keyword). Pair an SDXL base + a pixel-art / ghibli / line-art LoRA. Cost: same as the base.
2. **ControlNet** (pose / canny / depth) — pin the silhouette across generations so a character keeps the same proportions. Replicate `xinntao/controlnet-pose` family.

Skill pattern: `skills/asset-generator` lets the user supply a LoRA URL or a ControlNet seed image; the routing layer wires it to the right model.

## 13.7 Content-moderation & licensing

- All hosted providers run input + output safety classifiers. Expect ~1-3% benign-prompt false-positive rate; retry with a softer rephrase, surface the reason to the user.
- **Never resell unmoderated provider output as a final asset for kids' games / regulated industries** without an additional human moderation pass.
- **Track provenance** — store `provider`, `model`, `seed`, `prompt`, `timestamp`, `cost`, `license` next to every saved asset. The asset-router emits a sidecar `*.provenance.json` next to every output.
- Adobe Firefly is the only major model trained exclusively on licensed/CC0 data; if commercial-safety is the constraint, prefer Firefly via the Creative Cloud connector (see `11-creative-connectors.md`).
- Suno output: read the active terms — "free for commercial use" applies only on paid tiers as of May 2026.

## 13.8 See also

- `knowledge/11-creative-connectors.md` — driving Photoshop / Blender / Ableton via MCP for downstream conform/compose.
- `knowledge/05-graphics-design.md` — palette extraction and design-token integration for generated assets.
- `knowledge/10-workflows.md` — composing skills + MCP + artifacts.
- `mcp/servers/asset-router/` — the routing MCP server (W4).
- `skills/asset-generator/SKILL.md` — task-aware provider selection (W3).
- `recipes/agentic-asset-pipeline.md` — end-to-end demo (W8).
