'use client';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { useThumbnailImages } from './hooks/useThumbnailImages';

export default function Home() {
  const { images, handleThumbnailUpload, handleThumbnailDelete } =
    useThumbnailImages(2);
  const router = useRouter();

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
            className='w-[320px] h-[240px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer text-gray-400 text-xl shadow-lg transition-all duration-200 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50'
            style={{ minWidth: '320px', minHeight: '240px' }}
          >
            <input
              type='file'
              accept='image/*'
              onChange={handleThumbnailUpload}
              className='hidden'
            />
            ＋画像追加
          </label>
        )}
      </div>
    </div>
  );
}
