# R9 — Synthesis and Recommendations

> Status: draft
> Owner: Wave-5 agent  Last updated: 2026-05-07

## TL;DR (≤200 words)

A scene-first voiceover→9:16 video pipeline for an Israeli newsroom weather Reel, locked end-to-end. Hebrew transcription via **`ivrit-ai/whisper-large-v3-turbo-ct2`** through `faster-whisper` (R1); English via **`gpt-4o-mini-transcribe`** (R1); **whisperX** as the word-timestamp safety pass when drift > 250 ms. One Claude **Haiku 4.5** call (Sonnet 4.6 escalation) segments + classifies + extracts keywords against the locked 8-value `visual_treatment` enum (R-graphics) and the scene-first JSON schema (R2). Sourcing order **Pexels → Pixabay (face/logo screen) → Luma Ray2** (R4). Matching = tag → SigLIP-2 ViT-L rerank → Haiku 4.5 vision judge on residuals, `crop_safety` from MediaPipe + U²-Net (R5). Render: **Remotion** master composition at 1080×1920 @ 30 fps (R6); FFmpeg fallback. Architecture: one Skill + `voiceover-router` MCP + 2 Remotion templates + CLI for MVP; graphics-renderer MCP, FCPXML, Storyblocks deferred to phase 2 (R7). Guardrails: STOP gate, numeric-verbatim, DictaBERT-lex lemma trace, ±0.25 s timing, 90-day audit (R8). Biggest risk: Haiku 4.5 corrupting Hebrew nikud inside JSON. Plan: 2 weeks to a watchable end-to-end demo on Noa's worked example.

## Locked stack

### ASR (HE + EN + word-timestamp fallback)

- **HE default:** `ivrit-ai/whisper-large-v3-turbo-ct2` via `faster-whisper`. Top of the Hebrew Speech Recognition Leaderboard; Marmor et al. report up to −29% relative WER vs OpenAI baselines (R1 §Findings).
- **EN default:** `gpt-4o-mini-transcribe` ($0.003/min). At ~10 min/day this is ~$0.90/month — cost is irrelevant; quality bar is "watchable". Escalate to `gpt-4o-transcribe` ($0.006/min) if accuracy testing demands (R1 §Cost & latency).
- **Word-timestamp fallback:** if ivrit-ai drift > 250 ms on a real weather clip, run **whisperX** alignment as a second pass (R1 §Word-timestamp drift; R8 §Timing tolerance). Drift is a hard fail, not a soft warning.

### Scene-first schema (paste-ready)

Frozen from R2; consumed by R3 prompt + R6 EDL + R8 validators.

```json
{
  "language": "he" | "en",
  "duration_s": 110.4,
  "transcript": "...",
  "scenes": [{
    "scene_id": 1,
    "start_s": 0.0, "end_s": 12.3,
    "visual_treatment": "<one of 8 enum values>",
    "confidence": 0.93,
    "source_orientation": null,
    "keywords": [{
      "term": "גשם",            // verbatim from transcript (HE)
      "lemma": "גשם",
      "visual_concept": "rain on car windshield, vertical",
      "category": "<closed enum, English>",
      "weight": 0.95, "confidence": 0.92,
      "alternatives": ["umbrella","wet street"],
      "crop_safety_priority": "high"
    }],
    "broll":   { "sourcing_pref": ["pexels","pixabay"], "license_required": "commercial", "vertical_required": true } | null,
    "graphic": { "template": "<same as visual_treatment>", "props": { ... } } | null
  }],
  "notes": null
}
```

Mutual exclusion: exactly one of `broll`/`graphic` is non-null per scene (R2 §Scene shape).

### Visual-treatment enum (paste-ready)

Locked from R-graphics (`00c-scene-types-and-graphic-templates.md`):

```
broll | broll_montage | graphic_table | graphic_map |
graphic_chart | lower_third | title_card | generated_clip
```

Every value is justified by Noa's 7-scene HE worked example (R0 §Persona scenes 1–7).

