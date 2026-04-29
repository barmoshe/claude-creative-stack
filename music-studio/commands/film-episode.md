---
description: |
  Stage-4 episode workflow. Transcribe footage, write the script,
  produce edit notes, design the final demo, render a preview, run
  self-eval. Use whenever footage is captured and ready to edit.
allowed-tools: Read, Write, Bash, Task, Skill, mcp__elevenlabs-scribe__*
---

# Film Episode: $ARGUMENTS

## Step 1 — Transcribe

For each video file in `workspace/video-projects/$ARGUMENTS/raw/`:

- If `transcripts/<filename>.json` exists and source mtime is older,
  skip (Hard Rule 5).
- Otherwise, call ElevenLabs Scribe via the MCP. Word-level verbatim
  only (Hard Rule 6). Cache the result.

The `helpers/transcribe.py` shim handles cache-freshness checks and
writes the cache; the actual MCP call happens here so this command
has MCP scope.

## Step 2 — Pack takes

Run `helpers/pack_takes.py --episode $ARGUMENTS`. Output:
`workspace/video-projects/$ARGUMENTS/takes_packed.md`. Phrase-level
breaks on silence ≥ 0.5 s or speaker change.

## Step 3 — Script

Invoke `music-studio:script-writer`. Inputs: viewer promise (from
`workspace/episode-ideas/$ARGUMENTS.md`), `takes_packed.md`,
`channel-brain/editing-style.md`, `channel-brain/identity.md`.

Output: `workspace/video-projects/$ARGUMENTS/script.md`.

## Step 4 — Edit notes

Invoke `music-studio:edit-director`. Inputs: `script.md`,
`takes_packed.md`.

Output: `workspace/video-projects/$ARGUMENTS/edit-notes.md`.

## Step 5 — Demo plan

Invoke `music-studio:demo-producer`. Inputs: build feature set (from
`workspace/playground/<build>/build-notes.md`),
`channel-brain/sound-identity.md`.

Output: `workspace/video-projects/$ARGUMENTS/demo-plan.md`.

## Step 6 — Preview render

Translate `edit-notes.md` into an EDL JSON:
`workspace/video-projects/$ARGUMENTS/edl.preview.json`.

Run `helpers/render.py --edl edl.preview.json --preview -o
workspace/exports/$ARGUMENTS/preview.mp4`. Per-segment extract,
concat, overlays, subtitles last (Hard Rule 1 ordering). 30 ms audio
fades at boundaries (Hard Rule 7) — applied automatically by the
helper.

## Step 7 — Self-eval (capped at 3 passes)

For each cut boundary in the preview:

1. Run `helpers/timeline_view.py preview.mp4 <t-1.5> <t+1.5>` to
   inspect ±1.5 s around the boundary.
2. Inspect for: visual jump, audio pop, hidden subtitle, misaligned
   overlay.
3. Sample first 2 s, last 2 s, and 3 mid-points for grade consistency
   and subtitle readability.
4. (When `helpers/loudness.py` ships in Phase B) Run loudness on the
   preview's audio. Confirm within ±1 dB of −14 LUFS.
5. If any check fails: fix, re-render, re-eval. Cap at 3 passes total.
6. After 3 failed passes, surface the issues to the user instead of
   looping.

## Step 8 — Update project.md

Append session entry to
`workspace/video-projects/$ARGUMENTS/project.md`. Set stage =
"package" if preview passed.

Show user the preview path and ask whether to proceed to
`/ship-episode`.
