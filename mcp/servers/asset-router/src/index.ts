#!/usr/bin/env node
/**
 * asset-router MCP server.
 *
 * Single tool surface for image / voice / music / video generation. Routes to
 * Replicate / ElevenLabs / Suno / Luma / Runway based on rules in routing.ts.
 * Falls back to deterministic stubs when API keys are missing so recipes and
 * CI runs stay green offline.
 *
 * Env keys (all optional):
 *   REPLICATE_API_TOKEN   — Replicate
 *   ELEVENLABS_API_KEY    — ElevenLabs
 *   FAL_KEY               — fal.ai (not yet wired; routes still fall back to Replicate)
 *   SUNO_API_KEY          — Suno (currently stubbed)
 *   LUMAAI_API_KEY        — Luma (currently stubbed)
 *   RUNWAY_API_KEY        — Runway (currently stubbed)
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { pickRoute, unitCount } from "./routing.js";
import {
  generateImage, generateVoice, generateMusic, generateVideo,
} from "./providers.js";

const server = new McpServer({ name: "asset-router", version: "0.1.0" });

server.tool(
  "generate_image",
  "Generate one or more images. Routes to Flux / Recraft / SDXL based on `style`. Returns URLs and provenance. Falls back to a deterministic SVG stub when REPLICATE_API_TOKEN is not set.",
  {
    prompt: z.string().min(1),
    style:  z.enum(["photoreal", "stylized", "vector", "pixel", "ideation"]).default("stylized"),
    ratio:  z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("1:1"),
    count:  z.number().int().min(1).max(8).default(1),
    seed:   z.number().int().optional(),
    provider: z.enum(["replicate", "fal", "stub"]).optional(),
  },
  async ({ prompt, style, ratio, count, seed, provider }) => {
    const route = pickRoute({ task: "image", style, provider });
    const results = await generateImage({ prompt, count, ratio, seed }, route.model, process.env);
    return { content: [{ type: "text", text: JSON.stringify({ route, results }, null, 2) }] };
  },
);

server.tool(
  "generate_voice",
  "Generate a voiceover from text. Uses ElevenLabs Multilingual v2. Falls back to a silent-WAV stub when ELEVENLABS_API_KEY is not set.",
  {
    text: z.string().min(1).max(5000),
    voice_id: z.string().optional().describe("ElevenLabs voice ID (default: Rachel)."),
  },
  async ({ text, voice_id }) => {
    const route = pickRoute({ task: "voice" });
    const results = await generateVoice({ text, voice_id }, route.model, process.env);
    return { content: [{ type: "text", text: JSON.stringify({ route, results }, null, 2) }] };
  },
);

server.tool(
  "generate_music",
  "Generate a music loop or song. Routes to Suno v4.5 (instrumental / vocal variant). Currently always returns a stub — wire SUNO_API_KEY + the Suno API for production.",
  {
    prompt: z.string().min(1),
    duration_s: z.number().int().min(5).max(240).default(60),
    instrumental: z.boolean().default(true),
  },
  async ({ prompt, duration_s, instrumental }) => {
    const route = pickRoute({ task: "music", instrumental });
    const results = await generateMusic({ prompt, duration_s, instrumental }, route.model, process.env);
    return { content: [{ type: "text", text: JSON.stringify({ route, results }, null, 2) }] };
  },
);

server.tool(
  "generate_video",
  "Generate a short video clip. Routes to Luma Ray-2 (≤5s) or Runway Gen-3 Alpha Turbo (>5s). Currently always returns a stub — wire LUMAAI_API_KEY / RUNWAY_API_KEY for production.",
  {
    prompt: z.string().min(1),
    duration_s: z.number().int().min(2).max(20).default(5),
    ratio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  },
  async ({ prompt, duration_s, ratio }) => {
    const route = pickRoute({ task: "video", duration_s });
    const results = await generateVideo({ prompt, duration_s, ratio }, route.model, process.env);
    return { content: [{ type: "text", text: JSON.stringify({ route, results }, null, 2) }] };
  },
);

server.tool(
  "estimate_cost",
  "Estimate the cost of a generation request without running it. Uses static MAY-2026 ballpark prices. For exact pricing, the real provider call has authoritative numbers in its response.",
  {
    task: z.enum(["image", "voice", "music", "video"]),
    style: z.string().optional(),
    instrumental: z.boolean().optional(),
    duration_s: z.number().optional(),
    count: z.number().int().min(1).max(64).default(1),
    text: z.string().optional(),
    provider: z.enum(["replicate", "fal", "elevenlabs", "suno", "luma", "runway", "stub"]).optional(),
  },
  async (req) => {
    const route = pickRoute({ task: req.task, style: req.style, instrumental: req.instrumental, duration_s: req.duration_s, provider: req.provider });
    const units = unitCount({ task: req.task, style: req.style }, { count: req.count, text: req.text, duration_s: req.duration_s }, route);
    const cents = units * route.cost_cents_per_unit;
    return {
      content: [{ type: "text", text: JSON.stringify({
        route,
        units,
        unit: route.unit,
        estimated_cost_cents: +cents.toFixed(2),
        estimated_cost_usd: +(cents / 100).toFixed(4),
        is_stub_mode: route.provider === "stub",
      }, null, 2) }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
