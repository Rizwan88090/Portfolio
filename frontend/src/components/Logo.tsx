import { useId } from 'react';

// Regular pentagon around the core, matching the Gemini-designed Pentacore mark.
const CX = 32;
const CY = 33.5;
const R = 22;
const NODES = Array.from({ length: 5 }, (_, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [+(CX + Math.cos(a) * R).toFixed(2), +(CY + Math.sin(a) * R).toFixed(2)] as const;
});

/** Pentacore mark: five connected nodes (the five founders) around one glowing core. */
export function LogoMark({ size = 36 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const stroke = `url(#s${id})`;
  const outline = [...NODES, NODES[0]].map((p) => p.join(',')).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`s${id}`} x1="8" y1="0" x2="56" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="0.5" stopColor="#7c9cf8" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id={`c${id}`} cx="0.45" cy="0.4" r="0.7">
          <stop stopColor="#f9a8d4" />
          <stop offset="0.55" stopColor="#ec4899" />
          <stop offset="1" stopColor="#a855f7" />
        </radialGradient>
        <radialGradient id={`g${id}`}>
          <stop stopColor="#f472b6" stopOpacity="0.65" />
          <stop offset="1" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r="15" fill={`url(#g${id})`} />
      <polyline points={outline} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      {NODES.map(([x, y], i) => (
        <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      ))}
      {NODES.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r="4.8" fill={stroke} />
      ))}
      <circle cx={CX} cy={CY} r="6" fill={`url(#c${id})`} />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight text-white">
        Penta
        <span className="bg-[linear-gradient(90deg,#a855f7_0%,#ec4899_40%,#60a5fa_70%,#22d3ee_100%)] bg-clip-text text-transparent">
          core
        </span>
      </span>
    </span>
  );
}
