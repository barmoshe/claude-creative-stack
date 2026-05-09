# V1 AI Hub — Tool Catalogue (R1)

> Status: concept · Owner: A2 (parallel research run) · Last updated: 2026-05-09
> Concept-only. One tool named, all others candidate. No defaults.
>
> "V1" = the Israeli media company V1 (Keshet's digital arm). Never "version 1".

## 1. TL;DR

This is a conceptual catalogue of tools the V1 AI Hub *might* contain. It is brainstorm, not a roadmap. The user has named exactly one tool — a weather editing tool that turns voice input into vertical video. Every other tool listed is a candidate only, surfaced to widen the design space, not to commit to scope. Even the named tool is described at concept level: inputs, outputs, audience, and operating context are all explicitly TBD. Nothing here is a default, an MVP pick, or a phase plan. No stack, no vendors, no models, no infra.

## 2. Tool 1 — Weather editing tool

**Status:** the one tool the user named — concept only.

### One-line description

A tool, sitting somewhere within the V1 (Keshet) editorial environment, that ingests **voice** as its primary input and emits a **vertical video** as its primary output, in the shape of a weather segment.

### Inputs (TBD)

The user has said "voice." Everything below is an open question, not a choice:

- **Language?** Hebrew, English, Arabic, multiple, mixed-language code-switching — not chosen.
- **Format?** Spoken meteorological brief, scripted read, ad-lib commentary, dictated bullet points — not chosen.
- **Recorded vs live?** Pre-recorded file upload, live mic capture, phoned-in audio, broadcast feed tap — not chosen.
- **Length?** A few seconds, ~30 seconds, a minute, several minutes — not chosen.
- **Speaker?** A meteorologist, a presenter, a producer dictating, a synthetic voice, multiple speakers — not chosen.
- **Auxiliary inputs?** Whether structured weather data, location, or forecast metadata accompany the voice — not chosen.
- **Quality assumptions?** Studio-clean vs phone-quality vs noisy field audio — not chosen.

### Outputs (TBD)

The user has said "vertical video." Everything below is an open question, not a choice:

- **Dimensions?** Aspect ratio, pixel size, safe-area conventions — not chosen.
- **Duration?** Fixed length, variable length tied to input, hard cap, lower bound — not chosen.
- **Frame rate?** Not chosen.
- **Captions / subtitles?** Whether burned-in, soft, bilingual, styled, present at all — not chosen.
- **Branding overlay?** Whether a V1 (Keshet) bug, lower-third, intro, outro, or sting is present — not chosen.
- **Music / SFX?** Whether a bed, sting, or silence — not chosen.
- **On-screen text language?** Hebrew, English, both, none — not chosen.
- **Visual style?** Map-driven, footage-driven, motion-graphic, photographic, illustrated, mixed — not chosen.
- **Delivery file format / container?** Not chosen.

### Possible audiences (TBD)

Non-exclusive list of who *might* use this tool. None chosen:

- Newsroom editor finishing a segment under deadline.
- Producer assembling daily weather for social channels.
- Social-team operator repurposing broadcast content.
- Freelancer or stringer delivering a finished cut to V1.
- Meteorologist self-serving a quick web/social drop.
- End-reader self-serve experience inside a V1 product (unlikely but not ruled out).

### Possible operating contexts (TBD)

Non-exclusive list of where the tool *might* live. None chosen:

- A standalone desktop application installed on editor workstations.
- A web upload page reached through a browser.
- A watched-folder pipeline that triggers when audio lands in a directory.
- A plugin or panel inside an existing CMS or editorial tool.
- A chat-bot interface inside a workplace messaging platform.
- A mobile app for capture-in-the-field.
- A back-office automation with no human-facing UI at all.

### Open question — relationship to `research/keyword-extractor-voiceover/`

A prior research folder in this same repo, `research/keyword-extractor-voiceover/`, also explores a voice-to-vertical-video pipeline for V1 / Keshet weather content. The relationship between that work and this hub-level weather tool is genuinely open: the hub tool could subsume that prior research, reference it, share components with it, run alongside it, replace it, or be independent of it. This catalogue takes no position. **A4 owns this question** in `03-relationship-to-keyword-extractor.md`; readers should defer there for any considered framing.

### Explicit non-decisions

The following are **not** decided in this document, deliberately:

- Aspect ratio or pixel dimensions of the vertical video.
- Frame rate.
- Duration or duration policy.
- Source language of the voice.
- Language of any on-screen text or captions.
- Target distribution platform (social network, on-site player, broadcast feed, internal review).
- Whether captions, music, branding, or graphics are present at all.
- Who edits the result (operator, automation, both, neither).
- Who renders the final file (local machine, server, hybrid).
- Who publishes the final file (human, automated, gated).
- Whether the tool is interactive, batch, scheduled, or event-driven.
- Whether a database, queue, or persistent store is involved.
- Whether the tool is single-tenant to V1 or designed to generalise.

## 3. Sibling tool candidates (brainstorm, none committed)

Each entry is a `candidate, not committed`. The list is intentionally wide to map the surface area of an AI hub a newsroom-adjacent organisation *might* build. Nothing here is a recommendation, a phase 1, or even a likely pick.

| # | Candidate tool | One-line description | Why a newsroom *might* want it | Status |
|---|---|---|---|---|
| 1 | Headline / chyron generator | Generates short on-screen titles, kickers, and chyron lines from a longer piece of source copy or audio. | Reduces deadline pressure on producers writing the same line three different ways for three surfaces. | candidate, not committed |
| 2 | Social-cut clip extractor | Pulls highlight clips from a long broadcast or interview, cropped and timed for social posting. | Long-form content rarely surfaces on social without a human cutter; an assistant lowers that cost. | candidate, not committed |
| 3 | Bilingual caption generator | Produces caption tracks in Hebrew and English (and possibly Arabic) from a single source. | V1's audience and source material are multilingual; manual captioning is slow and inconsistent. | candidate, not committed |
| 4 | Thumbnail / cover-frame generator | Suggests or composes thumbnail images for video and article hero slots. | Thumbnail authoring is repetitive, taste-driven, and frequently a publishing bottleneck. | candidate, not committed |
| 5 | Archive search across past broadcasts | Natural-language search over the back-catalogue of broadcasts, transcripts, and stills. | Producers chasing prior coverage of a topic spend time they don't have on archive trawling. | candidate, not committed |
| 6 | On-air graphic generator | Builds lower-thirds, data tables, comparison cards, and simple maps from structured input. | Graphics teams are a chokepoint; a self-serve generator handles the long tail of routine cards. | candidate, not committed |
| 7 | Translation / dub assistant | Translates copy or generates a dubbed track for cross-language reuse of segments. | Cross-publishing across language audiences multiplies the value of a single piece of reporting. | candidate, not committed |
| 8 | Fact-check assistant | Surfaces claims in a draft and proposes citations or flags unverifiable statements. | Reduces the load on editorial review without replacing it. | candidate, not committed |
| 9 | Voice-over scripting assistant | Drafts a read-ready VO script from raw notes, a wire story, or a structured brief. | Producers often write VO last, fastest, and worst; assistance there is high-leverage. | candidate, not committed |
| 10 | Tonal / style consistency checker | Flags drift from V1's house voice across a piece of copy. | House voice erodes when many hands touch the same brand surface. | candidate, not committed |
| 11 | Automatic chapter markers | Generates chapter breaks and titles for long-form video or podcast content. | Improves on-platform retention and discoverability. | candidate, not committed |
| 12 | Accessibility pass | Suggests alt text, audio descriptions, and contrast checks across a piece. | Accessibility is regulated, public-facing, and easy to overlook under deadline. | candidate, not committed |
| 13 | Live-event ticker generator | Produces a rolling ticker or sidebar feed during a live event. | Live coverage benefits from a second author who never sleeps and never misreads a wire. | candidate, not committed |
| 14 | Rights / clearance assistant | Spots unverified third-party material in a draft and prompts for rights confirmation. | Cuts the risk of publishing unlicensed material on a deadline. | candidate, not committed |
| 15 | Audience-comment summariser | Summarises reader / viewer comments into themes and notable quotes. | Useful both for editorial signal and for community management. | candidate, not committed |
| 16 | Sports / score card generator | Produces score cards and recap graphics from a feed or final score. | Sports desks publish at scale and at speed; templated outputs save real minutes. | candidate, not committed |
| 17 | Election / poll dashboard module | Generates rolling result cards and explainers during election cycles. | Predictable, high-stakes content where consistency matters. | candidate, not committed |
| 18 | Push-notification copywriter | Drafts breaking-news push copy variants from the lede of a story. | Push copy is its own discipline that not every desk staffs. | candidate, not committed |
| 19 | SEO / metadata helper | Suggests slugs, meta descriptions, and structured data for a finished piece. | Web desks reuse the same metadata patterns hundreds of times a week. | candidate, not committed |
| 20 | Newsletter assembler | Composes a newsletter draft from the day's published items. | Newsletters are a daily compile job that repeats by definition. | candidate, not committed |

The list is non-exhaustive. Other candidates may surface; none above is committed.

## 4. Cross-cutting concerns (open, not specified)

Every tool above, including the named weather tool, would have to answer the questions below. This catalogue does not answer them. Each is logged as a question, not a decision:

- **Identity / auth.** Who is allowed to run a tool, and how is that established?
- **Audit logs.** What of a tool run is recorded, who can see it, how long is it retained?
- **Brand compliance.** Whose taste arbitrates whether a generated artefact is "on-brand" enough to ship?
- **Language coverage.** Which languages are first-class, which are best-effort, which are out of scope?
- **Accessibility.** Is accessibility a per-tool feature, a hub-level pass, or a publishing-time gate?
- **Rights / licensing.** Where does source media come from, how are rights tracked, who carries the risk?
- **Queueing / throughput.** Is the hub interactive, batch, or both, and what happens when load spikes?
- **Observability.** How is "is this thing working?" answered for operators and for editors?
- **On-prem vs cloud.** Where do bytes live, where does compute happen, what crosses an organisational boundary?
- **Failure surface.** What does a tool do when it can't produce a useful output — fail loud, fail soft, fail invisibly?
- **Human-in-the-loop policy.** Per-tool, hub-wide, or absent altogether?
- **Versioning of outputs.** Is a generated artefact a one-shot, a revisable draft, or a tracked asset with history?

## 5. Disclaimer

No tool listed here is committed to be built. The catalogue is brainstorm. The single anchor is the weather editing tool the user named, and even its specifics are TBD.
