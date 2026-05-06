# 16 — Hooks & retrieval

Hooks are how this repo wakes up smart. They run shell commands at fixed
points in a Claude Code session and can inject text into the model's context
without the user typing anything. Used right, they replace a paragraph of
"please remember to check…" boilerplate with deterministic context injection.

This file documents the two hooks shipped in `.claude/settings.json`, the
input/output contract, and the opt-in `UserPromptSubmit` retrieval pattern.

> Scope: Claude Code (CLI / desktop / web). The hook events listed here are
> the stable ones as of May 2026 — Anthropic adds new ones quietly, so check
> the official docs before relying on anything not listed here.

## Event cheatsheet

| Event | Fires | Useful for |
|---|---|---|
| `SessionStart` | new session, resume, `/clear`, post-compact | one-shot briefing — graphify report, recent commits, open follow-ups |
| `UserPromptSubmit` | every user turn, before the model sees it | RAG-lite — pull the most relevant knowledge chunk for the prompt |
| `PreToolUse` | before any tool call | block dangerous ops, redact args |
| `PostToolUse` | after a tool call returns | lint on Edit/Write, log writes |
| `Stop` | the agent finishes its turn | persist follow-ups, close lab notebook entry |
| `SubagentStop` | a subagent finishes | aggregate subagent output |
| `PreCompact` / `SessionEnd` | before compaction / on exit | flush state |
| `Notification` | model sends a notification | route to OS notifier |

## I/O contract

Every hook receives a JSON payload on **stdin**:

```json
{
  "session_id": "abc123",
  "source": "startup|resume|clear|compact",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/workspace/repo",
  "hook_event_name": "SessionStart",
  "permission_mode": "default"
}
```

Two ways to respond:

1. **Exit code only** — exit 0 is success, non-zero is logged but doesn't kill
   the session. Stdout is shown to the user as a plain message.
2. **JSON on stdout** — for events that accept structured output. The shape
   the runtime cares about:

   ```json
   {
     "hookSpecificOutput": {
       "hookEventName": "SessionStart",
       "additionalContext": "…markdown text…"
     }
   }
   ```

   `additionalContext` is appended to the model's system context for the rest
   of the session (or for the current turn, on `UserPromptSubmit`). This is
   the lever — anything you put here, Claude sees without the user typing it.

Environment variables available inside hook scripts:

- `$CLAUDE_PROJECT_DIR` — repo root
- `$CLAUDE_ENV_FILE` — append `export KEY=val` lines to persist for the session
- `$CLAUDE_CODE_REMOTE` — `"true"` when running on Claude Code on the web

## Shipped hooks

### SessionStart → `.claude/hooks/session-start.sh`

Builds a one-page briefing from three sources:

1. **graphify report** (`graphify-out/GRAPH_REPORT.md`) if graphify is on
   `PATH` and the report is older than the source files. Refreshed with
   `graphify .` (60 s timeout). If graphify isn't installed, this section is
   skipped silently — the hook never fails the session.
2. **`git log --oneline -5`** — what's been happening recently.
3. **`.claude/ISSUES.local.md` tail** — open follow-ups from prior sessions.

The briefing is JSON-encoded with `jq` (preferred) or `python3` (fallback) so
multi-line markdown survives intact.

Validate locally:

```bash
echo '{}' | bash .claude/hooks/session-start.sh | jq .
```

### Stop → `.claude/hooks/save-issues.mjs`

Reads `transcript_path` from the stdin payload, finds the last assistant
turn, and extracts unchecked checkboxes (`- [ ] foo`) plus `TODO:` /
`FIXME:` / `Follow-up:` lines from it. Unique entries are appended to
`.claude/ISSUES.local.md` under a timestamped header. The file is capped at
64 KB to stay bounded.

`.claude/ISSUES.local.md` is **gitignored** — it's per-checkout working
memory, not shared state.

## Opt-in: `UserPromptSubmit` retrieval

A simple keyword retriever over `knowledge/` is often enough to beat
end-to-end embedding RAG for a small, well-curated corpus. To enable it, add
the entry below to `.claude/settings.json`:

```json
"UserPromptSubmit": [
  {
    "hooks": [
      { "type": "command", "command": "node .claude/hooks/retrieve.mjs" }
    ]
  }
]
```

A minimal `retrieve.mjs`:

```javascript
#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const prompt = (input.prompt || "").toLowerCase();
const root = join(input.cwd || ".", "knowledge");

const terms = [...new Set(prompt.split(/\W+/).filter((t) => t.length > 3))];
if (terms.length === 0) process.exit(0);

const scored = readdirSync(root)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const body = readFileSync(join(root, f), "utf8").toLowerCase();
    const score = terms.reduce((n, t) => n + (body.split(t).length - 1), 0);
    return { f, score };
  })
  .filter((x) => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 2);

if (scored.length === 0) process.exit(0);

const ctx = scored
  .map(({ f }) => `### knowledge/${f}\n${readFileSync(join(root, f), "utf8")}`)
  .join("\n\n");

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: ctx,
  },
}));
```

Why it's opt-in: this fires on **every** user turn and pulls full files into
context, which costs tokens. Turn it on only if you find yourself reminding
Claude to check `knowledge/` repeatedly.

## Caveats

- Hook scripts must be **fast** — anything over a few seconds delays the user.
  Use `timeout` aggressively. The 60 s graphify ceiling is already long.
- Hooks run with the user's permissions and full network/filesystem access.
  Don't pipe arbitrary remote content into the model via `additionalContext`
  — that's a prompt-injection vector.
- If a hook crashes (non-zero exit, malformed JSON), the runtime logs it and
  moves on. Test locally with the one-liner above before shipping.
- `additionalContext` is **paid context**. Keep briefings under ~2 KB. The
  shipped SessionStart hook trims `GRAPH_REPORT.md` to its first 80 lines for
  this reason.
- Async mode (`{"async": true, "asyncTimeout": 300000}`) is available but
  introduces races — the agent may run a tool before the hook finishes. Only
  use it for dependency installs, not context injection.

## Further reading

- `knowledge/10-workflows.md` — where hooks sit in the Skill / Artifact / MCP
  layering.
- `skills/graphify/SKILL.md` — the report this hook surfaces.
- Anthropic docs: <https://docs.claude.com/en/docs/claude-code/hooks>.
