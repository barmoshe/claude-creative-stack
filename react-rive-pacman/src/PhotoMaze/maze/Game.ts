import {
  MAZE, W, H, TILE, DIRS, OPP, AGENTS, CONFIG, PARTICLE_CAP,
  PARTICLE_COLORS, LOSE_QUIPS,
} from "./constants";
import type {
  Actor, Dir, GameState, Ghost, Vec2,
} from "./types";
import { isWalkable } from "./grid";
import { chooseGhostDir } from "./ai";

export function parseMaze(): {
  grid: Uint8Array;
  pelletsTotal: number;
  playerSpawn: Vec2;
  ghostSpawns: Vec2[];
  tunnelRows: number[];
} {
  const grid = new Uint8Array(W * H);
  let pelletsTotal = 0;
  const ghostSpawns: Vec2[] = [];
  let playerSpawn: Vec2 = { x: 10, y: 16 };
  const tunnelRowsSet = new Set<number>();
  for (let y = 0; y < H; y++) {
    const row = MAZE[y];
    for (let x = 0; x < W; x++) {
      const ch = row[x];
      let v: number = TILE.EMPTY;
      switch (ch) {
        case "#": v = TILE.WALL; break;
        case ".": v = TILE.PELLET; pelletsTotal++; break;
        case "o": v = TILE.POWER;  pelletsTotal++; break;
        case "-": v = TILE.DOOR; break;
        case "T": v = TILE.TUNNEL; tunnelRowsSet.add(y); break;
        case "G": v = TILE.EMPTY; ghostSpawns.push({ x, y }); break;
        case "P": v = TILE.EMPTY; playerSpawn = { x, y }; break;
        default:  v = TILE.EMPTY; break;
      }
      grid[y * W + x] = v;
    }
  }
  return {
    grid, pelletsTotal, playerSpawn, ghostSpawns,
    tunnelRows: Array.from(tunnelRowsSet),
  };
}

function makeActor(x: number, y: number, dir: Dir, speed: number): Actor {
  return { x, y, sx: x, sy: y, dir, progress: 0, speed };
}

function makeGhost(idx: number, spawn: Vec2): Ghost {
  const def = AGENTS[idx % AGENTS.length];
  const a = makeActor(spawn.x, spawn.y, "up", CONFIG.playerCellsPerSecond * CONFIG.ghostSpeedFrac);
  return {
    ...a,
    def,
    mode: "house",
    modeBeforeFright: "scatter",
    released: false,
    releaseTimer: def.releaseMs,
    spawn: { ...spawn },
  };
}

export function createInitialGame(): GameState {
  const { grid, pelletsTotal, playerSpawn, ghostSpawns, tunnelRows } = parseMaze();
  const slots: Vec2[] = ghostSpawns.length >= 4 ? ghostSpawns.slice(0, 4) : [
    { x: 9,  y: 10 }, { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 },
  ];
  return {
    grid,
    W, H,
    player: makeActor(playerSpawn.x, playerSpawn.y, "left", CONFIG.playerCellsPerSecond),
    ghosts: AGENTS.map((_, i) => makeGhost(i, slots[i % slots.length])),
    pelletsTotal,
    pelletsLeft: pelletsTotal,
    lives: CONFIG.lives,
    modePhase: "scatter",
    modeTimer: 0,
    frightenedTimer: 0,
    particles: [],
    trauma: 0,
    state: "intro",
    dyingTimer: 0,
    paused: false,
    queuedDir: "left",
    tunnelRows,
    playerSpawn,
    ghostSpawns: slots,
  };
}

export function softReset(g: GameState): void {
  g.player = makeActor(g.playerSpawn.x, g.playerSpawn.y, "left", CONFIG.playerCellsPerSecond);
  g.queuedDir = "left";
  g.ghosts = AGENTS.map((_, i) => makeGhost(i, g.ghostSpawns[i % g.ghostSpawns.length]));
  g.modePhase = "scatter";
  g.modeTimer = 0;
  g.frightenedTimer = 0;
  g.dyingTimer = 0;
}

