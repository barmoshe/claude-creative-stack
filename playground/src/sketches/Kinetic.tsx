// Port of artifacts/react/kinetic-typography.jsx. Uses Motion v12.
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const PHRASES = [
  "Design in motion.",
  "Every pixel has weight.",
  "Rhythm beats symmetry.",
];

function Stanza({ text }: { text: string }){
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  return (
    <section ref={ref} className="min-h-[60vh] flex items-center px-8">
      <p className="text-3xl md:text-5xl font-light tracking-tight text-zinc-100">
        {text.split(" ").map((w, i) => (
          <motion.span key={i} className="inline-block mr-2"
            initial={reduced ? false : { y: "100%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}>
            {w}
          </motion.span>
        ))}
      </p>
    </section>
  );
}

export default function Kinetic() {
  return <div>{PHRASES.map((p, i) => <Stanza key={i} text={p} />)}</div>;
}
