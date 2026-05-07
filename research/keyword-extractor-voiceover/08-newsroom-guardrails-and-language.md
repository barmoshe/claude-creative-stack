# R8 — Newsroom Guardrails and Language

> Status: draft
> Owner: Wave-4 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

R8 ports `viral-news-scanner`'s honesty discipline into the voiceover skill. HE primary, EN secondary; `term`/`lemma` HE, `category`/`visual_treatment` EN (R3 bilingual rule). A six-topic STOP gate — active security incident, election day, public-figure death, gag-order, active disaster, named public figure → face — emits `{status:"STOP"}` instead of an EDL, mirroring SKILL.md Active Incident Protocol. Every broll clip carries R4's `{source, clip_id, license, attribution, downloaded_at}`; renderer emits an audit-JSON sidecar, retention ≥90 days. Cuts within **±0.25 s** of `start_s`. Every `term` traces to a transcript word; HE lemmatised match uses **DictaBERT-lex** with **YAP** offline fallback. Every numeric in `graphic.props` is lifted **verbatim** — wrong temperature ≫ wrong B-roll. Pixabay clips run a face/logo screen before entering the EDL. R9 locks.

## Scope & questions

R8 is the editorial-discipline layer of the skill: when to refuse, what to attach, what register to write in. Prior art: `skills/viral-news-scanner/SKILL.md` and `references/editorial-standards.md`. Out of scope: RTL rendering (R7, R-graphics).

## Findings

### Hebrew + English language support

Default HE; EN opt-in via the `language` flag. ASR per R1: `ivrit-ai/whisper-large-v3-turbo-ct2` via `faster-whisper` for HE; `gpt-4o-transcribe` cloud fallback. R3's bilingual rule is canonical: `term`/`lemma` preserve the HE word verbatim (and nikud if present); `category`/`visual_treatment` are EN from the R2 enum so the matcher's folders line up. The Haiku-4.5 nikud question carries forward — re-test in the 10-voiceover eval; fall back to Sonnet 4.6 on string corruption. RTL is the renderer's problem (`06-output-edl-and-renderer.md`, `00c-scene-types-and-graphic-templates.md`).

### Hoax / sensitive-topic gate

Mirror SKILL.md Active Incident Protocol: on trip, return `{status:"STOP", reason, escalate_to:"human_editor"}` — no EDL. Six trips:

