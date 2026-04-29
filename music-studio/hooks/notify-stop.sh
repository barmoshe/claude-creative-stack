#!/usr/bin/env bash
# Stop hook (Spec 04 §4.3).
#
# Desktop notification when a Claude Code session ends. Useful for long
# renders or builds. Cross-platform: tries macOS first (osascript), then
# Linux (notify-send), then falls back to a printed message.
#
# Hook authoring rules (Spec 04 §4.4):
# - Exit cleanly (status 0). A failing notify must not break the session.
# - Idempotent — may run more than once for the same event.
# - No filesystem writes outside hooks/.

set -e

TITLE="Music Studio"
MESSAGE="Claude session finished"

if command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\"" 2>/dev/null || true
elif command -v notify-send >/dev/null 2>&1; then
  notify-send "$TITLE" "$MESSAGE" 2>/dev/null || true
else
  # WSL / no GUI: silent fallback. Don't pollute stderr — that would be
  # visible in the next session.
  :
fi

exit 0
