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
  const r2Config = {
    r2AccountId: '35014a2514680107d74e1e68d96e6c32',
    r2BucketName: 'ebro-it-demo',
    r2AccessKeyId: '109db3cb8cf82f919041be9fa3d41250',
    r2SecretAccessKey: 'f80aed8584d0735c7350feb780e2e6665ca0cdf53895d80042fea758b6045c88',
    r2PublicDomain: 'https://pub-a2468b66c450440dab37e0c02d516ca6.r2.dev'
  };
  const officialMailConfig = {
    googleEmail: 'admin@ebro-it.com',
    contractFolder: 'contracts',
    consumableFolder: 'consumables',
    deliveryFolder: 'deliveries',
    maintenanceFolder: 'repairs',
    isDevMode: false
  };

  const res = await client.query(
    'UPDATE tenants SET features = jsonb_build_object(\'r2Config\', $1::jsonb, \'officialMailConfig\', $2::jsonb), "updatedAt" = NOW()::text WHERE id = \'ebro_it\' RETURNING id, "displayName", features;',
    [JSON.stringify(r2Config), JSON.stringify(officialMailConfig)]
  );

  console.log('✅ Updated ebro_it tenant features (r2Config & officialMailConfig):', res.rows[0]?.id);
  await client.end();
  process.exit(0);
}

run().catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
