import { Download, Lock, ShieldCheck, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BarChart } from '../components/BarChart';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { Modal, TopBar, toneSoft } from '../components/ui';
import { ACTIVITIES, GAME_IDS, PATH, type ActivityId } from '../lib/activities';
import { KEYS, shortName } from '../lib/keys';
import { accuracyOf } from '../lib/adaptive';
import { levelFromStars } from '../lib/rewards';
import { actions, getState, today, totals, useStore } from '../lib/store';
import { HeatLegend, useHeat } from './MyProgress';
import { SettingsPanel } from './Settings';

function Gate({ onPass }: { onPass: () => void }) {
  const [q] = useState(() => ({ a: 3 + Math.floor(Math.random() * 7), b: 3 + Math.floor(Math.random() * 7) }));
  const [v, setV] = useState('');
  const [err, setErr] = useState(false);
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(v) === q.a * q.b) onPass();
    else {
      setErr(true);
      setV('');
    }
  };
  return (
    <form onSubmit={check} className="panel mx-auto mt-6 max-w-md p-6 text-center">
      <Lock size={40} className="mx-auto" aria-hidden />
      <h2 className="mt-3 text-[28px]">Grown-ups only</h2>
      <p className="mt-2" style={{ color: 'var(--muted)' }}>Answer this to open the parent dashboard.</p>
      <label htmlFor="gate" className="mt-5 block font-display text-[34px] font-bold">What is {q.a} × {q.b}?</label>
      <input id="gate" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={v} onChange={(e) => { setV(e.target.value.replace(/\D/g, '')); setErr(false); }}
        className="mx-auto mt-3 h-14 w-40 rounded-2xl text-center text-[26px] font-bold tnum" style={{ border: 'var(--bw) solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }} aria-invalid={err} aria-describedby={err ? 'gate-err' : undefined} />
      {err && <p id="gate-err" className="mt-2 font-bold" style={{ color: 'var(--oops)' }} role="alert">Not quite. Try again.</p>}
      <button type="submit" className="btn btn-primary mt-5 w-full">Open dashboard</button>
    </form>
  );
}

const fmtTime = (ms: number) => {
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
};

function Dashboard() {
  const s = useStore((st) => st);
  const t = totals(s);
  const lv = levelFromStars(s.stars);
  const heat = useHeat();
  const [confirm, setConfirm] = useState(false);

  const days = useMemo(() => {
    const out: { label: string; key: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      out.push({ key: today(d), label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) });
    }
    return out;
  }, []);
  const accBars = days.map((d) => {
    const x = s.days[d.key];
    const n = x ? x.correct + x.wrong : 0;
    return { label: d.label, value: n ? accuracyOf(x.correct, x.wrong) : null, note: n ? `${n} answers` : undefined };
  });
  const timeBars = days.map((d) => {
    const x = s.days[d.key];
    return { label: d.label, value: x && x.ms ? Math.round(x.ms / 60000) : null };
  });

  const hardest = Object.entries(s.keyStats)
    .filter(([, k]) => k.c + k.w >= 3 && k.w > 0)
    .map(([id, k]) => ({ id, rate: Math.round((k.w / (k.c + k.w)) * 100), n: k.c + k.w, ms: k.c ? Math.round(k.ms / k.c) : 0 }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8);

  const chrono = [...s.sessions].reverse();
  const first = chrono.slice(0, 5), last = chrono.slice(-5);
  const avg = (xs: typeof chrono) => (xs.length ? Math.round(xs.reduce((a, x) => a + x.acc, 0) / xs.length) : 0);
  const practice = s.sessions.filter((x) => x.activity === 'practice' && x.wpm);
  const avgWpm = practice.length ? Math.round(practice.reduce((a, x) => a + (x.wpm ?? 0), 0) / practice.length) : 0;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyboard-adventure-progress-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tiles: [string, string, string][] = [
    ['Learning time', fmtTime(t.ms), 'sky'],
    ['Lessons completed', `${s.lessons.length} of ${PATH.length}`, 'mint'],
    ['Current level', `Level ${lv.level}`, 'grape'],
    ['Accuracy', t.correct + t.wrong ? `${t.acc}%` : 'No answers yet', 'sun'],
    ['Typing speed', s.bestWpm ? `${avgWpm} wpm avg · best ${s.bestWpm}` : 'Not measured yet', 'pink'],
    ['Day streak', `${s.streak.count} (best ${s.streak.best})`, 'orange'],
  ];

  return (
    <div className="grid gap-4 [&>*]:min-w-0">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3 [&>*]:min-w-0">
        {tiles.map(([k, v, c]) => (
          <div key={k} className="toy p-4" style={{ background: toneSoft(c) }}>
            <dt className="eyebrow">{k}</dt>
            <dd className="m-0 mt-1 font-display text-[24px] font-bold tnum leading-tight">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-[24px]">Improvement over time</h2>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>
          {chrono.length >= 6 ? `Average accuracy went from ${avg(first)}% in the first 5 rounds to ${avg(last)}% in the latest 5.` : 'Play a few more rounds to see a trend.'}
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          <BarChart title="Accuracy per day (last 14 days)" bars={accBars} max={100} unit="%" />
          <BarChart title="Minutes played per day" bars={timeBars} unit="m" color="var(--grape)" />
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-[24px]">Hardest keys</h2>
        {hardest.length ? (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {hardest.map((h) => (
              <li key={h.id} className="toy flex items-center gap-3 p-3">
                <span className="kcap" data-kind={KEYS[h.id]?.kind ?? 'letter'} style={{ width: 52, height: 52, fontSize: KEYS[h.id]?.label.length > 2 ? 12 : 26, cursor: 'default' }}>{KEYS[h.id]?.label ?? h.id}</span>
                <span className="text-[14px]"><b className="block text-[18px] tnum">{h.rate}% missed</b>{h.n} tries{h.ms ? ` · ${(h.ms / 1000).toFixed(1)} s` : ''}<span className="sr-only"> for {shortName(h.id)}</span></span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2" style={{ color: 'var(--muted)' }}>No tricky keys yet. Keys show here after three tries.</p>}
        <div className="mt-5"><VirtualKeyboard layout="auto" heat={heat} interactive={false} label="Keyboard coloured by accuracy" /></div>
        <HeatLegend />
      </section>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-[24px]">Activities and games</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[15px]">
            <thead>
              <tr className="eyebrow"><th className="py-2">Activity</th><th>Plays</th><th>Level</th><th>Unlocked</th><th>Last accuracy</th><th>Best score</th></tr>
            </thead>
            <tbody>
              {(Object.keys(ACTIVITIES) as ActivityId[]).map((id) => {
                const a = s.activities[id];
                const best = Math.max(0, ...Object.values(a.best));
                return (
                  <tr key={id} style={{ borderTop: '1px solid color-mix(in oklab, var(--line) 18%, transparent)' }}>
                    <td className="py-2 font-bold">{ACTIVITIES[id].name}{GAME_IDS.includes(id) ? <span className="ml-2 text-[12px]" style={{ color: 'var(--muted)' }}>game</span> : null}</td>
                    <td className="tnum">{a.plays}</td>
                    <td className="tnum">{a.level} / {ACTIVITIES[id].levels.length}</td>
                    <td className="tnum">{a.unlocked}</td>
                    <td className="tnum">{a.lastAcc !== undefined ? `${a.lastAcc}%` : '–'}</td>
                    <td className="tnum">{a.plays ? best : '–'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-[24px]">Learning history</h2>
        {s.sessions.length ? (
          <ol className="mt-3 grid gap-2">
            {s.sessions.slice(0, 25).map((x) => (
              <li key={x.at} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b pb-2 text-[15px]" style={{ borderColor: 'color-mix(in oklab, var(--line) 15%, transparent)' }}>
                <span className="w-40 shrink-0 tnum" style={{ color: 'var(--muted)' }}>{new Date(x.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="min-w-[160px] flex-1 font-bold">{ACTIVITIES[x.activity].name} · L{x.level}</span>
                <span className="tnum">{x.acc}% right</span>
                <span className="tnum">{'★'.repeat(x.stars) || '—'}</span>
                {x.wpm ? <span className="tnum">{x.wpm} wpm</span> : null}
                {x.score ? <span className="tnum">score {x.score}</span> : null}
              </li>
            ))}
          </ol>
        ) : <p className="mt-2" style={{ color: 'var(--muted)' }}>Nothing played yet.</p>}
      </section>

      <section className="panel p-4 sm:p-5">
        <h2 className="text-[24px]">Settings</h2>
        <SettingsPanel />
      </section>

      <section className="panel p-4 sm:p-5" style={{ background: 'var(--mint-soft)' }}>
        <h2 className="flex items-center gap-2 text-[24px]"><ShieldCheck size={26} aria-hidden /> Privacy</h2>
        <p className="mt-2 max-w-[70ch]">There are no accounts, ads, analytics or trackers. All progress is saved in this browser only (localStorage) and never leaves the device. Voice uses the speech engine built into the browser, and every sound is made on the device.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn btn-sm" onClick={exportData}><Download size={18} aria-hidden /> Save a copy of progress</button>
          <button type="button" className="btn btn-sm btn-coral" onClick={() => setConfirm(true)}><Trash2 size={18} aria-hidden /> Reset all progress</button>
        </div>
      </section>

      <Modal open={confirm} onClose={() => setConfirm(false)} label="Reset all progress?">
        <h2 className="text-[26px]">Reset all progress?</h2>
        <p className="mt-2">This removes stars, coins, badges, levels and history from this device. Settings stay. It cannot be undone.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" className="btn" data-autofocus onClick={() => setConfirm(false)}>Keep it</button>
          <button type="button" className="btn btn-coral" onClick={() => { actions.resetAll(); setConfirm(false); }}>Reset</button>
        </div>
      </Modal>
    </div>
  );
}

export function Parents() {
  const [ok, setOk] = useState(() => {
    try { return sessionStorage.getItem('kka-parent') === '1'; } catch { return false; }
  });
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <TopBar title="Parent Dashboard" parent="/" />
      {ok ? <Dashboard /> : <Gate onPass={() => { setOk(true); try { sessionStorage.setItem('kka-parent', '1'); } catch { /* ignore */ } }} />}
    </div>
  );
}
