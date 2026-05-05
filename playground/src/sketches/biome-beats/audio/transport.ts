import * as Tone from "tone";

export type BarPhaseListener = (
  barPhase: number,
  prevBarPhase: number,
  audioTime: number,
) => void;

const listeners = new Set<BarPhaseListener>();
let scheduledId: number | null = null;
let prevPhase = 0;

function ticksPerBar(): number {
  return Tone.getTransport().PPQ * 4;
}

export function setBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm;
}

export function getBpm(): number {
  return Tone.getTransport().bpm.value;
}

export async function ensureAudio(): Promise<void> {
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }
}

export function startTransport() {
  if (scheduledId === null) {
    scheduledId = Tone.getTransport().scheduleRepeat((time) => {
      const transport = Tone.getTransport();
      const ticksAtTime = transport.getTicksAtTime(time);
      const total = ticksPerBar();
      const phase = (ticksAtTime % total) / total;
      listeners.forEach((l) => l(phase, prevPhase, time));
      prevPhase = phase;
    }, "32n");
  }
  prevPhase = 0;
  Tone.getTransport().position = 0;
  Tone.getTransport().start();
}

export function stopTransport() {
  Tone.getTransport().stop();
  prevPhase = 0;
}

export function onBarPhase(cb: BarPhaseListener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function isTransportRunning(): boolean {
  return Tone.getTransport().state === "started";
}
