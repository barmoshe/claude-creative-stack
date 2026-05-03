import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONFIG, W, H } from "./maze/constants";
import { createInitialGame, fullReset, pickLoseQuip, tick } from "./maze/Game";
import type { Dir, GameState, HudSnapshot } from "./maze/types";
import { buildWallLayer, render } from "./maze/renderCanvas";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useGameLoop } from "./hooks/useGameLoop";
import { useKeyboardInput, useSwipeInput, useVisibilityPause } from "./hooks/useInput";
import { isMuted, setMuted, SFX, unlockAudio } from "./audio/sfx";
import { Hud } from "./ui/Hud";
import { Intro } from "./ui/Intro";
import { Win } from "./ui/Win";
import { Lose } from "./ui/Lose";
import s from "./styles/photomaze.module.css";

type Screen = "intro" | "playing" | "win" | "lose";

export default function PhotoMaze() {
  const reducedMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>("intro");
  const [hud, setHud] = useState<HudSnapshot>(() => ({
    eaten: 0,
    total: 0,
    lives: CONFIG.lives,
    livesMax: CONFIG.lives,
    modeLabel: "SCAN",
    powerFrac: 0,
    paused: false,
    muted: false,
  }));
  const [loseQuip, setLoseQuip] = useState("");

  // Mutable game world — never triggers React re-renders
  const gameRef    = useRef<GameState>(createInitialGame());
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const wallRef    = useRef<HTMLCanvasElement | null>(null);
  const tileRef    = useRef<number>(24);
  const flashRef   = useRef<HTMLDivElement | null>(null);
  const chompRef   = useRef<number>(0);
  const stageRef   = useRef<HTMLDivElement | null>(null);

  // Setup offscreen wall canvas once
  useEffect(() => {
    wallRef.current = document.createElement("canvas");
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const wallCanvas = wallRef.current;
    if (!canvas || !stage || !wallCanvas) return;
    const rect = stage.getBoundingClientRect();
    const ts = Math.floor(Math.min(rect.width / W, rect.height / H));
    tileRef.current = Math.max(10, ts);
    const tile = tileRef.current;
    canvas.width  = tile * W;
    canvas.height = tile * H;
    canvas.style.width  = `${tile * W}px`;
    canvas.style.height = `${tile * H}px`;
    const wctx = wallCanvas.getContext("2d");
    if (wctx) buildWallLayer(gameRef.current.grid, wctx, tile);
  }, []);

  // Resize observer (cheap & only fires on size changes)
  useEffect(() => {
    if (!stageRef.current) return;
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [resize, screen]);

  // ----- HUD updater (debounced — only re-renders on meaningful changes) -----
  const lastSnap = useRef<HudSnapshot>(hud);
  const refreshHud = useCallback(() => {
    const g = gameRef.current;
    const eaten = g.pelletsTotal - g.pelletsLeft;
    const modeLabel: HudSnapshot["modeLabel"] =
      g.frightenedTimer > 0 ? "EXPLOIT" :
      g.modePhase === "chase" ? "HUNT" : "SCAN";
    const powerFrac = g.frightenedTimer > 0 ? g.frightenedTimer / (CONFIG.frightenedMs / 1000) : 0;
    const next: HudSnapshot = {
      eaten,
      total: g.pelletsTotal,
      lives: g.lives,
      livesMax: CONFIG.lives,
      modeLabel,
      powerFrac,
      paused: g.paused,
      muted: isMuted(),
    };
    const a = lastSnap.current;
    if (
      a.eaten     !== next.eaten     ||
      a.lives     !== next.lives     ||
      a.modeLabel !== next.modeLabel ||
      a.paused    !== next.paused    ||
      a.muted     !== next.muted     ||
      Math.abs(a.powerFrac - next.powerFrac) > 0.04
    ) {
      lastSnap.current = next;
      setHud(next);
    }
  }, []);

  // ----- Tick + render hooks -----
  const onTick = useCallback((dt: number) => {
    if (screen !== "playing") return;
    const g = gameRef.current;
    const events = tick(g, dt);
    if (events.ate === "packet") SFX.packet();
    else if (events.ate === "power") SFX.power();
    if (events.ghostEatenAt) {
      SFX.eaten();
      flashScreen(flashRef.current, 0.55, 80, reducedMotion);
    }
    if (events.diedAt) SFX.death();
    if (events.won) {
      SFX.win();
      setScreen("win");
    }
    if (events.lost) {
      setLoseQuip(pickLoseQuip());
      setScreen("lose");
    }
    refreshHud();
  }, [screen, reducedMotion, refreshHud]);

  const onRender = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const wallCanvas = wallRef.current;
    if (!canvas || !wallCanvas) return;
    const ctx = canvas.getContext("2d");
    const wctx = wallCanvas.getContext("2d");
    if (!ctx || !wctx) return;
    render(gameRef.current, {
      ctx, wctx, wallCanvas,
      tile: tileRef.current,
      reducedMotion,
      chompPhase: chompRef.current,
      time,
    });
    // chompPhase advanced inside render mutates rc.chompPhase — copy back
    // (tiny detail: we want chomp to keep advancing across frames)
    if (!reducedMotion) chompRef.current += 0.18;
  }, [reducedMotion]);

  useGameLoop(onTick, onRender);

  // ----- Input -----
  const setDir = useCallback((d: Dir) => {
    gameRef.current.queuedDir = d;
    unlockAudio();
  }, []);
  useKeyboardInput(setDir);
  useSwipeInput(canvasRef.current, setDir, unlockAudio);

  const setPaused = useCallback((v: boolean) => {
    gameRef.current.paused = v;
    refreshHud();
  }, [refreshHud]);
  useVisibilityPause(setPaused);

  // ----- Actions -----
  const startGame = useCallback(() => {
    unlockAudio();
    fullReset(gameRef.current);
    setScreen("playing");
    requestAnimationFrame(() => resize());
  }, [resize]);

  const togglePause = useCallback(() => {
    gameRef.current.paused = !gameRef.current.paused;
    refreshHud();
  }, [refreshHud]);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted());
    refreshHud();
  }, [refreshHud]);

  const livesMax = useMemo(() => CONFIG.lives, []);
  void livesMax;

  return (
    <div className={s.app}>
      {screen === "intro"   && <Intro onStart={startGame} />}
      {screen === "lose"    && <Lose quip={loseQuip} onReplay={startGame} />}
      {screen === "win"     && <Win  onReplay={startGame} />}
      {screen === "playing" && (
        <div className={s.game}>
          <Hud {...hud} onTogglePause={togglePause} onToggleMute={toggleMute} />
          <div className={s.stage} ref={stageRef}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      )}
      <div className={s.flash} ref={flashRef} aria-hidden="true" />
    </div>
  );
}

function flashScreen(el: HTMLDivElement | null, opacity: number, ms: number, reducedMotion: boolean) {
  if (!el || reducedMotion) return;
  el.style.opacity = String(opacity);
  setTimeout(() => { el.style.opacity = "0"; }, ms);
}
