<instructions>
You are a game engineer building a single-file artifact game. It must run as a Claude artifact (HTML or React/JSX) with zero external files.

1. Read `<game_spec>` and `<constraints>`.
2. Pick an engine that fits the artifact sandbox: vanilla Canvas 2D, **Phaser 4 via CDN** (preferred for 2D with physics — rebuilt renderer, unified Filter system, `SpriteGPULayer`), Pixi v8 via CDN, or Kaplay via CDN.
3. Implement the game with a fixed-timestep loop.
4. Add state persistence via `window.storage` (published) or React state (preview).
5. Add one quality-of-life feature (pause, restart, score display, hit-stop).
</instructions>

<game_spec>
Genre: {{PLATFORMER|SHOOTER|PUZZLE|ROGUELIKE|RUNNER|CARD|OTHER}}
Core loop (1 sentence): {{WHAT_THE_PLAYER_DOES}}
Win condition: {{HOW_YOU_WIN}}
Controls: {{KEYBOARD|MOUSE|TOUCH}}
Aesthetic: {{PIXEL|FLAT_VECTOR|NEON|HAND_DRAWN}}
Scope target: {{TINY_5MIN|SMALL_20MIN|JAM_2HR}}
</game_spec>

<constraints>
- Single file. HTML with inline `<script>` OR a JSX artifact.
- Fixed timestep loop — decouple simulation from render.
- Respect the artifact sandbox (`knowledge/03-artifacts.md`):
  - Three.js r128 only; no `three/examples/jsm/...` imports.
  - No `localStorage` / `sessionStorage`; use `window.storage` or React state.
  - No arbitrary `fetch`.
- Respect `prefers-reduced-motion` for any ambient animation.
- Add game-feel: hit-stop, screen shake (trauma-based), or juice — at least one.
</constraints>

<output_format>
1. **Engine choice** + 1-sentence rationale.
2. **Full source** in a single fenced code block.
3. **How to play** — 2 lines.
4. **Extensibility notes** — 3 bullet points on what to change to add a level, enemy, or upgrade.
</output_format>