export function fullReset(g: GameState): void {
  const fresh = createInitialGame();
  g.grid = fresh.grid;
  g.player = fresh.player;
  g.ghosts = fresh.ghosts;
  g.pelletsTotal = fresh.pelletsTotal;
  g.pelletsLeft = fresh.pelletsLeft;
  g.lives = fresh.lives;
  g.modePhase = fresh.modePhase;
  g.modeTimer = 0;
  g.frightenedTimer = 0;
  g.particles = [];
  g.trauma = 0;
  g.state = "playing";
  g.dyingTimer = 0;
  g.paused = false;
  g.queuedDir = "left";
}

export function spawnBurst(g: GameState, x: number, y: number, n: number): void {
  for (let i = 0; i < n; i++) {
    if (g.particles.length >= PARTICLE_CAP) g.particles.shift();
    const a = Math.random() * Math.PI * 2;
    const sp = 3 + Math.random() * 4;
    g.particles.push({
      x: x + 0.5, y: y + 0.5,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 0.5, max: 0.5,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    });
  }
}

export function updateParticles(g: GameState, dt: number): void {
  for (let i = g.particles.length - 1; i >= 0; i--) {
    const p = g.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.92; p.vy *= 0.92;
    p.life -= dt;
    if (p.life <= 0) g.particles.splice(i, 1);
  }
}

export interface TickEvents {
  ate?: "packet" | "power";
  ghostEatenAt?: Vec2;
  diedAt?: Vec2;
  won?: boolean;
  lost?: boolean;
}

/**
 * Advance a single tile-step.  Returns true if state changed in a way the
 * HUD or audio cares about; events accumulator captures one-shot moments
 * for SFX/juice in the host loop.
 */
function advance(
  g: GameState,
  actor: Actor,
  dt: number,
  isPlayer: boolean,
  events: TickEvents,
): void {
  actor.progress += actor.speed * dt;
  while (actor.progress >= 1) {
    actor.progress -= 1;

    if (isPlayer) {
      // try queued direction first
      if (g.queuedDir && g.queuedDir !== actor.dir) {
        const qd = DIRS[g.queuedDir];
        if (isWalkable(g.grid, g.tunnelRows, actor.x + qd.x, actor.y + qd.y, false)) {
          actor.dir = g.queuedDir;
        }
      }
      const fd = DIRS[actor.dir];
      if (!isWalkable(g.grid, g.tunnelRows, actor.x + fd.x, actor.y + fd.y, false)) {
        actor.progress = 0;
        break;
      }
      let nx = actor.x + fd.x, ny = actor.y + fd.y;
      if (nx < 0) nx = W - 1; else if (nx >= W) nx = 0;
      actor.x = nx; actor.y = ny;

      const idx = actor.y * W + actor.x;
      const t = g.grid[idx];
      if (t === TILE.PELLET) {
        g.grid[idx] = TILE.EMPTY;
        g.pelletsLeft--;
        events.ate = "packet";
        spawnBurst(g, actor.x, actor.y, 2);
      } else if (t === TILE.POWER) {
        g.grid[idx] = TILE.EMPTY;
        g.pelletsLeft--;
        g.frightenedTimer = CONFIG.frightenedMs / 1000;
        for (const gh of g.ghosts) {
          if (gh.mode === "chase" || gh.mode === "scatter") {
            gh.modeBeforeFright = gh.mode;
            gh.mode = "frightened";
            gh.dir = OPP[gh.dir];
          }
        }
        events.ate = "power";
        spawnBurst(g, actor.x, actor.y, 8);
      }
      if (g.pelletsLeft <= 0) {
        events.won = true;
        return;
      }
    } else {
      const fd = DIRS[actor.dir];
      let nx = actor.x + fd.x, ny = actor.y + fd.y;
      if (nx < 0) nx = W - 1; else if (nx >= W) nx = 0;
      actor.x = nx; actor.y = ny;

      const gh = actor as Ghost;
      if (gh.mode === "eaten" && gh.x === gh.spawn.x && gh.y === gh.spawn.y) {
        gh.mode = "house";
        gh.released = false;
        gh.releaseTimer = 1500;
        gh.speed = CONFIG.playerCellsPerSecond * CONFIG.ghostSpeedFrac;
      }
      gh.dir = chooseGhostDir(g, gh);
    }
  }
  const d = DIRS[actor.dir];
  actor.sx = actor.x + d.x * actor.progress;
  actor.sy = actor.y + d.y * actor.progress;
}

