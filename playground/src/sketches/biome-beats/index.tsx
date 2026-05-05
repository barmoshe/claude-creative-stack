import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import {
  createPattern,
  toggleSliceActive,
  type Pattern,
} from "./engine/pattern";
import {
  activePattern,
  createPatternBank,
  setActiveIndex,
  updatePattern,
  type PatternBank,
} from "./engine/patternBank";
import type { ChordSlice, NoteSlice, PercSlice } from "./engine/sliceState";
import { ensureAudio, setBpm, startTransport, stopTransport } from "./audio/transport";
import { createOrchestrator, type AudioOrchestrator } from "./audio/orchestrator";
import { RadialView } from "./ui/RadialView";
import { SliceEditor } from "./ui/SliceEditor";
import { PatternBankStrip } from "./ui/PatternBankStrip";
import { BiomePicker } from "./ui/BiomePicker";
import { ExportButton } from "./ui/ExportButton";
import { BiomeBackdrop } from "./visual/BiomeBackdrop";
import { useBeatReactive } from "./hooks/useBeatReactive";
import { PALETTES } from "./data/palette";
import { BIOMES, type BiomeId } from "./data/biomes";

function makeDemoPattern(): Pattern {
  const p = createPattern("space");

  const chord = p.rings[0];
  chord.enabled = true;
  const chordDegrees = [1, 4, 5, 1, 6, 4, 5, 1];
  for (let i = 0; i < chord.length; i++) {
    const slice = chord.slices[i] as ChordSlice;
    slice.active = true;
    slice.pitchDegree = chordDegrees[i % chordDegrees.length];
    slice.chordSize = 3;
    slice.voicing = "close";
  }

  const bass = p.rings[1];
  bass.enabled = true;
  const bassDegrees = [1, 1, 4, 5, 1, 1];
  for (let i = 0; i < bass.length; i++) {
    const slice = bass.slices[i] as NoteSlice;
    slice.active = true;
    slice.pitchDegree = bassDegrees[i % bassDegrees.length];
  }

  const perc = p.rings[3];
  perc.enabled = true;
  for (let i = 0; i < perc.length; i++) {
    const slice = perc.slices[i] as PercSlice;
    if (i % 4 === 0) {
      slice.active = true;
      slice.drumSlot = 0;
    } else if (i % 4 === 2) {
      slice.active = true;
      slice.drumSlot = 1;
    } else if (i % 2 === 1) {
      slice.active = true;
      slice.drumSlot = 2;
    }
  }
  return p;
}

function makeInitialBank(): PatternBank {
  let bank = createPatternBank();
  bank = updatePattern(bank, 0, () => makeDemoPattern());
  return bank;
}

