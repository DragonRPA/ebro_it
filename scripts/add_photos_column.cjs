const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.uvmhqwpkmzxrrlkeguul',
  password: 'BwYofacVm0ibBz67',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');
  await client.query('SET search_path TO public, extensions;');
  
  await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT \'[]\'::jsonb;');
  console.log('✅ ALTER TABLE products ADD COLUMN photos JSONB completed!');
  
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log('✅ PostgREST schema cache reloaded!');
  
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'photos';");
  console.log('Verification:', res.rows);
  
  await client.end();
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
