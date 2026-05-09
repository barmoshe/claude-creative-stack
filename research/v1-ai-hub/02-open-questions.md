# V1 AI Hub — Open Questions (R2)

> Status: concept · Owner: A3 (parallel research run) · Last updated: 2026-05-09
> Every TBD lives here. Every entry is a question, never a recommendation.
>
> "V1" = the Israeli media company V1 (Keshet's digital arm). Never "version 1".

## TL;DR

This file is the single canonical list of unknowns for the V1 AI Hub concept. Every gap in scope, identity, audience, surface, behaviour, business, and brand lives here as an unresolved question. Nothing is answered, nothing is defaulted. Use it as the to-decide queue for the user; do not treat any item as implicitly settled. When a question is decided, move it out per the closing block.

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
2. Is the weather editing tool a continuation, refactor, or wrapper of the existing `research/keyword-extractor-voiceover/` work, or is it a fresh design that happens to share the weather domain?
3. What criteria decide whether a candidate tool is "in scope" for V1 AI Hub versus belonging to a sibling product or a one-off project?
4. Does the hub host only AI-driven tools, or also conventional editorial utilities that are merely co-located for convenience?
5. Is there a maximum or target number of tools the hub should expose at first launch, and what is the cost of adding the next tool after that?
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
4. Are the existing skills under `skills/` available to power tools inside the hub, or must hub tools be built from scratch under their own conventions?
5. Are the local servers under `mcp/servers/` (asset-router, palette-oklch, sprite-packer) eligible to back hub features, or are they out of scope for this concept?
6. Which entries in `00d-v1-brand-palette.md` apply to the hub's UI, to its outputs, to both, or to neither?
7. If the hub eventually graduates into a separate child repo, which parts of the host repo's research and assets travel with it and which stay behind?
8. Is the existing `research/keyword-extractor-voiceover/` folder allowed to keep evolving in parallel, or does it freeze once V1 AI Hub takes a position on it?

## 10. What "done" looks like for this concept folder

1. What signals indicate that this concept folder has gathered enough material to graduate into a real plan?
2. Who decides that the concept is ready to leave the research stage — the user alone, V1 stakeholders, or a joint review?
3. What artefact does the next stage produce — a product brief, an execution plan, a child repo scaffold, or something else?
4. How are unresolved questions in this file triaged before graduation — must all be answered, only the load-bearing ones, or a tagged subset?
5. What is the rollback path if the concept is judged not viable after this folder is complete?
6. Where does the decision log live once questions in this file start being answered, and who is responsible for keeping it current?

## How to use this doc

When the user makes a decision on any of these, move it from this file to a new `decisions.md` (or annotate inline as `RESOLVED: <date> — <answer>`). Never silently delete a question.
