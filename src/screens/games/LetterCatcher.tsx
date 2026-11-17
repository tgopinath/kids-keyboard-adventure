import { AnimatePresence, motion } from 'framer-motion';
import { Rabbit, Snail, Turtle } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Frame, useRound } from '../../components/Frame';
import { VirtualKeyboard } from '../../components/VirtualKeyboard';
import { ProgressBar, TargetMark } from '../../components/ui';
import { KeyBot } from '../../components/KeyBot';
import { LETTER_IDS, LETTER_SAY } from '../../lib/keys';
import { PRAISE, pickOne } from '../../lib/content';
import { actions } from '../../lib/store';
import { useKeys } from '../../lib/input';
import { useLoop } from '../../lib/loop';
import { sfx, speak } from '../../lib/audio';
import { BRIGHTS, Score, Stage, useStageHeight } from './shared';

const LEVELS = [
  { lanes: 1, spawn: 1.6, mult: 1 },
  { lanes: 2, spawn: 1.3, mult: 1.1 },
  { lanes: 3, spawn: 1.1, mult: 1.2 },
  { lanes: 3, spawn: 0.85, mult: 1.35 },
  { lanes: 3, spawn: 0.65, mult: 1.55 },
];
const SPEEDS = { slow: { px: 70, name: 'Slow', icon: Snail }, medium: { px: 110, name: 'Medium', icon: Turtle }, fast: { px: 160, name: 'Fast', icon: Rabbit } };
type Speed = keyof typeof SPEEDS;
const TARGETS = 10;

interface Runner { id: number; key: string; lane: number; x: number; color: string }
const L = (id: string) => id.replace('Key', '');

