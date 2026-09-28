'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { ArrowUpRight, Menu, Phone, X } from 'lucide-react';
import Logo from './Logo';
import Magnetic from './Magnetic';
import { SITE, telHref } from '@/data/site';
import { getLenis, scrollToId } from '@/lib/scroll';

const LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'team', label: 'Team' },
  { id: 'process', label: 'Process' },
  { id: 'why', label: 'Why us' },
  { id: 'order', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  // Shrink after the first pixels; hide while scrolling down, reveal on scroll up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    if (Math.abs(y - prev) > 4) setHidden(y > prev && y > 500);
    if (y < 300) setActive('');
  });

  // Highlight the link of the section currently in the middle of the screen.
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Mobile menu: freeze page scroll and close on Escape.
  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      getLenis()?.start();
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollToId(id), open ? 60 : 0);
  };

  const pill = hovered ?? active;

  return (
    <>
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
      animate={{ y: hidden && !open ? '-120%' : '0%' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-2xl px-4 transition-[padding,background,border-color,box-shadow] duration-500 sm:px-5 ${
          scrolled || open ? 'nav-glass py-2.5' : 'border border-transparent py-3.5'
        }`}
      >
        <a href="#top" onClick={go('top')} aria-label="Pentacore home" className="shrink-0">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 md:flex" onMouseLeave={() => setHovered(null)}>
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={go(l.id)}
                onMouseEnter={() => setHovered(l.id)}
                aria-current={active === l.id ? 'true' : undefined}
                className={`relative block rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                  pill === l.id ? 'text-white' : 'text-mist hover:text-white'
                }`}
              >
                {pill === l.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.08] ring-1 ring-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {l.label}
                {active === l.id && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-2"
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop only. The wrapper owns the display rule; Magnetic's own inline-block would override "hidden". */}
        <div className="hidden md:block">
          <Magnetic>
            <a
              href="#order"
              onClick={go('order')}
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-950"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-brand-1 to-brand-2 transition-transform duration-500 ease-out group-hover:translate-x-0" />
              <span className="relative transition-colors duration-300 group-hover:text-white">Start a project</span>
              <ArrowUpRight className="relative h-4 w-4 transition duration-300 group-hover:rotate-45 group-hover:text-white" />
            </a>
          </Magnetic>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="relative h-10 w-10 rounded-xl text-white ring-1 ring-white/10 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'x' : 'menu'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Reading progress */}
        <motion.span
          aria-hidden
          className={`absolute right-4 bottom-0 left-4 h-[2px] origin-left rounded-full bg-gradient-to-r from-brand-1 via-brand-2 to-brand-3 transition-opacity duration-300 ${
            scrolled && !open ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ scaleX: progress }}
        />
      </motion.nav>

    </motion.header>
      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-ink-950/[0.98] px-6 pt-28 pb-10 md:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
            <nav className="relative flex flex-col gap-1">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-baseline gap-4 border-b border-white/5 py-4"
                >
                  <span className="font-display text-xs text-brand-2">0{i + 1}</span>
                  <span className={`font-display text-3xl font-semibold ${active === l.id ? 'text-gradient' : 'text-white'}`}>{l.label}</span>
                </motion.a>
              ))}
            </nav>
            <motion.div
              className="relative mt-auto space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <a
                href="#order"
                onClick={go('order')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-1 to-brand-2 py-4 font-semibold text-white"
              >
                Start a project <ArrowUpRight className="h-4 w-4" />
              </a>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-mist">
                {SITE.phones.map((p) => (
                  <a key={p} href={telHref(p)} className="flex items-center gap-2 hover:text-white">
                    <Phone className="h-4 w-4 text-brand-2" /> {p}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
