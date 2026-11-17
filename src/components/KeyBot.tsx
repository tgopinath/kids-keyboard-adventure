import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SKINS, type Slot } from '../lib/rewards';
import { useStore } from '../lib/store';
import { onSpeaking } from '../lib/audio';

export type Mood = 'happy' | 'excited' | 'thinking' | 'oops' | 'surprised' | 'sleepy' | 'wave';

const GLOW = '#7cf5ff';
const INK = '#1d1a38';

function Eyes({ mood, blink }: { mood: Mood; blink: boolean }) {
  const L = 78, R = 122, Y = 88;
  if (mood === 'excited') {
    const star = (cx: number) => {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 ? 5 : 12;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        return `${cx + r * Math.cos(a)},${Y + r * Math.sin(a)}`;
      }).join(' ');
      return <polygon points={pts} fill="#ffd84a" />;
    };
    return <>{star(L)}{star(R)}</>;
  }
  if (mood === 'happy' || mood === 'wave') {
    return (
      <g stroke={GLOW} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d={`M${L - 10} ${Y + 4} Q${L} ${Y - 10} ${L + 10} ${Y + 4}`} />
        <path d={`M${R - 10} ${Y + 4} Q${R} ${Y - 10} ${R + 10} ${Y + 4}`} />
      </g>
    );
  }
  if (mood === 'surprised') {
    return (
      <g fill={GLOW}>
        <circle cx={L} cy={Y} r={11} />
        <circle cx={R} cy={Y} r={11} />
        <circle cx={L + 3} cy={Y - 3} r={3.5} fill={INK} />
        <circle cx={R + 3} cy={Y - 3} r={3.5} fill={INK} />
      </g>
    );
  }
  if (mood === 'sleepy') {
    return (
      <g stroke={GLOW} strokeWidth={6} strokeLinecap="round">
        <line x1={L - 9} y1={Y + 2} x2={L + 9} y2={Y + 2} />
        <line x1={R - 9} y1={Y + 2} x2={R + 9} y2={Y + 2} />
      </g>
    );
  }
  const dx = mood === 'thinking' ? 5 : 0;
  const dy = mood === 'thinking' ? -5 : 0;
  const ry = blink ? 1.5 : mood === 'oops' ? 9 : 12;
  return (
    <g fill={GLOW}>
      <ellipse cx={L + dx} cy={Y + dy} rx={8} ry={ry} />
      <ellipse cx={R + dx} cy={Y + dy} rx={8} ry={ry} />
      {mood === 'oops' && (
        <g stroke={GLOW} strokeWidth={4} strokeLinecap="round">
          <line x1={L - 10} y1={Y - 16} x2={L + 6} y2={Y - 20} />
          <line x1={R + 10} y1={Y - 16} x2={R - 6} y2={Y - 20} />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood, talking }: { mood: Mood; talking: boolean }) {
  if (talking) {
    return (
      <motion.ellipse cx={100} cy={113} rx={10} fill={GLOW} initial={{ ry: 3 }} animate={{ ry: [3, 7, 4, 8, 3] }} transition={{ duration: 0.6, repeat: Infinity }} />
    );
  }
  if (mood === 'excited' || mood === 'wave') return <path d="M84 107 Q100 126 116 107 Z" fill={GLOW} />;
  if (mood === 'surprised') return <ellipse cx={100} cy={114} rx={7} ry={8} fill={GLOW} />;
  if (mood === 'oops') return <path d="M88 116 Q100 108 112 116" stroke={GLOW} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
  if (mood === 'thinking') return <path d="M90 113 L110 111" stroke={GLOW} strokeWidth={3.5} strokeLinecap="round" />;
  if (mood === 'sleepy') return <ellipse cx={100} cy={114} rx={5} ry={4} fill={GLOW} />;
  return <path d="M86 108 Q100 121 114 108" stroke={GLOW} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
}

function Head({ item }: { item: string }) {
  switch (item) {
    case 'head:cap':
      return (
        <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
          <path d="M44 52 Q48 18 100 18 Q152 18 156 52 Z" fill="#ff6b6b" />
          <path d="M140 50 Q176 46 184 56 Q160 62 138 58 Z" fill="#ff6b6b" />
          <circle cx={100} cy={18} r={6} fill="#ffc83d" />
        </g>
      );
    case 'head:party':
      return (
        <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round" transform="rotate(-14 70 40)">
          <path d="M46 46 L70 -10 L94 46 Z" fill="#8b5cf6" />
          <path d="M55 26 L85 26 M60 12 L80 12" stroke="#ffc83d" strokeWidth={3.5} />
          <circle cx={70} cy={-12} r={8} fill="#ff6fb5" />
        </g>
      );
    case 'head:phones':
      return (
        <g stroke={INK} strokeWidth={3.5}>
          <path d="M26 92 Q26 22 100 22 Q174 22 174 92" fill="none" strokeWidth={10} />
          <path d="M26 92 Q26 22 100 22 Q174 22 174 92" fill="none" stroke="#ff6fb5" strokeWidth={4} />
          <rect x={8} y={70} width={30} height={46} rx={12} fill="#ff6fb5" />
          <rect x={162} y={70} width={30} height={46} rx={12} fill="#ff6fb5" />
        </g>
      );
    case 'head:crown':
      return (
        <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
          <path d="M58 46 L54 14 L76 30 L100 8 L124 30 L146 14 L142 46 Z" fill="#ffc83d" />
          <circle cx={100} cy={32} r={5} fill="#ff6b6b" />
          <circle cx={76} cy={38} r={4} fill="#22c79a" />
          <circle cx={124} cy={38} r={4} fill="#38b6ff" />
        </g>
      );
    default:
      return null;
  }
}

function Face({ item }: { item: string }) {
  if (item === 'face:glasses')
    return (
      <g fill="none" stroke="#ffc83d" strokeWidth={4}>
        <circle cx={78} cy={88} r={17} />
        <circle cx={122} cy={88} r={17} />
        <path d="M95 86 Q100 82 105 86" />
      </g>
    );
  if (item === 'face:shades')
    return (
      <g fill="#0b0920" stroke="#ff6fb5" strokeWidth={3}>
        <rect x={58} y={76} width={38} height={24} rx={10} />
        <rect x={104} y={76} width={38} height={24} rx={10} />
        <path d="M96 86 L104 86" />
        <path d="M64 82 L74 82" stroke="#ffffff" strokeOpacity={0.5} />
      </g>
    );
  return null;
}

function Neck({ item }: { item: string }) {
  if (item === 'neck:bow')
    return (
      <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
        <path d="M100 156 L78 144 L78 168 Z" fill="#ff6b6b" />
        <path d="M100 156 L122 144 L122 168 Z" fill="#ff6b6b" />
        <circle cx={100} cy={156} r={6} fill="#ffc83d" />
      </g>
    );
  if (item === 'neck:scarf')
    return (
      <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
        <rect x={64} y={146} width={72} height={16} rx={8} fill="#22c79a" />
        <path d="M118 158 L132 190 L114 192 L108 160 Z" fill="#22c79a" />
        <path d="M70 154 L130 154" stroke="#ffffff" strokeOpacity={0.6} strokeDasharray="6 8" />
      </g>
    );
  return null;
}

/**
 * KeyBot, the app's robot guide. Pure SVG, so it stays crisp at any size and can wear what the child buys.
 */
export function KeyBot({ mood = 'happy', size = 140, talking: talkingProp, className = '', still = false, outfit }: { mood?: Mood; size?: number; talking?: boolean; className?: string; still?: boolean; outfit?: Partial<Record<Slot, string>> }) {
  const equipped = useStore((s) => s.equipped);
  const eq = outfit ? { ...equipped, ...outfit } : equipped;
  const skin = SKINS[eq.skin.split(':')[1]] ?? SKINS.sky;
  const reduce = useReducedMotion() || still;
  const [blink, setBlink] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => (talkingProp === undefined ? onSpeaking(setSpeaking) : undefined), [talkingProp]);
  useEffect(() => {
    if (reduce) return;
    let t: number;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 140);
        loop();
      }, 2600 + Math.random() * 2400);
    };
    loop();
    return () => window.clearTimeout(t);
  }, [reduce]);
  const talking = talkingProp ?? speaking;

  const body = reduce
    ? {}
    : mood === 'excited'
      ? { y: [0, -8, 0], rotate: [0, -2, 2, 0] }
      : mood === 'oops'
        ? { rotate: [0, -4, 3, 0] }
        : mood === 'thinking'
          ? { rotate: [0, 5, 5, 0] }
          : { y: [0, -2, 0] };
  const bodyT = mood === 'excited' ? { duration: 0.9 } : mood === 'oops' ? { duration: 0.7 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const };
  const armUp = mood === 'excited' || mood === 'wave';

  return (
    <motion.svg
      key={mood}
      viewBox="-10 -20 220 240"
      width={size}
      height={size * (240 / 220)}
      className={className}
      role="img"
      aria-label={`KeyBot the robot looks ${mood === 'oops' ? 'kind and encouraging' : mood}`}
      animate={body}
      transition={bodyT}
      style={{ overflow: 'visible', transformOrigin: '50% 90%' }}
    >
      {/* antenna */}
      <line x1={100} y1={40} x2={100} y2={16} stroke={INK} strokeWidth={3.5} />
      <motion.circle cx={100} cy={12} r={9} fill="#ffc83d" stroke={INK} strokeWidth={4} animate={reduce ? {} : { scale: talking ? [1, 1.25, 1] : [1, 1.08, 1] }} transition={{ duration: talking ? 0.5 : 1.8, repeat: Infinity }} />
      {/* arms */}
      <motion.g animate={reduce ? {} : { rotate: armUp ? [0, -40, -25] : [0, 0, 0] }} transition={{ duration: armUp ? 0.8 : 2.6, repeat: armUp && mood === 'excited' ? 0 : Infinity }} style={{ transformOrigin: '58px 168px' }}>
        <rect x={22} y={160} width={40} height={16} rx={8} fill={skin.dark} stroke={INK} strokeWidth={3.5} />
        <circle cx={22} cy={168} r={10} fill={skin.light} stroke={INK} strokeWidth={3.5} />
      </motion.g>
      <motion.g animate={reduce ? {} : { rotate: armUp ? [0, 40, 25] : [0, 0, 0] }} transition={{ duration: armUp ? 0.8 : 2.6, repeat: armUp && mood === 'excited' ? 0 : Infinity }} style={{ transformOrigin: '142px 168px' }}>
        <rect x={138} y={160} width={40} height={16} rx={8} fill={skin.dark} stroke={INK} strokeWidth={3.5} />
        <circle cx={178} cy={168} r={10} fill={skin.light} stroke={INK} strokeWidth={3.5} />
      </motion.g>
      {/* body */}
      <rect x={86} y={144} width={28} height={14} fill={skin.dark} stroke={INK} strokeWidth={3.5} />
      <rect x={54} y={152} width={92} height={58} rx={22} fill={skin.body} stroke={INK} strokeWidth={3.5} />
      <circle cx={100} cy={181} r={7} fill="#7cf5ff" fillOpacity={0.85} />
      {/* ears */}
      <rect x={14} y={72} width={22} height={42} rx={9} fill={skin.dark} stroke={INK} strokeWidth={3.5} />
      <rect x={164} y={72} width={22} height={42} rx={9} fill={skin.dark} stroke={INK} strokeWidth={3.5} />
      {/* head */}
      <rect x={30} y={38} width={140} height={110} rx={38} fill={skin.body} stroke={INK} strokeWidth={3.5} />
      {/* face screen */}
      <rect x={46} y={58} width={108} height={74} rx={26} fill={INK} />
      <Eyes mood={mood} blink={blink} />
      <Mouth mood={mood} talking={talking} />
      <Face item={eq.face} />
      <Head item={eq.head} />
      <Neck item={eq.neck} />
    </motion.svg>
  );
}
