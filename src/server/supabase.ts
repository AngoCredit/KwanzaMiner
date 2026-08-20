import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://oitsccxzfyijhedxkcoi.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_rTAMCiVPwAQDD7_sl0U2ZA_OL5DIkxn';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) { console.error('[Supabase] Erro:', error.message); return false; }
    console.log('[Supabase] Conexao OK - https://oitsccxzfyijhedxkcoi.supabase.co');
    return true;
  } catch (err) { console.error('[Supabase] Falha:', err); return false; }
}
