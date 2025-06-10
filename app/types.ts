// 円の型定義を共通化
export interface Circle {
  id: string; // idをstring（uuid）に変更
  x: number;
  y: number;
  r: number;
  comment?: string;
  index: number; // 並び順を明示するプロパティを追加
}

export interface EditState {
  dragId: string | null;
  dragOffset: { dx: number; dy: number };
  drawing: { startX: number; startY: number } | null;
  resizeId: string | null;
  resizeStart: { mx: number; my: number; r: number } | null;
  lastMouse: { x: number; y: number } | null;
  hoverId: string | null;
  selectedId: string | null;
}
