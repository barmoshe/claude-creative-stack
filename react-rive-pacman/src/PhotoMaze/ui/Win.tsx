import { CONFIG } from "../maze/constants";
import { RiveAccent } from "./RiveAccent";
import s from "../styles/photomaze.module.css";

const RIVE_SRC = "https://cdn.rive.app/animations/vapor_loader.riv";

export function Win({ onReplay }: { onReplay: () => void }) {
  return (
    <section className={s.overlay} dir="rtl">
      <div className={s.inner}>
        <RiveAccent src={RIVE_SRC} className={s.accent} fallbackEmoji="📡" />
        <p className={s.tag}>ACCESS GRANTED</p>
        <h1 className={s.h1}>
          גישה הוענקה
          <span className={s.h1en}>YOU GOT THE DATA</span>
        </h1>
        <p className={s.p}>הנתונים חולצו. הצוות לא הספיק להגיב.</p>

        <div className={s.gift}>
          <h2 className={s.giftH2}>🛰️ Payload פיזית מחכה</h2>
          <p className={s.giftP}>פרטים על איסוף — דרך {CONFIG.contactName}:</p>
          <a className={s.phone} href={`tel:${CONFIG.contactTel}`}>{CONFIG.contactPhone}</a>
        </div>

        <button className={s.cta} onClick={onReplay} type="button">ריצה חדשה / Run again</button>
      </div>
    </section>
  );
}
