# music-studio

A Claude Code plugin that turns the idea-to-publish loop for a music-tech YouTube channel into a deterministic production system. Builds music tools with Claude as dev partner, then proves them with sound.

## What's in the box (day-one skeleton)

The plugin ships the highest-leverage subset of the full design. Per Spec 04 §10–§11, more skills land as the felt need arises.

**Skills (5):**
- `music-studio` — orchestrator: routes work, enforces Hard Rules, runs quality gates.
- `episode-strategist` — turns a raw idea into viewer promise + hook + title direction.
- `build-planner` — turns a strategy into a finishable music-app build plan.
- `thumbnail-packager` — generates 3 thumbnail concepts; runs blind reviewer.
- `title-packager` — generates 5 A/B title variants tied to chosen thumbnail.

**Commands (2):**
- `/episode-new <idea>` — parallel research → strategy → build plan → scaffold.
- `/ship-episode <name>` — thumbnail, title, upload package. User-only.

**Subagent (1):**
- `agents/reviewer.md` — blind reviewer for thumbnails and titles.

**Hooks (1):**
- `hooks/validate-export-name.js` — enforces export naming convention.

**Helpers (1):**
- `helpers/thumbnail_render.py` — render thumbnail mocks at preview width.

**MCP servers:**
- `youtube-data` (analytics) and `elevenlabs-scribe` (transcription) — see `.mcp.json`.

## Setup

See `INSTALL.md`. One-paste setup prompt:

```
Set up https://github.com/<user>/music-studio for me.

Read INSTALL.md first to install this repo, wire up ffmpeg and Python
deps, register the plugin, and set up API keys (YouTube Data API,
ElevenLabs) — ask me to paste them when you need them. Then read the
music-studio skill at skills/music-studio/SKILL.md, and skim the
channel-brain/ folder so you understand the channel identity and
packaging rules.

After install, do not generate anything yet — confirm the repo is
ready and wait for me to either drop into a workspace/playground/
project or run /episode-new with a fresh idea.
```

## How it works

The orchestrator (`skills/music-studio/SKILL.md`) sits between you and the rest of the system. When you ask for anything music-channel-related, it:

1. Loads the 12 Hard Rules (`skills/music-studio/references/hard-rules.md`).
2. Determines context (which build, which episode, which stage).
3. Routes to the correct sub-skill via the routing table.
4. Runs quality gates on the output.
5. Updates the relevant `project.md`.

Episodes pass through six stages: idea → build → film → edit → package → learn. The orchestrator tracks the current stage in each episode's `project.md`.

## Workspace layout

```
workspace/
├── playground/<build-slug>/          # the actual music app code
├── video-projects/<NNN>-<slug>/      # episode production package
├── exports/<NNN>-<slug>/             # finals only
└── analytics/                        # render log + per-episode reviews
```

Slugs are kebab-case. Episode slugs prefix a 3-digit publish-order number: `001-orbitseq`.

By default, `workspace/` is gitignored ("private workspace" mode). To switch to "public production journal" mode, remove the `workspace/` line from `.gitignore`.

## Doctrine

Three lines you do not deviate from:

- **Promise:** *"I build real music tools with AI as my dev partner — then prove them with sound."*
- **Headline rule:** Sell the musical result first. The AI workflow is supporting evidence, not the headline.
- **Closing rule:** Every episode ends with sound, not code.

Twelve more rules govern production correctness — see `skills/music-studio/references/hard-rules.md`.

## Expansion path

Add capability when you feel the pain, not before. Recommended order from Spec 04 §11:

| Trigger | Add |
|---|---|
| First episode shipped | `script-writer`, `edit-director`, `demo-producer`, `commands/film-episode.md` |
| Iterating on a synth patch starts feeling slow | `sound-vocabulary` |
| First episode hits 1k views | `analytics-reviewer`, `commands/review-analytics.md` |
| Channel reaches 5 episodes | `shorts-producer`, `audio-engineer` |
| Channel reaches 10 episodes | `trend-researcher`, `claude-prompt-writer`, `commands/brainstorm.md`, `commands/build-new.md` |
| Channel reaches 25 episodes | `youtube-metadata`, `publish-operator`, `agents/auditor.md` |

## License

MIT.
