import { useCallback, useEffect, useState } from 'react';
import type { Circle, EditState } from '../types';
import { getInitialCircles, useCircleStorage } from './useCircleStorage';

const initialEditState: EditState = {
  dragId: null,
  dragOffset: { dx: 0, dy: 0 },
  drawing: null,
  resizeId: null,
  resizeStart: null,
  lastMouse: null,
  hoverId: null,
  selectedId: null,
};

export function useCircleEditState(imageId?: string) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [edit, setEdit] = useState<EditState>(initialEditState);
  // 削除ID管理用stateを追加
  const [deletedCircleIds, setDeletedCircleIds] = useState<string[]>([]);

  // Supabaseから初期データ取得
  useEffect(() => {
    if (!imageId) return;
    getInitialCircles(imageId).then((data) => {
      setCircles(data);
    });
  }, [imageId]);

  // Supabase同期
  useCircleStorage(
    circles,
    imageId || '',
    deletedCircleIds,
    setDeletedCircleIds
  );

  // 編集用状態のリセット
  const resetEditState = useCallback(() => {
    setEdit(initialEditState);
  }, []);

  return {
    circles,
    setCircles,
    edit,
    setEdit,
    resetEditState,
    deletedCircleIds, // 追加
    setDeletedCircleIds, // 追加
  };
}
