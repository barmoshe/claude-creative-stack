#!/usr/bin/env bash
# SessionStart hook — emit a graphify briefing + git log + open-issues tail
# as `additionalContext` so the model wakes up with structural awareness.
#
# Hook contract:
# - Read JSON from stdin (we don't need any field; just consume it).
# - Emit `{ "hookSpecificOutput": { "hookEventName": "SessionStart",
#   "additionalContext": "<text>" } }` on stdout.
# - Always exit 0. Never break a session.
#
# See knowledge/16-hooks-and-retrieval.md.

set +e
trap 'exit 0' ERR

# Drain stdin so the parent doesn't see SIGPIPE.
cat >/dev/null 2>&1 || true

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$repo_root" || exit 0

report="$repo_root/graphify-out/GRAPH_REPORT.md"

# 1. Build / refresh the graph if graphify is on PATH and the report is
#    missing or older than the most recent file under the source dirs.
if command -v graphify >/dev/null 2>&1; then
  needs_build=1
  if [ -f "$report" ]; then
    newest_src="$(find knowledge skills prompts recipes CLAUDE.md README.md \
      -type f -newer "$report" -print -quit 2>/dev/null)"
    [ -z "$newest_src" ] && needs_build=0
  fi
  if [ "$needs_build" = "1" ]; then
    timeout 60 graphify . >/dev/null 2>&1 || true
  fi
fi

# 2. Compose the briefing. Stay terse — this is paid context.
briefing=""

if [ -f "$report" ]; then
  briefing+="## graphify briefing"$'\n'
  briefing+='```'$'\n'
  briefing+="$(head -n 80 "$report")"$'\n'
  briefing+='```'$'\n\n'
fi

if git rev-parse --git-dir >/dev/null 2>&1; then
  briefing+="## recent commits"$'\n'
  briefing+='```'$'\n'
  briefing+="$(git log --oneline -5 2>/dev/null)"$'\n'
  briefing+='```'$'\n\n'
fi

issues_file="$repo_root/.claude/ISSUES.local.md"
if [ -s "$issues_file" ]; then
  briefing+="## open follow-ups (from .claude/ISSUES.local.md tail)"$'\n'
  briefing+='```'$'\n'
  briefing+="$(tail -n 20 "$issues_file")"$'\n'
  briefing+='```'$'\n'
fi

[ -z "$briefing" ] && exit 0

# 3. Emit the JSON. Use jq if present for safe escaping; fall back to
#    python3, then a best-effort here-doc.
if command -v jq >/dev/null 2>&1; then
  printf '%s' "$briefing" | jq -Rs '{
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: .
    }
  }'
elif command -v python3 >/dev/null 2>&1; then
  printf '%s' "$briefing" | python3 -c '
import json, sys
print(json.dumps({
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": sys.stdin.read()
  }
}))
'
else
  # Best-effort: strip control chars + escape quotes/newlines/backslashes.
  esc="${briefing//\\/\\\\}"
  esc="${esc//\"/\\\"}"
  esc="${esc//$'\n'/\\n}"
  esc="${esc//$'\r'/}"
  esc="${esc//$'\t'/\\t}"
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$esc"
fi

exit 0
