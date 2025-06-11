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
