'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Reveal, { SectionHeading } from './Reveal';

const STEPS = [
  {
    n: '01',
    title: 'Discover',
    text: 'A free consultation to understand your goals, users and budget, followed by a clear scope and estimate.',
  },
  {
    n: '02',
    title: 'Design & Plan',
    text: 'We define the architecture, interface direction and sprint roadmap, so you always know what will be delivered and when.',
  },
  {
    n: '03',
    title: 'Build',
    text: 'Weekly demos, clean code and continuous testing, with every line written by a senior engineer.',
  },
  {
    n: '04',
    title: 'Launch & Scale',
    text: 'Deployment, monitoring and ongoing support as your product grows.',
  },
];

export default function Process() {
  const grid = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: grid, offset: ['start 85%', 'end 55%'] });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });
  return (
    <section id="process" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeading
        eyebrow="How we work"
        title="A transparent process with"
        highlight="no surprises."
      />
      <div ref={grid} className="relative grid gap-6 md:grid-cols-4">
        <div className="absolute top-8 right-0 left-0 hidden h-px bg-white/[0.06] md:block" />
        <motion.div
          style={{ scaleX: line }}
          className="absolute top-8 right-0 left-0 hidden h-[2px] origin-left bg-gradient-to-r from-brand-1 via-brand-2 to-brand-3 md:block"
        />
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12}>
            <div className="relative">
              <motion.div
                initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
                whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 + i * 0.12 }}
                whileHover={{ scale: 1.08, rotate: 4 }}
                className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900 font-display text-xl font-semibold text-white shadow-[0_0_30px_-8px_rgb(139_92_246/0.6)] ring-1 ring-white/10"
              >
                <span className="text-gradient">{s.n}</span>
              </motion.div>
              <h3 className="font-display text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
