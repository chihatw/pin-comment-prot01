import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import type { Circle, EditState } from '../types';

interface UseCommentManagerProps {
  circles: Circle[];
  setCircles: Dispatch<SetStateAction<Circle[]>>;
  edit: EditState;
  setEdit: Dispatch<SetStateAction<EditState>>;
}

export function useCommentManager({
  circles,
  setCircles,
  edit,
  setEdit,
}: UseCommentManagerProps) {
  const [commentDraft, setCommentDraft] = useState('');

  // 選択中の円
  const selectedCircle = useMemo(
    () => circles.find((c) => c.id === edit.selectedId) ?? null,
    [circles, edit.selectedId]
  );

  // コメント欄の初期値同期
  useEffect(() => {
    if (selectedCircle) {
      setCommentDraft(selectedCircle.comment || '');
    } else {
      setCommentDraft('');
    }
  }, [selectedCircle]);

  // コメント保存
  const handleCommentSave = () => {
    if (!selectedCircle) return;
    setCircles((prev) =>
      prev.map((c) =>
        c.id === selectedCircle.id ? { ...c, comment: commentDraft } : c
      )
    );
  };

  // コメント削除
  const handleCommentDelete = (id: number) => {
    setCircles((prev) => prev.filter((c) => c.id !== id));
    setEdit((prev) =>
      prev.selectedId === id ? { ...prev, selectedId: null } : prev
    );
  };

  // コメント選択
  const handleCommentSelect = (id: number) => {
    setEdit((prev) => ({ ...prev, selectedId: id }));
  };

  // コメントdraft変更
  const handleCommentDraftChange = (value: string) => {
    setCommentDraft(value);
  };

  return {
    commentDraft,
    setCommentDraft,
    selectedCircle,
    handleCommentSave,
    handleCommentDelete,
    handleCommentSelect,
    handleCommentDraftChange,
  };
}
