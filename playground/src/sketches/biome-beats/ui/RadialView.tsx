import { motion } from "motion/react";
import type { Ring } from "../engine/ring";
import { PALETTES } from "../data/palette";
import type { BiomeId } from "../data/biomes";

interface RadialViewProps {
  rings: Ring[];
  biomeId: BiomeId;
  activeByRing: Array<number | null>;
  focused: { ringIdx: number; sliceIdx: number } | null;
  onSliceClick: (ringIdx: number, sliceIdx: number) => void;
  size?: number;
}

const TAU = Math.PI * 2;

function annularSectorPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
): string {
  const x1 = cx + rOuter * Math.cos(startAngle);
  const y1 = cy + rOuter * Math.sin(startAngle);
  const x2 = cx + rOuter * Math.cos(endAngle);
  const y2 = cy + rOuter * Math.sin(endAngle);
  const x3 = cx + rInner * Math.cos(endAngle);
  const y3 = cy + rInner * Math.sin(endAngle);
  const x4 = cx + rInner * Math.cos(startAngle);
  const y4 = cy + rInner * Math.sin(startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
}

function sliceLabel(slice: Ring["slices"][number]): string {
  if (slice.kind === "chord" || slice.kind === "note") return String(slice.pitchDegree);
  return ["K", "S", "H", "P", "P"][slice.drumSlot];
}

export function RadialView({
  rings,
  biomeId,
  activeByRing,
  focused,
  onSliceClick,
  size = 580,
}: RadialViewProps) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuterMax = size * 0.46;
  const rInnerMin = size * 0.14;
  const ringCount = rings.length;
  const gap = 3;
  const bandWidth = (rOuterMax - rInnerMin - gap * (ringCount - 1)) / ringCount;
  const palette = PALETTES[biomeId];
  const ringColors = [
    palette.ringChord,
    palette.ringBass,
    palette.ringMelody,
    palette.ringPerc,
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="grid"
      aria-label="BiomeBeats radial sequencer"
      style={{ display: "block" }}
    >
      {rings.map((ring, ringIdx) => {
        const rOuter = rOuterMax - ringIdx * (bandWidth + gap);
        const rInner = rOuter - bandWidth;
        const labelR = (rOuter + rInner) / 2;
        const ringColor = ringColors[ringIdx];
        const ringEnabled = ring.enabled;
        const activeIdx = activeByRing[ringIdx];

        return (
          <g key={ringIdx} role="row" aria-label={`${ring.role} ring`}>
            {ring.slices.map((slice, sliceIdx) => {
              const startAngle = (sliceIdx / ring.length) * TAU - Math.PI / 2;
              const endAngle = ((sliceIdx + 1) / ring.length) * TAU - Math.PI / 2;
              const midAngle = (startAngle + endAngle) / 2;
              const path = annularSectorPath(cx, cy, rOuter, rInner, startAngle, endAngle);
              const isActive = activeIdx === sliceIdx && ringEnabled;
              const isFocused = focused?.ringIdx === ringIdx && focused.sliceIdx === sliceIdx;
              const isOn = slice.active;

              let fill = palette.surface;
              let opacity = ringEnabled ? 0.45 : 0.18;
              if (isOn) {
                fill = ringColor;
                opacity = ringEnabled ? 0.85 : 0.35;
              }
              if (isActive) opacity = 1;

              const lx = cx + labelR * Math.cos(midAngle);
              const ly = cy + labelR * Math.sin(midAngle);

              const filterStyle = isActive
                ? `drop-shadow(0 0 10px ${palette.accent})`
                : isOn && ringEnabled
                  ? `drop-shadow(0 0 4px ${ringColor})`
                  : "none";

              return (
                <g key={sliceIdx}>
                  <path
                    d={path}
                    fill={fill}
                    opacity={opacity}
                    stroke={isFocused ? palette.accent : palette.bg}
                    strokeWidth={isFocused ? 2.5 : 1.2}
                    role="gridcell"
                    aria-rowindex={ringIdx + 1}
                    aria-colindex={sliceIdx + 1}
                    aria-pressed={isOn}
                    aria-disabled={!ringEnabled}
                    aria-label={`${ring.role} slice ${sliceIdx + 1}, ${sliceLabel(slice)}, ${isOn ? "active" : "inactive"}`}
                    tabIndex={0}
                    style={{
                      cursor: "pointer",
                      transition: "opacity 160ms ease, fill 280ms ease, stroke 160ms ease",
                      filter: filterStyle,
                    }}
                    onClick={() => onSliceClick(ringIdx, sliceIdx)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        onSliceClick(ringIdx, sliceIdx);
                      }
                    }}
                  />
                  {bandWidth > 22 && (
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={Math.min(bandWidth * 0.42, 14)}
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fill={isOn && ringEnabled ? palette.bg : palette.text}
                      opacity={isOn && ringEnabled ? 0.9 : 0.5}
                      pointerEvents="none"
                    >
                      {sliceLabel(slice)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
      <motion.circle
        cx={cx}
        cy={cy}
        r={size * 0.04}
        fill={palette.accent}
        animate={{
          scale: activeByRing.some((v) => v !== null) ? [1, 1.18, 1] : 1,
          opacity: 0.85,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    </svg>
  );
}
