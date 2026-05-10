# V1 AI Hub — Concept Substance Audit (Critique C2)

> Status: concept-critique · Owner: C2 (parallel critique run) · Last updated: 2026-05-09
> Substance audit of R0–R3 + README. Format/discipline audit handled by C1.
>
> "V1" = the Israeli media company V1 (Keshet's digital arm). Never "version 1".

## TL;DR

1. **R0 conflates "delivery shell" with "product shape".** Its product-shape list is mostly UI containers (desktop / browser / plug-in / chat). Genuinely different shapes — reader-facing AI feature, regulatory-compliance utility, B2B export à la Keshet International — are absent or buried.
2. **R3 is missing a fourth possibility**: *partial subsumption* (the hub adopts some artefacts of the prior research, discards others). A/B/C is also loaded — A reads as clean, C as wasteful.
3. **R2 is not the complete TBD register it claims.** Five R0/R1 items are unmirrored, one question is triple-stated, and the Israeli regulatory layer (election rules, Second Authority remit, accessibility law) is absent.

## Findings

### R0 — Vision sketch

#### [framing] §2 "product shapes" is really a list of delivery shells

**File:** `research/v1-ai-hub/00-vision-sketch.md`
**The gap / problem:** The nine bullets under "Possible product shapes" are dominated by UI containers (desktop app, web app, plug-in, CLI, chat front end, bot). The one non-shell entry — "bundle of stand-alone tools sharing only branding" — is closer to an organisational shape. A reader leaves §2 thinking the open question is *which surface*, when the deeper question is *what kind of thing* it is.
**Why it matters:** Conflating shell and shape biases later thinking toward "we have to pick a UI". §4 ("roles") starts the right work but is filed as a separate axis.
**Suggested addition:** A section above §2 separating *kind of artefact* (internal tool, audience-facing feature, B2B offering, compliance utility, R&D brand, platform substrate) from *delivery surface* (desktop, web, plug-in, …). Treat the cross-product as the design space.

#### [gap] No "regulatory-compliance utility" product shape

**File:** `research/v1-ai-hub/00-vision-sketch.md`
**The gap / problem:** An Israeli newsroom AI hub plausibly has a compliance face — election-period rules, Second Authority for Television and Radio obligations, accessibility law, court-restriction checks. No §2 shape or §4 role names this. A "compliance utility" is substantively different (users are legal/standards staff, outputs are audit artefacts, failure mode is a fine).
**Why it matters:** If out of scope, that should be a stated boundary, not an unstated absence. If in scope, it changes who the hub serves and what "shippable" means.
**Suggested addition:** Add a "regulatory / standards-facing utility" entry to §2 or §4, non-exclusive. R2 should mirror with a question on whether compliance is a hub concern at all.

#### [gap] Reader-side AI feature is an audience, not a shape

**File:** `research/v1-ai-hub/00-vision-sketch.md`
**The gap / problem:** §3 lists "end-readers and viewers" as a hypothesised audience, but §2 does not include "an AI feature embedded in V1's published surface" (a personalisation widget, a remix-clip control, a Q&A overlay). That is a distinct shape, not just an audience.
**Why it matters:** Reader-side features have different governance, latency, and brand-risk profiles than internal tools.
**Suggested addition:** Add "audience-facing feature inside an existing V1 surface" to §2 and cross-reference it from the §3 reader hypothesis.

#### [framing] "Advertisers' creative teams" implies a surface that may not exist

**File:** `research/v1-ai-hub/00-vision-sketch.md`
**The gap / problem:** §3 lists "advertisers' creative teams" as a partner audience. There is no source for V1 operating an advertiser-creative-self-serve surface; the bullet quietly assumes one is plausible.
**Why it matters:** Hypotheses with implicit factual claims drift into being treated as findings on later passes.
**Suggested addition:** Mark the bullet as speculative or defer it to R4 once company context lands.

### R1 — Tool catalogue

#### [framing] Brainstorm clusters around video, the named anchor

**File:** `research/v1-ai-hub/01-tool-catalogue.md`
**The gap / problem:** Of the 20 sibling candidates, most assume video / image / on-screen-graphic output. Text outputs are well-represented; tools whose primary output is *audio* or *structured data* are absent (no podcast-edit assistant, no audio-description tool, no breaking-news data extractor, no structured-event timeline builder).
**Why it matters:** A catalogue this wide should look balanced across output modalities. As written, a reader could conclude the hub is a video-and-words shop.
**Suggested addition:** Add 3–5 entries whose output is audio-only or structured data only, and label modality per candidate in the table.

#### [gap] Newsroom-mode toggles are missing as candidates

**File:** `research/v1-ai-hub/01-tool-catalogue.md`
**The gap / problem:** Four obvious newsroom-AI primitives are absent: (a) election-period editorial-mode toggle, (b) on-air corrections / retraction tooling, (c) tip-line triage / inbound-source ranking, (d) real-time security-incident editorial gating (gestured at in cross-cutting "failure surface" but not a candidate, despite being a tool in adjacent prior art in this repo).
**Why it matters:** These are the tools that distinguish a newsroom hub from a generic media-creation hub.
**Suggested addition:** Add four entries (election-mode, corrections tracker, tip-line triage, live-incident gate) at `candidate, not committed`.

#### [gap] Weather tool TBD list under-covers review and disclosure

**File:** `research/v1-ai-hub/01-tool-catalogue.md`
**The gap / problem:** The weather TBD lists omit: who reviews the output before it leaves the tool; whether AI-involvement disclosure is on the artefact, in metadata, or absent; multi-platform variant policy (R2 §5.10 has this, R1 does not); on-screen presenter identity (input speaker is covered, output presenter is not).
**Why it matters:** These are concept-level decisions that change what the tool *is*. Hiding them in R2 alone makes R1 read as more decided than it is.
**Suggested addition:** Four TBD bullets under Outputs: review-gate, AI-disclosure surface, per-platform variant policy, on-screen presenter identity.

#### [coherence] Cross-cutting list omits two things its own entries imply

**File:** `research/v1-ai-hub/01-tool-catalogue.md`
**The gap / problem:** §4 covers identity, audit, brand, language, accessibility, rights, queueing, observability, hosting, failure, human-in-loop, versioning. It misses (i) **localisation / RTL behaviour** as a hub-wide concern, and (ii) **provenance of generated assets** (C2PA-style content credentials).
**Why it matters:** Both are hub-wide, not per-tool. R2 partly catches localisation but not provenance.
**Suggested addition:** Two bullets in §4: "Localisation / direction" and "Content provenance / credentials".

### R2 — Open questions

#### [gap] One question is duplicated three places

**File:** `research/v1-ai-hub/02-open-questions.md`
**The gap / problem:** The relationship-to-prior-research question appears as R2 §3.2, R2 §9.1, and R3 itself. §9.1 labels itself a mirror; §3.2 does not.
**Why it matters:** Triple-state means a future "RESOLVED" can be applied once and missed twice.
**Suggested addition:** Mark §3.2 as a mirror of R3 explicitly, or collapse §3.2 and §9.1 into a single canonical pointer to R3.

#### [gap] No questions on Israeli regulatory layer

**File:** `research/v1-ai-hub/02-open-questions.md`
**The gap / problem:** R2 contains nothing on election-period broadcasting rules, the Second Authority for Television and Radio's remit over Keshet 12, Israeli accessibility law, or court-imposed publication restrictions. A head of legal would ask all four in the first hour.
**Why it matters:** "Concept-only" does not mean "regulation-free". These constraints change which tools can ship and on what cadence.
**Suggested addition:** A sub-section under §6 or §7 with 4–6 questions on which Israeli regulatory regimes apply, what changes during election windows, disability-access obligations, takedown/correction posture, and whether Keshet parent obligations cascade.

#### [gap] R0/R1 surface five TBDs that R2 does not directly mirror

**File:** `research/v1-ai-hub/02-open-questions.md`
**The gap / problem:** Spot-check of R0/R1 TBDs against R2:
- R0 §6 "Curated vs open tool surface" → R2 §3 has no question on third-party / community tools.
- R0 §6 "Standalone vs embedded" → R2 §2 covers form factor but not posture toward existing surfaces.
- R1 §4 "Failure surface" → R2 §6 has no fail-loud / fail-soft / fail-invisible question.
- R1 §4 "Versioning of outputs" → R2 has no question on tracked artefact vs draft vs one-shot.
- R0 §3 reader audience → R2 §4.1 lists roles but does not ask whether reader-facing tools are in scope at all.

**Why it matters:** R2 is positioned as canonical. Items in R0/R1 narrative but not in R2 risk being treated as resolved when they are merely un-asked.
**Suggested addition:** Add five questions, one per gap, and adopt a discipline that every R0/R1 TBD has at least one R2 question pointing back to it.

#### [nit] §10 Q4 should split

**File:** `research/v1-ai-hub/02-open-questions.md`
**The gap / problem:** §10 Q4 ("how are unresolved questions triaged before graduation") bundles three sub-decisions: whether all must be answered, what "load-bearing" means, and who tags. As one question it is not answerable.
**Why it matters:** Hard-to-answer triage questions silently slip past the graduation gate.
**Suggested addition:** Split into three: (a) the gate criterion, (b) the definition of load-bearing, (c) the tagger of record.

### R3 — Relationship to prior research

#### [framing] Missing fourth possibility: partial subsumption

**File:** `research/v1-ai-hub/03-relationship-to-keyword-extractor.md`
**The gap / problem:** A (subsumes), B (references), C (independent) are presented as exhaustive. A real fourth option is **partial subsumption**: the hub adopts a strict subset of the prior research's artefacts (e.g. the locked technical stack survives, the brand-palette draft is re-opened, or vice versa). Not equivalent to A — A subsumes the whole — and not B, because absorbed parts actually move under the hub.
**Why it matters:** Without this option, a user who wants "keep the matching research, throw out the palette" has nowhere clean to land.
**Suggested addition:** Add Possibility D — "partial subsumption" — with its own first-questions block (which artefacts move, which re-open, which are dropped, who arbitrates per-artefact).

#### [framing] A/B/C framing is not equal-weight

**File:** `research/v1-ai-hub/03-relationship-to-keyword-extractor.md`
**The gap / problem:** A reads in clean-inheritance language. C uses "duplicate effort rather than reuse" — a negative-coded phrase. B uses "one possible source of truth", hedged downward. The doc declares equal weight but the prose loads A and disfavours C.
**Why it matters:** Equal-weight framings need equal-weight prose. A user reading quickly will infer A is preferred.
**Suggested addition:** Re-balance: state A's cost (existing locked-scope folder loses standalone identity), B's strength (each folder retains a clean owner), and replace "duplicate effort" with a neutral description of C.

### Cross-file

#### [coherence] R0 §2 "bundle sharing only branding" overlaps R3 Possibility B

**File:** `research/v1-ai-hub/00-vision-sketch.md`, `research/v1-ai-hub/03-relationship-to-keyword-extractor.md`
**The gap / problem:** R0 §2's "bundle sharing only branding" shape is functionally R3's Possibility B at the relationship level. The two docs do not reference each other on this point.
**Why it matters:** Picking R0's "bundle" shape effectively picks R3's B; that linkage should be visible.
**Suggested addition:** A one-line cross-reference in both directions, naming the linkage without collapsing it.

#### [coherence] README abstracts are accurate but understate R2's gaps

**File:** `research/v1-ai-hub/README.md`
**The gap / problem:** R2's abstract calls itself the "Load-bearing list of every TBD". The audit above shows several TBDs from R0/R1 are not mirrored, and the regulatory layer is absent. "Every" is too strong.
**Why it matters:** A future agent trusting the abstract will believe R2 is complete.
**Suggested addition:** Soften the abstract to "Load-bearing list of known TBDs across product identity, form factor, tool surface, users, inputs/outputs, non-functional, business, brand — gaps logged in `critiques/`".

#### [gap] README does not say what the next artefact is

**File:** `research/v1-ai-hub/README.md`
**The gap / problem:** A cold reader can tell what each report contains, but not what artefact the folder is meant to produce next. R2 §10 addresses this internally; the README does not surface it. The prior-research index names `IMPLEMENTATION-PLAN.md` as its next artefact; this folder's "next step" is silent.
**Why it matters:** Telos clarity is a precondition for knowing when the folder is done.
**Suggested addition:** A short "Next artefact" block in the README naming candidates (decisions log, narrowing pass on R0 §2, R4 once written) without committing.

#### [framing] Folder leans tool-suite even though single-tool is on the table

**File:** `research/v1-ai-hub/README.md`, `research/v1-ai-hub/00-vision-sketch.md`, `research/v1-ai-hub/01-tool-catalogue.md`
**The gap / problem:** R0 lists "single product vs suite" as a tension, but R1 is a catalogue with 20 candidates and the README says "Tool 1... Sibling tools brainstormed". The apparatus assumes pluralism. A "the hub is one tool, weather, and 'hub' is aspirational" reading is consistent with the anchor and is not given equal airtime.
**Why it matters:** Catalogue layout primes readers to expect a portfolio. If single-tool wins, R1's framing has to be retro-fitted.
**Suggested addition:** A note in R1 §1 acknowledging "single-tool hub" as a live possibility and that the catalogue's plurality is a brainstorm device.

#### [coherence] Disclosure that R4 is not yet written

**File:** `research/v1-ai-hub/README.md`
**The gap / problem:** README lists R4 as `pending`; the file exists but is still being written. The README does not flag that several findings in R0–R2 are written without that grounding (e.g. R0 §3 "advertisers' creative teams").
**Why it matters:** Company-context findings might invalidate R0/R1 hypotheses.
**Suggested addition:** A one-line note in the README that "R0–R2 may be revisited once R4 lands".

## What the folder is *not* missing

- Correctly absent: any commitment to a stack, vendor, model, or library. That boundary is held cleanly throughout.
- Correctly absent: any timeline, phasing, or rollout plan. R0 §7 and R1 §5 both say so explicitly.
- Correctly absent: any merge of the prior-research folder. R3 holds the line.
- Correctly absent: a recommendation between A/B/C in R3, between product shapes in R0, between tools in R1.
- Correctly absent: defaults dressed up as "for now" choices. R1's TBD lists in particular are honest about non-decision.

## Verdict

The concept holds together. The four reports do not contradict each other on any load-bearing point and the discipline of "everything is a question" is sustained. Three substantive gaps to flag before any narrowing decision: (1) R3 has a missing fourth possibility (partial subsumption) and a framing tilt toward A; (2) R0's "product shapes" axis is really a delivery-shell axis, and the genuinely different shapes (regulatory utility, audience-facing feature, B2B export) are absent or buried; (3) R2 is not the complete TBD register it claims — five R0/R1 items are unmirrored, the Israeli regulatory layer is absent, and one question is triple-stated. None are folder-breaking; all three should be addressed before further decisions.
