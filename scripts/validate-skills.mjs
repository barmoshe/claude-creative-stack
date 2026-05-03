#!/usr/bin/env node
/**
 * Validate every SKILL.md frontmatter against a small schema.
 *
 * Required keys: `name`, `description`.
 * Optional keys: `license`, `version`, `triggers`, `tags`.
 *
 * Exits 0 on success, 1 on first failure with a message identifying the file + key.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SKILLS_DIR = join(process.cwd(), "skills");

function parseFrontmatter(text, file) {
  if (!text.startsWith("---\n")) {
    fail(file, "missing leading `---` frontmatter block");
  }
  const end = text.indexOf("\n---", 4);
  if (end < 0) fail(file, "frontmatter block not closed with `---`");
  const block = text.slice(4, end);
  const obj = {};
  let key = null, value = "";
  for (const line of block.split("\n")) {
    if (/^[A-Za-z][A-Za-z0-9_-]*:\s*/.test(line)) {
      if (key) obj[key] = value.trim();
      const idx = line.indexOf(":");
      key = line.slice(0, idx).trim();
      value = line.slice(idx + 1).trim();
    } else if (line.trim().length) {
      // continuation
      value += " " + line.trim();
    }
  }
  if (key) obj[key] = value.trim();
  return obj;
}

function fail(file, msg) {
  console.error(`✗ ${file}: ${msg}`);
  process.exit(1);
}

function check(skillDir) {
  const skillPath = join(SKILLS_DIR, skillDir, "SKILL.md");
  let text;
  try {
    text = readFileSync(skillPath, "utf8");
  } catch {
    return null; // not a skill (no SKILL.md) — that's fine
  }
  const fm = parseFrontmatter(text, skillPath);

  if (!fm.name || fm.name.length < 2) fail(skillPath, "`name` missing or too short");
  if (!/^[a-z][a-z0-9-]+$/.test(fm.name)) fail(skillPath, `\`name\` must be kebab-case lowercase ([a-z0-9-]), got "${fm.name}"`);
  if (fm.name !== skillDir) fail(skillPath, `\`name\` ("${fm.name}") must match folder name ("${skillDir}")`);

  if (!fm.description || fm.description.length < 30) fail(skillPath, "`description` missing or shorter than 30 chars");
  if (fm.description.length > 1024) fail(skillPath, `\`description\` is ${fm.description.length} chars; cap at 1024`);

  // Body must have at least a top-level heading.
  const body = text.slice(text.indexOf("\n---", 4) + 4);
  if (!/^#\s+/m.test(body)) fail(skillPath, "body has no `#` heading");

  return fm;
}

const entries = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

let count = 0;
for (const dir of entries) {
  const fm = check(dir);
  if (fm) {
    console.log(`✓ skills/${dir}: ${fm.name}`);
    count++;
  }
}
console.log(`\n${count} skill(s) validated.`);
