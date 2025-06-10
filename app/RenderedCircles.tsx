import React, { useMemo } from 'react';
import { Circle, EditState } from './types';
import { getCircleLabelPosition } from './utils';

interface RenderedCirclesProps {
  circles: Circle[];
  edit: EditState;
  imgWidth: number;
  imgHeight: number;
  setEdit: React.Dispatch<React.SetStateAction<EditState>>;
  handleCircleMouseDown: (id: number, e: React.MouseEvent) => void;
}

const RenderedCircles: React.FC<RenderedCirclesProps> = ({
  circles,
  edit,
  imgWidth,
  imgHeight,
  setEdit,
  handleCircleMouseDown,
}) => {
  const rendered = useMemo(
    () =>
      circles.map((c, idx) => {
        let handle = null;
        if (
          edit.hoverId === c.id &&
          (!edit.resizeId || edit.resizeId === c.id)
        ) {
          const cx_px = (c.x / 100) * imgWidth;
          const cy_px = (c.y / 100) * imgHeight;
          const r_px = (c.r / 100) * ((imgWidth + imgHeight) / 2);
          let angleDeg = 45;
          if (edit.lastMouse) {
            const mx_px = (edit.lastMouse.x / 100) * imgWidth;
            const my_px = (edit.lastMouse.y / 100) * imgHeight;
            const dx = mx_px - cx_px;
            const dy = my_px - cy_px;
            let theta = Math.atan2(-dy, dx) * (180 / Math.PI);
            if (theta < 0) theta += 360;
            if (theta >= 0 && theta < 90) angleDeg = 45;
            else if (theta >= 90 && theta < 180) angleDeg = 135;
            else if (theta >= 180 && theta < 270) angleDeg = 225;
            else angleDeg = 315;
          }
          const angleRad = (angleDeg * Math.PI) / 180;
          const hx_px = cx_px + Math.cos(angleRad) * r_px;
          const hy_px = cy_px - Math.sin(angleRad) * r_px;
          const handleSizePx = 20;
          handle = (
            <g key={c.id + '-handle'}>
              <rect
                x={hx_px - handleSizePx / 2}
                y={hy_px - handleSizePx / 2}
                width={handleSizePx}
                height={handleSizePx}
                fill='#039be5'
                stroke='#fff'
                strokeWidth={1}
                style={{ cursor: 'ew-resize', pointerEvents: 'auto' }}
                rx={0}
                ry={0}
                onMouseDown={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setEdit((prev) => ({
                    ...prev,
                    resizeId: c.id,
                    resizeStart: { mx: e.clientX, my: e.clientY, r: c.r },
                  }));
                }}
              />
            </g>
          );
        }
        return (
          <g
            key={c.id}
            onMouseEnter={() => setEdit((prev) => ({ ...prev, hoverId: c.id }))}
            onPointerOut={(e: React.PointerEvent) => {
              const currentTarget = e.currentTarget as Element;
              const related = e.relatedTarget as Node | null;
              if (!related || !currentTarget.contains(related)) {
                setEdit((prev) => ({
                  ...prev,
                  hoverId: null,
                  lastMouse: null,
                }));
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEdit((prev) => ({
                ...prev,
                selectedId: prev.selectedId === c.id ? null : c.id,
              }));
            }}
          >
            <circle
              cx={`${c.x}%`}
              cy={`${c.y}%`}
              r={`${c.r}%`}
              fill={
                edit.selectedId === c.id
                  ? 'rgba(33, 150, 243, 0.22)'
                  : 'rgba(33, 150, 243, 0.13)'
              }
              stroke={edit.selectedId === c.id ? '#1976d2' : '#039be5'}
              strokeWidth={2.5}
              onMouseDown={
                !edit.resizeId
                  ? (e) => handleCircleMouseDown(c.id, e)
                  : undefined
              }
              style={{
                cursor:
                  edit.hoverId === c.id && !edit.resizeId ? 'move' : 'grab',
                filter: 'drop-shadow(0 2px 6px #b3e5fc66)',
              }}
            />
            {(() => {
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
                <text
                  x={labelX}
                  y={labelY}
                  fontSize='18'
                  fontWeight='bold'
                  fill={edit.selectedId === c.id ? '#1976d2' : '#039be5'}
                  stroke='#fff'
                  strokeWidth='3'
                  paintOrder='stroke'
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                  textAnchor='middle'
                  dominantBaseline='middle'
                >
                  {idx + 1}
                </text>
              );
            })()}
            {handle}
          </g>
        );
      }),
    [
      circles,
      edit.hoverId,
      edit.lastMouse,
      edit.resizeId,
      edit.selectedId,
      handleCircleMouseDown,

      imgWidth,
      imgHeight,
      setEdit,
    ]
  );
  return <>{rendered}</>;
};

export default RenderedCircles;
