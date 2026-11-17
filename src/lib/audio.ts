// All sound is made in the browser: Web Audio for effects and music, speechSynthesis for KeyBot's voice.
// No audio files are downloaded.

export interface AudioPrefs {
  music: boolean;
  musicVol: number;
  sfx: boolean;
  sfxVol: number;
  voice: boolean;
  voiceVol: number;
}

let prefs: AudioPrefs = { music: true, musicVol: 0.35, sfx: true, sfxVol: 0.7, voice: true, voiceVol: 1 };
let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let unlocked = false;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    sfxBus = ctx.createGain();
    musicBus = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    sfxBus.connect(comp);
    musicBus.connect(comp);
    comp.connect(ctx.destination);
    applyVolumes();
  }
  if (ctx.state === 'suspended' && unlocked) void ctx.resume().catch(() => {});
  return ctx;
}

function applyVolumes() {
  if (!ctx || !sfxBus || !musicBus) return;
  const t = ctx.currentTime;
  sfxBus.gain.setTargetAtTime(prefs.sfx ? prefs.sfxVol : 0, t, 0.02);
  musicBus.gain.setTargetAtTime(prefs.music ? prefs.musicVol * 0.5 : 0, t, 0.2);
}

export function setAudioPrefs(p: AudioPrefs) {
  const wasMusic = prefs.music;
  prefs = p;
  applyVolumes();
  if (!p.voice) stopSpeaking();
  if (p.music && !wasMusic && unlocked) startMusic();
  if (!p.music) stopMusic();
}

