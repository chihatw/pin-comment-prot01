import { useCallback, useState } from 'react';

export function useImageUpload() {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImgSrc(URL.createObjectURL(file));
      }
    },
    []
  );

  return { imgSrc, handleFileChange };
}
