# Quality gates

Every output that ships through this system passes a gate sequence before reaching the user. The orchestrator runs the sequence; sub-skills are responsible for emitting outputs in the format the gates expect.

## Gate definitions

| Gate | Checks | Triggered by | Retry cap |
|---|---|---|---|
| **Specificity** | Concrete examples, real numbers, no buzzwords. Outputs claiming a benchmark must include the source. | All sub-skills, before delivery. | 1 retry, then surface. |
| **Sourcing** | Any claimed benchmark cites the source (one of the approved sources in `channel-brain/packaging.md`). | `trend-researcher`, `analytics-reviewer`, `episode-strategist`. | 1 retry, then strip the unsourced claim. |
| **Hard-Rules** | Output cannot violate Rules 1–12 (`hard-rules.md`). | Orchestrator, before any sub-skill output reaches the user. | No retry. Halt and surface. |
| **Mobile preview** | Thumbnail readable at 350 px width within 1 second. | `thumbnail-packager`. | 1 retry per variant; cap at 3 total. |
| **Loudness** | Integrated LUFS within ±1 dB of platform target. True peak ≤ −1.0 dBTP. | `audio-engineer`, `/film-episode`, `/ship-episode` pre-flight. | 1 retry. |
| **Self-eval on rendered output** | Visual jumps, audio pops, hidden subtitles, misaligned overlays at every cut boundary. | `/film-episode` step 7. | 3 retries, then surface. |

## Gate ordering

For any deliverable, gates run in this order. The first failing gate halts the sequence:

```
Specificity → Sourcing → Hard-Rules → (deliverable-specific gate)
```

Deliverable-specific gates:

- Thumbnails → Mobile preview.
- Audio outputs → Loudness.
- Rendered video → Self-eval.

## Gate failure handling

When a gate fails:

1. **Log the failure** in `project.md`: which gate, what value, attempted retry.
2. **Apply the retry policy** for that gate.
3. **If retries exhausted, surface to user.** Never silently lower the bar.

The orchestrator must never produce a "good enough, shipping anyway" outcome. Gate failures that exhaust retries are user-decision points.
