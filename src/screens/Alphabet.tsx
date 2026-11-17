import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Frame, useRound } from '../components/Frame';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { Art } from '../components/Art';
import { Bot, Modal, ProgressBar, StarBurst, StarPill, tone, toneSoft, TargetMark } from '../components/ui';
import type { Mood } from '../components/KeyBot';
import { ALPHABET, ENCOURAGE, PRAISE, pickOne } from '../lib/content';
import { KEYS, LETTER_SAY, rowHint } from '../lib/keys';
import { shuffle } from '../lib/adaptive';
import { actions, useStore } from '../lib/store';
import { useKeys } from '../lib/input';
import { sfx, speak } from '../lib/audio';

type Entry = (typeof ALPHABET)[number];

export function AlphaCard({ a, revealed = true, size = 'md', onClick }: { a: Entry; revealed?: boolean; size?: 'sm' | 'md' | 'lg'; onClick?: () => void }) {
  const big = size === 'lg';
  const inner = (
    <>
      <span className="font-display font-bold leading-none" style={{ fontSize: big ? 120 : size === 'md' ? 56 : 40 }}>
        {a.letter}<span style={{ fontSize: '0.55em', opacity: 0.7 }}>{a.letter.toLowerCase()}</span>
      </span>
      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.span key="art" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }}>
            <Art name={a.art} size={big ? 170 : size === 'md' ? 84 : 64} />
          </motion.span>
        ) : (
          <motion.span key="q" className="grid place-items-center rounded-full font-display font-bold" style={{ width: big ? 170 : 84, height: big ? 170 : 84, background: 'var(--surface)', border: 'var(--bw) dashed var(--line)', fontSize: big ? 80 : 40, color: 'var(--muted)' }}>?</motion.span>
        )}
      </AnimatePresence>
      <span className="font-display font-semibold" style={{ fontSize: big ? 34 : 18, visibility: revealed ? 'visible' : 'hidden' }}>{a.word}</span>
    </>
  );
  const cls = 'panel flex flex-col items-center justify-center gap-2 p-4 text-center';
  const style = { background: toneSoft(a.color), minHeight: big ? 360 : undefined };
  return onClick ? (
    <motion.button type="button" className={cls} style={style} onClick={onClick} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} aria-label={`${a.letter} is for ${a.word}`}>{inner}</motion.button>
  ) : (
    <div className={cls} style={style}>{inner}</div>
  );
}

