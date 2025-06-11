import { v4 as uuidv4 } from 'uuid';

import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { fetchImageWithSignedUrl, ThumbnailImage } from './image';
import { supabaseErrorGuard } from './supabaseUtils';

export type PinCommentThumbnail = { image_id: string };

// 型エイリアス
// pin_comment_images テーブルの型
export type PinCommentImageRow =
  Database['public']['Tables']['pin_comment_images']['Row'];
export type PinCommentImagesInsert =
  Database['public']['Tables']['pin_comment_images']['Insert'];
export type PinCommentThumbnailsRow =
  Database['public']['Tables']['pin_comment_thumbnails']['Row'];
export type PinCommentThumbnailsInsert =
  Database['public']['Tables']['pin_comment_thumbnails']['Insert'];

export async function fetchThumbnailsForUser(
  userId: string,
  maxCount: number
): Promise<ThumbnailImage[]> {
  const { data, error: fetchError } = await supabase
    .from('pin_comment_thumbnails')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(maxCount);
  if (fetchError) throw fetchError;
  if (data && data.length > 0) {
    const imageList = await Promise.all(
      (data as PinCommentThumbnailsRow[]).map((row) =>
        row.image_id
          ? fetchImageWithSignedUrl(row.image_id)
          : Promise.resolve(null)
      )
    );
    return imageList.filter((img): img is ThumbnailImage => !!img);
  } else {
    return [];
  }
}

export async function uploadThumbnailFile(
  file: File,
  userId: string
): Promise<{ id: string; src: string }> {
  const id = uuidv4();
  const fileExt = file.name.split('.').pop();
  const filePath = `${id}.${fileExt}`;
  // Supabase Storageへアップロード
  const { error: uploadError } = await supabase.storage
    .from('pin-comment-images')
    .upload(filePath, file, { upsert: true });
  if (uploadError) throw uploadError;
  // サインドURL取得
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('pin-comment-images')
    .createSignedUrl(filePath, 60 * 60); // 1時間有効
  const { signedUrl } = supabaseErrorGuard<{ signedUrl: string }>(
    signedUrlData,
    signedUrlError,
    'サインドURLの取得に失敗しました'
  );
  // トランザクションでinsert（RPC呼び出し）
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'insert_thumbnail_with_image',
    {
      p_user_id: userId,
      p_storage_path: filePath,
      p_file_name: file.name,
    }
  );
  if (rpcError || !rpcData || !rpcData[0]?.image_id)
    throw rpcError || new Error('DB登録に失敗しました');
  return { id: rpcData[0].image_id, src: signedUrl };
}

export async function deleteThumbnailById(id: string): Promise<void> {
  // 1. storage_path取得
  const { data: imageData, error: imageFetchError } = await supabase
    .from('pin_comment_images')
    .select('storage_path')
    .eq('id', id)
    .single();
  const { storage_path } = supabaseErrorGuard<{ storage_path: string }>(
    imageData,
    imageFetchError,
    '画像情報の取得に失敗しました'
  );
  // 2. Supabase Storageから削除
  const { error: storageDeleteError } = await supabase.storage
    .from('pin-comment-images')
    .remove([storage_path]);
  if (storageDeleteError) throw storageDeleteError;
  // 3. DBから削除（トランザクション/RPC）
  const { error: rpcError } = await supabase.rpc('delete_thumbnail_and_image', {
    p_image_id: id,
  });
  if (rpcError) throw rpcError;
}