export default function BiomeBeats() {
  const [bank, setBank] = useState<PatternBank>(makeInitialBank);
  const [running, setRunning] = useState(false);
  const [activeByRing, setActiveByRing] = useState<Array<number | null>>([
    null,
    null,
    null,
    null,
  ]);
  const [focused, setFocused] = useState<{ ringIdx: number; sliceIdx: number } | null>(null);
  const orchRef = useRef<AudioOrchestrator | null>(null);
  const { beatPhaseRef, amplitudeRef } = useBeatReactive();

  const pattern = activePattern(bank);

  useEffect(() => {
    orchRef.current = createOrchestrator(pattern, (ringIdx, sliceIdx) => {
      setActiveByRing((prev) => {
        if (prev[ringIdx] === sliceIdx) return prev;
        const next = prev.slice();
        next[ringIdx] = sliceIdx;
        return next;
      });
    });
    return () => {
      orchRef.current?.dispose();
      orchRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    orchRef.current?.setPattern(pattern);
  }, [pattern]);

  useEffect(() => {
    if (running) setBpm(pattern.bpm);
  }, [pattern.bpm, running]);

  async function handleStart() {
    await ensureAudio();
    setBpm(pattern.bpm);
    startTransport();
    setRunning(true);
  }

  function handleStop() {
    stopTransport();
    setRunning(false);
    setActiveByRing([null, null, null, null]);
  }

  const handleSliceClick = useCallback((ringIdx: number, sliceIdx: number) => {
    setBank((b) =>
      updatePattern(b, b.activeIndex, (p) => toggleSliceActive(p, ringIdx, sliceIdx)),
    );
    setFocused({ ringIdx, sliceIdx });
  }, []);

  const handleToggleRing = useCallback((ringIdx: number) => {
    setBank((b) =>
      updatePattern(b, b.activeIndex, (p) => ({
        ...p,
        rings: p.rings.map((r, i) => (i === ringIdx ? { ...r, enabled: !r.enabled } : r)),
      })),
    );
  }, []);

  const handleUpdatePattern = useCallback((next: Pattern) => {
    setBank((b) => updatePattern(b, b.activeIndex, () => next));
  }, []);

  const handleSwitchPattern = useCallback((idx: number) => {
    setBank((b) => setActiveIndex(b, idx));
    setFocused(null);
    setActiveByRing([null, null, null, null]);
  }, []);

  const handleBiomeChange = useCallback((id: BiomeId) => {
    setBank((b) =>
      updatePattern(b, b.activeIndex, (p) => ({
        ...p,
        biomeId: id,
        bpm: BIOMES[id].defaultBpm,
      })),
    );
  }, []);

  const palette = PALETTES[pattern.biomeId];

  return (
    <div
      className="min-h-[calc(100vh-3rem)] relative transition-colors duration-700"
      style={{ color: palette.text, isolation: "isolate" }}
    >
      <BiomeBackdrop
        biomeId={pattern.biomeId}
        beatPhaseRef={beatPhaseRef}
        amplitudeRef={amplitudeRef}
      />
      <div className="relative z-10 max-w-6xl mx-auto p-8">
        <header className="mb-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold mb-1">BiomeBeats</h1>
            <p className="opacity-70 text-sm max-w-xl">
              Chord/melody-forward radial sequencer. Four concentric rings (chord ·
              bass · melody · perc), each with its own length to make polyrhythm.
              Click any slice to toggle and edit. Switch patterns in the bank up top.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!running ? (
              <button
                onClick={handleStart}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition"
                style={{ background: palette.accent, color: palette.bg }}
              >
                <Play size={16} /> Play
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition"
                style={{ background: palette.surface, color: palette.text }}
              >
                <Square size={16} /> Stop
              </button>
            )}
            <span className="opacity-60 text-xs font-mono">
              {pattern.biomeId} · {pattern.bpm} BPM
            </span>
          </div>
        </header>

        <div className="mb-5 flex flex-wrap items-center gap-3 justify-between">
          <PatternBankStrip
            bank={bank}
            biomeId={pattern.biomeId}
            onSelect={handleSwitchPattern}
          />
          <div className="flex items-center gap-3">
            <BiomePicker value={pattern.biomeId} onChange={handleBiomeChange} />
            <ExportButton pattern={pattern} patternIndex={bank.activeIndex} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex flex-col items-center gap-4">
            <RadialView
              rings={pattern.rings}
              biomeId={pattern.biomeId}
              activeByRing={activeByRing}
              focused={focused}
              onSliceClick={handleSliceClick}
              size={580}
            />
            <div className="flex gap-2 flex-wrap justify-center">
              {pattern.rings.map((ring, i) => (
                <button
                  key={ring.role}
                  onClick={() => handleToggleRing(i)}
                  className="px-3 py-1.5 rounded-md text-xs transition capitalize"
                  style={{
                    background: ring.enabled ? palette.surface : "transparent",
                    color: palette.text,
                    border: `1px solid ${ring.enabled ? palette.accent : palette.text + "30"}`,
                    opacity: ring.enabled ? 1 : 0.5,
                  }}
                >
                  {ring.role} · {ring.length}
                </button>
              ))}
            </div>
          </div>

          <div className="md:sticky md:top-8">
            <SliceEditor
              pattern={pattern}
              focused={focused}
              onUpdatePattern={handleUpdatePattern}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
