# Routing table

The orchestrator dispatches to sub-skills by matching the user's intent to a row in this table. If multiple rows match, pick the most specific. If nothing matches, ask one clarifying question and stop.

| User intent | Trigger phrases (non-exhaustive) | Dispatch to |
|---|---|---|
| Refine a rough idea | "brainstorm", "I'm thinking about…", "rough idea" | `episode-strategist` (no scaffold yet) |
| New episode from idea | "new episode", "make a video about…" | `trend-researcher` → `episode-strategist` → `build-planner` |
| Scaffold the build | "scaffold the build", "start the project" | `claude-prompt-writer` + scaffold from template |
| Write the script | "write the script", "narration" | `script-writer` |
| Edit notes | "where to cut", "edit notes", "pacing" | `edit-director` |
| Final demo design | "what to play at the end", "design the demo" | `demo-producer` |
| Make thumbnails | "thumbnail", "thumb mocks", "A/B variants" | `thumbnail-packager` |
| Title options | "title options", "test some titles" | `title-packager` |
| Cut shorts | "cut shorts", "find clips for shorts" | `shorts-producer` |
| Upload package | "metadata", "description", "tags", "upload package" | `youtube-metadata` |
| Channel analytics | "analytics", "what worked", "retention" | `analytics-reviewer` |
| Audio polish | "loudness", "stems", "mastering", "polish audio" | `audio-engineer` |
| Sound design language | "make it warmer", "punchier", "wider", "more glitchy" | `sound-vocabulary` |
| Ship an episode | "ship it", "publish" | `publish-operator` (user-invocation only) |

## Day-one availability

The day-one skeleton ships only:

- `episode-strategist`
- `build-planner`
- `thumbnail-packager`
- `title-packager`

Plus the `/episode-new` command (which orchestrates research + strategy + plan) and `/ship-episode` (thumbnail + title flow).

If the user requests a row whose sub-skill is not yet implemented, surface that fact, point to the README expansion path, and offer the closest available alternative. Do not invent or stub the missing skill in-session.
