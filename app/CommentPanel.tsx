import React from 'react';
import { Button } from '../components/ui/button';
import type { Circle } from './types';

export interface CommentPanelProps {
  circles: Circle[];
  selectedId: number | null;
  commentDraft: string;
  onSelect: (id: number | null) => void;
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
  return (
    <div
      className='w-[400px] p-8 flex flex-col gap-4 shadow-[-4px_0_24px_#b3e5fc55]'
      style={{
        background: 'linear-gradient(135deg, #ffffff 60%, #e1f5fe 100%)',
      }}
    >
      <h2 className='m-0 text-2xl font-bold text-blue-700'>円のコメント</h2>
      <div className='flex-1 flex flex-col gap-4 overflow-y-auto pr-2'>
        {/* コメント一覧 */}
        {circles.length === 0 && (
          <div className='text-center text-[#aaa] py-8 text-lg'>
            円がありません。円を追加するとここにコメントが表示されます。
          </div>
        )}
        {circles.map((circle, idx) => (
          <div
            key={circle.id}
            className={[
              'p-4 rounded-lg flex flex-col gap-2 relative cursor-pointer transition-all',
              selectedId === circle.id
                ? 'bg-blue-500/10 border border-blue-700 shadow-md'
                : 'border border-transparent',
            ].join(' ')}
            onClick={() => onSelect(circle.id)}
          >
            <div className='flex gap-2 items-center'>
              <div className='w-8 h-8 rounded-full bg-blue-100 text-sky-600 flex items-center justify-center font-bold text-base flex-shrink-0'>
                {idx + 1}
              </div>
              <div className='text-[15px] text-[#333] flex-1 min-h-6'>
                {selectedId === circle.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onCommentSave();
                      onSelect(null); // 保存後に選択解除
                    }}
                    className='flex items-center gap-2 w-full'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      value={commentDraft}
                      onChange={(e) => onCommentDraftChange(e.target.value)}
                      className='w-full h-[28px] border-0 border-b border-blue-100 bg-transparent text-sm text-[#333] resize-none outline-none focus:bg-blue-50 hover:bg-blue-50 transition-colors shadow-none px-0 py-0 rounded-none'
                      style={{
                        minHeight: 24,
                        maxHeight: 48,
                        boxShadow: 'none',
                      }}
                      placeholder='コメントを入力...'
                      aria-label='コメント'
                    />
                    <Button
                      className='ml-1 px-1 py-0 text-xs rounded-none bg-transparent text-blue-500 border-none shadow-none hover:text-blue-700 hover:bg-transparent focus:bg-transparent active:bg-transparent hover:underline transition-colors min-w-0 h-auto'
                      aria-label='コメントを保存'
                      type='submit'
                      tabIndex={-1}
                    >
                      保存
                    </Button>
                  </form>
                ) : (
                  circle.comment || (
                    <span className='text-[#bbb]'>（コメントなし）</span>
                  )
                )}
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(circle.id);
                }}
                aria-label='削除'
                variant='ghost'
                size='icon'
                className='p-1 ml-2 rounded flex items-center hover:bg-red-50'
                type='button'
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
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentPanel;