export function tick(g: GameState, dt: number): TickEvents {
  const events: TickEvents = {};
  if (g.paused) return events;

  if (g.state === "dying") {
    g.dyingTimer -= dt;
    if (g.dyingTimer <= 0) {
      if (g.lives > 0) { g.state = "playing"; softReset(g); }
      else { events.lost = true; }
    }
    return events;
  }
  if (g.state !== "playing") return events;

  // Mode timer
  if (g.frightenedTimer > 0) {
    g.frightenedTimer -= dt;
    if (g.frightenedTimer <= 0) {
      for (const gh of g.ghosts) {
        if (gh.mode === "frightened") gh.mode = gh.modeBeforeFright;
        gh.speed = CONFIG.playerCellsPerSecond * CONFIG.ghostSpeedFrac;
      }
    } else {
      for (const gh of g.ghosts) {
        if (gh.mode === "frightened") {
          gh.speed = CONFIG.playerCellsPerSecond * CONFIG.frightenedSpeedFrac;
        }
      }
    }
  } else {
    g.modeTimer += dt;
    const limit = (g.modePhase === "scatter" ? CONFIG.scatterMs : CONFIG.chaseMs) / 1000;
    if (g.modeTimer > limit) {
      g.modeTimer = 0;
      g.modePhase = g.modePhase === "scatter" ? "chase" : "scatter";
      for (const gh of g.ghosts) {
        if (gh.mode === "chase" || gh.mode === "scatter") {
          gh.mode = g.modePhase;
          gh.dir = OPP[gh.dir];
        }
      }
    }
  }

  // Release ghosts
  for (const gh of g.ghosts) {
    if (gh.mode === "house" && !gh.released) {
      gh.releaseTimer -= dt * 1000;
      if (gh.releaseTimer <= 0) {
        gh.released = true;
        gh.x = 10; gh.y = 9; gh.sx = 10; gh.sy = 9;
        gh.dir = "up";
        gh.progress = 0;
        gh.mode = g.modePhase;
        gh.speed = CONFIG.playerCellsPerSecond * CONFIG.ghostSpeedFrac;
      }
    }
  }

  // Move player
  advance(g, g.player, dt, true, events);
  if (events.won) {
    g.state = "win";
    return events;
  }
  // Move released ghosts
  for (const gh of g.ghosts) {
    if (gh.mode === "house" && !gh.released) continue;
    advance(g, gh, dt, false, events);
  }

  // Particles + trauma decay
  updateParticles(g, dt);
  g.trauma = Math.max(0, g.trauma - dt * 1.4);

  // Collisions
  for (const gh of g.ghosts) {
    if (gh.mode === "house" || gh.mode === "eaten") continue;
    const dx = gh.sx - g.player.sx, dy = gh.sy - g.player.sy;
    if (dx * dx + dy * dy < 0.55 * 0.55) {
      if (gh.mode === "frightened") {
        gh.mode = "eaten";
        gh.speed = CONFIG.playerCellsPerSecond * CONFIG.eatenSpeedFrac;
        events.ghostEatenAt = { x: g.player.x, y: g.player.y };
        spawnBurst(g, g.player.x, g.player.y, 8);
      } else {
        g.lives--;
        events.diedAt = { x: g.player.x, y: g.player.y };
        g.trauma = Math.min(1, g.trauma + 0.7);
        g.state = "dying";
        g.dyingTimer = 1.0;
        if (g.lives <= 0) events.lost = true;
        return events;
      }
    }
  }

  return events;
}

export function pickLoseQuip(): string {
  return LOSE_QUIPS[Math.floor(Math.random() * LOSE_QUIPS.length)];
}
