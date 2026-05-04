# 11 — Creative-Tool Connectors (MCP)

> Anthropic's "Claude for Creative Work" launch (Apr 28, 2026) shipped first-party MCP connectors into the apps designers, animators, 3D artists, and musicians actually live in. This file is the routing map for "Claude, drive my Photoshop / Blender / Ableton / Fusion session."

**TL;DR — when to reach for which.**

| You want to… | Connector | Notes |
|---|---|---|
| Move layers, masks, smart objects in Photoshop / generate from briefs in Illustrator / pull pages from InDesign | **Adobe Creative Cloud** | OAuth via Adobe ID. Read-only first time; explicit grant per file for writes. |
| Inspect a `.blend`, run a Python script, batch-render, register custom tools | **Blender** (`blender-mcp`) | Local connector that talks to a running Blender via its Python API + a small bridge add-on. |
| Drive Fusion 360 — sketches, parameters, generative design exports | **Autodesk Fusion** | Cloud-side; uses Fusion's API surface. |
| Drag stems, set tempo, automate plugins, render arrangements | **Ableton Live** | Local MIDI/OSC bridge. Tempo, scenes, clips, sends, devices. |
| Search/license stems and one-shots and drop them on the timeline | **Splice** | Cloud, paired with Ableton or any DAW that accepts file drops. |
| Push 3D scenes from Blender → SketchUp for spatial review | **SketchUp** | 3D walk-through and spatial annotations. |
| Compose in Photoshop while sourcing / rendering in Adobe Firefly | **Adobe Creative Cloud** + Firefly | Same OAuth scope. |

> The roster will grow. Always check `claude.ai → Settings → Connectors` for the live list — Anthropic adds entries silently. Local connectors install via `claude mcp add` or the desktop app's Extensions panel.

## 11.1 Connection patterns

Three shapes of connector, picked by the host app:

1. **Cloud-OAuth** (Adobe CC, Fusion, SketchUp Cloud) — Anthropic-hosted MCP server, OAuth into the user's account, scopes per resource. The user clicks "Allow Claude to read/edit `<file>`" once per resource. Revoke from the vendor's account dashboard.
2. **Local bridge** (Blender, Ableton Live, SketchUp Desktop) — small server on `localhost` that proxies to the host app's scripting API. Started either via `claude mcp add <name> -- <cmd>` or as a long-running daemon. Survives the app's lifecycle by reconnecting on restart.
3. **File-drop hybrid** (Splice → DAW) — connector returns asset URLs / file paths; Claude orchestrates download + place. The DAW receives a regular asset, not a live tool call.

Discovery for users: **Connectors panel** (claude.ai), **Extensions panel** (desktop), or `claude mcp list` from the CLI. Each shows "Available tools" and "Resources" — these are the exact MCP affordances Claude can use.

## 11.2 Blender (`blender-mcp`) — the canonical local example

Install (one-time):

```bash
# 1) Inside Blender → Edit → Preferences → Add-ons → Install → blender_mcp_addon.zip
# 2) Enable the "Claude MCP Bridge" add-on; Blender opens a localhost socket.
# 3) Register the connector with Claude Code:
claude mcp add blender -- npx -y @anthropic-experimental/blender-mcp
```

Tool surface (typical — version-pinned in `claude mcp list`):

| Tool | What it does |
|---|---|
| `scene.describe()` | Returns objects, materials, modifiers, frame range, render settings as JSON. |
| `scene.run_python(code: str)` | Executes a Python snippet in Blender's interpreter (full `bpy` access). Be cautious — capable of destructive edits. |
| `render.frame(frame: int, format: "png\|exr"\|...)` | Renders a single frame, returns the path. |
| `render.batch(start, end, step)` | Submits a sequence render. |
| `geometry.export(name, format: "glb\|fbx\|usdz")` | Exports an object or collection. |
| `materials.list()` / `materials.set_param(name, key, value)` | Inspect & tweak shaders without writing Python. |

Workflow patterns:

- **"Refine the lighting"** — Claude calls `scene.describe()`, proposes 2-3 lighting setups as `run_python` snippets, executes the chosen one, renders a thumbnail, asks the user to compare.
- **"Generate variants"** — Claude loops over a list of HDRIs / camera angles via `scene.run_python` + `render.frame`, returns a contact sheet.
- **"Port to web"** — `geometry.export("Hero", "glb")`, then drop into a Three.js artifact.

Safety rails:

- Always preview a `scene.run_python` snippet before executing — `bpy.ops.wm.save_as_mainfile()` overwrites silently.
- Use **Save As → versioned** before any session where Claude has write access.
- The bridge add-on's "Dry-run mode" prints every Python call to the system console without executing — turn it on while you build trust.

## 11.3 Adobe Creative Cloud — Photoshop / Illustrator / InDesign / Premiere

Install:

```
claude.ai → Settings → Connectors → Adobe Creative Cloud → Connect
```

OAuth pops the Adobe ID flow. Granted scopes:

- **Read**: list assets in CC Libraries, read open documents (layer tree, smart object metadata, color profiles).
- **Edit**: per-file grant. Claude asks; you click "Allow this file."
- **Generate**: dispatch Firefly jobs, return URLs.

Tool surface (Photoshop, indicative):

| Tool | What it does |
|---|---|
| `psd.layers(doc_id)` | Returns the layer tree — names, types, blending, smart object content. |
| `psd.toggle_layer(doc_id, layer_id, visible)` / `psd.move_layer(...)` | Non-destructive edits. |
| `psd.add_text(doc_id, text, font, size, color, position)` | Adds a text layer. |
| `psd.run_action(doc_id, action_name)` | Runs a saved Action (the Photoshop primitive most LLMs forget exists). |
| `psd.export(doc_id, format, region)` | Exports a slice. |
| `firefly.generate(prompt, count, model, ratio)` | Dispatches a Firefly job; returns URLs. |
| `firefly.generative_fill(doc_id, mask, prompt)` | Image fill in a masked region. |

Patterns:

- **Comp from a brief**: read the open PSD, ask Firefly for hero variants, place them on a smart object, recolor a text layer, export web/print sizes.
- **Batch resize**: walk a CC Library, push each asset through a saved Action, re-upload.
- **"Make this on-brand"**: pull tokens from a `theme-factory` skill or the `palette-oklch` MCP, retint vector layers, retype headlines.

Illustrator / InDesign / Premiere have parallel tool surfaces (Premiere adds `timeline.cut`, `timeline.add_clip`, `timeline.export`).

## 11.4 Ableton Live — driving a session

Install: enable the "Claude MCP" Max for Live device on the master track, or run `ableton-mcp` as a standalone daemon (it speaks LiveOSC).

Tool surface:

| Tool | What it does |
|---|---|
| `live.session()` | Tempo, sig, scenes, tracks, devices. |
| `live.tempo(bpm)` / `live.transport(play\|stop\|loop)` | Transport. |
| `live.fire_clip(track, scene)` / `live.stop_clip(track)` | Trigger clips. |
| `live.add_clip(track, scene, name, length_bars)` + `live.write_midi(track, scene, notes[])` | Compose. |
| `live.set_device_param(track, device_idx, param_name, value)` | Automate a plugin parameter. |
| `live.bounce(start, end, format)` | Render a segment. |

Patterns:

- **"Generate a 16-bar chord progression in C minor"** — call `live.add_clip` + `live.write_midi` from a music-theory skill, fire it, ask the user to vibe-check.
- **Mix advisor** — read every track's `device_param` snapshot, propose a HPF + bus-comp recipe, apply via `set_device_param`.
- **Stems for a game**: drive a deterministic generative arrangement (see `07-audio.md` §Tone.js), `live.bounce` per stem, drop into `kaplay-top-down.html`.

Tempo discipline: lock `live.tempo(bpm)` before MIDI writes — clips inherit the session BPM at creation.

## 11.5 Designing a multi-app workflow

Composition example — **"Cozy farming game starter pack"**:

1. **Blender connector** → generate a low-poly tile mesh, export 8 variants as PNG sprites at 64×64.
2. **Adobe Photoshop connector** → run a saved "Pixel-art conform" Action over the 8 PNGs.
3. **`palette-oklch` MCP** → extract a 6-color palette across the conformed tiles.
4. **`sprite-packer` MCP** (this repo) → pack into a single atlas + JSON manifest.
5. **Ableton connector** → bounce a 30 s ambient loop in C major at 90 BPM.
6. **Artifact** → `kaplay-top-down.html` modified to consume the new atlas + ambient loop.

The agentic version of this (one-shot via the asset router) is documented in `recipes/agentic-asset-pipeline.md`.

## 11.6 What NOT to do

- **Don't grant write scope by default.** Read scope plus per-file write is the safe pattern.
- **Don't mix anonymous Firefly outputs into commercial work** without the licensing audit trail Anthropic surfaces in the connector response.
- **Don't run `scene.run_python` snippets you haven't read.** A confused LLM will happily delete every modifier in your scene.
- **Don't assume connector tool names are stable across sessions.** New versions add/rename tools — call `claude mcp list` if a tool is missing.
- **Don't try to call these connectors from inside an artifact.** Artifacts can attach `mcp_servers` to their own Claude API calls (see `03-artifacts.md`), but the local Blender/Ableton/Photoshop bridges aren't reachable from a published artifact's network. Drive them from Claude Code or the desktop app.

## 11.7 See also

- `knowledge/01-claude-ecosystem.md` §1.7 — MCP basics, transports, SDKs.
- `knowledge/03-artifacts.md` §3.4 — calling MCP servers *from inside* an artifact.
- `knowledge/13-asset-pipelines.md` — hosted asset generators (Replicate, Fal, ElevenLabs, Suno, Luma).
- `knowledge/10-workflows.md` — composing connectors with skills and artifacts.
- `recipes/agentic-asset-pipeline.md` — end-to-end demo across multiple connectors.
