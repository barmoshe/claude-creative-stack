#!/usr/bin/env node
// PostToolUse hook for Write events.
//
// Enforces the export naming convention from Spec 04 §7.3:
//   workspace/exports/<NNN>-<slug>/<NNN>-<slug>-{video|short-N|thumb-N|audio}.<ext>
//
// Hard Rule 10: final exports only go in workspace/exports/<NNN>-<slug>/.
//
// Behaviour:
// - If the write is not under workspace/exports/, exit 0 silently.
// - If the path matches the convention, exit 0 silently.
// - If the path violates the convention, write a warning to stderr and
//   exit 2 (non-blocking warning visible to Claude).

const fs = require("fs");

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

const writePath = input.tool_input && input.tool_input.file_path;
if (typeof writePath !== "string" || !writePath.includes("workspace/exports/")) {
  process.exit(0);
}

const pattern =
  /workspace\/exports\/(\d{3})-([a-z0-9-]+)\/\1-\2-(video|short-\d+|thumb-\d+|audio)\.(mp4|mov|wav|mp3|png|jpg)$/;

if (!pattern.test(writePath)) {
  process.stderr.write(
    `[validate-export-name] Path violates export convention:\n  ${writePath}\nExpected: workspace/exports/NNN-slug/NNN-slug-{video|short-N|thumb-N|audio}.ext\n`
  );
  process.exit(2);
}

process.exit(0);
