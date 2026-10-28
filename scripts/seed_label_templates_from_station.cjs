// scripts/seed_label_templates_from_station.cjs
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const neonClient = new Client({
  connectionString: 'postgresql://neondb_owner:npg_IuQM7YkWqg8f@ep-ancient-morning-azex1fwv-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const itSupabase = createClient(
  'https://uvmhqwpkmzxrrlkeguul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bWhxd3BrbXp4cnJsa2VndXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzIyNjgsImV4cCI6MjEwNTIwODI2OH0.vqPtbWpsMEVDnZqzVqzB1onKd-pL5T53qsRB3-IIjZU'
);

const awpSupabase = createClient(
  'https://wywgkikkjgbnlljkkmnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU'
);

async function main() {
  await neonClient.connect();
  const res = await neonClient.query('SELECT * FROM label_templates ORDER BY created_at ASC');
  await neonClient.end();

  console.log(`Fetched ${res.rows.length} templates from LabelPrintStation DB.`);

  const rowsToUpsert = res.rows.map((r, idx) => ({
    id: r.id,
    schema_id: r.schema_id || 'asset_schema',
    target_table: r.paper?.targetTable || 'asset',
    name: r.name,
    paper: r.paper || {},
    elements: r.elements || [],
    target_printer_id: r.paper?.targetPrinterId || '',
    target_printer_name: r.paper?.targetPrinterName || '',
    is_default: idx === 0 ? true : Boolean(r.is_default),
    is_locked: Boolean(r.paper?.isLocked),
    created_at: r.created_at || new Date().toISOString(),
    updated_at: r.updated_at || new Date().toISOString()
  }));

  const { error: itErr } = await itSupabase.from('label_templates').upsert(rowsToUpsert, { onConflict: 'id' });
  if (itErr) {
    console.error('IT Supabase upsert error:', itErr);
    process.exit(1);
  }
  console.log(`✅ Seeded ${rowsToUpsert.length} templates into IT Supabase (uvmhqwpkmzxrrlkeguul)!`);

  const { error: awpErr } = await awpSupabase.from('label_templates').upsert(rowsToUpsert, { onConflict: 'id' });
  if (awpErr) {
    console.warn('AWP Supabase upsert warning:', awpErr.message);
  } else {
    console.log(`✅ Seeded ${rowsToUpsert.length} templates into AWP Demo Supabase (wywgkikkjgbnlljkkmnz)!`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
