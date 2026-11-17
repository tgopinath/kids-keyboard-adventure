import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Frame, useRound } from '../components/Frame';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { Art } from '../components/Art';
import { Bot, ProgressBar, StarBurst, StarPill, TargetMark } from '../components/ui';
import type { Mood } from '../components/KeyBot';
import { ENCOURAGE, NUMBER_WORDS, PRAISE, pickOne } from '../lib/content';
import { shuffle } from '../lib/adaptive';
import { actions } from '../lib/store';
import { useKeys } from '../lib/input';
import { sfx } from '../lib/audio';

interface Q { answer: string; ask: string; say: string; show: ReactNode }

const OBJECTS = ['apple', 'ball', 'star', 'fish', 'egg', 'leaf', 'orange', 'cup', 'kite'];

const Big = ({ children }: { children: ReactNode }) => <span className="font-display text-[96px] font-bold leading-none sm:text-[120px]">{children}</span>;

function Sequence({ items }: { items: (number | null)[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {items.map((n, i) => (
        <span key={i} className="kcap" data-kind="number" style={{ width: 70, height: 76, fontSize: 40, cursor: 'default', background: n === null ? 'var(--sun)' : undefined }}>
          {n === null ? '?' : n}
        </span>
      ))}
    </div>
  );
}

function makeQuestions(level: number): Q[] {
  if (level === 1) {
    return shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).slice(0, 8).map((d) => ({
      answer: String(d), ask: `Find the number ${d}!`, say: `Find the number ${d}!`, show: <Big>{d}</Big>,
    }));
  }
  if (level === 2) {
    return Array.from({ length: 10 }, (_, i) => ({
      answer: String(i + 1), ask: i === 9 ? 'Now type 10: press 1, then 0!' : `Type ${i + 1}`, say: i === 9 ? 'Now type ten. Press one, then zero!' : `Type ${NUMBER_WORDS[i + 1]}`,
      show: <CountLine upto={i} />,
    }));
  }
  if (level === 3) {
    return Array.from({ length: 8 }, (_, i) => {
      const step = i >= 5 ? 2 : 1; // gets harder halfway: counting in twos
      const start = step === 1 ? Math.floor(Math.random() * 5) : 0;
      const items = Array.from({ length: 5 }, (_, j) => start + j * step).filter((n) => n <= 9);
      const hole = 1 + Math.floor(Math.random() * (items.length - 1));
      const ans = items[hole];
      return {
        answer: String(ans),
        ask: step === 2 ? 'Counting in twos! Which number is missing?' : 'Which number is missing?',
        say: step === 2 ? 'Counting in twos! Which number is missing?' : 'Which number is missing?',
        show: <Sequence items={items.map((n, j) => (j === hole ? null : n))} />,
      };
    });
  }
  if (level === 4) {
    return shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 8).map((n) => {
      const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
      return {
        answer: String(n), ask: 'How many can you count? Type the number.', say: 'How many can you count? Type the number.',
        show: (
          <div className="grid grid-cols-3 gap-1 sm:gap-2" aria-label={`${n} pictures`}>
            {Array.from({ length: n }, (_, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }}><Art name={obj} size={58} /></motion.span>
            ))}
          </div>
        ),
      };
    });
  }
  return Array.from({ length: 8 }, () => {
    const n = 10 + Math.floor(Math.random() * 90);
    const tens = Math.floor(n / 10), ones = n % 10;
    return {
      answer: String(n), ask: `Type the number ${n}`, say: `Type the number ${n}. Press ${tens}, then ${ones}.`,
      show: (
        <div className="flex flex-col items-center gap-3">
          <Big>{n}</Big>
          <div className="flex items-end gap-3" aria-label={`${tens} tens and ${ones} ones`}>
            <span className="flex gap-1">{Array.from({ length: tens }, (_, i) => <span key={i} className="block h-14 w-3 rounded" style={{ background: 'var(--sky)', border: '2px solid var(--line)' }} />)}</span>
            <span className="flex flex-wrap gap-1" style={{ maxWidth: 70 }}>{Array.from({ length: ones }, (_, i) => <span key={i} className="block h-3 w-3 rounded-sm" style={{ background: 'var(--sun)', border: '2px solid var(--line)' }} />)}</span>
          </div>
        </div>
      ),
    };
  });
}

