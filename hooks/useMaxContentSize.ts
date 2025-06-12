import { useEffect, useState } from 'react';

/**
 * 画面サイズに応じた最大幅・最大高さを返すカスタムフック
 * @param maxContentWidth 最大幅（px）
 * @param footerHeight フッターやコメント欄の高さ（px）
 * @returns { maxWidth, maxHeight, windowSize }
 */
export function useMaxContentSize(
  maxContentWidth: number,
  footerHeight: number
) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSize, 300);
    });
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  const maxWidth = Math.min(windowSize.width, maxContentWidth);
  const maxHeight = windowSize.height - footerHeight;

  return { maxWidth, maxHeight, windowSize };
}
