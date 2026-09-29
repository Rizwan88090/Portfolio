'use client';

import { useEffect, useRef, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { TEAM, type TeamMember } from '@/data/team';
import Reveal, { SectionHeading } from './Reveal';
import TiltCard from './TiltCard';

function Avatar({ m }: { m: TeamMember }) {
  const img = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // The image may 404 before React hydrates and attaches onError.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `radial-gradient(circle at 30% 20%, ${m.accent}66, #11142a 70%)` }}
      >
        <span className="font-display text-6xl font-semibold text-white/90">{m.initials}</span>
      </div>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={img}
          src={m.image}
          alt={`${m.name}, ${m.role}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="relative h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      <span className="glass absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
        <BadgeCheck className="h-3.5 w-3.5 text-brand-2" />
        {m.experienceYears}+ yrs
      </span>
    </div>
  );
}

export default function Team() {
  return (
    <section id="team" className="relative scroll-mt-24 py-24">
      <div className="pointer-events-none absolute top-1/3 left-0 h-[400px] w-[400px] rounded-full blob-pink" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The founders"
          title="Five senior engineers,"
          highlight="one shared standard."
          text="Every project is delivered directly by senior engineers with over five years of experience each. No junior hand-offs and no outsourcing."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {TEAM.map((m, i) => (
            <Reveal key={m.slug} delay={(i % 3) * 0.1} className={`lg:col-span-2 ${i === 3 ? 'lg:col-start-2' : ''} ${i === 4 ? 'sm:col-span-2 sm:mx-auto sm:w-1/2 lg:w-full' : ''}`}>
              <TiltCard className="h-full rounded-3xl" intensity={7}>
                <article className="glass glow-border flex h-full flex-col rounded-3xl p-4">
                  <Avatar m={m} />
                  <div className="flex flex-1 flex-col px-2 pt-5 pb-2">
                    <h3 className="font-display text-xl font-semibold text-white">{m.name}</h3>
                    <p className="mt-1 text-sm font-medium" style={{ color: m.accent }}>
                      {m.role}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{m.bio}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      {m.skills.map((s) => (
                        <span key={s} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-mist ring-1 ring-white/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
