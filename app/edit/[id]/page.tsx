'use client';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';

import CircleCanvas from '@/components/circles/CircleCanvas';
import RenderedCircles from '@/components/circles/RenderedCircles';
import CommentPanel from '../../CommentPanel';
import { useCircleEditState } from '../../hooks/useCircleEditState';
import { useCircleStorage } from '../../hooks/useCircleStorage';
import { useCommentManager } from '../../hooks/useCommentManager';
import { useImageSrc } from '../../hooks/useImageSrc';
import { useSvgCircleEditor } from '../../hooks/useSvgCircleEditor';
import { useUndoManager } from '../../hooks/useUndoManager';

/**
 * 画像IDで指定された画像に対して、円注釈とコメントを編集できるページコンポーネント。
 *
 * - Supabase Storageから画像を取得し表示する
 * - 画像上に円（注釈）を描画・編集・削除できる
 * - 円ごとにコメントを追加・編集・削除できる
 * - 編集内容はUndo/Redoや状態管理フックで管理
 * - 画像が見つからない場合やロード中のUIも表示
 *
 * @returns {JSX.Element} 画像注釈編集UIを持つReactページコンポーネント
 */

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const imgWidth = 800;
  const imgHeight = 600;

  // 画像情報はSupabase Storageから取得
  const { imgSrc, isLoading, error: imgError } = useImageSrc(id);

  // --- 既存の編集UIを流用 ---
  const { circles, setCircles, edit, setEdit } = useCircleEditState(
    id as string
  );
  const { isPushingUndo, pushUndo, pushUndoIfNeeded } = useUndoManager({
    circles,
    setCircles,
    edit,
    setEdit,
  });
  const {
    handleSvgMouseDown,
    handleSvgMouseMove,
    handleSvgMouseUp,
    handleSvgMouseLeave,
    handleSvgClick,
    handleCircleMouseDown,
  } = useSvgCircleEditor({
    circles,
    setCircles,
    edit,
    setEdit,
    pushUndo,
    pushUndoIfNeeded,
    isPushingUndo,
  });
  const {
    commentDraft,
    handleCommentSave,
    handleCommentDelete,
    handleCommentSelect,
    handleCommentDraftChange,
    deletedCircleIds,
    setDeletedCircleIds,
  } = useCommentManager({ circles, setCircles, edit, setEdit });

  useCircleStorage(
    circles,
    id as string,
    deletedCircleIds,
    setDeletedCircleIds
  );

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center bg-white'>
        <div>画像を読み込み中...</div>
      </div>
    );
  }
  if (!imgSrc) {
    return (
      <div className='flex flex-1 items-center justify-center bg-white'>
        <div>
          画像が見つかりません。
          <br />
          {imgError && <div className='text-red-500'>{imgError}</div>}
          <Button
            onClick={() => router.push('/')}
            className='ml-4 px-4 py-2 bg-blue-500 text-white rounded'
          >
            メインへ戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col flex-1 w-full'>
      <div className='p-4'>
        <Button
          onClick={() => router.push('/')}
          className='px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition'
        >
          メインへ戻る
        </Button>
      </div>
      <div className='flex flex-row flex-1 items-stretch justify-center bg-white'>
        {/* 左カラム: 画像＋円描画エリア */}
        <div className='flex-1 min-w-0 flex items-center justify-center bg-white relative'>
          <CircleCanvas
            edit={edit}
            imgWidth={imgWidth}
            imgHeight={imgHeight}
            imgSrc={imgSrc}
            onSvgMouseDown={handleSvgMouseDown}
            onSvgMouseMove={handleSvgMouseMove}
            onSvgMouseUp={handleSvgMouseUp}
            onSvgMouseLeave={handleSvgMouseLeave}
            onSvgClick={handleSvgClick}
          >
            <RenderedCircles
              circles={circles}
              edit={edit}
              imgWidth={imgWidth}
              imgHeight={imgHeight}
              setEdit={setEdit}
              handleCircleMouseDown={handleCircleMouseDown}
            />
          </CircleCanvas>
        </div>
        {/* 右カラム: コメント編集エリア */}
        <CommentPanel
          circles={circles}
          selectedId={edit.selectedId}
          commentDraft={commentDraft}
          onSelect={handleCommentSelect}
          onDelete={handleCommentDelete}
          onCommentDraftChange={handleCommentDraftChange}
          onCommentSave={handleCommentSave}
        />
      </div>
    </div>
  );
}
