import { COL, TILE, W, H } from "./constants";
import type { GameState, Ghost } from "./types";

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  wctx: CanvasRenderingContext2D;
  wallCanvas: HTMLCanvasElement;
  tile: number;
  reducedMotion: boolean;
  chompPhase: number;
  time: number;
}

export function buildWallLayer(grid: Uint8Array, wctx: CanvasRenderingContext2D, tile: number): void {
  const wcanvas = wctx.canvas;
  wcanvas.width  = tile * W;
  wcanvas.height = tile * H;
  wctx.clearRect(0, 0, wcanvas.width, wcanvas.height);
  const inset = tile * 0.18;
  const lineW = Math.max(1, tile * 0.08);
  // Two-pass fake glow: wide dim stroke + narrow bright edge
  wctx.lineWidth = lineW * 2.4;
  wctx.strokeStyle = COL.wallEdge2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y * W + x] !== TILE.WALL) continue;
      paintWallShape(wctx, grid, x, y, tile, inset, /*strokeOnly=*/true);
    }
  }
  wctx.lineWidth = lineW;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = grid[y * W + x];
      if (v === TILE.WALL) {
        const cx = x * tile, cy = y * tile;
        const wN = y > 0     && grid[(y - 1) * W + x] === TILE.WALL;
        const wS = y < H - 1 && grid[(y + 1) * W + x] === TILE.WALL;
        const wW = x > 0     && grid[y * W + (x - 1)] === TILE.WALL;
        const wE = x < W - 1 && grid[y * W + (x + 1)] === TILE.WALL;
        const it = wN ? 0 : inset;
        const ib = wS ? 0 : inset;
        const il = wW ? 0 : inset;
        const ir = wE ? 0 : inset;
        wctx.fillStyle = COL.wall;
        wctx.fillRect(cx + il, cy + it, tile - il - ir, tile - it - ib);
        wctx.strokeStyle = COL.wallEdge;
        wctx.beginPath();
        if (it > 0) { wctx.moveTo(cx + il, cy + it); wctx.lineTo(cx + tile - ir, cy + it); }
        if (ib > 0) { wctx.moveTo(cx + il, cy + tile - ib); wctx.lineTo(cx + tile - ir, cy + tile - ib); }
        if (il > 0) { wctx.moveTo(cx + il, cy + it); wctx.lineTo(cx + il, cy + tile - ib); }
        if (ir > 0) { wctx.moveTo(cx + tile - ir, cy + it); wctx.lineTo(cx + tile - ir, cy + tile - ib); }
        wctx.stroke();
      } else if (v === TILE.DOOR) {
        wctx.fillStyle = COL.accent;
        wctx.fillRect(x * tile, y * tile + tile * 0.45, tile, tile * 0.12);
      }
    }
  }
}

function paintWallShape(
  wctx: CanvasRenderingContext2D,
  grid: Uint8Array,
  x: number, y: number,
  tile: number, inset: number,
  strokeOnly: boolean,
) {
  const cx = x * tile, cy = y * tile;
  const wN = y > 0     && grid[(y - 1) * W + x] === TILE.WALL;
  const wS = y < H - 1 && grid[(y + 1) * W + x] === TILE.WALL;
  const wW = x > 0     && grid[y * W + (x - 1)] === TILE.WALL;
  const wE = x < W - 1 && grid[y * W + (x + 1)] === TILE.WALL;
  const it = wN ? 0 : inset;
  const ib = wS ? 0 : inset;
  const il = wW ? 0 : inset;
  const ir = wE ? 0 : inset;
  if (!strokeOnly) {
    wctx.fillStyle = COL.wall;
    wctx.fillRect(cx + il, cy + it, tile - il - ir, tile - it - ib);
  }
  wctx.beginPath();
  if (it > 0) { wctx.moveTo(cx + il, cy + it); wctx.lineTo(cx + tile - ir, cy + it); }
  if (ib > 0) { wctx.moveTo(cx + il, cy + tile - ib); wctx.lineTo(cx + tile - ir, cy + tile - ib); }
  if (il > 0) { wctx.moveTo(cx + il, cy + it); wctx.lineTo(cx + il, cy + tile - ib); }
  if (ir > 0) { wctx.moveTo(cx + tile - ir, cy + it); wctx.lineTo(cx + tile - ir, cy + tile - ib); }
  wctx.stroke();
}

