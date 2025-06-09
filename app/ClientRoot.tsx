'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabaseClient';
import { useAuthGuard } from './hooks/useAuthGuard';

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === '/login') return null;
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };
  return (
    <header className='w-full flex justify-end p-4 bg-gray-100'>
      <Button
        onClick={handleLogout}
        className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
      >
        ログアウト
      </Button>
    </header>
  );
}

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuthGuard();
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Loading...
      </div>
    );
  }
  return (
    <div className='flex flex-col min-h-screen w-full'>
      <Header />
      <main className='flex-1 flex flex-col'>{children}</main>
    </div>
  );
}
