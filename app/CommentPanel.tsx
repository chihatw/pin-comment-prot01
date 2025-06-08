import React from 'react';

// 円の型は親と揃える
export interface Circle {
  id: number;
  x: number;
  y: number;
  r: number;
  comment?: string;
}

export interface CommentPanelProps {
  circles: Circle[];
  selectedId: number | null;
  commentDraft: string;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onCommentDraftChange: (value: string) => void;
  onCommentSave: () => void;
}

const CommentPanel: React.FC<CommentPanelProps> = ({
  circles,
  selectedId,
  commentDraft,
  onSelect,
  onDelete,
  onCommentDraftChange,
  onCommentSave,
}) => {
  const selectedCircle = circles.find((c) => c.id === selectedId) ?? null;
  return (
    <div
      style={{
        width: 400,
        padding: 32,
        boxShadow: '-4px 0 24px #b3e5fc55',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'linear-gradient(135deg, #ffffff 60%, #e1f5fe 100%)',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1976d2',
        }}
      >
        円のコメント
      </h2>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
          paddingRight: 8,
        }}
      >
        {/* コメント一覧 */}
        {circles.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#aaa',
              padding: '32px 0',
              fontSize: 18,
            }}
          >
            円がありません。円を追加するとここにコメントが表示されます。
          </div>
        )}
        {circles.map((circle, idx) => (
          <div
            key={circle.id}
            style={{
              padding: 16,
              borderRadius: 8,
              background:
                selectedId === circle.id
                  ? 'rgba(33, 150, 243, 0.12)'
                  : 'transparent',
              border: `1px solid ${
                selectedId === circle.id ? '#1976d2' : 'transparent'
              }`,
              boxShadow:
                selectedId === circle.id
                  ? '0 2px 8px rgba(25, 118, 210, 0.2)'
                  : 'none',
              transition: 'all 0.2s',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
            }}
            onClick={() => onSelect(circle.id)}
          >
            {/* 番号バッジのみ表示 */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: '#e1f5fe',
                  color: '#039be5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: '#333',
                  flex: 1,
                  minHeight: 24,
                }}
              >
                {circle.comment || (
                  <span style={{ color: '#bbb' }}>（コメントなし）</span>
                )}
              </div>
              {/* 削除ボタン（アイコン） */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(circle.id);
                }}
                aria-label='削除'
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  marginLeft: 8,
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* ゴミ箱アイコン */}
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#b71c1c'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='3 6 5 6 21 6' />
                  <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' />
                  <line x1='10' y1='11' x2='10' y2='17' />
                  <line x1='14' y1='11' x2='14' y2='17' />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* コメント入力エリアを下端に固定 */}
      {selectedCircle && (
        <div
          style={{
            marginTop: 24,
            borderTop: '1px solid #e3f2fd',
            paddingTop: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#1976d2', fontSize: 15 }}>
            円 {circles.findIndex((c) => c.id === selectedCircle.id) + 1}{' '}
            のコメント編集
          </div>
          <textarea
            value={commentDraft}
            onChange={(e) => onCommentDraftChange(e.target.value)}
            style={{
              width: '100%',
              height: 60,
              borderRadius: 4,
              border: '1px solid #b0bec5',
              padding: 8,
              fontSize: 14,
              color: '#333',
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            placeholder='コメントを入力...'
            aria-label='コメント'
          />
          <button
            onClick={onCommentSave}
            style={{
              alignSelf: 'flex-end',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s',
            }}
            aria-label='コメントを保存'
          >
            保存
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentPanel;
