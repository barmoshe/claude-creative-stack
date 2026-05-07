# R0 — Use-Case Discovery

> Status: draft
> Owner: Wave-1 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

The pipeline targets one human: a friend in an Israeli newsroom cutting a daily ~2-min weather voiceover into a 9:16 Reel. Defaults are locked in `PRE-RESEARCH.md` §5; what is *not* locked is their workflow — which NLE, which paid stock libraries, how graphic scenes (temperature tables, maps) are built today, what hand-off shape the editor wants, and who signs off. This report ships two artefacts the next agents need: a 14-question interview script, and a fictional-but-realistic persona ("Noa Ben-Ari") that R2 (schema), R6 (renderer), R8 (guardrails) can use as a stand-in if the interview never happens. No defaults are picked — only options and consequences. R9 picks. The persona's worked HE weather segment produces 7 scenes mixing `broll`, `graphic_table`, `graphic_map`, `lower_third`, `title_card` — the exact treatment mix the R2 enum must cover.

## Scope & questions

Per `PLAN.md` §3, R0 is Wave-1 synthesis-only — no web search. It produces (a) an interview script for the user to forward, and (b) a persona for downstream stand-in answers. Out of scope: picking an NLE, stock vendor, or hand-off format. In scope: the *questions* that pin those picks, plus a worked HE example that exercises the scene-first model in `HANDOFF.md` §5.

## Findings (interview script + persona)

### Interview script (14 questions)

1. Walk me through cutting today's weather Reel end-to-end — minutes from WAV to publish?
2. Which NLE — Premiere, DaVinci, Final Cut, CapCut, Adobe Express, in-house?
3. Where does B-roll live — NAS, Dropbox, stock account? Folder shape (`weather/rain/heavy/…`)?
4. Which paid stock libraries — Storyblocks, Artgrid, Envato, Getty, in-house archive — or only free Pexels/Pixabay?
5. Bilingual reality: does one voiceover ever mix HE + EN? E.g. *"היום גשם ב-Tel Aviv"* — brand names, foreign cities, English celeb names inside HE sentences?
6. What would *break trust*? E.g. "if a public-figure name appears, never auto-pick a face — flag for human"; "never substitute one city's skyline for another's".
7. How do you judge a Reel as "good" today — VTR, gut, producer checklist? Strongest signal only.
8. Beyond weather, which scene types — sports scores, traffic, breaking-news headlines, quote cards, market tickers, election results?
9. How is today's temperature table for cities (תל אביב 24°/17°, חיפה 22°/16°, ירושלים 20°/14°) built — AE template, Vizrt/Chyron/Avid Maestro, hand-fed PNG, native NLE titles?
10. Same for weather maps — animated AE, broadcast graphics, or still PNG with overlay?
11. Vertical-master vs horizontal-master: separate pass, or auto-reframe? Time delta?
12. Hand-off format — finished MP4, FCPXML / Premiere XML, EDL JSON, or folder of timestamped clips?
13. Approval chain — producer, legal, editor-in-chief? Turnaround?
14. RTL behaviour: HE timeline reads RTL, or only the *text* RTL while timeline stays LTR?

(Register borrowed from `skills/viral-news-scanner/SKILL.md` "Honesty constraints" — every question maps to a guardrail R8 will codify.)

### Persona — "Noa Ben-Ari" (1-page stand-in)

- **Role.** Digital social-cuts editor at a national Israeli broadcaster (N12 / Kan / Walla blend). 6 yrs; came from print, learned Premiere on the job.
- **Day.** Meteorologist records voiceover ~14:00. Noa gets WAV + rough script at 14:30. Reel must be live on Instagram + TikTok by 16:00 — ~90 min, often less.
- **Stack.** Premiere Pro 2026 + paid Storyblocks Business seat + in-house NAS of weather B-roll going back 4 yrs, foldered `weather/<condition>/<city>/`. Temperature tables = After Effects template driven by an Excel essential-graphics binding.
- **Worked HE example — 7 scenes from a 110 s voiceover:**
  1. *"שלום, הנה תחזית מזג האוויר להיום"* → `title_card` ("תחזית · 7 במאי")
  2. *"היום צפוי גשם כבד — קחו מטריות"* → `broll` (rain on windshield, 9:16)
  3. *"להלן הטמפרטורות בערים: תל אביב 24°/17°, חיפה 22°/16°, ירושלים 20°/14°, באר שבע 26°/15°, אילת 31°/22°"* → `graphic_table` (5 rows, ~18 s)
  4. *"מערכת ברקים מתקרבת מצפון-מערב"* → `graphic_map` (Israel outline + animated front)
  5. *"גלים של 1.5 מטר בחוף תל אביב"* → `broll` (Mediterranean waves, vertical drone)
  6. *"מחר — ירידה בטמפרטורות, ללא גשם"* → `lower_third` over `broll_montage` of clouds
  7. *"זה הכל מאיתנו, יום נעים"* → `title_card` (sign-off)
- **3 things that earn adoption.** (1) Halves the 90-min turnaround without breaking trust; (2) temperature table comes out *correct* — wrong numbers worse than wrong B-roll; (3) FCPXML hand-off she opens in Premiere, not a black-box MP4.
- **3 things that lose her forever.** (1) Wrong face appears against voiceover; (2) clip licence un-traceable to a paid source; (3) auto-reframe crops action out of the 1080-wide column.

Persona shape mirrors `research/biome-beats/HANDOFF.md` §1's "60-second briefing" pattern.

## Implications for keyword-extractor-voiceover

- **Scene enum (R2).** Worked example produces `title_card`, `broll`, `graphic_table`, `graphic_map`, `lower_third`, `broll_montage` — all already in `HANDOFF.md` §5. No new treatments surfaced.
- **Hand-off (R6).** Two plausible shapes — finished MP4 vs FCPXML. Persona prefers FCPXML; `PRE-RESEARCH.md` §5 default is MP4 with FCPXML on a flag. R6 keeps the flag.
- **Guardrails (R8).** "Never auto-pick a face" and "wrong number worse than wrong B-roll" feed the R8 checklist — both echo `viral-news-scanner` honesty constraints.
- **Bilingual rule (R3).** Persona confirms HE+EN mixing; R3 few-shots must include one such sentence.
- **Cost ceiling (R5).** ~5 voiceovers/day × ~7 scenes × ~3 candidates per `broll` scene ≈ 70 evals/day. R5 sizes against this, not an inflated estimate.

## Open questions (for the friend / for the user)

- Does the friend's newsroom actually have Storyblocks, or is the persona's assumption wrong? (R4.)
- Temperature-table source-of-truth: Excel, IMS JSON feed, or hand-typed? (R-graphics + R8 wrong-number guardrail.)
- Is there a producer/legal sign-off step the tool should pause for? (R8.)
- RTL timeline preference — text-only, or full-mirror? (R7 artifact phase.)
- Weather-only, or weather as a wedge into sports/traffic/headlines? (R2 enum scope.)

## Sources

- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` — locked scope, defaults §5, scene enum §6 patch.
- `research/keyword-extractor-voiceover/PLAN.md` §2 — output-model decision (scene-first, mixed treatments).
- `research/keyword-extractor-voiceover/HANDOFF.md` §1, §3, §5 — 60-second briefing, locked defaults, scene-first schema.
- `skills/viral-news-scanner/SKILL.md` — newsroom honesty constraints; Israeli-portal landscape; closed-list category discipline.
- `research/biome-beats/HANDOFF.md` §1 — persona-style "60-second briefing" pattern reused for "Noa Ben-Ari".
- `CLAUDE.md` — repo routing; 9:16 vertical default; HE-primary defaults.
