# V1 AI Hub — Vision Sketch (R0)

> Status: concept · Owner: A1 (parallel research run) · Last updated: 2026-05-09
> Concept-only. No implementation. No defaults. Every option is non-exclusive.
>
> "V1" = the Israeli media company V1 (Keshet's digital arm). Never "version 1".

---

## 1. TL;DR

V1 AI Hub *might* be a loosely-defined umbrella under the V1 (Keshet) brand that gathers one or more AI-assisted creative tools for media work. It might be one product, or several products sharing only a name. It might serve people inside V1, people adjacent to V1, or people outside V1 entirely. It might live on a desktop, in a browser, behind a chat interface, inside an existing CMS, or as a back-of-house service nobody sees directly. The only firm anchor is that one of its tools concerns turning voice into a vertical weather video. Beyond that, every shape, audience, business model, and surface remains open. This document deliberately preserves that ambiguity rather than collapsing it.

---

## 2. Possible product shapes

The hub could take any of the following forms — and could plausibly take **several at once**, since these are not mutually exclusive. None is recommended.

- **A local desktop app for newsroom editors.** Could be a single-window application that runs on an editor's laptop, doing its work without server round-trips. Might appeal where data residency, offline use, or per-machine licences matter.
- **A hosted web app.** Could be a URL the user logs into from any browser, with state and assets living server-side. Might appeal where collaboration, shared libraries, and zero-install onboarding matter.
- **A hosted SaaS with tenanted accounts.** Could be a product sold or licensed to organisations (V1 itself, or others), with workspace-level isolation. Might appeal if the hub is to be commercialised beyond Keshet.
- **A CLI for an internal pipeline.** Could be a command-line surface used by technical staff or by a build system, with no graphical front end of its own. Might appeal where the hub is plumbing for a larger broadcast or publishing flow.
- **A browser plug-in or in-CMS panel.** Could appear as a side-panel or extension that lights up inside whatever editing/CMS environment V1 staff already use. Might appeal where the goal is to meet users where they already work, not pull them into a new app.
- **An internal API plus a thin UI.** Could be primarily a service — a set of endpoints — with a minimal interface stapled on for the few interactive cases. Might appeal where most use is programmatic and only some flows need a screen.
- **An agency-style "service behind a bot".** Could present as a chat-based assistant inside whatever messaging tool the team already lives in, with humans in the loop for taste and approvals. Might appeal where conversational capture of intent feels lighter than a form-based UI.
- **A bundle of stand-alone tools sharing only branding.** Could be a portfolio in which each tool is independently shipped and the "Hub" is just a website, a logo, and a shared visual identity. Might appeal where the tools are too different to share a single surface.
- **A chat-style assistant front end.** Could be a single conversational entry point that routes to whatever underlying tool fits the request, hiding the tool boundary from the user. Might appeal where the user shouldn't have to know which tool they need.

These shapes can also blend — e.g. a hosted web app with a CLI companion, or an in-CMS panel that calls the same internal API as a chat front end. Treat the list as a palette, not a menu.

---

## 3. Possible audiences

Each entry below is a **hypothesis** about who might benefit, not a target commitment.

- **V1 newsroom editors.** Hypothesis: people who today assemble news segments under deadline pressure might want faster turn-around on routine, format-bound pieces, and might value tools that respect house style and editorial guardrails.
- **V1 social / digital team operators.** Hypothesis: people responsible for vertical-format output across social platforms might want the hub to compress the gap between "we have the raw content" and "it's published, on-format, on-brand".
- **V1 producers.** Hypothesis: people coordinating segments end-to-end might want the hub to act as a planning and review surface — less about doing edits, more about shepherding work through approvals and tracking what was used.
- **V1 freelancers and stringers.** Hypothesis: contributors working from outside the building might want a low-install, low-friction way to submit work in V1's expected shape, without needing the full internal toolchain.
- **V1's external partners** (other Keshet properties, syndication partners, advertisers' creative teams). Hypothesis: organisations adjacent to V1 might want a way to produce V1-compatible assets without being inside V1.
- **V1's end-readers and viewers.** Hypothesis: the audience of V1's published output might, in some product shapes, interact with the hub directly — e.g. a reader-facing tool that personalises or remixes coverage. Whether this audience is in scope at all is itself open.
- **Other newsrooms entirely.** Hypothesis: if the hub is offered as a service, newsrooms outside Keshet might be willing customers, especially for niches V1 has solved well (e.g. Hebrew-first, RTL-first, vertical-first work).

