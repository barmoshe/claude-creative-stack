import { useEffect, useRef } from "react";
import { STEP } from "../maze/constants";

/**
 * Fixed-timestep accumulator. Caller provides a stable `tick` (mutates
 * shared refs) and a `render` (paints from the same refs).  Returns the
 * `requestAnimationFrame` id-handle internally; cleans up on unmount.
 */
export function useGameLoop(
  tick: (dt: number) => void,
  render: (now: number) => void,
): void {
  const rafRef = useRef<number>(0);
  useEffect(() => {
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      let ft = (now - last) / 1000;
      if (ft > 0.25) ft = 0.25;
      last = now;
      acc += ft;
      while (acc >= STEP) { tick(STEP); acc -= STEP; }
      render(now);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, render]);
}
