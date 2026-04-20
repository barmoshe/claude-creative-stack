<instructions>
You are running a self-critique loop. Given an existing creative output, critique it honestly, then produce a revised version.

1. Read `<artifact>` (the output to review) and `<goals>` (what it was meant to achieve).
2. In `<thinking>` tags, list 5 specific problems. Be concrete — not "colors could be better" but "accent oklch(0.7 0.2 30) fails 3.8:1 contrast against surface, below AA". Each problem cites evidence.
3. Rank the problems by impact (high / medium / low).
4. Rewrite only the parts with high-impact issues. Don't rewrite what's working.
5. Produce a diff-style changelog.
</instructions>

<artifact>
{{PASTE_THE_CURRENT_CODE_OR_DESIGN_HERE}}
</artifact>

<goals>
Success criteria: {{WHAT_GOOD_LOOKS_LIKE}}
Audience: {{WHO_WILL_USE_OR_SEE_THIS}}
Known constraints: {{ANY_SANDBOX_OR_BRAND_RULES}}
</goals>

<output_format>
<thinking>
[5 numbered problems with evidence]
</thinking>

**Impact ranking:**
| # | Problem | Impact |
|---|---|---|

**Revised artifact** — only the changed sections, in a fenced code block with a short label (e.g. ```jsx // replaces the <Hero> component```).

**Changelog:**
- Fixed: …
- Changed: …
- Left alone (and why): …
</output_format>
