# R3 — Prompt Design and Caching

> Status: draft
> Owner: Wave-3 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

One Claude call does scene segmentation + `visual_treatment` classification + per-scene keyword extraction. Cheaper and more coherent than two-pass; the bad-parse failure mode is mitigated by JSON-mode prefill, 5 few-shots, and the closed enums from R2 + R-graphics. The static block (role + schema + bilingual rule + 8 trigger heuristics + 5 few-shots, ~2.4 k tokens) is **cached with a 1 h TTL breakpoint**; the user message carries only `{transcript, language, duration_s, word_timestamps?}`, so 4 of 5 daily voiceovers hit the cache. Default model: **`claude-haiku-4-5`** — task is structured and bounded by closed enums. Escalate to **`claude-sonnet-4-6`** when any scene returns `confidence < 0.7`, on breaking-news / election / security topics, or on editor re-run. Cached cost ≈ **\$0.009/voiceover** vs ≈ \$0.011 cold.

## Scope & questions

R3 owns the prompt template + caching plan. Out of scope: Whisper variant (R1), stock vendor (R4), match score (R5), renderer (R6), guardrails (R8). Output: paste-ready `system + few-shots + user` triple + caching strategy.

## Findings

### Single-pass vs two-pass tradeoff

Two-pass (A segment; B per-scene classify + extract) buys per-stage model swaps and isolated retries, but doubles latency, doubles base input, splits the bilingual rule, and re-loads transcript context. Single-pass keeps the transcript in one place and lets Claude reason across boundaries — *"the temperatures are…"* immediately implies the next clause is `graphic_table`. Failure mode: one malformed token nukes the voiceover. Mitigations (`knowledge/09-prompting.md`): (1) **5 few-shots** (§9.2) so Claude pattern-matches the JSON shape; (2) **prefill** assistant with `{"language":` to lock JSON-mode (§9.3); (3) **closed enums** cap legal outputs (mirrors `skills/viral-news-scanner/references/output-schema.md`). R8 owns validator + 1-shot retry.

### Prompt template (paste-ready)

#### System message

