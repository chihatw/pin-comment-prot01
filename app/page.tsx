'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

// 円の型
interface Circle {
  id: number;
  x: number; // 画像上の中心X（%）
  y: number; // 画像上の中心Y（%）
  r: number; // 半径（%）
  comment?: string; // コメント
}

// 編集用状態の型
interface EditState {
  dragId: number | null;
  dragOffset: { dx: number; dy: number };
  drawing: { startX: number; startY: number } | null;
  resizeId: number | null;
  resizeStart: { mx: number; my: number; r: number } | null;
  lastMouse: { x: number; y: number } | null;
  hoverId: number | null;
  selectedId: number | null; // 追加: クリック選択用
}

function ZoomSlider({
  zoom,
  setZoom,
  setTransform,
  getTransform,
  imgWidth,
  imgHeight,
  mode,
  setMode,
}: {
  zoom: number;
  setZoom: (z: number) => void;
  setTransform: (
    x: number,
    y: number,
    scale: number,
    duration?: number,
    animationType?: string
  ) => void;
  getTransform: () => { positionX: number; positionY: number; scale: number };
  imgWidth: number;
  imgHeight: number;
  mode: 'view' | 'edit';
  setMode: (m: 'view' | 'edit') => void;
}) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setZoom(newScale);
    // 現在の中心を維持するズーム
    const { positionX, positionY, scale } = getTransform();
    // 現在の表示中心（画像座標）
    const centerX = (-positionX + imgWidth / 2) / scale;
    const centerY = (-positionY + imgHeight / 2) / scale;
    // 新しいx, yを計算
    const newX = -(centerX * newScale - imgWidth / 2);
    const newY = -(centerY * newScale - imgHeight / 2);
    setTransform(newX, newY, newScale, 200, 'easeOut'); // x, yは0で維持
  };
  // リセットボタン
  const handleReset = () => {
    setZoom(1);
    setTransform(0, 0, 1, 200, 'easeOut');
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 32,
        transform: 'translateX(-50%)',
        zIndex: 20,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px #b3e5fc33',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        border: '1.5px solid #e3f2fd',
      }}
    >
      {/* モード切替スイッチ（スライダー横） */}
      <div style={{ display: 'flex', gap: 0 }}>
        <button
          onClick={() => setMode('view')}
          aria-label='表示モード'
          style={{
            background: mode === 'view' ? '#4fc3f7' : '#fff',
            color: mode === 'view' ? '#fff' : '#039be5',
            border: '1.5px solid #4fc3f7',
            borderRadius: '8px 0 0 8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: mode === 'view' ? '0 2px 8px #b3e5fc88' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
          }}
        >
          {/* 手のひら（パン）アイコン */}
          <svg
            width='28'
            height='28'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.2'
            strokeLinecap='round'
            strokeLinejoin='round'
            style={{ display: 'block' }}
          >
            <path d='M7 11V5.5a2.5 2.5 0 0 1 5 0V12' />
            <path d='M12 12V7.5a2.5 2.5 0 0 1 5 0V14' />
            <path d='M17 14v-2.5a2.5 2.5 0 0 1 5 0V17a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5v-4.5a2.5 2.5 0 0 1 5 0V17' />
          </svg>
        </button>
        <button
          onClick={() => setMode('edit')}
          aria-label='編集モード'
          style={{
            background: mode === 'edit' ? '#4fc3f7' : '#fff',
            color: mode === 'edit' ? '#fff' : '#039be5',
            border: '1.5px solid #4fc3f7',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: mode === 'edit' ? '0 2px 8px #b3e5fc88' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
          }}
        >
          {/* 鉛筆のアイコン */}
          <svg
            width='26'
            height='26'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.2'
            strokeLinecap='round'
            strokeLinejoin='round'
            style={{ display: 'block' }}
          >
            <path d='M12 20h9' />
            <path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z' />
          </svg>
        </button>
      </div>
      {/* 虫眼鏡アイコン */}
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#039be5'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{ display: 'block' }}
      >
        <circle cx='11' cy='11' r='7' />
        <line x1='21' y1='21' x2='16.65' y2='16.65' />
      </svg>
      <input
        type='range'
        min={0.5}
        max={4}
        step={0.01}
        value={zoom}
        onChange={handleSliderChange}
        style={{ width: 180 }}
        aria-label='ズーム'
      />
      <span style={{ color: '#1976d2', fontWeight: 500, fontSize: 14 }}>
        {(zoom * 100).toFixed(0)}%
      </span>
      {/* リセットボタン */}
      <button
        onClick={handleReset}
        aria-label='初期表示にリセット'
        style={{
          marginLeft: 8,
          background: '#e3f2fd',
          border: 'none',
          borderRadius: 6,
          padding: 6,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 1px 4px #b3e5fc33',
          transition: 'background 0.2s',
        }}
      >
        {/* リセット（回転矢印）アイコン */}
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#039be5'
          strokeWidth='2.2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <polyline points='1 4 1 10 7 10' />
          <path d='M3.51 15a9 9 0 1 0 2.13-9.36L1 10' />
        </svg>
      </button>
    </div>
  );
}

