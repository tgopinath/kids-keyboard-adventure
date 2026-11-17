import { useEffect, useRef } from 'react';

/** requestAnimationFrame loop that hands over seconds since the last frame; stops while `running` is false. */
export function useLoop(fn: (dt: number) => void, running: boolean) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ref.current(dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
