# Web Audio fallbacks

For builds that use raw Web Audio API instead of Tone.js. Maps each Tone.js parameter the vocabulary bridge touches to its Web Audio equivalent.

## Envelope (manual ADSR via GainNode automation)

```js
function envelope(gain, t, { attack, decay, sustain, release }) {
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(1, t + attack);
  gain.gain.linearRampToValueAtTime(sustain, t + attack + decay);
  // release: when note-off fires
  // gain.gain.linearRampToValueAtTime(0, releaseStart + release);
}
```

| Tone.js | Web Audio |
|---|---|
| `envelope.attack` | second arg to first `linearRampToValueAtTime` |
| `envelope.decay` | second `linearRampToValueAtTime` (relative) |
| `envelope.sustain` | the level held after decay |
| `envelope.release` | scheduled on note-off |
| `envelope.attackCurve = "exponential"` | use `exponentialRampToValueAtTime` (cannot ramp from 0 — start at 0.001) |

## Filter

```js
const filter = ctx.createBiquadFilter();
filter.type = "lowpass";       // Tone.Filter.type
filter.frequency.value = 3500; // Tone.Filter.frequency
filter.Q.value = 3;            // Tone.Filter.Q
filter.gain.value = 0;         // peaking/shelf only
```

## EQ3 → 3 BiquadFilters in series

```js
const lowShelf  = ctx.createBiquadFilter(); lowShelf.type = "lowshelf";  lowShelf.frequency.value = 400;
const mid       = ctx.createBiquadFilter(); mid.type      = "peaking";   mid.frequency.value      = 1500; mid.Q.value = 0.7;
const highShelf = ctx.createBiquadFilter(); highShelf.type = "highshelf"; highShelf.frequency.value = 4000;
src.connect(lowShelf).connect(mid).connect(highShelf).connect(out);
```

## Distortion → WaveShaperNode

```js
function makeDistortionCurve(amount) {
  const k = amount * 100;
  const n = 44100;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) /
               (Math.PI + k * Math.abs(x));
  }
  return curve;
}
const ws = ctx.createWaveShaper();
ws.curve = makeDistortionCurve(0.15);
ws.oversample = "2x";
```

## Compressor → DynamicsCompressorNode

```js
const comp = ctx.createDynamicsCompressor();
comp.threshold.value = -24;
comp.ratio.value     = 4;
comp.attack.value    = 0.003;
comp.release.value   = 0.25;
comp.knee.value      = 30;
```

## Reverb → ConvolverNode

Web Audio doesn't have an algorithmic reverb. Use a pre-rendered impulse response (any short hall IR works).

```js
const conv = ctx.createConvolver();
const ir = await fetch("/ir/short-hall.wav").then(r => r.arrayBuffer());
conv.buffer = await ctx.decodeAudioData(ir);
// "decay" is baked into the IR; "wet" is a wet/dry mixer:
const wet = ctx.createGain(); wet.gain.value = 0.35;
const dry = ctx.createGain(); dry.gain.value = 0.65;
src.connect(conv).connect(wet).connect(out);
src.connect(dry).connect(out);
```

## Chorus → DelayNode + LFO (manual)

```js
const delay = ctx.createDelay(0.05);
delay.delayTime.value = 0.0035;
const lfo = ctx.createOscillator();
lfo.frequency.value = 1.5;
const lfoGain = ctx.createGain();
lfoGain.gain.value = 0.0015;        // depth
lfo.connect(lfoGain).connect(delay.delayTime);
lfo.start();
```

## BitCrusher → AudioWorklet

Web Audio has no built-in bitcrusher. Implement as an `AudioWorkletProcessor`:

```js
class BitCrusher extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: "bits", defaultValue: 8, minValue: 1, maxValue: 16 }];
  }
  process(inputs, outputs, params) {
    const input = inputs[0]; const output = outputs[0];
    const bits = params.bits[0];
    const step = Math.pow(0.5, bits);
    for (let c = 0; c < input.length; c++) {
      for (let i = 0; i < input[c].length; i++) {
        output[c][i] = step * Math.floor(input[c][i] / step);
      }
    }
    return true;
  }
}
registerProcessor("bit-crusher", BitCrusher);
```

## Note on units

- Tone.js often accepts strings ("4n" = quarter note); Web Audio wants raw numbers.
- Tone.js uses dB for gain in some places; Web Audio's `GainNode.gain.value` is linear (10^(dB/20)).
- Times are seconds in Web Audio; some Tone.js APIs accept "0.1" strings or note durations.