```text
<role>
You are an extraction model for a vertical-video (9:16) news pipeline. Your only job is to read a single voiceover transcript and return ONE valid JSON object that segments it into scenes, classifies each scene's visual_treatment, and extracts per-scene keywords with concrete visual concepts. You never write prose, never wrap output in code fences, never explain.
</role>

<output_contract>
Return exactly one JSON object matching the schema below. All fields required unless marked optional. Top-level shape:

{
  "language": "he" | "en",
  "duration_s": number,
  "transcript": string,
  "scenes": [ Scene, ... ],
  "notes": string | null
}

Scene shape:
{
  "scene_id": integer (1-based, ordered by start_s),
  "start_s": number, "end_s": number,
  "visual_treatment": "broll" | "broll_montage" | "graphic_table" | "graphic_map" | "graphic_chart" | "lower_third" | "title_card" | "generated_clip",
  "confidence": number (0-1, your confidence in the treatment classification),
  "source_orientation": null,
  "keywords": [ Keyword, ... ],
  "broll":   { "sourcing_pref": ["pexels","pixabay"], "license_required": "commercial", "vertical_required": true } | null,
  "graphic": { "template": <same as visual_treatment>, "props": object } | null
}

Keyword shape:
{
  "term": string,            // verbatim from transcript (HE if language=he)
  "lemma": string,           // dictionary form (HE if language=he)
  "visual_concept": string,  // English, concrete, vertical-friendly (e.g. "rain on car windshield, vertical")
  "category": <closed enum, English>,
  "weight": number (0-1),
  "confidence": number (0-1),
  "alternatives": [string, ...],
  "crop_safety_priority": "low" | "medium" | "high"
}

Mutual-exclusion rule: broll is non-null iff visual_treatment ∈ {broll, broll_montage, generated_clip}; graphic is non-null otherwise.
category enum: rain | heavy_rain | snow | sun | clear_sky | clouds | overcast | wind | storm | thunder | fog | hot | cold | humid | city_skyline | map_overlay | temperature_graphic | sea | beach | sign_off | lower_third_attribution.
</output_contract>

<bilingual_rule>
When language="he": term and lemma stay Hebrew (verbatim from transcript; preserve nikud only if present). category and visual_treatment and visual_concept are ALWAYS English. Do NOT transliterate Hebrew into Latin script.
When language="en": all fields English.
Code-switching inside one transcript: assign each scene a single dominant language; if a scene mixes HE+EN words, follow the language= flag passed in the user message.
</bilingual_rule>

<no_hallucination_rule>
Every term must appear verbatim somewhere in the transcript (lemmatised match is fine for HE inflections). If you cannot find a term in the transcript, do NOT invent one — emit fewer keywords for that scene. visual_concept may go beyond the transcript (it describes the desired stock clip), but term/lemma must trace back to the spoken words.
</no_hallucination_rule>

<trigger_heuristics>
Apply these in order. Stop at the first match.
1. List of N≥2 items each with a numeric value + unit ("X 24°, Y 22°, Z 20°"; "ת"א 24, חיפה 22") → graphic_table.
2. Spatial preposition + named region ("גשם בצפון", "rain in the north", "across the coast") → graphic_map; if a sensory clause attaches, also keep one broll keyword as alternative.
3. Time-series phrase ("השבוע", "over the week", "ב-7 הימים האחרונים") with numeric trend → graphic_chart.
4. Single number + unit ("24 degrees", "1.5 מטר") in isolation → lower_third overlaid on broll. If grouped with ≥2 more such numbers, fold into graphic_table instead (rule 1 wins).
5. Named person + role ("שר התחבורה אמר", "Prime Minister said") → lower_third (attribution) over broll. NEVER auto-pick a face; default broll is policy-safe (highway, podium, generic crowd).
6. Bare adjective / sensory phrase ("rainy", "כבד", "windy", "מטריות") → broll. If 2+ short clauses chain (≤2 s each), use broll_montage.
7. Greeting / sign-off ("שלום", "זה הכל מאיתנו", "good evening") → title_card.
8. None of the above match AND no broll keyword scores plausibly → generated_clip with a descriptive visual_concept.
</trigger_heuristics>

<timestamp_rule>
If the user message includes word_timestamps, set scene start_s/end_s to the start of the first spoken word in the scene and the end of the last. If word_timestamps is absent, use only the segment boundaries provided in the user message — DO NOT invent timestamps. If neither is provided, distribute scenes proportionally across duration_s and set confidence ≤ 0.6 to flag for review.
</timestamp_rule>
```

#### Few-shots (5)

