import { Check, ChevronRight, Flame, Gamepad2, Gift, Keyboard, Map, Play, Settings, ShieldCheck, Sparkles, TrendingUp, Type } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Art } from '../components/Art';
import { Bot, Chest, CoinPill, Confetti, Modal, ProgressBar, StarPill } from '../components/ui';
import { ACTIVITIES, PATH, routeFor } from '../lib/activities';
import { DAILY_REWARD, dailyFor, levelFromStars } from '../lib/rewards';
import { actions, nextLesson, useStore } from '../lib/store';
import { go } from '../lib/router';
import { sfx, speak } from '../lib/audio';
import { useMedia } from '../lib/useMedia';

export const AVATARS = ['cat', 'dog', 'fish', 'elephant', 'zebra', 'rocket', 'star', 'sun'];

export function Avatar({ i, size = 44 }: { i: number; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full" style={{ width: size, height: size, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <Art name={AVATARS[i % 8]} size={size * 0.74} />
    </span>
  );
}

function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const p = useStore((s) => s.profile);
  const [name, setName] = useState(p.name);
  return (
    <Modal open={open} onClose={onClose} label="Choose your picture">
      <h2 className="text-[22px]">Who is playing?</h2>
      <p className="mt-1" style={{ color: 'var(--muted)' }}>Pick a picture. A grown-up can type a name too.</p>
      <div className="mt-4 grid grid-cols-4 gap-3" role="radiogroup" aria-label="Pictures">
        {AVATARS.map((a, i) => (
          <button key={a} type="button" role="radio" aria-checked={p.avatar === i} aria-label={a} onClick={() => { actions.profile({ avatar: i }); sfx.pop(); }}
            className="grid place-items-center rounded-full p-1" style={{ outline: p.avatar === i ? '4px solid var(--primary)' : 'none', outlineOffset: 2 }}>
            <Avatar i={i} size={64} />
          </button>
        ))}
      </div>
      <label className="mt-5 block font-bold" htmlFor="kid-name">Name (optional)</label>
      <input id="kid-name" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} autoComplete="off"
        className="mt-2 h-12 w-full rounded-xl px-4 text-[17px]" style={{ border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--ink)' }} />
      <p className="mt-2 text-[14px]" style={{ color: 'var(--muted)' }}>Saved only on this device.</p>
      <button type="button" className="btn btn-primary mt-5 w-full" onClick={() => { actions.profile({ name: name.trim() }); onClose(); }}>Done</button>
    </Modal>
  );
}

function Tile({ title, sub, icon, to }: { title: string; sub: string; icon: ReactNode; to: string }) {
  return (
    <button type="button" onClick={() => go(to)} className="panel flex min-h-[84px] items-center gap-3 p-4 text-left transition-colors hover:border-[var(--border-strong)]" aria-label={`${title}. ${sub}`}>
      <span className="icon-tile" aria-hidden>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-snug">{title}</span>
        <span className="block text-[14px] muted">{sub}</span>
      </span>
      <ChevronRight size={18} className="muted shrink-0" aria-hidden />
    </button>
  );
}

function Daily() {
  const daily = useStore((s) => s.daily);
  const defs = dailyFor(daily.date);
  const [chest, setChest] = useState(false);
  const [fire, setFire] = useState(0);
  const claim = (i: number) => {
    if (actions.claimDaily(i)) {
      setChest(true);
      sfx.chest();
      setFire(Date.now());
      speak(`You opened a treasure chest! ${DAILY_REWARD.coins} coins and ${DAILY_REWARD.stars} stars!`);
      actions.chestOpened();
    }
  };
  return (
    <section className="panel p-5" aria-labelledby="daily-h">
      <div className="flex items-center justify-between gap-3">
        <h2 id="daily-h" className="text-[18px]">Today's challenges</h2>
        <span className="text-[14px] muted">New every day</span>
      </div>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {defs.map((d, i) => {
          const p = daily.progress[i] ?? 0;
          const done = p >= d.goal;
          const claimed = daily.claimed[i];
          return (
            <li key={d.metric} className="toy flex flex-col gap-3 p-4">
              <span className="text-[15px] font-bold">{d.label}</span>
              <ProgressBar pct={(p / d.goal) * 100} color={done ? 'good' : 'primary'} label={`${d.label}: ${p} of ${d.goal}`} />
              {claimed ? (
                <span className="flex items-center gap-2 font-bold" style={{ color: 'var(--good)' }}><Check size={20} aria-hidden /> Treasure opened</span>
              ) : done ? (
                <button type="button" className="btn btn-sun btn-sm" onClick={() => claim(i)}><Gift size={20} aria-hidden /> Open treasure</button>
              ) : (
                <span className="tnum text-[15px] font-bold" style={{ color: 'var(--muted)' }}>{p} of {d.goal}</span>
              )}
            </li>
          );
        })}
      </ul>
      <Confetti fire={fire} />
      <Modal open={chest} onClose={() => setChest(false)} label="Treasure chest">
        <div className="flex flex-col items-center gap-3 text-center">
          <Chest open size={150} />
          <h2 className="text-[22px]">Treasure!</h2>
          <p className="text-[17px]">+{DAILY_REWARD.coins} coins and +{DAILY_REWARD.stars} stars</p>
          <button type="button" className="btn btn-primary mt-2 w-full" onClick={() => setChest(false)}>Yay!</button>
        </div>
      </Modal>
    </section>
  );
}

