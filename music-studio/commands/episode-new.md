---
description: |
  Take a raw or brainstormed idea and turn it into a clickable, finishable
  episode. Spawns three research subagents in parallel, then synthesizes
  via episode-strategist + build-planner. Stops for confirmation before
  scaffolding any folders.
allowed-tools: Task, Read, Write, WebSearch, WebFetch, Grep, Glob, Skill
---

# New Episode: $ARGUMENTS

## Step 1 — Parallel research (subagents)

Spawn three subagents in parallel via the Task tool, all in a single
message. Each must be self-contained.

1. **Trend agent.** (`trend-researcher` skill is not yet shipped on
   day one — see README expansion path. Until it ships, run this step
   manually as a `general-purpose` Task: search Reddit, YouTube, GitHub
   for the topic seed and return a ranked list with click-potential,
   build-feasibility, musical-payoff, and shorts-potential scores.)

2. **Pain-point agent.** Search Reddit (r/edmproduction, r/synthesizers,
   r/audioengineering, r/ableton), producer forums, and YouTube comments
   for unsolved problems near this idea. Return 5–10 verbatim quotes
   that show the pain.

3. **Benchmark agent.** Find 5 reference videos in this neighbourhood from
   the last 12 months. Return title, thumbnail description, hook (first
   8 seconds), view count, and why each worked or didn't.

## Step 2 — Strategy synthesis

Once all three subagents return, invoke `music-studio:episode-strategist`
with their combined output. Produce:
- Viewer promise (one sentence).
- 5 title options.
- 3 thumbnail angles.
- Final demo idea.
- "Leave for episode 2" list.

## Step 3 — Plain-English strategy review

Show the user a 4–8 sentence summary covering: shape of the episode,
hook, demo, build complexity, leave-for-episode-2.

**Wait for confirmation before proceeding.**

## Step 4 — Build plan

Once the user confirms, invoke `music-studio:build-planner`. MVP only.
Stay finishable. List explicit risks.

## Step 5 — Scaffold

Create:
- `workspace/episode-ideas/<slug>.md` — captures everything from steps
  2–4. Use `templates/episode-brief.md` as the shape.
- `workspace/playground/<slug>/` — scaffolded from
  `templates/build-skeleton/`.
- `workspace/playground/<slug>/project.md` — initialized with the
  strategy summary and stage = "build".

Report the next two clear actions to the user.
