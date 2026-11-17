# Kids Keyboard Adventure

A playful keyboard-learning game for children aged 3–10, guided by **KeyBot**, a robot who talks, cheers and wears whatever the child buys in the Robot Shop.

- **Learn:** Meet Your Keyboard (every key, aloud), Find the Key (Easy / Medium / Advanced), Alphabet Adventure (A–Z picture cards), Number Keyboard (find, count, missing numbers, how many, big numbers), Memory Challenge.
- **Play:** Falling Letters, Bubble Pop, Letter Catcher (slow / medium / fast), Word Builder, Treasure Hunt. Word Adventure has six islands of words.
- **Type:** Typing Challenge from single letters to sentences, with live accuracy and words per minute.
- **Smart Difficulty:** 90%+ moves up, 70–89% stays, under 70% steps down and turns hints on. A level unlocks the next one at 70%. Missed keys come back more often.
- **Rewards:** stars, coins, 12 badges, trophies, robot colours and accessories, game worlds, treasure chests, three daily challenges.
- **Parent Dashboard:** behind a maths question. Learning time, lessons, level, accuracy, typing speed, hardest keys, charts, history, export and reset.
- **Private:** no accounts, no network calls for data, no analytics. Progress lives in localStorage.
- **Accessible:** physical and on-screen keyboards, Esc to pause, focus rings, screen-reader labels and live regions, high contrast, dark mode, less movement, separate music / effects / voice controls.

## Run

```sh
npm install
npm run dev        # http://localhost:5360
npm run build      # type-check + production build into dist/
npm test           # unit tests (Smart Difficulty, key model, rewards)
node tools/smoke.mjs            # plays every activity in headless Chrome, reports console errors
SMOKE_MOBILE=1 node tools/smoke.mjs
node tools/shots.mjs            # portfolio screenshots (prototype/shots, tools/web-keyboard.jpg)
```

Deploys on Vercel as a static Vite build (`vercel.json`). Works offline after the first visit (service worker).

## Structure

- `src/lib` — key model (`keys.ts`), content, Smart Difficulty (`adaptive.ts`), progress store, audio (Web Audio + speech), key bus for physical and virtual input.
- `src/components` — KeyBot, VirtualKeyboard, Frame (intro, pause, results), illustrations, UI pieces, bar chart.
- `src/screens` — one file per screen; games in `screens/games`.

Design: structure and tokens follow the Kolam design system (8-point grid, AA contrast, light / dark / contrast themes, one primary family per app); the look is the brief's bright, chunky toy style with Fredoka for display and Lato for text.

Note for the Android shell: Android's WebView has no speechSynthesis, so in the APK KeyBot talks in speech bubbles only unless a native text-to-speech plugin is added.
