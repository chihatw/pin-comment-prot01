// SVG座標変換ユーティリティ
export function getSvgRelativeCoords(
  e: React.MouseEvent<SVGSVGElement | SVGCircleElement, MouseEvent>,
  svgRect?: DOMRect
): { x: number; y: number } {
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
}

// 円ラベル座標計算ユーティリティ
export function getCircleLabelPosition(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
  offset: number
) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const labelR = r + offset;
  return {
    x: cx + Math.cos(angleRad) * labelR,
    y: cy + Math.sin(angleRad) * labelR,
  };
}
