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
