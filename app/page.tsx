'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { useThumbnailImages } from './hooks/useThumbnailImages';

export default function Home() {
  const { images, handleThumbnailUpload, handleThumbnailDelete } =
    useThumbnailImages(2);
  const router = useRouter();
  // ドラッグ中かどうかの状態を追加
  const [dragging, setDragging] = useState(false);

  const handleThumbnailClick = (id: string) => {
    router.push(`/edit/${id}`);
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center bg-white'>
      {/* サムネイル一覧 */}
      <div className='flex flex-row gap-8 my-12 justify-center items-center'>
        {images.map((img) => (
          <div
            key={img.id}
            className='relative cursor-pointer border-2 border-gray-300 rounded-xl shadow-lg group flex items-center justify-center'
            style={{ width: '320px', height: '240px' }}
            onClick={() => handleThumbnailClick(img.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt=''
              className='w-full h-full object-cover rounded-xl'
            />
            <Button
              type='button'
              className='absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-red-500 hover:text-white text-gray-500 transition'
              onClick={(e) => {
                e.stopPropagation();
                handleThumbnailDelete(img.id);
              }}
              aria-label='サムネイル削除'
              variant='ghost'
              size='icon'
            >
              <svg
                width='28'
                height='28'
                viewBox='0 0 20 20'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <line x1='5' y1='5' x2='15' y2='15' />
                <line x1='15' y1='5' x2='5' y2='15' />
              </svg>
            </Button>
          </div>
        ))}
        {images.length < 2 && (
          <label
            className={`w-[320px] h-[240px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer text-gray-400 text-xl shadow-lg transition-all duration-200  ${
              dragging
                ? 'border-blue-500 bg-blue-100 text-blue-600'
                : 'border-gray-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50'
            }`}
            style={{ minWidth: '320px', minHeight: '240px' }}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              // ドロップされたファイルをinputのonChangeと同じように処理
              if (
                e.dataTransfer &&
                e.dataTransfer.files &&
                e.dataTransfer.files.length > 0
              ) {
                // handleThumbnailUploadはイベントを受け取る想定なので、
                // FileListをinputのonChangeイベント風にラップして渡す
                const fileList = e.dataTransfer.files;
                const event = {
                  target: { files: fileList },
                } as React.ChangeEvent<HTMLInputElement>;
                handleThumbnailUpload(event);
              }
            }}
          >
            <input
              type='file'
              accept='image/*'
              onChange={handleThumbnailUpload}
              className='hidden'
            />
            {dragging ? (
              <span className='text-lg font-semibold text-blue-600'>
                ここに画像をドロップしてください
              </span>
            ) : (
              '＋画像追加'
            )}
          </label>
        )}
      </div>
    </div>
  );
}
