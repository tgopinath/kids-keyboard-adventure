// Picture friends for letters and words. Flat, chunky shapes with one ink outline so they read at any size.
import type { ReactElement } from 'react';

const K = '#1d1a38';
const s = { stroke: K, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const ART: Record<string, ReactElement> = {
  apple: (
    <g {...s}>
      <path d="M50 30 C30 18 14 34 18 56 C22 78 38 90 50 84 C62 90 78 78 82 56 C86 34 70 18 50 30 Z" fill="#ff5a5f" />
      <path d="M50 30 Q52 18 60 12" fill="none" />
      <path d="M54 22 Q68 12 76 20 Q66 30 54 22 Z" fill="#22c79a" />
      <path d="M30 44 Q28 54 32 62" stroke="#fff" strokeOpacity={0.7} strokeWidth={4} fill="none" />
    </g>
  ),
  ball: (
    <g {...s}>
      <circle cx={50} cy={52} r={34} fill="#38b6ff" />
      <path d="M16 52 Q50 36 84 52" fill="none" />
      <path d="M50 18 Q34 52 50 86" fill="none" />
      <path d="M22 34 Q50 52 78 34" fill="#ffc83d" />
      <path d="M22 70 Q50 56 78 70 Q66 84 50 86 Q34 84 22 70 Z" fill="#ff6fb5" />
    </g>
  ),
  cat: (
    <g {...s}>
      <path d="M22 40 L26 14 L42 30 Z" fill="#ff9a3c" />
      <path d="M78 40 L74 14 L58 30 Z" fill="#ff9a3c" />
      <ellipse cx={50} cy={54} rx={32} ry={28} fill="#ff9a3c" />
      <path d="M26 20 L30 32 M74 20 L70 32" stroke="#ffc1df" strokeWidth={4} />
      <circle cx={39} cy={50} r={4} fill={K} />
      <circle cx={61} cy={50} r={4} fill={K} />
      <path d="M46 60 L54 60 L50 65 Z" fill="#ff6fb5" />
      <path d="M50 65 Q44 71 40 67 M50 65 Q56 71 60 67" fill="none" />
      <path d="M30 60 L14 58 M30 65 L15 68 M70 60 L86 58 M70 65 L85 68" fill="none" strokeWidth={2} />
      <path d="M36 34 L40 42 M50 30 L50 40 M64 34 L60 42" stroke="#d4701a" strokeWidth={3} />
    </g>
  ),
  dog: (
    <g {...s}>
      <ellipse cx={50} cy={54} rx={28} ry={30} fill="#f4c27a" />
      <path d="M24 30 Q8 44 14 68 Q22 72 28 60 Z" fill="#8a5a2b" />
      <path d="M76 30 Q92 44 86 68 Q78 72 72 60 Z" fill="#8a5a2b" />
      <ellipse cx={50} cy={68} rx={16} ry={12} fill="#fff1dc" />
      <circle cx={40} cy={48} r={4} fill={K} />
      <circle cx={60} cy={48} r={4} fill={K} />
      <ellipse cx={50} cy={62} rx={6} ry={4.5} fill={K} />
      <path d="M50 66 L50 72 Q44 76 40 72 M50 72 Q56 76 60 72" fill="none" />
      <path d="M52 76 Q54 86 60 82 L58 74" fill="#ff6fb5" />
      <circle cx={64} cy={36} r={7} fill="#8a5a2b" stroke="none" />
    </g>
  ),
  elephant: (
    <g {...s}>
      <path d="M26 32 Q4 34 8 58 Q12 74 30 66 Z" fill="#b9a7ff" />
      <path d="M74 32 Q96 34 92 58 Q88 74 70 66 Z" fill="#b9a7ff" />
      <ellipse cx={50} cy={46} rx={26} ry={24} fill="#a08cf5" />
      <path d="M42 58 Q40 80 50 90 Q58 94 60 86 Q52 80 56 58 Z" fill="#a08cf5" />
      <circle cx={40} cy={42} r={4} fill={K} />
      <circle cx={60} cy={42} r={4} fill={K} />
      <path d="M36 60 Q32 66 36 70 M64 60 Q68 66 64 70" stroke="#fff" strokeWidth={4} fill="none" />
      <ellipse cx={32} cy={52} rx={4} ry={2.5} fill="#ff8fc7" stroke="none" />
      <ellipse cx={68} cy={52} rx={4} ry={2.5} fill="#ff8fc7" stroke="none" />
    </g>
  ),
  fish: (
    <g {...s}>
      <path d="M70 50 L92 32 L90 68 Z" fill="#ff9a3c" />
      <ellipse cx={46} cy={50} rx={32} ry={22} fill="#38b6ff" />
      <path d="M36 30 Q46 18 58 30" fill="#ffc83d" />
      <circle cx={28} cy={46} r={5} fill="#fff" />
      <circle cx={27} cy={46} r={2.5} fill={K} />
      <path d="M44 38 Q52 50 44 62 M56 38 Q64 50 56 62" fill="none" stroke="#1d7fc4" />
      <path d="M18 58 Q22 62 26 58" fill="none" />
      <circle cx={10} cy={30} r={3} fill="#daf1ff" />
      <circle cx={16} cy={20} r={4} fill="#daf1ff" />
    </g>
  ),
  grapes: (
    <g {...s}>
      <path d="M50 22 Q52 12 60 8" fill="none" />
      <path d="M52 18 Q66 8 74 16 Q64 26 52 18 Z" fill="#22c79a" />
      {[[38, 32], [52, 32], [66, 32], [32, 46], [46, 46], [60, 46], [72, 46], [40, 60], [54, 60], [66, 60], [46, 74], [60, 74], [53, 87]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={8.5} fill="#8b5cf6" />
      ))}
      <circle cx={35} cy={29} r={2.5} fill="#fff" stroke="none" />
    </g>
  ),
  house: (
    <g {...s}>
      <rect x={20} y={46} width={60} height={42} fill="#fff1c4" />
      <path d="M12 50 L50 16 L88 50 Z" fill="#ff5a5f" />
      <rect x={64} y={20} width={10} height={18} fill="#8a5a2b" />
      <rect x={42} y={62} width={16} height={26} rx={3} fill="#8b5cf6" />
      <rect x={26} y={56} width={12} height={12} fill="#38b6ff" />
      <rect x={62} y={56} width={12} height={12} fill="#38b6ff" />
      <circle cx={55} cy={76} r={1.8} fill="#fff" stroke="none" />
    </g>
  ),
  icecream: (
    <g {...s}>
      <path d="M32 50 L50 92 L68 50 Z" fill="#f4c27a" />
      <path d="M38 58 L60 58 M42 68 L58 68 M36 52 L54 84 M64 52 L46 84" fill="none" stroke="#c98a3a" strokeWidth={2} />
      <circle cx={40} cy={44} r={14} fill="#ff8fc7" />
      <circle cx={60} cy={44} r={14} fill="#9fdcff" />
      <circle cx={50} cy={30} r={14} fill="#fff1c4" />
      <circle cx={50} cy={14} r={5} fill="#ff5a5f" />
      <path d="M44 26 L46 24 M54 30 L56 28 M48 36 L50 34" stroke="#8b5cf6" strokeWidth={3} />
    </g>
  ),
  juice: (
    <g {...s}>
      <path d="M58 8 L64 8 L56 40" fill="none" stroke="#ff5a5f" strokeWidth={5} />
      <path d="M26 30 L74 30 L66 90 L34 90 Z" fill="#ffffff" />
      <path d="M29 46 L71 46 L66 90 L34 90 Z" fill="#ff9a3c" />
      <circle cx={70} cy={30} r={12} fill="#ffc83d" />
      <path d="M70 18 L70 42 M58 30 L82 30" stroke="#d99a0b" strokeWidth={2} />
      <path d="M38 56 L40 80" stroke="#fff" strokeOpacity={0.6} strokeWidth={4} fill="none" />
    </g>
  ),
  kite: (
    <g {...s}>
      <path d="M50 8 L80 40 L50 74 L20 40 Z" fill="#ff6fb5" />
      <path d="M50 8 L50 74 M20 40 L80 40" fill="none" />
      <path d="M50 8 L80 40 L50 40 Z" fill="#ffc83d" />
      <path d="M50 40 L20 40 L50 74 Z" fill="#38b6ff" />
      <path d="M50 74 Q40 82 50 88 Q60 94 52 98" fill="none" />
      <path d="M44 84 L38 80 L40 88 Z M56 92 L62 88 L62 96 Z" fill="#22c79a" />
    </g>
  ),
  leaf: (
    <g {...s}>
      <path d="M20 80 Q16 30 80 16 Q86 74 20 80 Z" fill="#22c79a" />
      <path d="M20 80 Q48 52 72 26" fill="none" />
      <path d="M38 62 L36 48 M50 50 L48 36 M46 56 L60 56 M58 44 L70 42" fill="none" strokeWidth={2.5} />
      <path d="M20 80 L12 90" fill="none" />
    </g>
  ),
  moon: (
    <g {...s}>
      <path d="M62 12 A40 40 0 1 0 88 66 A32 32 0 1 1 62 12 Z" fill="#ffc83d" />
      <circle cx={40} cy={56} r={5} fill="#ffe49a" stroke="none" />
      <circle cx={52} cy={74} r={4} fill="#ffe49a" stroke="none" />
      <path d="M78 22 L80 28 L86 30 L80 32 L78 38 L76 32 L70 30 L76 28 Z" fill="#fff" />
    </g>
  ),
  nest: (
    <g {...s}>
      <ellipse cx={38} cy={52} rx={10} ry={13} fill="#daf1ff" />
      <ellipse cx={52} cy={48} rx={10} ry={13} fill="#ffffff" />
      <ellipse cx={64} cy={53} rx={10} ry={13} fill="#d4f7ec" />
      <path d="M12 56 Q50 50 88 56 Q84 84 50 86 Q16 84 12 56 Z" fill="#b57a3c" />
      <path d="M18 62 Q50 70 82 62 M22 72 Q50 80 78 72 M30 58 L40 80 M50 58 L52 84 M70 58 L62 80" fill="none" stroke="#7a4a1c" strokeWidth={2.5} />
    </g>
  ),
  orange: (
    <g {...s}>
      <circle cx={50} cy={54} r={34} fill="#ff9a3c" />
      <path d="M50 20 Q50 12 56 8" fill="none" />
      <path d="M52 16 Q64 6 72 14 Q62 22 52 16 Z" fill="#22c79a" />
      {[[36, 44], [60, 40], [46, 62], [66, 62], [32, 64]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2} fill="#d4701a" stroke="none" />)}
      <path d="M28 40 Q26 50 30 58" stroke="#fff" strokeOpacity={0.6} strokeWidth={4} fill="none" />
    </g>
  ),
  pencil: (
    <g {...s}>
      <g transform="rotate(-40 50 50)">
        <rect x={20} y={40} width={50} height={20} fill="#ffc83d" />
        <path d="M20 46.7 L70 46.7 M20 53.3 L70 53.3" stroke="#d99a0b" strokeWidth={2} />
        <path d="M70 40 L88 50 L70 60 Z" fill="#f4c27a" />
        <path d="M82 46.7 L88 50 L82 53.3 Z" fill={K} />
        <rect x={10} y={40} width={10} height={20} fill="#ff6fb5" />
        <rect x={18} y={40} width={4} height={20} fill="#b9b9c9" />
      </g>
    </g>
  ),
  queen: (
    <g {...s}>
      <path d="M18 70 L12 28 L32 46 L50 16 L68 46 L88 28 L82 70 Z" fill="#ffc83d" />
      <rect x={18} y={70} width={64} height={14} rx={4} fill="#ffb300" />
      <circle cx={50} cy={50} r={7} fill="#ff5a5f" />
      <circle cx={32} cy={58} r={5} fill="#38b6ff" />
      <circle cx={68} cy={58} r={5} fill="#22c79a" />
      <circle cx={12} cy={26} r={4} fill="#ff6fb5" />
      <circle cx={50} cy={14} r={4} fill="#ff6fb5" />
      <circle cx={88} cy={26} r={4} fill="#ff6fb5" />
    </g>
  ),
  rocket: (
    <g {...s}>
      <path d="M40 74 Q50 98 60 74 Z" fill="#ffc83d" />
      <path d="M44 74 Q50 88 56 74 Z" fill="#ff5a5f" stroke="none" />
      <path d="M50 8 Q72 28 66 74 L34 74 Q28 28 50 8 Z" fill="#f5f2ff" />
      <path d="M50 8 Q62 18 66 30 L34 30 Q38 18 50 8 Z" fill="#ff5a5f" />
      <circle cx={50} cy={46} r={9} fill="#38b6ff" />
      <path d="M34 56 L20 74 L34 74 Z" fill="#ff5a5f" />
      <path d="M66 56 L80 74 L66 74 Z" fill="#ff5a5f" />
    </g>
  ),
  sun: (
    <g {...s}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i;
        return <path key={i} d={`M${50 + 30 * Math.cos(a)} ${50 + 30 * Math.sin(a)} L${50 + 44 * Math.cos(a)} ${50 + 44 * Math.sin(a)}`} stroke="#ff9a3c" strokeWidth={6} />;
      })}
      <circle cx={50} cy={50} r={24} fill="#ffc83d" />
      <circle cx={42} cy={46} r={3} fill={K} />
      <circle cx={58} cy={46} r={3} fill={K} />
      <path d="M41 56 Q50 64 59 56" fill="none" />
    </g>
  ),
  tree: (
    <g {...s}>
      <rect x={43} y={60} width={14} height={30} fill="#8a5a2b" />
      <circle cx={50} cy={36} r={24} fill="#22c79a" />
      <circle cx={30} cy={52} r={16} fill="#22c79a" />
      <circle cx={70} cy={52} r={16} fill="#22c79a" />
      <circle cx={40} cy={34} r={4} fill="#ff5a5f" />
      <circle cx={62} cy={44} r={4} fill="#ff5a5f" />
      <circle cx={30} cy={56} r={4} fill="#ff5a5f" />
    </g>
  ),
  umbrella: (
    <g {...s}>
      <path d="M50 50 L50 82 Q50 90 42 90 Q36 90 36 84" fill="none" strokeWidth={4} />
      <path d="M10 52 Q14 14 50 12 Q86 14 90 52 Q80 44 70 52 Q60 44 50 52 Q40 44 30 52 Q20 44 10 52 Z" fill="#ff6fb5" />
      <path d="M50 12 Q36 30 30 52 M50 12 Q64 30 70 52 M50 12 L50 52" fill="none" />
      <circle cx={50} cy={10} r={3} fill={K} />
    </g>
  ),
  van: (
    <g {...s}>
      <path d="M10 66 L10 34 Q10 26 18 26 L64 26 Q72 26 78 36 L90 52 L90 66 Z" fill="#38b6ff" />
      <path d="M66 32 L76 32 L86 50 L66 50 Z" fill="#daf1ff" />
      <rect x={18} y={34} width={18} height={14} rx={3} fill="#daf1ff" />
      <rect x={42} y={34} width={18} height={14} rx={3} fill="#daf1ff" />
      <path d="M10 58 L90 58" stroke="#ffc83d" strokeWidth={4} />
      <circle cx={28} cy={68} r={10} fill="#3a355f" />
      <circle cx={72} cy={68} r={10} fill="#3a355f" />
      <circle cx={28} cy={68} r={3.5} fill="#fff" />
      <circle cx={72} cy={68} r={3.5} fill="#fff" />
    </g>
  ),
  watermelon: (
    <g {...s}>
      <path d="M8 40 A42 42 0 0 0 92 40 Z" fill="#22c79a" />
      <path d="M15 40 A35 35 0 0 0 85 40 Z" fill="#ff5a5f" stroke="none" />
      <path d="M15 40 A35 35 0 0 0 85 40" fill="none" stroke="#e9fac9" strokeWidth={4} />
      <path d="M8 40 L92 40" fill="none" />
      {[[30, 50], [44, 58], [58, 58], [70, 50], [50, 46], [38, 46], [62, 46]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={2.2} ry={3.5} fill={K} stroke="none" />)}
    </g>
  ),
  xylophone: (
    <g {...s}>
      <path d="M14 46 L86 36 M14 74 L86 82" fill="none" stroke="#8a5a2b" strokeWidth={5} />
      {['#ff5a5f', '#ff9a3c', '#ffc83d', '#22c79a', '#38b6ff', '#8b5cf6'].map((c, i) => (
        <rect key={i} x={18 + i * 11.5} y={34 - i * 1.2 + (i === 0 ? 4 : 0)} width={9} height={52 - i * 3.5} rx={3} fill={c} transform={`translate(0 ${i * 1})`} />
      ))}
      <path d="M70 18 L88 6" fill="none" strokeWidth={3} />
      <circle cx={68} cy={20} r={5} fill="#ff6fb5" />
    </g>
  ),
  yoyo: (
    <g {...s}>
      <path d="M50 6 L50 34" fill="none" strokeWidth={2.5} />
      <circle cx={50} cy={6} r={4} fill="#ffc83d" />
      <circle cx={50} cy={60} r={30} fill="#ff5a5f" />
      <circle cx={50} cy={60} r={18} fill="#ffc1df" />
      <circle cx={50} cy={60} r={6} fill="#ffc83d" />
      <path d="M30 46 Q26 56 30 66" stroke="#fff" strokeOpacity={0.6} strokeWidth={4} fill="none" />
    </g>
  ),
  zebra: (
    <g {...s}>
      <path d="M30 30 L28 10 L42 22 Z M70 30 L72 10 L58 22 Z" fill="#ffffff" />
      <path d="M26 34 Q26 14 50 14 Q74 14 74 34 L70 70 Q68 90 50 90 Q32 90 30 70 Z" fill="#ffffff" />
      <path d="M28 40 L42 44 M27 52 L40 54 M72 40 L58 44 M73 52 L60 54 M42 16 L46 30 M58 16 L54 30 M50 14 L50 26" fill="none" strokeWidth={4} />
      <ellipse cx={50} cy={76} rx={16} ry={13} fill="#d9d4ea" />
      <circle cx={42} cy={44} r={4} fill={K} />
      <circle cx={58} cy={44} r={4} fill={K} />
      <circle cx={44} cy={76} r={2.5} fill={K} />
      <circle cx={56} cy={76} r={2.5} fill={K} />
      <path d="M28 18 Q50 0 72 18" fill="none" stroke={K} strokeWidth={6} />
    </g>
  ),
  // ---- extra words for Word Builder ----
  hat: (
    <g {...s}>
      <ellipse cx={50} cy={72} rx={40} ry={12} fill="#8b5cf6" />
      <path d="M26 70 L30 30 Q50 20 70 30 L74 70 Q50 80 26 70 Z" fill="#8b5cf6" />
      <path d="M28 56 Q50 64 72 56 L73 64 Q50 72 27 64 Z" fill="#ffc83d" />
    </g>
  ),
  bus: (
    <g {...s}>
      <rect x={8} y={22} width={84} height={50} rx={10} fill="#ffc83d" />
      {[16, 36, 56].map((x) => <rect key={x} x={x} y={30} width={16} height={16} rx={3} fill="#daf1ff" />)}
      <rect x={76} y={30} width={10} height={30} rx={2} fill="#daf1ff" />
      <path d="M8 54 L92 54" stroke="#ff6b6b" strokeWidth={4} />
      <circle cx={26} cy={74} r={9} fill="#3a355f" />
      <circle cx={74} cy={74} r={9} fill="#3a355f" />
    </g>
  ),
  cup: (
    <g {...s}>
      <path d="M70 40 Q90 40 88 56 Q86 70 68 68" fill="none" strokeWidth={6} />
      <path d="M18 30 L74 30 L68 82 Q66 88 58 88 L34 88 Q26 88 24 82 Z" fill="#38b6ff" />
      <path d="M26 44 L72 44" stroke="#fff" strokeWidth={4} />
      <path d="M36 20 Q32 12 38 6 M50 20 Q46 12 52 6" fill="none" stroke="#b9b9c9" />
    </g>
  ),
  pen: (
    <g {...s}>
      <g transform="rotate(-40 50 50)">
        <rect x={18} y={42} width={54} height={16} rx={6} fill="#3d5afe" />
        <path d="M72 42 L88 50 L72 58 Z" fill="#d9d4ea" />
        <path d="M84 48 L88 50 L84 52 Z" fill={K} />
        <rect x={30} y={36} width={26} height={6} rx={3} fill="#ffc83d" />
      </g>
    </g>
  ),
  box: (
    <g {...s}>
      <path d="M14 36 L50 22 L86 36 L50 50 Z" fill="#f4c27a" />
      <path d="M14 36 L14 74 L50 90 L50 50 Z" fill="#d99a4a" />
      <path d="M86 36 L86 74 L50 90 L50 50 Z" fill="#e8b36a" />
      <path d="M32 29 L68 43 L68 56" fill="none" stroke="#ff6b6b" strokeWidth={5} />
    </g>
  ),
  egg: (
    <g {...s}>
      <path d="M50 10 C26 10 16 50 18 64 C20 82 34 92 50 92 C66 92 80 82 82 64 C84 50 74 10 50 10 Z" fill="#fff8ec" />
      <path d="M30 56 L38 50 L46 58 L54 50 L62 58 L70 50" fill="none" stroke="#38b6ff" strokeWidth={4} />
      <circle cx={40} cy={34} r={4} fill="#ff6fb5" stroke="none" />
      <circle cx={60} cy={74} r={4} fill="#22c79a" stroke="none" />
    </g>
  ),
  car: (
    <g {...s}>
      <path d="M8 66 L8 52 Q8 46 16 44 L28 42 L38 26 Q40 22 46 22 L66 22 Q72 22 76 28 L84 42 Q92 44 92 52 L92 66 Z" fill="#ff5a5f" />
      <path d="M42 28 L56 28 L56 42 L34 42 Z" fill="#daf1ff" />
      <path d="M62 28 L72 28 L78 42 L62 42 Z" fill="#daf1ff" />
      <circle cx={28} cy={68} r={10} fill="#3a355f" />
      <circle cx={72} cy={68} r={10} fill="#3a355f" />
      <circle cx={28} cy={68} r={3.5} fill="#fff" />
      <circle cx={72} cy={68} r={3.5} fill="#fff" />
      <rect x={84} y={50} width={8} height={6} fill="#ffc83d" />
    </g>
  ),
  fan: (
    <g {...s}>
      <path d="M50 50 L50 86 M34 90 L66 90" fill="none" strokeWidth={5} />
      <circle cx={50} cy={44} r={34} fill="#daf1ff" />
      {[0, 120, 240].map((a) => <path key={a} d="M50 44 Q40 22 50 14 Q62 22 50 44 Z" fill="#38b6ff" transform={`rotate(${a} 50 44)`} />)}
      <circle cx={50} cy={44} r={6} fill="#ffc83d" />
    </g>
  ),
  key: (
    <g {...s}>
      <circle cx={30} cy={50} r={18} fill="#ffc83d" />
      <circle cx={30} cy={50} r={7} fill="#fff8ec" />
      <path d="M46 46 L88 46 L88 56 L80 56 L80 64 L72 64 L72 56 L64 56 L64 62 L56 62 L56 56 L46 56 Z" fill="#ffc83d" />
    </g>
  ),
  star: (
    <g {...s}>
      <path d="M50 8 L61 36 L91 38 L67 57 L76 87 L50 70 L24 87 L33 57 L9 38 L39 36 Z" fill="#ffc83d" />
      <circle cx={42} cy={50} r={3} fill={K} />
      <circle cx={58} cy={50} r={3} fill={K} />
      <path d="M43 60 Q50 66 57 60" fill="none" />
    </g>
  ),
  cake: (
    <g {...s}>
      <rect x={16} y={48} width={68} height={38} rx={6} fill="#ffc1df" />
      <path d="M16 58 Q24 66 32 58 Q40 66 50 58 Q60 66 68 58 Q76 66 84 58 L84 52 Q84 48 78 48 L22 48 Q16 48 16 52 Z" fill="#fff8ec" />
      <rect x={46} y={28} width={8} height={20} fill="#38b6ff" />
      <path d="M50 14 Q56 22 50 26 Q44 22 50 14 Z" fill="#ff9a3c" />
      <circle cx={30} cy={74} r={4} fill="#ff5a5f" />
      <circle cx={50} cy={74} r={4} fill="#22c79a" />
      <circle cx={70} cy={74} r={4} fill="#8b5cf6" />
    </g>
  ),
  book: (
    <g {...s}>
      <path d="M50 26 Q34 16 12 20 L12 80 Q34 76 50 86 Z" fill="#38b6ff" />
      <path d="M50 26 Q66 16 88 20 L88 80 Q66 76 50 86 Z" fill="#ff6fb5" />
      <path d="M20 34 Q32 32 42 38 M20 46 Q32 44 42 50 M58 38 Q68 32 80 34 M58 50 Q68 44 80 46" fill="none" stroke="#fff" strokeWidth={3} />
    </g>
  ),
  bell: (
    <g {...s}>
      <path d="M50 12 L50 20" fill="none" />
      <path d="M22 74 Q28 66 28 46 Q28 22 50 20 Q72 22 72 46 Q72 66 78 74 Z" fill="#ffc83d" />
      <rect x={18} y={72} width={64} height={8} rx={4} fill="#ff9a3c" />
      <circle cx={50} cy={86} r={6} fill="#ff9a3c" />
      <path d="M36 36 Q34 46 36 56" stroke="#fff" strokeOpacity={0.7} strokeWidth={4} fill="none" />
    </g>
  ),
};

