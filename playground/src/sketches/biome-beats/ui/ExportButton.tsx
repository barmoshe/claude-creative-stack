import { Download } from "lucide-react";
import { motion } from "motion/react";
import type { Pattern } from "../engine/pattern";
import { exportPatternAsMidi } from "../midi/exportPattern";
import { PALETTES } from "../data/palette";

interface ExportButtonProps {
  pattern: Pattern;
  patternIndex: number;
}

export function ExportButton({ pattern, patternIndex }: ExportButtonProps) {
  const palette = PALETTES[pattern.biomeId];

  const handleClick = () => {
    exportPatternAsMidi(pattern, `biomebeats-${pattern.biomeId}-p${patternIndex + 1}`);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition"
      style={{
        background: "transparent",
        color: palette.text,
        border: `1px solid ${palette.text}30`,
      }}
      aria-label="Export pattern as MIDI"
    >
      <Download size={13} /> .mid
    </motion.button>
  );
}
