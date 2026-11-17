// Progress lives only in this browser (localStorage). No accounts, no network, no tracking.
import { useSyncExternalStore } from 'react';
import { ACTIVITIES, GAME_IDS, PATH, type ActivityId } from './activities';
import { accuracyOf, decide, nextLevel, PASS_ACCURACY, starsFor, type Decision } from './adaptive';
import { DAILY_REWARD, FREE_ITEMS, SHOP, dailyFor, type Slot } from './rewards';
import type { AudioPrefs } from './audio';

export interface KeyStat { c: number; w: number; ms: number }
export interface ActivityState { level: number; unlocked: number; best: Record<number, number>; rating: Record<number, number>; plays: number; hints: boolean; lastAcc?: number }
export interface DayStat { ms: number; correct: number; wrong: number; stars: number; rounds: number }
export interface Session { at: number; activity: ActivityId; level: number; acc: number; correct: number; wrong: number; score: number; stars: number; durMs: number; wpm?: number }
export interface Settings extends AudioPrefs { theme: 'auto' | 'light' | 'dark'; contrast: boolean; reducedMotion: boolean; captions: boolean }

export interface State {
  v: 1;
  profile: { name: string; avatar: number };
  stars: number;
  coins: number;
  keyStats: Record<string, KeyStat>;
  activities: Record<ActivityId, ActivityState>;
  lessons: string[];
  badges: string[];
  badgeDates: Record<string, number>;
  owned: string[];
  equipped: Record<Slot, string>;
  days: Record<string, DayStat>;
  streak: { last: string; count: number; best: number };
  daily: { date: string; progress: number[]; claimed: boolean[] };
  dailyMetrics: Record<string, number>;
  sessions: Session[];
  explored: string[];
  lettersFound: string[];
  wordsBuilt: number;
  chests: number;
  gamesPlayed: string[];
  bestWpm: number;
  settings: Settings;
  createdAt: number;
}

const KEY = 'kids-keyboard-adventure:v1';
export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterday = () => today(new Date(Date.now() - 864e5));

const freshActivities = () =>
  Object.fromEntries(
    (Object.keys(ACTIVITIES) as ActivityId[]).map((id) => [id, { level: 1, unlocked: 1, best: {}, rating: {}, plays: 0, hints: true } satisfies ActivityState]),
  ) as Record<ActivityId, ActivityState>;

export const DEFAULT_SETTINGS: Settings = {
  music: true, musicVol: 0.3, sfx: true, sfxVol: 0.7, voice: true, voiceVol: 1,
  theme: 'auto', contrast: false, reducedMotion: false, captions: true,
};

function fresh(): State {
  return {
    v: 1,
    profile: { name: '', avatar: 0 },
    stars: 0,
    coins: 0,
    keyStats: {},
    activities: freshActivities(),
    lessons: [],
    badges: [],
    badgeDates: {},
    owned: [...FREE_ITEMS],
    equipped: { skin: 'skin:sky', head: 'head:none', face: 'face:none', neck: 'neck:none', world: 'world:meadow' },
    days: {},
    streak: { last: '', count: 0, best: 0 },
    daily: { date: today(), progress: [0, 0, 0], claimed: [false, false, false] },
    dailyMetrics: {},
    sessions: [],
    explored: [],
    lettersFound: [],
    wordsBuilt: 0,
    chests: 0,
    gamesPlayed: [],
    bestWpm: 0,
    settings: { ...DEFAULT_SETTINGS },
    createdAt: Date.now(),
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const s = JSON.parse(raw) as State;
    const base = fresh();
    // merge so older saves pick up new fields
    return {
      ...base, ...s,
      activities: { ...base.activities, ...s.activities },
      equipped: { ...base.equipped, ...s.equipped },
      settings: { ...base.settings, ...s.settings },
    };
  } catch {
    return fresh();
  }
}

let state: State = typeof window === 'undefined' ? fresh() : load();
const subs = new Set<() => void>();
let saveTimer: number | null = null;

