import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { onBarPhase } from "../audio/transport";

export function useBeatReactive() {
  const beatPhaseRef = useRef(0);
  const amplitudeRef = useRef(0);

  useEffect(() => {
    const meter = new Tone.Meter({ smoothing: 0.7 });
    Tone.getDestination().connect(meter);

    let rafId: number;
    function tick() {
      const v = meter.getValue();
      const db = typeof v === "number" ? v : 0;
      const linear = Math.pow(10, Math.max(-60, db) / 20);
      amplitudeRef.current = Math.min(1, Math.max(0, linear));
      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      meter.disconnect();
      meter.dispose();
    };
  }, []);

  useEffect(() => {
    return onBarPhase((phase) => {
      beatPhaseRef.current = phase;
    });
  }, []);

  return { beatPhaseRef, amplitudeRef };
}
