import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Home, Lightbulb, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ACTIVITIES, PATH, type ActivityId } from '../lib/activities';
import { BADGES } from '../lib/rewards';
import { actions, useStore, type RoundOutcome } from '../lib/store';
import { useCapture, useKeys } from '../lib/input';
import { sfx, speak, stopSpeaking, unlockAudio } from '../lib/audio';
import { go } from '../lib/router';
import { Bot, Confetti, Modal, Stars, Toggle, TopBar, ICONS, LockBadge, tone, toneSoft } from './ui';
import { KeyBot } from './KeyBot';

export type Phase = 'ready' | 'play' | 'done';

export interface Round {
  activity: ActivityId;
  level: number;
  setLevel: (l: number) => void;
  phase: Phase;
  paused: boolean;
  pause: () => void;
  resume: () => void;
  start: () => void;
  restart: () => void;
  roundId: number;
  correct: number;
  wrong: number;
  hit: (keyId?: string, ms?: number) => void;
  miss: (keyId?: string) => void;
  finish: (extra?: { score?: number; wpm?: number; coinsBonus?: number; correct?: number; wrong?: number }) => RoundOutcome;
  outcome: RoundOutcome | null;
  hints: boolean;
  elapsed: () => number;
}

/** State for one round of an activity: level, phase, pause, score keeping and Smart Difficulty at the end. */
export function useRound(activity: ActivityId, initialLevel?: number | null): Round {
  const a = useStore((s) => s.activities[activity]);
  const [level, setLevelState] = useState(() => Math.min(initialLevel ?? a.level, a.unlocked) || 1);
  const [phase, setPhase] = useState<Phase>('ready');
  const [paused, setPaused] = useState(false);
  const [roundId, setRoundId] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);
  const counts = useRef({ c: 0, w: 0 });
  const t0 = useRef(0);
  const pausedAt = useRef(0);
  const pausedMs = useRef(0);

  const reset = () => {
    counts.current = { c: 0, w: 0 };
    setCorrect(0);
    setWrong(0);
    setOutcome(null);
    pausedMs.current = 0;
    t0.current = performance.now();
    setRoundId((r) => r + 1);
  };
  const start = () => {
    unlockAudio();
    reset();
    setPaused(false);
    setPhase('play');
  };
  return {
    activity,
    level,
    setLevel: (l) => {
      if (l <= a.unlocked) {
        setLevelState(l);
        actions.setLevel(activity, l);
      }
    },
    phase,
    paused,
    pause: () => {
      if (phase !== 'play' || paused) return;
      pausedAt.current = performance.now();
      stopSpeaking();
      setPaused(true);
    },
    resume: () => {
      pausedMs.current += performance.now() - pausedAt.current;
      setPaused(false);
    },
    start,
    restart: start,
    roundId,
    correct,
    wrong,
    hit: (keyId, ms) => {
      counts.current.c++;
      setCorrect(counts.current.c);
      if (keyId) actions.keyResult(keyId, true, ms);
    },
    miss: (keyId) => {
      counts.current.w++;
      setWrong(counts.current.w);
      if (keyId) actions.keyResult(keyId, false);
    },
    finish: (extra = {}) => {
      const o = actions.finishRound({
        activity, level,
        correct: extra.correct ?? counts.current.c,
        wrong: extra.wrong ?? counts.current.w,
        score: extra.score, wpm: extra.wpm, coinsBonus: extra.coinsBonus,
        durMs: performance.now() - t0.current - pausedMs.current,
      });
      setOutcome(o);
      setPhase('done');
      if (o.passed) sfx.celebrate();
      return o;
    },
    outcome,
    hints: a.hints,
    elapsed: () => performance.now() - t0.current - pausedMs.current,
  };
}

export function LevelPicker({ activity, level, onPick }: { activity: ActivityId; level: number; onPick: (l: number) => void }) {
  const a = useStore((s) => s.activities[activity]);
  const meta = ACTIVITIES[activity];
  return (
    <div role="radiogroup" aria-label="Choose a level" className="flex flex-wrap justify-center gap-2">
      {meta.levels.map((name, i) => {
        const l = i + 1;
        const locked = l > a.unlocked;
        const sel = l === level;
        return (
          <button key={l} type="button" role="radio" aria-checked={sel} disabled={locked} onClick={() => onPick(l)}
            className="flex min-h-[64px] min-w-[120px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[15px] font-bold"
            style={{ border: 'var(--bw) solid var(--line)', boxShadow: sel ? '0 2px 0 var(--shadow)' : '0 4px 0 var(--shadow)', background: sel ? tone(meta.color) : locked ? 'var(--surface-2)' : 'var(--surface)', color: sel ? '#1d1a38' : 'var(--ink)', opacity: locked ? 0.6 : 1, transform: sel ? 'translateY(2px)' : undefined }}
            aria-label={`Level ${l}: ${name}${locked ? ', locked' : ''}`}>
            <span className="flex items-center gap-1 font-display text-[17px]">{locked ? <LockBadge /> : null} Level {l}</span>
            <span className="max-w-[150px] text-center text-[13px] leading-tight" style={{ opacity: 0.85 }}>{name}</span>
            {!locked && <Stars n={a.rating[l] ?? 0} size={14} />}
          </button>
        );
      })}
    </div>
  );
}

