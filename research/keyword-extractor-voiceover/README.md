# Keyword Extractor for Voiceover-Driven Video Auto-Edit — Research Index

> Single front door. Read the status table, then dive into a specific report only when something catches your eye.

**Project goal.** Turn a daily news voiceover (initial use case: an Israeli newsroom weather segment) into a timed **scene** stream — each scene either a B-roll match or a generated on-air graphic (e.g. a temperature table across cities). Output 1080×1920 MP4 for Reels / TikTok / Shorts.

**Status legend.** `pending` = not started · `draft` = first pass written · `reviewed` = read-through complete · `locked` = user-approved.

## Reports

| ID            | File                                                | Status  | Owner | Updated | 30-word abstract |
|---------------|-----------------------------------------------------|---------|-------|---------|------------------|
| —             | [`PRE-RESEARCH.md`](PRE-RESEARCH.md)                | locked  | user  | 2026-05-07 | Originating scope doc — research goals, report catalogue, defaults, initial web findings, 9:16 vertical constraint propagated. |
| —             | [`PLAN.md`](PLAN.md)                                | draft   | claude | 2026-05-07 | Execution plan — agent assignments per report, wave grouping, methodology, acceptance criteria. |
| —             | [`HANDOFF.md`](HANDOFF.md)                          | draft   | claude | 2026-05-07 | Operational briefing for the next executing agent — defaults locked, pre-flight intelligence, blockers and work-arounds. |
| R0            | [`00-use-case-discovery.md`](00-use-case-discovery.md) | draft   | wave-1 agent | 2026-05-07 | 14-question interview script + Noa Ben-Ari persona with a 7-scene HE weather worked example mixing broll / graphic_table / graphic_map / lower_third / title_card. |
| R-prior-art   | [`00b-prior-art-competitor-scan.md`](00b-prior-art-competitor-scan.md) | draft   | wave-1 agent | 2026-05-07 | 10-tool survey (Pictory, InVideo, OpusClip, Submagic, Veed, Descript, CapCut, Premiere+Firefly, Runway, Pictureframe). HE-first × scene-first × integrated-graphics × newsroom audit trail = unmet 4-way intersection. |
| R-graphics    | [`00c-scene-types-and-graphic-templates.md`](00c-scene-types-and-graphic-templates.md) | draft   | wave-2 agent | 2026-05-07 | Locked 8-value `visual_treatment` enum + Remotion React as default template stack for all 6 graphic treatments + temperature-table worked example with RTL handling. Open Q: Mapbox newsroom-licence. |
| R1            | [`01-whisper-variant-comparison.md`](01-whisper-variant-comparison.md) | draft   | wave-1 agent | 2026-05-07 | 9-variant comparison. HE candidate: `ivrit-ai/whisper-large-v3-turbo-ct2` (leaderboard #1). EN candidate: `gpt-4o-mini-transcribe` ($0.003/min) or `gpt-4o-transcribe` for accuracy. Open Q: word-level timestamps in gpt-4o-transcribe. |
| R2            | [`02-scene-and-keyword-schema.md`](02-scene-and-keyword-schema.md) | draft   | wave-2 agent | 2026-05-07 | Scene-first JSON schema with conditional `broll` / `graphic` payloads, closed `category` enum, bilingual rule (HE term/lemma + EN category/treatment), `crop_safety_priority` for vertical matching. |
| R3            | [`03-prompt-design-and-caching.md`](03-prompt-design-and-caching.md) | pending | tbd | — | Single-pass prompt template that segments transcript into scenes, classifies treatment, extracts keywords. Caching plan + few-shots EN/HE. |
| R4            | [`04-background-video-sourcing.md`](04-background-video-sourcing.md) | draft   | wave-2 agent | 2026-05-07 | Pexels (free, default first-try) → Pixabay (free fallback, 24-hr cache mandatory, identifiable-person risk) → Luma Ray2 / Runway Gen-3 (~$0.50/5s, 9:16 native) for fallback generation. Storyblocks paid path for indemnification. Artgrid no public API. No source supports HE search — translate first. |
| R5            | [`05-matching-algorithm.md`](05-matching-algorithm.md) | pending | tbd | — | Tag match → CLIP rerank → LLM-judge fallback. Vertical-aware `crop_safety` term. Cost ceiling per minute. |
| R6            | [`06-output-edl-and-renderer.md`](06-output-edl-and-renderer.md) | draft   | wave-3 agent | 2026-05-07 | EDL: 4 top-level fields + 7 per-scene + 5-field licence envelope = ~16 distinct fields. Default renderer: **Remotion** (handles broll Video + graphic React templates in one composition). FFmpeg fallback; FCPXML `--emit` flag. Open Q: OffthreadVideo frame-accuracy with mixed-framerate sources. |
| R7            | [`07-repo-architecture-fit.md`](07-repo-architecture-fit.md) | pending | tbd | — | Skill + MCP + Artifact + Recipe layout; templates dir for graphic scenes; possibly a `graphics-renderer` MCP. MVP vs phase-2 split. |
| R8            | [`08-newsroom-guardrails-and-language.md`](08-newsroom-guardrails-and-language.md) | pending | tbd | — | HE+EN guardrails, hoax/sensitive-topic gate, attribution, ±0.25s timing, hallucination control, accuracy of generated data graphics. |
| R9            | [`09-synthesis-and-recommendations.md`](09-synthesis-and-recommendations.md) | pending | tbd | — | Single recommendation across R0–R8: ASR pick, schema, prompt, sourcing, matching, renderer, architecture, top-5 risks, 2-week plan. |

## See also

- `knowledge/13-asset-pipelines.md` — provider matrix R4 extends.
- `knowledge/05-graphics-design.md`, `knowledge/08-dataviz.md` — referenced by R-graphics.
- `knowledge/09-prompting.md`, `knowledge/01-claude-ecosystem.md` — referenced by R3.
- `skills/viral-news-scanner/SKILL.md` — prior art for newsroom-grade JSON output and editorial guardrails.
- `mcp/servers/asset-router/` — MCP shape R7 mirrors.
- `research/biome-beats/` — structural template for this folder.
