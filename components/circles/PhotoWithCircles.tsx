import { getContainSize } from '@/utils/image';
import React, { useRef } from 'react';

/**
 * 画像の上にSVGレイヤー（円など）を重ねて表示するコンポーネント。
 *
 * @component
 * @param {string} [imgSrc] - 表示する画像のURL。省略時は画像非表示。
 * @param {React.ReactNode} [children] - 画像上に重ねるSVG要素（例: CircleDisplay）。
 * @param {number} maxWidth - 画像表示領域の最大幅（px）。
 * @param {number} maxHeight - 画像表示領域の最大高さ（px）。
 * @param {(w: number, h: number) => void} [onSizeChange] - 画像の表示サイズが確定した際に呼ばれるコールバック。width, height（px）が渡される。
 */

export interface PhotoWithCirclesProps {
  imgSrc?: string;
  children?: React.ReactNode; // CircleDisplay など
  maxWidth: number;
  maxHeight: number;
  onSizeChange?: (w: number, h: number) => void;
}

const PhotoWithCircles: React.FC<PhotoWithCirclesProps> = ({
  imgSrc,
  children,
  maxWidth,
  maxHeight,
  onSizeChange,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  // 画像onLoad時にnaturalサイズから最大サイズを計算し、コールバック
  const handleImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const { naturalWidth, naturalHeight } = img;
    if (!naturalWidth || !naturalHeight) return;
    // アスペクト比維持して最大サイズに収める
    const { width: w, height: h } = getContainSize(
      naturalWidth,
      naturalHeight,
      maxWidth,
      maxHeight
    );
    setImgSize({ width: w, height: h });
    onSizeChange?.(w, h);
  };

  return (
    <div
      className='relative rounded-[16px] bg-gradient-to-br from-white to-[#e1f5fe] shadow-[0_4px_24px_#b3e5fc55] overflow-hidden'
      style={{ width: maxWidth, height: maxHeight }}
    >
      {/* 画像 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imgSrc}
        className='absolute top-0 left-0 w-full h-full object-contain select-none rounded-[16px] shadow-[0_2px_12px_#b3e5fc33] z-[1] pointer-events-none block'
        alt='写真'
        draggable={false}
        style={{ display: imgSrc ? undefined : 'none' }}
        onLoad={handleImgLoad}
      />
      {/* SVGレイヤーは画像サイズが確定してから表示 */}
      {imgSize && (
        <svg
          width={imgSize.width}
          height={imgSize.height}
          className='absolute top-0 left-0 z-[2] cursor-default'
        >
          {children}
        </svg>
      )}
    </div>
  );
};

export default PhotoWithCircles;
