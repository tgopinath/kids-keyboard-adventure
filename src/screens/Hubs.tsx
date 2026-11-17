import { motion } from 'framer-motion';
import { Brain, Crosshair, Gem, Keyboard, CircleDot, Hash, BookA, CloudRain, MoveRight, Blocks, Route } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ACTIVITIES, GAME_IDS, LEARN_IDS, type ActivityId } from '../lib/activities';
import { useStore } from '../lib/store';
import { go } from '../lib/router';
import { Bot, Stars, TopBar, tone, toneSoft } from '../components/ui';

const ICON: Record<ActivityId, LucideIcon> = {
  explore: Keyboard, find: Crosshair, alphabet: BookA, numbers: Hash, memory: Brain,
  falling: CloudRain, bubbles: CircleDot, catcher: MoveRight, builder: Blocks, treasure: Gem,
  words: Route, practice: Keyboard,
};

export function ActivityCard({ id, n }: { id: ActivityId; n: number }) {
  const meta = ACTIVITIES[id];
  const a = useStore((s) => s.activities[id]);
  const I = ICON[id];
  const totalStars = Object.values(a.rating).reduce((x, y) => x + y, 0);
  return (
    <motion.button type="button" onClick={() => go(meta.route)} whileHover={{ y: -4 }} whileTap={{ y: 3, scale: 0.98 }}
      className="panel flex min-h-[200px] flex-col gap-3 p-5 text-left" style={{ background: toneSoft(meta.color) }}
      aria-label={`${meta.name}. Level ${a.level} of ${meta.levels.length}. ${a.plays} plays.`}>
      <span className="flex w-full items-start justify-between">
        <span className="sticker" style={{ background: tone(meta.color), color: '#1d1a38' }}>{String(n).padStart(2, '0')}</span>
        <span className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: 'var(--surface)', border: 'var(--bw) solid var(--line)', boxShadow: '0 4px 0 var(--shadow)', transform: 'rotate(-5deg)' }} aria-hidden>
          <I size={34} strokeWidth={2.4} />
        </span>
      </span>
      <span className="font-display text-[28px] font-bold leading-tight">{meta.name}</span>
      <span className="mt-auto flex flex-wrap items-center gap-2 text-[15px] font-bold" style={{ color: 'var(--muted)' }}>
        <span className="chip" style={{ minHeight: 32 }}>Level {a.level} of {meta.levels.length}</span>
        <Stars n={Math.min(3, Math.round(totalStars / meta.levels.length))} size={18} />
      </span>
    </motion.button>
  );
}

export function LearnHub() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <TopBar title="Learn the Keyboard" parent="/" />
      <Bot text="Pick a way to learn. Start with Meet Your Keyboard if you are new!" mood="happy" size={92} />
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEARN_IDS.map((id, i) => <ActivityCard key={id} id={id} n={i + 1} />)}
        <motion.button type="button" onClick={() => go('/path')} whileHover={{ y: -4 }} className="panel flex min-h-[200px] flex-col justify-between gap-3 p-5 text-left" style={{ background: 'var(--surface)' }}>
          <span className="sticker" style={{ background: 'var(--sun)', color: '#1d1a38' }}>Path</span>
          <span className="font-display text-[28px] font-bold leading-tight">All lessons, in order</span>
          <span className="font-bold" style={{ color: 'var(--muted)' }}>Follow the trail from your first key to whole sentences.</span>
        </motion.button>
      </div>
    </div>
  );
}

export function GamesHub() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <TopBar title="Typing Games" parent="/" />
      <Bot text="Five games! Each one gets faster as you get better." mood="excited" size={92} />
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_IDS.map((id, i) => <ActivityCard key={id} id={id} n={i + 1} />)}
        <motion.button type="button" onClick={() => go('/words')} whileHover={{ y: -4 }} className="panel flex min-h-[200px] flex-col justify-between gap-3 p-5 text-left" style={{ background: 'var(--mint-soft)' }}>
          <span className="sticker" style={{ background: 'var(--mint)', color: '#1d1a38' }}>Bonus</span>
          <span className="font-display text-[28px] font-bold leading-tight">Word Adventure</span>
          <span className="font-bold" style={{ color: 'var(--muted)' }}>Sail between six islands of words.</span>
        </motion.button>
      </div>
    </div>
  );
}
