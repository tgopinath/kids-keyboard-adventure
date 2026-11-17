import { useEffect, useState } from 'react';

export interface Route { path: string; params: URLSearchParams }

const parse = (): Route => {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, q] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(q ?? '') };
};

export function useRoute(): Route {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => {
      setR(parse());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

export const go = (to: string) => {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (window.location.hash === target) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else window.location.hash = target;
};

/** Every Back button goes to its parent screen, so there is never a dead end. */
export const back = (parent = '/') => go(parent);
