#!/usr/bin/env node
// Stop hook — scrape the just-finished session for follow-ups Claude flagged
// (markdown checkboxes and TODO/FIXME lines in the final assistant turn) and
// append them to .claude/ISSUES.local.md so the next SessionStart can surface
// them.
//
// Hook contract:
// - stdin: JSON with { transcript_path, cwd, ... }
// - stdout: ignored on success (we exit 0)
// - Failures must be silent — never block a Stop.
//
// Output file is gitignored; it's a per-checkout working memory.

import { readFileSync, appendFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const MAX_BYTES = 64 * 1024;
const MAX_NEW_PER_SESSION = 12;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function lastAssistantText(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return "";
  const lines = readFileSync(transcriptPath, "utf8").split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const entry = safeJson(lines[i]);
    if (!entry) continue;
    const msg = entry.message ?? entry;
    if (msg?.role !== "assistant") continue;
    const content = msg.content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .filter((b) => b?.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join("\n");
    }
  }
  return "";
}

function extractFollowUps(text) {
  if (!text) return [];
  const out = new Set();
  const checkbox = /^\s*[-*]\s*\[ \]\s+(.+?)\s*$/gm;
  const todoLine = /\b(TODO|FIXME|XXX|HACK|Follow-?up)\s*[:(-]\s*(.+?)\s*$/gim;
  for (const m of text.matchAll(checkbox)) out.add(m[1].trim());
  for (const m of text.matchAll(todoLine)) out.add(`${m[1].toUpperCase()}: ${m[2].trim()}`);
  return [...out].slice(0, MAX_NEW_PER_SESSION);
}

function trimFile(path) {
  try {
    const st = statSync(path);
    if (st.size <= MAX_BYTES) return;
    const buf = readFileSync(path, "utf8");
    writeFileSync(path, buf.slice(buf.length - MAX_BYTES));
  } catch { /* ignore */ }
}

function main() {
  const input = safeJson(readStdin()) ?? {};
  const cwd = input.cwd || process.cwd();
  const transcript = input.transcript_path;

  const text = lastAssistantText(transcript);
  const items = extractFollowUps(text);
  if (items.length === 0) return;

  const outDir = join(cwd, ".claude");
  const outPath = join(outDir, "ISSUES.local.md");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const sid = (input.session_id || "").slice(0, 8);
  const header = `\n## ${stamp} ${sid ? `(session ${sid})` : ""}\n`;
  const body = items.map((s) => `- [ ] ${s}`).join("\n") + "\n";

  appendFileSync(outPath, header + body);
  trimFile(outPath);
}

try { main(); } catch { /* fail-soft */ }
process.exit(0);
