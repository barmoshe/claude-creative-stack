# V1 AI Hub — Rigor & Format Audit (Critique C1)

> Status: concept-critique · Owner: C1 (parallel critique run) · Last updated: 2026-05-09
> Audit of R0–R3 + README against the folder's stated discipline. Not new content.
>
> "V1" = the Israeli media company V1 (Keshet's digital arm). Never "version 1".

## TL;DR

12 findings: **2 blocker**, **7 should-fix**, **3 nit**. The most important finding is that `README.md` violates its own forbidden-token rule on line 21 by spelling out two banned proper nouns in the same sentence — the document that defines the discipline breaks the discipline. R2 has the most findings (4). The folder's overall posture (no defaults, every TBD logged, three equal-weight options in R3) is mostly intact, but `README.md` and R3 leak implementation specifics that the other reports successfully avoid.

## Findings

### Category 1 — Forbidden-token leak

#### [blocker] README enumerates two banned proper nouns in a single line

**File:** `README.md`
**Quote / location:** line 21 — "No code, no stack, no infra, no [redacted-A] servers, no [redacted-B], no model picks."
**Why this is a problem:** The line is intended as a list of things the folder will *not* contain, but it spells out two of the exact proper-noun tokens the audit rules forbid. A negation does not exempt the token; the words themselves are banned in this folder.
**Suggested fix:** Replace the two banned tokens with neutral paraphrases — e.g. "no integration servers, no agent-skill packages, no model picks." Keeps the meaning, drops the banned strings.

### Category 2 — "V1" naming-rule violations

#### [should-fix] "first launch" wording risks aliasing onto the V1/version-1 confusion

**File:** `02-open-questions.md`
**Quote / location:** line 37 — "Is there a maximum or target number of tools the hub should expose at first launch…"
**Why this is a problem:** Not a literal "V1" violation, but the surrounding folder treats "first launch / first iteration / version 1" as the dangerous-twin concept. "First launch" is fine in isolation, yet next to "V1 AI Hub" in the same paragraph it nudges readers toward the very ambiguity the README disclaimer is trying to prevent.
**Suggested fix:** Reword to "at the point the hub is first exposed to users" or "in the initial released surface", to keep the version-generation framing out entirely.

#### [nit] README normative text mixes "V1" the company with "first-version product" inside one sentence

**File:** `README.md`
**Quote / location:** line 7 — "…it means an AI tooling hub for the V1 (Keshet) brand, not a first-version product."
**Why this is a problem:** The clause is correct and useful as a disambiguation, but the construction puts "V1" and "first-version product" within the same breath, which a skim-reader could still mis-parse. The rule says any *ambiguous* usage is a finding.
**Suggested fix:** Split into two sentences — first the positive ("…the V1 (Keshet) brand."), then the negative as a standalone disclaimer ("It does not mean a first-version product.").

### Category 3 — Default / recommendation creep

#### [should-fix] R1 row 9 editorialises in favour of one candidate tool

**File:** `01-tool-catalogue.md`
**Quote / location:** line 105 — "Producers often write VO last, fastest, and worst; assistance there is high-leverage."
**Why this is a problem:** "High-leverage" is comparative praise. Other rows in the same table use neutral phrasing ("reduces the load", "saves real minutes"). Singling out one entry as high-leverage breaks the equal-weight posture the catalogue claims.
**Suggested fix:** Replace "high-leverage" with neutral phrasing — e.g. "assistance there changes a step many producers describe as rushed."

#### [nit] R0 uses "the entire factual base" which slightly overweights the anchor fact

**File:** `00-vision-sketch.md`
**Quote / location:** line 69 — "That is the entire factual base of this folder."
**Why this is a problem:** Not a recommendation, but the phrasing is rhetorical rather than precise; readers downstream may quote it as a foundational claim. The folder's discipline is "the user has shared one fact"; "entire factual base" frames that more grandly.
**Suggested fix:** Soften to "That single statement is the only fact the user has supplied so far."

### Category 4 — Concept-vs-implementation creep

#### [blocker] R3 reproduces concrete output specs and a build-plan duration from the sibling folder

**File:** `03-relationship-to-keyword-extractor.md`
**Quote / location:** line 14 — "…the output canvas (1080×1920, 30 fps), the audience (a named friend at Keshet), and the report catalogue. It sits at tool-level concept depth — picks per-decision defaults, names candidate components, ends in a synthesis report with a two-week build plan."
**Why this is a problem:** The audit rules forbid pixel dimensions, frame rates, and timeline numbers in this folder. Even when summarising a *neighbour* folder, the V1 AI Hub folder is still the speaker; the moment those numerals appear here, they become quotable as if the hub had adopted them.
**Suggested fix:** Replace specifics with category labels — "fixes a target canvas, frame rate, and audience" and "ends in a synthesis report with a fixed build-plan horizon." Keeps the structural point, drops the numerals.

#### [should-fix] R2 names concrete server directories under the implementation tree

**File:** `02-open-questions.md`
**Quote / location:** line 103 — "Are the local servers under `mcp/servers/` (asset-router, palette-oklch, sprite-packer) eligible to back hub features…"
**Why this is a problem:** The rules explicitly call out file paths inside the implementation tree as a blocker-tier signal. Naming three concrete server directories — and the integration-protocol folder above them — drags the concept folder into implementation territory.
**Suggested fix:** Reword to "Are existing local services in this repo eligible to back hub features, or out of scope for this concept?" — the question is preserved; the paths and names are not.

#### [should-fix] R2 also references the agent-skill folder by name

**File:** `02-open-questions.md`
**Quote / location:** line 102 — "Are the existing skills under `skills/` available to power tools inside the hub…"
**Why this is a problem:** Same category as above — references an implementation directory by name, and uses the bare proper noun for the agent-skill mechanism that the audit rules treat as forbidden.
**Suggested fix:** "Are reusable agent components elsewhere in this repo available to power hub tools, or must hub tools be built from scratch?"

### Category 5 — Question-form discipline (R2 only)

No findings. All numbered entries in `02-open-questions.md` end with `?`. Confirmed by line-by-line scan; the file is consistent on this rule.

### Category 6 — Equal-weight discipline (R3 only)

#### [should-fix] R3 Possibility C is framed as wasteful relative to A and B

**File:** `03-relationship-to-keyword-extractor.md`
**Quote / location:** line 37 — "What distinguishes the hub's weather tool from the existing one strongly enough to justify duplicate effort rather than reuse?"
**Why this is a problem:** The phrase "duplicate effort rather than reuse" presupposes that the prior research is reuse-worthy and that taking C means accepting waste. That is not a neutral framing of three equal-weight options; A and B do not face an equivalently loaded question.
**Suggested fix:** Reword neutrally — e.g. "What design or audience differences would make a fresh hub-side tool the right shape for the hub, even given the existing line?"

### Category 7 — Internal contradictions across files

#### [blocker] README status table contradicts the actual landed reports

**File:** `README.md`
**Quote / location:** lines 30–34 — every row shows `pending` and an em-dash for "Updated".
**Why this is a problem:** R0, R1, R2, and R3 all carry `Status: concept` and `Last updated: 2026-05-09` in their own front-matter. The README still labels them `pending` with no date. A reader trusting the index would conclude no draft exists; a reader opening the files would see four landed drafts. The two states cannot both be right.
**Suggested fix:** Update README rows for R0–R3 to `concept` and `2026-05-09`. Leave R4 as `pending` until A5 lands.

#### [nit] README "What this folder is NOT" forbids picks; status legend then implicitly anticipates them

**File:** `README.md`
**Quote / location:** line 36 — "Status legend. `pending` = agent has not yet landed a draft · `concept` = first concept-level pass exists, nothing past concept."
**Why this is a problem:** The legend matches the discipline (only two values, both pre-decision), so this is fine in isolation — but the row data on lines 30–34 still says `pending` for files that have moved past `pending`. A small inconsistency, called out separately so the legend itself is not mistakenly edited.
**Suggested fix:** Keep the legend as written; only the rows need updating per the previous finding.

### Category 8 — Overclaim / over-specificity

#### [should-fix] R3 asserts the existing folder "fixes" inputs and audience as locked facts

**File:** `03-relationship-to-keyword-extractor.md`
**Quote / location:** line 14 — "…fixes the input (Hebrew-primary daily voiceover) … the audience (a named friend at Keshet)…"
**Why this is a problem:** "Fixes" is stronger than this folder is licensed to claim about a neighbour. The hub folder is concept-only; characterising another folder's decisions as "fixed" reads like a downstream commitment, especially since A/B/C in R3 then ask whether those locks transfer.
**Suggested fix:** Use "records" or "states" instead of "fixes". The structural point — that the other folder has tighter scope than this one — survives without the overclaim.

### Category 9 — Format consistency

#### [should-fix] R1 introduces a non-legend "Status:" value inline

**File:** `01-tool-catalogue.md`
**Quote / location:** line 14 — "**Status:** the one tool the user named — concept only."
**Why this is a problem:** The README declares only two status values: `pending` and `concept`. Line 14 invents a free-text status for the weather tool ("the one tool the user named — concept only"). That is human-readable but breaks legend discipline; a future agent grepping for status values gets a hit that does not match the legend.
**Suggested fix:** Either drop the inline "Status:" label here entirely, or restrict it to `concept` and move the prose to a separate sentence.

### Category 10 — Stale TODOs / placeholder leaks

No findings. Grep for `TODO`, `FIXME`, `XXX`, `<DATE>`, `<replace>`, "lorem" returned nothing. Front-matter dates are concrete; no raw-output preambles detected.

## What's working well

- R0, R1, and R2 each carry the same three-line front matter (status, owner, naming reminder). That repetition is exactly the format consistency the folder asks for.
- R2 holds question form across roughly 75 numbered entries without slipping into recommendations.
- R3 keeps three sections of similar length and structure (one description paragraph plus two questions each), which preserves the equal-weight visual frame even where wording could be tightened.
- The naming reminder ("V1" = the Israeli media company) appears in every report's header, not only in the README. That redundancy is doing real work.
- R1 explicitly defers the relationship question to R3 instead of half-answering it — a clean separation of concerns.

## Verdict

The folder's discipline is mostly holding, but not entirely. With **2 blocker findings** outstanding — the forbidden-token leak in `README.md` line 21 and the implementation-specific quote in `03-relationship-to-keyword-extractor.md` line 14 — the folder cannot truthfully claim it is concept-only and free of banned tokens. The README's stale status table is a third blocker because it actively misrepresents the state of its own contents. Fix those three lines plus the should-fix items in R2 and R3, and the folder returns to the posture it advertises.