1. **Active Israeli security incident** — terror, war operation, hostage event ([SKILL.md](../../skills/viral-news-scanner/SKILL.md)).
2. **Election day** — propaganda risk; do not auto-pick visuals for politically charged copy.
3. **Public-figure death** — Israel Press Council accuracy rules require confirmation ([ethics code](https://accountablejournalism.org/ethics-codes/Israel-Rules)).
4. **Court publication restriction** (`צו איסור פרסום` / gag order) — auto-publishing a banned name is contempt.
5. **Active disaster** (flood, fire, mass-casualty) — wrong B-roll is materially harmful (R0 trust-breaker).
6. **Named public figure** without producer-supplied face binding — never auto-pick a face (R0 trust-breaker).

### Attribution + audit log

Every broll clip carries the R4 envelope `{source, clip_id, license, attribution, downloaded_at}` (`04-background-video-sourcing.md`). R8 adds: a producer-toggleable **credits roll** in the last 1.5 s of the MP4; an `<out>.licenses.json` sidecar (`06-output-edl-and-renderer.md`); **retention ≥90 days** — Israeli media claims typically land within 60–90 days post-broadcast.

### Timing tolerance ±0.25 s

Cuts land within **±0.25 s** of `start_s` (`PRE-RESEARCH.md` §4 R8). News pacing is tight; a 0.5 s late cut reads amateur and breaks Noa's trust (R0). If word-timestamps drift past 250 ms, R1's `whisperX`/`stable-ts` second pass is mandatory — drift is a hard fail, not a soft warning.

### Hallucination control (lemmatised match; HE lemmatiser pick)

**Hard rule:** every emitted `term` must appear verbatim **or via lemmatised match** in the transcript. EN: any inflection of the lemma (`rain` ↔ `rainy` ↔ `raining`). HE binyanim and clitics make exact-match brittle, so a real lemmatiser is required.

**HE candidates** (≥2):

- **DictaBERT-lex** (default) — fine-tuned for HE lemmatisation; handles wordpiece-split tokens; SOTA on UD-Hebrew ([dicta-il/dictabert-lex](https://huggingface.co/dicta-il/dictabert-lex), [MRL Parsing Without Tears, ACL 2024](https://aclanthology.org/2024.findings-acl.269.pdf)).
- **YAP** — morpho-syntactic parser; older, offline-only, dependency-light. Air-gapped fallback ([Hebrew-Resources](https://github.com/NNLP-IL/Hebrew-Resources)).
- **AlephBERT** / **Trankit** — runners-up; AlephBERT is strong on POS but DictaBERT-lex wins on lemma per ACL 2024.

`visual_concept` (free text) is softer: may elaborate beyond literal words ("rain on a window" from "גשם") but must be **semantically grounded** — enforced by Claude's prompt, not a string check (`03-prompt-design-and-caching.md`).

### Generated-graphic accuracy guardrail (numeric verbatim rule)

A wrong temperature in a `graphic_table` is worse than a wrong B-roll clip (R0 Noa persona). **Rule:** every numeric field in any `scene.graphic.props` (temperatures, scores, percentages, times, dates) must equal a number that appears literally in the transcript — no rounding, no inference. The skill validates after extraction; on failure it emits `{status:"GRAPHIC_REFUSED", scene_id, reason}` and the producer hand-types or drops it. Extends `viral-news-scanner`'s "Don't invent view counts" pattern (SKILL.md Honesty constraints) to numeric data graphics.

### Editorial register

Borrow the verification ladder from `viral-news-scanner/references/editorial-standards.md` §"Verification Levels" verbatim — V1 (verified) / V2 (single-source visual) / V3 (hedge with `טוענים` / `לפי הדיווח`). The voiceover skill cannot frame copy itself; it refuses to run on hard-news segments without a producer override flag (`hard_news=true`).

### Pre-cut face/logo screen

Pixabay's licence flags identifiable persons, brand logos, and recognisable buildings (`PRE-RESEARCH.md` §7.4, `04-background-video-sourcing.md`). Run a face/logo detection pass — MediaPipe Face Detection, OpenCV Haar, or `rembg` — on every Pixabay candidate **before** it enters the EDL; on a hit, downrank to `requires_human_review` and pick the next clip. Pexels and Storyblocks Business+ get a pass (Storyblocks carries $20k–$1M indemnification — R4).

### Guardrails checklist (paste-ready)

Mirroring `editorial-standards.md` §"Checklist Before Publishing", the skill runs this before returning:

- [ ] STOP gate clean (or `hard_news=true` override).
- [ ] If `he`, `term`/`lemma` are HE; `category`/`visual_treatment` EN.
- [ ] Every `term` traces to a transcript word via DictaBERT-lex.
- [ ] `visual_concept` does not contradict transcript semantics.
- [ ] Every numeric in `graphic.props` matches a literal transcript number.
- [ ] Every broll carries the R4 licence envelope.
- [ ] Pixabay clips passed face/logo screen.
- [ ] Cuts within ±0.25 s of `start_s`; else re-aligned via `whisperX`.
- [ ] Audit-JSON sidecar emitted; retention ≥90 days.
- [ ] No public-figure name without a producer face binding.
- [ ] `visual_treatment` from the closed 8-value enum; `category` from the R2 enum.

## Implications for keyword-extractor-voiceover

- Three top-level statuses: `OK` (full EDL), `STOP` (gate trip, human escalation), `GRAPHIC_REFUSED` (per-scene; rest of EDL ships).
- HE lemmatiser is a hard dependency — DictaBERT-lex default, YAP offline fallback. Bundle with the skill.
- Audit retention is a legal-shape decision — surface to R9.
- Face/logo screen is a real cost line per Pixabay candidate — fold into R5's matcher ceiling.
- Editorial-register sub-modes (`weather` / `general` / `hard_news`) become a top-level skill argument; default `weather`.

## Open questions

- Haiku 4.5 nikud preservation under cache reads (carried from R3).
- Audit retention: 90 days enough, or does Israeli broadcast law require longer? (Newsroom legal.)
- Does DictaBERT-lex run fast enough on the editor's laptop, or hosted endpoint needed? (R7.)
- "Election day" — calendar flag or producer toggle?
- Gag-order list — court feed or producer-typed?

## Sources

- `skills/viral-news-scanner/SKILL.md` — Active Incident Protocol, Honesty constraints, closed-list discipline.
- `skills/viral-news-scanner/references/editorial-standards.md` — V1/V2/V3 register, Checklist Before Publishing, defamation rules.
- `research/keyword-extractor-voiceover/00-use-case-discovery.md` — Noa persona, "wrong number worse than wrong B-roll", "never auto-pick a face".
- `research/keyword-extractor-voiceover/00b-prior-art-competitor-scan.md` — newsroom-grade audit-trail differentiator.
- `research/keyword-extractor-voiceover/00c-scene-types-and-graphic-templates.md` — 8-value `visual_treatment` enum.
- `research/keyword-extractor-voiceover/03-prompt-design-and-caching.md` — bilingual rule, hallucination clause, Haiku/nikud open question.
- `research/keyword-extractor-voiceover/04-background-video-sourcing.md` — License envelope, Pixabay face/brand risk, Storyblocks indemnification.
- `research/keyword-extractor-voiceover/06-output-edl-and-renderer.md` — `<out>.licenses.json` sidecar.
- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` §4 R8, §7.4 — ±0.25 s tolerance; Pixabay carry-overs.
- [Israel Press Council — Rules of Professional Ethics of Journalism](https://accountablejournalism.org/ethics-codes/Israel-Rules)
- [Press Councils Europe — Israel code](https://www.presscouncils.eu/codes/28_il/)
- [DictaBERT-lex on Hugging Face](https://huggingface.co/dicta-il/dictabert-lex)
- [MRL Parsing Without Tears: The Case of Hebrew (ACL 2024)](https://aclanthology.org/2024.findings-acl.269.pdf)
- [NNLP-IL Hebrew-Resources (YAP, AlephBERT, Trankit)](https://github.com/NNLP-IL/Hebrew-Resources)
- [AlephBERT (arXiv 2104.04052)](https://ar5iv.labs.arxiv.org/html/2104.04052)
