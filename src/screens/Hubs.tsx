import { ChevronRight, Brain, Crosshair, Gem, Keyboard, CircleDot, Hash, BookA, CloudRain, MoveRight, Blocks, Route } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ACTIVITIES, GAME_IDS, LEARN_IDS, type ActivityId } from '../lib/activities';
import { useStore } from '../lib/store';
import { go } from '../lib/router';
import { Bot, Stars, TopBar } from '../components/ui';

const ICON: Record<ActivityId, LucideIcon> = {
  explore: Keyboard, find: Crosshair, alphabet: BookA, numbers: Hash, memory: Brain,
  falling: CloudRain, bubbles: CircleDot, catcher: MoveRight, builder: Blocks, treasure: Gem,
  words: Route, practice: Keyboard,
};

export function ActivityCard({ id }: { id: ActivityId; n?: number }) {
  const meta = ACTIVITIES[id];
  const a = useStore((s) => s.activities[id]);
  const I = ICON[id];
  const totalStars = Object.values(a.rating).reduce((x, y) => x + y, 0);
  return (
    <button type="button" onClick={() => go(meta.route)} className="panel flex min-h-[96px] items-center gap-3 p-4 text-left transition-colors hover:border-[var(--border-strong)]"
      aria-label={`${meta.name}. Level ${a.level} of ${meta.levels.length}. ${a.plays} plays.`}>
      <span className="icon-tile" aria-hidden><I size={20} strokeWidth={2} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-snug">{meta.name}</span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-[13px] muted">
          Level {a.level} of {meta.levels.length}
          <Stars n={Math.min(3, Math.round(totalStars / meta.levels.length))} size={14} />
        </span>
      </span>
      <ChevronRight size={18} className="muted shrink-0" aria-hidden />
    </button>
  );
}

function LinkCard({ title, sub, to }: { title: string; sub: string; to: string }) {
  return (
    <button type="button" onClick={() => go(to)} className="panel flex min-h-[96px] items-center gap-3 p-4 text-left transition-colors hover:border-[var(--border-strong)]">
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-snug">{title}</span>
        <span className="block text-[13px] muted">{sub}</span>
      </span>
      <ChevronRight size={18} className="muted shrink-0" aria-hidden />
    </button>
  );
}

export function LearnHub() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-12 sm:px-6">
      <TopBar title="Learn the Keyboard" parent="/" />
      <Bot text="Pick a way to learn. Start with Meet Your Keyboard if you are new!" mood="happy" />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LEARN_IDS.map((id, i) => <ActivityCard key={id} id={id} n={i + 1} />)}
        <LinkCard title="All lessons, in order" sub="From your first key to whole sentences" to="/path" />
      </div>
    </div>
  );
}

export function GamesHub() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-12 sm:px-6">
      <TopBar title="Typing Games" parent="/" />
      <Bot text="Five games! Each one gets faster as you get better." mood="happy" />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_IDS.map((id, i) => <ActivityCard key={id} id={id} n={i + 1} />)}
        <LinkCard title="Word adventure" sub="Sail between six islands of words" to="/words" />
      </div>
    </div>
  );
}
