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
