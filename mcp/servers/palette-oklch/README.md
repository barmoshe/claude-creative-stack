# palette-oklch MCP server

Generates accessible oklch palettes on demand. Same logic as `skills/palette-generator` — exposed as MCP tool calls so it's reachable from Claude Code, Claude Desktop, and any MCP-capable client.

## Tools

| Name | Purpose |
|---|---|
| `generate_palette` | Produce a 9-token oklch palette (light or dark) for a given hue. |
| `contrast_check` | Compute WCAG contrast ratio between two oklch colors. |
| `chart_palette` | Produce 5 colorblind-safe categorical chart colors. |

## Build & run

```bash
npm install
npm run build
node dist/index.js   # stdio transport — usually driven by a client
```

## Wire up

In `~/.claude.json` or your project's `.mcp.json`:

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

Then in Claude Code or Claude Desktop: `/mcp list` should show `palette-oklch`, and Claude will be able to call `generate_palette({ hue: 250, mode: "dark" })` directly.

## Transport

stdio — simplest. For remote hosting use Streamable HTTP (see MCP spec 2025-03-26; SSE is deprecated per `knowledge/99-caveats.md`).

## License

MIT.
