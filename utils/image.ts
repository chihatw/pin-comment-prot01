import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { supabaseErrorGuard } from './supabaseUtils';

export type ThumbnailImage = { id: string; src: string };

export type PinCommentImageRow =
  Database['public']['Tables']['pin_comment_images']['Row'];

/**
 * 画像IDからSupabase Storageの署名付き画像URLを取得する関数
 *
 * @param {string} imageId - 画像の一意なID。Supabaseのpin_comment_imagesテーブルのid。
 * @returns {Promise<{ id: string; src: string } | null>} 画像IDと署名付きURLを持つオブジェクト。取得失敗時はnull。
 */
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

/**
 * アスペクト比を維持して、指定した最大幅・最大高さに収まるサイズを計算する
 * @param naturalWidth 画像の元の幅
 * @param naturalHeight 画像の元の高さ
 * @param maxWidth 最大幅
 * @param maxHeight 最大高さ
 * @returns { width: number, height: number }
 */
export function getContainSize(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let w = maxWidth;
  let h = Math.round((naturalHeight / naturalWidth) * w);
  if (h > maxHeight) {
    h = maxHeight;
    w = Math.round((naturalWidth / naturalHeight) * h);
  }
  return { width: w, height: h };
}
