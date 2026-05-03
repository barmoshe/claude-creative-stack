type AudioCtxLike = AudioContext;

let ctx: AudioCtxLike | null = null;
let muted = false;

export function isMuted(): boolean { return muted; }
export function setMuted(v: boolean): void { muted = v; }

export function unlockAudio(): void {
  if (ctx) { ctx.resume(); return; }
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.02);
  } catch { /* no audio context available */ }
}

function blip(
  freq: number, durMs: number,
  type: OscillatorType = "square",
  vol: number = 0.06, slideTo?: number,
): void {
  if (muted || !ctx) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, now);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + durMs / 1000);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(vol, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
  o.connect(g).connect(ctx.destination);
  o.start(now); o.stop(now + durMs / 1000);
}

export const SFX = {
  packet: () => blip(720 + Math.random() * 120, 50, "square", 0.04),
  power:  () => {
    blip(440, 180, "sawtooth", 0.06, 880);
    setTimeout(() => blip(880, 180, "sawtooth", 0.05, 1320), 90);
  },
  eaten:  () => {
    blip(900, 90, "square", 0.08, 1500);
    setTimeout(() => blip(1500, 140, "square", 0.06, 400), 60);
  },
  death:  () => [520, 420, 320, 240, 180].forEach((f, i) => setTimeout(() => blip(f, 220, "sawtooth", 0.08), i * 130)),
  win:    () => [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => blip(f, 160, "square", 0.07), i * 110)),
};
