'use client';
import { useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

// 円の型
interface Circle {
  id: number;
  x: number; // 画像上の中心X（%）
  y: number; // 画像上の中心Y（%）
  r: number; // 半径（%）
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
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({
    dx: 0,
    dy: 0,
  });
  const [drawing, setDrawing] = useState<{
    startX: number;
    startY: number;
  } | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view'); // 追加: モード
  const [zoom, setZoom] = useState(1);
  const [setTransformApi, setSetTransformApi] = useState<
    | null
    | ((
        x: number,
        y: number,
        scale: number,
        duration?: number,
        animationType?: string
      ) => void)
  >(null);
  const [getTransformApi, setGetTransformApi] = useState<
    null | (() => { positionX: number; positionY: number; scale: number })
  >(null);
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number } | null>(
    null
  );

  // 画像サイズ（px）
  const imgWidth = 800;
  const imgHeight = 600;

  // 円追加
  const handleSvgMouseDown = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    if (mode !== 'edit') return;
    if (e.button !== 0) return; // 左クリックのみ
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawing({ startX: x, startY: y });
  };
  const handleSvgMouseMove = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    if (!drawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLastMouse({ x, y });
  };
  const handleSvgMouseUp = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!drawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // 直径の端と端
    const dx = x - drawing.startX;
    const dy = y - drawing.startY;
    const r = Math.sqrt(dx * dx + dy * dy) / 2;
    if (r > 1) {
      // 中心座標を直径の中点に
      const centerX = (drawing.startX + x) / 2;
      const centerY = (drawing.startY + y) / 2;
      setCircles([...circles, { id: Date.now(), x: centerX, y: centerY, r }]);
    }
    setDrawing(null);
    setLastMouse(null);
  };

  // 円のドラッグ開始
  const handleCircleMouseDown = (id: number, e: React.MouseEvent) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    const rect = (
      e.target as SVGCircleElement
    ).ownerSVGElement!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const circle = circles.find((c) => c.id === id)!;
    setDragId(id);
    setDragOffset({ dx: circle.x - x, dy: circle.y - y });
  };
  // 円のドラッグ移動
  const handleSvgDragMove = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    if (dragId === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCircles((circles) =>
      circles.map((c) =>
        c.id === dragId
          ? { ...c, x: x + dragOffset.dx, y: y + dragOffset.dy }
          : c
      )
    );
  };
  // 円のドラッグ終了
  const handleSvgDragEnd = () => {
    setDragId(null);
  };
  // 円の削除
  const handleCircleRightClick = (id: number, e: React.MouseEvent) => {
    if (mode !== 'edit') return;
    e.preventDefault();
    setCircles((circles) => circles.filter((c) => c.id !== id));
  };

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

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
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
              border: '2px solid #4fc3f7',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 60%, #e1f5fe 100%)',
              boxShadow: '0 4px 24px #b3e5fc55',
            }}
          >
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
                    ? drawing
                      ? 'crosshair'
                      : dragId
                      ? 'grabbing'
                      : 'pointer'
                    : 'grab',
              }}
              onMouseDown={
                mode === 'edit' && dragId === null
                  ? handleSvgMouseDown
                  : undefined
              }
              onMouseMove={(e) => {
                if (mode === 'edit') {
                  if (dragId !== null) handleSvgDragMove(e);
                  else if (drawing) handleSvgMouseMove(e);
                }
              }}
              onMouseUp={(e) => {
                if (mode === 'edit') {
                  if (dragId !== null) handleSvgDragEnd();
                  else if (drawing) handleSvgMouseUp(e);
                }
              }}
              onMouseLeave={() => {
                if (mode === 'edit') {
                  setDrawing(null);
                  setDragId(null);
                  setLastMouse(null);
                }
              }}
            >
              {/* 画像 */}
              <image
                href='/sample.jpg'
                width={imgWidth}
                height={imgHeight}
                style={{
                  display: 'block',
                  width: imgWidth,
                  height: imgHeight,
                  userSelect: 'none',
                  borderRadius: 16,
                  boxShadow: '0 2px 12px #b3e5fc33',
                }}
                preserveAspectRatio='xMidYMid slice'
              />
              {/* 既存の円 */}
              {circles.map((c) => (
                <circle
                  key={c.id}
                  cx={`${c.x}%`}
                  cy={`${c.y}%`}
                  r={`${c.r}%`}
                  fill='rgba(33, 150, 243, 0.13)'
                  stroke='#039be5'
                  strokeWidth={2.5}
                  onMouseDown={
                    mode === 'edit'
                      ? (e) => handleCircleMouseDown(c.id, e)
                      : undefined
                  }
                  onContextMenu={
                    mode === 'edit'
                      ? (e) => handleCircleRightClick(c.id, e)
                      : undefined
                  }
                  style={{
                    cursor: mode === 'edit' ? 'grab' : 'default',
                    filter: 'drop-shadow(0 2px 6px #b3e5fc66)',
                  }}
                />
              ))}
              {/* 描画中の円プレビュー */}
              {mode === 'edit' &&
                drawing &&
                lastMouse &&
                (() => {
                  // 直径の端と端
                  const dx = lastMouse.x - drawing.startX;
                  const dy = lastMouse.y - drawing.startY;
                  const r = Math.sqrt(dx * dx + dy * dy) / 2;
                  if (r > 0.5) {
                    // 中心座標を直径の中点に
                    const centerX = (drawing.startX + lastMouse.x) / 2;
                    const centerY = (drawing.startY + lastMouse.y) / 2;
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
        </TransformComponent>
      </TransformWrapper>
    </main>
  );
}