```text
<examples>

<example index="1" lang="he" lane="weather-broll">
<input>{"language":"he","duration_s":4.2,"transcript":"היום צפוי גשם כבד — קחו מטריות."}</input>
<output>{"language":"he","duration_s":4.2,"transcript":"היום צפוי גשם כבד — קחו מטריות.","scenes":[{"scene_id":1,"start_s":0.0,"end_s":4.2,"visual_treatment":"broll","confidence":0.93,"source_orientation":null,"keywords":[{"term":"גשם","lemma":"גשם","visual_concept":"heavy rain on car windshield, vertical","category":"heavy_rain","weight":0.95,"confidence":0.92,"alternatives":["umbrella","wet street"],"crop_safety_priority":"high"},{"term":"מטריות","lemma":"מטרייה","visual_concept":"hand opening umbrella close-up","category":"heavy_rain","weight":0.6,"confidence":0.85,"alternatives":[],"crop_safety_priority":"medium"}],"broll":{"sourcing_pref":["pexels","pixabay"],"license_required":"commercial","vertical_required":true},"graphic":null}],"notes":null}</output>
</example>

<example index="2" lang="en" lane="weather-broll-plus-lower-third">
<input>{"language":"en","duration_s":14.0,"transcript":"Heavy rain across the coast today. Source: Israel Meteorological Service."}</input>
<output>{"language":"en","duration_s":14.0,"transcript":"Heavy rain across the coast today. Source: Israel Meteorological Service.","scenes":[{"scene_id":1,"start_s":0.0,"end_s":10.0,"visual_treatment":"broll","confidence":0.9,"source_orientation":null,"keywords":[{"term":"rain","lemma":"rain","visual_concept":"heavy rain on coastal road, vertical","category":"heavy_rain","weight":0.94,"confidence":0.91,"alternatives":["storm","wet street"],"crop_safety_priority":"high"}],"broll":{"sourcing_pref":["pexels","pixabay"],"license_required":"commercial","vertical_required":true},"graphic":null},{"scene_id":2,"start_s":10.0,"end_s":14.0,"visual_treatment":"lower_third","confidence":0.96,"source_orientation":null,"keywords":[{"term":"Israel Meteorological Service","lemma":"Israel Meteorological Service","visual_concept":"attribution chyron","category":"lower_third_attribution","weight":0.99,"confidence":0.98,"alternatives":[],"crop_safety_priority":"medium"}],"broll":null,"graphic":{"template":"lower_third","props":{"line1":"Source","line2":"Israel Meteorological Service"}}}],"notes":null}</output>
</example>

<example index="3" lang="he" lane="temperature-table">
<input>{"language":"he","duration_s":7.8,"transcript":"להלן הטמפרטורות בערים: תל אביב 24, חיפה 22, ירושלים 20."}</input>
<output>{"language":"he","duration_s":7.8,"transcript":"להלן הטמפרטורות בערים: תל אביב 24, חיפה 22, ירושלים 20.","scenes":[{"scene_id":1,"start_s":0.0,"end_s":7.8,"visual_treatment":"graphic_table","confidence":0.97,"source_orientation":null,"keywords":[{"term":"טמפרטורות","lemma":"טמפרטורה","visual_concept":"temperature table 3 cities","category":"temperature_graphic","weight":0.99,"confidence":0.98,"alternatives":[],"crop_safety_priority":"high"}],"broll":null,"graphic":{"template":"graphic_table","props":{"title":"טמפרטורות מחר","dir":"rtl","rows":[{"city":"תל אביב","value":"24°"},{"city":"חיפה","value":"22°"},{"city":"ירושלים","value":"20°"}]}}}],"notes":null}</output>
</example>

<example index="4" lang="he" lane="map">
<input>{"language":"he","duration_s":3.5,"transcript":"מערכת ברקים מתקרבת מצפון-מערב."}</input>
<output>{"language":"he","duration_s":3.5,"transcript":"מערכת ברקים מתקרבת מצפון-מערב.","scenes":[{"scene_id":1,"start_s":0.0,"end_s":3.5,"visual_treatment":"graphic_map","confidence":0.9,"source_orientation":null,"keywords":[{"term":"ברקים","lemma":"ברק","visual_concept":"lightning storm front animated arrow on Israel map","category":"map_overlay","weight":0.95,"confidence":0.9,"alternatives":["thunder","storm clouds"],"crop_safety_priority":"high"}],"broll":null,"graphic":{"template":"graphic_map","props":{"region":"IL","overlay":"lightning_front_nw","label_he":"מערכת ברקים","dir":"rtl"}}}],"notes":null}</output>
</example>

<example index="5" lang="he" lane="signoff-title-card">
<input>{"language":"he","duration_s":2.4,"transcript":"זה הכל מאיתנו, יום נעים."}</input>
<output>{"language":"he","duration_s":2.4,"transcript":"זה הכל מאיתנו, יום נעים.","scenes":[{"scene_id":1,"start_s":0.0,"end_s":2.4,"visual_treatment":"title_card","confidence":0.98,"source_orientation":null,"keywords":[{"term":"יום נעים","lemma":"יום נעים","visual_concept":"sign-off card","category":"sign_off","weight":0.9,"confidence":0.95,"alternatives":[],"crop_safety_priority":"low"}],"broll":null,"graphic":{"template":"title_card","props":{"line1":"זה הכל מאיתנו","line2":"יום נעים","dir":"rtl"}}}],"notes":null}</output>
</example>

</examples>
```

