---
description: |
  Final upload package: thumbnail, title, shorts, metadata, checklist.
  Destructive — writes to workspace/exports and workspace/publishing.
  User-only invocation. Never auto-trigger.
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Task, Skill
---

# Ship Episode: $ARGUMENTS

## Pre-flight check

Verify all of:

- `workspace/video-projects/$ARGUMENTS/script.md` exists and is finalised.
- `workspace/exports/$ARGUMENTS/$ARGUMENTS-video.mp4` exists.
- `helpers/loudness.py` reports the audio is within ±1 dB of −14 LUFS
  (Hard Rule 8). Run it on the video's audio track.
- The full quality-gate sequence (`skills/music-studio/references/quality-gates.md`)
  passes.

If any pre-flight check fails, halt and report. Do not proceed.

## Step 1 — Thumbnails

Invoke `music-studio:thumbnail-packager`. Generate 3 variants in
parallel, run blind reviewer (`agents/reviewer.md`), present picks.
Wait for user selection.

## Step 2 — Titles

Invoke `music-studio:title-packager`. Generate 5 A/B variants tied to
the chosen thumbnail.

## Step 3 — Shorts

Invoke `music-studio:shorts-producer`. Cut 2–4 vertical clips. Each
must start with sound or surprise (Hard Rule 1). Render via
`helpers/render.py --vertical` — the helper enforces the 30 ms
audio-fade discipline (Hard Rule 7) and the canonical filename via
`hooks/validate-export-name.js` (Hard Rule 10).

## Step 4 — Metadata

Invoke `music-studio:youtube-metadata`. Description, tags, hashtags,
chapters, pinned comment, playlist suggestion.

## Step 5 — Confirmation

Show the full upload package in plain English:

- Selected title (with case).
- Selected thumbnail (path).
- Shorts list.
- Description preview (first 150 chars).

**Wait for "ship it" from the user.**

## Step 6 — Publish operator

Once confirmed, invoke `music-studio:publish-operator`. This freezes
files into `workspace/publishing/$ARGUMENTS/` with the canonical
naming and writes the manual upload checklist using
`templates/publish-checklist-template.md`.

Append session entry to `project.md` with stage = "published".
