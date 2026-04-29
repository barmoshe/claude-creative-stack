---
name: edit-director
description: |
  Produces edit notes for the episode. Use whenever the user asks "where
  to cut", "what to zoom on", "where to add captions". Reads the script
  and the packed transcript. Rule: viewer hears or sees something cool
  in the first 5–10 seconds.
allowed-tools: Read, Write, Bash
model: claude-sonnet-4-6
---

# Edit Director

## Inputs

- `workspace/video-projects/<slug>/script.md` (from `script-writer`).
- `workspace/video-projects/<slug>/takes_packed.md` (from `pack_takes.py`).
- Optional: `helpers/timeline_view.py` output for ambiguous moments
  (call only at decision points — Spec 04 §12.4).
- `channel-brain/editing-style.md` for pacing rules.

## Process

1. **Read script and packed transcript side by side.** Map script
   beats onto take timestamps. Mark where the script needs takes that
   don't exist; surface those gaps to the user.
2. **Mark cut candidates** at silence gaps ≥ 400 ms aligned with script
   beats. See `references/cut-craft.md`.
3. **For ambiguous moments**, call `helpers/timeline_view.py <video>
   <start> <end>` to inspect the filmstrip + waveform. Do NOT call it
   in batch — only at the decision point.
4. **Note where to zoom.** UI close-ups during builds; code highlights
   during prompt walkthroughs.
5. **Mark caption insertion points** every 60–90 seconds for retention.
   See `references/caption-rhythm.md`.
6. **Mark sound-demo placement** and required loudness behavior:
   voiceover ducks, demo plays uninterrupted in the final segment.

## Outputs

`workspace/video-projects/<slug>/edit-notes.md` with timestamped edit
decisions. Suggested shape:

```markdown
# Edit notes — <slug>

## Source map

- `take-01.mp4` → script beats `00:00`–`02:30`
- `take-02.mp4` → script beats `02:30`–`05:10`

## Cuts

| Script time | Take | Take time | Decision |
|---|---|---|---|
| 00:00 | take-01 | 00:12.40 | hard cut to demo loop |
| 00:08 | take-01 | 02:14.10 | cut on silence (520 ms gap) |

## Zooms

- `00:32`–`00:38` — zoom to sequencer grid, focus on cell row 3.
- `01:45`–`01:55` — code highlight: Tone.js scheduler block.

## Captions

- `01:00` — burned-in caption "the kick is on the off-beat".

## Final demo

- `04:30`–`05:30` — demo plays uninterrupted; VO ducks at `04:35`.

## Gaps to fill

- Need a re-take of the autoplay-gating moment (script beat `02:15`).
```

## Hard Rules (skill-specific)

- **Cut only on silence ≥ 400 ms** unless the cut is intentional jump-cut
  comedy.
- **Captions every 60–90 seconds** for sound-off retention.
- **The first 5–10 seconds must contain sound or visual surprise**
  (Hard Rule 1) — verify the cold open's edit notes deliver this.
- **30 ms audio fades at every cut boundary** (Hard Rule 7) — these
  are enforced by `helpers/render.py`, but the edit notes must not
  request cuts that fight the rule (e.g. mid-vowel cuts that need a
  longer crossfade).

## References

- `references/cut-craft.md` — silence gaps, padding, audio-first reasoning.
- `references/caption-rhythm.md` — when to caption, when to not.
- `@../../channel-brain/editing-style.md`

## Anti-patterns

- Frame-dumping the entire video into context. Use `takes_packed.md` as
  the primary reading view; `timeline_view.py` only at ambiguity.
- Crossfades when a hard cut works.
- Captions every line — kills retention as much as none.
- Cuts that produce mid-vowel splices.
- Treating the final demo segment as another b-roll opportunity.
