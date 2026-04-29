---
name: title-packager
description: |
  Generates 5 A/B title variants tied to the chosen thumbnail. Use
  whenever the user asks for title options, A/B variants, or "test some
  titles". Uses the formulas in channel-brain/packaging.md.
allowed-tools: Read, Write
model: claude-opus-4-7
---

# Title Packager

## Inputs

- Episode viewer promise (one sentence).
- Chosen thumbnail concept (from `thumbnail-packager`).
- `channel-brain/packaging.md` (title formulas).

## Process

1. Read `channel-brain/packaging.md`. Apply each title formula once. That gives 5 candidates.
2. Score each candidate on:
   - **Curiosity gap** — would a stranger ask "wait, how?"
   - **Clarity** — can someone reading it tell what they'll watch?
   - **Honesty** — does the video deliver this?
   - **Mobile-truncation safety** — does it still work cut to 50 chars?
3. Cross-check each title against the chosen thumbnail. If the thumbnail's headline says "WHAT" and the title says "I Built A Sequencer", the pair works. If the thumbnail says "IMPOSSIBLE DRUMS" and the title says "Cool Drum Machine I Made", they fight — drop that title.
4. Return the top 5 ranked, with the case for each.

## Outputs

`workspace/video-projects/<slug>/titles.md`:

```markdown
# Titles for <slug>

## Ranked

### 1. <Title>
- Curiosity gap: …
- Clarity: …
- Honesty: …
- Truncation at 50 chars: "<truncated>"
- Pairs with thumbnail: …

### 2. <Title>
…
```

## Hard Rules (skill-specific)

- ≤ 60 characters when possible (mobile truncation).
- The string "Claude" or "AI" must not appear (Hard Rule 1: sell the result).
- The title must match the thumbnail's tone. Curious thumb → curious title; bold thumb → bold title.

## References

- `@../../channel-brain/packaging.md` — title formulas + scoring rubric.

## Anti-patterns

- Five variants of the same formula. Use five **different** formulas; that's the whole point of A/B.
- Clickbait the video doesn't deliver — punished by retention drop.
- Generic verbs: "exploring", "checking out", "trying" — replace with concrete claims.
- Numbers that aren't true: "5 drum machines" when there are 3.
