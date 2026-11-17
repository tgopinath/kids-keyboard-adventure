import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { COMPACT, FULL_ROWS, KEYS, LETTER_ROWS, compactSectionOf, type Row } from '../lib/keys';
import { emitKey, emitKeyUp, useKeyUps, useKeys } from '../lib/input';
import { sfx, unlockAudio } from '../lib/audio';

export type KbLayout = 'auto' | 'full' | 'letters' | 'numbers';

interface Props {
  layout?: KbLayout;
  /** keys shown glowing yellow (the target / next key) */
  glow?: string[];
  /** a key that pulses as a hint */
  hint?: string | null;
  /** flash feedback */
  good?: string | null;
  oops?: string | null;
  /** Memory Challenge: keys shown as "?" */
  hidden?: string[];
  current?: string | null;
  /** colour per key (progress heatmap) */
  heat?: Record<string, string>;
  /** when false the keys are a picture, not buttons (and presses are not shown) */
  interactive?: boolean;
  /** play the key click (screens that play their own sound turn this off) */
  clickSound?: boolean;
  caps?: boolean;
  /** first tab shown on phones */
  defaultSection?: 'abc' | 'num' | 'more';
  label?: string;
  className?: string;
}

const ARROW_CLUSTER: Row[] = [[{ gap: 3.5 }], [{ gap: 3.5 }], [{ gap: 3.5 }], [{ gap: 3.5 }], [{ gap: 1.5 }, 'ArrowUp', { gap: 1 }], [{ gap: 0.5 }, 'ArrowLeft', 'ArrowDown', 'ArrowRight']];
/** Short labels for wide keys when they get narrow on phones. */
const SHORT: Record<string, string> = { Backspace: '⌫', CapsLock: 'Caps', ShiftLeft: '⇧', ShiftRight: '⇧', Enter: '⏎', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', Space: 'Space' };
const NUMBER_ROWS: Row[] = [['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'], ['Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'], ['Backspace', 'Enter']];

const rowUnits = (r: Row, widths?: Record<string, number>) =>
  r.reduce<number>((a, k) => a + (typeof k === 'string' ? (widths?.[k] ?? KEYS[k]?.w ?? 1) : k.gap), 0);

export function VirtualKeyboard({
  layout = 'auto', glow = [], hint = null, good = null, oops = null, hidden = [], current = null, heat,
  interactive = true, clickSound = true, defaultSection = 'abc', label = 'On-screen keyboard', className = '',
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [down, setDown] = useState<Record<string, boolean>>({});
  const [section, setSection] = useState<keyof typeof COMPACT>(defaultSection);
  const [forceFull, setForceFull] = useState(false);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Show physical presses on the screen keyboard too.
  useKeys((p) => {
    if (!interactive) return;
    setDown((d) => ({ ...d, [p.id]: true }));
    if (p.source === 'physical') window.setTimeout(() => setDown((d) => ({ ...d, [p.id]: false })), 160);
  });
  useKeyUps((id) => setDown((d) => (d[id] ? { ...d, [id]: false } : d)));

  const compact = layout === 'auto' && width > 0 && width < 640 && !forceFull;
  // Jump to the tab that holds the hinted key.
  useEffect(() => {
    if (compact && hint) setSection(compactSectionOf(hint));
  }, [hint, compact]);

  let rows: Row[];
  let widths: Record<string, number> | undefined;
  let extra: Row[] | null = null;
  if (layout === 'letters') rows = LETTER_ROWS;
  else if (layout === 'numbers') rows = NUMBER_ROWS;
  else if (compact) {
    rows = COMPACT[section].rows;
    widths = COMPACT[section].widths;
  } else {
    rows = FULL_ROWS;
    extra = ARROW_CLUSTER;
  }
  const units = Math.max(...rows.map((r, i) => rowUnits(r, widths) + (extra ? rowUnits(extra[i]) : 0)));
  const minUnit = layout === 'full' || (layout === 'auto' && !compact) ? 30 : 26;
  const u = width ? Math.max(minUnit, Math.min(70, width / units)) : 40;
  const gap = u < 40 ? 4 : 6;
  const keyH = Math.round(Math.max(compact || layout !== 'auto' ? 46 : 34, Math.min(66, u * 0.95)));
  const scrolls = units * u > width + 1;

  const press = (id: string) => {
    if (!interactive) return;
    unlockAudio();
    if (clickSound) sfx.key(id);
    emitKey(id, 'virtual');
  };

  const renderKey = (id: string, w: number) => {
    const k = KEYS[id];
    if (!k) return null;
    const isHidden = hidden.includes(id);
    const cls = [
      'kcap',
      down[id] && interactive ? 'is-down' : '',
      glow.includes(id) ? 'is-glow' : '',
      hint === id ? 'is-hint' : '',
      good === id ? 'is-good' : '',
      oops === id ? 'is-oops' : '',
      isHidden ? 'is-hidden' : '',
      isHidden && current === id ? 'is-current' : '',
    ].join(' ');
    const single = k.label.length <= 2;
    // Labels must fit their key: on narrow keys use a short label, then shrink the text if needed.
    const room = w * u - gap - 8;
    let text = k.label;
    let fs = single ? Math.min(u * 0.46, 30) : Math.min(u * 0.24, 15);
    const textW = (t: string, f: number) => t.length * f * 0.62;
    if (!single && textW(text, Math.max(fs, 11)) > room && SHORT[id]) text = SHORT[id];
    if (text.length > 1) fs = Math.max(9, Math.min(fs, room / (text.length * 0.62)));
    if (text.length <= 2 && !single) fs = Math.min(u * 0.42, 24);
    const style = {
      flex: "none" as const,
      width: w * u - gap,
      height: keyH,
      margin: gap / 2,
      fontSize: fs,
      ...(heat?.[id] ? { background: heat[id] } : {}),
    };
    const inner = (
      <>
        {k.shift && !isHidden && u >= 34 && <span className="sub" aria-hidden>{k.shift}</span>}
        <span aria-hidden>{isHidden ? '' : text}</span>
      </>
    );
    if (!interactive) {
      return (
        <span key={id} className={cls} data-kind={k.kind} style={{ ...style, cursor: 'default' }} aria-hidden>
          {inner}
        </span>
      );
    }
    return (
      <button
        key={id}
        type="button"
        className={cls}
        data-kind={k.kind}
        data-key={id}
        style={style}
        aria-label={isHidden ? 'Hidden key' : k.kind === 'letter' ? k.label : k.name}
        onPointerDown={(e) => {
          e.preventDefault();
          setDown((d) => ({ ...d, [id]: true }));
          press(id);
        }}
        onPointerUp={() => {
          setDown((d) => ({ ...d, [id]: false }));
          emitKeyUp(id);
        }}
        onPointerLeave={() => setDown((d) => (d[id] ? { ...d, [id]: false } : d))}
        onClick={(e) => {
          // screen readers and switch access send a click without a pointer press
          if (e.detail === 0) press(id);
        }}
        onKeyDown={(e) => {
          // a keyboard user activating the on-screen key with Enter/Space
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            press(id);
          }
        }}
        tabIndex={-1}
      >
        {inner}
      </button>
    );
  };

  const renderRow = (r: Row, i: number, w?: Record<string, number>) =>
    r.map((item, j) =>
      typeof item === 'string'
        ? renderKey(item, w?.[item] ?? KEYS[item]?.w ?? 1)
        : <span key={`g${i}-${j}`} style={{ width: item.gap * u, flex: 'none' }} aria-hidden />,
    );

  return (
    <div className={className} role="group" aria-label={label}>
      {compact && (
        <div className="kb-tabs" role="tablist" aria-label="Keyboard sections">
          {(Object.keys(COMPACT) as (keyof typeof COMPACT)[]).map((s) => (
            <button key={s} role="tab" type="button" className="kb-tab" aria-selected={section === s} onClick={() => setSection(s)}>
              {COMPACT[s].label}
            </button>
          ))}
        </div>
      )}
      <div ref={wrap} className={scrolls ? 'overflow-x-auto no-scrollbar' : ''} style={{ width: '100%' }}>
        <div style={{ width: scrolls ? units * u : undefined, margin: '0 auto' }}>
          {rows.map((r, i) => (
            <div key={i} className="flex justify-center" style={{ marginBottom: !compact && extra && i === 0 ? 8 : 0 }}>
              {renderRow(r, i, widths)}
              {extra && renderRow(extra[i], i + 100)}
            </div>
          ))}
        </div>
      </div>
      {layout === 'auto' && width > 0 && (width < 640 || forceFull) && (
        <div className="mt-3 flex justify-center">
          <button type="button" className="chip" onClick={() => setForceFull((f) => !f)}>
            {forceFull ? 'Show big keys' : 'Show the whole keyboard'}
          </button>
        </div>
      )}
    </div>
  );
}
