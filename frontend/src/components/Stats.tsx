'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';

const STATS = [
  { value: 5, suffix: '', label: 'Senior engineers' },
  { value: 5, suffix: '+', label: 'Years of experience per engineer' },
  { value: 25, suffix: '+', label: 'Years of combined experience' },
  { value: 4, suffix: '', label: 'Core disciplines: web, mobile, AI and automation' },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="glass glow-border h-full rounded-3xl p-6 sm:p-8">
              <div className="font-display text-4xl font-semibold text-white sm:text-5xl">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm text-mist">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
