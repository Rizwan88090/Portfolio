'use client';

import { useMemo, useState } from 'react';
import type { Order } from './types';

const BAR = '#8b5cf6';

/** Orders received per day over the last 14 days. Single series, one hue. */
export function DailyOrdersChart({ orders }: { orders: Order[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const days = useMemo(() => {
    const out: { key: string; label: string; full: string; count: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push({
        key: d.toDateString(),
        label: d.toLocaleDateString(undefined, { day: 'numeric' }),
        full: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        count: 0,
      });
    }
    const idx = new Map(out.map((d, i) => [d.key, i]));
    for (const o of orders) {
      const k = new Date(o.createdAt);
      k.setHours(0, 0, 0, 0);
      const i = idx.get(k.toDateString());
      if (i !== undefined) out[i].count++;
    }
    return out;
  }, [orders]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];

  return (
    <figure className="flex h-full flex-col">
      <figcaption className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-white">Orders, last 14 days</span>
        <span className="text-xs text-mist">{total} total</span>
      </figcaption>
      <div className="relative mt-4 flex h-44 gap-3">
        {/* y axis */}
        <div className="relative w-5 text-right text-[10px] text-mist/70">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2" style={{ bottom: `${(t / max) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-white/[0.06]" style={{ bottom: `${(t / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {days.map((d, i) => (
              <div
                key={d.key}
                className="relative flex h-full flex-1 cursor-default items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div
                  className="w-full max-w-[22px] rounded-t-[4px] transition-opacity"
                  style={{
                    height: d.count ? `${(d.count / max) * 100}%` : '2px',
                    background: d.count ? BAR : 'rgb(255 255 255 / 0.08)',
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                />
                {hover === i && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 rounded-lg border border-white/10 bg-ink-800 px-2.5 py-1.5 text-center text-xs whitespace-nowrap shadow-xl">
                    <div className="text-mist">{d.full}</div>
                    <div className="font-semibold text-white">
                      {d.count} {d.count === 1 ? 'order' : 'orders'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 ml-8 flex gap-[2px] text-[10px] text-mist/70">
        {days.map((d, i) => (
          <span key={d.key} className="flex-1 text-center">
            {i % 2 === 1 ? d.label : ''}
          </span>
        ))}
      </div>
    </figure>
  );
}

/** Orders per service, sorted. Single series, one hue, value labels in text ink. */
export function ServiceChart({ orders }: { orders: Order[] }) {
  const rows = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders) m.set(o.service, (m.get(o.service) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [orders]);
  const max = Math.max(1, ...rows.map((r) => r[1]));

  return (
    <figure className="flex h-full flex-col">
      <figcaption className="mb-4 text-sm font-semibold text-white">Orders by service</figcaption>
      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-mist">No data yet</p>
      ) : (
        <ul className="space-y-3">
          {rows.map(([service, count]) => (
            <li key={service} title={`${service}: ${count}`}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-mist">{service}</span>
                <span className="font-semibold text-white">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: BAR }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