### Prompt template (structure + caching)

Single-pass: segment + classify + extract in one Haiku call (R3 §Single-pass). Cache breakpoint structure:

```
[CACHED, 1h TTL — ~2.4 k tokens]
  <role> + <output_contract> + <bilingual_rule> + <no_hallucination_rule>
  + <trigger_heuristics> (8 numbered rules)
  + <timestamp_rule>
  + 5 few-shots (4 HE, 1 EN; weather + temperature-table + map + sign-off + lower_third)
[DYNAMIC]
  user message: { language, duration_s, transcript, word_timestamps?, segments? }
[ASSISTANT PREFILL]
  {"language":
```

Newsroom runs cluster 14:00–16:00, so the **1 h TTL** breakpoint outperforms 5 m (R3 §Caching plan). Hit rate ~80%; ~$0.05/day at 5 voiceovers.

### Default model + escalation rule

**Default:** `claude-haiku-4-5` (R3 §Model pick). **Escalate to `claude-sonnet-4-6`** when any scene returns `confidence < 0.7`, the topic is breaking news / election / security incident / named-figure attribution, or the editor re-runs (R3 + R8 STOP gate).

### Sourcing order (broll)

```
1. local in-house cache (city-specific clips)
2. Pexels  ?orientation=portrait
3. Pixabay ?orientation=vertical  + face/logo pre-cut screen
4. Luma Ray2  aspect_ratio="9:16"  (free-tier path; ~$0.45–0.50/5 s)
5. Storyblocks Business+  (paid path — only when newsroom legal demands $20 k–$1 M indemnification)
```

Justified by R4 §Default sourcing order; paid indemnification path per R8 §Pre-cut face/logo screen.

### Matching pipeline

```
tag-match top-10  (Pexels/Pixabay query)
  → drop on crop_safety = 0.0
  → SigLIP-2 ViT-L rerank top-3   (HE-capable, beats OpenCLIP-G/14)
  → Claude Haiku 4.5 vision-judge  iff max cosine < 0.28
  → cache thumb_emb keyed by (source, clip_id)
```

SigLIP-2 over OpenCLIP because it natively encodes Hebrew, opening a future path to bypass HE→EN translation for queries (R5 §Hebrew handling, R4 open question). Cost ceiling **<$0.05/min** worst case (R5 §Cost-per-minute).

### Saliency backend

**MediaPipe Face Detection** + **U²-Net via `rembg`** — both passes, take the cheaper-positive result. Face-only misses object-only B-roll (rain on a window has no face); U²-Net catches it; MediaPipe is millisecond-class for the common case. AutoFlip is legacy (support ended Mar 2023), use only as a sanity check (R5 §crop_safety).

### Renderer

**Remotion** at `<Composition width={1080} height={1920} fps={30}>` is the only renderer that natively composes broll `<OffthreadVideo>` clips and the React graphic templates in **one pass** (R6 §Default renderer pick; R-graphics §Template authoring). CLI: `npx remotion render edl out.mp4 --props=./edl.json`. **FFmpeg per-clip normaliser as a pre-render pass** (`scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30`) for mixed-framerate sources before they reach `<OffthreadVideo>` (R6 open question on 25 fps Pixabay / 23.976 Storyblocks frame-accuracy). FFmpeg `concat` is the broll-only fallback when Node is unavailable.

### Hand-off format

**MP4 default**, **FCPXML via `--emit fcpxml` flag**. The EDL is a superset of OTIO and FCPXML; field mapping is one-to-one (R6 §FCPXML hand-off flag). Implementation deferred to phase 2; field-mapping table in R6 stays canonical.

### Architecture (MVP vs phase 2)

**MVP (week 1–2):**

