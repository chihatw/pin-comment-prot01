import { supabase } from '../lib/supabaseClient';
import type { Circle } from './types';
import type { Database } from './types/supabase';
import { supabaseErrorGuard } from './utils/supabaseUtils';

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

// Undoスタック管理ユーティリティ
export function pushUndo(
  prevStack: Array<Circle[]>,
  prevCircles: Circle[],
  maxStack: number = 10
) {
  const newStack = [...prevStack, prevCircles.map((c) => ({ ...c }))];
  if (newStack.length > maxStack) newStack.shift();
  return newStack;
}

export type ThumbnailImage = { id: string; src: string };

export type PinCommentImageRow =
  Database['public']['Tables']['pin_comment_images']['Row'];

export async function fetchImageWithSignedUrl(
  imageId: string
): Promise<ThumbnailImage | null> {
  const { data: imageData, error: imageError } = await supabase
    .from('pin_comment_images')
    .select('*')
    .eq('id', imageId)
    .single();
  try {
    const { storage_path } = supabaseErrorGuard<
      Pick<PinCommentImageRow, 'storage_path'>
    >(imageData, imageError, '画像情報の取得に失敗しました');
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from('pin-comment-images')
        .createSignedUrl(storage_path, 60 * 60);
    const { signedUrl } = supabaseErrorGuard<{ signedUrl: string }>(
      signedUrlData,
      signedUrlError,
      'サインドURLの取得に失敗しました'
    );
    return {
      id: imageId,
      src: signedUrl,
    };
  } catch {
    return null;
  }
}
