import { describe, expect, it } from 'vitest';
import { accuracyOf, decide, nextLevel, starsFor, weightedPick, wpm } from './adaptive';
import { charForId, idForChar, idFromEvent, FULL_ROWS, KEYS } from './keys';
import { dailyFor, levelFromStars } from './rewards';

describe('Smart Difficulty', () => {
  it('follows the 90 / 70 rule', () => {
    expect(decide(100)).toBe('up');
    expect(decide(90)).toBe('up');
    expect(decide(89)).toBe('stay');
    expect(decide(70)).toBe('stay');
    expect(decide(69)).toBe('down');
  });
  it('never moves past what is unlocked', () => {
    expect(nextLevel(2, 'up', 2, 5)).toBe(2);
    expect(nextLevel(2, 'up', 3, 5)).toBe(3);
    expect(nextLevel(1, 'down', 3, 5)).toBe(1);
  });
  it('rates rounds', () => {
    expect(accuracyOf(9, 1)).toBe(90);
    expect(starsFor(96)).toBe(3);
    expect(starsFor(86)).toBe(2);
    expect(starsFor(70)).toBe(1);
    expect(starsFor(50)).toBe(0);
    expect(wpm(50, 60000)).toBe(10);
  });
  it('mixes in missed keys without repeating back to back', () => {
    const pool = ['KeyA', 'KeyB', 'KeyC', 'KeyD'];
    const out = weightedPick(pool, ['KeyB'], 30, 0.5);
    expect(out).toHaveLength(30);
    for (let i = 1; i < out.length; i++) expect(out[i]).not.toBe(out[i - 1]);
  });
});

describe('keyboard model', () => {
  it('has rows that add up to the same width', () => {
    const w = (r: (typeof FULL_ROWS)[number]) => r.reduce<number>((a, k) => a + (typeof k === 'string' ? KEYS[k].w ?? 1 : k.gap), 0);
    FULL_ROWS.forEach((r) => expect(w(r)).toBe(15));
  });
  it('maps characters and events', () => {
    expect(idForChar('a')).toBe('KeyA');
    expect(idForChar(' ')).toBe('Space');
    expect(idForChar('.')).toBe('Period');
    expect(charForId('Digit7')).toBe('7');
    expect(idFromEvent({ key: 'q', code: 'KeyA' } as KeyboardEvent)).toBe('KeyQ'); // AZERTY: the letter wins
    expect(idFromEvent({ key: '5', code: 'Numpad5' } as KeyboardEvent)).toBe('Digit5');
  });
});

describe('rewards', () => {
  it('levels up on a growing star ladder', () => {
    expect(levelFromStars(0).level).toBe(1);
    expect(levelFromStars(15).level).toBe(2);
    expect(levelFromStars(44).level).toBe(2);
    expect(levelFromStars(45).level).toBe(3);
  });
  it('gives three different daily challenges, the same all day', () => {
    const a = dailyFor('2026-11-17');
    expect(new Set(a.map((d) => d.metric)).size).toBe(3);
    expect(dailyFor('2026-11-17')).toEqual(a);
  });
});
