# MCP

Model Context Protocol servers + a config template.

## Layout

```
mcp/
├── configs/
│   └── creative-stack.mcp.json    # drop into Claude Code or a project
└── servers/
    ├── palette-oklch/             # WCAG-aware oklch palette tools
    ├── sprite-packer/             # atlas packing
    └── asset-router/              # generative-asset routing (Replicate / Fal / ElevenLabs / Suno / Luma)
```

Each server is a standalone TypeScript package: `package.json`, `tsconfig.json`, `src/index.ts`, `README.md`.

## What's here

- **`configs/creative-stack.mcp.json`** — an `.mcp.json`-format config that wires up filesystem, git, memory, and all three local servers. Rename to `.mcp.json` at the project root or merge into `~/.claude.json`.
- **`servers/palette-oklch`** — palette-generator tools (`generate_palette`, `contrast_check`, `chart_palette`). Mirrors `skills/palette-generator/SKILL.md`.
- **`servers/sprite-packer`** — sprite-atlas packing tools. Mirrors `skills/sprite-atlas-builder/SKILL.md`.
- **`servers/asset-router`** — generative-asset routing (image / voice / music / video) with cost estimation. Mirrors `skills/asset-generator/SKILL.md`. Requires provider API keys in env.

All servers use the official `@modelcontextprotocol/sdk` with Zod schemas and stdio transport.

## Install + run all servers

```bash
for d in palette-oklch sprite-packer asset-router; do
  ( cd "mcp/servers/$d" && npm install && npm run build )
done
```

Or one at a time:

```bash
cd mcp/servers/palette-oklch
npm install
npm run build
# or dev mode
npm run dev
```

Then reference it from your config:

```json
{
  "mcpServers": {
    "palette-oklch": {
      "command": "node",
      "args": ["./mcp/servers/palette-oklch/dist/index.js"]
    }
  }
}
```

For the full three-server config, use [`configs/creative-stack.mcp.json`](configs/creative-stack.mcp.json) as-is.

## Transport

This server uses **stdio** transport — simple, works for local development and Claude Code. For remote deployment, switch to Streamable HTTP (see the MCP spec 2025-03-26; SSE is deprecated — `knowledge/99-caveats.md`).

## Notes

- Each server deliberately mirrors a sibling skill (`palette-oklch` ↔ `palette-generator`, `sprite-packer` ↔ `sprite-atlas-builder`, `asset-router` ↔ `asset-generator`) so both Claude-in-skill-mode and Claude-with-MCP share the same logic.
- Author additional servers with the same scaffold — see the [official MCP TypeScript quickstart](https://modelcontextprotocol.io).
