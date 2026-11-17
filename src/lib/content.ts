// All words, levels and lines KeyBot says. Hand-written for ages 3–10.

/** A is for Apple … each letter has a word and a matching illustration (see components/Art.tsx). */
export const ALPHABET: { letter: string; word: string; art: string; color: string }[] = [
  { letter: 'A', word: 'Apple', art: 'apple', color: 'coral' },
  { letter: 'B', word: 'Ball', art: 'ball', color: 'sky' },
  { letter: 'C', word: 'Cat', art: 'cat', color: 'orange' },
  { letter: 'D', word: 'Dog', art: 'dog', color: 'sun' },
  { letter: 'E', word: 'Elephant', art: 'elephant', color: 'grape' },
  { letter: 'F', word: 'Fish', art: 'fish', color: 'sky' },
  { letter: 'G', word: 'Grapes', art: 'grapes', color: 'grape' },
  { letter: 'H', word: 'House', art: 'house', color: 'coral' },
  { letter: 'I', word: 'Ice cream', art: 'icecream', color: 'pink' },
  { letter: 'J', word: 'Juice', art: 'juice', color: 'orange' },
  { letter: 'K', word: 'Kite', art: 'kite', color: 'pink' },
  { letter: 'L', word: 'Leaf', art: 'leaf', color: 'mint' },
  { letter: 'M', word: 'Moon', art: 'moon', color: 'sun' },
  { letter: 'N', word: 'Nest', art: 'nest', color: 'orange' },
  { letter: 'O', word: 'Orange', art: 'orange', color: 'orange' },
  { letter: 'P', word: 'Pencil', art: 'pencil', color: 'sun' },
  { letter: 'Q', word: 'Queen', art: 'queen', color: 'grape' },
  { letter: 'R', word: 'Rocket', art: 'rocket', color: 'coral' },
  { letter: 'S', word: 'Sun', art: 'sun', color: 'sun' },
  { letter: 'T', word: 'Tree', art: 'tree', color: 'mint' },
  { letter: 'U', word: 'Umbrella', art: 'umbrella', color: 'pink' },
  { letter: 'V', word: 'Van', art: 'van', color: 'sky' },
  { letter: 'W', word: 'Watermelon', art: 'watermelon', color: 'mint' },
  { letter: 'X', word: 'Xylophone', art: 'xylophone', color: 'grape' },
  { letter: 'Y', word: 'Yo-yo', art: 'yoyo', color: 'coral' },
  { letter: 'Z', word: 'Zebra', art: 'zebra', color: 'lime' },
];
export const ALPHA_BY_LETTER = Object.fromEntries(ALPHABET.map((a) => [a.letter, a]));

/** Words for Word Builder, by length band. Every word has a drawing in Art.tsx. */
export const BUILDER_LEVELS: { name: string; words: string[] }[] = [
  { name: '3 letters', words: ['CAT', 'DOG', 'SUN', 'HAT', 'BUS', 'CUP', 'PEN', 'BOX', 'EGG', 'CAR', 'VAN', 'FAN', 'KEY'] },
  { name: '4 letters', words: ['FISH', 'BALL', 'KITE', 'LEAF', 'MOON', 'NEST', 'TREE', 'STAR', 'CAKE', 'BOOK', 'BELL', 'YOYO'] },
  { name: '5 or 6 letters', words: ['APPLE', 'HOUSE', 'ZEBRA', 'QUEEN', 'JUICE', 'GRAPES', 'PENCIL', 'ROCKET', 'ORANGE'] },
  { name: 'Big words', words: ['ELEPHANT', 'UMBRELLA', 'XYLOPHONE', 'WATERMELON', 'ICECREAM'] },
];

