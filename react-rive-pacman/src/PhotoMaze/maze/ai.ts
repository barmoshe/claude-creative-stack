import { DIRS, DIR_ORDER, OPP } from "./constants";
import type { Dir, GameState, Ghost, Vec2 } from "./types";
import { isWalkable } from "./grid";

function targetTile(g: GameState, gh: Ghost): Vec2 {
  if (gh.mode === "eaten") return gh.spawn;
  if (!gh.released || gh.mode === "house") return { x: 10, y: 8 };
  if (gh.mode === "scatter") return gh.def.scatter;

  const player = g.player;
  switch (gh.def.personality) {
    case "blinky":
      return { x: player.x, y: player.y };
    case "pinky": {
      const d = DIRS[player.dir];
      return { x: player.x + d.x * 4, y: player.y + d.y * 4 };
    }
    case "inky": {
      const d = DIRS[player.dir];
      const ax = player.x + d.x * 2;
      const ay = player.y + d.y * 2;
      const blinky = g.ghosts.find(o => o.def.name === "firewall");
      const bx = blinky ? blinky.x : player.x;
      const by = blinky ? blinky.y : player.y;
      return { x: ax + (ax - bx), y: ay + (ay - by) };
    }
    case "clyde": {
      const dx = gh.x - player.x;
      const dy = gh.y - player.y;
      if (dx * dx + dy * dy > 64) return { x: player.x, y: player.y };
      return gh.def.scatter;
    }
  }
}

export function chooseGhostDir(g: GameState, gh: Ghost): Dir {
  if (gh.mode === "frightened") {
    const opts = DIR_ORDER.filter(d =>
      d !== OPP[gh.dir] &&
      isWalkable(g.grid, g.tunnelRows, gh.x + DIRS[d].x, gh.y + DIRS[d].y, false)
    );
    if (opts.length) return opts[Math.floor(Math.random() * opts.length)];
    return OPP[gh.dir];
  }

  const target = targetTile(g, gh);
  const allowDoor = gh.mode === "eaten" || gh.mode === "house";
  let best: Dir | null = null;
  let bestD = Infinity;
  for (const d of DIR_ORDER) {
    if (d === OPP[gh.dir]) continue;
    const nx = gh.x + DIRS[d].x;
    const ny = gh.y + DIRS[d].y;
    if (!isWalkable(g.grid, g.tunnelRows, nx, ny, allowDoor)) continue;
    const dx = nx - target.x;
    const dy = ny - target.y;
    const dist = dx * dx + dy * dy;
    if (dist < bestD) { bestD = dist; best = d; }
  }
  if (best) return best;
  // dead-end fallback: allow reverse
  const back = OPP[gh.dir];
  if (isWalkable(g.grid, g.tunnelRows, gh.x + DIRS[back].x, gh.y + DIRS[back].y, allowDoor)) {
    return back;
  }
  return gh.dir;
}
