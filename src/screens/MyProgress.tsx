import { Flame, Star } from 'lucide-react';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { Bot, ProgressBar, Stars, TopBar, tone } from '../components/ui';
import { ACTIVITIES, PATH, type ActivityId } from '../lib/activities';
import { levelFromStars } from '../lib/rewards';
import { useStore } from '../lib/store';

/** Key colour by how often the child gets it right (untried keys keep their normal colour). */
export function useHeat() {
  const ks = useStore((s) => s.keyStats);
  const heat: Record<string, string> = {};
  for (const [id, k] of Object.entries(ks)) {
    const n = k.c + k.w;
    if (n < 1) continue;
    const r = k.c / n;
    heat[id] = r >= 0.9 ? 'var(--mint)' : r >= 0.7 ? 'var(--sun)' : 'var(--coral)';
  }
  return heat;
}

export function HeatLegend() {
  return (
    <ul className="mt-3 flex flex-wrap gap-2 text-[14px] font-bold" aria-label="Key colours">
      {[['mint', 'Easy for you'], ['sun', 'Getting there'], ['coral', 'Practise more']].map(([c, l]) => (
        <li key={c} className="chip" style={{ minHeight: 34 }}><span className="h-3.5 w-3.5 rounded" style={{ background: tone(c), border: '1px solid var(--border-strong)' }} aria-hidden /> {l}</li>
      ))}
    </ul>
  );
}

export function MyProgress() {
  const s = useStore((st) => st);
  const lv = levelFromStars(s.stars);
  const heat = useHeat();
  const pct = Math.round((s.lessons.length / PATH.length) * 100);
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <TopBar title="My Progress" parent="/" />
      <Bot text={`You are on level ${lv.level}! ${lv.need - lv.into} more stars to reach level ${lv.level + 1}.`} mood="happy" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="eyebrow">Level {lv.level}</p>
          <p className="mt-1 flex items-center gap-2 text-[22px] font-bold tnum"><Star size={20} fill="var(--sun)" stroke="#b7860b" aria-hidden /> {s.stars} stars</p>
          <div className="mt-2"><ProgressBar pct={lv.pct} label={`Stars to level ${lv.level + 1}`} /></div>
        </div>
        <div className="panel p-4">
          <p className="eyebrow">Learning path</p>
          <p className="mt-1 text-[22px] font-bold tnum">{pct}%</p>
          <div className="mt-2"><ProgressBar pct={pct} label="Learning path" /></div>
        </div>
        <div className="panel p-4">
          <p className="eyebrow">Day streak</p>
          <p className="mt-1 flex items-center gap-2 text-[22px] font-bold tnum"><Flame size={20} stroke="var(--orange)" aria-hidden /> {s.streak.count} {s.streak.count === 1 ? 'day' : 'days'}</p>
          <p className="mt-1 text-[14px] font-bold" style={{ color: 'var(--muted)' }}>Best: {s.streak.best}</p>
        </div>
      </div>
      <section className="panel mt-4 p-4 sm:p-5" aria-labelledby="heat-h">
        <h2 id="heat-h" className="text-[18px]">Your keyboard</h2>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>Green keys are easy for you. Yellow ones are getting there, and red ones need a little more practice.</p>
        <div className="mt-4"><VirtualKeyboard layout="auto" heat={heat} interactive={false} /></div>
        <HeatLegend />
      </section>
      <section className="mt-4" aria-labelledby="act-h">
        <h2 id="act-h" className="text-[18px]">Every activity</h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(ACTIVITIES) as ActivityId[]).map((id) => {
            const m = ACTIVITIES[id];
            const a = s.activities[id];
            const passed = m.levels.filter((_, i) => (a.rating[i + 1] ?? 0) > 0).length;
            return (
              <li key={id} className="toy flex items-center gap-3 p-3">
                
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold">{m.name}</span>
                  <span className="block text-[14px] font-bold tnum" style={{ color: 'var(--muted)' }}>{passed} of {m.levels.length} levels passed · played {a.plays}×</span>
                </span>
                <Stars n={Math.min(3, a.rating[a.level] ?? 0)} size={16} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
