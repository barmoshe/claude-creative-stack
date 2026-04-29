# Comment clustering

Cluster comments into 4 buckets. Don't invent more categories — that's how you turn one comment into a "trend".

## Buckets

### 1. Praise

The viewer liked the thing. Examples:
- "this is sick"
- "i need this in my browser tomorrow"
- "the sound at 4:32 is gold"

**Signal value:** low. Praise tells you nothing actionable. Count, don't read.

### 2. Requests

The viewer wants something specific.
- "can you add MIDI export?"
- "would love to see this with FM synthesis"
- "next episode: sampler version?"

**Signal value:** high. These are episode-2 candidates. Cluster requests by feature; the one mentioned by 5+ commenters is a strong signal.

### 3. Criticism

The viewer didn't like something.
- "the demo was too short"
- "i couldn't read the code"
- "ad break ruined the flow"

**Signal value:** medium-high if specific, low if generic. "It was boring" is noise; "the third segment dragged" is signal.

### 4. Questions

The viewer wants to understand.
- "what's that synth at 2:14?"
- "is the source on github?"
- "how does the sequencer pick the next note?"

**Signal value:** medium. Questions that recur across episodes are pinned-comment candidates. They also surface gaps in the script — if 10 people ask the same thing, you didn't explain it.

## Method

For each comment:

1. Pick exactly one bucket. If a comment is "loved it but the demo was short", classify as **criticism** (the actionable signal trumps the politeness).
2. If you can't classify, ignore — likely off-topic.
3. Count per bucket; report counts plus the top-5 most-upvoted in each bucket.

## What to surface to the user

- **Praise count** as a single number.
- **Top 3 requests** (by frequency, with comment IDs).
- **Top 3 criticisms** (by frequency × upvotes).
- **Top 3 questions** (with the gap in the script that produced them).

## Anti-patterns

- Treating one zealous commenter as a trend.
- Inventing a 5th bucket ("vibes-related"). If a comment doesn't fit, it's noise.
- Letting praise volume drown the signal in the other three buckets.
- Reading more than 50 comments per episode. Diminishing returns past that.