function Gallery() {
  const found = useStore((s) => s.lettersFound);
  const [open, setOpen] = useState<Entry | null>(null);
  const show = (a: Entry) => {
    setOpen(a);
    speak(`${LETTER_SAY[a.letter]}. ${LETTER_SAY[a.letter]} is for ${a.word}.`);
  };
  return (
    <section className="mt-6" aria-labelledby="cards-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cards-h" className="text-[26px]">Letter cards</h2>
        <span className="chip tnum">{found.length} of 26 found</span>
      </div>
      <p className="mt-1" style={{ color: 'var(--muted)' }}>Tap a card to hear it.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {ALPHABET.map((a) => <AlphaCard key={a.letter} a={a} size="sm" onClick={() => show(a)} />)}
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} label={open ? `${open.letter} is for ${open.word}` : 'Letter'}>
        {open && (
          <div className="flex flex-col items-center gap-4">
            <AlphaCard a={open} size="lg" />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="font-bold">The matching key:</span>
              <span className="kcap" data-kind="letter" style={{ width: 64, height: 64, fontSize: 34, cursor: 'default' }}>{open.letter}</span>
              <span style={{ color: 'var(--muted)' }}>{rowHint(`Key${open.letter}`)}</span>
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
              <button type="button" className="btn btn-sun" onClick={() => speak(`${LETTER_SAY[open.letter]}. ${LETTER_SAY[open.letter]} is for ${open.word}.`)}><Volume2 size={22} aria-hidden /> Hear it</button>
              <button type="button" className="btn" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export function Alphabet({ level }: { level: number | null }) {
  const round = useRound('alphabet', level);
  const list = useMemo(() => {
    const set = round.level === 1 ? ALPHABET.slice(0, 13) : round.level === 2 ? ALPHABET.slice(13) : shuffle(ALPHABET).slice(0, 13);
    return shuffle(set);
  }, [round.roundId, round.level]); // eslint-disable-line react-hooks/exhaustive-deps
  const [q, setQ] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tries, setTries] = useState(0);
  const [mood, setMood] = useState<Mood>('thinking');
  const [line, setLine] = useState({ text: '', say: '' });
  const [burst, setBurst] = useState(0);
  const [stars, setStars] = useState(0);
  const [good, setGood] = useState<string | null>(null);
  const busy = useRef(false);
  const askedAt = useRef(0);
  const a = list[q];

  useEffect(() => {
    setQ(0);
    setStars(0);
  }, [round.roundId]);
  useEffect(() => {
    if (round.phase !== 'play' || !a) return;
    setRevealed(false);
    setTries(0);
    setGood(null);
    setMood('thinking');
    setLine({ text: `Press the letter ${a.letter}!`, say: `Press the letter ${LETTER_SAY[a.letter]}!` });
    busy.current = false;
    askedAt.current = performance.now();
  }, [q, a, round.phase, round.roundId]);

  useKeys((p) => {
    if (busy.current || !a) return;
    const id = `Key${a.letter}`;
    if (p.source === 'physical') sfx.key(p.id);
    if (p.id === id) {
      busy.current = true;
      round.hit(id, performance.now() - askedAt.current);
      actions.letterFound(a.letter);
      if (tries === 0) {
        actions.addStars(1);
        setStars((s) => s + 1);
        setBurst(Date.now());
      }
      sfx.correct();
      setRevealed(true);
      setGood(id);
      setMood('excited');
      const wow = pickOne(PRAISE);
      setLine({ text: `${wow} ${a.letter} is for ${a.word}!`, say: `${wow} ${LETTER_SAY[a.letter]}. ${LETTER_SAY[a.letter]} is for ${a.word}!` });
      window.setTimeout(() => {
        if (q + 1 >= list.length) round.finish();
        else setQ(q + 1);
      }, 1900);
    } else if (KEYS[p.id]) {
      if (tries === 0) round.miss(id);
      sfx.wrong();
      setTries((t) => t + 1);
      setMood('oops');
      const k = KEYS[p.id];
      setLine({ text: `That is ${k.kind === 'letter' ? k.label : k.name.replace(/^the /, '')}. ${pickOne(ENCOURAGE)} Find ${a.letter}, ${rowHint(id)}.`, say: `That is ${k.kind === 'letter' ? LETTER_SAY[k.label] : k.name}. ${pickOne(ENCOURAGE)} Find ${LETTER_SAY[a.letter]}.` });
    }
  }, round.phase === 'play' && !round.paused);

  return (
    <Frame round={round} wide hud={<StarPill n={stars} label="stars this round" />} readyBelow={<Gallery />}>
      <TargetMark id={a ? `Key${a.letter}` : null} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Bot text={line.text} say={line.say} mood={mood} size={100} className="panel p-4" />
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>{Math.min(q + 1, list.length)} / {list.length}</span>
            <ProgressBar pct={(q / list.length) * 100} color="pink" label="Letters done" />
          </div>
        </div>
        <div className="relative">
          {a && (
            <motion.div key={`${q}-${round.roundId}`} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
              <AlphaCard a={a} revealed={revealed} size="lg" />
            </motion.div>
          )}
          <StarBurst fire={burst} />
          {revealed && a && tries === 0 && (
            <span className="sticker absolute right-3 top-3" style={{ background: tone(a.color), color: '#1d1a38' }}>+1 star</span>
          )}
        </div>
      </div>
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout="auto" hint={a && (tries >= 2 || (round.hints && tries >= 1)) ? `Key${a.letter}` : null} good={good} />
      </section>
    </Frame>
  );
}
