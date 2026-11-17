import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Frame, useRound, type Round } from '../../components/Frame';
import { VirtualKeyboard } from '../../components/VirtualKeyboard';
import { Art } from '../../components/Art';
import { Bot, Confetti, ProgressBar, TargetMark } from '../../components/ui';
import type { Mood } from '../../components/KeyBot';
import { BUILDER_LEVELS, ENCOURAGE, PRAISE, WORD_ART, WORD_SAY, pickOne } from '../../lib/content';
import { LETTER_SAY } from '../../lib/keys';
import { shuffle } from '../../lib/adaptive';
import { actions } from '../../lib/store';
import { useKeys } from '../../lib/input';
import { sfx, speak } from '../../lib/audio';
import { Score, Stage } from './shared';

const say = (w: string) => WORD_SAY[w] ?? w.toLowerCase();

/**
 * The shared word-building board: a picture, one slot per letter, type the letters in order.
 * Used by the Word Builder game and by Word Adventure.
 */
export function WordBoard({ round, words, scoring, onWordDone }: { round: Round; words: string[]; scoring: boolean; onWordDone?: (word: string, clean: boolean) => void }) {
  const [w, setW] = useState(0);
  const [pos, setPos] = useState(0);
  const [slotTries, setSlotTries] = useState(0);
  const [wordMisses, setWordMisses] = useState(0);
  const [shake, setShake] = useState(0);
  const [mood, setMood] = useState<Mood>('thinking');
  const [line, setLine] = useState({ text: '', say: '' });
  const [score, setScore] = useState(0);
  const [fire, setFire] = useState(0);
  const [complete, setComplete] = useState(false);
  const scoreRef = useRef(0);
  const addScore = (n: number) => {
    scoreRef.current += n;
    setScore(scoreRef.current);
  };
  const busy = useRef(false);
  const startedAt = useRef(0);
  const word = words[w] ?? '';
  const letter = word[pos];

  useEffect(() => {
    setW(0);
    setScore(0);
    scoreRef.current = 0;
  }, [round.roundId]);
  useEffect(() => {
    if (round.phase !== 'play' || !word) return;
    setPos(0);
    setSlotTries(0);
    setWordMisses(0);
    setComplete(false);
    setMood('thinking');
    setLine({ text: `What is this? Spell ${word}!`, say: `What is this? It is a ${say(word)}. Spell ${say(word)}!` });
    busy.current = false;
    startedAt.current = performance.now();
  }, [w, word, round.phase, round.roundId]);

  useKeys((p) => {
    if (busy.current || !letter || p.id === 'Escape') return;
    if (p.source === 'physical') sfx.key(p.id);
    if (!p.id.startsWith('Key')) return;
    const want = `Key${letter}`;
    if (p.id === want) {
      round.hit(want);
      sfx.correct();
      if (scoring) addScore(10);
      const next = pos + 1;
      setPos(next);
      setSlotTries(0);
      speak(LETTER_SAY[letter], { rate: 1 });
      if (next >= word.length) {
        busy.current = true;
        const clean = wordMisses === 0;
        const secs = (performance.now() - startedAt.current) / 1000;
        if (scoring) addScore((clean ? 20 : 5) + (secs < word.length * 2 ? 10 : 0));
        actions.wordBuilt();
        if (clean) actions.addStars(1);
        setComplete(true);
        setFire(Date.now());
        sfx.celebrate();
        setMood('excited');
        const spelled = word.split('').map((c) => LETTER_SAY[c]).join(', ');
        setLine({ text: `${pickOne(PRAISE)} You built ${word}!`, say: `${spelled}. ${say(word)}! ${pickOne(PRAISE)}` });
        onWordDone?.(word, clean);
        window.setTimeout(() => {
          if (w + 1 >= words.length) round.finish({ score: scoring ? scoreRef.current : undefined });
          else setW(w + 1);
        }, 2600);
      }
    } else {
      round.miss(want);
      setSlotTries((t) => t + 1);
      setWordMisses((m) => m + 1);
      sfx.wrong();
      setShake(Date.now());
      setMood('oops');
      setLine({ text: `${pickOne(ENCOURAGE)} The next letter is ${letter}.`, say: `${pickOne(ENCOURAGE)} The next letter is ${LETTER_SAY[letter]}.` });
    }
  }, round.phase === 'play' && !round.paused);

  const showHint = slotTries >= 2 || (round.hints && slotTries >= 1);
  const slot = Math.max(44, Math.min(76, 560 / Math.max(3, word.length)));

  return (
    <>
      <Confetti fire={fire} count={30} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <Bot text={line.text} say={line.say} mood={mood} className="panel p-4" />
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>Word {Math.min(w + 1, words.length)} of {words.length}</span>
            <ProgressBar pct={(w / words.length) * 100} label="Words built" />
            {scoring && <Score n={score} />}
          </div>
        </div>
        <Stage height="auto" label="Word to build" className="flex flex-col items-center justify-center gap-4 p-5">
          <motion.div key={`${word}-${round.roundId}`} initial={{ scale: 0.4, rotate: -10, opacity: 0 }} animate={complete ? { scale: [1, 1.2, 1], rotate: [0, -6, 6, 0], opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="grid place-items-center rounded-2xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--elev-2)' }}>
            <Art name={WORD_ART[word] ?? 'star'} size={150} label={say(word)} />
          </motion.div>
          <motion.div key={shake} className="flex flex-wrap justify-center gap-2" animate={shake ? { x: [0, -10, 10, -6, 0] } : {}} transition={{ duration: 0.35 }} aria-label={`${word.length} letters. ${pos} typed.`}>
            {word.split('').map((c, i) => (
              <span key={i} className="grid place-items-center rounded-2xl font-display font-bold" style={{ width: slot, height: slot * 1.1, fontSize: slot * 0.55, border: `1px solid ${i === pos ? 'var(--primary)' : 'var(--border-strong)'}`, boxShadow: i === pos ? '0 0 0 3px var(--primary-soft)' : 'none', background: i < pos ? 'var(--good-soft)' : 'var(--surface)', color: i < pos ? 'var(--good)' : 'var(--ink)' }}>
                {i < pos ? c : i === pos && showHint ? <span style={{ opacity: 0.35 }}>{c}</span> : '_'}
              </span>
            ))}
          </motion.div>
        </Stage>
      </div>
      <TargetMark id={letter ? `Key${letter}` : null} />
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout="letters" hint={showHint && letter ? `Key${letter}` : null} />
      </section>
    </>
  );
}

export function WordBuilderGame({ level }: { level: number | null }) {
  const round = useRound('builder', level);
  const band = BUILDER_LEVELS[round.level - 1] ?? BUILDER_LEVELS[0];
  const words = useMemo(() => shuffle(band.words).slice(0, 5), [round.roundId, round.level]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Frame round={round} wide>
      <WordBoard round={round} words={words} scoring />
    </Frame>
  );
}
