'use client';
import { useEffect, useMemo } from 'react';
import CircleCanvas from './CircleCanvas';
import CommentPanel from './CommentPanel';
import { useCircleEditState } from './hooks/useCircleEditState';
import { useCommentManager } from './hooks/useCommentManager';
import { useSvgCircleEditor } from './hooks/useSvgCircleEditor';
import { useUndoManager } from './hooks/useUndoManager';
import { getCircleLabelPosition } from './utils';

export default function Home() {
  const { circles, setCircles, edit, setEdit } = useCircleEditState();

  // Undo管理用カスタムフック
  const { undoStack, setUndoStack, isPushingUndo, pushUndo, pushUndoIfNeeded } =
    useUndoManager({ circles, setCircles, edit, setEdit });

  const imgWidth = 800;
  const imgHeight = 600;

  // --- Undo（ESCキー）---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (edit.drawing === null && e.key === 'Escape' && undoStack.length > 0) {
        setCircles(undoStack[undoStack.length - 1]);
        setUndoStack((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, edit.drawing, setUndoStack, setCircles]);

  // SVG操作系カスタムフック
  const {
    handleSvgMouseDown,
    handleSvgMouseMove,
    handleSvgMouseUp,
    handleSvgMouseLeave,
    handleSvgClick,
    handleCircleMouseDown,
    handleCircleRightClick,
  } = useSvgCircleEditor({
    circles,
    setCircles,
    edit,
    setEdit,
    pushUndo,
    pushUndoIfNeeded,
    isPushingUndo,
  });

  // --- useMemoで円の描画用データを最適化（依存配列をhoverId等に限定）---
  const renderedCircles = useMemo(
    () =>
      circles.map((c, idx) => {
        let handle = null;
        // ホバー中かつリサイズ中でない円にのみハンドラを表示
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
          // デバッグ用: ハンドル表示エリア（円全体）を透過赤で重ねて表示
          handle = (
            <g key={c.id + '-handle'}>
              {/* デバッグ用の透過赤circleは削除 */}
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
              setEdit((prev) => ({ ...prev, selectedId: c.id }));
            }}
          >
            {/* 円本体 */}
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
              onContextMenu={(e) => handleCircleRightClick(c.id, e)}
              style={{
                cursor:
                  edit.hoverId === c.id && !edit.resizeId ? 'move' : 'grab',
                filter: 'drop-shadow(0 2px 6px #b3e5fc66)',
              }}
            />
            {/* 円の円周上+12pxの位置に番号を表示（常に中心から半径+12pxの位置） */}
            {(() => {
              // 円の中心座標
              const cx = (c.x / 100) * imgWidth;
              const cy = (c.y / 100) * imgHeight;
              // 半径(px)（楕円補正なし: 画像の短辺基準で）
              const r = ((c.r / 100) * Math.min(imgWidth, imgHeight)) / 2;
              // 左上方向（-135度, SVG座標系でy軸下向きなので+45度）
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
      handleCircleRightClick,
      imgWidth,
      imgHeight,
      setEdit,
    ]
  );

  // コメント管理用カスタムフック
  const {
    commentDraft,
    handleCommentSave,
    handleCommentDelete,
    handleCommentSelect,
    handleCommentDraftChange,
  } = useCommentManager({ circles, setCircles, edit, setEdit });

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        background: '#fff',
      }}
    >
      {/* 左カラム: 画像＋円描画エリア */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
        }}
      >
        <CircleCanvas
          circles={circles}
          edit={edit}
          imgWidth={imgWidth}
          imgHeight={imgHeight}
          onSvgMouseDown={handleSvgMouseDown}
          onSvgMouseMove={handleSvgMouseMove}
          onSvgMouseUp={handleSvgMouseUp}
          onSvgMouseLeave={handleSvgMouseLeave}
          onSvgClick={handleSvgClick}
          renderedCircles={renderedCircles}
        />
      </div>
      {/* 右カラム: コメント編集エリア */}
      <CommentPanel
        circles={circles}
        selectedId={edit.selectedId}
        commentDraft={commentDraft}
        onSelect={handleCommentSelect}
        onDelete={handleCommentDelete}
        onCommentDraftChange={handleCommentDraftChange}
        onCommentSave={handleCommentSave}
      />
    </main>
  );
}
