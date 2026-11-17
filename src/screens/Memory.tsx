import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Frame, useRound } from '../components/Frame';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { Bot, ProgressBar, StarBurst, StarPill, TargetMark } from '../components/ui';
import type { Mood } from '../components/KeyBot';
import { LETTER_IDS, LETTER_ROWS, LETTER_SAY } from '../lib/keys';
import { shuffle } from '../lib/adaptive';
import { ENCOURAGE, PRAISE, pickOne } from '../lib/content';
import { actions } from '../lib/store';
import { useKeys } from '../lib/input';
import { sfx } from '../lib/audio';

const HIDE = [2, 3, 4, 5, 6, 8];
const BOARDS = 3;
const LOOK_SECONDS = 5;
const ORDER = LETTER_ROWS.flat().filter((k): k is string => typeof k === 'string');
const letterOf = (id: string) => id.replace('Key', '');

export function Memory({ level }: { level: number | null }) {
  const round = useRound('memory', level);
  const count = HIDE[round.level - 1] ?? 2;
  const [board, setBoard] = useState(0);
  const [step, setStep] = useState<'look' | 'guess'>('look');
  const [left, setLeft] = useState(LOOK_SECONDS);
  const [hidden, setHidden] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [tries, setTries] = useState(0);
  const [mood, setMood] = useState<Mood>('thinking');
  const [line, setLine] = useState({ text: '', say: '' });
  const [burst, setBurst] = useState(0);
  const [stars, setStars] = useState(0);
  const [good, setGood] = useState<string | null>(null);
  const busy = useRef(false);
  const current = hidden[0] ?? null;

  const newBoard = () => {
    const pick = shuffle(LETTER_IDS).slice(0, count).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    setHidden(pick);
    setStep('look');
    setLeft(LOOK_SECONDS);
    setMood('surprised');
    setLine({ text: `Look carefully! Remember where the letters are. ${count} keys will hide.`, say: `Look carefully! Remember where the letters are. ${count} keys will hide.` });
  };

  useEffect(() => {
    setBoard(0);
    setStars(0);
  }, [round.roundId]);
  useEffect(() => {
    if (round.phase === 'play') newBoard();
  }, [board, round.roundId, round.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // the 5-second look, paused with the game
  useEffect(() => {
    if (round.phase !== 'play' || step !== 'look' || round.paused) return;
    if (left <= 0) {
      setStep('guess');
      sfx.whoosh();
      return;
    }
    const t = window.setTimeout(() => {
      setLeft((l) => l - 1);
      sfx.tick();
    }, 1000);
    return () => window.clearTimeout(t);
  }, [left, step, round.phase, round.paused]);

  // ask about the next hidden key
  useEffect(() => {
    if (step !== 'guess' || !current) return;
    const others = shuffle(LETTER_IDS.filter((k) => k !== current)).slice(0, 3);
    setChoices(shuffle([current, ...others]));
    setTries(0);
    setMood('thinking');
    setLine({ text: 'Which letter is hiding in the yellow key?', say: 'Which letter is hiding in the yellow key?' });
    busy.current = false;
  }, [step, current]);

  const answer = (id: string) => {
    if (busy.current || step !== 'guess' || !current) return;
    if (id === current) {
      busy.current = true;
      round.hit(current);
      if (tries === 0) {
        actions.addStars(1);
        setStars((s) => s + 1);
        setBurst(Date.now());
      }
      sfx.correct();
      setGood(current);
      setMood('excited');
      setLine({ text: `${pickOne(PRAISE)} It was ${letterOf(current)}!`, say: `${pickOne(PRAISE)} It was ${LETTER_SAY[letterOf(current)]}!` });
      window.setTimeout(() => reveal(), 900);
    } else {
      if (tries === 0) round.miss(current);
      sfx.wrong();
      setMood('oops');
      if (tries >= 1) {
        busy.current = true;
        setLine({ text: `It was ${letterOf(current)}. You will remember it next time!`, say: `It was ${LETTER_SAY[letterOf(current)]}. You will remember it next time!` });
        window.setTimeout(() => reveal(), 1500);
      } else {
        setLine({ text: `Not ${letterOf(id)}. ${pickOne(ENCOURAGE)}`, say: `Not ${LETTER_SAY[letterOf(id)]}. ${pickOne(ENCOURAGE)}` });
      }
      setTries((t) => t + 1);
    }
  };
  const reveal = () => {
    setGood(null);
    const rest = hidden.slice(1);
    setHidden(rest);
    if (rest.length === 0) window.setTimeout(() => (board + 1 >= BOARDS ? round.finish() : setBoard((b) => b + 1)), 400);
  };

  useKeys((p) => {
    if (step === 'guess' && p.id.startsWith('Key')) {
      sfx.key(p.id);
      answer(p.id);
    }
  }, round.phase === 'play' && !round.paused);

  const total = BOARDS * count;
  const done = board * count + (count - hidden.length) * (step === 'guess' ? 1 : 0);

  return (
    <Frame round={round} wide hud={<StarPill n={stars} label="stars this round" />}>
      <TargetMark id={step === 'guess' ? current : null} />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Bot text={line.text} say={line.say} mood={mood} size={100} className="panel p-4" />
        <div className="panel relative flex items-center justify-center gap-4 p-4" style={{ background: 'var(--grape-soft)' }}>
          {step === 'look' ? (
            <div className="flex items-center gap-4" role="timer" aria-live="polite">
              <Eye size={44} aria-hidden />
              <motion.span key={left} className="font-display text-[80px] font-bold leading-none tnum" initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{left}</motion.span>
              <span className="font-display text-[20px] font-semibold">Look!</span>
            </div>
          ) : (
            <div className="grid w-full grid-cols-4 gap-2" role="group" aria-label="Choose the hidden letter">
              {choices.map((c) => (
                <button key={c} type="button" className="kcap" data-kind="letter" style={{ height: 76, fontSize: 40 }} onClick={() => { sfx.key(c); answer(c); }} aria-label={letterOf(c)}>
                  {letterOf(c)}
                </button>
              ))}
            </div>
          )}
          <StarBurst fire={burst} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>Board {Math.min(board + 1, BOARDS)} of {BOARDS}</span>
        <ProgressBar pct={(done / total) * 100} color="grape" label="Hidden keys found" />
      </div>
      <section className="panel mt-4 p-3 sm:p-5" aria-label="Keyboard to remember">
        <VirtualKeyboard layout="letters" interactive={false} hidden={step === 'guess' ? hidden : []} current={current} good={good} />
      </section>
      <p className="mt-3 text-center text-[15px]" style={{ color: 'var(--muted)' }}>Tap a letter above, or press it on your keyboard.</p>
    </Frame>
  );
}
