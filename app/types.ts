// 円の型定義を共通化
export interface Circle {
  id: number;
  x: number;
  y: number;
  r: number;
  comment?: string;
}

export interface EditState {
  dragId: number | null;
  dragOffset: { dx: number; dy: number };
  drawing: { startX: number; startY: number } | null;
  resizeId: number | null;
  resizeStart: { mx: number; my: number; r: number } | null;
  lastMouse: { x: number; y: number } | null;
  hoverId: number | null;
  selectedId: number | null;
}
