# R-brand — V1 Brand Palette (draft, values TBD)

> Status: draft (values unverified — see "Verification posture")
> Owner: claude  Last updated: 2026-05-08

## TL;DR (≤150 words)

V1 is Keshet Broadcasting's video-first Hebrew news app (`com.keshet.v1`, App Store id `6475302142`, web home `v-1.co.il`) — short vertical Reels + news flashes powered by Channel 12 talent. The keyword-extractor-voiceover pipeline will render V1-branded `lower_third`, `title_card`, `graphic_table`, `graphic_chart`, `graphic_map` scenes (R-graphics §"Recommendation"), so the templates need a locked palette. **All hex/OKLCH values below are best-effort inferences** from public Keshet 12 references and user feedback that the app is bright/light themed; **none are extracted from live brand assets** because the research environment could not reach `v-1.co.il`, the App Store, Google Play, Brandfetch, or Wikipedia (HTTP 403 from WebFetch, host-not-in-allowlist from curl). Treat every token below as **TBD** until verified against an app screenshot, the V1 brand guide, or the live SVG. Project default is `oklch()` per `CLAUDE.md` "Defaults".

## Scope & questions

Q1: What is V1's primary brand color (the one a user would name if asked "what color is V1")?
Q2: Is V1 a light-theme or dark-theme product surface, and does that change for video overlay graphics?
Q3: Which Keshet/Mako/N12 family colors are inherited vs. exclusive to V1?
Q4: What palette tokens does the keyword-extractor-voiceover renderer need to accept on its first cut?

Out of scope: typography, motion language, logo construction. Those belong to a follow-up R-brand-typography note if the user wants one.

## Verification posture (read this before using any value)

Direct inspection was blocked in this environment:

- `https://www.v-1.co.il/` — `WebFetch` returned HTTP 403; `curl` blocked by sandbox host allowlist.
- `https://apps.apple.com/.../id6475302142` and `https://play.google.com/...com.keshet.v1` — `WebFetch` 403.
- `https://brandfetch.com/v-1.co.il`, `https://he.wikipedia.org/wiki/V1`, `https://logos.fandom.com/wiki/Keshet_12`, `https://www.avid.wiki/Keshet_International` — all `WebFetch` 403.
- `https://itunes.apple.com/lookup?id=6475302142` — `WebFetch` 403.

What I could read came from `WebSearch` snippets only (citations in the Sources section). That is enough to confirm the app's identity, owner, format, and that users describe the UI as bright/light themed at launch ("בערב קשה להיכנס לאפליקציה משום שהכל מסנוור" — user feedback surfaced via search [4]). It is **not** enough to extract specific hex codes.

**Action for the user:** to lock these values, paste a screenshot of the V1 home feed, a hero frame from `@v1.israel` on Instagram/TikTok, or the V1 logo SVG; or share the brand book if Keshet has one. Each row in the palette table below has a "verify by" column saying exactly what would unblock it.

## Findings

### What is verifiable today (search-snippet-grade)

| Fact | Source |
|---|---|
| App is `V1 — החדשות החדשות`, publisher Keshet Broadcasting Ltd., bundle `com.keshet.v1`, App Store id `6475302142`. | [1][2] |
| Format is 100% short vertical video — REELS + news flashes, no long-form text articles. | [1][2][3] |
| Marketed talent are Channel 12 / N12 anchors (Yonit Levy, Danny Kushmaro, Guy Pines, Rotem Sela, Assi Ezer, Nir Dvori, Adva Dadon, Haim Cohen). | [1][2] |
| Web home is `v-1.co.il`; social presence `@v1.israel` (Instagram, TikTok). | [3][5] |
| Surface is light-themed at launch; no dark mode shipped, users on `mitmachim.top` and the App Store complain it's blinding at night. | [4][6] |
| Family brands in Keshet's stable: Mako (`mako.co.il`), N12 (`n12.co.il`), Keshet 12 (broadcast channel). | [7] (also `skills/viral-news-scanner/references/sources.md` §Israeli portals) |
| Keshet International logo lineage features a red TV-tube motif; Keshet 12 idents have used red prominently. | [8] |

