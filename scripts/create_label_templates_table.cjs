// scripts/create_label_templates_table.cjs
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.uvmhqwpkmzxrrlkeguul',
  password: 'BwYofacVm0ibBz67',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const statements = [
  `CREATE TABLE IF NOT EXISTS public.label_templates (
    id TEXT PRIMARY KEY,
    schema_id TEXT,
    target_table TEXT DEFAULT 'assets',
    name TEXT NOT NULL,
    paper JSONB NOT NULL DEFAULT '{}'::jsonb,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_printer_id TEXT,
    target_printer_name TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    tenant_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,
  `ALTER TABLE public.label_templates ADD COLUMN IF NOT EXISTS target_table TEXT DEFAULT 'assets';`,
  `ALTER TABLE public.label_templates ADD COLUMN IF NOT EXISTS target_printer_id TEXT;`,
  `ALTER TABLE public.label_templates ADD COLUMN IF NOT EXISTS target_printer_name TEXT;`,
  `ALTER TABLE public.label_templates ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;`,
  `ALTER TABLE public.label_templates ADD COLUMN IF NOT EXISTS tenant_id TEXT;`,
  `ALTER TABLE public.label_templates DISABLE ROW LEVEL SECURITY;`,
  `GRANT ALL ON TABLE public.label_templates TO anon, authenticated, service_role;`,
  `NOTIFY pgrst, 'reload schema';`
];

async function main() {
  // 1. IT DB (uvmhqwpkmzxrrlkeguul) via direct pg client
  await client.connect();
  console.log('Connected to IT Supabase PostgreSQL (uvmhqwpkmzxrrlkeguul)!');
  for (const stmt of statements) {
    await client.query(stmt);
  }
  await client.end();
  console.log('✅ IT Supabase label_templates table created & schema reloaded!');

  // 2. Also ensure on AWP Demo DB (wywgkikkjgbnlljkkmnz) via dev_exec_ddl if demo mode is used
  try {
    const awpClient = createClient(
      'https://wywgkikkjgbnlljkkmnz.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU'
    );
    await awpClient.rpc('dev_exec_ddl', { statements });
    console.log('✅ AWP Demo Supabase label_templates table also ensured!');
  } catch (e) {
    console.warn('AWP Demo DDL skipped:', e.message);
  }

  await new Promise(r => setTimeout(r, 2000));
  const itSupabase = createClient(
    'https://uvmhqwpkmzxrrlkeguul.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bWhxd3BrbXp4cnJsa2VndXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzIyNjgsImV4cCI6MjEwNTIwODI2OH0.vqPtbWpsMEVDnZqzVqzB1onKd-pL5T53qsRB3-IIjZU'
  );
  const check = await itSupabase.from('label_templates').select('*').limit(5);
  console.log('IT Supabase label_templates check:', check.status, 'rows:', check.data?.length, 'error:', check.error);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
