---
name: trend-researcher
description: |
  Finds clickable, finishable music-tech build ideas. Use whenever the
  user wants new episode ideas, asks "what should I build next", or
  the orchestrator is in research stage. Returns ranked candidates,
  each with click-potential, build-feasibility, musical-payoff, and
  shorts-potential scores.
allowed-tools: WebSearch, WebFetch, Read, Write
model: claude-sonnet-4-6
context: fork
agent: Explore
---

# Trend Researcher

## Principle

Run in a forked Explore context to keep the main session lean. Return a
ranked list with explicit scores; the orchestrator synthesises.

## Inputs

- Topic seed (1–3 keywords) or the literal string `open` for free
  exploration.

## Process

1. **Reddit pass.** Search `r/edmproduction`, `r/synthesizers`,
   `r/audioengineering`, `r/ableton` for unsolved problems matching the
   seed. Look for posts with ≥ 50 upvotes asking "is there a tool that
   does X?"
2. **YouTube benchmark pass.** Search music-tech build videos from the
   last 12 months. Capture: title, hook (first 8 s), view count,
   thumbnail style, why it worked or didn't.
3. **GitHub trending + Hacker News.** Music-related repos trending in
   the last 90 days. New audio libs, browser-audio experiments, MIDI
   tools.
4. **Cluster** findings into 5–10 candidate ideas. Each candidate is a
   buildable thing with a clear demo path.
5. **Score each candidate** on the 4 dimensions (1–5 scale per
   `references/scoring-rubric.md`):
   - **Click potential** — would a stranger click?
   - **Build feasibility** — can it ship in 1–3 sessions?
   - **Musical payoff** — does the demo sound good?
   - **Shorts potential** — does it cut into ≥ 2 viral-shaped clips?
6. **Return ranked list** with one-paragraph rationale per candidate.
   Cite sources from `references/sources.md` for every benchmark stat.

## Outputs

Append to `workspace/trend-bank/<YYYY-MM-DD>-<seed>.md`:

```markdown
# Trend research — <seed> — <YYYY-MM-DD>

## Top candidates

### 1. <Idea title> (score: 4.5 / 5.0)

- Click potential: 5 — based on r/synthesizers post (link), 340 upvotes.
- Build feasibility: 4 — Tone.js + 200 lines.
- Musical payoff: 5 — natural fit for techno aesthetic.
- Shorts potential: 4 — final-demo drop + before/after both work.

**Rationale:** ...

**Source:** ...
```

## Hard Rules (skill-specific)

- **Sourcing gate.** Every benchmark stat cites a source from
  `references/sources.md`. No vibes.
- **Specificity gate.** "Music tools are popular" doesn't count.
  Concrete: "this Reddit thread (link), 340 upvotes, asking for X."
- **Build-feasibility floor:** 3 / 5 minimum. A 2 / 5 candidate is a
  research project, not an episode.

## References

- `references/sources.md` — approved sources for sourcing claims.
- `references/scoring-rubric.md` — the 4-dimension scale definitions.

## Anti-patterns

- Returning generic categories ("synthesizers", "drum machines") instead
  of specific buildable ideas ("a Euclidean rhythm sequencer that maps
  the polyrhythms onto a circle").
- Citing "the community" or "many users" — not a source.
- Inflating click-potential because the topic is exciting. The score
  reflects evidence, not enthusiasm.
- Returning more than 10 candidates. The orchestrator picks; if you
  return 30, you're hiding from the ranking decision.
