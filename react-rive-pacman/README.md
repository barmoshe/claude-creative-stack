# react-rive-pacman

Vite + React + TypeScript + Rive port of the Hebrew "Photo Maze" PR-campaign
mini-game. Same gameplay as `../artifacts/html/pacman-photomaze.html` but
re-themed as a high-tech / cyberpunk **Signal Hunt** with security agents
chasing a cyan signal courier.

## Run it

```bash
npm install
npm run dev          # http://127.0.0.1:5273
```

```bash
npm run typecheck    # tsc --noEmit, strict
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve the production build
```

## Architecture

- **Game logic** in `src/PhotoMaze/maze/` — pure TS, no React, no DOM:
  - `constants.ts` — MAZE, CONFIG, COL palette, AGENTS roster, LOSE_QUIPS
  - `types.ts`     — Actor, Ghost, GameState, HudSnapshot
  - `grid.ts`      — `isWalkable` (broken out to avoid circular imports)
  - `ai.ts`        — `chooseGhostDir`, `targetTile` (Blinky/Pinky/Inky/Clyde)
  - `Game.ts`      — `createInitialGame`, `tick`, `softReset`, `fullReset`
  - `renderCanvas.ts` — offscreen wall layer + per-frame draws
- **Hooks** in `src/PhotoMaze/hooks/`:
  - `useGameLoop`  — fixed-timestep accumulator (60 Hz sim, rAF render)
  - `useInput`     — keyboard (`event.code`), swipe (touch chains), tab-blur pause
  - `useReducedMotion`
- **UI** in `src/PhotoMaze/ui/`:
  - `Hud`, `Intro`, `Win`, `Lose` — purely presentational
  - `RiveAccent` — isolated `useRive` wrapper with `onLoadError` + timeout fallback
- **Audio** in `src/PhotoMaze/audio/sfx.ts` — Web Audio blips, no CDN
- **Top-level** `src/PhotoMaze/index.tsx` — game state in `useRef`, never
  triggers React re-renders during the loop; HUD updates are debounced.

## Rive integration

This project uses [`@rive-app/react-canvas`](https://github.com/rive-app/rive-react)
via the `RiveAccent` wrapper.

The default `.riv` source is **`https://cdn.rive.app/animations/vapor_loader.riv`**
— a public sample hosted on Rive's CDN. It plays in the intro and win
overlays as a hero accent. If the CDN is unreachable (corporate firewall,
offline preview, etc.) `RiveAccent` automatically falls back to a 📡 emoji
after 1.8 s.

### Swap in a custom `.riv`

1. Author your animation in the [Rive Editor](https://rive.app/).
2. Export as `.riv`, drop it into `public/rive/hero.riv`.
3. In `src/PhotoMaze/ui/Intro.tsx` and `Win.tsx`, change:
   ```ts
   const RIVE_SRC = "https://cdn.rive.app/animations/vapor_loader.riv";
   ```
   to:
   ```ts
   const RIVE_SRC = "/rive/hero.riv";
   ```
4. If your `.riv` exposes a state machine, pass `stateMachine="MyMachine"` to `<RiveAccent />`.

## Performance

- Game state lives in `useRef`, not React state — the rAF loop never
  triggers a render of the React tree.
- Walls + door rendered **once** to an offscreen canvas on resize, blitted
  per frame with one `drawImage`.
- All hot-path colors pre-resolved to hex (no `oklch()` parsing per frame).
- Particle pool capped at 32; no `filter: drop-shadow` on the canvas.
- Headless Chrome at iPhone 14 Pro viewport: **60.3 FPS** sustained.

## Design

| | |
|---|---|
| Player | cyan signal courier (`#22d3ee`) — chomp + 2-pass glow |
| Pellets | lime "data packets" (`#a3e635`) |
| Power | magenta "exploit tokens" (`#ec4899`), pulsing diamonds |
| Walls | deep blue (`#0e1f4a`) with cyan circuit-trace edge |
| Threat agents | drone-style hex bodies, rectangular HUD-eye sensors |
| HUD | mono font, mode pill (SCAN / HUNT / EXPLOIT), packet bar + power-token countdown, 5 lives, pause, mute |

### Threat team (replaces the HTML version's "designer ghosts")

| Agent | Hebrew | Personality | Color |
|---|---|---|---|
| Firewall | פיירוול | Blinky — direct chase | red `#ef4444` |
| Script   | סקריפט  | Pinky — 4-tile ambush | magenta `#ec4899` |
| Sentinel | סנטינל  | Inky — Blinky-doubled | violet `#a78bfa` |
| Kernel   | קרנל    | Clyde — pokey         | amber `#f59e0b` |

## Editing for your campaign

The campaign-critical contact info is in `src/PhotoMaze/maze/constants.ts`:

```ts
export const CONFIG = {
  ...
  contactName:  "ענבל",
  contactPhone: "052-368-8321",
  contactTel:   "+972523688321",
};
```

The Hebrew copy on intro / win / lose lives in `src/PhotoMaze/ui/Intro.tsx`,
`Win.tsx`, `Lose.tsx`. All plain text, no JS knowledge needed.

## Relation to the HTML artifact

The single-file HTML version at `../artifacts/html/pacman-photomaze.html`
remains the campaign's static deliverable (no build, hostable anywhere).
This Vite project is the iterating-target for design polish and is the
home for the Rive-animated overlays. They share the same MAZE, AI, and
gameplay tuning.
