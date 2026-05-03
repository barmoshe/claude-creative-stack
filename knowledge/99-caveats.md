# 99 — Caveats and Source-Quality Flags

When you're about to hardcode a version, model ID, or CDN URL, check here first. **Treat every version below as approximate** — the goal of this file is to centralize the "things most likely to be stale by the time you read this" so you have one place to verify.

## Quick rotation checklist

Before pasting a version, model ID, beta header, or pinned CDN URL into an answer:

1. Is it in §"Silently rotated by Anthropic" below? → flag it as approximate.
2. Is it in §"Fast-moving libraries"? → check npm or the project's release notes.
3. Is it a beta header (`-2025-…` / `-2026-…`)? → check `docs.anthropic.com/en/api/beta-headers`.
4. Is it the artifact-runtime-pinned `claude-sonnet-4-*` ID? → community-observed only; Anthropic rotates it.
5. If you can't verify, prefer **flagging uncertainty** to the user rather than asserting confidently.

## Silently rotated by Anthropic

- **Artifact-runtime model ID** (`claude-sonnet-4-20250514`) — confirmed via community writeups (Simon Willison, artifact runner repos). Anthropic does not publish this on a public docs page; it rotates without notice. Use vision feature detection instead of hardcoding behavior.
- **Artifact library whitelist versions** — lucide-react, three (r128), tailwind core, framer-motion/motion, recharts. The whitelist itself is curated; specific versions inside it can change.
- **Cache pricing multipliers and `cache_creation_input_tokens` accounting** — the 1.25× / 2.0× / 0.1× ratios are stable but the absolute prices in `01-claude-ecosystem.md` reflect a snapshot. Re-verify against `docs.anthropic.com/en/api/pricing` if the user asks for cost estimates.
- **Vision resolution caps** (Opus 4.7 = 2576px / 3.75 MP) — these jumped at the 4.7 release; future bumps are likely.
- **Beta headers** like `context-1m-2025-08-07` and `interleaved-thinking-2025-05-14` — date-stamped headers age out as features go GA. Check the beta-headers doc page when in doubt.

## Fast-moving libraries (re-verify before pinning)

- **Animation**: Motion (was `framer-motion`) — still on the v12 line; major moves likely in v13. Anime.js v4.x — full rewrite, expect minor API drift. Theatre.js — v0.7.2 is stable; **1.0 is in dev** and the migration includes timeline format changes. Rive — `@rive-app/react-canvas` 4.28.x; Rive Renderer is gated behind WebGL2.
- **3D**: Three.js standalone is on r183 in `04-animation.md`; the project ships a new revision roughly monthly. WebGPURenderer is production-ready since r171 but the API surface (TSL, NodeMaterial) is still evolving. R3F v9.6 stable; **v10 is in dev**. Drei matches R3F major versions.
- **Games**: Phaser 4.0.0 GA (released April 2026 — ~1 month old at time of writing). The migration guide URL is dated and rotates; search `phaser.io/news` instead of hardcoding the link. Kaplay — 3001.0.x stable, **4000.0.0-alpha is NOT production**; recommend 3001 unless the user has specifically chosen alpha. Pixi v8.18.x — WebGPU `preference: "webgpu"` is the default-friendly path.
- **Physics**: Rapier 0.19.x ships SIMD / deterministic / compat builds — pick one based on target. cannon-es is in maintenance.
- **Multiplayer**: **Colyseus 0.17** has breaking schema-binary-delta changes from 0.16 — follow the migration guide.

## API capability rotations

- **Extended thinking with `budget_tokens`** is deprecated on Opus 4.6+/Sonnet 4.6 — use **adaptive thinking** (`{"type":"adaptive"}` + `output_config.effort`). Sonnet 4.5 and Haiku 4.5 still support legacy `budget_tokens`.
- **MCP transports** — `SSE` is deprecated in favor of **Streamable HTTP** (spec 2025-03-26). Local stdio remains the default for desktop integrations.
- **Tool versioning** — `computer_20250124` is current at time of writing; check `docs.anthropic.com/en/docs/agents-and-tools/computer-use` for newer versions.
- **`window.storage` quotas** — 5 MB-per-key is community-observed; Anthropic officially documents the 20 MB-per-artifact cap. Don't assume larger.

## Web-platform support gates (what works in May 2026)

- **WebGPU** — cross-browser since Safari 26 (Sep 2025). Still feature-detect with `navigator.gpu` and fall back to WebGL2 for older Safari and any context where the user is on Linux Firefox without the flag.
- **View Transitions API** — same-document reached Baseline Newly Available in Oct 2025. Cross-document (`@view-transition { navigation: auto; }`) is Chrome 126+/Safari 18.2+ only; **not in Firefox** as of May 2026.
- **Scroll-driven animations** (`animation-timeline: scroll() | view()`) — Chrome/Edge stable; Firefox 144+; Safari needs the `flackr/scroll-timeline` polyfill.
- **CSS anchor positioning** (`position-anchor`, `anchor()`) — Chrome/Edge stable; Firefox/Safari behind flags.
- **`@scope`** — Chrome/Edge/Safari shipping; Firefox in progress.
- **`light-dark()`** color function — Baseline since 2024.
- **Container queries** + **container-style queries** — Baseline; safe to use.

## Patterns that break artifact deployment

- Using `localStorage`, `sessionStorage`, `indexedDB` — blocked at runtime. Use `window.storage` (published artifact) or React state (preview).
- `<form>` with `type="submit"` inside React artifacts — breaks. Use `onClick` handlers.
- Importing `three/examples/jsm/…` addons — r128 in artifact land; the addons path isn't reachable. Use a CDN `<script>` tag or inline-polyfill the needed controls (see `artifacts/html/three-r128-scene.html`).
- Arbitrary Tailwind values (`text-[22px]`) — v4 JIT isn't available; use core utility classes only.
- `fetch()` to anything other than `https://api.anthropic.com/v1/messages` — blocked.
- `WebSocket`, `EventSource`, `WebRTC` — blocked. For "real-time" feel inside an artifact, use `BroadcastChannel` (single tab tree) + `window.storage` polling.
- `import` from `npm:` or `https://esm.sh/...` outside the artifact whitelist — blocked. Stick to the curated set.
- `OffscreenCanvas` + worker — Worker spawning is blocked in published artifacts. Keep render work on the main thread.
- `navigator.mediaDevices.getUserMedia` (camera/mic) — blocked in published artifacts (allowed in preview only). Don't ship features that depend on it.

## Licensing & cost rotations

- **GSAP** — free for commercial use since 2025 (Webflow-acquired). All plugins (`SplitText`, `MorphSVG`, `DrawSVG`, `Physics2D`, `CustomEase`, etc.) are free.
- **Anime.js v4** — MIT.
- **Phaser 4** — MIT.
- **Three.js** — MIT.
- **Rive runtime** — runtime free; the editor is freemium with team tiers.
- **AI image/voice provider pricing** (Replicate, Fal, ElevenLabs, Suno, Stability) — re-quote at request time. Per-image costs commonly drift 2–5× per quarter as new models replace old ones.

## When in doubt

Prefer asking the user to confirm the current value (via an in-chat probe like "run `console.log(THREE.REVISION)` in an artifact") over guessing. Flag uncertainty in the response rather than hardcoding confidently. **Better to be visibly approximate than confidently wrong.**
