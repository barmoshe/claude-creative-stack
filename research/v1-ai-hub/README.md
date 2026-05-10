# V1 AI Hub — Concept Research Index

> **Concept-only folder.** This is a sketch of an idea, not a product spec, not an implementation plan, not a stack pick. Form factor (local app vs server vs hybrid, with or without a database) is **explicitly undecided**. Every decision the user has not made is logged as an open question, never a default.

## Naming disclaimer (read first)

**"V1" in this folder always refers to the Israeli media company V1** — the digital/news arm of Keshet, publisher of `v-1.co.il` and the V1 mobile apps. **It does NOT mean "version 1" / "v1.0".** When this folder talks about "V1 AI Hub" it means an AI tooling hub for the V1 (Keshet) brand. It does not mean a first-version product. Future agents and readers must preserve this distinction in every report.

If you need to refer to a software version generation, use the words "version 1", "first iteration", "MVP", or `v1.0` — but never just "V1" on its own.

## What this folder is

A concept sketch for **V1 AI Hub** — an AI tooling hub associated with the V1 (Keshet) brand. The user has shared one fact and one fact only:

- **One** of the tools inside the hub will be a **weather editing tool** that takes voice input and produces a vertical video.

Everything else — what the hub *is*, who it serves, where it runs, what other tools it contains, whether it relates to the existing `research/keyword-extractor-voiceover/` work — is open.

## What this folder is NOT

- **Not** an implementation plan. No code, no stack, no infra, no integration servers, no agent-skill packages, no model picks.
- **Not** a launch plan. No timelines, no rollout phases, no GTM.
- **Not** a commitment. No tool listed here is committed to be built. No decision is locked.
- **Not** a child repo (yet). This is a research folder under the host repo.

## Reports

| ID  | File                                                                  | Status   | Owner  | Updated    | 30-word abstract |
|-----|-----------------------------------------------------------------------|----------|--------|------------|------------------|
| R0  | [`00-vision-sketch.md`](00-vision-sketch.md)                          | concept  | A1     | 2026-05-09 | Fuzziest possible product description — possible product shapes and audiences enumerated as non-exclusive options, none chosen. |
| R1  | [`01-tool-catalogue.md`](01-tool-catalogue.md)                        | concept  | A2     | 2026-05-09 | Conceptual tool catalogue. Tool 1: weather editing tool (voice → vertical video) at concept level only. Sibling tools brainstormed as candidates. |
| R2  | [`02-open-questions.md`](02-open-questions.md)                        | concept  | A3     | 2026-05-09 | Load-bearing list of known TBDs across product identity, form factor, tool surface, users, inputs/outputs, non-functional, business, brand — gaps logged in `critiques/`. |
| R3  | [`03-relationship-to-keyword-extractor.md`](03-relationship-to-keyword-extractor.md) | concept  | A4     | 2026-05-09 | Three equal-weight possibilities for the relationship between V1 AI Hub and the existing `research/keyword-extractor-voiceover/` work. No recommendation. |
| R4  | [`04-v1-keshet-company-context.md`](04-v1-keshet-company-context.md)  | concept  | A5     | 2026-05-09 | Public-source profile of V1 (Keshet) the Israeli media company. Strict no-inference rule — every gap logged as a "what we don't know" item. |
| R5  | [`05-v1-team-and-leadership.md`](05-v1-team-and-leadership.md)        | concept  | R5     | 2026-05-09 | Deep-web pass on V1's people: leadership, recent hires, AI / product / engineering roles, parent-org context. Headline: editor-in-chief Neta Livneh promoted to chief editor of all Keshet Digital under CEO Uri Rozen. |
| R6  | [`06-v1-recent-product-news.md`](06-v1-recent-product-news.md)        | concept  | R6     | 2026-05-09 | Public-source 2024–2026 web deep-dive on V1: app/web releases, editorial verticals, audience, partnerships, public crises. Headline: Hebrew-language micro-drama "When the Waves Get Stronger" co-produced with Ananey/Paramount. |
| R7  | [`07-israeli-newsroom-ai-peer-scan.md`](07-israeli-newsroom-ai-peer-scan.md) | concept  | R7     | 2026-05-09 | 13-outlet 2024–2026 peer scan of Israeli newsroom AI activity. Headline: Reshet 13 × Deepdub voice-cloning is the only documented production AI deployment in the peer set. |

**Status legend.** `pending` = agent has not yet landed a draft · `concept` = first concept-level pass exists, nothing past concept.

## Critiques

Parallel critique pass over R0–R3 + this README:

| ID  | File                                                          | Status            | Owner | Updated    | 30-word abstract |
|-----|---------------------------------------------------------------|-------------------|-------|------------|------------------|
| C1  | [`critiques/01-rigor-audit.md`](critiques/01-rigor-audit.md)  | concept-critique  | C1    | 2026-05-09 | Format / discipline audit. 12 findings: 2 blocker, 7 should-fix, 3 nit. Verdict: discipline mostly holds; README and R3 needed targeted fixes. |
| C2  | [`critiques/02-concept-audit.md`](critiques/02-concept-audit.md) | concept-critique  | C2    | 2026-05-09 | Substance audit. 19 findings: 8 gap, 6 framing, 4 coherence, 1 nit. Top gap: R3 is missing a fourth possibility (partial subsumption). |
| C3  | [`critiques/03-stakeholder-audit.md`](critiques/03-stakeholder-audit.md) | concept-critique  | C3    | 2026-05-09 | Five-lens V1 / Keshet stakeholder audit (editorial, producer, legal, brand, engineering). 22 findings, 8 blockers. Cross-lens: who arbitrates publishability under V1's name? |

## Next artefact (not yet decided)

This folder is concept-only. The artefact it produces *next* is itself an open question — see R2 §10. Plausible candidates, none committed: a `decisions.md` log as questions in R2 are answered, a narrowing pass on R0's product-shape axis, or a product brief that picks a single product shape and audience. The user owns the choice.

## See also (reference, not parent)

- [`research/keyword-extractor-voiceover/README.md`](../keyword-extractor-voiceover/README.md) — prior research on a weather-voiceover → 9:16 video pipeline for V1 / Keshet. Whether V1 AI Hub subsumes, references, or is independent of that work is the **open question** R3 is dedicated to. Do not silently merge the two folders.
- [`research/biome-beats/`](../biome-beats/) — lightweight precedent for a concept-level research folder.
- `CLAUDE.md` (host root) — child-repo rules, commit-opt-in rule, "concept only / no defaults" discipline.
