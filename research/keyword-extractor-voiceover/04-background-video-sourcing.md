# R4 — Background Video Sourcing

> Status: draft
> Owner: Wave-2 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

At ~15 B-roll scenes/day, **Pexels** is the cheapest first-try with hard `orientation=portrait` filter; **Pixabay** is fallback with `orientation=vertical`, identifiable-person/brand risk, and a mandatory 24-hr cache (https://pixabay.com/api/docs/). Paid stock wins on indemnification but loses on API maturity — **Artgrid has no public API** (https://www.saasworthy.com/product/artgrid); Storyblocks API is contact-sales-only with $20k–$1M indemnification (https://www.storyblocks.com/pricing). **Luma Ray2** and **Runway Gen-3 Alpha Turbo** both accept `aspect_ratio="9:16"` and price ≈ $0.45–0.60 per 5s clip — competitive once Pexels hit-rate falls below ~85%. **No source confirmed Hebrew (`he-IL`) as a search locale**; translate HE→EN before query (https://help.pexels.com/hc/en-us/articles/47678194141337). License-traceability metadata is feasible from every source.

## Scope & questions

B-roll sourcing only — graphic scenes are R-graphics. Per `HANDOFF.md` §4 R4:

1. Which of {Pexels, Pixabay, Storyblocks, Artgrid, Envato, Ray2, Gen-3 Turbo} expose a programmable API?
2. Per source: vertical filter, licence + indemnification, price, weather-vertical coverage, cache rights, Hebrew metadata.
3. Stock-vs-generate trade-off at ~15 scenes/day.
4. Proposed default sourcing order (R9 locks) with per-keyword routing.
5. License-traceability metadata that R6's EDL must propagate.

## Findings

### Comparison table

| Source | Tier | API? | Vertical filter | Licence + Indemnif. | Price (2026-05-07) | HE search | Cache rule |
|---|---|---|---|---|---|---|---|
| **Pexels** | Free | REST | `orientation=portrait` ([1]) | CC0-style; no indemn. | $0; 200/hr, 20k/mo ([1][15]) | 28 locales, none HE ([2]) | Persist OK |
| **Pixabay** | Free | REST | `orientation=vertical` ([3]) | Person/brand risk flagged; no indemn. | $0; 100/min ([3]) | `lang` excludes HE ([3]) | **24-hr cache required** ([3]) |
| **Storyblocks** | Paid | Enterprise contact-sales ([5]) | UI yes; API unconfirmed | RF; Business+ for broadcast; **$20k indiv. / $1M Business+** ([4]) | Subs from $21/mo; API ~$6–12k+/yr ([4][17]) | Unconfirmed | Perpetual on already-licensed |
| **Artgrid** | Paid | **No public API** ([6]) | UI only | Worldwide RF incl. broadcast/TV ([6]) | $19.99–$49.92/mo annually ([6][7]) | Unconfirmed | Manual local cache |
| **Envato Elements** | Paid | Subscriber API not public ([8]) | UI only | Per-download; no broadcast/resale ([8]) | ~$16.50–$33/mo ([9]) | Unconfirmed | Licences perpetual post-cancel ([8]) |
| **Luma Ray2** | Per-clip | REST + `mcp-luma` | `aspect_ratio="9:16"` ([10]) | Commercial on paid; no indemn. | **$0.45–0.50 / 5s @ 720p** ([10][11]) | EN-prompt safest | User-owned |
| **Runway Gen-3 Alpha Turbo** | Per-clip | REST | `aspect_ratio="9:16"` (768×1280) ([12]) | Commercial on paid; no indemn. | **5 cr/s ≈ $0.50–0.60 / 5s** ([13][14]) | EN-prompt safest | User-owned |

### Per-source notes

**Pexels.** Free REST API. Video search accepts `orientation` ∈ {`landscape`,`portrait`,`square`} and `size` ∈ {`large`(4K),`medium`(FHD),`small`(HD)} ([1][15]). `orientation=portrait` is the hard filter; no narrower 9:16 selector — expect 3:4 / 2:3 noise the matcher must screen by ratio. Default 200 req/hr, 20k/mo, with `X-Ratelimit-Remaining` headers ([16]). **Hebrew not in the 28-locale list** — translate first. Site-side, "rain" returns ~3,400 videos total; portrait subset is a minority ([17]).

**Pixabay.** Video API at `pixabay.com/api/videos/`. `orientation` ∈ {`all`,`horizontal`,`vertical`} ([3]). Licence flags identifiable-person, brand, and building risk — newsroom must add a pre-cut face/logo screen (PRE-RESEARCH §7.4). **24-hr cache is mandatory** at TOS level, so the matcher must persist locally rather than re-fetch ([3]). `lang` accepts ~26 locales; no Hebrew ([3]).

**Storyblocks.** API is contact-sales-only; independents cite enterprise tiers ~$6–12k+/yr ([5]). Subscription unlimited downloads from ~$21/mo ([4]). Decisive feature: **$20k indemnification on individual plans, $1M on Business+** — uniquely relevant if the segment airs on broadcast as well as Reels (Business+ required for broadcast) ([4]). API vertical-filter mapping unconfirmed — flag as **open**.

**Artgrid.** **No public REST API** ([6]) — pipeline integration would mean scraping (TOS risk) or manual curation. $19.99–$49.92/mo billed annually ([6][7]). Worldwide royalty-free including broadcast/TV ([6]). Broadcast-tier quality. Defer unless a licence-bundle deal includes API access.

**Envato Elements.** Commercial licence on every download; restrictions: no resale, no on-demand merch, music can't go to broadcast ([8]). ~$16.50/mo entry ([9]). Subscriber-side full search/download API is **not public**; verify with Envato support.

**Luma Ray2.** REST API at `lumalabs.ai`; also wrapped by `mcp-luma` (PyPI) per `knowledge/13-asset-pipelines.md`. `aspect_ratio` ∈ {`16:9`,`9:16`,`1:1`,`4:3`,`3:4`,`21:9`,`9:21`} — 9:16 first-class ([10][11]). Fixed 720p output; ~$0.45–0.50 per 5s clip; same price for 5s or 9s on some platforms ([10]). Generated assets are user-owned — cache freely.

**Runway Gen-3 Alpha Turbo.** REST API; 9:16 resolves to 768×1280 ([12]). Pricing: **5 credits/sec** = 50 credits per 10s clip; on the Standard plan (625 credits ≈ $15) that's ~$1.20 / 10s, ≈ $0.60 per 5s ([13][14]). Slightly pricier than Ray2 per-second but stronger on motion brushes ([12]).

### Stock-vs-generate trade-off

At ~15 broll scenes/day:

- **All-Pexels:** $0 marginal. Latency 1–3 s/clip → ≤45 s/day.
- **All-generate (Ray2 @ $0.45 × 15):** ~$6.75/day, ~$200/mo. Latency 30–90 s/clip → ~15 min/day blocking. Wins on on-brand consistency and hyper-specific prompts ("Tel Aviv skyline at 6 a.m. with haze") no stock vertical carries.
- **Hybrid (90% Pexels + 10% generate):** ~$0.70/day, ~$20/mo — expected sweet spot.

**Break-even:** at 450 scenes/mo, a 10–15% generation rate (~45–68 clips) costs roughly the same as a Storyblocks unlimited subscription ($21/mo). Above that, paid stock is cheaper than per-clip generation; below, hybrid free-tier wins.

### Default sourcing order (proposed — R9 locks)

1. **Local in-house cache** (city-specific clips first).
2. **Pexels** `orientation=portrait` — generic weather verbs, ≥85% expected hit-rate.
3. **Pixabay** `orientation=vertical` — fallback with face/brand pre-screen.
4. **Storyblocks** — only if subscription budgeted and broadcast indemnification required.
5. **Luma Ray2** — last resort for generic misses; first resort for hyper-specific prompts.
6. **Runway Gen-3 Alpha Turbo** — when Ray2 motion realism fails or motion-brush control needed.

Per-keyword routing:

| Keyword class | Route |
|---|---|
| Generic ("rain", "wind", "fog") | Pexels → Pixabay → Ray2 |
| City-specific ("Tel Aviv at night") | Local cache → Pixabay → Ray2 |
| Hyper-specific ("umbrella in storm, neon") | Ray2, skip stock |
| Broadcast-aired segment | Storyblocks Business+ first |

### License-traceability

> **Implications block.** Every clip R5 returns must carry: `{source, clip_id, license, attribution, downloaded_at, prompt?}`. R6's EDL must propagate this into the final render manifest so legal can audit any frame to its source. R8 consumes it to enforce the Pixabay face/brand pre-cut screen and the broadcast → Storyblocks-Business+-only rule.

## Implications for keyword-extractor-voiceover

- A **keyword pre-translator** is mandatory: HE → EN before any stock-API call.
- The matcher (R5) must enforce a **vertical-aspect double-check** after `orientation=portrait` — Pexels' bucket is broader than 9:16.
- Pixabay's 24-hr cache rule and identifiable-person risk both push toward a **persistent local clip bank** rather than per-run re-fetch.
- The **paid-stock-subscription decision** belongs to R8/R9: free-tier is sufficient for MVP; broadcast-aired output triggers a Storyblocks Business+ requirement on legal grounds.
- The license-traceability envelope is non-optional and must be in R5's matcher contract from day one.

## Open questions

- **Storyblocks API vertical filter:** does the REST endpoint accept `orientation`, or is filtering UI-only? Sales-call needed.
- **Envato subscriber API:** does any first-party subscriber search/download API exist? Verify with support.
- **Luma Ray2 720p → 1080×1920:** R6 upscale path, or wait for a Ray3/Photon native-1080p vertical?
- **Hebrew search via embeddings:** could a CLIP/SigLIP wrapper over Pexels/Pixabay let us query HE directly? Flag for R5.
- **Vertical-weather catalogue size on Storyblocks/Artgrid/Envato:** unverified; needs trial-account before subscription commitment.

## Sources

1. Pexels API docs — https://www.pexels.com/api/documentation/
2. Pexels search-language help — https://help.pexels.com/hc/en-us/articles/47678194141337
3. Pixabay API docs — https://pixabay.com/api/docs/
4. Storyblocks pricing — https://www.storyblocks.com/pricing
5. Storyblocks API page — https://www.storyblocks.com/resources/business-solutions/api
6. Artgrid review (SaaSworthy, Apr 2026) — https://www.saasworthy.com/product/artgrid
7. Artgrid pricing — https://artgrid.io/pricing
8. Envato Elements Licence FAQ — https://help.elements.envato.com/hc/en-us/articles/360000629346
9. Envato Elements pricing — https://elements.envato.com/pricing
10. Luma Ray2 guide (DIMA AI, 2026) — https://www.dima-ai.com/docs/media-generator/understand-luma-ray-2-0-video-generator
11. Luma Ray2 on fal.ai — https://fal.ai/models/fal-ai/luma-dream-machine/ray-2
12. Runway Gen-3 Alpha & Turbo (help) — https://help.runwayml.com/hc/en-us/articles/30266515017875
13. Runway pricing 2026 (DEV.to) — https://dev.to/techsifted/runway-ml-pricing-2026-gen-3-credits-plan-limits-and-which-tier-is-actually-worth-it-3hmp
14. Runway API pricing — https://docs.dev.runwayml.com/guides/pricing/
15. Pexels rate-limit help — https://help.pexels.com/hc/en-us/articles/900006470063
16. Pexels "rain" search (sample) — https://www.pexels.com/search/videos/rain/
17. Stock video API review (Plainly) — https://www.plainlyvideos.com/blog/stock-video-api
