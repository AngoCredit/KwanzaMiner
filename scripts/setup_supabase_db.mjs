import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSchema() {
  console.log('⚡ A ligar...');
  const client = new Client({
    host: 'db.oitsccxzfyijhedxkcoi.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'MPLA1975mpla#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Ligado!');
    const schemaPath = path.resolve(__dirname, '../supabase_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('🎉 SUCESSO! 12 TABELAS CRIADAS NO SUPABASE!');
  } catch (err) {
    console.error('DETALHES_ERRO:', err.message, err.stack);
  } finally {
    await client.end();
  }
}

runSchema();
