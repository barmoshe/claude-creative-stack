# R-graphics — Scene Types and Generated-Graphic Templates

> Status: draft
> Owner: Wave-2 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

The pipeline now mixes matched B-roll with **tool-generated graphic scenes** (temperature tables, weather maps, lower-thirds) on the same 9:16 timeline. This report locks the closed `visual_treatment` enum to **8 values** — `broll | broll_montage | graphic_table | graphic_map | graphic_chart | lower_third | title_card | generated_clip` — every value justified by `00-use-case-discovery.md`'s worked HE weather example. Three template-authoring stacks were considered (Remotion React, HTML+Playwright, animated SVG); the recommended default per non-broll treatment is **Remotion** (React `<Composition width={1080} height={1920} fps={30}>`), with rasterised SVG kept as the fallback for fully static slides ([remotion.dev/docs/the-fundamentals](https://www.remotion.dev/docs/the-fundamentals)). RTL is handled at the template level (`dir="rtl"`, logical column order, RTL-aware text-align). Six trigger heuristics and three Hebrew worked examples are documented for R3. Biggest open question: whether Mapbox's news-media exception covers a daily Reel, or whether we need Maptiler/OSM as a backup.

## Scope & questions

R-graphics is the canonical home for two decisions: (1) the closed enum of visual treatments scenes can carry, and (2) the default authoring stack per non-broll treatment. R7 (artifact phase) and R6 (renderer) inherit both. Out of scope: Whisper variant, stock vendor, broll renderer choice, JSON schema finalisation (R2's job). (`PRE-RESEARCH.md` §6, `HANDOFF.md` §5.)

## Findings

### Scene-treatment enum

The closed list, justified per value:

| Treatment | Why it's needed | Source |
|---|---|---|
| `broll` | Single matched stock/archive clip — the dominant scene type for atmospheric phrases ("גשם כבד"). | `00-use-case-discovery.md` Findings, scene 2 |
| `broll_montage` | 2–4 short clips cut quickly under one phrase ("ירידה בטמפרטורות, ללא גשם"). Distinct from `broll` because the renderer needs duration-splitting logic. | `00-use-case-discovery.md` scene 6 |
| `graphic_table` | Tabular numeric data — temperatures across cities, sports scores, market tickers. The user's literal example. | `00-use-case-discovery.md` scene 3 |
| `graphic_map` | Geographic overlay — weather front, election map, traffic incident. | `00-use-case-discovery.md` scene 4 |
| `graphic_chart` | Time-series or comparative bars — humidity over the week, polling shifts. Not in the worked example, included because R0 §4 lists "market tickers, election results" as wedge cases. | `knowledge/08-dataviz.md` §8.1 |
| `lower_third` | Name + role banner overlaid on broll ("שר התחבורה אמר…"); also a quick stat overlay. | `00-use-case-discovery.md` scene 6 |
| `title_card` | Open/sign-off slide — *"תחזית · 7 במאי"*, *"זה הכל מאיתנו"*. | `00-use-case-discovery.md` scenes 1, 7 |
| `generated_clip` | AI-generated short MP4 from the asset-router (Luma/Runway) — escape hatch when no broll matches and a graphic is wrong tonally. | `knowledge/13-asset-pipelines.md` §13.1 |

Overlap check vs R0: every treatment R0 lists in its 7-scene worked example is covered. `generated_clip` and `graphic_chart` extend the list for sports/elections/missing-broll cases. No further treatments surfaced.

### Template authoring stack (Remotion vs Playwright vs SVG)

Three candidates were evaluated against the same target (1080×1920 @ 30 fps, HE-RTL, props-driven):

1. **Remotion React** — `<Composition width={1080} height={1920} fps={30} component={GraphicTable} />`. Props-driven; web-previewable in dev; renders to MP4 via `npx remotion render` ([remotion.dev/docs/cli/render](https://www.remotion.dev/docs/cli/render), [remotion.dev/docs/the-fundamentals](https://www.remotion.dev/docs/the-fundamentals)). Natural fit for the artifact-first ethos (`HANDOFF.md` §3) and the official Claude Code Remotion skill is now first-party ([dev.to/mayu2008/new-clauderemotion](https://dev.to/mayu2008/new-clauderemotion-to-create-amazing-videos-using-ai-37bp)).
2. **HTML/CSS + Playwright → PNG sequence → FFmpeg** — no Node toolchain beyond Playwright; cheap to host but each animated frame is a re-render, and audio mux is a separate FFmpeg pass. Fine for static slides, painful for transitions.
3. **Animated SVG, rasterised** — the simplest authoring surface; SVG in a browser → captured as PNG at 30 fps. Brittle once you want a 1.5 s row-stagger or Hebrew variable-font animation (`knowledge/05-graphics-design.md` §5.6).

**Recommendation (default per non-broll treatment):**

| Treatment | Default stack | Fallback |
|---|---|---|
| `graphic_table` | **Remotion** | SVG-rasterised |
| `graphic_map` | **Remotion** (with Mapbox static tile as `<Img>`) | SVG-rasterised |
| `graphic_chart` | **Remotion + Recharts** ([knowledge/08-dataviz.md §8.1](../../knowledge/08-dataviz.md)) | Observable Plot SVG |
| `lower_third` | **Remotion** | HTML+Playwright (single still) |
| `title_card` | **Remotion** | SVG-rasterised |
| `generated_clip` | asset-router MCP → Luma/Runway → MP4 ([knowledge/13-asset-pipelines.md §13.2](../../knowledge/13-asset-pipelines.md)) | none |

R6 inherits this. R7's artifact previews these compositions live in the browser before export.

### Worked example: temperature-table scene end-to-end

**Voiceover:** *"מחר טמפרטורות מקסימום בערים — תל אביב 24°, חיפה 22°, ירושלים 20°, באר שבע 27°."*

**What R3's prompt extracts** (per `HANDOFF.md` §5 schema):

```json
{
  "id": "s3",
  "start_s": 18.4, "end_s": 24.1, "duration_s": 5.7,
  "visual_treatment": "graphic_table",
  "template": "graphic_table",
  "props": {
    "title": "טמפרטורות מחר",
    "rows": [
      { "city": "תל אביב",  "value": "24°" },
      { "city": "חיפה",     "value": "22°" },
      { "city": "ירושלים",  "value": "20°" },
      { "city": "באר שבע",  "value": "27°" }
    ],
    "dir": "rtl"
  }
}
```

**Remotion template** (`templates/graphic_table.tsx`):

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const GraphicTable: React.FC<{title: string; rows: {city: string; value: string}[]; dir?: "rtl"|"ltr"}> = ({ title, rows, dir = "rtl" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "oklch(0.15 0 0)", direction: dir, fontFamily: "Heebo, sans-serif", padding: 80 }}>
      <h1 style={{ color: "oklch(0.95 0 0)", fontSize: 96, textAlign: dir === "rtl" ? "right" : "left", opacity: titleOp, fontWeight: 800 }}>
        {title}
      </h1>
      <div style={{ marginTop: 80, display: "grid", gap: 24 }}>
        {rows.map((r, i) => {
          const reveal = spring({ frame: frame - 14 - i * 6, fps, config: { damping: 14 } });
          return (
            <div key={r.city} style={{
              display: "grid", gridTemplateColumns: dir === "rtl" ? "1fr auto" : "auto 1fr",
              alignItems: "center", padding: "28px 40px", borderRadius: 24,
              background: "oklch(0.25 0.04 250 / 0.85)", transform: `translateY(${(1 - reveal) * 40}px)`, opacity: reveal,
            }}>
              <span style={{ color: "oklch(0.95 0 0)", fontSize: 72, textAlign: dir === "rtl" ? "right" : "left" }}>{r.city}</span>
              <span style={{ color: "oklch(0.85 0.2 80)", fontSize: 88, fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{r.value}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

Registered in `Root.tsx` as `<Composition id="graphic_table" component={GraphicTable} durationInFrames={171} fps={30} width={1080} height={1920} defaultProps={...} />` ([remotion.dev/docs/the-fundamentals](https://www.remotion.dev/docs/the-fundamentals)).

**Compositing.** The parent EDL composition stacks `<Sequence>`s of broll + this graphic + master voiceover `<Audio>` and renders in one pass at `npx remotion render` ([remotion.dev/docs/cli/render](https://www.remotion.dev/docs/cli/render)); audio synced at `start_s = 18.4`.

**RTL handling.** `direction: "rtl"` flips the grid's `auto/1fr` columns automatically (logical order); `text-align: right` on HE strings; `tabular-nums` keeps °C numerals stable; rows stack top-to-bottom (RTL is horizontal-only).

### Map treatment (static vs animated, RTL)

**Static (default)** — Mapbox Static Images API: a single PNG per scene, dropped into a Remotion `<Img>` with overlay arrows/captions composited in React ([docs.mapbox.com/api/maps/static-images](https://docs.mapbox.com/api/maps/static-images/)). Cheap, deterministic, easy to caption in HE.

**Animated** — Mapbox GL JS in headless Chromium → `renderFrames()` capture ([remotion.dev/docs/renderer/render-frames](https://www.remotion.dev/docs/renderer/render-frames)). Use only when the front actually moves on screen.

**Israeli geography & RTL labels.** Mapbox styles support a `name_he` field — pin to `text-field: ["coalesce", ["get", "name_he"], ["get", "name"]]` so Tel Aviv shows as *תל אביב*. Custom HE labels (e.g. "מערכת ברקים") composited in Remotion above the static tile, RTL-anchored.

**Licensing.** Mapbox Static Images is gated by the standard Maps SLA — *"News maps for web and print"* are explicitly mentioned as a supported use case ([mapbox.com/blog/using-static-maps](https://www.mapbox.com/blog/using-static-maps), [mapbox.com/legal/tos](https://www.mapbox.com/legal/tos)). Pricing scales by monthly tile loads ([mapbox.com/pricing](https://www.mapbox.com/pricing)). **Open question** — whether daily-newsroom Reel volume sits under the standard tier or needs the commercial-application licence. Backup: Maptiler / OpenStreetMap raster tiles (ODbL).

### Trigger rules for treatment classification

R3's prompt must encode (≥6):

1. **List of N items with numeric values + unit** ("X 24°, Y 22°, Z 20°") → `graphic_table`. ([00-use-case-discovery.md scene 3](./00-use-case-discovery.md))
2. **Spatial preposition + region** ("גשם בצפון", "in the north") → `graphic_map` (+ optional `broll` underlay).
3. **Bare adjective / sensory phrase** ("rainy", "כבד", "windy") → `broll`.
4. **Single explicit number with unit** ("24 degrees", "1.5 מטר") → `lower_third` overlaid on `broll`. If grouped with ≥2 more such numbers → fold into `graphic_table` instead.
5. **Person name + role** ("שר התחבורה אמר") → `lower_third` (attribution) + `broll` or `title_card`. Per R0 honesty constraint, **never auto-pick a face**; default to clean broll.
6. **Time-series phrase** ("השבוע", "over the week", "ב-7 הימים האחרונים") with numeric trend → `graphic_chart`.
7. **Greeting / sign-off** ("שלום", "זה הכל מאיתנו") → `title_card`.
8. **Phrase scoring 0 broll matches above threshold** → `generated_clip` (asset-router fallback).

### Hebrew transcript → treatment worked examples

| HE phrase | Treatment(s) | Notes |
|---|---|---|
| *"טמפרטורות בערים — תל אביב 24°, חיפה 22°"* | `graphic_table` | Rule 1; rows in RTL, value column on the left of the city column under `dir="rtl"`. |
| *"גשם בצפון"* | `graphic_map` + `broll` (rain) | Rule 2 + rule 3; map underlay, broll at lower z-index or as a montage cut. |
| *"שר התחבורה אמר שהפרויקט יידחה"* | `lower_third` + `broll` | Rule 5; lower-third reads RTL ("שר התחבורה · מירי רגב"); broll is policy-safe (highway, not the minister's face). |

## Implications for keyword-extractor-voiceover

- **Locked enum** (paste-ready for R2): `visual_treatment ∈ { "broll", "broll_montage", "graphic_table", "graphic_map", "graphic_chart", "lower_third", "title_card", "generated_clip" }`.
- **Default template stack:** Remotion React for all 6 non-broll graphic treatments; SVG-rasterised fallback per the table above; asset-router MCP for `generated_clip`.
- **Trigger heuristics block for R3:** the 8 rules above ship verbatim into the system prompt as a numbered list, paired with the 3 HE worked examples in the few-shot bank.
- **Files R7 will scaffold:** `templates/graphic_table.tsx`, `templates/graphic_map.tsx`, `templates/graphic_chart.tsx`, `templates/lower_third.tsx`, `templates/title_card.tsx`, plus a shared `templates/_rtl.ts` helper and `Root.tsx` registering one `<Composition>` per template at 1080×1920 @ 30 fps.
- **R6 inherits:** the renderer composes Remotion `<Sequence>`s for graphics with `<Video>` for broll on one master 1080×1920 timeline, master audio = voiceover WAV.

## Open questions

- Does Mapbox's "news maps for web and print" exception cover daily Reels, or do we need the commercial-application licence ($)? Maptiler / OSM as a tested backup before MVP.
- Hebrew variable-font availability in Remotion's headless Chromium — does Heebo/Rubik load reliably, or do we need to bundle WOFF2s? (R7.)
- For `graphic_map` animated mode, does Mapbox GL render reliably under `renderFrames()` headless, or does WebGL context-loss bite at 30 fps for ≥6 s? Spike needed in R7.
- Should `lower_third` be its own scene or always an overlay on a parent `broll` scene? Decision affects R2 schema (does a scene have one treatment or a stack?).
- `generated_clip` cost ceiling — Luma Ray2 is ~$0.40/5 s ([knowledge/13-asset-pipelines.md §13.4](../../knowledge/13-asset-pipelines.md)); R5 to confirm budget fits ~5 voiceovers/day.

## Sources

- `research/keyword-extractor-voiceover/00-use-case-discovery.md` — persona, 7-scene HE worked example, treatment mix.
- `research/keyword-extractor-voiceover/00b-prior-art-competitor-scan.md` — confirms no surveyed tool generates structured graphics on a mixed timeline.
- `research/keyword-extractor-voiceover/HANDOFF.md` §3, §5 — scene-first model; Remotion now leads for graphic-scene authoring.
- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` §5 — vertical canvas defaults (1080×1920, 30 fps, H.264/AAC).
- `knowledge/05-graphics-design.md` §5.6, §5.7 — typography (variable fonts, tabular-nums) and oklch palette.
- `knowledge/08-dataviz.md` §8.1, §8.3 — Recharts for `graphic_chart`; library matrix.
- `knowledge/12-shaders-webgpu.md` §12.1 — out-of-scope here; flagged for future motion-heavy graphics.
- `knowledge/13-asset-pipelines.md` §13.1, §13.2, §13.4 — asset-router for `generated_clip`; Luma/Runway costs.
- [Remotion docs — Composition fundamentals](https://www.remotion.dev/docs/the-fundamentals)
- [Remotion CLI — render](https://www.remotion.dev/docs/cli/render)
- [Remotion — renderFrames()](https://www.remotion.dev/docs/renderer/render-frames)
- [Claude + Remotion agent skill (May 2026)](https://dev.to/mayu2008/new-clauderemotion-to-create-amazing-videos-using-ai-37bp)
- [Mapbox Static Images API docs](https://docs.mapbox.com/api/maps/static-images/)
- [Mapbox — using static maps for news](https://www.mapbox.com/blog/using-static-maps)
- [Mapbox Terms of Service](https://www.mapbox.com/legal/tos)
- [Mapbox pricing](https://www.mapbox.com/pricing)
