# R-prior-art — Competitor / Existing-Tools Landscape

> Status: draft
> Owner: Wave-1 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

Ten voiceover- or script-to-video tools were surveyed. The market is saturated for English-first, GUI-driven, flat-keyword B-roll insertion (Pictory, InVideo, OpusClip, Submagic, Veed, Descript, CapCut). Every consumer tool defaults to or supports 9:16 reframing; every tool inserts B-roll keyed off transcript keywords, not narrated *scenes*. Hebrew transcription is broadly available (Submagic, Veed, CapCut, Descript via Whisper); Hebrew **RTL caption rendering** is uneven and Hebrew-aware **B-roll matching** appears absent everywhere. **No surveyed tool generates structured graphics (weather tables, maps, lower-thirds) on the timeline alongside stock B-roll** — they are stock-only, AI-generation-only, or template-only. **No tool offers newsroom-grade attribution / clip-licensing audit trails or an on-prem option.** Build thesis is largely intact; integration with existing transcription stacks (e.g. Whisper) remains the cheaper alternative for English-only newsrooms.

## Scope & questions

Q1: Has anyone solved Hebrew-first voiceover→scene video already?
Q2: Does any tool match *scene-spans* rather than per-word keywords?
Q3: Does any tool integrate generated graphics + stock in a single timeline?
Q4: Does any tool serve newsroom compliance needs (licensing, attribution, on-prem)?

## Findings

### Comparison table

| Tool | Input | Hebrew / RTL | Stock source | Match granularity | 9:16 default | Generated graphics | Pricing (2026-05-07) | API | Newsroom posture |
|---|---|---|---|---|---|---|---|---|---|
| Pictory | Script + voice upload | No HE voice; captions Latin-only [1][2] | Storyblocks, Shutterstock, in-house | Sentence-keyword | Yes (preset) | No (templates only) | $25–$119/mo; API $49/120 credits [3] | Yes [3] | None advertised |
| InVideo AI | Prompt or script | Generic multi-lang; HE unverified [4] | Stock + Sora 2 / VEO 3.1 generated [5] | Prompt-driven scene | Yes | Generative video, no data graphics | Free / $20 / $48 mo [4][5] | Limited (Max tier) | None |
| OpusClip | Long video + audio | 20+ langs; HE supported for transcription, RTL render unverified [6] | Pexels + AI gen (lab) [6] | Per-clip moments | Yes (auto-reframe) | No | Free / $15 / $29 mo; API Business-tier only [6][7] | Enterprise only [7] | None |
| Submagic | Voice/video upload | HE transcription supported; RTL unverified [8][9] | In-house + Pexels | Word/keyword | Yes | No (animated emojis only) | Free / $20 / $40 / $80 mo [9] | None public | None |
| Veed.io | Voice/video upload | HE Tier-3 accuracy; RTL unverified [10][11] | Pexels/Pixabay + AI gen [12] | Sentence keyword | Yes (auto-reframe) | No (image gen only) | Free / ~$18–$70 mo (web) | Transcription via Gladia [13] | None |
| Descript | Voice/video upload | HE transcription via underlying ASR; RTL unverified [14] | User upload + Storyblocks | Transcript-driven; Underlord scene picks [14] | Yes (resize) | No (overlays) | Free / $16 / $24 / $50 mo [15] | Limited | None |
| CapCut | Voice/video | HE captions added 2023; RTL display partial, user complaints persist [16][17] | In-app library + Pexels | Keyword | Yes (native) | Templated lower-thirds | Free / Pro ~$10/mo | None public | None |
| Adobe Premiere + Firefly | NLE timeline + Firefly agent | Speech-to-Text supports HE pack; RTL caption render OK in Premiere [18] | Adobe Stock + Firefly Video [19] | Manual / agent-assisted | Manual aspect | Firefly generative clips, no data tables | CC ~$23/mo [19] | Firefly API beta | Adobe Stock indemnification [19] |
| Runway Gen-3/Gen-4 | Text/image prompt | None as caption tool | All generative [20] | Per-shot generation | Configurable | Pure gen, no stock match | $12+/mo; API ~$0.05–0.12/sec [20][21] | Yes [21] | None |
| Pictureframe | (unverified — no live product found 2026-05-07) | — | — | — | — | — | — | — | — |

### Per-tool capsules

**Pictory** — Script + voiceover input. 29 voiceover languages but **captions Latin-script only**, which rules out Hebrew RTL out-of-box [1]. Stock from Storyblocks/Shutterstock. Sentence-level keyword match. 9:16 preset. No generated charts or maps. Pricing $25–$119/mo annual; dedicated **API at $49 / 120 credits** plus enterprise tier [3]. No newsroom indemnification posture advertised.

**InVideo AI** — Prompt-to-video; accepts voiceover but optimized for prompt. Integrates Sora 2 and VEO 3.1 for generative clips alongside stock [5]. Hebrew not specifically listed; multi-lingual generation broadly. Free / $20 / $48 monthly tiers (annual) [4]. No native data-graphics generator.

**OpusClip** — Repurposes long video into vertical clips; auto-reframe with active-speaker tracking is a strength. B-roll from Pexels or AI gen, still labelled "lab" [6]. Hebrew transcription in 20+ supported languages but RTL caption rendering unverified. API gated to Business tier [7].

