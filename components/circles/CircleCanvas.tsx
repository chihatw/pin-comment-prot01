/**
 * 画像上に円を描画・編集するためのインタラクティブなキャンバスコンポーネント。
 *
 * - 背景画像の上にSVGレイヤーを重ね、円の描画・編集をマウス操作で行う
 * - 編集状態やマウスイベントをpropsで受け取り、childrenで既存の円を描画
 * - 描画中の円プレビューも表示
 *
 * @component
 * @param {Object} props - コンポーネントのprops
 * @param {EditState} props.edit - 編集状態
 * @param {number} props.imgWidth - 画像の幅（px）
 * @param {number} props.imgHeight - 画像の高さ（px）
 * @param {string} [props.imgSrc] - 画像のURL
 * @param {(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void} props.onSvgMouseDown - SVGのmousedownイベント
 * @param {(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void} props.onSvgMouseMove - SVGのmousemoveイベント
 * @param {(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void} props.onSvgMouseUp - SVGのmouseupイベント
 * @param {() => void} props.onSvgMouseLeave - SVGのmouseleaveイベント
 * @param {() => void} props.onSvgClick - SVGのclickイベント
 * @param {React.ReactNode} [props.children] - 既存の円を描画する要素
 * @returns {JSX.Element}
 */

import { EditState } from '@/types/editState';
import React from 'react';

export interface CircleCanvasProps {
  edit: EditState;
  imgWidth: number;
  imgHeight: number;
  imgSrc?: string; // 追加
  onSvgMouseDown: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onSvgMouseMove: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onSvgMouseUp: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onSvgMouseLeave: () => void;
  onSvgClick: () => void;
  children?: React.ReactNode;
}

function renderPreviewCircle(edit: EditState) {
  if (!edit.drawing || !edit.lastMouse) return null;
  const dx = edit.lastMouse.x - edit.drawing.startX;
  const dy = edit.lastMouse.y - edit.drawing.startY;
  const r = Math.sqrt(dx * dx + dy * dy) / 2;
  if (r > 0.5) {
    const centerX = (edit.drawing.startX + edit.lastMouse.x) / 2;
    const centerY = (edit.drawing.startY + edit.lastMouse.y) / 2;
    return (
      <circle
        cx={`${centerX}%`}
        cy={`${centerY}%`}
        r={`${r}%`}
        fill='rgba(33, 150, 243, 0.09)'
        stroke='#4fc3f7'
        strokeDasharray='4 2'
        strokeWidth={2}
        pointerEvents='none'
      />
    );
  }
  return null;
}

const CircleCanvas: React.FC<CircleCanvasProps> = ({
  edit,
  imgWidth,
  imgHeight,
  imgSrc, // 追加
  onSvgMouseDown,
  onSvgMouseMove,
  onSvgMouseUp,
  onSvgMouseLeave,
  onSvgClick,
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
        className={`absolute top-0 left-0 z-[2] ${
          edit.drawing
            ? 'cursor-crosshair'
            : edit.dragId
            ? 'cursor-grabbing'
            : 'cursor-pointer'
        }`}
        onMouseDown={edit.dragId === null ? onSvgMouseDown : undefined}
        onMouseMove={onSvgMouseMove}
        onMouseUp={onSvgMouseUp}
        onMouseLeave={onSvgMouseLeave}
        onClick={onSvgClick}
      >
        {/* 既存の円 */}
        {children}
        {/* 描画中の円プレビュー */}
        {renderPreviewCircle(edit)}
      </svg>
    </div>
  );
};

export default CircleCanvas;