```
skills/keyword-extractor-voiceover/
  SKILL.md, references/{schema,treatments,prompt,he-style}.md,
  scripts/{segment.py, classify_treatment.py, validate_edl.py},
  templates/{graphic_table.tsx, lower_third.tsx}
mcp/servers/voiceover-router/
  src/{index.ts, whisper.ts, stock.ts, generative.ts, embed.ts, saliency.ts}
prompts/voiceover-extractor-prompt.md
recipes/voiceover-to-broll.md
```

**Phase 2:** `mcp/servers/graphics-renderer/` (Remotion CLI wrapper, isolates Node deps), four remaining templates (`graphic_map`, `graphic_chart`, `title_card`, `quote_card`), `artifacts/react/voiceover-timeline.jsx`, `--emit fcpxml`, Storyblocks paid path. (R7 §MVP vs phase-2.)

### HE lemmatiser

**DictaBERT-lex** (default, SOTA on UD-Hebrew per ACL 2024); **YAP** offline fallback for air-gapped runs. Used by R8's "every term traces to transcript" guardrail. (R8 §Hallucination control.)

### Guardrails checklist

The 9-item editorial discipline pass before the EDL ships (R8 §Checklist):

1. STOP gate clean (security incident / election / public-figure death / gag order / disaster / named-figure → face) or `hard_news=true` override.
2. No transcript-absent terms (DictaBERT-lex lemma trace).
3. Numeric verbatim — every number in `graphic.props` matches a literal transcript number, else `GRAPHIC_REFUSED`.
4. Pixabay clips passed face/logo screen.
5. Cuts within ±0.25 s of `start_s`; else `whisperX` re-align.
6. Every broll carries the R4 license envelope `{source, clip_id, license, attribution, downloaded_at}`.
7. 90-day audit-JSON sidecar (`<out>.licenses.json`).
8. Editor-in-the-loop: hard-news segments require producer override; faces require producer face-binding.
9. `visual_treatment` from the closed 8-value enum; `category` from the R2 enum.

## Engagement with project-shape constraints

### 9:16 vertical

The 1080×1920 canvas is enforced at every layer. **Sourcing (R4)** uses Pexels `orientation=portrait` and Pixabay `orientation=vertical`; Ray2 and Gen-3 both accept `aspect_ratio="9:16"`. **Matching (R5)** drops candidates whose salient bbox crosses the 56% centre-crop window (`crop_safety = 0.0`) and penalises edge-anchored action (0.6). **Renderer (R6)** uses the FFmpeg per-clip normaliser before frames reach Remotion's `<OffthreadVideo>`. **Graphics (R-graphics)** templates are authored directly at 1080×1920 @ 30 fps in Remotion — no reframe pass needed for synthetic scenes.

### Hebrew-primary

