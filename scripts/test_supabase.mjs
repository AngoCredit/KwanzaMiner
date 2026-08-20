import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL || 'https://oitsccxzfyijhedxkcoi.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

console.log('⚡ A testar ligacao REST Supabase:', url);
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.log('📌 Supabase REST respondeu com erro (tabelas ainda nao criadas):', error.message);
  } else {
    console.log('🎉 SUPABASE LIGADO COM SUCESSO! Data:', data);
  }
}

test();