function PauseMenu({ open, onResume, onRestart, onExit }: { open: boolean; onResume: () => void; onRestart: () => void; onExit: () => void }) {
  const st = useStore((s) => s.settings);
  return (
    <Modal open={open} onClose={onResume} label="Paused">
      <div className="flex flex-col items-center gap-3 text-center">
        <KeyBot mood="sleepy" size={96} />
        <h2 className="text-[30px]">Paused</h2>
        <p style={{ color: 'var(--muted)' }}>Take a little rest. Your game is waiting.</p>
      </div>
      <div className="mt-5 grid gap-3">
        <button type="button" className="btn btn-mint" data-autofocus onClick={onResume}><Play size={22} aria-hidden /> Keep playing</button>
        <button type="button" className="btn" onClick={onRestart}><RotateCcw size={22} aria-hidden /> Start again</button>
        <button type="button" className="btn" onClick={onExit}><Home size={22} aria-hidden /> Leave the game</button>
      </div>
      <div className="mt-5 grid gap-1 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
        <Toggle on={st.music} onChange={(v) => actions.settings({ music: v })} label="Music" />
        <Toggle on={st.sfx} onChange={(v) => actions.settings({ sfx: v })} label="Sound effects" />
        <Toggle on={st.voice} onChange={(v) => actions.settings({ voice: v })} label="KeyBot's voice" />
      </div>
    </Modal>
  );
}

const DECISION_LINE = {
  up: 'Wow, you are a star! Let us try something harder.',
  stay: 'Great work! Play this level again to get even better.',
  down: 'Good try! Let us practise an easier one, with hints.',
};

