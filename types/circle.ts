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
