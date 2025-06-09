import { useEffect } from 'react';
import type { Circle } from '../types';

const STORAGE_KEY = 'circle-canvas-circles-v1';

// useStateの初期値としてlocalStorageから読み込む関数
export function getInitialCircles(): Circle[] {
  if (typeof window !== 'undefined') {
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
  // circlesが変化したらlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(circles));
    }
  }, [circles]);
}
