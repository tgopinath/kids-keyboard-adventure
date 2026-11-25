import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { installPhysicalKeyboard } from './lib/input';
import { setAudioPrefs, unlockAudio, sfx } from './lib/audio';
import { actions, onBadges, useStore } from './lib/store';
import { useRoute, go } from './lib/router';
import { BADGES } from './lib/rewards';
import { ICONS } from './components/ui';
import { Home } from './screens/Home';
import { LearnHub, GamesHub } from './screens/Hubs';

// Every screen except Home and the hubs is its own chunk, fetched when opened; all of them are
// warmed in the background after the first paint so offline play keeps working after one visit.
const loaders: (() => Promise<unknown>)[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function screen<K extends string, M extends Record<K, ComponentType<any>>>(load: () => Promise<M>, name: K) {
  loaders.push(load);
  return lazy(() => load().then((m) => ({ default: m[name] })));
}
const MeetKeyboard = screen(() => import('./screens/MeetKeyboard'), 'MeetKeyboard');
const FindKey = screen(() => import('./screens/FindKey'), 'FindKey');
const Alphabet = screen(() => import('./screens/Alphabet'), 'Alphabet');
const Numbers = screen(() => import('./screens/Numbers'), 'Numbers');
const Memory = screen(() => import('./screens/Memory'), 'Memory');
const FallingLetters = screen(() => import('./screens/games/FallingLetters'), 'FallingLetters');
const BubblePop = screen(() => import('./screens/games/BubblePop'), 'BubblePop');
const LetterCatcher = screen(() => import('./screens/games/LetterCatcher'), 'LetterCatcher');
const WordBuilderGame = screen(() => import('./screens/games/WordBuilder'), 'WordBuilderGame');
const TreasureHunt = screen(() => import('./screens/games/TreasureHunt'), 'TreasureHunt');
const WordAdventure = screen(() => import('./screens/WordAdventure'), 'WordAdventure');
const Practice = screen(() => import('./screens/Practice'), 'Practice');
const LearningPath = screen(() => import('./screens/LearningPath'), 'LearningPath');
const Rewards = screen(() => import('./screens/Rewards'), 'Rewards');
const MyProgress = screen(() => import('./screens/MyProgress'), 'MyProgress');
const Parents = screen(() => import('./screens/Parents'), 'Parents');
const SettingsScreen = screen(() => import('./screens/Settings'), 'SettingsScreen');


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

function useWarmScreens() {
  useEffect(() => {
    const t = setTimeout(() => loaders.forEach((l) => void l().catch(() => {})), 1500);
    return () => clearTimeout(t);
  }, []);
}

export default function App() {
  useAppEffects();
  useWarmScreens();
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
        <Suspense fallback={null}>{screen}</Suspense>
      </main>
      <BadgeToasts />
    </MotionConfig>
  );
}