function ResultCard({ round, onExit, extra }: { round: Round; onExit: () => void; extra?: ReactNode }) {
  const o = round.outcome!;
  const meta = ACTIVITIES[round.activity];
  const [fire, setFire] = useState(0);
  useEffect(() => {
    if (o.passed) setFire(Date.now());
    speak(o.passed ? `${o.rating === 3 ? 'Perfect!' : 'Well done!'} ${DECISION_LINE[o.decision]}` : DECISION_LINE.down);
  }, [o]);
  const lesson = o.lessonDone ? PATH.find((l) => l.id === o.lessonDone) : null;
  return (
    <>
      <Confetti fire={fire} />
      <Modal open label="Round finished" onClose={undefined} wide>
        <div className="flex flex-col items-center gap-2 text-center">
          <KeyBot mood={o.passed ? 'excited' : 'oops'} size={110} />
          <h2 className="text-[32px]">{o.passed ? (o.rating === 3 ? 'Perfect!' : 'Well done!') : 'Good try!'}</h2>
          <Stars n={o.rating} size={40} />
          <p className="max-w-md text-[18px]" style={{ color: 'var(--muted)' }}>{DECISION_LINE[o.passed ? o.decision : 'down']}</p>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ['Right', `${o.accuracy}%`],
            o.score ? ['Score', String(o.score)] : ['Correct', String(o.correct)],
            ['Coins', `+${o.coins}`],
          ].map(([k, v], i) => (
            <div key={k} className="toy px-2 py-3" style={{ background: [toneSoft('mint'), toneSoft('sky'), toneSoft('sun')][i] }}>
              <dt className="eyebrow">{k}</dt>
              <dd className="m-0 font-display text-[28px] font-bold tnum">{v}</dd>
            </div>
          ))}
        </dl>
        {extra}
        {(o.newlyUnlocked || lesson || o.newBadges.length > 0) && (
          <ul className="mt-4 grid gap-2">
            {o.newlyUnlocked && (
              <li className="toy flex items-center gap-3 px-4 py-3" style={{ background: toneSoft('grape') }}>
                <span className="sticker" style={{ background: 'var(--grape)', color: '#fff' }}>New</span>
                Level {o.newlyUnlocked} is open: {meta.levels[o.newlyUnlocked - 1]}
              </li>
            )}
            {lesson && (
              <li className="toy flex items-center gap-3 px-4 py-3" style={{ background: toneSoft('mint') }}>
                <Check size={22} aria-hidden /> Lesson done: {lesson.title}
              </li>
            )}
            {o.newBadges.map((b) => {
              const bd = BADGES.find((x) => x.id === b)!;
              const I = ICONS[bd.icon];
              return (
                <li key={b} className="toy flex items-center gap-3 px-4 py-3" style={{ background: toneSoft(bd.color) }}>
                  <I size={24} aria-hidden /> New badge: <b>{bd.name}</b>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {o.passed && round.level < o.maxLevel && (
            <button type="button" className={`btn ${o.decision === 'up' ? 'btn-primary sm:col-span-2' : ''}`} data-autofocus={o.decision === 'up' ? true : undefined} onClick={() => { round.setLevel(round.level + 1); round.start(); }}>
              Next level <ArrowRight size={22} aria-hidden />
            </button>
          )}
          {!o.passed && round.level > 1 && (
            <button type="button" className="btn btn-sun sm:col-span-2" data-autofocus onClick={() => { round.setLevel(o.suggested); round.start(); }}>
              <Lightbulb size={22} aria-hidden /> Try an easier level
            </button>
          )}
          <button type="button" className={`btn ${o.decision === 'up' && o.passed && round.level < o.maxLevel ? '' : 'btn-mint'}`} data-autofocus={o.decision !== 'up' && !(!o.passed && round.level > 1) ? true : undefined} onClick={round.restart}>
            <RotateCcw size={22} aria-hidden /> Play again
          </button>
          <button type="button" className="btn" onClick={onExit}><Home size={22} aria-hidden /> Back</button>
        </div>
      </Modal>
    </>
  );
}

/**
 * Wraps every activity: intro card with the level picker, the play area, pause (Esc), and the result card.
 */
export function Frame({ round, title, children, hud, introText, introExtra, readyBelow, escapeIsAnswer = false, resultExtra, wide = false }: {
  round: Round; title?: string; children: ReactNode; hud?: ReactNode; introText?: string; introExtra?: ReactNode; readyBelow?: ReactNode; escapeIsAnswer?: boolean; resultExtra?: ReactNode; wide?: boolean;
}) {
  const meta = ACTIVITIES[round.activity];
  const playing = round.phase === 'play' && !round.paused;
  useCapture(playing);
  const escRef = useRef(escapeIsAnswer);
  escRef.current = escapeIsAnswer;
  useKeys((p) => {
    if (p.id === 'Escape' && !escRef.current) round.pause();
  }, playing);
  const exit = useCallback(() => go(meta.parent), [meta.parent]);
  const [showLevels, setShowLevels] = useState(false);

  return (
    <div className={`mx-auto w-full px-4 pb-10 sm:px-6 ${wide ? 'max-w-[1400px]' : 'max-w-[1200px]'}`}>
      <TopBar title={title ?? meta.name} parent={meta.parent} onPause={round.phase === 'play' ? round.pause : undefined}>
        {hud}
      </TopBar>
      {round.phase === 'ready' ? (
        <motion.section className="panel mx-auto mt-2 max-w-3xl p-5 sm:p-8" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} aria-label={`${meta.name} start`}>
          <Bot text={introText ?? meta.intro} mood="wave" size={110} />
          {introExtra}
          <div className="mt-6">
            <button type="button" className="mx-auto mb-3 flex items-center gap-2 font-display text-[18px] font-semibold" onClick={() => setShowLevels((v) => !v)} aria-expanded={showLevels}>
              Level {round.level}: {meta.levels[round.level - 1]} <ChevronDown size={20} style={{ transform: showLevels ? 'rotate(180deg)' : undefined }} aria-hidden />
            </button>
            {showLevels && <LevelPicker activity={round.activity} level={round.level} onPick={(l) => round.setLevel(l)} />}
          </div>
          <div className="mt-6 flex justify-center">
            <button type="button" className="btn btn-primary min-w-[220px] text-[24px]" style={{ minHeight: 68 }} onClick={round.start} autoFocus>
              <Play size={28} fill="currentColor" aria-hidden /> Play
            </button>
          </div>
          <p className="mt-4 text-center text-[14px]" style={{ color: 'var(--muted)' }}>
            Use a real keyboard or tap the keys on the screen. Press <kbd className="font-bold">Esc</kbd> to pause.
          </p>
        </motion.section>
      ) : null}
      {round.phase === 'ready' && readyBelow}
      {round.phase !== 'ready' ? (
        <div>{children}</div>
      ) : null}
      <PauseMenu open={round.paused} onResume={round.resume} onRestart={round.restart} onExit={exit} />
      {round.phase === 'done' && round.outcome && <ResultCard round={round} onExit={exit} extra={resultExtra} />}
    </div>
  );
}

