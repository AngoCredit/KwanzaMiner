import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runSchema() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL nao esta definida no .env!');
    process.exit(1);
  }

  console.log('⚡ A ligar a base de dados PostgreSQL do Supabase...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conexao com Supabase PostgreSQL estabelecida com sucesso!');

    const schemaPath = path.resolve(process.cwd(), 'supabase_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('Ficheiro supabase_schema.sql nao encontrado!');
      process.exit(1);
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('⚡ A executar o schema SQL no Supabase...');
    await client.query(sql);
    console.log('🎉 TODAS AS 12 TABELAS CRIADAS NO SUPABASE COM SUCESSO!');
  } catch (err: any) {
    console.error('❌ Erro ao executar schema no Supabase:', err.message || err);
  } finally {
    await client.end();
  }
}

runSchema();
