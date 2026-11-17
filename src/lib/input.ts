// One key bus for both inputs: the physical keyboard and the on-screen keyboard publish the same key ids.
import { useEffect, useRef } from 'react';
import { idFromEvent } from './keys';

export type KeySource = 'physical' | 'virtual';
export interface KeyPress { id: string; source: KeySource; at: number }
type Listener = (p: KeyPress) => void;

const listeners = new Set<Listener>();
const upListeners = new Set<(id: string) => void>();

export function emitKey(id: string, source: KeySource) {
  const p = { id, source, at: performance.now() };
  [...listeners].forEach((l) => l(p));
}
export function emitKeyUp(id: string) {
  [...upListeners].forEach((l) => l(id));
}

/** Subscribe to key presses. The latest handler is always used, so callers don't need deps. */
export function useKeys(handler: Listener, active = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const l: Listener = (p) => ref.current(p);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, [active]);
}
export function useKeyUps(handler: (id: string) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const l = (id: string) => ref.current(id);
    upListeners.add(l);
    return () => void upListeners.delete(l);
  }, []);
}

// ---- capture mode: while a game screen is open, keys that would scroll, go back or open browser
// helpers are kept for the game. Shortcuts with Ctrl/Cmd/Alt are never blocked.
let captureDepth = 0;
export const isCapturing = () => captureDepth > 0;
export function useCapture(on = true) {
  useEffect(() => {
    if (!on) return;
    captureDepth++;
    (document.activeElement as HTMLElement | null)?.blur?.();
    return () => void captureDepth--;
  }, [on]);
}

const BLOCK = new Set(['Space', 'Backspace', 'Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Quote', 'Slash', 'F1', 'F3', 'F6', 'F7', 'F10', 'AltLeft', 'AltRight']);

/** Installed once at the app root. */
export function installPhysicalKeyboard() {
  const down = (e: KeyboardEvent) => {
    if (!isCapturing()) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey) {
      // let shortcuts through, but still show Ctrl/Cmd themselves
      if (e.key === 'Control' || e.key === 'Meta') {
        const id = idFromEvent(e);
        if (id && !e.repeat) emitKey(id, 'physical');
      }
      return;
    }
    const id = idFromEvent(e);
    if (!id) return;
    if (BLOCK.has(id) || id === 'Space') e.preventDefault();
    if (e.repeat) return;
    emitKey(id, 'physical');
  };
  const up = (e: KeyboardEvent) => {
    const id = idFromEvent(e);
    if (!id) return;
    if (isCapturing() && (id === 'Space' || id === 'Enter')) e.preventDefault();
    emitKeyUp(id);
  };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  return () => {
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
  };
}
