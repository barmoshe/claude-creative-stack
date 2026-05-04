---
name: critique-loop
description: Run a structured self-critique on an in-progress artifact, design, or generated asset using a chosen persona (designer, engineer, accessibility auditor, game-feel critic, copy editor). Use when the user asks to "critique this", "review this", "what's wrong with…", or wants an iteration loop ("keep going until it's good"). Produces a numbered punch list with severity, and — when invoked from inside an artifact — calls the key-less Claude API endpoint to render a screenshot-grounded critique. Pairs with the asset-generator and artifact-game-builder skills.
license: MIT
---

# Critique Loop

Formalizes the "Claudeception" pattern from `prompts/critique-and-refine.md` and `prompts/persona-voting.md` into a reusable skill.

## When to trigger

- "Critique this artifact / design / shader / sprite / track."
- "What's wrong with…"
- "Make it better — explain what changed and why."
- "Run a design review."
- "Iterate on this until <N> rounds or no critic finds a P0/P1."

## Persona menu

Each persona has a system prompt, a checklist, and a severity rubric. Pick one or many.

| Persona | Lens | Severity rubric |
|---|---|---|
| **product-designer** | Hierarchy, alignment, typography, color contrast, spacing, copy. | P0=broken, P1=ugly, P2=cleanup. |
| **front-end-engineer** | Composite-only animation, INP, bundle size, accessibility hooks, semantics. | P0=fails, P1=slow, P2=non-idiomatic. |
| **a11y-auditor** | Keyboard, focus, screen reader, captions, motion sensitivity, color contrast. | P0=AT-blocking, P1=AT-friction, P2=optional polish. |
| **game-feel-critic** | Inputs, juice, hitstop, particle density, sound layering, camera. | P0=feels broken, P1=flat, P2=more juice. |
| **copy-editor** | Voice, length, scannability, cognitive load. | P0=wrong, P1=clunky, P2=brand-drift. |
| **brand-guardian** | Token compliance, color/typography fidelity to a system. | P0=violation, P1=drift, P2=advisory. |
| **shader-critic** | Composition, banding, perf budget, mobile precision, mouse range. | P0=broken, P1=ugly on mobile, P2=stylistic. |

## How to run

### Option A — skill in conversation (most common)

The skill prompts Claude to apply one persona at a time. Output is always:

1. **Score** out of 10 for this persona's lens.
2. **Punch list** — `[P0]/[P1]/[P2]` numbered items, each with `where` (selector / line / region) + `why` + `fix`.
3. **Single recommended next step**.

### Option B — multi-persona vote

Run 3 personas in parallel; tally by severity. Used when a decision needs balancing forces (e.g. designer-vs-engineer tradeoffs). Implementation lives in `prompts/persona-voting.md`.

### Option C — inside an artifact (Claudeception)

When the artifact is a runnable preview (game, dataviz, shader), include the `claudeception-critic.jsx` button pattern (see `artifacts/react/claudeception-critic.jsx`). The artifact:

1. Captures a `canvas.toDataURL("image/png")` of the current state.
2. Posts the image + the artifact's source code to `https://api.anthropic.com/v1/messages` with the chosen persona's system prompt.
3. Streams back the punch list into a side panel.

Cache the system prompt with `cache_control: { type: "ephemeral", ttl: "1h" }` — re-running the critique is the common case.

```js
const r = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: [
      { type: "text", text: PERSONA_PROMPTS[persona], cache_control: { type: "ephemeral", ttl: "1h" } },
    ],
    messages: [{ role: "user", content: [
      { type: "image", source: { type: "base64", media_type: "image/png", data: pngBase64 } },
      { type: "text", text: `Source:\n\`\`\`jsx\n${source}\n\`\`\`\n\nReturn a P0/P1/P2 punch list.` },
    ]}],
  }),
});
```

### Option D — iteration loop

Run critique → apply one P0 fix → re-critique. Stop when:

- No P0 or P1 items remain, **or**
- Maximum N iterations reached (default 5), **or**
- The user types "stop / good enough / ship it".

## Output format

Always Markdown, always numbered, always with severity tags:

```
Score: 7/10 (product-designer)

P0 — header (.hero h1) the type ramp jumps from 16px to 64px with no intermediate step;
     visually the "what is this" line gets lost.
     Fix: introduce a 32px subhead between the headline and the body copy.

P1 — CTA (button.primary) low contrast against the bg-blue-100 fill (3.8:1).
     Fix: switch to bg-blue-700 / text-white (8.2:1).

P2 — overall whitespace tight on mobile.
     Fix: increase section padding from 4rem to 6rem on viewports >= 768px.

Next step: address P0; re-render; rerun critique.
```

## Composition

- Pair with **asset-generator** to grade generated images against the brief.
- Pair with **artifact-game-builder** to grade game-feel ("more juice" loop).
- Pair with **palette-generator** to sanity-check WCAG.

## Pitfalls

- **Don't run all 7 personas at once unless asked.** Cost + signal-to-noise both lose.
- **Always include the brief** in the critique input. A persona without a goal scores everything against its own taste, not the user's.
- **Iteration loops drift**. After 3 rounds, ask the user to confirm direction before continuing.
- **Cache the persona system prompts** when running loops — they're the bulk of the input tokens.

## Further reading

- `prompts/critique-and-refine.md` — the canonical XML scaffold this skill draws from.
- `prompts/persona-voting.md` — multi-persona voting pattern.
- `prompts/shader-critique.md` — shader-specific persona invocation.
- `artifacts/react/claudeception-critic.jsx` — in-artifact pattern.
- `artifacts/react/shader-jam.jsx` — flagship demo using this skill (W8).
- `knowledge/09-prompting.md` — XML tags, caching strategy.
- `knowledge/14-accessibility-performance.md` — for the `a11y-auditor` persona's lens.