function persist() {
  if (saveTimer !== null) return;
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: progress stays for this visit */
    }
  }, 250);
}
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if ((window as unknown as { __kkaNoSave?: boolean }).__kkaNoSave) return; // test tools rewriting the save
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  });
}

export const getState = () => state;
function set(fn: (s: State) => State) {
  state = fn(state);
  persist();
  subs.forEach((f) => f());
}
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => void subs.delete(cb);
    },
    () => sel(state),
    () => sel(state),
  );
}

// ---------- helpers ----------
function rollDaily(s: State): State {
  const d = today();
  if (s.daily.date === d) return s;
  return { ...s, daily: { date: d, progress: [0, 0, 0], claimed: [false, false, false] }, dailyMetrics: {} };
}
function touchDay(s: State): State {
  const d = today();
  let streak = s.streak;
  if (streak.last !== d) {
    const count = streak.last === yesterday() ? streak.count + 1 : 1;
    streak = { last: d, count, best: Math.max(streak.best, count) };
  }
  const day = s.days[d] ?? { ms: 0, correct: 0, wrong: 0, stars: 0, rounds: 0 };
  return { ...rollDaily(s), streak, days: { ...s.days, [d]: day } };
}
function bumpMetric(s: State, metric: string, n: number): State {
  s = rollDaily(s);
  const dailyMetrics = { ...s.dailyMetrics, [metric]: (s.dailyMetrics[metric] ?? 0) + n };
  const defs = dailyFor(s.daily.date);
  const progress = defs.map((d) => Math.min(d.goal, dailyMetrics[d.metric] ?? 0));
  return { ...s, dailyMetrics, daily: { ...s.daily, progress } };
}
function withDay(s: State, fn: (d: DayStat) => DayStat): State {
  const d = today();
  const day = s.days[d] ?? { ms: 0, correct: 0, wrong: 0, stars: 0, rounds: 0 };
  return { ...s, days: { ...s.days, [d]: fn(day) } };
}

function award(s: State, ids: string[]): { s: State; added: string[] } {
  const added = ids.filter((id) => !s.badges.includes(id));
  if (!added.length) return { s, added };
  const now = Date.now();
  return { s: { ...s, badges: [...s.badges, ...added], badgeDates: { ...s.badgeDates, ...Object.fromEntries(added.map((a) => [a, now])) } }, added };
}

function checkBadges(s: State, extra: string[] = []): { s: State; added: string[] } {
  const ids = [...extra];
  if (Object.keys(s.keyStats).length > 0 || s.explored.length > 0) ids.push('first-key');
  if (s.explored.length >= 30) ids.push('key-explorer');
  if (s.lettersFound.length >= 26) ids.push('alphabet-explorer');
  if ((s.activities.numbers.rating[4] ?? 0) > 0) ids.push('number-master');
  if (s.wordsBuilt >= 10) ids.push('word-builder');
  if ((s.activities.practice.rating[5] ?? 0) > 0) ids.push('typing-superstar');
  if ((s.activities.find.rating[3] ?? 0) > 0) ids.push('keyboard-champion');
  if (s.chests >= 5) ids.push('treasure-hunter');
  if (GAME_IDS.every((g) => s.gamesPlayed.includes(g))) ids.push('game-fan');
  if (s.streak.count >= 3) ids.push('streak-3');
  if (s.bestWpm >= 12) ids.push('speedy');
  return award(s, ids);
}

// ---------- badge toast bus ----------
type BadgeListener = (ids: string[]) => void;
const badgeListeners = new Set<BadgeListener>();
export const onBadges = (fn: BadgeListener) => {
  badgeListeners.add(fn);
  return () => void badgeListeners.delete(fn);
};
const announce = (ids: string[]) => ids.length && badgeListeners.forEach((f) => f(ids));

