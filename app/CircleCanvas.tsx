import React from 'react';
import type { EditState } from './types';

export interface CircleCanvasProps {
  edit: EditState;
  imgWidth: number;
  imgHeight: number;
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
        src='/sample.jpg'
        width={imgWidth}
        height={imgHeight}
        className='absolute top-0 left-0 w-full h-full select-none rounded-[16px] shadow-[0_2px_12px_#b3e5fc33] z-[1] pointer-events-none block'
        alt='写真'
        draggable={false}
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
