'use client';

import dynamic from 'next/dynamic';
import { Fragment, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Magnetic from './Magnetic';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });

const EASE = [0.22, 1, 0.36, 1] as const;

const HEADLINE: { text: string; gradient?: boolean }[] = [
  { text: 'Building' },
  { text: 'software' },
  { text: 'that' },
  { text: 'drives', gradient: true },
  { text: 'business', gradient: true },
  { text: 'growth.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { delay, duration: 0.8, ease: EASE } }),
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);

  // Pause the 3D render loop when the hero is off-screen to save battery.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Parallax: text drifts up and fades, the 3D scene sinks slower.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  const afterHeadline = 0.3 + HEADLINE.length * 0.08;

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Background glow + grid */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand-1/25 blur-[140px]"
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-10%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-brand-2/15 blur-[140px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="grid-bg absolute inset-0" />
      </div>

      {/* 3D scene */}
      <motion.div className="absolute inset-0" style={{ y: sceneY, scale: sceneScale }}>
        <HeroScene active={active} />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/20 to-transparent max-lg:bg-gradient-to-t max-lg:from-ink-950 max-lg:via-ink-950/60" />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 pb-20 sm:px-6 max-lg:pt-[44svh]"
      >
        <div className="max-w-2xl">
          <motion.div
            custom={0.1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-mist"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-2 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-2" />
            </span>
            Pentacore Technologies · Software Engineering Studio
            <Sparkles className="h-3.5 w-3.5 text-brand-2" />
          </motion.div>

          <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {HEADLINE.map((w, i) => (
              <Fragment key={w.text}>
                <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <motion.span
                    className={`inline-block ${w.gradient ? 'text-gradient' : ''}`}
                    initial={{ y: '110%', opacity: 0, filter: 'blur(10px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.9, ease: EASE }}
                  >
                    {w.text}
                  </motion.span>
                </span>{' '}
              </Fragment>
            ))}
          </h1>

          <motion.p
            custom={afterHeadline}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
          >
            A team of five senior software engineers, each with over five years of industry experience,
            delivering custom web platforms, cross-platform mobile apps, AI solutions and intelligent
            automation.
          </motion.p>

          <motion.div
            custom={afterHeadline + 0.15}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Magnetic>
              <a
                href="#order"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-1 to-brand-2 px-7 py-4 font-semibold text-white shadow-[0_10px_40px_-8px_rgb(139_92_246/0.7)] transition-shadow hover:shadow-[0_10px_50px_-4px_rgb(34_211_238/0.7)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Start your project</span>
                <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#team"
                className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Meet the team
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      <motion.a
        href="#services"
        aria-label="Scroll to services"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-mist/70 hover:text-white sm:flex"
      >
        <span>Scroll</span>
        <span className="flex h-9 w-5 justify-center rounded-full ring-1 ring-white/20">
          <motion.span
            className="mt-1.5 h-2 w-1 rounded-full bg-brand-2"
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.a>
    </section>
  );
}
