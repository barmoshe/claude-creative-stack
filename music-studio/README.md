# music-studio

A Claude Code plugin that turns the idea-to-publish loop for a music-tech YouTube channel into a deterministic production system. Builds music tools with Claude as dev partner, then proves them with sound.

## What's in the box

**Skills (16):**

- `music-studio` — orchestrator: routes work, enforces Hard Rules, runs quality gates.
- `trend-researcher` — finds clickable, finishable build ideas.
- `episode-strategist` — turns a raw idea into viewer promise + hook + title direction.
- `build-planner` — turns a strategy into a finishable music-app build plan.
- `claude-prompt-writer` — writes the prompts pasted into the build session.
- `script-writer` — writes the episode narration.
- `edit-director` — produces edit notes (cuts, zooms, captions).
- `demo-producer` — designs the final musical demo.
- `thumbnail-packager` — generates 3 thumbnail concepts; runs blind reviewer.
- `title-packager` — generates 5 A/B title variants.
- `shorts-producer` — cuts 2–4 vertical clips per episode.
- `youtube-metadata` — description, tags, chapters, pinned comment.
- `publish-operator` — freezes files into `workspace/publishing/`. User-only.
- `analytics-reviewer` — turns CTR / retention / comments into next-episode experiments.
- `audio-engineer` — loudness, fades, mastering, stem analysis.
- `sound-vocabulary` — translates "warmer" / "punchier" into Tone.js parameters.

**Commands (6):**

- `/brainstorm <topic>` — refine a rough idea into 2–3 framings.
- `/episode-new <idea>` — parallel research → strategy → build plan → scaffold.
- `/build-new <name>` — scaffold playground project + initial prompts.
- `/film-episode <name>` — transcribe, script, edit, render preview, self-eval.
- `/ship-episode <name>` — thumbnail, title, shorts, metadata, freeze. User-only.
- `/review-analytics [N]` — turn last N episodes into ranked experiments.

**Subagents (3):**

- `agents/reviewer.md` — blind reviewer for thumbnails and titles.
- `agents/researcher.md` — read-only web research for episode topics.
- `agents/auditor.md` — read-only repo hygiene auditor.

**Hooks (3):**

- `hooks/validate-export-name.js` — enforces export naming convention.
- `hooks/log-render.js` — logs ffmpeg invocations to `render-log.md`.
- `hooks/notify-stop.sh` — desktop notification on session end.

**Helpers (8):**

- `helpers/transcribe.py` — cached word-level verbatim ASR (via ElevenLabs Scribe MCP).
- `helpers/pack_takes.py` — pack transcripts into a phrase-level reading view.
- `helpers/timeline_view.py` — on-demand filmstrip + waveform.
- `helpers/render.py` — EDL → video with 30 ms cut fades + grade pass.
- `helpers/grade.py` — color-grading presets.
- `helpers/loudness.py` — integrated LUFS / true peak / verdict against −14 LUFS.
- `helpers/stem_analyze.py` — per-band RMS + crest factor.
- `helpers/thumbnail_render.py` — render thumbnail mocks at preview width.

**MCP servers (3):**

- `youtube-data` — analytics.
- `elevenlabs-scribe` — transcription.
- `playwright` — browser-build demo capture.

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
├── publishing/<NNN>-<slug>/          # frozen, ready-to-upload
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

## Audio knowledge

The shared creative-stack repo at `../knowledge/07-audio.md` covers Tone.js v15.5, Web Audio API, Howler.js, scales, Euclidean rhythms, and Markov chains. The plugin's `build-planner` and `sound-vocabulary` skills lean on it heavily — read it before scaffolding new music-tech builds.

## License

MIT.