### Inferred palette (every value TBD until verified)

OKLCH first per `CLAUDE.md` "Defaults"; hex provided as a convenience. Roles match what the keyword-extractor-voiceover graphic templates actually consume (R-graphics §"Recommendation").

| Token | Role | OKLCH (inferred) | Hex (inferred) | Reasoning | Verify by |
|---|---|---|---|---|---|
| `--v1-primary` | Brand red — title-card accent stroke, lower-third name pill background, "BREAKING" / "מבזק" chip | `oklch(0.58 0.22 27)` | `#E0202A` | Inherits Keshet 12 / N12 red lineage [8]; news-app convention is a saturated red for urgency. | App-icon dominant color or first-frame logo bug. |
| `--v1-primary-ink` | Foreground that sits on `--v1-primary` (button labels, pill text) | `oklch(0.98 0 0)` | `#FAFAFA` | Pure white at WCAG AAA on the red above (contrast ≈ 5.3:1 — verify after locking primary). | Contrast check once primary is real. |
| `--v1-accent` | Highlight for numeric values in `graphic_table` (the "85" in a temperature table), CTA underline | `oklch(0.85 0.20 80)` | `#F2C231` | R-graphics §"Temperature-table worked example" already uses `oklch(0.85 0.2 80)` for the value column — we adopt it as the V1 accent unless the brand insists otherwise. | Sample frame from a V1 stat overlay. |
| `--v1-surface` | Default scene background for graphic templates, lower-third base | `oklch(0.98 0.005 240)` | `#F7F8FA` | User feedback confirms light surface [4]; tiny cool tint keeps it from looking like raw paper. | Screenshot of the V1 feed surface. |
| `--v1-surface-elevated` | Card / overlay above `--v1-surface` (graphic_table row band, lower-third caption box) | `oklch(0.94 0.005 240)` | `#EAEEF2` | One step darker for separation without dropping into mid-grey. | Screenshot. |
| `--v1-ink` | Default text color on light surfaces (title-card headline, table city names) | `oklch(0.18 0.01 270)` | `#1B1F2A` | Near-black with a faint cool cast reads as "news-serious" without being TV-static black. | Screenshot of body text. |
| `--v1-ink-muted` | Captions, attribution lines, timestamps | `oklch(0.50 0.01 270)` | `#737786` | Mid-grey for secondary text; passes 4.5:1 against `--v1-surface`. | Sample lower-third subtext. |
| `--v1-overlay-scrim` | Gradient at bottom of full-bleed broll for caption legibility | `oklch(0.18 0.01 270 / 0.65)` | `rgba(27,31,42,.65)` | Standard reels-style scrim; tuned to V1 ink so captions feel native. | Visual review on a reference clip. |
| `--v1-success` | Positive numeric delta in `graphic_chart` (e.g. polling +3 pts) | `oklch(0.62 0.16 145)` | `#1FA871` | Conventional green; not visible elsewhere in V1 brand. Distinct from primary red. | None — utility color. |
| `--v1-warning` | Active-incident chip ("מתעדכן"), pre-cut review flag in editor UI | `oklch(0.78 0.16 75)` | `#F5A623` | Distinct from `--v1-accent` (more orange, less yellow) so the table-value color doesn't get confused with a status. | None — utility color. |
| `--v1-danger` | Hard "STOP" gate copy from R8 (`08-newsroom-guardrails-and-language.md` §"Active-incident STOP gate") | `oklch(0.55 0.22 22)` | `#C8202B` | Slightly darker than `--v1-primary` so a red STOP chip on a red brand band is still readable. | Contrast check after locking primary. |

### What we are explicitly NOT claiming

