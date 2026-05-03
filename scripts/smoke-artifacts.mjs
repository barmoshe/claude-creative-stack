#!/usr/bin/env node
/**
 * Headless smoke test for HTML artifacts.
 *
 * For each file in artifacts/html/*.html:
 *   - load it via file:// in headless Chromium
 *   - wait up to 4s for `window.__ready` (artifacts can opt in) or DOMContentLoaded
 *   - assert no console errors
 *
 * Skips: webgpu-tsl-shader.html (requires `navigator.gpu` or external mesh CDN).
 *
 * Uses `playwright/test`. CI installs it on demand:
 *   npx --yes playwright@1.46.0 install chromium
 */
import { chromium } from "playwright";
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIR = join(ROOT, "artifacts", "html");
const SKIP = new Set([
  "webgpu-tsl-shader.html",       // needs navigator.gpu and ESM imports from esm.sh that may rate-limit
  "barmoshe-portfolio.html",      // long-form static page; not a starter
]);

const failures = [];

const browser = await chromium.launch();
const ctx = await browser.newContext();

for (const file of readdirSync(DIR).sort()) {
  if (!file.endsWith(".html") || SKIP.has(file)) continue;
  const path = join(DIR, file);
  if (!statSync(path).isFile()) continue;

  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(`pageerror: ${e.message}`));
  page.on("console", m => {
    if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
  });

  try {
    await page.goto(pathToFileURL(resolve(path)).toString(), { waitUntil: "domcontentloaded", timeout: 8000 });
    await Promise.race([
      page.waitForFunction("typeof window.__ready === 'undefined' || window.__ready === true", { timeout: 4000 }),
      page.waitForTimeout(2500),
    ]);
    if (errors.length) {
      failures.push({ file, errors });
      console.error(`✗ ${file}\n  ${errors.join("\n  ")}`);
    } else {
      console.log(`✓ ${file}`);
    }
  } catch (err) {
    failures.push({ file, errors: [err.message] });
    console.error(`✗ ${file} — ${err.message}`);
  } finally {
    await page.close();
  }
}

await ctx.close();
await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} artifact(s) failed smoke test.`);
  process.exit(1);
}
console.log(`\nAll non-skipped HTML artifacts passed smoke test.`);
