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
  const now = new Date().toISOString();
  await client.query(`
    INSERT INTO google_configs (
      id, "googleEmail", "contractFolder", "consumableFolder",
      "deliveryFolder", "maintenanceFolder", "isDevMode",
      "r2AccountId", "r2BucketName", "r2AccessKeyId", "r2SecretAccessKey", "r2PublicDomain",
      "createdAt", "updatedAt"
    ) VALUES (
      'cfg-ebro-it', 'admin@ebro-it.com', 'contracts', 'consumables',
      'deliveries', 'repairs', false,
      '35014a2514680107d74e1e68d96e6c32', 'ebro-it-demo',
      '109db3cb8cf82f919041be9fa3d41250', 'f80aed8584d0735c7350feb780e2e6665ca0cdf53895d80042fea758b6045c88',
      'https://pub-a2468b66c450440dab37e0c02d516ca6.r2.dev',
      $1, $1
    ) ON CONFLICT (id) DO UPDATE SET
      "r2AccountId" = EXCLUDED."r2AccountId",
      "r2BucketName" = EXCLUDED."r2BucketName",
      "r2AccessKeyId" = EXCLUDED."r2AccessKeyId",
      "r2SecretAccessKey" = EXCLUDED."r2SecretAccessKey",
      "r2PublicDomain" = EXCLUDED."r2PublicDomain",
      "updatedAt" = EXCLUDED."updatedAt";
  `, [now]);
  console.log('google_configs updated with new dedicated R2 credentials successfully!');
  await client.end();
}

run().catch(console.error);
