import { useCallback, useState } from 'react';
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

export function useCircleEditState() {
  const [circles, setCircles] = useState<Circle[]>(getInitialCircles);
  const [edit, setEdit] = useState<EditState>(initialEditState);

  // localStorage同期
  useCircleStorage(circles);

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
  };
}
