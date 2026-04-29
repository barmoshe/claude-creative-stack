---
name: music-studio
description: |
  Plan, build, film, edit, package, and ship music-tech YouTube episodes.
  Use this whenever the user mentions: an episode, a music app/plugin/synth/
  sequencer build, a thumbnail, a title, a script, a shorts cut, channel
  analytics, or anything in /workspace/. If the task is content production
  for the music-tech channel — invoke this. Even a 1% chance applies
  means invoke and check.
allowed-tools: Read, Write, Glob, Grep, Bash, WebSearch, WebFetch, Task, Skill
model: claude-sonnet-4-6
---

# Music-Studio Orchestrator

## Principle

This skill is a **router**. It never produces final deliverables itself. It dispatches to one sub-skill, runs quality gates on the output, and updates `project.md`. Three sentences max — that's the contract.

## What this skill does, in order

1. Loads `references/hard-rules.md`.
2. Gathers context (build, episode, stage).
3. Routes to the correct sub-skill via `references/routing-table.md`.
4. Runs the quality-gate sequence in `references/quality-gates.md`.
5. Updates `project.md` for the relevant build or episode.

It does nothing else.

## Hard Rules

The twelve production-correctness rules live at `references/hard-rules.md`. Load them at the start of any task. They are non-negotiable. Numerically:

1. Sell the musical result first.
2. Every episode ends with sound.
3. Mobile-readable thumbnails (350 px preview).
4. `project.md` is per-project, append-only.
5. Cache transcripts per source.
6. Word-level verbatim ASR only.
7. 30 ms audio fades at every cut boundary.
8. Master to −14 LUFS / −1.0 dBTP.
9. Builds in `playground/`; episodes in `video-projects/`.
10. Final exports only in `exports/<NNN>-<slug>/`.
11. Strategy confirmation before publishing.
12. Parallel sub-agents for parallel work.

Read the canonical text in `references/hard-rules.md` whenever a rule is invoked.

## Routing

The routing table is canonical and lives at `references/routing-table.md`. Always read it before dispatching. If multiple rows match, pick the most specific. If nothing matches, ask one clarifying question and stop.

## Context-gathering protocol

Before dispatching, establish four pieces of context. If any are missing or ambiguous, ask **one** clarifying question and wait.

| Context | How to determine | Default if missing |
|---|---|---|
| Build slug | Match user phrasing against existing folders in `workspace/playground/`. | Ask. |
| Episode slug | Match against `workspace/video-projects/`. Episode = `<NNN>-<build-slug>`. | Ask, or "new" if user said "new episode". |
| Stage | Idea / build / film / package / ship / review (`references/stages.md`). | Infer from intent; ask if unclear. |
| Constraints | Deadline, target length, special demo idea. | None. |

Context gathering happens **before** restating Hard Rules to the user. Do not load the full rule set for off-topic requests.

## Quality gates

Every output passes the gate sequence in `references/quality-gates.md` before reaching the user. The first failing gate halts. Order:

```
Specificity → Sourcing → Hard-Rules → (deliverable-specific gate)
```

Deliverable-specific gates:

- Thumbnails → Mobile preview.
- Audio outputs → Loudness.
- Rendered video → Self-eval.

When a gate fails: log the failure to `project.md`, apply the retry policy, and if exhausted, surface to user. Never silently lower the bar.

## Anti-patterns

The orchestrator must not:

- Produce final deliverables. It always dispatches.
- Skip the routing table because "the user obviously means X".
- Run `publish-operator` (or `/ship-episode`) without explicit user invocation.
- Restate Hard Rules verbatim to the user every time. Reference only when relevant or when a violation is detected.
- Re-transcribe cached sources.
- Use `Task` to spawn parallel sub-skills when one would suffice.
- Pretend benchmark stats are sourced when they aren't.

## References

- `references/hard-rules.md` — the 12 rules (load on every dispatch).
- `references/routing-table.md` — sub-skill dispatch.
- `references/quality-gates.md` — gate sequence and retry policy.
- `references/stages.md` — episode lifecycle.