export function render(g: GameState, rc: RenderContext): void {
  const { ctx, wallCanvas, tile, reducedMotion, time } = rc;
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.save();
  ctx.fillStyle = COL.bg;
  ctx.fillRect(0, 0, w, h);

  if (!reducedMotion && g.trauma > 0) {
    const t2 = g.trauma * g.trauma;
    ctx.translate((Math.random() * 2 - 1) * 12 * t2, (Math.random() * 2 - 1) * 12 * t2);
  }

  // Walls (cached layer)
  ctx.drawImage(wallCanvas, 0, 0);

  // Pellets (data packets)
  const ps = Math.max(2, tile * 0.18);
  ctx.fillStyle = COL.packet;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g.grid[y * W + x] === TILE.PELLET) {
        const cx = x * tile + tile / 2, cy = y * tile + tile / 2;
        ctx.fillRect(cx - ps / 2, cy - ps / 2, ps, ps);
      }
    }
  }

  // Power tokens (exploit) — pulsing diamond
  const pulse = reducedMotion ? 1 : (0.75 + 0.25 * Math.sin(time / 200));
  const pr = tile * 0.32 * pulse;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g.grid[y * W + x] !== TILE.POWER) continue;
      const cx = x * tile + tile / 2, cy = y * tile + tile / 2;
      ctx.fillStyle = COL.exploit;
      ctx.beginPath();
      ctx.moveTo(cx, cy - pr);
      ctx.lineTo(cx + pr, cy);
      ctx.lineTo(cx, cy + pr);
      ctx.lineTo(cx - pr, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = COL.exploitHi;
      ctx.fillRect(cx - 1, cy - pr * 0.7, 2, pr * 1.4);
    }
  }

  // Particles
  for (let i = 0; i < g.particles.length; i++) {
    const p = g.particles[i];
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x * tile - 2, p.y * tile - 2, 3, 3);
  }
  ctx.globalAlpha = 1;

  // Agents
  if (g.state !== "dying") {
    for (let i = 0; i < g.ghosts.length; i++) drawAgent(ctx, g.ghosts[i], tile, g.frightenedTimer);
  }

  // Player
  drawPlayer(ctx, g, rc);

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, g: GameState, rc: RenderContext) {
  const cx = g.player.sx * rc.tile + rc.tile / 2;
  const cy = g.player.sy * rc.tile + rc.tile / 2;
  const r = rc.tile * 0.42;

  if (g.state === "dying") {
    const t = 1 - g.dyingTimer;
    const ang = t * Math.PI;
    ctx.fillStyle = COL.player;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r * (1 - t * 0.4), ang, Math.PI * 2 - ang);
    ctx.closePath();
    ctx.fill();
    return;
  }

  // Two-pass glow (wide dim + narrow bright)
  ctx.fillStyle = "rgba(34,211,238,0.20)";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.55, 0, Math.PI * 2);
  ctx.fill();

  // Chomp body
  if (!rc.reducedMotion) rc.chompPhase += 0.18;
  const mouth = Math.abs(Math.sin(rc.chompPhase)) * 0.45 + 0.05;
  let base = 0;
  switch (g.player.dir) {
    case "right": base = 0; break;
    case "down":  base = Math.PI / 2; break;
    case "left":  base = Math.PI; break;
    case "up":    base = -Math.PI / 2; break;
  }
  ctx.fillStyle = COL.player;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, base + mouth, base + Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();
  // Bright inner ring
  ctx.fillStyle = COL.playerHi;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r * 0.55, base + mouth, base + Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();
}

