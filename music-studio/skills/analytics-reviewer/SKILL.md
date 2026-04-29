---
name: analytics-reviewer
description: |
  Turns YouTube analytics into next-episode experiments. Use whenever the
  user asks "what worked", "review analytics", or "what should I try
  next". Reads CTR, retention, comments via the YouTube Data MCP.
  Outputs ranked experiments to try in upcoming episodes.
allowed-tools: Read, Write, mcp__youtube-data__*
model: claude-opus-4-7
---

# Analytics Reviewer

## Inputs

- Episode slug or `last N` (defaults to last 5).
- Channel baseline at `workspace/analytics/baseline.md` (auto-created on
  first run if missing).
- The episode's published artifact in `workspace/publishing/<slug>/` so
  you know the title + thumbnail that shipped.

## Process

1. **Pull metrics** for each episode via `mcp__youtube-data__*`:
   - CTR (impressions click-through rate).
   - Average view duration; retention curve (sampled every 1%).
   - Top traffic sources (browse, suggested, search, external).
2. **Pull top 50 comments** and cluster into themes per
   `references/comment-clustering.md`. Themes: praise, requests,
   criticism, questions.
3. **Identify 10 representative drop-off points** using the retention
   curve. See `references/retention-patterns.md` for what to look for
   (common shapes: cold-open exit, mid-build slump, end-CTA cliff).
4. **Compare against channel baseline** (`workspace/analytics/baseline.md`).
   If the episode beats or trails the baseline by ≥ 20% on any metric,
   flag it explicitly.
5. **Generate 3–5 ranked experiments** for the next 2 episodes. Each
   experiment must include:
   - **Hypothesis** — one sentence.
   - **Which next episode would test it** — by stage or by slug.
   - **Success metric** — measurable: CTR delta ≥ X%, retention at
     0:30 ≥ Y%, etc.
   - **Kill criterion** — the specific result that says "this
     experiment failed, abandon".

## Outputs

- Per-episode review at `workspace/analytics/episodes/<slug>.md`.
- Cross-episode experiments queue at
  `workspace/analytics/experiments-next.md`.
- Updated baseline if the synthesis reveals a shift in CTR / retention
  / top traffic.

## Hard Rules (skill-specific)

- **Sourcing gate (Spec 03 §4):** every claim must cite either a
  YouTube Data API field or a comment ID. No vibes-only claims.
- **Hypotheses must be falsifiable.** "Try a different thumbnail" is
  not falsifiable; "Hand-drawn arrows on the next 3 thumbnails will
  beat clean type by ≥ 1 % CTR over the next 30 days" is.
- **No more than 5 experiments queued.** More than 5 is wishful
  thinking, not a backlog.

## References

- `references/retention-patterns.md` — common retention-curve shapes
  and what they mean.
- `references/comment-clustering.md` — how to bucket comment themes
  without inventing categories.

## Anti-patterns

- Conflating episode-level signals with channel-level trends. One
  episode's data is one data point; needs ≥ 3 to be a trend.
- Recommending experiments that contradict Hard Rules ("try a thumbnail
  with 8 words of headline" — no, Hard Rule 3 says it must be readable
  at 350 px).
- Pulling raw retention data into the review document. Summarise: the
  retention curve goes here, not the per-second numbers.
- Letting a single negative comment drive an experiment. Cluster first,
  weigh by frequency.
