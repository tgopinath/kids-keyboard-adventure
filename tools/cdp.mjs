// Tiny Chrome DevTools Protocol helper shared by smoke.mjs and shots.mjs (system Chrome, headless).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(root) {
  const tmp = fs.mkdtempSync(path.join(root, '.shots-'));
  const port = 6800 + Math.floor(Math.random() * 300);
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', `--remote-debugging-port=${port}`, `--user-data-dir=${tmp}/profile`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 80 && !ws; i++) {
    try {
      const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page');
      if (p) ws = new WebSocket(p.webSocketDebuggerUrl);
    } catch { /* not up yet */ }
    if (!ws) await sleep(250);
  }
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = {};
  const listeners = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    else if (m.method) listeners.forEach((l) => l(m));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  const close = async () => {
    ws.close();
    const exited = new Promise((r) => chrome.once('exit', r));
    chrome.kill();
    await Promise.race([exited, sleep(5000)]);
    fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  };
  return { send, evaluate, on: (fn) => listeners.push(fn), close, tmp };
}

/** In-page helpers: press a key by id, and play a round by following the screen's [data-target] mark. */
export const HELPERS = `
window.__pid = (id) => { const key = id.startsWith('Key') ? id.slice(3).toLowerCase() : id.startsWith('Digit') ? id.slice(5) : id==='Space' ? ' ' : id==='Period' ? '.' : id; window.dispatchEvent(new KeyboardEvent('keydown',{key, code:id, bubbles:true})); window.dispatchEvent(new KeyboardEvent('keyup',{key, code:id, bubbles:true})); };
window.__auto = async (route, {wrongEvery=0, max=400, wait=600, click=false} = {}) => {
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const dlg = () => document.querySelector('[role=dialog][aria-label="Round finished"]');
  location.hash = '#/'; await sleep(900);
  location.hash = route; await sleep(1100);
  const play = [...document.querySelectorAll('main button')].find(b=>b.textContent.trim()==='Play');
  if (!play) return 'no play button';
  play.click(); await sleep(900);
  let n=0, presses=0;
  while (n++ < max) {
    if (dlg()) break;
    const t = document.querySelector('[data-target]')?.dataset.target;
    if (!t) { await sleep(250); continue; }
    presses++;
    if (wrongEvery && presses % wrongEvery === 0) { __pid(t==='KeyQ'?'KeyZ':'KeyQ'); await sleep(200); }
    const btn = click && document.querySelector('[data-key="'+t+'"]');
    if (btn) { btn.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); btn.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); }
    else __pid(t);
    await sleep(wait);
  }
  await sleep(500);
  const d = dlg();
  return d ? d.innerText.replace(/\\n+/g,' | ').slice(0,220) : 'NO RESULT (target ' + document.querySelector('[data-target]')?.dataset.target + ')';
};
`;
