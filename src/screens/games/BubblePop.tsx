import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Frame, useRound } from '../../components/Frame';
import { VirtualKeyboard } from '../../components/VirtualKeyboard';
import { Bot, ProgressBar, TargetMark } from '../../components/ui';
import type { Mood } from '../../components/KeyBot';
import { DIGIT_IDS, LETTER_IDS, LETTER_SAY } from '../../lib/keys';
import { shuffle } from '../../lib/adaptive';
import { ENCOURAGE, PRAISE, pickOne } from '../../lib/content';
import { actions } from '../../lib/store';
import { useKeys } from '../../lib/input';
import { sfx } from '../../lib/audio';
import { BRIGHTS, Score, Stage, useStageHeight } from './shared';

const TRICKY = ['KeyB', 'KeyD', 'KeyP', 'KeyQ', 'KeyR', 'KeyM', 'KeyN', 'KeyW', 'KeyV', 'KeyU', 'KeyE', 'KeyF', 'KeyO', 'KeyC', 'KeyG'];
const LEVELS = [
  { count: 4, pool: LETTER_IDS },
  { count: 6, pool: LETTER_IDS },
  { count: 8, pool: LETTER_IDS },
  { count: 8, pool: TRICKY },
  { count: 10, pool: [...LETTER_IDS, ...DIGIT_IDS] },
];
const POPS = 10;

interface Bubble { id: number; key: string; slot: number; color: string }
const label = (id: string) => id.replace('Key', '').replace('Digit', '');
const sayOf = (id: string) => (id.startsWith('Key') ? LETTER_SAY[label(id)] : label(id));

