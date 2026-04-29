---
name: shorts-producer
description: |
  Cuts 2–4 vertical clips from the episode for YouTube Shorts, TikTok,
  Reels. Use whenever the user asks for shorts, vertical clips, or "find
  some shorts moments". Each clip must start with sound or weird result,
  never explanation.
allowed-tools: Read, Write, Bash
model: claude-sonnet-4-6
---

# Shorts Producer

## Inputs

- `workspace/video-projects/<slug>/script.md`
- `workspace/video-projects/<slug>/edit-notes.md`
- `workspace/exports/<slug>/<slug>-video.mp4` or
  `workspace/exports/<slug>/preview.mp4`

## Process

1. **Identify candidate moments.** Read script + edit-notes. Look for:
   - The final-demo drop (always a short candidate).
   - A bug-to-payoff sequence.
   - A weird visual (the build doing something unexpected).
   - A satisfying before/after pair.
2. **For each candidate, define:**
   - The 2-second hook (sound or visual surprise — never explanation).
   - The 30–60 second body.
   - The CTA back to the full video (one line, last 2 seconds).
3. **Generate the cut spec** for `helpers/render.py --vertical`:
   - Start/end timestamps in the source.
   - Caption text optimised for sound-off viewing (every line readable
     in 2 s).
   - Vertical framing target: subject in centre 60% of the frame.
4. **Render via `helpers/render.py`:**

```bash
helpers/render.py --edl <short-N.edl.json> --vertical \
  -o workspace/exports/<slug>/<slug>-short-<N>.mp4
```

Naming convention enforced by `hooks/validate-export-name.js`.

## Outputs

- One spec per short at `workspace/video-projects/<slug>/shorts/short-<N>.md`.
- Rendered MP4s at `workspace/exports/<slug>/<slug>-short-<N>.mp4`.

Each spec uses `templates/shorts-template.md` as its shape.

## Hard Rules (skill-specific)

- **First 2 seconds = sound or surprise**, never explanation (Hard Rule
  1 applied to short form).
- **Captions ARE the audio** — half the audience watches with sound off.
  Caption every line.
- **Maximum 60 seconds.** Above that the algorithm down-weights.
- **One core idea per short.** A short that "shows three features" is
  three shorts.

## References

- `templates/shorts-template.md` — the spec shape.

## Anti-patterns

- A short that opens with the creator talking. Always sound or visual
  first.
- A short that's a 60-second highlight reel of the episode. That's a
  trailer, not a short.
- A short that requires audio to make sense. Sound-off must work.
- A short rendered in 16:9 then padded to vertical. Re-frame and crop;
  pad bars look amateur.
