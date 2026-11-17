import { motion } from 'framer-motion';
import { Check, Flame, Gamepad2, Gift, Keyboard, Map, Play, Settings, ShieldCheck, Sparkles, TrendingUp, Type } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { KeyBot } from '../components/KeyBot';
import { Art } from '../components/Art';
import { Bot, Chest, CoinPill, Confetti, Modal, ProgressBar, StarPill, tone, toneSoft } from '../components/ui';
import { ACTIVITIES, PATH, routeFor } from '../lib/activities';
import { DAILY_REWARD, dailyFor, levelFromStars } from '../lib/rewards';
import { actions, nextLesson, useStore } from '../lib/store';
import { go } from '../lib/router';
import { sfx, speak } from '../lib/audio';
import { useMedia } from '../lib/useMedia';

export const AVATARS = ['cat', 'dog', 'fish', 'elephant', 'zebra', 'rocket', 'star', 'sun'];
const AVATAR_BG = ['orange', 'sun', 'sky', 'grape', 'lime', 'coral', 'pink', 'mint'];

export function Avatar({ i, size = 56 }: { i: number; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full" style={{ width: size, height: size, background: toneSoft(AVATAR_BG[i % 8]), border: 'var(--bw) solid var(--line)', boxShadow: '0 3px 0 var(--shadow)' }}>
      <Art name={AVATARS[i % 8]} size={size * 0.78} />
    </span>
  );
}

