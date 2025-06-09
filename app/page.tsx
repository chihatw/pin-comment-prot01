'use client';
import { useEffect } from 'react';
import CircleCanvas from './CircleCanvas';
import CommentPanel from './CommentPanel';
import { useCircleEditState } from './hooks/useCircleEditState';
import { useCommentManager } from './hooks/useCommentManager';
import { useImageUpload } from './hooks/useImageUpload';
import { useSvgCircleEditor } from './hooks/useSvgCircleEditor';
import { useUndoManager } from './hooks/useUndoManager';
import RenderedCircles from './RenderedCircles';

export default function Home() {
  const { circles, setCircles, edit, setEdit } = useCircleEditState();

  // Undo管理用カスタムフック
  const { undoStack, setUndoStack, isPushingUndo, pushUndo, pushUndoIfNeeded } =
    useUndoManager({ circles, setCircles, edit, setEdit });

  const imgWidth = 800;
  const imgHeight = 600;

  // 画像アップロード用
  const { imgSrc, handleFileChange } = useImageUpload();

  // --- Undo（ESCキー）---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (edit.drawing === null && e.key === 'Escape' && undoStack.length > 0) {
        setCircles(undoStack[undoStack.length - 1]);
        setUndoStack((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, edit.drawing, setUndoStack, setCircles]);

  // SVG操作系カスタムフック
  const {
    handleSvgMouseDown,
    handleSvgMouseMove,
    handleSvgMouseUp,
    handleSvgMouseLeave,
    handleSvgClick,
    handleCircleMouseDown,
    handleCircleRightClick,
  } = useSvgCircleEditor({
    circles,
    setCircles,
    edit,
    setEdit,
    pushUndo,
    pushUndoIfNeeded,
    isPushingUndo,
  });

  // コメント管理用カスタムフック
  const {
    commentDraft,
    handleCommentSave,
    handleCommentDelete,
    handleCommentSelect,
    handleCommentDraftChange,
  } = useCommentManager({ circles, setCircles, edit, setEdit });

  return (
    <main className='w-screen h-screen flex flex-row items-stretch justify-center bg-white'>
      {/* 左カラム: 画像＋円描画エリア */}
      <div className='flex-1 min-w-0 flex items-center justify-center bg-white relative'>
        <div className='absolute top-6 left-6 z-10'>
          <input
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
          />
        </div>
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
            handleCircleRightClick={handleCircleRightClick}
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
    </main>
  );
}