#### User message

```json
{
  "language": "he",
  "duration_s": 110.4,
  "transcript": "<full Whisper transcript>",
  "word_timestamps": [
    {"word": "שלום", "start_s": 0.0, "end_s": 0.42},
    {"word": "הנה",  "start_s": 0.42, "end_s": 0.61}
  ],
  "segments": null
}
```

`word_timestamps` is optional; `segments` is optional (segment-only ASR fallback). Exactly one of the two should be non-null in production. Prefill the assistant turn with `{"language":` to lock JSON-mode (`knowledge/09-prompting.md` §9.3).

#### Output contract

Validate against R2's schema (`02-scene-and-keyword-schema.md`) in strict mode (`additionalProperties: false`, full enum on `category` + `visual_treatment`) per `viral-news-scanner` discipline. R8 owns validator + 1-shot retry.

### Caching plan

Per `knowledge/01-claude-ecosystem.md` §1.1 + `knowledge/09-prompting.md` §9.5:

- **Static block (cached):** system + 5 few-shots ≈ **2.4 k tokens**, above the 1024-token Sonnet/Opus/Haiku-4.5 minimum (`§9.5`).
- **Breakpoint:** one `cache_control:{"type":"ephemeral","ttl":"1h"}` on the last few-shot ("place on the last stable block", `§9.5`).
- **Why 1 h not 5 m:** newsroom runs cluster ~14:00–16:00 (`00-use-case-discovery.md` Persona §Day); 5 m would expire between voiceovers.
- **Dynamic block:** user message — transcript (~350 tok) + optional word_timestamps (~1.5 k tok total).
- **Hit rate at 5/day:** #1 writes, #2–5 read within the 2 h window → **~80%**.
- **Cost (Haiku 4.5 @ $1 in / $5 out; 1h-write 2× = $2.00; read 0.1× = $0.10 per MTok, `§1.1`):** cold call ≈ \$0.011; first call (cache write) ≈ \$0.014; cached read ≈ \$0.009. Daily total at 5 voiceovers ≈ **\$0.05/day**, ~\$1.50/month. Output tokens dominate; caching is a ~21% trim and grows with few-shot count.

### Model pick (Haiku 4.5 vs Sonnet 4.6 vs Opus 4.7)

Default: **`claude-haiku-4-5`** (placeholder per `knowledge/01-claude-ecosystem.md` §1.1; confirm at integration per `knowledge/99-caveats.md`). Task is structured — closed enums (8 treatments, ~21 categories), R2 JSON shape, 5 few-shots — Haiku's lane (`§1.2` "fast, cheap, high volume"). Volumes are tiny (≤4 k in, ≤2 k out). Haiku is **3× cheaper in/out** than Sonnet 4.6; latency wins for the editor's 90-min turnaround (`00-use-case-discovery.md` Persona §Day).

**Escalate to `claude-sonnet-4-6`** when: any scene `confidence < 0.7`; topic is breaking news, election, security incident, or named-person attribution (`00-use-case-discovery.md` honesty constraints; `viral-news-scanner` security-incident rule); or editor re-run. **Opus 4.7** is overkill — reserve for offline dataset re-builds or new-few-shot generation.

### Word-timestamp handling

Three modes via `<timestamp_rule>`: (1) **word-level** (faster-whisper / ivrit-ai default) — scene `start_s`/`end_s` = first/last word, ±0.25 s tolerance (`02-scene-and-keyword-schema.md`); (2) **segment-only** (possible gpt-4o-transcribe mode) — align to provided segments; inventing timestamps forbidden; (3) **neither** — proportional split with `confidence ≤ 0.6`, routing to R8 manual review. Only path that guesses, and it self-flags.