function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const p = useStore((s) => s.profile);
  const [name, setName] = useState(p.name);
  return (
    <Modal open={open} onClose={onClose} label="Choose your picture">
      <h2 className="text-[28px]">Who is playing?</h2>
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
        className="mt-2 h-14 w-full rounded-2xl px-4 text-[20px]" style={{ border: 'var(--bw) solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }} />
      <p className="mt-2 text-[14px]" style={{ color: 'var(--muted)' }}>Saved only on this device.</p>
      <button type="button" className="btn btn-primary mt-5 w-full" onClick={() => { actions.profile({ name: name.trim() }); onClose(); }}>Done</button>
    </Modal>
  );
}

function Tile({ n, title, sub, color, icon, to, art }: { n: string; title: string; sub: string; color: string; icon: ReactNode; to: string; art?: ReactNode }) {
  return (
    <motion.button type="button" onClick={() => go(to)} whileHover={{ y: -4, rotate: -0.6 }} whileTap={{ y: 3, scale: 0.98 }}
      className="panel relative flex min-h-[176px] flex-col items-start overflow-hidden p-5 text-left sm:min-h-[200px]" style={{ background: toneSoft(color) }}
      aria-label={`${title}. ${sub}`} onFocus={() => undefined}>
      <span className="sticker" style={{ background: tone(color), color: '#1d1a38' }}>{n}</span>
      <span className="mt-3 font-display text-[26px] font-bold leading-[1.05] sm:text-[30px]">{title}</span>
      <span className="mt-1 text-[16px] font-bold" style={{ color: 'var(--muted)' }}>{sub}</span>
      <span className="absolute bottom-3 right-3 grid h-16 w-16 place-items-center rounded-2xl" style={{ background: 'var(--surface)', border: 'var(--bw) solid var(--line)', boxShadow: '0 4px 0 var(--shadow)', transform: 'rotate(6deg)' }} aria-hidden>
        {icon}
      </span>
      {art && <span className="pointer-events-none absolute -bottom-3 right-20 opacity-90" aria-hidden>{art}</span>}
    </motion.button>
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
        <h2 id="daily-h" className="text-[24px]">Today's challenges</h2>
        <span className="sticker" style={{ background: 'var(--pink)', color: '#1d1a38' }}>New every day</span>
      </div>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {defs.map((d, i) => {
          const p = daily.progress[i] ?? 0;
          const done = p >= d.goal;
          const claimed = daily.claimed[i];
          return (
            <li key={d.metric} className="toy flex flex-col gap-3 p-4" style={{ background: claimed ? toneSoft('mint') : 'var(--surface)' }}>
              <span className="font-display text-[19px] font-semibold">{d.label}</span>
              <ProgressBar pct={(p / d.goal) * 100} color={done ? 'mint' : 'sky'} label={`${d.label}: ${p} of ${d.goal}`} />
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
          <Chest open size={200} />
          <h2 className="text-[30px]">Treasure!</h2>
          <p className="text-[19px]">+{DAILY_REWARD.coins} coins and +{DAILY_REWARD.stars} stars</p>
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
  const line = next ? `${hello} Tap the big Play button to start learning!` : `${hello} You finished every lesson! Play any game you like.`;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <header className="flex flex-wrap items-center gap-3 py-4">
        <button type="button" onClick={() => setProfile(true)} className="flex items-center gap-3 rounded-full pr-2" aria-label="Change your picture and name">
          <Avatar i={s.profile.avatar} />
          <span className="text-left">
            <span className="block font-display text-[20px] font-bold leading-tight">{s.profile.name || 'Little typist'}</span>
            <span className="block text-[14px] font-bold" style={{ color: 'var(--muted)' }}>Level {lv.level}</span>
          </span>
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <StarPill n={s.stars} />
          <CoinPill n={s.coins} />
          <span className="chip tnum" aria-label={`${s.streak.count} day streak`} style={{ background: 'var(--coral-soft)' }}>
            <Flame size={18} fill="var(--orange)" stroke="var(--line)" strokeWidth={2.2} aria-hidden /> {s.streak.count}
          </span>
          <button type="button" className="btn btn-icon" onClick={() => go('/settings')} aria-label="Settings: sound and display">
            <Settings size={24} aria-hidden />
          </button>
        </div>
      </header>

      <h1 className="sr-only">Kids Keyboard Adventure</h1>
      <section className="grid items-stretch gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="panel relative overflow-hidden p-5 sm:p-7" style={{ background: 'linear-gradient(135deg, var(--primary-soft), var(--sky-soft))' }}>
          <p className="font-display text-[34px] font-bold uppercase leading-[0.95] tracking-tight sm:text-[56px]">
            Keyboard<br />
            <span className="inline-block -rotate-2 rounded-2xl px-3" style={{ background: 'var(--sun)', color: '#1d1a38', border: 'var(--bw) solid var(--line)', boxShadow: '0 5px 0 var(--shadow)' }}>Adventure</span>
          </p>
          <div className="mt-4 sm:mt-6"><Bot text={line} mood="wave" size={small ? 76 : 104} /></div>
        </div>
        <div className="panel flex flex-col justify-between gap-4 p-5 text-left sm:p-7" style={{ background: 'var(--sun-soft)' }}>
          <span className="flex items-center justify-between gap-3">
            <span className="sticker" style={{ background: 'var(--sun)', color: '#1d1a38' }}>Start learning</span>
            <span className="font-display text-[20px] font-bold tnum">{pct}% done</span>
          </span>
          <span>
            <span className="eyebrow block">{next ? `Lesson ${PATH.indexOf(next) + 1} of ${PATH.length}` : 'All lessons done'}</span>
            <span className="mt-1 block font-display text-[34px] font-bold leading-tight sm:text-[42px]">{next ? next.title : 'You are a keyboard champion!'}</span>
            <span className="mt-1 block font-bold" style={{ color: 'var(--muted)' }}>{next ? ACTIVITIES[next.activity].name : 'Replay any lesson from the path.'}</span>
          </span>
          <ProgressBar pct={pct} color="mint" label="Lessons completed" />
          <span className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary text-[24px]" style={{ minHeight: 68 }} onClick={() => go(next ? routeFor(next.activity, next.level) : '/path')} aria-label={next ? `Play lesson ${PATH.indexOf(next) + 1}: ${next.title}` : 'See all lessons'}>
              <Play size={28} fill="currentColor" aria-hidden /> Play
            </button>
            <button type="button" className="btn btn-sm" onClick={() => go('/path')}>See the whole path</button>
          </span>
        </div>
      </section>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Level', String(lv.level), 'grape'],
          ['Stars', String(s.stars), 'sun'],
          ['Lessons done', `${s.lessons.length}/${PATH.length}`, 'mint'],
          ['Day streak', String(s.streak.count), 'coral'],
        ].map(([k, v, c]) => (
          <div key={k} className="toy px-4 py-3" style={{ background: toneSoft(c) }}>
            <dt className="eyebrow">{k}</dt>
            <dd className="m-0 font-display text-[30px] font-bold tnum">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Places to play">
        <Tile n="01" title="Learn the Keyboard" sub="Meet, find and remember keys" color="sky" to="/learn" icon={<Keyboard size={34} aria-hidden />} />
        <Tile n="02" title="Typing Games" sub="Five games to play" color="pink" to="/games" icon={<Gamepad2 size={34} aria-hidden />} />
        <Tile n="03" title="Word Adventure" sub="Build words, island by island" color="mint" to="/words" icon={<Map size={34} aria-hidden />} art={<Art name="cat" size={70} />} />
        <Tile n="04" title="Typing Challenge" sub="Letters, words, sentences" color="grape" to="/practice" icon={<Type size={34} aria-hidden />} />
        <Tile n="05" title="My Rewards" sub="Badges, trophies, robot shop" color="sun" to="/rewards" icon={<Sparkles size={34} aria-hidden />} art={<KeyBot size={70} still />} />
        <Tile n="06" title="My Progress" sub="See how you are growing" color="orange" to="/progress" icon={<TrendingUp size={34} aria-hidden />} />
      </section>

      <div className="mt-6"><Daily /></div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[15px]" style={{ color: 'var(--muted)' }}>
          <ShieldCheck size={18} aria-hidden /> No sign-up, no ads, no tracking. Progress stays on this device.
        </p>
        <button type="button" className="btn btn-sm" onClick={() => go('/parents')}>For grown-ups</button>
      </footer>
      <ProfileModal open={profile} onClose={() => setProfile(false)} />
    </div>
  );
}
