// Supabaseエラーハンドリング共通関数
export function supabaseErrorGuard<T extends object>(
  data: T | null,
  error: unknown,
  fallbackMsg?: string
): T {
  if (error || !data) throw error || new Error(fallbackMsg || 'Supabaseエラー');
  return data;
}
