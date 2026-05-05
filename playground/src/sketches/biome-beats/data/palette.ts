import type { BiomeId } from "./biomes";

export interface BiomePalette {
  bg: string;
  surface: string;
  ringChord: string;
  ringBass: string;
  ringMelody: string;
  ringPerc: string;
  accent: string;
  text: string;
}

export const PALETTES: Record<BiomeId, BiomePalette> = {
  space: {
    bg:        "oklch(0.14 0.04 280)",
    surface:   "oklch(0.20 0.06 280)",
    ringChord: "oklch(0.78 0.18 280)",
    ringBass:  "oklch(0.62 0.20 305)",
    ringMelody:"oklch(0.85 0.14 240)",
    ringPerc:  "oklch(0.72 0.16 200)",
    accent:    "oklch(0.92 0.18 90)",
    text:      "oklch(0.96 0.02 280)",
  },
  jungle: {
    bg:        "oklch(0.16 0.05 150)",
    surface:   "oklch(0.22 0.07 150)",
    ringChord: "oklch(0.74 0.19 130)",
    ringBass:  "oklch(0.55 0.16 110)",
    ringMelody:"oklch(0.82 0.16 95)",
    ringPerc:  "oklch(0.68 0.15 60)",
    accent:    "oklch(0.88 0.18 65)",
    text:      "oklch(0.96 0.02 150)",
  },
  sea: {
    bg:        "oklch(0.15 0.04 220)",
    surface:   "oklch(0.21 0.06 220)",
    ringChord: "oklch(0.76 0.16 220)",
    ringBass:  "oklch(0.55 0.18 240)",
    ringMelody:"oklch(0.84 0.13 200)",
    ringPerc:  "oklch(0.68 0.12 180)",
    accent:    "oklch(0.90 0.14 195)",
    text:      "oklch(0.96 0.02 220)",
  },
  cyberpunk: {
    bg:        "oklch(0.12 0.05 330)",
    surface:   "oklch(0.18 0.08 330)",
    ringChord: "oklch(0.72 0.27 340)",
    ringBass:  "oklch(0.62 0.25 320)",
    ringMelody:"oklch(0.78 0.24 200)",
    ringPerc:  "oklch(0.68 0.22 30)",
    accent:    "oklch(0.86 0.22 90)",
    text:      "oklch(0.96 0.02 330)",
  },
  tundra: {
    bg:        "oklch(0.20 0.02 250)",
    surface:   "oklch(0.26 0.03 250)",
    ringChord: "oklch(0.86 0.06 230)",
    ringBass:  "oklch(0.70 0.10 270)",
    ringMelody:"oklch(0.92 0.05 210)",
    ringPerc:  "oklch(0.78 0.06 240)",
    accent:    "oklch(0.94 0.10 90)",
    text:      "oklch(0.96 0.02 250)",
  },
};
