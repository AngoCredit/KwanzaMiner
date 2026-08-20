import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://oitsccxzfyijhedxkcoi.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rTAMCiVPwAQDD7_sl0U2ZA_OL5DIkxn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
