# V1 AI Hub — Concept Research Index

> **Concept-only folder.** This is a sketch of an idea, not a product spec, not an implementation plan, not a stack pick. Form factor (local app vs server vs hybrid, with or without a database) is **explicitly undecided**. Every decision the user has not made is logged as an open question, never a default.

## Naming disclaimer (read first)

**"V1" in this folder always refers to the Israeli media company V1** — the digital/news arm of Keshet, publisher of `v-1.co.il` and the V1 mobile apps. **It does NOT mean "version 1" / "v1.0".** When this folder talks about "V1 AI Hub" it means an AI tooling hub for the V1 (Keshet) brand, not a first-version product. Future agents and readers must preserve this distinction in every report.

If you need to refer to a software version generation, use the words "version 1", "first iteration", "MVP", or `v1.0` — but never just "V1" on its own.

## What this folder is

A concept sketch for **V1 AI Hub** — an AI tooling hub associated with the V1 (Keshet) brand. The user has shared one fact and one fact only:

- **One** of the tools inside the hub will be a **weather editing tool** that takes voice input and produces a vertical video.

Everything else — what the hub *is*, who it serves, where it runs, what other tools it contains, whether it relates to the existing `research/keyword-extractor-voiceover/` work — is open.

## What this folder is NOT

- **Not** an implementation plan. No code, no stack, no infra, no MCP servers, no Skills, no model picks.
- **Not** a launch plan. No timelines, no rollout phases, no GTM.
- **Not** a commitment. No tool listed here is committed to be built. No decision is locked.
- **Not** a child repo (yet). This is a research folder under the host repo.

## Reports

| ID  | File                                                                  | Status   | Owner  | Updated    | 30-word abstract |
|-----|-----------------------------------------------------------------------|----------|--------|------------|------------------|
| R0  | [`00-vision-sketch.md`](00-vision-sketch.md)                          | pending  | A1     | —          | Fuzziest possible product description — possible product shapes and audiences enumerated as non-exclusive options, none chosen. |
| R1  | [`01-tool-catalogue.md`](01-tool-catalogue.md)                        | pending  | A2     | —          | Conceptual tool catalogue. Tool 1: weather editing tool (voice → vertical video) at concept level only. Sibling tools brainstormed as candidates. |
| R2  | [`02-open-questions.md`](02-open-questions.md)                        | pending  | A3     | —          | Load-bearing list of every TBD: product identity, form factor, tool surface, users, inputs/outputs, non-functional, business, brand. |
| R3  | [`03-relationship-to-keyword-extractor.md`](03-relationship-to-keyword-extractor.md) | pending  | A4     | —          | Three equal-weight possibilities for the relationship between V1 AI Hub and the existing `research/keyword-extractor-voiceover/` work. No recommendation. |
| R4  | [`04-v1-keshet-company-context.md`](04-v1-keshet-company-context.md)  | pending  | A5     | —          | Public-source profile of V1 (Keshet) the Israeli media company. Strict no-inference rule — every gap logged as a "what we don't know" item. |

**Status legend.** `pending` = agent has not yet landed a draft · `concept` = first concept-level pass exists, nothing past concept.

## See also (reference, not parent)

- [`research/keyword-extractor-voiceover/README.md`](../keyword-extractor-voiceover/README.md) — prior research on a weather-voiceover → 9:16 video pipeline for V1 / Keshet. Whether V1 AI Hub subsumes, references, or is independent of that work is the **open question** R3 is dedicated to. Do not silently merge the two folders.
- [`research/biome-beats/`](../biome-beats/) — lightweight precedent for a concept-level research folder.
- `CLAUDE.md` (host root) — child-repo rules, commit-opt-in rule, "concept only / no defaults" discipline.
