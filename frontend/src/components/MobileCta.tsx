'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { scrollToId } from '@/lib/scroll';

/**
 * Mobile-only "Start a project" button pinned to the bottom of the screen.
 * Appears after the hero, hides while the order form or footer is on screen.
 */
export default function MobileCta() {
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);
  const [hideNear, setHideNear] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => setPastHero(y > window.innerHeight * 0.8));

  useEffect(() => {
    const targets = ['order', 'site-footer'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setHideNear(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const show = pastHero && !hideNear;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed right-[84px] bottom-5 left-4 z-40 md:hidden"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <a
            href="#order"
            onClick={(e) => {
              e.preventDefault();
              scrollToId('order');
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-1 to-brand-2 text-sm font-semibold text-white shadow-[0_10px_30px_-6px_rgb(139_92_246/0.7)] ring-1 ring-white/15"
          >
            Start a project <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
