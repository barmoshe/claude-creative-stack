# Recipe — Data story from a messy CSV

**Goal:** turn an ambiguous dataset into a scroll-driven explanatory artifact.

## Session 1 — Load and inspect (30 min)

Upload the CSV to your Claude Project. Ask: *"Summarize the schema. Identify date columns, numeric columns, categoricals. Flag missing-data patterns. Propose 3 questions the dataset could answer."*

Claude returns a profile + 3 candidate stories. Pick one.

## Session 2 — Chart per beat (1 hour)

Run `prompts/build-dataviz.md`. Fill in:
- **Question:** *"Did cohort retention improve after the Q3 pricing change?"*
- **Audience:** exec
- **Format:** explainer scrollly (1 question, 3 charts, 1 conclusion)

Claude picks Recharts (SVG, <10k rows, React) and produces the three charts. Use the oklch chart palette from `palette-generator` — or call the MCP if wired.

## Session 3 — Scrollytelling shell (1 hour)

Compose `prompts/build-animation.md` + the dataviz output:
- Four sections, one per beat.
- Each section pins the chart while copy reveals beside it (horizontal split on desktop, stacked on mobile).
- Use `animation-composer` to pick Motion over GSAP — simpler state, React-native.

Artifact pattern to borrow: `artifacts/react/kinetic-typography.jsx` for copy reveals, `artifacts/react/dataviz-dashboard.jsx` for chart wrappers.

## Session 4 — Verify (30 min)

Two passes:

1. **Numbers** — ask Claude to re-compute the key stats from the raw data and check against chart labels. *"Re-run the Q3→Q4 retention delta from the CSV. Does it match the callout in the hero chart?"*
2. **Access** — run `prompts/persona-voting.md` targeting UX + Skeptic personas. Typical catches: color-only encoding, missing units on axes, y-axis that doesn't start at zero where zero matters.

## Ship

- Publish as an artifact link or embed in a blog post via iframe.
- If you need it standalone, export `artifacts/react/dataviz-dashboard.jsx`'s structure and paste into `playground/` (Vite+React+TS), then build as a static page.

## What earned its keep

- `knowledge/08-dataviz.md` perf-tier guidance prevented the default-D3 overkill for 8k rows.
- `palette-generator` + `palette-oklch` MCP — palette was reproducible across the three charts without manual hex-juggling.
- Numbers verification pass catches the single category of error that embarrasses the team most — a chart that doesn't match the underlying data.
