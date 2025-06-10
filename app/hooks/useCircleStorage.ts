import debounce from 'lodash/debounce';
import { useEffect, useRef } from 'react';
import type { Circle } from '../types';

const STORAGE_KEY = 'circle-canvas-circles-v1';

// useStateの初期値としてlocalStorageから読み込む関数
export function getInitialCircles(): Circle[] {
  if (typeof window !== 'undefined') {
    // debug
    console.log('Loading circles from localStorage');
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
  }
  return [];
}

export function useCircleStorage(circles: Circle[]) {
  const debouncedSave = useRef(
    debounce((data: Circle[]) => {
      if (typeof window !== 'undefined') {
        // debug
        console.log('Saving circles to localStorage');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }, 500)
  ).current;

  useEffect(() => {
    debouncedSave(circles);
    return () => {
      debouncedSave.cancel();
    };
  }, [circles, debouncedSave]);
}
