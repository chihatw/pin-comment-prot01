'use client';
import { useEffect } from 'react';
import CircleCanvas from './CircleCanvas';
import CommentPanel from './CommentPanel';
import { useCircleEditState } from './hooks/useCircleEditState';
import { useCommentManager } from './hooks/useCommentManager';
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
    <main
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        background: '#fff',
      }}
    >
      {/* 左カラム: 画像＋円描画エリア */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
        }}
      >
        <CircleCanvas
          circles={circles}
          edit={edit}
          imgWidth={imgWidth}
          imgHeight={imgHeight}
          onSvgMouseDown={handleSvgMouseDown}
          onSvgMouseMove={handleSvgMouseMove}
          onSvgMouseUp={handleSvgMouseUp}
          onSvgMouseLeave={handleSvgMouseLeave}
          onSvgClick={handleSvgClick}
          renderedCircles={
            <RenderedCircles
              circles={circles}
              edit={edit}
              imgWidth={imgWidth}
              imgHeight={imgHeight}
              setEdit={setEdit}
              handleCircleMouseDown={handleCircleMouseDown}
              handleCircleRightClick={handleCircleRightClick}
            />
          }
        />
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
