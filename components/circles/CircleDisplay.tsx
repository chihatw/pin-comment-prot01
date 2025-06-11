import React from 'react';
import { Circle } from '../../app/types';
import { getCircleLabelPosition } from '../../app/utils';

interface CircleDisplayProps {
  circles: Circle[];
  imgWidth: number;
  imgHeight: number;
}

/**
 * CircleDisplay コンポーネント
 *
 * circles配列を受け取り、SVG上に円とラベル（番号）を描画する表示専用コンポーネントです。
 * 編集機能（選択・ホバー・リサイズ等）は一切含みません。
 *
 * @component
 * @param {Object} props - コンポーネントのprops
 * @param {Circle[]} props.circles - 描画する円の配列
 * @param {number} props.imgWidth - 画像の幅（px）
 * @param {number} props.imgHeight - 画像の高さ（px）
 * @returns {JSX.Element}
 */

const CircleDisplay: React.FC<CircleDisplayProps> = ({
  circles,
  imgWidth,
  imgHeight,
}) => {
  return (
    <>
      {circles.map((c, idx) => {
        const cx = (c.x / 100) * imgWidth;
        const cy = (c.y / 100) * imgHeight;
        const r = ((c.r / 100) * Math.min(imgWidth, imgHeight)) / 2;
        const { x: labelX, y: labelY } = getCircleLabelPosition(
          cx,
          cy,
          r,
          -135,
          12
        );
        return (
          <g key={c.id}>
            <circle
              cx={`${c.x}%`}
              cy={`${c.y}%`}
              r={`${c.r}%`}
              fill={'rgba(33, 150, 243, 0.13)'}
              stroke={'#039be5'}
              strokeWidth={2.5}
              style={{
                filter: 'drop-shadow(0 2px 6px #b3e5fc66)',
              }}
            />
            <text
              x={labelX}
              y={labelY}
              fontSize='18'
              fontWeight='bold'
              fill={'#039be5'}
              stroke='#fff'
              strokeWidth='3'
              paintOrder='stroke'
              style={{ pointerEvents: 'none', userSelect: 'none' }}
              textAnchor='middle'
              dominantBaseline='middle'
            >
              {idx + 1}
            </text>
          </g>
        );
      })}
    </>
  );
};

export default CircleDisplay;
