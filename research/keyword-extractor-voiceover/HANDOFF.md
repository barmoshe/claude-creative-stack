# Keyword Extractor Research — Handoff to the Next Agent

> You are picking up a research project cold. Read this file first, then `PRE-RESEARCH.md` (locked scope) and `PLAN.md` (execution plan). Together they should be enough to start without going back to the user.

---

## 1. The 60-second briefing

The user (`barmoshe`) wants a tool that turns a daily news voiceover into a timed scene stream for automated B-roll + graphic selection. The initial use case is the user's friend's **Israeli newsroom weather segment**. Output is **9:16 vertical (1080×1920) MP4** for Instagram Reels / TikTok / YouTube Shorts.

**Pipeline shape:**
```
audio (voiceover)
  → ASR (Whisper variant) → transcript + word timestamps
  → Claude scene segmenter + classifier + keyword extractor
  → scenes[]: each scene has visual_treatment ∈ {broll, graphic_table, graphic_map, …}
  → broll scenes → stock/AI sourcing + matching
  → graphic scenes → templated generators (Remotion / HTML / SVG)
  → composited 1080×1920 MP4 with voiceover audio
```

**Three scope boundaries — do not violate:**

1. **Scene-first, not flat keywords.** A scene can span multiple sentences. The schema's top-level array is `scenes[]`, not `keywords[]`. (PRE-RESEARCH §3 originally said keywords-first; this was overridden by the user this turn — see PLAN.md §2 "Output model".)
2. **Mixed treatments.** Both stock B-roll and generated on-air graphics (temperature tables, weather maps, lower thirds) are first-class. The pipeline picks per-scene. PRE-RESEARCH §6 used to put graphics out-of-scope; that line was patched.
3. **Hebrew-primary.** Default ASR is `ivrit-ai/whisper-large-v3-turbo-ct2`. Few-shots, schema, prompt rule (`term`/`lemma` stay in HE; `category` and `visual_treatment` stay English) all encode this.

---

## 2. Your deliverable

A set of markdown reports under `research/keyword-extractor-voiceover/` in the order defined by PLAN.md §3:

- **Wave 1:** R0, R-prior-art, R1
- **Wave 2:** R-graphics, R2, R4
- **Wave 3:** R3, R5, R6
- **Wave 4:** R7, R8
- **Wave 5:** R9

Every report uses this exact shape:

```
# <Report Title>
> Status: draft | reviewed | locked
> Owner: <agent name>   Last updated: <ISO date>

## TL;DR (≤150 words)
## Scope & questions
## Findings (with inline citations)
## Implications for keyword-extractor-voiceover
## Open questions
## Sources
```

**R9 (Synthesis) is the only report that makes recommendations.** R0–R8 + R-prior-art + R-graphics must end at "Implications: here are the options" — *not* "here is the chosen path".

---

## 3. Defaults locked this session

You do not need to re-ask the user about these. Source: PRE-RESEARCH §5 + this turn's clarification.

| Decision | Value |
|---|---|
| Language | HE primary, EN secondary |
| ASR default (HE) | `ivrit-ai/whisper-large-v3-turbo-ct2` via `faster-whisper` |
| ASR default (EN) | `gpt-4o-transcribe` |
| Stock | Free-tier first (Pexels → Pixabay), paid opt-in later |
| Render | MP4 by default, FCPXML on a flag |
| Output canvas | 1080×1920, 30 fps |
| Daily volume | ~5 voiceovers/day, ≤2 min each |
| Output model | Scene-first; `visual_treatment` enum |
| Graphics | In scope (overrides PRE-RESEARCH §6 stale line) |

---

## 4. Pre-flight intelligence (don't re-discover)

These were verified in the seed pass (PRE-RESEARCH §7). Cite directly; deepen rather than restart.

### Stock-video sources (R4)

| Source | API | Newsroom-safe | Cost | Gotchas |
|---|---|---|---|---|
| Pexels | Free | Yes | $0 | Default first try. |
| Pixabay | Free | Yes (with care) | $0 | Identifiable persons / brands / buildings may need extra consent → newsroom risk. |
| Storyblocks | Paid | Yes | ~$6k–12k+/yr enterprise | $20k indemnification — uniquely relevant to newsroom legal. Phase-2 upgrade. |

### ASR pricing (R1)

- `gpt-4o-transcribe` — $0.006/min
- `gpt-4o-mini-transcribe` — $0.003/min
- ivrit-ai variants — $0 marginal after model download; CPU-OK via faster-whisper (`compute_type="int8"`)
- At 5 × ≤2 min/day, cloud Whisper ≈ $0.06/day. **HE pick is an accuracy decision, not cost.**

### Renderer landscape (R6)

- **MoviePy v2.2.1** (Feb 2026) — pin v2 (v1 unmaintained); single-maintainer risk.
- **Remotion** — Node 18+, ships official Claude Code agent skill.
- **FFmpeg `concat` + `filter_complex`** — no-deps MVP.
- *Update for scene-first model:* Remotion now leads because React templates handle both broll clips *and* graphic scenes (temperature tables, maps) in one composition. R6 must explicitly weigh this.

### ivrit-ai (R1)

- `ivrit-ai/whisper-large-v3-turbo-ct2` — Hebrew-tuned Whisper, CTranslate2 format, drops into `faster-whisper` directly. Trained on ~22k h Hebrew audio.
- Word-timestamp drift in earlier checkpoints — verify on a real weather clip; if > 250 ms, run `whisperX` alignment as a second pass.
- Pull WER from **Hebrew Speech Recognition Leaderboard** (`ivrit-ai-hebrew-transcription-leaderboard.hf.space`), not the model card.

