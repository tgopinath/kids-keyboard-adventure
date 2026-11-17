import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { installPhysicalKeyboard } from './lib/input';
import { setAudioPrefs, unlockAudio, sfx } from './lib/audio';
import { actions, onBadges, useStore } from './lib/store';
import { useRoute, go } from './lib/router';
import { BADGES } from './lib/rewards';
import { ICONS } from './components/ui';
import { Home } from './screens/Home';
import { LearnHub, GamesHub } from './screens/Hubs';
import { MeetKeyboard } from './screens/MeetKeyboard';
import { FindKey } from './screens/FindKey';
import { Alphabet } from './screens/Alphabet';
import { Numbers } from './screens/Numbers';
import { Memory } from './screens/Memory';
import { FallingLetters } from './screens/games/FallingLetters';
import { BubblePop } from './screens/games/BubblePop';
import { LetterCatcher } from './screens/games/LetterCatcher';
import { WordBuilderGame } from './screens/games/WordBuilder';
import { TreasureHunt } from './screens/games/TreasureHunt';
import { WordAdventure } from './screens/WordAdventure';
import { Practice } from './screens/Practice';
import { LearningPath } from './screens/LearningPath';
import { Rewards } from './screens/Rewards';
import { MyProgress } from './screens/MyProgress';
import { Parents } from './screens/Parents';
import { SettingsScreen } from './screens/Settings';

function useAppEffects() {
  const settings = useStore((s) => s.settings);
  useEffect(() => installPhysicalKeyboard(), []);
  useEffect(() => {
    setAudioPrefs(settings);
    const root = document.documentElement;
    root.dataset.theme = settings.theme === 'auto' ? '' : settings.theme;
    if (settings.theme === 'auto') delete root.dataset.theme;
    if (settings.contrast) root.dataset.contrast = 'high';
    else delete root.dataset.contrast;
    if (settings.reducedMotion) root.dataset.motion = 'reduce';
    else delete root.dataset.motion;
  }, [settings]);
  // Sound can only start after a first tap or key press.
  useEffect(() => {
    const on = () => unlockAudio();
    window.addEventListener('pointerdown', on, { once: true });
    window.addEventListener('keydown', on, { once: true });
    return () => {
      window.removeEventListener('pointerdown', on);
      window.removeEventListener('keydown', on);
    };
  }, []);
  // Learning time: counted in 10-second steps while the tab is visible and the child has touched it recently.
  useEffect(() => {
    let last = Date.now();
    const mark = () => (last = Date.now());
    window.addEventListener('pointerdown', mark);
    window.addEventListener('keydown', mark);
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - last < 60_000) actions.tickTime(10_000);
      actions.refreshDay();
    }, 10_000);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
    };
  }, []);
}

function BadgeToasts() {
  const [list, setList] = useState<string[]>([]);
  useEffect(
    () =>
      onBadges((ids) => {
        sfx.unlock();
        setList((l) => [...l, ...ids]);
        ids.forEach((id) => window.setTimeout(() => setList((l) => l.filter((x) => x !== id)), 4200));
      }),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2 px-4" aria-live="assertive">
      <AnimatePresence>
        {list.map((id) => {
          const b = BADGES.find((x) => x.id === id);
          if (!b) return null;
          const I = ICONS[b.icon];
          return (
            <motion.div key={id} className="toy pointer-events-auto flex items-center gap-3 px-4 py-3" style={{ boxShadow: 'var(--elev-2)' }} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
              <span className="icon-tile"><I size={20} aria-hidden /></span>
              <span><span className="eyebrow block">New badge</span><b className="text-[15px]">{b.name}</b></span>
              <button type="button" className="chip ml-2" onClick={() => go('/rewards')}>See</button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-[24px]">This page went on an adventure</h1>
      <p className="mt-3" style={{ color: 'var(--muted)' }}>Let us go back home.</p>
      <button type="button" className="btn btn-primary mt-6" onClick={() => go('/')}>Go home</button>
    </div>
  );
}

export default function App() {
  useAppEffects();
  const route = useRoute();
  const reduced = useStore((s) => s.settings.reducedMotion);
  const lvl = route.params.get('level');
  const level = lvl ? Math.max(1, Number(lvl) || 1) : null;
  const key = `${route.path}?${route.params.toString()}`;

  let screen;
  switch (route.path) {
    case '/': screen = <Home />; break;
    case '/learn': screen = <LearnHub />; break;
    case '/games': screen = <GamesHub />; break;
    case '/learn/explore': screen = <MeetKeyboard />; break;
    case '/learn/find': screen = <FindKey level={level} />; break;
    case '/learn/alphabet': screen = <Alphabet level={level} />; break;
    case '/learn/numbers': screen = <Numbers level={level} />; break;
    case '/learn/memory': screen = <Memory level={level} />; break;
    case '/games/falling': screen = <FallingLetters level={level} />; break;
    case '/games/bubbles': screen = <BubblePop level={level} />; break;
    case '/games/catcher': screen = <LetterCatcher level={level} />; break;
    case '/games/builder': screen = <WordBuilderGame level={level} />; break;
    case '/games/treasure': screen = <TreasureHunt level={level} />; break;
    case '/words': screen = <WordAdventure level={level} />; break;
    case '/practice': screen = <Practice level={level} />; break;
    case '/path': screen = <LearningPath />; break;
    case '/rewards': screen = <Rewards />; break;
    case '/progress': screen = <MyProgress />; break;
    case '/parents': screen = <Parents />; break;
    case '/settings': screen = <SettingsScreen />; break;
    default: screen = <NotFound />;
  }
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
      <main id="main" tabIndex={-1} className="min-h-dvh outline-none" key={key}>
        {screen}
      </main>
      <BadgeToasts />
    </MotionConfig>
  );
}

