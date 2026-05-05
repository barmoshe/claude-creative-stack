// bridge.js — JS ↔ JUCE host glue for SpriteSynth.
//
// JS sends graph mutations to C++ (audio thread owns the simulation now,
// so timing follows host BPM and the music continues even when the WebView
// is closed). JS keeps its own visual state for rendering.

import {
  getNativeFunction,
  getSliderState,
  getToggleState,
  getComboBoxState,
} from "./jucefrontend.js";

const TOGGLES = ["internalSound"];
const SLIDERS = ["octave"];
const CHOICES = ["scale", "root"];

const params = {
  internalSound: false,
  scale: 0,
  root: 0,
  octave: 4,
};

const subscribers = new Set();
export const onChange = (fn) => { subscribers.add(fn); fn(params); return () => subscribers.delete(fn); };
const broadcast = () => subscribers.forEach((fn) => fn(params));

const toggleStates = {}, sliderStates = {}, choiceStates = {};

const wireToggle = (id) => {
  const s = getToggleState(id);
  if (!s) return;
  toggleStates[id] = s;
  const pull = () => { params[id] = !!s.getValue(); broadcast(); };
  s.valueChangedEvent.addListener(pull);
  pull();
};
const wireSlider = (id) => {
  const s = getSliderState(id);
  if (!s) return;
  sliderStates[id] = s;
  const pull = () => { params[id] = s.scaledValue; broadcast(); };
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

TOGGLES.forEach(wireToggle);
SLIDERS.forEach(wireSlider);
CHOICES.forEach(wireChoice);

export const setParam = (id, value) => {
  params[id] = value;
  broadcast();
  if (toggleStates[id]) toggleStates[id].setValue(!!value);
  else if (sliderStates[id]) {
    const props = sliderStates[id].properties || { start: 0, end: 1 };
    const range = (props.end - props.start) || 1;
    const norm = Math.max(0, Math.min(1, (Number(value) - props.start) / range));
    sliderStates[id].setNormalisedValue(norm);
  }
  else if (choiceStates[id]) choiceStates[id].setChoiceIndex(Number(value) | 0);
};

// --- JS → C++ graph mutations ---------------------------------------------
const pushNodeFn     = getNativeFunction("pushNode");
const pushBondFn     = getNativeFunction("pushBond");
const pushCreatureFn = getNativeFunction("pushCreature");
const resetGraphFn   = getNativeFunction("resetGraph");
const bridgeReadyFn  = getNativeFunction("bridgeReady");

// parentIdx = -1 for tree root. treeId is just an int that groups nodes.
export const pushNode = (parentIdx, treeId, x, y, hue) =>
  pushNodeFn(parentIdx | 0, treeId | 0, +x, +y, +hue);

export const pushBond = (aIdx, bIdx) =>
  pushBondFn(aIdx | 0, bIdx | 0);

export const pushCreature = (rootNodeIdx, channel = 1, beatsPerStep = 0.5) =>
  pushCreatureFn(rootNodeIdx | 0, channel | 0, +beatsPerStep);

export const resetGraph = () => resetGraphFn();

try { bridgeReadyFn("loaded at " + new Date().toISOString()); }
catch (e) { console.error("bridgeReady failed:", e); }

export const bridge = {
  params, onChange, setParam,
  pushNode, pushBond, pushCreature, resetGraph,
};
window.__spriteSynthBridge = bridge;
