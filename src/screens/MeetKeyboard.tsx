import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowBigUp, ArrowBigUpDash, ArrowDown, ArrowLeft, ArrowRight, ArrowRightToLine, ArrowUp, Command, CornerDownLeft, Delete, LogOut, Zap,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useMedia } from '../lib/useMedia';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { Art, Dots } from '../components/Art';
import { Bot, Confetti, ProgressBar, TopBar } from '../components/ui';
import { KEYS, LETTER_SAY, spokenName } from '../lib/keys';
import { ALPHA_BY_LETTER, NUMBER_WORDS, PRAISE, pickOne } from '../lib/content';
import { useCapture, useKeys } from '../lib/input';
import { sfx } from '../lib/audio';
import { actions, useStore } from '../lib/store';
import { go } from '../lib/router';
import { routeFor } from '../lib/activities';
import type { Mood } from '../components/KeyBot';

const SPECIAL_ICON: Record<string, LucideIcon> = {
  Enter: CornerDownLeft, Backspace: Delete, Tab: ArrowRightToLine, CapsLock: ArrowBigUpDash, ShiftLeft: ArrowBigUp, ShiftRight: ArrowBigUp,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Escape: LogOut, ControlLeft: Command, ControlRight: Command, AltLeft: Command, AltRight: Command,
  MetaLeft: Command, MetaRight: Command,
};
const KIND_LEGEND: [string, string][] = [['letter', 'Letters'], ['number', 'Numbers'], ['symbol', 'Symbols'], ['action', 'Action keys'], ['modifier', 'Helper keys'], ['function', 'Function keys'], ['arrow', 'Arrows']];
const TOTAL = Object.keys(KEYS).length;

function Picture({ id, caps, size }: { id: string; caps: boolean; size: number }) {
  const k = KEYS[id];
  if (k.kind === 'letter') {
    const a = ALPHA_BY_LETTER[k.label];
    return (
      <div className="flex flex-col items-center gap-1">
        <Art name={a.art} size={size} label={a.word} />
        <span className="text-[20px] font-bold">{caps ? a.word.toUpperCase() : a.word}</span>
      </div>
    );
  }
  if (k.kind === 'number') {
    const n = Number(k.label);
    return (
      <div className="flex flex-col items-center gap-1">
        <Dots n={n} size={size * 0.93} />
        <span className="text-[20px] font-bold">{NUMBER_WORDS[n]}</span>
      </div>
    );
  }
  if (k.kind === 'symbol') {
    return (
      <div className="flex items-end gap-4 font-display font-bold" aria-label={`${k.label} and ${k.shift}`}>
        <span className="leading-none" style={{ fontSize: size * 0.73 }}>{k.label}</span>
        <span className="text-[56px] leading-none" style={{ color: 'var(--muted)' }}>{k.shift}</span>
      </div>
    );
  }
  if (id === 'Space') {
    return (
      <div className="flex items-center gap-2 font-display font-bold" style={{ fontSize: size * 0.24 }} aria-label="Words with spaces">
        <span>I</span><span className="h-3 w-12 rounded-full" style={{ background: 'var(--sun)' }} />
        <span>LIKE</span><span className="h-3 w-12 rounded-full" style={{ background: 'var(--sun)' }} />
        <span>CATS</span>
      </div>
    );
  }
  const I = SPECIAL_ICON[id] ?? Zap;
  return <I size={size * 0.86} strokeWidth={2} aria-hidden />;
}

