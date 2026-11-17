import { useState } from 'react';

export interface Bar { label: string; value: number | null; note?: string }

/**
 * One-series bar chart: single hue, thin rounded bars on a baseline, recessive grid,
 * a hover/focus tooltip per bar and a table view for screen readers and print.
 */
export function BarChart({ title, bars, max, unit = '', color = 'var(--primary)' }: { title: string; bars: Bar[]; max?: number; unit?: string; color?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const top = max ?? Math.max(1, ...bars.map((b) => b.value ?? 0));
  const W = 640, H = 200, padL = 36, padB = 26, padT = 12;
  const iw = W - padL - 8, ih = H - padB - padT;
  const step = iw / bars.length;
  const bw = Math.min(26, step * 0.6);
  const ticks = [0, 0.5, 1].map((t) => Math.round(top * t));
  return (
    <figure className="m-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <figcaption className="text-[15px] font-bold">{title}</figcaption>
        <button type="button" className="chip" style={{ minHeight: 34 }} onClick={() => setTable((t) => !t)} aria-pressed={table}>{table ? 'Show chart' : 'Show table'}</button>
      </div>
      {table ? (
        <table className="w-full text-left text-[15px]">
          <thead><tr><th className="py-1">Day</th><th className="py-1 text-right">Value</th></tr></thead>
          <tbody>
            {bars.map((b) => (
              <tr key={b.label} style={{ borderTop: '1px solid color-mix(in oklab, var(--line) 20%, transparent)' }}>
                <td className="py-1">{b.label}</td>
                <td className="py-1 text-right tnum">{b.value === null ? 'No play' : `${b.value}${unit}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`${title}. ${bars.filter((b) => b.value !== null).map((b) => `${b.label}: ${b.value}${unit}`).join('. ') || 'No data yet'}`}>
            {ticks.map((t) => {
              const y = padT + ih - (t / top) * ih;
              return (
                <g key={t}>
                  <line x1={padL} x2={W - 8} y1={y} y2={y} stroke="var(--muted)" strokeOpacity={0.2} />
                  <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={11} fill="var(--muted)">{t}{unit}</text>
                </g>
              );
            })}
            {bars.map((b, i) => {
              const x = padL + i * step + step / 2;
              const h = b.value ? (b.value / top) * ih : 0;
              return (
                <g key={b.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${b.label}: ${b.value === null ? 'no play' : `${b.value}${unit}`}`}>
                  <rect x={x - step / 2} y={padT} width={step} height={ih} fill="transparent" />
                  {b.value === null ? (
                    <circle cx={x} cy={padT + ih - 3} r={2.5} fill="var(--muted)" opacity={0.5} />
                  ) : (
                    <path d={`M${x - bw / 2} ${padT + ih} V${padT + ih - h + 4} Q${x - bw / 2} ${padT + ih - h} ${x - bw / 2 + 4} ${padT + ih - h} H${x + bw / 2 - 4} Q${x + bw / 2} ${padT + ih - h} ${x + bw / 2} ${padT + ih - h + 4} V${padT + ih} Z`} fill={color} opacity={hover === null || hover === i ? 1 : 0.45} />
                  )}
                  {(i % Math.ceil(bars.length / 7) === 0 || i === bars.length - 1) && <text x={x} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--muted)">{b.label}</text>}
                </g>
              );
            })}
          </svg>
          {hover !== null && (
            <div className="toy pointer-events-none absolute -top-2 px-3 py-1.5 text-[14px]" style={{ left: `${((padL + hover * step + step / 2) / W) * 100}%`, transform: 'translate(-50%, -100%)', boxShadow: '0 3px 0 var(--shadow)' }}>
              <b>{bars[hover].label}</b>: {bars[hover].value === null ? 'no play' : `${bars[hover].value}${unit}`}{bars[hover].note ? ` · ${bars[hover].note}` : ''}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
