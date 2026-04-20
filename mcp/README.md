# MCP

Model Context Protocol servers + a config template.

## Layout

```
mcp/
├── configs/
│   └── creative-stack.mcp.json    # drop into Claude Code or a project
└── servers/
    └── palette-oklch/             # working TypeScript MCP server
        ├── package.json
        ├── tsconfig.json
        ├── src/index.ts
        └── README.md
```

## What's here

- **`configs/creative-stack.mcp.json`** — an `.mcp.json`-format config that wires up filesystem, git, memory, and the local `palette-oklch` server. Rename to `.mcp.json` at the project root or merge into `~/.claude.json`.
- **`servers/palette-oklch`** — a complete TypeScript MCP server implementing the palette-generator logic as tool calls (`generate_palette`, `contrast_check`, `chart_palette`). Uses the official `@modelcontextprotocol/sdk` with Zod schemas and stdio transport.

## Install + run the server

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

## Transport

This server uses **stdio** transport — simple, works for local development and Claude Code. For remote deployment, switch to Streamable HTTP (see the MCP spec 2025-03-26; SSE is deprecated — `knowledge/99-caveats.md`).

## Notes

- The `palette-oklch` server deliberately mirrors `skills/palette-generator/SKILL.md` so both Claude-in-skill-mode and Claude-with-MCP can use the same logic.
- You can author additional servers following the same scaffold — the SDK + Zod pattern is well-established. See the [official Anthropic MCP TypeScript quickstart](https://modelcontextprotocol.io) for deeper examples.
