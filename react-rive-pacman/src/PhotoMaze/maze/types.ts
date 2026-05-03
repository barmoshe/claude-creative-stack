export type Dir = "up" | "down" | "left" | "right";
export type Mode = "scatter" | "chase";
export type GhostMode = "house" | "scatter" | "chase" | "frightened" | "eaten";
export type Screen = "intro" | "playing" | "dying" | "win" | "lose";

export interface Vec2 { x: number; y: number; }

export interface Actor {
  x: number; y: number;          // tile coords
  sx: number; sy: number;        // sub-tile (smooth render)
  dir: Dir;
  progress: number;              // 0..1 between tiles
  speed: number;                 // cells per second
}

export interface AgentDef {
  name: "firewall" | "script" | "sentinel" | "kernel";
  hebrew: string;
  color: string;
  scatter: Vec2;
  personality: "blinky" | "pinky" | "inky" | "clyde";
  releaseMs: number;
}

export interface Ghost extends Actor {
  def: AgentDef;
  mode: GhostMode;
  modeBeforeFright: Mode;
  released: boolean;
  releaseTimer: number;          // ms until release
  spawn: Vec2;
}

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; max: number;
  color: string;
}

export interface GameState {
  grid: Uint8Array;
  W: number; H: number;
  player: Actor;
  ghosts: Ghost[];
  pelletsTotal: number;
  pelletsLeft: number;
  lives: number;
  modePhase: Mode;
  modeTimer: number;
  frightenedTimer: number;       // seconds remaining
  particles: Particle[];
  trauma: number;
  state: Screen;
  dyingTimer: number;
  paused: boolean;
  queuedDir: Dir | null;
  // tunnel rows (set; we just keep a small array)
  tunnelRows: number[];
  // playerSpawn snapshot for soft-reset
  playerSpawn: Vec2;
  ghostSpawns: Vec2[];
}

export interface HudSnapshot {
  eaten: number;
  total: number;
  lives: number;
  livesMax: number;
  modeLabel: "SCAN" | "HUNT" | "EXPLOIT";
  powerFrac: number;             // 0..1, only relevant in EXPLOIT
  paused: boolean;
  muted: boolean;
}
