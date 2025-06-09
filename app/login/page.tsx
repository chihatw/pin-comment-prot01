'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.replace('/');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <form
        onSubmit={handleLogin}
        className='bg-white p-8 rounded shadow-md w-full max-w-sm'
      >
        <h1 className='text-2xl font-bold mb-6 text-center'>ログイン</h1>
        <input
          type='email'
          placeholder='メールアドレス'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full mb-4 px-3 py-2 border rounded'
          required
        />
        <input
          type='password'
          placeholder='パスワード'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full mb-4 px-3 py-2 border rounded'
          required
        />
        {error && <div className='text-red-500 mb-4 text-sm'>{error}</div>}
        <button
          type='submit'
          className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
          disabled={loading}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );
}
