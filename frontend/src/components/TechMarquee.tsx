import { TECH } from '@/data/site';

export default function TechMarquee() {
  const half = Math.ceil(TECH.length / 2);
  const rows = [TECH.slice(0, half), TECH.slice(half)];
  return (
    <section aria-label="Technologies we use" className="relative border-y border-white/5 bg-ink-900/60 py-6">
      <div className="marquee-wrap space-y-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        {rows.map((row, r) => {
          const items = [...row, ...row, ...row, ...row];
          return (
            <div key={r} className={`flex w-max ${r === 0 ? 'marquee' : 'marquee-reverse'}`}>
              {items.map((t, i) => (
                <span
                  key={i}
                  className="flex items-center gap-3 pr-12 font-display text-lg whitespace-nowrap text-mist/80 transition-colors hover:text-white"
                  aria-hidden={i >= row.length}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-1 to-brand-2" />
                  {t}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
