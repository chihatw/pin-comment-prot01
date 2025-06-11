/**
 * 画像IDからSupabase Storageの署名付き画像URLを取得し、Reactの状態として管理するカスタムフック。
 *
 * @param {string | string[] | undefined} id - 画像の一意なID、またはID配列、または未定義。
 * @returns {{ imgSrc: string | null, isLoading: boolean, error: string | null }}
 *   imgSrc: 取得した画像の署名付きURL（取得失敗時はnull）
 *   isLoading: 取得中かどうかのフラグ
 *   error: エラー内容（取得失敗時のみ）
 */

import { useEffect, useState } from 'react';
import { fetchImageWithSignedUrl } from '../utils';

export function useImageSrc(id: string | string[] | undefined) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setImgSrc(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    const fetchImage = async () => {
      const imageId = Array.isArray(id) ? id[0] : id;
      const result = await fetchImageWithSignedUrl(imageId);
      if (result) {
        setImgSrc(result.src);
        setError(null);
      } else {
        setImgSrc(null);
        setError('画像の取得に失敗しました');
      }
      setIsLoading(false);
    };
    fetchImage();
  }, [id]);

  return { imgSrc, isLoading, error };
}
