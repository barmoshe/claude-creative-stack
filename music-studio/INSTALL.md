# Install

Two install paths. They're not exclusive.

## Path A — clone as workspace (primary)

```bash
git clone https://github.com/<user>/music-studio ~/Developer/music-studio
cd ~/Developer/music-studio
```

Open this directory in Claude Code. `CLAUDE.md`, `skills/`, `commands/`, and `.mcp.json` are discovered automatically.

## Path B — install as plugin

For sessions outside this repo:

```
/plugin install <user>/music-studio
```

When installed this way, every skill becomes namespaced as `/music-studio:<skill-name>`. The `workspace/` folder does not travel — only `skills/`, `commands/`, `agents/`, `hooks/`, and MCP config are registered.

## Dependencies

| Tool | Purpose | Minimum |
|---|---|---|
| `node` | Hooks (JS) | 20.x |
| `python` | Helpers | 3.10 |
| `pip` or `uv` | Python pkg manager | latest |
| `ffmpeg` | Render pipeline (later expansion) | 6.0+ |
| `ffprobe` | Bundled with ffmpeg | matches |
| `yt-dlp` | Optional: reference video downloads | latest |

Install (macOS):

```bash
brew install node python ffmpeg yt-dlp
pip install --break-system-packages Pillow
```

Linux: use the system package manager. Windows: use WSL.

The day-one helper (`thumbnail_render.py`) requires **Pillow**:

```bash
pip install Pillow
```

## API keys

Create `.env` at the repo root (gitignored):

```ini
ELEVENLABS_API_KEY=...
YOUTUBE_API_KEY=...
ANTHROPIC_API_KEY=...   # only if running scripts that call the API directly
```

Get keys from:

- ElevenLabs: <https://elevenlabs.io/app/settings/api-keys>
- YouTube Data API v3: Google Cloud Console → APIs & Services → Credentials.
- Anthropic: <https://console.anthropic.com/>

A `.env.example` is not yet checked in — add one when you wire any helper that reads it.

## Verify install

```bash
node --version          # ≥ 20
python --version        # ≥ 3.10
node --check hooks/validate-export-name.js
python -m py_compile helpers/thumbnail_render.py
python -m json.tool .claude-plugin/plugin.json
python -m json.tool .mcp.json
```

Then open the repo in Claude Code and run a smoke test:

```
/episode-new test-idea
```

Verify it runs research, returns a strategy, and asks for confirmation. Do **not** confirm — just verify the loop. Delete any test scaffold afterwards.
