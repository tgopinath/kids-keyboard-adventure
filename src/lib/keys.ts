// Keyboard model: every key the app knows, its position on a standard US/India QWERTY layout,
// a child-friendly name and a one-line explanation.

export type KeyKind = 'letter' | 'number' | 'symbol' | 'action' | 'modifier' | 'function' | 'arrow' | 'space';

export interface KeyDef {
  id: string; // KeyboardEvent.code
  label: string;
  shift?: string; // the character printed above (Shift + key)
  name: string; // spoken / shown name
  kind: KeyKind;
  w?: number; // width in key units (default 1)
  info: string;
  char?: string; // the character this key types (uppercase for letters)
}

const L = (ch: string): KeyDef => ({
  id: `Key${ch}`,
  label: ch,
  name: `the letter ${ch}`,
  kind: 'letter',
  info: `Types the letter ${ch}. Hold Shift or turn on Caps Lock for a capital ${ch}.`,
  char: ch,
});
const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const SHIFT_NUM = [')', '!', '@', '#', '$', '%', '^', '&', '*', '('];
const D = (n: number): KeyDef => ({
  id: `Digit${n}`,
  label: String(n),
  shift: SHIFT_NUM[n],
  name: `the number ${n}`,
  kind: 'number',
  info: `Types the number ${NUM_WORDS[n]}. With Shift it types ${SHIFT_NUM[n]}.`,
  char: String(n),
});
const S = (id: string, label: string, shift: string, name: string, info: string): KeyDef => ({
  id, label, shift, name, kind: 'symbol', info, char: label,
});
const F = (n: number): KeyDef => ({
  id: `F${n}`,
  label: `F${n}`,
  name: `F${n}`,
  kind: 'function',
  info: `A function key. Apps give F${n} a special job${n === 1 ? ', often Help' : n === 5 ? ', like reloading a web page' : ''}.`,
});

export const KEYS: Record<string, KeyDef> = {};
const add = (k: KeyDef) => (KEYS[k.id] = k);

'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c) => add(L(c)));
for (let i = 0; i <= 9; i++) add(D(i));
for (let i = 1; i <= 12; i++) add(F(i));
[
  S('Backquote', '`', '~', 'the backtick', 'Types a backtick. With Shift it types a wavy tilde ~.'),
  S('Minus', '-', '_', 'the minus key', 'Types a minus or dash. With Shift it types an underscore _.'),
  S('Equal', '=', '+', 'the equals key', 'Types an equals sign. With Shift it types a plus +.'),
  S('BracketLeft', '[', '{', 'the open bracket', 'Types an open square bracket. With Shift it types {.'),
  S('BracketRight', ']', '}', 'the close bracket', 'Types a close square bracket. With Shift it types }.'),
  S('Backslash', '\\', '|', 'the backslash', 'Types a backslash. With Shift it types a straight line |.'),
  S('Semicolon', ';', ':', 'the semicolon', 'Types a semicolon. With Shift it types a colon :.'),
  S('Quote', "'", '"', 'the quote key', 'Types an apostrophe, like in "it\'s". With Shift it types quotes ".'),
  S('Comma', ',', '<', 'the comma', 'Types a comma to take a little pause in a sentence.'),
  S('Period', '.', '>', 'the full stop', 'Types a full stop. It ends a sentence.'),
  S('Slash', '/', '?', 'the question mark key', 'Types a slash. With Shift it types a question mark ?.'),
].forEach(add);
[
  { id: 'Escape', label: 'Esc', name: 'Escape', kind: 'action', info: 'Escape means "stop" or "go back". It closes menus and pop-ups.' },
  { id: 'Backspace', label: 'Backspace', name: 'Backspace', kind: 'action', w: 2, info: 'Rubs out the letter just before the cursor. Oops-fixer!' },
  { id: 'Tab', label: 'Tab', name: 'Tab', kind: 'action', w: 1.5, info: 'Jumps forward a big step, or moves to the next button on the screen.' },
  { id: 'Enter', label: 'Enter', name: 'Enter', kind: 'action', w: 2.25, info: 'Says "I am done!" It starts a new line or sends what you typed.' },
  { id: 'Space', label: 'Space', name: 'the Spacebar', kind: 'space', w: 6, info: 'The biggest key. It puts a space between words.', char: ' ' },
  { id: 'CapsLock', label: 'Caps Lock', name: 'Caps Lock', kind: 'modifier', w: 1.75, info: 'Turns capital letters on, and off again when you press it twice.' },
  { id: 'ShiftLeft', label: 'Shift', name: 'Shift', kind: 'modifier', w: 2.25, info: 'Hold Shift and press a letter to make it a capital letter.' },
  { id: 'ShiftRight', label: 'Shift', name: 'Shift', kind: 'modifier', w: 2.75, info: 'There are two Shift keys. Hold one and press a letter for a capital.' },
  { id: 'ControlLeft', label: 'Ctrl', name: 'Control', kind: 'modifier', w: 1.5, info: 'Control works with other keys to give shortcuts, like Ctrl and C to copy.' },
  { id: 'AltLeft', label: 'Alt', name: 'Alt', kind: 'modifier', w: 1.25, info: 'Alt also works with other keys to make shortcuts. On a Mac it is called Option.' },
  { id: 'MetaLeft', label: 'Cmd', name: 'Command or Windows key', kind: 'modifier', w: 1.25, info: 'On a Mac this is Command. On Windows it is the Windows key that opens the Start menu.' },
  { id: 'MetaRight', label: 'Cmd', name: 'Command or Windows key', kind: 'modifier', w: 1.25, info: 'A second Command or Windows key, for your right hand.' },
  { id: 'AltRight', label: 'Alt', name: 'Alt', kind: 'modifier', w: 1.25, info: 'A second Alt key, for your right hand.' },
  { id: 'ControlRight', label: 'Ctrl', name: 'Control', kind: 'modifier', w: 1.5, info: 'A second Control key, for your right hand.' },
  { id: 'ArrowUp', label: '↑', name: 'the up arrow', kind: 'arrow', info: 'Moves up. In games it often makes you jump!' },
  { id: 'ArrowDown', label: '↓', name: 'the down arrow', kind: 'arrow', info: 'Moves down the page or the list.' },
  { id: 'ArrowLeft', label: '←', name: 'the left arrow', kind: 'arrow', info: 'Moves left, one step at a time.' },
  { id: 'ArrowRight', label: '→', name: 'the right arrow', kind: 'arrow', info: 'Moves right, one step at a time.' },
].forEach((k) => add(k as KeyDef));

