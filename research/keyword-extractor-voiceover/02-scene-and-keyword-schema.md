# R2 — Scene and Keyword Schema

> Status: draft
> Owner: Wave-2 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

Candidate frozen schema for the keyword-extractor's structured output, revised from `PRE-RESEARCH.md` §4 R2 (which was keyword-first) to **scene-first** per `HANDOFF.md` §3 + §5. Top level: `{language, duration_s, transcript, scenes[], notes?}`. Each scene carries `scene_id`, `start_s`/`end_s`, a `visual_treatment` (enum stubbed here, locked in R-graphics), per-scene `keywords[]`, and one of two **conditional payloads** — `broll` (sourcing pref + licence + vertical flag) or `graphic` (`template` + `props`) — keyed off the treatment. `category` is a closed enum mirroring the editor's stock-folder names. **Bilingual rule:** when `language: he`, `term`/`lemma` stay Hebrew; `category` and `visual_treatment` are always English. A `crop_safety_priority` field on each keyword feeds R5's vertical-aware match score. Two paste-ready worked examples (HE weather + temperature-table; EN weather + `lower_third`) exercise the shape end-to-end.

## Scope & questions

Per `PLAN.md` §3 / `HANDOFF.md` §2, this report ends at "here are the options" — R9 picks. In scope: top-level shape, scene shape, conditional broll/graphic payloads, `category` enum starter set, bilingual rule, vertical-aware fields, two worked examples, tradeoff list. Out of scope: prompt design (R3), the locked `visual_treatment` enum (R-graphics, same wave), template/props sub-schemas per treatment (R-graphics), and the matching algorithm that consumes the schema (R5).

## Findings

### Top-level shape

```json
{
  "language": "he",
  "duration_s": 110.4,
  "transcript": "...",
  "scenes": [],
  "notes": null
}
```

- `language` ∈ `"he" | "en"` — gates the bilingual rule below and is a per-call constant (`PRE-RESEARCH.md` §4 R3).
- `duration_s` — float, source-of-truth for the EDL canvas (`PRE-RESEARCH.md` §1 pipeline).
- `transcript` — the verbatim Whisper output; lets R8's "no keyword absent from transcript" guardrail run a lemmatised match (`PRE-RESEARCH.md` §4 R8).
- `scenes[]` — array, ordered by `start_s`; the only place keywords live (overrides flat-keyword draft per `HANDOFF.md` §3).
- `notes` — optional scan-wide caveat, mirrors `skills/viral-news-scanner/references/output-schema.md` `note` field; one short sentence.

### Scene shape (with conditional broll/graphic payloads)

```json
{
  "scene_id": 1,
  "start_s": 0.0,
  "end_s": 12.3,
  "visual_treatment": "broll",
  "confidence": 0.91,
  "source_orientation": null,
  "keywords": [
    {
      "term": "גשם",
      "lemma": "גשם",
      "visual_concept": "rain on car windshield, vertical",
      "category": "rain",
      "weight": 0.95,
      "confidence": 0.92,
      "alternatives": ["umbrella", "wet street"],
      "crop_safety_priority": "high"
    }
  ],
  "broll": {"sourcing_pref": ["pexels", "pixabay"], "license_required": "commercial", "vertical_required": true},
  "graphic": null
}
```

- `start_s`/`end_s` — float seconds, ±0.25 s tolerance from `PRE-RESEARCH.md` §4 R8.
- `visual_treatment` — **stub enum** `{broll, broll_montage, graphic_table, graphic_map, graphic_chart, lower_third, title_card, generated_clip}`; the locked list lives in R-graphics (`README.md` §Reports → R-graphics row). Until R-graphics ships, treat the eight values above as provisional.
- `confidence` — 0–1 on the treatment classification (separate from per-keyword confidence) so R5/R8 can route low-confidence scenes to manual review.
- `source_orientation` — placeholder (`null` at extract time); R4/R5 fill `"vertical"` or `"horizontal"` after sourcing so R6's renderer knows whether to centre-crop (`PRE-RESEARCH.md` §1, §4 R6 vertical canvas).
- `broll` and `graphic` are **mutually exclusive**: exactly one is non-null per scene. Treatments `broll | broll_montage | generated_clip` populate `broll`; `graphic_table | graphic_map | graphic_chart | lower_third | title_card` populate `graphic` (`HANDOFF.md` §5 worked example).

