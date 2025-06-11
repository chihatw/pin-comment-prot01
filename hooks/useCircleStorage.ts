import { Circle } from '@/types/circle';
import debounce from 'lodash/debounce';
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

// imageIdを引数にして、その画像に紐づくcirclesを取得
export async function getInitialCircles(imageId: string): Promise<Circle[]> {
  const { data, error } = await supabase
    .from('pin_comment_circles')
    .select('*')
    .eq('image_id', imageId)
    .order('index', { ascending: true });
  if (error) {
    console.error('Failed to fetch circles from supabase:', error);
    return [];
  }
  return data as Circle[];
}

// circlesをsupabaseに永続化するフック
export function useCircleStorage(
  circles: Circle[],
  imageId: string,
  deletedCircleIds: string[],
  setDeletedCircleIds: (ids: string[]) => void
) {
  const debouncedSave = useRef(
    debounce(async (data: Circle[], imageId: string, deletedIds: string[]) => {
      if (!imageId) return;
      if (!data || data.length === 0) {
        // サークルが空の場合は該当image_idのデータを削除
        await supabase
          .from('pin_comment_circles')
          .delete()
          .eq('image_id', imageId);
        // 削除IDもリセット
        setDeletedCircleIds([]);
        return;
      }
      // 削除IDがあれば削除
      if (deletedIds && deletedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('pin_comment_circles')
          .delete()
          .in('id', deletedIds);
        if (deleteError) {
          console.error(
            'Failed to delete removed circles from supabase:',
            deleteError
          );
        }
        setDeletedCircleIds([]); // 削除IDリセット
      }
      // 各circleにimage_idを付与してupsert
      const upsertData = data.map((c) => ({ ...c, image_id: imageId }));
      const { error } = await supabase
        .from('pin_comment_circles')
        .upsert(upsertData, { onConflict: 'id' });
      if (error) {
        console.error('Failed to save circles to supabase:', error);
      }
    }, 500)
  ).current;

  useEffect(() => {
    debouncedSave(circles, imageId, deletedCircleIds);
    return () => {
      debouncedSave.cancel();
    };
  }, [circles, imageId, deletedCircleIds, debouncedSave]);
}
