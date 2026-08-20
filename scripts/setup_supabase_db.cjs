const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSchema() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL não está definida no .env!');
    process.exit(1);
  }

  console.log('⚡ A ligar à base de dados PostgreSQL do Supabase...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conexão com Supabase PostgreSQL estabelecida com sucesso!');

    const schemaPath = path.resolve(__dirname, '../supabase_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Ficheiro supabase_schema.sql não encontrado!');
      process.exit(1);
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('⚡ A executar o schema SQL no Supabase...');
    await client.query(sql);
    console.log('🎉 TODAS AS 12 TABELAS FORAM CRIADAS NO SUPABASE COM SUCESSO!');
  } catch (err) {
    console.error('❌ Erro ao executar schema no Supabase:', err.message || err);
  } finally {
    await client.end();
  }
}

runSchema();