function CountLine({ upto }: { upto: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="kcap" data-kind="number" style={{ width: 54, height: 60, fontSize: 28, cursor: 'default', background: i < upto ? 'var(--mint)' : i === upto ? 'var(--sun)' : undefined, opacity: i > upto ? 0.45 : 1 }}>
          {i < upto ? i + 1 : i === upto ? '?' : ''}
        </span>
      ))}
    </div>
  );
}

export function Numbers({ level }: { level: number | null }) {
  const round = useRound('numbers', level);
  const qs = useMemo(() => makeQuestions(round.level), [round.roundId, round.level]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState('');
  const [missed, setMissed] = useState(false);
  const [tries, setTries] = useState(0);
  const [mood, setMood] = useState<Mood>('thinking');
  const [line, setLine] = useState({ text: '', say: '' });
  const [burst, setBurst] = useState(0);
  const [stars, setStars] = useState(0);
  const busy = useRef(false);
  const askedAt = useRef(0);
  const q = qs[i];

  useEffect(() => {
    setI(0);
    setStars(0);
  }, [round.roundId]);
  useEffect(() => {
    if (round.phase !== 'play' || !q) return;
    setTyped('');
    setMissed(false);
    setTries(0);
    setMood('thinking');
    setLine({ text: q.ask, say: q.say });
    busy.current = false;
    askedAt.current = performance.now();
  }, [i, q, round.phase, round.roundId]);

  const expected = q ? q.answer[typed.length] : '';
  useKeys((p) => {
    if (busy.current || !q) return;
    if (p.source === 'physical') sfx.key(p.id);
    if (!p.id.startsWith('Digit')) {
      if (p.id !== 'Escape') {
        sfx.wrong();
        setLine({ text: 'Use the number keys, in the row near the top!', say: 'Use the number keys, in the row near the top!' });
      }
      return;
    }
    const d = p.id.slice(5);
    const keyId = `Digit${expected}`;
    if (d === expected) {
      const t = typed + d;
      setTyped(t);
      if (t === q.answer) {
        busy.current = true;
        round.hit(keyId, performance.now() - askedAt.current);
        if (!missed) {
          actions.addStars(1);
          setStars((s) => s + 1);
          setBurst(Date.now());
        }
        sfx.correct();
        setMood('excited');
        const wow = pickOne(PRAISE);
        setLine({ text: `${wow} ${q.answer}!`, say: `${wow} ${q.answer}!` });
        window.setTimeout(() => (i + 1 >= qs.length ? round.finish() : setI(i + 1)), 1200);
      } else {
        sfx.tick();
      }
    } else {
      if (!missed) {
        round.miss(keyId);
        setMissed(true);
      }
      sfx.wrong();
      setTries((x) => x + 1);
      setMood('oops');
      setLine({ text: `That is ${d}. ${pickOne(ENCOURAGE)}`, say: `That is ${d}. ${pickOne(ENCOURAGE)}` });
    }
  }, round.phase === 'play' && !round.paused);

  return (
    <Frame round={round} wide hud={<StarPill n={stars} label="stars this round" />}>
      <TargetMark id={expected ? `Digit${expected}` : null} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <Bot text={line.text} say={line.say} mood={mood} size={100} className="panel p-4" />
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>{Math.min(i + 1, qs.length)} / {qs.length}</span>
            <ProgressBar pct={(i / qs.length) * 100} color="sun" label="Questions answered" />
          </div>
        </div>
        <div className="panel relative flex min-h-[280px] flex-col items-center justify-center gap-4 p-5" style={{ background: 'var(--sun-soft)' }}>
          {q && <motion.div key={`${i}-${round.roundId}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{q.show}</motion.div>}
          {q && q.answer.length > 1 && (
            <div className="flex gap-2" aria-label={`You typed ${typed || 'nothing yet'}`}>
              {q.answer.split('').map((c, j) => (
                <span key={j} className="grid h-14 w-12 place-items-center rounded-xl font-display text-[30px] font-bold" style={{ border: 'var(--bw) solid var(--line)', background: j < typed.length ? 'var(--mint)' : j === typed.length ? 'var(--surface)' : 'var(--surface-2)' }}>
                  {j < typed.length ? c : ''}
                </span>
              ))}
            </div>
          )}
          <StarBurst fire={burst} />
        </div>
      </div>
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout="auto" hint={q && (tries >= 2 || (round.hints && tries >= 1)) ? `Digit${expected}` : null} defaultSection="num" />
      </section>
    </Frame>
  );
}
