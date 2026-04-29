---
description: |
  Review channel analytics from the last N episodes (default 5) and
  output ranked experiments to try in upcoming episodes. Pulls from
  the YouTube Data MCP.
allowed-tools: Read, Write, Skill, mcp__youtube-data__*
---

# Review Analytics: ${ARGUMENTS:-5}

## Step 1 — Identify episodes

List the most recent ${ARGUMENTS:-5} entries in
`workspace/publishing/`. For each, confirm a published video exists
on the channel (via YouTube Data MCP).

If `workspace/publishing/` is empty, surface that and stop. There's
nothing to review.

## Step 2 — Per-episode review

For each episode, invoke `music-studio:analytics-reviewer`.

Output written to `workspace/analytics/episodes/<slug>.md`.

## Step 3 — Cross-episode synthesis

After all per-episode reviews are complete, generate the experiments
queue at `workspace/analytics/experiments-next.md`.

Each experiment must include:

- The hypothesis (one sentence, falsifiable).
- Which next episode would test it.
- The success metric (measurable, with a numeric threshold).
- The kill criterion (when to abandon).

Cap at 5 experiments — more is wishful thinking, not a backlog.

## Step 4 — Update channel baseline

If the cross-episode synthesis reveals a shift in baseline (CTR,
retention, top traffic source, comment-bucket ratio), update
`workspace/analytics/baseline.md`. Only update on a ≥ 20% shift over
the last 5 episodes — single-episode swings are noise.

## Step 5 — Surface picks

Show the user the top 3 experiments and ask which to lock into the
next episode-ideas backlog. The locked experiment(s) become explicit
constraints on the next `/episode-new` strategy stage.
