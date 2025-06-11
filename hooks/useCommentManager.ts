import { Circle } from '@/types/circle';
import { EditState } from '@/types/editState';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useCommentDraftStorage } from './useCommentDraftStorage';

interface UseCommentManagerProps {
  circles: Circle[];
  setCircles: Dispatch<SetStateAction<Circle[]>>;
  edit: EditState;
  setEdit: Dispatch<SetStateAction<EditState>>;
}

/**
 * コメント管理用のカスタムフック。
 *
 * @param {Object} props - フックのプロパティ
 * @param {Circle[]} props.circles - コメント付き円オブジェクトの配列
 * @param {Dispatch<SetStateAction<Circle[]>>} props.setCircles - circlesの状態を更新する関数
 * @param {EditState} props.edit - 編集状態（選択中の円IDなど）
 * @param {Dispatch<SetStateAction<EditState>>} props.setEdit - editの状態を更新する関数
 * @returns {Object} - コメント管理に必要な状態と操作関数群
 *   @property {string} commentDraft - コメント入力欄のドラフト値
 *   @property {function} setCommentDraft - コメントドラフトのsetter
 *   @property {Circle|null} selectedCircle - 選択中の円オブジェクト
 *   @property {function} handleCommentSave - コメント保存処理
 *   @property {function} handleCommentDelete - コメント削除処理
 *   @property {function} handleCommentSelect - コメント選択処理
 *   @property {function} handleCommentDraftChange - コメントドラフト変更処理
 *   @property {string[]} deletedCircleIds - 削除された円のIDリスト
 *   @property {function} setDeletedCircleIds - 削除IDリストのsetter
 */
export function useCommentManager({
  circles,
  setCircles,
  edit,
  setEdit,
}: UseCommentManagerProps) {
  const [commentDraft, setCommentDraft] = useState('');
  // 削除予定IDのstateを追加
  const [deletedCircleIds, setDeletedCircleIds] = useState<string[]>([]);

  // localStorage同期
  useCommentDraftStorage(commentDraft, setCommentDraft);

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
  const handleCommentDelete = (id: string) => {
    setCircles((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return filtered
        .sort((a, b) => a.index - b.index)
        .map((c, i) => ({ ...c, index: i }));
    });
    setEdit((prev) =>
      prev.selectedId === id ? { ...prev, selectedId: null } : prev
    );
    // 削除IDを記録
    setDeletedCircleIds((prev) => [...prev, id]);
  };

  // コメント選択
  const handleCommentSelect = (id: string | null) => {
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
    deletedCircleIds, // 追加
    setDeletedCircleIds, // 追加
  };
}
