import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, Blocks, BookOpen, Compass, Coins, Flame, Gamepad2, Gem, Hash, Lock, MousePointerClick, Pause, Sparkles,
  Star, Target, Trophy, Volume2, Zap, type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KeyBot, type Mood } from './KeyBot';
import { speak } from '../lib/audio';
import { useStore } from '../lib/store';
import { back } from '../lib/router';

export const ICONS: Record<string, LucideIcon> = { MousePointerClick, Compass, BookOpen, Hash, Blocks, Sparkles, Trophy, Target, Gem, Gamepad2, Flame, Zap, Star };

export const tone = (c: string) => `var(--${c})`;
export const toneSoft = (c: string) => `var(--${c}-soft)`;

export function StarPill({ n, label = 'stars' }: { n: number; label?: string }) {
  return (
    <span className="chip tnum" aria-label={`${n} ${label}`} style={{ background: 'var(--sun-soft)' }}>
      <Star size={18} fill="var(--sun)" stroke="var(--line)" strokeWidth={2.2} aria-hidden /> {n}
    </span>
  );
}
export function CoinPill({ n }: { n: number }) {
  return (
    <span className="chip tnum" aria-label={`${n} coins`} style={{ background: 'var(--orange-soft)' }}>
      <Coins size={18} fill="var(--sun)" stroke="var(--line)" strokeWidth={2.2} aria-hidden /> {n}
    </span>
  );
}

export function ProgressBar({ pct, color = 'mint', label }: { pct: number; color?: string; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className="h-4 w-full overflow-hidden rounded-full" style={{ border: 'var(--bw) solid var(--line)', background: 'var(--surface-2)' }}>
      <motion.div className="h-full rounded-full" style={{ background: tone(color) }} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
    </div>
  );
}

/** Top bar for every screen below home: Back, title, wallet and an optional Pause. */
export function TopBar({ title, parent = '/', onPause, children }: { title: string; parent?: string; onPause?: () => void; children?: ReactNode }) {
  const stars = useStore((s) => s.stars);
  const coins = useStore((s) => s.coins);
  return (
    <header className="flex flex-wrap items-center gap-2 py-3 sm:flex-nowrap sm:gap-3">
      <button type="button" className="btn btn-icon" onClick={() => back(parent)} aria-label="Back">
        <ArrowLeft size={26} strokeWidth={2.6} aria-hidden />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-[22px] sm:text-[30px]">{title}</h1>
      {children && <div className="order-last flex w-full flex-wrap items-center gap-2 sm:order-none sm:w-auto sm:flex-nowrap">{children}</div>}
      <span className="hidden sm:inline-flex"><StarPill n={stars} /></span>
      <span className="hidden md:inline-flex"><CoinPill n={coins} /></span>
      {onPause && (
        <button type="button" className="btn btn-icon btn-sun" onClick={onPause} aria-label="Pause (Esc)">
          <Pause size={24} strokeWidth={2.8} aria-hidden />
        </button>
      )}
    </header>
  );
}

/**
 * KeyBot with a speech bubble. Text is read aloud when it changes (if voice is on); the speaker
 * button repeats it. The bubble is a polite live region for screen readers.
 */