export const hasArt = (name: string) => name in ART;

export function Art({ name, size = 120, className = '', label }: { name: string; size?: number; className?: string; label?: string }) {
  const g = ART[name];
  if (!g) return null;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {g}
    </svg>
  );
}

/** Counting dots for number keys: n coloured dots in a tidy grid. */
export function Dots({ n, size = 120 }: { n: number; size?: number }) {
  const cols = n <= 3 ? n || 1 : n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4;
  const rows = Math.max(1, Math.ceil(n / cols));
  const colors = ['#ff5a5f', '#ff9a3c', '#ffc83d', '#22c79a', '#38b6ff', '#8b5cf6', '#ff6fb5', '#8fd627', '#3d5afe', '#ff7a59'];
  const cell = 100 / Math.max(cols, rows);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      {n === 0 ? (
        <ellipse cx={50} cy={50} rx={30} ry={38} fill="none" stroke="#1d1a38" strokeWidth={6} strokeDasharray="8 8" />
      ) : (
        Array.from({ length: n }, (_, i) => {
          const r = Math.floor(i / cols), c = i % cols;
          const ox = (100 - cols * cell) / 2, oy = (100 - rows * cell) / 2;
          return <circle key={i} cx={ox + c * cell + cell / 2} cy={oy + r * cell + cell / 2} r={cell * 0.36} fill={colors[i % colors.length]} stroke="#1d1a38" strokeWidth={3} />;
        })
      )}
    </svg>
  );
}
