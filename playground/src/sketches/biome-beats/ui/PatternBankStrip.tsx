import { motion } from "motion/react";
import type { PatternBank } from "../engine/patternBank";
import { PALETTES } from "../data/palette";
import type { BiomeId } from "../data/biomes";

interface PatternBankStripProps {
  bank: PatternBank;
  biomeId: BiomeId;
  onSelect: (idx: number) => void;
}

function patternHasContent(p: PatternBank["patterns"][number]): boolean {
  return p.rings.some((r) => r.enabled && r.slices.some((s) => s.active));
}

export function PatternBankStrip({ bank, biomeId, onSelect }: PatternBankStripProps) {
  const palette = PALETTES[biomeId];
  return (
    <div
      className="flex gap-1.5 p-1.5 rounded-lg"
      role="tablist"
      aria-label="Pattern bank"
      style={{ background: palette.surface }}
    >
      {bank.patterns.map((p, i) => {
        const isActive = bank.activeIndex === i;
        const hasContent = patternHasContent(p);
        return (
          <motion.button
            key={i}
            role="tab"
            aria-selected={isActive}
            aria-label={`Pattern ${i + 1}${hasContent ? " (has content)" : " (empty)"}`}
            onClick={() => onSelect(i)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            animate={{ scale: isActive ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="w-9 h-9 rounded-md text-sm font-mono flex items-center justify-center relative"
            style={{
              background: isActive ? palette.accent : "transparent",
              color: isActive ? palette.bg : palette.text,
              border: `1px solid ${isActive ? palette.accent : palette.text + "30"}`,
              opacity: isActive ? 1 : hasContent ? 0.85 : 0.45,
            }}
          >
            {i + 1}
            {hasContent && !isActive && (
              <span
                className="absolute bottom-1 right-1.5 w-1 h-1 rounded-full"
                style={{ background: palette.accent }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
