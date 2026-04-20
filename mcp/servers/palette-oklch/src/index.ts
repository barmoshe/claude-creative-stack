#!/usr/bin/env node
/**
 * palette-oklch MCP server.
 * Exposes `generate_palette`, `contrast_check`, and `chart_palette` over stdio.
 * Mirrors the rules documented in skills/palette-generator/SKILL.md.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// -----------------------------------------------------------------------------
// oklch → sRGB conversion and contrast math
// Reference: https://bottosson.github.io/posts/oklab/ and WCAG 2.1 §1.4.3

type OKLCH = { L: number; C: number; h: number };

function oklchToLinearRgb({ L, C, h }: OKLCH): [number, number, number] {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    +4.076_741_66 * l - 3.307_711_59 * m + 0.230_969_93 * s,
    -1.268_438_05 * l + 2.609_757_40 * m - 0.341_319_35 * s,
    -0.004_196_08 * l - 0.703_418_61 * m + 1.707_614_70 * s,
  ];
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(1, v));
}

function oklchToHex(color: OKLCH): string {
  const [r, g, b] = oklchToLinearRgb(color).map(linearToSrgb);
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function oklchToCssString({ L, C, h }: OKLCH): string {
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`;
}

function relativeLuminance({ L, C, h }: OKLCH): number {
  const [r, g, b] = oklchToLinearRgb({ L, C, h }).map((c) => Math.max(0, Math.min(1, c)));
  // sRGB relative luminance with linearized channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: OKLCH, b: OKLCH): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [bright, dark] = la > lb ? [la, lb] : [lb, la];
  return (bright + 0.05) / (dark + 0.05);
}

// -----------------------------------------------------------------------------
// Palette generation

type Mode = "light" | "dark";

function generatePalette(hue: number, mode: Mode) {
  const h = ((hue % 360) + 360) % 360;

  const tokens: Record<string, OKLCH> =
    mode === "light"
      ? {
          bg:              { L: 0.98, C: 0.01, h },
          surface:         { L: 0.96, C: 0.015, h },
          border:          { L: 0.90, C: 0.02, h },
          muted:           { L: 0.93, C: 0.02, h },
          text:            { L: 0.20, C: 0.02, h },
          "text-muted":    { L: 0.45, C: 0.02, h },
          accent:          { L: 0.55, C: 0.14, h },
          "accent-hover":  { L: 0.48, C: 0.14, h },
          "accent-contrast": { L: 0.98, C: 0.01, h },
        }
      : {
          bg:              { L: 0.14, C: 0.015, h },
          surface:         { L: 0.18, C: 0.02, h },
          border:          { L: 0.28, C: 0.02, h },
          muted:           { L: 0.22, C: 0.02, h },
          text:            { L: 0.92, C: 0.01, h },
          "text-muted":    { L: 0.65, C: 0.01, h },
          accent:          { L: 0.60, C: 0.13, h },
          "accent-hover":  { L: 0.68, C: 0.13, h },
          "accent-contrast": { L: 0.15, C: 0.01, h },
        };

  const bg = tokens.bg;
  const surface = tokens.surface;
  const entries = Object.entries(tokens).map(([name, color]) => ({
    token: name,
    oklch: oklchToCssString(color),
    hex: oklchToHex(color),
    contrastVsBg: +contrastRatio(color, bg).toFixed(2),
    contrastVsSurface: +contrastRatio(color, surface).toFixed(2),
  }));

  const cssVars = Object.entries(tokens)
    .map(([name, color]) => `  --${name}: ${oklchToCssString(color)};`)
    .join("\n");

  return {
    mode,
    hue: h,
    tokens: entries,
    css: `${mode === "dark" ? ".dark" : ":root"} {\n${cssVars}\n}`,
    accessibility: {
      textVsBg: +contrastRatio(tokens.text, tokens.bg).toFixed(2),
      textVsSurface: +contrastRatio(tokens.text, tokens.surface).toFixed(2),
      textMutedVsBg: +contrastRatio(tokens["text-muted"], tokens.bg).toFixed(2),
      accentContrast: +contrastRatio(tokens["accent-contrast"], tokens.accent).toFixed(2),
      passes_AA_text: contrastRatio(tokens.text, tokens.bg) >= 4.5,
      passes_AA_muted: contrastRatio(tokens["text-muted"], tokens.bg) >= 3.0,
    },
  };
}

function chartPalette(hueStart: number) {
  const hues = [0, 115, 205, 35, 275].map((d) => (hueStart + d) % 360);
  const lightness = [0.68, 0.62, 0.58, 0.74, 0.52];
  return hues.map((h, i) => {
    const c: OKLCH = { L: lightness[i], C: 0.14, h };
    return {
      oklch: oklchToCssString(c),
      hex: oklchToHex(c),
      hue: h,
      lightness: lightness[i],
    };
  });
}

// -----------------------------------------------------------------------------
// MCP server

const server = new McpServer({ name: "palette-oklch", version: "0.1.0" });

server.tool(
  "generate_palette",
  "Generate a 9-token oklch palette (bg, surface, border, muted, text, text-muted, accent, accent-hover, accent-contrast) for a given hue and mode. Returns tokens, hex equivalents, CSS block, and an accessibility report.",
  {
    hue: z.number().min(0).max(360).describe("Base hue in degrees 0..360"),
    mode: z.enum(["light", "dark"]).describe("Light or dark token set"),
  },
  async ({ hue, mode }) => {
    const result = generatePalette(hue, mode);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool(
  "contrast_check",
  "Compute WCAG contrast ratio between two oklch colors. Each color is { L: 0..1, C: 0..0.4, h: 0..360 }. Returns the ratio and AA/AAA pass flags.",
  {
    foreground: z.object({ L: z.number().min(0).max(1), C: z.number().min(0).max(0.4), h: z.number().min(0).max(360) }),
    background: z.object({ L: z.number().min(0).max(1), C: z.number().min(0).max(0.4), h: z.number().min(0).max(360) }),
  },
  async ({ foreground, background }) => {
    const ratio = contrastRatio(foreground, background);
    const report = {
      ratio: +ratio.toFixed(2),
      aa_normal: ratio >= 4.5,
      aa_large: ratio >= 3.0,
      aaa_normal: ratio >= 7.0,
      aaa_large: ratio >= 4.5,
    };
    return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
  },
);

server.tool(
  "chart_palette",
  "Produce 5 categorical oklch chart colors. Hue spread 70-90°, chroma ~0.14, lightness varied for colorblind separation.",
  {
    hueStart: z.number().min(0).max(360).describe("Starting hue in degrees"),
  },
  async ({ hueStart }) => {
    const colors = chartPalette(hueStart);
    return { content: [{ type: "text", text: JSON.stringify(colors, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
