'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  text,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  text?: string;
}) {
  const words = [
    ...title.split(' ').map((w) => ({ w, g: false })),
    ...(highlight ? highlight.split(' ').map((w) => ({ w, g: true })) : []),
  ];
  return (
    <motion.div
      className="mx-auto mb-16 max-w-2xl text-center"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.p
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
        className="mb-4 flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-brand-2 uppercase"
      >
        <motion.span
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE } } }}
          className="h-px w-8 origin-right bg-gradient-to-r from-transparent to-brand-2"
        />
        {eyebrow}
        <motion.span
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE } } }}
          className="h-px w-8 origin-left bg-gradient-to-l from-transparent to-brand-2"
        />
      </motion.p>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
        {words.map(({ w, g }, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span
                className={`inline-block ${g ? 'text-gradient' : ''}`}
                variants={{
                  hidden: { y: '110%', opacity: 0 },
                  show: { y: '0%', opacity: 1, transition: { duration: 0.75, ease: EASE } },
                }}
              >
                {w}
              </motion.span>
            </span>{' '}
          </Fragment>
        ))}
      </h2>
      {text && (
        <motion.p
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}
          className="mt-5 text-mist sm:text-lg"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}
