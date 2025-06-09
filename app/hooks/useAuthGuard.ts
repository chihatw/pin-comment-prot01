import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export function useAuthGuard() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (pathname !== '/login') {
          router.replace('/login');
        }
      }
      setLoading(false);
    };
    checkSession();
    // サインイン・サインアウト時の自動反映
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  return { loading, isAuthenticated };
}
