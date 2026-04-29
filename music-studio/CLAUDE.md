# Music-Tech Video Studio — Repo Constitution

## What this repo is

A Claude-native production system for a YouTube channel that builds music
tools with AI, then proves them with sound. Builds live in
`/workspace/playground`. Episodes about builds live in
`/workspace/video-projects`.

## Channel promise

"I build real music tools with AI as my dev partner — then prove them
with sound."

Sell the musical result FIRST, the AI workflow second. Every episode
ends with sound, not code.

## How to start any task

1. Read this file (always loaded).
2. Invoke the `music-studio` skill — it routes to the right sub-skill.
   Even a 1% chance a skill applies means invoke and check.
3. If the task touches a specific build or episode, also read that
   folder's `project.md` and `CLAUDE.md`.
4. Never skip the Hard Rules. See
   `@./skills/music-studio/references/hard-rules.md`.

## Standing rules

- Every video must end with sound, not only code.
- Every episode must be demoable in one sentence and one screenshot.
- Builds live in `/workspace/playground`; episodes in
  `/workspace/video-projects`.
- Final files only go in `/workspace/exports`.
- Use the title and thumbnail formulas in
  `@./channel-brain/packaging.md`.
- Per-project memory lives in each folder's `project.md`. Append-only.

## Project context (loaded as needed)

- Channel identity: `@./channel-brain/identity.md`
- Audience and tone: `@./channel-brain/audience.md`
- Packaging formulas (sourced): `@./channel-brain/packaging.md`

## Available workflows

- `/episode-new <idea>` — research, strategy, build plan; scaffolds folders.
- `/ship-episode <name>` — thumbnail, title, upload checklist.

More workflows (`/brainstorm`, `/build-new`, `/film-episode`,
`/review-analytics`) ship in later versions — see `README.md` expansion path.
