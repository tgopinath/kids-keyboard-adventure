// Captures the portfolio card screenshots: node tools/shots.mjs
//   Phone shots: 600-wide JPEGs in prototype/shots. Desktop: 1440x900 JPEG in tools/web-keyboard.jpg
//   SHOT_URL=https://… to shoot the live site (default: local dev server). SHOT_DARK=1 for dark mode.
//   SHOT_OUT=/some/dir writes everything there instead (for design checks).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { HELPERS, launch, sleep } from './cdp.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const URL = process.env.SHOT_URL || 'http://localhost:5360/';
const OUT = process.env.SHOT_OUT || path.join(ROOT, 'prototype', 'shots');
const WEB = process.env.SHOT_OUT ? path.join(OUT, 'web.jpg') : path.join(ROOT, 'tools', 'web-keyboard.jpg');
fs.mkdirSync(OUT, { recursive: true });

const b = await launch(ROOT);
try {
  const { send, evaluate } = b;
  const snap = async (file, width = 600, out = path.join(OUT, `${file}.jpg`)) => {
    const s = await send('Page.captureScreenshot', { format: 'png' });
    const png = path.join(b.tmp, `${file}.png`);
    fs.writeFileSync(png, Buffer.from(s.result.data, 'base64'));
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '84', '--resampleWidth', String(width), png, '--out', out], { stdio: 'pipe' });
  };
  const go = async (hash, ms = 1300) => { await evaluate(`location.hash = ${JSON.stringify(hash)}; scrollTo(0,0); 1`); await sleep(ms); };
  const playBtn = `[...document.querySelectorAll('main button')].find(b=>b.textContent.trim()==='Play').click()`;
  // A child who has played a little: some stars, coins, a few lessons, an outfit.
  const seed = async () => {
    await send('Page.navigate', { url: URL });
    await sleep(2200);
    await evaluate(`localStorage.clear(); localStorage.setItem('kka-catcher-speed','slow'); 1`);
    await send('Page.navigate', { url: URL });
    await sleep(2200);
    await evaluate(HELPERS);
    await evaluate(`(() => { const k = 'kids-keyboard-adventure:v1'; const s = JSON.parse(localStorage.getItem(k) || 'null'); return !!s })()`);
    for (const r of ['#/learn/find', '#/learn/alphabet', '#/learn/numbers']) await evaluate(`__auto(${JSON.stringify(r)}, { wait: 300, wrongEvery: 7 })`);
    await evaluate(`(() => { window.__kkaNoSave = true; const k='kids-keyboard-adventure:v1'; const s = JSON.parse(localStorage.getItem(k)); s.coins = 140; s.owned.push('head:party','neck:bow','skin:mint'); s.equipped.head='head:party'; s.equipped.neck='neck:bow'; s.profile = { name: 'Asha', avatar: 0 }; s.streak = { last: s.streak.last, count: 3, best: 4 }; s.settings.music = false; s.settings.voice = false; localStorage.setItem(k, JSON.stringify(s)); location.hash = '#/'; location.reload(); 1 })()`);
    await sleep(2600);
    await evaluate(HELPERS);
  };
  if (process.env.SHOT_DARK) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  else await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });

  // Desktop browser-window thumb.
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await seed();
  await go('#/learn/explore');
  await evaluate(`__pid('KeyA'); 1`);
  await sleep(1500);
  await snap('web', 1440, WEB);
  if (process.env.SHOT_OUT) {
    await go('#/'); await snap('d-home', 1440);
    await go('#/games/bubbles'); await evaluate(playBtn); await sleep(1600); await snap('d-bubbles', 1440);
    await go('#/parents'); await evaluate(`sessionStorage.setItem('kka-parent','1'); 1`); await go('#/'); await go('#/parents', 1500); await snap('d-parents', 1440);
  }

  // Phone shots.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await go('#/', 5200);
  await snap('home');
  await go('#/learn/explore');
  await evaluate(`__pid('KeyE'); 1`);
  await sleep(1500);
  await snap('explore');
  await go('#/games/falling');
  await evaluate(playBtn);
  await sleep(3800);
  await snap('falling');
  await go('#/games/builder');
  await evaluate(playBtn);
  await sleep(1500);
  await evaluate(`__pid(document.querySelector('[data-target]').dataset.target); 1`);
  await sleep(900);
  await snap('builder');
  await go('#/rewards');
  await evaluate(`[...document.querySelectorAll('[role=tab]')].find(t=>t.textContent.includes('Robot Shop')).click(); 1`);
  await sleep(900);
  await snap('shop');
  if (process.env.SHOT_OUT) {
    await go('#/learn/find'); await evaluate(playBtn); await sleep(1500); await snap('m-find');
    await go('#/practice'); await evaluate(playBtn); await sleep(1500); await snap('m-practice');
    await go('#/learn/memory'); await evaluate(playBtn); await sleep(1500); await snap('m-memory');
    await go('#/games/treasure'); await evaluate(playBtn); await sleep(1500); await snap('m-treasure');
    await go('#/games/catcher'); await evaluate(playBtn); await sleep(4000); await snap('m-catcher');
    await go('#/words'); await snap('m-words');
    await go('#/parents', 1500); await snap('m-parents');
    await go('#/progress'); await snap('m-progress');
  }
  console.log('captured', fs.readdirSync(OUT).join(', '));
} finally {
  await b.close();
}