**Submagic** — Captions-first with B-roll insertion. **Hebrew supported for transcription** (dedicated landing page) [8] but RTL display fidelity not documented. Pricing Free / $20 / $40 / $80 [9]. No public API. Stock + emojis, no charts.

**Veed.io** — Magic B-Roll auto-suggests footage from Pexels/Pixabay, plus AI image generation [12]. Hebrew listed as supported (Tier-3 accuracy via Gladia transcription) [11][13]. Auto-reframe to 9:16. No data-table generator.

**Descript** — Transcript-as-document editor; **Underlord** is the agentic co-editor (drafts, summarises, picks viral clips) [14]. Pricing Free / $16 / $24 / $50 mo [15]. B-roll via Storyblocks integration. Hebrew transcription works (ASR underneath) but RTL caption rendering not advertised.

**CapCut** — TikTok-owned; free + ~$10/mo Pro. Hebrew added to auto-captions (2023) but Israeli creator forums report **inconsistent RTL rendering** and missing HE auto-caption in some regions [16][17]. B-roll suggestions are template-driven.

**Adobe Premiere + Firefly Video** — Premiere Speech-to-Text supports a Hebrew language pack [18]. Firefly Video Editor (browser) and Firefly AI Assistant beta (April 2026) orchestrate generation across CC apps [19]. **Adobe Stock carries indemnification** — closest to a newsroom posture. No Hebrew-specific marketing.

**Runway Gen-3 / Gen-4** — Pure generative, not a B-roll-matcher. Useful for a *generated-graphic* lane, not voice-driven scene matching [20][21].

**Pictureframe** — No live product surfaced as of 2026-05-07; treat as vapor or pre-launch — verify before citing.

### Where the gaps are

1. **Hebrew-RTL-correct captions + Hebrew-semantic B-roll matching together.** Submagic, CapCut and Veed transcribe Hebrew; **none documents RTL bidi rendering** for stylized captions and **none claims Hebrew-language semantic B-roll keying** (matching footage to *Hebrew* nouns/entities, not translated English). Verify.
2. **Scene-spans, not flat keywords.** Every consumer tool keys B-roll off per-word/per-sentence keyword extraction. None segments the voiceover into narrative scenes (e.g. "תחזית מחר בצפון") and treats each as one shot with one prop selection. Descript Underlord is closest but still transcript-keyword driven.
3. **Mixed stock + structured graphics on one timeline.** No surveyed tool generates a weather table, map, or stat card from the transcript and places it on the same timeline as stock B-roll. This is the strongest unmet niche for a weather-segment use case.
4. **Newsroom compliance.** Only Adobe (via Adobe Stock indemnification) approaches newsroom posture. None offers on-prem deployment, clip-license audit trail, or attribution metadata pass-through.

## Implications for keyword-extractor-voiceover

- Differentiation thesis (Hebrew-first, scene-first, generated-graphics-on-timeline, newsroom-grade) survives the scan; confirm by hands-on RTL caption testing in Submagic + CapCut + Veed.
- "Build vs integrate" option: Submagic/Veed transcription + custom scene-segmenter + custom graphics renderer could ship faster than full rebuild.
- "Buy and skin" option: Pictory API + Hebrew TTS layer is the cheapest path if the scene-graphics differentiator is dropped.

## Open questions

- Does any surveyed tool ship Hebrew bidi-correct stylized captions in production? (Hands-on test required.)
- Does Adobe Stock indemnification cover redistributed news-segment exports? (Licensing review.)
- Is "Pictureframe" a real shipped product or speculative? (Re-verify.)

## Sources

[1] https://kb.pictory.ai/en/articles/8679976-what-languages-are-available-for-voiceover
[2] https://pictory.ai/blog/how-to-add-captions-subtitles-to-your-videos
[3] https://pictory.ai/pictory-api-pricing
[4] https://invideo.io/pricing/
[5] https://cut-the-saas.com/ai/invideo-ai-review-2026-is-it-actually-worth-it
[6] https://www.opus.pro/pricing
[7] https://www.eesel.ai/blog/opusclip
[8] https://www.submagic.co/auto-subtitle-generator/hebrew-subtitles
[9] https://www.submagic.co/pricing
[10] https://www.veed.io/learn/best-auto-subtitle-generator
[11] https://flowith.io/blog/veed-pro-2026-faq-subtitle-accuracy-translation-storage-collaboration/
[12] https://support.veed.io/en/articles/11829765-automatic-b-roll
[13] https://www.gladia.io/blog/video-editing-and-subtitles-with-ai-transcription
[14] https://www.descript.com/underlord
[15] https://www.descript.com/pricing
[16] https://www.tiktok.com/@capcut/video/7211085185482231041
[17] https://www.facebook.com/groups/httpsmaosim1991.wixsite.compremierisrael/posts/1606192933316118/
[18] https://helpx.adobe.com/premiere/desktop/add-text-images/insert-captions/auto-transcribe-video-using-speech-to-text.html
[19] https://blog.adobe.com/en/publish/2026/04/15/adobe-extends-leadership-video-unleashing-new-ai-powered-creation-firefly-reinventing-color-editors-in-premiere
[20] https://runwayml.com/pricing
[21] https://docs.dev.runwayml.com/guides/pricing/
