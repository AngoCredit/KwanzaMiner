import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://oitsccxzfyijhedxkcoi.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rTAMCiVPwAQDD7_sl0U2ZA_OL5DIkxn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Triggers the real Google OAuth popup/redirect via Supabase Auth.
 * After successful Google sign-in, supabase.auth.onAuthStateChange fires
 * with the user's real name, email, and avatar_url from Google.
 */
export async function signInWithGoogle() {
  // Determine current origin (works seamlessly on Vercel and localhost)
  const redirectUrl = env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : undefined);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account', // Always show Google account picker
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Sign out from Supabase Auth session.
 */
export async function signOutFromSupabase() {
  await supabase.auth.signOut();
}