Hebrew is structural, not a translation layer. **ASR (R1):** ivrit-ai's HE-tuned weights are the default, not English Whisper with HE language flag. **Schema (R2):** the bilingual rule pins `term`/`lemma` to verbatim Hebrew while `category` and `visual_treatment` stay English so the editor's stock-folder names line up. **Prompt (R3):** 4 of 5 few-shots are Hebrew, including the load-bearing temperature-table + map + sign-off cases. **Sourcing (R4):** because no stock source supports `he-IL`, we translate `visual_concept` to English before query (`visual_concept` is always English by R2's rule). **Matching (R5):** SigLIP-2 ViT-L is the embedding model precisely because it encodes Hebrew natively, opening a future HE-direct query path. **Lemmatiser (R8):** DictaBERT-lex handles binyanim and clitics that exact-match would miss.

### Mixed-treatment scenes

Each scene is broll OR graphic — never both as siblings; lower-thirds composite *over* a parent broll, but the EDL representation is one treatment per scene. R3's prompt classifies treatment per scene against the 8 trigger heuristics (R-graphics §Trigger rules). The renderer (R6) handles both classes in one Remotion `<Composition>`: broll → `<Sequence><OffthreadVideo /></Sequence>`; graphic → `<Sequence><GraphicTable {...props} /></Sequence>`; voiceover `<Audio>` outside the loop. This single-pass design is the reason Remotion beat FFmpeg/MoviePy for the renderer pick — every other option needed a second pass to rasterise graphics.

## Top 5 risks and mitigations

1. **Haiku 4.5 corrupts Hebrew (incl. nikud) inside JSON strings.** Pre-lock 10-voiceover eval (R3 §Evaluation harness); on any nikud-corruption hit, switch the HE lane to Sonnet 4.6 by default, accept the ~3× cost. (R3 + R8 carryover.)
2. **ivrit-ai weights drift between research and implementation.** Cite by **revision SHA** in `voiceover-router`'s model loader, not just by name; pin the exact commit in `package-lock` + a model-card hash check on first run. (R1 + HANDOFF §7.)
3. **Storyblocks vertical-orientation API filter unconfirmed.** Defer the paid path to phase 2 and run a sales call before any newsroom legal commitment. Free-tier (Pexels + Pixabay) is sufficient for MVP. (R4 open question.)
4. **Generated-graphic numeric mistake** — wrong temperature is materially worse than wrong B-roll. Numeric-verbatim guardrail rejects the scene with `{status:"GRAPHIC_REFUSED", scene_id, reason}`; producer hand-types the table. (R8 §Generated-graphic accuracy.)
5. **Remotion `<OffthreadVideo>` frame-accuracy on mixed-framerate broll** (Pixabay 25 fps, Storyblocks 23.976). Pre-render FFmpeg `fps=30` normaliser pass on every broll clip before it enters the EDL; renderer trusts that every input is 30 fps. (R6 open question.)

## 2-week implementation plan

### Week 1 — foundation

- Scaffold `skills/keyword-extractor-voiceover/` per R7 file paths; copy SKILL.md frontmatter shape from `skills/viral-news-scanner/`.
- Scaffold `mcp/servers/voiceover-router/` mirroring `asset-router`; register in `mcp/configs/creative-stack.mcp.json`. Stub-fallback policy: missing keys → deterministic stubs (CI green offline).
- Wire `transcribe(audio, lang)` to `faster-whisper` + `ivrit-ai/whisper-large-v3-turbo-ct2`; add `whisperX` second-pass mode behind `--align` flag.
- Ship Remotion templates `graphic_table.tsx` and `lower_third.tsx` (R-graphics paste-ready code); register them in `Root.tsx` at 1080×1920 @ 30 fps.
- Build the CLI (`kx extract`, `kx render`) and run end-to-end on a real HE weather clip from the friend (Noa stand-in if blocked).
- Build the **manual eval harness**: 10 voiceovers (5 HE, 5 EN), four binary scores per R3 §Evaluation harness (segmentation, treatment, keywords-visual, no-hallucination). Pass bar 9/10. Eval gates the Haiku-vs-Sonnet decision.

### Week 2 — matching + graphics + guardrails

- Implement `search_clips` (Pexels → Pixabay), `embed_clip` (SigLIP-2 ViT-L), `saliency_pass` (MediaPipe + U²-Net).
- Wire the matcher cascade: tag → SigLIP-2 rerank → Haiku judge on `max_score < 0.28`. Calibrate the threshold on a held-out HE weather set.
- Implement R8 guardrails: STOP gate (six trips), numeric-verbatim validator, DictaBERT-lex lemma trace, Pixabay face/logo screen, ±0.25 s re-align trigger.
- Emit `<out>.licenses.json` sidecar; configure 90-day retention path.
- Producer-facing CLI flags: `--lang {he,en}`, `--hard-news`, `--align`, `--escalate-on confidence<0.7`, `--emit {mp4,fcpxml}` (FCPXML deferred to phase 2 implementation but stub a no-op flag).

### Done-when

End-to-end run on Noa's 7-scene HE worked example produces a watchable **1080×1920 30 fps MP4** with at least one `broll` scene, one `graphic_table` scene, and a `title_card` sign-off; cuts within ±0.25 s; full `<out>.licenses.json` audit trail; eval harness reports ≥9/10 on the 10-voiceover set.

## Open questions liquidation

Pulled from every prior report; tagged **answered** / **deferred** / **needs user**.

- ASR: word-ts in `gpt-4o-transcribe` 2026 API revisions (R1) — **deferred**, segment-level acceptable; rely on whisperX.
- ASR: live HE WER deltas turbo-ct2 vs ct2 (R1) — **deferred**, picked turbo-ct2 on speed; revisit if accuracy fails eval.
- ASR: whisperX alignment quality on Hebrew (R1) — **needs spike** in Week 1 eval.
- ASR: published HE WER for `gpt-4o-transcribe` (R1) — **deferred**, EN lane only.
- Schema: `categories.json` inline vs newsroom-supplied (R2) — **answered** by R7: inline in Skill `references/`.
- Schema: empty `keywords[]` for pure-graphic scenes (R2) — **answered** by R8: always at least one anchor for transcript traceability.
- Schema: per-treatment `template`/`props` sub-schemas (R2) — **answered**, owned by R-graphics templates.
- Schema: strict vs lenient JSON validation (R2) — **answered**, strict + 1 retry per R3+R8.
- Schema: HE+EN code-switching (R2) — **answered**, one `language` per scene per R3 `<bilingual_rule>`.
- Prompt: Haiku 4.5 thinking budget (R3) — **deferred**, A/B in eval harness.
- Prompt: code-switching inside one scene (R3) — **deferred**, persona Q5 (`needs friend interview`).
- Prompt: validator strict vs lenient (R3) — **answered**, strict + 1 retry.
- Prompt: `categories.json` inline vs tool (R3) — **answered**, inline.
- Prompt: Haiku 4.5 nikud corruption (R3, R8) — **needs spike** in Week 1 eval; risk #1.
- Sourcing: Storyblocks API vertical filter (R4) — **deferred** to phase 2 sales call.
- Sourcing: Envato subscriber API (R4) — **deferred**, not on critical path.
- Sourcing: Luma Ray2 720p → 1080×1920 upscale (R4) — **answered**, FFmpeg `scale` per R6.
- Sourcing: HE-native CLIP/SigLIP query (R4, R5) — **deferred**, tracked via SigLIP-2 pick; revisit phase 2.
- Sourcing: Mapbox news-media exception coverage (R-graphics) — **needs user / newsroom legal**; Maptiler/OSM as backup.
- Sourcing: vertical-weather catalogue size on paid stock (R4) — **deferred** to trial-account phase.
- Matching: CLIP threshold calibration (R5) — **answered**, Week-2 calibration on held-out set.
- Matching: multi-frame embeddings (R5) — **deferred** to phase 2.
- Matching: saliency backend pick (R5) — **answered**, MediaPipe + U²-Net both.
- Matching: `broll_montage` per-clip vs aggregate scoring (R5) — **deferred**, EDL shape decision in phase 2.
- Matching: MLLM-judge bias (R5) — **answered**, N=3 stays in safe regime.
- Renderer: `<OffthreadVideo>` frame-accuracy on 25/23.976 fps (R6) — **answered**, FFmpeg fps=30 pre-pass; risk #5.
- Renderer: Ken-Burns on static broll (R6) — **deferred** to phase 2.
- Renderer: crossfade vs hard-cut (R6) — **deferred**, hard-cut MVP.
- Renderer: audio ducking under `lower_third` (R6) — **deferred**, fixed −3 dB MVP.
- Renderer: FFmpeg concat demuxer copy-mode (R6) — **deferred**, optimisation only.
- Graphics: Hebrew variable-font reliability in headless Chromium (R-graphics) — **needs spike** in Week 1 (Heebo/Rubik bundle as WOFF2 if flaky).
- Graphics: Mapbox GL animated mode under `renderFrames()` (R-graphics) — **deferred** to phase 2.
- Graphics: `lower_third` as scene vs overlay (R-graphics) — **answered** by R6 EDL: scene with parent broll reference.
- Graphics: `generated_clip` cost ceiling (R-graphics) — **answered**, ~$0.45–0.50/5 s; budget fits 5/day.
- Architecture: graphics-renderer split (R7) — **answered**, MVP single MCP, phase-2 split.
- Architecture: HE lemmatiser placement (R7) — **answered**, MCP-side helper inside voiceover-router.
- Architecture: templates inside Skill vs top-level (R7) — **answered**, inside Skill (progressive disclosure).
- Guardrails: Haiku 4.5 nikud (R8) — see prompt section above; risk #1.
- Guardrails: 90-day retention sufficiency under Israeli broadcast law (R8) — **needs user / newsroom legal**.
- Guardrails: DictaBERT-lex laptop performance (R8) — **needs spike** Week 2.
- Guardrails: election-day flag (R8) — **needs user** (calendar feed vs producer toggle).
- Guardrails: gag-order list source (R8) — **needs user / newsroom legal**.
- R0 persona: Storyblocks subscription presence (R0) — **needs friend interview**.
- R0 persona: temperature-table source-of-truth — Excel / IMS feed / hand-typed (R0) — **needs friend interview**; gates numeric-verbatim guardrail's input layer.
- R0 persona: producer/legal sign-off step (R0) — **needs friend interview**.
- R0 persona: RTL timeline preference (R0) — **deferred** to artifact phase.
- R0 persona: weather-only vs wedge to other beats (R0) — **deferred**, MVP weather-only.
- Prior art: Hebrew bidi captions in surveyed tools (R-prior-art) — **deferred**, hands-on test outside MVP scope.
- Prior art: Adobe Stock indemnification scope (R-prior-art) — **deferred**, not on critical path.
- Prior art: "Pictureframe" reality check (R-prior-art) — **answered**, treat as vapor.

## Sources

- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` (locked scope)
- `research/keyword-extractor-voiceover/PLAN.md` (execution plan)
- `research/keyword-extractor-voiceover/HANDOFF.md` (operational briefing)
- `research/keyword-extractor-voiceover/00-use-case-discovery.md` (R0)
- `research/keyword-extractor-voiceover/00b-prior-art-competitor-scan.md` (R-prior-art)
- `research/keyword-extractor-voiceover/00c-scene-types-and-graphic-templates.md` (R-graphics)
- `research/keyword-extractor-voiceover/01-whisper-variant-comparison.md` (R1)
- `research/keyword-extractor-voiceover/02-scene-and-keyword-schema.md` (R2)
- `research/keyword-extractor-voiceover/03-prompt-design-and-caching.md` (R3)
- `research/keyword-extractor-voiceover/04-background-video-sourcing.md` (R4)
- `research/keyword-extractor-voiceover/05-matching-algorithm.md` (R5)
- `research/keyword-extractor-voiceover/06-output-edl-and-renderer.md` (R6)
- `research/keyword-extractor-voiceover/07-repo-architecture-fit.md` (R7)
- `research/keyword-extractor-voiceover/08-newsroom-guardrails-and-language.md` (R8)
- `skills/viral-news-scanner/SKILL.md` + `references/editorial-standards.md` (newsroom prior art)
- `mcp/servers/asset-router/README.md` (MCP shape mirror)
- `knowledge/01-claude-ecosystem.md` §1.1, `knowledge/02-skills-system.md`, `knowledge/03-artifacts.md`, `knowledge/09-prompting.md`, `knowledge/10-workflows.md`, `knowledge/13-asset-pipelines.md`, `knowledge/99-caveats.md`
- [Remotion — Composition / Sequence / passing props](https://www.remotion.dev/docs/composition)
- [DictaBERT-lex on Hugging Face](https://huggingface.co/dicta-il/dictabert-lex)
- [SigLIP-2 paper (arXiv 2502.14786)](https://arxiv.org/abs/2502.14786)
- [Anthropic — Prompt caching docs](https://docs.claude.com/en/docs/build-with-claude/prompt-caching)
