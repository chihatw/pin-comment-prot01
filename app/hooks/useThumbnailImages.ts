import { useEffect, useState } from 'react';

export type ThumbnailImage = { id: string; src: string };

export function useThumbnailImages(maxCount: number = 2) {
  const [images, setImages] = useState<ThumbnailImage[]>([]);

  // 画像追加
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages((prev) => {
        const newImages = [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            src: ev.target?.result as string,
          },
        ].slice(0, maxCount);
        if (typeof window !== 'undefined') {
          localStorage.setItem('images', JSON.stringify(newImages));
        }
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  // 画像削除
  const handleThumbnailDelete = (id: string) => {
    setImages((prev) => {
      const newImages = prev.filter((i) => i.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('images', JSON.stringify(newImages));
      }
      return newImages;
    });
  };

  // 初期化: localStorageから画像リスト取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('images');
      if (saved) setImages(JSON.parse(saved));
    }
  }, []);

  return { images, handleThumbnailUpload, handleThumbnailDelete };
}
