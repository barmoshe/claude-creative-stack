# V1 AI Hub — V1 Recent Product & News (R6, web deep-dive)

> Status: concept · Owner: R6 (deep-web research run) · Last updated: 2026-05-09
> Public-source only. 2024–2026 window. Every fact cited.
>
> "V1" = the Israeli media company V1 (Keshet's digital arm). Never "version 1".

## 1. TL;DR

Across 2024–2026, V1 (Keshet's short-vertical-video news app, `v-1.co.il`) moved from a May-2024 beta launch into an apparent product-and-content scaling phase: an iOS release publicly logged as version 26.0 on 18 September 2025 added live broadcasts, an "improved homepage", breaking news, and prize/giveaway "games" [(App Store version-history snippet)](https://apps.apple.com/il/app/v1-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA/id6475302142); the most-cited recent change is V1's launch of *"כשהגלים מתחזקים"* ("When the Waves Get Stronger"), described in trade press as **the first Hebrew-language micro-drama series**, co-produced with Ananey Studios (Paramount-owned), running from 26 February 2026 with 40+ short daily episodes exclusively on V1 [(Hebrew Wikipedia, network-series entry)](https://he.wikipedia.org/wiki/%D7%9B%D7%A9%D7%94%D7%92%D7%9C%D7%99%D7%9D_%D7%9E%D7%AA%D7%97%D7%96%D7%A7%D7%99%D7%9D_(%D7%A1%D7%93%D7%A8%D7%AA_%D7%A8%D7%A9%D7%AA)) [(mako finance feature on the show's economics)](https://www.mako.co.il/finances-magazine/Article-1d9e8ce583d5d91026.htm) [(Ananey Paramount Facebook launch post)](https://www.facebook.com/AnaneyParamount/posts/%D7%92%D7%90%D7%99%D7%9D-%D7%9C%D7%94%D7%A9%D7%99%D7%A7-%D7%90%D7%AA-%D7%A1%D7%93%D7%A8%D7%AA-%D7%94%D7%9E%D7%99%D7%A7%D7%A8%D7%95-%D7%93%D7%A8%D7%9E%D7%94-%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%94-%D7%91%D7%A2%D7%91%D7%A8%D7%99%D7%AA-%D7%A9%D7%AA%D7%A2%D7%9C%D7%94-%D7%91%D7%A7%D7%A8%D7%95%D7%91-%D7%91%D7%90%D7%A4%D7%9C%D7%99%D7%A7%D7%A6%D7%99%D7%99%D7%AA-v1-%D7%9E%D7%91%D7%99%D7%AA-%D7%A7%D7%A9%D7%AA/1438990474896895/). Public app-ranking snapshots place V1 inside the top tier of Israeli iPhone news apps in 2025–2026 [(Appfigures top news iPhone IL — search snippet)](https://appfigures.com/top-apps/ios-app-store/israel/iphone/news?profile=developer.42987).

## 2. Source-quality preface

Direct page fetches in this research environment continued to fail (HTTP 403) for `he.wikipedia.org`, `en.wikipedia.org`, `apps.apple.com`, `play.google.com`, `sensortower.com`, and Israeli press domains (`mako.co.il`, `globes.co.il`, `calcalist.co.il`, `ynet.co.il`, `ice.co.il`). The bulk of facts below are reconstructed from `WebSearch` snippets, marked `(snippet)` where the body copy is summary-grade only. Where a source link is given, the URL itself is reachable (status of body-content fetch is the issue, not link rot). Channels that worked: Google-style `WebSearch` against Hebrew and English keyword combinations, returning summary cards from `mako.co.il`, `srugim.co.il`, `walla.co.il`, `kipa.co.il`, `srugim.co.il`, `apps.apple.com`, `play.google.com`, `sensortower.com`, `appfigures.com`, `42matters.com`, `similarweb.com`, `deadline.com`, `variety.com`, and `ynetnews.com`. Channels that did not work directly: `archive.org` Wayback (no usable snapshot surfaced via search), `pmacs.org.il`, `ifat.com`. App-Store rate limiting also masked any direct version-by-version changelog read.

## 3. App / web release activity

| Date | What changed | Source |
|---|---|---|
| 1 May 2024 | V1 beta launch on iOS + Android, publisher Keshet Broadcasting Ltd.; reported "more than 50,000 downloads in a short time" after release. | [(Hebrew Wikipedia "V1" — snippet)](https://he.wikipedia.org/wiki/V1) [(ice.co.il launch coverage — snippet)](https://www.ice.co.il/media/news/article/1018337) |
| Late Apr 2024 → end Q2 2024 | Sensor Tower (Q2-2024 retrospective) reports weekly downloads of *V1 החדשות החדשות* climbing from ~418 in late April to ~23K by end of June 2024 — i.e. the first eight weeks of life. | [(Sensor Tower top-5 IL news Q2 2024 — search snippet)](https://sensortower.com/blog/2024-q2-unified-top-5-news%20and%20magazines-units-il-600abc3f241bc16eb8508514) |
| ~Sep 2024 | Trade press cites Keshet-attributed metrics: ~900K cumulative downloads, ~800K active users, ~100K DAU, ~32 V1 videos/day per DAU, ~2.3 sessions/day per DAU; one-day peak of ~2.4M views during a northern-front escalation, ~40 videos/user that day. | [(ice.co.il "האפליקציה החדשה של קשת" — snippet)](https://www.ice.co.il/research/news/article/1031140) |
| 18 Sep 2025 | iOS app version 26.0 release notes describe a new build with **live broadcasts, an improved homepage, breaking news, and award/giveaway "games"** — the largest publicly visible feature shift since launch. | [(App Store IL listing version-history — snippet)](https://apps.apple.com/il/app/v1-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA/id6475302142) |
| 2025 (date not surfaced) | Public Google Play description begins listing live broadcasts, breaking-news real-time alerts, and "prize-related games" as included features — wording aligns with the v26 iOS release notes. | [(Google Play `com.keshet.v1` — snippet)](https://play.google.com/store/apps/details?id=com.keshet.v1) |
| Ongoing 2024–2026 | URL pattern for editorial slots evolves from `news-magazine/<period>/shorts-<id>.htm` (mid-2024) and `newsflash-<year>/<period>/shorts-<id>.htm` (early 2026) to a new content-type slug `growing_waves-magazine/<period>/shorts-<id>.htm` for the micro-drama vertical — i.e. the site adds typed editorial verticals beyond "news magazine" / "newsflash". | [(`v-1.co.il/growing_waves-magazine/...` — snippet)](https://www.v-1.co.il/growing_waves-magazine/2026-m03_w01/shorts-ddb14f99263bc91026.htm) [(2024 magazine URL — snippet)](https://www.v-1.co.il/news-magazine/2024-m08_w05/shorts-6149b516aad9191026.htm) [(2026 newsflash URL — snippet)](https://www.v-1.co.il/newsflash-2026/m01_w03/shorts-b4295b70a06cb91027.htm) |
| Ongoing | App Store / Google Play user reviews surface recurring complaints about (a) push notifications routing to the wrong video, (b) general bug reports, and (c) one user dispute about a Samsung-branded competition feature (claim: prize unavailable on win); the V1 team's listed support channels are `mobile-support@mako.co.il` and a WhatsApp service line. | [(App Store reviews — snippet)](https://apps.apple.com/il/app/v1-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA/id6475302142) |

Caveats: no public *web* (`v-1.co.il`) redesign announcement was surfaced — the URL-slug shift above is observed traffic-grade evidence of editorial-vertical expansion, not a confirmed redesign. No Wayback Machine snapshot for `v-1.co.il` January 2024 / January 2025 / January 2026 was returned in this run.

## 4. Editorial / vertical launches & shutdowns

| Date | What | Source |
|---|---|---|
| 2024–2025 | Original short-form interview format **"60 שניות עם ליאל אלי"** ("60 Seconds with Liel Eli") runs on V1, with cross-posting to TikTok / Instagram / YouTube; guest list includes Ivri Lider, Bar Refaeli. The format is publicly named in V1 marketing as one of V1's "original content" lines (alongside lines named "Mol El Meer" and "The Relationship Test" in store-listing copy). | [(V1 special magazine slug 2024-m07_w05 — snippet)](https://www.v-1.co.il/special-magazine/2024-m07_w05/shorts-f0f6ec6fa420191026.htm) [(`@lieleli` TikTok with `#60שניות #v1` hashtag — snippet)](https://www.tiktok.com/@lieleli/video/7473160740858367240) [(Ivri Lider FB post crediting V1 — snippet)](https://www.facebook.com/ivri.lider.official/posts/%D7%AA%D7%95%D7%93%D7%94-%D7%9C%D7%9C%D7%99%D7%90%D7%9C-%D7%90%D7%9C%D7%99-%D7%95%D7%9C-v1%D7%A9%D7%90%D7%99%D7%A8%D7%97%D7%95-%D7%90%D7%95%D7%AA%D7%99-%D7%9C-60-%D7%A9%D7%A0%D7%99%D7%95%D7%AA-%D7%9C%D7%A8%D7%90%D7%99%D7%95%D7%9F-%D7%94%D7%9E%D7%9C%D7%90-httpsappsv-1coilxm3kj4p6j/1144391260389876/) [(Liel Eli Instagram post mentioning the V1 format and a personal milestone — snippet)](https://www.instagram.com/p/DRHUotvCBck/) |
| 26 Feb 2026 → 11 Apr 2026 | **"כשהגלים מתחזקים" / "When the Waves Get Stronger"** premieres on V1 — described in Hebrew press as **Israel's first Hebrew-language micro-drama series**, 45 short (~2-min) episodes, co-produced by Ananey Studios (the Paramount-owned Israeli production house) and Keshet, based on Sharon Tzohar's bestseller, directed/scripted by Shira Greenshpone, starring Yadin Gellman and Michelle Pro. | [(Hebrew Wikipedia "כשהגלים מתחזקים (סדרת רשת)" — snippet)](https://he.wikipedia.org/wiki/%D7%9B%D7%A9%D7%94%D7%92%D7%9C%D7%99%D7%9D_%D7%9E%D7%AA%D7%97%D7%96%D7%A7%D7%99%D7%9D_(%D7%A1%D7%93%D7%A8%D7%AA_%D7%A8%D7%A9%D7%AA)) [(srugim.co.il — snippet)](https://www.srugim.co.il/1282971-%D7%9B%D7%A9%D7%94%D7%92%D7%9C%D7%99%D7%9D-%D7%9E%D7%AA%D7%97%D7%96%D7%A7%D7%99%D7%9D-%D7%94%D7%95%D7%A4%D7%9A-%D7%9C%D7%A1%D7%93%D7%A8%D7%94-%D7%99%D7%93%D7%99%D7%9F-%D7%92%D7%9C%D7%9E%D7%9F) |
| Mar 2026 onward | V1 launches a dedicated content vertical for the micro-drama at `v-1.co.il/growing_waves-magazine/...` — a new editorial slug alongside the existing `news-magazine` and `newsflash-<year>` slugs. | [(`v-1.co.il/growing_waves-magazine/2026-m03_w01/...` — snippet)](https://www.v-1.co.il/growing_waves-magazine/2026-m03_w01/shorts-ddb14f99263bc91026.htm) |
| Ongoing 2025–2026 | Recurrent V1 hiring posts for "עורכ.ת תוכן ל-V1" (V1 content editor) describe the role as "editing news and current content and adapting them to digital platforms" with "dynamic environment" framing — i.e. continued editorial-staff scaling rather than freeze. | [(jobs.keshet-mediagroup.com posting "עורכ.ת תוכן ל-V1" — snippet)](https://jobs.keshet-mediagroup.com/) [(taasiya.co.il mirror of the posting — snippet)](https://www.taasiya.co.il/jobs/69691.htm) |

No public sunset of any V1 vertical was surfaced in this run.

## 5. Partnerships, deals, integrations

The most recent V1-attached partnership surfaced publicly is the V1 × Ananey Studios (Paramount) micro-drama co-production above — a content-format partnership tying V1 distribution to Ananey production for the *"When the Waves Get Stronger"* slate [(Ananey Paramount FB post — snippet)](https://www.facebook.com/AnaneyParamount/posts/%D7%92%D7%90%D7%99%D7%9D-%D7%9C%D7%94%D7%A9%D7%99%D7%A7-%D7%90%D7%AA-%D7%A1%D7%93%D7%A8%D7%AA-%D7%94%D7%9E%D7%99%D7%A7%D7%A8%D7%95-%D7%93%D7%A8%D7%9E%D7%94-%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%94-%D7%91%D7%A2%D7%91%D7%A8%D7%99%D7%AA-%D7%A9%D7%AA%D7%A2%D7%9C%D7%94-%D7%91%D7%A7%D7%A8%D7%95%D7%91-%D7%91%D7%90%D7%A4%D7%9C%D7%99%D7%A6%D7%99%D7%99%D7%AA-v1-%D7%9E%D7%91%D7%99%D7%AA-%D7%A7%D7%A9%D7%AA/1438990474896895/). Hebrew trade press explicitly frames this as both companies "entering the micro-drama market" together [(srugim.co.il — snippet)](https://www.srugim.co.il/1282971-%D7%9B%D7%A9%D7%94%D7%92%D7%9C%D7%99%D7%9D-%D7%9E%D7%AA%D7%97%D7%96%D7%A7%D7%99%D7%9D-%D7%94%D7%95%D7%A4%D7%9A-%D7%9C%D7%A1%D7%93%D7%A8%D7%94-%D7%99%D7%93%D7%99%D7%9F-%D7%92%D7%9C%D7%9E%D7%9F).

Adjacent corporate-parent partnerships that bracket V1's neighbourhood but are not announced *to V1* specifically (kept here as context only, not as V1 deals):

- **ZIRA (Israeli Internet Anti-Piracy Organization) v. TikTok**, Tel Aviv District Court — joint copyright suit by Keshet, YES, HOT, Charlton, and Sport Channel against TikTok and ByteDance, seeking ₪2.6M (~US $670K) in damages, plus a permanent injunction to block re-uploads of broadcasters' content; users were re-uploading TV episodes split into short clips [(ynetnews — snippet)](https://www.ynetnews.com/business/article/hjvbaxvrxg) [(calcalistech / ctech — snippet)](https://www.calcalistech.com/ctechnews/article/zbw2qi16p). Keshet is a co-plaintiff; this is its corporate posture toward the dominant short-vertical-video competitor to V1.
- **Keshet Media Group strategic-investment arm reporting** — Israeli press (Globes, March/April 2026 coverage) describes Keshet operating a "success-based" model in which it provides companies with broadcast-time-as-equity in exchange for a "dominant partner" management role [(Globes "הכירו את זרוע ההשקעות האסטרטגיות החדשה של קשת" — snippet)](https://www.globes.co.il/news/article.aspx?did=1001288225). V1 itself is not named as a recipient or vehicle of this arm in the snippet returned.
- **Keshet International × Sony Pictures Television** — first-look scripted deal for English-language adaptations of Keshet 12 titles; first project a US remake of *Save the Date* with Dana Fox attached [(Deadline — snippet)](https://deadline.com/2025/12/keshet-international-sony-tv-deal-save-the-date-remake-1236633834/). This is Keshet International's deal flow, not V1's.
- **Keshet International × Faraway Road Productions** — Netflix unscripted *Off Road* with Lior Raz and Rotem Sela [(Señal News — snippet)](https://senalnews.com/en/content/keshet-international-and-faraway-to-co-produce-netflixs-off-road).
- **Apple TV × Keshet's *Unconditional*** — Israeli thriller series, premiere 8 May 2026 [(Deadline trailer story — snippet)](https://deadline.com/2026/04/unconditional-apple-tv-trailer-1236861249/) [(Apple TV Press release — snippet)](https://www.apple.com/tv-pr/news/2026/02/apple-tv-sets-new-thriller-unconditional-to-premiere-friday-may-8/).

No public V1 announcement of an ad-tech vendor, AI-vendor partnership, or data-partner relationship was surfaced.

## 6. Notable coverage / controversies

- **Mid-2024 trade-press coverage celebrates launch numbers.** ice.co.il's first reveal of V1 telemetry presents the Keshet-supplied numbers as the new app "exposes its data for the first time" — a publisher-friendly framing rather than independent audit [(ice.co.il — snippet)](https://www.ice.co.il/research/news/article/1031140).
- **Cult-and-criticism reception of the micro-drama.** mako's culture vertical describes *"When the Waves Get Stronger"* as becoming "an inescapable phenomenon and trend" with "parodies and criticism emerging rapidly" [(mako "ידין גלמן על התגובות והפארודיות" — snippet)](https://www.mako.co.il/makoz-viral/Article-6fccecd5f692d91027.htm). The Religious-Zionist outlet Kipa runs an explicitly negative review titled "*כשהגלים מתחזקים*: כולנו יודעים למה הסדרה הזאת גרועה כל כך" ("we all know why this series is so bad"), with the search-snippet line that the project has "predictable plot, flat characters lacking personality, and a failed feminist message where the main female character ultimately gives up her position in the naval unit for love" [(kipa.co.il — snippet)](https://www.kipa.co.il/%D7%AA%D7%A8%D7%91%D7%95%D7%AA/%D7%98%D7%9C%D7%95%D7%95%D7%99%D7%96%D7%99%D7%94/1220481-0/). Time Out Israel runs a piece headlined "החזקים מתגלים: הם קוראים לזה מיקרו-דרמה. ואנחנו מפחדים" ("the strong ones reveal themselves: they call it micro-drama. and we're afraid") [(timeout.co.il — snippet)](https://timeout.co.il/%D7%9B%D7%A9%D7%94%D7%92%D7%9C%D7%99%D7%9D-%D7%9E%D7%AA%D7%97%D7%96%D7%A7%D7%99%D7%9D-%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%AA/).
- **mako finance vertical frames the show's economics positively.** A piece headlined "*כשהגלים מתחזקים* שווה הרבה מאוד כסף. זו הסיבה" ("*When the Waves Get Stronger* is worth a great deal of money — here's why") describes the format's business model as "resembling gaming and casino worlds more than classic Hollywood" in its "addictive economic model of micro-dramas" [(mako finance-magazine — snippet)](https://www.mako.co.il/finances-magazine/Article-1d9e8ce583d5d91026.htm).
- **No V1-specific journalistic-ethics controversy** (e.g. retraction, Press Council ruling, election-period sanction) was surfaced for the 2024–2026 window in this run. Keshet's flagship investigative show *Uvda* (Ilana Dayan) won Best Investigative Program at the Israeli TV Academy's 2025 awards (held May 2026) — a corporate-parent honour, not a V1 honour [(jpost.com — snippet)](https://www.jpost.com/israel-news/culture/article-895116) [(Times of Israel awards roundup — snippet)](https://www.timesofisrael.com/noa-kolers-happy-place-wins-big-in-israeli-tv-awards-rescheduled-after-iran-war/).

## 7. Audience & reach signals

- **App-store category ranking — Israel iPhone news, 2025–2026.** Appfigures' top-news-iPhone-IL view places V1 (`Keshet Broadcasting Ltd.`) at **#3** in the news category, behind ForReal (Israel Today) at #1 and X at #2 [(Appfigures top-iPhone-news Israel — snippet)](https://appfigures.com/top-apps/ios-app-store/israel/iphone/news?profile=developer.42987). A separate snippet returned by `42matters.com` describes V1 as ranked at the top of the iOS news segment in a different period snapshot [(42matters most-popular-news-apps Israel — snippet)](https://42matters.com/most-popular-news-apps-israel) — the two snippets disagree on rank, which is consistent with App Store rankings being highly date-sensitive. **Treat both as date-bound estimates.**
- **Sensor Tower retrospective (Q2 2024).** Weekly downloads of V1 climbed from ~418 in late April 2024 to ~23K by end of June 2024 — i.e. ~55× growth over the first eight weeks of life [(Sensor Tower top-5 IL news Q2 2024 — snippet)](https://sensortower.com/blog/2024-q2-unified-top-5-news%20and%20magazines-units-il-600abc3f241bc16eb8508514).
- **Sensor Tower Q2 2025 top-news-IL retrospective** does **not** name V1 in the search-snippet summary; the apps explicitly named in that snippet are Israel Home Front Command, Tzofar — Red Alert, RedAlert, and X [(Sensor Tower top-5 IL news Q2 2025 — snippet)](https://sensortower.com/blog/2025-q2-unified-top-5-news-units-il-600abc3f241bc16eb850846d). This means V1 was *outside* Sensor Tower's named top tier for that specific quarter as surfaced via search — though the snippet did not show the full leaderboard, so absence in the snippet ≠ absence from the leaderboard.
- **Trade-press numbers, mid-2024 (Keshet-attributed).** ~900K cumulative downloads, ~800K active users, ~100K DAU, ~32 V1 videos/day per DAU, ~2.3 sessions/day per DAU; one-day peak ~2.4M views during a northern-front escalation [(ice.co.il — snippet)](https://www.ice.co.il/research/news/article/1031140). Treat as publisher-supplied estimates, not audited.
- **YouTube secondary surface.** A `@v1israel` YouTube Shorts channel exists with ~4.64K subscribers and ~125 videos at the time of the search snippet [(YouTube `@v1israel/shorts` — snippet)](https://www.youtube.com/@v1israel/shorts). Modest in scale relative to in-app usage.
- **No newer audited DAU/MAU figure** — i.e. nothing 2025-or-2026 dated and third-party — was surfaced for V1 in this run. Keshet's 2025 figures for *V1 specifically* are not visible in the public search results we could reach.

## 8. Event-driven traffic context (2023–2026)

Israel's 2023–2026 window contained sustained security operations and political volatility that materially shaped Israeli newsroom traffic. Public material directly tying these events to V1 (rather than to the broader Keshet stack):

- **Northern-front escalation, 2024.** ice.co.il's V1 telemetry piece reports that V1's single-day view peak (~2.4M views, ~40 videos/user) coincided with "an escalation in the north" — i.e. the late-2024 Hezbollah-front intensification that ran into Operation Northern Arrows / חיצי הצפון [(ice.co.il — snippet)](https://www.ice.co.il/research/news/article/1031140) [(hamichlol.org.il "מבצע חיצי הצפון" — snippet)](https://www.hamichlol.org.il/%D7%9E%D7%91%D7%A6%D7%A2_%D7%97%D7%99%D7%A6%D7%99_%D7%94%D7%A6%D7%A4%D7%95%D7%9F).
- **Local-elections cycle, 2024.** Israel's municipal elections were held across 200 localities, with Sderot voting on 19 November 2024 and Kiryat Shmona / Shlomi postponed to 25 February 2025 due to the war [(Hebrew Wikipedia local-elections-2024 — snippet)](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%A8%D7%A9%D7%95%D7%99%D7%95%D7%AA_%D7%94%D7%9E%D7%A7%D7%95%D7%9E%D7%99%D7%95%D7%AA_%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C_(2024)). No publicly disclosed V1-specific traffic figure tied to that election cycle was surfaced.
- **Iran-war / 2026 awards reschedule.** The Israeli TV Academy's 2025 awards ceremony was rescheduled and held in May 2026 due to the Iran war [(Times of Israel — snippet)](https://www.timesofisrael.com/noa-kolers-happy-place-wins-big-in-israeli-tv-awards-rescheduled-after-iran-war/). The same article notes presenter Lucy Aharish's on-stage line that "since October 7 [2023] these years have required all of us to engage in some soul-searching — about what truly matters here, about what we chose to focus on, about what we neglected, about the questions we failed to ask, and especially about what we normalized simply because we gave it a platform" — a representative public line from the Israeli broadcast scene during the window, not a V1-specific quote.
- **Paramount+ × Keshet 12 *Red Alert* (Oct-7 series).** Paramount+ has acquired worldwide rights to a Keshet 12 series titled *Red Alert* about 7 October [(Times of Israel — snippet)](https://www.timesofisrael.com/paramount-acquires-keshet-12s-red-alert-series-about-october-7/). Again, corporate-parent activity, not a V1 product fact.

## 9. Anything publicly disclosed that touches AI — at V1 specifically

In this run, **no public disclosure of any AI tooling, AI feature, AI editorial pipeline, AI partnership, or AI-leadership hire was surfaced for V1 the app or for `v-1.co.il`**. Searches against "V1 בינה מלאכותית", "V1 AI", "Keshet AI 2025", "קשת 12 בינה מלאכותית", and "V1 כלי חדש" returned no V1-specific AI announcement. The closest adjacent items, all *outside* V1:

- **Keshet International × Bellino's Unlimited — *Elevator Pitch Brasil*** introduces an "AI investor" character ("Caio Maia") evaluating pitches alongside human business leaders [(Señal News — snippet)](https://senalnews.com/en/content/keshet-international-and-bellinos-unlimited-launch-elevator-pitch-brasil). This is a format-trade fictional-AI character, not an applied-AI deployment, and it is owned by Keshet International, not V1.
- **mako tech-vertical AI commentary.** mako's tech channels publish on AI topics regularly (e.g. "סטרובריטה ובנניטו נפרדו – סרטוני הפירות ב-AI" trend coverage, "AI גם בפרסומות: המהלך החדש של FreeTV") [(mako "AI" tag — snippet)](https://www.mako.co.il/Tagit/%D7%91%D7%99%D7%A0%D7%94+%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA) [(mako/nexter-news AI-in-ads piece — snippet)](https://www.mako.co.il/nexter-news/Article-0622349db228991026.htm). This is editorial coverage by a sibling property, not a V1 production capability.
- **Keshet News business-podcast coverage.** "בזמן שעבדתם" (Channel 12 / mako / N12 podcast) has covered AI, robotics, and CES from a journalistic lens [(podcasts.apple — snippet)](https://podcasts.apple.com/mk/podcast/%D7%91%D7%96%D7%9E%D7%9F-%D7%A9%D7%A2%D7%91%D7%93%D7%AA%D7%9D/id1519225032). Editorial coverage, not internal V1 tooling.

**Net:** as of public sources reachable in this run, there is no announced AI initiative inside V1. Absence of evidence in our searches is **not** evidence of absence — flag this and do not infer.

## 10. Implications for V1 AI Hub (questions only)

1. If V1's largest publicly visible 2025 update added live broadcasts and "games" but **not** any AI-tooling story, what is the implied appetite at V1 for an internally-branded "AI Hub" product surface?
2. The micro-drama vertical (`growing_waves-magazine/...`) is a *new editorial slug*, not just a new piece of content — does V1 already have an internal pattern of standing up named verticals as separate slug families, and would an AI-Hub-as-a-vertical follow that pattern or sit somewhere else?
3. The single most-cited 2026 V1 win is a co-production with Ananey (Paramount) — does a "V1 AI Hub" concept presuppose in-house tooling, or is the more natural V1 pattern a co-production / co-tooling deal with an external AI shop?
4. Public reception of the micro-drama includes both viral success and explicit "this is bad / addictive / casino-like" criticism — what would the V1 AI Hub do to avoid inheriting the same pattern of "viral but reputationally split"?
5. If V1 is publicly co-litigating against TikTok over short-vertical-video copyright, what are the AI-hub-shaped implications for any tool that ingests, summarises, or remixes third-party short-form video clips inside V1's pipeline?
6. The September-2025 "games" feature ships with at least one user complaint about a Samsung-branded competition — does the AI Hub concept overlap with that "games / giveaways" surface, and if so, does it inherit the same support/complaint surface area?
7. The current V1 surface is Hebrew-only in any source we reached — does a V1 AI Hub assume Hebrew-only inputs/outputs, or does it have to span the languages that Keshet International operates in (English, plus the format-trade markets)?
8. V1's editor-in-chief Neta Livneh and Keshet Digital's CEO Uri Rozen are publicly named in 2024 reporting; no public CTO / Head-of-Product / Head-of-AI for V1 has been surfaced in 2025 or 2026 — who is the AI Hub's natural sponsor inside the org chart, and is that role even currently filled?

## 11. What we don't know (gap log)

1. What was the exact contents of every V1 iOS / Android release between version 1.0 (May 2024) and version 26.0 (Sep 2025) — i.e. what shipped between version 2.0 (a known APK-mirror snapshot) and version 26.0? (Note: throughout this report, "V1" is the company; numeric `N.M` strings refer to V1-app release numbers, not to the company brand.)
2. Did V1 ship a public web (`v-1.co.il`) redesign in 2024, 2025, or 2026, and if so when and what changed?
3. Did V1 ever publicly disclose its monetisation model — pre-roll, mid-roll, sponsored shorts, sponsorship/branded partnerships, or none — beyond the September-2025 "games" / giveaway surface?
4. Did V1 ship any announced AI-assisted production tooling (transcription, captioning, clip selection, recommendation, summarisation) in 2024–2026?
5. What was V1's audited DAU / MAU / time-on-app for any quarter after Q3 2024, distinct from the Keshet-supplied figures relayed in trade press?
6. Did V1 add or sunset any named editorial vertical (weather, finance, food, sport) between launch and May 2026?
7. Did V1 publish an editorial code of practice (Press Council membership, election-coverage rules, real-time security-incident protocols), and where?
8. Did V1 add dark-mode, accessibility controls, or non-Hebrew language support in any 2024–2026 release?
9. What is the contractual scope of the V1 × Ananey (Paramount) micro-drama deal — exclusive, multi-title, revenue-share, ad-share, escape-hatch — and is there a *second* announced micro-drama in the slate after *"When the Waves Get Stronger"*?
10. Did V1's 2026 Iran-war / continued-northern-front-coverage produce a publicly disclosed traffic peak comparable to the late-2024 ~2.4M-views/day spike?

## 12. Sources

App-store / product surfaces (status: reachable URLs; body fetched only as search-summary snippets):
- App Store IL — *V1 החדשות החדשות* — `https://apps.apple.com/il/app/v1-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA/id6475302142`
- App Store US — *V1 החדשות החדשות* — `https://apps.apple.com/us/app/v1-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA/id6475302142`
- Google Play — `com.keshet.v1` — `https://play.google.com/store/apps/details?id=com.keshet.v1`
- APKPure mirror (V1 Android, version-history surface) — `https://apkpure.com/v1-%D7%9B%D7%9B%D7%94-%D7%A8%D7%95%D7%90%D7%99%D7%9D-%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%95%D7%91%D7%99%D7%93%D7%95%D7%A8-%D7%94%D7%99%D7%95%D7%9D/com.keshet.v1`
- APKPure historic v2.0 download page — `https://apkpure.com/v1-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%94%D7%97%D7%93%D7%A9%D7%95%D7%AA/com.keshet.v1/download/2.0`
- `v-1.co.il` — `https://www.v-1.co.il/`
- Example V1 newsflash slug — `https://www.v-1.co.il/newsflash-2026/m01_w03/shorts-b4295b70a06cb91027.htm`
- Example V1 news-magazine slug — `https://www.v-1.co.il/news-magazine/2024-m08_w05/shorts-6149b516aad9191026.htm`
- Example V1 special-magazine slug — `https://www.v-1.co.il/special-magazine/2024-m07_w05/shorts-f0f6ec6fa420191026.htm`
- Example V1 micro-drama slug — `https://www.v-1.co.il/growing_waves-magazine/2026-m03_w01/shorts-ddb14f99263bc91026.htm`
- YouTube `@v1israel` shorts surface — `https://www.youtube.com/@v1israel/shorts`
- Instagram `@v1.israel` — `https://www.instagram.com/v1.israel/`

Trade-press / coverage:
- ice.co.il "האפליקציה החדשה של קשת: הנתונים נחשפים לראשונה" — `https://www.ice.co.il/research/news/article/1031140`
- ice.co.il "קשת בהפתעה חדשה: זו האפליקצייה החדשה" — `https://www.ice.co.il/media/news/article/1018337`
- mako finance-magazine "*כשהגלים מתחזקים* שווה הרבה מאוד כסף" — `https://www.mako.co.il/finances-magazine/Article-1d9e8ce583d5d91026.htm`
- mako "ידין גלמן ומישל פרו בשיתוף פעולה" — `https://www.mako.co.il/nexter-news/Article-e47696481e37b91027.htm`
- mako "ידין גלמן על התגובות והפארודיות ל*כשהגלים מתחזקים*" — `https://www.mako.co.il/makoz-viral/Article-6fccecd5f692d91027.htm`
- mako "מישל פרו: אישה מצחיקה נתפסת משום מה כפחות נשית" — `https://www.mako.co.il/makoz-extra/Article-cdc59b22e109c91027.htm`
- mako "AI גם בפרסומות: המהלך החדש של FreeTV" — `https://www.mako.co.il/nexter-news/Article-0622349db228991026.htm`
- mako "סטרובריטה ובנניטו נפרדו" AI-fruit-videos trend piece — `https://www.mako.co.il/nexter-news/Article-17047a5f1360d91026.htm`
- srugim.co.il "*כשהגלים מתחזקים* הופך לסדרה" — `https://www.srugim.co.il/1282971-%D7%9B%D7%A9%D7%94%D7%92%D7%9C%D7%99%D7%9D-%D7%9E%D7%AA%D7%97%D7%96%D7%A7%D7%99%D7%9D-%D7%94%D7%95%D7%A4%D7%9A-%D7%9C%D7%A1%D7%93%D7%A8%D7%94-%D7%99%D7%93%D7%99%D7%9F-%D7%92%D7%9C%D7%9E%D7%9F`
- kipa.co.il review of *"כשהגלים מתחזקים"* — `https://www.kipa.co.il/%D7%AA%D7%A8%D7%91%D7%95%D7%AA/%D7%98%D7%9C%D7%95%D7%95%D7%99%D7%96%D7%99%D7%94/1220481-0/`
- timeout.co.il piece on the micro-drama format — `https://timeout.co.il/%D7%9B%D7%A9%D7%94%D7%92%D7%9C%D7%99%D7%9D-%D7%9E%D7%AA%D7%97%D7%96%D7%A7%D7%99%D7%9D-%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%AA/`
- ynetnews "Israeli broadcasters sue TikTok" — `https://www.ynetnews.com/business/article/hjvbaxvrxg`
- calcalistech / ctech "Broadcasters take TikTok to court" — `https://www.calcalistech.com/ctechnews/article/zbw2qi16p`
- jpost.com Israeli TV Academy 2025 awards roundup — `https://www.jpost.com/israel-news/culture/article-895116`
- timesofisrael.com awards-rescheduled-after-Iran-war — `https://www.timesofisrael.com/noa-kolers-happy-place-wins-big-in-israeli-tv-awards-rescheduled-after-iran-war/`
- timesofisrael.com "Paramount+ to screen Keshet 12's Oct. 7 series *Red Alert*" — `https://www.timesofisrael.com/paramount-acquires-keshet-12s-red-alert-series-about-october-7/`
- Globes "הכירו את זרוע ההשקעות האסטרטגיות החדשה של קשת" — `https://www.globes.co.il/news/article.aspx?did=1001288225`
- Deadline "Keshet International Inks First-Look Deal With Sony Pictures TV" — `https://deadline.com/2025/12/keshet-international-sony-tv-deal-save-the-date-remake-1236633834/`
- Deadline "Apple TV Israeli Drama *Unconditional* Gets Trailer" — `https://deadline.com/2026/04/unconditional-apple-tv-trailer-1236861249/`
- Apple TV Press release on *Unconditional* premiere — `https://www.apple.com/tv-pr/news/2026/02/apple-tv-sets-new-thriller-unconditional-to-premiere-friday-may-8/`
- Señal News — Keshet International × Bellino's *Elevator Pitch Brasil* — `https://senalnews.com/en/content/keshet-international-and-bellinos-unlimited-launch-elevator-pitch-brasil`
- Señal News — Keshet International × Faraway *Off Road* — `https://senalnews.com/en/content/keshet-international-and-faraway-to-co-produce-netflixs-off-road`

Encyclopaedic / reference:
- Hebrew Wikipedia "V1" — `https://he.wikipedia.org/wiki/V1`
- Hebrew Wikipedia "כשהגלים מתחזקים (סדרת רשת)" — `https://he.wikipedia.org/wiki/%D7%9B%D7%A9%D7%94%D7%92%D7%9C%D7%99%D7%9D_%D7%9E%D7%AA%D7%97%D7%96%D7%A7%D7%99%D7%9D_(%D7%A1%D7%93%D7%A8%D7%AA_%D7%A8%D7%A9%D7%AA)`
- Hebrew Wikipedia "הבחירות לרשויות המקומיות בישראל (2024)" — `https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%A8%D7%A9%D7%95%D7%99%D7%95%D7%AA_%D7%94%D7%9E%D7%A7%D7%95%D7%9E%D7%99%D7%95%D7%AA_%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C_(2024)`
- HaMichlol "מבצע חיצי הצפון" — `https://www.hamichlol.org.il/%D7%9E%D7%91%D7%A6%D7%A2_%D7%97%D7%99%D7%A6%D7%99_%D7%94%D7%A6%D7%A4%D7%95%D7%9F`

App-store-analytics / ranking surfaces:
- Sensor Tower top-5 IL news Q2 2024 — `https://sensortower.com/blog/2024-q2-unified-top-5-news%20and%20magazines-units-il-600abc3f241bc16eb8508514`
- Sensor Tower top-5 IL news Q2 2025 — `https://sensortower.com/blog/2025-q2-unified-top-5-news-units-il-600abc3f241bc16eb850846d`
- Appfigures top news iPhone IL — `https://appfigures.com/top-apps/ios-app-store/israel/iphone/news?profile=developer.42987`
- 42matters most-popular-news-apps Israel — `https://42matters.com/most-popular-news-apps-israel`
- Similarweb top-apps Israel news & magazines — `https://www.similarweb.com/top-apps/google/israel/news-magazines/`

V1 / Keshet hiring & internal surfaces:
- Keshet Media Group careers portal — `https://jobs.keshet-mediagroup.com/`
- "עורכ.ת תוכן ל-V1" job posting (taasiya.co.il mirror) — `https://www.taasiya.co.il/jobs/69691.htm`
- Mako jobs portal — `https://www.mako.co.il/help-jobs`

Cross-platform fan / reception surfaces (low authority, used only for reception colour):
- Liel Eli `@lieleli` TikTok with `#60שניות #v1` — `https://www.tiktok.com/@lieleli/video/7473160740858367240`
- Liel Eli Instagram post crediting V1 format — `https://www.instagram.com/p/DRHUotvCBck/`
- Ivri Lider Facebook post crediting V1's "60 שניות" — `https://www.facebook.com/ivri.lider.official/posts/%D7%AA%D7%95%D7%93%D7%94-%D7%9C%D7%9C%D7%99%D7%90%D7%9C-%D7%90%D7%9C%D7%99-%D7%95%D7%9C-v1%D7%A9%D7%90%D7%99%D7%A8%D7%97%D7%95-%D7%90%D7%95%D7%AA%D7%99-%D7%9C-60-%D7%A9%D7%A0%D7%99%D7%95%D7%AA-%D7%9C%D7%A8%D7%90%D7%99%D7%95%D7%9F-%D7%94%D7%9E%D7%9C%D7%90-httpsappsv-1coilxm3kj4p6j/1144391260389876/`
- Ananey Paramount FB post on micro-drama launch — `https://www.facebook.com/AnaneyParamount/posts/%D7%92%D7%90%D7%99%D7%9D-%D7%9C%D7%94%D7%A9%D7%99%D7%A7-%D7%90%D7%AA-%D7%A1%D7%93%D7%A8%D7%AA-%D7%94%D7%9E%D7%99%D7%A7%D7%A8%D7%95-%D7%93%D7%A8%D7%9E%D7%94-%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%94-%D7%91%D7%A2%D7%91%D7%A8%D7%99%D7%AA-%D7%A9%D7%AA%D7%A2%D7%9C%D7%94-%D7%91%D7%A7%D7%A8%D7%95%D7%91-%D7%91%D7%90%D7%A4%D7%9C%D7%99%D7%A6%D7%99%D7%99%D7%AA-v1-%D7%9E%D7%91%D7%99%D7%AA-%D7%A7%D7%A9%D7%AA/1438990474896895/`
- *"כשהגלים מתחזקים"* cast Instagram — `https://www.instagram.com/when_the_waves_grow_stronger/`

Cross-references inside this repo:
- Sibling "V1 / Keshet company context" report — [`research/v1-ai-hub/04-v1-keshet-company-context.md`](04-v1-keshet-company-context.md)
- Folder index and naming rule — [`research/v1-ai-hub/README.md`](README.md)
