import type { ActivityId } from './activities';

export interface Badge { id: string; name: string; how: string; icon: string; color: string }
export const BADGES: Badge[] = [
  { id: 'first-key', name: 'First Key Press', how: 'Press your very first key', icon: 'MousePointerClick', color: 'sky' },
  { id: 'key-explorer', name: 'Key Explorer', how: 'Discover 30 keys in Meet Your Keyboard', icon: 'Compass', color: 'mint' },
  { id: 'alphabet-explorer', name: 'Alphabet Explorer', how: 'Find all 26 letters in Alphabet Adventure', icon: 'BookOpen', color: 'pink' },
  { id: 'number-master', name: 'Number Master', how: 'Pass "How many?" in Number Keyboard', icon: 'Hash', color: 'sun' },
  { id: 'word-builder', name: 'Word Builder', how: 'Build 10 words', icon: 'Blocks', color: 'orange' },
  { id: 'typing-superstar', name: 'Typing Superstar', how: 'Pass the Sentences level', icon: 'Sparkles', color: 'grape' },
  { id: 'keyboard-champion', name: 'Keyboard Champion', how: 'Pass Find the Key: Advanced', icon: 'Trophy', color: 'coral' },
  { id: 'perfect', name: 'Perfect Accuracy', how: 'Get every answer right in a round of 8 or more', icon: 'Target', color: 'mint' },
  { id: 'treasure-hunter', name: 'Treasure Hunter', how: 'Open 5 treasure chests', icon: 'Gem', color: 'sun' },
  { id: 'game-fan', name: 'Game Fan', how: 'Play all 5 typing games', icon: 'Gamepad2', color: 'sky' },
  { id: 'streak-3', name: 'Three in a Row', how: 'Play on 3 days in a row', icon: 'Flame', color: 'orange' },
  { id: 'speedy', name: 'Speedy Fingers', how: 'Type 12 words a minute in Typing Challenge', icon: 'Zap', color: 'pink' },
];

export type Slot = 'skin' | 'head' | 'face' | 'neck' | 'world';
export interface ShopItem { id: string; slot: Slot; name: string; price: number; color?: string }

export const SKINS: Record<string, { body: string; dark: string; light: string }> = {
  sky: { body: '#38b6ff', dark: '#1d7fc4', light: '#9fdcff' },
  mint: { body: '#22c79a', dark: '#14876a', light: '#99ecd3' },
  sunny: { body: '#ffc83d', dark: '#d99a0b', light: '#ffe49a' },
  berry: { body: '#ff6fb5', dark: '#c93f86', light: '#ffc1df' },
  galaxy: { body: '#8b5cf6', dark: '#5b34c2', light: '#c9b3ff' },
  coral: { body: '#ff7a59', dark: '#c94f31', light: '#ffc3b1' },
  gold: { body: '#f2b62b', dark: '#a8770b', light: '#ffe08a' },
};

export const SHOP: ShopItem[] = [
  { id: 'skin:sky', slot: 'skin', name: 'Sky Blue', price: 0 },
  { id: 'skin:mint', slot: 'skin', name: 'Mint', price: 30 },
  { id: 'skin:sunny', slot: 'skin', name: 'Sunny', price: 30 },
  { id: 'skin:berry', slot: 'skin', name: 'Berry', price: 40 },
  { id: 'skin:coral', slot: 'skin', name: 'Coral', price: 40 },
  { id: 'skin:galaxy', slot: 'skin', name: 'Galaxy', price: 60 },
  { id: 'skin:gold', slot: 'skin', name: 'Golden', price: 120 },
  { id: 'head:none', slot: 'head', name: 'No hat', price: 0 },
  { id: 'head:cap', slot: 'head', name: 'Cap', price: 25 },
  { id: 'head:party', slot: 'head', name: 'Party hat', price: 30 },
  { id: 'head:phones', slot: 'head', name: 'Headphones', price: 40 },
  { id: 'head:crown', slot: 'head', name: 'Crown', price: 60 },
  { id: 'face:none', slot: 'face', name: 'No glasses', price: 0 },
  { id: 'face:glasses', slot: 'face', name: 'Round glasses', price: 30 },
  { id: 'face:shades', slot: 'face', name: 'Sunglasses', price: 45 },
  { id: 'neck:none', slot: 'neck', name: 'Nothing', price: 0 },
  { id: 'neck:bow', slot: 'neck', name: 'Bow tie', price: 20 },
  { id: 'neck:scarf', slot: 'neck', name: 'Scarf', price: 35 },
  { id: 'world:meadow', slot: 'world', name: 'Sunny Meadow', price: 0 },
  { id: 'world:ocean', slot: 'world', name: 'Deep Ocean', price: 50 },
  { id: 'world:candy', slot: 'world', name: 'Candy Land', price: 50 },
  { id: 'world:jungle', slot: 'world', name: 'Jungle', price: 60 },
  { id: 'world:space', slot: 'world', name: 'Outer Space', price: 80 },
];
export const FREE_ITEMS = SHOP.filter((s) => s.price === 0).map((s) => s.id);

export interface DailyDef { metric: string; goal: number; label: string }
const DAILY_POOL: DailyDef[] = [
  { metric: 'stars', goal: 10, label: 'Earn 10 stars' },
  { metric: 'correct', goal: 40, label: 'Press 40 right keys' },
  { metric: 'play:bubbles', goal: 1, label: 'Play Bubble Pop' },
  { metric: 'play:falling', goal: 1, label: 'Play Falling Letters' },
  { metric: 'play:catcher', goal: 1, label: 'Play Letter Catcher' },
  { metric: 'play:treasure', goal: 1, label: 'Go on a Treasure Hunt' },
  { metric: 'words', goal: 3, label: 'Build 3 words' },
  { metric: 'play:practice', goal: 1, label: 'Finish a Typing Challenge' },
  { metric: 'play:find', goal: 1, label: 'Play Find the Key' },
  { metric: 'explore', goal: 15, label: 'Press 15 keys in Meet Your Keyboard' },
  { metric: 'play:memory', goal: 1, label: 'Try the Memory Challenge' },
];

/** Same three challenges for everyone on a given day; they change at midnight. */
export function dailyFor(date: string): DailyDef[] {
  let h = 0;
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pool = [...DAILY_POOL];
  const out: DailyDef[] = [];
  for (let i = 0; i < 3; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(pool.splice(h % pool.length, 1)[0]);
  }
  return out;
}
export const DAILY_REWARD = { coins: 15, stars: 3 };

export const TROPHY_NAMES: Partial<Record<ActivityId, string>> = {
  find: 'Key Finder Cup', alphabet: 'Alphabet Cup', numbers: 'Number Cup', memory: 'Memory Cup',
  falling: 'Falling Letters Cup', bubbles: 'Bubble Cup', catcher: 'Catcher Cup', builder: 'Builder Cup',
  treasure: 'Treasure Cup', words: 'Island Cup', practice: 'Typing Cup', explore: 'Explorer Cup',
};

/** Child level from total stars: 15, 45, 90, 150 … stars. */
export const starsForLevel = (lvl: number) => Math.round(7.5 * (lvl - 1) * lvl);
export function levelFromStars(stars: number) {
  let l = 1;
  while (stars >= starsForLevel(l + 1)) l++;
  const from = starsForLevel(l);
  const to = starsForLevel(l + 1);
  return { level: l, into: stars - from, need: to - from, pct: Math.round(((stars - from) / (to - from)) * 100) };
}