---

## 5. Execution recipe

1. **Read in order:** this file → `PLAN.md` → `PRE-RESEARCH.md` → `CLAUDE.md` → `knowledge/13-asset-pipelines.md` (skim) → `skills/viral-news-scanner/SKILL.md` (skim).
2. **Confirm `README.md` exists** with all 12 reports listed `Status: pending` (it should — created this session).
3. **Launch in parallel** (single message, multiple `Agent` tool calls — cap 3 concurrent). See PLAN.md §3 for waves and agent types.
4. **After each wave**, bump statuses to `draft` in README.md and commit. Do not mark `reviewed` without claude doing a read-through; do not mark `locked` without the user.
5. **R9 is sequential** — only after R0–R8 + R-prior-art + R-graphics are at `draft`.
6. **Commit cadence:** one commit per report at draft + final commit when README + R9 are in.

### Citation rule (non-negotiable)

Every claim ends with a source — URL or repo file path. If you can't cite it, don't say it. If two sources disagree, state both and pick the better-supported one with a note.

### Source rotation

- **ivrit-ai claims:** ≥2 of {HF model card, Hebrew Speech Recognition Leaderboard, Interspeech 2025 paper, ivrit.ai project README}.
- **Stock-API claims:** ≥1 official doc + ≥1 independent dev write-up.
- Never single-source pricing or licence claims.

### Scene-first schema rule (R2)

Top-level shape:
```json
{
  "language": "he",
  "duration_s": 75.4,
  "transcript": "…",
  "scenes": [
    {
      "scene_id": 1,
      "start_s": 0.0,
      "end_s": 12.3,
      "visual_treatment": "broll",
      "keywords": [{"term": "גשם", "lemma": "גשם", "visual_concept": "rain on car windshield, vertical", "category": "rain", "weight": 0.95, "alternatives": ["umbrella", "wet street"]}],
      "broll": {"sourcing_pref": ["pexels", "pixabay"]},
      "graphic": null
    },
    {
      "scene_id": 2,
      "start_s": 12.3,
      "end_s": 28.7,
      "visual_treatment": "graphic_table",
      "keywords": [{"term": "טמפרטורות", "category": "temperature_graphic"}],
      "broll": null,
      "graphic": {
        "template": "graphic_table",
        "props": {"title": "טמפרטורות מחר", "rows": [{"city": "תל אביב", "high": 24, "low": 17}, …]}
      }
    }
  ],
  "notes": "…"
}
```
R2 finalises the exact field set; R-graphics finalises the `template` and `props` shape per treatment.

---

## 6. Branch and commit conventions

- **Dev branch:** `claude/review-commits-plan-fIzQv`.
- **User has authorised pushing to `main`** for this turn's work.
- **Commit message style:** lowercase scope-prefix, imperative mood. Examples:
  - `research(keyword-extractor): scaffold README, PLAN, HANDOFF`
  - `research(keyword-extractor): R1 whisper variant comparison (draft)`
  - `research(keyword-extractor): R9 synthesis (draft)`
- Standard footer:
  ```
  https://claude.ai/code/session_<id>
  ```

---

## 7. Known blockers and work-arounds

| Blocker | Mitigation |
|---|---|
| GitHub MCP scoped to `claude-creative-stack` only | All work in this repo only; if external repos surface, use WebFetch on raw GitHub URLs. |
| ivrit-ai community project — fast cadence, possible model rotation | Cite by revision SHA, not just name. |
| Hebrew newsroom editorial sources are sparse in English | Allow Hebrew-language sources; translate inline with original link. |
| Stock-API pricing rotates | Date every claim ("as of 2026-05-07"); R9 carries verify-before-purchase note. |
| Some claims are version-sensitive (MoviePy, Remotion, ivrit-ai) | Per `knowledge/99-caveats.md` — phrase as "as of mid-2026, …", never hard-code. |
| WebFetch flakiness on some sources | Rotate sources; never single-source a claim. |

---

## 8. Definition of done (per wave)

You are done with **Wave N** when all of these hold for the reports in that wave:

- [ ] Each report exists at the path defined in PLAN.md §3.
- [ ] Each report uses the standard skeleton (TL;DR, scope, findings, implications, open questions, sources).
- [ ] Each report's "Implications" lists options without picking a default (R9 is the only report that picks).
- [ ] Every claim has a citation.
- [ ] README.md status table is updated to `draft` for that report.
- [ ] Wave N is committed with the conventional message format.

You are done with the whole research phase when **Wave 5** is committed and:

- [ ] R9 contains a locked single recommendation for every decision (see PLAN.md §6).
- [ ] R9 explicitly engages with 9:16 vertical, Hebrew-primary, mixed-treatment scene model.
- [ ] Every report's open-questions has been pulled into R9's bottom section.
- [ ] README.md status table reflects all reports at `draft` minimum (the user moves them to `reviewed`/`locked`).

---

## 9. After you finish

Report back to the user with:

1. A 5-line summary of R9's locked recommendation.
2. The list of open questions surfaced across all reports.
3. A proposed next step: either (a) move to design / `IMPLEMENTATION-PLAN.md`, or (b) re-run a specific report at `Status: reviewed` after user feedback. Do not pick for them.