/** Browsers only allow sound after the first tap or key press. */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  const c = ac();
  if (c && c.state === 'suspended') void c.resume().catch(() => {});
  if (prefs.music) startMusic();
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, slideTo?: number, bus = sfxBus) {
  const c = ac();
  if (!c || !bus) return;
  const t0 = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(bus);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise(at: number, dur: number, vol = 0.15, hp = 1200) {
  const c = ac();
  if (!c || !sfxBus) return;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(sfxBus);
  src.start(c.currentTime + at);
}

const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, E6 = 1318.5, G6 = 1568;

export const sfx = {
  key(id = '') {
    if (!prefs.sfx) return;
    const h = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    tone(380 + (h % 12) * 22, 0, 0.07, 'triangle', 0.12);
    noise(0, 0.03, 0.05, 2500);
  },
  correct() {
    if (!prefs.sfx) return;
    tone(E5, 0, 0.14, 'triangle', 0.18);
    tone(G5 * 1.0, 0.08, 0.14, 'triangle', 0.18);
    tone(C6, 0.16, 0.24, 'triangle', 0.16);
  },
  wrong() {
    if (!prefs.sfx) return;
    // a soft, friendly "boop", never a buzzer
    tone(330, 0, 0.16, 'sine', 0.16, 250);
    tone(262, 0.12, 0.2, 'sine', 0.12, 220);
  },
  star() {
    if (!prefs.sfx) return;
    [E6, G6, C6 * 2].forEach((f, i) => tone(f, i * 0.05, 0.18, 'sine', 0.08));
  },
  pop() {
    if (!prefs.sfx) return;
    tone(900, 0, 0.09, 'sine', 0.22, 180);
    noise(0, 0.05, 0.08, 3000);
  },
  coin() {
    if (!prefs.sfx) return;
    tone(1318, 0, 0.08, 'square', 0.05);
    tone(1975, 0.07, 0.22, 'square', 0.05);
  },
  whoosh() {
    if (!prefs.sfx) return;
    noise(0, 0.3, 0.08, 800);
  },
  tick() {
    if (!prefs.sfx) return;
    tone(1200, 0, 0.04, 'square', 0.04);
  },
  celebrate() {
    if (!prefs.sfx) return;
    [C5, E5, G5, C6, E6, G6].forEach((f, i) => tone(f, i * 0.085, 0.22, 'triangle', 0.14));
    [0.55, 0.65, 0.75].forEach((t) => tone(C6 * 2, t, 0.3, 'sine', 0.05));
  },
  chest() {
    if (!prefs.sfx) return;
    tone(200, 0, 0.45, 'sawtooth', 0.04, 800);
    [G5, C6, E6, G6].forEach((f, i) => tone(f, 0.4 + i * 0.07, 0.3, 'triangle', 0.12));
    for (let i = 0; i < 6; i++) tone(1800 + i * 120, 0.7 + i * 0.06, 0.12, 'square', 0.03);
  },
  unlock() {
    if (!prefs.sfx) return;
    tone(660, 0, 0.1, 'triangle', 0.14);
    tone(990, 0.09, 0.22, 'triangle', 0.14);
  },
};

// ---------- Background music: a gentle pentatonic loop scheduled ahead of time ----------
let musicTimer: number | null = null;
let nextNote = 0;
let step = 0;
const BPM = 92;
const MELODY = [0, 2, 4, 7, 4, 2, 9, 7, 0, 4, 7, 9, 7, 4, 2, -1, 4, 7, 9, 12, 9, 7, 4, 2, 0, 2, 4, 2, 0, -1, -1, -1];
const BASS = [0, 0, 5, 5, 7, 7, 5, 5];
const ROOT = 261.63; // C4
const semi = (n: number) => ROOT * Math.pow(2, n / 12);

function scheduleMusic() {
  const c = ac();
  if (!c || !musicBus) return;
  const spb = 60 / BPM / 2; // eighth notes
  while (nextNote < c.currentTime + 0.3) {
    const at = nextNote - c.currentTime;
    const m = MELODY[step % MELODY.length];
    if (m >= 0) tone(semi(m + 12), Math.max(0, at), spb * 1.6, 'triangle', 0.07, undefined, musicBus);
    if (step % 4 === 0) tone(semi(BASS[(step / 4) % BASS.length] - 12), Math.max(0, at), spb * 3.5, 'sine', 0.09, undefined, musicBus);
    nextNote += spb;
    step++;
  }
}

export function startMusic() {
  if (musicTimer !== null || !prefs.music) return;
  const c = ac();
  if (!c) return;
  nextNote = c.currentTime + 0.1;
  musicTimer = window.setInterval(scheduleMusic, 120);
}
export function stopMusic() {
  if (musicTimer !== null) window.clearInterval(musicTimer);
  musicTimer = null;
}

// ---------- Voice ----------
type SpeakListener = (speaking: boolean) => void;
const speakListeners = new Set<SpeakListener>();
export const onSpeaking = (fn: SpeakListener) => {
  speakListeners.add(fn);
  return () => void speakListeners.delete(fn);
};
const emitSpeaking = (s: boolean) => speakListeners.forEach((f) => f(s));

let voice: SpeechSynthesisVoice | null = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const vs = window.speechSynthesis.getVoices();
  if (!vs.length) return null;
  const pref = ['en-IN', 'en-GB', 'en-US', 'en-AU'];
  for (const lang of pref) {
    const v = vs.find((x) => x.lang === lang && /female|samantha|veena|karen|google/i.test(x.name)) ?? vs.find((x) => x.lang === lang);
    if (v) return v;
  }
  return vs.find((x) => x.lang.startsWith('en')) ?? null;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => (voice = pickVoice());
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string, opts: { interrupt?: boolean; rate?: number } = {}) {
  if (!prefs.voice || !canSpeak() || !text) return;
  const synth = window.speechSynthesis;
  if (opts.interrupt !== false) synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[↑↓←→]/g, ''));
  voice = voice ?? pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? 'en-IN';
  u.rate = opts.rate ?? 0.95;
  u.pitch = 1.15;
  u.volume = prefs.voiceVol;
  u.onstart = () => emitSpeaking(true);
  u.onend = () => emitSpeaking(false);
  u.onerror = () => emitSpeaking(false);
  try {
    synth.speak(u);
  } catch {
    emitSpeaking(false);
  }
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
  emitSpeaking(false);
}
