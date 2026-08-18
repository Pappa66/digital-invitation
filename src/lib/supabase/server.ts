import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/supabase';
import { isAllowedEmail } from '@/lib/auth-allowed';

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll: ((cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component middleware path — safe to ignore
          }
        }) as CookieMethodsServer['setAll']
      }
    }
  );
}

export async function requireUser() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Wajib login + email operator (dikonfirmasi dua lapis: app-level di sini,
 * dan is_internal() di RLS database). Dipakai action yang mengubah data
 * internal (orders/settings/finance/clients).
 */
export async function requireInternalUser() {
  const user = await requireUser();
  if (!user) return null;
  if (!isAllowedEmail(user.email)) return null;
  return user;
}