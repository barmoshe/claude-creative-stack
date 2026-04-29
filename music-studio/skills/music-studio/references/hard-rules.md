# Hard Rules

These are the things where deviation produces silent failures, channel
drift, or broken output. They are not taste. They are correctness.

## Doctrine

1. **Sell the musical result first**, the AI workflow second. Title and
   thumbnail must lead with sound or surprise, not with "I used Claude".

2. **Every episode ends with sound**, not only code. The final demo is
   non-optional.

3. **Every thumbnail must be readable on a 350px-wide phone preview**
   before it ships. If the headline is not readable in one second at
   that size, the thumbnail fails.

## Memory and state

4. **Per-project memory in `project.md`.** Append every session. Read
   on startup. Never overwrite. Each `workspace/playground/<slug>/` and
   `workspace/video-projects/<slug>/` has exactly one.

5. **Cache transcripts per source.** Never re-transcribe an unchanged
   file. Caches live in
   `workspace/video-projects/<slug>/transcripts/<source>.json`.

## Audio production

6. **Word-level verbatim ASR only** for screen-recording captions.
   Never phrase-mode (loses sub-second gap data).

7. **Audio fades at every cut boundary** (30ms in, 30ms out). Otherwise
   audible pops. Enforced by `helpers/render.py`.

8. **Master final audio to −14 LUFS integrated** for YouTube delivery.
   Peak ceiling −1.0 dBTP. Verified by `helpers/loudness.py`.

## Workspace hygiene

9. **Builds live in `workspace/playground/`. Episodes about builds
   live in `workspace/video-projects/`.** Never mix.

10. **Final exports only go in `workspace/exports/<NNN>-<slug>/`.** No
    working files. Naming convention enforced by
    `hooks/validate-export-name.js`.

## Workflow

11. **Strategy confirmation before publishing.** Never run
    `/ship-episode` until the user has approved the title + thumbnail
    in plain English.

12. **Parallel sub-agents for parallel work** (research, animation
    slots, thumbnail variants). Never sequential when independence is
    obvious.

## Status

Everything else in this repo is a worked example. Deviate when the
material calls for it.
