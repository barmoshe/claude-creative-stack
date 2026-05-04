# sprite-packer MCP server

Packs PNG sprite frames into a single atlas + JSON manifest. Phaser 4 / Pixi v8 compatible.

## Install

```bash
cd mcp/servers/sprite-packer
npm install
npm run build
```

## Register

Merge into your `.mcp.json` or `~/.claude.json`:

```json
{
  "mcpServers": {
    "sprite-packer": {
      "command": "node",
      "args": ["./mcp/servers/sprite-packer/dist/index.js"]
    }
  }
}
```

Or via the CLI:

```bash
claude mcp add sprite-packer -- node /abs/path/mcp/servers/sprite-packer/dist/index.js
```

## Tools

- **`pack_atlas({ input_dir, output_dir, name?, padding?, max_width? })`** — packs every PNG in `input_dir` into `<output_dir>/<name>.png` plus `<output_dir>/<name>.json`. Returns `{ frames, width, height, atlasPath, manifestPath }`.
- **`inspect_atlas({ json_path })`** — reads an atlas JSON manifest, returns size + frame count + first 50 frame names.

## Test

```bash
npm test
```

## See also

- [`skills/sprite-atlas-builder/`](../../../skills/sprite-atlas-builder) — same logic exposed as a skill + a local-runnable `pack.ts`.
- [`knowledge/15-export-recording.md`](../../../knowledge/15-export-recording.md) §15.8 — packing options.
