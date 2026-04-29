# Conventions

## Slugs

- **Build slugs:** kebab-case, no numbers, no spaces. `orbitseq`, `mix-roast`, `doodle-to-midi`.
- **Episode slugs:** three-digit zero-padded prefix + dash + build slug. `001-orbitseq`, `002-mix-roast`. The number is **publish order**, not build order.
- A build can have one or zero episodes. An episode must have exactly one build.

## Folder paths

| Content | Canonical path |
|---|---|
| Build code and assets | `workspace/playground/<build-slug>/` |
| Episode production package | `workspace/video-projects/<episode-slug>/` |
| Episode raw footage | `workspace/video-projects/<episode-slug>/raw/` |
| Episode transcripts cache | `workspace/video-projects/<episode-slug>/transcripts/` |
| Episode renders (working) | `workspace/exports/<episode-slug>/` |
| Frozen publish package | `workspace/publishing/<episode-slug>/` |
| Per-episode analytics | `workspace/analytics/episodes/<episode-slug>.md` |

## Final-export filenames (Hard Rule 10)

```
<NNN>-<slug>-<role>.<ext>
```

- `<role>`: `video`, `short-N`, `thumb-N`, or `audio`.
- `<ext>`: `mp4`, `mov`, `wav`, `mp3`, `png`, `jpg`.

Enforced by `hooks/validate-export-name.js`.

## Working filenames (inside production folders)

Descriptive, no slug prefix: `script.md`, `edit-notes.md`, `demo-plan.md`, `titles.md`, `upload-package.md`, `takes_packed.md`, `transcripts/take-01.json`, `thumb-mocks/v1.png`.

## Forbidden in any path

- Spaces.
- Uppercase (except `README.md`, `CLAUDE.md`).
- Emoji.
- Unicode.

## Session-entry shape (in `project.md`)

Per Hard Rule 4 (append-only). Schema:

```markdown
## Session N — YYYY-MM-DD

**Goal:** one line
**What happened:** 2–4 bullets, plain English
**Decisions:** what was chosen, why
**Outstanding:** deferred items, ranked
```

## Voice rules in writing

- "I" not "we" — single-creator channel.
- "Built" beats "developed". "Wrote" beats "implemented". "Plays" beats "outputs sound".
- Past tense for build narration. Present tense for the current state of the demo.
- Never the phrase "let's dive in".

## Numbers and claims

- Any benchmark stat in copy must cite a source from `channel-brain/packaging.md`'s sources list.
- Time durations in script callouts: `0:32` not `32 seconds`.
- Frequencies: `60 Hz` not `60Hz`. dB values: `-14 LUFS` not `-14dB`.
