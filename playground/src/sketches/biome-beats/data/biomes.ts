export type BiomeId = "space" | "jungle" | "sea" | "cyberpunk" | "tundra";

export type ScaleMode = "pentatonic" | "lydian" | "arabic" | "minor";

export interface Biome {
  id: BiomeId;
  name: string;
  scaleRoot: number;
  scaleMode: ScaleMode;
  scaleIntervals: readonly number[];
  defaultBpm: number;
  polyphonyCap: number;
  paletteId: BiomeId;
  shaderId: BiomeId;
}

export const BIOMES: Record<BiomeId, Biome> = {
  space: {
    id: "space",
    name: "Space",
    scaleRoot: 69,
    scaleMode: "pentatonic",
    scaleIntervals: [0, 2, 4, 7, 9],
    defaultBpm: 94,
    polyphonyCap: 24,
    paletteId: "space",
    shaderId: "space",
  },
  jungle: {
    id: "jungle",
    name: "Jungle",
    scaleRoot: 64,
    scaleMode: "pentatonic",
    scaleIntervals: [0, 2, 4, 7, 9],
    defaultBpm: 108,
    polyphonyCap: 24,
    paletteId: "jungle",
    shaderId: "jungle",
  },
  sea: {
    id: "sea",
    name: "Sea",
    scaleRoot: 62,
    scaleMode: "lydian",
    scaleIntervals: [0, 2, 4, 6, 7, 9, 11],
    defaultBpm: 76,
    polyphonyCap: 16,
    paletteId: "sea",
    shaderId: "sea",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    scaleRoot: 65,
    scaleMode: "arabic",
    scaleIntervals: [0, 1, 4, 5, 7, 8, 11],
    defaultBpm: 128,
    polyphonyCap: 12,
    paletteId: "cyberpunk",
    shaderId: "cyberpunk",
  },
  tundra: {
    id: "tundra",
    name: "Tundra",
    scaleRoot: 67,
    scaleMode: "minor",
    scaleIntervals: [0, 2, 3, 5, 7, 8, 10],
    defaultBpm: 68,
    polyphonyCap: 16,
    paletteId: "tundra",
    shaderId: "tundra",
  },
};

export const BIOME_IDS: readonly BiomeId[] = ["space", "jungle", "sea", "cyberpunk", "tundra"];