export const WORD_ART: Record<string, string> = {
  CAT: 'cat', DOG: 'dog', SUN: 'sun', HAT: 'hat', BUS: 'bus', CUP: 'cup', PEN: 'pen', BOX: 'box', EGG: 'egg',
  CAR: 'car', VAN: 'van', FAN: 'fan', KEY: 'key', FISH: 'fish', BALL: 'ball', KITE: 'kite', LEAF: 'leaf',
  MOON: 'moon', NEST: 'nest', TREE: 'tree', STAR: 'star', CAKE: 'cake', BOOK: 'book', BELL: 'bell', YOYO: 'yoyo',
  APPLE: 'apple', HOUSE: 'house', ZEBRA: 'zebra', QUEEN: 'queen', JUICE: 'juice', GRAPES: 'grapes',
  PENCIL: 'pencil', ROCKET: 'rocket', ORANGE: 'orange', ELEPHANT: 'elephant', UMBRELLA: 'umbrella',
  XYLOPHONE: 'xylophone', WATERMELON: 'watermelon', ICECREAM: 'icecream',
};
export const WORD_SAY: Record<string, string> = { YOYO: 'yo-yo', ICECREAM: 'ice cream' };

/** Word Adventure: themed islands, each a short set of words to build. */
export const ISLANDS: { id: string; name: string; blurb: string; world: string; color: string; words: string[] }[] = [
  { id: 'pets', name: 'Pet Park', blurb: 'Furry friends', world: 'meadow', color: 'mint', words: ['CAT', 'DOG', 'FISH', 'EGG', 'NEST'] },
  { id: 'snacks', name: 'Snack Shack', blurb: 'Yummy things', world: 'candy', color: 'pink', words: ['CUP', 'CAKE', 'APPLE', 'JUICE', 'GRAPES'] },
  { id: 'home', name: 'Home Hill', blurb: 'Things at home', world: 'meadow', color: 'sun', words: ['HAT', 'BOX', 'KEY', 'BOOK', 'HOUSE'] },
  { id: 'go', name: 'Go-Go Town', blurb: 'Things that move', world: 'ocean', color: 'sky', words: ['BUS', 'CAR', 'VAN', 'KITE', 'ROCKET'] },
  { id: 'sky', name: 'Star Sky', blurb: 'Up above', world: 'space', color: 'grape', words: ['SUN', 'MOON', 'STAR', 'UMBRELLA', 'QUEEN'] },
  { id: 'wild', name: 'Wild Jungle', blurb: 'Big and bold', world: 'jungle', color: 'lime', words: ['TREE', 'LEAF', 'ZEBRA', 'ELEPHANT', 'WATERMELON'] },
];

/** Typing Challenge levels (Module 6). */
export const PRACTICE_LEVELS: { name: string; blurb: string; items: string[]; pick: number }[] = [
  { name: 'Single letters', blurb: 'One key at a time', items: 'ASDFJKLGHERUITYOWQPZXCVBNM'.split(''), pick: 12 },
  { name: 'Letter twins', blurb: 'Same key, three times', items: ['AAA', 'SSS', 'DDD', 'FFF', 'JJJ', 'KKK', 'LLL', 'EEE', 'BBB', 'MMM', 'OOO', 'TTT'], pick: 8 },
  { name: 'Simple words', blurb: 'Three-letter words', items: ['CAT', 'DOG', 'SUN', 'BAT', 'PEN', 'HAT', 'CUP', 'BUS', 'MAP', 'RED', 'FUN', 'BIG', 'YES', 'BOX'], pick: 8 },
  { name: 'Short words', blurb: 'Five letters long', items: ['APPLE', 'MANGO', 'TIGER', 'HOUSE', 'LEMON', 'HAPPY', 'WATER', 'TRAIN', 'PLANT', 'SMILE', 'CLOUD', 'ROBOT'], pick: 6 },
  { name: 'Sentences', blurb: 'Spaces and full stops', items: ['I LOVE MY CAT.', 'THE SUN IS HOT.', 'I LIKE APPLES.', 'MY DOG IS BIG.', 'WE CAN RUN FAST.', 'THE BUS IS RED.', 'I SEE A BIRD.'], pick: 4 },
];

export const PRAISE = ['Amazing!', 'Super!', 'Brilliant!', 'You got it!', 'Fantastic!', 'Wonderful!', 'Great job!', 'Yes!', 'Awesome!'];
export const ENCOURAGE = ['Almost! Try again.', "Nice try! Let's look again.", 'Oops! You can do it.', 'So close! One more try.', 'Keep going, you are learning!'];
export const pickOne = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/** Little illustrations for special keys in Meet Your Keyboard. */
export const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
