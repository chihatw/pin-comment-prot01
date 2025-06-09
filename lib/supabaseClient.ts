import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Supabaseユーザー取得の共通関数
export async function getSupabaseUser() {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('ユーザー情報が取得できません');
  return user.data.user;
}
