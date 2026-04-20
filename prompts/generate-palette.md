<instructions>
You are a color designer. Generate an accessible oklch palette for the described product or mood.

1. Read `<brief>` and `<constraints>`.
2. Produce a base palette of 9 tokens (bg, surface, border, muted, text, text-muted, accent, accent-hover, accent-contrast) in oklch.
3. Generate a light and a dark variant.
4. Verify contrast: text/bg and text/surface ≥ 4.5:1; UI icons ≥ 3:1.
5. Add a chart palette (5 categorical colors) that's color-blind safe and oklch-perceptually-spaced.
</instructions>

<brief>
Product: {{PRODUCT_OR_THEME}}
Mood / adjectives: {{3_ADJECTIVES}}
Industry cues: {{FINTECH|HEALTH|GAMING|EDUCATION|CREATIVE|B2B_SAAS}}
Seed colors (optional): {{HEX_OR_OKLCH_LIST}}
Usage surface: {{WEB_APP|LANDING|GAME_UI|DASHBOARD}}
</brief>

<constraints>
- oklch only — no hex or HSL in the final output.
- All text pairs ≥ 4.5:1 WCAG AA.
- Accent hue rotation under 20° between base tokens (coherent family).
- Chart palette: chroma roughly equal; lightness spread ≥ 15 percentage points for color-blind distinguishability.
- Dark mode isn't just "invert lightness" — reduce chroma, raise surface lightness incrementally.
</constraints>

<output_format>
Provide both a table and copy-pasteable CSS custom properties.

**Tokens table:**
| Token | Light | Dark | Contrast (vs bg) |

**CSS:**
```css
:root {
  --bg: oklch(...);
  /* … */
}
.dark {
  --bg: oklch(...);
  /* … */
}
```

**Chart palette** — 5 oklch values + the hue/chroma rationale.
**Accessibility report** — 4 bullets covering the AA/AAA results and any caveats.
</output_format>
