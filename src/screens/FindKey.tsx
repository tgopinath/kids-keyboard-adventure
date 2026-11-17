import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Frame, useRound } from '../components/Frame';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { Bot, ProgressBar, StarBurst, StarPill, TargetMark } from '../components/ui';
import type { Mood } from '../components/KeyBot';
import { ADVANCED_TARGETS, DIGIT_IDS, KEYS, LETTER_IDS, LETTER_SAY, rowHint, shortName, spokenName } from '../lib/keys';
import { weightedPick } from '../lib/adaptive';
import { ENCOURAGE, PRAISE, pickOne } from '../lib/content';
import { actions, getState, missedKeys } from '../lib/store';
import { useKeys } from '../lib/input';
import { sfx } from '../lib/audio';

const QUESTIONS = 10;
const SAME: Record<string, string> = { ShiftRight: 'ShiftLeft', ControlRight: 'ControlLeft', AltRight: 'AltLeft', MetaRight: 'MetaLeft' };

function prompt(id: string): { text: string; say: string } {
  const k = KEYS[id];
  if (k.kind === 'letter') {
    const v = Math.random() > 0.5;
    return { text: v ? `Find the letter ${k.label}!` : `Where is ${k.label}?`, say: v ? `Find the letter ${LETTER_SAY[k.label]}!` : `Where is ${LETTER_SAY[k.label]}?` };
  }
  if (k.kind === 'number') return { text: `Where is the number ${k.label}?`, say: `Where is the number ${k.label}?` };
  if (id === 'Space') return { text: 'Find the Spacebar!', say: 'Find the Spacebar!' };
  if (id === 'Enter') return { text: 'Press the Enter key!', say: 'Press the Enter key!' };
  if (k.kind === 'symbol') return { text: `Find ${k.name} ( ${k.label} )`, say: `Find ${k.name}` };
  return { text: `Can you find ${shortName(id)}?`, say: `Can you find ${spokenName(id)}?` };
}

export function FindKey({ level }: { level: number | null }) {
  const round = useRound('find', level);
  const pool = round.level === 1 ? LETTER_IDS : round.level === 2 ? [...LETTER_IDS, ...DIGIT_IDS] : ADVANCED_TARGETS;
  // a new list of questions every round, leaning on keys this child often misses
  const targets = useMemo(() => weightedPick(pool, missedKeys(getState()), QUESTIONS), [round.roundId, round.level]); // eslint-disable-line react-hooks/exhaustive-deps
  const [q, setQ] = useState(0);
  const [tries, setTries] = useState(0);
  const [mood, setMood] = useState<Mood>('thinking');
  const [line, setLine] = useState({ text: '', say: '' });
  const [good, setGood] = useState<string | null>(null);
  const [oops, setOops] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const [stars, setStars] = useState(0);
  const askedAt = useRef(performance.now());
  const busy = useRef(false);
  const target = targets[q];

  useEffect(() => {
    setQ(0);
    setStars(0);
  }, [round.roundId]);
  useEffect(() => {
    if (round.phase !== 'play' || !target) return;
    setLine(prompt(target));
    setMood('thinking');
    setTries(0);
    setGood(null);
    setOops(null);
    askedAt.current = performance.now();
    busy.current = false;
  }, [q, target, round.phase, round.roundId]);

  useKeys((p) => {
    if (busy.current || !target) return;
    const id = SAME[p.id] ?? p.id;
    if (p.source === 'physical') sfx.key(id);
    if (id === target) {
      busy.current = true;
      round.hit(target, performance.now() - askedAt.current);
      if (tries === 0) {
        actions.addStars(1);
        setStars((s) => s + 1);
        setBurst(Date.now());
        sfx.star();
      }
      sfx.correct();
      setGood(target);
      setMood('excited');
      const wow = pickOne(PRAISE);
      setLine({ text: `${wow} You found ${shortName(target)}!`, say: `${wow} You found ${spokenName(target)}!` });
      window.setTimeout(() => {
        if (q + 1 >= QUESTIONS) round.finish();
        else setQ(q + 1);
      }, 1100);
    } else {
      if (tries === 0) round.miss(target);
      sfx.wrong();
      setOops(id);
      window.setTimeout(() => setOops(null), 500);
      setTries((t) => t + 1);
      setMood('oops');
      const pressed = KEYS[id] ? shortName(id) : 'that key';
      setLine({ text: `That is ${pressed}. ${pickOne(ENCOURAGE)} Look ${rowHint(target)}.`, say: `That is ${KEYS[id] ? spokenName(id) : 'that key'}. ${pickOne(ENCOURAGE)} Look ${rowHint(target)}.` });
    }
  }, round.phase === 'play' && !round.paused);

  const showHint = !!target && (tries >= 2 || (round.hints && tries >= 1));
  const tk = target ? KEYS[target] : null;

  return (
    <Frame round={round} escapeIsAnswer={target === 'Escape'} wide hud={<StarPill n={stars} label="stars this round" />}>
      <TargetMark id={target} />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Bot text={line.text} say={line.say} mood={mood} size={104} className="panel p-4" />
        <div className="panel relative flex items-center justify-center gap-5 p-4">
          <span className="eyebrow absolute left-4 top-3">Find this key</span>
          {tk && (
            <motion.div key={`${q}-${round.roundId}`} className="kcap mt-4" data-kind={tk.kind} style={{ minWidth: 120, height: 120, fontSize: tk.label.length > 2 ? 28 : 72, padding: '0 16px', cursor: 'default' }} initial={{ scale: 0.3, rotate: 10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} aria-label={`Target: ${tk.name}`}>
              {tk.label}
            </motion.div>
          )}
          <StarBurst fire={burst} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>{Math.min(q + 1, QUESTIONS)} / {QUESTIONS}</span>
        <ProgressBar pct={(q / QUESTIONS) * 100} color="coral" label="Questions answered" />
      </div>
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout="auto" hint={showHint ? target : null} good={good} oops={oops} clickSound />
      </section>
    </Frame>
  );
}
