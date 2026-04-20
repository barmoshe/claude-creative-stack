---
name: palette-generator
description: Generate accessible oklch color palettes with light and dark variants and a colorblind-safe categorical chart palette. Use when the user asks for a color palette, brand colors, design tokens, theme tokens, color system, or accessible color. Produces CSS custom properties that pass WCAG AA contrast automatically. Pairs with ui-design-kit for full theme generation and with the palette-oklch MCP server for programmatic access.
license: MIT
---

# Palette Generator

## When to trigger

- "Design me a palette"
- "Color tokens for a dark-mode dashboard"
- "Accessible brand colors"
- "Generate chart colors that are colorblind-safe"

## Why oklch

- Perceptually uniform — equal numeric steps look equally different.
- Stable hue under lightness changes — light/dark variants stay the same "family".
- Native to CSS Color 4; all current evergreen browsers support it.
- Plays well with `color-mix()` for hovers and state variants.

## The 9-token base

| Token | Role |
|---|---|
| `--bg` | page background |
| `--surface` | cards, panels |
| `--border` | dividers, input outline |
| `--muted` | subtle fills, skeletons |
| `--text` | primary text |
| `--text-muted` | secondary text |
| `--accent` | CTA / brand |
| `--accent-hover` | hover state of accent |
| `--accent-contrast` | text **on** accent |

## Generation rules

1. **Pick a hue family.** Single primary hue (accent) + neutral. Secondary hues within ±20° of accent if needed.
2. **Lightness ladder:** `bg` L=0.98, `surface` L=0.96, `border` L=0.9, `muted` L=0.93, `text` L=0.2, `text-muted` L=0.45, `accent` L=0.55, `accent-hover` L=0.48, `accent-contrast` picks from `{0.98, 0.15}` based on accent L.
3. **Dark mode:** don't invert. Drop chroma by 10–20%, raise background L to 0.14, surface to 0.18, text to 0.92. Keep accent hue identical; lift accent L by 5.
4. **Contrast verification:** `text` vs `bg` ≥ 4.5:1, `text` vs `surface` ≥ 4.5:1, icon-on-surface ≥ 3:1. Recompute if fail — adjust lightness, not hue.

## Chart palette (5 categorical colors)

- Hue spread ≥ 70° between neighbors.
- Chroma ≈ 0.13 across the set.
- Lightness spread ≥ 15 percentage points for colorblind separation.
- Default starter: `oklch(0.68 0.14 25)`, `oklch(0.62 0.15 140)`, `oklch(0.58 0.14 230)`, `oklch(0.74 0.13 60)`, `oklch(0.52 0.14 300)`.

## Output shape

1. **Token table** — name, light value, dark value, contrast vs bg, role.
2. **CSS block** — `:root` and `.dark` selectors, copy-pasteable.
3. **Chart palette** — 5 oklch values + use-order notes.
4. **Accessibility report** — pairs checked, failures, remediations.

## Optional: programmatic access via MCP

If the `palette-oklch` MCP server is running (see `mcp/servers/palette-oklch`), call `generate_palette` with `{ hue: 250, mode: "light" | "dark" }` to get a validated palette back. This skill can call that tool when the user is in Claude Code and the MCP is wired up.

## Further reading

- `knowledge/05-graphics-design.md` — color section, WCAG math.
- `prompts/generate-palette.md` — ready-to-paste prompt.
- `mcp/servers/palette-oklch/` — MCP server implementing the same generator.