export type Row = (string | { gap: number })[];

/** Full keyboard: main block rows. Arrow cluster is drawn separately to the right. */
export const FULL_ROWS: Row[] = [
  ['Escape', { gap: 1 }, 'F1', 'F2', 'F3', 'F4', { gap: 0.5 }, 'F5', 'F6', 'F7', 'F8', { gap: 0.5 }, 'F9', 'F10', 'F11', 'F12'],
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
  ['ControlLeft', 'AltLeft', 'MetaLeft', 'Space', 'MetaRight', 'AltRight', 'ControlRight'],
];
KEYS.Backslash.w = 1.5;
KEYS.Space.w = 7;

export const LETTER_ROWS: Row[] = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  [{ gap: 0.5 }, 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', { gap: 0.5 }],
  [{ gap: 1.5 }, 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', { gap: 1.5 }],
];

/** Compact sections for phones: same keys, grouped into tabs so they stay big enough to tap. */
export const COMPACT: Record<'abc' | 'num' | 'more', { label: string; rows: Row[]; widths?: Record<string, number> }> = {
  abc: {
    label: 'ABC',
    rows: [
      LETTER_ROWS[0],
      LETTER_ROWS[1],
      ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Backspace'],
      ['CapsLock', 'Comma', 'Space', 'Period', 'Enter'],
    ],
    widths: { ShiftLeft: 1.5, Backspace: 1.5, CapsLock: 1.5, Space: 4.5, Enter: 2, Comma: 1, Period: 1 },
  },
  num: {
    label: '123 ?',
    rows: [
      ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'],
      ['Backquote', 'Minus', 'Equal', 'BracketLeft', 'BracketRight', 'Backslash'],
      ['Semicolon', 'Quote', 'Comma', 'Period', 'Slash', 'Backspace'],
      ['Space', 'Enter'],
    ],
    widths: { Backslash: 1, Backspace: 1.6, Space: 6, Enter: 3 },
  },
  more: {
    label: 'Fn ⇧ ←',
    rows: [
      ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
      ['Tab', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
      ['CapsLock', 'ShiftLeft', 'ControlLeft', 'AltLeft', 'MetaLeft'],
      [{ gap: 3 }, 'ArrowUp', { gap: 3 }],
      [{ gap: 2 }, 'ArrowLeft', 'ArrowDown', 'ArrowRight', { gap: 2 }],
    ],
    widths: { Tab: 1, CapsLock: 1.6, ShiftLeft: 1.6, ControlLeft: 1.3, AltLeft: 1.3, MetaLeft: 1.3, Escape: 1 },
  },
};

export const compactSectionOf = (id: string): keyof typeof COMPACT => {
  for (const s of ['abc', 'num', 'more'] as const) if (COMPACT[s].rows.some((r) => r.includes(id))) return s;
  return 'more';
};

export const LETTER_IDS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => `Key${c}`);
export const DIGIT_IDS = '0123456789'.split('').map((d) => `Digit${d}`);
export const HOME_ROW = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'];
export const TOP_ROW = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'];
export const BOTTOM_ROW = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'];

/** Keys a child can be asked to find in Advanced mode (ones that won't fight the browser or OS). */
export const ADVANCED_TARGETS = [
  ...LETTER_IDS, ...DIGIT_IDS,
  'Space', 'Enter', 'Backspace', 'Tab', 'ShiftLeft', 'CapsLock', 'Escape', 'ControlLeft',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Comma', 'Period', 'Slash', 'Semicolon', 'Quote', 'Minus', 'Equal', 'BracketLeft', 'BracketRight',
  'F1', 'F2', 'F3', 'F4', 'F6', 'F7', 'F8', 'F9', 'F10',
];

/** Rows a child can be pointed to as a hint. */
export function rowHint(id: string): string {
  if (FULL_ROWS[0].includes(id)) return 'in the very top row';
  if (FULL_ROWS[1].includes(id)) return 'in the number row, near the top';
  if (FULL_ROWS[2].includes(id)) return 'in the row under the numbers';
  if (FULL_ROWS[3].includes(id)) return 'in the middle row';
  if (FULL_ROWS[4].includes(id)) return 'in the row near the bottom';
  if (FULL_ROWS[5].includes(id)) return 'in the bottom row';
  if (id.startsWith('Arrow')) return 'in the arrow keys at the bottom right';
  return 'on the keyboard';
}

/** Normalise a physical KeyboardEvent to one of our key ids (null if we don't show that key). */
export function idFromEvent(e: KeyboardEvent): string | null {
  const key = e.key;
  if (key && key.length === 1 && /[a-z]/i.test(key)) return `Key${key.toUpperCase()}`;
  const code = e.code;
  if (code.startsWith('Numpad')) {
    const rest = code.slice(6);
    if (/^\d$/.test(rest)) return `Digit${rest}`;
    if (rest === 'Enter') return 'Enter';
    if (rest === 'Decimal') return 'Period';
    if (rest === 'Subtract') return 'Minus';
    if (rest === 'Divide') return 'Slash';
    return null;
  }
  if (code === 'IntlBackslash') return 'Backslash';
  if (code === 'OSLeft') return 'MetaLeft';
  if (code === 'OSRight') return 'MetaRight';
  if (KEYS[code]) return code;
  if (!code && key) {
    if (/^\d$/.test(key)) return `Digit${key}`;
    if (key === ' ') return 'Space';
    if (KEYS[key]) return key;
  }
  return null;
}

/** Character → key id (for typing practice). */
export function idForChar(ch: string): string | null {
  const c = ch.toUpperCase();
  if (/^[A-Z]$/.test(c)) return `Key${c}`;
  if (/^\d$/.test(c)) return `Digit${c}`;
  if (c === ' ') return 'Space';
  const sym = Object.values(KEYS).find((k) => k.kind === 'symbol' && (k.label === c || k.shift === c));
  return sym ? sym.id : null;
}

/** Key id → the character it types (uppercase letters). */
export function charForId(id: string): string | null {
  return KEYS[id]?.char ?? null;
}

export const LETTER_SAY: Record<string, string> = {
  A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'ef', G: 'jee', H: 'aitch', I: 'eye', J: 'jay', K: 'kay',
  L: 'el', M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar', S: 'ess', T: 'tee', U: 'you', V: 'vee',
  W: 'double you', X: 'ex', Y: 'why', Z: 'zed',
};

/** Words a speech engine can say for a key. */
export function spokenName(id: string): string {
  const k = KEYS[id];
  if (!k) return id;
  if (k.kind === 'letter') return `the letter ${LETTER_SAY[k.label]}`;
  return k.name;
}

/** Short display word for a key in prompts ("B", "5", "Spacebar"). */
export function shortName(id: string): string {
  const k = KEYS[id];
  if (!k) return id;
  if (k.kind === 'letter' || k.kind === 'number') return k.label;
  if (id === 'Space') return 'Spacebar';
  if (k.kind === 'symbol') return k.name.replace(/^the /, '');
  return k.name.replace(/^the /, '');
}