export default function Home() {
  const [circles, setCircles] = useState<Circle[]>([]);
  // 編集用状態（ドラッグ・描画・リサイズ・ホバーなど）
  const [edit, setEdit] = useState<EditState>({
    dragId: null,
    dragOffset: { dx: 0, dy: 0 },
    drawing: null,
    resizeId: null,
    resizeStart: null,
    lastMouse: null,
    hoverId: null,
    selectedId: null, // 追加
  });
  // Undo履歴（最大10件）
  const [undoStack, setUndoStack] = useState<Circle[][]>([]);
  const isPushingUndo = useRef(false); // 無限ループ防止
  // ズーム値
  const [zoom, setZoom] = useState<number>(1);
  // Transform API
  const [setTransformApi, setSetTransformApi] = useState<
    | ((
        x: number,
        y: number,
        scale: number,
        duration?: number,
        animationType?: string
      ) => void)
    | null
  >(null);
  const [getTransformApi, setGetTransformApi] = useState<
    (() => { positionX: number; positionY: number; scale: number }) | null
  >(null);
  // --- モード切替はuseStateのまま維持 ---
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // 画像サイズ（px）
  const imgWidth = 800;
  const imgHeight = 600;

  // Undo履歴に現在の円リストを追加（最大10件）
  const pushUndo = useCallback((prevCircles: Circle[]) => {
    setUndoStack((prev) => {
      const newStack = [...prev, prevCircles.map((c) => ({ ...c }))];
      if (newStack.length > 10) newStack.shift();
      return newStack;
    });
  }, []);

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

  // SVG座標を%で取得するユーティリティ
  const getSvgRelativeCoords = (
    e: React.MouseEvent<SVGSVGElement | SVGCircleElement, MouseEvent>,
    svgRect?: DOMRect
  ): { x: number; y: number } => {
    let rect: DOMRect;
    if (svgRect) {
      rect = svgRect;
    } else if ('ownerSVGElement' in e.target && e.target.ownerSVGElement) {
      rect = (
        e.target as SVGCircleElement
      ).ownerSVGElement!.getBoundingClientRect();
    } else if ('getBoundingClientRect' in e.target) {
      rect = (e.target as SVGSVGElement).getBoundingClientRect();
    } else {
      throw new Error('SVG rect not found');
    }
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };
  // Undo pushの共通関数
  const pushUndoIfNeeded = (prevCircles: Circle[]) => {
    pushUndo(prevCircles);
    isPushingUndo.current = true;
  };

  // 編集用状態のリセット
  const resetEditState = useCallback(() => {
    setEdit({
      dragId: null,
      dragOffset: { dx: 0, dy: 0 },
      drawing: null,
      resizeId: null,
      resizeStart: null,
      lastMouse: null,
      hoverId: null,
      selectedId: null, // 追加
    });
  }, []);

  // --- 編集操作時にUndo履歴をpush ---
  // 円追加
  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.drawing !== null) return;
      if (mode !== 'edit') return;
      if (e.button !== 0) return;
      const { x, y } = getSvgRelativeCoords(e);
      pushUndo(circles);
      setEdit((prev) => ({ ...prev, drawing: { startX: x, startY: y } }));
    },
    [edit, mode, circles]
  );

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (edit.drawing === null) return;
      const { x, y } = getSvgRelativeCoords(e);
      setEdit((prev) => ({ ...prev, lastMouse: { x, y } }));
    },
    [edit]
  );

  const handleSvgMouseUp = useCallback(
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
    [edit]
  );

  const handleCircleMouseDown = useCallback(
    (id: number, e: React.MouseEvent) => {
      if (mode !== 'edit') return;
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
    [mode, circles, edit]
  );

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
    [edit, circles]
  );

  const handleSvgDragEnd = useCallback(() => {
    setEdit((prev) => ({
      ...prev,
      dragId: null,
      dragOffset: { dx: 0, dy: 0 },
    }));
    isPushingUndo.current = false;
  }, [edit]);

  const handleCircleRightClick = useCallback(
    (id: number, e: React.MouseEvent) => {
      if (mode !== 'edit') return;
      e.preventDefault();
      pushUndo(circles);
      setCircles((prev) => prev.filter((c) => c.id !== id));
    },
    [mode, circles]
  );

  // --- useMemoで円の描画用データを最適化（依存配列をhoverId等に限定）---
  const renderedCircles = useMemo(
    () =>
      circles.map((c, idx) => {
        let handle = null;
        // ホバー中かつリサイズ中でない円にのみハンドラを表示
        if (
          edit.hoverId === c.id &&
          mode === 'edit' &&
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
                onMouseDown={(e) => {
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
            onPointerOut={(e) => {
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
                mode === 'edit' && !edit.resizeId
                  ? (e) => handleCircleMouseDown(c.id, e)
                  : undefined
              }
              onContextMenu={
                mode === 'edit'
                  ? (e) => handleCircleRightClick(c.id, e)
                  : undefined
              }
              style={{
                cursor:
                  mode === 'edit' && edit.hoverId === c.id && !edit.resizeId
                    ? 'move'
                    : mode === 'edit'
                    ? 'grab'
                    : 'default',
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
              const angleRad = (-135 * Math.PI) / 180;
              const labelR = r + 12; // 必ず中心から半径+12px
              const labelX = cx + Math.cos(angleRad) * labelR;
              const labelY = cy + Math.sin(angleRad) * labelR;
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
      edit.resizeStart,
      edit.selectedId,
      mode,
      handleCircleMouseDown,
      handleCircleRightClick,
      imgWidth,
      imgHeight,
    ]
  );

  // TransformWrapperのonZoomでズーム値を同期
  const handleZoom = (ref: any) => {
    setZoom(ref.state.scale);
  };

  // TransformWrapperのonInitでAPI取得
  const handleInit = (ref: any) => {
    setSetTransformApi(() => ref.setTransform);
    setGetTransformApi(() => () => ({
      positionX: ref.state.positionX,
      positionY: ref.state.positionY,
      scale: ref.state.scale,
    }));
  };

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
  }, [selectedCircle?.id]);

  // コメント保存
  const handleCommentSave = () => {
    if (!selectedCircle) return;
    setCircles((prev) =>
      prev.map((c) =>
        c.id === selectedCircle.id ? { ...c, comment: commentDraft } : c
      )
    );
  };

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex', // 2カラム化
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
        {/* ズームスライダー */}
        <TransformWrapper
          minScale={0.5}
          maxScale={4}
          wheel={{ step: 0.1 }}
          panning={{ disabled: mode !== 'view' }}
          onZoom={handleZoom}
          onInit={handleInit}
        >
          {setTransformApi && getTransformApi && (
            <ZoomSlider
              zoom={zoom}
              setZoom={setZoom}
              setTransform={setTransformApi}
              getTransform={getTransformApi}
              imgWidth={imgWidth}
              imgHeight={imgHeight}
              mode={mode}
              setMode={setMode}
            />
          )}
          <TransformComponent>
            <div
              style={{
                position: 'relative',
                width: imgWidth,
                height: imgHeight,
                borderRadius: 16,
                background:
                  'linear-gradient(135deg, #ffffff 60%, #e1f5fe 100%)',
                boxShadow: '0 4px 24px #b3e5fc55',
                overflow: 'hidden',
              }}
            >
              {/* 画像 */}
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
                  cursor:
                    mode === 'edit'
                      ? edit.drawing
                        ? 'crosshair'
                        : edit.dragId
                        ? 'grabbing'
                        : 'pointer'
                      : 'grab',
                }}
                onMouseDown={
                  mode === 'edit' && edit.dragId === null
                    ? handleSvgMouseDown
                    : undefined
                }
                onMouseMove={(e) => {
                  if (mode === 'edit') {
                    if (edit.resizeId !== null && edit.resizeStart) {
                      if (!isPushingUndo.current) {
                        pushUndo(circles);
                        isPushingUndo.current = true;
                      }
                      // --- リサイズ処理 ---
                      const rect = e.currentTarget.getBoundingClientRect();
                      const cx =
                        circles.find((c) => c.id === edit.resizeId)?.x ?? 0;
                      const cy =
                        circles.find((c) => c.id === edit.resizeId)?.y ?? 0;
                      // マウス座標（%）
                      const mx = ((e.clientX - rect.left) / rect.width) * 100;
                      const my = ((e.clientY - rect.top) / rect.height) * 100;
                      // 中心→マウスの距離（%）
                      const dx = mx - cx;
                      const dy = my - cy;
                      const newR = Math.sqrt(dx * dx + dy * dy);
                      setCircles((prev) =>
                        prev.map((c) =>
                          c.id === edit.resizeId
                            ? { ...c, r: Math.max(newR, 1) }
                            : c
                        )
                      );
                    } else if (edit.dragId !== null) handleSvgDragMove(e);
                    else if (edit.drawing) handleSvgMouseMove(e);
                  }
                  if (edit.hoverId !== null) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setEdit((prev) => ({ ...prev, lastMouse: { x, y } }));
                  }
                }}
                onMouseUp={(e) => {
                  if (mode === 'edit') {
                    if (edit.resizeId !== null) {
                      setEdit((prev) => ({
                        ...prev,
                        resizeId: null,
                        resizeStart: null,
                      }));
                      isPushingUndo.current = false;
                    } else if (edit.dragId !== null) handleSvgDragEnd();
                    else if (edit.drawing) handleSvgMouseUp(e);
                  }
                }}
                onMouseLeave={() => {
                  if (mode === 'edit') {
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
                  }
                  setEdit((prev) => ({ ...prev, hoverId: null }));
                }}
                onClick={() =>
                  setEdit((prev) => ({ ...prev, selectedId: null }))
                }
              >
                {/* 既存の円 */}
                {renderedCircles}
                {/* 描画中の円プレビュー */}
                {mode === 'edit' &&
                  edit.drawing &&
                  edit.lastMouse &&
                  (() => {
                    const dx = edit.lastMouse.x - edit.drawing.startX;
                    const dy = edit.lastMouse.y - edit.drawing.startY;
                    const r = Math.sqrt(dx * dx + dy * dy) / 2;
                    if (r > 0.5) {
                      const centerX =
                        (edit.drawing.startX + edit.lastMouse.x) / 2;
                      const centerY =
                        (edit.drawing.startY + edit.lastMouse.y) / 2;
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
              {/* デバッグ用: 画像全体を覆う透明なrect（マウスイベント用） */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1,
                  cursor:
                    mode === 'edit'
                      ? edit.drawing
                        ? 'crosshair'
                        : 'grab'
                      : 'default',
                }}
                onMouseDown={
                  mode === 'edit' && edit.dragId === null
                    ? handleSvgMouseDown
                    : undefined
                }
                onMouseMove={(e) => {
                  if (mode === 'edit') {
                    if (edit.resizeId !== null && edit.resizeStart) {
                      if (!isPushingUndo.current) {
                        pushUndo(circles);
                        isPushingUndo.current = true;
                      }
                      // --- リサイズ処理 ---
                      const rect = e.currentTarget.getBoundingClientRect();
                      const cx =
                        circles.find((c) => c.id === edit.resizeId)?.x ?? 0;
                      const cy =
                        circles.find((c) => c.id === edit.resizeId)?.y ?? 0;
                      // マウス座標（%）
                      const mx = ((e.clientX - rect.left) / rect.width) * 100;
                      const my = ((e.clientY - rect.top) / rect.height) * 100;
                      // 中心→マウスの距離（%）
                      const dx = mx - cx;
                      const dy = my - cy;
                      const newR = Math.sqrt(dx * dx + dy * dy);
                      setCircles((prev) =>
                        prev.map((c) =>
                          c.id === edit.resizeId
                            ? { ...c, r: Math.max(newR, 1) }
                            : c
                        )
                      );
                    } else if (edit.dragId !== null) handleSvgDragMove(e);
                    else if (edit.drawing) handleSvgMouseMove(e);
                  }
                  if (edit.hoverId !== null) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setEdit((prev) => ({ ...prev, lastMouse: { x, y } }));
                  }
                }}
                onMouseUp={(e) => {
                  if (mode === 'edit' && edit.dragId !== null) {
                    handleSvgDragEnd();
                  }
                }}
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
      {/* 右カラム: コメント編集エリア */}
      <div
        style={{
          width: 400,
          padding: 32,
          boxShadow: '-4px 0 24px #b3e5fc55',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'linear-gradient(135deg, #ffffff 60%, #e1f5fe 100%)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1976d2',
          }}
        >
          円のコメント
        </h2>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
            paddingRight: 8,
          }}
        >
          {/* コメント一覧 */}
          {circles.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#aaa',
                padding: '32px 0',
                fontSize: 18,
              }}
            >
              円がありません。円を追加するとここにコメントが表示されます。
            </div>
          )}
          {circles.map((circle, idx) => (
            <div
              key={circle.id}
              style={{
                padding: 16,
                borderRadius: 8,
                background:
                  edit.selectedId === circle.id
                    ? 'rgba(33, 150, 243, 0.12)'
                    : 'transparent',
                border: `1px solid ${
                  edit.selectedId === circle.id ? '#1976d2' : 'transparent'
                }`,
                boxShadow:
                  edit.selectedId === circle.id
                    ? '0 2px 8px rgba(25, 118, 210, 0.2)'
                    : 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative', // 削除ボタン配置用
              }}
              onClick={() =>
                setEdit((prev) => ({ ...prev, selectedId: circle.id }))
              }
            >
              {/* 番号バッジのみ表示 */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: '#e1f5fe',
                    color: '#039be5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: '#333',
                    flex: 1,
                    minHeight: 24,
                  }}
                >
                  {circle.comment || (
                    <span style={{ color: '#bbb' }}>（コメントなし）</span>
                  )}
                </div>
                {/* 削除ボタン（アイコン） */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCircles((prev) =>
                      prev.filter((c) => c.id !== circle.id)
                    );
                    // 選択中なら選択解除
                    setEdit((prev) =>
                      prev.selectedId === circle.id
                        ? { ...prev, selectedId: null }
                        : prev
                    );
                  }}
                  aria-label='削除'
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 4,
                    marginLeft: 8,
                    cursor: 'pointer',
                    borderRadius: 4,
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {/* ゴミ箱アイコン */}
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#b71c1c'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' />
                    <line x1='10' y1='11' x2='10' y2='17' />
                    <line x1='14' y1='11' x2='14' y2='17' />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* コメント入力エリアを下端に固定 */}
        {selectedCircle && (
          <div
            style={{
              marginTop: 24,
              borderTop: '1px solid #e3f2fd',
              paddingTop: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#1976d2', fontSize: 15 }}>
              円 {circles.findIndex((c) => c.id === selectedCircle.id) + 1}{' '}
              のコメント編集
            </div>
            <textarea
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              style={{
                width: '100%',
                height: 60,
                borderRadius: 4,
                border: '1px solid #b0bec5',
                padding: 8,
                fontSize: 14,
                color: '#333',
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              placeholder='コメントを入力...'
              aria-label='コメント'
            />
            <button
              onClick={handleCommentSave}
              style={{
                alignSelf: 'flex-end',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.2s',
              }}
              aria-label='コメントを保存'
            >
              保存
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
