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
- `workspace/video-projects/$ARGUMENTS/script.md` exists and is finalized.
- `workspace/exports/$ARGUMENTS/final-video.mp4` exists.
- The full quality-gate sequence passes (see
  `skills/music-studio/references/quality-gates.md`).
- (Hard Rule 8) Audio mastered to within ±1 dB of −14 LUFS. The
  `helpers/loudness.py` helper that verifies this is part of the post-
  day-one expansion path; until it ships, manually verify in your DAW
  meter and record the value here.

If any pre-flight check fails, halt and report. Do not proceed.

## Step 1 — Thumbnails

Invoke `music-studio:thumbnail-packager`. Generate 3 variants in parallel,
run blind reviewer (`agents/reviewer.md`), present picks. Wait for user
selection.

## Step 2 — Titles

Invoke `music-studio:title-packager`. Generate 5 A/B variants tied to
the chosen thumbnail.

## Step 3 — Shorts

(`shorts-producer` skill is not yet shipped on day one. Skip with a
note to the user; cut shorts manually until the skill ships.)

## Step 4 — Metadata

(`youtube-metadata` skill is not yet shipped on day one. Skip with a
note to the user; write description, tags, chapters, pinned comment
manually using `templates/episode-brief.md` as a reminder of the shape.)

## Step 5 — Confirmation

Show the full upload package in plain English:
- Selected title (with case).
- Selected thumbnail (path).
- Manual checklist items still owed (shorts, metadata).

**Wait for "ship it" from the user.**

## Step 6 — Freeze

(The `publish-operator` skill is not yet shipped on day one. Until it
ships, manually:
1. Verify all Hard Rules pass.
2. Move files from `workspace/exports/$ARGUMENTS/` to
   `workspace/publishing/$ARGUMENTS/` with the canonical naming
   `<NNN>-<slug>-{video|short-N|thumb-N|audio}.<ext>` — enforced by
   `hooks/validate-export-name.js`.
3. Write `workspace/publishing/$ARGUMENTS/upload-checklist.md` with the
   step-by-step manual upload sequence (visibility, schedule,
   end-screen, cards).
4. Append to `project.md` with the publish timestamp and stage =
   "published".)

Append session entry to `project.md` with stage = "published".
