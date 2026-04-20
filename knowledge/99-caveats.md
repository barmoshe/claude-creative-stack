# 99 — Caveats and Source-Quality Flags

When you're about to hardcode a version, model ID, or CDN URL, check here first.

- **Anthropic silently rotates** pinned versions (lucide-react, artifact-embedded `claude-sonnet-4-*` model ID). Treat specific versions as approximate. If the user reports "the artifact broke overnight", suspect a silent rotation.
- **`window.storage` 5 MB-per-key** is community-observed; Anthropic officially documents the 20 MB-per-artifact cap.
- **`shared:` / `private:` key-prefix convention** is not how the API works — sharing is a boolean argument to `set`/`get`/`delete`/`list`.
- **Artifact-pinned model** `claude-sonnet-4-20250514` is confirmed via community writeups (Simon Willison, artifact runner repos); not on a public Anthropic page.
- **Extended thinking with `budget_tokens`** is deprecated on Opus 4.6+/Sonnet 4.6 — use adaptive thinking. Haiku 4.5 still supports legacy extended thinking.
- **MCP SSE transport** is deprecated in favor of Streamable HTTP (spec 2025-03-26).
- **Phaser 4** is the recommended default (4.0.0 GA, April 2026). Rebuilt WebGL renderer, unified Filter system, `SpriteGPULayer` (~100× faster for large sprite counts). Standard-API v3 projects usually port in a few hours; only **custom v3 WebGL pipelines** must be rewritten as render nodes. Minor breaking changes: `setTintFill` → `setTint`+`setTintMode`, `Geom.Point` → `Vector2`, `Mesh`/`Plane`/`Camera3D`/`Layer3D` removed, custom data structures replaced by native `Set`/`Map`.
- **Theatre.js 1.0** and **R3F v10** are in-development; v0.7.2 / v9.6 are the current stable releases.
- **WebGPU** is cross-browser since Safari 26 (Sep 2025); WebGL2 remains the safer default fallback.
- **View Transitions (same-document)** reached Baseline Newly Available in Oct 2025; cross-document requires Chrome 126+/Safari 18.2+ and is not in Firefox.
- **Scroll-driven animations** still need a polyfill on Safari (`flackr/scroll-timeline`).
- **Colyseus 0.17** has breaking changes from 0.16 — use the migration guide.

## Patterns that break artifact deployment

- Using `localStorage`, `sessionStorage`, `indexedDB` — block at runtime. Replace with `window.storage` (published artifact) or React state (preview).
- `<form>` with `type="submit"` inside React artifacts — breaks. Use `onClick` handlers.
- Importing `three/examples/jsm/...` addons — r128 in artifact land; the addons path isn't reachable. Use a CDN `<script>` tag pattern or inline-polyfill the needed controls.
- Arbitrary Tailwind values (`text-[22px]`) — v4 JIT isn't available; use core utility classes only.
- `fetch` to anything other than `api.anthropic.com/v1/messages` — blocked.

## When in doubt

Prefer asking the user to confirm the current value (via an in-chat probe like "run `console.log(THREE.REVISION)` in an artifact") over guessing. Flag uncertainty in the response rather than hardcoding confidently.
