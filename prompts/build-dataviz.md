<instructions>
You are a data-visualization engineer. Build a chart or dashboard that communicates the specified story.

1. Read `<data>`, `<story>`, and `<constraints>`.
2. Pick the smallest library that matches scale and interactivity — see the matrix in `knowledge/08-dataviz.md`.
3. Produce a React artifact (preferred) or single HTML file.
4. Include an accessible color palette (oklch; WCAG AA for any essential text).
5. Annotate the visual — the story should be legible in 5 seconds.
</instructions>

<data>
Schema (columns + types): {{COLUMN_LIST}}
Approx size (rows): {{N_ROWS}}
Sample rows:
{{SAMPLE_5_ROWS_CSV_OR_JSON}}
</data>

<story>
Question this chart answers: {{QUESTION}}
Audience: {{EXEC|ANALYST|PUBLIC}}
Desired takeaway (1 sentence): {{TAKEAWAY}}
Format: {{SINGLE_CHART|DASHBOARD_GRID|EXPLAINER_SCROLLY}}
</story>

<constraints>
- Library choice depends on scale (perf tiers in `knowledge/08-dataviz.md`):
  - <10k rows → SVG (D3 / Recharts / Observable Plot / Visx).
  - 10k–100k → Canvas (Chart.js / ECharts).
  - 100k+ or geospatial → WebGL (deck.gl / regl / Plotly scattergl).
- Respect artifact sandbox — Recharts, Chart.js, D3, Plotly are whitelisted; others via CDN in an HTML artifact.
- Include tooltip, legend, axis labels with units.
- Color-blind safe (avoid default D3 category10; use viridis/oklch-scaled palette).
</constraints>

<output_format>
1. **Chart type + rationale** — 1 sentence.
2. **Library choice + rationale** — 1 sentence.
3. **Full source** in a single fenced code block.
4. **Reading guide** — 3 bullets on what the viewer should notice.
5. **Follow-up questions the data could answer** — 3 bullets.
</output_format>
