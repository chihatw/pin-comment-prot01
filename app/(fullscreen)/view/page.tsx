'use client';
import CircleDisplay from '@/components/circles/CircleDisplay';
import PhotoWithCircles from '@/components/circles/PhotoWithCircles';
import { useCircleEditState } from '../../../hooks/useCircleEditState';
import { useImageSrc } from '../../../hooks/useImageSrc';

// 固定画像ID
const IMAGE_ID = '57e60d2c-2133-453b-a3a4-fd1f3c0893eb';

export default function ViewerPage() {
  // 画像取得
  const { imgSrc, isLoading, error: imgError } = useImageSrc(IMAGE_ID);
  // 円・コメント取得（編集不可なのでset系は使わない）
  const { circles } = useCircleEditState(IMAGE_ID);

  // 画像サイズ（モバイル優先、PCはmaxWidth）
  const maxWidth = 480;
  const maxHeight = 700;

  // 最初のcircleのコメントを取得
  const firstComment = circles.length > 0 ? circles[0].comment || '' : '';

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
        style={{ maxWidth, padding: 8 }}
      >
        <PhotoWithCircles
          imgWidth={maxWidth}
          imgHeight={maxHeight}
          imgSrc={imgSrc}
        >
          <CircleDisplay
            circles={circles}
            imgWidth={maxWidth}
            imgHeight={maxHeight}
          />
        </PhotoWithCircles>
        {/* コメント表示欄 */}
        {firstComment && (
          <div className='mt-4 w-full rounded-lg bg-[#e3f2fd] text-[#1976d2] px-4 py-3 text-base shadow'>
            {firstComment}
          </div>
        )}
      </div>
    </div>
  );
}
