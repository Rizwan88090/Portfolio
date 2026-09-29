'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { scrollToId } from '@/lib/scroll';

/** Floating button with a ring that fills as the page is read. */
export default function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setVisible(v > 700));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={() => scrollToId('top')}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="group fixed right-5 bottom-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink-900/90 text-white shadow-[0_10px_30px_-8px_rgb(139_92_246/0.6)] ring-1 ring-white/10"
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
            <defs>
              <linearGradient id="btt" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <motion.circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="url(#btt)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>
          <ArrowUp className="h-4 w-4 transition group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
