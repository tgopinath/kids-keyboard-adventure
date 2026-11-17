# Kids Keyboard Adventure — brief

## Problem
Young children (3–10) meet computer keyboards at school and at home but nobody shows them where the keys are or what they do. Typing tutors are built for older children and adults: text-heavy, dull and unforgiving. Little children need to learn by playing, with a friendly guide, big targets and no reading required.

## User
- **Child, 3–10.** Can't always read. Plays alone on a laptop, a tablet or a phone. Needs voice, pictures, big buttons and instant, kind feedback.
- **Parent or teacher.** Wants to see whether it is working (time, accuracy, speed, tricky keys) without accounts or tracking.

## Jobs to be done
1. "Show me what this key does" (explore freely, every key explained aloud).
2. "Help me find keys and remember where they live" (find, memory, alphabet, numbers).
3. "Let me practise without getting bored" (five games, typing levels, rewards).
4. "Make it harder when I am ready and easier when I struggle" (Smart Difficulty).
5. (Parent) "Tell me what my child has learned and what to practise."

## v1 screens
Home dashboard · Learning Path · Learn hub (Meet Your Keyboard, Find the Key, Alphabet Adventure, Number Keyboard, Memory Challenge) · Games hub (Falling Letters, Bubble Pop, Letter Catcher, Word Builder, Treasure Hunt) · Word Adventure (6 islands) · Typing Challenge (5 levels) · My Rewards (badges, trophies, robot shop, worlds) · My Progress · Parent Dashboard (behind a maths question) · Settings.

## Data and tech
No network data. All words and pictures are hand-made (SVG); sounds and music are synthesised with Web Audio; voice is the browser's speechSynthesis. Progress is stored in localStorage only. React + TypeScript + Tailwind v4 + Framer Motion + Lucide, built with Vite.

## Success criteria
- Every module playable end to end with a physical keyboard and with touch.
- A 3-year-old can start playing from Home with one tap.
- Smart Difficulty: ≥90% → harder, 70–89% → stay, <70% → easier with hints; next level unlocks at 70%.
- No console errors; works at 375 px and on desktop, light, dark and high contrast; reduced motion respected.

## Out of scope (v1)
Accounts and cloud sync, multiple child profiles on one device, languages other than English, recorded human voice, finger-placement (home-row touch typing) coaching with hand diagrams.
