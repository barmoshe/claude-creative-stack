import { AnimatePresence, motion } from "motion/react";
import type { Pattern } from "../engine/pattern";
import { setSliceField } from "../engine/pattern";
import { PALETTES } from "../data/palette";

interface SliceEditorProps {
  pattern: Pattern;
  focused: { ringIdx: number; sliceIdx: number } | null;
  onUpdatePattern: (next: Pattern) => void;
}

const QUALITIES = ["auto", "major", "minor", "dim", "aug", "sus2", "sus4"] as const;
const VOICINGS = ["close", "open", "drop2", "spread", "shell"] as const;
const DRUM_LABELS = ["Kick", "Snare", "Hat", "Perc1", "Perc2"];

export function SliceEditor({ pattern, focused, onUpdatePattern }: SliceEditorProps) {
  const palette = PALETTES[pattern.biomeId];

  if (!focused) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="rounded-xl p-5 text-sm"
        style={{ background: palette.surface, color: palette.text }}
      >
        <h3 className="font-semibold mb-1">Slice editor</h3>
        <p className="opacity-60">Click any slice on the rings to edit its degree, voicing, accent, and more.</p>
      </motion.div>
    );
  }

  const ring = pattern.rings[focused.ringIdx];
  const slice = ring.slices[focused.sliceIdx];

  const set = <V,>(field: string, value: V) => {
    onUpdatePattern(setSliceField(pattern, focused.ringIdx, focused.sliceIdx, field, value));
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${focused.ringIdx}-${focused.sliceIdx}`}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-xl p-5 space-y-4"
        style={{ background: palette.surface, color: palette.text }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold capitalize">
            {ring.role} · slice {focused.sliceIdx + 1}
          </h3>
          <span className="text-[10px] uppercase tracking-wide opacity-50 font-mono">
            {slice.kind}
          </span>
        </div>

      <Toggle
        label="Active"
        value={slice.active}
        onChange={(v) => set("active", v)}
        palette={palette}
      />

      <Slider
        label="Velocity"
        value={slice.velocity}
        min={0}
        max={127}
        step={1}
        onChange={(v) => set("velocity", v)}
        palette={palette}
      />

      <Slider
        label="Microtiming (ms)"
        value={slice.microtiming}
        min={-50}
        max={50}
        step={1}
        onChange={(v) => set("microtiming", v)}
        palette={palette}
      />

      {(slice.kind === "chord" || slice.kind === "note") && (
        <>
          <Slider
            label="Degree"
            value={slice.pitchDegree}
            min={1}
            max={7}
            step={1}
            onChange={(v) => set("pitchDegree", v)}
            palette={palette}
          />
          <Slider
            label="Octave"
            value={slice.octave}
            min={-2}
            max={2}
            step={1}
            onChange={(v) => set("octave", v)}
            palette={palette}
          />
        </>
      )}

      {slice.kind === "chord" && (
        <>
          <Select
            label="Quality"
            value={slice.chordQuality}
            options={QUALITIES as readonly string[]}
            onChange={(v) => set("chordQuality", v)}
            palette={palette}
          />
          <Slider
            label="Chord size"
            value={slice.chordSize}
            min={1}
            max={5}
            step={1}
            onChange={(v) => set("chordSize", v)}
            palette={palette}
          />
          <Slider
            label="Inversion"
            value={slice.inversion}
            min={0}
            max={3}
            step={1}
            onChange={(v) => set("inversion", v)}
            palette={palette}
          />
          <Select
            label="Voicing"
            value={slice.voicing}
            options={VOICINGS as readonly string[]}
            onChange={(v) => set("voicing", v)}
            palette={palette}
          />
        </>
      )}

      {slice.kind === "perc" && (
        <Select
          label="Drum"
          value={String(slice.drumSlot)}
          options={["0", "1", "2", "3", "4"]}
          labels={DRUM_LABELS}
          onChange={(v) => set("drumSlot", Number(v))}
          palette={palette}
        />
      )}

        <div className="flex gap-2 pt-1">
          <Chip label="Accent" value={slice.accent} onChange={(v) => set("accent", v)} palette={palette} />
          <Chip label="Tie" value={slice.tie} onChange={(v) => set("tie", v)} palette={palette} />
          <Chip label="Mute" value={slice.mute} onChange={(v) => set("mute", v)} palette={palette} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ControlBaseProps {
  palette: { accent: string; bg: string; text: string; surface: string };
}

function Toggle({
  label,
  value,
  onChange,
  palette,
}: { label: string; value: boolean; onChange: (v: boolean) => void } & ControlBaseProps) {
  return (
    <label className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="px-3 py-1 rounded-md text-xs transition"
        style={{
          background: value ? palette.accent : "transparent",
          color: value ? palette.bg : palette.text,
          border: `1px solid ${value ? palette.accent : palette.bg}`,
          opacity: value ? 1 : 0.6,
        }}
      >
        {value ? "ON" : "OFF"}
      </button>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  palette,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
} & ControlBaseProps) {
  return (
    <label className="block text-sm">
      <div className="flex items-center justify-between mb-1">
        <span>{label}</span>
        <span className="font-mono text-xs opacity-70">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: palette.accent }}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  labels,
  onChange,
  palette,
}: {
  label: string;
  value: string;
  options: readonly string[];
  labels?: readonly string[];
  onChange: (v: string) => void;
} & ControlBaseProps) {
  return (
    <label className="block text-sm">
      <span className="block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 rounded-md text-sm"
        style={{
          background: palette.bg,
          color: palette.text,
          border: `1px solid ${palette.accent}40`,
        }}
      >
        {options.map((o, i) => (
          <option key={o} value={o}>
            {labels?.[i] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Chip({
  label,
  value,
  onChange,
  palette,
}: { label: string; value: boolean; onChange: (v: boolean) => void } & ControlBaseProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="px-2.5 py-1 rounded-md text-xs transition flex-1"
      style={{
        background: value ? palette.accent : "transparent",
        color: value ? palette.bg : palette.text,
        border: `1px solid ${value ? palette.accent : palette.text + "40"}`,
        opacity: value ? 1 : 0.7,
      }}
    >
      {label}
    </button>
  );
}
