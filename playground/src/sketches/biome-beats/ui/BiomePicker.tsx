import type { BiomeId } from "../data/biomes";
import { BIOMES, BIOME_IDS } from "../data/biomes";
import { PALETTES } from "../data/palette";

interface BiomePickerProps {
  value: BiomeId;
  onChange: (id: BiomeId) => void;
}

export function BiomePicker({ value, onChange }: BiomePickerProps) {
  const palette = PALETTES[value];
  return (
    <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Biome">
      {BIOME_IDS.map((id) => {
        const isActive = id === value;
        const bp = PALETTES[id];
        return (
          <button
            key={id}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(id)}
            className="px-3 py-1.5 rounded-md text-xs transition capitalize"
            style={{
              background: isActive ? bp.ringChord : "transparent",
              color: isActive ? bp.bg : palette.text,
              border: `1px solid ${isActive ? bp.ringChord : palette.text + "30"}`,
              opacity: isActive ? 1 : 0.7,
            }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
              style={{ background: bp.accent }}
            />
            {BIOMES[id].name}
          </button>
        );
      })}
    </div>
  );
}
