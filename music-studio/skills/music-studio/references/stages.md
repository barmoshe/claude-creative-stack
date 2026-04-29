# Episode lifecycle — six stages

Every episode passes through six stages. Each stage has a single canonical entry point (a slash command) and a defined exit condition. The orchestrator tracks the current stage in each episode's `project.md`.

## The six stages

| # | Stage | Entry point | Exit condition | Primary deliverable |
|---|---|---|---|---|
| 1 | Idea | `/brainstorm` then `/episode-new` | User confirms strategy in plain English | `workspace/episode-ideas/<slug>.md` + scaffolded folders |
| 2 | Build | `/build-new` | App runs and produces sound | `workspace/playground/<slug>/` populated, demo-ready |
| 3 | Film | (manual) | Footage transcribed and packed | `workspace/video-projects/<slug>/takes_packed.md` |
| 4 | Edit & demo | `/film-episode` | Cut passes self-eval; final demo recorded | `workspace/exports/<slug>/final-video.mp4` |
| 5 | Package & ship | `/ship-episode` | Title + thumbnail confirmed; files frozen | `workspace/publishing/<slug>/` |
| 6 | Learn | `/review-analytics` | Experiments queued for next episodes | `workspace/analytics/episodes/<slug>.md` |

## Stage transitions

A stage transition is an explicit operation, not a guess. The orchestrator advances the stage in `project.md` only after the exit condition is satisfied, and only after the user confirms.

```
Idea  ─[user confirms strategy]──▶  Build
Build ─[demo runs end-to-end]──▶  Film
Film  ─[transcripts cached and packed]──▶  Edit & demo
Edit  ─[self-eval passes; user reviews preview]──▶  Package & ship
Ship  ─[user confirms title + thumbnail]──▶  Published (frozen)
Published ─[analytics window opens, T+24h to T+30d]──▶  Learn
Learn ─[experiments queued]──▶  feeds back into next episode's Idea stage
```

Each transition is logged as a session entry in `project.md` with the date and the rationale.

## Skipping stages

Three deviations are valid and must be explicitly logged:

- **Stage 1 skipped** — episode reuses an existing build. `project.md` records "reusing build `<slug>`, no new build stage".
- **Stage 4 deferred** — footage is captured but the cut waits. `project.md` records the deferral and resumes from `takes_packed.md`.
- **Stage 6 skipped** — episode is too small to learn from. `project.md` records "no analytics review intended".

No other stage may be skipped silently.
