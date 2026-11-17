// Smart Difficulty. One rule for every activity:
//   90–100% accuracy → harder,  70–89% → stay,  under 70% → easier, with hints switched on.
// A level counts as passed (and unlocks the next one) at PASS_ACCURACY or better.

export type Decision = 'up' | 'stay' | 'down';
export const PASS_ACCURACY = 70;

export function decide(accuracy: number): Decision {
  if (accuracy >= 90) return 'up';
  if (accuracy >= 70) return 'stay';
  return 'down';
}

export function accuracyOf(correct: number, wrong: number): number {
  const total = correct + wrong;
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

/** 1–3 stars for a finished round. */
export function starsFor(accuracy: number): number {
  if (accuracy >= 95) return 3;
  if (accuracy >= 85) return 2;
  if (accuracy >= PASS_ACCURACY) return 1;
  return 0;
}

/** Level to play next, clamped to what is unlocked. */
export function nextLevel(current: number, decision: Decision, unlocked: number, max: number): number {
  if (decision === 'up') return Math.min(current + 1, unlocked, max);
  if (decision === 'down') return Math.max(1, current - 1);
  return current;
}

/** Words per minute (5 characters = 1 word). */
export function wpm(chars: number, ms: number): number {
  if (ms < 1000) return 0;
  return Math.round((chars / 5) / (ms / 60000));
}

/** Pick keys to practise: mostly random, with a share of the child's most-missed keys. */
export function weightedPick(pool: string[], missed: string[], n: number, missedShare = 0.3): string[] {
  const out: string[] = [];
  const miss = missed.filter((m) => pool.includes(m));
  let last = '';
  for (let i = 0; i < n; i++) {
    let k: string;
    let guard = 0;
    do {
      k = miss.length && Math.random() < missedShare ? miss[Math.floor(Math.random() * miss.length)] : pool[Math.floor(Math.random() * pool.length)];
      guard++;
    } while ((k === last || (pool.length > n && out.includes(k))) && guard < 20);
    out.push(k);
    last = k;
  }
  return out;
}

export const shuffle = <T,>(a: T[]): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
