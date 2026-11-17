import { Heart } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useStore } from '../../lib/store';

export function useWorld() {
  return useStore((s) => s.equipped.world.split(':')[1] ?? 'meadow');
}

/** Game stage with the world the child picked in the Robot Shop. */
export function Stage({ children, height, className = '', label }: { children: ReactNode; height: number | string; className?: string; label: string }) {
  const world = useWorld();
  return (
    <div className={`stage world-${world} ${className}`} style={{ height }} role="region" aria-label={label}>
      <WorldDecor world={world} />
      {children}
    </div>
  );
}

function WorldDecor({ world }: { world: string }) {
  if (world === 'space')
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={`${(i * 37) % 100}%`} cy={`${(i * 53) % 100}%`} r={(i % 3) + 1} fill="#fff" opacity={0.7} />)}
        <circle cx="88%" cy="18%" r="34" fill="#ff9a3c" opacity={0.9} />
      </svg>
    );
  if (world === 'ocean')
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={`${(i * 23) % 100}%`} cy={`${30 + ((i * 41) % 70)}%`} r={4 + (i % 4) * 2} fill="none" stroke="#fff" strokeWidth={2} opacity={0.5} />)}
      </svg>
    );
  if (world === 'candy')
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={`${(i * 29) % 100}%`} cy={`${(i * 47) % 100}%`} r={10} fill={['#ff6fb5', '#ffc83d', '#22c79a', '#38b6ff'][i % 4]} opacity={0.35} />)}
      </svg>
    );
  if (world === 'jungle')
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={`${(i * 31) % 100}%`} cy="0%" rx={50} ry={70} fill="#2f9e62" opacity={0.5} />)}
      </svg>
    );
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <circle cx="90%" cy="14%" r="30" fill="#ffc83d" />
      <ellipse cx="18%" cy="16%" rx="46" ry="16" fill="#fff" opacity={0.9} />
      <ellipse cx="56%" cy="10%" rx="38" ry="12" fill="#fff" opacity={0.8} />
    </svg>
  );
}

export function Lives({ left, of }: { left: number; of: number }) {
  return (
    <span className="chip" aria-label={`${left} of ${of} hearts left`}>
      {Array.from({ length: of }, (_, i) => (
        <Heart key={i} size={16} fill={i < left ? 'var(--coral)' : 'transparent'} stroke="var(--line)" strokeWidth={2.2} aria-hidden />
      ))}
    </span>
  );
}

export function Score({ n }: { n: number }) {
  return <span className="chip tnum" aria-label={`Score ${n}`}>Score {n}</span>;
}

/** Parachute letter used by Falling Letters. */
export function ParaLetter({ ch, color }: { ch: string; color: string }) {
  return (
    <span className="flex flex-col items-center" aria-hidden>
      <svg width="64" height="36" viewBox="0 0 64 36">
        <path d="M4 26 Q32 -12 60 26 Q53 20 46 26 Q39 20 32 26 Q25 20 18 26 Q11 20 4 26 Z" fill={color} stroke="#1d1a38" strokeWidth={3} strokeLinejoin="round" />
        <path d="M8 26 L26 36 M56 26 L38 36 M32 26 L32 36" stroke="#1d1a38" strokeWidth={2} />
      </svg>
      <span className="kcap" data-kind="letter" style={{ width: 52, height: 52, fontSize: 30, cursor: 'default' }}>{ch}</span>
    </span>
  );
}

export const BRIGHTS = ['#ff6fb5', '#ffc83d', '#22c79a', '#38b6ff', '#8b5cf6', '#ff9a3c', '#ff5a5f'];

/** Stage height that leaves room for the on-screen keyboard on small screens. */
export function useStageHeight(max: number, reserve = 470) {
  const calc = () => Math.round(Math.max(260, Math.min(max, window.innerHeight - reserve)));
  const [h, setH] = useState(calc);
  useEffect(() => {
    const on = () => setH(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return h;
}