// ---------- actions ----------
export const actions = {
  /** A single answer to a "press this key" question. */
  keyResult(id: string, correct: boolean, ms?: number) {
    let added: string[] = [];
    set((s0) => {
      let s = touchDay(s0);
      const k = s.keyStats[id] ?? { c: 0, w: 0, ms: 0 };
      s = {
        ...s,
        keyStats: { ...s.keyStats, [id]: { c: k.c + (correct ? 1 : 0), w: k.w + (correct ? 0 : 1), ms: k.ms + (correct && ms ? Math.min(ms, 15000) : 0) } },
      };
      s = withDay(s, (d) => ({ ...d, correct: d.correct + (correct ? 1 : 0), wrong: d.wrong + (correct ? 0 : 1) }));
      if (correct) s = bumpMetric(s, 'correct', 1);
      const r = checkBadges(s);
      added = r.added;
      return r.s;
    });
    announce(added);
  },

  addStars(n: number) {
    if (n <= 0) return;
    set((s0) => {
      let s = touchDay(s0);
      s = { ...s, stars: s.stars + n };
      s = withDay(s, (d) => ({ ...d, stars: d.stars + n }));
      return bumpMetric(s, 'stars', n);
    });
  },
  addCoins(n: number) {
    if (n <= 0) return;
    set((s) => ({ ...s, coins: s.coins + n }));
  },
  metric(metric: string, n = 1) {
    set((s) => bumpMetric(s, metric, n));
  },

  explore(id: string) {
    let added: string[] = [];
    set((s0) => {
      let s = bumpMetric(touchDay(s0), 'explore', 1);
      if (!s.explored.includes(id)) s = { ...s, explored: [...s.explored, id] };
      const r = checkBadges(s);
      added = r.added;
      return r.s;
    });
    announce(added);
  },
  letterFound(letter: string) {
    set((s) => (s.lettersFound.includes(letter) ? s : { ...s, lettersFound: [...s.lettersFound, letter] }));
  },
  wordBuilt() {
    set((s) => bumpMetric({ ...s, wordsBuilt: s.wordsBuilt + 1 }, 'words', 1));
  },
  chestOpened() {
    set((s) => ({ ...s, chests: s.chests + 1 }));
  },

  /** End of a round: rates it, applies Smart Difficulty, unlocks levels, records history. */
  finishRound(input: { activity: ActivityId; level: number; correct: number; wrong: number; score?: number; durMs: number; wpm?: number; coinsBonus?: number }): RoundOutcome {
    const meta = ACTIVITIES[input.activity];
    const max = meta.levels.length;
    const acc = accuracyOf(input.correct, input.wrong);
    const rating = starsFor(acc);
    const passed = acc >= PASS_ACCURACY && input.correct > 0;
    const decision = decide(acc);
    const isGame = meta.kind === 'game';
    const coins = (isGame ? Math.floor((input.score ?? 0) / 25) : 0) + rating * 3 + (input.coinsBonus ?? 0);
    let out!: RoundOutcome;
    let added: string[] = [];
    set((s0) => {
      let s = touchDay(s0);
      const a = s.activities[input.activity];
      const unlocked = passed ? Math.max(a.unlocked, Math.min(max, input.level + 1)) : a.unlocked;
      const newlyUnlocked = unlocked > a.unlocked ? unlocked : undefined;
      const suggested = nextLevel(input.level, decision, unlocked, max);
      const next: ActivityState = {
        ...a,
        unlocked,
        level: suggested,
        plays: a.plays + 1,
        hints: decision === 'down' ? true : decision === 'up' ? false : a.hints,
        lastAcc: acc,
        best: { ...a.best, [input.level]: Math.max(a.best[input.level] ?? 0, input.score ?? acc) },
        rating: { ...a.rating, [input.level]: Math.max(a.rating[input.level] ?? 0, rating) },
      };
      s = { ...s, activities: { ...s.activities, [input.activity]: next }, coins: s.coins + coins };
      const lesson = PATH.find((l) => l.activity === input.activity && l.level === input.level);
      const lessonDone = passed && lesson && !s.lessons.includes(lesson.id) ? lesson.id : undefined;
      if (lessonDone) s = { ...s, lessons: [...s.lessons, lessonDone] };
      if (isGame && !s.gamesPlayed.includes(input.activity)) s = { ...s, gamesPlayed: [...s.gamesPlayed, input.activity] };
      if (input.wpm && input.wpm > s.bestWpm) s = { ...s, bestWpm: input.wpm };
      const session: Session = { at: Date.now(), activity: input.activity, level: input.level, acc, correct: input.correct, wrong: input.wrong, score: input.score ?? 0, stars: rating, durMs: input.durMs, wpm: input.wpm };
      s = { ...s, sessions: [session, ...s.sessions].slice(0, 300) };
      s = withDay(s, (d) => ({ ...d, rounds: d.rounds + 1 }));
      s = bumpMetric(s, `play:${input.activity}`, 1);
      const r = checkBadges(s, acc === 100 && input.correct + input.wrong >= 8 ? ['perfect'] : []);
      added = r.added;
      out = { correct: input.correct, score: input.score ?? 0, accuracy: acc, rating, passed, decision, coins, suggested, newlyUnlocked, lessonDone, newBadges: r.added, maxLevel: max };
      return r.s;
    });
    announce(added);
    return out;
  },

  setLevel(activity: ActivityId, level: number) {
    set((s) => ({ ...s, activities: { ...s.activities, [activity]: { ...s.activities[activity], level } } }));
  },

  buy(itemId: string): boolean {
    const item = SHOP.find((i) => i.id === itemId);
    if (!item || state.owned.includes(itemId) || state.coins < item.price) return false;
    set((s) => ({ ...s, coins: s.coins - item.price, owned: [...s.owned, itemId], equipped: { ...s.equipped, [item.slot]: itemId } }));
    return true;
  },
  equip(itemId: string) {
    const item = SHOP.find((i) => i.id === itemId);
    if (!item || !state.owned.includes(itemId)) return;
    set((s) => ({ ...s, equipped: { ...s.equipped, [item.slot]: itemId } }));
  },
  grant(itemId: string) {
    set((s) => (s.owned.includes(itemId) ? s : { ...s, owned: [...s.owned, itemId] }));
  },

  claimDaily(i: number): boolean {
    const s0 = rollDaily(state);
    const def = dailyFor(s0.daily.date)[i];
    if (!def || s0.daily.claimed[i] || s0.daily.progress[i] < def.goal) return false;
    set((s) => {
      s = rollDaily(s);
      const claimed = [...s.daily.claimed];
      claimed[i] = true;
      return { ...s, coins: s.coins + DAILY_REWARD.coins, stars: s.stars + DAILY_REWARD.stars, daily: { ...s.daily, claimed } };
    });
    return true;
  },

  tickTime(ms: number) {
    set((s) => withDay(touchDay(s), (d) => ({ ...d, ms: d.ms + ms })));
  },

  settings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  profile(patch: Partial<State['profile']>) {
    set((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },
  resetAll() {
    const keep = state.settings;
    set(() => ({ ...fresh(), settings: keep }));
  },
  /** Refresh daily challenges if the date changed while the app was open. */
  refreshDay() {
    set((s) => rollDaily(s));
  },
};

export interface RoundOutcome {
  correct: number;
  score: number;
  accuracy: number;
  rating: number;
  passed: boolean;
  decision: Decision;
  coins: number;
  suggested: number;
  newlyUnlocked?: number;
  lessonDone?: string;
  newBadges: string[];
  maxLevel: number;
}

// ---------- selectors ----------
export function missedKeys(s: State, min = 2): string[] {
  return Object.entries(s.keyStats)
    .filter(([, k]) => k.w >= 1 && k.c + k.w >= min)
    .sort((a, b) => b[1].w / (b[1].c + b[1].w) - a[1].w / (a[1].c + a[1].w))
    .slice(0, 10)
    .map(([id]) => id);
}
export function totals(s: State) {
  const days = Object.values(s.days);
  const correct = days.reduce((a, d) => a + d.correct, 0);
  const wrong = days.reduce((a, d) => a + d.wrong, 0);
  return { ms: days.reduce((a, d) => a + d.ms, 0), correct, wrong, acc: accuracyOf(correct, wrong) };
}
export const nextLesson = (s: State) => PATH.find((l) => !s.lessons.includes(l.id)) ?? null;
