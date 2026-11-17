// Every playable activity, its levels, and the guided learning path that "Start Learning" follows.

export type ActivityId =
  | 'explore' | 'find' | 'alphabet' | 'numbers' | 'memory'
  | 'falling' | 'bubbles' | 'catcher' | 'builder' | 'treasure'
  | 'words' | 'practice';

export interface ActivityMeta {
  id: ActivityId;
  name: string;
  short: string;
  route: string;
  parent: string;
  color: string; // token name
  levels: string[]; // level names; length = number of levels
  kind: 'learn' | 'game' | 'words' | 'practice';
  intro: string; // what KeyBot says when it opens
}

export const ACTIVITIES: Record<ActivityId, ActivityMeta> = {
  explore: {
    id: 'explore', name: 'Meet Your Keyboard', short: 'Meet the keys', route: '/learn/explore', parent: '/learn', color: 'sky', kind: 'learn',
    levels: ['Discover 10 keys'],
    intro: 'Press any key, or tap one on the screen. I will tell you all about it!',
  },
  find: {
    id: 'find', name: 'Find the Key', short: 'Find it', route: '/learn/find', parent: '/learn', color: 'coral', kind: 'learn',
    levels: ['Easy: letters', 'Medium: letters and numbers', 'Advanced: every key'],
    intro: 'I will ask for a key. Can you find it and press it?',
  },
  alphabet: {
    id: 'alphabet', name: 'Alphabet Adventure', short: 'A to Z', route: '/learn/alphabet', parent: '/learn', color: 'pink', kind: 'learn',
    levels: ['A to M', 'N to Z', 'All of A to Z'],
    intro: 'Every letter has a picture friend. Press the letter I ask for!',
  },
  numbers: {
    id: 'numbers', name: 'Number Keyboard', short: '1 2 3', route: '/learn/numbers', parent: '/learn', color: 'sun', kind: 'learn',
    levels: ['Find the number', 'Count 1 to 10', 'Missing numbers', 'How many?', 'Big numbers'],
    intro: 'The number keys live in the row near the top. Let us play with them!',
  },
  memory: {
    id: 'memory', name: 'Memory Challenge', short: 'Remember', route: '/learn/memory', parent: '/learn', color: 'grape', kind: 'learn',
    levels: ['Hide 2 keys', 'Hide 3 keys', 'Hide 4 keys', 'Hide 5 keys', 'Hide 6 keys', 'Hide 8 keys'],
    intro: 'Look at the keyboard carefully. Then some keys will hide. Which ones are missing?',
  },
  falling: {
    id: 'falling', name: 'Falling Letters', short: 'Catch them', route: '/games/falling', parent: '/games', color: 'sky', kind: 'game',
    levels: ['Home row', 'Top row too', 'All letters', 'Faster!', 'Super fast'],
    intro: 'Letters are falling! Press the same key to make them disappear before they land.',
  },
  bubbles: {
    id: 'bubbles', name: 'Bubble Pop', short: 'Pop pop', route: '/games/bubbles', parent: '/games', color: 'pink', kind: 'game',
    levels: ['4 bubbles', '6 bubbles', '8 bubbles', 'Tricky letters', 'Letters and numbers'],
    intro: 'I will ask for a letter. Press it to pop that bubble!',
  },
  catcher: {
    id: 'catcher', name: 'Letter Catcher', short: 'Be quick', route: '/games/catcher', parent: '/games', color: 'mint', kind: 'game',
    levels: ['One lane', 'Two lanes', 'Three lanes', 'Busy lanes', 'Rush hour'],
    intro: 'Letters are zooming past. Type the one I ask for before it escapes!',
  },
  builder: {
    id: 'builder', name: 'Word Builder', short: 'Spell it', route: '/games/builder', parent: '/games', color: 'orange', kind: 'game',
    levels: ['3 letters', '4 letters', '5 or 6 letters', 'Big words'],
    intro: 'Look at the picture. Type its letters in order to build the word!',
  },
  treasure: {
    id: 'treasure', name: 'Treasure Hunt', short: 'Find gold', route: '/games/treasure', parent: '/games', color: 'sun', kind: 'game',
    levels: ['4 steps', '6 steps', '8 steps', 'Letters and numbers', 'Long trail'],
    intro: 'Follow the trail! Press each key in order to reach the treasure chest.',
  },
  words: {
    id: 'words', name: 'Word Adventure', short: 'Islands', route: '/words', parent: '/', color: 'mint', kind: 'words',
    levels: ['Pet Park', 'Snack Shack', 'Home Hill', 'Go-Go Town', 'Star Sky', 'Wild Jungle'],
    intro: 'Sail from island to island. Build every word to open the next island!',
  },
  practice: {
    id: 'practice', name: 'Typing Challenge', short: 'Type it', route: '/practice', parent: '/', color: 'grape', kind: 'practice',
    levels: ['Single letters', 'Letter twins', 'Simple words', 'Short words', 'Sentences'],
    intro: 'Type what you see. The yellow box shows the next key.',
  },
};

export const GAME_IDS: ActivityId[] = ['falling', 'bubbles', 'catcher', 'builder', 'treasure'];
export const LEARN_IDS: ActivityId[] = ['explore', 'find', 'alphabet', 'numbers', 'memory'];

export interface Lesson { id: string; title: string; activity: ActivityId; level: number }

/** The guided path. A lesson is done when its activity's level is passed. */
export const PATH: Lesson[] = [
  { id: 'l1', title: 'Meet your keyboard', activity: 'explore', level: 1 },
  { id: 'l2', title: 'Find the letters', activity: 'find', level: 1 },
  { id: 'l3', title: 'Letters A to M', activity: 'alphabet', level: 1 },
  { id: 'l4', title: 'Letters N to Z', activity: 'alphabet', level: 2 },
  { id: 'l5', title: 'Find the numbers', activity: 'numbers', level: 1 },
  { id: 'l6', title: 'Type single letters', activity: 'practice', level: 1 },
  { id: 'l7', title: 'Pop the bubbles', activity: 'bubbles', level: 1 },
  { id: 'l8', title: 'Letter twins', activity: 'practice', level: 2 },
  { id: 'l9', title: 'Count 1 to 10', activity: 'numbers', level: 2 },
  { id: 'l10', title: 'Falling letters', activity: 'falling', level: 1 },
  { id: 'l11', title: 'Letters and numbers', activity: 'find', level: 2 },
  { id: 'l12', title: 'Your first words', activity: 'practice', level: 3 },
  { id: 'l13', title: 'Build a word', activity: 'builder', level: 1 },
  { id: 'l14', title: 'Memory challenge', activity: 'memory', level: 1 },
  { id: 'l15', title: 'Catch the letter', activity: 'catcher', level: 1 },
  { id: 'l16', title: 'Missing numbers', activity: 'numbers', level: 3 },
  { id: 'l17', title: 'Short words', activity: 'practice', level: 4 },
  { id: 'l18', title: 'Treasure hunt', activity: 'treasure', level: 1 },
  { id: 'l19', title: 'Find every key', activity: 'find', level: 3 },
  { id: 'l20', title: 'Type sentences', activity: 'practice', level: 5 },
];

export const routeFor = (activity: ActivityId, level?: number) =>
  `${ACTIVITIES[activity].route}${level ? `?level=${level}` : ''}`;
