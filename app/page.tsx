'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CircleCanvas from './CircleCanvas';
import CommentPanel from './CommentPanel';
import type { Circle, EditState } from './types';
import {
  getCircleLabelPosition,
  getSvgRelativeCoords,
  pushUndo as pushUndoUtil,
} from './utils';

export default function Home() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [edit, setEdit] = useState<EditState>({
    dragId: null,
    dragOffset: { dx: 0, dy: 0 },
    drawing: null,
    resizeId: null,
    resizeStart: null,
    lastMouse: null,
    hoverId: null,
    selectedId: null,
  });
  const [undoStack, setUndoStack] = useState<Circle[][]>([]);
  const isPushingUndo = useRef(false);

  const imgWidth = 800;
  const imgHeight = 600;

  // Undo履歴に現在の円リストを追加（最大10件）
  const pushUndo = useCallback((prevCircles: Circle[]) => {
    setUndoStack((prev) => pushUndoUtil(prev, prevCircles, 10));
  }, []); // pushUndoUtilのみ参照

  // --- Undo（ESCキー） ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (edit.drawing === null && e.key === 'Escape' && undoStack.length > 0) {
        setCircles(undoStack[undoStack.length - 1]);
        setUndoStack((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, edit.drawing]);

  // Undo pushの共通関数
  const pushUndoIfNeeded = useCallback(
    (prevCircles: Circle[]) => {
      pushUndo(prevCircles);
      isPushingUndo.current = true;
    },
    [pushUndo]
  );

  // 編集用状態のリセット
  // const resetEditState = useCallback(() => {
  //   setEdit({
  //     dragId: null,
  //     dragOffset: { dx: 0, dy: 0 },
  //     drawing: null,
  //     resizeId: null,
  //     resizeStart: null,
  //     lastMouse: null,
  //     hoverId: null,
  //     selectedId: null, // 追加
  //   });
  // }, []);

  // --- 編集操作時にUndo履歴をpush ---
  // 円追加
  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.drawing !== null) return;
      if (e.button !== 0) return;
      const { x, y } = getSvgRelativeCoords(e);
      pushUndo(circles);
      setEdit((prev) => ({ ...prev, drawing: { startX: x, startY: y } }));
    },
    [edit, circles, pushUndo]
  );

  // --- CircleCanvas用コールバック ---
  // 内部用: 描画中のマウス移動
  const handleSvgMouseMoveInner = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.drawing === null) return;
      const { x, y } = getSvgRelativeCoords(e);
      setEdit((prev) => ({ ...prev, lastMouse: { x, y } }));
    },
    [edit.drawing] // 不要なedit依存を削除
  );

  // SVG上でのドラッグ移動
  const handleSvgDragMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.dragId === null) return;
      if (!isPushingUndo.current) {
        pushUndoIfNeeded(circles);
      }
      const { x, y } = getSvgRelativeCoords(e);
      setCircles((prev) =>
        prev.map((c) =>
          c.id === edit.dragId
            ? { ...c, x: x + edit.dragOffset.dx, y: y + edit.dragOffset.dy }
            : c
        )
      );
    },
    [edit.dragId, edit.dragOffset, circles, pushUndoIfNeeded]
  );

  // 内部用: 描画中のマウスアップ
  const handleSvgMouseUpInner = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.drawing === null) return;
      const { x, y } = getSvgRelativeCoords(e);
      const dx = x - edit.drawing.startX;
      const dy = y - edit.drawing.startY;
      const r = Math.sqrt(dx * dx + dy * dy) / 2;
      if (r > 1) {
        const centerX = (edit.drawing.startX + x) / 2;
        const centerY = (edit.drawing.startY + y) / 2;
        setCircles((prev) => [
          ...prev,
          { id: Date.now(), x: centerX, y: centerY, r },
        ]);
      }
      setEdit((prev) => ({ ...prev, drawing: null, lastMouse: null }));
    },
    [edit.drawing]
  );

  // ドラッグ終了
  const handleSvgDragEnd = useCallback(() => {
    setEdit((prev) => ({
      ...prev,
      dragId: null,
      dragOffset: { dx: 0, dy: 0 },
    }));
    isPushingUndo.current = false;
  }, []); // edit依存を削除

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.resizeId !== null && edit.resizeStart) {
        if (!isPushingUndo.current) {
          pushUndo(circles);
          isPushingUndo.current = true;
        }
        // --- リサイズ処理 ---
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = circles.find((c) => c.id === edit.resizeId)?.x ?? 0;
        const cy = circles.find((c) => c.id === edit.resizeId)?.y ?? 0;
        // マウス座標（%）
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        // 中心→マウスの距離（%）
        const dx = mx - cx;
        const dy = my - cy;
        const newR = Math.sqrt(dx * dx + dy * dy);
        setCircles((prev) =>
          prev.map((c) =>
            c.id === edit.resizeId ? { ...c, r: Math.max(newR, 1) } : c
          )
        );
      } else if (edit.dragId !== null) handleSvgDragMove(e);
      else if (edit.drawing) handleSvgMouseMoveInner(e);

      if (edit.hoverId !== null) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setEdit((prev) => ({ ...prev, lastMouse: { x, y } }));
      }
    },
    [
      edit.resizeId,
      edit.resizeStart,
      edit.dragId,
      edit.drawing,
      edit.hoverId,
      circles,
      handleSvgDragMove,
      handleSvgMouseMoveInner,
      pushUndo,
    ]
  );

  const handleSvgMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.resizeId !== null) {
        setEdit((prev) => ({
          ...prev,
          resizeId: null,
          resizeStart: null,
        }));
        isPushingUndo.current = false;
      } else if (edit.dragId !== null) handleSvgDragEnd();
      else if (edit.drawing) handleSvgMouseUpInner(e);
    },
    [
      edit.resizeId,
      edit.dragId,
      edit.drawing,
      handleSvgDragEnd,
      handleSvgMouseUpInner,
    ]
  );

  const handleSvgMouseLeave = useCallback(() => {
    setEdit((prev) => ({
      ...prev,
      dragId: null,
      dragOffset: { dx: 0, dy: 0 },
      drawing: null,
      resizeId: null,
      resizeStart: null,
      lastMouse: null,
      hoverId: null,
    }));
    setEdit((prev) => ({ ...prev, hoverId: null }));
  }, []);

  const handleSvgClick = useCallback(() => {
    setEdit((prev) => ({ ...prev, selectedId: null }));
  }, []);

  // 円ドラッグ開始
  const handleCircleMouseDown = useCallback(
    (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const { x, y } = getSvgRelativeCoords(
        e as React.MouseEvent<SVGCircleElement, MouseEvent>
      );
      const circle = circles.find((c) => c.id === id)!;
      setEdit((prev) => ({
        ...prev,
        dragId: id,
        dragOffset: { dx: circle.x - x, dy: circle.y - y },
      }));
    },
    [circles]
  );

  // 円右クリック（コンテキストメニュー）
  const handleCircleRightClick = useCallback(
    (id: number, e: React.MouseEvent) => {
      e.preventDefault();
      pushUndo(circles);
      setCircles((prev) => prev.filter((c) => c.id !== id));
    },
    [circles, pushUndo]
  );

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
    ]
  );

  // コメント編集用
  const [commentDraft, setCommentDraft] = useState('');
  // 選択中の円
  const selectedCircle = useMemo(
    () => circles.find((c) => c.id === edit.selectedId) ?? null,
    [circles, edit.selectedId]
  );

  // コメント欄の初期値同期
  useEffect(() => {
    if (selectedCircle) {
      setCommentDraft(selectedCircle.comment || '');
    } else {
      setCommentDraft('');
    }
  }, [selectedCircle]);

  // コメント保存
  const handleCommentSave = () => {
    if (!selectedCircle) return;
    setCircles((prev) =>
      prev.map((c) =>
        c.id === selectedCircle.id ? { ...c, comment: commentDraft } : c
      )
    );
  };

  // コメント削除
  const handleCommentDelete = (id: number) => {
    setCircles((prev) => prev.filter((c) => c.id !== id));
    setEdit((prev) =>
      prev.selectedId === id ? { ...prev, selectedId: null } : prev
    );
  };

  // コメント選択
  const handleCommentSelect = (id: number) => {
    setEdit((prev) => ({ ...prev, selectedId: id }));
  };

  // コメントdraft変更
  const handleCommentDraftChange = (value: string) => {
    setCommentDraft(value);
  };

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
