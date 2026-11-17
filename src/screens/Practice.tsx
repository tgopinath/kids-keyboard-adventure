import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Frame, useRound } from '../components/Frame';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { Bot, Confetti, ProgressBar, TargetMark } from '../components/ui';
import type { Mood } from '../components/KeyBot';
import { PRACTICE_LEVELS, PRAISE, pickOne } from '../lib/content';
import { charForId, idForChar } from '../lib/keys';
import { accuracyOf, shuffle, wpm } from '../lib/adaptive';
import { actions } from '../lib/store';
import { useKeys } from '../lib/input';
import { sfx, speak } from '../lib/audio';

interface Typed { ch: string; ok: boolean }

export function Practice({ level }: { level: number | null }) {
  const round = useRound('practice', level);
  const cfg = PRACTICE_LEVELS[round.level - 1] ?? PRACTICE_LEVELS[0];
  const items = useMemo(() => shuffle(cfg.items).slice(0, cfg.pick), [round.roundId, round.level]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState<Typed[]>([]);
  const [mood, setMood] = useState<Mood>('happy');
  const [line, setLine] = useState({ text: '', say: '' });
  const [fire, setFire] = useState(0);
  const [, tick] = useState(0);
  const stats = useRef({ right: 0, wrong: 0, chars: 0 });
  const lastAt = useRef(0);
  const busy = useRef(false);
  const target = items[i] ?? '';
  const cursor = typed.length;
  const nextChar = target[cursor];

  useEffect(() => {
    setI(0);
    stats.current = { right: 0, wrong: 0, chars: 0 };
  }, [round.roundId]);
  useEffect(() => {
    if (round.phase !== 'play' || !target) return;
    setTyped([]);
    setMood('happy');
    const isSentence = target.includes(' ');
    setLine({ text: isSentence ? 'Type the sentence. Press the Spacebar between words!' : `Type ${target}`, say: isSentence ? `Type: ${target.toLowerCase()}` : `Type ${target.length === 1 ? target : target.toLowerCase()}` });
    busy.current = false;
    lastAt.current = performance.now();
  }, [i, target, round.phase, round.roundId]);
  // live speed readout
  useEffect(() => {
    if (round.phase !== 'play') return;
    const t = window.setInterval(() => tick((x) => x + 1), 1000);
    return () => window.clearInterval(t);
  }, [round.phase]);

  useKeys((p) => {
    if (busy.current || !target || p.id === 'Escape') return;
    if (p.source === 'physical') sfx.key(p.id);
    if (p.id === 'Backspace') {
      setTyped((t) => t.slice(0, -1));
      return;
    }
    const ch = charForId(p.id);
    if (!ch) return;
    const want = target[cursor];
    const ok = ch === want;
    const now = performance.now();
    const wantId = idForChar(want);
    if (wantId) actions.keyResult(wantId, ok, now - lastAt.current);
    lastAt.current = now;
    if (ok) {
      stats.current.right++;
      round.hit();
    } else {
      stats.current.wrong++;
      round.miss();
      sfx.wrong();
    }
    stats.current.chars++;
    const nt = [...typed, { ch, ok }];
    setTyped(nt);
    if (nt.length >= target.length) {
      busy.current = true;
      const perfect = nt.every((x) => x.ok);
      if (perfect) {
        sfx.correct();
        actions.addStars(1);
        setMood('excited');
        setLine({ text: `${pickOne(PRAISE)} Perfect!`, say: pickOne(PRAISE) });
      } else {
        sfx.star();
        setMood('happy');
        setLine({ text: 'Done! The marked letters were tricky ones.', say: 'Done! Well tried.' });
      }
      window.setTimeout(() => {
        if (i + 1 >= items.length) {
          setFire(Date.now());
          const s = stats.current;
          round.finish({ correct: s.right, wrong: s.wrong, wpm: wpm(s.chars, round.elapsed()) });
        } else setI(i + 1);
      }, 900);
    }
  }, round.phase === 'play' && !round.paused);

  useEffect(() => {
    if (round.phase === 'done' && round.outcome?.passed) speak('You finished the typing challenge!');
  }, [round.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const live = round.phase === 'play' ? wpm(stats.current.chars, round.elapsed()) : 0;
  const acc = accuracyOf(stats.current.right, stats.current.wrong);
  const big = target.length <= 3 ? 110 : target.length <= 6 ? 84 : 46;

  return (
    <Frame round={round} wide hud={<><span className="chip tnum">{acc || 100}% right</span><span className="chip tnum hidden sm:inline-flex">{live} words/min</span></>}
      readyBelow={
        <ol className="mx-auto mt-6 grid max-w-3xl gap-2 sm:grid-cols-5">
          {PRACTICE_LEVELS.map((l, n) => (
            <li key={l.name} className="toy p-3 text-center" style={{ borderColor: n + 1 === round.level ? 'var(--primary)' : undefined, background: n + 1 === round.level ? 'var(--primary-soft)' : undefined }}>
              <span className="eyebrow block">Level {n + 1}</span>
              <span className="block text-[14px] font-bold">{l.name}</span>
              <span className="block text-[13px]" style={{ color: 'var(--muted)' }}>{l.items[0]}</span>
            </li>
          ))}
        </ol>
      }>
      <Confetti fire={fire} />
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          <Bot text={line.text} say={line.say} mood={mood} className="panel p-4" />
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>{Math.min(i + 1, items.length)} / {items.length}</span>
            <ProgressBar pct={(i / items.length) * 100} label="Lines typed" />
          </div>
        </div>
        <section className="panel flex min-h-[220px] items-center justify-center p-5" aria-label="Text to type">
          <motion.p key={`${i}-${round.roundId}`} className="text-center font-display font-bold leading-[1.25] tracking-wide" style={{ fontSize: big }} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} aria-label={`Type: ${target}`}>
            {target.split('').map((c, j) => {
              const t = typed[j];
              const cls = t ? (t.ok ? 'done' : 'miss') : j === cursor ? 'current' : 'todo';
              return (
                <span key={j} className={`tchar ${cls}`} aria-hidden>
                  {c === ' ' ? <span style={{ display: 'inline-block', width: '0.45em' }}>&nbsp;</span> : c}
                </span>
              );
            })}
          </motion.p>
        </section>
      </div>
      <p className="sr-only" aria-live="polite">{nextChar ? `Next: ${nextChar === ' ' ? 'space' : nextChar}` : ''}</p>
      <TargetMark id={nextChar ? idForChar(nextChar) : null} />
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout="auto" glow={nextChar ? [idForChar(nextChar) ?? ''] : []} />
      </section>
      <p className="mt-3 text-center text-[15px]" style={{ color: 'var(--muted)' }}>Made a mistake? Press Backspace to fix it.</p>
    </Frame>
  );
}
