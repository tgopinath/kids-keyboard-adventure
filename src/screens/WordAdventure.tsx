import { motion } from 'framer-motion';
import { Lock, Sailboat } from 'lucide-react';
import { useMemo } from 'react';
import { Frame, useRound } from '../components/Frame';
import { Art } from '../components/Art';
import { Stars } from '../components/ui';
import { ISLANDS, WORD_ART } from '../lib/content';
import { useStore } from '../lib/store';
import { WordBoard } from './games/WordBuilder';

function IslandMap({ current, onPick }: { current: number; onPick: (l: number) => void }) {
  const a = useStore((s) => s.activities.words);
  return (
    <section className="mt-6" aria-labelledby="islands-h">
      <h2 id="islands-h" className="text-[18px]">Islands</h2>
      <p className="mt-1" style={{ color: 'var(--muted)' }}>Finish an island to sail to the next one.</p>
      <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ISLANDS.map((isl, i) => {
          const l = i + 1;
          const locked = l > a.unlocked;
          const sel = l === current;
          return (
            <li key={isl.id}>
              <motion.button type="button" disabled={locked} onClick={() => onPick(l)} whileHover={locked ? undefined : { y: -4 }}
                className={`stage world-${isl.world} flex min-h-[150px] w-full flex-col justify-between p-4 text-left`}
                style={{ outline: sel ? '2px solid var(--primary)' : 'none', outlineOffset: 2, opacity: locked ? 0.7 : 1 }}
                aria-label={`Island ${l}: ${isl.name}${locked ? ', locked' : ''}`} aria-pressed={sel}>
                <span className="flex items-center justify-between">
                  <span className="sticker">Island {l}</span>
                  {locked ? <span className="chip"><Lock size={16} aria-hidden /> Locked</span> : <span className="chip"><Stars n={a.rating[l] ?? 0} size={16} /></span>}
                </span>
                <span className="flex items-end justify-between gap-2">
                  <span className="toy px-3 py-2" style={{ background: 'var(--surface)' }}>
                    <span className="block text-[17px] font-bold leading-tight">{isl.name}</span>
                    <span className="block text-[14px] font-bold" style={{ color: 'var(--muted)' }}>{isl.blurb}</span>
                  </span>
                  <span className="flex -space-x-4" aria-hidden>
                    {isl.words.slice(0, 3).map((w) => <span key={w} className="grid h-11 w-11 place-items-center rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><Art name={WORD_ART[w]} size={32} /></span>)}
                  </span>
                </span>
              </motion.button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function WordAdventure({ level }: { level: number | null }) {
  const round = useRound('words', level);
  const island = ISLANDS[round.level - 1] ?? ISLANDS[0];
  const words = useMemo(() => [...island.words], [island]);
  return (
    <Frame round={round} wide title={round.phase === 'ready' ? 'Word Adventure' : island.name}
      introText={`Ahoy! Next stop: ${island.name}. Build all ${island.words.length} words to win the island!`}
      introExtra={<p className="mt-4 flex items-center justify-center gap-2 font-bold"><Sailboat size={22} aria-hidden /> Island {round.level}: {island.name}</p>}
      readyBelow={<IslandMap current={round.level} onPick={round.setLevel} />}>
      <WordBoard round={round} words={words} scoring={false} />
    </Frame>
  );
}
