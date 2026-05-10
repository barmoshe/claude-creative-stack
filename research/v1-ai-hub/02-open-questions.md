# V1 AI Hub — Open Questions (R2)

> Status: concept · Owner: A3 (parallel research run) · Last updated: 2026-05-09
> Every TBD lives here. Every entry is a question, never a recommendation.
>
> "V1" = the Israeli media company V1 (Keshet's digital arm). Never "version 1".

## TL;DR

This file is the canonical to-decide queue for the V1 AI Hub concept. It groups the unknowns we have surfaced so far across scope, identity, audience, surface, behaviour, business, and brand. Nothing here is answered or defaulted. The list is **not** claimed to be exhaustive — gaps surfaced in the parallel critique pass (`critiques/`) are integrated below as §11 (regulatory) and §12 (stakeholder arbitration), and additional gaps may still be unmirrored from R0 / R1. When a question is decided, move it out per the closing block.

## 1. Product identity

1. Is V1 AI Hub an internal newsroom tool, an external public product, an agency offering V1 sells to others, or V1's external face for AI-related work?
2. Is "V1 AI Hub" a permanent product name, a working title for this concept folder, or a code name that will be replaced before anything ships?
3. Who at V1 owns the V1 AI Hub roadmap, and who has the authority to add or remove a tool from its scope?
4. What is the boundary between V1 AI Hub and V1's other (non-AI) editorial or production tooling — does the hub absorb adjacent tools, sit beside them, or stay narrowly AI-only?
5. Is V1 AI Hub allowed to carry the V1 (Keshet) brand publicly, or must it stay an unbranded internal initiative until further notice?
6. Does "hub" in the name imply a single unified surface, a directory of separate tools, or a marketing umbrella over otherwise unrelated products?

## 2. Form factor

1. Should V1 AI Hub be a local desktop application, a browser-based web app, a hosted multi-tenant service, a command-line interface, a plug-in inside an existing CMS, or a combination?
2. Does the hub require a database for persistent state, or is each session ephemeral with no server-side storage between runs?
3. Must the hub run on V1-controlled infrastructure (on-prem), in the public cloud, or in a hybrid arrangement, and what drives that choice?
4. Is the hub single-user (one operator at a time), multi-user with shared workspaces, or team-based with role separation?
5. Does the hub need to function offline or in low-bandwidth conditions, or can it assume a stable internet connection?
6. Is there a requirement for installable native clients on operator machines, or is browser access sufficient?
7. How long should any given piece of state (a draft, a render, an upload) persist before it is purged, archived, or handed off to another system?

## 3. Tool surface

1. Beyond the weather editing tool, which tools belong inside V1 AI Hub at concept stage, and which are explicitly out of scope?
2. Is the weather editing tool a continuation, refactor, or wrapper of the existing `research/keyword-extractor-voiceover/` work, or is it a fresh design that happens to share the weather domain? (Mirror of R3 — answered there once any of A/B/C/D is picked.)
3. What criteria decide whether a candidate tool is "in scope" for V1 AI Hub versus belonging to a sibling product or a one-off project?
4. Does the hub host only AI-driven tools, or also conventional editorial utilities that are merely co-located for convenience?
5. Is there a maximum or target number of tools the hub should expose in the initial released surface, and what is the cost of adding the next tool after that?
6. Do tools share a common shell (navigation, auth, asset library), or is each tool a self-contained surface linked from a landing page?

## 4. Users

1. Who is the primary user role for V1 AI Hub — newsroom editor, producer, social-desk operator, freelancer, or end-reader?
2. Is the operator-facing UI Hebrew-first, English-first, bilingual with parity, or language-switchable per user?
3. Does the operator UI require full right-to-left support, mixed-direction support, or left-to-right only?
4. What is the assumed technical expertise of the operator — non-technical editorial staff, semi-technical producers, or engineers?
5. Are workflows individual (one operator owns a piece end-to-end) or team-based (handoffs between roles, review steps, approvals)?
6. Should the hub support external collaborators (freelancers, agency partners) with limited access, or is it staff-only?
7. How does an operator discover that a tool inside the hub exists, and who is responsible for onboarding new users?

## 5. Inputs / outputs (weather tool specific)

1. What audio formats must the weather tool accept as input, and is there a maximum or minimum duration?
2. Is the input voice recorded ahead of time, captured live in-session, or both?
3. Which languages must the input audio support — Hebrew only, Hebrew and English, or a wider set?
4. What are the required output video dimensions, frame rate, and target duration window?
5. What codec, container, and bitrate envelope does the output need to satisfy for the destination platforms?
6. Are captions required on the output, and if so in which language(s), with what styling, and burned-in versus sidecar?
7. Must the output carry a brand overlay, lower-third, watermark, or end-card, and who controls the design of those?
8. Is background music expected on the output, and if so where does it come from and how is rights-clearance handled?
9. Which target platform(s) is the output cut for first — vertical social feeds, V1's owned apps, broadcast, or all of the above?
10. Does the tool need to produce alternative aspect ratios or duration cuts from the same source in one pass?

## 6. Non-functional

1. What is the acceptable end-to-end latency for the weather tool, from voice input to deliverable output?
2. What is the acceptable latency for any other tool the hub may host?
3. What accuracy threshold must transcription, classification, and matching meet before output is considered shippable?
4. Is there a hard offline requirement for any tool, or is online operation always assumed?
5. Is an audit log of every action, input, and output legally or editorially required, and if so for how long must it be retained?
6. What accessibility requirements apply to outputs (Hebrew captions, alt text, contrast, audio description)?
7. What accessibility requirements apply to the operator UI itself (keyboard navigation, screen-reader support, contrast, motion sensitivity)?
8. How long should source audio, intermediate artefacts, and finished renders be retained before deletion?
9. What is the policy for personally identifiable information that may appear in input audio or in matched assets?
10. What level of system uptime is expected, and is there an on-call or support model behind it?

## 7. Business

1. Is V1 AI Hub funded as an internal cost centre, charged back to internal teams, or sold as a service to external customers?
2. If charged, is the unit of billing per seat, per render, per minute of audio, per month, or a flat enterprise fee?
3. Who owns the copyright and usage rights of assets generated inside the hub — V1, the operator, the originating department, or a shared arrangement?
4. What is the rights-clearance chain for any third-party stock, archive, or generated assets used in outputs?
5. Which legal review process applies before a tool inside the hub goes live with real editorial output?
6. What insurance, indemnification, or takedown posture covers outputs when a rights dispute or accuracy complaint arises?
7. Are there contractual constraints from V1's parent (Keshet) or from existing vendor agreements that limit what the hub can do?
8. What is the budget envelope for variable per-output costs, and who is on the hook when a tool exceeds it?

## 8. Brand

1. Is "V1 AI Hub" the public-facing product name, or only a working title until V1's brand team weighs in?
2. Does the hub inherit the existing V1 palette as documented in `00d-v1-brand-palette.md`, or does it need its own visual identity?
3. What voice and tone applies to copy inside the hub — formal newsroom, conversational social, neutral utility, or something else?
4. How is the V1 logo (and any sub-brand mark) treated inside the operator UI versus inside generated outputs?
5. Is AI involvement disclosed in the output itself (badge, end-card, caption), in metadata, in a published policy, or not at all?
6. Are there brand-safety rules about which subjects, footage, or generated imagery the hub must refuse?
7. Does the hub need a separate visual identity for internal-only views versus anything that ever reaches an audience?

## 9. Relationship to existing repo work

1. Does V1 AI Hub subsume `research/keyword-extractor-voiceover/`, reference it as input, run alongside it, or supersede it entirely (this is the core question R3 is dedicated to — answered there, mirrored here)?
2. Are the knowledge files under `knowledge/` reusable for V1 AI Hub planning, or off-limits because they predate the hub concept?
3. Are the recipes under `recipes/` reusable as scaffolds for hub workflows, or treated as unrelated precedent?
4. Are reusable agent components elsewhere in this repo available to power hub tools, or must hub tools be built from scratch under their own conventions?
5. Are existing local services in this repo eligible to back hub features, or are they out of scope for this concept?
6. Which entries in `00d-v1-brand-palette.md` apply to the hub's UI, to its outputs, to both, or to neither?
7. If the hub eventually graduates into a separate child repo, which parts of the host repo's research and assets travel with it and which stay behind?
8. Is the existing `research/keyword-extractor-voiceover/` folder allowed to keep evolving in parallel, or does it freeze once V1 AI Hub takes a position on it?

## 10. What "done" looks like for this concept folder

1. What signals indicate that this concept folder has gathered enough material to graduate into a real plan?
2. Who decides that the concept is ready to leave the research stage — the user alone, V1 stakeholders, or a joint review?
3. What artefact does the next stage produce — a product brief, an execution plan, a child repo scaffold, or something else?
4. What is the gate criterion for graduation — must all questions in this file be answered, or only a defined subset?
5. How is "load-bearing" defined for any subset gate above — by section, by user vote, by stakeholder sign-off, or by some other rule?
6. Who is the tagger of record that decides which questions are load-bearing and which can be deferred?
7. What is the rollback path if the concept is judged not viable after this folder is complete?
8. Where does the decision log live once questions in this file start being answered, and who is responsible for keeping it current?

## 11. Regulatory and editorial-standards layer (Israel)

> Surfaced by `critiques/02-concept-audit.md` and reinforced by the legal lens in `critiques/03-stakeholder-audit.md`. R2 originally treated regulation as out of scope; that is itself a decision the user has not made.

1. Which Israeli regulatory regimes apply to V1 AI Hub outputs — Second Authority for Television and Radio (over Keshet 12), Press Council code, telecom/broadcast licensing, none, or some combination?
2. What changes inside the hub during an Israeli election period — different review gates, different attribution, different fact-check posture, or no change?
3. What disability-access obligations apply to hub-produced content (Hebrew captions, audio descriptions, RTL contrast, screen-reader compatibility), and which apply at draft stage versus publish stage?
4. What is the takedown / correction posture for AI-assisted content already published — same as editorial corrections, faster, slower, or via a separate channel?
5. Do Keshet parent obligations (industry codes, advertiser commitments, regulator agreements) cascade to V1 AI Hub outputs by default, or only when an output reaches Keshet-owned distribution?
6. Is the hub responsible for court-imposed publication restrictions (gag orders, identity protection, minor-protection rules), or is that strictly a downstream editorial gate?
7. How is identifiable-person consent handled for any third-party asset the hub ingests, given Israeli privacy-law obligations?

## 12. Stakeholder arbitration and integration

> Surfaced by `critiques/03-stakeholder-audit.md`. The cross-lens pattern — *who arbitrates whether an output is good enough to publish under V1's name?* — is unanswered across editorial, brand, legal, and producer lenses.

1. **Publishability arbitration.** Who has final say on whether a hub output is publishable under the V1 name — the operator, an editor, an auto-gate, or a named role that does not exist yet?
2. **Editorial register and house voice.** How is V1's house voice (Hebrew formal vs colloquial; tabloid-leaning vs broadsheet) encoded so a hub output reads as V1 rather than as generic AI?
3. **Hallucination and factual safety.** What is the failure mode when a hub output asserts something not in the input — silent edit, surfaced flag, hard block, or human-only review?
4. **Real-time security incidents.** What does the hub do during an active security incident in Israel — pause, switch to a constrained mode, escalate, or carry on?
5. **Producer / desk-editor workflow.** What happens when a hub tool fails under deadline — manual fallback, queue retry, alternate tool, or no fallback? Whose phone rings?
6. **Re-cut and re-publish.** Once a hub output is published, what is the path for re-cutting, re-rendering, or re-publishing a corrected variant — same workflow, expedited workflow, or out of scope?
7. **CMS / DAM / publishing-pipeline integration (category only).** Where in V1's existing publishing pipeline does the hub plug in — upstream of the CMS, inside it, downstream of it, or beside it? (Specific tool/vendor names are out of scope here — see `critiques/03-stakeholder-audit.md` engineering-lens framing.)
8. **On-call and operations ownership.** Who owns hub operations when something breaks — V1's editorial desk, V1 engineering, Keshet Digital engineering, an external vendor, or unstaffed?
9. **Brand attribution of AI involvement.** When a hub-assisted output is published, does it carry an AI-involvement disclosure (on the artefact, in metadata, or absent), and who decides?
10. **Asset-rights chain and indemnification.** When a hub output mixes V1 assets, third-party assets, and AI-generated assets, who owns the rights chain, who indemnifies V1 if a downstream claim arrives, and what is logged at output time to support that?
11. **Output provenance / content credentials.** Are hub outputs tagged with content-credential / provenance metadata (so a downstream consumer can verify the content's chain of custody), or is that out of scope?
12. **Sponsor of record inside the org.** Given R5's finding that no public role currently named at V1 maps to "head of AI", who at Keshet Digital or V1 is the natural sponsor for the hub, and is that role currently filled?

## How to use this doc

When the user makes a decision on any of these, move it from this file to a new `decisions.md` (or annotate inline as `RESOLVED: <date> — <answer>`). Never silently delete a question.
