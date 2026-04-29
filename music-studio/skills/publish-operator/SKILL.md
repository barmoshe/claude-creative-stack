---
name: publish-operator
description: |
  Final publish operation. Freezes episode files, moves them to
  workspace/publishing/<slug>/, writes the upload checklist. User-only
  invocation — never auto-trigger. Use only when the user explicitly
  runs /ship-episode and confirms the title + thumbnail.
allowed-tools: Read, Write, Bash
model: claude-haiku-4-5-20251001
disable-model-invocation: true
---

# Publish Operator

## Inputs

- Approved title (from `title-packager`).
- Approved thumbnail file path (from `thumbnail-packager`).
- Finalised script at `workspace/video-projects/<slug>/script.md`.
- Finalised cut at `workspace/exports/<slug>/<slug>-video.mp4`.
- Optional: shorts at `workspace/exports/<slug>/<slug>-short-N.mp4`.
- Optional: master audio at `workspace/exports/<slug>/<slug>-audio.wav`.

## Process

1. **Verify all Hard Rules pass.**
   Run the full quality-gate sequence (see
   `skills/music-studio/references/quality-gates.md`).
2. **Verify mastering.** Run `helpers/loudness.py` on the final video's
   audio track (or on the master WAV if mux happens later). Must be
   within ±1 dB of −14 LUFS, ≤ −1.0 dBTP. If not, halt.
3. **Create publish folder** at `workspace/publishing/<slug>/`.
4. **Move files** with canonical naming (Spec 04 §7.3, enforced by
   `hooks/validate-export-name.js`):
   - `<NNN>-<slug>-video.mp4`
   - `<NNN>-<slug>-thumb.png` (the chosen variant)
   - `<NNN>-<slug>-short-N.mp4` for each short.
   - `<NNN>-<slug>-audio.wav` (the master).
5. **Write the upload checklist** at
   `workspace/publishing/<slug>/upload-checklist.md` using
   `templates/publish-checklist-template.md`.
6. **Append to `project.md`** with the publish session entry. Set
   stage = `published`.

## Outputs

- `workspace/publishing/<slug>/` populated.
- `workspace/publishing/<slug>/upload-checklist.md` written.
- `workspace/video-projects/<slug>/project.md` updated with publish
  session entry.

## Hard Rules (skill-specific)

- **disable-model-invocation: true.** This skill never auto-triggers.
  Only the user, via `/ship-episode`, after explicit "ship it".
- **Never overwrite an existing publish folder.** If
  `workspace/publishing/<slug>/` exists, halt and ask. The user might
  be re-shipping after a take-down, which needs a different slug.
- **Verify all referenced files exist before moving.** A missing
  thumbnail or short surfaces as a single failed pre-flight, not as a
  half-moved publish folder.

## References

- `templates/publish-checklist-template.md`

## Anti-patterns

- Auto-running because a stage is "ready". User confirmation is the
  point.
- Moving files before verification passes.
- Producing the upload checklist without verifying the title and
  thumbnail were approved.
- Writing the publish folder anywhere except
  `workspace/publishing/<slug>/`.
