# 07 — Audio & Music

## 7.1 Tone.js

Version ~15.5 (May 2026). CDN `https://unpkg.com/tone@15`. `npm i tone`. **Always call `await Tone.start()` after a user gesture.**

```js
import * as Tone from "tone";
document.querySelector("button").addEventListener("click", async () => {
  await Tone.start();
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  synth.triggerAttackRelease(["C4","E4","G4"], "8n");

  Tone.getTransport().bpm.value = 120;
  new Tone.Sequence((t,n) => synth.triggerAttackRelease(n, "16n", t),
    ["C4","E4","G4","B4","C5","B4","G4","E4"], "8n").start(0);
  Tone.getTransport().start();

  const reverb = new Tone.Reverb(2).toDestination();
  const delay  = new Tone.FeedbackDelay("8n", 0.4).connect(reverb);
  const filter = new Tone.Filter(800, "lowpass").connect(delay);
  const dist   = new Tone.Distortion(0.4).connect(filter);
  synth.connect(dist);
});
```

Classes: `Synth`, `PolySynth`, `MonoSynth`, `FMSynth`, `AMSynth`, `DuoSynth`, `MembraneSynth`, `NoiseSynth`, `Sampler`, `Player`, `GrainPlayer`. Effects: `Reverb`, `FeedbackDelay`, `Chorus`, `Phaser`, `Distortion`, `BitCrusher`, `Filter`, `AutoFilter`, `Compressor`, `Limiter`, `FrequencyShifter`, `PitchShift`. Signals: `Signal`, `LFO`, `Envelope`.

## 7.2 Web Audio API (raw)

```js
const ctx = new (window.AudioContext || window.webkitAudioContext)();
document.body.addEventListener("click", () => ctx.resume(), { once: true });

// Osc → Gain (ADSR) → Filter → Destination
const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 220;
const gain = ctx.createGain();
gain.gain.setValueAtTime(0, ctx.currentTime);
gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1200; filter.Q.value = 6;
osc.connect(gain).connect(filter).connect(ctx.destination);
osc.start(); osc.stop(ctx.currentTime + 0.4);

// AudioBufferSourceNode (one-shot sample)
const buf = await fetch("hit.wav").then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b));
function play(pitch=1, vol=1){
  const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = pitch;
  const g = ctx.createGain(); g.gain.value = vol;
  s.connect(g).connect(ctx.destination); s.start();
}

// ConvolverNode (IR reverb), DelayNode (+feedback loop via GainNode), WaveShaperNode (distortion)
// AnalyserNode (FFT for visualizers): an.getByteFrequencyData(bins)

// Spatial: PannerNode HRTF
const pan = ctx.createPanner();
pan.panningModel = "HRTF"; pan.distanceModel = "inverse";
pan.refDistance = 1; pan.maxDistance = 100;
pan.positionX.value = x; pan.positionY.value = y; pan.positionZ.value = z;
ctx.listener.positionX.value = camX; // etc., + forwardX/Y/Z + upX/Y/Z
osc.connect(pan).connect(ctx.destination);
```

## 7.3 Howler.js (`howler@2.2.4`)

CDN `https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js`. Spatial via `howler.spatial.min.js`.

```js
const sfx = new Howl({
  src:["sfx.webm","sfx.mp3"],
  sprite: { jump:[0,500], hit:[600,300], coin:[1000,200], boom:[1400,1200] }
});
const id = sfx.play("hit"); sfx.rate(1.1, id); sfx.volume(0.7, id); sfx.fade(1,0,500,id);
Howler.volume(0.6);
Howler.pos(playerX, playerY, 0);
const amb = new Howl({ src:["amb.mp3"], loop:true, html5:true }); // stream large files
```

## 7.4 SFX generation

- **jsfxr / sfxr.me** — web UI, emits tiny param array.
- **ZzFX** — "Zuper Zmall Zound Zynth" by Frank Force; ~1 KB. Designer at `killedbyapixel.github.io/ZzFX/`. CDN `https://raw.githubusercontent.com/KilledByAPixel/ZzFX/master/ZzFXMicro.min.js`.

  ```js
  zzfx(...[,,1675,,.06,.24,1,1.82,,,837,.06]); // laser — 20 params
  ```

- **chiptune3.js** — WASM OpenMPT for `.mod/.xm/.it/.s3m`.
- **soundfont-player** — General MIDI SoundFont playback.

## 7.5 Procedural music

```js
const MAJOR=[0,2,4,5,7,9,11], MINOR=[0,2,3,5,7,8,10], PENTATONIC=[0,2,4,7,9], BLUES=[0,3,5,6,7,10], DORIAN=[0,2,3,5,7,9,10];
const midiToFreq = m => 440 * 2 ** ((m-69)/12);
const noteFromScale = (root, scale, deg) => root + Math.floor(deg/scale.length)*12 + scale[((deg%scale.length)+scale.length)%scale.length];

// Progressions
const IVIVvI = ["C","Am","F","G"];    // I–vi–IV–V
const viIVIV = ["Am","F","C","G"];    // vi–IV–I–V

// Euclidean (Bjorklund)
function euclid(k,n){ const out=[]; let b=0; for (let i=0;i<n;i++){ b+=k; if (b>=n){ b-=n; out.push(1); } else out.push(0); } return out; }
euclid(3,8); // tresillo
euclid(5,8); // cinquillo
```

Markov chains of scale degrees, cellular-automata drum patterns, generative basslines via arpeggiated chord tones are all one-file experiments that compose well inside Tone.js.
