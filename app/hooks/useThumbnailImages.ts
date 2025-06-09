import { useEffect, useState } from 'react';
import { getSupabaseUser } from '../../lib/supabaseClient';
import { ThumbnailImage } from '../utils';
import {
  deleteThumbnailById,
  fetchThumbnailsForUser,
  uploadThumbnailFile,
} from '../utils/thumbnail';

export function useThumbnailImages(maxCount: number = 2) {
  const [images, setImages] = useState<ThumbnailImage[]>([]);

  // サムネイル初期取得
  useEffect(() => {
    const fetch = async () => {
      try {
        const user = await getSupabaseUser();
        const userId = user.id;
        const imgs = await fetchThumbnailsForUser(userId, maxCount);
        setImages(imgs);
      } catch {
        // エラー処理は不要なため削除
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 画像追加
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const user = await getSupabaseUser();
      const userId = user.id;
      const newImage = await uploadThumbnailFile(file, userId);
      setImages((prev) => {
        const newImages = [...prev, newImage].slice(0, maxCount);
        return newImages;
      });
    } catch {
      // エラー処理は不要なため削除
    }
  };

  // 画像削除
  const handleThumbnailDelete = async (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteThumbnailById(id);
    } catch {
      // エラー処理は不要なため削除
    }
  };

  return {
    images,
    handleThumbnailUpload,
    handleThumbnailDelete,
  };
}
