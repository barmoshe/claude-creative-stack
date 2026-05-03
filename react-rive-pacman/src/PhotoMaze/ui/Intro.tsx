import { AGENTS } from "../maze/constants";
import { RiveAccent } from "./RiveAccent";
import s from "../styles/photomaze.module.css";

const RIVE_SRC = "https://cdn.rive.app/animations/vapor_loader.riv";

export function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className={s.overlay} dir="rtl">
      <div className={s.inner}>
        <RiveAccent src={RIVE_SRC} className={s.accent} fallbackEmoji="📡" />
        <p className={s.tag}>BOOT SEQUENCE</p>
        <h1 className={s.h1}>
          פריצה למערכת
          <span className={s.h1en}>SIGNAL HUNT</span>
        </h1>
        <p className={s.p}>
          אסוף את חבילות הנתונים לפני שהזקיפים יתפסו אותך.<br />
          הם מהירים, חכמים, ולא מחבבים פולשים.
        </p>

        <div className={s.roster} aria-hidden="true">
          {AGENTS.map(a => (
            <div key={a.name} className={s.who} style={{ color: a.color }}>
              <span className={s.dot} style={{ background: a.color }} />
              <span>
                <span className={s.name}>{a.hebrew}</span>
                <span className={s.tagText}>{tagFor(a.personality)}</span>
              </span>
            </div>
          ))}
        </div>

        <button className={s.cta} onClick={onStart} type="button">התחל ריצה / Start Run</button>
        <p className={s.hint}>החלקה במסך · חצים / WASD במקלדת</p>
      </div>
    </section>
  );
}

function tagFor(p: string): string {
  switch (p) {
    case "blinky": return "תופס ישיר";
    case "pinky":  return "מארב 4 משבצות קדימה";
    case "inky":   return "טקטי, חבר של פיירוול";
    case "clyde":  return "בלתי צפוי, מתקרב ובורח";
    default: return "";
  }
}
