# Pre-Research — Keyword Extractor for Voiceover-Driven Video Auto-Edit

> **What this document is.** A scoping doc for a *new* tool that turns a daily news voiceover (initial use case: a friend's weather segment at a news company) into a timed keyword stream suitable for automating background-video selection. The output of executing the research below is a set of small markdown reports under `research/keyword-extractor-voiceover/` — *not* code, *not* the final design. After the reports land, a separate implementation plan will be written.
>
> Status: draft · Owner: TBD · Last updated: 2026-05-07 · Branch: `claude/keyword-extractor-voiceover-K6WTi`

---

## 1. Context

The user's friend works at a news company and records a daily voiceover (e.g. weather). Today the editor manually finds B-roll / background clips that match the words. We want to automate the matching step end-to-end:

```
audio file (voiceover)
  → ASR (OpenAI Whisper) → transcript + word-level timestamps
  → keyword extractor (Claude API)
  → ranked keywords with start/end times + visual concept hints
  → background-video chooser (stock library / generated / curated bank)
  → edit decision list (EDL) → rendered MP4
```

Concrete example the user gave:
- Input audio: *"the weather will be rainy today"*
- Expected keywords: `rain` (or `rainy`, `umbrella`, `wet street`), with timestamps and a visual concept the chooser can search.

This sits squarely inside the `claude-creative-stack` mission (art / animation / asset pipelines). It also extends the existing **asset-router MCP** pattern from `knowledge/13-asset-pipelines.md` and the agentic-asset-pipeline recipe — but oriented around *audio-in → video-out* rather than *prompt-in → image-out*.

We need research before design because several decisions are not yet obvious:

- Which Whisper variant (OpenAI cloud API vs `faster-whisper` local vs `whisper.cpp` vs **`ivrit-ai` Hebrew-tuned Whisper**) — accuracy, cost, latency, language support, word-level timing. The Hebrew-newsroom angle makes `ivrit-ai` the most-likely default rather than a footnote.
- What keyword schema does Claude return so the chooser can do a deterministic match (term alone is not enough; "rain" needs a visual concept like *"raindrops on window"*).
- Where do background videos come from (stock API: Pexels, Pixabay, Storyblocks; generated via Luma/Runway; pre-curated local bank per beat / topic).
- Output format the editor's pipeline can actually ingest — FFmpeg-renderable EDL JSON, Premiere/DaVinci XML, or a Remotion composition.
- How this slots into the repo's three-layer pattern: **Skill** (deterministic extractor) + **MCP** (Whisper + ffmpeg side-effects) + **Artifact** (in-browser preview timeline).
- Language. The friend works at an Israeli news company; Hebrew weather voiceover is plausible. Whisper handles Hebrew but timing accuracy and Claude's keyword extraction prompt both need testing for non-English.

Each unknown maps to a report below.

---

## 2. Research Goals

By the end of the research phase we must be able to answer, with citations:

1. **Whisper variant pick.** A defensible choice between OpenAI cloud Whisper, `faster-whisper`, `whisper.cpp`, and **`ivrit-ai`'s Hebrew-tuned Whisper variants** (`whisper-large-v3-turbo`, `whisper-large-v3-turbo-ct2`, `whisper-large-v3-ct2`) — with numbers on accuracy (English + Hebrew), word-level timing precision, $/minute, latency, and offline story. ivrit-ai is the obvious default candidate for Hebrew given it's purpose-trained on >22,000 h of Hebrew audio.
2. **Keyword schema.** A frozen JSON shape Claude returns per voiceover — fields, types, scoring, confidence, and the visual concept string the video chooser can query.
3. **Prompt design.** A single prompt template (with caching plan) that reliably extracts visual-friendly keywords from news copy in EN and HE, including a small few-shot bank.
4. **Background-video sourcing.** A ranked recommendation across stock APIs (Pexels, Pixabay, Storyblocks, Artgrid), AI-generated (Luma Ray2, Runway Gen-3), and a local curated bank — with licensing notes for newsroom use.
5. **Matching algorithm.** How to score `(keyword, visual_concept) → candidate clip` — embedding similarity, tag matching, or LLM-judge loop. Cost ceiling per minute of voiceover.
6. **Output format.** The exact EDL shape the next stage (renderer) consumes, plus a thin FFmpeg renderer reference so the pipeline produces a watchable MP4 end-to-end.
7. **Architecture fit.** Where this lives in the repo: a new skill (`skills/keyword-extractor`), an MCP server (`mcp/servers/voiceover-router`?), an artifact preview, or all three.
8. **Newsroom guardrails.** What a news producer specifically needs (consistent attribution, no hallucinated visuals, no unlicensed clips, language register, sensitive-topic handling — see `viral-news-scanner` skill for prior art).

---

## 3. Report Catalog

All reports land under `research/keyword-extractor-voiceover/`. Each report follows the repo's standard shape:

```
# <Report Title>
> Status: draft | reviewed | locked
> Owner: <agent or human>   Last updated: <date>

## TL;DR (≤150 words)
## Scope & questions
## Findings (with inline citations)
## Implications for keyword-extractor-voiceover
## Open questions
## Sources
```

| ID  | File                                       | Length     | Source mix                                                                                    | Owner            |
| --- | ------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------- | ---------------- |
| R1  | `01-whisper-variant-comparison.md`         | 700–1000 w | OpenAI API docs, `faster-whisper` + `whisper.cpp` GitHub READMEs, HF model cards, benchmarks  | WebSearch + Read |
| R2  | `02-keyword-schema-and-fields.md`          | 500–800 w  | Claude tool-use docs, JSON-schema patterns from `viral-news-scanner`, video-search APIs       | Explore + Plan   |
| R3  | `03-prompt-design-and-caching.md`          | 700–1000 w | `knowledge/09-prompting.md`, `knowledge/01-claude-ecosystem.md` (caching), few-shot patterns  | Explore          |
| R4  | `04-background-video-sourcing.md`          | 800–1200 w | Pexels/Pixabay/Storyblocks/Artgrid/Envato API docs, Luma Ray2, Runway Gen-3 — `13-asset-pipelines.md` matrix as base | WebSearch        |
| R5  | `05-matching-algorithm.md`                 | 500–800 w  | CLIP / video-tag embeddings, sentence-transformers, LLM-judge papers                          | WebSearch        |
| R6  | `06-output-edl-and-renderer.md`            | 600–900 w  | FFmpeg concat docs, Premiere FCPXML, Remotion docs, OTIO                                      | WebSearch        |
| R7  | `07-repo-architecture-fit.md`              | 500–700 w  | `knowledge/02-skills-system.md`, `knowledge/10-workflows.md`, asset-router MCP source         | Explore          |
| R8  | `08-newsroom-guardrails-and-language.md`   | 500–800 w  | `skills/viral-news-scanner/SKILL.md`, IBA/AP style notes, Whisper Hebrew accuracy reports     | Read + WebSearch |
| R9  | `09-synthesis-and-recommendations.md`      | 1000–1500 w | Synthesises R1–R8 into a single recommendations doc that feeds the next phase                | Plan agent       |

**R1–R8 can run in any order.** R9 strictly depends on R1–R8.

---

## 4. Per-Report Briefs

### R1 — Whisper Variant Comparison
- **Must answer:** for **OpenAI cloud Whisper** (`whisper-1`, `gpt-4o-transcribe`), **`faster-whisper`** (CTranslate2), **`whisper.cpp`**, **`whisperX`** (forced-alignment for word timing), and **`ivrit-ai`'s Hebrew-tuned variants** — WER on English news, WER on Hebrew, word-level-timestamp precision (frames of drift on a 60 s clip), $/minute, latency for 60 s audio, GPU/CPU footprint, language autodetect quality.
- **Must skip:** non-Whisper ASR (Deepgram, AssemblyAI) — log them in "Open questions" as a possible R-future, but don't catalogue here.
- **`ivrit-ai` sub-brief (Hebrew-specific lane).** Catalogue all three currently-published variants:
  - `ivrit-ai/whisper-large-v3-turbo` — `transformers`-format Hebrew-tuned turbo build of OpenAI's `whisper-large-v3-turbo`.
  - `ivrit-ai/whisper-large-v3-turbo-ct2` — same, in **CTranslate2 format** so it drops into `faster-whisper` directly. Trained on ~295 h volunteer + ~93 h pro Hebrew audio (`crowd-transcribe-v5`). This is the most likely default for the Israeli-newsroom use case.
  - `ivrit-ai/whisper-large-v3-ct2` — non-turbo, slower but historically slightly more accurate.
  - Older: `ivrit-ai/whisper-large-v2-tuned`.
  - Pull WER numbers directly from the **Hebrew Speech Recognition Leaderboard** (`ivrit-ai-hebrew-transcription-leaderboard.hf.space`), not from the model cards — leaderboard is community-maintained and ranks Whisper, ivrit-ai variants, Amazon Transcribe, and others on the same datasets.
  - Verify the **license** on each model card: ivrit.ai datasets are released under a "specially crafted" permissive licence that explicitly allows commercial AI training; **the model weights inherit Whisper's MIT licence but confirm per release** — a newsroom legal review will ask for this in writing.
  - **Word-timestamp caveat (important for our pipeline):** earlier ivrit-ai checkpoints had coarse segmentation and required `stable-ts` post-processing; later versions added timestamp labels to ~40 % of training samples and improved. Re-test on a real weather clip before locking the pick. If timing is still loose, plan to combine ivrit-ai for the transcript + `whisperX`/`stable-ts` for forced-alignment word timing.
- **Implications section:** one default pick + one fallback, plus a Hebrew-specific default. Suggested shape: "default `ivrit-ai/whisper-large-v3-turbo-ct2` (via `faster-whisper`) for HE; default OpenAI `gpt-4o-transcribe` for EN; fall back to `whisper.cpp` for fully-offline air-gapped runs." Include a "if word timestamps drift > 250 ms, run `whisperX` alignment as a second pass" rule.
- **Search seeds:** "faster-whisper benchmark 2026", "whisper.cpp word timestamps", "Whisper Hebrew accuracy", "gpt-4o-transcribe pricing", "whisperX alignment", "ivrit-ai whisper-large-v3-turbo-ct2", "ivrit.ai Hebrew transcription leaderboard", "ivrit-ai Interspeech 2025".

### R2 — Keyword Schema and Fields
- **Must answer:** the exact JSON shape Claude returns per voiceover. At minimum each keyword item should carry: `term`, `lemma`, `visual_concept` (free-text query for the video search), `start_s`, `end_s`, `weight` (0–100), `category` (e.g. `weather`, `place`, `person`, `event`, `mood`), `confidence` (0–1), `alternatives[]`. Top-level fields: `language`, `transcript`, `duration_s`, `keywords[]`, `notes`.
- **Must compare:** flat keyword list vs scene-level groupings (a "scene" being a span of consecutive keywords that share a visual). The chooser likely wants scenes; surface that decision.
- **Closed-list `category`.** The category enum must mirror the editor's actual stock-footage folders/tags (e.g. `rain | heavy_rain | snow | sun | clear_sky | clouds | overcast | wind | storm | thunder | fog | hot | cold | humid | city_skyline | map_overlay | temperature_graphic`). Without a closed list Claude invents labels like `drizzle` or `partly cloudy with a chance of rain` and the matcher has nothing to map against. The schema must include the enum inline so the prompt template and the matcher stay in sync.
- **Implications section:** a frozen JSON schema (paste-ready) + 2 worked examples (1 EN weather, 1 HE weather), plus a placeholder `categories.json` that the user supplies once and the schema then references.
- **Reference:** `skills/viral-news-scanner/references/output-schema.md` — same frozen-schema discipline.

### R3 — Prompt Design and Caching
- **Must answer:** a single prompt template that takes `{transcript, language, duration_s}` and returns the schema from R2. Must include: system message with role + format contract, 3–5 few-shot examples (mix of EN/HE, mix of weather and other news lanes), explicit instruction to favour visual concepts ("rain on window" beats "rain"), explicit instruction *not* to invent timestamps when transcript word-timestamps are absent.
- **Bilingual rule.** When `language = he`, `term`/`lemma` stay in Hebrew (preserve the original word), but `category` is **always** English and drawn from the R2 enum so it matches the editor's folder names. Few-shots must demonstrate this split.
- **Caching plan:** what goes in cache breakpoints (system prompt + few-shots stay cached; transcript is the only dynamic chunk). Reference `knowledge/01-claude-ecosystem.md` cache pricing and `knowledge/09-prompting.md` patterns.
- **Model pick:** Claude Haiku 4.5 vs Sonnet 4.6 vs Opus 4.7 — extraction is structured and short; default Haiku unless quality testing in R9 forces an upgrade.
- **Implications section:** the prompt as a paste-ready code block + a 1-paragraph evaluation harness sketch (10 voiceovers, manual scoring rubric).

### R4 — Background-Video Sourcing
- **Must answer:** for each of Pexels, Pixabay, Storyblocks, Artgrid, Envato, Luma Ray2, Runway Gen-3:
  - API surface (`search`, `download`, rate limits)
  - License (commercial use? newsroom-permitted? attribution required?)
  - Quality and topical coverage for "weather" (rain, snow, sun, wind, storm, fog)
  - $/clip or $/month
  - Whether assets can be cached and re-used across daily runs
- **Must answer:** stock-vs-generate trade-off — when is it cheaper / faster / more on-brand to generate a 5s Ray2 clip vs query Pexels.
- **Implications section:** a default sourcing order (e.g. "Pexels first → Pixabay fallback → Ray2 generate as last resort"), a per-keyword sourcing rule table, and a license-traceability requirement (every clip in the EDL carries a `license` field).
- **Reference:** `knowledge/13-asset-pipelines.md` §13.1 provider matrix and §13.7 licensing block — extend rather than re-research what's there.

### R5 — Matching Algorithm
- **Must answer:** how does `(keyword, visual_concept) → candidate clip` actually score? Three options to evaluate:
  1. **Tag/keyword string match** against stock-API tags (cheapest; what most stock APIs already do server-side).
  2. **CLIP embedding similarity** between `visual_concept` text and clip thumbnail/preview frame embeddings (medium cost; needs embedding storage).
  3. **LLM-judge loop** — Claude scores 3 candidate clips and picks one with reasoning (highest cost; best quality on ambiguous concepts).
- **Must answer:** cost per minute of voiceover assuming 1 keyword every 4 seconds → ~15 keywords/min × N candidates.
- **Implications section:** a default matching pipeline (e.g. "tag match → top 3 → CLIP rerank → LLM-judge only on low-confidence"), with a clear cost ceiling.
- **Search seeds:** "CLIP video retrieval 2026", "sentence-transformers tag matching", "LLM-as-judge image selection".

### R6 — Output EDL and Renderer
- **Must answer:** the EDL JSON shape (timeline of `{clip_url, in, out, place_at}` segments) plus how the voiceover audio is laid over it. Four render-target options:
  1. **FFmpeg concat + filter_complex** — cheapest, fully scriptable, no UI.
  2. **MoviePy** — Python-native wrapper around FFmpeg; ergonomic for a Python pipeline (`CompositeVideoClip(...).set_audio(voiceover)`); slower than raw FFmpeg but trivially batches on the same machine that's running Whisper + Claude.
  3. **Remotion** (React-based programmatic video) — gives a web-previewable composition that matches our artifact-first ethos.
  4. **FCPXML / Premiere XML / OTIO** — hand off to the human editor instead of rendering.
- **Must answer:** a thin FFmpeg reference command that takes the EDL + voiceover and produces an MP4, so the pipeline is end-to-end demonstrable.
- **Implications section:** default EDL shape + default renderer = FFmpeg; Remotion as the artifact-side preview; OTIO/FCPXML deferred until newsroom asks.
- **Search seeds:** "FFmpeg concat demuxer", "Remotion 2026 docs", "OpenTimelineIO JSON".

### R7 — Repo Architecture Fit
- **Must answer:** how this maps onto the existing three-layer pattern:
  - **Skill (`skills/keyword-extractor/`)** — deterministic extractor logic, prompt template, schema.
  - **MCP (`mcp/servers/voiceover-router/`)** — side-effects: call Whisper, call stock APIs, run FFmpeg. Stub fallback like asset-router.
  - **Artifact (`artifacts/react/voiceover-timeline.jsx`)** — preview UI: waveform + transcript + keyword chips on a timeline + clip thumbnails snapped to spans.
  - **Recipe (`recipes/voiceover-to-broll.md`)** — end-to-end stitch demo.
- **Must answer:** which of the four are MVP-required vs nice-to-have. Default recommendation: Skill + MCP for MVP; Artifact and Recipe phase 2.
- **Reference:** `knowledge/02-skills-system.md`, `knowledge/10-workflows.md`, `mcp/servers/asset-router/` source.

### R8 — Newsroom Guardrails and Language
- **Must answer:** what specifically does a daily-news producer need that a generic creative pipeline does not.
  - Language: Hebrew + English support (assume HE primary given the friend's Israeli newsroom; confirm with user).
  - Topic register: weather is benign, but a generalised tool may run on hard news — need a hoax / sensitive-topic gate copied from `viral-news-scanner` (active security incident → STOP).
  - Attribution: every B-roll clip in the final EDL must carry source + licence in metadata for legal review.
  - Timing tolerance: news cuts are tight; we need clip-cuts within ±0.25s of keyword start.
  - Hallucination control: keyword extractor must never produce a keyword *not present* in the transcript (lemmatised match required).
- **Implications section:** a guardrails checklist that the skill runs *before* it returns. Borrow language and tone from `viral-news-scanner`.
- **Reference:** `skills/viral-news-scanner/SKILL.md`, especially the "Honesty constraints" block.

### R9 — Synthesis and Recommendations
- **Must answer:** a single doc that fuses R1–R8 into:
  - One-paragraph TL;DR.
  - The frozen JSON schema (from R2).
  - The frozen prompt template (from R3).
  - The default sourcing + matching pipeline (from R4 + R5).
  - The default EDL + renderer (from R6).
  - The repo architecture (from R7) with file paths and an MVP/next-phase split.
  - Top 5 risks and how each is mitigated.
  - A concrete 2-week implementation plan, week-by-week, that the next agent can execute.
- **Depends on:** R1–R8 locked.

---

## 5. Open Questions for the User (block the research)

Ask before R1 starts:

1. **Language.** English, Hebrew, or both? (Affects R1 Whisper pick and R3 few-shots.)
2. **Online vs offline.** Does the newsroom allow uploading audio to OpenAI's cloud, or does it have to run on-prem? (Affects R1.)
3. **Background video budget.** Does the friend's newsroom already have a stock subscription (Storyblocks / Artgrid / Envato), or are we picking from free tiers (Pexels / Pixabay)? (Affects R4.)
4. **Hand-off vs full render.** Does the editor want a finished MP4 from the tool, or an XML/EDL they open in Premiere/DaVinci? (Affects R6.)
5. **Daily volume.** One weather voiceover per day, or many segments across the show? (Affects cost ceiling in R5.)
6. **Hebrew script direction.** If HE, the timeline UI needs RTL handling — a no-op for the CLI MVP, but flagged for the artifact phase.

If the user is unavailable, **default assumptions** for the research phase are:

- Both EN and HE, HE primary.
- Cloud Whisper allowed (the friend uses a regular newsroom not a classified one). For HE specifically, default to **`ivrit-ai/whisper-large-v3-turbo-ct2` via `faster-whisper`** (runs locally, Hebrew-tuned, CTranslate2-fast); use cloud Whisper as a quality cross-check rather than primary.
- Free-tier stock first; paid is an opt-in later.
- Render to MP4 by default; emit FCPXML on a flag.
- ~5 voiceovers/day, ≤2 min each.

---

## 6. Out of Scope (do not research, do not implement)

- Live transcription (we batch on completed audio files).
- Avatar / lip-synced presenters — different problem.
- Music selection — could be a sibling tool later, not this one.
- Automatic translation between EN and HE — the editor controls language.
- On-air graphics (lower thirds, weather maps) — the news graphics system handles those.
- Anything that touches the news company's internal CMS — they integrate, we don't.

---

## 7. Initial Web Findings (seed pass)

> Quick web research run during pre-research scoping (May 2026) so the next agent doesn't start cold. **High-signal findings only**; full analysis is the job of the per-report deep dives. **Re-verify before locking** — pricing and licence terms rotate fast (per `knowledge/99-caveats.md` §"Licensing & cost rotations").

### 7.1 Stock-video sources (feeds R4)

| Source          | API  | Newsroom-safe?  | Cost                                            | Gotchas                                                                                                                                                                                  |
| --------------- | ---- | --------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pexels**      | Free | Yes             | $0; unlimited API per key                       | Attribution not legally required but appreciated. Sensible default first try.                                                                                                            |
| **Pixabay**     | Free | Yes (with care) | $0                                              | Cannot resell content standalone. **Identifiable people, logos, brands, buildings may require additional consent** — a real risk for newsroom B-roll. Plan a face/logo screen on results. |
| **Storyblocks** | Paid | Yes             | API pricing not public; enterprise ~$6k–12k+/yr | Broadcast/TV requires Business+ (Individual/Small Business explicitly prohibited). **$20k indemnification** — uniquely relevant for newsroom legal. Contact-sales-only. Phase 2 upgrade.   |

Sources: [Pexels licence](https://www.pexels.com/license/), [Pexels API docs](https://www.pexels.com/api/documentation/), [Pixabay licence](https://pixabay.com/service/license-summary/), [Pixabay API docs](https://pixabay.com/api/docs/), [Storyblocks API](https://www.storyblocks.com/resources/business-solutions/api), [Storyblocks pricing](https://www.storyblocks.com/pricing).

### 7.2 ASR pricing snapshot (feeds R1)

- **OpenAI `gpt-4o-transcribe`** — $0.006 / minute (≈ $0.36 / hour). Per-token billing alternative: $2.50 / 1M in, $10.00 / 1M out.
- **OpenAI `gpt-4o-mini-transcribe`** — $0.003 / minute. Cost-sensitive English default if accuracy holds.
- **Diarize variant** — 2.5× base price. Single weather presenter = not worth it.
- **`ivrit-ai/whisper-large-v3-turbo-ct2`** — $0 marginal after model download; CPU-OK via `faster-whisper` (`compute_type="int8"`). Hebrew default.
- **Implication:** at ~5 voiceovers × ≤2 min/day, cloud Whisper ≈ $0.06/day on `gpt-4o-transcribe`. The HE pick is therefore an *accuracy* decision, not a cost one — fold into R1.

Sources: [OpenAI transcription pricing (May 2026)](https://costgoat.com/pricing/openai-transcription), [OpenAI API pricing](https://developers.openai.com/api/docs/pricing), [`gpt-4o-transcribe` model card](https://developers.openai.com/api/docs/models/gpt-4o-transcribe).

### 7.3 Renderer landscape (feeds R6)

- **MoviePy** — v2.2.1 (Feb 2026); Python 3.9+. **v1 is unmaintained — pin v2 explicitly.** v2 dropped ImageMagick / PyGame / OpenCV / scipy and unified on Pillow → smaller install footprint. Maintainers openly seeking help; flag single-maintainer risk in R6.
- **Remotion** — actively developed; needs Node 18+ and local FFmpeg. Ships an official "agent skill" pattern (28 rule files) for Claude Code / Codex / Cursor — so Remotion + this skill could become the artifact-preview surface for free in phase 2.
- **FFmpeg `concat` + `filter_complex`** — still the no-deps MVP cheapest path.
- **Implication:** default = FFmpeg CLI for the MVP renderer; MoviePy v2.x for Python-native pipelines (same machine as Whisper + Claude); Remotion deferred to the artifact phase per R7.

Sources: [MoviePy on PyPI](https://pypi.org/project/moviepy/), [MoviePy v1→v2 migration guide](https://zulko.github.io/moviepy/getting_started/updating_to_v2.html), [MoviePy GitHub](https://github.com/Zulko/moviepy), [Remotion homepage](https://www.remotion.dev/), [Remotion docs](https://www.remotion.dev/docs/).

### 7.4 Carry-overs into R8 (newsroom guardrails)

- Pixabay's licence flags identifiable-person and brand-logo risk explicitly. Skill must run a "before-cut" gate that screens returned clips, especially on hard-news segments — extends the existing guardrails list in R8.
- Storyblocks' $20k indemnification is the only indemnified path among the three near-term options. Surface this to the user if their newsroom legal asks "what happens if a clip turns out to be unlicensed?"

---

## 8. Done When

The research phase is done when:

- R1–R8 are each `Status: locked`.
- R9 (synthesis) names a single default for every decision.
- The user has signed off on R9's 2-week implementation plan.
- The next doc in the folder is `IMPLEMENTATION-PLAN.md` (or equivalent), which this pre-research doc explicitly does *not* try to write.

## 9. See Also

- `knowledge/13-asset-pipelines.md` — provider matrix; this tool extends the same pattern audio-side.
- `knowledge/07-audio.md` — audio primitives we may need on the artifact preview side.
- `knowledge/09-prompting.md` — prompt-engineering patterns for the extractor.
- `knowledge/10-workflows.md` — Skill+MCP+Artifact composition.
- `skills/viral-news-scanner/SKILL.md` — prior art for newsroom-grade JSON output and editorial guardrails.
- `mcp/servers/asset-router/` — the side-effect-router MCP shape we'll mirror.
- `recipes/agentic-asset-pipeline.md` — the canonical end-to-end recipe pattern.
