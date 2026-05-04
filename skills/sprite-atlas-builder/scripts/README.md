# sprite-atlas-builder/scripts

Local-runnable TypeScript packer that produces the same JSON shape as the skill.

## Run

```bash
npm i pngjs                      # one-time
npx tsx scripts/pack.ts \
  --in  ./assets/frames \
  --out ./out/atlas.png \
  --json ./out/atlas.json \
  --padding 2 --max 4096
```

The packer:

- reads every `*.png` from `--in`
- shelf-packs by descending height
- pads frames by `--padding` pixels
- pads the atlas to a power-of-two for older GPUs
- writes `atlas.png` and a Phaser/Pixi-friendly `atlas.json`

For production-grade density, switch the shelf packer for **maxrects** — see `maxrects-packer` on npm. The shelf packer is fine up to a few hundred frames.

## See also

- [`../SKILL.md`](../SKILL.md) — the skill itself.
- [`mcp/servers/sprite-packer/`](../../../mcp/servers/sprite-packer/) — same logic exposed as an MCP server, callable from Claude Code or a recipe.
- [`knowledge/15-export-recording.md`](../../../knowledge/15-export-recording.md) §15.8 — packing options.
