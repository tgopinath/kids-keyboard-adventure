import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Frame, useRound } from '../../components/Frame';
import { VirtualKeyboard } from '../../components/VirtualKeyboard';
import { ProgressBar, TargetMark } from '../../components/ui';
import { HOME_ROW, LETTER_IDS, TOP_ROW } from '../../lib/keys';
import { useKeys } from '../../lib/input';
import { useLoop } from '../../lib/loop';
import { sfx } from '../../lib/audio';
import { BRIGHTS, Lives, ParaLetter, Score, Stage, useStageHeight } from './shared';

const LEVELS = [
  { pool: HOME_ROW, speed: 60, every: 1.9, goal: 12 },
  { pool: [...HOME_ROW, ...TOP_ROW], speed: 75, every: 1.7, goal: 15 },
  { pool: LETTER_IDS, speed: 90, every: 1.5, goal: 18 },
  { pool: LETTER_IDS, speed: 115, every: 1.2, goal: 20 },
  { pool: LETTER_IDS, speed: 140, every: 1.0, goal: 24 },
];
const LIVES = 5;

interface Drop { id: number; key: string; x: number; y: number; color: string }
interface Pop { id: number; x: number; y: number; color: string; kind: 'pop' | 'land' }

export function FallingLetters({ level }: { level: number | null }) {
  const round = useRound('falling', level);
  const cfg = LEVELS[round.level - 1] ?? LEVELS[0];
  const H = useStageHeight(420);
  const drops = useRef<Drop[]>([]);
  const [, setFrame] = useState(0);
  const [pops, setPops] = useState<Pop[]>([]);
  const [cleared, setCleared] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const spawnIn = useRef(0.4);
  const nextId = useRef(1);
  const stats = useRef({ cleared: 0, landed: 0, wrong: 0, score: 0 });
  const ended = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    drops.current = [];
    stats.current = { cleared: 0, landed: 0, wrong: 0, score: 0 };
    ended.current = false;
    spawnIn.current = 0.4;
    setCleared(0);
    setLives(LIVES);
    setScore(0);
    setCombo(0);
    setPops([]);
  }, [round.roundId]);

  const end = () => {
    if (ended.current) return;
    ended.current = true;
    const s = stats.current;
    round.finish({ correct: s.cleared, wrong: s.landed + s.wrong, score: s.score });
  };

  const running = round.phase === 'play' && !round.paused;
  useLoop((dt) => {
    if (ended.current) return;
    const ramp = 1 + stats.current.cleared * 0.02;
    spawnIn.current -= dt;
    const onScreen = drops.current.length;
    if (spawnIn.current <= 0 && onScreen < 6) {
      const key = cfg.pool[Math.floor(Math.random() * cfg.pool.length)];
      drops.current.push({ id: nextId.current++, key, x: 6 + Math.random() * 82, y: -90, color: BRIGHTS[nextId.current % BRIGHTS.length] });
      spawnIn.current = cfg.every / ramp;
    }
    const landed: Drop[] = [];
    drops.current = drops.current.filter((d) => {
      d.y += cfg.speed * ramp * dt;
      if (d.y > H - 92) {
        landed.push(d);
        return false;
      }
      return true;
    });
    if (landed.length) {
      stats.current.landed += landed.length;
      landed.forEach((d) => {
        sfx.wrong();
        setPops((p) => [...p, { id: d.id, x: d.x, y: H - 60, color: d.color, kind: 'land' }]);
      });
      setCombo(0);
      setLives((l) => {
        const n = l - landed.length;
        if (n <= 0) window.setTimeout(end, 50);
        return Math.max(0, n);
      });
    }
    setFrame((f) => f + 1);
  }, running);

  useKeys((p) => {
    if (ended.current) return;
    if (p.source === 'physical') sfx.key(p.id);
    // remove the lowest matching letter
    const match = drops.current.filter((d) => d.key === p.id).sort((a, b) => b.y - a.y)[0];
    if (match) {
      drops.current = drops.current.filter((d) => d !== match);
      stats.current.cleared++;
      const c = combo + 1;
      const add = 10 + Math.min(10, c) * 2;
      stats.current.score += add;
      setScore(stats.current.score);
      setCombo(c);
      setCleared(stats.current.cleared);
      sfx.pop();
      setPops((ps) => [...ps, { id: match.id, x: match.x, y: match.y, color: match.color, kind: 'pop' }]);
      if (stats.current.cleared >= cfg.goal) window.setTimeout(end, 300);
    } else if (p.id.startsWith('Key')) {
      stats.current.wrong++;
      setCombo(0);
      sfx.wrong();
      stageRef.current?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 220 });
    }
  }, running);

  useEffect(() => {
    if (!pops.length) return;
    const t = window.setTimeout(() => setPops((p) => p.slice(1)), 600);
    return () => window.clearTimeout(t);
  }, [pops]);

  const lowest = [...drops.current].sort((a, b) => b.y - a.y)[0];
  const showHint = round.hints || round.level <= 1;

  return (
    <Frame round={round} wide hud={<><Score n={score} /><Lives left={lives} of={LIVES} /></>}>
      <div className="mb-3 flex items-center gap-3">
        <span className="whitespace-nowrap text-[15px] font-bold tnum" style={{ color: 'var(--muted)' }}>{cleared} / {cfg.goal}</span>
        <ProgressBar pct={(cleared / cfg.goal) * 100} color="sky" label="Letters caught" />
        {combo >= 3 && <span className="sticker" style={{ background: 'var(--pink)', color: '#1d1a38' }}>Combo x{combo}</span>}
      </div>
      <div ref={stageRef}>
        <Stage height={H} label="Falling letters">
          {drops.current.map((d) => (
            <div key={d.id} className="absolute" style={{ left: `${d.x}%`, top: 0, transform: `translate(-50%, ${d.y}px)` }}>
              <ParaLetter ch={d.key.replace('Key', '')} color={d.color} />
            </div>
          ))}
          <AnimatePresence>
            {pops.map((p) => (
              <motion.span key={`p${p.id}`} className="pointer-events-none absolute grid place-items-center font-display text-[22px] font-bold" style={{ left: `${p.x}%`, top: p.y + 40, color: p.kind === 'pop' ? '#1d1a38' : '#7a2a2a' }}
                initial={{ scale: 0.5, opacity: 1, x: '-50%' }} animate={{ scale: 1.8, opacity: 0, y: p.kind === 'pop' ? -30 : 0 }} transition={{ duration: 0.55 }} aria-hidden>
                {p.kind === 'pop' ? (
                  <svg width="70" height="70" viewBox="0 0 70 70">{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M35 35 L${35 + 30 * Math.cos((i * Math.PI) / 4)} ${35 + 30 * Math.sin((i * Math.PI) / 4)}`} stroke={p.color} strokeWidth={6} strokeLinecap="round" />)}</svg>
                ) : 'Bump!'}
              </motion.span>
            ))}
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 h-10" style={{ background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 20px, transparent 20px 40px)' }} aria-hidden />
        </Stage>
      </div>
      <p className="sr-only" aria-live="polite">{lowest ? `Falling: ${lowest.key.replace('Key', '')}` : ''}</p>
      <TargetMark id={lowest?.key} />
      <section className="panel mt-4 p-3 sm:p-5">
        <VirtualKeyboard layout="letters" glow={showHint && lowest ? [lowest.key] : []} />
      </section>
    </Frame>
  );
}
