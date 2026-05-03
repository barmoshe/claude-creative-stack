import s from "../styles/photomaze.module.css";

export function Lose({ quip, onReplay }: { quip: string; onReplay: () => void }) {
  return (
    <section className={s.overlay} dir="rtl">
      <div className={s.inner}>
        <p className={s.tag}>FLAGGED BY SYSTEM</p>
        <h1 className={s.h1}>
          סומנת על ידי המערכת
          <span className={s.h1en}>CAUGHT</span>
        </h1>
        <p className={s.p}>{quip}</p>
        <p className={s.hint}>ה-payload עוד שם. נסה שוב.</p>
        <button className={s.cta} onClick={onReplay} type="button">נסה שוב / Retry</button>
      </div>
    </section>
  );
}