export function MeetKeyboard() {
  useCapture(true);
  const explored = useStore((s) => s.explored);
  const lessonDone = useStore((s) => s.lessons.includes('l1'));
  const [current, setCurrent] = useState<string | null>(null);
  const [n, setN] = useState(0);
  const [caps, setCaps] = useState(false);
  const [mood, setMood] = useState<Mood>('wave');
  const [line, setLine] = useState<{ text: string; say: string }>({ text: 'Press any key on your keyboard, or tap one below!', say: 'Press any key on your keyboard, or tap one below!' });
  const [fire, setFire] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  useKeys((p) => {
    const k = KEYS[p.id];
    if (!k) return;
    sfx.key(p.id);
    window.setTimeout(() => sfx.correct(), 60);
    let nextCaps = caps;
    if (p.id === 'CapsLock') {
      nextCaps = !caps;
      setCaps(nextCaps);
    }
    setCurrent(p.id);
    setN((x) => x + 1);
    setMood(Math.random() > 0.5 ? 'excited' : 'happy');
    const wow = pickOne(PRAISE);
    let text: string, say: string;
    if (k.kind === 'letter') {
      const a = ALPHA_BY_LETTER[k.label];
      text = `${wow} This is the letter ${k.label}! ${k.label} is for ${a.word}.`;
      say = `${wow} This is the letter ${LETTER_SAY[k.label]}. ${LETTER_SAY[k.label]} is for ${a.word}.`;
    } else if (k.kind === 'number') {
      text = `${wow} This is the number ${k.label}. Count ${NUMBER_WORDS[Number(k.label)]}!`;
      say = text;
    } else if (p.id === 'CapsLock') {
      text = nextCaps ? 'Caps Lock is ON. Now every letter is a capital letter!' : 'Caps Lock is OFF. Letters are small again.';
      say = text;
    } else {
      text = `${wow} This is ${k.name.replace(/^the /, 'the ')}. ${k.info}`;
      say = `${wow} This is ${spokenName(p.id)}. ${k.info}`;
    }
    setLine({ text, say });
    const isNew = !explored.includes(p.id);
    actions.explore(p.id);
    if (isNew && explored.length + 1 >= 10 && !lessonDone) {
      const o = actions.finishRound({ activity: 'explore', level: 1, correct: 10, wrong: 0, durMs: 0 });
      if (o.lessonDone) {
        setFire(Date.now());
        setCelebrate(true);
        sfx.celebrate();
      }
    }
  });

  const k = current ? KEYS[current] : null;
  const small = useMedia('(max-width: 640px)');
  const box = small ? 104 : 150;
  const big = k ? (k.kind === 'letter' ? (caps ? k.label : `${k.label} ${k.label.toLowerCase()}`) : k.label) : '?';

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-10 sm:px-6">
      <TopBar title="Meet Your Keyboard" parent="/learn">
        {caps && <span className="sticker">Caps on</span>}
      </TopBar>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Bot text={line.text} say={line.say} mood={mood} nonce={n} className="panel p-4" />
        <section className="panel relative flex min-h-[200px] items-center sm:min-h-[260px] justify-center gap-6 overflow-hidden p-5 sm:gap-10" style={{ background: 'var(--surface)' }} aria-live="polite" aria-label="The key you pressed">
          <AnimatePresence mode="popLayout">
            <motion.div key={`${current}-${n}`} className="flex flex-nowrap items-center justify-center gap-4 sm:gap-10" initial={{ scale: 0.4, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 18 }}>
              <div className="kcap" data-kind={k?.kind ?? 'letter'} style={{ minWidth: box, height: box, fontSize: big.length > 3 ? box * 0.22 : box * 0.56, padding: '0 14px', cursor: 'default' }}>
                {big}
              </div>
              {k ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Picture id={current!} caps={caps} size={box} />
                </div>
              ) : (
                <p className="max-w-xs text-center text-[17px] muted">Every key has a job. Let us find out what they do!</p>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <section className="panel mt-4 p-3 sm:p-5" aria-label="Keyboard">
        <VirtualKeyboard layout="auto" glow={current ? [current] : []} caps={caps} clickSound={false} />
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="panel p-4">
          <div className="flex items-center justify-between gap-3 font-bold">
            <span>Keys discovered</span>
            <span className="tnum">{explored.length} of {TOTAL}</span>
          </div>
          <div className="mt-2"><ProgressBar pct={(explored.length / TOTAL) * 100} label="Keys discovered" color="sky" /></div>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Key colours">
          {KIND_LEGEND.map(([kind, name]) => (
            <li key={kind} className="chip" style={{ minHeight: 36 }}>
              <span className="kcap" data-kind={kind} style={{ width: 14, height: 14, borderRadius: 4, boxShadow: 'none', borderWidth: 1 }} aria-hidden /> {name}
            </li>
          ))}
        </ul>
      </section>

      <Confetti fire={fire} />
      <AnimatePresence>
        {celebrate && (
          <motion.div className="toy fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl flex-wrap items-center gap-3 p-4" style={{ boxShadow: 'var(--elev-2)' }} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} role="status">
            <span className="text-[16px] font-bold">Lesson done! You met 10 keys.</span>
            <span className="ml-auto flex gap-2">
              <button type="button" className="btn btn-sm btn-primary" onClick={() => go(routeFor('find', 1))}>Next lesson</button>
              <button type="button" className="btn btn-sm" onClick={() => setCelebrate(false)}>Keep exploring</button>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
