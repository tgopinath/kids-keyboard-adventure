import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Frame, useRound } from '../../components/Frame';
import { VirtualKeyboard } from '../../components/VirtualKeyboard';
import { Bot, Chest, Confetti, TargetMark } from '../../components/ui';
import { KeyBot, type Mood } from '../../components/KeyBot';
import { DIGIT_IDS, LETTER_IDS, LETTER_SAY } from '../../lib/keys';
import { shuffle } from '../../lib/adaptive';
import { ENCOURAGE, PRAISE, pickOne } from '../../lib/content';
import { SHOP } from '../../lib/rewards';
import { actions, getState } from '../../lib/store';
import { useKeys } from '../../lib/input';
import { sfx, speak } from '../../lib/audio';
import { Score, Stage } from './shared';
import { useMedia } from '../../lib/useMedia';

const STEPS = [4, 6, 8, 8, 12];
const label = (id: string) => id.replace('Key', '').replace('Digit', '');
const sayOf = (id: string) => (id.startsWith('Key') ? LETTER_SAY[label(id)] : label(id));

/** Stone positions in reading order (left to right, row by row), as % of the map. */
function trail(n: number) {
  const rows = n <= 4 ? 1 : n <= 8 ? 2 : 3;
  const per = Math.ceil(n / rows);
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / per), c = i % per;
    return { x: 10 + (per === 1 ? 0 : (c / (per - 1)) * 62), y: ((r + 1) / (rows + 1)) * 100 + (c % 2 ? 6 : -6) };
  });
}

export function TreasureHunt({ level }: { level: number | null }) {
  const round = useRound('treasure', level);
  const n = STEPS[round.level - 1] ?? 4;
  const seq = useMemo(() => {
    const pool = round.level >= 4 ? [...LETTER_IDS, ...DIGIT_IDS] : LETTER_IDS;
    return shuffle(pool).slice(0, n);
  }, [round.roundId, round.level]); // eslint-disable-line react-hooks/exhaustive-deps
  const stones = useMemo(() => trail(n), [n]);
  const [pos, setPos] = useState(0);
  const [tries, setTries] = useState(0);
  const [mood, setMood] = useState<Mood>('thinking');
  const [line, setLine] = useState({ text: '', say: '' });
  const [open, setOpen] = useState(false);
  const [fire, setFire] = useState(0);
  const [score, setScore] = useState(0);
  const [prize, setPrize] = useState<string | null>(null);
  const busy = useRef(false);
  const target = seq[pos];

  useEffect(() => {
    setPos(0);
    setOpen(false);
    setScore(0);
    setPrize(null);
    busy.current = false;
  }, [round.roundId]);
  useEffect(() => {
    if (round.phase !== 'play' || !target) return;
    setTries(0);
    setMood('thinking');
    setLine({ text: `Step ${pos + 1}: press ${label(target)}!`, say: `Press ${sayOf(target)}!` });
  }, [pos, target, round.phase, round.roundId]);

  useKeys((p) => {
    if (busy.current || !target || p.id === 'Escape') return;
    if (p.source === 'physical') sfx.key(p.id);
    if (p.id === target) {
      round.hit(target);
      sfx.correct();
      setScore((s) => s + 10);
      const next = pos + 1;
      setPos(next);
      if (next >= seq.length) {
        busy.current = true;
        setMood('excited');
        setLine({ text: 'You reached the treasure! Open it!', say: 'You reached the treasure!' });
        window.setTimeout(() => {
          setOpen(true);
          sfx.chest();
          setFire(Date.now());
          actions.chestOpened();
          // every third chest hides a free robot accessory
          const st = getState();
          if (st.chests % 3 === 0) {
            const free = SHOP.filter((i) => i.price > 0 && i.slot !== 'world' && !st.owned.includes(i.id));
            const gift = free[Math.floor(Math.random() * free.length)];
            if (gift) {
              actions.grant(gift.id);
              setPrize(gift.name);
              speak(`Wow! Gold coins, and a ${gift.name} for KeyBot!`);
            }
          } else speak('Wow! Gold coins and stars!');
          actions.addStars(2);
          window.setTimeout(() => round.finish({ score: score + 10 + n * 5, coinsBonus: n * 2 }), 2600);
        }, 600);
      } else {
        setMood('happy');
        setLine({ text: `${pickOne(PRAISE)} Next: ${label(seq[next])}`, say: `${pickOne(PRAISE)} Now press ${sayOf(seq[next])}` });
      }
    } else if (p.id.startsWith('Key') || p.id.startsWith('Digit')) {
      if (tries === 0) round.miss(target);
      setTries((t) => t + 1);
      sfx.wrong();
      setMood('oops');
      setLine({ text: `${pickOne(ENCOURAGE)} Find ${label(target)}.`, say: `${pickOne(ENCOURAGE)} Find ${sayOf(target)}.` });
    }
  }, round.phase === 'play' && !round.paused);

  const here = stones[Math.min(pos, stones.length - 1)];
  const small = useMedia('(max-width: 640px)');

  return (
    <Frame round={round} wide hud={<Score n={score} />} resultExtra={prize ? <p className="toy mt-4 px-4 py-3 text-center font-bold" style={{ background: 'var(--pink-soft)' }}>Treasure prize: {prize} for KeyBot! Find it in My Rewards.</p> : undefined}>
      <Confetti fire={fire} />
      <div className="mb-4"><Bot text={line.text} say={line.say} mood={mood} size={88} className="panel p-4" /></div>
      <Stage height={360} label="Treasure map">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d={`M ${stones.map((s) => `${s.x} ${s.y}`).join(' L ')} L 89 ${stones[stones.length - 1].y}`} fill="none" stroke="#fff" strokeWidth={1.4} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 5 }} />
        </svg>
        {stones.map((s, i) => (
          <div key={i} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)' }}>
            <span className="kcap" data-kind={seq[i]?.startsWith('Digit') ? 'number' : 'letter'} style={{ width: small ? 46 : 54, height: small ? 46 : 54, fontSize: small ? 24 : 28, cursor: 'default', background: i < pos ? 'var(--mint)' : i === pos ? 'var(--sun)' : undefined, borderRadius: 999 }}>
              {seq[i] ? label(seq[i]) : ''}
            </span>
          </div>
        ))}
        <motion.div className="absolute z-10" animate={{ left: `${here.x}%`, top: `${here.y}%` }} transition={{ type: 'spring', stiffness: 160, damping: 14 }} style={{ transform: 'translate(-50%, -110%)' }} aria-hidden>
          <KeyBot size={56} mood={mood} still />
        </motion.div>
        <div className="absolute" style={{ left: small ? '89%' : '90%', top: `${stones[stones.length - 1].y}%`, transform: 'translate(-50%,-50%)' }}>
          <Chest open={open} size={small ? 72 : 110} />
        </div>
      </Stage>
      <TargetMark id={target} />
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout={round.level >= 4 ? 'auto' : 'letters'} hint={target && (tries >= 2 || (round.hints && tries >= 1)) ? target : null} />
      </section>
    </Frame>
  );
}
