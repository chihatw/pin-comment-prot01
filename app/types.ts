// 【座標系の仕様】
// x, y, r はすべて画像やSVG全体に対するパーセンテージ（0〜100の範囲、%単位）で管理します。
// x, y: 円の中心座標（%）
// r: 円の半径（%）
// 例: x=50, y=50, r=10 なら画像中央に半径10%の円となります。
// ピクセル値に変換する場合は、(x / 100) * 画像幅 などで計算してください。
//
// 例: ピクセル変換
//   const cx_px = (circle.x / 100) * imgWidth;
//   const cy_px = (circle.y / 100) * imgHeight;
//   const r_px = (circle.r / 100) * ((imgWidth + imgHeight) / 2);
//
// この仕様は全体で統一されています。

// 円の型定義を共通化
export interface Circle {
  id: string; // idをstring（uuid）に変更
  x: number;
  y: number;
  r: number;
  comment?: string;
  index: number; // 並び順を明示するプロパティを追加
}

// 【EditStateの仕様】
// 円の編集状態を管理するための一時的な情報を保持します。
// - dragId: 現在ドラッグ中の円のid（なければnull）
// - dragOffset: ドラッグ開始時のオフセット（dx, dy）
// - drawing: 新規円描画中の開始座標（startX, startY, %単位）
// - resizeId: 現在リサイズ中の円のid（なければnull）
// - resizeStart: リサイズ開始時のマウス座標(mx, my, %単位)と半径r（%）
// - lastMouse: 直近のマウス座標（x, y, %単位）
// - hoverId: ホバー中の円のid（なければnull）
// - selectedId: 選択中の円のid（なければnull）
//
// ※座標や半径はCircleと同様、すべて%（0〜100）で管理します。
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
