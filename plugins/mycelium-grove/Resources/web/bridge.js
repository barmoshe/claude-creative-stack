// bridge.js — JS ↔ JUCE host glue, JUCE 8 canonical API.
//
// JS → C++ : `getNativeFunction("name")` returns a callable that round-trips
//            through window.__JUCE__.backend.emitEvent("__juce__invoke", …).
// C++ → JS : `getSliderState("id").valueChangedEvent.addListener(…)` etc.

import {
  getNativeFunction,
  getSliderState,
  getToggleState,
  getComboBoxState,
} from "./jucefrontend.js";

const SLIDERS = ["rainRate", "bondRadius", "branchProb", "octave", "velocity",
                 "sporeChan", "bondChan", "sporeLen", "bondLen"];
const TOGGLES = ["rainOn", "freezeOnStop"];
const CHOICES = ["scale", "root"];

const params = {
  rainOn: false, rainRate: 1.4, bondRadius: 22, branchProb: 0.16,
  scale: 0, root: 0, octave: 4, velocity: 85,
  sporeChan: 1, bondChan: 2, sporeLen: 0.25, bondLen: 0.7, freezeOnStop: false,
};

const subscribers = new Set();
export const onChange = (fn) => { subscribers.add(fn); fn(params); return () => subscribers.delete(fn); };
const broadcast = () => subscribers.forEach((fn) => fn(params));

// --- C++ → JS relay subscriptions -----------------------------------------
const sliderStates = {}, toggleStates = {}, choiceStates = {};

const wireSlider = (id, transform = (v) => v) => {
  const s = getSliderState(id);
  if (!s) return;
  sliderStates[id] = s;
  const pull = () => { params[id] = transform(s.scaledValue); broadcast(); };
  s.valueChangedEvent.addListener(pull);
  pull();
};

const wireToggle = (id) => {
  const s = getToggleState(id);
  if (!s) return;
  toggleStates[id] = s;
  const pull = () => { params[id] = !!s.getValue(); broadcast(); };
  s.valueChangedEvent.addListener(pull);
  pull();
};

const wireChoice = (id) => {
  const s = getComboBoxState(id);
  if (!s) return;
  choiceStates[id] = s;
  const pull = () => { params[id] = s.getChoiceIndex() | 0; broadcast(); };
  s.valueChangedEvent.addListener(pull);
  pull();
};

SLIDERS.forEach((id) => wireSlider(id));
TOGGLES.forEach(wireToggle);
CHOICES.forEach(wireChoice);

// --- JS → C++ writes from the in-canvas overlay ---------------------------
export const setParam = (id, value) => {
  // Optimistic local update for instant UI feel.
  params[id] = value;
  broadcast();

  if (sliderStates[id]) {
    // Sliders take a normalised [0, 1] value.
    const props = sliderStates[id].properties || { start: 0, end: 1 };
    const range = (props.end - props.start) || 1;
    const norm = Math.max(0, Math.min(1, (Number(value) - props.start) / range));
    sliderStates[id].setNormalisedValue(norm);
  } else if (toggleStates[id]) {
    toggleStates[id].setValue(!!value);
  } else if (choiceStates[id]) {
    choiceStates[id].setChoiceIndex(Number(value) | 0);
  }
};

// --- JS → C++ outbound events ---------------------------------------------
const seedSporeFn  = getNativeFunction("seedSpore");
const bondFormedFn = getNativeFunction("bondFormed");
const bridgeReadyFn = getNativeFunction("bridgeReady");

// canvasX in [0..W] -> pan in [-1..+1].
const xToPan = (x, w) => Math.max(-1, Math.min(1, (x / Math.max(1, w)) * 2 - 1));

// Spore velocity is loud-and-tight (a click is a deliberate gesture).
const seedSpore  = (hue, x = 0, w = 1) =>
  seedSporeFn(hue, performance.now(), 0.9, xToPan(x, w));

// Bond velocity scales with the combined "mass" of the two tips that touched.
// thicknessSum is roughly the sum of ((maxGen - gen) / maxGen) for both nodes.
const bondFormed = (hueA, hueB, x = 0, w = 1, thicknessSum = 1) => {
  const vel = Math.max(0.4, Math.min(1.0, 0.4 + thicknessSum * 0.18));
  bondFormedFn(hueA, hueB, performance.now(), vel, xToPan(x, w));
};

export const bridge = { params, onChange, setParam, seedSpore, bondFormed };

// Expose globally so sim.js (sibling module) can find it without a circular import.
window.__myceliumBridge = bridge;

// Ping C++ so we can confirm in /tmp/mycelium-grove.log that bridge.js loaded.
try {
  bridgeReadyFn("loaded at " + new Date().toISOString());
} catch (e) {
  // If __JUCE__.backend isn't there, this throws — that itself is diagnostic.
  console.error("bridgeReady call failed:", e);
}
