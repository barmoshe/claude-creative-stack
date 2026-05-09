# R-infra — Cloudflare Deployment & Stock-Asset Hosting

> Status: draft
> Owner: claude  Last updated: 2026-05-08

## TL;DR (≤150 words)

The keyword-extractor-voiceover pipeline (R7 architecture: Skill + `voiceover-router` MCP + Remotion templates + CLI) and its R4 stock-asset cache map cleanly onto Cloudflare's primitives. **Default deployment shape:** R2 for stock cache + final renders + license sidecars (zero egress, S3 API, lifecycle rules enforce R4's mandatory 24-hour Pixabay TTL); Workers for the MCP HTTP surface and the asset-router orchestration; D1 for the R6 license envelope and the R8 90-day audit log; KV as the broll-cache lookup index; Queues for stage hand-off (ASR → segmenter → matcher → renderer). **Off-Cloudflare:** the actual ASR (R1's `ivrit-ai/whisper-large-v3-turbo-ct2` is not on Workers AI) and the Remotion render (Chromium-heavy) — both stay on Replicate / Modal / a Cloudflare Container with caveats. Direct fetches of `developers.cloudflare.com` were blocked in this environment (HTTP 403 from WebFetch), so every concrete pricing figure and feature claim below is search-snippet-grade and **must be re-verified on the live docs before any cost commitment**.

## Scope & questions

Q1: Which parts of the R7 architecture run *natively* on Cloudflare vs. which must stay external?
Q2: How does the stock-asset upload path from R4 (Pexels → Pixabay → Luma/Runway → Storyblocks) translate into R2 buckets, and how is the mandatory Pixabay 24-hour cache enforced?
Q3: What happens to the R6 license sidecar (`<out>.licenses.json`) and the R8 audit-log 90-day floor on Cloudflare's storage primitives?
Q4: Is the daily-batch cost at R0 scale (~5 voiceovers/day) materially different from running on a generic VPS / S3?

Out of scope: choosing a render provider for Remotion (R6 territory), choosing an ASR host (R1 territory), choosing the front-of-house CDN for the V1 app itself.

## Verification posture

Direct inspection was blocked: `developers.cloudflare.com`, `cloudflare.com/products/r2/`, `cloudflare.com/plans/developer-platform/` and `dash.cloudflare.com` all returned HTTP 403 to WebFetch in this environment, and `curl` is sandbox-host-allowlisted. All pricing, quota, and feature claims below come from `WebSearch` snippets and prior knowledge through the May 2026 cutoff. **Treat every dollar figure, GB ceiling, and feature flag as TBD until cross-checked against the live Cloudflare docs.** Cloudflare ships pricing changes and product GA flips frequently; nothing here should be cited in a contract or a procurement decision without live re-verification.

## Findings

### Mapping the R7 architecture onto Cloudflare primitives

| R7 component | Cloudflare home | Why | Caveat |
|---|---|---|---|
| `voiceover-router` MCP HTTP surface | **Workers** | Sub-50ms cold start, request-routing is Workers' canonical use case. | CPU time cap (10 ms free / 30 s paid); orchestration only, not heavy compute. |
| `asset-router` MCP (Pexels / Pixabay search + cache writes) | **Workers** | Calls external APIs, streams MP4 into R2. Worker → R2 binding is a few lines. | Worker's request body limit (100 MB free, 500 MB paid) is fine for individual broll clips but watch montage uploads. |
| Stock-asset cache (R4: Pexels + Pixabay + Luma/Runway downloads) | **R2** | Zero egress, S3 API, lifecycle rules cover R4's 24-hour Pixabay TTL natively. | R2 lifecycle rule precision is per-prefix per-day, not per-object hour. See "Pixabay 24-h cache" below. |
| Final 1080×1920 MP4 outputs | **R2** | Same reason; downstream V1 CMS pulls from R2 with no egress fee. | Want signed URLs by default; treat the bucket as private. |
| R6 license sidecars (`<out>.licenses.json`) + license envelope rows | **D1 (primary) + R2 (sibling object)** | D1 for query (R8 audit, R6 join with EDL); R2 sibling object for "the file lives next to the MP4". | D1 5 GB free tier; R8's 90-day floor fits comfortably. |
| R8 audit log | **D1** primary, **R2** cold archive at >90 d | D1 indexes the hot 90 d; lifecycle-move to R2 keeps long-tail cheap. | Audit log writes are append-only — D1 is fine; KV would conflict with R8's read-after-write requirement. |
| Broll cache lookup index (clip_id → R2 path + downloaded_at) | **KV** | Read-heavy, eventually consistent, 1 ms p50 reads. | KV write hot-spot ceiling (~1 write/sec/key); this is a per-clip key, so safe. |
| Stage hand-off (ASR result → segmenter → matcher → renderer) | **Queues** | Decouples slow stages; retries built in. | Queues add latency vs. inline; only worth it once renders run async. |
| Artifact preview (R7 phase 2) | **Pages + Functions** | Same Worker DX, branch preview deployments. | Bundle size limits — fine for the keyword-extractor preview scope. |
| ASR (R1 default `ivrit-ai/whisper-large-v3-turbo-ct2`) | **Off-Cloudflare** | Workers AI hosts the OpenAI Whisper variants only; not the ivrit-ai HE-tuned model. R1 picked the ivrit-ai variant deliberately for HE accuracy. | Could fall back to Workers AI Whisper for the EN path only. Verify which variants Workers AI exposes today. |
| Remotion render | **Off-Cloudflare *or* Cloudflare Containers (with caveats)** | Remotion needs Node + Chromium with full GPU/CPU. Workers can't run Chromium; Browser Rendering API is intended for screenshots/PDFs and probably misses Remotion's APIs. Cloudflare Containers (recently GA per public references) can host a Remotion service but cold-start and per-render cost need verification before locking. | If Containers don't pencil out, Replicate / Modal / runpod stay the default. |

### Stock-asset upload flow (R4 → R2)

Concrete sequence for the Pexels-first / Pixabay-fallback / Luma-Runway-last path:

1. **Worker receives** `POST /broll?term=גשם כבד&duration=5s&aspect=9:16` from the matcher.
2. **Worker checks** KV `broll:cache:<term-hash>` for an existing R2 path within the per-source TTL window (Pixabay = 24 h; Pexels and Storyblocks = no R4 TTL).
3. **Cache miss → Worker calls** the source API (Pexels / Pixabay) with R5's translated EN query (R4 §"No source supports HE search — translate first").
4. **Worker streams** the source MP4 directly into R2 via `R2_BUCKET.put(key, response.body, { httpMetadata })` — no buffer in Worker memory, so the 100 MB body cap doesn't apply to this path.
5. **Worker writes** the license envelope row to D1 (`source`, `clip_id`, `license`, `attribution`, `downloaded_at`, `prompt`) — the same envelope R6 carries through to the final MP4.
6. **Worker writes** a sidecar `<key>.license.json` next to the MP4 in R2 — R6's "renderer is the choke point that must not strip these fields" is preserved at the storage layer too.
7. **Worker writes** KV `broll:cache:<term-hash>` → `{ r2_path, downloaded_at, expires_at }`.
8. **Worker returns** an R2-signed URL (or a Worker-proxied stream URL if the matcher needs to inspect bytes).

R2 bucket layout proposed:

```
v1-stock/
├── pexels/<clip_id>.mp4
├── pexels/<clip_id>.license.json
├── pixabay/<clip_id>.mp4         # 24-h TTL via lifecycle rule
├── pixabay/<clip_id>.license.json
├── luma/<job_id>.mp4
├── luma/<job_id>.license.json
├── runway/<job_id>.mp4
├── runway/<job_id>.license.json
└── storyblocks/<clip_id>.mp4     # paid-tier only, indemnified

v1-renders/
└── <out_id>/
    ├── master.mp4                 # 1080×1920 final
    ├── licenses.json              # aggregate from R6
    ├── transcript.srt             # captions
    └── audit.json                 # R8 audit envelope

v1-audit-cold/
└── <yyyy>/<mm>/<dd>/<job_id>.json # >90 d archive
```

### Pixabay 24-hour cache enforcement (R4 hard rule)

R4 makes the 24-hour Pixabay cache mandatory. R2 has two enforcement options:

1. **Lifecycle rule on the `pixabay/` prefix** with `expiration: { days: 1 }`. Cheapest, declarative, runs server-side. Caveat: R2 lifecycle rules currently run with day-level granularity (per public docs as of last knowledge update — verify) — a clip downloaded at 23:59 may live ~25 h, not exactly 24. If R4's rule is "hard ≤24 h", a Worker-driven daily sweep on a Cron Trigger (`* 0 * * *`) is the conservative complement.
2. **Worker Cron Trigger** scanning the `pixabay/` prefix and deleting objects older than 24 h. More precise, costs a Worker invocation per day, gives observability via Workers logs.

Recommendation (subject to live-doc check): both. Lifecycle rule for the cheap default, daily cron sweep as the "I checked" audit point R8 will want. Same KV index gets cleaned in the same sweep.

### Costs at R0 scale (estimate, all figures TBD)

R0 = ~5 voiceovers/day, ≤2 min each, ~6 scenes per voiceover, mostly broll. Assuming each broll clip ≈ 5 MB:

| Line | Quantity | Approx unit cost (TBD verify) | Approx monthly |
|---|---|---|---|
| R2 storage (steady state cache + 30 d of renders) | ~10 GB | $0.015 / GB-mo | ~$0.15 |
| R2 Class A ops (writes, list) | ~5 K | $4.50 / M | <$0.05 |
| R2 Class B ops (reads) | ~50 K | $0.36 / M | <$0.05 |
| R2 egress | unbounded | $0 | $0 |
| Workers (MCP + asset-router) | ~30 K req/day | Free under 100 K/day | $0 |
| KV reads | ~30 K/day | $0.50 / M after free | $0 |
| D1 reads / writes | <1 M/mo | Free under tier | $0 |
| Queues operations | ~10 K/mo | $0.40 / M | <$0.01 |
| Workers AI (only if EN Whisper path) | <1 K min/mo | varies | TBD |
| **Estimated total at R0** | | | **<$1/month** |

Caveat: figures are search-snippet-grade. Re-verify against `https://www.cloudflare.com/plans/developer-platform/` before committing.

At 10× scale (50 voiceovers/day) the same line items grow roughly linearly; egress stays $0 which keeps Cloudflare ahead of S3 + CloudFront for any path where V1's CMS pulls renders back out.

### Compliance and security posture

- **R8 face/logo pre-cut screen runs *before* R2 upload.** The Worker that ingests Pixabay clips runs the MediaPipe / OpenCV / `rembg` pass first; failed clips never reach R2. Cleaner than upload-then-delete.
- **R8 attribution metadata pass-through** — R6's license sidecar is mirrored in R2 next to the MP4 *and* in D1. Two sources of truth is intentional: R2 sibling for "moves with the file", D1 row for "joinable to the audit log".
- **Storyblocks indemnification** survives the R2 hop because the `licensed_to` and indemnification class travel in the license envelope. Don't strip it on upload.
- **Bucket access** — `v1-stock` and `v1-renders` are private; downstream consumers use signed URLs scoped to ≤1 h. Public bucket is wrong here even though MP4s look "harmless"; the audit trail wants every fetch logged.
- **R8's 90-day audit floor** — D1 retains 90 d hot, lifecycle-archive to `v1-audit-cold/` keeps 7 y cheap.

### Off-Cloudflare components (do not move yet)

| Component | Stay where? | Why |
|---|---|---|
| ASR (HE primary) | Replicate / Modal | Workers AI lacks `ivrit-ai/whisper-large-v3-turbo-ct2`; Hebrew accuracy was R1's whole point. |
| ASR (EN secondary) | OpenAI `gpt-4o-transcribe` per R1 | Workers AI's Whisper variants are an option but R1 already picked. |
| Remotion render | Replicate / Modal / Lambda *or* Cloudflare Containers | Render is Chromium + Node + ~30–120 s wall time per minute of voiceover. CF Containers might work; verify cold-start + GPU access before switching. |
| Luma Ray2 / Runway Gen-3 generation | Their own APIs | These are providers, not infra to host. |

## Implications for keyword-extractor-voiceover

1. **R7's "MCP" boxes can be Workers without rewriting the Skill side.** The Skill side talks HTTP/JSON; the MCP can be hosted as a Worker behind a stable URL. Keep the MCP boundary as written in R7.
2. **R4's stock-cache contract is satisfied 1:1 by R2 + KV + a lifecycle rule.** No need to invent a custom cache layer. Update R4's "stock-cache" section to point here for the storage backing.
3. **R6's license sidecar gets a second home in D1 — that's a feature.** R6 can read either D1 (joins) or the R2 sibling (file-local) — pick the cheaper path per audit query.
4. **R8's audit floor (90 d) is cheap — no reason not to extend.** D1 + R2 cold archive makes 7-year retention < $1/year at R0 scale. Lift the floor if Keshet's compliance asks.
5. **Don't put ASR or Remotion on Workers.** Both are CPU/GPU-shaped; Workers is request-shaped. Keep them on the providers R1 / R6 picked, and call them from a Worker.
6. **Egress-free is the killer feature here.** Any architecture that reads renders back out (V1 CMS, social schedulers, the artifact preview from R7 phase 2) saves real money on Cloudflare vs S3 + CloudFront.

## Open questions

- **Workers AI Whisper variants in May 2026** — exact list, exact HE accuracy. If a HE-capable Whisper has shipped on Workers AI, R1 should be re-opened.
- **Cloudflare Containers cold-start and GPU posture** — can a Remotion render container hit < 2 s cold start? Is GPU accessible from Containers, or CPU-only? If CPU-only, Remotion render on CF is feasible but slow; Replicate/Modal stay default.
- **R2 lifecycle rule precision** — confirm whether `expiration.days: 1` is "expires at midnight UTC of day +1" or "expires 24 h after creation". Affects how strictly the R4 24-h Pixabay rule is met without the cron sweep.
- **Browser Rendering API** — is its Chromium build sufficient for Remotion's `@remotion/renderer` invocation, or is there an API mismatch? If yes, a serverless Remotion render on Cloudflare becomes possible without Containers.
- **Signed-URL ergonomics for V1 CMS** — does the V1 CMS need a long-lived URL or can it ask the Worker for a fresh one each load? Affects bucket auth posture.
- **Region pinning** — R2 supports location hints (EU, ENAM, WNAM, APAC). For an Israeli newsroom, EU keeps latency low; verify pricing parity.

## Sources

[1] Cloudflare R2 product overview — `cloudflare.com/products/r2/` (WebFetch returned HTTP 403; figures here are from `WebSearch` snippets and prior knowledge through May 2026).
[2] Cloudflare Workers pricing & limits — `developers.cloudflare.com/workers/platform/pricing/` and `/limits/` (same access caveat).
[3] Cloudflare D1, KV, Queues product pages — `developers.cloudflare.com/d1/`, `/kv/`, `/queues/` (same access caveat).
[4] Cloudflare Containers GA announcement and pricing — `blog.cloudflare.com` and `developers.cloudflare.com/containers/` (same access caveat); cross-check before treating Containers as a Remotion host.
[5] Workers AI model catalog — `developers.cloudflare.com/workers-ai/models/` (same access caveat); R1 chose `ivrit-ai/whisper-large-v3-turbo-ct2`, not currently believed to be on Workers AI — verify before relying.
[6] R4 — `04-background-video-sourcing.md` — Pexels / Pixabay / Luma / Runway / Storyblocks sourcing rules and the 24-hour Pixabay cache mandate.
[7] R6 — `06-output-edl-and-renderer.md` — License envelope (`source, clip_id, license, attribution, downloaded_at, prompt?`) and the renderer-as-choke-point rule.
[8] R7 — `07-repo-architecture-fit.md` — Skill + voiceover-router MCP + 2 Remotion templates + CLI; phase-2 graphics-renderer split, artifact preview, FCPXML emit.
[9] R8 — `08-newsroom-guardrails-and-language.md` — Pre-cut face/logo screen, 90-day audit-log floor, Pixabay identifiable-person risk.
