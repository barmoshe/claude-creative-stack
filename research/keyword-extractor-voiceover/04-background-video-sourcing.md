# R4 — Background Video Sourcing

> Status: draft
> Owner: Wave-2 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

At ~15 B-roll scenes/day, **Pexels** is the cheapest first-try with hard `orientation=portrait` filter; **Pixabay** is fallback with `orientation=vertical`, identifiable-person/brand risk, and a mandatory 24-hr cache (https://pixabay.com/api/docs/). Paid stock wins on indemnification but loses on API maturity — **Artgrid has no public API** (https://www.saasworthy.com/product/artgrid); Storyblocks API is contact-sales-only with $20k–$1M indemnification (https://www.storyblocks.com/pricing). **Luma Ray2** and **Runway Gen-3 Alpha Turbo** both accept `aspect_ratio="9:16"` and price ≈ $0.45–0.60 per 5s clip — competitive once Pexels hit-rate falls below ~85%. **No source confirmed Hebrew (`he-IL`) as a search locale**; translate HE→EN before query (https://help.pexels.com/hc/en-us/articles/47678194141337). License-traceability metadata is feasible from every source.

## Scope & questions

This report covers **B-roll sourcing only** — generated graphic scenes (temperature tables, maps, lower thirds) are R-graphics' problem. The questions, per `HANDOFF.md` §4 R4:

1. Which of {Pexels, Pixabay, Storyblocks, Artgrid, Envato, Luma Ray2, Runway Gen-3 Alpha Turbo} expose a programmable API at all?
2. Per source: vertical-orientation filter, licence terms (commercial / newsroom / indemnification), $/clip or $/month, weather-vertical coverage, cache-and-reuse rights, Hebrew metadata.
3. Stock-vs-generate trade-off at ~15 broll-scenes/day.
4. A proposed (not locked — R9 locks) default sourcing order with per-keyword routing.
5. License-traceability metadata that R6 EDL must propagate.

## Findings

### Comparison table

| Source | Tier | API? | Vertical filter | Licence | Indemnif. | Price (2026-05-07) | HE search | Cache rule |
|---|---|---|---|---|---|---|---|---|
| **Pexels** | Free | Yes (REST) | `orientation=portrait` (hard filter) | CC0-style; attribution requested, not required | None | $0; 200 req/hr, 20k req/mo default ([1]) | No `he-IL`; supports 28 locales, none Hebrew ([2]) | Allowed; downloaded clips persist |
| **Pixabay** | Free | Yes (REST) | `orientation=vertical` (hard filter) ([3]) | Pixabay Content Licence; identifiable-person/brand risk flagged | None | $0; 100 req/min, **24-hr cache mandatory** ([3]) | `lang` param does **not** include `he` ([3]) | **Required** for ≥24 hr |
| **Storyblocks** | Paid | Yes (enterprise contact-sales) | Filter present in UI; API field unconfirmed | Royalty-free; Business+ for broadcast | **$20k individual / $1M Business+** ([4]) | Unlimited subs from $21/mo; API enterprise ~$6–12k+/yr ([4][5]) | Unconfirmed; assume EN-only | Subs grant perpetual licence post-cancellation for already-licensed uses |
| **Artgrid** | Paid | **No public API** ([6]) | Site filter only | Worldwide royalty-free incl. broadcast/TV ([6]) | Implicit via licence | $19.99–$49.92/mo billed annually ([6][7]) | Unconfirmed | Manual download → local cache OK |
| **Envato Elements** | Paid | Limited (Author API; no full search/download API for subscribers) | Site filter only | Per-download licence; no broadcast restriction; no resale ([8]) | None published | ~$16.50–$33/mo ([9]) | Unconfirmed | Existing licences valid forever post-cancel ([8]) |
| **Luma Ray2** | Paid (per-clip) | Yes (REST + `mcp-luma`) | `aspect_ratio="9:16"` accepted ([10]) | Commercial use included on paid tiers | None | **$0.45–0.50 per 5s clip @ 720p** ([10][11]) | Prompt language tolerant; English prompts most reliable | Generated clips owned by user — cache freely |
| **Runway Gen-3 Alpha Turbo** | Paid (per-clip) | Yes (REST) | `aspect_ratio="9:16"` (768×1280) ([12]) | Commercial on paid tiers | None | **5 credits/s** = ~50 credits / 10s clip ≈ $0.50–0.60 ([13][14]) | Prompt language tolerant; EN preferred | User-owned outputs; cache freely |

### Per-source notes

**Pexels.** Free, well-documented REST API. Video search accepts `orientation` ∈ {`landscape`,`portrait`,`square`} and `size` ∈ {`large`(4K),`medium`(FHD),`small`(HD)} — confirmed at `pexels.com/api/documentation` and replicated by independent libraries ([1][15]). `orientation=portrait` is the hard filter we need; there is no narrower 9:16 selector — expect some 3:4 / 2:3 in results that the matcher must screen by `width/height` ratio. Default rate limit: 200/hr, 20k/mo, with `X-Ratelimit-Remaining` headers ([16]). **Hebrew not in the locale list** — translate query first. Vertical weather coverage: site-side, "rain" returns ~3,400 video results overall; portrait-filtered subset is a small minority (rough manual sample <10%) ([17]). Authoritative-attribution-not-required is a minor newsroom plus.

**Pixabay.** Video API at `pixabay.com/api/videos/`. `orientation` ∈ {`all`,`horizontal`,`vertical`} ([3]). The licence explicitly flags identifiable-person, brand, and building risk — newsroom legal must layer a face/logo screen *before* cut, per PRE-RESEARCH §7.4. **24-hr cache is mandatory** (TOS-level, not a soft suggestion) — this aligns with our reuse model but means a clip cannot be re-fetched on demand mid-day; the matcher must persist the asset locally ([3]). `lang` accepts `cs,da,de,en,es,fr,id,it,hu,nl,no,pl,pt,ro,sk,fi,sv,tr,vi,th,bg,ru,el,ja,ko,zh` — no Hebrew ([3]).

**Storyblocks.** API is contact-sales-only; pricing not publicly listed but independent reviewers cite enterprise tiers in the $6k–12k+/yr range ([5]). Subscription side is much cheaper — unlimited downloads from ~$21/mo ([4]). The decisive feature is **$20k indemnification on individual plans, $1M on Business+** — no other source on this list matches it ([4]). Broadcast / TV rights require Business+, so an Israeli newsroom *must* be on Business+ if the segment airs on broadcast as well as Reels. Vertical filter exists in the UI; mapping to the API requires sales-call confirmation — flag as **open**.

**Artgrid.** **No public REST API** ([6]) — pipeline integration would mean Puppeteer scraping (TOS risk) or manual curation. Pricing $19.99–$49.92/mo billed annually ([6][7]). Worldwide royalty-free covering broadcast, TV, social, VR, games ([6]). Quality is broadcast-tier ("story-pack" oriented). For an automated daily pipeline, Artgrid is **deferred** unless a licence-bundle deal includes API/feed access.

**Envato Elements.** Commercial licence on every download; restrictions: no resale, no on-demand merch, music can't go to broadcast ([8]). Stock video clip licence covers ad / client work / monetised social. Public API surface for subscribers is limited — most dev integrations use the Author API or unofficial scrapers — verify with Envato sales before depending on it. ~$16.50/mo entry pricing ([9]).

**Luma Ray2.** REST API documented at `lumalabs.ai`; also wrapped by `mcp-luma` (PyPI) per `knowledge/13-asset-pipelines.md`. Accepts `aspect_ratio` ∈ {`16:9`,`9:16`,`1:1`,`4:3`,`3:4`,`21:9`,`9:21`} — 9:16 is first-class ([10][11]). Fixed 720p output; ~$0.45–0.50 per 5s clip; same price for 5s or 9s on some platforms ([10]). Prompts are English-tolerant; HE prompts work but EN are safer. Generated assets are user-owned — perfect for cache-and-reuse.

**Runway Gen-3 Alpha Turbo.** REST API; aspect ratio selector resolves 9:16 to 768×1280 ([12]). Pricing on Turbo: **5 credits/sec**, 50 credits per 10s clip; on the Standard plan (625 credits ≈ $15) that's ~$1.20 / 10s, or ~$0.60 per 5s ([13][14]). Slightly more expensive than Ray2 per-second but stronger on motion brushes / camera control ([12]).

### Stock-vs-generate trade-off

At ~15 broll scenes/day:

- **All-Pexels:** $0 marginal. Latency: API call + download, ≈ 1–3 s/clip → ≤45 s total/day.
- **All-generate (Ray2 @ $0.45 × 15):** ~$6.75/day, ~$200/mo. Latency: 30–90 s/clip → ~15 min/day blocking. Wins on on-brand consistency (same look across all clips) and on hyper-specific prompts ("Tel Aviv skyline at 6 a.m. with morning haze") that no stock library carries vertically.
- **Hybrid (90% Pexels + 10% generate):** ~$0.70/day, ~$20/mo. The expected sweet spot: Pexels covers generic weather verbs (rain, sun, fog, wind, snow); Ray2 fills the long tail.

**Break-even:** generation becomes cheaper than a paid stock subscription only above ~50 generated clips/mo (vs $21/mo Storyblocks unlimited). At 15 scenes/day × 30 days = 450 scenes, even 10% generate-rate (45 clips) approaches the Storyblocks subscription cost — meaning if generation rate climbs above 10–15%, a paid stock sub becomes cheaper than per-clip generation.

### Default sourcing order (proposed — R9 locks)

1. **Local in-house cache** (already-downloaded clips, especially Israeli-city-specific).
2. **Pexels** with `orientation=portrait` — generic weather verbs, ≥85% expected hit-rate.
3. **Pixabay** with `orientation=vertical` — fallback for misses, with face/brand pre-screen.
4. **Storyblocks** — only if subscription is in budget and broadcast indemnification is required (R8 input).
5. **Luma Ray2** — last resort for generic misses; first resort for hyper-specific prompts.
6. **Runway Gen-3 Alpha Turbo** — when Ray2 motion realism fails or motion-brush control is needed.

Per-keyword routing examples:

| Keyword | Default route |
|---|---|
| "rain" / "wind" / "fog" (generic) | Pexels → Pixabay → Ray2 |
| "Tel Aviv at night" (city-specific) | Local cache → Pixabay → Ray2 |
| "umbrella in storm with neon reflections" (hyper-specific) | Ray2 generate, skip stock |
| Broadcast-airing segment | Storyblocks Business+ first (indemnification) |

### License-traceability

> **Implications block.** Every clip the matcher (R5) returns must carry a metadata envelope:
>
> ```json
> {"source": "pexels|pixabay|storyblocks|artgrid|envato|luma_ray2|runway_gen3", "clip_id": "...", "license": "<licence-string-or-url>", "attribution": "<creator-or-null>", "downloaded_at": "<ISO-8601>", "prompt": "<for generated clips, else null>"}
> ```
>
> R6's EDL must propagate this envelope into the final render manifest so a newsroom legal review can audit any frame back to its source. R8 (guardrails) consumes the same envelope to enforce the face/brand screen on Pixabay and the broadcast-airing → Storyblocks-only rule.

## Implications for keyword-extractor-voiceover

- A **keyword pre-translator** is mandatory: HE-extracted keywords → EN before any stock-API call. None of the listed sources confirmed Hebrew search.
- The matcher (R5) must enforce a **vertical-aspect double-check** even after `orientation=portrait` — Pexels' bucket is broader than 9:16.
- Pixabay's 24-hr cache rule and identifiable-person risk both push toward a **persistent local clip bank** rather than per-run re-fetch.
- A **paid stock subscription decision** belongs to R8/R9: free-tier is sufficient for MVP; broadcast-aired output triggers a Storyblocks Business+ requirement on legal grounds.
- The license-traceability envelope is non-optional and must be designed into R5's matcher contract from day one — adding it later means re-deriving licence metadata for the back-catalogue.

## Open questions

- **Storyblocks API vertical filter:** does the REST endpoint accept an `orientation` parameter, or is vertical filtering UI-only? Requires sales-call confirmation.
- **Envato Elements API for subscribers:** does any first-party subscriber API exist, or is it author-only? Verify with Envato support.
- **Luma Ray2 "9:16 at 1080×1920":** Ray2 is fixed 720p; do we upscale to 1080p in R6, or is there a Ray3/Photon path that outputs native 1920×1080-vertical? Open for R6 to chase.
- **Hebrew search via embedding-based providers:** would a CLIP/SigLIP-based wrapper over a Pexels/Pixabay catalogue let us search HE directly? Off-scope for R4; flag for R5.
- **Vertical-weather catalogue size on Storyblocks/Artgrid/Envato:** unverified — needs trial-account confirmation before any subscription commitment.

## Sources

1. Pexels API documentation — https://www.pexels.com/api/documentation/
2. "Can I change the search language when using the Pexels API?" (Pexels help) — https://help.pexels.com/hc/en-us/articles/47678194141337-Can-I-change-the-search-language-when-using-the-Pexels-API
3. Pixabay API documentation — https://pixabay.com/api/docs/
4. Storyblocks pricing — https://www.storyblocks.com/pricing
5. Storyblocks API resource page — https://www.storyblocks.com/resources/business-solutions/api
6. Artgrid features & pricing review (SaaSworthy, April 2026) — https://www.saasworthy.com/product/artgrid
7. Artgrid pricing (official) — https://artgrid.io/pricing
8. Envato Elements License FAQ — https://help.elements.envato.com/hc/en-us/articles/360000629346-Envato-Elements-License-FAQ
9. Envato Elements pricing — https://elements.envato.com/pricing
10. Luma Ray 2 Guide (DIMA AI, 2026) — https://www.dima-ai.com/docs/media-generator/understand-luma-ray-2-0-video-generator
11. Luma Ray 2 on fal.ai — https://fal.ai/models/fal-ai/luma-dream-machine/ray-2
12. Creating with Gen-3 Alpha and Gen-3 Alpha Turbo (Runway help) — https://help.runwayml.com/hc/en-us/articles/30266515017875-Creating-with-Gen-3-Alpha-and-Gen-3-Alpha-Turbo
13. Runway ML Pricing 2026 (DEV.to write-up) — https://dev.to/techsifted/runway-ml-pricing-2026-gen-3-credits-plan-limits-and-which-tier-is-actually-worth-it-3hmp
14. Runway API pricing (official) — https://docs.dev.runwayml.com/guides/pricing/
15. `pexels-api-py` PyPI — https://pypi.org/project/pexels-api-py/
16. "What steps can I take to avoid hitting the rate limit?" (Pexels help) — https://help.pexels.com/hc/en-us/articles/900006470063
17. Pexels "rain" video search (sample size proxy) — https://www.pexels.com/search/videos/rain/
18. Stock video footage API review (Plainly) — https://www.plainlyvideos.com/blog/stock-video-api
19. Storyblocks pricing review (CheckThat.ai) — https://checkthat.ai/brands/storyblocks/pricing
20. Runway pricing review 2026 (GetAIPerks) — https://www.getaiperks.com/en/articles/runway-pricing
