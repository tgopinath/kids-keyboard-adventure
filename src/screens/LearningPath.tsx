import { motion } from 'framer-motion';
import { Check, Lock, Play } from 'lucide-react';
import { Bot, ProgressBar, Stars, TopBar, tone, toneSoft } from '../components/ui';
import { ACTIVITIES, PATH, routeFor } from '../lib/activities';
import { nextLesson, useStore } from '../lib/store';
import { go } from '../lib/router';

export function LearningPath() {
  const s = useStore((st) => st);
  const next = nextLesson(s);
  const pct = (s.lessons.length / PATH.length) * 100;
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 pb-12 sm:px-6">
      <TopBar title="Learning Path" parent="/" />
      <Bot text={next ? `Your next lesson is: ${next.title}. Tap it to play!` : 'You finished the whole path! You can replay any lesson.'} mood="happy" size={90} />
      <div className="panel mt-4 p-4">
        <div className="mb-2 flex justify-between font-bold"><span>Path complete</span><span className="tnum">{s.lessons.length} of {PATH.length}</span></div>
        <ProgressBar pct={pct} label="Path complete" />
      </div>
      <ol className="relative mt-6 grid gap-4" aria-label="Lessons">
        {PATH.map((l, i) => {
          const meta = ACTIVITIES[l.activity];
          const done = s.lessons.includes(l.id);
          const isNext = next?.id === l.id;
          const open = l.level <= s.activities[l.activity].unlocked;
          const shift = [0, 1, 2, 1][i % 4];
          return (
            <li key={l.id} style={{ marginLeft: `${shift * 9}%` }}>
              <motion.button type="button" disabled={!open} onClick={() => go(routeFor(l.activity, l.level))} whileHover={open ? { x: 4 } : undefined}
                className="toy flex w-full max-w-[560px] items-center gap-4 p-3 text-left" style={{ background: isNext ? toneSoft('sun') : done ? toneSoft('mint') : 'var(--surface)', opacity: open ? 1 : 0.6 }}
                aria-label={`Lesson ${i + 1}: ${l.title}. ${done ? 'Done' : open ? 'Open' : 'Locked'}`}>
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-[22px] font-bold" style={{ background: done ? 'var(--mint)' : isNext ? 'var(--sun)' : tone(meta.color), border: 'var(--bw) solid var(--line)', color: '#1d1a38' }}>
                  {done ? <Check size={26} strokeWidth={3} aria-hidden /> : !open ? <Lock size={22} aria-hidden /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[21px] font-bold leading-tight">{l.title}</span>
                  <span className="block text-[14px] font-bold" style={{ color: 'var(--muted)' }}>{meta.name} · Level {l.level}</span>
                </span>
                {done ? <Stars n={s.activities[l.activity].rating[l.level] ?? 0} size={18} /> : isNext ? <span className="btn btn-primary btn-sm" aria-hidden><Play size={18} fill="currentColor" /> Play</span> : null}
              </motion.button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
