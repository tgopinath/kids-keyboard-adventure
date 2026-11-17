import { Check, Coins, Lock, Trophy } from 'lucide-react';
import { useState } from 'react';
import { KeyBot } from '../components/KeyBot';
import { Bot, CoinPill, ICONS, StarPill, TopBar } from '../components/ui';
import { ACTIVITIES, type ActivityId } from '../lib/activities';
import { BADGES, SHOP, TROPHY_NAMES, type ShopItem, type Slot } from '../lib/rewards';
import { actions, useStore } from '../lib/store';
import { sfx, speak } from '../lib/audio';

const TABS = [
  { id: 'badges', name: 'Badges' },
  { id: 'trophies', name: 'Trophies' },
  { id: 'shop', name: 'Robot Shop' },
  { id: 'worlds', name: 'Worlds' },
] as const;
type Tab = (typeof TABS)[number]['id'];
const SLOT_NAMES: Record<Exclude<Slot, 'world'>, string> = { skin: 'Colours', head: 'Hats', face: 'Glasses', neck: 'Neck' };

function ItemCard({ item }: { item: ShopItem }) {
  const owned = useStore((s) => s.owned.includes(item.id));
  const worn = useStore((s) => s.equipped[item.slot] === item.id);
  const coins = useStore((s) => s.coins);
  const can = coins >= item.price;
  const act = () => {
    if (owned) {
      actions.equip(item.id);
      sfx.pop();
    } else if (actions.buy(item.id)) {
      sfx.coin();
      speak(`You got ${item.name}!`);
    }
  };
  const world = item.slot === 'world' ? item.id.split(':')[1] : null;
  return (
    <li className="toy flex flex-col items-center gap-2 p-3 text-center" style={{ borderColor: worn ? 'var(--primary)' : undefined, boxShadow: worn ? 'inset 0 0 0 1px var(--primary)' : undefined }}>
      {world ? (
        <span className={`stage world-${world} block h-24 w-full`} aria-hidden />
      ) : (
        <KeyBot size={64} still outfit={{ [item.slot]: item.id }} />
      )}
      <span className="text-[15px] font-bold">{item.name}</span>
      <button type="button" className={`btn btn-sm w-full ${owned ? (worn ? '' : 'btn-mint') : can ? 'btn-sun' : ''}`} disabled={worn || (!owned && !can)} onClick={act}
        aria-label={owned ? (worn ? `${item.name}, in use` : `Use ${item.name}`) : `Buy ${item.name} for ${item.price} coins`}>
        {worn ? <><Check size={18} aria-hidden /> In use</> : owned ? 'Use' : <><Coins size={18} aria-hidden /> {item.price}</>}
      </button>
      {!owned && !can && <span className="text-[13px] font-bold" style={{ color: 'var(--muted)' }}>{item.price - coins} more coins</span>}
    </li>
  );
}

export function Rewards() {
  const [tab, setTab] = useState<Tab>('badges');
  const s = useStore((st) => st);
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <TopBar title="My Rewards" parent="/" />
      <section className="panel flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <KeyBot size={72} mood="happy" />
        <div className="min-w-[240px] flex-1">
          <p className="text-[20px] font-bold leading-tight">Your treasure room</p>
          <p className="mt-1 muted">Earn coins in games, then dress up KeyBot and unlock new worlds.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StarPill n={s.stars} /><CoinPill n={s.coins} />
            <span className="chip">{s.badges.length} of {BADGES.length} badges</span>
            <span className="chip">{s.chests} chests opened</span>
          </div>
        </div>
      </section>

      <div className="kb-tabs mt-5 justify-start" role="tablist" aria-label="Reward sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-controls={`panel-${t.id}`} aria-selected={tab === t.id} className="kb-tab" onClick={() => setTab(t.id)}>{t.name}</button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-2">
        {tab === 'badges' && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {BADGES.map((b) => {
              const got = s.badges.includes(b.id);
              const I = ICONS[b.icon];
              return (
                <li key={b.id} className="toy flex flex-col items-center gap-2 p-4 text-center" style={{ background: got ? 'var(--surface)' : 'var(--surface-2)' }}>
                  <span className="grid h-14 w-14 place-items-center rounded-full" style={{ background: got ? 'var(--primary-soft)' : 'var(--surface)', color: got ? 'var(--primary-strong)' : 'var(--muted)', border: '1px solid var(--border)' }}>
                    {got ? <I size={26} strokeWidth={2} aria-hidden /> : <Lock size={22} aria-hidden />}
                  </span>
                  <span className="text-[15px] font-bold leading-tight">{b.name}</span>
                  <span className="text-[13px] muted">{got ? `Earned ${new Date(s.badgeDates[b.id] ?? Date.now()).toLocaleDateString()}` : b.how}</span>
                </li>
              );
            })}
          </ul>
        )}
        {tab === 'trophies' && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(Object.keys(TROPHY_NAMES) as ActivityId[]).map((id) => {
              const meta = ACTIVITIES[id];
              const a = s.activities[id];
              const passed = meta.levels.filter((_, i) => (a.rating[i + 1] ?? 0) > 0).length;
              const got = passed === meta.levels.length;
              return (
                <li key={id} className="toy flex flex-col items-center gap-2 p-4 text-center" style={{ background: got ? 'var(--surface)' : 'var(--surface-2)' }}>
                  <Trophy size={36} strokeWidth={1.8} fill={got ? 'var(--sun)' : 'transparent'} color={got ? '#b7860b' : 'var(--muted)'} style={{ opacity: got ? 1 : 0.6 }} aria-hidden />
                  <span className="text-[15px] font-bold leading-tight">{TROPHY_NAMES[id]}</span>
                  <span className="text-[13px] tnum muted">{got ? 'Won!' : `${passed} of ${meta.levels.length} levels in ${meta.name}`}</span>
                </li>
              );
            })}
          </ul>
        )}
        {tab === 'shop' && (
          <div className="grid gap-6">
            <Bot text="Tap a coin button to buy. Tap Use to change what KeyBot wears." mood="happy" speakOnChange={false} />
            {(Object.keys(SLOT_NAMES) as (keyof typeof SLOT_NAMES)[]).map((slot) => (
              <section key={slot} aria-labelledby={`slot-${slot}`}>
                <h2 id={`slot-${slot}`} className="mb-3 text-[17px]">{SLOT_NAMES[slot]}</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {SHOP.filter((i) => i.slot === slot).map((i) => <ItemCard key={i.id} item={i} />)}
                </ul>
              </section>
            ))}
          </div>
        )}
        {tab === 'worlds' && (
          <div>
            <p className="mb-3 font-bold" style={{ color: 'var(--muted)' }}>Your world is the background of every game.</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {SHOP.filter((i) => i.slot === 'world').map((i) => <ItemCard key={i.id} item={i} />)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
