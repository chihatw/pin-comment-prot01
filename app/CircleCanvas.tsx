import React from 'react';
import type { Circle, EditState } from './types';

export interface CircleCanvasProps {
  circles: Circle[];
  edit: EditState;
  imgWidth: number;
  imgHeight: number;
  onSvgMouseDown: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onSvgMouseMove: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onSvgMouseUp: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onSvgMouseLeave: () => void;
  onSvgClick: () => void;
  renderedCircles: React.ReactNode;
}

const CircleCanvas: React.FC<CircleCanvasProps> = ({
  // circles,
  edit,
  imgWidth,
  imgHeight,
  onSvgMouseDown,
  onSvgMouseMove,
  onSvgMouseUp,
  onSvgMouseLeave,
  onSvgClick,
  renderedCircles,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: imgWidth,
        height: imgHeight,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #ffffff 60%, #e1f5fe 100%)',
        boxShadow: '0 4px 24px #b3e5fc55',
        overflow: 'hidden',
      }}
    >
      {/* 画像 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/sample.jpg'
        width={imgWidth}
        height={imgHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: imgWidth,
          height: imgHeight,
          userSelect: 'none',
          borderRadius: 16,
          boxShadow: '0 2px 12px #b3e5fc33',
          zIndex: 1,
          pointerEvents: 'none',
          display: 'block',
        }}
        alt='写真'
        draggable={false}
      />
      <svg
        width={imgWidth}
        height={imgHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          cursor: edit.drawing
            ? 'crosshair'
            : edit.dragId
            ? 'grabbing'
            : 'pointer',
        }}
        onMouseDown={edit.dragId === null ? onSvgMouseDown : undefined}
        onMouseMove={onSvgMouseMove}
        onMouseUp={onSvgMouseUp}
        onMouseLeave={onSvgMouseLeave}
        onClick={onSvgClick}
      >
        {/* 既存の円 */}
        {renderedCircles}
        {/* 描画中の円プレビュー */}
        {edit.drawing &&
          edit.lastMouse &&
          (() => {
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
          })()}
      </svg>
    </div>
  );
};

export default CircleCanvas;
