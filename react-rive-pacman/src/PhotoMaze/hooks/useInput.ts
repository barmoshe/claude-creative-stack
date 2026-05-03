import { useEffect } from "react";
import type { Dir } from "../maze/types";

const KEY_MAP: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  KeyW: "up",   KeyS: "down",      KeyA: "left",      KeyD: "right",
};

export function useKeyboardInput(setDir: (d: Dir) => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = KEY_MAP[e.code];
      if (d) { setDir(d); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [setDir]);
}

export function useSwipeInput(
  canvas: HTMLCanvasElement | null,
  setDir: (d: Dir) => void,
  onFirstTouch?: () => void,
): void {
  useEffect(() => {
    if (!canvas) return;
    let start: { x: number; y: number } | null = null;
    const TH = 22;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start = { x: t.clientX, y: t.clientY };
      onFirstTouch?.();
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      const t = e.touches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) > TH || Math.abs(dy) > TH) {
        if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
        else setDir(dy > 0 ? "down" : "up");
        start = { x: t.clientX, y: t.clientY };
      }
      if (e.cancelable) e.preventDefault();
    };
    const onEnd = () => { start = null; };
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove",  onMove,  { passive: false });
    canvas.addEventListener("touchend",   onEnd);
    canvas.addEventListener("touchcancel", onEnd);
    return () => {
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchmove",  onMove);
      canvas.removeEventListener("touchend",   onEnd);
      canvas.removeEventListener("touchcancel", onEnd);
    };
  }, [canvas, setDir, onFirstTouch]);
}

export function useVisibilityPause(setPaused: (v: boolean) => void): void {
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "hidden") setPaused(true); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [setPaused]);
}
