#!/usr/bin/env node
/**
 * sprite-packer MCP server.
 *
 * Tools:
 *   - pack_atlas({ input_dir, output_dir, padding?, max_width? })
 *   - inspect_atlas({ json_path })
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { join } from "node:path";

import { packDir, inspectAtlas } from "./packer.js";

const server = new McpServer({ name: "sprite-packer", version: "0.1.0" });

server.tool(
  "pack_atlas",
  "Pack every PNG in `input_dir` into a single atlas PNG + JSON manifest written to `output_dir`. Returns frame count and atlas dimensions.",
  {
    input_dir: z.string().describe("Directory containing source PNG frames."),
    output_dir: z.string().describe("Directory to write atlas.png + atlas.json into."),
    name: z.string().default("atlas").describe("Base filename (without extension) for the output."),
    padding: z.number().int().min(0).max(32).default(2),
    max_width: z.number().int().min(64).max(8192).default(4096),
  },
  async ({ input_dir, output_dir, name, padding, max_width }) => {
    const result = await packDir({
      inDir: input_dir,
      outPath: join(output_dir, `${name}.png`),
      jsonPath: join(output_dir, `${name}.json`),
      padding,
      maxWidth: max_width,
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "inspect_atlas",
  "Read an atlas JSON manifest and return its size, frame count, and the first 50 frame names.",
  {
    json_path: z.string().describe("Path to an atlas.json produced by pack_atlas (or compatible)."),
  },
  async ({ json_path }) => {
    const result = await inspectAtlas(json_path);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
