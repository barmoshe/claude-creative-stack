import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

// -----------------------------------------------------------------------------
// Kinetic typography demo — scroll-triggered word reveal with stagger, plus a
// looping "variable weight" headline that modulates font-weight + tracking.
// Uses Motion v12 (formerly Framer Motion). Respects prefers-reduced-motion.

const PHRASES = [
  "Design in motion.",
  "Every pixel has weight.",
  "Rhythm beats symmetry.",
  "Read the room, then break it.",
];

function SplitWords({ text, inView, reduced }){
  const words = text.split(" ");
  return (
    <p className="text-zinc-200 text-2xl md:text-4xl font-light tracking-tight leading-snug">
      {words.map((w, i) => (
        <motion.span key={i} className="inline-block mr-2"
          initial={reduced ? false : { y: "100%", opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : undefined}
          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}>
          {w}
        </motion.span>
      ))}
    </p>
  );
}

function Stanza({ text }){
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  return (
    <section ref={ref} className="min-h-[60vh] flex items-center px-8">
      <SplitWords text={text} inView={inView} reduced={reduced} />
    </section>
  );
}

function BreathingHeadline(){
  const [t, setT] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let raf, start = performance.now();
    const tick = now => { setT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const weight = reduced ? 500 : Math.round(300 + 400 * (0.5 + 0.5 * Math.sin(t * 0.9)));
  const tracking = reduced ? "-0.02em" : `${(-0.02 + 0.015 * Math.sin(t * 0.7)).toFixed(4)}em`;

  return (
    <h1 className="text-5xl md:text-8xl text-zinc-50 leading-none"
        style={{ fontFamily: "system-ui, sans-serif", fontWeight: weight, letterSpacing: tracking, fontVariationSettings: `'wght' ${weight}` }}>
      Breathe.
    </h1>
  );
}

export default function KineticTypography(){
  return (
    <div className="bg-zinc-950 min-h-screen font-sans">
      <section className="min-h-screen flex items-center justify-center px-8">
        <BreathingHeadline />
      </section>
      {PHRASES.map((p, i) => <Stanza key={i} text={p} />)}
      <footer className="py-16 text-center text-xs text-zinc-500">
        Scroll back up for the breathing headline. Reduced motion disables word-stagger and weight oscillation.
      </footer>
    </div>
  );
}