export function BubblePop({ level }: { level: number | null }) {
  const round = useRound('bubbles', level);
  const cfg = LEVELS[round.level - 1] ?? LEVELS[0];
  const H = useStageHeight(400, 520);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [target, setTarget] = useState<Bubble | null>(null);
  const [popped, setPopped] = useState(0);
  const [score, setScore] = useState(0);
  const [wiggle, setWiggle] = useState(0);
  const [mood, setMood] = useState<Mood>('thinking');
  const [line, setLine] = useState({ text: '', say: '' });
  const [tries, setTries] = useState(0);
  const nextId = useRef(1);
  const askedAt = useRef(0);
  const busy = useRef(false);

  const freshBubble = (slot: number, taken: string[]): Bubble => {
    const free = cfg.pool.filter((k) => !taken.includes(k));
    return { id: nextId.current++, key: free[Math.floor(Math.random() * free.length)], slot, color: BRIGHTS[nextId.current % BRIGHTS.length] };
  };
  const ask = (list: Bubble[]) => {
    const t = list[Math.floor(Math.random() * list.length)];
    setTarget(t);
    setTries(0);
    setMood('thinking');
    setLine({ text: `Pop the bubble with ${label(t.key)}!`, say: `Pop the bubble with ${sayOf(t.key)}!` });
    askedAt.current = performance.now();
    busy.current = false;
  };

  useEffect(() => {
    if (round.phase !== 'play') return;
    const list: Bubble[] = [];
    const keys = shuffle(cfg.pool).slice(0, cfg.count);
    keys.forEach((k, i) => list.push({ id: nextId.current++, key: k, slot: i, color: BRIGHTS[i % BRIGHTS.length] }));
    setBubbles(list);
    setPopped(0);
    setScore(0);
    ask(list);
  }, [round.roundId, round.phase === 'play']); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (id: string) => {
    if (busy.current || !target) return;
    if (id === target.key) {
      busy.current = true;
      const ms = performance.now() - askedAt.current;
      round.hit(target.key, ms);
      if (tries === 0) actions.addStars(1);
      actions.metric('pops', 1);
      sfx.pop();
      const add = 10 + (ms < 2500 ? 5 : 0);
      setScore((s) => s + add);
      setMood('excited');
      setLine({ text: `Pop! ${pickOne(PRAISE)}`, say: `Pop! ${pickOne(PRAISE)}` });
      const n = popped + 1;
      setPopped(n);
      const rest = bubbles.filter((b) => b.id !== target.id);
      setBubbles(rest);
      window.setTimeout(() => {
        if (n >= POPS) {
          round.finish({ score: score + add });
          return;
        }
        const nb = freshBubble(target.slot, rest.map((b) => b.key));
        const list = [...rest, nb];
        setBubbles(list);
        ask(list);
      }, 650);
    } else {
      if (tries === 0) round.miss(target.key);
      setTries((t) => t + 1);
      sfx.wrong();
      setWiggle(Date.now());
      setMood('oops');
      setLine({ text: `${pickOne(ENCOURAGE)} Look for ${label(target.key)}. It is wiggling!`, say: `${pickOne(ENCOURAGE)} Look for ${sayOf(target.key)}.` });
    }
  };
  useKeys((p) => {
    if (p.source === 'physical') sfx.key(p.id);
    if (p.id === 'Escape') return;
    press(p.id);
  }, round.phase === 'play' && !round.paused);

  const cols = cfg.count <= 4 ? 4 : cfg.count <= 6 ? 3 : cfg.count <= 8 ? 4 : 5;
  const rows = Math.ceil(cfg.count / cols);
  const size = Math.min(110, (H - 40) / rows - 12);

  return (
    <Frame round={round} wide hud={<Score n={score} />}>
      <TargetMark id={target?.key} />
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          <Bot text={line.text} say={line.say} mood={mood} size={96} className="panel p-4" />
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>{popped} / {POPS}</span>
            <ProgressBar pct={(popped / POPS) * 100} color="pink" label="Bubbles popped" />
          </div>
          {target && (
            <div className="toy hidden items-center justify-center gap-4 p-4 lg:flex" style={{ background: 'var(--pink-soft)' }} aria-hidden>
              <span className="font-display text-[22px] font-bold">Pop</span>
              <span className="kcap" data-kind={target.key.startsWith('Digit') ? 'number' : 'letter'} style={{ width: 96, height: 96, fontSize: 56, cursor: 'default' }}>{label(target.key)}</span>
            </div>
          )}
        </div>
        <Stage height={H} label="Bubbles">
          <div className="absolute inset-0 grid p-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
            {Array.from({ length: cfg.count }, (_, slot) => {
              const b = bubbles.find((x) => x.slot === slot);
              return (
                <div key={slot} className="grid place-items-center" style={{ animation: `float-y ${2.2 + (slot % 3) * 0.4}s ease-in-out ${slot * 0.2}s infinite` }}>
                  <AnimatePresence mode="popLayout">
                    {b && (
                      <motion.button key={b.id} type="button" onPointerDown={(e) => { e.preventDefault(); sfx.key(b.key); press(b.key); }}
                        className="relative grid place-items-center rounded-full font-display font-bold"
                        style={{ width: size, height: size, fontSize: size * 0.45, color: '#1d1a38', background: `radial-gradient(circle at 32% 28%, #ffffffcc 0 12%, ${b.color}55 13% 60%, ${b.color}aa 100%)`, border: `3px solid ${b.color}`, boxShadow: 'inset 0 -6px 12px rgba(0,0,0,.12)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 1.6, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        aria-label={`Bubble ${label(b.key)}`} tabIndex={-1}>
                        <motion.span key={target?.id === b.id ? wiggle : 0} animate={target?.id === b.id && wiggle ? { rotate: [0, -16, 16, -10, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5 }}>
                          {label(b.key)}
                        </motion.span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Stage>
      </div>
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout={round.level === 5 ? 'auto' : 'letters'} hint={target && (tries >= 2 || (round.hints && tries >= 1)) ? target.key : null} defaultSection="abc" />
      </section>
    </Frame>
  );
}