export function LetterCatcher({ level }: { level: number | null }) {
  const round = useRound('catcher', level);
  const cfg = LEVELS[round.level - 1] ?? LEVELS[0];
  const [speed, setSpeed] = useState<Speed>(() => {
    try { return (localStorage.getItem('kka-catcher-speed') as Speed) || 'medium'; } catch { return 'medium'; }
  });
  const H = useStageHeight(360, 520);
  const stage = useRef<HTMLDivElement>(null);
  const width = useRef(800);
  const runners = useRef<Runner[]>([]);
  const [, setFrame] = useState(0);
  const [target, setTarget] = useState(LETTER_IDS[0]);
  const targetRef = useRef(target);
  const [done, setDone] = useState(0);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ id: number; text: string; good: boolean } | null>(null);
  const spawnIn = useRef(0);
  const nextId = useRef(1);
  const stats = useRef({ caught: 0, escaped: 0, wrong: 0, score: 0, done: 0 });
  const ended = useRef(false);
  const askedAt = useRef(0);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => (width.current = e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  });

  const newTarget = () => {
    const t = LETTER_IDS[Math.floor(Math.random() * LETTER_IDS.length)];
    setTarget(t);
    targetRef.current = t;
    askedAt.current = performance.now();
    speak(`Catch ${LETTER_SAY[L(t)]}!`);
  };
  useEffect(() => {
    if (round.phase !== 'play') return;
    runners.current = [];
    stats.current = { caught: 0, escaped: 0, wrong: 0, score: 0, done: 0 };
    ended.current = false;
    spawnIn.current = 0;
    setDone(0);
    setScore(0);
    newTarget();
  }, [round.roundId, round.phase === 'play']); // eslint-disable-line react-hooks/exhaustive-deps

  const step = () => {
    stats.current.done++;
    setDone(stats.current.done);
    if (stats.current.done >= TARGETS) {
      ended.current = true;
      window.setTimeout(() => round.finish({ correct: stats.current.caught, wrong: stats.current.escaped + stats.current.wrong, score: stats.current.score }), 400);
    } else newTarget();
  };

  const running = round.phase === 'play' && !round.paused;
  useLoop((dt) => {
    if (ended.current) return;
    const px = SPEEDS[speed].px * cfg.mult;
    spawnIn.current -= dt;
    if (spawnIn.current <= 0) {
      const t = targetRef.current;
      const hasTarget = runners.current.some((r) => r.key === t);
      const key = !hasTarget && Math.random() < 0.55 ? t : LETTER_IDS[Math.floor(Math.random() * LETTER_IDS.length)];
      const lane = Math.floor(Math.random() * cfg.lanes);
      if (!runners.current.some((r) => r.lane === lane && r.x < 70)) {
        runners.current.push({ id: nextId.current++, key, lane, x: -64, color: BRIGHTS[nextId.current % BRIGHTS.length] });
      }
      spawnIn.current = cfg.spawn * (110 / px);
    }
    let escapedTarget = false;
    runners.current = runners.current.filter((r) => {
      r.x += px * dt;
      if (r.x > width.current) {
        if (r.key === targetRef.current) escapedTarget = true;
        return false;
      }
      return true;
    });
    if (escapedTarget) {
      stats.current.escaped++;
      actions.keyResult(targetRef.current, false);
      sfx.wrong();
      setFlash({ id: Date.now(), text: `${L(targetRef.current)} got away!`, good: false });
      step();
    }
    setFrame((f) => f + 1);
  }, running);

  useKeys((p) => {
    if (ended.current || p.id === 'Escape') return;
    if (p.source === 'physical') sfx.key(p.id);
    const t = targetRef.current;
    if (p.id === t) {
      const r = runners.current.filter((x) => x.key === t).sort((a, b) => b.x - a.x)[0];
      if (r) {
        runners.current = runners.current.filter((x) => x !== r);
        stats.current.caught++;
        const ms = performance.now() - askedAt.current;
        actions.keyResult(t, true, ms);
        actions.addStars(1);
        const add = 10 + (ms < 3000 ? 5 : 0);
        stats.current.score += add;
        setScore(stats.current.score);
        sfx.correct();
        setFlash({ id: Date.now(), text: pickOne(PRAISE), good: true });
        step();
      } else {
        setFlash({ id: Date.now(), text: `Wait for ${L(t)} to come!`, good: false });
      }
    } else if (p.id.startsWith('Key')) {
      stats.current.wrong++;
      actions.keyResult(t, false);
      sfx.wrong();
      setFlash({ id: Date.now(), text: `That is ${L(p.id)}. Catch ${L(t)}!`, good: false });
    }
  }, running);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 1200);
    return () => window.clearTimeout(t);
  }, [flash]);

  const laneH = (H - 40) / cfg.lanes;
  const speedPicker = (
    <div className="mt-5">
      <p className="mb-2 text-center font-bold">How fast?</p>
      <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Speed">
        {(Object.keys(SPEEDS) as Speed[]).map((s) => {
          const I = SPEEDS[s].icon;
          return (
            <button key={s} type="button" role="radio" aria-checked={speed === s} className="btn btn-sm" style={speed === s ? { background: 'var(--primary-soft)', borderColor: 'var(--primary)', color: 'var(--primary-strong)' } : undefined}
              onClick={() => { setSpeed(s); try { localStorage.setItem('kka-catcher-speed', s); } catch { /* ignore */ } }}>
              <I size={20} aria-hidden /> {SPEEDS[s].name}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Frame round={round} wide hud={<Score n={score} />} introExtra={speedPicker}>
      <TargetMark id={target} />
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="toy flex items-center gap-3 px-3 py-2" aria-live="polite">
          <KeyBot size={36} mood="thinking" still />
          <span className="text-[16px] font-bold">Catch</span>
          <span className="kcap" data-kind="letter" style={{ width: 56, height: 56, fontSize: 32, cursor: 'default' }} aria-label={`the letter ${L(target)}`}>{L(target)}</span>
        </div>
        <div className="flex min-w-[200px] flex-1 items-center gap-3">
          <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>{done} / {TARGETS}</span>
          <ProgressBar pct={(done / TARGETS) * 100} label="Letters to catch" />
        </div>
        <span className="chip">{SPEEDS[speed].name}</span>
      </div>
      <div ref={stage}>
        <Stage height={H} label="Letter lanes">
          {Array.from({ length: cfg.lanes }, (_, i) => (
            <div key={i} className="absolute inset-x-0" style={{ top: 20 + i * laneH + laneH / 2 + 26, height: 6, background: 'rgba(29,26,56,.15)' }} aria-hidden />
          ))}
          <div className="absolute inset-y-0 right-0 w-3" style={{ background: 'repeating-linear-gradient(0deg, #1d1a38 0 12px, #fff 12px 24px)', opacity: 0.6 }} aria-hidden />
          {runners.current.map((r) => (
            <div key={r.id} className="absolute left-0" style={{ top: 20 + r.lane * laneH + laneH / 2 - 30, transform: `translateX(${r.x}px)` }}>
              <span className="kcap" data-kind="letter" style={{ width: 60, height: 60, fontSize: 32, cursor: 'default', background: r.key === target && round.hints ? 'var(--sun)' : r.color }}>{L(r.key)}</span>
            </div>
          ))}
          <AnimatePresence>
            {flash && (
              <motion.div key={flash.id} className="toy absolute left-1/2 top-4 px-4 py-2 text-[16px] font-bold" style={{ color: flash.good ? 'var(--good)' : 'var(--oops)', boxShadow: 'var(--elev-2)' }} initial={{ x: '-50%', y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {flash.text}
              </motion.div>
            )}
          </AnimatePresence>
        </Stage>
      </div>
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout="letters" glow={round.hints ? [target] : []} />
      </section>
    </Frame>
  );
}
