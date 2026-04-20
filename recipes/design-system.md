# Recipe — Design system from zero

**Goal:** oklch tokens + dark mode + component kit + documentation site in a weekend.

## Session 1 — Tokens (30 min)

Run `prompts/generate-palette.md`. Seed it with your brand hue (or let Claude pick). Output: 9 tokens × 2 modes + a 5-color chart palette + accessibility report.

If `palette-oklch` MCP is wired, call `generate_palette({ hue: 260, mode: "light" })` and `generate_palette({ hue: 260, mode: "dark" })` directly from Claude Code. Faster, versionable.

Save the CSS output as `tokens.css`. Commit.

## Session 2 — Primitives (2 hours)

Run `prompts/generate-ui-kit.md` with your tokens + a density choice. Claude produces a default-exported React artifact with 10 components wired to your CSS variables.

Port to a component library shape:
- Split the single artifact into one file per component in `playground/src/components/`.
- Switch runtime to real Tailwind v4 config (artifact uses core utilities; your library can use arbitrary values).
- Export via `index.ts`.

## Session 3 — Docs site (2 hours)

Options:
- **Fastest:** one HTML artifact per component with a showcase and code snippet. Pin to a GitHub Pages branch.
- **Proper:** Vite+React+TS + a small routing shell. Each component page embeds the live preview, prop table, and copy-to-clipboard code.

Use `prompts/build-landing-hero.md` for the docs homepage — *"Design system landing, understated, hero with a live token-swap demo."*

## Session 4 — Governance (1 hour)

Write `tokens.md` in the docs site:
- How tokens map to CSS variables.
- When to add a new token vs. use an existing one.
- Dark mode flipping strategy.

Then `prompts/critique-and-refine.md` against your component kit. Typical catches:
- `<Button>` has an icon-only variant with no `aria-label`.
- `<Dialog>` doesn't return focus to the trigger on close.
- `<Tabs>` Arrow-key handler swallows Home/End — add support.

Fix and commit.

## Ongoing

- When someone proposes a new component, ask Claude: *"Check this against `skills/ui-design-kit` rules. Does it use existing tokens? Does it pass AA? Is there a simpler existing primitive?"*
- Every quarter: re-run `palette-oklch generate_palette` with current brand hue to check whether token values drifted vs. your design source of truth.

## What earned its keep

- `skills/palette-generator` + MCP — made the palette a function of inputs, not a one-shot design decision that bit-rots.
- `prompts/generate-ui-kit.md` — one-shot primitives were ~70% of the way there; the remaining 30% was packaging, not design.
- Persona-voting and critique-and-refine — kept accessibility from sliding over time.
