import React from 'react';

/**
 * PhotoWithCircles コンポーネント
 *
 * 画像を表示し、その上にSVGレイヤーでchildren（例: CircleDisplay）を重ねて描画するビューワー専用コンポーネントです。
 * 編集機能は一切含まず、純粋な表示用途に特化しています。
 *
 * @component
 * @param {Object} props - コンポーネントのprops
 * @param {number} props.imgWidth - 画像の幅（px）
 * @param {number} props.imgHeight - 画像の高さ（px）
 * @param {string} [props.imgSrc] - 画像のURL
 * @param {React.ReactNode} [props.children] - SVG上に重ねて表示する要素（例: CircleDisplay）
 * @returns {JSX.Element}
 */

export interface PhotoWithCirclesProps {
  imgWidth: number;
  imgHeight: number;
  imgSrc?: string;
  children?: React.ReactNode; // CircleDisplay など
}

const PhotoWithCircles: React.FC<PhotoWithCirclesProps> = ({
  imgWidth,
  imgHeight,
  imgSrc,
  children,
}) => {
  return (
    <div
      className='relative rounded-[16px] bg-gradient-to-br from-white to-[#e1f5fe] shadow-[0_4px_24px_#b3e5fc55] overflow-hidden'
      style={{ width: imgWidth, height: imgHeight }}
    >
      {/* 画像 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        width={imgWidth}
        height={imgHeight}
        className='absolute top-0 left-0 w-full h-full object-contain select-none rounded-[16px] shadow-[0_2px_12px_#b3e5fc33] z-[1] pointer-events-none block'
        alt='写真'
        draggable={false}
        style={{ display: imgSrc ? undefined : 'none' }}
      />
      <svg
        width={imgWidth}
        height={imgHeight}
        className='absolute top-0 left-0 z-[2] cursor-default'
      >
        {/* 既存の円（編集不可） */}
        {children}
      </svg>
    </div>
  );
};

export default PhotoWithCircles;