Audiences are not exclusive. A single tool could serve more than one; the hub overall almost certainly would.

---

## 4. Possible roles in the V1 ecosystem

The hub could play any of these roles, and could plausibly play several at the same time. None is recommended.

- **Internal productivity tool.** A way to make V1's own staff faster or steadier at work they already do.
- **Customer-facing product.** A surface that V1's audience interacts with directly, as part of how V1 publishes.
- **B2B service offered to other newsrooms.** A licensed or hosted offering for organisations outside Keshet that face similar problems.
- **R&D / lab brand.** A public-facing wrapper for experimental work — a way to ship rough things under a name that signals "experimental".
- **External-talent attractor.** A vehicle for hiring and partnerships — visible AI-and-media work that draws engineers, designers, and editorial-tech collaborators toward V1.
- **Internal-only platform that other V1 products are built on.** A foundation layer — never user-visible by itself, but the substrate that future V1 features sit on.

---

## 5. Anchor fact

The one thing that *is* known:

> **One of the tools inside the hub will be a weather editing tool that takes voice and produces a vertical video.**

That is the entire factual base of this folder. Everything else in this document is framed around the absence of facts, not the presence of plans. The weather tool is enough to confirm that the hub:

- contains at least one tool,
- works with voice input in some flow,
- produces vertical video in some flow,
- and is associated with V1 (Keshet).

It is *not* enough to confirm form factor, audience, business model, technology, hosting, branding posture, or the existence of any other tool.

---

## 6. Tensions to resolve later (not now)

These are pairs of pulls the project will eventually have to reconcile. They are listed here so that readers can see the design space — **not** so that anyone picks a side now.

- **Internal vs. external.** Is the hub a thing V1 staff use, a thing V1's audience uses, a thing other organisations use, or some mix?
- **Hosted vs. local.** Does the hub run on V1's servers, on an end-user's machine, or both? This intersects with data-residency, offline behaviour, and licensing.
- **Single tool vs. suite.** Is the hub one product that happens to do several things, or several products under one roof?
- **Branded vs. white-label.** Is V1's brand the headline, a co-brand, or invisible (as in a B2B offering customers can rebrand)?
- **Free vs. paid.** Is the hub a cost centre that pays for itself in saved staff time, an ad-supported audience product, a paid SaaS, or a mix?
- **Hebrew-only vs. multilingual.** Does the hub assume HE/RTL primacy, or does it aim at multilingual / multi-script work from day one?
- **Standalone vs. embedded.** Does the hub aim to be its own destination, or to live inside surfaces V1 staff already use (CMS, chat, NLE)?
- **Curated tool surface vs. open tool surface.** Does V1 hand-pick the tools, or does the hub host third-party / community tools under shared branding?

Each tension is real, each is decidable later, and none is decided here.

---

## 7. What this document is NOT

- **Not a product spec.** It does not say what V1 AI Hub *will* do — only what it *could* do.
- **Not a stack pick.** It names no technology, no vendor, no hosting model, no library.
- **Not a commitment.** No shape, audience, role, or tension-resolution above is endorsed. Listing an option is not choosing it.
- **Not a launch plan.** No timelines, no phasing, no go-to-market.
- **Not a final scope.** The next pass — once the user is ready to make decisions — will narrow the space. This pass deliberately keeps it wide.

If a later document quotes this one as evidence that "V1 AI Hub is a [shape]" or "V1 AI Hub serves [audience]", that later document is mis-quoting. This sketch resolves nothing on purpose.
