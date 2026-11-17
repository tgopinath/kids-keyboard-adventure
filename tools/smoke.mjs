// Plays every activity in headless Chrome and reports the result card and any console errors.
//   node tools/smoke.mjs                 (against http://localhost:5360, the dev server)
//   SMOKE_URL=https://… node tools/smoke.mjs
//   SMOKE_MOBILE=1 …                     (390-wide phone, taps the on-screen keys instead of the keyboard)
import path from 'node:path';
import { HELPERS, launch, sleep } from './cdp.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const URL = process.env.SMOKE_URL || 'http://localhost:5360/';
const MOBILE = !!process.env.SMOKE_MOBILE;
const ROUTES = (process.env.SMOKE_ROUTES || [
  '#/learn/find', '#/learn/alphabet', '#/learn/numbers', '#/learn/memory',
  '#/games/falling', '#/games/bubbles', '#/games/catcher', '#/games/builder', '#/games/treasure',
  '#/words', '#/practice',
].join(',')).split(',');
const STATIC = ['#/', '#/learn', '#/games', '#/learn/explore', '#/path', '#/rewards', '#/progress', '#/parents', '#/settings', '#/nope'];

const b = await launch(ROOT);
const errors = [];
b.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) errors.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(`log: ${m.params.entry.text} ${m.params.entry.url ?? ''}`);
});
try {
  await b.send('Runtime.enable');
  await b.send('Log.enable');
  await b.send('Emulation.setDeviceMetricsOverride', MOBILE ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true } : { width: 1280, height: 860, deviceScaleFactor: 1, mobile: false });
  await b.send('Page.navigate', { url: URL });
  await sleep(2500);
  await b.evaluate('localStorage.clear(); sessionStorage.clear(); location.reload(); 1');
  await sleep(2500);
  await b.evaluate(HELPERS);
  for (const r of STATIC) {
    await b.evaluate(`location.hash = ${JSON.stringify(r)}; 1`);
    await sleep(900);
    const ok = await b.evaluate(`(document.querySelector('main')?.innerText || '').length`);
    console.log(`page ${r.padEnd(18)} ${ok > 20 ? 'ok' : 'EMPTY'} (${ok} chars)`);
  }
  // every on-screen key label must fit inside its key, on every keyboard tab
  const fit = await b.evaluate(`(async () => {
    const sleep = ms => new Promise(r=>setTimeout(r,ms));
    location.hash = '#/learn/explore'; await sleep(900);
    const bad = [];
    const check = () => document.querySelectorAll('.kcap[data-key]').forEach(k => { const r = k.getBoundingClientRect(); [...k.children].forEach(c => { const q = c.getBoundingClientRect(); if (q.width > 0 && (q.left < r.left - 0.5 || q.right > r.right + 0.5)) bad.push(k.dataset.key + ':' + Math.round(q.width) + '>' + Math.round(r.width)); }); });
    const tabs = [...document.querySelectorAll('.kb-tab')];
    if (tabs.length) for (const t of tabs) { t.click(); await sleep(300); check(); } else check();
    return JSON.stringify({ keys: document.querySelectorAll('.kcap[data-key]').length, overflow: [...new Set(bad)] });
  })()`);
  console.log('key labels', fit);
  const pause = await b.evaluate(`(async () => {
    const sleep = ms => new Promise(r=>setTimeout(r,ms));
    const dlg = () => document.querySelector('[role=dialog][aria-label="Paused"]');
    location.hash = '#/'; await sleep(600); location.hash = '#/learn/memory'; await sleep(900);
    [...document.querySelectorAll('main button')].find(b=>b.textContent.trim()==='Play').click(); await sleep(900);
    __pid('Escape'); await sleep(500);
    const opened = !!dlg();
    const t1 = document.querySelector('[role=timer]')?.innerText; await sleep(2200); const frozen = t1 === document.querySelector('[role=timer]')?.innerText;
    [...dlg().querySelectorAll('button')].find(b=>b.textContent.includes('Keep playing')).click(); await sleep(1500);
    const resumed = !dlg() && t1 !== document.querySelector('[role=timer]')?.innerText;
    __pid('Escape'); await sleep(500);
    [...dlg().querySelectorAll('button')].find(b=>b.textContent.includes('Start again')).click(); await sleep(900);
    const restarted = !dlg() && /5/.test(document.querySelector('[role=timer]')?.innerText || '');
    __pid('Escape'); await sleep(500);
    [...dlg().querySelectorAll('button')].find(b=>b.textContent.includes('Leave')).click(); await sleep(700);
    return JSON.stringify({ opened, frozen, resumed, restarted, exitTo: location.hash });
  })()`);
  console.log('pause', pause);
  for (const r of ROUTES) {
    const res = await b.evaluate(`__auto(${JSON.stringify(r)}, { wrongEvery: ${Number(process.env.SMOKE_WRONG ?? 6)}, wait: 550, click: ${MOBILE} })`);
    console.log(`play ${r.padEnd(18)} ${res}`);
  }
  // second round of Find the Key at the level Smart Difficulty picked
  console.log(`play #/learn/find (again)  ${await b.evaluate(`__auto('#/learn/find', { wait: 400 })`)}`);
  const state = await b.evaluate(`JSON.parse(localStorage.getItem('kids-keyboard-adventure:v1'))`);
  console.log(`state: stars=${state.stars} coins=${state.coins} lessons=${state.lessons.length} badges=${state.badges.join(',')} sessions=${state.sessions.length}`);
  console.log(errors.length ? `\nCONSOLE ERRORS (${errors.length}):\n${[...new Set(errors)].join('\n')}` : '\nNo console errors.');
} finally {
  await b.close();
}
