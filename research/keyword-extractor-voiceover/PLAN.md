# Research Plan — Keyword Extractor for Voiceover-Driven Video Auto-Edit

> **What this document is.** The execution plan for producing the reports under `research/keyword-extractor-voiceover/`. Reads alongside `PRE-RESEARCH.md` (the originating scope doc — locked input) and `HANDOFF.md` (operational instructions for the executing agent). Modelled on `research/biome-beats/PLAN.md`.

---

## 1. Context

`PRE-RESEARCH.md` (220 lines, locked) scopes *what* to research: 9 report briefs (R1–R9), defaults, out-of-scope, and a §7 seed pass on stock sources / ASR pricing / renderer landscape.

This plan adds *how* the research executes:

- Three additional upstream reports — **R0** (use-case discovery), **R-prior-art** (competitor scan), **R-graphics** (scene types & template stack) — to plug the "project shape still fuzzy" gap the user flagged.
- Wave grouping with a 3-concurrent-agent cap.
- Agent type assigned per report (`Explore` / `general-purpose` / `Plan`).
- Acceptance criteria, verification steps, and risks/mitigations.
- A scene-first revision absorbing the user's clarification: scenes can span multiple sentences and carry mixed `visual_treatment` (broll *or* generated graphic).

`PRE-RESEARCH.md` §6 was patched (this turn) to move on-air graphics *out* of out-of-scope — the temperature-table example puts them squarely in scope.

---

## 2. Decisions locked

| Decision | Value | Source |
|---|---|---|
| Scope | Full R1–R9 + R0 + R-prior-art + R-graphics | User: "we just need to do more reports" |
| §5 defaults | Use as-is | User: "You decide" |
| Language | HE primary, EN secondary | PRE-RESEARCH §5 |
| ASR default (HE) | `ivrit-ai/whisper-large-v3-turbo-ct2` via `faster-whisper` | PRE-RESEARCH §5 |
| ASR default (EN) | `gpt-4o-transcribe` | PRE-RESEARCH §7.2 |
| Stock | Free-tier first (Pexels → Pixabay), paid opt-in later | PRE-RESEARCH §5 |
| Render | MP4 by default, FCPXML on a flag | PRE-RESEARCH §5 |
| Output canvas | 1080×1920, 30 fps | PRE-RESEARCH §1 + §5 |
| Volume assumed | ~5 voiceovers/day, ≤2 min each | PRE-RESEARCH §5 |
| **Output model** | **Scene-first.** Scenes can span multiple sentences. Each scene carries `visual_treatment` ∈ `{broll, broll_montage, graphic_table, graphic_map, graphic_chart, lower_third, title_card, generated_clip}`. | User clarification |
| **Graphics** | **In scope** — overrides PRE-RESEARCH §6 stale line. Tool generates data-viz scenes; does not delegate to a separate graphics system. | User clarification |

---

## 3. Report catalogue (executable order)

| ID | File | Wave | Agent | Source mix |
|---|---|---|---|---|
| R0 | `00-use-case-discovery.md` | 1 | `general-purpose` | Synthesis only |
| R-prior-art | `00b-prior-art-competitor-scan.md` | 1 | `general-purpose` | WebSearch |
| R1 | `01-whisper-variant-comparison.md` | 1 | `general-purpose` | WebSearch + WebFetch |
| R-graphics | `00c-scene-types-and-graphic-templates.md` | 2 | `general-purpose` + `Explore` | WebSearch + reads `knowledge/05`, `knowledge/08`, `knowledge/12` |
| R2 | `02-scene-and-keyword-schema.md` | 2 | `Explore` + `Plan` | Reads `skills/viral-news-scanner/references/`, Claude tool-use docs |
| R4 | `04-background-video-sourcing.md` | 2 | `general-purpose` | WebSearch + WebFetch |
| R3 | `03-prompt-design-and-caching.md` | 3 | `Explore` | Reads `knowledge/09`, `knowledge/01`. Depends on R2 + R-graphics drafts. |
| R5 | `05-matching-algorithm.md` | 3 | `general-purpose` | WebSearch (CLIP, sentence-transformers, LLM-judge) |
| R6 | `06-output-edl-and-renderer.md` | 3 | `general-purpose` | WebSearch + WebFetch (FFmpeg, MoviePy v2, **Remotion**) |
| R7 | `07-repo-architecture-fit.md` | 4 | `Explore` | Reads `mcp/servers/asset-router/`, `knowledge/02`, `knowledge/10`. Depends on R6. |
| R8 | `08-newsroom-guardrails-and-language.md` | 4 | `Explore` + WebSearch | Reads `skills/viral-news-scanner/SKILL.md`. Depends on R0 personas. |
| R9 | `09-synthesis-and-recommendations.md` | 5 | `Plan` | Synthesises R0–R8 + R-prior-art + R-graphics |

**Wave grouping** (≤3 concurrent):

