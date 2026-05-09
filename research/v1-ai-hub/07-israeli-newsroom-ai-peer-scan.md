# V1 AI Hub — Israeli Newsroom AI Peer Scan (R7, web deep-dive)

> Status: concept · Owner: R7 (deep-web research run) · Last updated: 2026-05-09
> Public-source peer scan, 2024–2026. Every fact cited. No ranking, no benchmarking against V1.
>
> "V1" = the Israeli media company V1 (Keshet's digital arm). Never "version 1".

## 1. TL;DR

Public AI activity in Israeli newsrooms during 2024–2026 is **uneven, mostly project-grade rather than platform-grade, and dominated by a handful of legible bets**. The two outlets most publicly visible about *operational* AI in their own news product are **Reshet 13** (a 2024 partnership with Israeli AI dubbing company Deepdub to localise news into English and Spanish using cloned reporter voices, [Variety, June 2024](https://variety.com/2024/film/global/israel-broadcaster-reshet-13-ai-platform-deepdub-local-news-content-dubbing-1236043088/)) and **Ynet** (Yedioth Group), which is the launch publisher in Israel for Taboola's "Homepage For You" personalisation product, [(Taboola "Ynet" case study)](https://www.taboola.com/resources/case-studies/ynet-2), and one of the publishers carrying Taboola's DeeperDive generative-AI answer engine into Hebrew, [(Taboola press release, 8 Apr 2026)](https://www.taboola.com/press-releases/deeperdive-momentum-expansion/). **Times of Israel** is the most publicly explicit about what its newsroom *will not* do with AI, [(Times of Israel — note to readers on AI guidelines)](https://www.timesofisrael.com/a-note-to-our-readers-regarding-the-times-of-israels-guidelines-on-ai/). Several large Hebrew brands surfaced no public AI initiative tied to their own news product within the search window.

## 2. Source-quality preface

Direct page fetches via WebFetch returned HTTP 403 for `wikipedia.org`, `keshetinternational.com`, `haaretz.com`, `timesofisrael.com`, `ynet.co.il`, `mako.co.il`, `walla.co.il`, `globes.co.il`, `calcalist.co.il`, `n12.co.il`, `i24news.tv`, `kan.org.il`, `13tv.co.il`, `c14.co.il`, `the7eye.org.il`, and `maariv.co.il`. Every fact below is therefore drawn from search-engine snippet text and from third-party trade press (Variety, TV Tech, Press Gazette, Reuters Institute, Poynter, NiemanLab, prnewswire, globenewswire, ppc.land) which were also reachable only via search snippets in this environment. Where a snippet is the only available evidence, the citation label says so. No paywalled body copy was used.

A second caveat: Israeli outlets cover *AI as a topic* extensively (every brand in the peer set has an "artificial intelligence" tag page) — that is *coverage*, not *use*. This report excludes coverage and only catalogues *the outlet's own AI use in its product or workflow* where public sources document it.

## 3. Per-outlet matrix

| # | Outlet | Parent group | Language posture | Public AI activity in 2024–2026 (1–2 lines) | Source |
|---|---|---|---|---|---|
| 1 | **mako** | Keshet Media Group [(Keshet International "mako")](https://www.keshetinternational.com/mako) | Hebrew portal, RTL [(Keshet International "mako")](https://www.keshetinternational.com/mako) | No public AI activity surfaced *for the mako product itself* in 2024–2026 — extensive *coverage* of AI exists on the `mako.co.il/news-money/tech12/` and tag pages [(mako AI tag page — search snippet)](https://www.mako.co.il/Tagit/%D7%91%D7%99%D7%A0%D7%94+%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA), but no announced internal AI tool, byline, voice clone, or partnership in our searches. Status: **none surfaced**. | search snippets only |
| 2 | **Ynet** | Yedioth Ahronoth Group [(Ynet — Wikipedia summary, search snippet)](https://en.wikipedia.org/wiki/Ynet) | Hebrew + English (`ynetnews.com`) + Russian, per Taboola case study language list [(Taboola "Ynet" case study — search snippet)](https://www.taboola.com/resources/case-studies/ynet-2) | (a) **First publisher in Israel** to deploy Taboola's "Homepage For You" personalised-homepage AI; reported uplift "+46% CTR on Taboola positions, +6% organic CTR, −2.4% bounce" [(Taboola "Ynet" case study — search snippet)](https://www.taboola.com/resources/case-studies/ynet-2). (b) Among publishers joining Taboola's DeeperDive generative-AI answer-engine expansion into Hebrew (announced 8 Apr 2026) [(Taboola press release — search snippet)](https://www.taboola.com/press-releases/deeperdive-momentum-expansion/) [(ppc.land coverage)](https://ppc.land/taboolas-deeperdive-hits-7-million-users-and-expands-to-six-languages/). | trade-press + vendor case study |
| 3 | **N12** | Hevrat HaHadashot / Keshet 12 [(Channel 12 (Israel) — Wikipedia summary)](https://en.wikipedia.org/wiki/Channel_12_(Israel)) | Hebrew, RTL [(N12 home — search snippet)](https://www.n12.co.il/) | No public AI activity surfaced *for the N12 news product itself*. Tag pages and `mako.co.il/news-channel12` carry AI *coverage* [(N12 home — search snippet)](https://www.n12.co.il/) but no announced N12-branded AI tool, voice clone, byline-AI policy, or vendor partnership in our searches. Status: **none surfaced**. | search snippets only |
| 4 | **Walla** | Walla! Communications Ltd, "fully owned by The Jerusalem Post" [(Walla! Communications — Wikipedia summary, search snippet)](https://en.wikipedia.org/wiki/Walla!_Communications_Ltd) | Hebrew portal, RTL [(walla.co.il home — search snippet)](https://www.walla.co.il/) | Public LinkedIn-grade signal: Walla appointed Emmanuel Haronyan as VP of Technology in 2025 with stated remit covering "information systems, information security, AI and development" [(Walla — about page, search snippet)](https://www.walla.co.il/about). No specific newsroom-AI product, byline policy, or transcription/voice/personalisation deployment surfaced. Status: **org-level AI remit only**. | search snippets only |
| 5 | **Reshet 13 / N13** | Reshet Media [(Channel 13 (Israel) — Wikipedia summary)](https://en.wikipedia.org/wiki/Channel_13_(Israel)) | Hebrew broadcast; new English- and Spanish-localised output via the Deepdub deal [(Variety, June 2024)](https://variety.com/2024/film/global/israel-broadcaster-reshet-13-ai-platform-deepdub-local-news-content-dubbing-1236043088/) | Signed June 2024 partnership with **Deepdub** (Israeli AI dubbing company) to deliver localised news clips in English and Spanish using **AI voice clones of Reshet 13 reporters**, distributed via a newly-created YouTube FAST channel [(Variety, June 2024)](https://variety.com/2024/film/global/israel-broadcaster-reshet-13-ai-platform-deepdub-local-news-content-dubbing-1236043088/) [(TV Tech, June 2024)](https://www.tvtechnology.com/news/israels-reshet-13-deploys-deepdubs-ai-based-deepdub-go-platform) [(Deepdub case study)](https://deepdub.ai/case-study/reshet13). Quote attributed to Deepdub CEO Ofir Krakowski: clones go beyond "auto-generated subtitles" [(Variety)](https://variety.com/2024/film/global/israel-broadcaster-reshet-13-ai-platform-deepdub-local-news-content-dubbing-1236043088/). | trade-press + vendor case study |
| 6 | **KAN / Kan-11** | Israeli Public Broadcasting Corporation (IPBC) [(Kan 11 — Wikipedia summary)](https://en.wikipedia.org/wiki/Kan_11) | Hebrew + multilingual radio in Amharic / Russian / English / French / Georgian / Bukhari / Spanish / Yiddish / Ladino per the Kan Reka station description [(Kan app store description — search snippet)](https://apps.apple.com/us/app/%D7%9B%D7%90%D7%9F-%D7%93%D7%99%D7%92%D7%99%D7%98%D7%9C-%D7%A8%D7%93%D7%99%D7%95-%D7%95%D7%98%D7%9C%D7%95%D7%95%D7%99%D7%96%D7%99%D7%94/id966582871) | As part of the "90 years of Israeli public broadcasting" anniversary in 2025, KAN News aired a one-off AI-revived voice of Moshe Hovav (legendary radio broadcaster who died nearly 40 years before) reading the 8 a.m. Sunday news edition [(Jerusalem Post — Kan 90 years coverage, search snippet)](https://www.jpost.com/israel-news/article-892490). No surfaced platform-grade AI tooling beyond this anniversary segment. | trade-press snippets |
| 7 | **Globes** | Globes Publisher Itonut (1983) Ltd [(Globes (newspaper) — Wikipedia summary)](https://en.wikipedia.org/wiki/Globes_(newspaper)) | Hebrew + English (`en.globes.co.il`) [(Globes English home — search snippet)](https://en.globes.co.il/en/) | Maintains a dedicated AI section [(Globes AI tag page — search snippet)](https://www.globes.co.il/news/%D7%91%D7%99%D7%A0%D7%94_%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA.tag); the app description mentions a "customized news feed tailored to the companies and sectors you follow" [(Globes Google Play listing — search snippet)](https://play.google.com/store/apps/details?id=il.co.globes.android). No specific announced newsroom-AI tool, voice clone, byline-AI policy or vendor deal surfaced for the news product itself. Status: **none surfaced beyond customisable-feed marketing copy**. | search snippets only |
| 8 | **Calcalist / Ctech** | Yedioth Ahronoth Group [(Calcalist — Wikipedia summary)](https://en.wikipedia.org/wiki/Calcalist) | Calcalist Hebrew; Ctech English-language tech vertical, "founded summer of 2017" by publisher Yoel Esteron [(Ctech — Calcalist self-description, search snippet)](https://www.calcalistech.com/ctechnews/article/hjpldktih) | No public newsroom-AI *product* tied to Calcalist/Ctech surfaced; the brand runs a "Mind the Tech" / AI conference series including a 2024 AI conference [(Calcalist conferences — AI 2024)](https://www.calcalist-conferences.co.il/2024/ai/home). Status: **conference programming only — none surfaced for the news product itself**. | search snippets only |
| 9 | **TheMarker** | Haaretz Group [(TheMarker — Wikipedia summary)](https://en.wikipedia.org/wiki/TheMarker) | Hebrew business daily; described in self-history as "the first business news website and the first online newsroom in Israel" [(TheMarker — Wikipedia summary, search snippet)](https://en.wikipedia.org/wiki/TheMarker) | No public newsroom-AI initiative for TheMarker surfaced in 2024–2026. Status: **none surfaced**. | search snippets only |
| 10 | **Haaretz** | Haaretz Group [(Haaretz — Wikipedia summary)](https://en.wikipedia.org/wiki/Haaretz) | Hebrew (`haaretz.co.il`) + English (`haaretz.com`) [(Haaretz English home — search snippet)](https://www.haaretz.com/) | Maintains a dedicated AI tag and editorial coverage [(Haaretz AI tag page — search snippet)](https://www.haaretz.com/ty-tag/artificial-intelligence-ai-0000019d-4366-d068-a19f-4f76c8840000), including 2024 staff-bylined commentary on AI in journalism [(Haaretz "AI Could Be a Lifeline for Journalism" — search snippet, May 2024)](https://www.haaretz.com/israel-news/tech-news/2024-05-09/ty-article/.premium/ai-could-be-a-lifeline-for-journalism-or-a-rope-to-hang-itself/0000018f-588f-d0ec-a9cf-de9ff6d70000). No announced internal newsroom-AI tool, byline-AI policy, vendor partnership, or labelling standard for the Haaretz product itself surfaced. Status: **none surfaced**. | search snippets only |
| 11 | **Times of Israel** | The Times of Israel (English-language Israeli news site) [(Times of Israel — main site, search snippet)](https://www.timesofisrael.com/) | English primary; community blog network in multiple languages [(Times of Israel — main site, search snippet)](https://www.timesofisrael.com/) | Published a *public reader-facing AI policy* — "A note to our readers regarding The Times of Israel's guidelines on AI" — stating the newsroom does *not* use AI to write or edit articles; AI may translate content (then human-edited) and may suggest changes to single passages or headlines for clarity; all AI output must be reviewed by a human editor [(Times of Israel — note on AI guidelines, search snippet)](https://www.timesofisrael.com/a-note-to-our-readers-regarding-the-times-of-israels-guidelines-on-ai/). | direct policy page (snippet) |
| 12 | **i24NEWS** | Altice / Patrick Drahi [(i24NEWS — Wikipedia summary)](https://en.wikipedia.org/wiki/I24NEWS_(Israeli_TV_channel)) | French + English + Arabic + Hebrew (Hebrew channel launched June 2024) [(Times of Israel — i24 Hebrew launch, search snippet)](https://www.timesofisrael.com/new-hebrew-language-i24-aims-to-be-israels-1st-24-7-news-channel-will-anyone-watch/) | Aired a generative-AI animated depiction of Prime Minister Netanyahu at his corruption trial in December 2024 in a glass-cage frame that drew comparisons to Adolf Eichmann; clip carried an on-screen "AI-generated" notice and was advertised by i24 as "first-of-its-kind in Israel"; the network later took the clip down and called it an "AI mishap" [(Times of Israel — "AI-generated depiction of PM in Eichmann-like cage was 'mishap'")](https://www.timesofisrael.com/tv-station-says-ai-generated-depiction-of-pm-in-eichmann-like-cage-was-mishap/). Reporting also notes operational reliance on translated subtitles between language feeds [(Jerusalem Post — i24 Hebrew launch comment, search snippet)](https://www.jpost.com/opinion/article-860283). | trade-press snippets |
| 13 | **Maariv / NRG** | Maariv brand restored under a Jerusalem Post Group-built `maariv.co.il` site after the NRG sale to Israel Hayom [(ice.co.il — Maariv site rebuild, search snippet)](https://www.ice.co.il/media/news/article/385415) | Hebrew, RTL [(maariv.co.il — search snippet)](https://www.maariv.co.il/) | No public newsroom-AI initiative for Maariv/NRG surfaced for 2024–2026. Status: **none surfaced**. | search snippets only |

## 4. Cross-cutting patterns

Patterns each backed by ≥2 outlets in our search window. Descriptive only.

- **Voice cloning of journalists for cross-language localisation.** Reshet 13 with Deepdub uses cloned reporter voices to push Hebrew-origin clips into English and Spanish [(Variety, June 2024)](https://variety.com/2024/film/global/israel-broadcaster-reshet-13-ai-platform-deepdub-local-news-content-dubbing-1236043088/). KAN deployed a one-off AI revival of Moshe Hovav's broadcast voice for the 90-years-of-public-broadcasting anniversary [(Jerusalem Post — Kan 90 years, search snippet)](https://www.jpost.com/israel-news/article-892490). Two distinct shapes (commercial cross-language vs. anniversary tribute) but the same underlying technique class.
- **Reader-side personalisation and answer-engine partnerships with Taboola.** Ynet is the named launch partner in Israel for both "Homepage For You" personalisation [(Taboola "Ynet" case study)](https://www.taboola.com/resources/case-studies/ynet-2) and DeeperDive's Hebrew-language expansion [(Taboola press release, 8 Apr 2026)](https://www.taboola.com/press-releases/deeperdive-momentum-expansion/) [(ppc.land coverage)](https://ppc.land/taboolas-deeperdive-hits-7-million-users-and-expands-to-six-languages/). Globes' app description leans on a personalised feed framing [(Globes Google Play listing — search snippet)](https://play.google.com/store/apps/details?id=il.co.globes.android). Two brands signal personalisation/answer-engine work; only Ynet has a vendor-attested deployment.
- **AI-generated visualisations of legally constrained scenes (court / war room).** i24NEWS used an AI-generated animation of Netanyahu at his corruption trial, where camera access is restricted, captioned as AI [(Times of Israel — i24 mishap article)](https://www.timesofisrael.com/tv-station-says-ai-generated-depiction-of-pm-in-eichmann-like-cage-was-mishap/). Times of Israel separately reported deepfake videos of Netanyahu in war-room and café settings circulating during the Iran conflict, attributing them to outside actors but documenting the visual genre [(Times of Israel — "Netanyahu dead? Tel Aviv flattened? AI-generated videos are dominating the Iran war")](https://www.timesofisrael.com/netanyahu-dead-tel-aviv-flattened-ai-generated-videos-are-dominating-the-iran-war/). Two distinct uses (newsroom illustration vs. circulating disinformation) — the *visual class* is now part of Israeli political-news coverage either way.
- **English-language outlets carry the most explicit reader-facing AI rules.** Times of Israel publishes a public policy note [(Times of Israel — note to readers on AI guidelines)](https://www.timesofisrael.com/a-note-to-our-readers-regarding-the-times-of-israels-guidelines-on-ai/). Haaretz publishes English-language editorial discussion of newsroom-AI ethics [(Haaretz "AI Could Be a Lifeline for Journalism" — search snippet, May 2024)](https://www.haaretz.com/israel-news/tech-news/2024-05-09/ty-article/.premium/ai-could-be-a-lifeline-for-journalism-or-a-rope-to-hang-itself/0000018f-588f-d0ec-a9cf-de9ff6d70000). Two outlets, both with English-language audiences, are the ones whose AI position is publicly written down.
- **Hebrew-first outlets surface AI as topic, not as product.** mako, N12, Walla, Calcalist, Globes, TheMarker, Haaretz (Hebrew side), and Maariv all maintain prominent AI tag pages that feed daily AI-topic coverage [(mako AI tag — search snippet)](https://www.mako.co.il/Tagit/%D7%91%D7%99%D7%A0%D7%94+%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA) [(Globes AI tag — search snippet)](https://www.globes.co.il/news/%D7%91%D7%99%D7%A0%D7%94_%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA.tag) [(ynet AI topic — search snippet)](https://www.ynet.co.il/topics/%D7%91%D7%99%D7%A0%D7%94_%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA), but their *own* AI use in production is largely undisclosed. Pattern is "we cover AI" rather than "we use AI in this byline".
- **Tech-press infrastructure exists in Hebrew for rapid AI vendor coverage.** Geektime (`geektime.co.il`) [(Geektime "About" — search snippet)](https://www.linkedin.com/company/geekmedia), Ctech [(Ctech home, search snippet)](https://www.calcalistech.com/), and the Calcalist conference machinery [(Calcalist AI 2024 conference — search snippet)](https://www.calcalist-conferences.co.il/2024/ai/home) form a busy *adjacent* layer that reports on AI without (in our searches) deploying it inside news production.
- **Independent media-watchdog use of AI for monitoring.** The Seventh Eye (HaAyin HaShevi'it) describes operating an AI-based "Sub-Text" system for ongoing monitoring of Israeli media for propaganda, fake news, conspiracy theories and incitement [(The Seventh Eye — About / English, search snippet)](https://www.the7eye.org.il/about/english). This is a watchdog *on* the peer set rather than a peer use, but it is the only Israeli-press-adjacent operator we surfaced that publicly says it runs an AI pipeline against its own subject matter.

## 5. What's notably absent in the Israeli peer scan

Each finding states the search attempt and what was *not* found.

- **No standardised byline-AI disclosure or AI-content label across the peer set.** Searches: "Israeli newsroom artificial intelligence labelling disclosure byline 2025"; "Israel newspaper AI generated article disclosure policy Hebrew transparency"; "\"Yedioth\" \"ynet\" AI generated content disclosure policy Hebrew"; "\"Haaretz\" \"AI guidelines\" newsroom policy disclosure". Only the Times of Israel guidelines page surfaced as a *public, reader-facing* AI policy [(Times of Israel — note on AI guidelines)](https://www.timesofisrael.com/a-note-to-our-readers-regarding-the-times-of-israels-guidelines-on-ai/). No Hebrew-language equivalent surfaced for ynet, mako, N12, Haaretz Hebrew, Globes, Calcalist, Walla, KAN, Reshet 13, Maariv, or i24 within the search window. Absence of evidence ≠ evidence of absence.
- **No published election-period AI / deepfake protocol from an Israeli newsroom.** Searches: "Israel news media election deepfake protocol policy 2024 2025"; "Press Council Israel AI generated content guideline 2024 2025 Hebrew". Coverage of the *threat* exists [(Times of Israel — AI tools supercharge foreign influence campaigns)](https://www.timesofisrael.com/ai-tools-supercharge-foreign-influence-campaigns-targeting-israelis-on-social-media/) [(Jerusalem Post — "Stopping the AI slop")](https://www.jpost.com/jerusalem-report/article-874436); no peer outlet in our set was surfaced as having published a newsroom-side protocol for handling AI-generated political imagery or deepfaked candidates ahead of Israel's 2026 national elections.
- **No public Israeli-Press-Council-issued AI content code.** Search "Press Council Israel AI generated content guideline 2024 2025 Hebrew" surfaced general Israel-AI-policy documents (Ministry of Innovation 2023 policy; Privacy Protection Authority 2025 draft) [(Israel AI policy — Regulations.AI summary)](https://regulations.ai/regulations/israel-2023-12-ai-policy) [(Pearl Cohen — privacy-AI guidelines, May 2025)](https://www.pearlcohen.com/israel-new-draft-guidelines-on-the-application-of-privacy-law-to-ai/) but no profession-specific code from the Israeli Press Council on AI-generated content.
- **No publicly-named "Head of AI" or "AI editor" in any Israeli newsroom in the peer set.** Searches across each outlet for "AI hire", "AI editor", "head of AI" did not surface a publicly-titled AI editorial role attached to any of the peer brands. Walla's 2025 hire of a VP Technology with AI in remit [(Walla — about page, search snippet)](https://www.walla.co.il/about) is the closest signal, and it is technology-side rather than editorial-side.
- **No publicly-disclosed Hebrew-language LLM partnership for newsroom use.** Searches: "Israeli newsroom artificial intelligence 2025"; "Hebrew Israel newsroom voice cloning anchor". Hebrew-AI infrastructure exists (Sumit-AI partnership with Zoom for Hebrew transcription [(Zoom press release on Sumit-AI partnership)](https://news.zoom.com/zoom-and-sumit-ai-partner-to-bring-advanced-ai-hebrew-transcriptions-to-users/); ivrit.ai's 22,000-hour Hebrew audio dataset [(ivrit.ai — site, search snippet)](https://www.ivrit.ai/en/ivrit-ai-2/)) but no announced contract between a peer newsroom in our set and a named Hebrew-language model vendor for editorial use.
- **No public newsroom-AI hackathon or jam from an Israeli newsroom in 2024–2026.** Search: "Israeli broadcaster AI newsroom 2025 announcement product hackathon" did not surface a peer-hosted event of that shape in the window.

## 6. Regulatory context references

This section *cross-links* without re-explaining.

- **Second Authority for Television and Radio (SATR / "הרשות השנייה")**, **Israeli Press Council** code of journalism ethics, and **Israeli Privacy Protection Authority** (May 2025 draft AI guidelines) are all already framed in [`04-v1-keshet-company-context.md` §8](04-v1-keshet-company-context.md). See that file rather than restating here. Three points of relevance to the peer-scan reading:
  - **SATR** is the regulator most peer broadcasters in this scan (mako/Keshet 12, N12, Reshet 13, Channel 14) sit under [(`04-v1-keshet-company-context.md` §8)](04-v1-keshet-company-context.md).
  - **KAN/IPBC** is governed by separate public-broadcasting legislation rather than SATR commercial-broadcast rules [(Kan 11 — Wikipedia summary)](https://en.wikipedia.org/wiki/Kan_11).
  - The **Israeli Privacy Protection Authority May 2025 draft AI guidelines** apply to organisations using AI generally and explicitly include transparency / disclosure expectations [(Pearl Cohen summary, May 2025)](https://www.pearlcohen.com/israel-new-draft-guidelines-on-the-application-of-privacy-law-to-ai/) — but they are privacy-law-derived, not press-conduct-derived.

## 7. Implications for V1 AI Hub (questions only)

Questions raised for the V1 AI Hub concept by what peers are / aren't doing. No answers proposed.

1. If the V1 AI Hub were to include a voice-cloning or auto-dubbing surface for vertical clips, would V1 want to source from an Israeli AI dubbing vendor (the same vendor class Reshet 13 chose, namely Deepdub) or from a non-Israeli vendor — and does the public framing of Reshet 13's "Hebrew-origin → English/Spanish" direction inform whether V1's hub would target inbound (foreign news → Hebrew) or outbound (Hebrew → foreign) localisation, given V1's Hebrew-only public surface today [(Variety, June 2024)](https://variety.com/2024/film/global/israel-broadcaster-reshet-13-ai-platform-deepdub-local-news-content-dubbing-1236043088/)?
2. Given Ynet's status as the *first* publisher in Israel for Taboola's "Homepage For You" [(Taboola "Ynet" case study)](https://www.taboola.com/resources/case-studies/ynet-2), would a V1 AI Hub include a personalisation surface at all, and if it did, would V1 build vs. contract a vendor — and is "personalisation in a vertical-feed product" (V1's surface) the same problem class as "personalisation on a desktop homepage" (Ynet's surface)?
3. The Times of Israel publishes a *reader-facing* AI policy [(Times of Israel — note on AI guidelines)](https://www.timesofisrael.com/a-note-to-our-readers-regarding-the-times-of-israels-guidelines-on-ai/); no Hebrew-language peer in the scan does, in our searches. Would V1 want a public, Hebrew-language AI policy at the moment its hub ships, or only an internal one?
4. The i24NEWS December 2024 incident shows that an AI-generated visualisation of a public political figure can be on-screen-labelled and still cause a legitimacy shock [(Times of Israel — i24 mishap article)](https://www.timesofisrael.com/tv-station-says-ai-generated-depiction-of-pm-in-eichmann-like-cage-was-mishap/). If the V1 AI Hub's weather tool ever crosses into political illustration (e.g. a generated Knesset exterior under a "stormy" weather frame), what is the threshold at which a "produced with AI" label is sufficient vs. insufficient?
5. KAN's anniversary use of an AI-revived voice of a long-dead broadcaster [(Jerusalem Post — Kan 90 years coverage)](https://www.jpost.com/israel-news/article-892490) was framed as homage, not journalism. Does V1 want a policy on whether AI-revived voices (deceased anchors, retired anchors, anchors not under contract) can ever appear in V1 short-form clips, and at what level does that decision sit — editor-in-chief, Keshet Digital CEO, or higher?
6. Walla's public org signal is a tech-side VP whose remit names AI [(Walla — about page)](https://www.walla.co.il/about), not an editorial-side AI lead. Where would a V1 AI Hub's owner sit — newsroom-side, technology-side, or shared — and how does that placement interact with the V1 editor-in-chief role already named publicly [(`04-v1-keshet-company-context.md` §3)](04-v1-keshet-company-context.md)?
7. The Israeli Privacy Protection Authority's May 2025 draft AI guidelines [(Pearl Cohen summary)](https://www.pearlcohen.com/israel-new-draft-guidelines-on-the-application-of-privacy-law-to-ai/) imply transparency obligations on any organisation deploying AI on personal data. If a V1 AI Hub tool ever processes user-submitted voice (e.g. voice input → clip), does V1 want its disclosure surface to live in product copy, in the privacy policy, or both — and is the answer driven by SATR press-conduct expectations or by Privacy Protection Authority data expectations?
8. Hebrew-AI infrastructure (Sumit-AI / ivrit.ai / others) [(Zoom + Sumit-AI press release)](https://news.zoom.com/zoom-and-sumit-ai-partner-to-bring-advanced-ai-hebrew-transcriptions-to-users/) [(ivrit.ai site)](https://www.ivrit.ai/en/ivrit-ai-2/) is improving fast. Would V1 want to track Hebrew-specific transcription/voice quality benchmarks as a recurring artefact alongside the AI Hub itself, given that no peer publishes such benchmarks?
9. None of the peer outlets in our set publishes an election-period AI / deepfake protocol. Would V1 want one of its own ahead of Israel's 2026 national elections, and would such a protocol live with the V1 AI Hub or separately in the editorial code [(`04-v1-keshet-company-context.md` §8)](04-v1-keshet-company-context.md)?

## 8. What we don't know (gap log)

Public sources we could reach do **not** answer the following questions about the peer landscape:

1. Does mako use any AI in its editorial production today (transcription, captioning, summarisation, headline-suggestion) — and if so, since when?
2. Does Hevrat HaHadashot / N12 share any AI tooling pipeline with mako, with V1, or with all three siblings, given the Keshet-family corporate structure?
3. What is the total number of Reshet 13 reporters whose voices have been cloned under the Deepdub partnership, and is consent reaffirmed per clip or per contract?
4. Has Ynet's "Homepage For You" deployment touched the Hebrew, English (`ynetnews.com`), and Russian surfaces equally, or only the Hebrew one?
5. What share of Ynet's content is Hebrew-only-without-translation, given the DeeperDive Hebrew expansion announcement [(Taboola press release, 8 Apr 2026)](https://www.taboola.com/press-releases/deeperdive-momentum-expansion/)?
6. Does Walla's 2025 VP-Tech AI remit include an editorial AI tool that has not yet been publicly announced?
7. Did i24NEWS publish, *after* the December 2024 Eichmann-cage incident, an internal protocol for future on-air AI illustrations — and is it public anywhere?
8. Does Haaretz Group (Haaretz Hebrew + TheMarker + `haaretz.com`) operate a single editorial AI policy across all three properties or three separate ones, and is any of them public?
9. Does Globes' "customised feed" claim in its app description correspond to an actual personalisation engine or to taxonomy-based filtering only?
10. Does Calcalist / Ctech's AI conference programming feed back into Calcalist newsroom tooling decisions, or are they organisationally separate?
11. Has KAN's IPBC published any policy on synthetic-voice usage (anniversary, archival, accessibility) following the Moshe Hovav anniversary segment [(Jerusalem Post — Kan 90 years)](https://www.jpost.com/israel-news/article-892490)?
12. Does any Israeli newsroom in the peer set publish a Hebrew-language equivalent of the Times of Israel reader-facing AI guidelines [(Times of Israel — note on AI guidelines)](https://www.timesofisrael.com/a-note-to-our-readers-regarding-the-times-of-israels-guidelines-on-ai/)?
13. Are any peer newsrooms quietly using Hebrew transcription vendors (e.g. Sumit-AI, ivrit.ai) for newsroom transcription without public announcement?
14. Is there a peer-set practice on AI-generated B-roll labelling on screen in long-form bulletin contexts (where the i24 case is the only public datapoint)?
15. Has the Israeli Press Council or the Second Authority for Television and Radio issued a private circular on AI in news that has not surfaced publicly in our search window?

## 9. Sources

> Grouped by outlet. Body content for almost every URL below was retrieved only as search-engine summary snippets; direct WebFetch returned HTTP 403 on the Israeli-press domains and Wikipedia. Confidence is therefore "snippet-grade" unless otherwise stated.

**Anchor reference inside this repo:**
- V1 / Keshet company context — [`04-v1-keshet-company-context.md`](04-v1-keshet-company-context.md)
- Folder index and naming rule — [`README.md`](README.md)

**mako / Keshet (sibling of V1):**
- Keshet International "mako" page — `https://www.keshetinternational.com/mako`
- mako AI tag page — `https://www.mako.co.il/Tagit/%D7%91%D7%99%D7%A0%D7%94+%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA`
- Keshet Media Group — Wikipedia — `https://en.wikipedia.org/wiki/Keshet_Media_Group`

**Ynet / Yedioth Group:**
- Taboola "Ynet" case study (Homepage For You) — `https://www.taboola.com/resources/case-studies/ynet-2`
- Taboola DeeperDive press release, 8 Apr 2026 — `https://www.taboola.com/press-releases/deeperdive-momentum-expansion/`
- ppc.land coverage of DeeperDive Hebrew expansion — `https://ppc.land/taboolas-deeperdive-hits-7-million-users-and-expands-to-six-languages/`
- prnewswire press release — `https://www.prnewswire.com/apac/news-releases/deeperdive-taboolas-genai-answer-engine-for-the-open-web-reaches-nearly-7-million-monthly-active-users-eight-months-after-launch-emerging-as-one-of-the-largest-ai-answer-engines-302737617.html`
- ynet AI topic page — `https://www.ynet.co.il/topics/%D7%91%D7%99%D7%A0%D7%94_%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA`
- ynetnews tech & digital section — `https://www.ynetnews.com/tech-and-digital`
- Ynet — Wikipedia — `https://en.wikipedia.org/wiki/Ynet`

**N12 / Hevrat HaHadashot:**
- N12 home — `https://www.n12.co.il/`
- Channel 12 (Israel) — Wikipedia — `https://en.wikipedia.org/wiki/Channel_12_(Israel)`
- Hevrat HaHadashot — Wikipedia — `https://en.wikipedia.org/wiki/Hevrat_HaHadashot`

**Walla:**
- Walla home — `https://www.walla.co.il/`
- Walla "About" page — `https://www.walla.co.il/about`
- Walla! Communications Ltd — Wikipedia — `https://en.wikipedia.org/wiki/Walla!_Communications_Ltd`

**Reshet 13 / N13:**
- Variety, "Israel's Broadcaster Reshet 13 Signs Deal with AI Platform Deepdub", June 2024 — `https://variety.com/2024/film/global/israel-broadcaster-reshet-13-ai-platform-deepdub-local-news-content-dubbing-1236043088/`
- TV Tech, "Israel's Reshet 13 Deploys Deepdub's AI-Based Deepdub Go Platform" — `https://www.tvtechnology.com/news/israels-reshet-13-deploys-deepdubs-ai-based-deepdub-go-platform`
- Deepdub case study "News Channel" (Reshet 13) — `https://deepdub.ai/case-study/reshet13`
- Channel 13 (Israel) — Wikipedia — `https://en.wikipedia.org/wiki/Channel_13_(Israel)`
- Reshet TV YouTube channel — `https://www.youtube.com/@reshettv`

**KAN / Kan-11:**
- Jerusalem Post — "KAN marks 90 years of Israeli public broadcasting with cross-platform celebration" — `https://www.jpost.com/israel-news/article-892490`
- Kan 11 — Wikipedia — `https://en.wikipedia.org/wiki/Kan_11`
- Kan app store description — `https://apps.apple.com/us/app/%D7%9B%D7%90%D7%9F-%D7%93%D7%99%D7%92%D7%99%D7%98%D7%9C-%D7%A8%D7%93%D7%99%D7%95-%D7%95%D7%98%D7%9C%D7%95%D7%95%D7%99%D7%96%D7%99%D7%94/id966582871`
- Israeli Public Broadcasting Corporation — Wikipedia — `https://en.wikipedia.org/wiki/Israeli_Public_Broadcasting_Corporation`

**Globes:**
- Globes home — `https://www.globes.co.il/`
- Globes English home — `https://en.globes.co.il/en/`
- Globes AI tag page — `https://www.globes.co.il/news/%D7%91%D7%99%D7%A0%D7%94_%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA.tag`
- Globes Google Play listing — `https://play.google.com/store/apps/details?id=il.co.globes.android`
- Globes (newspaper) — Wikipedia — `https://en.wikipedia.org/wiki/Globes_(newspaper)`

**Calcalist / Ctech:**
- Calcalist self-description on Ctech — `https://www.calcalistech.com/ctechnews/article/hjpldktih`
- Calcalist AI 2024 conference — `https://www.calcalist-conferences.co.il/2024/ai/home`
- Ctech home — `https://www.calcalistech.com/`
- Calcalist — Wikipedia — `https://en.wikipedia.org/wiki/Calcalist`

**TheMarker:**
- TheMarker — Wikipedia — `https://en.wikipedia.org/wiki/TheMarker`
- TheMarker section on Haaretz — `https://www.haaretz.com/ty-WRITER/0000017f-da25-d432-a77f-df3f167f0000`

**Haaretz:**
- Haaretz English home — `https://www.haaretz.com/`
- Haaretz AI tag page — `https://www.haaretz.com/ty-tag/artificial-intelligence-ai-0000019d-4366-d068-a19f-4f76c8840000`
- Haaretz, "AI Could Be a Lifeline for Journalism — or a Rope to Hang Itself", May 2024 — `https://www.haaretz.com/israel-news/tech-news/2024-05-09/ty-article/.premium/ai-could-be-a-lifeline-for-journalism-or-a-rope-to-hang-itself/0000018f-588f-d0ec-a9cf-de9ff6d70000`
- Haaretz — Wikipedia — `https://en.wikipedia.org/wiki/Haaretz`

**Times of Israel:**
- Times of Israel — "A note to our readers regarding The Times of Israel's guidelines on AI" — `https://www.timesofisrael.com/a-note-to-our-readers-regarding-the-times-of-israels-guidelines-on-ai/`
- Times of Israel — "AI tools supercharge foreign influence campaigns targeting Israelis on social media" — `https://www.timesofisrael.com/ai-tools-supercharge-foreign-influence-campaigns-targeting-israelis-on-social-media/`
- Times of Israel — "Netanyahu dead? Tel Aviv flattened? AI-generated videos are dominating the Iran war" — `https://www.timesofisrael.com/netanyahu-dead-tel-aviv-flattened-ai-generated-videos-are-dominating-the-iran-war/`
- Times of Israel — i24 Hebrew launch coverage — `https://www.timesofisrael.com/new-hebrew-language-i24-aims-to-be-israels-1st-24-7-news-channel-will-anyone-watch/`
- Times of Israel home — `https://www.timesofisrael.com/`

**i24NEWS:**
- Times of Israel — "TV station says AI-generated depiction of PM in Eichmann-like cage was 'mishap'" — `https://www.timesofisrael.com/tv-station-says-ai-generated-depiction-of-pm-in-eichmann-like-cage-was-mishap/`
- Jerusalem Post — i24 Hebrew launch comment — `https://www.jpost.com/opinion/article-860283`
- i24NEWS Hebrew home — `https://www.i24news.tv/he`
- i24NEWS — Wikipedia — `https://en.wikipedia.org/wiki/I24NEWS_(Israeli_TV_channel)`

**Maariv / NRG:**
- Maariv home — `https://www.maariv.co.il/`
- ice.co.il — Maariv site rebuild after NRG / Israel Hayom split — `https://www.ice.co.il/media/news/article/385415`

**Adjacent (tech press / watchdog / Hebrew-AI infrastructure / regulatory):**
- Geektime LinkedIn — `https://www.linkedin.com/company/geekmedia`
- The Seventh Eye — about (English) — `https://www.the7eye.org.il/about/english`
- The Seventh Eye home — `https://www.the7eye.org.il/`
- Zoom + Sumit-AI Hebrew transcription press release — `https://news.zoom.com/zoom-and-sumit-ai-partner-to-bring-advanced-ai-hebrew-transcriptions-to-users/`
- ivrit.ai — `https://www.ivrit.ai/en/ivrit-ai-2/`
- Pearl Cohen — Israel new draft AI privacy guidelines, May 2025 — `https://www.pearlcohen.com/israel-new-draft-guidelines-on-the-application-of-privacy-law-to-ai/`
- Regulations.AI — Israel's AI Policy 2023 — `https://regulations.ai/regulations/israel-2023-12-ai-policy`
- Jerusalem Post — "Stopping the AI slop: Israel's new battle against deepfakes and digital deception" — `https://www.jpost.com/jerusalem-report/article-874436`

**Channel 14 (peer-adjacent reference, surfaced during the scan):**
- Channel 14 (Israel) — Wikipedia — `https://en.wikipedia.org/wiki/Channel_14_(Israel)`
- C14 home — `https://www.c14.co.il/`
