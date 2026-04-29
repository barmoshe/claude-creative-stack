# Sound identity

## Master targets (Hard Rule 8)

- **Integrated loudness:** −14 LUFS (YouTube delivery).
- **True peak:** ≤ −1.0 dBTP.
- **Verified by:** `helpers/loudness.py` (Phase B).

If a demo can't hit −14 LUFS without distortion, it's too dynamic for streaming — fix at compose time, not in mastering.

## Signature timbres

- **Kicks:** short, transient-forward; 60–80 Hz body; punchy, not boomy.
- **Snares/claps:** bright but not piercing; 2–4 kHz emphasis with a hint of room.
- **Hats:** shorter than instinct says. 30–60 ms decay max for closed hats.
- **Synths:** warm low-pass on most patches; heavy filter modulation is a feature, not a flaw.
- **Bass:** mono below 120 Hz. Always.

## Preferred genres / aesthetics

(Adjust to creator. Keeping this list short helps `demo-producer` lean into the channel's signature.)

- Techno (driving, melodic, or industrial)
- Lo-fi / chill (with grit, not generic)
- IDM and glitch (when the build's UI invites it)
- Ambient (for gentler builds — granular, drones)

## Demo archetypes

`demo-producer` selects from these. Each is the shape of the final episode demo.

- **The Drop** — 8 bars buildup → 16 bars main loop → 4 bars resolve. For builds with energy.
- **The Loop Showcase** — 4 bars per feature, smash-cut between, no breakdown. For builds with several features.
- **The Solo** — one continuous take, the build playing itself. For builds whose magic is in the autonomous behavior.
- **The Before/After** — boring 4-bar baseline → 16-bar transformation. For builds whose value is the contrast.

## Channel-wide audio rules

- No "boop" SFX over voiceover. Trust the cut.
- No music-library library cues — feels generic.
- Demos export as 48 kHz 24-bit WAV first; MP4 mux at the very end.

## Fill-in

> Add the creator's specific reference tracks, mastering chain notes, signature plugin presets, the synth they keep coming back to.