- **Wave 1 (× 3):** R0, R-prior-art, R1
- **Wave 2 (× 3):** R-graphics, R2, R4
- **Wave 3 (× 3):** R3, R5, R6
- **Wave 4 (× 2):** R7, R8
- **Wave 5 (sequential):** R9

---

## 4. Methodology

- **Citation rule (non-negotiable).** Every claim ends with a URL or repo file path. No bare assertions.
- **Source rotation.** ivrit-ai facts: ≥2 of {HF model card, Hebrew Speech Recognition Leaderboard, Interspeech 2025 paper, ivrit.ai project README}. Stock-API facts: ≥1 official doc + ≥1 independent dev write-up.
- **No-recommendation rule for R0–R8.** Every report ends at "Implications: here are the options". Only R9 picks defaults.
- **Status workflow.** `pending → draft → reviewed → locked`. Agents move to `draft`; user (with claude read-through) moves to `reviewed`; only the user moves to `locked`.
- **Concurrent agent cap.** 3.
- **De-duplication.** If two reports overlap, lower-numbered report owns it; the other links.
- **Commit cadence.** One commit per report at draft + one when README + R9 land. Format: `research(keyword-extractor): R<n> <title> (draft)`.
- **Branch.** `claude/review-commits-plan-fIzQv`. Push to `main` only with explicit per-action user permission (granted this turn).

---

## 5. Critical files to read before any agent launches

- `CLAUDE.md` — repo routing
- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` — full scope
- `research/biome-beats/PLAN.md` + `HANDOFF.md` — structural template
- `skills/viral-news-scanner/SKILL.md` + `references/output-schema.md` + `references/editorial-standards.md`
- `knowledge/01-claude-ecosystem.md`, `knowledge/02-skills-system.md`, `knowledge/05-graphics-design.md`, `knowledge/08-dataviz.md`, `knowledge/09-prompting.md`, `knowledge/10-workflows.md`, `knowledge/13-asset-pipelines.md`, `knowledge/99-caveats.md`
- `mcp/servers/asset-router/` — MCP shape

---

## 6. Acceptance criteria

The research phase is done when:

1. `README.md` status table covers R0, R-prior-art, R-graphics, R1–R9, all at `Status: reviewed` minimum.
2. R9 contains a single recommendation for: ASR variant (EN + HE), scene-first schema (paste-ready JSON with `visual_treatment` enum), prompt template (paste-ready, segments + classifies + extracts in one pass), sourcing pipeline order, matching algorithm, **graphic-template stack with the temperature-table worked example end-to-end**, renderer + EDL shape, repo architecture, top-5 risks + mitigations, 2-week implementation plan.
3. Every report's "Open questions" is empty *or* surfaced via `AskUserQuestion`.
4. R0's interview script is either sent to the user or deferred with rationale.
5. R2's `visual_treatment` enum and R-graphics' enum match exactly (no drift).
6. R9 explicitly engages with: 9:16 vertical, Hebrew-primary, mixed-treatment scene model.
7. Every claim has a citation; spot-check 5 random claims (≥4/5 must verify).

---

## 7. Verification

1. **Spot-check citations** — 5 random claims; ≥4/5 must support the claim.
2. **Hebrew lane sanity** — R1's recommended ivrit-ai variant has a current HF model card, leaderboard entry, verified licence.
3. **9:16 sanity** — `1080x1920 | 9:16 | vertical` appears ≥1× in R4, R5, R6.
4. **Cost ceiling** — R5's $/min × R0's daily-volume answer fits the friend's budget (or flagged in R9 as top open question).
5. **Open-question liquidation** — every "Open questions" item answered, deferred-with-rationale, or queued.
6. **README index** — every link resolves, every report has a TL;DR, status table is current.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| ivrit-ai weights drift between scoping and implementation | Cite by model revision SHA, not just name. |
| Hebrew newsroom sources sparse in English | Allow Hebrew-language sources; translate inline with original linked. |
| Stock-API pricing rotates | Date every pricing claim; R9 carries "verify before purchase" note. |
| Friend interview never happens → R0 stays speculative | R0 ships interview *script* + persona; R9 flags every dependent decision. |
| Scope creep into design during R9 | R9 ends at recommendations + 2-week plan; implementation plan is a separate later doc. |
| PRE-RESEARCH defaults overrule R0 findings | If R0 contradicts (e.g. friend wants horizontal master), R9 calls it out and proposes re-scoping. |
| Generated graphic shows wrong number | R8 adds a "data-graphic accuracy" guardrail — wrong temperature is worse than wrong B-roll. |

---

## 9. Done When

The research phase is done when all R0–R9 + R-prior-art + R-graphics are at `Status: reviewed`, R9 names a single default for every decision, the user has signed off on R9's 2-week plan, and the next doc in the folder is `IMPLEMENTATION-PLAN.md` (which this plan explicitly does *not* try to write).
