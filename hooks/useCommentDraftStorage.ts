import { useEffect } from 'react';

const COMMENT_KEY = 'circle-canvas-comment-draft-v1';

export function useCommentDraftStorage(
  commentDraft: string,
  setCommentDraft: (v: string) => void
) {
  // 初回マウント時にlocalStorageから読み込み
  useEffect(() => {
    const raw =
      typeof window !== 'undefined' ? localStorage.getItem(COMMENT_KEY) : null;
    if (raw) {
      setCommentDraft(raw);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // commentDraftが変化したらlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMMENT_KEY, commentDraft);
    }
  }, [commentDraft]);
}