### Category enum

Closed list mirroring the editor's stock-footage folder names per `PRE-RESEARCH.md` §4 R2 ("Without a closed list Claude invents labels like `drizzle` or `partly cloudy with a chance of rain` and the matcher has nothing to map against"). Same discipline as the seven-value `category` enum in `skills/viral-news-scanner/references/output-schema.md`.

Starter set:
```
rain | heavy_rain | snow | sun | clear_sky | clouds | overcast | wind |
storm | thunder | fog | hot | cold | humid | city_skyline |
map_overlay | temperature_graphic | sea | beach | sign_off
```

The user supplies the locked list once (`categories.json` placeholder, alongside the schema), then the prompt template references it. R-graphics may extend (e.g. `lower_third_attribution`).

### Bilingual rule (HE term/lemma; EN category/treatment)

When `language: "he"`: `term` and `lemma` stay Hebrew (preserve the original word; required by R8's "lemmatised match against transcript"); `category` and `visual_treatment` are **always English** so they map directly onto the editor's English-named folders and template files (`PRE-RESEARCH.md` §4 R3 bilingual rule). Few-shot: `{"term": "גשם", "lemma": "גשם", "category": "rain", "visual_concept": "rain on car windshield, vertical"}`. R3 enforces via system-prompt + few-shots.

### Vertical-aware fields

`keywords[].crop_safety_priority ∈ {low, medium, high}` — `high` = the action must sit in the centre 56% of width to survive a centre-crop on horizontal source clips; feeds R5's `crop_safety` score (`PRE-RESEARCH.md` §1, §4 R5 vertical-aware scoring). `broll.vertical_required` is the hard form; `crop_safety_priority` is the soft form per keyword.

### Worked examples

#### Hebrew weather + temperature-table

```json
{
  "language": "he",
  "duration_s": 18.0,
  "transcript": "היום צפוי גשם כבד — קחו מטריות. להלן הטמפרטורות בערים: תל אביב 24°/17°, חיפה 22°/16°, ירושלים 20°/14°.",
  "scenes": [
    {
      "scene_id": 1, "start_s": 0.0, "end_s": 12.0,
      "visual_treatment": "broll", "confidence": 0.93, "source_orientation": null,
      "keywords": [{"term": "גשם", "lemma": "גשם", "visual_concept": "heavy rain on car windshield, vertical", "category": "heavy_rain", "weight": 0.95, "confidence": 0.92, "alternatives": ["מטרייה", "wet street"], "crop_safety_priority": "high"}],
      "broll": {"sourcing_pref": ["pexels", "pixabay"], "license_required": "commercial", "vertical_required": true},
      "graphic": null
    },
    {
      "scene_id": 2, "start_s": 12.0, "end_s": 18.0,
      "visual_treatment": "graphic_table", "confidence": 0.97, "source_orientation": null,
      "keywords": [{"term": "טמפרטורות", "lemma": "טמפרטורה", "visual_concept": "temperature table 3 cities", "category": "temperature_graphic", "weight": 0.99, "confidence": 0.98, "alternatives": [], "crop_safety_priority": "high"}],
      "broll": null,
      "graphic": {"template": "graphic_table", "props": {"title": "טמפרטורות מחר", "rows": [{"city": "תל אביב", "high": 24, "low": 17}, {"city": "חיפה", "high": 22, "low": 16}, {"city": "ירושלים", "high": 20, "low": 14}]}}
    }
  ],
  "notes": null
}
```
(Mirrors the persona's worked example, `00-use-case-discovery.md` §Persona scenes 2–3.)

#### English weather + lower_third

```json
{
  "language": "en",
  "duration_s": 14.0,
  "transcript": "Heavy rain across the coast today. Source: Israel Meteorological Service.",
  "scenes": [
    {
      "scene_id": 1, "start_s": 0.0, "end_s": 10.0,
      "visual_treatment": "broll", "confidence": 0.9, "source_orientation": null,
      "keywords": [{"term": "rain", "lemma": "rain", "visual_concept": "heavy rain on coastal road, vertical", "category": "heavy_rain", "weight": 0.94, "confidence": 0.91, "alternatives": ["storm", "wet street"], "crop_safety_priority": "high"}],
      "broll": {"sourcing_pref": ["pexels", "pixabay"], "license_required": "commercial", "vertical_required": true},
      "graphic": null
    },
    {
      "scene_id": 2, "start_s": 10.0, "end_s": 14.0,
      "visual_treatment": "lower_third", "confidence": 0.96, "source_orientation": null,
      "keywords": [{"term": "Israel Meteorological Service", "lemma": "Israel Meteorological Service", "visual_concept": "attribution chyron", "category": "lower_third_attribution", "weight": 0.99, "confidence": 0.98, "alternatives": [], "crop_safety_priority": "medium"}],
      "broll": null,
      "graphic": {"template": "lower_third", "props": {"line1": "Source", "line2": "Israel Meteorological Service"}}
    }
  ],
  "notes": null
}
```

### Tradeoffs

- **Flat keywords vs scene-grouped.** Flat is simpler to emit but loses the treatment dimension — a `temperature_graphic` keyword has no home in a flat list, and the chooser cannot tell where one visual ends and the next begins. Scene-grouped costs one extra nesting level but lets R6 render mixed treatments in a single pass (`HANDOFF.md` §3 "scene-first, not flat keywords"; persona's 7-scene worked example, `00-use-case-discovery.md`).
- **Single-pass vs two-pass extraction.** Single-pass (segment + classify + keywords in one call) is cheaper and keeps context coherent; two-pass (segment first, then per-scene keyword extraction) gives finer control and a chance to swap models per pass. R3 picks; this schema works either way.
- **JSON-schema validation strictness.** Strict (`additionalProperties: false`, full enum on `category`) catches Claude inventing fields and mirrors `viral-news-scanner`'s closed-list discipline (`skills/viral-news-scanner/references/output-schema.md` "closed-list categories"). Lenient (warn-only) reduces friction during prompt iteration. Tradeoff between false-positive validation failures and silent schema drift.

## Implications for keyword-extractor-voiceover

Candidate frozen schema (R9 locks): the top-level + scene shapes + closed `category` enum + bilingual rule + `crop_safety_priority` above. Two paste-ready worked examples (HE + EN) above. **Pipeline-stage ownership of fields** — R3 (prompt) teaches Claude: `language`, `duration_s`, `transcript`, `scenes[].scene_id`/`start_s`/`end_s`/`visual_treatment`/`confidence`, all `keywords[]` fields, `graphic.props`. R4/R5 fill at sourcing time: `source_orientation`, the realised clip URL/licence (added downstream in the EDL, not this schema). R6 consumes everything. R-graphics finalises the `visual_treatment` enum and the `template`/`props` sub-schema per treatment.

## Open questions

- Does `categories.json` ship inline with the skill or as a newsroom-supplied config? (R7.)
- Should `keywords[]` be allowed empty for pure-graphic scenes (e.g. a sign-off `title_card`), or always carry at least one anchor keyword for transcript traceability? (R8.)
- Per-treatment `template`/`props` sub-schemas — locked here or in R-graphics? Current call: R-graphics, this report only stubs.
- Strict vs lenient JSON validation — depends on R3's prompt reliability metrics.
- HE+EN code-switching inside one transcript (`PRE-RESEARCH.md` §4 R3, persona Q5) — does each scene get a single `language`, or a mixed flag? Defer to R3.

## Sources

- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` §1, §4 R2, §4 R3, §4 R5, §4 R6, §4 R8, §6 (graphics in scope).
- `research/keyword-extractor-voiceover/HANDOFF.md` §3 scene-first rule, §5 schema sketch.
- `research/keyword-extractor-voiceover/00-use-case-discovery.md` Findings — 7-scene worked example, "wrong number worse than wrong B-roll".
- `research/keyword-extractor-voiceover/README.md` — R-graphics row references locked enum.
- `skills/viral-news-scanner/references/output-schema.md` — frozen-schema discipline, closed-list `category`, `note` field shape.
- `skills/viral-news-scanner/SKILL.md` — newsroom JSON output prior art.
- `CLAUDE.md` — 9:16 vertical default; HE-primary defaults.
