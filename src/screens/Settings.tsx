import { Music, Volume2, MessageCircle, Contrast, Wind, SunMoon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Slider, Toggle, TopBar } from '../components/ui';
import { actions, useStore, type Settings } from '../lib/store';
import { canSpeak, speak, sfx } from '../lib/audio';

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3 border-b py-2 last:border-b-0" style={{ borderColor: 'color-mix(in oklab, var(--line) 15%, transparent)' }}>
      <span className="mt-3 shrink-0" aria-hidden>{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Sound, voice and display settings. Used on the Settings screen and in the parent dashboard. */
export function SettingsPanel() {
  const st = useStore((s) => s.settings);
  const set = (p: Partial<Settings>) => actions.settings(p);
  return (
    <div>
      <Row icon={<Music size={24} />}>
        <Toggle on={st.music} onChange={(v) => set({ music: v })} label="Background music" hint="A gentle tune made on this device." />
        <Slider value={st.musicVol} onChange={(v) => set({ musicVol: v })} label="Music volume" disabled={!st.music} />
      </Row>
      <Row icon={<Volume2 size={24} />}>
        <Toggle on={st.sfx} onChange={(v) => { set({ sfx: v }); if (v) window.setTimeout(() => sfx.correct(), 50); }} label="Sound effects" hint="Key clicks, pops and cheers." />
        <Slider value={st.sfxVol} onChange={(v) => set({ sfxVol: v })} label="Sound effects volume" disabled={!st.sfx} />
      </Row>
      <Row icon={<MessageCircle size={24} />}>
        <Toggle on={st.voice} onChange={(v) => { set({ voice: v }); if (v) window.setTimeout(() => speak('Hello! I am KeyBot.'), 50); }} label="KeyBot's voice" hint={canSpeak() ? 'Reads instructions, letters and words aloud.' : 'This browser has no speech voice. KeyBot will use speech bubbles.'} />
        <Slider value={st.voiceVol} onChange={(v) => set({ voiceVol: v })} label="Voice volume" disabled={!st.voice} />
      </Row>
      <Row icon={<SunMoon size={24} />}>
        <div className="py-2">
          <span className="block font-bold">Colours</span>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Colour theme">
            {(['auto', 'light', 'dark'] as const).map((t) => (
              <button key={t} type="button" role="radio" aria-checked={st.theme === t} className="kb-tab" onClick={() => set({ theme: t })}>
                {t === 'auto' ? 'Match device' : t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </div>
      </Row>
      <Row icon={<Contrast size={24} />}>
        <Toggle on={st.contrast} onChange={(v) => set({ contrast: v })} label="High contrast" hint="Black and white keys with thicker outlines." />
      </Row>
      <Row icon={<Wind size={24} />}>
        <Toggle on={st.reducedMotion} onChange={(v) => set({ reducedMotion: v })} label="Less movement" hint="Turns off bouncing, confetti and flying stars." />
      </Row>
    </div>
  );
}

export function SettingsScreen() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-12 sm:px-6">
      <TopBar title="Settings" parent="/" />
      <section className="panel p-4 sm:p-6"><SettingsPanel /></section>
    </div>
  );
}
