import { memo } from "react";
import type { HudSnapshot } from "../maze/types";
import s from "../styles/photomaze.module.css";

interface HudProps extends HudSnapshot {
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export const Hud = memo(function Hud(p: HudProps) {
  const modeClass =
    p.modeLabel === "HUNT"    ? `${s.mode} ${s.hunt}` :
    p.modeLabel === "EXPLOIT" ? `${s.mode} ${s.exploit}` : s.mode;

  return (
    <header className={s.hud}>
      <span className={modeClass}>{p.modeLabel}</span>
      <span className={s.barwrap}>
        <span className={s.bar}>
          <i style={{ width: `${p.total ? (p.eaten / p.total) * 100 : 0}%` }} />
        </span>
        <span className={s.pwr}>
          <i style={{ width: `${(p.modeLabel === "EXPLOIT" ? p.powerFrac : 0) * 100}%` }} />
        </span>
      </span>
      <span className={s.count}>{p.eaten} / {p.total}</span>
      <span className={s.lives} aria-label="lives">
        {Array.from({ length: p.livesMax }, (_, i) => (
          <i key={i} className={i >= p.lives ? s.lost : undefined} />
        ))}
      </span>
      <button className={s.iconbtn} onClick={p.onTogglePause} aria-label="pause" type="button">
        {p.paused ? "▶" : "⏸"}
      </button>
      <button className={s.iconbtn} onClick={p.onToggleMute} aria-label="mute" type="button">
        {p.muted ? "🔇" : "🔊"}
      </button>
    </header>
  );
});
