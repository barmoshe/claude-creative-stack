import type { AgentDef, Dir, Vec2 } from "./types";

// 21 wide × 22 tall.
// # wall · . pellet · o power · (space) empty · T tunnel · - door · G ghost · P player
export const MAZE: readonly string[] = [
  "#####################",
  "#.........#.........#",
  "#o###.###.#.###.###o#",
  "#.###.###.#.###.###.#",
  "#...................#",
  "#.###.#.#####.#.###.#",
  "#.....#...#...#.....#",
  "#####.### # ###.#####",
  "    #.#       #.#    ",
  "#####.# ##-## #.#####",
  "T   .  #GG GG#   .  T",
  "#####.# ##### #.#####",
  "    #.#       #.#    ",
  "#####.# ##### #.#####",
  "#.........#.........#",
  "#.###.###.#.###.###.#",
  "#o..#.....P.....#..o#",
  "###.#.#.#####.#.#.###",
  "#.....#...#...#.....#",
  "#.#######.#.#######.#",
  "#...................#",
  "#####################",
];

export const W = 21;
export const H = MAZE.length;

export const TILE = {
  EMPTY: 0,
  WALL: 1,
  PELLET: 2,
  POWER: 3,
  DOOR: 4,
  TUNNEL: 5,
} as const;

export const DIRS: Record<Dir, Vec2> = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1  },
  left:  { x: -1, y: 0  },
  right: { x: 1,  y: 0  },
};

export const OPP: Record<Dir, Dir> = {
  up: "down", down: "up", left: "right", right: "left",
};

export const DIR_ORDER: Dir[] = ["up", "left", "down", "right"];

export const CONFIG = {
  lives: 5,
  ghostSpeedFrac: 0.72,
  frightenedSpeedFrac: 0.55,
  eatenSpeedFrac: 1.6,
  frightenedMs: 9000,
  scatterMs: 6500,
  chaseMs: 18000,
  releaseMsPerGhost: 2500,
  playerCellsPerSecond: 7,
  // Campaign hand-off
  contactName:  "ענבל",
  contactPhone: "052-368-8321",
  contactTel:   "+972523688321",
};

// Pre-resolved hex colors (no oklch reparse in render hot path)
export const COL = {
  bg:        "#03060d",
  bg2:       "#0a1530",
  wall:      "#0e1f4a",
  wallEdge:  "#22d3ee",
  wallEdge2: "#0891b2",
  packet:    "#a3e635",
  packetHi:  "#ecfccb",
  exploit:   "#ec4899",
  exploitHi: "#fff",
  player:    "#22d3ee",
  playerHi:  "#cffafe",
  eyeWhite:  "#ffffff",
  eyePupil:  "#0f172a",
  frightBody:"#1e3a8a",
  frightUI:  "#fef3c7",
  text:      "#e0f2fe",
  muted:     "#64748b",
  accent:    "#f59e0b",
  danger:    "#ef4444",
};

export const AGENTS: AgentDef[] = [
  { name: "firewall", hebrew: "פיירוול",  color: "#ef4444", scatter: { x: W - 2, y: 0 },     personality: "blinky", releaseMs: 0 },
  { name: "script",   hebrew: "סקריפט",  color: "#ec4899", scatter: { x: 1,     y: 0 },     personality: "pinky",  releaseMs: 1 * CONFIG.releaseMsPerGhost },
  { name: "sentinel", hebrew: "סנטינל",  color: "#a78bfa", scatter: { x: W - 2, y: H - 1 }, personality: "inky",   releaseMs: 2 * CONFIG.releaseMsPerGhost },
  { name: "kernel",   hebrew: "קרנל",    color: "#f59e0b", scatter: { x: 1,     y: H - 1 }, personality: "clyde",  releaseMs: 3 * CONFIG.releaseMsPerGhost },
];

export const LOSE_QUIPS: string[] = [
  "פיירוול אומר: 0.0.0.0/0 לא ידידותי לפולשים.",
  "סקריפט תפס אותך ב-grep. בלי regex.",
  "סנטינל מסתכל בלוגים שלך — והם מביכים.",
  "קרנל בוחן segfault — שלך.",
  "המערכת אמרה: NACK.",
];

export const PARTICLE_COLORS: string[] = [COL.packet, COL.player, COL.accent];
export const PARTICLE_CAP = 32;

export const STEP = 1 / 60;