export function Home() {
  const s = useStore((st) => st);
  const lv = levelFromStars(s.stars);
  const next = nextLesson(s);
  const pct = Math.round((s.lessons.length / PATH.length) * 100);
  const [profile, setProfile] = useState(false);
  const small = useMedia('(max-width: 640px)');
  const hello = s.profile.name ? `Hi ${s.profile.name}! I'm KeyBot.` : "Hi! I'm KeyBot, your keyboard buddy.";
  const line = next ? `${hello} Tap Start learning when you are ready!` : `${hello} You finished every lesson! Play any game you like.`;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-12 sm:px-6">
      <header className="flex flex-wrap items-center gap-3 py-4">
        <button type="button" onClick={() => setProfile(true)} className="flex min-h-[44px] items-center gap-3 rounded-full pr-2" aria-label="Change your picture and name">
          <Avatar i={s.profile.avatar} />
          <span className="text-left">
            <span className="block text-[16px] font-bold leading-tight">{s.profile.name || 'Little typist'}</span>
            <span className="block text-[13px] muted">Level {lv.level}</span>
          </span>
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <StarPill n={s.stars} />
          <CoinPill n={s.coins} />
          <span className="chip tnum" aria-label={`${s.streak.count} day streak`}>
            <Flame size={16} stroke="var(--orange)" strokeWidth={2} aria-hidden /> {s.streak.count}
          </span>
          <button type="button" className="btn btn-icon btn-ghost" onClick={() => go('/settings')} aria-label="Settings: sound and display">
            <Settings size={20} aria-hidden />
          </button>
        </div>
      </header>

      <h1 className="mt-2 text-[26px] sm:text-[30px]">{s.profile.name ? `Hi ${s.profile.name}` : 'Kids Keyboard Adventure'}</h1>
      <p className="mt-1 muted">Learn the keyboard with KeyBot, one small step at a time.</p>

      <section className="mt-5 grid items-stretch gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="panel p-4 sm:p-5">
          <Bot text={line} mood="wave" size={small ? 52 : 60} />
        </div>
        <div className="panel flex flex-col gap-3 p-4 sm:p-5">
          <span className="flex items-center justify-between gap-3">
            <span className="eyebrow">{next ? `Next lesson · ${PATH.indexOf(next) + 1} of ${PATH.length}` : 'All lessons done'}</span>
            <span className="text-[14px] font-bold tnum muted">{pct}% done</span>
          </span>
          <span>
            <span className="block text-[20px] font-bold leading-snug">{next ? next.title : 'You finished the path'}</span>
            <span className="block text-[14px] muted">{next ? ACTIVITIES[next.activity].name : 'Replay any lesson from the path.'}</span>
          </span>
          <ProgressBar pct={pct} label="Lessons completed" />
          <span className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-primary" onClick={() => go(next ? routeFor(next.activity, next.level) : '/path')} aria-label={next ? `Start learning: lesson ${PATH.indexOf(next) + 1}, ${next.title}` : 'See all lessons'}>
              <Play size={18} fill="currentColor" aria-hidden /> Start learning
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => go('/path')}>All lessons</button>
          </span>
        </div>
      </section>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Level', String(lv.level)],
          ['Stars', String(s.stars)],
          ['Lessons done', `${s.lessons.length} / ${PATH.length}`],
          ['Day streak', String(s.streak.count)],
        ].map(([k, v]) => (
          <div key={k} className="panel px-4 py-3">
            <dt className="text-[13px] muted">{k}</dt>
            <dd className="m-0 text-[22px] font-bold tnum">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 text-[18px]">Places to play</h2>
      <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Places to play">
        <Tile title="Learn the keyboard" sub="Meet, find and remember keys" to="/learn" icon={<Keyboard size={20} aria-hidden />} />
        <Tile title="Typing games" sub="Five games to play" to="/games" icon={<Gamepad2 size={20} aria-hidden />} />
        <Tile title="Word adventure" sub="Build words, island by island" to="/words" icon={<Map size={20} aria-hidden />} />
        <Tile title="Typing challenge" sub="Letters, words, sentences" to="/practice" icon={<Type size={20} aria-hidden />} />
        <Tile title="My rewards" sub="Badges, trophies, robot shop" to="/rewards" icon={<Sparkles size={20} aria-hidden />} />
        <Tile title="My progress" sub="See how you are growing" to="/progress" icon={<TrendingUp size={20} aria-hidden />} />
      </section>

      <div className="mt-8"><Daily /></div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[14px] muted">
          <ShieldCheck size={16} aria-hidden /> No sign-up, no ads, no tracking. Progress stays on this device.
        </p>
        <button type="button" className="btn btn-sm" onClick={() => go('/parents')}>For grown-ups</button>
      </footer>
      <ProfileModal open={profile} onClose={() => setProfile(false)} />
    </div>
  );
}
