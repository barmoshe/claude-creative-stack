---
description: |
  Scaffold a new music-tech build under workspace/playground/<name>/ and
  seed claude-prompts.md with the prompts to paste into a separate Claude
  Code session for the actual build work.
allowed-tools: Read, Write, Bash, Skill
---

# New Build: $ARGUMENTS

## Step 1 — Verify scaffold

If `workspace/playground/$ARGUMENTS/` does not exist, copy from
`templates/build-skeleton/`. If it exists and is non-empty, ask before
overwriting any files.

## Step 2 — Generate prompts

Invoke `music-studio:claude-prompt-writer` with inputs from
`workspace/playground/$ARGUMENTS/build-notes.md` (or the matching
episode-idea file if `build-notes.md` doesn't exist yet).

Produce sections in `workspace/playground/$ARGUMENTS/claude-prompts.md`:

1. Scaffold prompt — runnable hello-world, deps, project shape.
2. Architecture prompt — audio engine and UI separation.
3. One feature prompt per milestone from `build-notes.md`.
4. Debug prompt template (fill-in-the-blanks).
5. Polish prompt — UX, naming, comments pass.

## Step 3 — Update project.md

Append a session entry to
`workspace/playground/$ARGUMENTS/project.md`:

```
## Session N — YYYY-MM-DD

**Goal:** scaffolded build, generated initial prompts
**What happened:** copied template, wrote claude-prompts.md
**Decisions:** stack = <chosen stack>, MVP scope = <bullets>
**Outstanding:** run scaffold prompt in playground session, hit
milestone 1
```

## Step 4 — Hand off

Tell the user:

- Open a new Claude Code session inside
  `workspace/playground/$ARGUMENTS/`.
- Paste the scaffold prompt first.
- Return here when the demo runs end-to-end so we can move to filming.

Do not attempt to run the build prompts yourself. They are designed
for a separate session with the playground folder as the working
directory.
