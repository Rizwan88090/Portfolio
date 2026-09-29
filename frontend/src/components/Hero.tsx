'use client';

import dynamic from 'next/dynamic';
import { Fragment, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Magnetic from './Magnetic';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });

const HEADLINE: { text: string; gradient?: boolean }[] = [
  { text: 'Building' },
  { text: 'software' },
  { text: 'that' },
  { text: 'drives', gradient: true },
  { text: 'business', gradient: true },
  { text: 'growth.' },
];

// Entrance animations are plain CSS (see .rise / .word in globals.css) so the hero text
// paints with the first HTML response instead of waiting for JavaScript to load.
const delay = (s: number) => ({ animationDelay: `${s}s` });

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [lite, setLite] = useState(false);

  // Pause the 3D render loop when the hero is off-screen to save battery.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Load the 3D scene only after the text has painted. Phones get a lighter scene,
  // and data-saver mode on a phone skips it entirely.
  useEffect(() => {
    const w = window as IdleWindow;
    const small = window.matchMedia('(max-width: 1023px), (hover: none)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setLite(small);
    if (small && saveData) return;
    let idle = 0;
    const t = window.setTimeout(
      () => {
        if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setSceneReady(true), { timeout: 2500 });
        else setSceneReady(true);
      },
      small ? 1200 : 250,
    );
    return () => {
      clearTimeout(t);
      if (idle && w.cancelIdleCallback) w.cancelIdleCallback(idle);
    };
  }, []);

  // Parallax: text drifts up and fades, the 3D scene sinks slower.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  const afterHeadline = 0.15 + HEADLINE.length * 0.06;

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Background glow + grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="glow-pulse absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blob-violet" />
        <div className="glow-drift absolute right-[-10%] bottom-[-20%] h-[500px] w-[500px] rounded-full blob-cyan" />
        <div className="grid-bg absolute inset-0" />
      </div>

      {/* 3D scene, faded in once loaded */}
      <motion.div className="absolute inset-0" style={{ y: sceneY, scale: sceneScale }}>
        {sceneReady && (
          <div className="fade-in absolute inset-0">
            <HeroScene active={active} lite={lite} />
          </div>
        )}
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/20 to-transparent max-lg:bg-gradient-to-t max-lg:from-ink-950 max-lg:via-ink-950/60" />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 pb-20 sm:px-6 max-lg:pt-[44svh]"
      >
        <div className="max-w-2xl">
          <div
            style={delay(0.05)}
            className="rise glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-mist"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-2 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-2" />
            </span>
            Pentacore Technologies · Software Engineering Studio
            <Sparkles className="h-3.5 w-3.5 text-brand-2" />
          </div>

          <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {HEADLINE.map((w, i) => (
              <Fragment key={w.text}>
                <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span className={`word ${w.gradient ? 'text-gradient' : ''}`} style={delay(0.15 + i * 0.06)}>
                    {w.text}
                  </span>
                </span>{' '}
              </Fragment>
            ))}
          </h1>

          <p style={delay(afterHeadline)} className="rise mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
            A team of five senior software engineers, each with over five years of industry experience,
            delivering custom web platforms, cross-platform mobile apps, AI solutions and intelligent
            automation.
          </p>

          <div style={delay(afterHeadline + 0.1)} className="rise mt-10 flex flex-wrap gap-4">
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
          </div>
        </div>
      </motion.div>

      <a
        href="#services"
        aria-label="Scroll to services"
        style={delay(1.2)}
        className="rise absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-mist/70 hover:text-white sm:flex"
      >
        <span>Scroll</span>
        <span className="flex h-9 w-5 justify-center rounded-full ring-1 ring-white/20">
          <span className="scroll-dot mt-1.5 h-2 w-1 rounded-full bg-brand-2" />
        </span>
      </a>
    </section>
  );
}
