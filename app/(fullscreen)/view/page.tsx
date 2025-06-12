'use client';
import CircleDisplay from '@/components/circles/CircleDisplay';
import PhotoWithCircles from '@/components/circles/PhotoWithCircles';
import { useCallback, useState } from 'react';
import { useCircleEditState } from '../../../hooks/useCircleEditState';
import { useImageSrc } from '../../../hooks/useImageSrc';
import { useMaxContentSize } from '../../../hooks/useMaxContentSize';

// 固定画像ID
const IMAGE_ID = '57e60d2c-2133-453b-a3a4-fd1f3c0893eb';

export default function ViewerPage() {
  // 画像取得
  const { imgSrc, isLoading, error: imgError } = useImageSrc(IMAGE_ID);
  // 円・コメント取得（編集不可なのでset系は使わない）
  const { circles } = useCircleEditState(IMAGE_ID);

  // 最初のcircleのコメントを取得
  const firstComment = circles.length > 0 ? circles[0].comment || '' : '';

  // コメント欄の高さ（px）
  const commentAreaHeight = 72; // 常に固定

  // 最大幅・最大高さをカスタムフックで取得
  const { maxWidth, maxHeight } = useMaxContentSize(800, commentAreaHeight);

  // 画像の実際の表示サイズ
  const [imgSize, setImgSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const handleSizeChange = useCallback((w: number, h: number) => {
    setImgSize({ width: w, height: h });
  }, []);

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center bg-white min-h-screen'>
        <div>画像を読み込み中...</div>
      </div>
    );
  }
  if (!imgSrc) {
    return (
      <div className='flex flex-1 items-center justify-center bg-white min-h-screen'>
        <div>
          画像が見つかりません。
          <br />
          {imgError && <div className='text-red-500'>{imgError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full bg-white'>
      <div
        className='w-full flex flex-col items-center justify-center'
        style={{ maxWidth, padding: 8, height: maxHeight }}
      >
        <PhotoWithCircles
          imgSrc={imgSrc}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          onSizeChange={handleSizeChange}
        >
          {/* 画像サイズが確定してからCircleDisplayを表示 */}
          {imgSize && (
            <CircleDisplay
              circles={circles}
              imgWidth={imgSize.width}
              imgHeight={imgSize.height}
            />
          )}
        </PhotoWithCircles>
      </div>
      {/* コメント表示欄（常に表示・高さ固定） */}
      <div
        className='w-full rounded-lg bg-[#e3f2fd] text-[#1976d2] px-4 py-3 text-base shadow'
        style={{ maxWidth, minHeight: 40 }}
      >
        {firstComment}
      </div>
      {/* debug */}
      <div className='absolute top-10 left-10'>{`${imgSize?.width}, ${imgSize?.height}, ${circles.length}`}</div>
    </div>
  );
}
