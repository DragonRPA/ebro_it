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
      "r2AccountId", "r2BucketName", "r2AccessKeyId", "r2SecretAccessKey",
      "createdAt", "updatedAt"
    ) VALUES (
      'cfg-ebro-it', 'admin@ebro-it.com', 'contracts', 'consumables',
      'deliveries', 'repairs', false,
      '35014a2514680107d74e1e68d96e6c32', 'ebro-it-demo',
      '03cdb7560d37242de608a5db2a976030', 'b2407ab4532e02317860bc3d63226fb7bc232e88083b150c15023906ed141986',
      $1, $1
    ) ON CONFLICT (id) DO UPDATE SET
      "r2AccountId" = EXCLUDED."r2AccountId",
      "r2BucketName" = EXCLUDED."r2BucketName",
      "r2AccessKeyId" = EXCLUDED."r2AccessKeyId",
      "r2SecretAccessKey" = EXCLUDED."r2SecretAccessKey",
      "updatedAt" = EXCLUDED."updatedAt";
  `, [now]);
  console.log('google_configs pre-seeded successfully!');
  await client.end();
}

run().catch(console.error);
