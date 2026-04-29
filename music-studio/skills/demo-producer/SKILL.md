---
name: demo-producer
description: |
  Designs the final musical demo. Use whenever the user asks "what should
  I play at the end", "what's the demo idea", or the episode is approaching
  the final-demo stage. The episode must end with sound that proves the
  tool works (Hard Rule 2).
allowed-tools: Read, Write
model: claude-sonnet-4-6
---

# Demo Producer

## Inputs

- The build's actual feature set (from `build-notes.md`).
- The channel's sound identity (`channel-brain/sound-identity.md`).
- The viewer promise.

## Process

1. **Pick a target genre/aesthetic** consistent with `sound-identity.md`
   (techno, ambient, lo-fi, glitch, IDM by default).
2. **Pick a demo archetype** from `references/demo-archetypes.md`:
   - The Drop
   - The Loop Showcase
   - The Solo
   - The Before/After
3. **Specify structure.** Bar count for intro / main / outro. Total
   length 30–90 seconds — long enough to land, short enough to retain.
4. **Specify which features the demo exercises.** Every advertised
   feature in the title or thumbnail must be heard at least once.
5. **List the wow moment.** The single sound or pattern that justifies
   the title.
6. **Specify the audio target:** tempo, key, length, LUFS target
   (−14 LUFS integrated for stream delivery — Hard Rule 8).

## Outputs

`workspace/video-projects/<slug>/demo-plan.md`. Suggested shape:

```markdown
# Demo plan — <slug>

**Archetype:** The Drop
**Genre:** Techno
**Tempo:** 128 BPM
**Key:** A minor
**Length:** 48 bars (~90 s)
**LUFS target:** −14 integrated, −1.0 dBTP

## Structure

| Bars | Section | What's playing | Features exercised |
|---|---|---|---|
| 1–8 | Intro | Kick + hat | Pattern engine |
| 9–16 | Build | + bass, filter sweep | Filter automation |
| 17–32 | Main | Full pattern | Polyrhythm engine |
| 33–40 | Break | Pads, reverb tail | FX chain |
| 41–48 | Outro | Kick out, decay | Master limiter |

## Wow moment

Bar 17 — when the polyrhythm engine drops in and the kick stops being
on-grid. This is the bar that justifies the title.

## Recording plan

- Render to 48 kHz 24-bit WAV first.
- Master pass via `helpers/loudness.py` (Phase B) and the audio-engineer
  skill's mastering chain.
- Mux into the final cut at the export step.
```

## Hard Rules (skill-specific)

- **Every advertised feature must be heard at least once.** A feature
  in the title that the viewer can't hear is a broken promise.
- **The wow moment must be identified explicitly.** "and then I play
  around with it" doesn't count.
- **−14 LUFS integrated** delivery target (Hard Rule 8).
- **No music-library backing tracks** — the build is the demo.

## References

- `references/demo-archetypes.md`
- `@../../channel-brain/sound-identity.md`

## Anti-patterns

- Demos that demonstrate features the build doesn't have.
- Demos that show off code while the music plays — final demo is sound-
  forward, not visual-forward (the visual is the build's UI doing its
  thing).
- Demos that use a backing track to mask the build's quietness. If the
  build can't carry 30 seconds of solo audio, the build isn't done.
- Demos longer than 90 seconds. Retention falls off a cliff.