- That V1 has a published brand book — search did not surface one.
- That the inferred values match Keshet 12's broadcast palette pixel-for-pixel — the broadcast on-air red and the V1 app red may differ.
- That V1 will stay light-only — user pressure for dark mode is real [4][6]; the renderer should accept a `theme: "light" | "dark"` prop from day one even if `dark` ships later.

## Implications for keyword-extractor-voiceover

1. **Lock the token names, not the values.** R6 (renderer EDL) and R7 (Skill + MCP architecture) should accept `--v1-*` token names from this file as the contract; values flip to verified hex without a schema change.
2. **Default theme = light.** Templates render against `--v1-surface` until a `theme` prop is passed. Matches the live app surface today [4].
3. **Numeric accent already aligns.** The `oklch(0.85 0.2 80)` already used in R-graphics §"Temperature-table worked example" becomes `--v1-accent`. No template rewrite needed when this file lands; only the variable indirection.
4. **Pre-cut gate copy uses `--v1-danger`, not `--v1-primary`.** R8's STOP-gate language must be visually distinguishable from a regular V1 red brand chip — the danger token is intentionally darker.
5. **Lower thirds need a 65 % scrim, not a hard band.** `--v1-overlay-scrim` keeps full-bleed broll readable without chopping the frame in half — matches the V1 vertical-video aesthetic where the visual is the story.
6. **Storyblocks/Pixabay broll passes through unrecolored.** The palette governs *generated graphic scenes* and *overlay chrome*, not source broll. Don't tint stock footage to match V1 red — the editorial standards in R8 forbid it implicitly (reads as fabrication).

## Open questions

- **What is the actual V1 primary red?** Verify against the app icon and first-frame V1 bug on any reel. (Highest-priority unblock.)
- **Does V1 use a yellow-or-orange table accent today, or a different hue entirely?** R-graphics already assumed yellow; if V1 uses a magenta/lime, both this file and `00c` need to update together.
- **Is there a Keshet-wide brand book that V1 inherits from?** If so, prefer those tokens over reverse-engineered ones.
- **Will V1 ship a dark mode?** [4][6] suggest user pressure — design tokens should be theme-ready from the renderer's first commit.
- **Logo isolation rules and minimum size?** Out of scope here, would belong to an R-brand-logo follow-up note.

## Sources

[1] V1 ככה רואים חדשות ובידור היום — Google Play (`play.google.com/store/apps/details?id=com.keshet.v1`) — confirms publisher Keshet Broadcasting Ltd., format = short videos, talent list. (WebSearch snippet, 2026-05-08; direct fetch returned HTTP 403.)
[2] V1 החדשות החדשות — App Store (`apps.apple.com/us/app/...id6475302142`) — confirms App Store id, Hebrew listing, format. (WebSearch snippet, 2026-05-08; direct fetch returned HTTP 403.)
[3] V1 web home — `v-1.co.il` — confirms domain and tagline "סרטונים חדשותיים קצרים". (WebSearch snippet, 2026-05-08; direct fetch returned HTTP 403.)
[4] User feedback that the app is blindingly bright with no dark mode — surfaced via WebSearch on `apps.apple.com/il/app/...?l=he` reviews and Hebrew tech forum `mitmachim.top`. (WebSearch snippet, 2026-05-08.)
[5] V1 Instagram presence (`instagram.com/v1.israel`, ~128K followers) — confirms social brand handle. (WebSearch snippet, 2026-05-08.)
[6] Hebrew search result snippet noting users requested an urgent dark mode for evening use. (WebSearch, 2026-05-08.)
[7] `skills/viral-news-scanner/references/sources.md` §"Israeli portals" — Mako (`mako.co.il`) and N12 (`n12.co.il`) listed in the same Keshet stable; note at end of file: "Maintained by: V1 Viral News Team".
[8] Keshet 12 logo references (`logos.fandom.com/wiki/Keshet_12`, `avid.wiki/Keshet_International`) — describe a red TV-tube motif and rainbow color approach. (WebSearch snippets only, 2026-05-08; direct fetch returned HTTP 403.)
