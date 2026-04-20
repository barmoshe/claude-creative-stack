# Playground

A minimal Vite + React + TypeScript harness for iterating on artifacts **outside** the artifact sandbox. Useful when you want:

- Real hot reload while refining an artifact's design.
- TypeScript + ESLint.
- Arbitrary Tailwind values (not just core utilities).
- Libraries beyond the artifact whitelist (e.g. `@react-three/fiber`, `@react-three/drei`, `gsap`, `@tanstack/react-table`).
- `localStorage` during dev — but remember to strip before copying back into an artifact.

## Get started

```bash
cd playground
npm install
npm run dev
# open http://localhost:5173
```

## Port an artifact into the playground

1. Drop the `.jsx` file into `src/sketches/`.
2. Add a route in `src/App.tsx`.
3. If the artifact uses `window.storage`, stub it (`src/lib/storage.ts` has a drop-in shim).
4. If it uses `api.anthropic.com/v1/messages`, add your API key to `.env.local` and proxy through a dev endpoint (see `src/lib/claude.ts`).

## Port a playground sketch back into an artifact

1. Inline all imports — artifacts are single-file.
2. Replace any arbitrary Tailwind values with core utilities.
3. Swap `localStorage` for `window.storage` (or React state in preview).
4. Remove TypeScript syntax (or keep and paste as a JSX artifact — TS inline is fine in some artifact runtimes, test first).
5. Verify it runs inside a real Claude artifact chat before shipping.

## Contents

- `src/App.tsx` — router shell.
- `src/sketches/` — each file is one isolated demo.
- `src/lib/storage.ts` — `window.storage` shim.
- `src/lib/claude.ts` — Claude API helper for Claudeception experiments.

This folder is **optional.** Everything else in `claude-creative-stack` works without it.