function drawAgent(
  ctx: CanvasRenderingContext2D,
  gh: Ghost,
  tile: number,
  frightenedTimer: number,
) {
  const cx = gh.sx * tile + tile / 2;
  const cy = gh.sy * tile + tile / 2;
  const r = tile * 0.42;

  let body: string | null = gh.def.color;
  if (gh.mode === "frightened") {
    const flashing = frightenedTimer < 2.0 && Math.floor(frightenedTimer * 5) % 2 === 0;
    body = flashing ? COL.frightUI : COL.frightBody;
  } else if (gh.mode === "eaten") {
    body = null;
  }

  if (body) {
    // Drone-style hex body: flat top via arc, angled shoulders, 3 zigs at base
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - r * 0.1);
    ctx.lineTo(cx - r * 0.6, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.6, cy - r * 0.85);
    ctx.lineTo(cx + r, cy - r * 0.1);
    ctx.lineTo(cx + r, cy + r * 0.55);
    // 3 zigzag bottom points
    ctx.lineTo(cx + r * 0.5, cy + r * 0.85);
    ctx.lineTo(cx + r * 0.16, cy + r * 0.55);
    ctx.lineTo(cx - r * 0.16, cy + r * 0.85);
    ctx.lineTo(cx - r * 0.5, cy + r * 0.55);
    ctx.lineTo(cx - r, cy + r * 0.85);
    ctx.lineTo(cx - r, cy - r * 0.1);
    ctx.closePath();
    ctx.fill();

    drawAgentTell(ctx, gh, cx, cy - r * 0.55, r);
  }

  // Eyes — rectangular HUD-style sensors
  const eyeOff = r * 0.32;
  const eyeW = r * 0.36, eyeH = r * 0.18;
  let lookDX = 0, lookDY = 0;
  switch (gh.dir) {
    case "left":  lookDX = -eyeW * 0.18; break;
    case "right": lookDX =  eyeW * 0.18; break;
    case "up":    lookDY = -eyeH * 0.30; break;
    case "down":  lookDY =  eyeH * 0.30; break;
  }

  if (gh.mode === "frightened") {
    ctx.fillStyle = COL.frightUI;
    ctx.fillRect(cx - eyeOff - eyeW / 2, cy - eyeH * 0.5, eyeW, eyeH);
    ctx.fillRect(cx + eyeOff - eyeW / 2, cy - eyeH * 0.5, eyeW, eyeH);
  } else {
    ctx.fillStyle = COL.eyeWhite;
    ctx.fillRect(cx - eyeOff - eyeW / 2, cy - eyeH * 0.5, eyeW, eyeH);
    ctx.fillRect(cx + eyeOff - eyeW / 2, cy - eyeH * 0.5, eyeW, eyeH);
    ctx.fillStyle = COL.eyePupil;
    const pw = eyeW * 0.45, ph = eyeH * 0.7;
    ctx.fillRect(cx - eyeOff - pw / 2 + lookDX, cy - ph / 2 + lookDY, pw, ph);
    ctx.fillRect(cx + eyeOff - pw / 2 + lookDX, cy - ph / 2 + lookDY, pw, ph);
  }
}

function drawAgentTell(
  ctx: CanvasRenderingContext2D,
  gh: Ghost,
  cx: number, topY: number, r: number,
) {
  ctx.save();
  ctx.fillStyle = COL.bg;
  switch (gh.def.name) {
    case "firewall": {
      // Brick pattern
      const w = r * 0.18, h = r * 0.07;
      ctx.fillRect(cx - r * 0.32, topY - r * 0.05,        r * 0.18, h);
      ctx.fillRect(cx - r * 0.10, topY - r * 0.05,        r * 0.18, h);
      ctx.fillRect(cx + r * 0.12, topY - r * 0.05,        r * 0.18, h);
      ctx.fillRect(cx - r * 0.21, topY + r * 0.06,        r * 0.18, h);
      ctx.fillRect(cx + r * 0.01, topY + r * 0.06,        r * 0.18, h);
      void w; // satisfy noUnusedLocals
      break;
    }
    case "script": {
      // < >  brackets
      ctx.font = `bold ${Math.floor(r * 0.5)}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("<>", cx, topY + r * 0.05);
      break;
    }
    case "sentinel": {
      // Radar arc + pulse dot
      ctx.strokeStyle = COL.bg;
      ctx.lineWidth = Math.max(1, r * 0.05);
      ctx.beginPath();
      ctx.arc(cx, topY + r * 0.05, r * 0.30, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.fillRect(cx - 1.5, topY - r * 0.10, 3, 3);
      break;
    }
    case "kernel": {
      // 3×3 dot matrix
      const s = r * 0.07;
      const gap = r * 0.10;
      for (let yy = -1; yy <= 1; yy++) {
        for (let xx = -1; xx <= 1; xx++) {
          ctx.fillRect(cx + xx * gap - s / 2, topY + yy * gap - s / 2, s, s);
        }
      }
      break;
    }
  }
  ctx.restore();
}