### Bilingual rule encoding

Three reinforcements: (a) `<bilingual_rule>` block in system; (b) 4 of 5 few-shots are HE, matching the Israeli newsroom default (`00-use-case-discovery.md`); (c) the English-only `category` enum makes a translated category visibly invalid (validator catches). Few-shot #3 is the load-bearing case: `term="טמפרטורות"`, `lemma="טמפרטורה"` stay HE; `category`, `visual_treatment`, `visual_concept` are EN.

### Evaluation harness sketch

Before locking, run a 10-voiceover eval (5 HE + 5 EN; 5 weather + 5 other — sports ticker, breaking + attribution, traffic + map, election chart, sign-off). Score four binaries: `scene_segmentation_correct?` (±2 s of human cut), `treatment_correct?` (matches human enum pick), `keywords_visual?` (concrete enough for a stock-API query), `no_hallucination?` (every `term` traces to a transcript word). Pass bar ≥9/10 per rubric. Failures feed a 6th few-shot. Run via Batch API at 50% off (`knowledge/01-claude-ecosystem.md` §1.4).

## Implications for keyword-extractor-voiceover

- Block above is **canonical** for R7's skill scaffold and R8's validator. Schema or enum changes must regenerate this prompt and re-run the eval.
- Cache hits require a **persistent client** — script-per-call kills the cache. R7 should expose a daemon mode.
- Per-scene `confidence` routes between Haiku default and Sonnet escalation.
- Output dominates cost; at >20/day, strip `transcript` from output — defer to R5.

## Open questions

- Ship with `thinking={"type":"enabled","budget_tokens":1024}` on Haiku 4.5 (`knowledge/01-claude-ecosystem.md` §1.2)? Hypothesis: tiny budget improves trigger-rule edge cases at near-zero cost. R8 A/B.
- Code-switching inside one scene (*"היום ב-Tel Aviv…"*): keep one `language` per scene or add a `mixed_lang` flag? Defer until persona Q5 (`00-use-case-discovery.md` §Open questions).
- Validator strict (reject + retry) vs lenient (auto-repair)? R8 owns; assumed strict + 1 retry here.
- `categories.json` inline vs tool? Inline simpler at this scale; tool only pays off past ~50 values.
- Does Haiku 4.5 preserve Hebrew without nikud-corruption inside JSON strings? Spike during the 10-voiceover eval; fall back to Sonnet 4.6 if not.

## Sources

- `research/keyword-extractor-voiceover/02-scene-and-keyword-schema.md` — top-level + scene shapes, bilingual rule, category enum, worked examples.
- `research/keyword-extractor-voiceover/00c-scene-types-and-graphic-templates.md` — locked 8-value `visual_treatment` enum, 8 trigger heuristics, HE worked examples.
- `research/keyword-extractor-voiceover/00-use-case-discovery.md` — Noa Ben-Ari persona, 7-scene HE example, ~5 voiceovers/day, honesty constraints.
- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` §4 R3, §4 R8, §5.
- `knowledge/09-prompting.md` §9.1–9.5 (XML, few-shots, CoT/prefill, system role, caching).
- `knowledge/01-claude-ecosystem.md` §1.1 (pricing), §1.2 (Haiku fit), §1.4 (`cache_control`, Batch).
- `knowledge/99-caveats.md` — model-ID versioning caveat.
- `skills/viral-news-scanner/SKILL.md` + `references/output-schema.md` — closed-list discipline, JSON-only output, honesty guardrails.
- [Anthropic — Prompt caching docs](https://docs.claude.com/en/docs/build-with-claude/prompt-caching)
- [Anthropic — Models overview](https://docs.claude.com/en/docs/about-claude/models)
