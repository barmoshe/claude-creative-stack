# Editing style

## Pacing

- **Cold open:** 5–10 seconds. Sound or weird visual first; title card lands inside that window.
- **Build segments:** target 30–60 seconds between cuts. Anything over 90 s without a cut, zoom, or caption beat needs a reason.
- **Bug-as-feature beats:** stretch. Don't rush past the moment the thing went wrong — that's the texture viewers came for.
- **Final demo:** the music plays uninterrupted. Voiceover ducks out, comes back only at the resolution.

## B-roll discipline

- IDE shots only when the code itself is the topic. Otherwise the app's own UI is the B-roll.
- App close-ups: zoom to the part being talked about, not the whole window.
- Hand-on-keyboard / screen-reflection beauty shots: zero. The audience reads them as filler.
- Stock footage: never.

## Captions

- Burned-in captions every 60–90 seconds — keeps phone-with-sound-off viewers anchored.
- Word-level verbatim source (Hard Rule 6); editor trims to phrases, never paraphrases.
- Captions for sounds, too: `[kick on the off-beat]`, `[filter sweep]`. The audience may not have audio.

## Music bed under voiceover

- Bed level: −24 LUFS short-term, ducked under voice by 6 dB on speech detect.
- No music bed during the final demo — that audio carries itself.
- Cold-open bed transitions cleanly into the demo; no beat-clash on the cut.

## Cut craft

- Cut on silence gaps ≥ 400 ms (the `edit-director` rule).
- Audio fades 30 ms in, 30 ms out at every boundary (Hard Rule 7) — `helpers/render.py` enforces.
- Visual: prefer hard cuts. Crossfades only when visually necessary.

## Fill-in

> Add the creator's specific cuts, signature reaction inserts, recurring transitions. The skeleton above is the load-bearing rules; everything below it is taste.
