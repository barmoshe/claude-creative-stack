#!/usr/bin/env node
// PostToolUse hook for Bash events.
//
// Spec 04 §4.2: log every ffmpeg invocation to
// workspace/analytics/render-log.md for performance review.
//
// Behaviour:
// - Reads the bash command and exit status from the hook input JSON.
// - If the command starts with `ffmpeg`, appends a row.
// - Anything else: silent exit 0.
// - Logging never fails the parent tool — any error is swallowed and
//   exits 0 so a missing render-log.md doesn't break the session.

const fs = require("fs");
const path = require("path");

let raw = "";
try {
  raw = fs.readFileSync(0, "utf-8");
} catch (_) {
  process.exit(0);
}

let input;
try {
  input = JSON.parse(raw);
} catch (_) {
  process.exit(0);
}

const command = input.tool_input && input.tool_input.command;
if (typeof command !== "string") {
  process.exit(0);
}

const trimmed = command.trim();
if (!/^ffmpeg(\s|$)/.test(trimmed)) {
  process.exit(0);
}

const result = input.tool_response || {};
const status =
  result.exitCode === 0 ? "ok" : `fail(${result.exitCode ?? "?"})`;

// Best-effort: extract the -i input filename to identify the episode.
const inputMatch = trimmed.match(/-i\s+(\S+)/);
const inputFile = inputMatch ? inputMatch[1] : "";
const episodeMatch = inputFile.match(
  /workspace\/(?:video-projects|exports)\/(\d{3}-[a-z0-9-]+)/
);
const episode = episodeMatch ? episodeMatch[1] : "—";

const repoRoot = path.resolve(__dirname, "..");
const logPath = path.join(repoRoot, "workspace/analytics/render-log.md");

const ts = new Date().toISOString();
const truncated =
  trimmed.length > 200 ? trimmed.slice(0, 197) + "..." : trimmed;
const row = `| ${ts} | ${episode} | \`${truncated.replace(
  /\|/g,
  "\\|"
)}\` | ${status} |\n`;

try {
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.writeFileSync(
      logPath,
      "# Render log\n\n" +
        "| Timestamp | Episode | Command | Status |\n" +
        "|---|---|---|---|\n"
    );
  }
  fs.appendFileSync(logPath, row);
} catch (_) {
  // Swallow — log failure must not break the session.
}

process.exit(0);