export function Bot({ text, say, mood = 'happy', size = 120, side = 'left', className = '', speakOnChange = true, nonce }: {
  text: string; say?: string; mood?: Mood; size?: number; side?: 'left' | 'top'; className?: string; speakOnChange?: boolean; nonce?: number;
}) {
  const voice = useStore((s) => s.settings.voice);
  const [typing, setTyping] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (!text) return;
    setTyping(true);
    const t = window.setTimeout(() => setTyping(false), first.current ? 0 : 260);
    first.current = false;
    if (speakOnChange) speak(say ?? text);
    return () => window.clearTimeout(t);
  }, [text, say, speakOnChange, nonce]);
  return (
    <div className={`flex ${side === 'top' ? 'flex-col items-center text-center' : 'items-center'} gap-3 ${className}`}>
      <div className="shrink-0"><KeyBot mood={mood} size={size} /></div>
      <div className={`bubble ${side === 'top' ? 'up' : ''} min-w-0 flex-1`} aria-live="polite">
        {typing ? (
          <span className="inline-flex gap-1.5 py-2" aria-label="KeyBot is talking">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="block h-2.5 w-2.5 rounded-full" style={{ background: 'var(--muted)' }} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
            ))}
          </span>
        ) : (
          <span>{text}</span>
        )}
        {voice && text && (
          <button type="button" onClick={() => speak(say ?? text)} className="ml-2 inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-full align-middle" style={{ border: '2px solid var(--line)', background: 'var(--sky-soft)' }} aria-label="Hear KeyBot again">
            <Volume2 size={18} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, label, children, wide = false }: { open: boolean; onClose?: () => void; label: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const f = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>('button, [href], input');
      f?.focus();
    }, 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && ref.current) {
        const els = [...ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select')];
        if (!els.length) return;
        const firstEl = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); firstEl.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6" style={{ background: 'rgba(20,16,48,.45)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
          <motion.div ref={ref} role="dialog" aria-modal="true" aria-label={label} className={`panel max-h-[92dvh] w-full overflow-y-auto p-5 sm:p-7 ${wide ? 'max-w-2xl' : 'max-w-lg'}`} initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const CONFETTI_COLORS = ['#ff5a5f', '#ffc83d', '#22c79a', '#38b6ff', '#8b5cf6', '#ff6fb5', '#ff9a3c'];
/** A burst of confetti. Change `fire` to launch again. Skipped when motion is reduced. */
export function Confetti({ fire, count = 46 }: { fire: number; count?: number }) {
  const reduce = useReducedMotion();
  const [pieces, setPieces] = useState<{ id: number; x: number; r: number; c: string; d: number; s: number; round: boolean }[]>([]);
  useEffect(() => {
    if (!fire || reduce) return;
    setPieces(Array.from({ length: count }, (_, i) => ({ id: fire * 1000 + i, x: (Math.random() - 0.5) * 900, r: Math.random() * 720 - 360, c: CONFETTI_COLORS[i % CONFETTI_COLORS.length], d: 1.4 + Math.random() * 1.1, s: 8 + Math.random() * 8, round: Math.random() > 0.6 })));
    const t = window.setTimeout(() => setPieces([]), 2800);
    return () => window.clearTimeout(t);
  }, [fire, count, reduce]);
  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span key={p.id} className="absolute left-1/2 top-[35%] block" style={{ width: p.s, height: p.round ? p.s : p.s * 0.5, background: p.c, borderRadius: p.round ? 99 : 2, border: '1.5px solid #1d1a38' }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: [0, -260 - Math.random() * 120, 700], rotate: p.r, opacity: [1, 1, 0.9] }}
          transition={{ duration: p.d, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

/** Treasure chest that opens with a burst of coins. */
export function Chest({ open, size = 180, coins = 8 }: { open: boolean; size?: number; coins?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative" style={{ width: size, height: size }} aria-label={open ? 'An open treasure chest full of gold' : 'A closed treasure chest'} role="img">
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible' }}>
        {open && <motion.circle cx={100} cy={100} r={70} fill="#ffe27a" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: [0, 0.8, 0.5], scale: [0.4, 1.3, 1.15] }} transition={{ duration: 0.9 }} />}
        <rect x={34} y={98} width={132} height={76} rx={12} fill="#b5651d" stroke="#1d1a38" strokeWidth={6} />
        <rect x={34} y={120} width={132} height={14} fill="#ffc83d" stroke="#1d1a38" strokeWidth={5} />
        <rect x={88} y={112} width={24} height={30} rx={6} fill="#ffc83d" stroke="#1d1a38" strokeWidth={5} />
        {open && <ellipse cx={100} cy={100} rx={60} ry={12} fill="#ffd84a" stroke="#1d1a38" strokeWidth={5} />}
        <motion.g style={{ transformOrigin: '34px 98px' }} initial={false} animate={{ rotate: open ? (reduce ? -100 : [-0, -8, -110]) : 0 }} transition={{ duration: 0.7 }}>
          <path d="M34 98 Q34 50 100 50 Q166 50 166 98 Z" fill="#c8742a" stroke="#1d1a38" strokeWidth={6} strokeLinejoin="round" />
          <path d="M60 58 L60 98 M140 58 L140 98" stroke="#ffc83d" strokeWidth={10} />
          <path d="M60 58 L60 98 M140 58 L140 98" stroke="#1d1a38" strokeWidth={2} />
        </motion.g>
      </svg>
      {open && !reduce && Array.from({ length: coins }, (_, i) => (
        <motion.span key={i} className="absolute left-1/2 top-1/2 grid h-8 w-8 place-items-center rounded-full font-black" style={{ background: '#ffc83d', border: '3px solid #1d1a38', fontSize: 14, color: '#1d1a38' }}
          initial={{ x: -16, y: -10, scale: 0.3, opacity: 0 }}
          animate={{ x: -16 + (i - coins / 2) * 26, y: [-10, -120 - (i % 3) * 30, -70], scale: 1, opacity: [0, 1, 1] }}
          transition={{ duration: 0.9, delay: 0.35 + i * 0.05 }} aria-hidden>
          ★
        </motion.span>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-4 py-2 text-left">
      <span>
        <span className="block font-bold">{label}</span>
        {hint && <span className="block text-[15px]" style={{ color: 'var(--muted)' }}>{hint}</span>}
      </span>
      <span className="relative h-9 w-16 shrink-0 rounded-full transition-colors" style={{ border: 'var(--bw) solid var(--line)', background: on ? 'var(--mint)' : 'var(--surface-2)' }}>
        <motion.span className="absolute top-[3px] h-6 w-6 rounded-full" style={{ background: '#fff', border: '2px solid var(--line)' }} animate={{ left: on ? 32 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </span>
    </button>
  );
}

export function Slider({ value, onChange, label, disabled }: { value: number; onChange: (v: number) => void; label: string; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-3 pb-2 text-[15px]" style={{ color: 'var(--muted)', opacity: disabled ? 0.5 : 1 }}>
      <span className="w-20 shrink-0">Volume</span>
      <input type="range" min={0} max={100} value={Math.round(value * 100)} disabled={disabled} aria-label={label} onChange={(e) => onChange(Number(e.target.value) / 100)} className="h-2 w-full accent-[var(--primary)]" />
    </label>
  );
}

export function LockBadge() {
  return <Lock size={16} strokeWidth={2.6} aria-label="Locked" />;
}

export function Stars({ n, of = 3, size = 22 }: { n: number; of?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <Star key={i} size={size} fill={i < n ? 'var(--sun)' : 'transparent'} stroke="var(--line)" strokeWidth={2.2} aria-hidden />
      ))}
    </span>
  );
}

/** A star that flies up from the answer to say "+1". */
export function StarBurst({ fire }: { fire: number }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {fire > 0 && !reduce && (
        <motion.span key={fire} className="pointer-events-none absolute left-1/2 top-1/2 z-20" initial={{ x: '-50%', y: 0, scale: 0.5, opacity: 0 }} animate={{ y: -110, scale: [0.5, 1.4, 1], opacity: [0, 1, 0] }} transition={{ duration: 0.9 }} aria-hidden>
          <Star size={56} fill="var(--sun)" stroke="#1d1a38" strokeWidth={2} />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** Marks the key the screen is waiting for, so automated checks can play the game. Invisible. */
export function TargetMark({ id }: { id?: string | null }) {
  return <span hidden data-target={id ?? ''} />;
}
