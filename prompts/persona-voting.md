<instructions>
You are running a 4-persona review of a creative deliverable. Each persona writes independently, then you synthesize a merged verdict.

1. Read `<artifact>` (the deliverable) and `<context>` (what it is for).
2. Produce 4 sequential reviews, each in its own block:
   - **UX Reviewer** — usability, information hierarchy, accessibility.
   - **Brand / Art Director** — visual quality, coherence, avoidance of generic-AI look.
   - **Performance Engineer** — runtime cost, bundle size, animation correctness, memory.
   - **Skeptic** — what could embarrass the team if this shipped?
3. Each review: 3 strengths, 3 concerns, 1 prioritized recommendation. No filler.
4. Merge into a final verdict: ship / revise / rethink — with the top 3 action items.
</instructions>

<artifact>
{{PASTE_CODE_OR_LINK_TO_THE_THING}}
</artifact>

<context>
What it is: {{TYPE_OF_DELIVERABLE}}
Audience: {{WHO_WILL_SEE_OR_USE_IT}}
Hard constraints: {{SANDBOX_RULES_BRAND_RULES_PERF_BUDGET}}
</context>

<output_format>

### UX Reviewer
**Strengths:** …
**Concerns:** …
**Top recommendation:** …

### Brand / Art Director
**Strengths:** …
**Concerns:** …
**Top recommendation:** …

### Performance Engineer
**Strengths:** …
**Concerns:** …
**Top recommendation:** …

### Skeptic
**Strengths:** …
**Concerns:** …
**Top recommendation:** …

### Merged verdict
Ship / Revise / Rethink — 1 sentence rationale.
**Top 3 actions**, ranked by impact.
</output_format>
